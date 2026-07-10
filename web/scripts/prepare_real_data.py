#!/usr/bin/env python3
"""Build small, auditable web snapshots from primary autonomous-driving data.

The checked-in JSON files are intentionally much smaller than their sources.  Run
the individual commands when a source snapshot needs to be refreshed:

  python3 scripts/prepare_real_data.py nhtsa
  python3 scripts/prepare_real_data.py tampa
  python3 scripts/prepare_real_data.py comma --parquet /path/to/demo.parquet
  python3 scripts/prepare_real_data.py comma-video

The comma command needs DuckDB (`python3 -m pip install duckdb`).  It reads one
minute from comma2k19 and never checks the 80 MB source parquet into the repo.
"""

from __future__ import annotations

import argparse
import bisect
import csv
import hashlib
import json
import math
import statistics
import subprocess
import tempfile
import urllib.parse
import urllib.request
from datetime import date, datetime
from pathlib import Path
from typing import Any, Sequence


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data" / "real"
RETRIEVED = date.today().isoformat()

NHTSA_URL = (
    "https://static.nhtsa.gov/odi/ffdd/sgo-2021-01/"
    "SGO-2021-01_Incident_Reports_ADS.csv"
)
TAMPA_URL = "https://data.transportation.gov/resource/nm7w-nvbm.json"
COMMA_URL = (
    "https://huggingface.co/datasets/commaai/comma2k19/blob/main/README.md"
)
COMMA_VIDEO_URL = (
    "https://huggingface.co/datasets/commaai/comma2k19/resolve/main/"
    "compression_challenge/b0c9d2329ad1606b%7C2018-07-27--06-03-57/10/"
    "video.hevc?download=true"
)
ROAD_ZIP = "https://zenodo.org/records/10462796/files/road.zip?download=1"
CASSI_URL = (
    "https://data.townofcary.org/api/v2/catalog/datasets/"
    "cassi-at-unc-charlotte-disengagement/exports/csv"
)


def write_json(name: str, payload: Any) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    path.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":"), allow_nan=False),
        encoding="utf-8",
    )
    print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size:,} bytes)")


