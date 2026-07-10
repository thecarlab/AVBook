import type {
  AssessmentCase,
  AssessmentChoice,
  AssessmentProbe,
  AssessmentChoiceId,
  ChapterAssessment,
  CognitiveSkill,
  QuizDifficulty,
  QuizStimulus,
} from "../types";

type ChoiceSpec = readonly [
  text: string,
  feedback: string,
  misconception?: string,
];
type ChoiceMap = Record<AssessmentChoiceId, ChoiceSpec>;
const IDS: readonly AssessmentChoiceId[] = ["a", "b", "c", "d"];

function q(
  skill: CognitiveSkill,
  difficulty: QuizDifficulty,
  prompt: string,
  objectiveIds: [string, ...string[]],
  correctChoiceId: AssessmentChoiceId,
  choiceMap: ChoiceMap,
  reasoning: [string, ...string[]],
  takeaway: string,
  section: string,
  page: number,
): AssessmentProbe {
  const choices = IDS.map((id) => {
    const [text, feedback, misconception] = choiceMap[id];
    return { id, text, feedback, misconception };
  }) as [
    AssessmentChoice,
    AssessmentChoice,
    AssessmentChoice,
    AssessmentChoice,
  ];
  return {
    skill,
    difficulty,
    prompt,
    objectiveIds,
    choices,
    correctChoiceId,
    reasoning,
    takeaway,
    references: [{ section, page }],
  };
}

function makeCase(
  id: string,
  stimulus: QuizStimulus,
  probes: AssessmentCase["probes"],
): AssessmentCase {
  return { id, chapterId: 9, stimulus, probes };
}

const objectives: ChapterAssessment["objectives"] = [
  {
    id: "ch9-pipeline",
    chapterId: 9,
    behavior:
      "Trace timing, data, and failure dependencies through the AV compute pipeline.",
    priority: "core",
    references: [{ section: "9.2", page: 134 }],
  },
  {
    id: "ch9-interfaces",
    chapterId: 9,
    behavior:
      "Select sensor and actuator interfaces from bandwidth, latency, and reliability needs.",
    priority: "core",
    references: [{ section: "9.2", page: 135 }],
  },
  {
    id: "ch9-workload",
    chapterId: 9,
    behavior:
      "Map AV workloads to CPUs, GPUs, accelerators, and real-time controllers.",
    priority: "core",
    references: [{ section: "9.2", page: 136 }],
  },
  {
    id: "ch9-middleware",
    chapterId: 9,
    behavior:
      "Diagnose middleware communication, QoS, serialization, and lifecycle behavior.",
    priority: "core",
    references: [{ section: "9.3", page: 137 }],
  },
  {
    id: "ch9-time",
    chapterId: 9,
    behavior:
      "Reason about timestamps, PTP synchronization, rates, and end-to-end latency.",
    priority: "core",
    references: [
      { section: "9.2", page: 135 },
      { section: "9.4", page: 140 },
    ],
  },
  {
    id: "ch9-realtime",
    chapterId: 9,
    behavior:
      "Analyze RTOS scheduling, priority inversion, DAG triggers, and deadline guarantees.",
    priority: "core",
    references: [{ section: "9.4", page: 140 }],
  },
  {
    id: "ch9-vpi",
    chapterId: 9,
    behavior:
      "Use VPI boundaries to preserve portability, isolation, and safe hardware evolution.",
    priority: "core",
    references: [{ section: "9.5", page: 142 }],
  },
  {
    id: "ch9-hardware",
    chapterId: 9,
    behavior:
      "Evaluate memory, thermal, power, redundancy, and diagnostic hardware tradeoffs.",
    priority: "core",
    references: [{ section: "9.6", page: 144 }],
  },
];

