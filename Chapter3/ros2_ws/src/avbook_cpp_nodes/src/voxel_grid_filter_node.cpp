#include <functional>
#include <string>

#include <pcl/filters/voxel_grid.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl_conversions/pcl_conversions.h>
#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/point_cloud2.hpp>

class VoxelGridFilterNode final : public rclcpp::Node
{
public:
  VoxelGridFilterNode() : rclcpp::Node("voxel_grid_filter_node")
  {
    input_topic_ = this->declare_parameter<std::string>("input_topic", "/points_raw");
    output_topic_ = this->declare_parameter<std::string>("output_topic", "/points_voxel");
    leaf_size_ = this->declare_parameter<double>("leaf_size", 0.2);
    if (leaf_size_ <= 0.0) {
      RCLCPP_WARN(this->get_logger(), "leaf_size <= 0; using 0.2");
      leaf_size_ = 0.2;
    }

    pub_ = this->create_publisher<sensor_msgs::msg::PointCloud2>(output_topic_, rclcpp::QoS(10));
    sub_ = this->create_subscription<sensor_msgs::msg::PointCloud2>(
      input_topic_, rclcpp::QoS(10),
      std::bind(&VoxelGridFilterNode::on_cloud, this, std::placeholders::_1));

    RCLCPP_INFO(
      this->get_logger(),
      "VoxelGrid %s -> %s (leaf_size=%.3f m)",
      input_topic_.c_str(),
      output_topic_.c_str(),
      leaf_size_);
  }

private:
  void on_cloud(const sensor_msgs::msg::PointCloud2::ConstSharedPtr msg)
  {
    pcl::PointCloud<pcl::PointXYZ> cloud_in;
    pcl::fromROSMsg(*msg, cloud_in);
    if (cloud_in.empty()) {
      return;
    }

    pcl::VoxelGrid<pcl::PointXYZ> voxel;
    voxel.setInputCloud(cloud_in.makeShared());
    voxel.setLeafSize(
      static_cast<float>(leaf_size_),
      static_cast<float>(leaf_size_),
      static_cast<float>(leaf_size_));

    pcl::PointCloud<pcl::PointXYZ> cloud_out;
    voxel.filter(cloud_out);

    sensor_msgs::msg::PointCloud2 out_msg;
    pcl::toROSMsg(cloud_out, out_msg);
    out_msg.header = msg->header;
    pub_->publish(out_msg);
  }

  std::string input_topic_;
  std::string output_topic_;
  double leaf_size_{0.2};

  rclcpp::Subscription<sensor_msgs::msg::PointCloud2>::SharedPtr sub_;
  rclcpp::Publisher<sensor_msgs::msg::PointCloud2>::SharedPtr pub_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<VoxelGridFilterNode>());
  rclcpp::shutdown();
  return 0;
}
