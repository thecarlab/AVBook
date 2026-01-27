from __future__ import annotations

from typing import List, Optional, Sequence, Tuple

from vision_msgs.msg import (
    BoundingBox2D,
    Detection2D,
    Detection2DArray,
    ObjectHypothesisWithPose,
)


def make_detection_array(
    stamp,
    frame_id: str,
    boxes_xyxy: Sequence[Tuple[float, float, float, float]],
    class_ids: Sequence[int],
    scores: Sequence[float],
    class_names: Optional[Sequence[str]] = None,
) -> Detection2DArray:
    msg = Detection2DArray()
    msg.header.stamp = stamp
    msg.header.frame_id = frame_id

    for i, (x1, y1, x2, y2) in enumerate(boxes_xyxy):
        det = Detection2D()
        det.bbox = BoundingBox2D()
        det.bbox.center.x = float((x1 + x2) * 0.5)
        det.bbox.center.y = float((y1 + y2) * 0.5)
        det.bbox.size_x = float(max(0.0, x2 - x1))
        det.bbox.size_y = float(max(0.0, y2 - y1))

        hyp = ObjectHypothesisWithPose()
        hyp.hypothesis.class_id = str(int(class_ids[i]))
        hyp.hypothesis.score = float(scores[i])
        det.results.append(hyp)

        if hasattr(det, "id") and class_names is not None and int(class_ids[i]) < len(class_names):
            det.id = str(class_names[int(class_ids[i])])

        msg.detections.append(det)

    return msg


def detection_to_xyxy(det: Detection2D) -> Tuple[float, float, float, float]:
    cx = float(det.bbox.center.x)
    cy = float(det.bbox.center.y)
    sx = float(det.bbox.size_x)
    sy = float(det.bbox.size_y)
    x1 = cx - sx * 0.5
    y1 = cy - sy * 0.5
    x2 = cx + sx * 0.5
    y2 = cy + sy * 0.5
    return x1, y1, x2, y2


def best_score(det: Detection2D) -> float:
    if not det.results:
        return 0.0
    return float(max(r.hypothesis.score for r in det.results))


def best_class_id(det: Detection2D) -> str:
    if not det.results:
        return ""
    best = max(det.results, key=lambda r: r.hypothesis.score)
    return str(best.hypothesis.class_id)
