from setuptools import setup, find_packages

package_name = 'auto_perception'

setup(
    name=package_name,
    version='0.2.0',
    packages=find_packages(include=[f"{package_name}*"]),
    data_files=[
        ('share/ament_index/resource_index/packages', ['resource/auto_perception']),
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name + '/launch', ['launch/yolo_lidar_fusion.launch.py']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='your_name',
    maintainer_email='you@example.com',
    description='YOLO + LiDAR fusion with GPS output',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'yolo_lidar_fusion_node = auto_perception.yolo_lidar_fusion_node:main',
        ],
    },
)