def download(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "AVBook data builder"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def clean(value: str | None, fallback: str = "Unknown") -> str:
    result = (value or "").strip()
    return result or fallback


def nhtsa_snapshot() -> None:
    raw = download(NHTSA_URL).decode("utf-8-sig")
    rows = list(csv.DictReader(raw.splitlines()))

    # A report may be updated.  The lab uses the highest available version of
    # each Report ID so a revision is not silently counted as another incident.
    latest: dict[str, dict[str, str]] = {}
    for row in rows:
        report_id = clean(row.get("Report ID"), "")
        try:
            version = int(clean(row.get("Report Version"), "0"))
        except ValueError:
            version = 0
        prior = latest.get(report_id)
        if prior is None or version > int(clean(prior.get("Report Version"), "0")):
            latest[report_id] = row

    records = [
        {
            "id": row["Report ID"],
            "version": int(clean(row.get("Report Version"), "0")),
            "incidentMonth": clean(row.get("Incident Date")),
            "state": clean(row.get("State")),
            "roadway": clean(row.get("Roadway Type")),
            "crashWith": clean(row.get("Crash With")),
            "injury": clean(row.get("Highest Injury Severity Alleged")),
            "movement": clean(row.get("SV Pre-Crash Movement")),
            "engagement": clean(row.get("Engagement Status")),
            "withinOdd": clean(row.get("Within ODD?")),
            "airbag": clean(row.get("Any Air Bags Deployed?")),
            "towed": clean(row.get("Was Any Vehicle Towed?")),
            "telematicsAvailable": clean(row.get("Data Availability - Telematics"), "N") == "Y",
            "videoAvailable": clean(row.get("Data Availability - Video"), "N") == "Y",
        }
        for row in latest.values()
    ]
    records.sort(key=lambda row: (row["incidentMonth"], row["id"]))

    write_json(
        "nhtsa-ads-reports.json",
        {
            "metadata": {
                "title": "NHTSA Standing General Order ADS incident reports",
                "source": NHTSA_URL,
                "sourcePage": "https://www.nhtsa.gov/es/node/103486",
                "retrieved": RETRIEVED,
                "coverage": "Reports received under the third amended SGO through May 15, 2026",
                "rawRows": len(rows),
                "latestReportRows": len(records),
                "transformation": "Kept the highest Report Version per Report ID; removed entities, VINs, coordinates, addresses, narratives, and other direct identifiers.",
                "limitations": [
                    "These are reports meeting SGO criteria, not a census of every automated-driving crash.",
                    "Counts are not normalized by fleet size, miles, operating domain, or reporting access.",
                    "Initial reports can be incomplete or unverified, and reporting requirements differ between ADS and Level 2 ADAS.",
                    "A report count by itself is not a crash rate and cannot establish comparative safety.",
                ],
            },
            "records": records,
        },
    )


def socrata_query(params: dict[str, str]) -> list[dict[str, str]]:
    url = f"{TAMPA_URL}?{urllib.parse.urlencode(params)}"
    return json.loads(download(url))


def maybe_float(value: str | None, unavailable: float | None = None) -> float | None:
    try:
        result = float(value) if value is not None else None
    except ValueError:
        return None
    if result is None or not math.isfinite(result) or result == unavailable:
        return None
    return result


def tampa_snapshot() -> None:
    vehicle_id = "8536100"
    fields = [
        "metadata_recordgeneratedat",
        "metadata_rsuid",
        "coredata_msgcnt",
        "coredata_secmark",
        "coredata_lat",
        "coredata_long",
        "coredata_speed",
        "coredata_heading",
        "coredata_accelset_long",
        "coredata_accuracy_semimajor",
        "coredata_accuracy_semiminor",
    ]
    rows = socrata_query(
        {
            "$select": ",".join(fields),
            "$where": f'coredata_id="{vehicle_id}"',
            "$order": "metadata_recordgeneratedat ASC",
            "$limit": "5000",
        }
    )
    start = datetime.fromisoformat(rows[0]["metadata_recordgeneratedat"])
    records = []
    for row in rows:
        timestamp = datetime.fromisoformat(row["metadata_recordgeneratedat"])
        lat = maybe_float(row.get("coredata_lat"), 900000001)
        lon = maybe_float(row.get("coredata_long"), 1800000001)
        speed = maybe_float(row.get("coredata_speed"), 8191)
        heading = maybe_float(row.get("coredata_heading"), 28800)
        acceleration = maybe_float(row.get("coredata_accelset_long"), 2001)
        if lat is None or lon is None:
            continue
        records.append(
            {
                "t": round((timestamp - start).total_seconds(), 3),
                "timestamp": row["metadata_recordgeneratedat"],
                "rsu": clean(row.get("metadata_rsuid")),
                "msgCount": int(float(row["coredata_msgcnt"])),
                "secMarkMs": int(float(row["coredata_secmark"])),
                "lat": round(lat / 10_000_000, 7),
                "lon": round(lon / 10_000_000, 7),
                "speedMps": None if speed is None else round(speed * 0.02, 3),
                "headingDeg": None if heading is None else round(heading * 0.0125, 3),
                "accelLongMps2": None if acceleration is None else round(acceleration * 0.01, 3),
                "semiMajorM": None if (semi_major := maybe_float(row.get("coredata_accuracy_semimajor"), 255)) is None else round(semi_major * 0.05, 2),
                "semiMinorM": None if (semi_minor := maybe_float(row.get("coredata_accuracy_semiminor"), 255)) is None else round(semi_minor * 0.05, 2),
            }
        )

    intervals = [b["t"] - a["t"] for a, b in zip(records, records[1:]) if b["t"] > a["t"]]
    counter_steps = [
        (b["msgCount"] - a["msgCount"]) % 128
        for a, b in zip(records, records[1:])
    ]
    write_json(
        "tampa-bsm.json",
        {
            "metadata": {
                "title": "Tampa Connected Vehicle Pilot BSM sample",
                "source": "https://data.transportation.gov/Automobiles/Tampa-CV-Pilot-Basic-Safety-Message-BSM-Sample/nm7w-nvbm",
                "api": TAMPA_URL,
                "retrieved": RETRIEVED,
                "license": "CC BY-SA 4.0",
                "publicVehicleId": vehicle_id,
                "rows": len(records),
                "durationSeconds": round(records[-1]["t"], 3),
                "medianCapturedIntervalSeconds": round(statistics.median(intervals), 4),
                "counterDiscontinuities": sum(step != 1 for step in counter_steps),
                "transformation": "Selected one public pseudonymous coreData ID, ordered records by RSU receive time, converted J2735 scaled units, and removed path history and vehicle dimensions.",
                "limitations": [
                    "A discontinuity in the captured message counter is not proof of over-the-air packet loss; sampling, RSU handoff, and export filtering can also create gaps.",
                    "The identifier is pseudonymous in this public sample but remains linkable within the selected trace.",
                    "RSU receive timestamps and BSM secMark describe different clocks and should not be treated as perfectly synchronized.",
                ],
            },
            "records": records,
        },
    )


WGS84_A = 6_378_137.0
WGS84_E2 = 6.69437999014e-3


def ecef_to_geodetic(position: Sequence[float]) -> tuple[float, float, float]:
    x, y, z = position
    longitude = math.atan2(y, x)
    radius = math.hypot(x, y)
    latitude = math.atan2(z, radius * (1 - WGS84_E2))
    for _ in range(8):
        normal = WGS84_A / math.sqrt(1 - WGS84_E2 * math.sin(latitude) ** 2)
        latitude = math.atan2(z + WGS84_E2 * normal * math.sin(latitude), radius)
    normal = WGS84_A / math.sqrt(1 - WGS84_E2 * math.sin(latitude) ** 2)
    altitude = radius / math.cos(latitude) - normal
    return math.degrees(latitude), math.degrees(longitude), altitude


def local_xy(latitude: float, longitude: float, origin: tuple[float, float]) -> tuple[float, float]:
    latitude0, longitude0 = origin
    x = math.radians(longitude - longitude0) * WGS84_A * math.cos(math.radians(latitude0))
    y = math.radians(latitude - latitude0) * WGS84_A
    return x, y


def nearest_index(values: Sequence[float], target: float) -> int:
    index = bisect.bisect_left(values, target)
    candidates = range(max(0, index - 1), min(len(values), index + 2))
    return min(candidates, key=lambda candidate: abs(values[candidate] - target))


def finite_intervals(values: Sequence[float]) -> list[float]:
    return [
        current - previous
        for previous, current in zip(values, values[1:])
        if math.isfinite(previous) and math.isfinite(current) and current > previous
    ]


def percentile(values: Sequence[float], probability: float) -> float:
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, int(probability * len(ordered)))]


