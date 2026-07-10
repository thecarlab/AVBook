import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    id: 1,
    title: "Introduction to Autonomous Driving",
    shortTitle: "Introduction",
    summary:
      "Define autonomous vehicles and SAE automation levels, then connect the core AV stack to its history, societal effects, technical limits, and ethical questions.",
    pageStart: 2,
    pageEnd: 17,
    sections: [
      {
        number: "1.1",
        title: "Definitions of Autonomous Vehicles and SAE Levels of Autonomy",
        page: 2,
        summary:
          "Distinguishes driver assistance from automated driving through SAE Levels 0–5, emphasizing how the driving task and fallback responsibility shift between the human and the system.",
      },
      {
        number: "1.2",
        title: "Key Components",
        page: 4,
        summary:
          "Introduces perception, localization, planning, and control as an interdependent stack supported by sensors, onboard computing, communication, and vehicle actuation.",
      },
      {
        number: "1.3",
        title: "Historical Milestones in Autonomous Vehicle Development",
        page: 5,
        summary:
          "Traces the progression from early research vehicles and major challenge programs to modern road-tested platforms, showing how sensing, computing, and AI advances changed what was feasible.",
      },
      {
        number: "1.4",
        title: "Societal Impacts of Autonomous Vehicles",
        page: 10,
      },
      {
        number: "1.5",
        title: "Technical Challenges in Perception, Planning, and Control",
        page: 12,
      },
      {
        number: "1.6",
        title: "Ethical and Societal Reflection Exercises",
        page: 14,
      },
    ],
    demos: [],
  },
  {
    id: 2,
    title: "Simulation Playground",
    shortTitle: "Simulation",
    summary:
      "Use CARLA and BlueICE to build a repeatable simulation environment, connect distributed components, and integrate an Autoware driving stack.",
    pageStart: 18,
    pageEnd: 32,
    sections: [
      { number: "2.1", title: "Introduction", page: 18 },
      {
        number: "2.2",
        title: "BlueICE",
        page: 18,
        summary:
          "Presents BlueICE as a modular, containerized co-simulation framework that coordinates CARLA, infrastructure, traffic, sensors, and autonomy software across distributed computing nodes.",
      },
      {
        number: "2.3",
        title: "Setting Up BlueICE",
        page: 19,
        summary:
          "Walks through preparing CARLA and its Python tools on common operating systems, then uses manual driving, traffic generation, and weather scripts to verify the environment.",
      },
      {
        number: "2.4",
        title: "Integrating Autoware with BlueICE",
        page: 21,
        summary:
          "Connects the simulator to Autoware so simulated sensors, maps, localization, planning, and vehicle commands can participate in one synchronized autonomy workflow.",
      },
      { number: "2.5", title: "Hands-on Exercises", page: 31 },
    ],
    demos: [],
  },
  {
    id: 3,
    title: "Sensor Technologies",
    shortTitle: "Sensors",
    summary:
      "Compare exteroceptive and proprioceptive sensors and learn how calibration, cleaning, fusion, and datasets turn raw readings into usable evidence.",
    pageStart: 33,
    pageEnd: 50,
    sections: [
      { number: "3.1", title: "Introduction", page: 33 },
      {
        number: "3.2",
        title: "Exteroceptive Sensors",
        page: 33,
        summary:
          "Compares cameras, LiDAR, radar, and ultrasonic sensors by what they measure, the data they produce, and the environmental conditions that expose their strengths and limitations.",
      },
      {
        number: "3.3",
        title: "Proprioceptive Sensors",
        page: 35,
        summary:
          "Explains how GPS and IMUs report the vehicle’s own position and motion, and why their complementary failure modes make combined use important for continuous state estimation.",
      },
      {
        number: "3.4",
        title: "Sensor Data Calibration",
        page: 36,
        summary:
          "Separates intrinsic calibration inside a sensor from extrinsic calibration between sensors, showing how corrected geometry and coordinate-frame alignment support trustworthy fusion.",
      },
      { number: "3.5", title: "Sensor Data Cleaning", page: 37 },
      { number: "3.6", title: "Sensor Data Fusion", page: 42 },
      { number: "3.7", title: "Challenges in Data Processing", page: 44 },
      { number: "3.8", title: "Datasets", page: 45 },
      { number: "3.9", title: "Hands-on Exercises", page: 47 },
    ],
    demos: [
      {
        id: "ch3-comma-sensor-evidence",
        kind: "comma-sensor-evidence",
        title: "Recorded Multimodal Sensor Audit",
        description:
          "Synchronize an actual comma2k19 road video with recorded CAN, IMU, GNSS, and fused-pose traces, then diagnose which streams can support a 20 Hz fusion cycle.",
        accent: "coral",
      },
    ],
  },
  {
    id: 4,
    title: "V2X Communications",
    shortTitle: "V2X",
    summary:
      "Connect vehicles with other vehicles, infrastructure, pedestrians, networks, and edge services while reasoning about protocols, latency, reliability, and applications.",
    pageStart: 51,
    pageEnd: 64,
    sections: [
      { number: "4.1", title: "Introduction", page: 51 },
      {
        number: "4.2",
        title: "OpenIntersection and Edge Computing",
        page: 52,
        summary:
          "Uses connected intersections to show how roadside and edge computing can combine local sensor data with vehicle messages for low-latency coordination and warnings.",
      },
      {
        number: "4.3",
        title: "The Basics of V2X Protocols",
        page: 54,
        summary:
          "Introduces the communication paths and message exchange behind vehicle-to-vehicle, infrastructure, pedestrian, and network services, including DSRC and cellular V2X approaches.",
      },
      {
        number: "4.4",
        title: "Challenges in V2X Communication",
        page: 56,
        summary:
          "Examines latency, reliability, coverage, congestion, interoperability, security, and privacy constraints that determine whether a connected-vehicle message is useful at decision time.",
      },
      {
        number: "4.5",
        title: "Push and Pull Services in V2X Communication",
        page: 58,
      },
      { number: "4.6", title: "V2X Applications", page: 59 },
      { number: "4.7", title: "Hands-on Exercises", page: 61 },
    ],
    demos: [
      {
        id: "ch4-tampa-bsm-evidence",
        kind: "tampa-bsm-evidence",
        title: "Tampa BSM Reliability Audit",
        description:
          "Inspect 1,027 real Basic Safety Messages from the Tampa Connected Vehicle Pilot and separate application staleness, counter discontinuities, and claims the capture cannot prove.",
        accent: "cyan",
      },
    ],
  },
  {
    id: 5,
    title: "Perception Algorithms",
    shortTitle: "Perception",
    summary:
      "Use computer vision to detect, classify, segment, and track road actors while recognizing anomalies and building scene-level understanding.",
    pageStart: 65,
    pageEnd: 83,
    sections: [
      {
        number: "5.1",
        title: "Introduction to Perception in Autonomous Vehicles",
        page: 65,
      },
      {
        number: "5.2",
        title: "Computer Vision Algorithms for Perception",
        page: 65,
        summary:
          "Connects classical image features with modern neural detectors, trackers, segmentation models, and temporal methods used to identify road actors, lanes, signs, and motion.",
      },
      {
        number: "5.3",
        title: "Anomaly Detection and Mitigation",
        page: 74,
        summary:
          "Explains how perception systems identify unusual inputs or behavior and use monitoring, redundancy, uncertainty, and fallback strategies to limit unsafe downstream decisions.",
      },
      {
        number: "5.4",
        title: "Scene Understanding in Autonomous Vehicle Perception",
        page: 76,
        summary:
          "Moves beyond isolated detections to a structured interpretation of the scene, including object relationships, free space, road context, and likely future behavior.",
      },
      { number: "5.5", title: "Hands-on Exercises", page: 78 },
    ],
    demos: [],
  },
  {
    id: 6,
    title: "Localization Algorithms",
    shortTitle: "Localization",
    summary:
      "Represent vehicle pose precisely, understand GPS limitations, and combine LiDAR, camera, and motion measurements for reliable localization.",
    pageStart: 84,
    pageEnd: 101,
    sections: [
      { number: "6.1", title: "Introduction", page: 84 },
      {
        number: "6.2",
        title: "Definition of Pose for Localization",
        page: 84,
        summary:
          "Defines vehicle pose as position and orientation expressed in a coordinate frame, providing the geometric language needed to compare maps, sensors, and motion estimates.",
      },
      {
        number: "6.3",
        title: "Where GPS Falls Short",
        page: 86,
        summary:
          "Shows why blockage, multipath, drift, and meter-level uncertainty make raw GPS inadequate for lane-level autonomy and motivate fusion with inertial, camera, and LiDAR evidence.",
      },
      {
        number: "6.4",
        title: "LiDAR-Based Localization",
        page: 87,
        summary:
          "Explains scan-to-map localization through point-cloud registration methods such as ICP, where pose is refined by minimizing geometric disagreement with a reference map.",
      },
      { number: "6.5", title: "Camera-based Localization", page: 90 },
      { number: "6.6", title: "Sensor Fusion with the Kalman Filter", page: 94 },
      { number: "6.7", title: "Recent Researches", page: 96 },
      { number: "6.8", title: "Hands-on Exercises", page: 97 },
    ],
    demos: [
      {
        id: "ch6-comma-localization-evidence",
        kind: "comma-localization-evidence",
        title: "GNSS and Fused-Pose Residual Investigation",
        description:
          "Compare real u-blox GNSS positions with a tightly coupled INS/GNSS/vision pose in a shared local frame and distinguish a diagnostic residual from ground-truth error.",
        accent: "cyan",
      },
    ],
  },
  {
    id: 7,
    title: "Path Planning and Decision-Making",
    shortTitle: "Planning",
    summary:
      "Connect global route search, local trajectory generation, and behavioral decisions to produce safe, efficient, and comfortable motion.",
    pageStart: 102,
    pageEnd: 123,
    sections: [
      { number: "7.1", title: "Introduction", page: 102 },
      {
        number: "7.2",
        title: "Global Path Planning",
        page: 102,
        summary:
          "Compares search-based, sampling-based, and optimization-based planners for finding a feasible route while accounting for map structure, obstacles, vehicle constraints, and computational cost.",
      },
      {
        number: "7.3",
        title: "Local Trajectory Generation",
        page: 105,
        summary:
          "Generates short-horizon motion that follows the route while reacting to nearby obstacles and balancing safety, kinematic feasibility, smoothness, comfort, and real-time execution.",
      },
      {
        number: "7.4",
        title: "Decision Making in Autonomous Driving",
        page: 108,
        summary:
          "Connects behavioral choices such as yielding, following, merging, and lane changes to traffic rules, predicted actor behavior, uncertainty, and the trajectories available to the vehicle.",
      },
      { number: "7.5", title: "Hands-on Exercises", page: 109 },
    ],
    demos: [],
  },
  {
    id: 8,
    title: "Drive-by-Wire and Vehicle Control Systems",
    shortTitle: "Vehicle Control",
    summary:
      "Trace electronic commands through drive-by-wire components and compare feedback control with PID and predictive control with MPC.",
    pageStart: 124,
    pageEnd: 133,
    sections: [
      { number: "8.1", title: "Introduction", page: 124 },
      {
        number: "8.2",
        title: "Key Components and Functionality",
        page: 124,
        summary:
          "Maps electronic commands through sensors, controllers, communication networks, and steering, braking, and throttle actuators while emphasizing feedback and fail-safe operation.",
      },
      { number: "8.3", title: "Advantages and Challenges", page: 126 },
      {
        number: "8.4",
        title: "Vehicle Control in Autonomous Driving",
        page: 127,
      },
      {
        number: "8.5",
        title: "PID Control for Autonomous Vehicle Control",
        page: 128,
        summary:
          "Builds feedback control from proportional, integral, and derivative responses, showing how their gains trade immediate correction, accumulated bias removal, damping, and sensitivity to noise.",
      },
      {
        number: "8.6",
        title: "Model Predictive Control for Autonomous Vehicle Control",
        page: 130,
        summary:
          "Uses a vehicle model and receding-horizon optimization to choose future control actions while explicitly handling dynamics, actuator limits, path objectives, and safety constraints.",
      },
      { number: "8.7", title: "Future Trends and Conclusion", page: 131 },
      { number: "8.8", title: "Hands-on Exercises", page: 132 },
    ],
    demos: [
      {
        id: "ch8-comma-control-alignment",
        kind: "comma-control-alignment",
        title: "Recorded Steering–Yaw Alignment Lab",
        description:
          "Align real steering-angle, yaw-rate, wheel-speed, and road-video evidence, then identify what timestamp correlation can and cannot establish about closed-loop control.",
        accent: "coral",
      },
    ],
  },
  {
    id: 9,
    title: "Computing Systems",
    shortTitle: "Computing",
    summary:
      "Map the AV computational pipeline onto middleware, deadlines, vehicle programming interfaces, and heterogeneous onboard hardware.",
    pageStart: 134,
    pageEnd: 148,
    sections: [
      { number: "9.1", title: "Introduction", page: 134 },
      {
        number: "9.2",
        title: "Computational Pipeline",
        page: 134,
        summary:
          "Traces data from acquisition through perception, localization, planning, and control while comparing vehicle interfaces, synchronization needs, bandwidth, memory movement, and bottlenecks.",
      },
      {
        number: "9.3",
        title: "Middleware Frameworks",
        page: 137,
        summary:
          "Explains how middleware such as ROS 2 organizes nodes, message passing, timing, and quality-of-service policies so independently developed AV modules can cooperate reliably.",
      },
      {
        number: "9.4",
        title: "Real time Requirements",
        page: 140,
        summary:
          "Distinguishes average speed from deterministic timing and introduces bounded execution, scheduling, deadlines, and latency control for safety-critical perception and actuation tasks.",
      },
      { number: "9.5", title: "Vehicle Programming Interface", page: 142 },
      {
        number: "9.6",
        title: "Hardware Requirements for Autonomous Vehicles",
        page: 144,
      },
      { number: "9.7", title: "Hands-on Exercises", page: 146 },
    ],
    demos: [
      {
        id: "ch9-comma-timing-audit",
        kind: "comma-timing-audit",
        title: "Recorded Pipeline Timing Audit",
        description:
          "Allocate an executor cycle and sample-age budget using measured rates and gaps from seven real comma2k19 streams, then choose reuse, downsampling, and fallback policies.",
        accent: "coral",
      },
    ],
  },
  {
    id: 10,
    title: "End-to-End Solutions",
    shortTitle: "End-to-End",
    summary:
      "Study learned sensor-to-action systems, compare them with modular stacks, and explore hybrid and world-model approaches to safety and generalization.",
    pageStart: 149,
    pageEnd: 156,
    sections: [
      { number: "10.1", title: "Introduction", page: 149 },
      {
        number: "10.2",
        title: "Recent Research",
        page: 149,
        summary:
          "Surveys learned driving systems that map sensor observations toward trajectories or controls, highlighting the roles of imitation learning, large datasets, and modern sequence models.",
      },
      {
        number: "10.3",
        title: "Modular vs. End-to-End Architectures: A Comparative Analysis",
        page: 151,
        summary:
          "Contrasts the interpretability and targeted testing of modular pipelines with the joint optimization and data dependence of end-to-end models, including their different failure and validation challenges.",
      },
      {
        number: "10.4",
        title: "Future Directions: Hybrid and World Model Approaches",
        page: 152,
        summary:
          "Explores architectures that retain structured safety and planning interfaces while using learned representations or predictive world models to improve generalization and reasoning.",
      },
      { number: "10.5", title: "Hands-on Exercises", page: 154 },
    ],
    demos: [],
  },
  {
    id: 11,
    title: "Security and Privacy",
    shortTitle: "Security",
    summary:
      "Apply confidentiality, integrity, and availability to AV attack surfaces, then examine sensor, system, V2X, and privacy defenses.",
    pageStart: 157,
    pageEnd: 176,
    sections: [
      { number: "11.1", title: "Introduction", page: 157 },
      {
        number: "11.2",
        title: "The CIA Security Model: Foundation of Information Security",
        page: 157,
        summary:
          "Applies confidentiality, integrity, and availability to autonomous vehicles, clarifying how data disclosure, manipulation, or service disruption can each create distinct safety consequences.",
      },
      {
        number: "11.3",
        title: "Attack surfaces",
        page: 158,
        summary:
          "Maps exposure across sensors, in-vehicle networks, software, wireless links, roadside infrastructure, cloud services, maintenance interfaces, and the human organizations operating them.",
      },
      {
        number: "11.4",
        title: "Sensor Security",
        page: 158,
        summary:
          "Examines spoofing, jamming, adversarial inputs, and physical interference against cameras, LiDAR, radar, GPS, and other sensors, together with cross-checking and fusion-based defenses.",
      },
      { number: "11.5", title: "SYSTEM SECURITY", page: 163 },
      { number: "11.6", title: "V2X COMMUNICATION SECURITY", page: 166 },
      { number: "11.7", title: "Hands-on Exercises", page: 172 },
    ],
    demos: [
      {
        id: "ch11-road-can-evidence",
        kind: "road-can-evidence",
        title: "ROAD CAN Attack Detector Evaluation",
        description:
          "Compare frequency and payload detectors on physically verified fabrication and high-fidelity masquerade versions of a real dynamometer CAN attack.",
        accent: "coral",
      },
    ],
  },
  {
    id: 12,
    title: "Simulation and Testing Techniques",
    shortTitle: "Testing",
    summary:
      "Use model-, software-, and hardware-in-the-loop simulation plus scenario-based testing to validate AV behavior safely and systematically.",
    pageStart: 177,
    pageEnd: 194,
    sections: [
      {
        number: "12.1",
        title: "Introduction",
        page: 177,
        summary:
          "Positions simulation as a development, integration, regression, training, and safety-evidence tool that can reproduce rare conditions without exposing people or vehicles to unnecessary risk.",
      },
      {
        number: "12.2",
        title: "Types of Simulation",
        page: 180,
        summary:
          "Organizes validation into Model-in-the-Loop, Software-in-the-Loop, and Hardware-in-the-Loop stages, progressively replacing abstractions with production code and physical components.",
      },
      {
        number: "12.3",
        title: "Testing an Autonomous Vehicle",
        page: 188,
        summary:
          "Builds scenario-based testing around measurable requirements, coverage, repeatability, edge cases, closed-course evaluation, and evidence that connects test outcomes to a safety argument.",
      },
    ],
    demos: [
      {
        id: "ch12-nhtsa-safety-evidence",
        kind: "nhtsa-safety-evidence",
        title: "NHTSA Safety-Evidence Claim Audit",
        description:
          "Filter de-identified ADS incident reports, inspect real distributions, and decide which descriptive claims survive missing exposure, revision, and causality constraints.",
        accent: "cyan",
      },
    ],
  },
  {
    id: 13,
    title: "Industry Landscape",
    shortTitle: "Industry",
    summary:
      "Compare AV industry players and deployment strategies while considering scaling, regulation, human-centered adoption, and future directions.",
    pageStart: 195,
    pageEnd: 203,
    sections: [
      {
        number: "13.1",
        title: "The State of the Autonomous Vehicle Industry",
        page: 195,
      },
      {
        number: "13.2",
        title: "Key Industry Players",
        page: 195,
        summary:
          "Surveys organizations pursuing autonomous passenger vehicles, robotaxis, trucking, delivery, and enabling technology, emphasizing differences in markets, platforms, and operational scope.",
      },
      {
        number: "13.3",
        title: "Comparative Analysis of AV Deployment Strategies",
        page: 198,
        summary:
          "Compares deployment by vehicle type, ownership model, geography, operating-design domain, partnerships, and service model rather than treating all autonomous programs as equivalent.",
      },
      {
        number: "13.4",
        title: "Challenges in Scaling and Regulatory Compliance",
        page: 200,
        summary:
          "Examines the technical, operational, infrastructure, cost, safety-assurance, and jurisdictional barriers that appear when a limited pilot expands to larger fleets and regions.",
      },
      {
        number: "13.5",
        title: "Challenges in Human-Centered Deployment",
        page: 200,
      },
      { number: "13.6", title: "The Future of the AV Industry", page: 201 },
    ],
    demos: [
      {
        id: "ch13-cassi-deployment-evidence",
        kind: "cassi-deployment-evidence",
        title: "CASSI Deployment and Disengagement Audit",
        description:
          "Analyze all 267 public disengagement events from a 23-week campus shuttle pilot, including cause trends and source-specific missingness, before recommending scaling interventions.",
        accent: "lime",
      },
    ],
  },
  {
    id: 14,
    title: "Conclusion",
    shortTitle: "Conclusion",
    summary:
      "Synthesize the book through vehicle computing: integrated onboard, edge, and collaborative capabilities that support safe autonomous operation.",
    pageStart: 204,
    pageEnd: 208,
    sections: [
      {
        number: "14.1",
        title: "Vehicle Computing is the Future: A Paradigm for Integrated Autonomy",
        page: 204,
        summary:
          "Reframes the vehicle as a distributed computing node that integrates computation, communication, energy, sensing, and storage while collaborating with nearby vehicles, infrastructure, edge, and cloud systems.",
      },
      {
        number: "14.2",
        title: "Conclusion",
        page: 206,
        summary:
          "Synthesizes the book’s modular technologies into an integrated autonomy platform and emphasizes that safe deployment depends on coordinated engineering across the entire vehicle ecosystem.",
      },
    ],
    demos: [],
  },
];
