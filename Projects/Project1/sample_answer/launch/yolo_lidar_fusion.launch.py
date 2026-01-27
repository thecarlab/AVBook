from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='auto_perception',
            executable='yolo_lidar_fusion_node',
            name='yolo_lidar_fusion',
            output='screen',
        ),
    ])
