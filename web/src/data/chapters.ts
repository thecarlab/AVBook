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
    demos: [
      {
        id: "ch1-sae-level-classifier",
        kind: "sorter",
        title: "SAE Level Classifier",
        description:
          "Sort driving capabilities by the level at which the human or automated system performs the driving task.",
        accent: "lime",
        config: {
          labels: ["Level 0", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
          options: [
            "Automatic emergency braking",
            "Adaptive cruise control",
            "Lane centering plus adaptive cruise control",
            "Traffic-jam chauffeur with fallback request",
            "Driverless geofenced shuttle",
            "Driverless operation in all conditions",
          ],
          values: [0, 1, 2, 3, 4, 5],
        },
      },
      {
        id: "ch1-av-milestone-timeline",
        kind: "timeline",
        title: "Autonomous Driving Milestone Timeline",
        description:
          "Place landmark demonstrations and enabling technologies on a timeline to see how modern AVs emerged.",
        accent: "cyan",
        config: {
          labels: [
            "VaMP highway demonstration",
            "DARPA Grand Challenge",
            "DARPA Urban Challenge",
            "Public-road AV pilots",
            "Commercial robotaxi services",
          ],
          options: ["Research prototype", "Competition", "Urban autonomy", "Pilot", "Deployment"],
          values: [1994, 2004, 2007, 2012, 2020],
        },
      },
    ],
  },
  {
    id: 2,
    title: "Simulation Playgound",
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
    demos: [
      {
        id: "ch2-blueice-cosimulation-flow",
        kind: "flow",
        title: "BlueICE Co-Simulation Flow",
        description:
          "Build the path from a simulated world and sensors through ROS 2 to Autoware commands and vehicle motion.",
        accent: "cyan",
        config: {
          labels: ["CARLA world", "Sensor drivers", "ROS 2 bus", "Autoware", "Vehicle control"],
          options: ["Camera", "LiDAR", "GNSS", "IMU", "Ackermann command"],
          values: [16, 12, 8, 24, 10],
          unit: "ms per stage",
        },
      },
      {
        id: "ch2-carla-scenario-mixer",
        kind: "scenario",
        title: "CARLA Scenario Mixer",
        description:
          "Adjust weather, traffic, and pedestrian density to create a reproducible virtual test scenario.",
        accent: "coral",
        config: {
          labels: ["Rain", "Fog", "Traffic", "Pedestrians"],
          options: ["Clear commute", "Rainy rush hour", "Foggy crossing", "Night edge case"],
          values: [20, 10, 45, 25],
          min: 0,
          max: 100,
          step: 5,
        },
      },
    ],
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
        id: "ch3-sensor-selection-matrix",
        kind: "compare",
        title: "Sensor Selection Matrix",
        description:
          "Compare how camera, LiDAR, radar, GNSS, and IMU perform under different sensing requirements.",
        accent: "lime",
        config: {
          labels: ["Camera", "LiDAR", "Radar", "GNSS", "IMU"],
          options: ["Color detail", "Depth accuracy", "Bad-weather resilience", "Global pose", "Motion rate"],
          values: [4, 5, 5, 4, 5],
          scaleMax: 5,
        },
      },
      {
        id: "ch3-calibration-drift-explorer",
        kind: "calibration",
        title: "Calibration Drift Explorer",
        description:
          "Vary camera-LiDAR rotation and translation to see how small calibration errors separate aligned observations.",
        accent: "coral",
        config: {
          labels: ["Yaw error", "Pitch error", "Horizontal offset"],
          options: ["Well aligned", "Loose mount", "Post-impact drift"],
          values: [0, 0, 0],
          min: -10,
          max: 10,
          step: 0.5,
          units: ["deg", "deg", "cm"],
        },
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
        id: "ch4-v2x-network-explorer",
        kind: "network",
        title: "V2X Network Explorer",
        description:
          "Send safety and mobility messages among a vehicle, roadside unit, pedestrian, nearby traffic, and edge server.",
        accent: "cyan",
        config: {
          labels: ["Ego vehicle", "Nearby vehicle", "Roadside unit", "Pedestrian", "Edge server"],
          options: ["V2V", "V2I", "V2P", "V2N"],
          values: [8, 12, 18, 30],
          unit: "ms",
        },
      },
      {
        id: "ch4-v2x-latency-budget",
        kind: "threshold",
        title: "V2X Latency Budget",
        description:
          "Tune link delay, packet loss, and message age to decide whether a cooperative warning is still actionable.",
        accent: "coral",
        config: {
          labels: ["Link delay", "Packet loss", "Message age"],
          options: ["Emergency brake warning", "Signal phase update", "Map refresh"],
          values: [35, 2, 50],
          min: 0,
          max: 250,
          safeThreshold: 100,
        },
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
    demos: [
      {
        id: "ch5-detection-confidence-explorer",
        kind: "threshold",
        title: "Detection Confidence Explorer",
        description:
          "Move the confidence threshold to balance missed road users against false detections in a sample scene.",
        accent: "lime",
        config: {
          labels: ["Confidence threshold", "IoU threshold"],
          options: ["Pedestrian", "Vehicle", "Cyclist", "Traffic sign"],
          values: [0.5, 0.45],
          min: 0.1,
          max: 0.95,
          step: 0.05,
        },
      },
      {
        id: "ch5-multi-object-tracking-lab",
        kind: "tracking",
        title: "Multi-Object Tracking Lab",
        description:
          "Associate detections across frames and observe how occlusion and motion uncertainty affect track identity.",
        accent: "cyan",
        config: {
          labels: ["Frame 1", "Frame 2", "Frame 3", "Frame 4"],
          options: ["Nearest neighbor", "Appearance plus motion", "Prediction through occlusion"],
          values: [3, 3, 2, 3],
          maxMissedFrames: 2,
        },
      },
    ],
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
        id: "ch6-coordinate-frame-transformer",
        kind: "transform",
        title: "Coordinate Frame Transformer",
        description:
          "Transform a vehicle pose between map, vehicle, and sensor frames while adjusting translation and heading.",
        accent: "cyan",
        config: {
          labels: ["X translation", "Y translation", "Yaw"],
          options: ["Map to base_link", "base_link to LiDAR", "base_link to camera"],
          values: [2, 1, 15],
          min: -20,
          max: 20,
          units: ["m", "m", "deg"],
        },
      },
      {
        id: "ch6-point-cloud-registration-lab",
        kind: "registration",
        title: "Point-Cloud Registration Lab",
        description:
          "Align a noisy scan to a reference map and watch pose error shrink as ICP-style iterations proceed.",
        accent: "coral",
        config: {
          labels: ["Initial X error", "Initial Y error", "Initial yaw error", "Noise"],
          options: ["Good initialization", "GPS offset", "Lost localization"],
          values: [2.5, -1.5, 8, 0.2],
          min: -10,
          max: 10,
          iterations: 12,
        },
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
    demos: [
      {
        id: "ch7-a-star-global-route-planner",
        kind: "planner",
        title: "A* Global Route Planner",
        description:
          "Place start, goal, and blocked cells on a grid, then compare the route explored by A* and Dijkstra search.",
        accent: "lime",
        config: {
          labels: ["Start", "Goal", "Obstacle", "Visited", "Path"],
          options: ["A* Manhattan", "A* Euclidean", "Dijkstra"],
          values: [12, 8],
          gridWidth: 12,
          gridHeight: 8,
          obstacleRate: 0.18,
        },
      },
      {
        id: "ch7-local-trajectory-scorer",
        kind: "trajectory",
        title: "Local Trajectory Scorer",
        description:
          "Rank candidate maneuvers by clearance, progress, comfort, and rule compliance as traffic conditions change.",
        accent: "cyan",
        config: {
          labels: ["Clearance", "Progress", "Comfort", "Rule compliance"],
          options: ["Keep lane", "Change left", "Change right", "Yield"],
          values: [40, 25, 20, 15],
          min: 0,
          max: 100,
          totalWeight: 100,
        },
      },
    ],
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
        id: "ch8-pid-steering-tuner",
        kind: "control",
        title: "PID Steering Tuner",
        description:
          "Adjust proportional, integral, and derivative gains and observe rise time, overshoot, and steady-state lane error.",
        accent: "coral",
        config: {
          labels: ["Kp", "Ki", "Kd", "Target offset"],
          options: ["Under-damped", "Balanced", "Slow and stable"],
          values: [0.8, 0.08, 0.18, 1],
          min: 0,
          max: 2,
          step: 0.02,
        },
      },
      {
        id: "ch8-pid-vs-mpc-tradeoff",
        kind: "tradeoff",
        title: "PID vs. MPC Trade-off",
        description:
          "Compare controller responsiveness, constraint handling, compute cost, and prediction over a curved-road maneuver.",
        accent: "lime",
        config: {
          labels: ["Response", "Constraint handling", "Compute cost", "Prediction"],
          options: ["PID", "MPC"],
          values: [3, 5, 5, 1, 4, 2, 2, 5],
          scaleMax: 5,
        },
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
        id: "ch9-real-time-compute-budget",
        kind: "budget",
        title: "Real-Time Compute Budget",
        description:
          "Allocate perception, localization, planning, and control tasks to CPU, GPU, and accelerator resources without missing deadlines.",
        accent: "cyan",
        config: {
          labels: ["Perception", "Localization", "Planning", "Control"],
          options: ["CPU", "GPU", "Accelerator"],
          values: [45, 18, 22, 8],
          deadlines: [100, 50, 100, 20],
          unit: "ms",
        },
      },
      {
        id: "ch9-ros2-queue-explorer",
        kind: "queue",
        title: "ROS 2 Queue Explorer",
        description:
          "Change publisher rate, subscriber service time, queue depth, and QoS to see when messages become stale or are dropped.",
        accent: "coral",
        config: {
          labels: ["Publish rate", "Service time", "Queue depth"],
          options: ["Best effort", "Reliable", "Keep latest"],
          values: [30, 40, 5],
          min: 1,
          max: 100,
          duration: 10,
        },
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
    demos: [
      {
        id: "ch10-modular-vs-e2e-architecture",
        kind: "architecture",
        title: "Modular vs. End-to-End Architecture",
        description:
          "Trace how sensor evidence becomes a steering command in an explicit pipeline versus a learned unified model.",
        accent: "lime",
        config: {
          labels: ["Sensors", "Perception", "Prediction", "Planning", "Control"],
          options: ["Modular pipeline", "End-to-end model"],
          values: [5, 1],
          metrics: ["Interpretability", "Data demand", "Error isolation", "Adaptability"],
        },
      },
      {
        id: "ch10-hybrid-decision-fusion",
        kind: "fusion",
        title: "Hybrid Decision Fusion",
        description:
          "Blend a learned driving proposal with a world model and rule-based safety shield to choose a final maneuver.",
        accent: "cyan",
        config: {
          labels: ["Learned policy", "World model", "Safety shield"],
          options: ["Proceed", "Slow", "Yield", "Stop"],
          values: [55, 25, 20],
          min: 0,
          max: 100,
          totalWeight: 100,
        },
      },
    ],
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
        id: "ch11-av-attack-surface-explorer",
        kind: "threats",
        title: "AV Attack Surface Explorer",
        description:
          "Inspect sensor, in-vehicle, wireless, cloud, and physical entry points and match each one to a practical defense.",
        accent: "coral",
        config: {
          labels: ["Sensors", "Vehicle network", "V2X", "Cloud", "Physical access"],
          options: ["Spoofing", "Message injection", "Jamming", "Data theft", "Firmware tampering"],
          values: [5, 5, 4, 3, 4],
          severityMax: 5,
        },
      },
      {
        id: "ch11-cia-defense-scenario",
        kind: "scenario",
        title: "CIA Defense Scenario",
        description:
          "Respond to an AV incident by identifying the affected CIA property and selecting layered mitigations.",
        accent: "lime",
        config: {
          labels: ["Confidentiality", "Integrity", "Availability"],
          options: ["Encrypt data", "Authenticate messages", "Add redundancy", "Isolate the component"],
          values: [2, 5, 4],
          scenarios: ["Forged speed message", "LiDAR denial", "Location-history leak"],
        },
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
        id: "ch12-simulation-test-ladder",
        kind: "testing",
        title: "Simulation Test Ladder",
        description:
          "Move a feature from model-in-the-loop through software- and hardware-in-the-loop as realism, cost, and integration increase.",
        accent: "cyan",
        config: {
          labels: ["Model-in-the-Loop", "Software-in-the-Loop", "Hardware-in-the-Loop"],
          options: ["Controller logic", "Full software stack", "Production controller hardware"],
          values: [20, 55, 90],
          dimensions: ["Realism", "Cost", "Repeatability", "Risk"],
        },
      },
      {
        id: "ch12-scenario-coverage-builder",
        kind: "coverage",
        title: "Scenario Coverage Builder",
        description:
          "Combine road, weather, traffic, actor, and fault conditions and reveal which parts of the test space remain uncovered.",
        accent: "lime",
        config: {
          labels: ["Road", "Weather", "Traffic", "Actors", "Faults"],
          options: ["Nominal", "Boundary", "Adverse", "Rare edge case"],
          values: [4, 3, 4, 5, 3],
          targetCoverage: 85,
          maxCombinations: 240,
        },
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
        id: "ch13-av-deployment-tradeoffs",
        kind: "tradeoff",
        title: "AV Deployment Trade-offs",
        description:
          "Compare robotaxis, shuttles, freight, and consumer automation across operating scope, cost, oversight, and scalability.",
        accent: "coral",
        config: {
          labels: ["Operating scope", "Upfront cost", "Remote oversight", "Scalability"],
          options: ["Robotaxi", "Autonomous shuttle", "Freight corridor", "Consumer L2/L3"],
          values: [3, 4, 5, 4, 2, 3, 4, 3, 2, 4, 3, 5, 4, 2, 2, 5],
          scaleMax: 5,
        },
      },
      {
        id: "ch13-av-industry-futures",
        kind: "futures",
        title: "AV Industry Futures",
        description:
          "Change technology readiness, regulation, public trust, and infrastructure support to explore plausible deployment futures.",
        accent: "cyan",
        config: {
          labels: ["Technology readiness", "Regulatory support", "Public trust", "Infrastructure"],
          options: ["Steady pilots", "Geofenced scale-up", "Consumer autonomy", "Deployment slowdown"],
          values: [65, 50, 45, 55],
          min: 0,
          max: 100,
          horizon: 2035,
        },
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
    demos: [
      {
        id: "ch14-integrated-vehicle-computing-map",
        kind: "architecture",
        title: "Integrated Vehicle Computing Map",
        description:
          "Connect sensing, computation, communication, energy, and storage into one vehicle-computing architecture.",
        accent: "lime",
        config: {
          labels: ["Sensing", "Computation", "Communication", "Energy", "Storage"],
          options: ["Onboard", "Peer vehicle", "Roadside edge", "Cloud"],
          values: [5, 5, 4, 4, 3],
          links: ["sense-compute", "compute-communicate", "energy-compute", "store-compute"],
        },
      },
      {
        id: "ch14-edge-offload-decision-lab",
        kind: "offload",
        title: "Edge Offload Decision Lab",
        description:
          "Choose where an AV task should run by balancing latency, bandwidth, energy, privacy, and link reliability.",
        accent: "coral",
        config: {
          labels: ["Latency", "Bandwidth", "Energy", "Privacy", "Reliability"],
          options: ["Run onboard", "Offload to roadside edge", "Offload to cloud"],
          values: [25, 60, 70, 85, 75],
          min: 0,
          max: 100,
          task: "Cooperative perception",
        },
      },
    ],
  },
];
