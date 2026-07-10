import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import type { DemoDefinition, DemoKind } from "../../types";

interface DemoRendererProps {
  demo: DemoDefinition;
  chapterId: number;
  index: number;
}

interface LabProps {
  demo: DemoDefinition;
  chapterId: number;
}

const renderers: Record<DemoKind, ComponentType<LabProps>> = {
  sorter: SorterLab,
  timeline: TimelineLab,
  flow: FlowLab,
  scenario: ScenarioLab,
  compare: CompareLab,
  calibration: CalibrationLab,
  network: NetworkLab,
  threshold: ThresholdLab,
  tracking: TrackingLab,
  transform: TransformLab,
  registration: RegistrationLab,
  fusion: FusionLab,
  planner: PlannerLab,
  trajectory: TrajectoryLab,
  control: ControlLab,
  budget: BudgetLab,
  queue: QueueLab,
  tradeoff: TradeoffLab,
  futures: FuturesLab,
  threats: ThreatLab,
  testing: TestingLab,
  coverage: CoverageLab,
  architecture: ArchitectureLab,
  offload: OffloadLab,
};

export function DemoRenderer({ demo, chapterId, index }: DemoRendererProps) {
  const Lab = renderers[demo.kind];
  return (
    <article className={`demo-lab accent-${demo.accent}`} aria-labelledby={`${demo.id}-heading`}>
      <header className="demo-heading">
        <span className="demo-number">{String(index).padStart(2, "0")}</span>
        <div>
          <h3 id={`${demo.id}-heading`}>{demo.title}</h3>
          <p>{demo.description}</p>
        </div>
        <span className="demo-live">Interactive lab</span>
      </header>
      <Lab demo={demo} chapterId={chapterId} />
    </article>
  );
}

