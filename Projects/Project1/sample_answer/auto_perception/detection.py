import numpy as np
import cv2
from ultralytics import YOLO
from .config import TARGET_CLASSES, CLASS_CONFIDENCE_THRESHOLDS, MIN_CONFIDENCE_THRESHOLD, CLASS_COLORS_BGR

class YoloDetector:
    def __init__(self, log, engine_ok=True):
        self.log = log
        self.model = None
        self.target_ids = set()
        self._load_model(engine_ok)

    def _load_model(self, try_trt: bool):
        self.log.info("Loading YOLO11n model...")
        self.model = YOLO("yolo11n.pt")
        # build target class id set
        for idx, name in self.model.names.items():
            if name in TARGET_CLASSES:
                self.target_ids.add(idx)

    def warmup(self, img_bgr):
        _ = self.model(img_bgr, verbose=False)

    def detect(self, img_bgr):
        """Return list of dicts: class, confidence, bbox(x1,y1,x2,y2), color, threshold."""
        results = self.model(img_bgr, verbose=False, conf=MIN_CONFIDENCE_THRESHOLD, iou=0.45)
        out = []
        r0 = results[0]
        if r0.boxes is None or len(r0.boxes) == 0:
            return out
        boxes = r0.boxes
        cls_ids = boxes.cls.cpu().numpy().astype(int)
        confs   = boxes.conf.cpu().numpy()
        bboxes  = boxes.xyxy.cpu().numpy().astype(int)

        for i, cid in enumerate(cls_ids):
            if cid not in self.target_ids:
                continue
            name = self.model.names[cid]
            conf = float(confs[i])
            thr  = CLASS_CONFIDENCE_THRESHOLDS.get(name, MIN_CONFIDENCE_THRESHOLD)
            if conf < thr:
                continue
            x1,y1,x2,y2 = map(int, bboxes[i])
            out.append({
                'class': name,
                'confidence': conf,
                'bbox': (x1,y1,x2,y2),
                'color': CLASS_COLORS_BGR.get(name, (0,255,0)),
                'threshold': thr
            })
        return out
