import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../public/data/", import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function json(name) {
  return JSON.parse(await readFile(new URL(`real/${name}`, root), "utf8"));
}

const [nhtsa, tampa, comma, road, cassi] = await Promise.all([
  json("nhtsa-ads-reports.json"),
  json("tampa-bsm.json"),
  json("comma2k19-segment.json"),
  json("road-can-attacks.json"),
  json("cassi-disengagements.json"),
]);
const manifest = await json("MANIFEST.json");
assert(manifest.algorithm === "SHA-256" && manifest.files.length === 6, "Data manifest is incomplete.");
for (const entry of manifest.files) {
  const content = await readFile(new URL(entry.path, root));
  assert(content.length === entry.bytes, `Size mismatch for ${entry.path}.`);
  assert(createHash("sha256").update(content).digest("hex") === entry.sha256, `Hash mismatch for ${entry.path}.`);
}

assert(nhtsa.records.length === nhtsa.metadata.latestReportRows, "NHTSA row metadata mismatch.");
assert(new Set(nhtsa.records.map((row) => row.id)).size === nhtsa.records.length, "NHTSA report IDs are not deduplicated.");
assert(nhtsa.metadata.limitations.some((note) => /not.*normalized|denominator/i.test(note)), "NHTSA exposure caveat is missing.");

assert(tampa.records.length === 1027, "The pinned Tampa trace should contain 1,027 messages.");
assert(tampa.metadata.license === "CC BY-SA 4.0", "Tampa license metadata is missing.");
assert(tampa.records.every((row, index) => index === 0 || row.t >= tampa.records[index - 1].t), "Tampa records are not ordered.");
assert(tampa.records.every((row) => row.lat > 27 && row.lat < 29 && row.lon < -81 && row.lon > -84), "Tampa coordinates failed the bounds check.");
assert(tampa.records.some((row) => row.semiMajorM > 0 && row.semiMajorM < 1), "Tampa 5 cm positional-accuracy scaling was not applied.");

assert(comma.metadata.segmentId.endsWith("/10"), "Unexpected comma2k19 segment.");
assert(comma.metadata.videoFrames === 1200 && comma.metadata.videoFrameRateHz === 20 && comma.metadata.videoDurationSeconds === 60, "comma2k19 video timing metadata changed.");
assert(comma.pose.length === 300 && comma.gnss.length === 300, "comma2k19 pose/GNSS sample counts changed.");
assert(Object.keys(comma.streams).length === 7, "comma2k19 timing table should contain seven streams.");
assert(comma.metadata.gnssResidualMedianM > 2 && comma.metadata.gnssResidualMedianM < 6, "comma2k19 residual sanity check failed.");
const video = await stat(new URL("comma2k19/segment-10.mp4", root));
assert(video.size > 5_000_000, "The synchronized comma2k19 road video is missing or truncated.");

assert(road.captures.length === 2, "ROAD snapshot needs fabrication and masquerade captures.");
const attackedMean = (capture, fieldIndex) => {
  const [start, end] = capture.attackInterval;
  const rows = capture.windows.filter((row) => row[0] >= start && row[0] < end);
  return rows.reduce((sum, row) => sum + row[fieldIndex], 0) / rows.length;
};
assert(attackedMean(road.captures[0], 2) > 90, "Fabrication target-ID frequency signature was lost.");
assert(attackedMean(road.captures[1], 2) > 45 && attackedMean(road.captures[1], 2) < 55, "Masquerade target-ID cadence should stay near baseline.");
assert(attackedMean(road.captures[1], 3) > 40, "Masquerade payload signature was lost.");

assert(cassi.records.length === 267, "The pinned CASSI dataset should contain 267 events.");
assert(cassi.metadata.reportedPilotWeeks === 23, "The CASSI catalog duration metadata changed.");
assert(cassi.metadata.observedWeekLabels === 24 && cassi.metadata.pilotWeeks === 24, "The observed CASSI week-label discrepancy changed.");
assert(cassi.metadata.license === "CC0 1.0", "CASSI license metadata is missing.");

console.log("Validated five real-data snapshots and the synchronized road video.");
