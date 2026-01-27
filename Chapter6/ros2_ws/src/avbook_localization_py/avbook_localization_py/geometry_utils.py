from __future__ import annotations

import math
from typing import Tuple

import numpy as np
from geometry_msgs.msg import Quaternion


def mat4_identity() -> np.ndarray:
    return np.eye(4, dtype=np.float64)


def pose_to_quat_xyzw(R: np.ndarray) -> Tuple[float, float, float, float]:
    # Convert a 3x3 rotation matrix to quaternion (x,y,z,w).
    # Numerically stable classic method.
    m00, m01, m02 = float(R[0, 0]), float(R[0, 1]), float(R[0, 2])
    m10, m11, m12 = float(R[1, 0]), float(R[1, 1]), float(R[1, 2])
    m20, m21, m22 = float(R[2, 0]), float(R[2, 1]), float(R[2, 2])

    trace = m00 + m11 + m22
    if trace > 0.0:
        s = math.sqrt(trace + 1.0) * 2.0
        w = 0.25 * s
        x = (m21 - m12) / s
        y = (m02 - m20) / s
        z = (m10 - m01) / s
    elif m00 > m11 and m00 > m22:
        s = math.sqrt(1.0 + m00 - m11 - m22) * 2.0
        w = (m21 - m12) / s
        x = 0.25 * s
        y = (m01 + m10) / s
        z = (m02 + m20) / s
    elif m11 > m22:
        s = math.sqrt(1.0 + m11 - m00 - m22) * 2.0
        w = (m02 - m20) / s
        x = (m01 + m10) / s
        y = 0.25 * s
        z = (m12 + m21) / s
    else:
        s = math.sqrt(1.0 + m22 - m00 - m11) * 2.0
        w = (m10 - m01) / s
        x = (m02 + m20) / s
        y = (m12 + m21) / s
        z = 0.25 * s

    norm = math.sqrt(x * x + y * y + z * z + w * w)
    if norm <= 0.0:
        return 0.0, 0.0, 0.0, 1.0
    return x / norm, y / norm, z / norm, w / norm


def quat_msg_from_R(R: np.ndarray) -> Quaternion:
    x, y, z, w = pose_to_quat_xyzw(R)
    q = Quaternion()
    q.x = float(x)
    q.y = float(y)
    q.z = float(z)
    q.w = float(w)
    return q


def compose(T_a: np.ndarray, T_b: np.ndarray) -> np.ndarray:
    return (T_a @ T_b).astype(np.float64, copy=False)


def invert(T: np.ndarray) -> np.ndarray:
    R = T[:3, :3]
    t = T[:3, 3:4]
    out = np.eye(4, dtype=np.float64)
    out[:3, :3] = R.T
    out[:3, 3:4] = -R.T @ t
    return out