function RangeControl({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-control">
      <span>{label}<output>{value}{unit}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "warn" }) {
  return <div className={`demo-metric tone-${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function SorterLab() {
  const scenarios = [
    { text: "Adaptive cruise control manages speed, but the driver steers.", answer: "Level 1", note: "One sustained control function is automated; the driver performs the rest." },
    { text: "Speed and steering are automated while the driver continuously supervises.", answer: "Level 2", note: "The system handles both lateral and longitudinal motion, but supervision remains human." },
    { text: "A highway system drives and requests a human takeover when its operating limit approaches.", answer: "Level 3", note: "The system drives conditionally and performs the task until it issues a fallback request." },
    { text: "A geofenced shuttle has no driver and safely stops if it leaves its supported conditions.", answer: "Level 4", note: "High automation handles the fallback inside a defined operational design domain." },
    { text: "A vehicle can drive anywhere a human can, in all road and weather conditions.", answer: "Level 5", note: "Full automation has no restricted operating domain and requires no human driver." },
  ];
  const [scenario, setScenario] = useState(0);
  const [choice, setChoice] = useState<string>();
  const item = scenarios[scenario];
  const correct = choice === item.answer;

  function next() {
    setScenario((current) => (current + 1) % scenarios.length);
    setChoice(undefined);
  }

  return (
    <div className="lab-grid sorter-lab">
      <div className="lab-controls">
        <span className="control-label">Driving scenario {scenario + 1} of {scenarios.length}</span>
        <p className="scenario-prompt">{item.text}</p>
        <div className="option-grid">
          {["Level 0", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5"].map((level) => (
            <button key={level} type="button" className={choice === level ? "selected" : ""} onClick={() => setChoice(level)}>{level}</button>
          ))}
        </div>
      </div>
      <div className={`lab-stage feedback-stage ${choice ? (correct ? "success" : "warning") : ""}`}>
        <div className="road-mini"><span className="car-mini" /><span className="lane-mini" /></div>
        {choice ? (
          <div className="feedback-copy" role="status">
            <strong>{correct ? "Correct" : `This is ${item.answer}`}</strong>
            <p>{item.note}</p>
            <button type="button" className="text-button" onClick={next}>Try the next scenario →</button>
          </div>
        ) : <p>Choose the SAE level, then compare the driving task and fallback responsibility.</p>}
      </div>
    </div>
  );
}

function TimelineLab() {
  const milestones = [
    ["1939", "Futurama", "A public vision of automated highways and guided travel."],
    ["1950s", "Wire-guided prototypes", "Road-embedded guidance showed early automated steering."],
    ["1980s", "NavLab", "Computer vision and mobile robotics moved autonomy onto real roads."],
    ["2004–07", "DARPA Challenges", "Desert and urban competitions accelerated complete AV systems."],
    ["Today", "Constrained deployments", "Robotaxis, shuttles, and assistance systems operate in bounded domains."],
  ];
  const [active, setActive] = useState(2);
  return (
    <div className="timeline-lab">
      <div className="timeline-track" aria-label="Autonomous driving milestones">
        {milestones.map((item, index) => (
          <button key={item[0]} type="button" className={active === index ? "active" : ""} onClick={() => setActive(index)}>
            <span>{item[0]}</span><i />
          </button>
        ))}
      </div>
      <div className="timeline-detail" role="status">
        <span>{milestones[active][0]}</span>
        <h4>{milestones[active][1]}</h4>
        <p>{milestones[active][2]}</p>
      </div>
    </div>
  );
}

function FlowLab({ demo, chapterId }: LabProps) {
  const chapterFlows: Record<number, string[]> = {
    1: ["Sense", "Perceive", "Localize", "Plan", "Control"],
    2: ["CARLA", "Bridge", "Sensing", "Planning", "Control gate"],
    8: ["Command", "ECU", "Vehicle bus", "Actuator", "Feedback"],
    9: ["Acquire", "Fuse", "Perceive", "Plan", "Actuate"],
    11: ["Sensor", "ROS 2", "CAN", "V2X", "Safety monitor"],
  };
  const nodes = chapterFlows[chapterId] ?? ["Input", "Process", "Decide", "Execute", "Verify"];
  const faults = chapterId === 8
    ? ["No fault", "Sensor disagreement", "30 ms bus delay", "Actuator unavailable"]
    : chapterId === 2
      ? ["No fault", "Clock drift", "Dropped topic", "Bridge latency"]
      : ["No fault", "Weather noise", "Stale localization", "Actuator delay"];
  const [fault, setFault] = useState(faults[0]);
  const faultIndex = fault === "No fault" ? -1 : Math.min(nodes.length - 1, faults.indexOf(fault));
  return (
    <div className="flow-lab lab-grid">
      <div className="lab-controls">
        <label className="select-control">Injected condition
          <select value={fault} onChange={(event) => setFault(event.target.value)}>{faults.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <p>{demo.title.includes("Lockstep") ? "Compare free-running components with a synchronized global tick." : "Trace how one fault propagates and where monitoring should catch it."}</p>
      </div>
      <div className="lab-stage flow-stage">
        <div className="flow-nodes">
          {nodes.map((node, index) => <div key={node} className={index === faultIndex ? "fault" : index > faultIndex && faultIndex >= 0 ? "degraded" : ""}><span>{index + 1}</span><strong>{node}</strong></div>)}
        </div>
        <p className="flow-status" role="status">{fault === "No fault" ? "All stages are healthy and data remains current." : `${fault} degrades ${nodes[faultIndex]} and every downstream stage until a monitor or fallback intervenes.`}</p>
      </div>
    </div>
  );
}

function ScenarioLab(props: LabProps) {
  if (props.chapterId === 11) return <DefenseScenarioLab />;
  return <DrivingScenarioLab {...props} />;
}

function DrivingScenarioLab({ demo, chapterId }: LabProps) {
  const [weather, setWeather] = useState("Clear");
  const [traffic, setTraffic] = useState(35);
  const [latency, setLatency] = useState(40);
  const [v2x, setV2x] = useState(true);
  const isV2x = chapterId === 4;
  const isAttack = chapterId === 11;
  const safeWindow = Math.max(0, 4.8 - latency / 250 - traffic / 80 + (v2x ? 1.4 : 0));
  return (
    <div className="lab-grid scenario-lab">
      <div className="lab-controls">
        <label className="select-control">Environment
          <select value={weather} onChange={(event) => setWeather(event.target.value)}><option>Clear</option><option>Rain</option><option>Fog</option><option>Night</option></select>
        </label>
        <RangeControl label={isV2x ? "Road users" : "Traffic density"} value={traffic} min={5} max={90} unit="%" onChange={setTraffic} />
        <RangeControl label={isAttack ? "Attack delay" : "Message latency"} value={latency} min={5} max={300} unit=" ms" onChange={setLatency} />
        <label className="toggle-control"><input type="checkbox" checked={v2x} onChange={(event) => setV2x(event.target.checked)} /><span />{isV2x ? "Enable V2X warning" : "Enable safety monitor"}</label>
      </div>
      <div className={`lab-stage intersection-stage weather-${weather.toLowerCase()}`}>
        <span className="intersection-road road-horizontal" /><span className="intersection-road road-vertical" />
        <span className="intersection-car ego" /><span className="intersection-car hazard" />
        {v2x ? <span className="warning-wave" /> : null}
        <div className="scenario-metrics">
          <Metric label="Warning window" value={`${safeWindow.toFixed(1)} s`} tone={safeWindow > 3 ? "good" : "warn"} />
          <Metric label="Visibility" value={weather === "Clear" ? "High" : weather === "Night" ? "Low" : "Reduced"} />
        </div>
      </div>
    </div>
  );
}

function DefenseScenarioLab() {
  const incidents = [
    { label: "Forged wheel-speed message", property: "Integrity", defense: "Authenticate the sender and reject values that disagree with redundant motion sensors." },
    { label: "LiDAR channel flooding", property: "Availability", defense: "Rate-limit traffic, isolate the affected channel, and enter a safe degraded mode." },
    { label: "Location-history leak", property: "Confidentiality", defense: "Minimize retention, encrypt records, and enforce least-privilege access." },
  ];
  const [incident, setIncident] = useState(0);
  const [defenses, setDefenses] = useState<string[]>([]);
  const item = incidents[incident];
  const options = ["Authentication", "Redundancy", "Encryption", "Rate limiting"];
  function toggle(option: string) { setDefenses((current) => current.includes(option) ? current.filter((value) => value !== option) : [...current, option]); }
  return (
    <div className="lab-grid threat-lab">
      <div className="lab-controls">
        <label className="select-control">Incident<select value={incident} onChange={(event) => { setIncident(Number(event.target.value)); setDefenses([]); }}>{incidents.map((entry, index) => <option value={index} key={entry.label}>{entry.label}</option>)}</select></label>
        <span className="control-label">Layer the defenses</span>
        <div className="option-grid vertical">{options.map((option) => <button key={option} type="button" className={defenses.includes(option) ? "selected" : ""} onClick={() => toggle(option)}>{option}</button>)}</div>
      </div>
      <div className="lab-stage threat-stage">
        <div className="shield-visual">{item.property.slice(0, 1)}</div>
        <strong>{item.property}</strong>
        <p>{item.defense}</p>
        <Metric label="Defense layers enabled" value={String(defenses.length)} tone={defenses.length >= 2 ? "good" : "warn"} />
      </div>
    </div>
  );
}

function CompareLab({ chapterId }: LabProps) {
  const [condition, setCondition] = useState(chapterId === 13 ? "Geofenced city" : "Clear daylight");
  const [range, setRange] = useState(60);
  const sensorScores: Record<string, number[]> = {
    "Clear daylight": [95, 88, 82], Rain: [52, 69, 90], Fog: [38, 63, 87], Night: [58, 91, 86],
  };
  const deploymentScores: Record<string, number[]> = {
    "Geofenced city": [88, 62, 74], "Open consumer roads": [48, 92, 57], "Partner ecosystem": [66, 73, 93], "Purpose-built route": [91, 45, 69],
  };
  const isIndustry = chapterId === 13;
  const labels = isIndustry ? ["Safety control", "Coverage", "Partner scale"] : ["Camera", "LiDAR", "Radar"];
  const options = Object.keys(isIndustry ? deploymentScores : sensorScores);
  const scores = (isIndustry ? deploymentScores : sensorScores)[condition].map((score) => Math.max(10, Math.min(100, score - Math.max(0, range - 70) / 3)));
  return (
    <div className="lab-grid compare-lab">
      <div className="lab-controls">
        <label className="select-control">{isIndustry ? "Deployment setting" : "Driving condition"}
          <select value={condition} onChange={(event) => setCondition(event.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <RangeControl label={isIndustry ? "Operating area" : "Target range"} value={range} min={10} max={120} unit={isIndustry ? "%" : " m"} onChange={setRange} />
        <p>{isIndustry ? "Different strategies trade broad coverage for operational control and ecosystem reach." : "Sensor strengths are complementary; no single modality wins in every condition."}</p>
      </div>
      <div className="lab-stage bar-stage">
        {labels.map((label, index) => <div className="score-bar" key={label}><span>{label}</span><i><b style={{ width: `${scores[index]}%` }} /></i><strong>{Math.round(scores[index])}</strong></div>)}
      </div>
    </div>
  );
}

function CalibrationLab() {
  const [horizontal, setHorizontal] = useState(18);
  const [vertical, setVertical] = useState(-8);
  const [rotation, setRotation] = useState(3);
  const error = Math.sqrt(horizontal ** 2 + vertical ** 2) / 8 + Math.abs(rotation) * 1.4;
  const points = [[90, 80], [145, 55], [205, 100], [270, 70], [330, 120], [385, 65]];
  return (
    <div className="lab-grid calibration-lab">
      <div className="lab-controls">
        <RangeControl label="Horizontal offset" value={horizontal} min={-40} max={40} unit=" px" onChange={setHorizontal} />
        <RangeControl label="Vertical offset" value={vertical} min={-30} max={30} unit=" px" onChange={setVertical} />
        <RangeControl label="Rotation" value={rotation} min={-10} max={10} unit="°" onChange={setRotation} />
        <Metric label="Reprojection error" value={`${error.toFixed(1)} px`} tone={error < 2 ? "good" : "warn"} />
      </div>
      <div className="lab-stage calibration-stage">
        <svg viewBox="0 0 460 200" role="img" aria-label="Camera and LiDAR calibration overlay">
          <path className="road-outline" d="M45 170 150 30h160l105 140M230 30v140" />
          <g className="target-points">{points.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" />)}</g>
          <g className="lidar-points" transform={`translate(${horizontal} ${vertical}) rotate(${rotation} 230 100)`}>{points.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" />)}</g>
        </svg>
        <div className="legend"><span className="target-dot">Camera feature</span><span className="lidar-dot">LiDAR projection</span></div>
      </div>
    </div>
  );
}

function NetworkLab() {
  const [vehicles, setVehicles] = useState(35);
  const [rate, setRate] = useState(10);
  const [loss, setLoss] = useState(3);
  const load = vehicles * rate * 0.18;
  const latency = 12 + Math.pow(load / 55, 2) * 35 + loss * 2.5;
  const delivery = Math.max(0, 100 - loss - Math.max(0, load - 80) * 0.6);
  return (
    <div className="lab-grid network-lab">
      <div className="lab-controls">
        <RangeControl label="Connected vehicles" value={vehicles} min={5} max={120} onChange={setVehicles} />
        <RangeControl label="Messages per second" value={rate} min={1} max={30} onChange={setRate} />
        <RangeControl label="Packet loss" value={loss} min={0} max={25} unit="%" onChange={setLoss} />
      </div>
      <div className="lab-stage network-stage">
        <div className="network-map" aria-hidden="true"><span className="rsu">RSU</span>{Array.from({ length: 9 }, (_, index) => <i key={index} style={{ transform: `rotate(${index * 40}deg) translateY(-72px)` }} />)}</div>
        <div className="metric-row">
          <Metric label="Channel load" value={`${load.toFixed(0)}%`} tone={load < 80 ? "good" : "warn"} />
          <Metric label="Est. latency" value={`${latency.toFixed(0)} ms`} tone={latency < 100 ? "good" : "warn"} />
          <Metric label="Delivery" value={`${delivery.toFixed(0)}%`} tone={delivery > 90 ? "good" : "warn"} />
        </div>
      </div>
    </div>
  );
}

function ThresholdLab(props: LabProps) {
  if (props.chapterId === 4) return <LatencyBudgetLab />;
  return <DetectionThresholdLab />;
}

function LatencyBudgetLab() {
  const [delay, setDelay] = useState(35);
  const [loss, setLoss] = useState(2);
  const [age, setAge] = useState(50);
  const [application, setApplication] = useState("Emergency brake warning");
  const limits: Record<string, number> = { "Emergency brake warning": 100, "Signal phase update": 300, "Map refresh": 1200 };
  const effective = delay + age + loss * 8;
  const margin = limits[application] - effective;
  return (
    <div className="lab-grid network-lab">
      <div className="lab-controls">
        <label className="select-control">Message type<select value={application} onChange={(event) => setApplication(event.target.value)}>{Object.keys(limits).map((item) => <option key={item}>{item}</option>)}</select></label>
        <RangeControl label="Link delay" value={delay} min={0} max={250} unit=" ms" onChange={setDelay} />
        <RangeControl label="Packet loss" value={loss} min={0} max={20} unit="%" onChange={setLoss} />
        <RangeControl label="Message age" value={age} min={0} max={500} unit=" ms" onChange={setAge} />
      </div>
      <div className="lab-stage latency-stage">
        <div className="latency-gauge"><span style={{ width: `${Math.min(100, effective / limits[application] * 100)}%` }} /><i style={{ left: "100%" }} /></div>
        <div className="metric-row"><Metric label="Effective age" value={`${effective} ms`} tone={margin >= 0 ? "good" : "warn"} /><Metric label="Action margin" value={`${margin} ms`} tone={margin >= 0 ? "good" : "warn"} /></div>
        <p className="stage-note">{margin >= 0 ? "The warning arrives inside this application’s action window." : "The warning is too stale for this application; the vehicle must rely on local sensing and fallback behavior."}</p>
      </div>
    </div>
  );
}

function DetectionThresholdLab() {
  const [confidence, setConfidence] = useState(55);
  const [nms, setNms] = useState(45);
  const detections = [
    { label: "car .94", score: 94, x: 9, y: 22, w: 30, h: 48 },
    { label: "car .71", score: 71, x: 56, y: 32, w: 28, h: 38 },
    { label: "person .62", score: 62, x: 42, y: 20, w: 12, h: 52 },
    { label: "car .43", score: 43, x: 12 + nms / 8, y: 27, w: 28, h: 44 },
  ];
  const visible = detections.filter((box) => box.score >= confidence);
  const precision = Math.min(99, 52 + confidence * 0.48);
  const recall = Math.max(18, 99 - confidence * 0.63);
  return (
    <div className="lab-grid threshold-lab">
      <div className="lab-controls">
        <RangeControl label="Confidence threshold" value={confidence} min={20} max={90} unit="%" onChange={setConfidence} />
        <RangeControl label="NMS overlap threshold" value={nms} min={10} max={90} unit="%" onChange={setNms} />
        <div className="metric-row compact"><Metric label="Precision" value={`${precision.toFixed(0)}%`} /><Metric label="Recall" value={`${recall.toFixed(0)}%`} /></div>
      </div>
      <div className="lab-stage detection-stage">
        <div className="street-scene" aria-label={`${visible.length} detections visible`}>
          <span className="scene-road" /><span className="scene-car one" /><span className="scene-car two" /><span className="scene-person" />
          {visible.map((box) => <span className="detection-box" key={box.label} style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}><b>{box.label}</b></span>)}
        </div>
      </div>
    </div>
  );
}

function TrackingLab() {
  const [frame, setFrame] = useState(0);
  const [appearance, setAppearance] = useState(true);
  const occluded = frame === 3 || frame === 4;
  const swapped = !appearance && frame > 4;
  return (
    <div className="lab-grid tracking-lab">
      <div className="lab-controls">
        <RangeControl label="Video frame" value={frame + 1} min={1} max={8} onChange={(value) => setFrame(value - 1)} />
        <label className="toggle-control"><input type="checkbox" checked={appearance} onChange={(event) => setAppearance(event.target.checked)} /><span />Use appearance embedding</label>
        <p>{appearance ? "Deep SORT combines motion with appearance to recover identity after occlusion." : "Motion-only association can swap IDs when objects cross or disappear."}</p>
      </div>
      <div className="lab-stage tracking-stage">
        <span className="track-line a" /><span className="track-line b" />
        {!occluded ? <span className="tracked-object object-a" style={{ left: `${8 + frame * 10}%` }}>ID {swapped ? "02" : "01"}</span> : null}
        <span className="tracked-object object-b" style={{ right: `${8 + frame * 7}%` }}>ID {swapped ? "01" : "02"}</span>
        {occluded ? <span className="occlusion">Occluded</span> : null}
      </div>
    </div>
  );
}

function TransformLab() {
  const [x, setX] = useState(2.5);
  const [y, setY] = useState(1.5);
  const [yaw, setYaw] = useState(20);
  const radians = yaw * Math.PI / 180;
  const point = { x: 2, y: 1 };
  const worldX = x + point.x * Math.cos(radians) - point.y * Math.sin(radians);
  const worldY = y + point.x * Math.sin(radians) + point.y * Math.cos(radians);
  return (
    <div className="lab-grid transform-lab">
      <div className="lab-controls">
        <RangeControl label="Vehicle x" value={x} min={-4} max={4} step={0.5} unit=" m" onChange={setX} />
        <RangeControl label="Vehicle y" value={y} min={-3} max={3} step={0.5} unit=" m" onChange={setY} />
        <RangeControl label="Yaw" value={yaw} min={-90} max={90} unit="°" onChange={setYaw} />
      </div>
      <div className="lab-stage transform-stage">
        <svg viewBox="0 0 460 230" role="img" aria-label="Coordinate frame transformation">
          <defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" /></pattern></defs>
          <rect width="460" height="230" fill="url(#grid)" />
          <g transform={`translate(${230 + x * 30} ${115 - y * 30}) rotate(${-yaw})`}><path className="vehicle-shape" d="M-28-14h43l15 14-15 14h-43Z" /><line x1="0" y1="0" x2="65" y2="0" /><circle cx={point.x * 30} cy={-point.y * 30} r="7" /></g>
        </svg>
        <div className="metric-row"><Metric label="Sensor point" value="(2.0, 1.0) m" /><Metric label="World point" value={`(${worldX.toFixed(2)}, ${worldY.toFixed(2)}) m`} /></div>
      </div>
    </div>
  );
}

function RegistrationLab() {
  const [initial, setInitial] = useState(34);
  const [iterations, setIterations] = useState(6);
  const residual = Math.max(0.4, initial * Math.exp(-iterations / 3.3));
  const shift = residual * 0.8;
  const points = Array.from({ length: 18 }, (_, index) => [50 + index * 19, 105 + Math.sin(index * 0.65) * 46]);
  return (
    <div className="lab-grid registration-lab">
      <div className="lab-controls">
        <RangeControl label="Initial pose error" value={initial} min={5} max={70} unit=" cm" onChange={setInitial} />
        <RangeControl label="ICP iterations" value={iterations} min={0} max={20} onChange={setIterations} />
        <Metric label="Residual error" value={`${residual.toFixed(1)} cm`} tone={residual < 3 ? "good" : "warn"} />
      </div>
      <div className="lab-stage registration-stage">
        <svg viewBox="0 0 440 220" aria-label="Point cloud registration result">
          <g className="map-cloud">{points.map(([x, y]) => <circle key={`m${x}`} cx={x} cy={y} r="4" />)}</g>
          <g className="scan-cloud" transform={`translate(${shift} ${-shift / 2})`}>{points.map(([x, y]) => <circle key={`s${x}`} cx={x} cy={y} r="3" />)}</g>
        </svg>
        <div className="legend"><span className="target-dot">Map</span><span className="lidar-dot">Current scan</span></div>
      </div>
    </div>
  );
}

function FusionLab() {
  const [policy, setPolicy] = useState(55);
  const [worldModel, setWorldModel] = useState(25);
  const [shield, setShield] = useState(20);
  const total = policy + worldModel + shield;
  const risk = Math.max(0, 82 - worldModel * .35 - shield * .9 + policy * .12);
  const maneuver = shield > 45 || risk > 62 ? "Stop" : worldModel > 35 ? "Yield" : "Proceed cautiously";
  return (
    <div className="lab-grid fusion-lab">
      <div className="lab-controls">
        <RangeControl label="Learned policy" value={policy} min={0} max={100} unit="%" onChange={setPolicy} />
        <RangeControl label="World model" value={worldModel} min={0} max={100} unit="%" onChange={setWorldModel} />
        <RangeControl label="Safety shield" value={shield} min={0} max={100} unit="%" onChange={setShield} />
      </div>
      <div className="lab-stage fusion-stage">
        <div className="decision-fusion"><span style={{ flex: policy }}>Policy</span><span style={{ flex: worldModel }}>World model</span><span style={{ flex: shield }}>Shield</span></div>
        <div className="metric-row"><Metric label="Weight total" value={`${total}%`} tone={Math.abs(total - 100) <= 5 ? "good" : "warn"} /><Metric label="Estimated risk" value={`${risk.toFixed(0)}/100`} tone={risk < 55 ? "good" : "warn"} /><Metric label="Final maneuver" value={maneuver} /></div>
        <p className="stage-note">Hybrid systems can combine learned proposals with explicit prediction and a rule-based safety check.</p>
      </div>
    </div>
  );
}

type Cell = { row: number; column: number };

function cellKey(cell: Cell) { return `${cell.row}-${cell.column}`; }

function findPath(rows: number, columns: number, start: Cell, goal: Cell, obstacles: Set<string>) {
  const queue = [start];
  const cameFrom = new Map<string, Cell>();
  const visited = new Set([cellKey(start)]);
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (queue.length) {
    const current = queue.shift()!;
    if (cellKey(current) === cellKey(goal)) break;
    for (const [rowDelta, columnDelta] of directions) {
      const next = { row: current.row + rowDelta, column: current.column + columnDelta };
      const key = cellKey(next);
      if (next.row < 0 || next.row >= rows || next.column < 0 || next.column >= columns || obstacles.has(key) || visited.has(key)) continue;
      visited.add(key);
      cameFrom.set(key, current);
      queue.push(next);
    }
  }
  const path: Cell[] = [];
  let current = goal;
  if (!cameFrom.has(cellKey(goal))) return { path, explored: visited.size };
  while (cellKey(current) !== cellKey(start)) { path.push(current); current = cameFrom.get(cellKey(current))!; }
  path.push(start);
  return { path: path.reverse(), explored: visited.size };
}

function PlannerLab() {
  const rows = 10;
  const columns = 16;
  const start = { row: 5, column: 1 };
  const goal = { row: 2, column: 14 };
  const [obstacles, setObstacles] = useState<Set<string>>(() => new Set(["3-6", "4-6", "5-6", "6-6", "6-7", "2-10", "3-10", "4-10", "7-11", "7-12"]));
  const result = useMemo(() => findPath(rows, columns, start, goal, obstacles), [obstacles]);
  const path = new Set(result.path.map(cellKey));
  function toggle(cell: Cell) {
    const key = cellKey(cell);
    if (key === cellKey(start) || key === cellKey(goal)) return;
    setObstacles((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  }
  return (
    <div className="planner-lab">
      <div className="planner-toolbar"><span>Click cells to add or remove obstacles.</span><Metric label="Path cost" value={result.path.length ? String(result.path.length - 1) : "No route"} tone={result.path.length ? "good" : "warn"} /><Metric label="Explored cells" value={String(result.explored)} /><button type="button" className="text-button" onClick={() => setObstacles(new Set())}>Clear grid</button></div>
      <div className="planner-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: rows * columns }, (_, index) => {
          const cell = { row: Math.floor(index / columns), column: index % columns };
          const key = cellKey(cell);
          const className = key === cellKey(start) ? "start" : key === cellKey(goal) ? "goal" : obstacles.has(key) ? "obstacle" : path.has(key) ? "path" : "";
          return <button type="button" key={key} className={className} aria-label={`Grid row ${cell.row + 1}, column ${cell.column + 1}${className ? `, ${className}` : ""}`} onClick={() => toggle(cell)} />;
        })}
      </div>
      <div className="planner-legend"><span className="start">Start</span><span className="goal">Goal</span><span className="obstacle">Obstacle</span><span className="path">Route</span></div>
    </div>
  );
}

function TrajectoryLab() {
  const [speed, setSpeed] = useState(15);
  const [offset, setOffset] = useState(0);
  const [comfort, setComfort] = useState(60);
  const curve = 105 - offset * 22;
  const spread = 12 + speed * 1.1 - comfort * 0.08;
  return (
    <div className="lab-grid trajectory-lab">
      <div className="lab-controls">
        <RangeControl label="Speed" value={speed} min={5} max={30} unit=" m/s" onChange={setSpeed} />
        <RangeControl label="Lane offset" value={offset} min={-1.5} max={1.5} step={0.1} unit=" m" onChange={setOffset} />
        <RangeControl label="Comfort weight" value={comfort} min={0} max={100} unit="%" onChange={setComfort} />
      </div>
      <div className="lab-stage trajectory-stage">
        <svg viewBox="0 0 520 230" aria-label="Candidate Frenet trajectories">
          <path className="lane-line" d="M0 60H520M0 115H520M0 170H520" />
          <rect className="trajectory-obstacle" x="340" y="88" width="60" height="38" rx="4" />
          {[-2, -1, 1, 2].map((variant) => <path key={variant} className="candidate-path" d={`M20 115 C160 115 220 ${curve + variant * spread} 500 ${curve + variant * 9}`} />)}
          <path className="selected-path" d={`M20 115 C160 115 230 ${curve} 500 ${curve}`} />
          <path className="ego-car" d="M15 101h46l14 14-14 14H15Z" />
        </svg>
        <div className="metric-row"><Metric label="Avg. jerk" value={`${Math.max(.2, (100 - comfort) / 28).toFixed(2)} m/s³`} /><Metric label="Min. clearance" value={`${Math.max(.6, 3.4 - Math.abs(offset) * .8).toFixed(1)} m`} tone={Math.abs(offset) < 1.3 ? "good" : "warn"} /></div>
      </div>
    </div>
  );
}

function ControlLab() {
  const [kp, setKp] = useState(1.2);
  const [ki, setKi] = useState(0.25);
  const [kd, setKd] = useState(0.4);
  const points = Array.from({ length: 60 }, (_, index) => {
    const t = index / 9;
    const damping = Math.max(.08, .2 + kd * .35 - kp * .05);
    const response = 1 - Math.exp(-Math.max(.2, kp + ki) * t * .45) * Math.cos((kp * 1.8 + .5) * t) * Math.exp(-damping * t);
    return [20 + index * 7.6, 180 - response * 115];
  });
  const path = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const overshoot = Math.max(0, (kp * 22 - kd * 24 - 8));
  return (
    <div className="lab-grid control-lab">
      <div className="lab-controls">
        <RangeControl label="Kp" value={kp} min={0.2} max={3} step={0.1} onChange={setKp} />
        <RangeControl label="Ki" value={ki} min={0} max={1.2} step={0.05} onChange={setKi} />
        <RangeControl label="Kd" value={kd} min={0} max={1.5} step={0.05} onChange={setKd} />
      </div>
      <div className="lab-stage control-stage">
        <svg viewBox="0 0 500 220" aria-label="PID step response"><path className="setpoint-line" d="M20 180V65H480" /><path className="response-line" d={path} /></svg>
        <div className="metric-row"><Metric label="Overshoot" value={`${overshoot.toFixed(0)}%`} tone={overshoot < 15 ? "good" : "warn"} /><Metric label="Steady-state error" value={`${Math.max(0, 12 - ki * 18).toFixed(1)}%`} /></div>
      </div>
    </div>
  );
}

function BudgetLab({ chapterId }: LabProps) {
  const deadlineLabels = ["Perception", "Localization", "Planning", "Control"];
  const scalingLabels = ["Sensing", "Mapping", "Validation", "Operations"];
  const accessLabels = ["Compute", "Communication", "Energy", "Storage"];
  const labels = chapterId === 9 ? deadlineLabels : chapterId === 13 ? scalingLabels : accessLabels;
  const [values, setValues] = useState([42, 23, 25, 10]);
  const total = values.reduce((sum, value) => sum + value, 0);
  const balance = 100 - Math.min(100, values.reduce((sum, value) => sum + Math.abs(value - 25), 0));
  function update(index: number, value: number) { setValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item)); }
  return (
    <div className="lab-grid budget-lab">
      <div className="lab-controls">{labels.map((label, index) => <RangeControl key={label} label={label} value={values[index]} min={5} max={65} unit={chapterId === 9 ? " ms" : "%"} onChange={(value) => update(index, value)} />)}</div>
      <div className="lab-stage budget-stage">
        <div className="budget-ring" style={{ "--score": `${Math.min(100, balance)}%` } as React.CSSProperties}><strong>{chapterId === 9 ? total : Math.round(balance)}</strong><span>{chapterId === 9 ? "ms total" : "balance score"}</span></div>
        <div className="metric-row"><Metric label={chapterId === 9 ? "Deadline" : "Allocation total"} value={chapterId === 9 ? "100 ms" : `${total}%`} tone={chapterId === 9 ? (total <= 100 ? "good" : "warn") : (Math.abs(total - 100) < 6 ? "good" : "warn")} /><Metric label="Bottleneck" value={labels[values.indexOf(Math.max(...values))]} /></div>
      </div>
    </div>
  );
}

function QueueLab() {
  const [publish, setPublish] = useState(30);
  const [process, setProcess] = useState(34);
  const [depth, setDepth] = useState(10);
  const backlog = Math.max(0, publish - process);
  const dropped = Math.max(0, backlog * 5 - depth);
  return (
    <div className="lab-grid queue-lab">
      <div className="lab-controls"><RangeControl label="Publisher rate" value={publish} min={5} max={100} unit=" Hz" onChange={setPublish} /><RangeControl label="Subscriber capacity" value={process} min={5} max={100} unit=" Hz" onChange={setProcess} /><RangeControl label="Queue depth" value={depth} min={1} max={30} onChange={setDepth} /></div>
      <div className="lab-stage queue-stage">
        <div className="queue-visual"><span>Publisher</span><div>{Array.from({ length: Math.min(depth, Math.max(1, backlog + 2)) }, (_, index) => <i key={index} className={index >= depth - dropped ? "drop" : ""} />)}</div><span>Subscriber</span></div>
        <div className="metric-row"><Metric label="Backlog growth" value={`${backlog} msg/s`} tone={backlog === 0 ? "good" : "warn"} /><Metric label="Dropped / 5 s" value={String(dropped)} tone={dropped === 0 ? "good" : "warn"} /></div>
      </div>
    </div>
  );
}

function TradeoffLab({ chapterId }: LabProps) {
  return chapterId === 8 ? <ControllerTradeoffLab /> : <DeploymentTradeoffLab />;
}

function ControllerTradeoffLab() {
  const [constraints, setConstraints] = useState(65);
  const [compute, setCompute] = useState(45);
  const [prediction, setPrediction] = useState(70);
  const scores = [
    { name: "PID", value: (100 - constraints) * .25 + (100 - prediction) * .2 + (100 - compute) * .55 },
    { name: "MPC", value: constraints * .4 + prediction * .42 + compute * .18 },
  ];
  const winner = scores.reduce((best, item) => item.value > best.value ? item : best);
  return (
    <div className="lab-grid tradeoff-lab">
      <div className="lab-controls"><RangeControl label="Constraint priority" value={constraints} min={0} max={100} unit="%" onChange={setConstraints} /><RangeControl label="Compute available" value={compute} min={0} max={100} unit="%" onChange={setCompute} /><RangeControl label="Prediction priority" value={prediction} min={0} max={100} unit="%" onChange={setPrediction} /></div>
      <div className="lab-stage bar-stage">{scores.map((item) => <div className={`score-bar ${item.name === winner.name ? "winner" : ""}`} key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value.toFixed(0)}</strong></div>)}<p className="stage-note"><strong>{winner.name}</strong> best fits these priorities. PID is simpler; MPC predicts ahead and handles explicit constraints at greater compute cost.</p></div>
    </div>
  );
}

function DeploymentTradeoffLab() {
  const [scope, setScope] = useState(55);
  const [oversight, setOversight] = useState(55);
  const [cost, setCost] = useState(50);
  const scores = [
    { name: "Robotaxi", value: (100 - scope) * .35 + oversight * .4 + cost * .25 },
    { name: "Shuttle", value: (100 - scope) * .5 + oversight * .28 + (100 - cost) * .22 },
    { name: "Freight corridor", value: scope * .2 + oversight * .34 + cost * .46 },
    { name: "Consumer L2/L3", value: scope * .5 + (100 - oversight) * .28 + (100 - cost) * .22 },
  ];
  const winner = scores.reduce((best, item) => item.value > best.value ? item : best);
  return (
    <div className="lab-grid tradeoff-lab">
      <div className="lab-controls"><RangeControl label="Operating scope" value={scope} min={0} max={100} unit="%" onChange={setScope} /><RangeControl label="Remote oversight" value={oversight} min={0} max={100} unit="%" onChange={setOversight} /><RangeControl label="Upfront investment" value={cost} min={0} max={100} unit="%" onChange={setCost} /></div>
      <div className="lab-stage bar-stage">{scores.map((item) => <div className={`score-bar ${item.name === winner.name ? "winner" : ""}`} key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.value}%` }} /></i><strong>{item.value.toFixed(0)}</strong></div>)}<p className="stage-note">Scenario fit: <strong>{winner.name}</strong>. This is a trade-off explorer, not a current-market ranking.</p></div>
    </div>
  );
}

