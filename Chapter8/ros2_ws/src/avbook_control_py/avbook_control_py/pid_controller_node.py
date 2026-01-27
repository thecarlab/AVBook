from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from std_msgs.msg import Float64

from .topics import COMMAND_TOPIC, SETPOINT_TOPIC, STATE_TOPIC


@dataclass
class _PidState:
    integral: float = 0.0
    prev_error: Optional[float] = None
    prev_t: Optional[float] = None


class PidControllerNode(Node):
    """
    Simple PID controller for a 1D signal.
    - Subscribes: `state_topic` (Float64), `setpoint_topic` (Float64)
    - Publishes: `command_topic` (Float64)
    """

    def __init__(self) -> None:
        super().__init__("pid_controller_node")

        self._state_topic = self.declare_parameter("state_topic", STATE_TOPIC).value
        self._setpoint_topic = self.declare_parameter("setpoint_topic", SETPOINT_TOPIC).value
        self._command_topic = self.declare_parameter("command_topic", COMMAND_TOPIC).value

        self._kp = float(self.declare_parameter("kp", 2.0).value)
        self._ki = float(self.declare_parameter("ki", 0.0).value)
        self._kd = float(self.declare_parameter("kd", 0.2).value)

        self._u_min = float(self.declare_parameter("u_min", -5.0).value)
        self._u_max = float(self.declare_parameter("u_max", 5.0).value)
        self._i_min = float(self.declare_parameter("i_min", -2.0).value)
        self._i_max = float(self.declare_parameter("i_max", 2.0).value)

        self._state: Optional[float] = None
        self._setpoint: Optional[float] = None
        self._pid = _PidState()

        self._pub = self.create_publisher(Float64, self._command_topic, 10)
        self._sub_state = self.create_subscription(
            Float64, self._state_topic, self._on_state, qos_profile_sensor_data
        )
        self._sub_sp = self.create_subscription(Float64, self._setpoint_topic, self._on_setpoint, 10)

        self._timer_hz = float(self.declare_parameter("rate_hz", 50.0).value)
        self._timer = self.create_timer(1.0 / max(1e-6, self._timer_hz), self._on_timer)

        self.get_logger().info(
            f"PID: state={self._state_topic}, setpoint={self._setpoint_topic} -> cmd={self._command_topic} "
            f"(kp={self._kp}, ki={self._ki}, kd={self._kd})"
        )

    def _on_state(self, msg: Float64) -> None:
        self._state = float(msg.data)

    def _on_setpoint(self, msg: Float64) -> None:
        self._setpoint = float(msg.data)

    def _on_timer(self) -> None:
        if self._state is None or self._setpoint is None:
            return

        now = time.time()
        if self._pid.prev_t is None:
            self._pid.prev_t = now
            self._pid.prev_error = self._setpoint - self._state
            return

        dt = max(1e-6, now - self._pid.prev_t)
        error = self._setpoint - self._state

        # Integral with clamping (anti-windup).
        self._pid.integral += error * dt
        self._pid.integral = max(self._i_min, min(self._i_max, self._pid.integral))

        # Derivative on error.
        derr = 0.0
        if self._pid.prev_error is not None:
            derr = (error - self._pid.prev_error) / dt

        u = self._kp * error + self._ki * self._pid.integral + self._kd * derr

        # Output saturation.
        u = max(self._u_min, min(self._u_max, u))

        self._pid.prev_error = error
        self._pid.prev_t = now

        out = Float64()
        out.data = float(u)
        self._pub.publish(out)


def main() -> None:
    rclpy.init()
    node = PidControllerNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
