import math

def quaternion_to_heading(x, y, z, w) -> float:
    siny_cosx = 2.0 * (w * z + x * y)
    cosy_cosx = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosx, cosy_cosx)

def destination_from_bearing_distance(lat_deg, lon_deg, bearing_rad, distance_m):
    R = 6378137.0  # meters
    lat1 = math.radians(float(lat_deg))
    lon1 = math.radians(float(lon_deg))
    dR   = float(distance_m) / R
    lat2 = math.asin(math.sin(lat1) * math.cos(dR) +
                     math.cos(lat1) * math.sin(dR) * math.cos(bearing_rad))
    lon2 = lon1 + math.atan2(math.sin(bearing_rad) * math.sin(dR) * math.cos(lat1),
                             math.cos(dR) - math.sin(lat1) * math.sin(lat2))
    return math.degrees(lat2), math.degrees(lon2)
