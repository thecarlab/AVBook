from setuptools import find_packages, setup

package_name = "avbook_planning_py"

setup(
    name=package_name,
    version="0.0.1",
    packages=find_packages(exclude=("test",)),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml"]),
        ("share/" + package_name + "/launch", ["launch/astar.launch.py"]),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="AVBook",
    maintainer_email="you@example.com",
    description="AVBook Chapter 7 ROS 2 planning example nodes.",
    license="Apache-2.0",
    entry_points={
        "console_scripts": [
            "astar_planner_node = avbook_planning_py.astar_planner_node:main",
        ],
    },
)
