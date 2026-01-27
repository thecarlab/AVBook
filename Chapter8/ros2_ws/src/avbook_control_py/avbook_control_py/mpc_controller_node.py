from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional, Tuple

import numpy as np
import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from std_msgs.msg import Float64

from .topics import COMMAND_TOPIC, SETPOINT_TOPIC, STATE_TOPIC


def _finite_horizon_lqr_gain(A: np.ndarray, B: np.ndarray, Q: np.ndarray, R: np.ndarray, N: int) -> np.ndarray:
    """
    Backward Riccati recursion for unconstrained finite-horizon LQR.
    Returns the first-step feedback gain K0 (u = -K0 x).
    """
    P = Q.copy()
    # Work backwards: P_{k} = Q + A^T P_{k+1} A - A^T P_{k+1} B (R + B^T P_{k+1} B)^{-1} B^T P_{k+1} A
    for _ in range(max(1, int(N))):
        BtPB = B.T @ P @ B
        S = R + BtPB
        K = np.linalg.solve(S, B.T @ P @ A)
        P = Q + A.T @ P @ A - A.T @ P @ B @ K
    # Compute K0 using the final P (approx).
    BtPB = B.T @ P @ B
    S = R + BtPB
    K0 = np.linalg.solve(S, B.T @ P @ A)
    return K0


@dataclass
class _MpcState:
    prev_u: float = 0.0
    prev_t: Optional[float] = None


class MpcControllerNode(Node):
    """
    Simple MPC-like controller (receding horizon unconstrained LQR) for a 1D double integrator:
      x = [pos_error, vel]^T
      u = acceleration command

    Inputs:
      - state_topic (Float64): measured position
      - setpoint_topic (Float64): desired position

    Output:
      - command_topic (Float64): acceleration command
    """

    def __init__(self) -> None:
        super().__init__("mpc_controller_node")

        self._state_topic = self.declare_parameter("state_topic", STATE_TOPIC).value
        self._setpoint_topic = self.declare_parameter("setpoint_topic", SETPOINT_TOPIC).value
        self._command_topic = self.declare_parameter("command_topic", COMMAND_TOPIC).value

        self._rate_hz = float(self.declare_parameter("rate_hz", 50.0).value)
        self._dt = float(self.declare_parameter("dt", 1.0 / max(1e-6, self._rate_hz)).value)

        self._horizon = int(self.declare_parameter("horizon", 25).value)
        self._q_pos = float(self.declare_parameter("q_pos", 10.0).value)
        self._q_vel = float(self.declare_parameter("q_vel", 1.0).value)
        self._r_u = float(self.declare_parameter("r_u", 0.5).value)

        self._u_min = float(self.declare_parameter("u_min", -5.0).value)
        self._u_max = float(self.declare_parameter("u_max", 5.0).value)
        self._du_max = float(self.declare_parameter("du_max", 1.0).value)  # max delta-u per step

        self._state: Optional[float] = None
        self._setpoint: Optional[float] = None
        self._vel_est = 0.0
        self._prev_state: Optional[float] = None
        self._prev_state_t: Optional[float] = None
        self._mpc = _MpcState()

        self._pub = self.create_publisher(Float64, self._command_topic, 10)
        self._sub_state = self.create_subscription(
            Float64, self._state_topic, self._on_state, qos_profile_sensor_data
        )
        self._sub_sp = self.create_subscription(Float64, self._setpoint_topic, self._on_setpoint, 10)

        self._timer = self.create_timer(1.0 / max(1e-6, self._rate_hz), self._on_timer)

        self.get_logger().info(
            f"MPC: state={self._state_topic}, setpoint={self._setpoint_topic} -> cmd={self._command_topic} "
            f"(N={self._horizon}, dt={self._dt:.3f})"
        )

    def _on_state(self, msg: Float64) -> None:
        now = time.time()
        x = float(msg.data)
        self._state = x

        if self._prev_state is not None and self._prev_state_t is not None:
            dt = max(1e-6, now - self._prev_state_t)
            self._vel_est = (x - self._prev_state) / dt
        self._prev_state = x
        self._prev_state_t = now

    def _on_setpoint(self, msg: Float64) -> None:
        self._setpoint = float(msg.data)

    def _on_timer(self) -> None:
        if self._state is None or self._setpoint is None:
            return

        # Discrete-time double integrator
        dt = float(self._dt)
        A = np.array([[1.0, dt], [0.0, 1.0]], dtype=np.float64)
        B = np.array([[0.5 * dt * dt], [dt]], dtype=np.float64)
        Q = np.diag([self._q_pos, self._q_vel]).astype(np.float64)
        R = np.array([[self._r_u]], dtype=np.float64)

        pos_err = float(self._setpoint - self._state)
        x = np.array([[pos_err], [self._vel_est]], dtype=np.float64)

        K0 = _finite_horizon_lqr_gain(A, B, Q, R, self._horizon)
        u = float(-(K0 @ x).reshape(()))

        # Rate limiting + saturation
        du = u - self._mpc.prev_u
        du = max(-self._du_max, min(self._du_max, du))
        u = self._mpc.prev_u + du
        u = max(self._u_min, min(self._u_max, u))
        self._mpc.prev_u = u

        out = Float64()
        out.data = float(u)
        self._pub.publish(out)


def main() -> None:
    rclpy.init()
    node = MpcControllerNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