def stream_summary(times: Sequence[float]) -> dict[str, float | int]:
    intervals = finite_intervals(times)
    return {
        "samples": len(times),
        "medianRateHz": round(1 / statistics.median(intervals), 2),
        "p95GapMs": round(percentile(intervals, 0.95) * 1000, 2),
        "maxGapMs": round(max(intervals) * 1000, 2),
    }


def sampled_pairs(times: Sequence[float], values: Sequence[Any], step: int, start: float) -> list[list[Any]]:
    result: list[list[Any]] = []
    for index in range(0, min(len(times), len(values)), step):
        value = values[index]
        if isinstance(value, list):
            clean_value = [round(float(item), 5) for item in value]
        else:
            clean_value = round(float(value), 5)
        result.append([round(times[index] - start, 4), clean_value])
    return result


def comma_snapshot(parquet: Path) -> None:
    try:
        import duckdb  # type: ignore
    except ImportError as error:
        raise SystemExit("The comma command needs DuckDB: python3 -m pip install duckdb") from error

    row = duckdb.connect().execute(
        "select segment_id, log from read_parquet(?) limit 1", [str(parquet)]
    ).fetchone()
    segment_id, log = row
    pose_times = log["global_pose__frame_times"]
    pose_geodetic = [ecef_to_geodetic(position) for position in log["global_pose__frame_positions"]]
    origin = (pose_geodetic[0][0], pose_geodetic[0][1])
    start = pose_times[0]

    pose = []
    for index in range(0, len(pose_times), 4):
        latitude, longitude, _ = pose_geodetic[index]
        x, y = local_xy(latitude, longitude, origin)
        velocity = log["global_pose__frame_velocities"][index]
        pose.append(
            [
                round(pose_times[index] - start, 4),
                round(x, 3),
                round(y, 3),
                round(math.sqrt(sum(component * component for component in velocity)), 3),
            ]
        )

    gnss_times = log["processed_log__GNSS__live_gnss_ublox__t"]
    gnss_values = log["processed_log__GNSS__live_gnss_ublox__value"]
    gnss = []
    errors = []
    for time, value in zip(gnss_times, gnss_values):
        latitude, longitude = value[0], value[1]
        x, y = local_xy(latitude, longitude, origin)
        match = nearest_index(pose_times, time)
        fused_x, fused_y = local_xy(pose_geodetic[match][0], pose_geodetic[match][1], origin)
        error = math.hypot(x - fused_x, y - fused_y)
        errors.append(error)
        gnss.append([round(time - start, 4), round(x, 3), round(y, 3), round(error, 3)])

    streams = {
        "fusedPose": stream_summary(pose_times),
        "canSpeed": stream_summary(log["processed_log__CAN__speed__t"]),
        "steering": stream_summary(log["processed_log__CAN__steering_angle__t"]),
        "wheelSpeed": stream_summary(log["processed_log__CAN__wheel_speed__t"]),
        "gnss": stream_summary(gnss_times),
        "accelerometer": stream_summary(log["processed_log__IMU__accelerometer__t"]),
        "gyro": stream_summary(log["processed_log__IMU__gyro__t"]),
    }

    write_json(
        "comma2k19-segment.json",
        {
            "metadata": {
                "title": "comma2k19 one-minute multimodal driving segment",
                "source": COMMA_URL,
                "license": "MIT",
                "retrieved": RETRIEVED,
                "segmentId": segment_id,
                "durationSeconds": round(pose_times[-1] - pose_times[0], 3),
                "videoFrames": 1200,
                "videoFrameRateHz": 20,
                "videoDurationSeconds": 60,
                "transformation": "Read the first demo parquet row; converted fused ECEF pose and u-blox latitude/longitude to a shared local frame; retained sampled CAN, IMU, GNSS, and pose traces.",
                "limitations": [
                    "This is one one-minute highway segment and is not representative of every road, weather condition, vehicle, or driver.",
                    "GNSS-to-fused-pose separation is a diagnostic residual, not surveyed ground-truth error.",
                    "Signal timestamps come from recorded subsystems with different rates and timing paths.",
                ],
                "gnssResidualMedianM": round(statistics.median(errors), 3),
                "gnssResidualP95M": round(percentile(errors, 0.95), 3),
            },
            "streams": streams,
            "pose": pose,
            "gnss": gnss,
            "canSpeed": sampled_pairs(
                log["processed_log__CAN__speed__t"],
                [value[0] for value in log["processed_log__CAN__speed__value"]],
                10,
                start,
            ),
            "steering": sampled_pairs(
                log["processed_log__CAN__steering_angle__t"],
                log["processed_log__CAN__steering_angle__value"],
                10,
                start,
            ),
            "wheelSpeed": sampled_pairs(
                log["processed_log__CAN__wheel_speed__t"],
                log["processed_log__CAN__wheel_speed__value"],
                10,
                start,
            ),
            "accelerometer": sampled_pairs(
                log["processed_log__IMU__accelerometer__t"],
                log["processed_log__IMU__accelerometer__value"],
                12,
                start,
            ),
            "gyro": sampled_pairs(
                log["processed_log__IMU__gyro__t"],
                log["processed_log__IMU__gyro__value"],
                2,
                start,
            ),
        },
    )


