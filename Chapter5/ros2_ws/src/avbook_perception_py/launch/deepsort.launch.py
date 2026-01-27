from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    return LaunchDescription(
        [
            Node(
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
        ]
    )
