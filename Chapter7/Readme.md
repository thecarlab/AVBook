# Chapter 7 — ROS 2 Planning (Python)

This chapter includes an example **A\*** planner node for ROS 2 (Python).

## Code location

- `Chapter7/ros2_ws/src/avbook_planning_py`

## Build

```bash
cd Chapter7/ros2_ws
source /opt/ros/$ROS_DISTRO/setup.bash
colcon build --symlink-install
source install/setup.bash
```

## Run

```bash
ros2 launch avbook_planning_py astar.launch.py
```

### Topics

- Subscribes:
  - `/map` (`nav_msgs/OccupancyGrid`)
  - `/start` (`geometry_msgs/PoseStamped`)
  - `/goal` (`geometry_msgs/PoseStamped`)
- Publishes:
  - `/path` (`nav_msgs/Path`)

### Notes

- This example does **not** use TF; it assumes start/goal are in the same frame as the map.
- Unknown cells (`-1`) are treated as obstacles by default (`treat_unknown_as_obstacle:=true`).
