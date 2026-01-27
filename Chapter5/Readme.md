# Chapter 5 — ROS 2 Perception (Deep Learning)

This chapter adds ROS 2 example nodes (Python) for:

- **YOLO perception** (via `ultralytics`)
- **Fast R-CNN family** (example uses **Faster R-CNN** from `torchvision`)
- **Lane detection with LaneNet-style model** (optional ONNX model) + OpenCV fallback
- **Object tracking with DeepSORT** (via `deep_sort_realtime`)

## Code location

- `Chapter5/ros2_ws/src/avbook_perception_py`

## Build

```bash
cd Chapter5/ros2_ws
source /opt/ros/$ROS_DISTRO/setup.bash
colcon build --symlink-install
source install/setup.bash
```

## ROS dependencies (apt)

```bash
sudo apt update
sudo apt install \
  ros-$ROS_DISTRO-vision-msgs \
  ros-$ROS_DISTRO-cv-bridge \
  python3-numpy python3-opencv
```

## Python dependencies (pip)

Install what you plan to run:

```bash
python3 -m pip install --upgrade pip
python3 -m pip install ultralytics
python3 -m pip install torch torchvision
python3 -m pip install deep-sort-realtime
python3 -m pip install onnxruntime  # only if using LaneNet ONNX mode
```

## Run

### YOLO detection

```bash
ros2 launch avbook_perception_py yolo.launch.py
```

Topics:
- Subscribes: `/image_raw`
- Publishes: `/detections` (vision_msgs/Detection2DArray), `/detections/image` (overlay)

### Faster R-CNN detection

```bash
ros2 launch avbook_perception_py faster_rcnn.launch.py
```

### Lane detection (LaneNet-style)

```bash
ros2 launch avbook_perception_py lanenet.launch.py
```

Set `onnx_path` to your exported LaneNet(-like) ONNX file to enable model inference; otherwise it uses an OpenCV fallback.

### DeepSORT tracking

Run YOLO first (publishes `/detections`), then:

```bash
ros2 launch avbook_perception_py deepsort.launch.py
```

Or launch both together:

```bash
ros2 launch avbook_perception_py perception_pipeline.launch.py
```
