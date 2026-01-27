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


class FasterRcnnNode(Node):
    """
    ROS 2 node that runs Faster R-CNN from `torchvision` on incoming images.
    Publishes:
      - detections_topic (vision_msgs/Detection2DArray)
      - overlay_topic (sensor_msgs/Image)
    """

    def __init__(self) -> None:
        super().__init__("faster_rcnn_node")

        self._image_topic = self.declare_parameter("image_topic", "/image_raw").value
        self._detections_topic = self.declare_parameter("detections_topic", "/detections_frcnn").value
        self._overlay_topic = self.declare_parameter("overlay_topic", "/detections_frcnn/image").value

        self._score_thresh = float(self.declare_parameter("score_thresh", 0.5).value)
        self._max_det = int(self.declare_parameter("max_det", 200).value)
        self._device = str(self.declare_parameter("device", "cpu").value)

        self._bridge = CvBridge()
        self._pub_det = self.create_publisher(Detection2DArray, self._detections_topic, 10)
        self._pub_img = self.create_publisher(Image, self._overlay_topic, 10)
        self._sub = self.create_subscription(
            Image, self._image_topic, self._on_image, qos_profile=qos_profile_sensor_data
        )

        self._torch = None
        self._model = None

        self.get_logger().info(
            f"Faster R-CNN: {self._image_topic} -> {self._detections_topic} and {self._overlay_topic}"
        )

    def _ensure_model(self) -> bool:
        if self._model is not None:
            return True
        try:
            import torch  # type: ignore
            import torchvision  # type: ignore
            from torchvision.models.detection import (  # type: ignore
                FasterRCNN_ResNet50_FPN_V2_Weights,
                fasterrcnn_resnet50_fpn_v2,
            )
        except Exception as e:  # noqa: BLE001
            self.get_logger().error(
                "Missing dependencies `torch`/`torchvision`. Install with pip, e.g.: "
                "pip install torch torchvision. "
                f"Import error: {e}"
            )
            return False

        self._torch = torch
        device = torch.device(self._device)

        weights = FasterRCNN_ResNet50_FPN_V2_Weights.DEFAULT
        model = fasterrcnn_resnet50_fpn_v2(weights=weights)
        model.eval()
        model.to(device)

        self._model = model
        self._preprocess = weights.transforms()
        self._class_names = weights.meta.get("categories", None)
        return True

    def _infer(self, bgr: np.ndarray) -> list[_Det]:
        torch = self._torch
        device = torch.device(self._device)

        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        img_t = torch.from_numpy(rgb).to(torch.uint8)
        img_t = img_t.permute(2, 0, 1)  # CHW
        img_t = self._preprocess(img_t).to(device)  # type: ignore[operator]

        with torch.no_grad():
            out = self._model([img_t])[0]  # type: ignore[index, operator]

        boxes = out["boxes"].detach().cpu().numpy()
        scores = out["scores"].detach().cpu().numpy()
        labels = out["labels"].detach().cpu().numpy().astype(np.int32)

        keep = scores >= self._score_thresh
        boxes = boxes[keep]
        scores = scores[keep]
        labels = labels[keep]

        if boxes.shape[0] > self._max_det:
            idx = np.argsort(-scores)[: self._max_det]
            boxes = boxes[idx]
            scores = scores[idx]
            labels = labels[idx]

        dets: list[_Det] = []
        for (x1, y1, x2, y2), c, s in zip(boxes, labels, scores):
            dets.append(_Det(float(x1), float(y1), float(x2), float(y2), int(c), float(s)))
        return dets

    def _on_image(self, msg: Image) -> None:
        if not self._ensure_model():
            return

        bgr = self._bridge.imgmsg_to_cv2(msg, desired_encoding="bgr8")
        dets = self._infer(bgr)

        boxes = [(d.x1, d.y1, d.x2, d.y2) for d in dets]
        class_ids = [d.cls for d in dets]
        scores = [d.score for d in dets]
        names = self._class_names if isinstance(self._class_names, list) else None
        det_msg = make_detection_array(msg.header.stamp, msg.header.frame_id, boxes, class_ids, scores, names)
        self._pub_det.publish(det_msg)

        overlay = bgr.copy()
        for d in dets:
            cv2.rectangle(
                overlay,
                (int(round(d.x1)), int(round(d.y1))),
                (int(round(d.x2)), int(round(d.y2))),
                (255, 0, 0),
                2,
            )
            label = f"{d.cls}:{d.score:.2f}"
            if names and 0 <= d.cls < len(names):
                label = f"{names[d.cls]}:{d.score:.2f}"
            cv2.putText(
                overlay,
                label,
                (int(round(d.x1)), max(0, int(round(d.y1)) - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 0, 0),
                1,
                cv2.LINE_AA,
            )

        out = self._bridge.cv2_to_imgmsg(overlay, encoding="bgr8")
        out.header = msg.header
        self._pub_img.publish(out)


def main() -> None:
    rclpy.init()
    node = FasterRcnnNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
