from __future__ import annotations

import math
import time

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from std_msgs.msg import Float64

from .topics import SETPOINT_TOPIC


class SetpointNode(Node):
    """
    Simple setpoint publisher for demos.
    Modes:
      - step: constant step after `step_time_s`
      - sine: sine wave
    """

    def __init__(self) -> None:
        super().__init__("setpoint_node")

        self._setpoint_topic = self.declare_parameter("setpoint_topic", SETPOINT_TOPIC).value
        self._mode = str(self.declare_parameter("mode", "step").value)
        self._rate_hz = float(self.declare_parameter("rate_hz", 20.0).value)

        self._step_value = float(self.declare_parameter("step_value", 5.0).value)
        self._step_time_s = float(self.declare_parameter("step_time_s", 1.0).value)

        self._sine_amp = float(self.declare_parameter("sine_amp", 3.0).value)
        self._sine_freq_hz = float(self.declare_parameter("sine_freq_hz", 0.1).value)

        self._t0 = time.time()
        self._pub = self.create_publisher(Float64, self._setpoint_topic, 10)
        self._timer = self.create_timer(1.0 / max(1e-6, self._rate_hz), self._on_timer)

        self.get_logger().info(f"Setpoint: {self._setpoint_topic} (mode={self._mode})")

    def _on_timer(self) -> None:
        t = time.time() - self._t0
        if self._mode == "sine":
            sp = self._sine_amp * math.sin(2.0 * math.pi * self._sine_freq_hz * t)
        else:
            sp = self._step_value if t >= self._step_time_s else 0.0

        msg = Float64()
        msg.data = float(sp)
        self._pub.publish(msg)


def main() -> None:
    rclpy.init()
    node = SetpointNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
