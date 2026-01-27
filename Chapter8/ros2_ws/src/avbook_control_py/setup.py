from setuptools import find_packages, setup

package_name = "avbook_control_py"

setup(
    name=package_name,
    version="0.0.1",
    packages=find_packages(exclude=("test",)),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml"]),
        ("share/" + package_name + "/launch", ["launch/pid_demo.launch.py"]),
        ("share/" + package_name + "/launch", ["launch/mpc_demo.launch.py"]),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="AVBook",
    maintainer_email="you@example.com",
    description="AVBook Chapter 8 ROS 2 control example nodes.",
    license="Apache-2.0",
    entry_points={
        "console_scripts": [
            "pid_controller_node = avbook_control_py.pid_controller_node:main",
            "mpc_controller_node = avbook_control_py.mpc_controller_node:main",
            "plant_1d_node = avbook_control_py.plant_1d_node:main",
            "setpoint_node = avbook_control_py.setpoint_node:main",
            "control_visualizer_node = avbook_control_py.control_visualizer_node:main",
        ],
    },
)