function FuturesLab() {
  const [technology, setTechnology] = useState(65);
  const [regulation, setRegulation] = useState(50);
  const [trust, setTrust] = useState(45);
  const [infrastructure, setInfrastructure] = useState(55);
  const readiness = technology * .35 + regulation * .24 + trust * .23 + infrastructure * .18;
  const selected = readiness > 72 ? "Geofenced scale-up" : readiness > 52 ? "Steady pilots" : readiness > 36 ? "Limited deployments" : "Deployment slowdown";
  return (
    <div className="lab-grid futures-lab">
      <div className="lab-controls"><RangeControl label="Technology readiness" value={technology} min={0} max={100} unit="%" onChange={setTechnology} /><RangeControl label="Regulatory support" value={regulation} min={0} max={100} unit="%" onChange={setRegulation} /><RangeControl label="Public trust" value={trust} min={0} max={100} unit="%" onChange={setTrust} /><RangeControl label="Infrastructure" value={infrastructure} min={0} max={100} unit="%" onChange={setInfrastructure} /></div>
      <div className="lab-stage industry-futures-stage"><div className="future-horizon"><span style={{ width: `${readiness}%` }} /><i>2026</i><b>2035</b></div><Metric label="Plausible direction" value={selected} tone={readiness > 50 ? "good" : "warn"} /><p>Deployment depends on technical capability, regulation, public trust, and supporting infrastructure moving together.</p></div>
    </div>
  );
}

