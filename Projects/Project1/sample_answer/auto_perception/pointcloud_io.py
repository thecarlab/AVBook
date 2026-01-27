import numpy as np
from sensor_msgs.msg import PointCloud2, PointField

def parse_pointcloud_fast(msg: PointCloud2) -> np.ndarray:
    """Return Nx3 float32 (x,y,z). Tries fast paths, falls back to generic."""
    field_names = [f.name for f in msg.fields]

    # Common 16-byte point layout: x,y,z,intensity (4x float32)
    if msg.point_step == 16 and {'x','y','z','intensity'}.issubset(field_names):
        pc = np.frombuffer(msg.data, dtype=np.float32)
        if pc.size % 4 == 0:
            pc = pc.reshape(-1, 4)
            return pc[:, :3].astype(np.float32)

    # Another frequent layout: 32-byte with x,y,z somewhere
    if 'x' in field_names and 'y' in field_names and 'z' in field_names and (msg.point_step % 4 == 0):
        # Interpret as float32 blocks
        floats_per_point = msg.point_step // 4
        pc = np.frombuffer(msg.data, dtype=np.float32)
        if pc.size % floats_per_point == 0:
            pc = pc.reshape(-1, floats_per_point)
            xi = field_names.index('x')
            yi = field_names.index('y')
            zi = field_names.index('z')
            return pc[:, [xi, yi, zi]].astype(np.float32)

    # Generic field-based fallback
    dtype_list = []
    offset_map = {}
    for f in msg.fields:
        if f.datatype == PointField.FLOAT32:
            dtype_list.append((f.name, np.float32))
        elif f.datatype == PointField.FLOAT64:
            dtype_list.append((f.name, np.float64))
        elif f.datatype == PointField.INT32:
            dtype_list.append((f.name, np.int32))
        elif f.datatype == PointField.UINT32:
            dtype_list.append((f.name, np.uint32))
        elif f.datatype == PointField.INT16:
            dtype_list.append((f.name, np.int16))
        elif f.datatype == PointField.UINT16:
            dtype_list.append((f.name, np.uint16))
        elif f.datatype == PointField.INT8:
            dtype_list.append((f.name, np.int8))
        elif f.datatype == PointField.UINT8:
            dtype_list.append((f.name, np.uint8))
        else:
            dtype_list.append((f.name, np.float32))
        offset_map[f.name] = f.offset

    # If we can map the raw bytes directly using point_step blocks, do it
    if msg.point_step and len(msg.data) % msg.point_step == 0:
        npts = len(msg.data) // msg.point_step
        # Build a structured dtype with offsets aligned to point_step
        # We allocate a contiguous buffer and fill fields slice-by-slice
        pts = np.empty((npts, 3), dtype=np.float32)
        view = memoryview(msg.data)
        for i in range(npts):
            base = i * msg.point_step
            # Extract x,y,z as float32 directly by offsets
            x = np.frombuffer(view[base + offset_map.get('x', 0): base + offset_map.get('x', 0) + 4],
                              dtype=np.float32, count=1)
            y = np.frombuffer(view[base + offset_map.get('y', 4): base + offset_map.get('y', 4) + 4],
                              dtype=np.float32, count=1)
            z = np.frombuffer(view[base + offset_map.get('z', 8): base + offset_map.get('z', 8) + 4],
                              dtype=np.float32, count=1)
            pts[i, 0] = x[0] if x.size else 0.0
            pts[i, 1] = y[0] if y.size else 0.0
            pts[i, 2] = z[0] if z.size else 0.0
        return pts

    # Ultimate fallback: return empty
    return np.empty((0, 3), dtype=np.float32)
