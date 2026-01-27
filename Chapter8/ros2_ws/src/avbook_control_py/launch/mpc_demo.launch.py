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
                "mode": "sine",
                "sine_amp": 3.0,
                "sine_freq_hz": 0.08,
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

    mpc = Node(
        package="avbook_control_py",
        executable="mpc_controller_node",
        name="mpc_controller_node",
        output="screen",
        parameters=[
            {
                "rate_hz": 50.0,
                "dt": 0.02,
                "horizon": 25,
                "q_pos": 10.0,
                "q_vel": 1.0,
                "r_u": 0.5,
                "u_min": -5.0,
                "u_max": 5.0,
                "du_max": 0.5,
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

    return LaunchDescription([setpoint, plant, mpc, viz])