def comma_video() -> None:
    output = ROOT / "public" / "data" / "comma2k19" / "segment-10.mp4"
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".hevc") as source:
        source.write(download(COMMA_VIDEO_URL))
        source.flush()
        subprocess.run(
            [
                "ffmpeg", "-y", "-r", "20", "-i", source.name,
                "-vf", "scale=960:-2", "-c:v", "libx264", "-preset", "slow",
                "-crf", "25", "-r", "20", "-movflags", "+faststart", "-an",
                str(output),
            ],
            check=True,
        )
    print(f"wrote {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")


def parse_can_line(line: str) -> tuple[float, str, str] | None:
    try:
        timestamp_text, _, frame = line.split()
        identifier, payload = frame.split("#")
        return float(timestamp_text.strip("()")), identifier, payload
    except (ValueError, IndexError):
        return None


def road_capture(remote_zip: Any, name: str, metadata: dict[str, Any]) -> dict[str, Any]:
    path = f"road/attacks/{name}.log"
    target_id = str(metadata["injection_id"]).removeprefix("0x").upper().zfill(3)
    first_timestamp: float | None = None
    bin_width = 0.5
    bins: dict[int, dict[str, Any]] = {}
    previous_target_payload: str | None = None
    for raw_line in remote_zip.open(path):
        parsed = parse_can_line(raw_line.decode("ascii"))
        if parsed is None:
            continue
        timestamp, identifier, payload = parsed
        if first_timestamp is None:
            first_timestamp = timestamp
        elapsed = timestamp - first_timestamp
        index = int(elapsed / bin_width)
        bucket = bins.setdefault(
            index,
            {"total": 0, "target": 0, "ffByte": 0, "transitions": 0, "payloads": set()},
        )
        bucket["total"] += 1
        if identifier == target_id:
            bucket["target"] += 1
            bucket["payloads"].add(payload)
            if len(payload) >= 12 and payload[10:12] == "FF":
                bucket["ffByte"] += 1
            if previous_target_payload is not None and previous_target_payload != payload:
                bucket["transitions"] += 1
            previous_target_payload = payload

    windows = [
        [
            round(index * bin_width, 1),
            bucket["total"],
            bucket["target"],
            bucket["ffByte"],
            bucket["transitions"],
            len(bucket["payloads"]),
        ]
        for index, bucket in sorted(bins.items())
    ]
    return {
        "id": name,
        "modifiedMasquerade": metadata["modified"],
        "description": metadata["description"],
        "durationSeconds": metadata["elapsed_sec"],
        "attackInterval": metadata["injection_interval"],
        "targetId": metadata["injection_id"],
        "targetPattern": metadata["injection_data_str"],
        "windowSchema": [
            "startSeconds",
            "totalFrames",
            "targetIdFrames",
            "targetFfByteFrames",
            "targetPayloadTransitions",
            "distinctTargetPayloads",
        ],
        "windows": windows,
    }


