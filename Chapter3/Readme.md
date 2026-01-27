# Chapter 3 — ROS 2 Perception Examples

This chapter includes runnable ROS 2 example nodes (C++ and Python) for:

- **Sensor fusion** (simple IMU + wheel odometry yaw fusion)
- **Point cloud downsampling** (voxel grid filter)
- **Image edges** (Sobel filter)

## Where the code lives

- `Chapter3/ros2_ws/src/avbook_cpp_nodes` (C++ / `rclcpp`)
- `Chapter3/ros2_ws/src/avbook_py_nodes` (Python / `rclpy`)

## Quick start (ROS 2 workspace)

From the repo root:

```bash
cd Chapter3/ros2_ws
source /opt/ros/$ROS_DISTRO/setup.bash
colcon build --symlink-install
source install/setup.bash
```

## Dependencies (typical Ubuntu / apt)

Install the ROS 2 + system deps your distro provides, for example:

```bash
sudo apt update
sudo apt install \
  ros-$ROS_DISTRO-message-filters \
  ros-$ROS_DISTRO-cv-bridge \
  ros-$ROS_DISTRO-pcl-conversions \
  ros-$ROS_DISTRO-pcl-ros \
  python3-numpy python3-opencv
```

## Run examples

### Sensor fusion

- C++: `ros2 run avbook_cpp_nodes sensor_fusion_node`
- Python: `ros2 run avbook_py_nodes sensor_fusion_node`

This example fuses **camera + LiDAR** by projecting the LiDAR point cloud into the camera image and publishing an overlay image.

Parameters:

- `image_topic` (default `/image_raw`)
- `cloud_topic` (default `/points_raw`)
- `output_topic` (default `/fusion/image`)
- `fx`, `fy`, `cx`, `cy` (camera intrinsics)
- `R` (9 floats, row-major rotation from LiDAR frame to camera frame)
- `t` (3 floats, translation from LiDAR frame to camera frame)
- `min_z_m`, `max_z_m` (depth range for drawing)

### Voxel grid filter

- C++: `ros2 run avbook_cpp_nodes voxel_grid_filter_node`
- Python: `ros2 run avbook_py_nodes voxel_grid_filter_node`

Parameters:

- `input_topic` (default `/points_raw`)
- `output_topic` (default `/points_voxel`)
- `leaf_size` (default `0.2`, meters)

### Sobel filter

- C++: `ros2 run avbook_cpp_nodes sobel_filter_node`
- Python: `ros2 run avbook_py_nodes sobel_filter_node`

Parameters:

- `input_topic` (default `/image_raw`)
- `output_topic` (default `/image_sobel`)
- `ksize` (default `3`)