function ThreatLab({ demo }: LabProps) {
  const sensorMode = demo.title.toLowerCase().includes("sensor");
  const attacks = sensorMode
    ? [{ name: "GNSS spoofing", category: "Integrity", defense: "Cross-check GNSS against IMU, LiDAR, and map constraints." }, { name: "Camera dazzling", category: "Availability", defense: "Detect saturation and degrade safely using redundant sensing." }, { name: "LiDAR ghost returns", category: "Integrity", defense: "Use temporal and cross-modal consistency checks." }]
    : [{ name: "Eavesdropping", category: "Confidentiality", defense: "Encrypt sensitive data and limit access." }, { name: "Message alteration", category: "Integrity", defense: "Authenticate messages and verify signatures." }, { name: "Channel flooding", category: "Availability", defense: "Rate-limit, prioritize safety traffic, and isolate faults." }];
  const [active, setActive] = useState(0);
  const [guess, setGuess] = useState<string>();
  const attack = attacks[active];
  function next() { setActive((current) => (current + 1) % attacks.length); setGuess(undefined); }
  return (
    <div className="lab-grid threat-lab">
      <div className="lab-controls"><span className="control-label">Classify the attack</span><h4>{attack.name}</h4><div className="option-grid vertical">{["Confidentiality", "Integrity", "Availability"].map((item) => <button key={item} type="button" className={guess === item ? "selected" : ""} onClick={() => setGuess(item)}>{item}</button>)}</div></div>
      <div className={`lab-stage threat-stage ${guess ? (guess === attack.category ? "success" : "warning") : ""}`}>{guess ? <><strong>{guess === attack.category ? "Correct" : `Primary impact: ${attack.category}`}</strong><p>{attack.defense}</p><button type="button" className="text-button" onClick={next}>Classify another →</button></> : <><div className="shield-visual">CIA</div><p>Choose the security property most directly harmed by this attack.</p></>}</div>
    </div>
  );
}