def road_snapshot() -> None:
    try:
        from remotezip import RemoteZip  # type: ignore
    except ImportError as error:
        raise SystemExit("The road command needs remotezip: python3 -m pip install remotezip") from error

    names = ["max_speedometer_attack_1", "max_speedometer_attack_1_masquerade"]
    with RemoteZip(ROAD_ZIP) as archive:
        metadata = json.loads(archive.read("road/attacks/capture_metadata.json"))
        captures = [road_capture(archive, name, metadata[name]) for name in names]
    write_json(
        "road-can-attacks.json",
        {
            "metadata": {
                "title": "Real ORNL Automotive Dynamometer CAN Intrusion Dataset",
                "source": "https://zenodo.org/records/10462796",
                "doi": "10.5281/zenodo.10462796",
                "license": "CC BY 4.0",
                "retrieved": RETRIEVED,
                "transformation": "Streamed two max-speedometer candump logs from the remote ZIP and aggregated frames into 0.5-second windows. No CAN identifiers or payload bytes were altered.",
                "limitations": [
                    "The physical fabrication attack is real; the masquerade capture was produced by removing legitimate target frames in post-processing.",
                    "Attack labels identify an interval and target pattern, not a verified label for every individual CAN frame.",
                    "All captures come from one anonymized vehicle on a dynamometer, so thresholds should not be generalized to another vehicle without calibration.",
                ],
            },
            "captures": captures,
        },
    )


