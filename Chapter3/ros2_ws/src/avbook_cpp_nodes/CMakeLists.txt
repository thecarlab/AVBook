cmake_minimum_required(VERSION 3.8)
project(avbook_cpp_nodes)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(message_filters REQUIRED)
find_package(sensor_msgs REQUIRED)

find_package(pcl_conversions REQUIRED)
find_package(PCL REQUIRED COMPONENTS filters)

find_package(cv_bridge REQUIRED)
find_package(OpenCV REQUIRED)

add_executable(sensor_fusion_node src/sensor_fusion_node.cpp)
ament_target_dependencies(sensor_fusion_node
  rclcpp
  message_filters
  sensor_msgs
  pcl_conversions
  cv_bridge
)
target_include_directories(sensor_fusion_node PRIVATE ${PCL_INCLUDE_DIRS})
target_link_libraries(sensor_fusion_node ${PCL_LIBRARIES} ${OpenCV_LIBRARIES})

add_executable(voxel_grid_filter_node src/voxel_grid_filter_node.cpp)
ament_target_dependencies(voxel_grid_filter_node
  rclcpp
  sensor_msgs
  pcl_conversions
)
target_include_directories(voxel_grid_filter_node PRIVATE ${PCL_INCLUDE_DIRS})
target_link_libraries(voxel_grid_filter_node ${PCL_LIBRARIES})

add_executable(sobel_filter_node src/sobel_filter_node.cpp)
ament_target_dependencies(sobel_filter_node
  rclcpp
  sensor_msgs
  cv_bridge
)
target_link_libraries(sobel_filter_node ${OpenCV_LIBRARIES})

install(TARGETS
  sensor_fusion_node
  voxel_grid_filter_node
  sobel_filter_node
  DESTINATION lib/${PROJECT_NAME}
)

ament_package()
