from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import Image


@dataclass(frozen=True)
class _LaneMask:
    mask: np.ndarray  # uint8 0..255
    overlay_bgr: np.ndarray


class LaneNetLaneNode(Node):
    """
    Lane detection node with a LaneNet-style interface:
    - If `onnx_path` is provided, runs an ONNX lane segmentation model.
    - Otherwise falls back to a lightweight OpenCV lane heuristic (Canny + ROI + Hough).

    Publishes:
      - `overlay_topic` (sensor_msgs/Image) BGR overlay
      - `mask_topic` (sensor_msgs/Image) mono8 mask
    """

    def __init__(self) -> None:
        super().__init__("lanenet_lane_node")

        self._image_topic = self.declare_parameter("image_topic", "/image_raw").value
        self._overlay_topic = self.declare_parameter("overlay_topic", "/lanes/image").value
        self._mask_topic = self.declare_parameter("mask_topic", "/lanes/mask").value

        self._onnx_path = str(self.declare_parameter("onnx_path", "").value)
        self._input_width = int(self.declare_parameter("input_width", 512).value)
        self._input_height = int(self.declare_parameter("input_height", 256).value)
        self._mask_thresh = float(self.declare_parameter("mask_thresh", 0.5).value)

        self._bridge = CvBridge()
        self._pub_overlay = self.create_publisher(Image, self._overlay_topic, 10)
        self._pub_mask = self.create_publisher(Image, self._mask_topic, 10)
        self._sub = self.create_subscription(
            Image, self._image_topic, self._on_image, qos_profile=qos_profile_sensor_data
        )

        self._session = None
        if self._onnx_path:
            self._try_load_onnx()

        mode = "onnx" if self._session is not None else "opencv_fallback"
        self.get_logger().info(f"LaneNet-style lane detection ({mode}): {self._image_topic} -> {self._overlay_topic}")

    def _try_load_onnx(self) -> None:
        try:
            import onnxruntime as ort  # type: ignore
        except Exception as e:  # noqa: BLE001
            self.get_logger().error(
                "onnxruntime not installed; LaneNet ONNX mode disabled. "
                "Install with: pip install onnxruntime. "
                f"Import error: {e}"
            )
            self._session = None
            return

        try:
            self._session = ort.InferenceSession(self._onnx_path, providers=["CPUExecutionProvider"])
        except Exception as e:  # noqa: BLE001
            self.get_logger().error(f"Failed to load ONNX model at '{self._onnx_path}': {e}")
            self._session = None

    @staticmethod
    def _roi_edges(gray: np.ndarray) -> np.ndarray:
        edges = cv2.Canny(gray, 50, 150)
        h, w = edges.shape[:2]
        mask = np.zeros_like(edges)
        poly = np.array(
            [[(int(0.1 * w), h), (int(0.45 * w), int(0.6 * h)), (int(0.55 * w), int(0.6 * h)), (int(0.9 * w), h)]],
            dtype=np.int32,
        )
        cv2.fillPoly(mask, poly, 255)
        return cv2.bitwise_and(edges, mask)

    @staticmethod
    def _hough_lines(edges: np.ndarray) -> np.ndarray:
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180.0, threshold=40, minLineLength=40, maxLineGap=80)
        out = np.zeros_like(edges)
        if lines is None:
            return out
        for x1, y1, x2, y2 in lines[:, 0]:
            cv2.line(out, (x1, y1), (x2, y2), 255, 6)
        out = cv2.dilate(out, np.ones((7, 7), np.uint8), iterations=1)
        return out

    def _infer_opencv(self, bgr: np.ndarray) -> _LaneMask:
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        edges = self._roi_edges(gray)
        mask = self._hough_lines(edges)

        overlay = bgr.copy()
        lane_color = np.zeros_like(overlay)
        lane_color[:, :, 1] = mask  # green
        overlay = cv2.addWeighted(overlay, 1.0, lane_color, 0.6, 0.0)
        return _LaneMask(mask=mask, overlay_bgr=overlay)

    def _infer_onnx(self, bgr: np.ndarray) -> _LaneMask:
        # Expect a segmentation-like output; this is intentionally generic so users can plug in a LaneNet export.
        sess = self._session
        if sess is None:
            return self._infer_opencv(bgr)

        inp = cv2.resize(bgr, (self._input_width, self._input_height), interpolation=cv2.INTER_AREA)
        inp = cv2.cvtColor(inp, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        inp = np.transpose(inp, (2, 0, 1))[None, :, :, :]  # 1x3xHxW

        in_name = sess.get_inputs()[0].name
        out = sess.run(None, {in_name: inp})
        logits = out[0]
        # Common shapes: 1x1xHxW, 1xHxW, 1xCxHxW. Take channel 0 if needed.
        if logits.ndim == 4:
            logits = logits[0, 0, :, :]
        elif logits.ndim == 3:
            logits = logits[0, :, :]

        prob = 1.0 / (1.0 + np.exp(-logits)) if logits.dtype != np.uint8 else logits.astype(np.float32) / 255.0
        mask_small = (prob >= self._mask_thresh).astype(np.uint8) * 255
        mask = cv2.resize(mask_small, (bgr.shape[1], bgr.shape[0]), interpolation=cv2.INTER_NEAREST)

        overlay = bgr.copy()
        lane_color = np.zeros_like(overlay)
        lane_color[:, :, 1] = mask
        overlay = cv2.addWeighted(overlay, 1.0, lane_color, 0.6, 0.0)
        return _LaneMask(mask=mask, overlay_bgr=overlay)

    def _on_image(self, msg: Image) -> None:
        bgr = self._bridge.imgmsg_to_cv2(msg, desired_encoding="bgr8")
        out = self._infer_onnx(bgr) if self._session is not None else self._infer_opencv(bgr)

        overlay_msg = self._bridge.cv2_to_imgmsg(out.overlay_bgr, encoding="bgr8")
        overlay_msg.header = msg.header
        self._pub_overlay.publish(overlay_msg)

        mask_msg = self._bridge.cv2_to_imgmsg(out.mask, encoding="mono8")
        mask_msg.header = msg.header
        self._pub_mask.publish(mask_msg)


def main() -> None:
    rclpy.init()
    node = LaneNetLaneNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
