# Chapter 6 — ROS 2 Localization (Python)

This chapter adds ROS 2 example nodes for localization:

- **LiDAR ICP localization** (scan-to-map or scan-to-scan)
- **LiDAR NDT localization** (Open3D NDT if available, otherwise optional `pclpy`)
- **ORB “ORB‑SLAM style” visual localization** (feature VO front-end; not full SLAM)

## Code location

- `Chapter6/ros2_ws/src/avbook_localization_py`

## Build

```bash
cd Chapter6/ros2_ws
source /opt/ros/$ROS_DISTRO/setup.bash
colcon build --symlink-install
source install/setup.bash
```

## ROS deps (apt)

```bash
sudo apt update
sudo apt install \
  ros-$ROS_DISTRO-cv-bridge \
  python3-numpy python3-opencv
```

## Python deps (pip)

```bash
python3 -m pip install --upgrade pip
python3 -m pip install open3d
```

Optional:

- NDT via PCL bindings: `python3 -m pip install pclpy` (platform-dependent)

## Run

### LiDAR ICP

```bash
ros2 launch avbook_localization_py lidar_icp.launch.py
```

### LiDAR NDT

```bash
ros2 launch avbook_localization_py lidar_ndt.launch.py
```

### ORB visual localization

```bash
ros2 launch avbook_localization_py orb_visual_localization.launch.py
```
