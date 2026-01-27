from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    return LaunchDescription(
        [
            Node(
                package="avbook_localization_py",
                executable="lidar_ndt_localizer_node",
                name="lidar_ndt_localizer_node",
                output="screen",
                parameters=[
                    {
                        "cloud_topic": "/points_raw",
                        "output_odom_topic": "/lidar/ndt/odometry",
                        "frame_id": "map",
                        "child_frame_id": "base_link",
                        # Optional map:
                        "map_pcd_path": "",
                        "voxel_size": 0.5,
                        "normal_radius": 1.0,
                        "max_corr_dist": 3.0,
                        "ndt_resolution": 1.0,
                        "max_iters": 35,
                    }
                ],
            )
        ]
    )
