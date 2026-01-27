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

from .vision_msgs_utils import best_class_id, best_score, detection_to_xyxy, make_detection_array


@dataclass(frozen=True)
class _TrackDet:
    x1: float
    y1: float
    x2: float
    y2: float
    track_id: int
    class_id: int
    score: float


class DeepSortTrackerNode(Node):
    """
    DeepSORT tracker node (via `deep_sort_realtime`).
    Subscribes:
      - `image_topic` (sensor_msgs/Image)
      - `detections_topic` (vision_msgs/Detection2DArray) - typically from YOLO/Faster R-CNN node
    Publishes:
      - `tracks_topic` (vision_msgs/Detection2DArray) with `det.id` set to the track id (string)
      - `overlay_topic` (sensor_msgs/Image) overlay with tracked boxes + ids
    """

    def __init__(self) -> None:
        super().__init__("deepsort_tracker_node")

        self._image_topic = self.declare_parameter("image_topic", "/image_raw").value
        self._detections_topic = self.declare_parameter("detections_topic", "/detections").value
        self._tracks_topic = self.declare_parameter("tracks_topic", "/tracks").value
        self._overlay_topic = self.declare_parameter("overlay_topic", "/tracks/image").value

        self._min_score = float(self.declare_parameter("min_score", 0.25).value)
        self._max_age = int(self.declare_parameter("max_age", 30).value)
        self._n_init = int(self.declare_parameter("n_init", 3).value)
        self._max_iou_distance = float(self.declare_parameter("max_iou_distance", 0.7).value)

        self._bridge = CvBridge()
        self._pub_tracks = self.create_publisher(Detection2DArray, self._tracks_topic, 10)
        self._pub_img = self.create_publisher(Image, self._overlay_topic, 10)

        self._last_image: Optional[tuple] = None  # (stamp, frame_id, bgr)
        self._last_dets: Optional[Detection2DArray] = None

        self._sub_img = self.create_subscription(
            Image, self._image_topic, self._on_image, qos_profile=qos_profile_sensor_data
        )
        self._sub_det = self.create_subscription(
            Detection2DArray, self._detections_topic, self._on_dets, qos_profile=qos_profile_sensor_data
        )

        self._tracker = None
        self.get_logger().info(
            f"DeepSORT: ({self._image_topic} + {self._detections_topic}) -> {self._tracks_topic} and {self._overlay_topic}"
        )

    def _ensure_tracker(self) -> bool:
        if self._tracker is not None:
            return True
        try:
            from deep_sort_realtime.deepsort_tracker import DeepSort  # type: ignore
        except Exception as e:  # noqa: BLE001
            self.get_logger().error(
                "Missing dependency `deep_sort_realtime`. Install with: pip install deep-sort-realtime. "
                f"Import error: {e}"
            )
            return False

        self._tracker = DeepSort(
            max_age=self._max_age,
            n_init=self._n_init,
            max_iou_distance=self._max_iou_distance,
        )
        return True

    def _maybe_process(self) -> None:
        if self._last_image is None or self._last_dets is None:
            return
        if not self._ensure_tracker():
            return

        stamp, frame_id, bgr = self._last_image
        dets = self._last_dets

        detections = []
        class_ids = []
        scores = []
        for det in dets.detections:
            score = best_score(det)
            if score < self._min_score:
                continue
            x1, y1, x2, y2 = detection_to_xyxy(det)
            w = max(0.0, x2 - x1)
            h = max(0.0, y2 - y1)
            detections.append(([float(x1), float(y1), float(w), float(h)], float(score), best_class_id(det)))
            try:
                class_ids.append(int(best_class_id(det)))
            except ValueError:
                class_ids.append(0)
            scores.append(float(score))

        tracks = self._tracker.update_tracks(detections, frame=bgr)  # type: ignore[union-attr]
        track_dets: list[_TrackDet] = []
        for t in tracks:
            if not t.is_confirmed():
                continue
            ltrb = t.to_ltrb()
            if ltrb is None:
                continue
            x1, y1, x2, y2 = [float(v) for v in ltrb]
            track_id = int(t.track_id)
            det_class = getattr(t, "det_class", None)
            try:
                class_id = int(det_class) if det_class is not None else 0
            except ValueError:
                class_id = 0
            track_dets.append(_TrackDet(x1=x1, y1=y1, x2=x2, y2=y2, track_id=track_id, class_id=class_id, score=1.0))

        out_boxes = [(d.x1, d.y1, d.x2, d.y2) for d in track_dets]
        out_cls = [d.class_id for d in track_dets]
        out_scores = [d.score for d in track_dets]
        out_msg = make_detection_array(stamp, frame_id, out_boxes, out_cls, out_scores, class_names=None)
        for det_msg, td in zip(out_msg.detections, track_dets):
            if hasattr(det_msg, "id"):
                det_msg.id = str(td.track_id)
        self._pub_tracks.publish(out_msg)

        overlay = bgr.copy()
        for td in track_dets:
            cv2.rectangle(
                overlay,
                (int(round(td.x1)), int(round(td.y1))),
                (int(round(td.x2)), int(round(td.y2))),
                (0, 255, 255),
                2,
            )
            cv2.putText(
                overlay,
                f"id={td.track_id}",
                (int(round(td.x1)), max(0, int(round(td.y1)) - 5)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 255),
                2,
                cv2.LINE_AA,
            )

        out_img = self._bridge.cv2_to_imgmsg(overlay, encoding="bgr8")
        out_img.header.stamp = stamp
        out_img.header.frame_id = frame_id
        self._pub_img.publish(out_img)

    def _on_image(self, msg: Image) -> None:
        bgr = self._bridge.imgmsg_to_cv2(msg, desired_encoding="bgr8")
        self._last_image = (msg.header.stamp, msg.header.frame_id, bgr)
        self._maybe_process()

    def _on_dets(self, msg: Detection2DArray) -> None:
        self._last_dets = msg
        self._maybe_process()


def main() -> None:
    rclpy.init()
    node = DeepSortTrackerNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
