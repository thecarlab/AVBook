from __future__ import annotations

import collections
import time
from typing import Deque, Optional

import matplotlib.pyplot as plt
import rclpy
from rclpy.executors import SingleThreadedExecutor
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from std_msgs.msg import Float64

from .topics import COMMAND_TOPIC, SETPOINT_TOPIC, STATE_TOPIC


class ControlVisualizerNode(Node):
    """
    Live matplotlib plot for control demos.
    Subscribes:
      - state_topic (Float64)
      - setpoint_topic (Float64)
      - command_topic (Float64)
    """

    def __init__(self) -> None:
        super().__init__("control_visualizer_node")

        self._state_topic = self.declare_parameter("state_topic", STATE_TOPIC).value
        self._setpoint_topic = self.declare_parameter("setpoint_topic", SETPOINT_TOPIC).value
        self._command_topic = self.declare_parameter("command_topic", COMMAND_TOPIC).value

        self._window_s = float(self.declare_parameter("window_s", 20.0).value)
        self._plot_hz = float(self.declare_parameter("plot_hz", 10.0).value)

        self._t0 = time.time()
        self._t: Deque[float] = collections.deque()
        self._x: Deque[float] = collections.deque()
        self._sp: Deque[float] = collections.deque()
        self._u: Deque[float] = collections.deque()

        self._last_x: Optional[float] = None
        self._last_sp: Optional[float] = None
        self._last_u: Optional[float] = None

        self.create_subscription(Float64, self._state_topic, self._on_x, 10)
        self.create_subscription(Float64, self._setpoint_topic, self._on_sp, 10)
        self.create_subscription(Float64, self._command_topic, self._on_u, 10)

        self.get_logger().info(
            f"Visualizer: x={self._state_topic}, sp={self._setpoint_topic}, u={self._command_topic}"
        )

        plt.ion()
        self._fig, (self._ax1, self._ax2) = plt.subplots(2, 1, sharex=True, figsize=(9, 6))
        self._ax1.set_title("Control Demo")
        self._ax1.set_ylabel("position")
        self._ax2.set_ylabel("command")
        self._ax2.set_xlabel("time [s]")

        (self._line_x,) = self._ax1.plot([], [], label="x")
        (self._line_sp,) = self._ax1.plot([], [], label="setpoint")
        (self._line_u,) = self._ax2.plot([], [], label="u")
        self._ax1.legend(loc="upper right")
        self._ax2.legend(loc="upper right")

        self._timer = self.create_timer(1.0 / max(1e-6, self._plot_hz), self._on_timer)

    def _on_x(self, msg: Float64) -> None:
        self._last_x = float(msg.data)
        self._append_if_ready()

    def _on_sp(self, msg: Float64) -> None:
        self._last_sp = float(msg.data)
        self._append_if_ready()

    def _on_u(self, msg: Float64) -> None:
        self._last_u = float(msg.data)
        self._append_if_ready()

    def _append_if_ready(self) -> None:
        if self._last_x is None or self._last_sp is None or self._last_u is None:
            return
        t = time.time() - self._t0
        self._t.append(t)
        self._x.append(self._last_x)
        self._sp.append(self._last_sp)
        self._u.append(self._last_u)

        # Trim window
        while self._t and (self._t[-1] - self._t[0]) > self._window_s:
            self._t.popleft()
            self._x.popleft()
            self._sp.popleft()
            self._u.popleft()

    def _on_timer(self) -> None:
        if not self._t:
            return
        t = list(self._t)
        self._line_x.set_data(t, list(self._x))
        self._line_sp.set_data(t, list(self._sp))
        self._line_u.set_data(t, list(self._u))

        self._ax1.relim()
        self._ax1.autoscale_view()
        self._ax2.relim()
        self._ax2.autoscale_view()
        self._fig.canvas.draw_idle()
        self._fig.canvas.flush_events()


def main() -> None:
    rclpy.init()
    node = ControlVisualizerNode()
    executor = SingleThreadedExecutor()
    executor.add_node(node)
    try:
        while rclpy.ok():
            executor.spin_once(timeout_sec=0.05)
            # Give matplotlib time to process GUI events.
            plt.pause(0.001)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        executor.remove_node(node)
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
