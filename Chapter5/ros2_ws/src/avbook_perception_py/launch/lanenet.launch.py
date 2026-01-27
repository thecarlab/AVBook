from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    return LaunchDescription(
        [
            Node(
                package="avbook_perception_py",
                executable="lanenet_lane_node",
                name="lanenet_lane_node",
                output="screen",
                parameters=[
                    {
                        "image_topic": "/image_raw",
                        "overlay_topic": "/lanes/image",
                        "mask_topic": "/lanes/mask",
                        # Set to an exported LaneNet(-like) ONNX path to enable ONNX mode:
                        "onnx_path": "",
                        "input_width": 512,
                        "input_height": 256,
                        "mask_thresh": 0.5,
                    }
                ],
            )
        ]
    )
