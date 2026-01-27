import cv2
import message_filters
import numpy as np
import rclpy
from cv_bridge import CvBridge
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import Image, PointCloud2
from sensor_msgs_py import point_cloud2


class CameraLidarFusionNode(Node):
    def __init__(self) -> None:
        super().__init__("sensor_fusion_node")

        self._image_topic = self.declare_parameter("image_topic", "/image_raw").value
        self._cloud_topic = self.declare_parameter("cloud_topic", "/points_raw").value
        self._output_topic = self.declare_parameter("output_topic", "/fusion/image").value

        self._fx = float(self.declare_parameter("fx", 600.0).value)
        self._fy = float(self.declare_parameter("fy", 600.0).value)
        self._cx = float(self.declare_parameter("cx", 320.0).value)
        self._cy = float(self.declare_parameter("cy", 240.0).value)

        r_list = list(self.declare_parameter("R", [1, 0, 0, 0, 1, 0, 0, 0, 1]).value)
        t_list = list(self.declare_parameter("t", [0, 0, 0]).value)
        if len(r_list) != 9 or len(t_list) != 3:
            raise ValueError("Parameters R must have 9 elements and t must have 3 elements.")
        self._R = np.array(r_list, dtype=np.float64).reshape(3, 3)
        self._t = np.array(t_list, dtype=np.float64).reshape(3, 1)

        self._point_radius_px = int(self.declare_parameter("point_radius_px", 2).value)
        self._max_points = int(self.declare_parameter("max_points", 50000).value)
        self._min_z_m = float(self.declare_parameter("min_z_m", 0.1).value)
        self._max_z_m = float(self.declare_parameter("max_z_m", 80.0).value)

        self._bridge = CvBridge()
        self._pub = self.create_publisher(Image, self._output_topic, 10)

        image_sub = message_filters.Subscriber(self, Image, self._image_topic, qos_profile=qos_profile_sensor_data)
        cloud_sub = message_filters.Subscriber(self, PointCloud2, self._cloud_topic, qos_profile=qos_profile_sensor_data)
        self._sync = message_filters.ApproximateTimeSynchronizer(
            [image_sub, cloud_sub], queue_size=10, slop=0.05
        )
        self._sync.registerCallback(self._on_sync)

        self.get_logger().info(
            f"Fusing Image({self._image_topic}) + Cloud({self._cloud_topic}) -> {self._output_topic}"
        )

    def _on_sync(self, image_msg: Image, cloud_msg: PointCloud2) -> None:
        img = self._bridge.imgmsg_to_cv2(image_msg, desired_encoding="passthrough")
        if img.ndim == 2:
            bgr = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        elif img.ndim == 3 and img.shape[2] == 3:
            bgr = img.copy()
        else:
            self.get_logger().warn(f"Unsupported image shape: {img.shape}")
            return

        pts_iter = point_cloud2.read_points(cloud_msg, field_names=("x", "y", "z"), skip_nans=True)
        pts = np.fromiter(pts_iter, dtype=[("x", np.float32), ("y", np.float32), ("z", np.float32)])
        if pts.size == 0:
            return

        points = np.stack([pts["x"], pts["y"], pts["z"]], axis=1).astype(np.float64, copy=False)

        step = max(1, int(points.shape[0] / max(1, self._max_points)))
        points = points[::step, :]

        cam = (self._R @ points.T) + self._t  # 3xN
        X = cam[0, :]
        Y = cam[1, :]
        Z = cam[2, :]

        valid = np.logical_and(Z > self._min_z_m, Z < self._max_z_m)
        if not np.any(valid):
            return

        X = X[valid]
        Y = Y[valid]
        Z = Z[valid]

        u = (self._fx * (X / Z) + self._cx).round().astype(np.int32)
        v = (self._fy * (Y / Z) + self._cy).round().astype(np.int32)

        h, w = bgr.shape[0], bgr.shape[1]
        in_img = np.logical_and.reduce((u >= 0, u < w, v >= 0, v < h))
        u = u[in_img]
        v = v[in_img]
        Z = Z[in_img]
        if u.size == 0:
            return

        z_norm = (Z - self._min_z_m) / (self._max_z_m - self._min_z_m)
        z_norm = np.clip(z_norm, 0.0, 1.0)

        for uu, vv, a in zip(u.tolist(), v.tolist(), z_norm.tolist()):
            red = int(round(255.0 * (1.0 - a)))
            blue = int(round(255.0 * a))
            cv2.circle(bgr, (uu, vv), self._point_radius_px, (blue, 0, red), thickness=-1)

        out = self._bridge.cv2_to_imgmsg(bgr, encoding="bgr8")
        out.header = image_msg.header
        self._pub.publish(out)


def main() -> None:
    rclpy.init()
    node = CameraLidarFusionNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
