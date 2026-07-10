export interface DatasetMetadata {
  title: string;
  source: string;
  license?: string;
  retrieved: string;
  transformation: string;
  limitations: string[];
  [key: string]: unknown;
}

export interface NhtsaRecord {
  id: string;
  version: number;
  incidentMonth: string;
  state: string;
  roadway: string;
  crashWith: string;
  injury: string;
  movement: string;
  engagement: string;
  withinOdd: string;
  airbag: string;
  towed: string;
  telematicsAvailable: boolean;
  videoAvailable: boolean;
}

export interface NhtsaData {
  metadata: DatasetMetadata & {
    rawRows: number;
    latestReportRows: number;
    coverage: string;
  };
  records: NhtsaRecord[];
}

export type NhtsaDimension = "crashWith" | "roadway" | "injury" | "movement";

export function countBy<T>(items: readonly T[], key: (item: T) => string): Array<[string, number]> {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(key(item), (counts.get(key(item)) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function filterNhtsa(
  records: readonly NhtsaRecord[],
  filters: { state: string; roadway: string },
): NhtsaRecord[] {
  return records.filter((record) =>
    (filters.state === "All" || record.state === filters.state)
    && (filters.roadway === "All" || record.roadway === filters.roadway));
}

export interface BsmRecord {
  t: number;
  timestamp: string;
  rsu: string;
  msgCount: number;
  secMarkMs: number;
  lat: number;
  lon: number;
  speedMps: number | null;
  headingDeg: number | null;
  accelLongMps2: number | null;
  semiMajorM: number | null;
  semiMinorM: number | null;
}

export interface BsmData {
  metadata: DatasetMetadata & {
    rows: number;
    durationSeconds: number;
    medianCapturedIntervalSeconds: number;
    counterDiscontinuities: number;
    publicVehicleId: string;
  };
  records: BsmRecord[];
}

export function bsmWindow(
  records: readonly BsmRecord[],
  start: number,
  duration: number,
  staleAfterSeconds: number,
) {
  const selected = records.filter((record) => record.t >= start && record.t <= start + duration);
  const intervals = selected.slice(1).map((record, index) => record.t - selected[index].t);
  const staleIntervals = intervals.filter((interval) => interval > staleAfterSeconds);
  const counterGaps = selected.slice(1).filter((record, index) =>
    (record.msgCount - selected[index].msgCount + 128) % 128 !== 1);
  return {
    selected,
    intervals,
    staleIntervals,
    counterGaps,
    maximumInterval: intervals.length ? Math.max(...intervals) : 0,
  };
}

export interface StreamSummary {
  samples: number;
  medianRateHz: number;
  p95GapMs: number;
  maxGapMs: number;
}

export interface CommaData {
  metadata: DatasetMetadata & {
    segmentId: string;
    durationSeconds: number;
    gnssResidualMedianM: number;
    gnssResidualP95M: number;
  };
  streams: Record<string, StreamSummary>;
  pose: Array<[number, number, number, number]>;
  gnss: Array<[number, number, number, number]>;
  canSpeed: Array<[number, number]>;
  steering: Array<[number, number]>;
  wheelSpeed: Array<[number, [number, number, number, number]]>;
  accelerometer: Array<[number, [number, number, number]]>;
  gyro: Array<[number, [number, number, number]]>;
}

export function nearestSample<T>(samples: readonly [number, T][], time: number): [number, T] {
  if (samples.length === 0) throw new Error("Cannot select from an empty signal.");
  let low = 0;
  let high = samples.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (samples[middle][0] < time) low = middle + 1;
    else high = middle;
  }
  if (low > 0 && Math.abs(samples[low - 1][0] - time) < Math.abs(samples[low][0] - time)) {
    return samples[low - 1];
  }
  return samples[low];
}

export function pearsonAtOffset(
  steering: readonly [number, number][],
  gyro: readonly [number, [number, number, number]][],
  offsetSeconds: number,
): number {
  const firstGyroTime = gyro[0]?.[0] ?? 0;
  const lastGyroTime = gyro.at(-1)?.[0] ?? 0;
  const pairs = steering
    .filter(([time]) => time + offsetSeconds >= firstGyroTime && time + offsetSeconds <= lastGyroTime)
    .map(([time, value]) => [
      value,
      nearestSample(gyro, time + offsetSeconds)[1][2],
    ] as const);
  if (pairs.length < 3) throw new Error("Not enough overlapping samples to compute correlation.");
  const meanX = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
  const meanY = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
  const varianceX = pairs.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
  const varianceY = pairs.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0);
  return numerator / Math.sqrt(varianceX * varianceY);
}

export type TimingVerdict = "deadline-risk" | "sample-reuse" | "oversampled" | "matched";

export function timingVerdict(
  stream: StreamSummary,
  cycleRateHz: number,
  maximumAgeMs: number,
): TimingVerdict {
  if (stream.maxGapMs > maximumAgeMs) return "deadline-risk";
  if (stream.medianRateHz < cycleRateHz * 0.9) return "sample-reuse";
  if (stream.medianRateHz > cycleRateHz * 2) return "oversampled";
  return "matched";
}

export interface RoadWindow {
  start: number;
  totalFrames: number;
  targetFrames: number;
  ffFrames: number;
  transitions: number;
  distinctPayloads: number;
}

export interface RoadCaptureData {
  id: string;
  modifiedMasquerade: boolean;
  description: string;
  durationSeconds: number;
  attackInterval: [number, number];
  targetId: string;
  targetPattern: string;
  windows: Array<[number, number, number, number, number, number]>;
}

export interface RoadData {
  metadata: DatasetMetadata & { doi: string };
  captures: RoadCaptureData[];
}

export type DetectorMode = "frequency" | "payload" | "combined";

export function decodeRoadWindow(window: RoadCaptureData["windows"][number]): RoadWindow {
  return {
    start: window[0],
    totalFrames: window[1],
    targetFrames: window[2],
    ffFrames: window[3],
    transitions: window[4],
    distinctPayloads: window[5],
  };
}

export function evaluateCanDetector(
  capture: RoadCaptureData,
  mode: DetectorMode,
  frequencyThreshold: number,
  payloadThreshold: number,
) {
  const [attackStart, attackEnd] = capture.attackInterval;
  const rows = capture.windows.map(decodeRoadWindow).map((window) => {
    const attacked = window.start + 0.5 > attackStart && window.start < attackEnd;
    const frequencyFlag = window.targetFrames >= frequencyThreshold;
    const payloadFlag = window.ffFrames >= payloadThreshold;
    const detected = mode === "frequency"
      ? frequencyFlag
      : mode === "payload"
        ? payloadFlag
        : frequencyFlag || payloadFlag;
    return { ...window, attacked, detected, frequencyFlag, payloadFlag };
  });
  const truePositive = rows.filter((row) => row.attacked && row.detected).length;
  const falsePositive = rows.filter((row) => !row.attacked && row.detected).length;
  const trueNegative = rows.filter((row) => !row.attacked && !row.detected).length;
  const falseNegative = rows.filter((row) => row.attacked && !row.detected).length;
  return {
    rows,
    truePositive,
    falsePositive,
    trueNegative,
    falseNegative,
    precision: truePositive + falsePositive === 0 ? 0 : truePositive / (truePositive + falsePositive),
    recall: truePositive + falseNegative === 0 ? 0 : truePositive / (truePositive + falseNegative),
  };
}

export interface CassiRecord {
  id: number;
  dateTime: string;
  pilotWeek: number;
  dataSource: string;
  weather: string;
  speedMph: number | null;
  initiatedBy: string;
  cause: string;
  latitude: number | null;
  longitude: number | null;
  intersection: string;
  otherRoadUsers: boolean;
  vulnerableRoadUsers: boolean;
  vegetation: boolean;
}

export interface CassiData {
  metadata: DatasetMetadata & { rows: number; pilotWeeks: number; reportedPilotWeeks: number; observedWeekLabels: number };
  records: CassiRecord[];
}
