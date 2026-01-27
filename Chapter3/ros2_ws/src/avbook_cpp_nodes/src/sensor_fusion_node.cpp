#include <algorithm>
#include <array>
#include <cmath>
#include <string>
#include <vector>

#include <message_filters/subscriber.h>
#include <message_filters/sync_policies/approximate_time.h>
#include <message_filters/synchronizer.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl_conversions/pcl_conversions.h>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/image.hpp>
#include <sensor_msgs/msg/point_cloud2.hpp>

#include <cv_bridge/cv_bridge.h>
#include <opencv2/imgproc.hpp>

class CameraLidarFusionNode final : public rclcpp::Node
{
public:
  CameraLidarFusionNode() : rclcpp::Node("sensor_fusion_node"), sync_(SyncPolicy(10), image_sub_, cloud_sub_)
  {
    image_topic_ = this->declare_parameter<std::string>("image_topic", "/image_raw");
    cloud_topic_ = this->declare_parameter<std::string>("cloud_topic", "/points_raw");
    output_topic_ = this->declare_parameter<std::string>("output_topic", "/fusion/image");

    fx_ = this->declare_parameter<double>("fx", 600.0);
    fy_ = this->declare_parameter<double>("fy", 600.0);
    cx_ = this->declare_parameter<double>("cx", 320.0);
    cy_ = this->declare_parameter<double>("cy", 240.0);

    const auto r_list = this->declare_parameter<std::vector<double>>(
      "R",
      std::vector<double>{1, 0, 0,
                          0, 1, 0,
                          0, 0, 1});
    const auto t_list = this->declare_parameter<std::vector<double>>("t", std::vector<double>{0, 0, 0});
    if (r_list.size() != 9 || t_list.size() != 3) {
      throw std::runtime_error("Parameters R must have 9 elements and t must have 3 elements.");
    }

    R_ = {r_list[0], r_list[1], r_list[2],
          r_list[3], r_list[4], r_list[5],
          r_list[6], r_list[7], r_list[8]};
    t_ = {t_list[0], t_list[1], t_list[2]};

    point_radius_px_ = this->declare_parameter<int>("point_radius_px", 2);
    max_points_ = this->declare_parameter<int>("max_points", 50000);
    min_z_m_ = this->declare_parameter<double>("min_z_m", 0.1);
    max_z_m_ = this->declare_parameter<double>("max_z_m", 80.0);

    fused_pub_ = this->create_publisher<sensor_msgs::msg::Image>(output_topic_, rclcpp::QoS(10));

    image_sub_.subscribe(this, image_topic_, rmw_qos_profile_sensor_data);
    cloud_sub_.subscribe(this, cloud_topic_, rmw_qos_profile_sensor_data);
    sync_.registerCallback(&CameraLidarFusionNode::on_sync, this);

    RCLCPP_INFO(
      this->get_logger(),
      "Fusing Image(%s) + Cloud(%s) -> %s",
      image_topic_.c_str(),
      cloud_topic_.c_str(),
      output_topic_.c_str());
  }

private:
  using SyncPolicy = message_filters::sync_policies::ApproximateTime<
    sensor_msgs::msg::Image,
    sensor_msgs::msg::PointCloud2>;

  static std::array<double, 3> transform_point(
    const std::array<double, 9> & R,
    const std::array<double, 3> & t,
    double x, double y, double z)
  {
    return {
      R[0] * x + R[1] * y + R[2] * z + t[0],
      R[3] * x + R[4] * y + R[5] * z + t[1],
      R[6] * x + R[7] * y + R[8] * z + t[2],
    };
  }

  void on_sync(
    const sensor_msgs::msg::Image::ConstSharedPtr & image_msg,
    const sensor_msgs::msg::PointCloud2::ConstSharedPtr & cloud_msg)
  {
    cv_bridge::CvImageConstPtr cv_ptr;
    try {
      cv_ptr = cv_bridge::toCvShare(image_msg);
    } catch (const cv_bridge::Exception & e) {
      RCLCPP_WARN(this->get_logger(), "cv_bridge failed: %s", e.what());
      return;
    }

    cv::Mat bgr;
    if (cv_ptr->image.channels() == 3) {
      bgr = cv_ptr->image.clone();
    } else if (cv_ptr->image.channels() == 1) {
      cv::cvtColor(cv_ptr->image, bgr, cv::COLOR_GRAY2BGR);
    } else {
      RCLCPP_WARN(this->get_logger(), "Unsupported image channels: %d", cv_ptr->image.channels());
      return;
    }

    pcl::PointCloud<pcl::PointXYZ> cloud_in;
    pcl::fromROSMsg(*cloud_msg, cloud_in);
    if (cloud_in.empty()) {
      return;
    }

    const int width = bgr.cols;
    const int height = bgr.rows;

    const int total_points = static_cast<int>(cloud_in.size());
    const int step = std::max(1, total_points / std::max(1, max_points_));

    for (int i = 0; i < total_points; i += step) {
      const auto & p = cloud_in.points[static_cast<size_t>(i)];
      const auto cam = transform_point(R_, t_, p.x, p.y, p.z);
      const double X = cam[0];
      const double Y = cam[1];
      const double Z = cam[2];

      if (!(Z > min_z_m_ && Z < max_z_m_)) {
        continue;
      }

      const int u = static_cast<int>(std::lround(fx_ * (X / Z) + cx_));
      const int v = static_cast<int>(std::lround(fy_ * (Y / Z) + cy_));
      if (u < 0 || u >= width || v < 0 || v >= height) {
        continue;
      }

      // Color by depth: near = red, far = blue.
      const double alpha = std::clamp((Z - min_z_m_) / (max_z_m_ - min_z_m_), 0.0, 1.0);
      const auto red = static_cast<int>(std::lround(255.0 * (1.0 - alpha)));
      const auto blue = static_cast<int>(std::lround(255.0 * alpha));
      cv::circle(bgr, cv::Point(u, v), point_radius_px_, cv::Scalar(blue, 0, red), cv::FILLED);
    }

    cv_bridge::CvImage out;
    out.header = image_msg->header;
    out.encoding = "bgr8";
    out.image = bgr;
    fused_pub_->publish(*out.toImageMsg());
  }

  std::string image_topic_;
  std::string cloud_topic_;
  std::string output_topic_;

  double fx_{600.0};
  double fy_{600.0};
  double cx_{320.0};
  double cy_{240.0};

  std::array<double, 9> R_{};
  std::array<double, 3> t_{};

  int point_radius_px_{2};
  int max_points_{50000};
  double min_z_m_{0.1};
  double max_z_m_{80.0};

  message_filters::Subscriber<sensor_msgs::msg::Image> image_sub_;
  message_filters::Subscriber<sensor_msgs::msg::PointCloud2> cloud_sub_;
  message_filters::Synchronizer<SyncPolicy> sync_;

  rclcpp::Publisher<sensor_msgs::msg::Image>::SharedPtr fused_pub_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<CameraLidarFusionNode>());
  rclcpp::shutdown();
  return 0;
}
