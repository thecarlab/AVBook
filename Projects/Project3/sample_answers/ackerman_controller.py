#!/usr/bin/env python3
"""
F1TENTH Ackermann Command Converter with Enhanced Obstacle Handling
Converts Nav2 cmd_vel to Ackermann commands with pure pursuit control.

Key Features:
- Respects Nav2 obstacle avoidance (STOPS when Nav2 commands stop)
- Pure pursuit path tracking for smooth Ackermann steering
- Comprehensive logging for tuning
- Configurable speed ramping and safety margins
"""

import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy
import math
import numpy as np
from collections import deque
from datetime import datetime

from geometry_msgs.msg import Twist
from nav_msgs.msg import Path, Odometry
from ackermann_msgs.msg import AckermannDriveStamped
from std_msgs.msg import Float32MultiArray
from tf2_ros import Buffer, TransformListener
from tf2_ros import LookupException, ConnectivityException, ExtrapolationException


# ==============================================================================
# CONFIGURATION - TUNE THESE PARAMETERS
# ==============================================================================

# --- VEHICLE PARAMETERS ---
WHEELBASE = 0.324              # F1TENTH wheelbase (m)
MAX_STEERING_ANGLE = 0.4       # ~23 degrees in radians (F1TENTH limit)
ROBOT_WIDTH = 0.3              # Robot width for collision checking

# --- SPEED PARAMETERS ---
MIN_SPEED = 0.6                # F1TENTH minimum operational speed (m/s)
MAX_SPEED = 1.2                # Maximum speed (m/s) - conservative for safety
CRUISE_SPEED = 0.8             # Default cruising speed (m/s)

# --- PURE PURSUIT PARAMETERS ---
USE_PURE_PURSUIT = True        # Enable pure pursuit controller
LOOKAHEAD_BASE = 0.6           # Base lookahead distance (m)
LOOKAHEAD_MIN = 0.4            # Minimum lookahead (m)
LOOKAHEAD_MAX = 1.5            # Maximum lookahead (m)
LOOKAHEAD_SPEED_GAIN = 0.4     # Lookahead scales with speed: L = base + gain * v
STEERING_GAIN = 1.2            # Steering response multiplier (>1 = more aggressive)

# --- OBSTACLE/SAFETY PARAMETERS ---
# CRITICAL: These determine when robot stops for obstacles
CMD_VEL_STOP_THRESHOLD = 0.3   # If Nav2 cmd_vel.linear.x < this, consider it a STOP command
                                # Set slightly below MIN_SPEED to catch obstacle stops
ANGULAR_STOP_THRESHOLD = 0.1   # If linear is low but angular is high, Nav2 wants rotation
GOAL_STOP_DISTANCE = 0.25      # Stop when this close to goal (m)
EMERGENCY_STOP_DECEL = 3.0     # Deceleration for emergency stops (m/s²)

# --- SPEED MODULATION ---
TURN_SLOWDOWN_FACTOR = 0.5     # Speed reduction for sharp turns (0-1)
APPROACH_SLOWDOWN_DIST = 1.0   # Start slowing down this far from goal (m)
SPEED_RAMP_RATE = 1.0          # Speed change rate limit (m/s per second)

# --- LOGGING CONFIGURATION ---
LOG_RATE = 5.0                 # Status logging frequency (Hz)
LOG_TO_FILE = True             # Save logs to file for analysis
LOG_FILE_PATH = "/tmp/f1tenth_nav_log.csv"
VERBOSE_LOGGING = True         # Enable detailed console output

# ==============================================================================


