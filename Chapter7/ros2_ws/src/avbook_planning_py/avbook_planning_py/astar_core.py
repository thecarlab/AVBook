from __future__ import annotations

import heapq
import math
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

import numpy as np

GridIndex = Tuple[int, int]  # (x, y)


@dataclass(frozen=True)
class AStarConfig:
    allow_diagonal: bool = True
    occupied_threshold: int = 50
    treat_unknown_as_obstacle: bool = True


def _heuristic(a: GridIndex, b: GridIndex, diagonal: bool) -> float:
    dx = abs(a[0] - b[0])
    dy = abs(a[1] - b[1])
    if diagonal:
        # Octile distance (consistent with 8-connected grid).
        d1 = 1.0
        d2 = math.sqrt(2.0)
        return d1 * (dx + dy) + (d2 - 2.0 * d1) * min(dx, dy)
    return float(dx + dy)


def _neighbors(x: int, y: int, w: int, h: int, diagonal: bool) -> Iterable[Tuple[int, int, float]]:
    steps = [(-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0)]
    if diagonal:
        d = math.sqrt(2.0)
        steps += [(-1, -1, d), (-1, 1, d), (1, -1, d), (1, 1, d)]
    for dx, dy, cost in steps:
        nx = x + dx
        ny = y + dy
        if 0 <= nx < w and 0 <= ny < h:
            yield nx, ny, cost


def _is_free(occ_value: int, cfg: AStarConfig) -> bool:
    if occ_value < 0:
        return not cfg.treat_unknown_as_obstacle
    return occ_value < cfg.occupied_threshold


def astar_path(
    occ_grid: np.ndarray,
    start: GridIndex,
    goal: GridIndex,
    cfg: AStarConfig,
) -> Optional[List[GridIndex]]:
    """
    occ_grid: HxW int8/int16 occupancy values in [-1..100] (ROS OccupancyGrid semantics).
    Returns a list of (x,y) from start..goal inclusive, or None if no path.
    """
    h, w = int(occ_grid.shape[0]), int(occ_grid.shape[1])
    sx, sy = start
    gx, gy = goal
    if not (0 <= sx < w and 0 <= sy < h and 0 <= gx < w and 0 <= gy < h):
        return None
    if not _is_free(int(occ_grid[sy, sx]), cfg) or not _is_free(int(occ_grid[gy, gx]), cfg):
        return None

    open_heap: List[Tuple[float, GridIndex]] = []
    heapq.heappush(open_heap, (0.0, (sx, sy)))

    came_from: Dict[GridIndex, GridIndex] = {}
    g_score: Dict[GridIndex, float] = {(sx, sy): 0.0}
    closed = set()

    while open_heap:
        _, current = heapq.heappop(open_heap)
        if current in closed:
            continue
        if current == (gx, gy):
            # Reconstruct path.
            path: List[GridIndex] = [current]
            while path[-1] != (sx, sy):
                path.append(came_from[path[-1]])
            path.reverse()
            return path

        closed.add(current)
        cx, cy = current
        current_g = g_score[current]

        for nx, ny, step_cost in _neighbors(cx, cy, w, h, cfg.allow_diagonal):
            if (nx, ny) in closed:
                continue
            if not _is_free(int(occ_grid[ny, nx]), cfg):
                continue

            tentative_g = current_g + step_cost
            prev_g = g_score.get((nx, ny))
            if prev_g is None or tentative_g < prev_g:
                came_from[(nx, ny)] = current
                g_score[(nx, ny)] = tentative_g
                f = tentative_g + _heuristic((nx, ny), (gx, gy), cfg.allow_diagonal)
                heapq.heappush(open_heap, (f, (nx, ny)))

    return None

