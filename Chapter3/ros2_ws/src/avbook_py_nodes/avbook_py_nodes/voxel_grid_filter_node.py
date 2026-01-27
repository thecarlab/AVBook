import numpy as np
import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from sensor_msgs.msg import PointCloud2
from sensor_msgs_py import point_cloud2


class VoxelGridFilterNode(Node):
    def __init__(self) -> None:
        super().__init__("voxel_grid_filter_node")

        self._input_topic = self.declare_parameter("input_topic", "/points_raw").value
        self._output_topic = self.declare_parameter("output_topic", "/points_voxel").value
        self._leaf_size = float(self.declare_parameter("leaf_size", 0.2).value)
        if self._leaf_size <= 0.0:
            self.get_logger().warn("leaf_size <= 0; using 0.2")
            self._leaf_size = 0.2

        self._pub = self.create_publisher(PointCloud2, self._output_topic, 10)
        self._sub = self.create_subscription(PointCloud2, self._input_topic, self._on_cloud, 10)

        self.get_logger().info(
            f"VoxelGrid {self._input_topic} -> {self._output_topic} (leaf_size={self._leaf_size:.3f} m)"
        )

    def _on_cloud(self, msg: PointCloud2) -> None:
        pts_iter = point_cloud2.read_points(msg, field_names=("x", "y", "z"), skip_nans=True)
        pts = np.fromiter(pts_iter, dtype=[("x", np.float32), ("y", np.float32), ("z", np.float32)])
        if pts.size == 0:
            return

        points = np.stack([pts["x"], pts["y"], pts["z"]], axis=1).astype(np.float32, copy=False)

        voxel = np.floor(points / self._leaf_size).astype(np.int32)
        _, inverse = np.unique(voxel, axis=0, return_inverse=True)

        counts = np.bincount(inverse).astype(np.float32)
        sums_x = np.bincount(inverse, weights=points[:, 0])
        sums_y = np.bincount(inverse, weights=points[:, 1])
        sums_z = np.bincount(inverse, weights=points[:, 2])

        centroids = np.stack([sums_x / counts, sums_y / counts, sums_z / counts], axis=1).astype(
            np.float32, copy=False
        )

        out = point_cloud2.create_cloud_xyz32(msg.header, centroids.tolist())
        self._pub.publish(out)


def main() -> None:
    rclpy.init()
    node = VoxelGridFilterNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
