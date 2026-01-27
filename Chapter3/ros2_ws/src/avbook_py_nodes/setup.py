from setuptools import find_packages, setup

package_name = "avbook_py_nodes"

setup(
    name=package_name,
    version="0.0.1",
    packages=find_packages(exclude=("test",)),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml"]),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="AVBook",
    maintainer_email="you@example.com",
    description="AVBook Chapter 3 ROS 2 Python example nodes.",
    license="Apache-2.0",
    entry_points={
        "console_scripts": [
            "sensor_fusion_node = avbook_py_nodes.sensor_fusion_node:main",
            "voxel_grid_filter_node = avbook_py_nodes.voxel_grid_filter_node:main",
            "sobel_filter_node = avbook_py_nodes.sobel_filter_node:main",
        ],
    },
)
