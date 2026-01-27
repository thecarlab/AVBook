import cv2
import rclpy
from cv_bridge import CvBridge
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from sensor_msgs.msg import Image


class SobelFilterNode(Node):
    def __init__(self) -> None:
        super().__init__("sobel_filter_node")

        self._input_topic = self.declare_parameter("input_topic", "/image_raw").value
        self._output_topic = self.declare_parameter("output_topic", "/image_sobel").value
        self._ksize = int(self.declare_parameter("ksize", 3).value)
        if self._ksize not in (1, 3, 5, 7):
            self.get_logger().warn("ksize must be 1/3/5/7; using 3")
            self._ksize = 3

        self._bridge = CvBridge()
        self._pub = self.create_publisher(Image, self._output_topic, 10)
        self._sub = self.create_subscription(Image, self._input_topic, self._on_image, 10)

        self.get_logger().info(f"Sobel {self._input_topic} -> {self._output_topic} (ksize={self._ksize})")

    def _on_image(self, msg: Image) -> None:
        img = self._bridge.imgmsg_to_cv2(msg, desired_encoding="passthrough")
        if img.ndim == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        grad_x = cv2.Sobel(gray, cv2.CV_16S, 1, 0, ksize=self._ksize)
        grad_y = cv2.Sobel(gray, cv2.CV_16S, 0, 1, ksize=self._ksize)

        abs_x = cv2.convertScaleAbs(grad_x)
        abs_y = cv2.convertScaleAbs(grad_y)
        edges = cv2.addWeighted(abs_x, 0.5, abs_y, 0.5, 0.0)

        out = self._bridge.cv2_to_imgmsg(edges, encoding="mono8")
        out.header = msg.header
        self._pub.publish(out)


def main() -> None:
    rclpy.init()
    node = SobelFilterNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