const cases: AssessmentCase[] = [
  makeCase(
    "sensor-interface-fit",
    {
      kind: "table",
      caption: "New sensor links",
      columns: ["Stream", "Payload", "Need"],
      rows: [
        ["wheel-speed control", "8 B at 100 Hz", "fault-tolerant"],
        ["front camera", "2.5 Gb/s", "low latency"],
        ["LiDAR to GPU", "12 Gb/s bursts", "direct memory path"],
      ],
    },
    {
      application: q(
        "application",
        "intermediate",
        "Which link assignment best matches the three workloads?",
        ["ch9-interfaces"],
        "b",
        {
          a: [
            "Ethernet, CAN, then a low-rate serial bus",
            "This reverses the control and high-bandwidth needs.",
          ],
          b: [
            "CAN, GMSL, then PCIe with direct memory access",
            "Correct. Each link matches the payload and reliability requirement.",
          ],
          c: [
            "GMSL, Bluetooth, then CAN for the three streams",
            "The camera and LiDAR loads exceed those assignments.",
          ],
          d: [
            "One shared CAN link for control, camera, and LiDAR",
            "The visual streams far exceed classic CAN bandwidth.",
          ],
        },
        [
          "Wheel control favors a fault-tolerant low-payload bus.",
          "Camera and LiDAR streams need dedicated high-throughput paths.",
        ],
        "Interface choice follows workload characteristics rather than one universal bus.",
        "9.2",
        135,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "The camera drops frames while control messages remain healthy. Which mismatch is most plausible?",
        ["ch9-interfaces"],
        "d",
        {
          a: [
            "The control payload is too small for the CAN bus",
            "Small control messages suit CAN well.",
          ],
          b: [
            "The LiDAR uses direct memory access to the GPU",
            "That path does not explain camera-only loss.",
          ],
          c: [
            "The wheel-speed message arrives at 100 Hz",
            "That rate is modest for a control network.",
          ],
          d: [
            "Camera bandwidth is below its sustained rate",
            "Correct. Bandwidth shortfall causes stream-specific drops.",
          ],
        },
        [
          "Only the high-rate camera stream fails.",
          "Control traffic remains within its link capacity.",
        ],
        "Diagnose interfaces by comparing observed load with link capability.",
        "9.2",
        135,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Why is CAN preferable to the camera link for wheel-speed commands?",
        ["ch9-interfaces"],
        "a",
        {
          a: [
            "Robust delivery for compact control messages",
            "Correct. The command load is small and safety sensitive.",
          ],
          b: [
            "It carries raw multi-gigabit images with lower overhead",
            "Classic CAN lacks that image bandwidth.",
          ],
          c: [
            "It performs convolutional inference inside the cable",
            "A bus transports data; it does not run the model.",
          ],
          d: [
            "It supplies absolute time without any clock design",
            "Timestamp alignment still requires a time source.",
          ],
        },
        [
          "Wheel-speed messages are tiny compared with video.",
          "Fault tolerance matters more than peak throughput for this stream.",
        ],
        "A lower-bandwidth interface can be the stronger engineering choice.",
        "9.2",
        135,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If camera resolution doubles at the same frame rate, what resource pressure rises first?",
        ["ch9-interfaces", "ch9-hardware"],
        "c",
        {
          a: [
            "CAN arbitration for the wheel-speed message",
            "The camera uses a separate visual link.",
          ],
          b: [
            "Vehicle-map rotation in the localization frame",
            "Image resolution does not rotate coordinates.",
          ],
          c: [
            "Camera and downstream memory bandwidth",
            "Correct. More pixels increase transport and buffer demand.",
          ],
          d: [
            "The physical number of GPS satellites in view",
            "Camera configuration cannot alter satellites.",
          ],
        },
        [
          "Twice the pixels produce a larger payload per frame.",
          "That data must cross the link and enter memory.",
        ],
        "Sensor fidelity has system-level bandwidth and memory consequences.",
        "9.2",
        135,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A factory robot adds a 4K inspection camera beside a safety interlock. Which design transfers?",
        ["ch9-interfaces"],
        "d",
        {
          a: [
            "Place both streams on the slowest shared serial link",
            "The image load can delay the safety message.",
          ],
          b: [
            "Send the interlock through the vision model first",
            "A safety signal should not depend on image inference.",
          ],
          c: [
            "Choose links solely from cable purchase price",
            "Cost alone ignores bandwidth and timing.",
          ],
          d: [
            "Separate vision from the robust safety-control path",
            "Correct. The workloads need different communication properties.",
          ],
        },
        [
          "The interlock is compact and time critical.",
          "The camera is bandwidth intensive and can create contention.",
        ],
        "Heterogeneous interface reasoning transfers to industrial robots.",
        "9.2",
        135,
      ),
    },
  ),
  makeCase(
    "ptp-misalignment",
    {
      kind: "log",
      caption: "Fusion timestamps",
      lines: [
        "camera clock: 12:00:00.100",
        "LiDAR clock: 12:00:00.137",
        "vehicle speed: 20 m/s",
        "projected LiDAR edges trail image objects",
        "PTP offset alarm: 37 ms",
      ],
    },
    {
      application: q(
        "application",
        "intermediate",
        "Which action addresses the observed fusion error most directly?",
        ["ch9-time"],
        "c",
        {
          a: [
            "Increase detector confidence without changing clocks",
            "Confidence cannot align measurements in time.",
          ],
          b: [
            "Average the two timestamp values inside each object",
            "A mean does not identify the correct acquisition time.",
          ],
          c: [
            "Restore PTP and transform at acquisition time",
            "Correct. The logged clock offset explains motion-dependent projection lag.",
          ],
          d: [
            "Reduce map detail while preserving the clock offset",
            "Map compression does not synchronize sensors.",
          ],
        },
        [
          "The streams differ by 37 ms while the vehicle moves.",
          "Spatial alignment therefore uses states from different physical times.",
        ],
        "Sensor fusion requires temporal as well as geometric calibration.",
        "9.2",
        135,
      ),
      diagnosis: q(
        "diagnosis",
        "advanced",
        "At 20 m/s, how much motion corresponds to the 37 ms offset?",
        ["ch9-time"],
        "a",
        {
          a: [
            "About 0.74 m of vehicle travel",
            "Correct. Multiply 20 m/s by 0.037 seconds.",
          ],
          b: [
            "About 0.074 m of vehicle travel",
            "This is smaller by a factor of ten.",
          ],
          c: [
            "About 7.4 m of vehicle travel",
            "This is larger by a factor of ten.",
          ],
          d: [
            "No travel because timestamps are metadata",
            "The vehicle moves while clocks disagree.",
          ],
        },
        [
          "Convert 37 ms to 0.037 seconds.",
          "Distance is 20 x 0.037 = 0.74 meters.",
        ],
        "Millisecond clock errors can become lane-scale spatial errors.",
        "9.2",
        135,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which log pattern better indicates a time offset than an extrinsic bias?",
        ["ch9-time"],
        "d",
        {
          a: [
            "A fixed projection shift across all vehicle speeds",
            "A fixed shift is more consistent with geometry bias.",
          ],
          b: [
            "A camera bracket moves after maintenance",
            "That directly suggests extrinsic change.",
          ],
          c: [
            "Checkerboard intrinsics fail in a parked test",
            "That suggests camera calibration.",
          ],
          d: [
            "Projection lag tracks speed and clock offset",
            "Correct. Time error converts motion into speed-dependent displacement.",
          ],
        },
        [
          "Temporal displacement scales with motion during the offset.",
          "A rigid extrinsic error is not expected to scale this way.",
        ],
        "Residual dependence on speed helps separate time and geometry faults.",
        "9.2",
        135,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If speed falls to 10 m/s while the offset stays 37 ms, what changes?",
        ["ch9-time"],
        "b",
        {
          a: [
            "The clock offset doubles to 74 ms",
            "Vehicle speed does not change clock offset.",
          ],
          b: [
            "Displacement falls to roughly 0.37 m",
            "Correct. Halving speed halves travel during the same delay.",
          ],
          c: [
            "LiDAR becomes geometrically calibrated",
            "Lower speed masks some effect but does not repair time.",
          ],
          d: [
            "PTP becomes unnecessary for future fusion",
            "Accurate timing remains necessary across speeds.",
          ],
        },
        [
          "The time error is held constant.",
          "Distance during that error is proportional to speed.",
        ],
        "Slower motion can reduce consequence without fixing synchronization.",
        "9.2",
        135,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "Two motion-capture cameras disagree more as an athlete runs faster. Which lesson transfers?",
        ["ch9-time"],
        "a",
        {
          a: [
            "Check timing before spatial calibration",
            "Correct. Speed-dependent mismatch is a temporal-fault signature.",
          ],
          b: [
            "Retune lens color until trajectories overlap",
            "Color settings do not align acquisition time.",
          ],
          c: [
            "Average positions while ignoring capture times",
            "That blends different physical instants.",
          ],
          d: [
            "Lower confidence labels and keep the timing fault",
            "Labels do not repair synchronization.",
          ],
        },
        [
          "The disagreement grows with subject motion.",
          "An acquisition-time offset can produce that exact pattern.",
        ],
        "Temporal calibration principles transfer across multi-camera systems.",
        "9.2",
        135,
      ),
    },
  ),
  makeCase(
    "dma-copy-bottleneck",
    {
      kind: "table",
      caption: "LiDAR processing path",
      columns: ["Stage", "Time"],
      rows: [
        ["sensor to CPU buffer", "18 ms"],
        ["CPU copy to GPU", "24 ms"],
        ["GPU inference", "15 ms"],
        ["result to planner", "3 ms"],
        ["budget", "45 ms"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which redesign targets the largest avoidable path cost?",
        ["ch9-pipeline", "ch9-hardware"],
        "d",
        {
          a: [
            "Make GPU inference slower to match the copies",
            "This increases total latency.",
          ],
          b: [
            "Add a second CPU copy before GPU transfer",
            "Another copy worsens the bottleneck.",
          ],
          c: [
            "Delay the planner until the next sensor period",
            "Waiting consumes more of the budget.",
          ],
          d: [
            "Use direct transfer or shared GPU buffers",
            "Correct. It removes the 24 ms staging copy and can meet budget.",
          ],
        },
        [
          "The current path totals 60 ms, above the 45 ms budget.",
          "The CPU-to-GPU copy is the largest avoidable stage.",
        ],
        "Data movement can dominate compute in heterogeneous pipelines.",
        "9.2",
        136,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why would a faster GPU model alone fail to recover the full deadline?",
        ["ch9-pipeline"],
        "b",
        {
          a: [
            "The planner result takes three seconds",
            "The table reports three milliseconds.",
          ],
          b: [
            "Copies consume 42 ms before inference",
            "Correct. Little budget remains even if inference becomes small.",
          ],
          c: [
            "DMA increases each sensor payload by itself",
            "DMA changes transfer path, not sensor generation.",
          ],
          d: [
            "A faster model makes CPU memory physically slower",
            "Model speed does not require that effect.",
          ],
        },
        [
          "Sensor-to-CPU and CPU-to-GPU movement total 42 ms.",
          "The entire budget is only 45 ms.",
        ],
        "Optimize the measured critical path rather than its most visible algorithm.",
        "9.2",
        136,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which metric best distinguishes compute from data-movement cost?",
        ["ch9-pipeline"],
        "c",
        {
          a: [
            "Vehicle paint temperature during the run",
            "Paint does not reveal memory transfer.",
          ],
          b: [
            "Number of source-code comments in the model",
            "Comments do not determine runtime.",
          ],
          c: [
            "Traces of copy, queue, and kernel stages",
            "Correct. Stage timing separates where latency is spent.",
          ],
          d: [
            "Total route length without timestamps",
            "Route length cannot partition a compute path.",
          ],
        },
        [
          "End-to-end latency combines several mechanisms.",
          "Instrumented stage traces assign time to each mechanism.",
        ],
        "Performance diagnosis needs component-level timing evidence.",
        "9.2",
        136,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If the CPU-to-GPU copy is removed, what is the new nominal total?",
        ["ch9-pipeline"],
        "a",
        {
          a: [
            "About 36 ms across the remaining stages",
            "Correct. The remaining times are 18 + 15 + 3 ms.",
          ],
          b: [
            "About 21 ms across the remaining stages",
            "This omits the sensor-to-buffer stage.",
          ],
          c: [
            "About 45 ms because budgets set runtime",
            "A budget is a requirement, not an automatic duration.",
          ],
          d: [
            "About 60 ms because copies do not affect latency",
            "Removing 24 ms changes the path directly.",
          ],
        },
        [
          "The removed stage contributes 24 ms.",
          "Subtracting it from 60 ms leaves 36 ms.",
        ],
        "A trace supports quantitative prediction before implementation.",
        "9.2",
        136,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A medical-imaging model waits longer for memory copies than inference. Which response transfers?",
        ["ch9-hardware"],
        "c",
        {
          a: [
            "Increase model depth before measuring transfer",
            "More computation does not remove copy delay.",
          ],
          b: [
            "Add serialized copies between each accelerator",
            "Extra copies increase data movement.",
          ],
          c: [
            "Profile and redesign buffer ownership",
            "Correct. The intervention targets the observed staging cost.",
          ],
          d: [
            "Remove deadline monitoring from the pipeline",
            "Hiding the miss does not improve it.",
          ],
        },
        [
          "The bottleneck lies outside the numerical kernel.",
          "Buffer and transfer architecture determine whether acceleration helps.",
        ],
        "Heterogeneous data-path optimization transfers across domains.",
        "9.6",
        144,
      ),
    },
  ),
  makeCase(
    "heterogeneous-mapping",
    {
      kind: "table",
      caption: "Candidate tasks",
      columns: ["Task", "Structure", "Deadline"],
      rows: [
        ["CNN perception", "massively parallel", "50 ms"],
        ["route graph search", "branch-heavy", "200 ms"],
        ["brake command", "small deterministic loop", "5 ms"],
        ["signal filtering", "streaming arithmetic", "10 ms"],
      ],
    },
    {
      application: q(
        "application",
        "intermediate",
        "Which compute mapping best matches the task structures?",
        ["ch9-workload"],
        "a",
        {
          a: [
            "GPU, CPU, real-time MCU, then DSP",
            "Correct. The mapping follows parallelism and timing needs.",
          ],
          b: [
            "MCU, GPU, cloud VM, then paper log",
            "The mapping mismatches workload and brake latency.",
          ],
          c: [
            "DSP, CAN controller, GPU, then CPU",
            "The brake path should not depend on GPU scheduling.",
          ],
          d: [
            "One GPU for all tasks with equal priority",
            "Branching and hard control deadlines need different resources.",
          ],
        },
        [
          "CNNs benefit from parallel acceleration.",
          "Control needs bounded execution on a real-time processor.",
        ],
        "Map workloads by computational structure and deadline.",
        "9.2",
        136,
      ),
      diagnosis: q(
        "diagnosis",
        "advanced",
        "Emergency braking jitters when CNN load rises. What allocation flaw is most likely?",
        ["ch9-workload", "ch9-realtime"],
        "c",
        {
          a: [
            "The route search uses a graph representation",
            "Graph structure does not explain CNN-correlated brake jitter.",
          ],
          b: [
            "The DSP filters a regular signal stream",
            "A separate streaming unit reduces contention.",
          ],
          c: [
            "Brake shares an unbounded accelerator path",
            "Correct. Safety timing now depends on variable CNN workload.",
          ],
          d: [
            "The vehicle has more than one processor",
            "Heterogeneity itself is not a fault.",
          ],
        },
        [
          "Brake jitter changes with unrelated CNN demand.",
          "That correlation indicates shared scheduling or memory interference.",
        ],
        "Isolate hard-deadline control from variable high-throughput work.",
        "9.4",
        140,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Why is a CPU often stronger than a GPU for route graph search?",
        ["ch9-workload"],
        "d",
        {
          a: [
            "The CPU contains the road map physically",
            "Maps are data accessible to several processors.",
          ],
          b: [
            "A GPU cannot execute arithmetic operations",
            "GPUs execute arithmetic very effectively.",
          ],
          c: [
            "Route search has no latency requirement",
            "The table gives a 200 ms deadline.",
          ],
          d: [
            "CPUs suit branch-heavy irregular work",
            "Correct. CPUs handle control flow and sequential logic well.",
          ],
        },
        [
          "Graph search follows irregular branches and memory access.",
          "GPUs excel most on regular parallel work.",
        ],
        "Processor choice depends on workload shape, not prestige.",
        "9.2",
        136,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If the CNN grows while sharing memory with filtering, what secondary effect may appear?",
        ["ch9-workload", "ch9-hardware"],
        "b",
        {
          a: [
            "The brake deadline expands by policy",
            "Deadlines do not expand because workload grows.",
          ],
          b: [
            "Memory contention delays filtering",
            "Correct. Shared bandwidth couples otherwise separate processors.",
          ],
          c: [
            "The road graph becomes more connected",
            "Model size does not change map topology.",
          ],
          d: [
            "PTP clocks gain more precision",
            "Memory demand does not improve time sync.",
          ],
        },
        [
          "Accelerators still use shared memory paths.",
          "A larger model can consume bandwidth needed by the DSP stream.",
        ],
        "Heterogeneous mapping must include shared-resource interference.",
        "9.6",
        144,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A drone runs vision, mission planning, and motor stabilization. Which mapping transfers?",
        ["ch9-workload"],
        "a",
        {
          a: [
            "GPU vision, CPU planning, isolated motor control",
            "Correct. Each task receives a resource suited to its structure.",
          ],
          b: [
            "Motor stabilization through a remote cloud service",
            "Network variability violates the control deadline.",
          ],
          c: [
            "Mission planning on the motor microcontroller",
            "Complex planning can disrupt the tight control loop.",
          ],
          d: [
            "All tasks serialized on the vision accelerator",
            "Serialization couples control timing to vision load.",
          ],
        },
        [
          "The drone has the same parallel, logical, and hard-real-time task classes.",
          "Isolation prevents one class from delaying another.",
        ],
        "Workload mapping transfers to other autonomous machines.",
        "9.2",
        136,
      ),
    },
  ),
  makeCase(
    "gpu-contention",
    {
      kind: "log",
      caption: "Shared-GPU trace",
      lines: [
        "perception kernel: 22-48 ms",
        "trajectory sampler: 10-34 ms",
        "both launch at camera frame arrival",
        "planner p99 deadline: 25 ms",
        "deadline misses occur on overlapping launches",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which scheduling change best addresses the measured planner misses?",
        ["ch9-workload", "ch9-realtime"],
        "d",
        {
          a: [
            "Launch both kernels together with no priorities",
            "The current overlap already causes misses.",
          ],
          b: [
            "Increase camera rate before controlling contention",
            "More arrivals can increase overlap.",
          ],
          c: [
            "Move brake control onto the same GPU queue",
            "This adds another safety-critical dependency.",
          ],
          d: [
            "Reserve planner capacity with bounded priority",
            "Correct. The change limits interference during critical windows.",
          ],
        },
        [
          "Misses occur specifically when kernels overlap.",
          "A bounded resource policy protects the planner deadline.",
        ],
        "Accelerator scheduling is part of real-time architecture.",
        "9.2",
        136,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is mean kernel time insufficient for this safety decision?",
        ["ch9-realtime"],
        "a",
        {
          a: [
            "Tail overlap can break the 25 ms deadline",
            "Correct. Averages hide the p99 contention event.",
          ],
          b: [
            "Kernel timing has no connection to planning",
            "The planner directly runs a trajectory kernel.",
          ],
          c: [
            "Mean time is measured in the wrong unit",
            "Milliseconds are appropriate here.",
          ],
          d: [
            "Averages are larger than all samples",
            "A mean lies within the distribution range.",
          ],
        },
        [
          "The requirement is a per-cycle deadline.",
          "Rare long overlap can violate it despite a low mean.",
        ],
        "Real-time design uses worst-case and tail evidence.",
        "9.4",
        140,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which resource plan offers stronger temporal isolation?",
        ["ch9-realtime"],
        "c",
        {
          a: [
            "One FIFO queue shared by all critical kernels",
            "FIFO provides no deadline-aware separation.",
          ],
          b: [
            "Random launch delays selected each frame",
            "Randomness does not provide a bound.",
          ],
          c: [
            "Reserved windows with measured interference",
            "Correct. Capacity and timing are explicit and testable.",
          ],
          d: [
            "A larger log file without scheduling changes",
            "Logging exposes but does not remove contention.",
          ],
        },
        [
          "Temporal isolation requires a controlled share of the accelerator.",
          "Reserved windows and interference tests establish that share.",
        ],
        "Shared accelerators need explicit service guarantees.",
        "9.4",
        140,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If perception is capped at 30 ms but launch overlap remains, what conclusion follows?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "Planner executions now meet 25 ms",
            "Overlap can still delay a 25 ms task.",
          ],
          b: [
            "Perception improves; planner contention remains",
            "Correct. One bound does not establish the other task's response time.",
          ],
          c: [
            "GPU contention disappears from the architecture",
            "The tasks still share the device.",
          ],
          d: [
            "Camera timestamps become synchronized",
            "Kernel limits do not set sensor clocks.",
          ],
        },
        [
          "The perception duration is now bounded.",
          "Planner wait and execution under overlap remain separate quantities.",
        ],
        "Component bounds must be composed into an end-to-end guarantee.",
        "9.4",
        140,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "Two AI services share a hospital GPU and one has a clinical deadline. Which lesson transfers?",
        ["ch9-realtime"],
        "c",
        {
          a: [
            "Give both services unlimited best-effort access",
            "Best effort cannot protect the clinical deadline.",
          ],
          b: [
            "Evaluate throughput without response-time tails",
            "Throughput can hide rare deadline misses.",
          ],
          c: [
            "Reserve capacity and test interference under load",
            "Correct. The policy turns sharing into a measurable service guarantee.",
          ],
          d: [
            "Route the clinical service through more batch queues",
            "Batching can increase response delay.",
          ],
        },
        [
          "The critical service competes with variable accelerator work.",
          "Reserved capacity and tail tests contain that interference.",
        ],
        "Real-time accelerator governance transfers beyond vehicles.",
        "9.4",
        140,
      ),
    },
  ),
  makeCase(
    "qos-backpressure",
    {
      kind: "table",
      caption: "Obstacle topic under load",
      columns: ["Setting", "Observed result"],
      rows: [
        ["reliable, depth 100", "latency grows to 1.8 s"],
        ["best effort, depth 1", "fresh data; 6% samples skipped"],
        ["subscriber use", "current obstacle state"],
        ["publisher rate", "30 Hz"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which QoS direction better matches the subscriber's purpose?",
        ["ch9-middleware"],
        "a",
        {
          a: [
            "Prefer a shallow fresh-data policy and monitor loss",
            "Correct. Current state is more useful than a complete stale backlog.",
          ],
          b: [
            "Keep all samples until the 1.8-second queue drains",
            "Old obstacle states can be actively misleading.",
          ],
          c: [
            "Increase depth while leaving processing unchanged",
            "A deeper queue increases stale-data exposure.",
          ],
          d: [
            "Disable timestamps so age cannot be observed",
            "Removing evidence does not reduce latency.",
          ],
        },
        [
          "The subscriber acts on current occupancy, not historical completeness.",
          "A small loss may be safer than processing old states.",
        ],
        "QoS should reflect the semantics of the data consumer.",
        "9.3",
        138,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What is the main failure in the reliable depth-100 setting?",
        ["ch9-middleware"],
        "c",
        {
          a: [
            "The publisher produces too few samples",
            "It publishes at 30 Hz, enough to create backlog.",
          ],
          b: [
            "Reliability removes all obstacle messages",
            "The setting retains messages rather than losing them.",
          ],
          c: [
            "Backpressure trades freshness for completeness",
            "Correct. Queue age grows far beyond a control-relevant horizon.",
          ],
          d: [
            "Best effort changes the physical obstacle location",
            "Transport policy cannot move an obstacle.",
          ],
        },
        [
          "The queue grows to 1.8 seconds of old state.",
          "Reliable delivery is meeting the wrong objective for this topic.",
        ],
        "A communication guarantee can be harmful when its semantics mismatch the task.",
        "9.3",
        138,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which topic is a stronger candidate for reliable delivery than live obstacle state?",
        ["ch9-middleware"],
        "d",
        {
          a: [
            "A 60 Hz camera preview used mainly for current display",
            "A fresh-frame policy may be preferable there.",
          ],
          b: [
            "A high-rate pose stream consumed at one current time",
            "Accumulating stale poses adds little value.",
          ],
          c: [
            "A visualization marker updated each frame",
            "Skipping an intermediate marker can be acceptable.",
          ],
          d: [
            "An acknowledged one-time safety command",
            "Correct. Losing the command changes persistent system state.",
          ],
        },
        [
          "Configuration is an event that must be applied once and verified.",
          "A current-state stream can tolerate replacement by newer data.",
        ],
        "Select reliability from message meaning, not topic importance alone.",
        "9.3",
        138,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If subscriber processing rises above 30 Hz, what should happen to backlog?",
        ["ch9-middleware"],
        "b",
        {
          a: [
            "It likely grows because the subscriber is faster",
            "Faster service drains rather than grows a queue.",
          ],
          b: [
            "It shrinks if arrivals stay near 30 Hz",
            "Correct. Service capacity now exceeds the input rate.",
          ],
          c: [
            "It becomes independent of arrival rate",
            "Queue behavior depends on both arrival and service.",
          ],
          d: [
            "Skipped samples are reconstructed exactly",
            "Queue drainage does not recover prior best-effort loss.",
          ],
        },
        [
          "The subscriber can process more messages than arrive.",
          "A stable queue should drain toward low age.",
        ],
        "Rate balance predicts whether middleware queues grow or clear.",
        "9.3",
        138,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A teleoperation display receives video faster than it can decode. Which principle transfers?",
        ["ch9-middleware"],
        "c",
        {
          a: [
            "Store all frames until the operator sees old video",
            "Stale video can create unsafe control.",
          ],
          b: [
            "Remove frame timestamps from the stream",
            "The operator then loses age information.",
          ],
          c: [
            "Drop stale frames and report freshness and loss",
            "Correct. The display needs the current scene with observable quality.",
          ],
          d: [
            "Increase queue depth without profiling decode",
            "That masks overload with latency.",
          ],
        },
        [
          "Video frames supersede older frames for live control.",
          "Freshness and loss telemetry make the tradeoff visible.",
        ],
        "Fresh-data QoS transfers to live human-machine systems.",
        "9.3",
        138,
      ),
    },
  ),
  makeCase(
    "serialization-tradeoff",
    {
      kind: "table",
      caption: "Point-cloud transport",
      columns: ["Encoding", "Size", "Encode+decode", "Network"],
      rows: [
        ["raw", "12 MB", "2 ms", "30 ms"],
        ["compressed A", "4 MB", "18 ms", "10 ms"],
        ["compressed B", "2 MB", "44 ms", "5 ms"],
        ["deadline", "-", "-", "35 ms"],
      ],
    },
    {
      application: q(
        "application",
        "intermediate",
        "Which encoding meets the measured end-to-end deadline?",
        ["ch9-middleware", "ch9-time"],
        "b",
        {
          a: [
            "Raw, with 32 ms total and no compute cost",
            "The raw total is 2 + 30 = 32 ms, so it also meets; the option's premise is false about compute?",
          ],
          b: [
            "Compressed A, with about 28 ms total",
            "Correct. Its codec and network time sum below 35 ms.",
          ],
          c: [
            "Compressed B, with about 49 ms total",
            "Its strong size reduction misses the latency limit.",
          ],
          d: [
            "All encodings because each payload is finite",
            "Finite size does not imply deadline compliance.",
          ],
        },
        [
          "Compressed A totals 18 + 10 = 28 ms.",
          "Compressed B saves bandwidth but its codec dominates latency.",
        ],
        "Compression is a compute-versus-network tradeoff measured end to end.",
        "9.3",
        138,
      ),
      diagnosis: q(
        "diagnosis",
        "advanced",
        "Why can the smallest payload be the slowest option?",
        ["ch9-middleware"],
        "d",
        {
          a: [
            "Network time increases whenever bytes decrease",
            "The table shows network time falls with size.",
          ],
          b: [
            "Payload size changes the vehicle's physical speed",
            "Transport encoding cannot move the vehicle.",
          ],
          c: [
            "Raw messages require no memory movement",
            "Raw transport still moves and serializes data.",
          ],
          d: [
            "Compression adds codec compute time",
            "Correct. The 44 ms codec outweighs its 5 ms network time.",
          ],
        },
        [
          "Compressed B has the shortest network stage.",
          "Its encode/decode work is much larger than the savings.",
        ],
        "Optimize total latency rather than payload size in isolation.",
        "9.3",
        138,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which extra condition could make compression B preferable?",
        ["ch9-middleware"],
        "a",
        {
          a: [
            "A slower network with a looser deadline",
            "Correct. Bandwidth savings matter more when network dominates and time permits codec work.",
          ],
          b: [
            "A tighter deadline below its 44 ms codec time",
            "That makes B infeasible before transmission.",
          ],
          c: [
            "A requirement to preserve the largest payload",
            "B produces the smallest payload.",
          ],
          d: [
            "A faster raw link with unchanged codec cost",
            "That favors less compression.",
          ],
        },
        [
          "The current deadline makes codec time binding.",
          "Changing bandwidth and allowable latency can reverse the tradeoff.",
        ],
        "The best encoding depends on the operating resource constraint.",
        "9.3",
        138,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If hardware halves codec time for compressed A, what total is expected?",
        ["ch9-middleware"],
        "c",
        {
          a: [
            "About 5 ms because size becomes zero",
            "Compression does not remove network transfer.",
          ],
          b: [
            "About 28 ms because acceleration changes no stage",
            "The codec stage is stated to halve.",
          ],
          c: [
            "About 19 ms: 9 ms codec plus 10 ms network",
            "Correct. The stage times add to 19 ms.",
          ],
          d: [
            "About 36 ms because codec and network multiply",
            "Pipeline latency is summed here, not multiplied.",
          ],
        },
        [
          "The 18 ms codec stage falls to 9 ms.",
          "The 10 ms network stage remains unchanged.",
        ],
        "Stage models support quantitative what-if analysis.",
        "9.3",
        138,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A remote scanner has limited bandwidth and local compute. Which lesson transfers?",
        ["ch9-middleware"],
        "a",
        {
          a: [
            "Measure codec and transfer time against the budget",
            "Correct. The endpoint decision depends on both resources.",
          ],
          b: [
            "Choose the smallest file without timing the codec",
            "Smallest size can still be slowest.",
          ],
          c: [
            "Use raw transport without measuring network capacity",
            "Raw data can overload a constrained link.",
          ],
          d: [
            "Select encoding from its product name",
            "Names do not establish system performance.",
          ],
        },
        [
          "Compression trades local computation for network reduction.",
          "Only an end-to-end test reveals the binding stage.",
        ],
        "Serialization tradeoffs transfer to distributed sensing systems.",
        "9.3",
        138,
      ),
    },
  ),
  makeCase(
    "ros2-tail-latency",
    {
      kind: "log",
      caption: "ROS 2 executor under load",
      lines: [
        "median callback delay: 1.8 ms",
        "p99 callback delay: 42 ms",
        "emergency deadline: 10 ms",
        "background logging callback: 35 ms",
        "executor: single-threaded, general-purpose Linux",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which architecture change best protects the emergency callback?",
        ["ch9-middleware", "ch9-realtime"],
        "c",
        {
          a: [
            "Add more background logs before each emergency event",
            "The long logging callback already blocks the executor.",
          ],
          b: [
            "Judge timing from the 1.8 ms median",
            "The 42 ms tail violates the deadline.",
          ],
          c: [
            "Place safety work in a priority real-time domain",
            "Correct. Isolation and bounded scheduling address blocking and OS jitter.",
          ],
          d: [
            "Increase queue depth while keeping one executor",
            "A deeper queue can add response delay.",
          ],
        },
        [
          "The single executor lets a 35 ms noncritical callback block urgent work.",
          "General-purpose scheduling also contributes an unbounded tail.",
        ],
        "ROS 2 flexibility needs additional real-time engineering for safety loops.",
        "9.3",
        139,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is the median misleading for certification of this callback?",
        ["ch9-realtime"],
        "a",
        {
          a: [
            "The p99 tail violates the per-event deadline",
            "Correct. Typical timing does not bound rare response.",
          ],
          b: [
            "The median is expressed in milliseconds",
            "Milliseconds are an appropriate timing unit.",
          ],
          c: [
            "The p99 is lower than the median",
            "The p99 is 42 ms, much higher.",
          ],
          d: [
            "Certification uses callback names instead of times",
            "Timing evidence remains central to real-time assurance.",
          ],
        },
        [
          "The deadline is 10 ms.",
          "A 42 ms p99 proves recurring misses despite a good median.",
        ],
        "Hard real-time claims need bounded or worst-case evidence.",
        "9.4",
        140,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which environment gives a stronger timing guarantee?",
        ["ch9-realtime"],
        "d",
        {
          a: [
            "Best-effort callbacks mixed with long logging work",
            "That is the observed blocking design.",
          ],
          b: [
            "A faster desktop with the same unbounded scheduler",
            "Average speed does not establish a bound.",
          ],
          c: [
            "More dynamic memory allocation in the emergency path",
            "Allocation can add unpredictable delay.",
          ],
          d: [
            "Priority-preemptive RTOS with static resources",
            "Correct. It is designed for deterministic critical tasks.",
          ],
        },
        [
          "The requirement is a bounded response under load.",
          "Priority scheduling and static allocation reduce timing variability.",
        ],
        "Determinism is an architectural property, not raw processor speed.",
        "9.4",
        140,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If logging moves to another core but Linux remains unchanged, what conclusion is strongest?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "The emergency callback now has a certified bound",
            "Removing one blocker does not certify OS latency.",
          ],
          b: [
            "Contention falls, but scheduler tails need testing",
            "Correct. Isolation helps without proving determinism.",
          ],
          c: [
            "The emergency deadline becomes forty milliseconds",
            "A design change does not alter the requirement.",
          ],
          d: [
            "ROS 2 no longer uses middleware",
            "Core placement does not remove ROS 2.",
          ],
        },
        [
          "The 35 ms callback no longer shares the same core.",
          "Kernel and middleware variability remain possible.",
        ],
        "Incremental improvement is not the same as a verified guarantee.",
        "9.3",
        139,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A lab robot's stop callback shares one event loop with video logging. Which lesson transfers?",
        ["ch9-realtime"],
        "c",
        {
          a: [
            "Increase video quality before changing scheduling",
            "More video work can worsen stop delay.",
          ],
          b: [
            "Accept average stop time as a hard bound",
            "An average does not constrain tails.",
          ],
          c: [
            "Prioritize the stop path with bounded resources",
            "Correct. Safety work should not wait behind logging.",
          ],
          d: [
            "Remove the stop deadline from the test",
            "Deleting the criterion does not reduce risk.",
          ],
        },
        [
          "The event loop couples urgent control to long noncritical work.",
          "Priority isolation breaks that dependency.",
        ],
        "Critical-callback isolation transfers to general robotics.",
        "9.4",
        140,
      ),
    },
  ),
  makeCase(
    "priority-inversion",
    {
      kind: "log",
      caption: "Brake-task trace",
      lines: [
        "low-priority logger locks shared buffer",
        "medium-priority perception preempts logger",
        "high-priority brake task waits for buffer",
        "brake response: 31 ms; deadline: 8 ms",
        "priority inheritance: disabled",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which fix targets the blocking mechanism most directly?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "Raise perception priority above the brake task",
            "That increases interference and leaves the lock held.",
          ],
          b: [
            "Use priority inheritance or remove the lock",
            "Correct. The lock owner can finish or the dependency disappears.",
          ],
          c: [
            "Increase logger work while holding the buffer",
            "Longer critical sections worsen blocking.",
          ],
          d: [
            "Measure average perception throughput alone",
            "Throughput does not repair the brake wait.",
          ],
        },
        [
          "A low-priority task owns a resource needed by the brake task.",
          "A medium task prevents that owner from running and releasing it.",
        ],
        "Priority inversion requires resource-aware scheduling, not priority labels alone.",
        "9.4",
        141,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Which trace event distinguishes priority inversion from ordinary CPU overload?",
        ["ch9-realtime"],
        "d",
        {
          a: [
            "The brake task has a deadline",
            "Many overload cases also involve deadlines.",
          ],
          b: [
            "Perception performs useful work",
            "Useful work can exist in either failure.",
          ],
          c: [
            "The response time is measured in milliseconds",
            "The unit does not identify the mechanism.",
          ],
          d: [
            "Brake waits on a preempted lock holder",
            "Correct. This is the defining dependency chain.",
          ],
        },
        [
          "The urgent task is ready but blocked on a resource.",
          "The resource owner cannot run because a medium task preempts it.",
        ],
        "Trace lock ownership and preemption to diagnose inversion.",
        "9.4",
        141,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Why can simply raising brake priority fail here?",
        ["ch9-realtime"],
        "a",
        {
          a: [
            "Brake is blocked by a lock holder",
            "Correct. Priority does not grant ownership of the resource.",
          ],
          b: [
            "Higher priority reduces the brake deadline",
            "Task priority does not redefine the requirement.",
          ],
          c: [
            "Brake code contains no instructions",
            "The trace shows it executes after waiting.",
          ],
          d: [
            "The logger uses a different computer",
            "The tasks share a buffer in this system.",
          ],
        },
        [
          "The brake task is blocked, not merely waiting for CPU selection.",
          "Its prerequisite is lock release by the low-priority owner.",
        ],
        "Scheduling priority cannot bypass resource dependencies.",
        "9.4",
        141,
      ),
      causal: q(
        "causal",
        "intermediate",
        "What should priority inheritance change in the trace?",
        ["ch9-realtime"],
        "c",
        {
          a: [
            "The brake task becomes the buffer owner immediately",
            "Ownership remains with the logger until release.",
          ],
          b: [
            "Perception gains higher priority during the lock",
            "That would preserve inversion.",
          ],
          c: [
            "Logger inherits urgency and releases sooner",
            "Correct. Medium work can no longer preempt the lock owner.",
          ],
          d: [
            "The shared buffer grows without a limit",
            "Inheritance changes scheduling, not capacity.",
          ],
        },
        [
          "The logger blocks a higher-priority task.",
          "Inheritance temporarily elevates the logger to complete its critical section.",
        ],
        "Priority inheritance bounds a common form of resource blocking.",
        "9.4",
        141,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A database health check waits behind a lock held by a background report. Which lesson transfers?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "Add more medium-priority reports during the lock",
            "That can prolong the blocked owner.",
          ],
          b: [
            "Bound lock sections and use priority inheritance",
            "Correct. The resource dependency mirrors the brake trace.",
          ],
          c: [
            "Raise the health-check deadline without analysis",
            "Changing the requirement hides the mechanism.",
          ],
          d: [
            "Remove lock timing from observability",
            "The lock chain is needed for diagnosis.",
          ],
        },
        [
          "A low-importance task holds a resource required by urgent work.",
          "Other work can delay its release unless scheduling accounts for ownership.",
        ],
        "Priority-inversion reasoning transfers to real-time services.",
        "9.4",
        141,
      ),
    },
  ),
  makeCase(
    "rtos-domain-isolation",
    {
      kind: "table",
      caption: "Tiered compute proposal",
      columns: ["Domain", "Tasks", "Policy"],
      rows: [
        [
          "RTOS safety",
          "braking, steering monitor",
          "static memory; priority preemption",
        ],
        ["Linux autonomy", "perception, planning", "managed deadlines"],
        ["infotainment", "media, apps", "best effort"],
        ["shared gateway", "commands and health", "validated interface"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which gateway rule best preserves the tiered safety argument?",
        ["ch9-realtime", "ch9-vpi"],
        "d",
        {
          a: [
            "Allow infotainment to write steering commands directly",
            "That bypasses the safety boundary.",
          ],
          b: [
            "Pass incoming autonomy messages without validation",
            "Malformed or stale data can enter the RTOS domain.",
          ],
          c: [
            "Block all health feedback from the safety controller",
            "Autonomy needs bounded status to respond to faults.",
          ],
          d: [
            "Validate command limits, age, and authority",
            "Correct. The interface contains faults crossing the boundary.",
          ],
        },
        [
          "The RTOS domain protects critical actuation.",
          "Its gateway must reject invalid inputs from less trusted domains.",
        ],
        "Isolation is only as strong as the interfaces that cross it.",
        "9.4",
        141,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Infotainment load causes brake jitter despite separate CPUs. What should be inspected first?",
        ["ch9-realtime", "ch9-hardware"],
        "c",
        {
          a: [
            "The media playlist order",
            "Content order does not identify shared interference.",
          ],
          b: [
            "The number of planning waypoints",
            "The symptom follows infotainment load.",
          ],
          c: [
            "Shared power, memory, and gateway",
            "Correct. Hardware paths can couple nominally separate domains.",
          ],
          d: [
            "The paint color of the safety ECU",
            "Appearance cannot cause timing jitter.",
          ],
        },
        [
          "CPU separation removes one form of contention.",
          "Memory, interrupt, thermal, or power sharing can still propagate interference.",
        ],
        "Validate physical as well as software isolation.",
        "9.6",
        145,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Why place low-level braking in the RTOS domain?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "Braking needs the largest neural-network throughput",
            "Low-level braking is a compact deterministic loop.",
          ],
          b: [
            "It needs bounded response and fault containment",
            "Correct. Timing predictability is central to the safety task.",
          ],
          c: [
            "RTOS software provides richer media features",
            "Media belongs in a noncritical domain.",
          ],
          d: [
            "A safety domain removes all hardware faults",
            "Faults remain and require detection and fallback.",
          ],
        },
        [
          "Brake response has a strict physical deadline.",
          "RTOS scheduling and isolation support a defensible bound.",
        ],
        "Place tasks according to safety consequence and timing guarantee.",
        "9.4",
        141,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If the gateway accepts stale trajectories, what failure can follow?",
        ["ch9-realtime", "ch9-vpi"],
        "a",
        {
          a: [
            "Controller may act on an expired scene",
            "Correct. Freshness is part of command validity.",
          ],
          b: [
            "The camera directly gains a higher frame rate",
            "Gateway policy does not improve sensing.",
          ],
          c: [
            "RTOS priority inheritance becomes unnecessary",
            "Lock scheduling is a separate issue.",
          ],
          d: [
            "The map file becomes smaller",
            "Trajectory age does not change storage size.",
          ],
        },
        [
          "A trajectory describes a world state at a particular time.",
          "Delayed execution can violate obstacle and lane assumptions.",
        ],
        "Temporal validity must be enforced at safety boundaries.",
        "9.5",
        143,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "An aircraft separates flight control from cabin entertainment. Which AV principle transfers?",
        ["ch9-realtime"],
        "d",
        {
          a: [
            "Cabin applications may command actuators through any port",
            "That defeats safety isolation.",
          ],
          b: [
            "Both domains should share unbounded memory access",
            "Unbounded sharing creates interference and attack paths.",
          ],
          c: [
            "Flight control can use best-effort timing under media load",
            "Control needs deterministic timing.",
          ],
          d: [
            "Isolated critical control with a validated gateway",
            "Correct. The architecture contains timing and software faults.",
          ],
        },
        [
          "Both systems combine critical control and noncritical services.",
          "Domain isolation plus constrained interfaces limits fault propagation.",
        ],
        "Tiered safety architecture transfers across vehicles.",
        "9.4",
        141,
      ),
    },
  ),
  makeCase(
    "dag-trigger-choice",
    {
      kind: "table",
      caption: "Pipeline behavior",
      columns: ["Stage", "Rate", "Dependency"],
      rows: [
        ["camera", "30 Hz", "periodic"],
        ["detector", "on new frame", "camera"],
        ["predictor", "on new objects", "detector"],
        ["planner", "on new prediction", "predictor"],
        ["control", "100 Hz", "latest trajectory"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which trigger model best fits the detector-through-planner chain?",
        ["ch9-realtime", "ch9-pipeline"],
        "b",
        {
          a: [
            "Run each stage hourly with no data dependency",
            "This ignores the stated event chain and deadlines.",
          ],
          b: [
            "Use arrival triggers with bounded end-to-end flow",
            "Correct. Each stage consumes the newly produced upstream result.",
          ],
          c: [
            "Start all stages at random offsets without timestamps",
            "Random offsets cannot preserve data lineage.",
          ],
          d: [
            "Execute planning before detection for lower latency",
            "Planning needs the detected and predicted state first.",
          ],
        },
        [
          "Detector, predictor, and planner are explicitly active dependencies.",
          "Arrival-triggered execution can reduce waiting between stages.",
        ],
        "Choose DAG semantics that match how data activates work.",
        "9.4",
        140,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "The planner sometimes consumes predictions from the prior frame. What should traces check?",
        ["ch9-realtime", "ch9-time"],
        "d",
        {
          a: [
            "Whether camera color changes between frames",
            "Color does not establish data lineage.",
          ],
          b: [
            "Whether control runs at a higher nominal rate",
            "Control rate does not identify planner input age.",
          ],
          c: [
            "Whether each task has the same source-code length",
            "Code length does not determine trigger order.",
          ],
          d: [
            "Sequence, timestamps, and dependency triggers",
            "Correct. These reveal whether a stale predecessor triggered planning.",
          ],
        },
        [
          "The failure concerns which upstream result a task consumed.",
          "Sequence and acquisition timestamps reconstruct that lineage.",
        ],
        "DAG debugging needs causal data provenance, not rate labels alone.",
        "9.4",
        140,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Why can arrival-triggered chains reduce latency versus independent periodic tasks?",
        ["ch9-realtime"],
        "a",
        {
          a: [
            "Consumer runs when required input arrives",
            "Correct. It need not wait for the next unrelated timer phase.",
          ],
          b: [
            "They remove all computation stages from the chain",
            "The same work still executes.",
          ],
          c: [
            "They make network transport instantaneous",
            "Communication latency remains.",
          ],
          d: [
            "They prevent any sensor from missing a frame",
            "Trigger style cannot guarantee sensor delivery.",
          ],
        },
        [
          "Independent timers can add phase wait at each stage.",
          "Active dependencies release consumers immediately after valid production.",
        ],
        "Trigger design contributes to end-to-end latency.",
        "9.4",
        140,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If the detector stalls for one frame, what should a dependency-aware planner do?",
        ["ch9-realtime"],
        "c",
        {
          a: [
            "Treat the missing result as a fresh empty scene",
            "Absence of a message is not evidence of no objects.",
          ],
          b: [
            "Invent a detector timestamp and continue normally",
            "Fabricated freshness hides the stall.",
          ],
          c: [
            "Expose staleness and follow degraded policy",
            "Correct. The planner should not silently treat old data as new.",
          ],
          d: [
            "Increase camera resolution during the stall",
            "Larger frames may add load rather than recover the task.",
          ],
        },
        [
          "The predictor and planner lack a new dependency result.",
          "Age-aware fallback preserves honesty about scene uncertainty.",
        ],
        "DAG failures need explicit stale-data semantics.",
        "9.4",
        140,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A laboratory pipeline performs capture, inference, review, then actuation. Which lesson transfers?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "Run actuation before review to reduce queue length",
            "This violates the safety dependency.",
          ],
          b: [
            "Encode dependencies and carry timestamps",
            "Correct. The chain can then enforce ordering and age.",
          ],
          c: [
            "Assign random timers without linking samples",
            "Data from different experiments may be mixed.",
          ],
          d: [
            "Remove stage-level traces after deployment",
            "Traces are needed to diagnose stale or skipped work.",
          ],
        },
        [
          "Each stage transforms a specific upstream sample.",
          "Dependency and timestamp metadata preserve causal lineage.",
        ],
        "DAG provenance transfers to automated experimental systems.",
        "9.4",
        140,
      ),
    },
  ),
  makeCase(
    "multirate-overwrite",
    {
      kind: "log",
      caption: "Multi-rate sampling",
      lines: [
        "camera produces frame 100, 101, 102 at 30 Hz",
        "detector runs at 10 Hz and reads frame 102",
        "frame slots store latest value only",
        "planner expected an object from frame 101",
        "no sequence check at consumer",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which design makes the overwrite behavior safe and explicit?",
        ["ch9-realtime", "ch9-time"],
        "d",
        {
          a: [
            "Hide frame numbers so consumers see a simple stream",
            "Removing identity makes mismatch harder to detect.",
          ],
          b: [
            "Assume each detector run processes all camera frames",
            "The rates and latest-value slot contradict that assumption.",
          ],
          c: [
            "Slow the planner without changing data semantics",
            "Waiting does not recover overwritten frames.",
          ],
          d: [
            "Define sampling and propagate sequence and age",
            "Correct. Consumers can know which frame produced each result.",
          ],
        },
        [
          "The detector intentionally skips intermediate frames.",
          "Sequence metadata distinguishes designed sampling from silent loss.",
        ],
        "Multi-rate systems need explicit sample-selection semantics.",
        "9.4",
        140,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why did the planner's expectation fail?",
        ["ch9-realtime"],
        "a",
        {
          a: [
            "Frame 101 was replaced pre-detection",
            "Correct. The 30 Hz producer outpaced the 10 Hz consumer.",
          ],
          b: [
            "Frame 101 arrived after frame 102",
            "The log lists normal sequence order.",
          ],
          c: [
            "The planner changed camera exposure",
            "Planning does not control the stored frame here.",
          ],
          d: [
            "PTP moved the vehicle map origin",
            "Clock sync is not the described overwrite mechanism.",
          ],
        },
        [
          "The storage holds one current frame.",
          "By the detector's turn, frame 102 has replaced frame 101.",
        ],
        "Rate mismatch can create deterministic loss even without network failure.",
        "9.4",
        140,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "When is a latest-value slot preferable to a full queue?",
        ["ch9-realtime"],
        "c",
        {
          a: [
            "When every historical sample must be processed",
            "A queue is needed for completeness.",
          ],
          b: [
            "When downstream reconstruction needs every frame",
            "Latest-value storage discards frames.",
          ],
          c: [
            "When current state matters more than history",
            "Correct. Superseded state can be dropped intentionally.",
          ],
          d: [
            "When message identity should remain unknown",
            "Sequence metadata is still valuable.",
          ],
        },
        [
          "Some control consumers act on the newest state.",
          "Processing an old backlog can be less useful than skipping it.",
        ],
        "Buffer semantics should match whether data is state or event history.",
        "9.4",
        140,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If detector rate rises to 30 Hz with enough compute, what changes?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "Frame identity becomes unnecessary",
            "Sequence tracking remains useful for failures.",
          ],
          b: [
            "Routine pre-detection overwrites should fall",
            "Correct. Producer and consumer rates now match.",
          ],
          c: [
            "The camera must produce fewer pixels",
            "Processing rate can rise without changing resolution.",
          ],
          d: [
            "Planner deadlines disappear from the system",
            "Downstream timing still matters.",
          ],
        },
        [
          "The consumer can now service each nominal arrival.",
          "Overwrite risk falls if execution also stays within period.",
        ],
        "Rate alignment reduces one loss mechanism but not execution jitter.",
        "9.4",
        140,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "An industrial sensor updates at 1 kHz while monitoring runs at 100 Hz. Which lesson transfers?",
        ["ch9-realtime"],
        "d",
        {
          a: [
            "Claim the monitor observes all samples without buffering",
            "Its rate is ten times lower.",
          ],
          b: [
            "Discard timestamps to simplify the dashboard",
            "Then sample age and selection are hidden.",
          ],
          c: [
            "Use one buffer policy for alarms and current state",
            "Events and state can require different semantics.",
          ],
          d: [
            "Decimate state; queue critical events separately",
            "Correct. The policies preserve freshness and event completeness.",
          ],
        },
        [
          "High-rate state can be sampled, while alarm events may not be replaceable.",
          "Explicit sequence and buffer rules prevent silent assumptions.",
        ],
        "Multi-rate buffer reasoning transfers to industrial telemetry.",
        "9.4",
        140,
      ),
    },
  ),
  makeCase(
    "vpi-portability",
    {
      kind: "table",
      caption: "Two vehicle platforms",
      columns: ["Function", "Platform X", "Platform Y"],
      rows: [
        ["steering command", "vendor API X", "vendor API Y"],
        ["wheel speed", "CAN frame 0x120", "Ethernet signal"],
        ["compute", "GPU", "NPU"],
        ["application", "same lane controller", "same lane controller"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which VPI design best supports one controller on both platforms?",
        ["ch9-vpi"],
        "c",
        {
          a: [
            "Embed both vendor APIs throughout planning code",
            "That spreads platform coupling across the application.",
          ],
          b: [
            "Require Platform Y to emulate every X hardware detail",
            "Hardware imitation defeats portable abstraction.",
          ],
          c: [
            "Expose stable steering, data, and compute contracts through adapters",
            "Correct. Platform-specific work stays behind a common interface.",
          ],
          d: [
            "Remove wheel-speed feedback from the controller",
            "Portability should not discard required data.",
          ],
        },
        [
          "The controller needs the same functional concepts on both vehicles.",
          "Adapters translate those concepts into each hardware mechanism.",
        ],
        "VPI separates application intent from platform implementation.",
        "9.5",
        142,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "A controller port requires changing 38 vendor calls. What architecture weakness does that reveal?",
        ["ch9-vpi"],
        "b",
        {
          a: [
            "The controller contains too few source files",
            "File count does not define coupling.",
          ],
          b: [
            "Hardware-specific details leaked across the application",
            "Correct. A VPI boundary should concentrate those translations.",
          ],
          c: [
            "Platform Y lacks any steering mechanism",
            "The table lists a vendor steering API.",
          ],
          d: [
            "CAN cannot carry wheel speed",
            "Platform X already uses a CAN signal.",
          ],
        },
        [
          "The same logical controller must be edited in many locations.",
          "That indicates a missing or porous abstraction boundary.",
        ],
        "Porting cost is evidence about interface quality.",
        "9.5",
        142,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which contract is more portable?",
        ["ch9-vpi"],
        "a",
        {
          a: [
            "Command curvature with limits and receive standardized status",
            "Correct. It expresses vehicle function without naming a bus.",
          ],
          b: [
            "Write bytes to CAN frame 0x120 inside the planner",
            "That binds the planner to Platform X.",
          ],
          c: [
            "Call vendor API Y from every behavior module",
            "That binds modules to Platform Y.",
          ],
          d: [
            "Select a GPU memory address in each trajectory",
            "Application logic should not encode hardware addresses.",
          ],
        },
        [
          "Functional commands remain meaningful across hardware.",
          "Bus frames and vendor calls are implementation details.",
        ],
        "Portable interfaces expose capabilities and constraints.",
        "9.5",
        142,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If Platform Y changes from NPU to GPU behind the same compute contract, what should happen?",
        ["ch9-vpi"],
        "d",
        {
          a: [
            "Every planning algorithm must change its public API",
            "A stable contract should protect callers.",
          ],
          b: [
            "Wheel-speed transport converts to CAN by necessity",
            "Compute hardware does not dictate sensor network.",
          ],
          c: [
            "The vehicle loses steering capability",
            "Accelerator replacement does not remove steering.",
          ],
          d: [
            "Adapter and performance validation change; application logic can remain",
            "Correct. The abstraction contains the hardware change.",
          ],
        },
        [
          "The VPI contract expresses the required computation service.",
          "A platform adapter maps that service to the new device.",
        ],
        "Stable contracts reduce the blast radius of hardware evolution.",
        "9.5",
        142,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A farm robot application must run on three actuator vendors. Which lesson transfers?",
        ["ch9-vpi"],
        "c",
        {
          a: [
            "Scatter vendor register writes across mission logic",
            "That increases coupling and verification cost.",
          ],
          b: [
            "Remove actuator feedback to keep code common",
            "A common interface can preserve feedback.",
          ],
          c: [
            "Define capability contracts and isolate vendor adapters",
            "Correct. Functional intent stays independent of hardware details.",
          ],
          d: [
            "Make each field map encode motor registers",
            "Map data should not own actuator implementation.",
          ],
        },
        [
          "The mission uses the same functional actions across platforms.",
          "Adapters translate those actions into vendor-specific commands.",
        ],
        "VPI-style abstraction transfers to heterogeneous robots.",
        "9.5",
        142,
      ),
    },
  ),
  makeCase(
    "vpi-update-contract",
    {
      kind: "log",
      caption: "OTA update incident",
      lines: [
        "controller expects steering API v3",
        "gateway updated to API v4",
        "field renamed: angle -> road_wheel_angle",
        "units changed: degrees -> radians",
        "compatibility negotiation absent",
        "command rejected after update",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which update design best prevents this class of failure?",
        ["ch9-vpi"],
        "a",
        {
          a: [
            "Version contracts, negotiate capability, and test unit conversions",
            "Correct. The update becomes explicit and compatibility is checked.",
          ],
          b: [
            "Rename fields without publishing a schema",
            "That repeats the incident.",
          ],
          c: [
            "Let callers infer units from numeric magnitude",
            "Inference is unsafe and ambiguous.",
          ],
          d: [
            "Apply every gateway update during active steering",
            "Live unvalidated changes increase risk.",
          ],
        },
        [
          "The update changed both name and unit across an unchecked boundary.",
          "Versioned schemas and compatibility tests expose those changes before control.",
        ],
        "OTA safety depends on interface evolution discipline.",
        "9.5",
        143,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is a unit change especially dangerous even if the field name is adapted?",
        ["ch9-vpi"],
        "d",
        {
          a: [
            "Radians contain no steering information",
            "Radians validly represent angle.",
          ],
          b: [
            "Degrees are stored only on CAN buses",
            "Units are independent of transport.",
          ],
          c: [
            "Renaming a field converts values automatically",
            "A name mapping does not scale the number.",
          ],
          d: [
            "A numerically valid command can represent the wrong physical angle",
            "Correct. Semantic mismatch may pass type checks and reach actuation.",
          ],
        },
        [
          "Both units use ordinary numeric values.",
          "Without conversion, the same number has a very different physical meaning.",
        ],
        "Interface compatibility includes units and semantics, not names alone.",
        "9.5",
        143,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which schema change is safer for deployed callers?",
        ["ch9-vpi"],
        "b",
        {
          a: [
            "Remove the old field without a transition period",
            "Existing callers fail immediately.",
          ],
          b: [
            "Add v4 explicitly with conversion and deprecation support",
            "Correct. Old and new behavior remain testable during migration.",
          ],
          c: [
            "Keep one version label while changing meaning silently",
            "The label then hides incompatibility.",
          ],
          d: [
            "Accept commands without checking declared units",
            "That permits unsafe semantic mismatch.",
          ],
        },
        [
          "Deployed systems cannot change every component atomically.",
          "Versioning and conversion create a controlled transition.",
        ],
        "Backward compatibility should be deliberate and observable.",
        "9.5",
        143,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If 30 degrees is interpreted as 30 radians, what follows?",
        ["ch9-vpi"],
        "c",
        {
          a: [
            "The physical request remains thirty degrees",
            "The receiver uses a different unit.",
          ],
          b: [
            "The gateway detects the error from field type alone",
            "Both values share the same numeric type.",
          ],
          c: [
            "The requested angle becomes physically nonsensical or saturates",
            "Correct. Thirty radians is many full rotations.",
          ],
          d: [
            "The controller clock gains thirty seconds",
            "Angle units do not affect time.",
          ],
        },
        [
          "One radian is about 57.3 degrees.",
          "Thirty radians lies far outside normal steering range.",
        ],
        "Semantic checks and physical limits catch unit failures.",
        "9.5",
        143,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A medical pump API changes dose units across versions. Which AV lesson transfers?",
        ["ch9-vpi"],
        "a",
        {
          a: [
            "Version the semantic contract and validate conversion limits",
            "Correct. Numeric type compatibility cannot protect physical meaning.",
          ],
          b: [
            "Infer dose unit from the patient's name",
            "Identity does not encode units.",
          ],
          c: [
            "Apply the change without staged verification",
            "Unvalidated rollout exposes patients.",
          ],
          d: [
            "Hide the schema change in release notes",
            "Callers need machine-checkable compatibility.",
          ],
        },
        [
          "Both interfaces convert numeric commands into physical action.",
          "A silent unit mismatch can pass software checks and cause harm.",
        ],
        "VPI contract lessons transfer to other safety APIs.",
        "9.5",
        143,
      ),
    },
  ),
  makeCase(
    "memory-contention",
    {
      kind: "table",
      caption: "Shared-memory trace",
      columns: ["Load", "Perception", "Planning", "Control"],
      rows: [
        ["nominal", "32 ms", "18 ms", "2 ms"],
        ["logging burst", "47 ms", "39 ms", "9 ms"],
        ["memory bandwidth", "72% -> 99%", "shared", "shared"],
        ["CPU utilization", "61% -> 65%", "modest rise", "modest rise"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which first mitigation best matches the bottleneck evidence?",
        ["ch9-hardware", "ch9-realtime"],
        "d",
        {
          a: [
            "Add CPU cores while leaving memory traffic unchanged",
            "CPU utilization is not the saturated resource.",
          ],
          b: [
            "Increase logging burst size for better throughput",
            "More traffic worsens memory saturation.",
          ],
          c: [
            "Disable timing traces before locating the path",
            "Removing evidence impedes diagnosis.",
          ],
          d: [
            "Throttle logging and reserve bandwidth for critical tasks",
            "Correct. The intervention targets the shared 99% memory path.",
          ],
        },
        [
          "Task latency rises sharply while CPU use changes little.",
          "Memory bandwidth reaches saturation during logging.",
        ],
        "Shared-memory interference can violate deadlines across processors.",
        "9.6",
        145,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why does adding idle CPU capacity have limited value here?",
        ["ch9-hardware"],
        "c",
        {
          a: [
            "CPUs cannot access shared memory",
            "They depend on memory for data and instructions.",
          ],
          b: [
            "Logging uses no processor instructions",
            "Logging does execute, but the measured saturation is bandwidth.",
          ],
          c: [
            "Tasks wait on a saturated memory path rather than compute slots",
            "Correct. More cores can add further memory demand.",
          ],
          d: [
            "Control latency is already below every deadline",
            "The table does not state its deadline.",
          ],
        },
        [
          "CPU utilization remains near 65%.",
          "The memory channel reaches 99% while all task latencies rise.",
        ],
        "Scale the resource that is actually binding.",
        "9.6",
        145,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which measurement separates memory contention from pure CPU overload?",
        ["ch9-hardware"],
        "a",
        {
          a: [
            "Bandwidth counters rise to saturation while CPU stays moderate",
            "Correct. The resources show different utilization patterns.",
          ],
          b: [
            "Both systems contain source code",
            "Source code presence gives no runtime evidence.",
          ],
          c: [
            "The vehicle drives during the trace",
            "Driving context does not identify the resource.",
          ],
          d: [
            "Task names differ in character length",
            "Naming does not affect hardware load.",
          ],
        },
        [
          "CPU and memory have separate performance counters.",
          "The observed divergence isolates the likely bottleneck.",
        ],
        "Use resource-specific telemetry for contention diagnosis.",
        "9.6",
        145,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If logging is capped and bandwidth falls to 80%, what is expected?",
        ["ch9-hardware"],
        "b",
        {
          a: [
            "Every algorithm becomes more accurate",
            "Latency relief does not guarantee model accuracy.",
          ],
          b: [
            "Queueing delay for perception, planning, and control should fall",
            "Correct. Shared traffic now has spare service capacity.",
          ],
          c: [
            "PTP clocks change their time base",
            "Memory load does not set clock time.",
          ],
          d: [
            "The route graph loses half its nodes",
            "Bandwidth capping does not edit map data.",
          ],
        },
        [
          "The critical tasks competed at 99% utilization.",
          "Restoring headroom reduces waiting for shared memory.",
        ],
        "Resource headroom is part of predictable performance.",
        "9.6",
        145,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A game console's audio glitches only during video capture despite spare CPU. Which lesson transfers?",
        ["ch9-hardware"],
        "d",
        {
          a: [
            "Increase audio file size before profiling",
            "More data may worsen contention.",
          ],
          b: [
            "Assume spare CPU rules out hardware interference",
            "Memory and I/O can bind independently.",
          ],
          c: [
            "Remove audio deadlines from the application",
            "The perceptual glitch remains.",
          ],
          d: [
            "Inspect shared memory and I/O bandwidth under capture load",
            "Correct. Cross-task latency can arise from a non-CPU resource.",
          ],
        },
        [
          "The symptom follows a bandwidth-intensive capture operation.",
          "CPU headroom does not exclude memory or I/O saturation.",
        ],
        "Shared-resource diagnosis transfers to consumer systems.",
        "9.6",
        145,
      ),
    },
  ),
  makeCase(
    "unified-memory-path",
    {
      kind: "table",
      caption: "CPU-GPU exchange",
      columns: ["Architecture", "Copies/frame", "Latency", "Power"],
      rows: [
        ["separate memory", "3", "11 ms", "18 W"],
        ["unified coherent memory", "0", "4 ms", "13 W"],
        ["coherency fault injected", "stale planner read", "unsafe", "-"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which adoption plan best uses unified memory without hiding its risk?",
        ["ch9-hardware"],
        "b",
        {
          a: [
            "Remove every synchronization primitive after copies vanish",
            "Shared memory still needs ordering and coherency.",
          ],
          b: [
            "Use zero-copy paths with validated ownership and coherency rules",
            "Correct. It keeps the measured benefit while controlling stale reads.",
          ],
          c: [
            "Add three software copies to match the old design",
            "That discards the latency and power benefit.",
          ],
          d: [
            "Accept stale planner data when average latency is low",
            "A single stale safety input can be consequential.",
          ],
        },
        [
          "Unified memory cuts copies, latency, and power in the nominal trace.",
          "The injected fault shows that data visibility still needs a contract.",
        ],
        "Zero-copy performance requires explicit synchronization correctness.",
        "9.6",
        145,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why can a planner read stale data in physically shared memory?",
        ["ch9-hardware"],
        "d",
        {
          a: [
            "Shared memory contains no addresses",
            "It still uses addressable storage.",
          ],
          b: [
            "The GPU cannot write memory values",
            "GPU kernels produce shared results.",
          ],
          c: [
            "Lower power prevents cache updates",
            "Power level is not the direct mechanism.",
          ],
          d: [
            "Caches and task ordering may expose data before completion",
            "Correct. Coherency and synchronization govern visibility.",
          ],
        },
        [
          "Physical sharing removes copies, not temporal dependencies.",
          "A reader must know when a writer has completed and data is coherent.",
        ],
        "Memory topology does not replace concurrency semantics.",
        "9.6",
        145,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What benefit is directly supported by the nominal rows?",
        ["ch9-hardware"],
        "a",
        {
          a: [
            "Lower exchange latency and power with fewer copies",
            "Correct. The table quantifies all three improvements.",
          ],
          b: [
            "Guaranteed correctness under every synchronization fault",
            "The injected stale read disproves this.",
          ],
          c: [
            "Higher network bandwidth between vehicles",
            "The table concerns onboard memory.",
          ],
          d: [
            "Elimination of processor scheduling",
            "CPU and GPU tasks still require scheduling.",
          ],
        },
        [
          "The unified row shows zero copies, 4 ms, and 13 W.",
          "Those are measured local data-path benefits.",
        ],
        "State benefits narrowly and preserve failure caveats.",
        "9.6",
        145,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If a completion fence is added before planner access, what should improve?",
        ["ch9-hardware"],
        "c",
        {
          a: [
            "The sensor frame rate doubles by itself",
            "A fence does not change acquisition.",
          ],
          b: [
            "The planner receives data before the GPU writes it",
            "The fence enforces the opposite order.",
          ],
          c: [
            "Stale-read risk falls at some synchronization cost",
            "Correct. Ordering improves while adding a small wait.",
          ],
          d: [
            "Memory power becomes exactly zero",
            "Synchronization does not remove memory energy.",
          ],
        },
        [
          "The fault arises from reading before data becomes visible.",
          "A completion fence orders producer and consumer.",
        ],
        "Correctness barriers trade small latency for valid data.",
        "9.6",
        145,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A phone shares memory between camera ISP and AI accelerator. Which lesson transfers?",
        ["ch9-hardware"],
        "b",
        {
          a: [
            "Zero copies make frame ownership irrelevant",
            "Concurrent components still need ownership rules.",
          ],
          b: [
            "Exploit shared buffers but validate lifecycle and coherency",
            "Correct. Performance and correctness depend on both.",
          ],
          c: [
            "Copy frames repeatedly to prove they are current",
            "Copies add cost and do not inherently prove freshness.",
          ],
          d: [
            "Use battery level as a completion signal",
            "Battery state does not order memory operations.",
          ],
        },
        [
          "The phone has the same heterogeneous producer-consumer path.",
          "Shared buffers save work only when handoff is correct.",
        ],
        "Unified-memory discipline transfers to embedded AI systems.",
        "9.6",
        145,
      ),
    },
  ),
  makeCase(
    "thermal-throttling",
    {
      kind: "log",
      caption: "Hot-day compute trace",
      lines: [
        "ambient: 38 C",
        "GPU temperature: 91 C",
        "GPU clock: 1.2 -> 0.65 GHz",
        "perception latency: 34 -> 71 ms",
        "deadline: 50 ms",
        "fan at maximum",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which response best protects operation in this condition?",
        ["ch9-hardware", "ch9-realtime"],
        "c",
        {
          a: [
            "Keep full workload and hide the temperature alarm",
            "The deadline is already missed.",
          ],
          b: [
            "Raise GPU clock above its thermal limit",
            "That can worsen overheating and throttling.",
          ],
          c: [
            "Use thermal-aware workload reduction and a validated degraded mode",
            "Correct. It lowers demand while preserving a safe service level.",
          ],
          d: [
            "Increase camera resolution during the hot period",
            "More work increases thermal and timing pressure.",
          ],
        },
        [
          "Thermal throttling nearly doubles perception latency beyond deadline.",
          "A safe system needs a planned response rather than nominal assumptions.",
        ],
        "Environmental and thermal limits belong in the real-time safety case.",
        "9.6",
        145,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Which evidence ties the deadline miss to thermal behavior?",
        ["ch9-hardware"],
        "a",
        {
          a: [
            "Clock falls as temperature reaches 91 C and latency rises",
            "Correct. The three changes form a coherent throttling pattern.",
          ],
          b: [
            "The fan runs while the map remains loaded",
            "Fan activity alone does not quantify the compute effect.",
          ],
          c: [
            "The deadline is written as fifty milliseconds",
            "A requirement does not identify the cause.",
          ],
          d: [
            "Ambient temperature uses Celsius units",
            "Units do not establish throttling.",
          ],
        },
        [
          "The GPU crosses a hot operating point.",
          "Its clock reduction and latency increase occur together.",
        ],
        "Correlated resource telemetry can expose environment-dependent bottlenecks.",
        "9.6",
        145,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which benchmark is more representative for deployment?",
        ["ch9-hardware"],
        "d",
        {
          a: [
            "One cold-start run before the enclosure warms",
            "It misses sustained thermal behavior.",
          ],
          b: [
            "A desktop GPU test outside the vehicle enclosure",
            "Cooling and power differ from deployment.",
          ],
          c: [
            "Nominal average latency without temperature logs",
            "The average hides condition-dependent tails.",
          ],
          d: [
            "Sustained workload across ambient and cooling limits",
            "Correct. It exercises the actual thermal envelope.",
          ],
        },
        [
          "The failure appears only after heat reduces clock speed.",
          "A sustained environmental sweep tests that mechanism.",
        ],
        "Benchmark the deployed operating envelope, not a convenient laboratory point.",
        "9.6",
        145,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If model load falls enough to hold GPU at 80 C, what is expected?",
        ["ch9-hardware"],
        "b",
        {
          a: [
            "PTP offset must increase",
            "Clock synchronization is a separate subsystem.",
          ],
          b: [
            "Throttling pressure and latency should decline",
            "Correct. Lower heat permits higher sustained compute performance.",
          ],
          c: [
            "Every perception error becomes impossible",
            "Latency recovery does not guarantee model accuracy.",
          ],
          d: [
            "Vehicle control no longer needs deadlines",
            "Control timing requirements remain.",
          ],
        },
        [
          "The trace links high temperature to clock reduction.",
          "Reducing sustained heat can restore clock and response time.",
        ],
        "Thermal-aware adaptation can recover timing headroom.",
        "9.6",
        145,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A laptop AI service slows after ten minutes despite low initial latency. Which lesson transfers?",
        ["ch9-hardware"],
        "a",
        {
          a: [
            "Profile sustained temperature, clock, and tail latency",
            "Correct. Warm-state behavior may differ from startup.",
          ],
          b: [
            "Report only the first inference time",
            "That omits the suspected thermal transition.",
          ],
          c: [
            "Increase workload until the slowdown disappears",
            "More heat can deepen throttling.",
          ],
          d: [
            "Remove temperature telemetry to reduce noise",
            "Telemetry is needed to confirm the mechanism.",
          ],
        },
        [
          "The slowdown appears with elapsed sustained load.",
          "Thermal throttling is a plausible time-dependent cause.",
        ],
        "Warm-state validation transfers to edge computing devices.",
        "9.6",
        145,
      ),
    },
  ),
  makeCase(
    "fault-containment",
    {
      kind: "table",
      caption: "Injected hardware faults",
      columns: ["Fault", "Detection", "Current response"],
      rows: [
        ["single-bit DRAM error", "ECC corrects", "continue"],
        ["double-bit DRAM error", "ECC detects", "process crashes"],
        ["primary brake MCU stops", "watchdog detects", "no backup command"],
        ["GPU hangs", "health monitor detects", "planner stalls"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which improvement addresses the highest-consequence uncovered gap?",
        ["ch9-hardware", "ch9-realtime"],
        "d",
        {
          a: [
            "Log more corrected single-bit errors without fallback",
            "Logging does not restore braking after MCU loss.",
          ],
          b: [
            "Increase GPU image quality during a hang",
            "A hung device cannot process more work.",
          ],
          c: [
            "Remove the watchdog to avoid fault alerts",
            "Detection is necessary for containment.",
          ],
          d: [
            "Add an independent brake path and safe takeover policy",
            "Correct. The current single MCU fault leaves no command source.",
          ],
        },
        [
          "The watchdog detects brake-controller loss.",
          "The response column shows no redundant actuation command.",
        ],
        "Fault detection must connect to a safe recovery path.",
        "9.6",
        146,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is ECC correction stronger than simple error logging for the first fault?",
        ["ch9-hardware"],
        "c",
        {
          a: [
            "ECC changes the vehicle route after a bit flip",
            "ECC acts on memory data.",
          ],
          b: [
            "Logging prevents the bit from changing",
            "A log records rather than repairs.",
          ],
          c: [
            "ECC repairs the data before software consumes it",
            "Correct. The transient fault is contained at the memory layer.",
          ],
          d: [
            "ECC removes the need for health monitoring",
            "Uncorrectable and repeated errors still need handling.",
          ],
        },
        [
          "The table says the single-bit error is corrected.",
          "Software can continue with valid data while telemetry records the event.",
        ],
        "Detection, correction, and recovery are distinct fault responses.",
        "9.6",
        146,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which pair provides diversity against one design defect?",
        ["ch9-hardware"],
        "b",
        {
          a: [
            "Two identical brake processes on one failed MCU",
            "The shared hardware fault removes both.",
          ],
          b: [
            "Independent safety MCU and separate command path",
            "Correct. Separation reduces common hardware dependence.",
          ],
          c: [
            "One watchdog with no recovery action",
            "Detection alone cannot issue braking.",
          ],
          d: [
            "One GPU process with a larger queue",
            "Queue size does not create redundancy.",
          ],
        },
        [
          "Diverse paths should not share the primary failure source.",
          "A separate controller and route can retain command authority.",
        ],
        "Redundancy must avoid common-mode dependencies.",
        "9.6",
        146,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If GPU hang triggers a conservative trajectory cached on the safety MCU, what improves?",
        ["ch9-hardware"],
        "a",
        {
          a: [
            "A detected planner fault gains a bounded fallback action",
            "Correct. The vehicle can reduce risk without waiting for GPU recovery.",
          ],
          b: [
            "The GPU hardware repairs itself immediately",
            "Fallback does not repair the device.",
          ],
          c: [
            "Every future trajectory becomes globally optimal",
            "A cached safe action is intentionally conservative.",
          ],
          d: [
            "ECC begins correcting processor hangs",
            "Memory ECC does not restart a GPU.",
          ],
        },
        [
          "The current response stalls planning after detection.",
          "A safety controller can execute a predefined minimal-risk action.",
        ],
        "Graceful degradation converts detection into containment.",
        "9.6",
        146,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A data center detects a failed cooling controller but has no backup. Which lesson transfers?",
        ["ch9-hardware"],
        "c",
        {
          a: [
            "Suppress detection so service continues",
            "Hidden overheating can create wider failure.",
          ],
          b: [
            "Add another monitor without a control path",
            "More detection still cannot actuate cooling.",
          ],
          c: [
            "Provide an independent controller and degraded operating mode",
            "Correct. The response path survives the primary fault.",
          ],
          d: [
            "Route cooling commands through the failed device",
            "That preserves the single point of failure.",
          ],
        },
        [
          "The system knows about the fault but cannot respond.",
          "Independent control and load shedding provide containment.",
        ],
        "Fault-response architecture transfers to infrastructure systems.",
        "9.6",
        146,
      ),
    },
  ),
  makeCase(
    "zonal-backbone",
    {
      kind: "table",
      caption: "Vehicle wiring redesign",
      columns: ["Metric", "Legacy", "Zonal"],
      rows: [
        ["sensor home runs", "central compute", "nearest zone"],
        ["cable length", "100%", "63%"],
        ["zone-to-central link", "many low-rate buses", "high-speed backbone"],
        ["zone failure", "not isolated", "one quarter sensors affected"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which safety requirement follows from the zonal design?",
        ["ch9-hardware", "ch9-vpi"],
        "a",
        {
          a: [
            "Backbone and zone failures need isolation and degraded behavior",
            "Correct. Consolidation changes the size and shape of fault domains.",
          ],
          b: [
            "Every zone may use undocumented private signals",
            "That undermines integration and diagnosis.",
          ],
          c: [
            "Central compute can ignore zone health reports",
            "Health is needed to identify lost sensing regions.",
          ],
          d: [
            "Shorter cable length proves complete fault tolerance",
            "Wiring reduction does not guarantee recovery.",
          ],
        },
        [
          "A zone failure removes a known geographic subset.",
          "The backbone also becomes a shared dependency across zones.",
        ],
        "Architectural simplification must include fault-domain analysis.",
        "9.6",
        146,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "All sensors in one vehicle corner vanish together. What should be inspected first?",
        ["ch9-hardware"],
        "b",
        {
          a: [
            "A global map update affecting every city",
            "The failure is localized to one hardware region.",
          ],
          b: [
            "That corner's zonal controller, power, and backbone port",
            "Correct. These components are shared by the missing sensors.",
          ],
          c: [
            "The steering-control gain",
            "Controller tuning does not power sensors.",
          ],
          d: [
            "The number of route-planning nodes",
            "Planning graph size does not explain a corner-wide outage.",
          ],
        },
        [
          "The missing sensors share physical zone infrastructure.",
          "A common zone fault explains their correlated loss.",
        ],
        "Failure correlation reveals shared architectural dependencies.",
        "9.6",
        146,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What benefit is directly supported by the table?",
        ["ch9-hardware"],
        "d",
        {
          a: [
            "Zonal design removes the need for a backbone",
            "The table explicitly adds a high-speed backbone.",
          ],
          b: [
            "A zone failure affects no sensors",
            "One quarter are affected in the example.",
          ],
          c: [
            "Legacy wiring has shorter aggregate cable",
            "The zonal design reduces cable length to 63%.",
          ],
          d: [
            "Local aggregation reduces long sensor cable runs",
            "Correct. Sensors connect to their nearest zone.",
          ],
        },
        [
          "The redesign moves first-hop connections closer to sensors.",
          "The table quantifies a substantial cable reduction.",
        ],
        "State zonal benefits without erasing new shared dependencies.",
        "9.6",
        146,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If the backbone saturates, what effect may span otherwise healthy zones?",
        ["ch9-hardware"],
        "c",
        {
          a: [
            "Each local cable becomes physically longer",
            "Network load does not change cable length.",
          ],
          b: [
            "Zone power supplies stop producing voltage",
            "Backbone traffic does not require power failure.",
          ],
          c: [
            "Central consumers receive delayed data from several zones",
            "Correct. The backbone is their shared transport path.",
          ],
          d: [
            "Sensor calibration values become radians",
            "Saturation affects delivery, not units.",
          ],
        },
        [
          "Zones aggregate traffic onto one high-speed path.",
          "Backbone overload can therefore create cross-zone latency.",
        ],
        "A shared backbone requires capacity and QoS analysis.",
        "9.6",
        146,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A smart building aggregates devices by floor onto one backbone. Which lesson transfers?",
        ["ch9-hardware"],
        "a",
        {
          a: [
            "Analyze floor fault domains and shared-backbone capacity",
            "Correct. Local simplification creates regional and shared dependencies.",
          ],
          b: [
            "Assume shorter wires eliminate service outages",
            "Controllers and backbone can still fail.",
          ],
          c: [
            "Remove floor health telemetry after aggregation",
            "Health data is needed for fault localization.",
          ],
          d: [
            "Let every floor use incompatible message meaning",
            "Interoperability is necessary at the backbone.",
          ],
        },
        [
          "Each floor resembles a vehicle zone.",
          "A common backbone connects otherwise regional devices.",
        ],
        "Zonal fault reasoning transfers to distributed infrastructure.",
        "9.6",
        146,
      ),
    },
  ),
  makeCase(
    "end-to-end-profiling",
    {
      kind: "table",
      caption: "Emergency-brake budget",
      columns: ["Stage", "Mean", "p99", "Budget"],
      rows: [
        ["sensor transfer", "8 ms", "14 ms", "12 ms"],
        ["perception", "24 ms", "41 ms", "35 ms"],
        ["planning", "10 ms", "18 ms", "15 ms"],
        ["control+actuator", "13 ms", "24 ms", "20 ms"],
        ["total", "55 ms", "97 ms", "82 ms"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which optimization plan follows the evidence most closely?",
        ["ch9-pipeline", "ch9-realtime"],
        "c",
        {
          a: [
            "Optimize only mean control time because it is physical",
            "Several p99 stages and total miss their budgets.",
          ],
          b: [
            "Raise the total budget without examining stopping distance",
            "A requirement change needs a safety basis.",
          ],
          c: [
            "Reduce p99 overruns across transfer, perception, planning, and actuation",
            "Correct. Every listed stage contributes to the tail miss.",
          ],
          d: [
            "Remove p99 measurements and report the 55 ms mean",
            "That hides recurring unsafe timing.",
          ],
        },
        [
          "The p99 total exceeds budget by 15 ms.",
          "Each stage also exceeds its allocated tail budget.",
        ],
        "End-to-end timing improves through composed stage budgets and tail control.",
        "9.7",
        146,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why can all mean values look acceptable while the system still fails?",
        ["ch9-realtime"],
        "d",
        {
          a: [
            "Mean stage times are larger than p99 times",
            "The table shows the opposite.",
          ],
          b: [
            "Budgets are measured in a different time unit",
            "All values use milliseconds.",
          ],
          c: [
            "Actuators do not contribute to vehicle response",
            "Their delay is part of the total.",
          ],
          d: [
            "Correlated or rare long stages push tail latency beyond budget",
            "Correct. Safety depends on response during slow cycles too.",
          ],
        },
        [
          "The mean total is 55 ms, below 82 ms.",
          "The p99 total reaches 97 ms and violates the requirement.",
        ],
        "Typical performance cannot establish a real-time guarantee.",
        "9.7",
        146,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which result is most relevant to a deadline claim?",
        ["ch9-realtime"],
        "b",
        {
          a: [
            "The fastest single perception frame",
            "A best case does not bound response.",
          ],
          b: [
            "Tail response under representative load",
            "Correct. It tests whether slow cycles remain within deadline.",
          ],
          c: [
            "The number of benchmark charts produced",
            "Chart count does not establish timing.",
          ],
          d: ["Average CPU model price", "Price does not bound response time."],
        },
        [
          "A deadline applies to each safety-relevant cycle.",
          "Tail and worst-case tests expose rare misses.",
        ],
        "Use the statistic that matches the assurance claim.",
        "9.7",
        146,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If perception p99 drops by 12 ms and other stages stay fixed, what total is expected?",
        ["ch9-pipeline"],
        "a",
        {
          a: [
            "About 85 ms, still three milliseconds over budget",
            "Correct. Subtract 12 ms from the 97 ms p99 total.",
          ],
          b: [
            "About 70 ms because every stage becomes faster",
            "Only perception is changed.",
          ],
          c: [
            "About 97 ms because stages never compose",
            "The perception reduction changes total path latency.",
          ],
          d: [
            "About 12 ms because perception dominates the system",
            "Other stages still consume substantial time.",
          ],
        },
        [
          "The original p99 total is 97 ms.",
          "A 12 ms stage reduction yields 85 ms.",
        ],
        "Quantitative budgets show whether one optimization is sufficient.",
        "9.7",
        146,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A robotics team reports fast module benchmarks but misses physical stop deadlines. Which lesson transfers?",
        ["ch9-pipeline", "ch9-realtime"],
        "b",
        {
          a: [
            "Benchmark more modules separately and skip integration",
            "The failure appears in the composed physical path.",
          ],
          b: [
            "Trace acquisition through actuation under representative load",
            "Correct. End-to-end evidence captures queues and interference.",
          ],
          c: [
            "Measure only algorithm accuracy during idle time",
            "Accuracy and idle timing omit the response failure.",
          ],
          d: [
            "Change the deadline to match the slowest observed run",
            "Safety requirements need a physical basis.",
          ],
        },
        [
          "Module times do not include all queues and shared resources.",
          "A physical end-to-end trace reveals the actual stopping chain.",
        ],
        "Integrated timing validation transfers across autonomous systems.",
        "9.7",
        146,
      ),
    },
  ),
];

export const chapter9Assessment: ChapterAssessment = {
  chapterId: 9,
  objectives,
  cases,
};
