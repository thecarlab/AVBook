from __future__ import annotations

import numpy as np
from sensor_msgs.msg import PointCloud2
from sensor_msgs_py import point_cloud2


def pointcloud2_to_xyz_numpy(msg: PointCloud2) -> np.ndarray:
    pts_iter = point_cloud2.read_points(msg, field_names=("x", "y", "z"), skip_nans=True)
    pts = np.fromiter(pts_iter, dtype=[("x", np.float32), ("y", np.float32), ("z", np.float32)])
    if pts.size == 0:
        return np.empty((0, 3), dtype=np.float64)
    xyz = np.stack([pts["x"], pts["y"], pts["z"]], axis=1).astype(np.float64, copy=False)
    return xyz