function TestingLab() {
  const [stage, setStage] = useState<"MIL" | "SIL" | "HIL">("SIL");
  const data = {
    MIL: { fidelity: 35, cost: 18, parts: ["Model", "Model", "Simulated plant"], catches: "Early algorithm and control-logic errors" },
    SIL: { fidelity: 65, cost: 42, parts: ["Production code", "Simulated inputs", "Simulated plant"], catches: "Software integration and numerical behavior" },
    HIL: { fidelity: 92, cost: 82, parts: ["Production code", "Real ECU", "Real-time plant"], catches: "Timing, I/O, electrical, and hardware integration faults" },
  }[stage];
  return (
    <div className="lab-grid testing-lab">
      <div className="lab-controls"><div className="segmented-control">{(["MIL", "SIL", "HIL"] as const).map((item) => <button key={item} type="button" className={stage === item ? "active" : ""} onClick={() => setStage(item)}>{item}</button>)}</div><p>{data.catches}</p><div className="metric-row compact"><Metric label="Fidelity" value={`${data.fidelity}%`} /><Metric label="Relative cost" value={`${data.cost}%`} /></div></div>
      <div className="lab-stage test-stack">{data.parts.map((part, index) => <div key={`${part}-${index}`}><span>{index + 1}</span><strong>{part}</strong></div>)}</div>
    </div>
  );
}

