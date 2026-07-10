import { useEffect, useId, useRef, useState } from "react";
import {
  bsmWindow,
  countBy,
  evaluateCanDetector,
  filterNhtsa,
  nearestSample,
  pearsonAtOffset,
  timingVerdict,
} from "../../demos/realData";
import type {
  BsmData,
  CassiData,
  CommaData,
  DatasetMetadata,
  DetectorMode,
  NhtsaData,
  NhtsaDimension,
  RoadData,
  TimingVerdict,
} from "../../demos/realData";

const dataUrl = (name: string) => `./data/real/${name}`;

function useDataset<T>(name: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(dataUrl(name), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<T>;
      })
      .then(setData)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unknown error");
      });
    return () => controller.abort();
  }, [name]);
  return { data, error };
}

function LoadingEvidence({ error }: { error: string | null }) {
  return (
    <div className="evidence-loading" role="status">
      <span />
      <p>{error ? `The evidence snapshot could not be loaded: ${error}` : "Loading the recorded evidence…"}</p>
    </div>
  );
}

function Metric({ label, value, note, tone = "default" }: {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "good" | "warn";
}) {
  return <div className={`evidence-metric tone-${tone}`}><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</div>;
}

function LabGuide({ title, steps }: { title: string; steps: [string, string, string] }) {
  return (
    <section className="lab-guide" aria-label="How to use this data lab">
      <div>
        <span>How to use this lab</span>
        <h4>{title}</h4>
      </div>
      <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p><strong>Visual key:</strong> cyan marks the active selection, coral marks a threshold or warning, and navy/gray provides recorded context. Labels and values repeat the color meaning.</p>
    </section>
  );
}

function SelectionSummary({ children }: { children: React.ReactNode }) {
  return (
    <div className="selection-summary" aria-live="polite" aria-atomic="true">
      <span>What changed</span>
      <p>{children}</p>
    </div>
  );
}

function EvidenceRange({ label, value, valueText, min, max, step, minLabel, maxLabel, help, onChange }: {
  label: string;
  value: number;
  valueText: string;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  help: string;
  onChange: (value: number) => void;
}) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const progress = Math.max(0, Math.min(100, (value - min) / Math.max(max - min, Number.EPSILON) * 100));
  const move = (direction: -1 | 1) => onChange(Math.max(min, Math.min(max, Number((value + direction * step).toFixed(10)))));
  const style = { "--range-progress": `${progress}%` } as React.CSSProperties;
  return (
    <div className="evidence-range" data-progress={progress.toFixed(2)}>
      <div className="range-heading"><label htmlFor={inputId}>{label}</label><output htmlFor={inputId}>{valueText}</output></div>
      <div className="range-input-row">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => move(-1)} disabled={value <= min}>−</button>
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          style={style}
          aria-describedby={helpId}
          onInput={(event) => onChange(Number(event.currentTarget.value))}
        />
        <button type="button" aria-label={`Increase ${label}`} onClick={() => move(1)} disabled={value >= max}>+</button>
      </div>
      <div className="range-scale" aria-hidden="true"><span>{minLabel}</span><span>{maxLabel}</span></div>
      <p className="range-impact" id={helpId}><strong>Changes:</strong> {help}</p>
    </div>
  );
}

