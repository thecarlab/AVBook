from setuptools import find_packages, setup

package_name = "avbook_localization_py"

setup(
    name=package_name,
    version="0.0.1",
    packages=find_packages(exclude=("test",)),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml"]),
        ("share/" + package_name + "/launch", ["launch/lidar_icp.launch.py"]),
        ("share/" + package_name + "/launch", ["launch/lidar_ndt.launch.py"]),
        ("share/" + package_name + "/launch", ["launch/orb_visual_localization.launch.py"]),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="AVBook",
    maintainer_email="you@example.com",
    description="AVBook Chapter 6 ROS 2 localization example nodes.",
    license="Apache-2.0",
    entry_points={
        "console_scripts": [
            "lidar_icp_localizer_node = avbook_localization_py.lidar_icp_localizer_node:main",
            "lidar_ndt_localizer_node = avbook_localization_py.lidar_ndt_localizer_node:main",
            "orb_visual_localizer_node = avbook_localization_py.orb_visual_localizer_node:main",
        ],
    },
)
