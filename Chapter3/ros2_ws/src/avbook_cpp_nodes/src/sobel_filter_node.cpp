#include <functional>
#include <string>

#include <cv_bridge/cv_bridge.h>
#include <opencv2/imgproc.hpp>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/image.hpp>

class SobelFilterNode final : public rclcpp::Node
{
public:
  SobelFilterNode() : rclcpp::Node("sobel_filter_node")
  {
    input_topic_ = this->declare_parameter<std::string>("input_topic", "/image_raw");
    output_topic_ = this->declare_parameter<std::string>("output_topic", "/image_sobel");
    ksize_ = this->declare_parameter<int>("ksize", 3);
    if (ksize_ != 1 && ksize_ != 3 && ksize_ != 5 && ksize_ != 7) {
      RCLCPP_WARN(this->get_logger(), "ksize must be 1/3/5/7; using 3");
      ksize_ = 3;
    }

    pub_ = this->create_publisher<sensor_msgs::msg::Image>(output_topic_, rclcpp::QoS(10));
    sub_ = this->create_subscription<sensor_msgs::msg::Image>(
      input_topic_, rclcpp::QoS(10),
      std::bind(&SobelFilterNode::on_image, this, std::placeholders::_1));

    RCLCPP_INFO(this->get_logger(), "Sobel %s -> %s (ksize=%d)", input_topic_.c_str(), output_topic_.c_str(), ksize_);
  }

private:
  void on_image(const sensor_msgs::msg::Image::ConstSharedPtr msg)
  {
    cv_bridge::CvImageConstPtr cv_ptr;
    try {
      cv_ptr = cv_bridge::toCvShare(msg);
    } catch (const cv_bridge::Exception & e) {
      RCLCPP_WARN(this->get_logger(), "cv_bridge failed: %s", e.what());
      return;
    }

    cv::Mat gray;
    if (cv_ptr->image.channels() == 1) {
      gray = cv_ptr->image;
    } else {
      cv::cvtColor(cv_ptr->image, gray, cv::COLOR_BGR2GRAY);
    }

    cv::Mat grad_x;
    cv::Mat grad_y;
    cv::Sobel(gray, grad_x, CV_16S, 1, 0, ksize_);
    cv::Sobel(gray, grad_y, CV_16S, 0, 1, ksize_);

    cv::Mat abs_x;
    cv::Mat abs_y;
    cv::convertScaleAbs(grad_x, abs_x);
    cv::convertScaleAbs(grad_y, abs_y);

    cv::Mat edges;
    cv::addWeighted(abs_x, 0.5, abs_y, 0.5, 0.0, edges);

    cv_bridge::CvImage out;
    out.header = msg->header;
    out.encoding = "mono8";
    out.image = edges;
    pub_->publish(*out.toImageMsg());
  }

  std::string input_topic_;
  std::string output_topic_;
  int ksize_{3};

  rclcpp::Subscription<sensor_msgs::msg::Image>::SharedPtr sub_;
  rclcpp::Publisher<sensor_msgs::msg::Image>::SharedPtr pub_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<SobelFilterNode>());
  rclcpp::shutdown();
  return 0;
}
