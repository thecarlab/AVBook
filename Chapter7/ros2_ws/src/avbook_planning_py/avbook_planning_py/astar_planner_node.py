from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional, Tuple

import numpy as np
import rclpy
from geometry_msgs.msg import PoseStamped
from nav_msgs.msg import OccupancyGrid, Path
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data

from .astar_core import AStarConfig, astar_path


@dataclass
class _MapCache:
    msg: OccupancyGrid
    occ: np.ndarray  # HxW


def _world_to_grid(map_msg: OccupancyGrid, x: float, y: float) -> Optional[Tuple[int, int]]:
    res = float(map_msg.info.resolution)
    ox = float(map_msg.info.origin.position.x)
    oy = float(map_msg.info.origin.position.y)
    if res <= 0.0:
        return None
    gx = int(np.floor((x - ox) / res))
    gy = int(np.floor((y - oy) / res))
    if gx < 0 or gy < 0 or gx >= int(map_msg.info.width) or gy >= int(map_msg.info.height):
        return None
    return gx, gy


def _grid_to_world(map_msg: OccupancyGrid, gx: int, gy: int) -> Tuple[float, float]:
    res = float(map_msg.info.resolution)
    ox = float(map_msg.info.origin.position.x)
    oy = float(map_msg.info.origin.position.y)
    x = ox + (gx + 0.5) * res
    y = oy + (gy + 0.5) * res
    return x, y


class AStarPlannerNode(Node):
    """
    A* planner on nav_msgs/OccupancyGrid.

    Subscribes:
      - map_topic (nav_msgs/OccupancyGrid)
      - start_topic (geometry_msgs/PoseStamped)
      - goal_topic (geometry_msgs/PoseStamped)

    Publishes:
      - path_topic (nav_msgs/Path)
    """

    def __init__(self) -> None:
        super().__init__("astar_planner_node")

        self._map_topic = self.declare_parameter("map_topic", "/map").value
        self._start_topic = self.declare_parameter("start_topic", "/start").value
        self._goal_topic = self.declare_parameter("goal_topic", "/goal").value
        self._path_topic = self.declare_parameter("path_topic", "/path").value

        self._allow_diagonal = bool(self.declare_parameter("allow_diagonal", True).value)
        self._occupied_threshold = int(self.declare_parameter("occupied_threshold", 50).value)
        self._treat_unknown_as_obstacle = bool(self.declare_parameter("treat_unknown_as_obstacle", True).value)

        self._replan_on_map = bool(self.declare_parameter("replan_on_map", True).value)
        self._replan_on_start = bool(self.declare_parameter("replan_on_start", True).value)
        self._replan_on_goal = bool(self.declare_parameter("replan_on_goal", True).value)

        self._pub = self.create_publisher(Path, self._path_topic, 10)
        self._sub_map = self.create_subscription(
            OccupancyGrid, self._map_topic, self._on_map, qos_profile_sensor_data
        )
        self._sub_start = self.create_subscription(PoseStamped, self._start_topic, self._on_start, 10)
        self._sub_goal = self.create_subscription(PoseStamped, self._goal_topic, self._on_goal, 10)

        self._map: Optional[_MapCache] = None
        self._start: Optional[PoseStamped] = None
        self._goal: Optional[PoseStamped] = None

        self.get_logger().info(
            f"A*: map={self._map_topic}, start={self._start_topic}, goal={self._goal_topic} -> {self._path_topic}"
        )

    def _cfg(self) -> AStarConfig:
        return AStarConfig(
            allow_diagonal=self._allow_diagonal,
            occupied_threshold=self._occupied_threshold,
            treat_unknown_as_obstacle=self._treat_unknown_as_obstacle,
        )

    def _maybe_plan(self, reason: str) -> None:
        if self._map is None or self._start is None or self._goal is None:
            return

        map_msg = self._map.msg
        if self._start.header.frame_id and self._start.header.frame_id != map_msg.header.frame_id:
            self.get_logger().warn(
                f"start.frame_id='{self._start.header.frame_id}' != map.frame_id='{map_msg.header.frame_id}' "
                " (no TF in this example; assuming same frame)"
            )
        if self._goal.header.frame_id and self._goal.header.frame_id != map_msg.header.frame_id:
            self.get_logger().warn(
                f"goal.frame_id='{self._goal.header.frame_id}' != map.frame_id='{map_msg.header.frame_id}' "
                " (no TF in this example; assuming same frame)"
            )

        s_xy = _world_to_grid(map_msg, self._start.pose.position.x, self._start.pose.position.y)
        g_xy = _world_to_grid(map_msg, self._goal.pose.position.x, self._goal.pose.position.y)
        if s_xy is None or g_xy is None:
            self.get_logger().warn("Start/goal out of map bounds; cannot plan.")
            return

        t0 = time.time()
        path_cells = astar_path(self._map.occ, s_xy, g_xy, self._cfg())
        dt_ms = (time.time() - t0) * 1000.0

        if path_cells is None:
            self.get_logger().warn(f"No path found ({reason}); dt={dt_ms:.1f}ms")
            return

        path = Path()
        path.header.stamp = map_msg.header.stamp
        path.header.frame_id = map_msg.header.frame_id

        for gx, gy in path_cells:
            x, y = _grid_to_world(map_msg, gx, gy)
            ps = PoseStamped()
            ps.header = path.header
            ps.pose.position.x = float(x)
            ps.pose.position.y = float(y)
            ps.pose.position.z = 0.0
            ps.pose.orientation.w = 1.0
            path.poses.append(ps)

        self._pub.publish(path)
        self.get_logger().info(f"Published path: {len(path.poses)} poses ({reason}); dt={dt_ms:.1f}ms")

    def _on_map(self, msg: OccupancyGrid) -> None:
        w = int(msg.info.width)
        h = int(msg.info.height)
        if w <= 0 or h <= 0 or len(msg.data) != w * h:
            self.get_logger().warn("Invalid OccupancyGrid.")
            return
        occ = np.array(msg.data, dtype=np.int16).reshape(h, w)
        self._map = _MapCache(msg=msg, occ=occ)
        if self._replan_on_map:
            self._maybe_plan("map")

    def _on_start(self, msg: PoseStamped) -> None:
        self._start = msg
        if self._replan_on_start:
            self._maybe_plan("start")

    def _on_goal(self, msg: PoseStamped) -> None:
        self._goal = msg
        if self._replan_on_goal:
            self._maybe_plan("goal")


def main() -> None:
    rclpy.init()
    node = AStarPlannerNode()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
