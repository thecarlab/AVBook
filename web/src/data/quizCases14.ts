import type { ChapterAssessment } from "../types";
type C = ChapterAssessment["cases"][number];
type P = C["probes"]["application"];
type S = keyof C["probes"];
const ids = ["a", "b", "c", "d"] as const,
  skills: S[] = [
    "application",
    "diagnosis",
    "comparison",
    "causal",
    "transfer",
  ];
function misconception(text: string, index: number, why: string): string {
  const choice = `“${text}”`;
  let reason: string;
  if (
    /ignore|remove|disable|drop|hide|skip|delete|assume|trust|treat|replace/i.test(
      text,
    )
  )
    reason =
      "discards evidence, redundancy, or a safeguard instead of resolving the stated failure.";
  else if (/actuator|brak|steer|control|torque/i.test(text))
    reason =
      "assigns physical authority without preserving the verified local safety path.";
  else if (
    /\b(reduces?|increases?|creates?|shortens?|fix(?:es)?|makes?|changes?|repairs?|prevents?|alters?|produces?|improves?|extends?|converts?|guarantees?)\b/i.test(
      text,
    )
  )
    reason =
      "asserts a causal effect that the scenario provides no mechanism or evidence to support.";
  else if (
    /upload|retain|history|publish|stream|share|sell|copy|advertis|public identifier|identifiable|home-linked|unrelated cabin|cabin video|raw pedestrian video|full route/i.test(
      text,
    )
  )
    reason =
      "expands collection, linkage, disclosure, or retention beyond the stated service purpose.";
  else if (
    /energy|battery|power|charge|discharge|GPU|compute|thermal/i.test(text)
  )
    reason =
      "ignores the workload's energy, thermal, deadline, or mobility-reserve constraint.";
  else if (
    /cloud|edge|local|offboard|remote|onboard|RSU|peer vehicle/i.test(text)
  )
    reason =
      "places work or authority where the stated latency and connectivity evidence cannot support it.";
  else if (
    /\b(always|never|every|only|all|infinite|exact|cannot|none)\b/i.test(text)
  )
    reason =
      "turns a conditional observation into an absolute claim that the evidence does not justify.";
  else
    reason =
      "targets a different quantity or dependency from the one the decision actually requires.";

  const distinction = [
    "It would answer the question from an unsupported premise.",
    "It leaves the scenario's limiting dependency unresolved.",
    "It cannot justify the requested operational conclusion.",
    "It conflicts with the required fallback or governance boundary.",
  ][index];
  const caseEvidence =
    why.charAt(0).toLowerCase() + why.slice(1).replace(/\.$/, "");
  return `${choice} ${reason} The case instead shows that ${caseEvidence}. ${distinction}`;
}
function q(
  skill: S,
  prompt: string,
  obj: string,
  ci: 0 | 1 | 2 | 3,
  opts: [string, string, string, string],
  why: string,
  page: number,
): P {
  return {
    skill,
    difficulty:
      skill === "application" || skill === "transfer"
        ? "advanced"
        : "intermediate",
    prompt,
    objectiveIds: [obj],
    choices: opts.map((text, i) => ({
      id: ids[i],
      text,
      feedback: i === ci ? `Correct. ${why}` : misconception(text, i, why),
    })) as P["choices"],
    correctChoiceId: ids[ci],
    reasoning: [why],
    takeaway: why,
    references: [{ section: page <= 205 ? "14.1" : "14.2", page }],
  };
}
type M = [string, string, [string, string, string], string];
function mc(
  id: string,
  stimulus: C["stimulus"],
  obj: string,
  page: number,
  start: 0 | 1 | 2 | 3,
  items: [M, M, M, M, M],
): C {
  const probes = {} as C["probes"];
  items.forEach((m, i) => {
    const [p, a, w, why] = m,
      k = skills[i],
      ci = ((start + i) % 4) as 0 | 1 | 2 | 3,
      o = [...w];
    o.splice(ci, 0, a);
    probes[k] = q(
      k,
      p,
      obj,
      ci,
      o as [string, string, string, string],
      why,
      page,
    );
  });
  return { id, chapterId: 14, stimulus, probes };
}
const objectives: ChapterAssessment["objectives"] = [
  {
    id: "ch14-vehicle-computing",
    chapterId: 14,
    behavior:
      "Treat vehicles as mobile compute nodes that remain locally autonomous while collaborating.",
    priority: "core",
    references: [{ section: "14.1", page: 204 }],
  },
  {
    id: "ch14-decoupling",
    chapterId: 14,
    behavior:
      "Reason about programmable interfaces, modular services, isolation, and shared vehicle data.",
    priority: "core",
    references: [{ section: "14.1", page: 204 }],
  },
  {
    id: "ch14-computation",
    chapterId: 14,
    behavior:
      "Place and schedule latency-critical and elastic computation under heterogeneous resource limits.",
    priority: "core",
    references: [{ section: "14.1", page: 205 }],
  },
  {
    id: "ch14-communication",
    chapterId: 14,
    behavior:
      "Design V2X and edge communication around freshness, bandwidth, mobility, and disconnection.",
    priority: "core",
    references: [{ section: "14.1", page: 205 }],
  },
  {
    id: "ch14-energy",
    chapterId: 14,
    behavior:
      "Balance propulsion reserve, onboard workloads, charging, and V2G participation.",
    priority: "core",
    references: [{ section: "14.1", page: 205 }],
  },
  {
    id: "ch14-sensing",
    chapterId: 14,
    behavior:
      "Use onboard and ecosystem sensing with provenance, calibration, and privacy controls.",
    priority: "core",
    references: [{ section: "14.1", page: 205 }],
  },
  {
    id: "ch14-storage",
    chapterId: 14,
    behavior:
      "Separate low-latency buffers from forensic and longitudinal storage with bounded retention.",
    priority: "core",
    references: [{ section: "14.1", page: 205 }],
  },
  {
    id: "ch14-placement",
    chapterId: 14,
    behavior:
      "Choose local, peer, edge, and cloud placement by deadline, data movement, and failure mode.",
    priority: "core",
    references: [{ section: "14.2", page: 206 }],
  },
  {
    id: "ch14-civic-nodes",
    chapterId: 14,
    behavior:
      "Evaluate parked and mobile civic services without compromising transportation duties.",
    priority: "core",
    references: [{ section: "14.2", page: 206 }],
  },
  {
    id: "ch14-governance",
    chapterId: 14,
    behavior:
      "Account for privacy, ownership, auditability, interoperability, and equitable public value.",
    priority: "core",
    references: [{ section: "14.2", page: 207 }],
  },
];
const cases: C[] = [
  mc(
    "local-emergency-braking",
    {
      kind: "table",
      caption: "Placement options for pedestrian braking",
      columns: ["site", "round trip", "link state"],
      rows: [
        ["vehicle", "8 ms", "local"],
        ["edge", "34 ms", "variable"],
        ["cloud", "120 ms", "cellular"],
      ],
    },
    "ch14-placement",
    204,
    0,
    [
      [
        "Where should the collision response run?",
        "On the vehicle",
        [
          "At a cloud region after uploading raw cameras",
          "At a roadside server with no local fallback",
          "On a peer vehicle whose route may diverge",
        ],
        "The deadline and safety function require local autonomy.",
      ],
      [
        "What is wrong with cloud-only control?",
        "Connectivity becomes a safety dependency",
        [
          "Cloud processors cannot execute neural inference",
          "Raw sensor data contains no braking evidence",
          "Vehicle actuators accept commands from local code only by physics",
        ],
        "The link can delay or disappear.",
      ],
      [
        "Which workload fits cloud better?",
        "Offline fleet training",
        [
          "A ten-millisecond brake command",
          "Current steering stabilization",
          "Immediate obstacle tracking through a tunnel",
        ],
        "Elastic analysis lacks the actuation deadline.",
      ],
      [
        "Why retain local sensing and compute?",
        "Mobility changes network reachability",
        [
          "Local processors increase cellular propagation distance",
          "Vehicle motion removes the need for fresh state",
          "Cloud placement makes sensor timestamps current",
        ],
        "A moving node cannot assume a stable path.",
      ],
      [
        "An edge node becomes faster. What transfers?",
        "Keep a local safe path",
        [
          "Move emergency actuation fully offboard",
          "Drop onboard perception before field testing",
          "Treat lower mean latency as continuous availability",
        ],
        "Faster collaboration does not remove outage risk.",
      ],
    ],
  ),
  mc(
    "cloud-map-batch",
    {
      kind: "log",
      caption: "Fleet HD-map update",
      lines: [
        "400 parked vehicles",
        "2 TB route history",
        "deadline: next morning",
        "cloud uplink available",
        "vehicle GPUs needed for departure at 06:00",
      ],
    },
    "ch14-placement",
    206,
    1,
    [
      [
        "What placement is strongest?",
        "Cloud aggregation with departure-aware upload",
        [
          "Real-time steering ECUs during the morning trip",
          "One moving vehicle with no access to other histories",
          "Roadside control loops that discard the stored routes",
        ],
        "The job is global, data-rich, and nonurgent.",
      ],
      [
        "What resource conflict needs control?",
        "Mapping can delay mobility readiness",
        [
          "Cloud storage reduces vehicle battery mass",
          "Route histories change steering geometry after upload",
          "Parked computation removes the next departure",
        ],
        "Energy and compute must remain available for transport.",
      ],
      [
        "Which policy is preferable?",
        "Pause before departure and preserve reserve",
        [
          "Finish each batch despite a driver request",
          "Drain the traction battery to maximize map freshness",
          "Delete unfinished data without checkpointing",
        ],
        "Primary mobility has priority.",
      ],
      [
        "Why aggregate histories?",
        "Multiple routes improve map coverage",
        [
          "Cloud upload makes each sensor calibration exact",
          "Combining logs removes privacy obligations",
          "More data makes stale observations current",
        ],
        "Fleet observations cover different locations and times.",
      ],
      [
        "A disaster cuts cloud access. What transfers?",
        "Defer the elastic job",
        [
          "Block vehicle departure",
          "Run map aggregation inside brake control",
          "Upload through an unauthenticated public relay",
        ],
        "The service can wait without impairing autonomy.",
      ],
    ],
  ),
  mc(
    "edge-intersection-fusion",
    {
      kind: "scenario",
      text: "Four vehicles approach an occluded intersection. An RSU sees all approaches, but its messages have 25-90 ms jitter.",
    },
    "ch14-communication",
    205,
    2,
    [
      [
        "How should vehicles use the RSU?",
        "Fuse fresh messages with onboard sensing",
        [
          "Replace local perception with the RSU stream",
          "Execute remote trajectories as actuator commands",
          "Treat each delayed packet as current ground truth",
        ],
        "Edge context helps without becoming sole authority.",
      ],
      [
        "What is the main data-quality risk?",
        "Age varies across packets",
        [
          "Occlusion makes roadside sensing physically impossible",
          "V2X removes sender identity",
          "Vehicles stop moving during jitter",
        ],
        "Moving actors make freshness critical.",
      ],
      [
        "Which metadata is essential?",
        "Time and frame transform",
        [
          "The RSU enclosure color",
          "Cloud account storage quota",
          "Vehicle entertainment profile",
        ],
        "Fusion needs temporal and spatial alignment.",
      ],
      [
        "Why can edge placement help?",
        "It reduces path length and shares a vantage point",
        [
          "It makes wireless loss cease",
          "It converts remote pixels into actuator torque",
          "It fixes each vehicle sensor calibration",
        ],
        "Nearby infrastructure offers low-latency shared context.",
      ],
      [
        "The RSU fails mid-crossing. What transfers?",
        "Continue through local bounded autonomy",
        [
          "Freeze each actuator until edge recovery",
          "Broadcast raw controls from another road",
          "Assume the last packet remains fresh",
        ],
        "Collaboration should degrade gracefully.",
      ],
    ],
  ),
  mc(
    "mobility-aware-offload",
    {
      kind: "table",
      caption: "Inference offload along a route",
      columns: ["segment", "link", "edge RTT"],
      rows: [
        ["downtown", "5G", "22 ms"],
        ["tunnel", "none", "n/a"],
        ["suburb", "5G", "65 ms"],
      ],
    },
    "ch14-placement",
    206,
    3,
    [
      [
        "What is the best architecture?",
        "Adaptive offload with local fallback",
        [
          "Cloud-exclusive inference for the entire route",
          "Edge-exclusive control that pauses in the tunnel",
          "Fixed offload chosen from downtown latency alone",
        ],
        "Placement should follow mobility and deadlines.",
      ],
      [
        "Which segment disproves cloud dependence?",
        "The tunnel",
        [
          "Downtown because its link is fast",
          "The suburb because some connectivity remains",
          "No segment because route averages are adequate",
        ],
        "Connectivity vanishes completely.",
      ],
      [
        "What should the scheduler monitor?",
        "Deadline, link, energy, and load",
        [
          "Signal bars without task deadline",
          "Compute utilization without mobility state",
          "Battery level without workload criticality",
        ],
        "Several ACCESS resources jointly constrain placement.",
      ],
      [
        "Why migrate work before the tunnel?",
        "Predicted disconnection permits preparation",
        [
          "Migration extends radio coverage through rock",
          "The tunnel changes cloud ownership",
          "Preloading makes stale outputs safe indefinitely",
        ],
        "Route context can trigger local warm-up.",
      ],
      [
        "A handoff drops 3% of frames. What transfers?",
        "Measure stateful recovery and output age",
        [
          "Report mean RTT alone",
          "Duplicate old outputs as fresh",
          "Disable handoffs in the operating claim",
        ],
        "Mobility failures affect continuity, not just latency.",
      ],
    ],
  ),
  mc(
    "vehicle-api-decoupling",
    {
      kind: "log",
      caption: "Vehicle programming interface",
      lines: [
        "ADAS requests speed and obstacle state",
        "maintenance app requests diagnostic history",
        "third-party app requests cabin media",
        "all previously read the CAN bus directly",
      ],
    },
    "ch14-decoupling",
    204,
    0,
    [
      [
        "What redesign fits vehicle computing?",
        "Expose scoped typed services",
        [
          "Give each application unrestricted bus access",
          "Copy raw CAN frames into a public cloud bucket",
          "Merge all applications into one privileged process",
        ],
        "A programming interface can decouple data and consumers.",
      ],
      [
        "What risk does direct bus access create?",
        "Apps can interfere across functions",
        [
          "CAN frames become unreadable after typing",
          "Decoupling removes application updates",
          "Vehicle data loses timestamps when scoped",
        ],
        "Shared low-level access expands failure impact.",
      ],
      [
        "Which permission should the media app receive?",
        "Cabin media, not brake control",
        [
          "Full actuator writes for lower latency",
          "Diagnostic histories from other owners",
          "Raw pedestrian video for advertising",
        ],
        "Least privilege follows service purpose.",
      ],
      [
        "Why does decoupling improve maintenance?",
        "Interfaces isolate implementation changes",
        [
          "It eliminates integration testing",
          "It fixes every vendor data schema",
          "It prevents hardware evolution",
        ],
        "Stable contracts reduce cross-layer coupling.",
      ],
      [
        "A new sensor vendor is added. What transfers?",
        "Adapt behind the service contract",
        [
          "Rewrite each third-party application",
          "Expose vendor registers to every service",
          "Remove compatibility tests",
        ],
        "Decoupling localizes hardware adaptation.",
      ],
    ],
  ),
  mc(
    "third-party-isolation",
    {
      kind: "scenario",
      text: "A parking-payment app consumes excessive GPU and storage bandwidth while lane perception approaches its deadline.",
    },
    "ch14-decoupling",
    206,
    1,
    [
      [
        "What should the runtime do?",
        "Throttle the app and reserve safety resources",
        [
          "Let the app finish because third-party code shares the vehicle platform",
          "Slow lane perception to equalize application fairness",
          "Delete perception buffers before limiting payment storage",
        ],
        "Safety-critical scheduling needs isolation.",
      ],
      [
        "What architecture fault is exposed?",
        "No resource partition protects ADAS",
        [
          "The GPU cannot execute two kernels",
          "Storage has no effect on computation",
          "Payment apps are part of steering control",
        ],
        "Open services share finite ACCESS capacity.",
      ],
      [
        "Which evidence validates the fix?",
        "Deadline tails under app stress",
        [
          "Nominal lane accuracy with the app removed",
          "Payment completion time without ADAS",
          "GPU model name and memory capacity",
        ],
        "The conflict appears under concurrent load.",
      ],
      [
        "Why can storage traffic hurt perception?",
        "Shared buses and memory contend",
        [
          "Files change camera optics",
          "Storage writes alter lane labels",
          "Perception uses no memory",
        ],
        "Subsystems share hardware pathways.",
      ],
      [
        "Another app streams video. What transfers?",
        "Enforce quotas and admission control",
        [
          "Grant unrestricted bandwidth",
          "Move ADAS to public cloud",
          "Trust app declarations without measurement",
        ],
        "Isolation should apply to each untrusted workload.",
      ],
    ],
  ),
  mc(
    "energy-aware-scheduling",
    {
      kind: "table",
      caption: "Onboard workload budget",
      columns: ["task", "power", "deadline"],
      rows: [
        ["perception", "220 W", "30 ms"],
        ["map training", "500 W", "hours"],
        ["forensics upload", "80 W", "overnight"],
      ],
    },
    "ch14-energy",
    205,
    2,
    [
      [
        "Battery reserve is low during travel. What changes?",
        "Pause map training",
        [
          "Reduce perception frame rate below its safety requirement",
          "Upload every forensic log through weak cellular coverage",
          "Use traction reserve until the elastic job completes",
        ],
        "Elastic work should yield to mobility and safety.",
      ],
      [
        "What makes perception different?",
        "Its deadline is immediate",
        [
          "Its power number is the smallest",
          "It produces no sensor data",
          "It runs outside vehicle compute",
        ],
        "Criticality and timing outweigh energy alone.",
      ],
      [
        "When can map training resume?",
        "Parked, charged, and departure-safe",
        [
          "During emergency braking",
          "At the lowest state of charge",
          "After disabling thermal monitoring",
        ],
        "Idle capacity is conditional on energy readiness.",
      ],
      [
        "Why include departure forecasts?",
        "They set usable energy slack",
        [
          "They increase battery capacity",
          "They remove user mobility needs",
          "They make training power free",
        ],
        "A parked vehicle still has future transport obligations.",
      ],
      [
        "Thermal headroom becomes tight. What transfers?",
        "Shed elastic compute",
        [
          "Raise chip power for faster completion",
          "Ignore cooling limits while parked",
          "Throttle perception before training",
        ],
        "Energy management includes heat and power constraints.",
      ],
    ],
  ),
  mc(
    "v2x-bandwidth-priority",
    {
      kind: "log",
      caption: "Cellular congestion",
      lines: [
        "safety alert 2 kB, age 20 ms",
        "raw camera upload 40 MB, age 30 ms",
        "map batch 2 GB",
        "uplink queue 6 s",
      ],
    },
    "ch14-communication",
    205,
    3,
    [
      [
        "What should transmit first?",
        "The safety alert",
        [
          "The map batch because it is largest",
          "The raw video before checking its purpose",
          "Equal bytes from each queue",
        ],
        "Small urgent state has highest value.",
      ],
      [
        "What caused the alert risk?",
        "Bulk traffic lacks priority isolation",
        [
          "Safety packets contain too few bytes",
          "Cellular links cannot carry metadata",
          "Map data changes the alert timestamp",
        ],
        "A shared queue lets elastic work block deadlines.",
      ],
      [
        "Which design improves resilience?",
        "Separate priority queues and rate limits",
        [
          "One FIFO for all services",
          "Larger raw video frames",
          "Removal of packet ages",
        ],
        "Communication should reflect task criticality.",
      ],
      [
        "Why not upload raw video by default?",
        "It costs bandwidth and privacy",
        [
          "Video cannot support civic services",
          "Compression removes all information",
          "Local storage has infinite capacity",
        ],
        "Data movement has resource and governance costs.",
      ],
      [
        "A hazard needs one image crop. What transfers?",
        "Send the minimal relevant region",
        [
          "Upload the full drive history",
          "Delay the alert for map completion",
          "Disable local inference",
        ],
        "Purpose-limited data reduces load and exposure.",
      ],
    ],
  ),
  mc(
    "collaborative-sensing",
    {
      kind: "scenario",
      text: "A bus camera sees a fallen tree around a blind curve and shares an alert. Ego radar has not yet seen it.",
    },
    "ch14-sensing",
    205,
    0,
    [
      [
        "How should ego use the message?",
        "Slow and seek onboard confirmation",
        [
          "Ignore it until radar contact",
          "Treat the bus image as direct brake torque",
          "Replace local sensing for the route",
        ],
        "Remote sensing extends horizon but remains uncertain.",
      ],
      [
        "What makes the bus valuable?",
        "Its viewpoint differs",
        [
          "Its camera makes radar unnecessary",
          "Its vehicle class proves each alert",
          "Its route changes tree geometry",
        ],
        "Spatial diversity reveals occluded hazards.",
      ],
      [
        "Which metadata matters?",
        "Location, time, calibration, provenance",
        [
          "Passenger count and fare route",
          "Paint color and fleet branding",
          "Cloud storage tier",
        ],
        "Fusion needs trustworthy alignment.",
      ],
      [
        "Why seek confirmation?",
        "The scene may evolve or the source may err",
        [
          "Confirmation makes old packets newer",
          "Remote sensing has no safety value",
          "Onboard radar classifies tree species",
        ],
        "Cooperative evidence should be cross-checked.",
      ],
      [
        "A drone sends flood depth. What transfers?",
        "Use it as scoped external sensing",
        [
          "Grant it actuator control",
          "Assume civic data is exact",
          "Retain its raw feed without purpose limits",
        ],
        "External nodes add context, not ownership of control.",
      ],
    ],
  ),
  mc(
    "storage-retention",
    {
      kind: "table",
      caption: "Vehicle data classes",
      columns: ["data", "rate", "purpose"],
      rows: [
        ["control buffer", "2 GB/min", "real time"],
        ["incident clip", "5 GB", "forensics"],
        ["cabin video", "8 GB/h", "none stated"],
      ],
    },
    "ch14-storage",
    205,
    1,
    [
      [
        "What policy is strongest?",
        "Tier storage by purpose and retention",
        [
          "Keep every stream for vehicle lifetime",
          "Delete control buffers before decisions consume them",
          "Upload cabin video until a purpose is invented",
        ],
        "Storage needs latency and governance classes.",
      ],
      [
        "Which record deserves durable retention after a crash?",
        "The scoped incident clip",
        [
          "All cabin footage from unrelated trips",
          "Every duplicated control buffer",
          "Third-party cache files",
        ],
        "Forensic value supports bounded preservation.",
      ],
      [
        "What should happen to cabin video?",
        "Do not retain without a defined purpose",
        [
          "Sell it to offset storage cost",
          "Share it with nearby vehicles",
          "Treat capacity as consent",
        ],
        "Collection needs purpose and authorization.",
      ],
      [
        "Why use a low-latency buffer?",
        "Current control needs fast recent data",
        [
          "It replaces high-capacity storage",
          "It proves long-term auditability",
          "It lowers sensor sampling physics",
        ],
        "Real-time and longitudinal storage serve different needs.",
      ],
      [
        "Storage fills during a trip. What transfers?",
        "Preserve safety buffers and shed elastic data",
        [
          "Drop current control state",
          "Block braking until upload",
          "Erase incident evidence first",
        ],
        "Admission policy should follow criticality.",
      ],
    ],
  ),
  mc(
    "access-resource-coupling",
    {
      kind: "log",
      caption: "ACCESS stress",
      lines: [
        "new sensor +2 Gbps",
        "fusion +40% GPU",
        "logging +300 GB/day",
        "radio upload +18% power",
        "range target unchanged",
      ],
    },
    "ch14-vehicle-computing",
    205,
    2,
    [
      [
        "What review is needed?",
        "An end-to-end resource budget",
        [
          "A sensor-accuracy review with no compute or energy data",
          "A storage expansion that ignores radio power",
          "A cloud plan that assumes continuous reachability",
        ],
        "One sensing change affects all ACCESS domains.",
      ],
      [
        "What is the main diagnosis?",
        "Resources are coupled",
        [
          "Sensing is independent of storage",
          "Communication has no energy cost",
          "Compute load cannot affect mobility",
        ],
        "Data generation propagates through the platform.",
      ],
      [
        "Which addition is safest?",
        "One meeting accuracy and system headroom",
        [
          "The highest-rate sensor by itself",
          "The largest storage drive",
          "The fastest radio without energy testing",
        ],
        "Component gains need system feasibility.",
      ],
      [
        "Why can the vehicle's driving range fall?",
        "Compute and radio consume traction energy",
        [
          "Data lowers vehicle mass",
          "Storage creates battery cells",
          "Sensors shorten the route",
        ],
        "Auxiliary power competes with propulsion.",
      ],
      [
        "Compression is proposed. What transfers?",
        "Measure accuracy, latency, and energy together",
        [
          "Judge file size alone",
          "Assume compression is free",
          "Remove raw-data audit needs",
        ],
        "Optimization can trade across ACCESS dimensions.",
      ],
    ],
  ),
  mc(
    "v2g-grid-event",
    {
      kind: "scenario",
      text: "A parked EV at 80% charge is asked to support a grid outage. Its owner plans a 120 km trip in three hours.",
    },
    "ch14-energy",
    205,
    3,
    [
      [
        "What should the V2G policy do?",
        "Export within a mobility reserve",
        [
          "Discharge to the hardware minimum",
          "Reject each grid request regardless of trip slack",
          "Use the owner's predicted trip as public data",
        ],
        "Grid service should preserve transportation needs.",
      ],
      [
        "Which input is central?",
        "Required departure energy",
        ["Vehicle paint color", "Map-storage capacity", "Camera frame rate"],
        "Reserve depends on the planned trip.",
      ],
      [
        "What is a fair failure response?",
        "Stop export when reserve is threatened",
        [
          "Cancel the owner's trip",
          "Hide state of charge",
          "Continue until grid recovery",
        ],
        "Mobility is the primary function.",
      ],
      [
        "Why can V2G help cities?",
        "Fleet batteries provide distributed energy",
        [
          "Energy export increases battery capacity",
          "Vehicles replace each grid wire",
          "V2G removes charging demand",
        ],
        "Aggregated parked reserves can support stress.",
      ],
      [
        "A disaster changes the trip need. What transfers?",
        "Recompute reserve and consent",
        [
          "Keep the old schedule",
          "Publish route history",
          "Ignore user override",
        ],
        "Energy participation is dynamic and governed.",
      ],
    ],
  ),
  mc(
    "v2g-fleet-coordination",
    {
      kind: "table",
      caption: "Three parked vehicles",
      columns: ["vehicle", "SOC", "departure", "reserve"],
      rows: [
        ["A", "90%", "8 h", "40%"],
        ["B", "55%", "1 h", "50%"],
        ["C", "70%", "none", "30%"],
      ],
    },
    "ch14-energy",
    206,
    0,
    [
      [
        "Which vehicles have greatest export slack?",
        "A and C",
        [
          "B because departure is soon",
          "B and C without checking reserve",
          "All three down to zero",
        ],
        "Their charge exceeds reserve with more time flexibility.",
      ],
      [
        "Why should the scheduler protect Vehicle B?",
        "Its near departure leaves little margin",
        [
          "Lower SOC increases export value",
          "Reserve applies only to cloud jobs",
          "V2G makes travel energy unnecessary",
        ],
        "Mobility readiness is time-sensitive.",
      ],
      [
        "Which scheduler is preferable?",
        "Fleet allocation under per-vehicle constraints",
        [
          "Equal discharge regardless of plans",
          "Largest-first until empty",
          "Random export with no audit",
        ],
        "Coordination can meet grid need fairly.",
      ],
      [
        "Why should the operator audit energy exports?",
        "Energy use affects owners and battery wear",
        [
          "Audits add battery charge",
          "Logs remove consent needs",
          "V2G has no ownership question",
        ],
        "Accountability is part of participation.",
      ],
      [
        "Prices rise sharply. What transfers?",
        "Keep reserve and consent constraints",
        [
          "Override mobility for revenue",
          "Hide wear estimates",
          "Sell route predictions",
        ],
        "Economic incentives do not erase obligations.",
      ],
    ],
  ),
  mc(
    "parked-civic-compute",
    {
      kind: "scenario",
      text: "A charging fleet can process neighborhood flood maps overnight, but several vehicles may be dispatched for emergency mobility.",
    },
    "ch14-civic-nodes",
    206,
    1,
    [
      [
        "How should the service run?",
        "Preemptible with dispatch reserve",
        [
          "Nonpreemptible until every map tile finishes",
          "On steering ECUs during emergency trips",
          "Without thermal or energy admission checks",
        ],
        "Civic work should not impair mobility.",
      ],
      [
        "What makes parked vehicles useful?",
        "Idle compute and sensing capacity",
        [
          "Parking removes battery limits",
          "Charging makes data public",
          "Dispatch becomes predictable",
        ],
        "Dormant resources can support public tasks.",
      ],
      [
        "Which metric matters beside map throughput?",
        "Dispatch readiness",
        [
          "GPU utilization alone",
          "Tile count without energy",
          "Cloud file size",
        ],
        "Primary service availability remains essential.",
      ],
      [
        "Why checkpoint work?",
        "Vehicles can leave unexpectedly",
        [
          "Checkpointing prevents dispatch",
          "It increases flood depth accuracy by physics",
          "It removes privacy risks",
        ],
        "Mobility makes resources transient.",
      ],
      [
        "A heat wave raises cooling load. What transfers?",
        "Reduce civic workload",
        [
          "Raise GPU power",
          "Delay emergency dispatch",
          "Ignore thermal headroom",
        ],
        "Elastic service yields to system health.",
      ],
    ],
  ),
  mc(
    "environmental-civic-sensing",
    {
      kind: "log",
      caption: "Air-quality service",
      lines: [
        "roadside samples requested",
        "precise routes included",
        "home locations inferable",
        "city needs block-level averages",
        "raw retention proposed: 5 years",
      ],
    },
    "ch14-governance",
    207,
    2,
    [
      [
        "What design best fits the purpose?",
        "Aggregate locally and minimize route data",
        [
          "Upload precise histories with public identifiers",
          "Retain raw home-linked paths indefinitely",
          "Share cabin video with air sensors",
        ],
        "Block-level service does not need full trajectories.",
      ],
      [
        "What is the privacy risk?",
        "Routes reveal sensitive routines",
        [
          "Air readings contain no time",
          "Aggregation increases location precision",
          "Vehicle motion prevents reidentification",
        ],
        "Repeated traces can expose homes and habits.",
      ],
      [
        "Which retention is defensible?",
        "Bounded to the stated analysis need",
        [
          "Five years because storage exists",
          "Vehicle lifetime by default",
          "Until a buyer requests deletion",
        ],
        "Purpose should determine duration.",
      ],
      [
        "Why process on vehicle or edge?",
        "It can reduce raw disclosure",
        [
          "It makes sensing exact",
          "It removes security needs",
          "It grants city ownership",
        ],
        "Computation placement can support privacy.",
      ],
      [
        "A health study requests finer data. What transfers?",
        "Seek new consent and controls",
        [
          "Reuse old permission silently",
          "Publish full routes",
          "Disable audit logs",
        ],
        "A new purpose changes governance.",
      ],
    ],
  ),
  mc(
    "public-video-governance",
    {
      kind: "scenario",
      text: "Law enforcement requests real-time dash video from all nearby vehicles during an incident, including uninvolved passengers and homes.",
    },
    "ch14-governance",
    207,
    3,
    [
      [
        "What architecture is responsible?",
        "Scoped, audited, authorized access",
        [
          "A permanent public video stream",
          "Direct third-party bus access",
          "Silent retention of every nearby camera",
        ],
        "Public safety use still needs limits.",
      ],
      [
        "What is the main tradeoff?",
        "Emergency value versus privacy",
        [
          "Video quality versus vehicle mass",
          "Cloud storage versus tire pressure",
          "Radar range versus V2G power",
        ],
        "The same data can help and expose people.",
      ],
      [
        "Which control is strongest?",
        "Event, area, time, and purpose bounds",
        [
          "One fleet-wide credential",
          "No access logs",
          "Indefinite downstream copying",
        ],
        "Narrow scope reduces misuse.",
      ],
      [
        "Why require auditability?",
        "Use must be reviewable",
        [
          "Audits prevent each data breach",
          "Logs grant consent",
          "Records make raw video anonymous",
        ],
        "Accountability supports governance.",
      ],
      [
        "A missing child alert is issued. What transfers?",
        "Apply the same scoped authorization",
        [
          "Suspend privacy controls",
          "Stream unrelated cabins",
          "Retain all footage forever",
        ],
        "Urgency changes purpose, not the need for safeguards.",
      ],
    ],
  ),
  mc(
    "heterogeneous-runtime",
    {
      kind: "table",
      caption: "Fleet accelerators",
      columns: ["model", "hardware", "latency"],
      rows: [
        ["X", "GPU", "28 ms"],
        ["Y", "NPU", "24 ms"],
        ["Z", "FPGA", "41 ms"],
      ],
    },
    "ch14-computation",
    206,
    0,
    [
      [
        "What should a cross-platform runtime provide?",
        "A common contract with hardware-specific backends",
        [
          "One binary assuming identical accelerators",
          "Different application semantics per model",
          "No latency validation after deployment",
        ],
        "Abstraction should preserve behavior across hardware.",
      ],
      [
        "What does Vehicle Z's runtime result reveal?",
        "The same service misses its deadline on one platform",
        [
          "FPGA output is more accurate by definition",
          "A common API equalizes physical speed",
          "Latency has no safety meaning",
        ],
        "Portability does not imply performance equivalence.",
      ],
      [
        "Which validation is needed?",
        "Per-platform timing and output tests",
        [
          "GPU testing for all models",
          "File-format checks alone",
          "Cloud benchmarks without vehicles",
        ],
        "Each backend can fail differently.",
      ],
      [
        "Why decouple application from hardware?",
        "It improves portability and updates",
        [
          "It removes accelerator diversity",
          "It fixes vendor drivers",
          "It eliminates certification",
        ],
        "Stable services can span heterogeneous platforms.",
      ],
      [
        "A new TPU joins the fleet. What transfers?",
        "Implement and validate a backend",
        [
          "Assume GPU results transfer",
          "Expose TPU registers to apps",
          "Skip deadline tests",
        ],
        "New hardware needs contract conformance.",
      ],
    ],
  ),
  mc(
    "connectivity-outage",
    {
      kind: "log",
      caption: "Regional network outage",
      lines: [
        "cloud route service unavailable",
        "edge nodes intermittent",
        "local maps cached",
        "onboard perception healthy",
        "fleet analytics queued",
      ],
    },
    "ch14-communication",
    207,
    1,
    [
      [
        "What should continue?",
        "Local navigation within cached scope",
        [
          "Stop each vehicle in active traffic solely because analytics cannot upload",
          "Execute stale cloud routes beyond cached map support",
          "Drop onboard perception until cellular service returns",
        ],
        "Self-sufficient autonomy should survive service loss.",
      ],
      [
        "What should be deferred?",
        "Fleet analytics upload",
        ["Obstacle detection", "Steering control", "Emergency braking"],
        "Analytics is elastic.",
      ],
      [
        "Which limit should be visible?",
        "Cached-map and local-capability boundary",
        [
          "A claim of normal cloud functionality",
          "An infinite offline route range",
          "Hidden connectivity state",
        ],
        "Degraded operation needs explicit scope.",
      ],
      [
        "Why queue analytics?",
        "Store-and-forward tolerates disconnection",
        [
          "Queues make old routes current",
          "Storage repairs radio towers",
          "Backlog improves braking latency",
        ],
        "Nonurgent data can wait for a link.",
      ],
      [
        "Outage lasts a day. What transfers?",
        "Bound storage and degrade services",
        [
          "Fill safety buffers with analytics",
          "Erase incident logs first",
          "Assume recovery time",
        ],
        "Long outages create storage and freshness pressure.",
      ],
    ],
  ),
  mc(
    "cooperative-failover",
    {
      kind: "scenario",
      text: "A platoon shares perception and compute. The lead vehicle leaves unexpectedly while a follower is executing a remotely assigned lane-change plan.",
    },
    "ch14-vehicle-computing",
    207,
    2,
    [
      [
        "What should the follower do?",
        "Revalidate locally and fall back",
        [
          "Continue the remote plan without its source",
          "Freeze steering at the last command",
          "Ask the departed vehicle to retain actuator control",
        ],
        "Mobility changes membership and state.",
      ],
      [
        "What mobile-service architecture fault is exposed?",
        "No ownership handoff for a mobile service",
        [
          "Vehicles cannot communicate while moving",
          "Local sensing cannot see lanes",
          "Platoons remove deadlines",
        ],
        "Distributed roles need membership transitions.",
      ],
      [
        "Which state needs transfer?",
        "Plan provenance, time, and current world state",
        [
          "Lead vehicle media playlist",
          "Cloud billing account",
          "Paint and passenger count",
        ],
        "A safe takeover needs decision context.",
      ],
      [
        "Why is local revalidation needed?",
        "The scene changed after assignment",
        [
          "Remote plans become certified on receipt",
          "Departure makes timestamps newer",
          "Local compute cannot reject plans",
        ],
        "A plan's assumptions can expire.",
      ],
      [
        "An edge service migrates between RSUs. What transfers?",
        "Use explicit state and bounded failover",
        [
          "Hide migration events",
          "Duplicate actuator writers",
          "Drop provenance",
        ],
        "Distributed mobility requires controlled handoff.",
      ],
    ],
  ),
  mc(
    "city-vehicle-computing",
    {
      kind: "table",
      caption: "Proposed city services",
      columns: ["service", "deadline", "data", "power"],
      rows: [
        ["braking", "20 ms", "local sensors", "high"],
        ["hazard map", "2 s", "fleet summaries", "medium"],
        ["grid support", "minutes", "SOC", "variable"],
        ["air quality", "hours", "location samples", "low"],
      ],
    },
    "ch14-vehicle-computing",
    208,
    3,
    [
      [
        "What design is strongest?",
        "Place and govern each service by its constraints",
        [
          "Put every service in one cloud queue",
          "Run all services on the brake ECU",
          "Share each raw dataset with every participant",
        ],
        "Vehicle computing spans diverse deadlines and purposes.",
      ],
      [
        "Which service belongs most clearly local?",
        "Braking",
        ["Overnight air aggregation", "City hazard history", "Grid settlement"],
        "Its deadline and physical consequence are immediate.",
      ],
      [
        "Which pair needs explicit privacy design?",
        "Hazard mapping and air quality",
        [
          "Brake torque and tire force",
          "GPU temperature and fan speed",
          "Steering angle and yaw feedback",
        ],
        "Fleet location data can expose people and routes.",
      ],
      [
        "Why not maximize civic workload?",
        "Power and compute compete with mobility",
        [
          "Civic data cannot help cities",
          "Parking removes future trips",
          "Cloud use has no energy cost",
        ],
        "Public value must fit vehicle obligations.",
      ],
      [
        "A city adds health sensors. What transfers?",
        "Reassess purpose, consent, placement, and reserve",
        [
          "Reuse air-quality permissions",
          "Publish identifiable histories",
          "Assume interoperability from network access",
        ],
        "New sensing expands both value and governance risk.",
      ],
    ],
  ),
];
export const chapter14Assessment: ChapterAssessment = {
  chapterId: 14,
  objectives,
  cases,
};
