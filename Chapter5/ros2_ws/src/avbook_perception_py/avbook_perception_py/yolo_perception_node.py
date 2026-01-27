from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray

from .vision_msgs_utils import make_detection_array


@dataclass(frozen=True)
class _Det:
    x1: float
    y1: float
    x2: float
    y2: float
    cls: int
    score: float


class YoloPerceptionNode(Node):
    """
    ROS 2 node that runs YOLO detection using the `ultralytics` Python package.
    Publishes:
      - `detections_topic` (vision_msgs/Detection2DArray)
      - `overlay_topic` (sensor_msgs/Image) with boxes drawn
    """

    def __init__(self) -> None:
        super().__init__("yolo_perception_node")

        self._image_topic = self.declare_parameter("image_topic", "/image_raw").value
        self._detections_topic = self.declare_parameter("detections_topic", "/detections").value
        self._overlay_topic = self.declare_parameter("overlay_topic", "/detections/image").value

        self._model = str(self.declare_parameter("model", "yolov8n.pt").value)
        self._conf = float(self.declare_parameter("conf", 0.25).value)
        self._iou = float(self.declare_parameter("iou", 0.45).value)
        self._max_det = int(self.declare_parameter("max_det", 300).value)
        self._device = str(self.declare_parameter("device", "cpu").value)

        self._bridge = CvBridge()
        self._pub_det = self.create_publisher(Detection2DArray, self._detections_topic, 10)
        self._pub_img = self.create_publisher(Image, self._overlay_topic, 10)
        self._sub = self.create_subscription(
            Image, self._image_topic, self._on_image, qos_profile=qos_profile_sensor_data
        )

        self._yolo = None
        self._names: Optional[list[str]] = None

        self.get_logger().info(
            f"YOLO: {self._image_topic} -> {self._detections_topic} and {self._overlay_topic} (model={self._model})"
        )

    def _ensure_model(self) -> bool:
        if self._yolo is not None:
            return True
        try:
            from ultralytics import YOLO  # type: ignore
        except Exception as e:  # noqa: BLE001
            self.get_logger().error(
                "Missing dependency `ultralytics`. Install with: pip install ultralytics. "
                f"Import error: {e}"
            )
            return False

        self._yolo = YOLO(self._model)
        try:
            self._names = list(getattr(self._yolo.model, "names", []))  # type: ignore[attr-defined]
        except Exception:  # noqa: BLE001
            self._names = None
        return True

    def _run_yolo(self, bgr: np.ndarray) -> list[_Det]:
        results = self._yolo.predict(  # type: ignore[union-attr]
            source=bgr,
            conf=self._conf,
            iou=self._iou,
            max_det=self._max_det,
            device=self._device,
            verbose=False,
        )
        if not results:
            return []

        r0 = results[0]
        if r0.boxes is None or len(r0.boxes) == 0:
            return []

        xyxy = r0.boxes.xyxy.cpu().numpy()
        cls = r0.boxes.cls.cpu().numpy().astype(np.int32)
        conf = r0.boxes.conf.cpu().numpy()

        out: list[_Det] = []
        for (x1, y1, x2, y2), c, s in zip(xyxy, cls, conf):
            out.append(_Det(float(x1), float(y1), float(x2), float(y2), int(c), float(s)))
        return out

    def _on_image(self, msg: Image) -> None:
        if not self._ensure_model():
            return

        bgr = self._bridge.imgmsg_to_cv2(msg, desired_encoding="bgr8")
        dets = self._run_yolo(bgr)

        boxes = [(d.x1, d.y1, d.x2, d.y2) for d in dets]
        class_ids = [d.cls for d in dets]
        scores = [d.score for d in dets]
        det_msg = make_detection_array(msg.header.stamp, msg.header.frame_id, boxes, class_ids, scores, self._names)
        self._pub_det.publish(det_msg)

        overlay = bgr.copy()
        for d in dets:
            cv2.rectangle(
                overlay,
                (int(round(d.x1)), int(round(d.y1))),
                (int(round(d.x2)), int(round(d.y2))),
                (0, 255, 0),
                2,
            )
            label = f"{d.cls}:{d.score:.2f}"
            if self._names and 0 <= d.cls < len(self._names):
                label = f"{self._names[d.cls]}:{d.score:.2f}"
            cv2.putText(
                overlay,
                label,
                (int(round(d.x1)), max(0, int(round(d.y1)) - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                1,
                cv2.LINE_AA,
            )

        out = self._bridge.cv2_to_imgmsg(overlay, encoding="bgr8")
        out.header = msg.header
        self._pub_img.publish(out)


def main() -> None:
    rclpy.init()
    node = YoloPerceptionNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
