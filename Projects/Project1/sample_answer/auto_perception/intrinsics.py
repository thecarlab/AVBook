import numpy as np

def intrinsics_from_fov(width: int, height: int, fov_deg: float):
    fov_rad = np.deg2rad(float(fov_deg))
    fx = width / (2.0 * np.tan(fov_rad / 2.0))
    fy = fx
    cx = width / 2.0
    cy = height / 2.0
    K = np.array([[fx, 0.0, cx],
                  [0.0, fy, cy],
                  [0.0, 0.0, 1.0]], dtype=np.float32)
    return float(fx), float(fy), float(cx), float(cy), K
