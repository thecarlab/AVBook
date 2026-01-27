# Target classes and color maps
TARGET_CLASSES = ["person", "car", "stop sign", "bicycle", "motorcycle", "bus", "traffic light"]

CLASS_CONFIDENCE_THRESHOLDS = {
    "person": 0.95,
    "car": 0.70,
    "stop sign": 0.70,
    "bus": 0.95,
    "traffic light": 0.90
}
MIN_CONFIDENCE_THRESHOLD = min(CLASS_CONFIDENCE_THRESHOLDS.values())

CLASS_COLORS_BGR = {
    "person": (255, 0, 0),
    "car": (0, 255, 0),
    "stop sign": (0, 0, 255),
    "traffic light": (255, 128, 0),
    "background": (128, 255, 128),
}
CLASS_COLORS_RVIZ = {
    "person": (0.0, 0.0, 1.0),
    "car": (0.0, 1.0, 0.0),
    "stop sign": (1.0, 0.0, 0.0),
    "traffic light": (0.5, 0.0, 0.5),
    "background": (0.5, 0.5, 0.5),
}

# Robust distance computation options
DISTANCE_CONFIG = {
    "use_median": True,
    "percentile": 15,
    "iqr_multiplier": 1.5,
    "depth_filter_ratio": 0.2,
    "min_points_threshold": 5,
    "clustering_gap": 0.5,
    "use_clustering": True,
    "max_range": 20.0
}

# Default camera intrinsics from FOV & resolution
DEFAULT_WIDTH  = 800
DEFAULT_HEIGHT = 600
DEFAULT_FOV_DEG = 90.0

# Fixed LiDAR->Camera extrinsics (your prior working transform)
# T in camera frame meters; R as 3x3 mapping lidar->camera
import numpy as np
T_LIDAR_TO_CAM = np.array([1.0, 0.0, 0.0], dtype=np.float32)
R_LIDAR_TO_CAM = np.array([[0, -1,  0],
                           [0,  0, -1],
                           [1,  0,  0]], dtype=np.float32)
