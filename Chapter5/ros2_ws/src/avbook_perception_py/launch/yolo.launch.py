from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    return LaunchDescription(
        [
            Node(
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
        ]
    )
