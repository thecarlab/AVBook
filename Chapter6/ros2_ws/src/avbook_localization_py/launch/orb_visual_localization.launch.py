from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    return LaunchDescription(
        [
            Node(
                package="avbook_localization_py",
                executable="orb_visual_localizer_node",
                name="orb_visual_localizer_node",
                output="screen",
                parameters=[
                    {
                        "image_topic": "/image_raw",
                        "camera_info_topic": "/camera_info",
                        "use_camera_info": True,
                        "output_odom_topic": "/camera/orb/odometry",
                        "frame_id": "map",
                        "child_frame_id": "base_link",
                        # If not using CameraInfo:
                        "fx": 600.0,
                        "fy": 600.0,
                        "cx": 320.0,
                        "cy": 240.0,
                        "nfeatures": 1500,
                        "match_ratio": 0.75,
                        "min_inliers": 30,
                        # Monocular VO has unknown scale:
                        "scale_translation": 1.0,
                    }
                ],
            )
        ]
    )
