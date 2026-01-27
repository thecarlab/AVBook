from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from geometry_msgs.msg import PoseWithCovariance
from nav_msgs.msg import Odometry
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import CameraInfo, Image

from .geometry_utils import compose, mat4_identity, quat_msg_from_R


@dataclass
class _Frame:
    gray: np.ndarray
    kp: list
    des: np.ndarray


class OrbVisualLocalizerNode(Node):
    """
    ORB-based visual localization / odometry example (Python).

    Note: This is a *minimal* ORB-SLAM-style front-end (feature matching + essential matrix + recoverPose),
    not a full SLAM system (no loop closure / global map optimization).

    Publishes nav_msgs/Odometry on `output_odom_topic`.
    """

    def __init__(self) -> None:
        super().__init__("orb_visual_localizer_node")

        self._image_topic = self.declare_parameter("image_topic", "/image_raw").value
        self._camera_info_topic = self.declare_parameter("camera_info_topic", "/camera_info").value
        self._use_camera_info = bool(self.declare_parameter("use_camera_info", True).value)

        self._output_odom_topic = self.declare_parameter("output_odom_topic", "/camera/orb/odometry").value
        self._frame_id = self.declare_parameter("frame_id", "map").value
        self._child_frame_id = self.declare_parameter("child_frame_id", "base_link").value

        self._fx = float(self.declare_parameter("fx", 600.0).value)
        self._fy = float(self.declare_parameter("fy", 600.0).value)
        self._cx = float(self.declare_parameter("cx", 320.0).value)
        self._cy = float(self.declare_parameter("cy", 240.0).value)

        self._nfeatures = int(self.declare_parameter("nfeatures", 1500).value)
        self._match_ratio = float(self.declare_parameter("match_ratio", 0.75).value)
        self._min_inliers = int(self.declare_parameter("min_inliers", 30).value)
        self._scale_translation = float(self.declare_parameter("scale_translation", 1.0).value)

        self._pub = self.create_publisher(Odometry, self._output_odom_topic, 10)
        self._sub_img = self.create_subscription(
            Image, self._image_topic, self._on_image, qos_profile=qos_profile_sensor_data
        )
        self._sub_info = None
        if self._use_camera_info:
            self._sub_info = self.create_subscription(CameraInfo, self._camera_info_topic, self._on_info, 10)

        self._bridge = CvBridge()
        self._orb = cv2.ORB_create(nfeatures=self._nfeatures)
        self._bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)

        self._K = self._make_K()
        self._T_map_base = mat4_identity()
        self._prev: Optional[_Frame] = None

        self.get_logger().info(
            f"ORB visual localization: {self._image_topic} -> {self._output_odom_topic} (use_camera_info={self._use_camera_info})"
        )

    def _make_K(self) -> np.ndarray:
        K = np.array(
            [[self._fx, 0.0, self._cx], [0.0, self._fy, self._cy], [0.0, 0.0, 1.0]], dtype=np.float64
        )
        return K

    def _on_info(self, msg: CameraInfo) -> None:
        if len(msg.k) == 9 and float(msg.k[0]) > 0.0:
            self._fx = float(msg.k[0])
            self._fy = float(msg.k[4])
            self._cx = float(msg.k[2])
            self._cy = float(msg.k[5])
            self._K = self._make_K()

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

    def _frame_from_gray(self, gray: np.ndarray) -> Optional[_Frame]:
        kp, des = self._orb.detectAndCompute(gray, None)
        if des is None or len(kp) < 50:
            return None
        return _Frame(gray=gray, kp=kp, des=des)

    def _estimate_motion(self, prev: _Frame, cur: _Frame) -> Optional[np.ndarray]:
        matches_knn = self._bf.knnMatch(prev.des, cur.des, k=2)
        good = []
        for pair in matches_knn:
            if len(pair) < 2:
                continue
            m, n = pair
            if m.distance < self._match_ratio * n.distance:
                good.append(m)
        if len(good) < self._min_inliers:
            return None

        pts_prev = np.float64([prev.kp[m.queryIdx].pt for m in good])
        pts_cur = np.float64([cur.kp[m.trainIdx].pt for m in good])

        E, mask = cv2.findEssentialMat(
            pts_prev,
            pts_cur,
            cameraMatrix=self._K,
            method=cv2.RANSAC,
            prob=0.999,
            threshold=1.0,
        )
        if E is None:
            return None

        inliers_e = int(np.count_nonzero(mask)) if mask is not None else 0
        if inliers_e < self._min_inliers:
            return None

        inliers_pose, R, t, _ = cv2.recoverPose(E, pts_prev, pts_cur, cameraMatrix=self._K, mask=mask)
        if int(inliers_pose) < self._min_inliers:
            return None

        T = mat4_identity()
        T[:3, :3] = R.astype(np.float64, copy=False)
        # Scale is unknown for monocular VO; scale_translation allows a rough tuning.
        T[:3, 3] = (t.reshape(3) * float(self._scale_translation)).astype(np.float64, copy=False)
        return T

    def _on_image(self, msg: Image) -> None:
        t0 = time.time()
        try:
            gray = self._bridge.imgmsg_to_cv2(msg, desired_encoding="mono8")
        except Exception as e:  # noqa: BLE001
            self.get_logger().warn(f"cv_bridge failed: {e}")
            return

        cur = self._frame_from_gray(gray)
        if cur is None:
            return

        if self._prev is None:
            self._prev = cur
            self._publish_odom(msg.header.stamp, self._T_map_base)
            return

        T_rel = self._estimate_motion(self._prev, cur)
        self._prev = cur
        if T_rel is None:
            return

        self._T_map_base = compose(self._T_map_base, T_rel)
        self._publish_odom(msg.header.stamp, self._T_map_base)

        dt_ms = (time.time() - t0) * 1000.0
        self.get_logger().debug(f"ORB dt={dt_ms:.1f}ms")


def main() -> None:
    rclpy.init()
    node = OrbVisualLocalizerNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
