#!/usr/bin/env python3
import time
import math
import numpy as np
import cv2

import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

from sensor_msgs.msg import Image, PointCloud2, NavSatFix, PointField
from geometry_msgs.msg import PoseWithCovarianceStamped
from cv_bridge import CvBridge

from .config import (
    CLASS_COLORS_BGR, CLASS_COLORS_RVIZ, DISTANCE_CONFIG,
    DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_FOV_DEG,
    R_LIDAR_TO_CAM, T_LIDAR_TO_CAM
)
from .intrinsics import intrinsics_from_fov
from .pointcloud_io import parse_pointcloud_fast
from .projection import build_extrinsic, project_points
from .detection import YoloDetector
from .geodesy import quaternion_to_heading, destination_from_bearing_distance


class YoloLidarFusionNode(Node):
    def __init__(self):
        super().__init__('yolo_lidar_fusion_node')
        self.bridge = CvBridge()

        # --- (2) Camera intrinsics from 800x600, FOV 90 deg ---
        self.image_width  = DEFAULT_WIDTH
        self.image_height = DEFAULT_HEIGHT
        self.fov_deg      = DEFAULT_FOV_DEG
        self.fx, self.fy, self.cx, self.cy, self.K = intrinsics_from_fov(
            self.image_width, self.image_height, self.fov_deg
        )

        # --- (3) Consistent projection math; (4) fast point cloud parsing ---
        self.T_lidar_cam = build_extrinsic(R_LIDAR_TO_CAM, T_LIDAR_TO_CAM)

        # --- (5) YOLO detector with class gating & thresholds ---
        self.get_logger().info("Initializing YOLO detector...")
        self.detector = YoloDetector(self.get_logger(), engine_ok=True)
        self.warmup_done = False

        # QoS (10)
        camera_qos = QoSProfile(reliability=ReliabilityPolicy.BEST_EFFORT,
                                history=HistoryPolicy.KEEP_LAST, depth=10)
        lidar_qos  = QoSProfile(reliability=ReliabilityPolicy.RELIABLE,
                                history=HistoryPolicy.KEEP_LAST, depth=10)
        gnss_qos   = QoSProfile(reliability=ReliabilityPolicy.RELIABLE,
                                history=HistoryPolicy.KEEP_LAST, depth=5)

        # Subscriptions
        self.sub_img = self.create_subscription(
            Image, '/sensing/camera/camera0/image_rect_color',
            self.camera_cb, camera_qos
        )
        self.sub_pc = self.create_subscription(
            PointCloud2, '/sensing/lidar/top/outlier_filtered/pointcloud',
            self.lidar_cb, lidar_qos
        )
        self.sub_gps = self.create_subscription(
            NavSatFix, '/sensing/gnss/nav_sat_fix',
            self.gps_cb, gnss_qos
        )
        self.sub_pose = self.create_subscription(
            PoseWithCovarianceStamped, '/sensing/gnss/pose_with_covariance',
            self.pose_cb, gnss_qos
        )

        # Publishers (10)
        self.pub_image = self.create_publisher(Image, '/fusion/annotated_image', 10)
        self.pub_cloud = self.create_publisher(PointCloud2, '/fusion/colored_pointcloud', 10)

        # State
        self.latest_image = None
        self.latest_pc_msg = None
        self.latest_detections = []
        self.latest_gps = None
        self.latest_pose = None
        self.frame_count = 0
        self.process_times = []

        self.get_logger().info("YOLO-LiDAR Fusion Node started.")

    # ---- GNSS & Pose (9) ----
    def gps_cb(self, msg: NavSatFix):
        self.latest_gps = msg

    def pose_cb(self, msg: PoseWithCovarianceStamped):
        self.latest_pose = msg

    # ---- Camera ----
    def camera_cb(self, msg: Image):
        try:
            if msg.encoding == '8UC4':
                img = np.frombuffer(msg.data, dtype=np.uint8).reshape(msg.height, msg.width, 4)
                img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            elif msg.encoding in ('bgr8', 'rgb8'):
                img = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
            else:
                img = self.bridge.imgmsg_to_cv2(msg, desired_encoding='passthrough')
                if img.ndim == 3 and img.shape[2] == 4:
                    img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

            if not self.warmup_done:
                self.get_logger().info("Warming up YOLO...")
                self.detector.warmup(img)
                self.warmup_done = True
                self.get_logger().info("YOLO warm-up finished.")

            self.latest_detections = self.detector.detect(img)
            self.latest_image = img

            if self.latest_pc_msg is not None:
                self.process_fusion()

        except Exception as e:
            self.get_logger().error(f"Camera error: {e}")

    # ---- LiDAR ----
    def lidar_cb(self, msg: PointCloud2):
        self.latest_pc_msg = msg
        if self.latest_image is not None:
            self.process_fusion()

    # ---- Distance aggregation (9) ----
    def _robust_distance(self, distances: np.ndarray):
        cfg = DISTANCE_CONFIG
        if distances.size < cfg['min_points_threshold']:
            return None

        sd = np.sort(distances)
        if cfg['use_clustering'] and sd.size > cfg['min_points_threshold']:
            gaps = np.diff(sd)
            big = np.where(gaps > cfg['clustering_gap'])[0]
            if big.size > 0:
                nearest = sd[:big[0] + 1]
                if nearest.size >= cfg['min_points_threshold']:
                    filt = nearest
                else:
                    mn = sd[0]
                    thr = mn * (1.0 + cfg['depth_filter_ratio'])
                    filt = sd[sd <= thr]
            else:
                mn = sd[0]
                thr = mn * (1.0 + cfg['depth_filter_ratio'])
                filt = sd[sd <= thr]
        else:
            mn = sd[0]
            thr = mn * (1.0 + cfg['depth_filter_ratio'])
            filt = sd[sd <= thr]

        if filt.size < cfg['min_points_threshold']:
            filt = sd

        q1, q3 = np.percentile(filt, 25), np.percentile(filt, 75)
        iqr = q3 - q1
        if iqr > 0.01:
            lb = q1 - cfg['iqr_multiplier'] * iqr
            ub = q3 + cfg['iqr_multiplier'] * iqr
            clean = filt[(filt >= lb) & (filt <= ub)]
            if clean.size < cfg['min_points_threshold']:
                clean = filt
        else:
            clean = filt

        dist = float(np.median(clean) if cfg['use_median'] else np.mean(clean))
        return {
            'distance': dist,
            'percentile_distance': float(np.percentile(clean, cfg['percentile'])),
            'min_distance': float(np.min(clean)),
            'max_distance': float(np.max(clean)),
            'std_dev': float(np.std(clean)),
            'n_points_total': int(distances.size),
            'n_points_filtered': int(clean.size),
            'n_points_removed': int(distances.size - clean.size),
            'quality': 'high' if np.std(clean) < 0.5 and clean.size > 20
                       else ('medium' if np.std(clean) < 1.5 else 'low')
        }

    def _object_latlon(self, obj_point_lidar: np.ndarray, use_distance: float):
        if self.latest_gps is None or self.latest_pose is None:
            return None
        car_lat = float(self.latest_gps.latitude)
        car_lon = float(self.latest_gps.longitude)
        q = self.latest_pose.pose.pose.orientation
        car_heading = quaternion_to_heading(q.x, q.y, q.z, q.w)

        # LiDAR frame convention: X forward, Y left
        x, y = float(obj_point_lidar[0]), float(obj_point_lidar[1])
        rel_bearing = math.atan2(y, x)
        abs_bearing = car_heading + rel_bearing
        return destination_from_bearing_distance(car_lat, car_lon, abs_bearing, float(use_distance))

    def _make_colored_pc2(self, points_xyz: np.ndarray, colors_bgr: np.ndarray, frame_id: str):
        """
        points_xyz: Nx3 float32 in the frame you publish (e.g., LiDAR frame)
        colors_bgr: Nx3 uint8 BGR colors for each point
        """
        assert points_xyz.shape[0] == colors_bgr.shape[0]
        N = points_xyz.shape[0]
        if N == 0:
            return None

        # pack BGR -> RGB uint32 (RViz expects 'rgb' as packed 0xRRGGBB)
        b = colors_bgr[:, 0].astype(np.uint32)
        g = colors_bgr[:, 1].astype(np.uint32)
        r = colors_bgr[:, 2].astype(np.uint32)
        rgb_uint32 = (r << 16) | (g << 8) | b

        # build structured array
        data = np.empty(N, dtype=[
            ('x',  np.float32),
            ('y',  np.float32),
            ('z',  np.float32),
            ('rgb', np.uint32),
        ])
        data['x'] = points_xyz[:, 0]
        data['y'] = points_xyz[:, 1]
        data['z'] = points_xyz[:, 2]
        data['rgb'] = rgb_uint32

        msg = PointCloud2()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = frame_id  # e.g., 'velodyne_top_base_link'

        msg.height = 1
        msg.width = N
        msg.is_bigendian = False
        msg.is_dense = True
        msg.fields = [
            PointField(name='x',   offset=0,  datatype=PointField.FLOAT32, count=1),
            PointField(name='y',   offset=4,  datatype=PointField.FLOAT32, count=1),
            PointField(name='z',   offset=8,  datatype=PointField.FLOAT32, count=1),
            PointField(name='rgb', offset=12, datatype=PointField.UINT32,  count=1),
        ]
        msg.point_step = 16
        msg.row_step = msg.point_step * N
        msg.data = data.tobytes()
        return msg

    # ---- Fusion ----
    def process_fusion(self):
        try:
            tic = time.perf_counter()

            # 1) Parse point cloud and project to image
            pts_lidar = parse_pointcloud_fast(self.latest_pc_msg)
            if pts_lidar.size == 0:
                return

            pixels, dists, pts3d = project_points(
                pts_lidar, self.T_lidar_cam, self.K,
                self.image_width, self.image_height
            )
            if pixels.size == 0:
                return

            # 2) Start with a copy of the image
            annotated = self.latest_image.copy()

            # 3) Draw ALL projected points first, depth-colored (near=warm)
            max_vis_range = float(DISTANCE_CONFIG['max_range'])
            d_norm = np.clip(dists.astype(np.float32) / max(1e-6, max_vis_range), 0.0, 1.0)

            # map 0..1 -> 255..0 so near=255 (bright/hot)
            depth_u8 = (255.0 * (1.0 - d_norm)).astype(np.uint8)

            # apply colormap per-point (BGR)
            colors_bgr = cv2.applyColorMap(depth_u8.reshape(-1, 1), cv2.COLORMAP_JET).reshape(-1, 3)

            for (u, v), col in zip(pixels, colors_bgr):
                cv2.circle(annotated, (int(u), int(v)), 1, (int(col[0]), int(col[1]), int(col[2])), -1)

            # Also publish a colored cloud in LiDAR frame
            pc2_msg = self._make_colored_pc2(pts3d.astype(np.float32), colors_bgr.astype(np.uint8),
                                             frame_id='velodyne_top_base_link')
            if pc2_msg is not None:
                self.pub_cloud.publish(pc2_msg)

            # 4) Now overlay detections: recolor points inside bbox & compute distances/GPS
            px = pixels[:, 0]
            py = pixels[:, 1]
            printed_header = False

            for det_idx, det in enumerate(self.latest_detections):
                x1, y1, x2, y2 = det['bbox']
                color = det['color']  # BGR tuple from detector
                cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

                mask = (px >= x1) & (px <= x2) & (py >= y1) & (py <= y2)
                if not np.any(mask):
                    continue

                sel_d = dists[mask]
                sel_3d = pts3d[mask]

                info = self._robust_distance(sel_d)
                if info is None:
                    # still recolor points in the box for visualization
                    pts_in = pixels[mask]
                    for (u, v) in pts_in:
                        cv2.circle(annotated, (int(u), int(v)), 2, color, -1)
                    continue

                # Optional: ignore detections beyond max usable range
                if info['distance'] > DISTANCE_CONFIG['max_range']:
                    pts_in = pixels[mask]
                    for (u, v) in pts_in:
                        cv2.circle(annotated, (int(u), int(v)), 2, color, -1)
                    continue

                # Print header once
                if not printed_header:
                    self.get_logger().info("\n" + "=" * 100)
                    self.get_logger().info(f"FRAME {self.frame_count} - DETECTED OBJECTS")
                    self.get_logger().info("=" * 100)
                    self.get_logger().info(f"{'Class':<15} {'Conf':>6} {'Dist(m)':>9} {'Latitude':>12} {'Longitude':>12}")
                    self.get_logger().info("-" * 100)
                    printed_header = True

                # GPS using median 3D point bearing
                obj_pos = np.median(sel_3d, axis=0)
                dist_for_gps = info.get('percentile_distance', info['distance'])
                latlon = self._object_latlon(obj_pos, dist_for_gps)

                if latlon:
                    self.get_logger().info(
                        f"{det['class']:<15} {det['confidence']:>6.2f} {dist_for_gps:>9.2f} "
                        f"{latlon[0]:>12.8f} {latlon[1]:>12.8f}"
                    )
                else:
                    self.get_logger().info(
                        f"{det['class']:<15} {det['confidence']:>6.2f} {dist_for_gps:>9.2f} "
                        f"{'N/A':>12} {'N/A':>12}"
                    )

                # Recolor points inside the bbox so they pop over the colormap
                pts_in = pixels[mask]
                for (u, v) in pts_in:
                    cv2.circle(annotated, (int(u), int(v)), 2, color, -1)

            if printed_header:
                self.get_logger().info("=" * 100 + "\n")

            # 5) Publish annotated image
            out = self.bridge.cv2_to_imgmsg(annotated, encoding='bgr8')
            out.header.stamp = self.get_clock().now().to_msg()
            out.header.frame_id = 'camera_frame'
            self.pub_image.publish(out)

            # 6) Perf stats
            self.frame_count += 1
            dt_ms = (time.perf_counter() - tic) * 1000.0
            self.process_times.append(dt_ms)
            if self.frame_count % 100 == 0 and self.process_times:
                avg = float(np.mean(self.process_times[-100:]))
                self.get_logger().info(f"Perf: {avg:.1f} ms  ({1000.0/avg:.1f} FPS)")

        except Exception as e:
            import traceback
            self.get_logger().error(f"Fusion error: {e}\n{traceback.format_exc()}")


def main(args=None):
    rclpy.init(args=args)
    node = None
    try:
        node = YoloLidarFusionNode()
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        if node is not None:
            node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()
