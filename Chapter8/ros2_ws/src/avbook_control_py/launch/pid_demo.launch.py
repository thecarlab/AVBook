from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    setpoint = Node(
        package="avbook_control_py",
        executable="setpoint_node",
        name="setpoint_node",
        output="screen",
        parameters=[
            {
                "mode": "step",
                "step_value": 5.0,
                "step_time_s": 1.0,
                "rate_hz": 20.0,
            }
        ],
    )

    plant = Node(
        package="avbook_control_py",
        executable="plant_1d_node",
        name="plant_1d_node",
        output="screen",
        parameters=[{"rate_hz": 50.0}],
    )

    pid = Node(
        package="avbook_control_py",
        executable="pid_controller_node",
        name="pid_controller_node",
        output="screen",
        parameters=[
            {
                "kp": 2.0,
                "ki": 0.2,
                "kd": 0.2,
                "u_min": -5.0,
                "u_max": 5.0,
                "rate_hz": 50.0,
            }
        ],
    )

    viz = Node(
        package="avbook_control_py",
        executable="control_visualizer_node",
        name="control_visualizer_node",
        output="screen",
        parameters=[{"window_s": 20.0, "plot_hz": 10.0}],
    )

    return LaunchDescription([setpoint, plant, pid, viz])
