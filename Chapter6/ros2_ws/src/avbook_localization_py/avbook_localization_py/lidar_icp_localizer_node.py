from __future__ import annotations

import time
from typing import Optional

import numpy as np
import rclpy
from geometry_msgs.msg import PoseWithCovariance
from nav_msgs.msg import Odometry
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import PointCloud2

from .geometry_utils import compose, mat4_identity, quat_msg_from_R
from .open3d_utils import estimate_normals, icp_register, load_pcd, voxel_downsample, xyz_to_pcd
from .pointcloud2_numpy import pointcloud2_to_xyz_numpy


class LidarIcpLocalizerNode(Node):
    """
    LiDAR localization via ICP.

    Modes:
      - Map-based localization (recommended): set `map_pcd_path` to a PCD file to align each scan to the map.
      - Odometry mode (no map): aligns scan_t to scan_{t-1} and integrates the incremental transform.

    Publishes nav_msgs/Odometry on `output_odom_topic`.
    """

    def __init__(self) -> None:
        super().__init__("lidar_icp_localizer_node")

        self._cloud_topic = self.declare_parameter("cloud_topic", "/points_raw").value
        self._output_odom_topic = self.declare_parameter("output_odom_topic", "/lidar/icp/odometry").value
        self._frame_id = self.declare_parameter("frame_id", "map").value
        self._child_frame_id = self.declare_parameter("child_frame_id", "base_link").value

        self._map_pcd_path = str(self.declare_parameter("map_pcd_path", "").value)

        self._voxel_size = float(self.declare_parameter("voxel_size", 0.5).value)
        self._normal_radius = float(self.declare_parameter("normal_radius", 1.0).value)
        self._max_corr_dist = float(self.declare_parameter("max_corr_dist", 2.0).value)
        self._max_iters = int(self.declare_parameter("max_iters", 50).value)
        self._point_to_plane = bool(self.declare_parameter("point_to_plane", True).value)

        self._pub = self.create_publisher(Odometry, self._output_odom_topic, 10)
        self._sub = self.create_subscription(
            PointCloud2, self._cloud_topic, self._on_cloud, qos_profile=qos_profile_sensor_data
        )

        self._map = None
        if self._map_pcd_path:
            try:
                m = load_pcd(self._map_pcd_path)
                m = voxel_downsample(m, self._voxel_size)
                estimate_normals(m, self._normal_radius)
                self._map = m
                self.get_logger().info(f"Loaded map PCD: {self._map_pcd_path}")
            except Exception as e:  # noqa: BLE001
                self.get_logger().error(f"Failed loading map_pcd_path='{self._map_pcd_path}': {e}")
                self._map = None

        self._prev_scan = None
        self._T_map_base = mat4_identity()

        mode = "map" if self._map is not None else "odometry"
        self.get_logger().info(
            f"ICP localization ({mode}): {self._cloud_topic} -> {self._output_odom_topic} (voxel={self._voxel_size})"
        )

    def _publish_odom(self, stamp, T_map_base: np.ndarray) -> None:
        odom = Odometry()
        odom.header.stamp = stamp
        odom.header.frame_id = self._frame_id
        odom.child_frame_id = self._child_frame_id

        odom.pose = PoseWithCovariance()
        odom.pose.pose.position.x = float(T_map_base[0, 3])
        odom.pose.pose.position.y = float(T_map_base[1, 3])
        odom.pose.pose.position.z = float(T_map_base[2, 3])
        odom.pose.pose.orientation = quat_msg_from_R(T_map_base[:3, :3])

        self._pub.publish(odom)

    def _on_cloud(self, msg: PointCloud2) -> None:
        t0 = time.time()
        xyz = pointcloud2_to_xyz_numpy(msg)
        if xyz.shape[0] < 50:
            return

        scan = xyz_to_pcd(xyz)
        scan = voxel_downsample(scan, self._voxel_size)
        estimate_normals(scan, self._normal_radius)

        if self._map is not None:
            target = self._map
            init_T = self._T_map_base
            T_new, fitness = icp_register(
                source=scan,
                target=target,
                init_T=init_T,
                max_corr_dist=self._max_corr_dist,
                point_to_plane=self._point_to_plane,
                max_iters=self._max_iters,
            )
            self._T_map_base = T_new
        else:
            if self._prev_scan is None:
                self._prev_scan = scan
                self._publish_odom(msg.header.stamp, self._T_map_base)
                return

            T_rel, fitness = icp_register(
                source=self._prev_scan,
                target=scan,
                init_T=mat4_identity(),
                max_corr_dist=self._max_corr_dist,
                point_to_plane=self._point_to_plane,
                max_iters=self._max_iters,
            )
            self._T_map_base = compose(self._T_map_base, T_rel)
            self._prev_scan = scan

        self._publish_odom(msg.header.stamp, self._T_map_base)
        dt_ms = (time.time() - t0) * 1000.0
        self.get_logger().debug(f"ICP fitness={fitness:.3f} dt={dt_ms:.1f}ms")


def main() -> None:
    rclpy.init()
    node = LidarIcpLocalizerNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