function CoverageLab() {
  const [weather, setWeather] = useState(40);
  const [speed, setSpeed] = useState(55);
  const [occlusion, setOcclusion] = useState(35);
  const risk = Math.min(100, weather * .3 + speed * .35 + occlusion * .45);
  const rarity = Math.max(1, Math.round(10000 / Math.max(1, risk ** 1.55)));
  return (
    <div className="lab-grid coverage-lab">
      <div className="lab-controls"><RangeControl label="Weather severity" value={weather} min={0} max={100} unit="%" onChange={setWeather} /><RangeControl label="Ego speed" value={speed} min={10} max={100} unit=" km/h" onChange={setSpeed} /><RangeControl label="Occlusion" value={occlusion} min={0} max={100} unit="%" onChange={setOcclusion} /></div>
      <div className="lab-stage coverage-stage"><div className="risk-map"><span className="risk-point" style={{ left: `${speed}%`, top: `${100 - occlusion}%` }} /><i className="risk-zone" style={{ opacity: risk / 100 }} /></div><div className="metric-row"><Metric label="Scenario risk" value={`${risk.toFixed(0)}/100`} tone={risk < 55 ? "good" : "warn"} /><Metric label="Naive discovery" value={`≈ 1 in ${rarity} runs`} /></div></div>
    </div>
  );
}