class CmdVelToAckermann(Node):
    def __init__(self):
        super().__init__('cmd_vel_to_ackermann_f1tenth')
        
        # --- State Variables ---
        self.current_path = None
        self.current_odom_speed = 0.0
        self.last_cmd_vel = Twist()
        self.last_cmd_time = self.get_clock().now()
        self.target_speed = 0.0
        self.current_cmd_speed = 0.0
        
        # Safety state
        self.nav2_wants_stop = False
        self.obstacle_detected = False
        self.goal_reached = False
        self.stop_reason = "NONE"
        
        # Pose tracking
        self.robot_x = 0.0
        self.robot_y = 0.0
        self.robot_yaw = 0.0
        
        # Path tracking metrics
        self.lookahead_point = None
        self.current_lookahead_dist = LOOKAHEAD_BASE
        self.cross_track_error = 0.0
        self.heading_error = 0.0
        self.curvature = 0.0
        self.closest_point_idx = 0
        self.dist_to_goal = float('inf')
        
        # Command outputs
        self.cmd_steering = 0.0
        self.cmd_speed = 0.0
        
        # Logging history
        self.cmd_vel_history = deque(maxlen=20)
        self.speed_history = deque(maxlen=100)
        self.error_history = deque(maxlen=100)
        
        # TF2
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)
        
        # QoS
        qos = QoSProfile(
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.VOLATILE,
            depth=10
        )
        
        # Publishers
        self.ackermann_pub = self.create_publisher(
            AckermannDriveStamped, '/ackermann_cmd', qos)
        self.debug_pub = self.create_publisher(
            Float32MultiArray, '/f1tenth_debug', 10)
        
        # Subscribers
        self.cmd_vel_sub = self.create_subscription(
            Twist, '/cmd_vel', self.cmd_vel_callback, 10)
        self.odom_sub = self.create_subscription(
            Odometry, '/odom', self.odom_callback, 10)
        
        if USE_PURE_PURSUIT:
            self.path_sub = self.create_subscription(
                Path, '/plan', self.path_callback, 10)
            self.create_timer(0.05, self.control_loop)  # 20Hz control
        
        # Logging timers
        if VERBOSE_LOGGING:
            self.create_timer(1.0 / LOG_RATE, self.log_status)
        
        # Initialize log file
        if LOG_TO_FILE:
            self.init_log_file()
        
        self.print_startup_config()

    def init_log_file(self):
        """Initialize CSV log file with headers."""
        try:
            with open(LOG_FILE_PATH, 'w') as f:
                f.write("timestamp,robot_x,robot_y,robot_yaw,odom_speed,cmd_speed,"
                       "cmd_steering,cross_track_err,heading_err,dist_to_goal,"
                       "nav2_linear_x,nav2_angular_z,stop_reason,lookahead_dist\n")
            self.get_logger().info(f'[LOG] Initialized log file: {LOG_FILE_PATH}')
        except Exception as e:
            self.get_logger().error(f'[LOG] Failed to create log file: {e}')

    def print_startup_config(self):
        """Print configuration banner at startup."""
        self.get_logger().info('=' * 70)
        self.get_logger().info('   F1TENTH ACKERMANN COMMAND CONVERTER')
        self.get_logger().info('=' * 70)
        self.get_logger().info(f'  Wheelbase:           {WHEELBASE} m')
        self.get_logger().info(f'  Max steering:        {MAX_STEERING_ANGLE:.2f} rad ({math.degrees(MAX_STEERING_ANGLE):.1f}°)')
        self.get_logger().info('-' * 70)
        self.get_logger().info(f'  Speed range:         {MIN_SPEED} - {MAX_SPEED} m/s')
        self.get_logger().info(f'  Cruise speed:        {CRUISE_SPEED} m/s')
        self.get_logger().info(f'  Stop threshold:      {CMD_VEL_STOP_THRESHOLD} m/s (Nav2 cmd_vel)')
        self.get_logger().info('-' * 70)
        self.get_logger().info(f'  Pure Pursuit:        {"ENABLED" if USE_PURE_PURSUIT else "DISABLED"}')
        self.get_logger().info(f'  Lookahead:           {LOOKAHEAD_MIN} - {LOOKAHEAD_MAX} m')
        self.get_logger().info(f'  Steering gain:       {STEERING_GAIN}')
        self.get_logger().info('-' * 70)
        self.get_logger().info(f'  Goal stop distance:  {GOAL_STOP_DISTANCE} m')
        self.get_logger().info(f'  Turn slowdown:       {TURN_SLOWDOWN_FACTOR * 100:.0f}%')
        self.get_logger().info('=' * 70)

    def log_status(self):
        """Periodic detailed status logging for tuning."""
        # Header
        self.get_logger().info('─' * 70)
        
        # Safety Status (MOST IMPORTANT)
        if self.nav2_wants_stop:
            self.get_logger().warn(f'[🛑 STOP]   Reason: {self.stop_reason}')
        elif self.obstacle_detected:
            self.get_logger().warn(f'[⚠️  OBSTACLE] Slowing/stopping for safety')
        else:
            self.get_logger().info(f'[✓ MOVING] Speed: {self.current_cmd_speed:.2f} m/s')
        
        # Nav2 Command Analysis
        cmd = self.last_cmd_vel
        self.get_logger().info(
            f'[NAV2 CMD] linear.x: {cmd.linear.x:+.3f} m/s | '
            f'angular.z: {cmd.angular.z:+.3f} rad/s | '
            f'age: {self.get_cmd_age_ms():.0f}ms')
        
        # Robot State
        self.get_logger().info(
            f'[POSE]     x: {self.robot_x:+.2f} | y: {self.robot_y:+.2f} | '
            f'yaw: {math.degrees(self.robot_yaw):+.1f}° | '
            f'odom_v: {self.current_odom_speed:.2f} m/s')
        
        # Path Tracking
        if self.current_path and self.lookahead_point:
            self.get_logger().info(
                f'[PURSUIT]  lookahead: ({self.lookahead_point[0]:.2f}, {self.lookahead_point[1]:.2f}) | '
                f'L_dist: {self.current_lookahead_dist:.2f}m')
            self.get_logger().info(
                f'[ERRORS]   cross-track: {self.cross_track_error:+.3f}m | '
                f'heading: {math.degrees(self.heading_error):+.1f}° | '
                f'curvature: {self.curvature:+.3f}')
        
        # Control Output
        steer_pct = abs(self.cmd_steering) / MAX_STEERING_ANGLE * 100
        self.get_logger().info(
            f'[OUTPUT]   speed: {self.cmd_speed:.2f} m/s | '
            f'steering: {self.cmd_steering:+.3f} rad ({math.degrees(self.cmd_steering):+.1f}°) '
            f'[{steer_pct:.0f}%]')
        
        # Warnings
        if steer_pct > 90:
            self.get_logger().warn(f'[⚠️  WARN]   Steering near saturation!')
        
        if self.current_path:
            self.get_logger().info(
                f'[GOAL]     distance: {self.dist_to_goal:.2f}m | '
                f'path_pts: {len(self.current_path.poses)} | '
                f'closest_idx: {self.closest_point_idx}')
        else:
            self.get_logger().warn('[PATH]     No path received!')
        
        # Write to log file
        if LOG_TO_FILE:
            self.write_log_entry()

    def write_log_entry(self):
        """Write current state to CSV log file."""
        try:
            with open(LOG_FILE_PATH, 'a') as f:
                f.write(f"{datetime.now().isoformat()},"
                       f"{self.robot_x:.4f},{self.robot_y:.4f},{self.robot_yaw:.4f},"
                       f"{self.current_odom_speed:.4f},{self.cmd_speed:.4f},"
                       f"{self.cmd_steering:.4f},{self.cross_track_error:.4f},"
                       f"{self.heading_error:.4f},{self.dist_to_goal:.4f},"
                       f"{self.last_cmd_vel.linear.x:.4f},{self.last_cmd_vel.angular.z:.4f},"
                       f"{self.stop_reason},{self.current_lookahead_dist:.4f}\n")
        except Exception as e:
            self.get_logger().debug(f'Log write error: {e}')

    def get_cmd_age_ms(self):
        """Get age of last cmd_vel in milliseconds."""
        now = self.get_clock().now()
        age = (now - self.last_cmd_time).nanoseconds / 1e6
        return age

    def odom_callback(self, msg: Odometry):
        """Update current speed from odometry."""
        self.current_odom_speed = msg.twist.twist.linear.x
        self.speed_history.append(self.current_odom_speed)

    def path_callback(self, msg: Path):
        """Receive new path from Nav2."""
        if len(msg.poses) > 0:
            self.current_path = msg
            self.goal_reached = False
            self.get_logger().info(
                f'[PATH] New path: {len(msg.poses)} poses, '
                f'goal: ({msg.poses[-1].pose.position.x:.2f}, {msg.poses[-1].pose.position.y:.2f})')

    def cmd_vel_callback(self, msg: Twist):
        """
        Process cmd_vel from Nav2.
        CRITICAL: This is how we detect if Nav2 wants us to STOP (obstacle/goal).
        """
        self.last_cmd_vel = msg
        self.last_cmd_time = self.get_clock().now()
        self.cmd_vel_history.append((msg.linear.x, msg.angular.z))
        
        # === OBSTACLE DETECTION LOGIC ===
        linear_x = msg.linear.x
        angular_z = abs(msg.angular.z)
        
        # Determine if Nav2 wants stop
        old_stop_state = self.nav2_wants_stop
        
        if linear_x < CMD_VEL_STOP_THRESHOLD:
            if angular_z > ANGULAR_STOP_THRESHOLD:
                # Nav2 wants rotation only (maybe recovery behavior)
                self.nav2_wants_stop = False
                self.stop_reason = "NONE"
                self.obstacle_detected = False
            else:
                # Nav2 wants STOP (obstacle or goal)
                self.nav2_wants_stop = True
                self.obstacle_detected = True
                
                # Determine reason
                if self.dist_to_goal < GOAL_STOP_DISTANCE * 2:
                    self.stop_reason = "GOAL_REACHED"
                else:
                    self.stop_reason = "OBSTACLE_DETECTED"
        else:
            self.nav2_wants_stop = False
            self.obstacle_detected = False
            self.stop_reason = "NONE"
        
        # Log state change
        if self.nav2_wants_stop != old_stop_state:
            if self.nav2_wants_stop:
                self.get_logger().warn(
                    f'[CMD_VEL] 🛑 STOP TRIGGERED: linear.x={linear_x:.3f} < threshold={CMD_VEL_STOP_THRESHOLD} | '
                    f'Reason: {self.stop_reason}')
            else:
                self.get_logger().info(
                    f'[CMD_VEL] ✓ MOTION RESUMED: linear.x={linear_x:.3f}')
        
        # If not using pure pursuit, convert directly
        if not USE_PURE_PURSUIT or not self.current_path:
            ack_msg = self.twist_to_ackermann(msg)
            self.ackermann_pub.publish(ack_msg)

    def twist_to_ackermann(self, twist: Twist) -> AckermannDriveStamped:
        """Convert Twist to Ackermann (fallback when no path)."""
        msg = AckermannDriveStamped()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'base_link'
        
        # === STOP CHECK ===
        if self.nav2_wants_stop:
            msg.drive.speed = 0.0
            msg.drive.steering_angle = 0.0
            self.cmd_speed = 0.0
            self.cmd_steering = 0.0
            return msg
        
        linear_vel = twist.linear.x
        angular_vel = twist.angular.z
        
        # Speed limits
        if abs(linear_vel) > 0.01:
            if abs(linear_vel) < MIN_SPEED:
                linear_vel = np.sign(linear_vel) * MIN_SPEED
            linear_vel = np.clip(linear_vel, -MAX_SPEED, MAX_SPEED)
        else:
            linear_vel = 0.0
        
        # Ackermann steering calculation
        if abs(linear_vel) > 0.01:
            steering = math.atan2(WHEELBASE * angular_vel, abs(linear_vel))
        else:
            steering = 0.0
        
        steering = np.clip(steering, -MAX_STEERING_ANGLE, MAX_STEERING_ANGLE)
        
        msg.drive.speed = float(linear_vel)
        msg.drive.steering_angle = float(steering)
        
        self.cmd_speed = linear_vel
        self.cmd_steering = steering
        
        return msg

    def get_robot_pose(self):
        """Get current robot pose from TF."""
        try:
            t = self.tf_buffer.lookup_transform('map', 'base_link', rclpy.time.Time())
            return t
        except (LookupException, ConnectivityException, ExtrapolationException) as e:
            self.get_logger().debug(f'TF lookup failed: {e}')
            return None

    def control_loop(self):
        """Main pure pursuit control loop (20Hz)."""
        if not self.current_path or len(self.current_path.poses) < 2:
            return
        
        # === CRITICAL: STOP IF NAV2 COMMANDS STOP ===
        if self.nav2_wants_stop:
            msg = AckermannDriveStamped()
            msg.header.stamp = self.get_clock().now().to_msg()
            msg.header.frame_id = 'base_link'
            msg.drive.speed = 0.0
            msg.drive.steering_angle = 0.0
            self.ackermann_pub.publish(msg)
            self.cmd_speed = 0.0
            self.current_cmd_speed = 0.0
            return
        
        # Get robot pose
        transform = self.get_robot_pose()
        if transform is None:
            return
        
        self.robot_x = transform.transform.translation.x
        self.robot_y = transform.transform.translation.y
        q = transform.transform.rotation
        self.robot_yaw = math.atan2(
            2.0 * (q.w * q.z + q.x * q.y),
            1.0 - 2.0 * (q.y * q.y + q.z * q.z))
        
        # Calculate adaptive lookahead
        self.current_lookahead_dist = LOOKAHEAD_BASE + LOOKAHEAD_SPEED_GAIN * abs(self.current_odom_speed)
        self.current_lookahead_dist = np.clip(
            self.current_lookahead_dist, LOOKAHEAD_MIN, LOOKAHEAD_MAX)
        
        # Find closest point and cross-track error
        self.calculate_tracking_errors()
        
        # Check if goal reached
        self.update_goal_distance()
        if self.dist_to_goal < GOAL_STOP_DISTANCE:
            self.goal_reached = True
            self.stop_reason = "GOAL_REACHED"
            self.publish_stop()
            return
        
        # Find lookahead point
        self.lookahead_point = self.find_lookahead_point()
        if self.lookahead_point is None:
            return
        
        # Transform to robot frame
        dx = self.lookahead_point[0] - self.robot_x
        dy = self.lookahead_point[1] - self.robot_y
        local_x = dx * math.cos(-self.robot_yaw) - dy * math.sin(-self.robot_yaw)
        local_y = dx * math.sin(-self.robot_yaw) + dy * math.cos(-self.robot_yaw)
        
        # Heading error
        self.heading_error = math.atan2(local_y, local_x)
        
        # Pure pursuit curvature: gamma = 2 * y / L^2
        L_sq = local_x**2 + local_y**2
        if L_sq < 0.01:
            return
        
        self.curvature = 2.0 * local_y / L_sq
        
        # Steering angle with gain
        steering = math.atan(WHEELBASE * self.curvature) * STEERING_GAIN
        steering = np.clip(steering, -MAX_STEERING_ANGLE, MAX_STEERING_ANGLE)
        self.cmd_steering = steering
        
        # Calculate target speed
        target_speed = self.calculate_target_speed(steering)
        
        # Apply speed ramping for smooth acceleration
        dt = 0.05  # 20Hz
        speed_diff = target_speed - self.current_cmd_speed
        max_change = SPEED_RAMP_RATE * dt
        if abs(speed_diff) > max_change:
            self.current_cmd_speed += np.sign(speed_diff) * max_change
        else:
            self.current_cmd_speed = target_speed
        
        self.cmd_speed = self.current_cmd_speed
        
        # Publish
        msg = AckermannDriveStamped()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'base_link'
        msg.drive.speed = float(self.cmd_speed)
        msg.drive.steering_angle = float(self.cmd_steering)
        self.ackermann_pub.publish(msg)
        
        # Publish debug data
        self.publish_debug()

    def calculate_tracking_errors(self):
        """Calculate cross-track error and find closest point."""
        if not self.current_path:
            return
        
        poses = self.current_path.poses
        min_dist = float('inf')
        
        for i, pose in enumerate(poses):
            dist = math.hypot(
                pose.pose.position.x - self.robot_x,
                pose.pose.position.y - self.robot_y)
            if dist < min_dist:
                min_dist = dist
                self.closest_point_idx = i
        
        self.cross_track_error = min_dist
        
        # Determine sign (left/right of path)
        if self.closest_point_idx < len(poses) - 1:
            p1 = poses[self.closest_point_idx].pose.position
            p2 = poses[self.closest_point_idx + 1].pose.position
            cross = ((p2.x - p1.x) * (self.robot_y - p1.y) - 
                     (p2.y - p1.y) * (self.robot_x - p1.x))
            self.cross_track_error *= np.sign(cross) if cross != 0 else 1.0
        
        self.error_history.append(self.cross_track_error)

    def update_goal_distance(self):
        """Update distance to goal."""
        if self.current_path and self.current_path.poses:
            goal = self.current_path.poses[-1].pose.position
            self.dist_to_goal = math.hypot(
                goal.x - self.robot_x, goal.y - self.robot_y)

    def find_lookahead_point(self):
        """Find lookahead point on path."""
        if not self.current_path:
            return None
        
        poses = self.current_path.poses
        
        # Search from closest point forward
        for i in range(self.closest_point_idx, len(poses)):
            px = poses[i].pose.position.x
            py = poses[i].pose.position.y
            dist = math.hypot(px - self.robot_x, py - self.robot_y)
            
            if dist >= self.current_lookahead_dist:
                # Interpolate for exact distance
                if i > 0:
                    prev = poses[i-1].pose.position
                    prev_dist = math.hypot(
                        prev.x - self.robot_x, prev.y - self.robot_y)
                    if dist - prev_dist > 0.001:
                        ratio = ((self.current_lookahead_dist - prev_dist) / 
                                 (dist - prev_dist))
                        ratio = np.clip(ratio, 0, 1)
                        return (prev.x + ratio * (px - prev.x),
                                prev.y + ratio * (py - prev.y))
                return (px, py)
        
        # Return goal if no lookahead found
        if poses:
            return (poses[-1].pose.position.x, poses[-1].pose.position.y)
        return None

    def calculate_target_speed(self, steering_angle):
        """Calculate target speed based on conditions."""
        
        # Base speed
        speed = CRUISE_SPEED
        
        # Slow down for turns
        steer_ratio = abs(steering_angle) / MAX_STEERING_ANGLE
        turn_factor = 1.0 - TURN_SLOWDOWN_FACTOR * steer_ratio
        speed *= turn_factor
        
        # Slow down approaching goal
        if self.dist_to_goal < APPROACH_SLOWDOWN_DIST:
            approach_factor = self.dist_to_goal / APPROACH_SLOWDOWN_DIST
            speed *= max(approach_factor, 0.3)  # Don't go below 30%
        
        # Stop at goal
        if self.dist_to_goal < GOAL_STOP_DISTANCE:
            return 0.0
        
        # Apply limits
        if speed > 0 and speed < MIN_SPEED:
            speed = MIN_SPEED
        
        return np.clip(speed, 0.0, MAX_SPEED)

    def publish_stop(self):
        """Publish stop command."""
        msg = AckermannDriveStamped()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'base_link'
        msg.drive.speed = 0.0
        msg.drive.steering_angle = 0.0
        self.ackermann_pub.publish(msg)
        self.cmd_speed = 0.0
        self.current_cmd_speed = 0.0

    def publish_debug(self):
        """Publish debug data for visualization."""
        msg = Float32MultiArray()
        msg.data = [
            float(self.robot_x),
            float(self.robot_y),
            float(self.robot_yaw),
            float(self.cross_track_error),
            float(self.heading_error),
            float(self.cmd_speed),
            float(self.cmd_steering),
            float(self.dist_to_goal),
            float(self.current_lookahead_dist),
            float(1.0 if self.nav2_wants_stop else 0.0)
        ]
        self.debug_pub.publish(msg)


def main(args=None):
    rclpy.init(args=args)
    node = CmdVelToAckermann()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down...')
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