function SourceNote({ metadata }: { metadata: DatasetMetadata }) {
  return (
    <details className="source-note">
      <summary>Source, transformation, and limitations</summary>
      <div>
        <p><strong>{metadata.title}</strong> · retrieved {metadata.retrieved}{metadata.license ? ` · ${metadata.license}` : ""}</p>
        <p>{metadata.transformation}</p>
        <ul>{metadata.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
        <a href={metadata.source} target="_blank" rel="noreferrer">Open the primary dataset source ↗</a>
      </div>
    </details>
  );
}

interface ChartSeries {
  label: string;
  values: Array<[number, number]>;
  tone?: "cyan" | "coral" | "lime" | "navy";
}

function SignalChart({ series, label, xDomain, highlight, threshold, cursor, xUnit = "s" }: {
  series: ChartSeries[];
  label: string;
  xDomain?: [number, number];
  highlight?: [number, number];
  threshold?: number;
  cursor?: number;
  xUnit?: string;
}) {
  const all = series.flatMap((item) => item.values);
  if (all.length === 0) return <div className="empty-chart">No samples in this window.</div>;
  const minX = xDomain?.[0] ?? Math.min(...all.map(([x]) => x));
  const maxX = xDomain?.[1] ?? Math.max(...all.map(([x]) => x));
  const visible = series.map((item) => ({ ...item, values: item.values.filter(([x]) => x >= minX && x <= maxX) }));
  const visibleValues = visible.flatMap((item) => item.values.map(([, y]) => y));
  const rawMinY = Math.min(...visibleValues, threshold ?? Infinity);
  const rawMaxY = Math.max(...visibleValues, threshold ?? -Infinity);
  const paddingY = Math.max((rawMaxY - rawMinY) * 0.08, 0.001);
  const minY = rawMinY - paddingY;
  const maxY = rawMaxY + paddingY;
  const sx = (value: number) => 42 + ((value - minX) / Math.max(maxX - minX, 0.001)) * 676;
  const sy = (value: number) => 170 - ((value - minY) / Math.max(maxY - minY, 0.001)) * 140;
  const line = (values: Array<[number, number]>) => values.map(([x, y], index) => `${index ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ");
  const selected = cursor === undefined
    ? []
    : visible.flatMap((item) => item.values.length > 0 ? [{ ...item, sample: nearestSample(item.values, cursor) }] : []);
  return (
    <div className="signal-chart">
      <div className="chart-heading"><strong>{label}</strong><span>{cursor === undefined ? `${minY.toFixed(2)} to ${maxY.toFixed(2)}` : `selected ${cursor.toFixed(1)} ${xUnit}`}</span></div>
      <svg viewBox="0 0 760 205" role="img" aria-label={`${label}${cursor === undefined ? "" : `; selected ${cursor.toFixed(1)} ${xUnit}`}`}>
        {highlight ? <rect className="chart-highlight" x={sx(highlight[0])} y="20" width={Math.max(0, sx(highlight[1]) - sx(highlight[0]))} height="150" /> : null}
        <path className="chart-grid" d="M42 30H718M42 100H718M42 170H718" />
        {threshold !== undefined ? <path className="chart-threshold" d={`M42 ${sy(threshold)}H718`} /> : null}
        {visible.map((item) => <path key={item.label} className={`chart-line tone-${item.tone ?? "cyan"}`} d={line(item.values)} />)}
        {cursor !== undefined ? <path className="chart-cursor" d={`M${sx(cursor)} 20V170`} /> : null}
        {selected.map((item) => <circle key={item.label} className={`chart-selected-point tone-${item.tone ?? "cyan"}`} cx={sx(item.sample[0])} cy={sy(item.sample[1])} r="5" />)}
        <text x="42" y="196">{minX.toFixed(1)} {xUnit}</text><text x="685" y="196">{maxX.toFixed(1)} {xUnit}</text>
      </svg>
      <div className="chart-legend">{visible.map((item) => <span key={item.label} className={`tone-${item.tone ?? "cyan"}`}>{item.label}</span>)}</div>
    </div>
  );
}

function BarList({ rows, maximum, threshold, format = (value) => String(value) }: {
  rows: Array<[string, number]>;
  maximum?: number;
  threshold?: number;
  format?: (value: number) => string;
}) {
  const max = maximum ?? Math.max(1, ...rows.map(([, value]) => value));
  return (
    <div className="evidence-bars">
      {rows.map(([label, value]) => (
        <div key={label} className={`evidence-bar${threshold !== undefined && value > threshold ? " over-threshold" : ""}`}>
          <span title={label}>{label}</span><i><b style={{ width: `${Math.min(100, value / max * 100)}%` }} />{threshold !== undefined ? <em style={{ left: `${Math.min(100, threshold / max * 100)}%` }} /> : null}</i><strong>{format(value)}</strong>
        </div>
      ))}
    </div>
  );
}

function PathPlot({ series, label, cursor }: {
  series: Array<{ label: string; tone: "cyan" | "coral" | "lime" | "navy"; points: Array<[number, number]> }>;
  label: string;
  cursor?: [number, number];
}) {
  const points = series.flatMap((item) => item.points);
  const minX = Math.min(...points.map(([x]) => x));
  const maxX = Math.max(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));
  const maxY = Math.max(...points.map(([, y]) => y));
  const rangeX = Math.max(maxX - minX, 0.000001);
  const rangeY = Math.max(maxY - minY, 0.000001);
  const scale = Math.min(692 / rangeX, 252 / rangeY);
  const insetX = 34 + (692 - rangeX * scale) / 2;
  const insetY = 34 + (252 - rangeY * scale) / 2;
  const sx = (value: number) => insetX + (value - minX) * scale;
  const sy = (value: number) => insetY + (maxY - value) * scale;
  const path = (values: Array<[number, number]>) => values.map(([x, y], index) => `${index ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ");
  return (
    <div className="path-plot">
      <svg viewBox="0 0 760 320" role="img" aria-label={label}>
        <path className="map-grid" d="M34 34H726V286H34Z M34 97H726M34 160H726M34 223H726 M207 34V286M380 34V286M553 34V286" />
        {series.map((item) => <path key={item.label} className={`map-path tone-${item.tone}`} d={path(item.points)} />)}
        {cursor ? <circle className="map-cursor" cx={sx(cursor[0])} cy={sy(cursor[1])} r="6" /> : null}
      </svg>
      <div className="chart-legend">{series.map((item) => <span key={item.label} className={`tone-${item.tone}`}>{item.label}</span>)}</div>
    </div>
  );
}

function LabFrame({ children }: { children: React.ReactNode }) {
  return <div className="real-data-lab">{children}</div>;
}

export function SensorEvidenceLab() {
  const { data, error } = useDataset<CommaData>("comma2k19-segment.json");
  const [time, setTime] = useState(12);
  const videoRef = useRef<HTMLVideoElement>(null);
  if (!data) return <LoadingEvidence error={error} />;
  const speed = nearestSample(data.canSpeed, time);
  const steering = nearestSample(data.steering, time);
  const accel = nearestSample(data.accelerometer, time);
  const gnss = nearestSample(data.gnss.map(([t, x, y, residual]) => [t, [x, y, residual]] as [number, [number, number, number]]), time);
  const window: [number, number] = [Math.max(0, time - 5), Math.min(data.metadata.durationSeconds, time + 5)];

  function seek(value: number) {
    setTime(value);
    if (videoRef.current) videoRef.current.currentTime = value;
  }

  return (
    <LabFrame>
      <LabGuide title="Inspect one synchronized moment across several sensors" steps={[
        "Move Recorded time or play the road video.",
        "Watch the cyan cursor, x-axis window, and four recorded values move to the same moment.",
        "Use the timing table to decide which streams can really support a 20 Hz fusion cycle.",
      ]} />
      <div className="evidence-split sensor-evidence">
        <div className="recorded-media">
          <video ref={videoRef} controls preload="metadata" src="./data/comma2k19/segment-10.mp4" onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} />
          <EvidenceRange label="Recorded time" value={time} valueText={`${time.toFixed(1)} s`} min={0} max={data.metadata.durationSeconds} step={0.1} minLabel="0 s" maxLabel={`${data.metadata.durationSeconds.toFixed(0)} s`} help="seeks the video, moves the cyan chart cursor, shifts the ten-second window, and refreshes all four sensor values." onChange={seek} />
          <p className="record-caption">Actual comma2k19 road video, synchronized to recorded CAN, IMU, GNSS, and fused-pose streams.</p>
        </div>
        <div>
          <div className="metric-grid">
            <Metric label="CAN speed" value={`${(speed[1] * 3.6).toFixed(1)} km/h`} note={`sample at ${speed[0].toFixed(2)} s`} />
            <Metric label="Steering angle" value={`${steering[1].toFixed(1)}°`} note="recorded sign convention" />
            <Metric label="Accelerometer x-axis" value={`${accel[1][0].toFixed(2)} m/s²`} />
            <Metric label="GNSS ↔ fused residual" value={`${gnss[1][2].toFixed(2)} m`} note="not surveyed error" />
          </div>
          <SignalChart label="Ten-second recorded sensor window" xDomain={window} cursor={time} series={[
            { label: "CAN speed (m/s)", values: data.canSpeed, tone: "cyan" },
            { label: "Steering angle (deg)", values: data.steering, tone: "coral" },
          ]} />
        </div>
      </div>
      <SelectionSummary>At <strong>{time.toFixed(1)} s</strong>, the nearest CAN sample reports <strong>{(speed[1] * 3.6).toFixed(1)} km/h</strong> and the GNSS-to-fused residual is <strong>{gnss[1][2].toFixed(2)} m</strong>. The cyan vertical cursor marks this time; the chart shows five seconds before and after it.</SelectionSummary>
      <div className="evidence-question">
        <span>Diagnostic task</span>
        <p>A fusion node updates at 20 Hz. Which recorded streams can supply a fresh sample each cycle, and which require reuse or interpolation? Use the measured rates and maximum gaps—not the camera image—to justify the answer.</p>
      </div>
      <div className="table-wrap"><table className="evidence-table"><caption>Recorded stream timing</caption><thead><tr><th>Stream</th><th>Samples</th><th>Median rate</th><th>p95 gap</th><th>Maximum gap</th></tr></thead><tbody>
        {Object.entries(data.streams).map(([name, stream]) => <tr key={name}><th>{formatStreamName(name)}</th><td>{stream.samples.toLocaleString()}</td><td>{stream.medianRateHz.toFixed(2)} Hz</td><td>{stream.p95GapMs.toFixed(1)} ms</td><td>{stream.maxGapMs.toFixed(1)} ms</td></tr>)}
      </tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

export function TampaBsmEvidenceLab() {
  const { data, error } = useDataset<BsmData>("tampa-bsm.json");
  const [start, setStart] = useState(0);
  const [staleAfter, setStaleAfter] = useState(0.5);
  if (!data) return <LoadingEvidence error={error} />;
  const duration = 20;
  const maxStart = Math.max(0, data.metadata.durationSeconds - duration);
  const result = bsmWindow(data.records, start, duration, staleAfter);
  const origin = data.records[0];
  const routePoint = (record: BsmData["records"][number]) => [
    (record.lon - origin.lon) * 111_320 * Math.cos(origin.lat * Math.PI / 180),
    (record.lat - origin.lat) * 110_540,
  ] as [number, number];
  const route = data.records.map(routePoint);
  const selectedRoute = result.selected.map(routePoint);
  const intervalRows = result.intervals.map((interval, index) => [result.selected[index + 1].t, interval] as [number, number]);
  const visibleRows = result.selected.slice(0, 10);
  return (
    <LabFrame>
      <LabGuide title="Test whether a received V2X trace stays fresh enough for an application" steps={[
        "Move the trace window to inspect a different 20-second portion of the trip.",
        "Change the freshness limit and watch the coral threshold, violations, and warning metrics update.",
        "Separate application staleness from message-counter discontinuities and from radio loss the file cannot prove.",
      ]} />
      <div className="lab-toolbar">
        <EvidenceRange label="20-second trace window" value={start} valueText={`${start.toFixed(1)}–${(start + duration).toFixed(1)} s`} min={0} max={maxStart} step={0.5} minLabel="trip start" maxLabel="trip end" help="moves the cyan route segment, changes the receive-interval chart, and replaces the selected table rows." onChange={setStart} />
        <EvidenceRange label="Application freshness limit" value={staleAfter} valueText={`${staleAfter.toFixed(1)} s`} min={0.1} max={1.5} step={0.1} minLabel="0.1 s strict" maxLabel="1.5 s lenient" help="moves the coral threshold and recomputes the largest-gap warning and freshness-violation count." onChange={setStaleAfter} />
      </div>
      <div className="metric-grid four">
        <Metric label="Captured messages" value={String(result.selected.length)} note="in selected window" />
        <Metric label="Largest receive gap" value={`${result.maximumInterval.toFixed(3)} s`} tone={result.maximumInterval > staleAfter ? "warn" : "good"} />
        <Metric label="Freshness violations" value={String(result.staleIntervals.length)} note={`>${staleAfter.toFixed(1)} s`} tone={result.staleIntervals.length ? "warn" : "good"} />
        <Metric label="Counter discontinuities" value={String(result.counterGaps.length)} note="not synonymous with packet loss" />
      </div>
      <div className="evidence-split">
        <PathPlot label="Real Tampa BSM route with selected 20-second segment" series={[
          { label: "Full captured route", tone: "navy", points: route },
          { label: "Selected window", tone: "cyan", points: selectedRoute },
        ]} />
        <SignalChart label="RSU receive interval" xDomain={[start, start + duration]} threshold={staleAfter} series={[{ label: "Inter-message gap (s)", values: intervalRows, tone: "coral" }]} />
      </div>
      <SelectionSummary>The cyan route segment now covers <strong>{start.toFixed(1)}–{(start + duration).toFixed(1)} s</strong> and contains <strong>{result.selected.length} messages</strong>. With the coral freshness limit at <strong>{staleAfter.toFixed(1)} s</strong>, <strong>{result.staleIntervals.length}</strong> receive gaps are classified as stale.</SelectionSummary>
      <div className="evidence-question"><span>Reliability task</span><p>Choose a freshness limit for a cooperative warning. Then distinguish three different observations: an old message at the application, a discontinuity in the 0–127 message counter, and proven radio loss. This public trace can measure the first two; it cannot by itself prove the third.</p></div>
      <div className="table-wrap"><table className="evidence-table"><caption>First records in the selected window</caption><thead><tr><th>Trace time</th><th>RSU</th><th>msgCnt</th><th>Speed</th><th>Heading</th><th>Position accuracy</th></tr></thead><tbody>
        {visibleRows.map((record) => <tr key={`${record.timestamp}-${record.msgCount}`}><td>{record.t.toFixed(3)} s</td><td>{record.rsu}</td><td>{record.msgCount}</td><td>{record.speedMps === null ? "Unavailable" : `${record.speedMps.toFixed(2)} m/s`}</td><td>{record.headingDeg === null ? "Unavailable" : `${record.headingDeg.toFixed(1)}°`}</td><td>{record.semiMajorM === null ? "Unavailable" : `${record.semiMajorM.toFixed(1)} × ${record.semiMinorM?.toFixed(1)} m`}</td></tr>)}
      </tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

export function LocalizationEvidenceLab() {
  const { data, error } = useDataset<CommaData>("comma2k19-segment.json");
  const [time, setTime] = useState(30);
  const [threshold, setThreshold] = useState(4.5);
  if (!data) return <LoadingEvidence error={error} />;
  const poseSamples = data.pose.map(([t, x, y]) => [t, [x, y]] as [number, [number, number]]);
  const gnssSamples = data.gnss.map(([t, x, y, residual]) => [t, [x, y, residual]] as [number, [number, number, number]]);
  const fused = nearestSample(poseSamples, time);
  const gnss = nearestSample(gnssSamples, time);
  const over = data.gnss.filter((row) => row[3] > threshold);
  const worst = [...data.gnss].sort((a, b) => b[3] - a[3]).slice(0, 8);
  return (
    <LabFrame>
      <LabGuide title="Compare two recorded position estimates without mistaking either for ground truth" steps={[
        "Move Inspect paired sample to select a time-aligned GNSS and fused-pose comparison.",
        "Move the residual threshold to define which recorded differences deserve investigation.",
        "Use the map, residual chart, and timestamp difference together before making an accuracy claim.",
      ]} />
      <div className="lab-toolbar">
        <EvidenceRange label="Inspect paired sample" value={time} valueText={`${time.toFixed(1)} s`} min={0} max={data.metadata.durationSeconds} step={0.2} minLabel="0 s" maxLabel={`${data.metadata.durationSeconds.toFixed(0)} s`} help="moves the cyan position marker and chart cursor and updates the selected residual and timestamp difference." onChange={setTime} />
        <EvidenceRange label="Residual investigation threshold" value={threshold} valueText={`${threshold.toFixed(1)} m`} min={2} max={6} step={0.1} minLabel="2.0 m strict" maxLabel="6.0 m lenient" help="moves the coral horizontal line and recomputes how many recorded GNSS-to-fused residuals exceed it." onChange={setThreshold} />
      </div>
      <div className="metric-grid four">
        <Metric label="Median residual" value={`${data.metadata.gnssResidualMedianM.toFixed(2)} m`} />
        <Metric label="p95 residual" value={`${data.metadata.gnssResidualP95M.toFixed(2)} m`} />
        <Metric label="Above threshold" value={`${over.length}/${data.gnss.length}`} tone={over.length ? "warn" : "good"} />
        <Metric label="Selected pair" value={`${gnss[1][2].toFixed(2)} m`} note={`timestamps differ by ${Math.abs(gnss[0] - fused[0]).toFixed(3)} s`} />
      </div>
      <div className="evidence-split localization-layout">
        <PathPlot label="u-blox GNSS and tightly coupled fused pose in a shared local frame" cursor={[gnss[1][0], gnss[1][1]]} series={[
          { label: "Tightly coupled pose", tone: "cyan", points: data.pose.map(([, x, y]) => [x, y]) },
          { label: "u-blox GNSS", tone: "coral", points: data.gnss.map(([, x, y]) => [x, y]) },
        ]} />
        <SignalChart label="GNSS-to-fused-pose residual" cursor={time} threshold={threshold} series={[{ label: "Horizontal residual (m)", values: data.gnss.map(([t, , , residual]) => [t, residual]), tone: "coral" }]} />
      </div>
      <SelectionSummary>At <strong>{time.toFixed(1)} s</strong>, the selected paired residual is <strong>{gnss[1][2].toFixed(2)} m</strong>. The coral threshold is <strong>{threshold.toFixed(1)} m</strong>, so <strong>{over.length} of {data.gnss.length}</strong> recorded pairs are marked for investigation—not declared inaccurate.</SelectionSummary>
      <div className="evidence-question"><span>Localization task</span><p>Investigate high-residual windows, but do not call this “GNSS ground-truth error.” The comparison is between a receiver solution and a fused INS/GNSS/vision estimate. Explain what additional surveyed reference would be needed to make an accuracy claim.</p></div>
      <div className="table-wrap"><table className="evidence-table"><caption>Largest paired residuals</caption><thead><tr><th>Trace time</th><th>GNSS local X</th><th>GNSS local Y</th><th>Horizontal residual</th></tr></thead><tbody>{worst.map(([t, x, y, residual]) => <tr key={t}><td>{t.toFixed(3)} s</td><td>{x.toFixed(2)} m</td><td>{y.toFixed(2)} m</td><td>{residual.toFixed(2)} m</td></tr>)}</tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

export function ControlAlignmentLab() {
  const { data, error } = useDataset<CommaData>("comma2k19-segment.json");
  const [offsetMs, setOffsetMs] = useState(0);
  const [time, setTime] = useState(26);
  const videoRef = useRef<HTMLVideoElement>(null);
  if (!data) return <LoadingEvidence error={error} />;
  const candidates = Array.from({ length: 21 }, (_, index) => -1000 + index * 100).map((offset) => [offset, pearsonAtOffset(data.steering, data.gyro, offset / 1000)] as [number, number]);
  const correlation = pearsonAtOffset(data.steering, data.gyro, offsetMs / 1000);
  const best = [...candidates].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  const wheel = nearestSample(data.wheelSpeed, time);
  const wheelSpread = Math.max(...wheel[1]) - Math.min(...wheel[1]);
  const window: [number, number] = [Math.max(0, time - 5), Math.min(data.metadata.durationSeconds, time + 5)];
  function seek(value: number) {
    setTime(value);
    if (videoRef.current) videoRef.current.currentTime = value;
  }
  return (
    <LabFrame>
      <LabGuide title="Check whether steering and yaw timestamps align in a recorded drive" steps={[
        "Move Trace time to inspect the video, wheel-speed spread, and nearby steering/yaw signals together.",
        "Sweep the candidate alignment and watch the selected correlation point move across the curve.",
        "Find the strongest relationship, then state why correlation alone cannot prove controller stability or causality.",
      ]} />
      <div className="evidence-split control-layout">
        <div className="recorded-media compact-media">
          <video ref={videoRef} controls preload="metadata" src="./data/comma2k19/segment-10.mp4" onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} />
          <EvidenceRange label="Trace time" value={time} valueText={`${time.toFixed(1)} s`} min={0} max={data.metadata.durationSeconds} step={0.1} minLabel="0 s" maxLabel={`${data.metadata.durationSeconds.toFixed(0)} s`} help="seeks the video, shifts the ten-second evidence window, and refreshes the four-wheel speed spread." onChange={seek} />
          <Metric label="Wheel-speed spread" value={`${(wheelSpread * 3.6).toFixed(2)} km/h`} note={`four wheel sensors at ${wheel[0].toFixed(2)} s`} />
        </div>
        <div>
          <EvidenceRange label="Candidate steering-to-yaw alignment" value={offsetMs} valueText={`${offsetMs > 0 ? "+" : ""}${offsetMs} ms`} min={-1000} max={1000} step={50} minLabel="-1,000 ms" maxLabel="+1,000 ms" help="moves the cyan point on the correlation sweep and recomputes correlation strength and sign." onChange={setOffsetMs} />
          <div className="metric-grid three">
            <Metric label="Correlation at candidate" value={correlation.toFixed(3)} tone={Math.abs(correlation) > 0.95 ? "good" : "warn"} />
            <Metric label="Strongest tested alignment" value={`${best[0] > 0 ? "+" : ""}${best[0]} ms`} note={`r = ${best[1].toFixed(3)}`} />
            <Metric label="Sign relationship" value={correlation < 0 ? "Opposite" : "Same"} note="dataset coordinate conventions" />
          </div>
          <SignalChart label="Alignment sweep: steering angle versus yaw rate" cursor={offsetMs} xUnit="ms" series={[{ label: "Pearson r", values: candidates, tone: "lime" }]} />
        </div>
      </div>
      <SignalChart label="Recorded control evidence around selected time" xDomain={window} cursor={time} series={[
        { label: "Steering angle (deg)", values: data.steering, tone: "coral" },
        { label: "Yaw rate × 100 (rad/s)", values: data.gyro.map(([t, value]) => [t, value[2] * 100]), tone: "cyan" },
      ]} />
      <SelectionSummary>At <strong>{time.toFixed(1)} s</strong>, the four recorded wheel speeds span <strong>{(wheelSpread * 3.6).toFixed(2)} km/h</strong>. The selected alignment is <strong>{offsetMs > 0 ? "+" : ""}{offsetMs} ms</strong>, where Pearson correlation is <strong>{correlation.toFixed(3)}</strong>; the cyan point shows the candidate being compared.</SelectionSummary>
      <div className="evidence-question"><span>Control-data task</span><p>Find the alignment with the strongest absolute correlation, then explain why correlation is useful for checking timestamps but cannot prove a steering controller is stable, causal, or safe. Identify the extra command, state, and error signals a closed-loop evaluation would require.</p></div>
      <div className="table-wrap"><table className="evidence-table"><caption>Candidate alignment evidence</caption><thead><tr><th>Offset</th><th>Pearson correlation</th><th>Absolute strength</th></tr></thead><tbody>{candidates.filter((_, index) => index % 2 === 0).map(([offset, value]) => <tr key={offset}><td>{offset > 0 ? "+" : ""}{offset} ms</td><td>{value.toFixed(4)}</td><td>{Math.abs(value).toFixed(4)}</td></tr>)}</tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

const timingCopy: Record<TimingVerdict, { label: string; action: string }> = {
  "deadline-risk": { label: "Gap exceeds age budget", action: "Add timeout/fallback; investigate missing or late samples" },
  "sample-reuse": { label: "Slower than cycle", action: "Reuse or interpolate explicitly and track sample age" },
  oversampled: { label: "Much faster than cycle", action: "Downsample or consume latest sample; bound the queue" },
  matched: { label: "Rate fits cycle", action: "Consume with timestamp and age checks" },
};

export function TimingAuditLab() {
  const { data, error } = useDataset<CommaData>("comma2k19-segment.json");
  const [cycleRate, setCycleRate] = useState(20);
  const [maximumAge, setMaximumAge] = useState(120);
  if (!data) return <LoadingEvidence error={error} />;
  const rows = Object.entries(data.streams).map(([name, stream]) => ({ name, stream, verdict: timingVerdict(stream, cycleRate, maximumAge) }));
  const risks = rows.filter((row) => row.verdict === "deadline-risk").length;
  const reused = rows.filter((row) => row.verdict === "sample-reuse").length;
  const barMaximum = Math.max(440, ...rows.map(({ stream }) => stream.maxGapMs));
  return (
    <LabFrame>
      <LabGuide title="Allocate a processing cycle and data-age budget from measured stream timing" steps={[
        "Change the executor rate to set how often the pipeline asks for a new value.",
        "Change the age budget and watch the coral marker classify measured maximum gaps.",
        "Use the updated table to choose reuse, downsampling, timeout, or fallback behavior for each stream.",
      ]} />
      <div className="lab-toolbar">
        <EvidenceRange label="Executor cycle" value={cycleRate} valueText={`${cycleRate} Hz`} min={5} max={100} step={5} minLabel="5 Hz" maxLabel="100 Hz" help="changes the cycle period and recomputes whether each measured stream is matched, oversampled, or requires reuse." onChange={setCycleRate} />
        <EvidenceRange label="Maximum acceptable sample age" value={maximumAge} valueText={`${maximumAge} ms`} min={20} max={400} step={10} minLabel="20 ms strict" maxLabel="400 ms lenient" help="moves the coral bar marker and reclassifies streams whose recorded maximum gap exceeds the age budget." onChange={setMaximumAge} />
      </div>
      <div className="metric-grid four">
        <Metric label="Recorded streams" value={String(rows.length)} />
        <Metric label="Age-budget risks" value={String(risks)} tone={risks ? "warn" : "good"} />
        <Metric label="Require reuse/interpolation" value={String(reused)} />
        <Metric label="Cycle period" value={`${(1000 / cycleRate).toFixed(1)} ms`} />
      </div>
      <div className="evidence-split timing-layout">
        <BarList rows={rows.map(({ name, stream }) => [formatStreamName(name), stream.maxGapMs])} maximum={barMaximum} threshold={maximumAge} format={(value) => `${value.toFixed(0)} ms`} />
        <div className="evidence-question"><span>Deadline-allocation task</span><p>The bars are measured maximum inter-arrival gaps from one deployed trace. Change the executor rate and age budget. A high nominal rate does not guarantee freshness; the maximum recorded gap is the relevant guardrail for this exercise.</p><strong>Threshold: {maximumAge} ms</strong></div>
      </div>
      <SelectionSummary>At <strong>{cycleRate} Hz</strong>, the executor period is <strong>{(1000 / cycleRate).toFixed(1)} ms</strong>. With a <strong>{maximumAge} ms</strong> age budget, <strong>{risks}</strong> streams exceed the coral gap marker and <strong>{reused}</strong> run slower than the requested cycle.</SelectionSummary>
      <div className="table-wrap"><table className="evidence-table decision-table"><caption>Pipeline decision from measured timing</caption><thead><tr><th>Stream</th><th>Measured rate</th><th>Maximum gap</th><th>Assessment</th><th>Implementation response</th></tr></thead><tbody>{rows.map(({ name, stream, verdict }) => <tr key={name} className={`verdict-${verdict}`}><th>{formatStreamName(name)}</th><td>{stream.medianRateHz.toFixed(2)} Hz</td><td>{stream.maxGapMs.toFixed(1)} ms</td><td>{timingCopy[verdict].label}</td><td>{timingCopy[verdict].action}</td></tr>)}</tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

export function CanAttackEvidenceLab() {
  const { data, error } = useDataset<RoadData>("road-can-attacks.json");
  const [captureIndex, setCaptureIndex] = useState(0);
  const [mode, setMode] = useState<DetectorMode>("frequency");
  const [frequencyThreshold, setFrequencyThreshold] = useState(75);
  const [payloadThreshold, setPayloadThreshold] = useState(1);
  if (!data) return <LoadingEvidence error={error} />;
  const capture = data.captures[captureIndex];
  const result = evaluateCanDetector(capture, mode, frequencyThreshold, payloadThreshold);
  const [attackStart, attackEnd] = capture.attackInterval;
  const attackRows = result.rows.filter((row) => row.start >= attackStart - 2 && row.start <= attackStart + 4);
  return (
    <LabFrame>
      <LabGuide title="Compare simple CAN attack detectors against two recorded attack constructions" steps={[
        "Choose the physical fabrication or masquerade capture and select which evidence the detector uses.",
        "Move a threshold; the matching coral line and all precision, recall, false-alarm, and miss values recompute.",
        "Calibrate on fabrication, then keep the threshold fixed when switching to masquerade to expose detector assumptions.",
      ]} />
      <div className="lab-toolbar select-toolbar">
        <label>Capture<select value={captureIndex} onChange={(event) => setCaptureIndex(Number(event.target.value))}><option value="0">Physical fabrication attack</option><option value="1">Masquerade post-processing</option></select></label>
        <label>Detector evidence<select value={mode} onChange={(event) => setMode(event.target.value as DetectorMode)}><option value="frequency">Target-ID frequency only</option><option value="payload">Known payload byte only</option><option value="combined">Either detector</option></select></label>
        <EvidenceRange label="Frequency threshold" value={frequencyThreshold} valueText={`${frequencyThreshold} frames / 0.5 s`} min={40} max={120} step={1} minLabel="40" maxLabel="120" help="moves the target-ID frequency decision boundary and recomputes detector outcomes when frequency evidence is active." onChange={setFrequencyThreshold} />
        <EvidenceRange label="Payload threshold" value={payloadThreshold} valueText={`${payloadThreshold} frames / 0.5 s`} min={1} max={50} step={1} minLabel="1" maxLabel="50" help="moves the known-payload decision boundary and recomputes outcomes when payload evidence is active." onChange={setPayloadThreshold} />
      </div>
      <div className="metric-grid four">
        <Metric label="Precision" value={`${(result.precision * 100).toFixed(1)}%`} tone={result.precision > 0.9 ? "good" : "warn"} />
        <Metric label="Recall" value={`${(result.recall * 100).toFixed(1)}%`} tone={result.recall > 0.9 ? "good" : "warn"} />
        <Metric label="False alarms" value={String(result.falsePositive)} />
        <Metric label="Missed attack windows" value={String(result.falseNegative)} tone={result.falseNegative ? "warn" : "good"} />
      </div>
      <SignalChart label="Target CAN ID evidence in real ROAD capture" highlight={[attackStart, attackEnd]} threshold={mode === "frequency" ? frequencyThreshold : mode === "payload" ? payloadThreshold : undefined} series={mode === "payload" ? [
        { label: "Target frames with FF byte", values: result.rows.map((row) => [row.start, row.ffFrames]), tone: "coral" },
      ] : [
        { label: "Target-ID frames / 0.5 s", values: result.rows.map((row) => [row.start, row.targetFrames]), tone: "cyan" },
        ...(mode === "combined" ? [{ label: "Known-payload frames", values: result.rows.map((row) => [row.start, row.ffFrames]) as Array<[number, number]>, tone: "coral" as const }] : []),
      ]} />
      <SelectionSummary>Using <strong>{mode === "frequency" ? "target-ID frequency" : mode === "payload" ? "known payload bytes" : "either evidence source"}</strong> on the <strong>{capture.modifiedMasquerade ? "masquerade" : "physical fabrication"}</strong> capture produces <strong>{(result.precision * 100).toFixed(1)}% precision</strong> and <strong>{(result.recall * 100).toFixed(1)}% recall</strong>. Coral encodes the attack interval and active decision threshold.</SelectionSummary>
      <div className="evidence-question"><span>Security task</span><p>Calibrate the frequency detector on the fabrication capture, then switch to masquerade without changing the threshold. Explain why frequency evidence collapses while the targeted payload evidence remains. The shaded interval comes from ROAD metadata, not from the detector.</p><strong>{capture.modifiedMasquerade ? "This capture removes legitimate target frames in post-processing." : "This capture contains the physically verified injected frames."}</strong></div>
      <div className="table-wrap"><table className="evidence-table"><caption>Windows around attack onset ({attackStart.toFixed(3)} s)</caption><thead><tr><th>Window</th><th>Total frames</th><th>Target-ID frames</th><th>FF-byte frames</th><th>Ground truth</th><th>Detector</th></tr></thead><tbody>{attackRows.map((row) => <tr key={row.start}><td>{row.start.toFixed(1)}–{(row.start + 0.5).toFixed(1)} s</td><td>{row.totalFrames}</td><td>{row.targetFrames}</td><td>{row.ffFrames}</td><td>{row.attacked ? "Attack interval" : "Benign interval"}</td><td>{row.detected ? "Flag" : "No flag"}</td></tr>)}</tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

const dimensionLabels: Record<NhtsaDimension, string> = {
  crashWith: "Crash partner",
  roadway: "Roadway type",
  injury: "Highest alleged injury",
  movement: "Subject-vehicle movement",
};

export function SafetyEvidenceLab() {
  const { data, error } = useDataset<NhtsaData>("nhtsa-ads-reports.json");
  const [state, setState] = useState("All");
  const [roadway, setRoadway] = useState("All");
  const [dimension, setDimension] = useState<NhtsaDimension>("crashWith");
  const [claimAnswers, setClaimAnswers] = useState<Record<number, boolean>>({});
  if (!data) return <LoadingEvidence error={error} />;
  const records = filterNhtsa(data.records, { state, roadway });
  const groups = countBy(records, (record) => record[dimension]);
  const states = ["All", ...countBy(data.records, (record) => record.state).map(([label]) => label)];
  const roadways = ["All", ...countBy(data.records, (record) => record.roadway).map(([label]) => label)];
  const top = groups[0] ?? ["No category", 0];
  const claims = [
    { text: `${top[0]} is the most frequent ${dimensionLabels[dimension].toLowerCase()} in the current ${records.length}-report slice.`, supported: records.length > 0, reason: "This is a descriptive statement computed directly from the filtered snapshot." },
    { text: `${top[0]} causes more ADS crashes than every other category.`, supported: false, reason: "A count distribution does not establish causation, and categories have different exposure." },
    { text: `${state === "All" ? "A state with fewer reports" : state} has the safest ADS fleet.`, supported: false, reason: "The SGO data do not include a common fleet-size, mileage, or ODD exposure denominator." },
  ];
  return (
    <LabFrame>
      <LabGuide title="Decide which claims the incident-report snapshot can actually support" steps={[
        "Filter by state and roadway; the report count, distribution, claims, and table all use the same slice.",
        "Change Group reports by to compare crash partners, roadway types, alleged injuries, or vehicle movement.",
        "Answer each claim audit, then use the feedback to separate description from causation or safety-rate claims.",
      ]} />
      <div className="lab-toolbar select-toolbar">
        <label>State<select value={state} onChange={(event) => setState(event.target.value)}>{states.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Roadway<select value={roadway} onChange={(event) => setRoadway(event.target.value)}>{roadways.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Group reports by<select value={dimension} onChange={(event) => setDimension(event.target.value as NhtsaDimension)}>{Object.entries(dimensionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <div className="metric-grid four">
        <Metric label="Filtered latest reports" value={records.length.toLocaleString()} />
        <Metric label="Raw submitted rows" value={data.metadata.rawRows.toLocaleString()} note="includes updated versions" />
        <Metric label="Categories visible" value={String(groups.length)} />
        <Metric label="Exposure denominator" value="Not provided" tone="warn" />
      </div>
      <SelectionSummary>The active filters contain <strong>{records.length.toLocaleString()} latest reports</strong>. The bars and table are grouped by <strong>{dimensionLabels[dimension].toLowerCase()}</strong>; the largest visible category is <strong>{top[0]}</strong> with <strong>{top[1]}</strong> reports. This is a count, not a causal or exposure-normalized rate.</SelectionSummary>
      <div className="evidence-split safety-layout">
        <div><h4>{dimensionLabels[dimension]} distribution</h4><BarList rows={groups.slice(0, 10)} /></div>
        <div className="claim-audit"><h4>Claim audit</h4>{claims.map((claim, index) => <div className="claim-card" key={claim.text}><p>{claim.text}</p><div><button type="button" onClick={() => setClaimAnswers((current) => ({ ...current, [index]: true }))}>Supported</button><button type="button" onClick={() => setClaimAnswers((current) => ({ ...current, [index]: false }))}>Not supported</button></div>{claimAnswers[index] !== undefined ? <small className={claimAnswers[index] === claim.supported ? "correct" : "incorrect"}>{claimAnswers[index] === claim.supported ? "Correct. " : "Reconsider. "}{claim.reason}</small> : null}</div>)}</div>
      </div>
      <div className="table-wrap"><table className="evidence-table"><caption>Sample of filtered, de-identified latest reports</caption><thead><tr><th>Report</th><th>Month</th><th>State</th><th>Roadway</th><th>Crash partner</th><th>Injury allegation</th></tr></thead><tbody>{records.slice(0, 10).map((record) => <tr key={record.id}><td>{record.id}</td><td>{record.incidentMonth}</td><td>{record.state}</td><td>{record.roadway}</td><td>{record.crashWith}</td><td>{record.injury}</td></tr>)}</tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

export function CassiDeploymentLab() {
  const { data, error } = useDataset<CassiData>("cassi-disengagements.json");
  const [cause, setCause] = useState("All");
  const [initiator, setInitiator] = useState("All");
  if (!data) return <LoadingEvidence error={error} />;
  const causes = ["All", ...countBy(data.records, (record) => record.cause).map(([label]) => label)];
  const initiators = ["All", ...countBy(data.records, (record) => record.initiatedBy).map(([label]) => label)];
  const selected = data.records.filter((record) => (cause === "All" || record.cause === cause) && (initiator === "All" || record.initiatedBy === initiator));
  const weekly = countBy(selected, (record) => `Week ${record.pilotWeek}`).sort((a, b) => Number(a[0].slice(5)) - Number(b[0].slice(5)));
  const causeRows = countBy(selected, (record) => record.cause);
  const sourceQuality = countBy(data.records, (record) => record.dataSource).map(([source, count]) => {
    const rows = data.records.filter((record) => record.dataSource === source);
    const withSpeed = rows.filter((record) => record.speedMph !== null).length;
    const withCause = rows.filter((record) => record.cause !== "Unknown").length;
    return { source, count, withSpeed, withCause };
  });
  return (
    <LabFrame>
      <LabGuide title="Turn one shuttle pilot’s disengagement records into bounded deployment lessons" steps={[
        "Filter by reported cause and who initiated the disengagement.",
        "Watch both weekly counts and cause counts update from the same selected event set.",
        "Use source completeness and missing exposure data to bound any scaling recommendation.",
      ]} />
      <div className="lab-toolbar select-toolbar">
        <label>Reported cause<select value={cause} onChange={(event) => setCause(event.target.value)}>{causes.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Disengagement initiated by<select value={initiator} onChange={(event) => setInitiator(event.target.value)}>{initiators.map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      <div className="metric-grid four">
        <Metric label="Selected events" value={String(selected.length)} />
        <Metric label="Observed week labels" value={String(data.metadata.observedWeekLabels)} note={`catalog describes a ${data.metadata.reportedPilotWeeks}-week pilot`} tone="warn" />
        <Metric label="Top selected cause" value={causeRows[0]?.[0] ?? "None"} note={causeRows[0] ? `${causeRows[0][1]} events` : undefined} />
        <Metric label="Rate denominator" value="Not in snapshot" tone="warn" />
      </div>
      <SelectionSummary>The filters select <strong>{selected.length} of {data.records.length} events</strong> across <strong>{weekly.length} observed week labels</strong>. The bars and table now use that same subset; without miles or operating hours, they show event composition rather than a disengagement rate.</SelectionSummary>
      <div className="evidence-split cassi-layout">
        <div><h4>Weekly event counts</h4><BarList rows={weekly} /></div>
        <div><h4>Reported causes</h4><BarList rows={causeRows.slice(0, 10)} /></div>
      </div>
      <div className="evidence-question"><span>Scaling task</span><p>Use the reported causes and source-specific missingness to recommend one operational, one infrastructure, and one technical intervention. Do not rank vendors or claim failure rates: this is one fixed-route pilot, and the snapshot contains events but no weekly miles or operating hours.</p></div>
      <div className="table-wrap"><table className="evidence-table"><caption>Data completeness differs by source report</caption><thead><tr><th>Source</th><th>Events</th><th>Speed available</th><th>Cause available</th></tr></thead><tbody>{sourceQuality.map((row) => <tr key={row.source}><th>{row.source}</th><td>{row.count}</td><td>{row.withSpeed}/{row.count}</td><td>{row.withCause}/{row.count}</td></tr>)}</tbody></table></div>
      <div className="table-wrap"><table className="evidence-table"><caption>First selected disengagement events</caption><thead><tr><th>Date</th><th>Pilot week</th><th>Initiated by</th><th>Reported cause</th><th>Weather</th><th>Speed</th></tr></thead><tbody>{selected.slice(0, 10).map((record) => <tr key={record.id}><td>{new Date(record.dateTime).toLocaleDateString("en-US", { timeZone: "UTC" })}</td><td>{record.pilotWeek}</td><td>{record.initiatedBy}</td><td>{record.cause}</td><td>{record.weather}</td><td>{record.speedMph === null ? "Unavailable" : `${record.speedMph.toFixed(1)} mph`}</td></tr>)}</tbody></table></div>
      <SourceNote metadata={data.metadata} />
    </LabFrame>
  );
}

function formatStreamName(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
