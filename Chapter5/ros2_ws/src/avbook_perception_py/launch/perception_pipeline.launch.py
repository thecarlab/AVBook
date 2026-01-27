from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    # YOLO -> DeepSORT tracking pipeline.
    yolo = Node(
        package="avbook_perception_py",
        executable="yolo_perception_node",
        name="yolo_perception_node",
        output="screen",
        parameters=[
            {
                "image_topic": "/image_raw",
                "detections_topic": "/detections",
                "overlay_topic": "/detections/image",
                "model": "yolov8n.pt",
                "conf": 0.25,
                "iou": 0.45,
                "device": "cpu",
            }
        ],
    )

    tracker = Node(
        package="avbook_perception_py",
        executable="deepsort_tracker_node",
        name="deepsort_tracker_node",
        output="screen",
        parameters=[
            {
                "image_topic": "/image_raw",
                "detections_topic": "/detections",
                "tracks_topic": "/tracks",
                "overlay_topic": "/tracks/image",
                "min_score": 0.25,
            }
        ],
    )

    return LaunchDescription([yolo, tracker])
