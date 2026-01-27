from setuptools import find_packages, setup

package_name = "avbook_perception_py"

setup(
    name=package_name,
    version="0.0.1",
    packages=find_packages(exclude=("test",)),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml"]),
        ("share/" + package_name + "/launch", ["launch/perception_pipeline.launch.py"]),
        ("share/" + package_name + "/launch", ["launch/yolo.launch.py"]),
        ("share/" + package_name + "/launch", ["launch/faster_rcnn.launch.py"]),
        ("share/" + package_name + "/launch", ["launch/lanenet.launch.py"]),
        ("share/" + package_name + "/launch", ["launch/deepsort.launch.py"]),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="AVBook",
    maintainer_email="you@example.com",
    description="AVBook Chapter 5 ROS 2 perception example nodes.",
    license="Apache-2.0",
    entry_points={
        "console_scripts": [
            "yolo_perception_node = avbook_perception_py.yolo_perception_node:main",
            "faster_rcnn_node = avbook_perception_py.faster_rcnn_node:main",
            "lanenet_lane_node = avbook_perception_py.lanenet_lane_node:main",
            "deepsort_tracker_node = avbook_perception_py.deepsort_tracker_node:main",
        ],
    },
)
