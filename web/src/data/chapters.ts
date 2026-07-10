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
      },
      { number: "1.2", title: "Key Components", page: 4 },
      {
        number: "1.3",
        title: "Historical Milestones in Autonomous Vehicle Development",
        page: 5,
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
      { number: "2.2", title: "BlueICE", page: 18 },
      { number: "2.3", title: "Setting Up BlueICE", page: 19 },
      {
        number: "2.4",
        title: "Integrating Autoware with BlueICE",
        page: 21,
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
      { number: "3.2", title: "Exteroceptive Sensors", page: 33 },
      { number: "3.3", title: "Proprioceptive Sensors", page: 35 },
      { number: "3.4", title: "Sensor Data Calibration", page: 36 },
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
      },
      { number: "4.3", title: "The Basics of V2X Protocols", page: 54 },
      {
        number: "4.4",
        title: "Challenges in V2X Communication",
        page: 56,
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
      },
      { number: "5.3", title: "Anomaly Detection and Mitigation", page: 74 },
      {
        number: "5.4",
        title: "Scene Understanding in Autonomous Vehicle Perception",
        page: 76,
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
      { number: "6.2", title: "Definition of Pose for Localization", page: 84 },
      { number: "6.3", title: "Where GPS Falls Short", page: 86 },
      { number: "6.4", title: "LiDAR-Based Localization", page: 87 },
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
      { number: "7.2", title: "Global Path Planning", page: 102 },
      { number: "7.3", title: "Local Trajectory Generation", page: 105 },
      {
        number: "7.4",
        title: "Decision Making in Autonomous Driving",
        page: 108,
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
      { number: "8.2", title: "Key Components and Functionality", page: 124 },
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
      },
      {
        number: "8.6",
        title: "Model Predictive Control for Autonomous Vehicle Control",
        page: 130,
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
      { number: "9.2", title: "Computational Pipeline", page: 134 },
      { number: "9.3", title: "Middleware Frameworks", page: 137 },
      { number: "9.4", title: "Real time Requirements", page: 140 },
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
      { number: "10.2", title: "Recent Research", page: 149 },
      {
        number: "10.3",
        title: "Modular vs. End-to-End Architectures: A Comparative Analysis",
        page: 151,
      },
      {
        number: "10.4",
        title: "Future Directions: Hybrid and World Model Approaches",
        page: 152,
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
      },
      { number: "11.3", title: "Attack surfaces", page: 158 },
      { number: "11.4", title: "Sensor Security", page: 158 },
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
      { number: "12.1", title: "Introduction", page: 177 },
      { number: "12.2", title: "Types of Simulation", page: 180 },
      { number: "12.3", title: "Testing an Autonomous Vehicle", page: 188 },
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
      { number: "13.2", title: "Key Industry Players", page: 195 },
      {
        number: "13.3",
        title: "Comparative Analysis of AV Deployment Strategies",
        page: 198,
      },
      {
        number: "13.4",
        title: "Challenges in Scaling and Regulatory Compliance",
        page: 200,
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
      },
      { number: "14.2", title: "Conclusion", page: 206 },
    ],
    demos: [],
  },
];
