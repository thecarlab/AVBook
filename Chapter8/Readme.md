# Chapter 8 — ROS 2 Control (Python)

This chapter includes runnable ROS 2 examples for:

- **PID controller** (`std_msgs/Float64` setpoint/state -> `Float64` command)
- **Simple MPC controller** (receding-horizon LQR for a 1D double integrator)
- **Live visualizer** (matplotlib) to see setpoint/state/command while running

It also includes a tiny **1D plant simulator** so the demos work end-to-end.

## Code location

- `Chapter8/ros2_ws/src/avbook_control_py`

## Build

```bash
cd Chapter8/ros2_ws
source /opt/ros/$ROS_DISTRO/setup.bash
colcon build --symlink-install
source install/setup.bash
```

## Dependencies

```bash
sudo apt update
sudo apt install python3-numpy python3-matplotlib
```

## Run demos

### PID demo

```bash
ros2 launch avbook_control_py pid_demo.launch.py
```

### MPC demo

```bash
ros2 launch avbook_control_py mpc_demo.launch.py
```

### Topics (defaults)

- `/setpoint` (`std_msgs/Float64`)
- `/state` (`std_msgs/Float64`)
- `/command` (`std_msgs/Float64`)
