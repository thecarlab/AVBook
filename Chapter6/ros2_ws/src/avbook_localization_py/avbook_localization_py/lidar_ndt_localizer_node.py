from __future__ import annotations

import time
from typing import Optional, Tuple

import numpy as np
import rclpy
from geometry_msgs.msg import PoseWithCovariance
from nav_msgs.msg import Odometry
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import PointCloud2

from .geometry_utils import compose, mat4_identity, quat_msg_from_R
from .open3d_utils import estimate_normals, load_pcd, ndt_register_if_available, voxel_downsample, xyz_to_pcd
from .pointcloud2_numpy import pointcloud2_to_xyz_numpy


def _try_pclpy_ndt(
    source_xyz: np.ndarray,
    target_xyz: np.ndarray,
    init_T: np.ndarray,
    resolution: float,
    max_iters: int,
) -> Optional[Tuple[np.ndarray, float]]:
    """
    Optional NDT implementation using pclpy (PCL bindings).
    Returns None if pclpy is not installed.
    """
    try:
        from pclpy import pcl  # type: ignore
    except Exception:
        return None

    src = pcl.PointCloud.PointXYZ()
    tgt = pcl.PointCloud.PointXYZ()
    src.from_array(source_xyz.astype(np.float32, copy=False))
    tgt.from_array(target_xyz.astype(np.float32, copy=False))

    ndt = pcl.registration.NormalDistributionsTransform.PointXYZ_PointXYZ()
    ndt.setResolution(float(resolution))
    ndt.setMaximumIterations(int(max_iters))
    ndt.setInputSource(src)
    ndt.setInputTarget(tgt)

    guess = pcl.common.transformationFromEigen(init_T.astype(np.float32, copy=False))
    aligned = pcl.PointCloud.PointXYZ()
    ndt.align(aligned, guess)

    # Extract final transformation (Eigen::Matrix4f -> numpy)
    T = np.array(ndt.getFinalTransformation(), dtype=np.float64)
    fitness = float(ndt.getFitnessScore())
    return T, fitness


class LidarNdtLocalizerNode(Node):
    """
    LiDAR localization via NDT.

    This node prefers:
      1) Open3D NDT (if your Open3D build provides `registration_ndt`)
      2) pclpy NDT (if `pclpy` is installed)

    If neither is available, it will log an error and do nothing.
    """

    def __init__(self) -> None:
        super().__init__("lidar_ndt_localizer_node")

        self._cloud_topic = self.declare_parameter("cloud_topic", "/points_raw").value
        self._output_odom_topic = self.declare_parameter("output_odom_topic", "/lidar/ndt/odometry").value
        self._frame_id = self.declare_parameter("frame_id", "map").value
        self._child_frame_id = self.declare_parameter("child_frame_id", "base_link").value

        self._map_pcd_path = str(self.declare_parameter("map_pcd_path", "").value)

        self._voxel_size = float(self.declare_parameter("voxel_size", 0.5).value)
        self._normal_radius = float(self.declare_parameter("normal_radius", 1.0).value)
        self._max_corr_dist = float(self.declare_parameter("max_corr_dist", 3.0).value)
        self._resolution = float(self.declare_parameter("ndt_resolution", 1.0).value)
        self._max_iters = int(self.declare_parameter("max_iters", 35).value)

        self._pub = self.create_publisher(Odometry, self._output_odom_topic, 10)
        self._sub = self.create_subscription(
            PointCloud2, self._cloud_topic, self._on_cloud, qos_profile=qos_profile_sensor_data
        )

        self._map = None
        self._map_xyz = None
        if self._map_pcd_path:
            try:
                m = load_pcd(self._map_pcd_path)
                m = voxel_downsample(m, self._voxel_size)
                estimate_normals(m, self._normal_radius)
                self._map = m
                self._map_xyz = np.asarray(m.points).astype(np.float64, copy=False)
                self.get_logger().info(f"Loaded map PCD: {self._map_pcd_path}")
            except Exception as e:  # noqa: BLE001
                self.get_logger().error(f"Failed loading map_pcd_path='{self._map_pcd_path}': {e}")
                self._map = None
                self._map_xyz = None

        self._prev_scan_xyz = None
        self._T_map_base = mat4_identity()

        self.get_logger().info(
            f"NDT localization: {self._cloud_topic} -> {self._output_odom_topic} (voxel={self._voxel_size}, res={self._resolution})"
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

        # Downsample early in numpy for pclpy fallback.
        if self._voxel_size > 0.0:
            voxel = np.floor(xyz / self._voxel_size).astype(np.int32)
            _, keep_idx = np.unique(voxel, axis=0, return_index=True)
            xyz = xyz[np.sort(keep_idx)]

        scan_pcd = xyz_to_pcd(xyz)
        scan_pcd = voxel_downsample(scan_pcd, self._voxel_size)
        estimate_normals(scan_pcd, self._normal_radius)
        scan_xyz = np.asarray(scan_pcd.points).astype(np.float64, copy=False)

        if scan_xyz.shape[0] < 30:
            return

        map_mode = self._map is not None
        if map_mode:
            source_pcd = scan_pcd
            target_pcd = self._map
            init_T = self._T_map_base
            source_xyz = scan_xyz
            target_xyz = self._map_xyz
        else:
            if self._prev_scan_xyz is None:
                self._prev_scan_xyz = scan_xyz
                self._publish_odom(msg.header.stamp, self._T_map_base)
                return
            source_xyz = self._prev_scan_xyz
            target_xyz = scan_xyz
            source_pcd = xyz_to_pcd(source_xyz)
            target_pcd = scan_pcd
            init_T = mat4_identity()
        if target_pcd is None:
            return

        # 1) Try Open3D NDT if supported.
        try:
            ndt_o3d = ndt_register_if_available(
                source=source_pcd,
                target=target_pcd,
                init_T=init_T,
                max_corr_dist=self._max_corr_dist,
                resolution=self._resolution,
                max_iters=self._max_iters,
            )
        except Exception as e:  # noqa: BLE001
            self.get_logger().warn(f"Open3D NDT failed; falling back if possible: {e}")
            ndt_o3d = None
        if ndt_o3d is not None:
            T_new, fitness = ndt_o3d
        else:
            # 2) Try pclpy.
            if target_xyz is None:
                return
            out = _try_pclpy_ndt(
                source_xyz=source_xyz,
                target_xyz=target_xyz,
                init_T=init_T,
                resolution=self._resolution,
                max_iters=self._max_iters,
            )
            if out is None:
                self.get_logger().error(
                    "No NDT backend available. Install either: "
                    "Open3D with registration_ndt support, or `pclpy`."
                )
                return
            T_new, fitness = out

        if map_mode:
            self._T_map_base = T_new
        else:
            self._T_map_base = compose(self._T_map_base, T_new)
            self._prev_scan_xyz = scan_xyz

        self._publish_odom(msg.header.stamp, self._T_map_base)
        dt_ms = (time.time() - t0) * 1000.0
        self.get_logger().debug(f"NDT fitness={fitness:.3f} dt={dt_ms:.1f}ms")


def main() -> None:
    rclpy.init()
    node = LidarNdtLocalizerNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
