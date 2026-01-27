from __future__ import annotations

from typing import Optional, Tuple

import numpy as np


def _require_open3d():
    try:
        import open3d as o3d  # type: ignore
    except Exception as e:  # noqa: BLE001
        raise RuntimeError(
            "Missing dependency `open3d`. Install with: pip install open3d. "
            f"Import error: {e}"
        ) from e
    return o3d


def xyz_to_pcd(xyz: np.ndarray):
    o3d = _require_open3d()
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(xyz.astype(np.float64, copy=False))
    return pcd


def voxel_downsample(pcd, voxel_size: float):
    if voxel_size <= 0.0:
        return pcd
    return pcd.voxel_down_sample(voxel_size)


def estimate_normals(pcd, radius: float, max_nn: int = 30):
    if radius <= 0.0:
        return
    o3d = _require_open3d()
    pcd.estimate_normals(o3d.geometry.KDTreeSearchParamHybrid(radius=radius, max_nn=int(max_nn)))


def icp_register(
    source,
    target,
    init_T: np.ndarray,
    max_corr_dist: float,
    point_to_plane: bool = True,
    max_iters: int = 50,
) -> Tuple[np.ndarray, float]:
    o3d = _require_open3d()
    estimation = (
        o3d.pipelines.registration.TransformationEstimationPointToPlane()
        if point_to_plane
        else o3d.pipelines.registration.TransformationEstimationPointToPoint()
    )
    criteria = o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=int(max_iters))
    result = o3d.pipelines.registration.registration_icp(
        source,
        target,
        float(max_corr_dist),
        init_T.astype(np.float64, copy=False),
        estimation,
        criteria,
    )
    return np.array(result.transformation, dtype=np.float64), float(result.fitness)


def ndt_register_if_available(
    source,
    target,
    init_T: np.ndarray,
    max_corr_dist: float,
    resolution: float,
    max_iters: int = 35,
) -> Optional[Tuple[np.ndarray, float]]:
    """
    Try Open3D NDT if the installed version provides it. Returns None if unsupported.
    """
    o3d = _require_open3d()
    reg = o3d.pipelines.registration
    fn = getattr(reg, "registration_ndt", None)
    if fn is None:
        return None

    criteria = reg.ICPConvergenceCriteria(max_iteration=int(max_iters))
    init = init_T.astype(np.float64, copy=False)

    # Open3D has had a few signature variants across versions/builds.
    # Try common call patterns and treat TypeError as "not supported".
    candidates = [
        (source, target, float(max_corr_dist), init, float(resolution), criteria),
        (source, target, float(max_corr_dist), init, float(resolution)),
        (source, target, float(max_corr_dist), init, criteria),
        (source, target, float(max_corr_dist), init),
    ]
    for args in candidates:
        try:
            result = fn(*args)
            return np.array(result.transformation, dtype=np.float64), float(result.fitness)
        except TypeError:
            continue

    return None


def load_pcd(path: str):
    o3d = _require_open3d()
    pcd = o3d.io.read_point_cloud(path)
    if pcd is None:
        raise RuntimeError(f"Failed to read point cloud from '{path}'")
    return pcd