function ArchitectureLab({ chapterId }: LabProps) {
  if (chapterId === 10) return <EndToEndArchitectureLab />;
  return <VehicleComputingArchitectureLab />;
}

function EndToEndArchitectureLab() {
  const [modular, setModular] = useState(true);
  const nodes = modular ? ["Sensors", "Perception", "Prediction", "Planning", "Control"] : ["Sensors", "Unified learned model", "Trajectory / control"];
  return (
    <div className="lab-grid architecture-lab">
      <div className="lab-controls"><div className="segmented-control"><button type="button" className={modular ? "active" : ""} onClick={() => setModular(true)}>Modular</button><button type="button" className={!modular ? "active" : ""} onClick={() => setModular(false)}>End-to-end</button></div><p>{modular ? "Explicit modules expose intermediate states and isolate many failures, but interfaces can propagate error." : "A unified model reduces hand-built interfaces but demands broad data, careful verification, and stronger interpretability tools."}</p></div>
      <div className="lab-stage architecture-stage">{nodes.map((node, index) => <div key={node} className={!modular && index === 1 ? "vpi" : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{node}</strong></div>)}</div>
    </div>
  );
}

function VehicleComputingArchitectureLab() {
  const [modular, setModular] = useState(true);
  const nodes = modular ? ["Apps", "Vehicle Programming Interface", "Resource services", "Heterogeneous vehicle"] : ["Application", "Private middleware", "Fixed hardware", "Closed vehicle"];
  return (
    <div className="lab-grid architecture-lab">
      <div className="lab-controls"><div className="segmented-control"><button type="button" className={!modular ? "active" : ""} onClick={() => setModular(false)}>Traditional</button><button type="button" className={modular ? "active" : ""} onClick={() => setModular(true)}>Vehicle computing</button></div><p>{modular ? "A VPI exposes reusable computation, communication, energy, sensing, and storage services." : "A vertically integrated stack binds applications tightly to one vehicle and hardware configuration."}</p></div>
      <div className="lab-stage architecture-stage">{nodes.map((node, index) => <div key={node} className={modular && index === 1 ? "vpi" : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{node}</strong></div>)}</div>
    </div>
  );
}

function OffloadLab() {
  const [task, setTask] = useState("Emergency braking");
  const [location, setLocation] = useState("Onboard");
  const profiles: Record<string, Record<string, [number, number, number]>> = {
    "Emergency braking": { Onboard: [8, 78, 96], Edge: [32, 58, 72], Cloud: [105, 36, 30] },
    "HD map update": { Onboard: [42, 82, 62], Edge: [28, 55, 91], Cloud: [74, 34, 79] },
    "Fleet learning": { Onboard: [65, 95, 52], Edge: [38, 64, 84], Cloud: [82, 31, 95] },
  };
  const metrics = profiles[task][location];
  return (
    <div className="lab-grid offload-lab">
      <div className="lab-controls"><label className="select-control">Task<select value={task} onChange={(event) => setTask(event.target.value)}>{Object.keys(profiles).map((item) => <option key={item}>{item}</option>)}</select></label><div className="segmented-control">{["Onboard", "Edge", "Cloud"].map((item) => <button type="button" key={item} className={location === item ? "active" : ""} onClick={() => setLocation(item)}>{item}</button>)}</div></div>
      <div className="lab-stage offload-stage"><div className="compute-route"><span className={location === "Onboard" ? "active" : ""}>Vehicle</span><i /><span className={location === "Edge" ? "active" : ""}>RSU / edge</span><i /><span className={location === "Cloud" ? "active" : ""}>Cloud</span></div><div className="metric-row"><Metric label="Latency" value={`${metrics[0]} ms`} tone={metrics[0] < 40 ? "good" : "warn"} /><Metric label="Energy cost" value={`${metrics[1]}/100`} /><Metric label="Suitability" value={`${metrics[2]}/100`} tone={metrics[2] > 75 ? "good" : "warn"} /></div></div>
    </div>
  );
}
