import numpy as np

def build_extrinsic(R_3x3: np.ndarray, T_3: np.ndarray) -> np.ndarray:
    T = np.eye(4, dtype=np.float32)
    T[:3, :3] = R_3x3.astype(np.float32)
    T[:3,  3] = T_3.astype(np.float32)
    return T

def project_points(points_lidar: np.ndarray, T_lidar_cam: np.ndarray, K: np.ndarray,
                   width: int, height: int):
    """Vectorized LiDAR->camera pinhole projection.
       Returns: pixels (Nx2 int), distances (N), pts3d_lidar(Nx3 in lidar)."""
    if points_lidar.size == 0:
        return (np.empty((0,2),dtype=np.int32),
                np.empty((0,),dtype=np.float32),
                np.empty((0,3),dtype=np.float32))

    pts_h = np.column_stack((points_lidar, np.ones(len(points_lidar), dtype=np.float32)))
    pts_cam = (T_lidar_cam @ pts_h.T)[:3].T

    # keep points in front of camera
    z = pts_cam[:, 2]
    front = z > 0.1
    if not np.any(front):
        return (np.empty((0,2),dtype=np.int32),
                np.empty((0,),dtype=np.float32),
                np.empty((0,3),dtype=np.float32))

    pts_cam = pts_cam[front]
    proj = (K @ pts_cam.T)
    proj[:2, :] /= proj[2, :]

    pixels = proj[:2, :].T.astype(np.int32)
    mask = (pixels[:,0] >= 0) & (pixels[:,0] < width) & \
           (pixels[:,1] >= 0) & (pixels[:,1] < height)

    pixels_valid = pixels[mask]
    dists = np.linalg.norm(pts_cam[mask], axis=1).astype(np.float32)
    pts3d_lidar = points_lidar[front][mask]
    return pixels_valid, dists, pts3d_lidar
