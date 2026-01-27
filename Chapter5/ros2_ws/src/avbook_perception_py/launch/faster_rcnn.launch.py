from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    return LaunchDescription(
        [
            Node(
                package="avbook_perception_py",
                executable="faster_rcnn_node",
                name="faster_rcnn_node",
                output="screen",
                parameters=[
                    {
                        "image_topic": "/image_raw",
                        "detections_topic": "/detections_frcnn",
                        "overlay_topic": "/detections_frcnn/image",
                        "score_thresh": 0.5,
                        "device": "cpu",
                    }
                ],
            )
        ]
    )
