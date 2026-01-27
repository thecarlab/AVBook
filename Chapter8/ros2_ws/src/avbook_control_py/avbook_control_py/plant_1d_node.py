from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from std_msgs.msg import Float64

from .topics import COMMAND_TOPIC, STATE_TOPIC


@dataclass
class _PlantState:
    x: float = 0.0
    v: float = 0.0
    u: float = 0.0
    u_f: float = 0.0
    last_t: Optional[float] = None


class Plant1DNode(Node):
    """
    Simple 1D plant simulator:
      x_dot = v
      v_dot = u

    Subscribes:
      - command_topic (Float64): acceleration command
    Publishes:
      - state_topic (Float64): position
    """

    def __init__(self) -> None:
        super().__init__("plant_1d_node")

        self._command_topic = self.declare_parameter("command_topic", COMMAND_TOPIC).value
        self._state_topic = self.declare_parameter("state_topic", STATE_TOPIC).value

        self._rate_hz = float(self.declare_parameter("rate_hz", 50.0).value)
        self._u_tau = float(self.declare_parameter("u_tau", 0.05).value)  # command low-pass time constant

        self._state = _PlantState()

        self._pub = self.create_publisher(Float64, self._state_topic, 10)
        self._sub = self.create_subscription(
            Float64, self._command_topic, self._on_u, qos_profile_sensor_data
        )
        self._timer = self.create_timer(1.0 / max(1e-6, self._rate_hz), self._on_timer)

        self.get_logger().info(f"Plant1D: u={self._command_topic} -> x={self._state_topic} (rate={self._rate_hz}Hz)")

    def _on_u(self, msg: Float64) -> None:
        self._state.u = float(msg.data)

    def _on_timer(self) -> None:
        now = time.time()
        if self._state.last_t is None:
            self._state.last_t = now
            return
        dt = max(1e-6, now - self._state.last_t)
        self._state.last_t = now

        # Low-pass the command slightly to make behavior more realistic.
        if self._u_tau > 0.0:
            alpha = dt / (self._u_tau + dt)
        else:
            alpha = 1.0
        self._state.u_f = (1.0 - alpha) * self._state.u_f + alpha * self._state.u

        self._state.v += self._state.u_f * dt
        self._state.x += self._state.v * dt

        out = Float64()
        out.data = float(self._state.x)
        self._pub.publish(out)


def main() -> None:
    rclpy.init()
    node = Plant1DNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
