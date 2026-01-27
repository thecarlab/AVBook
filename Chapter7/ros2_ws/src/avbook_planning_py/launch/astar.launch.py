from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description() -> LaunchDescription:
    return LaunchDescription(
        [
            Node(
                package="avbook_planning_py",
                executable="astar_planner_node",
                name="astar_planner_node",
                output="screen",
                parameters=[
                    {
                        "map_topic": "/map",
                        "start_topic": "/start",
                        "goal_topic": "/goal",
                        "path_topic": "/path",
                        "allow_diagonal": True,
                        "occupied_threshold": 50,
                        "treat_unknown_as_obstacle": True,
                        "replan_on_map": True,
                        "replan_on_start": True,
                        "replan_on_goal": True,
                    }
                ],
            )
        ]
    )