def cassi_snapshot() -> None:
    raw = download(CASSI_URL).decode("utf-8-sig")
    rows = list(csv.DictReader(raw.splitlines(), delimiter=";"))
    records = []
    for row in rows:
        location = clean(row.get("location"), "")
        try:
            latitude, longitude = [float(value.strip()) for value in location.split(",")]
        except (ValueError, IndexError):
            latitude, longitude = None, None
        records.append(
            {
                "id": int(row["entry_order"]),
                "dateTime": row["incident_datetime"],
                "pilotWeek": int(row["number_of_weeks_into_pilot"]),
                "dataSource": clean(row.get("data_source")),
                "weather": clean(row.get("weather")),
                "speedMph": maybe_float(row.get("vehicle_speed_in_miles_per_hour")),
                "initiatedBy": clean(row.get("initiated_by")),
                "cause": clean(row.get("cause")),
                "latitude": latitude,
                "longitude": longitude,
                "intersection": clean(row.get("intersection")),
                "otherRoadUsers": clean(row.get("other_road_users"), "No") == "Yes",
                "vulnerableRoadUsers": clean(row.get("vulnerable_road_users"), "No") == "Yes",
                "vegetation": clean(row.get("vegetation"), "No") == "Yes",
            }
        )
    write_json(
        "cassi-disengagements.json",
        {
            "metadata": {
                "title": "CASSI at UNC Charlotte disengagements",
                "source": "https://catalog.data.gov/dataset/cassi-at-unc-charlotte-disengagement",
                "download": CASSI_URL,
                "license": "CC0 1.0",
                "retrieved": RETRIEVED,
                "rows": len(records),
                "pilotWeeks": max(record["pilotWeek"] for record in records),
                "reportedPilotWeeks": 23,
                "observedWeekLabels": len({record["pilotWeek"] for record in records}),
                "transformation": "Retained event time, pilot week, source, weather, speed, initiator, reported cause, coarse location, and selected context flags; removed free-text additional information.",
                "limitations": [
                    "The two source-report types have different fields, so missingness is not uniform.",
                    "The catalog describes a 23-week pilot, while the current export contains 24 distinct numbered week labels (1 through 24).",
                    "Events come from one fixed-route campus shuttle pilot and do not represent the whole AV industry.",
                    "Counts describe disengagement events, not a failure rate; weekly vehicle miles or operating hours are not included here.",
                ],
            },
            "records": records,
        },
    )


def manifest() -> None:
    data_root = ROOT / "public" / "data"
    names = [
        "real/nhtsa-ads-reports.json",
        "real/tampa-bsm.json",
        "real/comma2k19-segment.json",
        "real/road-can-attacks.json",
        "real/cassi-disengagements.json",
        "comma2k19/segment-10.mp4",
    ]
    files = []
    for name in names:
        path = data_root / name
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        files.append({"path": name, "bytes": path.stat().st_size, "sha256": digest})
    write_json(
        "MANIFEST.json",
        {
            "generated": RETRIEVED,
            "algorithm": "SHA-256",
            "files": files,
        },
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("nhtsa")
    subparsers.add_parser("tampa")
    subparsers.add_parser("road")
    subparsers.add_parser("cassi")
    subparsers.add_parser("comma-video")
    subparsers.add_parser("manifest")
    comma = subparsers.add_parser("comma")
    comma.add_argument("--parquet", required=True, type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.command == "nhtsa":
        nhtsa_snapshot()
    elif args.command == "tampa":
        tampa_snapshot()
    elif args.command == "road":
        road_snapshot()
    elif args.command == "cassi":
        cassi_snapshot()
    elif args.command == "comma-video":
        comma_video()
    elif args.command == "manifest":
        manifest()
    else:
        comma_snapshot(args.parquet)


if __name__ == "__main__":
    main()
