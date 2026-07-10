import type {
  AssessmentCase,
  AssessmentChoice,
  AssessmentProbe,
  ChapterAssessment,
  CognitiveSkill,
  QuizDifficulty,
  QuizStimulus,
} from "../types";

type ChoiceSpec = readonly [string, string, string?];
type FourChoices = readonly [ChoiceSpec, ChoiceSpec, ChoiceSpec, ChoiceSpec];
const IDS = ["a", "b", "c", "d"] as const;

function p(
  skill: CognitiveSkill,
  difficulty: QuizDifficulty,
  prompt: string,
  objectiveIds: [string, ...string[]],
  correct: 0 | 1 | 2 | 3,
  specs: FourChoices,
  reasoning: [string, ...string[]],
  takeaway: string,
  section: string,
  page: number,
): AssessmentProbe {
  const choices = specs.map(([text, feedback, misconception], index) => ({
    id: IDS[index],
    text,
    feedback,
    misconception,
  })) as [
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
    correctChoiceId: IDS[correct],
    reasoning,
    takeaway,
    references: [{ section, page }],
  };
}

function c(
  id: string,
  stimulus: QuizStimulus,
  probes: AssessmentCase["probes"],
): AssessmentCase {
  return { id, chapterId: 6, stimulus, probes };
}

const objectives: ChapterAssessment["objectives"] = [
  {
    id: "ch6-frames",
    chapterId: 6,
    behavior:
      "Compose and diagnose poses across map, vehicle, odometry, and sensor frames.",
    priority: "core",
    references: [{ section: "6.2", page: 84 }],
  },
  {
    id: "ch6-gps",
    chapterId: 6,
    behavior:
      "Recognize GPS drift, blockage, and multipath and choose complementary localization evidence.",
    priority: "core",
    references: [{ section: "6.3", page: 86 }],
  },
  {
    id: "ch6-icp",
    chapterId: 6,
    behavior:
      "Reason about ICP initialization, correspondences, convergence, and motion-based seeding.",
    priority: "core",
    references: [{ section: "6.4", page: 87 }],
  },
  {
    id: "ch6-ndt",
    chapterId: 6,
    behavior:
      "Evaluate NDT and voxel filtering tradeoffs for real-time scan registration.",
    priority: "core",
    references: [{ section: "6.4", page: 89 }],
  },
  {
    id: "ch6-relocalization",
    chapterId: 6,
    behavior: "Use Scan Context and keyframes to recover a globally lost pose.",
    priority: "core",
    references: [{ section: "6.4", page: 90 }],
  },
  {
    id: "ch6-visual",
    chapterId: 6,
    behavior:
      "Diagnose ORB feature, matching, visual odometry, and loop-closure failures.",
    priority: "core",
    references: [{ section: "6.5", page: 90 }],
  },
  {
    id: "ch6-fusion",
    chapterId: 6,
    behavior:
      "Fuse motion and sensor estimates according to uncertainty and model assumptions.",
    priority: "core",
    references: [{ section: "6.6", page: 94 }],
  },
  {
    id: "ch6-architecture",
    chapterId: 6,
    behavior:
      "Coordinate high-rate tracking, uncertainty monitoring, and global recovery.",
    priority: "core",
    references: [
      { section: "6.1", page: 84 },
      { section: "6.8", page: 97 },
    ],
  },
];

const cases: AssessmentCase[] = [
  c(
    "transform-order",
    {
      kind: "table",
      caption: "Known poses",
      columns: ["Transform", "Value"],
      rows: [
        ["map -> vehicle", "x=10 m, y=2 m, yaw=90 deg"],
        ["vehicle -> LiDAR", "x=1 m forward, y=0 m"],
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Where should the LiDAR origin be expressed in the map frame?",
        ["ch6-frames"],
        1,
        [
          [
            "(11, 2), assuming vehicle forward aligns with map x",
            "This ignores the vehicle's 90-degree rotation.",
          ],
          [
            "(10, 3): vehicle forward maps to y",
            "Correct. Rotate the sensor offset before adding map translation.",
          ],
          [
            "(9, 2), from subtracting the transform componentwise",
            "Subtraction would apply an inverse without justification.",
          ],
          [
            "(10, 1), because positive yaw reverses the offset",
            "Positive 90-degree yaw rotates forward toward positive map y.",
          ],
        ],
        [
          "The sensor offset is stated in the vehicle frame.",
          "A 90-degree vehicle yaw rotates its forward axis into map positive y before translation.",
        ],
        "Transform rotation before adding translation in the destination frame.",
        "6.2",
        85,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "A pipeline reports the LiDAR at (11, 2). Which mistake best explains that result?",
        ["ch6-frames"],
        0,
        [
          [
            "It treated a vehicle offset as a map offset",
            "Correct. The arithmetic matches translation without rotation.",
          ],
          [
            "It applied the 90-degree rotation twice",
            "Double rotation would point the offset backward, not map positive x.",
          ],
          [
            "It converted meters into degrees",
            "The result remains a one-meter Cartesian offset.",
          ],
          [
            "It used the inverse sensor transform correctly",
            "A correct inverse would not produce this direct addition.",
          ],
        ],
        [
          "The erroneous point is map translation plus (1,0).",
          "That is exactly the unrotated vehicle-frame offset.",
        ],
        "Use the numerical symptom to identify the missing transform operation.",
        "6.2",
        85,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which computation correctly distinguishes transform composition from simple vector addition?",
        ["ch6-frames"],
        3,
        [
          [
            "Add x and y components without rotating them",
            "Offsets in different frames cannot be added directly.",
          ],
          [
            "Rotate the map origin by sensor yaw alone",
            "The relevant rotation is the parent vehicle pose.",
          ],
          [
            "Discard translation and compare yaw values",
            "A pose requires both position and orientation.",
          ],
          [
            "Compose transforms in parent-to-child order",
            "Correct. Composition preserves both rotation and translation across frames.",
          ],
        ],
        [
          "Each transform maps coordinates between a specific pair of frames.",
          "Ordered matrix composition carries a point through those mappings.",
        ],
        "Frame labels and transform direction are part of the data.",
        "6.2",
        85,
      ),
      causal: p(
        "causal",
        "advanced",
        "If vehicle yaw changes to 180 degrees while all translations stay fixed, what happens to the LiDAR map position?",
        ["ch6-frames"],
        2,
        [
          [
            "It remains (10, 3) because translation did not change",
            "The rotated sensor offset changes even when vehicle translation does not.",
          ],
          [
            "It becomes (11, 2) because 180 degrees points map positive x",
            "Vehicle forward points map negative x at 180 degrees.",
          ],
          [
            "(9, 2): forward rotates toward negative map x",
            "Correct. The offset is (-1,0) in map coordinates.",
          ],
          [
            "It becomes (10, 1), assuming this rotation changes map y",
            "At 180 degrees the forward offset has no map-y component.",
          ],
        ],
        [
          "The vehicle position remains (10,2).",
          "Rotating its forward offset by 180 degrees yields (-1,0).",
        ],
        "Changing orientation changes the world location of mounted sensors.",
        "6.2",
        85,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A camera is mounted 0.5 m above a drone body. Which lesson transfers when projecting camera observations into a building map?",
        ["ch6-frames"],
        0,
        [
          [
            "Compose body-camera transforms in frame order",
            "Correct. The mounted-camera offset must rotate and translate with the drone.",
          ],
          [
            "Add 0.5 m to map x regardless of drone attitude",
            "The vertical camera offset changes direction with attitude.",
          ],
          [
            "Use image pixels directly as map coordinates",
            "Pixels need camera geometry and pose transforms.",
          ],
          [
            "Ignore the mount because it is constant",
            "A constant extrinsic still affects every mapped observation.",
          ],
        ],
        [
          "The camera pose is relative to the moving body.",
          "Map projection requires body-to-map and camera-to-body geometry.",
        ],
        "Rigid-transform reasoning transfers to every multi-sensor robot.",
        "6.2",
        85,
      ),
    },
  ),
  c(
    "extrinsic-drift",
    {
      kind: "log",
      caption: "Post-maintenance alignment",
      lines: [
        "camera intrinsics rechecked: within tolerance",
        "LiDAR edges project 18 px right across image",
        "vehicle map pose agrees with survey",
        "camera bracket was removed and reinstalled",
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Which calibration should be performed first?",
        ["ch6-frames"],
        2,
        [
          [
            "Rebuild the global map",
            "Survey agreement makes the map an unlikely cause.",
          ],
          [
            "Change the camera focal length until edges overlap",
            "Intrinsics are within tolerance and the mount changed.",
          ],
          [
            "Re-estimate camera-to-LiDAR extrinsic transform",
            "Correct. The physical relationship between sensors may have changed.",
          ],
          [
            "Increase the ICP correspondence threshold",
            "ICP threshold does not repair camera-LiDAR projection geometry.",
          ],
        ],
        [
          "The camera mount was physically disturbed.",
          "A consistent cross-modal projection shift points to their relative pose.",
        ],
        "Calibrate the transform whose physical relationship changed.",
        "6.2",
        85,
      ),
      diagnosis: p(
        "diagnosis",
        "advanced",
        "Why does the consistent 18-pixel direction argue against random localization noise?",
        ["ch6-frames"],
        1,
        [
          [
            "Localization noise is unrelated to projection",
            "Pose noise can affect projection, but usually varies with time and scene.",
          ],
          [
            "A stable residual suggests a biased transform",
            "Correct. Constant direction after remounting supports a fixed geometric bias.",
          ],
          [
            "Pixel error proves the LiDAR has no range data",
            "The log describes projected LiDAR edges, so range data exists.",
          ],
          [
            "Survey agreement is treated as proof of all calibration",
            "Global pose agreement does not validate inter-sensor extrinsics.",
          ],
        ],
        [
          "Random pose noise would tend to vary across observations.",
          "The residual is stable and follows a mount change.",
        ],
        "Residual structure helps separate bias from noise.",
        "6.2",
        85,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which evidence best separates an intrinsic error from an extrinsic error?",
        ["ch6-frames"],
        3,
        [
          [
            "Vehicle paint color",
            "Appearance does not validate projection geometry.",
          ],
          [
            "The number of LiDAR points alone",
            "Point count cannot identify which camera geometry is wrong.",
          ],
          [
            "Map route length",
            "Route length is unrelated to camera calibration.",
          ],
          [
            "Intrinsic and alignment checks",
            "Correct. One tests the camera model; the other tests relative pose.",
          ],
        ],
        [
          "Intrinsic and extrinsic parameters describe different geometric relationships.",
          "Separate calibration evidence tests each relationship directly.",
        ],
        "Use independent checks that isolate competing causes.",
        "6.2",
        85,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If the camera is yawed slightly right during reinstallation, what residual pattern is expected?",
        ["ch6-frames"],
        0,
        [
          [
            "LiDAR projections shift against image structure",
            "Correct. A fixed yaw bias creates coherent geometric displacement.",
          ],
          [
            "GPS measurements stop arriving",
            "A camera mount does not block the GPS receiver.",
          ],
          [
            "LiDAR ranges collapse toward zero",
            "Extrinsic yaw changes projection, not raw range.",
          ],
          [
            "The map coordinate origin moves with the bracket",
            "The global map frame is independent of the camera bracket.",
          ],
        ],
        [
          "Extrinsic yaw determines how LiDAR rays are expressed in the camera frame.",
          "A fixed yaw error moves many projected features coherently.",
        ],
        "Mechanical calibration errors create structured downstream residuals.",
        "6.2",
        85,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A robot arm camera is bumped and grasp points shift consistently. What transferred diagnostic is strongest?",
        ["ch6-frames"],
        1,
        [
          [
            "Retune the gripper force before checking geometry",
            "Force does not explain a systematic visual-coordinate shift.",
          ],
          [
            "Verify the camera-arm extrinsic after the change",
            "Correct. The mount relationship is the shared causal link.",
          ],
          [
            "Discard all prior object models",
            "Object models need not be wrong when every grasp shifts together.",
          ],
          [
            "Increase conveyor speed to reduce observed error",
            "Speed cannot repair a fixed transform bias.",
          ],
        ],
        [
          "The error appears after a physical mount disturbance.",
          "All affected targets share the camera-to-arm transform.",
        ],
        "Extrinsic-calibration diagnosis transfers across embodied systems.",
        "6.2",
        85,
      ),
    },
  ),
  c(
    "urban-gps-multipath",
    {
      kind: "table",
      caption: "Downtown pose evidence",
      columns: ["Source", "Observation"],
      rows: [
        ["GPS", "jumps 11 m between parallel streets"],
        ["IMU", "smooth heading and acceleration"],
        ["LiDAR map match", "1.2 m residual near prior pose"],
        ["Satellite count", "high"],
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which estimator response best fits the evidence?",
        ["ch6-gps", "ch6-fusion"],
        3,
        [
          [
            "Snap fully to GPS because satellite count is high",
            "High count does not eliminate reflected-signal multipath.",
          ],
          [
            "Discard GPS for the remainder of the route",
            "The evidence supports temporary rejection or downweighting, not permanent removal.",
          ],
          [
            "Average all positions equally",
            "Equal weighting lets the 11-meter jump dominate better local evidence.",
          ],
          [
            "Gate the GPS jump; favor IMU and LiDAR",
            "Correct. The cross-source inconsistency identifies GPS as the outlier here.",
          ],
        ],
        [
          "IMU motion is smooth and LiDAR aligns near the prior pose.",
          "An 11-meter lateral GPS jump between streets is physically inconsistent.",
        ],
        "Fusion should weight evidence by uncertainty and consistency.",
        "6.3",
        86,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "What failure mechanism is most plausible despite a high satellite count?",
        ["ch6-gps"],
        0,
        [
          [
            "Building reflections create GPS multipath bias",
            "Correct. Multiple reflected paths can corrupt range while satellites remain visible.",
          ],
          [
            "ICP is expected to move GPS points to another street",
            "ICP uses scan geometry and does not change raw GPS.",
          ],
          [
            "The IMU directly edits satellite ephemeris",
            "The sensors are independent inputs.",
          ],
          [
            "The map rotates whenever satellite count rises",
            "Satellite count does not define map orientation.",
          ],
        ],
        [
          "The setting is an urban canyon and the error jumps between nearby streets.",
          "Those are characteristic multipath symptoms.",
        ],
        "Availability and accuracy are different properties of GPS.",
        "6.3",
        86,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which source provides the strongest independent check of absolute street placement here?",
        ["ch6-gps"],
        1,
        [
          [
            "IMU acceleration alone",
            "IMU supports relative motion but drifts in absolute position.",
          ],
          [
            "LiDAR-to-map street match",
            "Correct. It directly compares current geometry with an absolute map.",
          ],
          ["Satellite count alone", "Count does not measure position error."],
          [
            "Wheel speed without heading",
            "Speed alone cannot choose between parallel streets.",
          ],
        ],
        [
          "The disputed state is absolute map location.",
          "LiDAR map matching observes geometry tied to that frame.",
        ],
        "Choose validation evidence that observes the disputed quantity.",
        "6.3",
        86,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If the vehicle enters an open area and GPS innovations become small and consistent, what should a fusion system do?",
        ["ch6-gps", "ch6-fusion"],
        2,
        [
          [
            "Continue rejecting GPS forever because it once failed",
            "Reliability can change with environment.",
          ],
          [
            "Reset the map after consistent GPS returns",
            "Consistency does not require redefining the map.",
          ],
          [
            "Restore GPS weight as uncertainty recovers",
            "Correct. The estimator can re-admit evidence when consistency returns.",
          ],
          [
            "Ignore LiDAR and IMU immediately",
            "Complementary sensors still support robustness.",
          ],
        ],
        [
          "The measurement condition improved and innovations now agree.",
          "Adaptive weighting can reflect the lower observed GPS uncertainty.",
        ],
        "Sensor trust should respond to current evidence, not permanent labels.",
        "6.6",
        94,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A phone navigator jumps between floors inside a glass atrium while inertial motion is smooth. Which AV lesson transfers?",
        ["ch6-gps", "ch6-fusion"],
        3,
        [
          [
            "More visible transmitters imply the correct floor",
            "Signal count does not remove multipath or geometry ambiguity.",
          ],
          [
            "Average the jump with inertial motion equally",
            "A gross outlier should not receive equal trust.",
          ],
          [
            "Assume the person teleported because the absolute sensor says so",
            "The motion evidence makes that transition implausible.",
          ],
          [
            "Gate bad fixes and use relative evidence",
            "Correct. The same consistency-based fusion handles indoor positioning outliers.",
          ],
        ],
        [
          "The absolute fix conflicts with smooth physical motion.",
          "Complementary sensing provides a basis for outlier rejection.",
        ],
        "Innovation gating transfers to many localization systems.",
        "6.3",
        86,
      ),
    },
  ),
  c(
    "tunnel-outage",
    {
      kind: "log",
      caption: "Tunnel localization",
      lines: [
        "GPS age: 8.0 s and increasing",
        "wheel odometry: available",
        "IMU: available",
        "LiDAR walls: long and repetitive",
        "pose covariance: increasing",
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Which strategy best maintains localization while acknowledging risk?",
        ["ch6-gps", "ch6-fusion", "ch6-architecture"],
        0,
        [
          [
            "Use IMU/wheels, LiDAR, and uncertainty bounds",
            "Correct. It uses available relative evidence without pretending absolute certainty.",
          ],
          [
            "Freeze the last GPS pose for the entire tunnel",
            "A fixed pose ignores actual motion.",
          ],
          [
            "Treat repetitive walls as a unique global landmark",
            "Repetition makes global alignment ambiguous.",
          ],
          [
            "Set covariance to zero so planning remains confident",
            "Hiding uncertainty increases unsafe reliance.",
          ],
        ],
        [
          "GPS is stale, so relative sensors must carry motion.",
          "Repetitive geometry and integration drift make uncertainty grow.",
        ],
        "A localization system should expose degraded confidence as well as an estimate.",
        "6.3",
        86,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "Why does pose covariance increase even when IMU and wheel data continue?",
        ["ch6-fusion"],
        2,
        [
          [
            "Those sensors contain no motion information",
            "Both provide useful relative motion.",
          ],
          [
            "The vehicle stops in tunnels as a rule",
            "The log does not show a stop.",
          ],
          [
            "Relative error grows without absolute correction",
            "Correct. Bias and noise integrate over time.",
          ],
          [
            "Covariance is simply the number of GPS satellites",
            "It represents estimator uncertainty, not a satellite count.",
          ],
        ],
        [
          "IMU and wheel measurements are noisy and may be biased.",
          "Without absolute observations, their accumulated state error grows.",
        ],
        "Dead reckoning preserves continuity but not bounded absolute accuracy.",
        "6.6",
        94,
      ),
      comparison: p(
        "comparison",
        "advanced",
        "Which tunnel feature would most improve absolute correction?",
        ["ch6-relocalization", "ch6-architecture"],
        1,
        [
          [
            "Another kilometer of identical wall",
            "More repetition adds little unique place information.",
          ],
          [
            "A mapped, surveyed, distinctive landmark",
            "Correct. Unique mapped geometry can constrain absolute pose.",
          ],
          [
            "A brighter dashboard display",
            "The display does not observe vehicle pose.",
          ],
          [
            "A larger GPS icon while signals remain blocked",
            "Presentation cannot restore measurements.",
          ],
        ],
        [
          "Absolute correction requires an observable map relationship.",
          "A unique surveyed landmark supplies that relationship.",
        ],
        "Localization improves when the environment contains distinguishable references.",
        "6.4",
        90,
      ),
      causal: p(
        "causal",
        "foundational",
        "If the tunnel is twice as long with no new absolute observations, what generally happens?",
        ["ch6-fusion"],
        3,
        [
          [
            "IMU bias disappears with distance",
            "Bias accumulation generally grows with time.",
          ],
          [
            "GPS becomes accurate underground after entry",
            "Tunnel blockage does not improve through duration.",
          ],
          [
            "Repetitive geometry becomes unique solely because it is longer",
            "More identical structure remains ambiguous.",
          ],
          [
            "Dead-reckoning uncertainty has more time to accumulate",
            "Correct. Longer propagation without correction increases drift risk.",
          ],
        ],
        [
          "Relative sensors integrate noisy motion over time.",
          "Doubling the unsupported interval increases opportunity for error growth.",
        ],
        "Outage duration is a key localization risk variable.",
        "6.3",
        86,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "An underwater vehicle loses acoustic beacons in a uniform pipeline. Which response transfers best?",
        ["ch6-fusion", "ch6-architecture"],
        1,
        [
          [
            "Claim exact global pose from inertial propagation alone",
            "Inertial drift prevents exact long-term position.",
          ],
          [
            "Dead-reckon until mapped-feature recovery",
            "Correct. It combines continuity, honest confidence, and global correction.",
          ],
          [
            "Use pipe length as a unique landmark throughout",
            "Uniform geometry is ambiguous along its axis.",
          ],
          [
            "Suppress uncertainty so the mission need not slow",
            "Concealing risk does not improve the estimate.",
          ],
        ],
        [
          "The vehicle has relative motion but loses an absolute reference in repetitive geometry.",
          "The same tracking-and-recovery architecture applies.",
        ],
        "Localization outage management transfers across environments.",
        "6.3",
        86,
      ),
    },
  ),
  c(
    "icp-initialization",
    {
      kind: "table",
      caption: "Same scan, different ICP seeds",
      columns: ["Seed error", "Final RMSE", "Pose error", "Result"],
      rows: [
        ["0.4 m, 2 deg", "0.11 m", "0.08 m", "correct"],
        ["8 m, 25 deg", "0.35 m", "7.4 m", "wrong street edge"],
        ["15 m, 90 deg", "no convergence", "-", "failed"],
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Which initialization policy is best supported for normal high-rate tracking?",
        ["ch6-icp"],
        0,
        [
          [
            "Seed from recent motion; reject implausible fits",
            "Correct. The successful run begins inside the useful basin and validation catches wrong minima.",
          ],
          [
            "Use a fresh random pose for each scan",
            "The table shows large errors fail or settle incorrectly.",
          ],
          [
            "Choose the solution with any finite RMSE",
            "The wrong-street result has finite RMSE but large pose error.",
          ],
          [
            "Set the seed to the map origin regardless of vehicle motion",
            "A fixed origin will become a poor seed as the vehicle travels.",
          ],
        ],
        [
          "ICP is local and depends on initial correspondences.",
          "A recent motion-informed seed is normally close to the next pose.",
        ],
        "Registration needs both a good proposal and a plausibility check.",
        "6.4",
        87,
      ),
      diagnosis: p(
        "diagnosis",
        "advanced",
        "Why can the wrong-street solution have a moderate RMSE?",
        ["ch6-icp"],
        2,
        [
          [
            "Treat RMSE as direct global pose error",
            "RMSE measures matched-point residual, not truth pose.",
          ],
          [
            "The scan contains no points",
            "A finite residual requires correspondences.",
          ],
          [
            "Repeated structure supports a wrong alignment",
            "Correct. A local minimum can fit nearby shapes while being globally wrong.",
          ],
          [
            "Assume a large seed changes the map coordinates",
            "The map remains fixed; the optimizer chooses different correspondences.",
          ],
        ],
        [
          "Registration minimizes local correspondence error.",
          "Similar structures can produce a low residual at the wrong global location.",
        ],
        "A low optimization loss is not sufficient evidence of correct localization.",
        "6.4",
        87,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which metric pair is stronger than RMSE alone for accepting a pose?",
        ["ch6-icp"],
        3,
        [
          [
            "Vehicle color and map file size",
            "Neither validates scan alignment.",
          ],
          [
            "Iteration count and CPU brand",
            "Fast convergence can still reach a wrong minimum.",
          ],
          [
            "Raw point count and route name",
            "These do not establish pose correctness.",
          ],
          [
            "Residual and motion consistency",
            "Correct. Independent plausibility evidence can expose a wrong local fit.",
          ],
        ],
        [
          "RMSE describes the fitted correspondences.",
          "Motion and map consistency test whether the resulting pose is physically credible.",
        ],
        "Validate estimates with evidence outside the optimized objective.",
        "6.4",
        87,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If scan rate rises while vehicle speed stays constant, why can previous-pose seeding improve?",
        ["ch6-icp"],
        1,
        [
          [
            "The map becomes smaller at higher scan rate",
            "Map geometry does not shrink.",
          ],
          [
            "Motion between consecutive scans decreases",
            "Correct. The previous pose lies closer to the next true pose.",
          ],
          [
            "ICP no longer needs correspondences",
            "Registration still matches scan and map structure.",
          ],
          [
            "GPS multipath disappears",
            "Scan rate does not change satellite reflection.",
          ],
        ],
        [
          "The same speed is divided across shorter time intervals.",
          "Smaller inter-scan displacement improves the initial guess.",
        ],
        "Temporal sampling affects the difficulty of local registration.",
        "6.4",
        88,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A 3D scanner aligns successive factory parts but fails when its starting rotation is far off. Which lesson transfers?",
        ["ch6-icp"],
        0,
        [
          [
            "Give local registration a coarse orientation",
            "Correct. A global or fixture-based seed can enter the local optimizer's convergence basin.",
          ],
          [
            "Increase part speed so alignment has less time",
            "Faster motion usually worsens initialization.",
          ],
          [
            "Accept the lowest local residual without fixture checks",
            "Repeated part geometry can support wrong alignments.",
          ],
          [
            "Delete orientation from the pose model",
            "Rotation is essential to rigid alignment.",
          ],
        ],
        [
          "Both systems use a local geometric optimizer.",
          "A coarse proposal reduces correspondence ambiguity.",
        ],
        "Initialization sensitivity transfers to registration tasks beyond vehicles.",
        "6.4",
        87,
      ),
    },
  ),
  c(
    "icp-repetitive-geometry",
    {
      kind: "log",
      caption: "Parking-garage registration",
      lines: [
        "pillars repeat every 5.0 m",
        "ICP translation alternates by about 5.0 m",
        "RMSE stays between 0.12 and 0.16 m",
        "wheel odometry predicts 0.6 m forward",
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which response best prevents accepting the repeated-pillar jump?",
        ["ch6-icp", "ch6-fusion"],
        2,
        [
          [
            "Accept results below 0.2 m RMSE without other checks",
            "All alternating solutions meet that threshold.",
          ],
          [
            "Remove wheel odometry because it disagrees",
            "The motion evidence is precisely what exposes the jump.",
          ],
          [
            "Gate ICP with motion and unique context",
            "Correct. The 5-meter jump conflicts with plausible motion and repeated geometry needs disambiguation.",
          ],
          [
            "Increase pillar repetition in the map",
            "More identical structure increases ambiguity.",
          ],
        ],
        [
          "The residual remains low across translations separated by one pillar interval.",
          "Wheel motion predicts only 0.6 meters, making the jump implausible.",
        ],
        "Use complementary motion and place evidence in geometrically ambiguous scenes.",
        "6.4",
        88,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "What observation most strongly identifies perceptual aliasing?",
        ["ch6-icp"],
        3,
        [
          [
            "The vehicle is inside a parking garage",
            "Location alone does not prove aliasing.",
          ],
          [
            "RMSE is reported in meters",
            "Metric units do not create ambiguity.",
          ],
          [
            "Wheel odometry predicts forward motion",
            "That reveals inconsistency but not the repeated pattern by itself.",
          ],
          [
            "Jumps match the 5 m pillar spacing",
            "Correct. Error periodicity mirrors environmental repetition.",
          ],
        ],
        [
          "A repeated environment can produce multiple similar alignments.",
          "The jump interval exactly matches the repeated structure.",
        ],
        "Relate error structure to environmental symmetry.",
        "6.4",
        88,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which environment offers stronger ICP observability?",
        ["ch6-icp"],
        0,
        [
          [
            "A varied, asymmetric corner",
            "Correct. Diverse structure constrains translation and rotation more uniquely.",
          ],
          [
            "A long empty tunnel with parallel walls",
            "Parallel repetitive surfaces leave directions weakly constrained.",
          ],
          [
            "An infinite row of identical pillars",
            "Repeated geometry creates many similar fits.",
          ],
          [
            "A flat open lot with no returns",
            "No structure provides almost no alignment constraint.",
          ],
        ],
        [
          "Registration needs geometric variation to distinguish poses.",
          "Asymmetry reduces equivalent correspondence patterns.",
        ],
        "Environment geometry determines which pose components are observable.",
        "6.4",
        88,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If a distinctive ramp entrance enters the scan, what change is expected?",
        ["ch6-icp"],
        1,
        [
          [
            "Most points become unnecessary",
            "Registration still uses surrounding geometry.",
          ],
          [
            "Pillar fits become distinguishable",
            "Correct. The unique structure breaks the periodic symmetry.",
          ],
          [
            "Disable wheel odometry during registration",
            "Motion remains useful corroboration.",
          ],
          [
            "The pillar interval changes physically",
            "The environment spacing stays the same.",
          ],
        ],
        [
          "The ramp entrance appears at only one mapped location.",
          "Correspondences that shift by one pillar no longer align that feature.",
        ],
        "Distinctive context can resolve local geometric aliasing.",
        "6.4",
        88,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A warehouse robot localizes along identical shelving bays and jumps by one bay. What transfers best?",
        ["ch6-icp", "ch6-relocalization"],
        3,
        [
          [
            "Trust the scan residual alone",
            "Identical bays can yield low residuals at wrong locations.",
          ],
          [
            "Paint bays identically to improve consistency",
            "Greater sameness worsens aliasing.",
          ],
          [
            "Remove motion history from the estimator",
            "History helps reject implausible bay jumps.",
          ],
          [
            "Fuse motion with unique markers or place cues",
            "Correct. Complementary evidence breaks the repeated-layout symmetry.",
          ],
        ],
        [
          "The bay spacing creates the same periodic localization error.",
          "Motion and unique place evidence distinguish otherwise similar fits.",
        ],
        "Aliasing countermeasures transfer to structured indoor environments.",
        "6.4",
        90,
      ),
    },
  ),
  c(
    "motion-seeding",
    {
      kind: "table",
      caption: "High-speed scan sequence",
      columns: [
        "Frame",
        "Reference x",
        "Previous-pose seed error",
        "Velocity-predicted seed error",
      ],
      rows: [
        ["1", "0 m", "-", "-"],
        ["2", "3 m", "3 m", "0.2 m"],
        ["3", "6.2 m", "3.2 m", "0.3 m"],
        ["4", "9.5 m", "3.3 m", "0.3 m"],
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Which seed should ICP use after motion becomes approximately steady?",
        ["ch6-icp"],
        1,
        [
          [
            "The unchanged previous pose",
            "Its error grows to the full inter-frame displacement.",
          ],
          [
            "Velocity-predicted pose with bounds",
            "Correct. It remains much closer while bounds limit bad extrapolation.",
          ],
          [
            "A random map keyframe",
            "Random global seeds are poor for high-rate local tracking.",
          ],
          [
            "The first-frame pose for each update",
            "That seed grows increasingly distant.",
          ],
        ],
        [
          "Reference displacement is about three meters per scan.",
          "Velocity prediction accounts for that displacement and leaves sub-meter error.",
        ],
        "Use motion models to keep local registration near the correct basin.",
        "6.4",
        88,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "Why does the previous-pose strategy become fragile at high speed?",
        ["ch6-icp"],
        0,
        [
          [
            "Motion exceeds ICP convergence range",
            "Correct. A stale pose is farther from the next scan at higher motion per frame.",
          ],
          [
            "High speed removes all LiDAR points",
            "The table still has scan registrations.",
          ],
          [
            "Velocity cannot be estimated from poses",
            "Several poses can support a velocity estimate.",
          ],
          [
            "The map frame changes once per scan",
            "The map remains the fixed reference.",
          ],
        ],
        [
          "ICP is a local iterative method.",
          "Larger starting error can create wrong correspondences or nonconvergence.",
        ],
        "Match the initializer to expected inter-frame motion.",
        "6.4",
        88,
      ),
      comparison: p(
        "comparison",
        "advanced",
        "When would previous-pose seeding be safer than constant-velocity prediction?",
        ["ch6-icp"],
        2,
        [
          [
            "During long steady motion with reliable velocity",
            "Prediction is particularly useful there.",
          ],
          [
            "Whenever the map contains any points",
            "Map content alone does not choose the temporal model.",
          ],
          [
            "After hard braking makes the velocity seed stale",
            "Correct. Extrapolation could overshoot while the latest pose remains a conservative reference.",
          ],
          [
            "When scan rate is lower and motion per frame is larger",
            "That makes a stale pose less favorable.",
          ],
        ],
        [
          "Velocity prediction assumes near-term motion continuity.",
          "Abrupt braking violates that assumption.",
        ],
        "Choose initialization using both motion regime and model uncertainty.",
        "6.4",
        88,
      ),
      causal: p(
        "causal",
        "foundational",
        "If scan frequency doubles at the same speed, what happens to expected previous-pose seed error?",
        ["ch6-icp"],
        3,
        [
          [
            "It doubles because more scans create more motion",
            "Each interval becomes shorter.",
          ],
          [
            "It becomes unrelated to speed",
            "Inter-scan displacement still depends on speed.",
          ],
          [
            "It necessarily becomes zero",
            "Motion still occurs during each interval.",
          ],
          [
            "It halves with half the scan interval",
            "Correct. Doubling frequency halves interval duration.",
          ],
        ],
        [
          "Seed error is dominated by displacement since the last scan.",
          "At constant speed, displacement scales with the time interval.",
        ],
        "Sampling rate and vehicle speed jointly set registration initialization difficulty.",
        "6.4",
        88,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A camera tracker loses a fast drone because each search begins at its last pixel position. Which transfer is strongest?",
        ["ch6-icp"],
        0,
        [
          [
            "Predict search region from velocity and uncertainty",
            "Correct. Motion prediction moves the local search near the expected observation.",
          ],
          [
            "Search the original first-frame location exclusively",
            "That becomes increasingly stale.",
          ],
          [
            "Delete temporal information to make frames independent",
            "History is useful for predicting motion.",
          ],
          [
            "Assume a low residual proves identity after any jump",
            "Local similarity can associate the wrong object.",
          ],
        ],
        [
          "Both tasks use a local search around an initial proposal.",
          "A motion-informed proposal accommodates high inter-frame displacement.",
        ],
        "Temporal seeding principles transfer across tracking and registration.",
        "6.4",
        88,
      ),
    },
  ),
  c(
    "ndt-voxel-tradeoff",
    {
      kind: "table",
      caption: "NDT voxel sweep",
      columns: ["Voxel", "Runtime", "Translation error"],
      rows: [
        ["0.1 m", "190 ms", "0.05 m"],
        ["0.5 m", "62 ms", "0.12 m"],
        ["1.5 m", "24 ms", "0.78 m"],
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "A 10 Hz localization loop has a 100 ms budget and a 0.25 m error limit. Which setting fits both observed constraints?",
        ["ch6-ndt"],
        1,
        [
          ["0.1 m", "Its 190 ms runtime misses the timing budget."],
          ["0.5 m", "Correct. It runs in 62 ms with 0.12 m error."],
          ["1.5 m", "It is fast but exceeds the error limit."],
          [
            "No setting can satisfy both",
            "The 0.5-meter row satisfies both thresholds.",
          ],
        ],
        [
          "The loop needs runtime below 100 ms and error below 0.25 m.",
          "Only the middle row meets both.",
        ],
        "Parameter selection is a joint accuracy-and-deadline decision.",
        "6.4",
        89,
      ),
      diagnosis: p(
        "diagnosis",
        "foundational",
        "Why does the 1.5 m setting lose accuracy?",
        ["ch6-ndt"],
        2,
        [
          [
            "It processes more fine detail than the smaller voxels",
            "Larger voxels reduce, not increase, spatial detail.",
          ],
          [
            "NDT stops using probability distributions",
            "NDT still models voxel distributions.",
          ],
          [
            "Coarse voxels erase alignment detail",
            "Correct. Downsampling trades spatial resolution for speed.",
          ],
          [
            "GPS multipath grows with voxel size",
            "Voxel size affects point-cloud processing, not satellite signals.",
          ],
        ],
        [
          "A 1.5-meter cell summarizes many points together.",
          "Fine surfaces and edges become less precisely represented.",
        ],
        "Aggressive downsampling can erase information that constrains pose.",
        "6.4",
        89,
      ),
      comparison: p(
        "comparison",
        "advanced",
        "Which conclusion fairly compares the 0.1 m and 0.5 m settings?",
        ["ch6-ndt"],
        3,
        [
          [
            "Prefer the smallest voxel because its error is lowest",
            "It misses the required update deadline.",
          ],
          [
            "Prefer the 0.5 m voxel across deployments",
            "Different budgets and scenes can change the choice.",
          ],
          [
            "Treat runtime as the decisive localization metric",
            "Pose accuracy also constrains safe use.",
          ],
          [
            "0.5 m trades 0.07 m error for 128 ms runtime",
            "Correct. It states the measured tradeoff without making it universal.",
          ],
        ],
        [
          "The rows quantify both change dimensions.",
          "The appropriate setting depends on explicit timing and accuracy limits.",
        ],
        "Compare parameters against requirements, not one metric in isolation.",
        "6.4",
        89,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If compute becomes twice as fast but the scene and voxel size stay fixed, what change is most defensible?",
        ["ch6-ndt"],
        0,
        [
          [
            "Runtime falls, geometry retained",
            "Correct. Faster compute changes execution, not the sampled geometry itself.",
          ],
          [
            "Voxel cells shrink as a side effect",
            "Voxel size is an algorithm parameter.",
          ],
          [
            "GPS accuracy doubles",
            "Compute speed does not change satellite measurement noise.",
          ],
          [
            "NDT no longer needs an initial pose",
            "Local registration still benefits from initialization.",
          ],
        ],
        [
          "The same point representation is processed on faster hardware.",
          "That primarily affects time rather than the information retained.",
        ],
        "Separate computational changes from measurement-model changes.",
        "6.4",
        89,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A 3D inspection system must run faster and considers coarser point sampling. Which AV lesson transfers?",
        ["ch6-ndt"],
        1,
        [
          [
            "Choose the coarsest setting without measuring defect visibility",
            "Critical geometric evidence may be removed.",
          ],
          [
            "Sweep resolution against latency and error limits",
            "Correct. It makes the speed-accuracy tradeoff explicit.",
          ],
          [
            "Assume additional raw points improve production accuracy",
            "Excess computation can miss deadlines.",
          ],
          [
            "Replace geometric evaluation with CPU utilization alone",
            "Task accuracy remains essential.",
          ],
        ],
        [
          "Downsampling changes both workload and retained detail.",
          "A requirement-based sweep reveals an acceptable operating point.",
        ],
        "Resolution tradeoff reasoning transfers to other point-cloud tasks.",
        "6.4",
        89,
      ),
    },
  ),
  c(
    "scan-context-recovery",
    {
      kind: "log",
      caption: "Lost-pose recovery",
      lines: [
        "local tracker covariance exceeded threshold",
        "current Scan Context nearest keyframe: K184",
        "second nearest: K912",
        "descriptor distances: 0.18 and 0.46",
        "ICP from K184: RMSE 0.09 m; motion jump 2.1 m",
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Which recovery sequence best uses the evidence?",
        ["ch6-relocalization", "ch6-icp"],
        0,
        [
          [
            "Use K184 as proposal; refine and validate the jump",
            "Correct. Place recognition narrows search and registration supplies precise alignment.",
          ],
          [
            "Resume from the failed local pose without checking candidates",
            "The tracker already declared excessive uncertainty.",
          ],
          [
            "Accept K912 because its keyframe number is larger",
            "Keyframe index is not a similarity measure.",
          ],
          [
            "Use descriptor distance as the final centimeter-level pose",
            "Scan Context proposes a place; it does not replace geometric refinement.",
          ],
        ],
        [
          "K184 has the strongest descriptor match.",
          "ICP then produces a tight local fit that still needs motion plausibility validation.",
        ],
        "Global retrieval and local registration solve different parts of relocalization.",
        "6.4",
        90,
      ),
      diagnosis: p(
        "diagnosis",
        "advanced",
        "Why should the 2.1 m jump still be checked despite low descriptor distance and RMSE?",
        ["ch6-relocalization", "ch6-icp"],
        2,
        [
          [
            "A low RMSE means the map file is corrupted",
            "Low residual usually indicates a good local geometric fit.",
          ],
          [
            "Scan Context cannot be used with LiDAR",
            "It is explicitly a LiDAR descriptor.",
          ],
          [
            "Both stages can match the wrong place",
            "Correct. Independent motion or route evidence can catch place aliasing.",
          ],
          [
            "Any pose jump over zero is invalid",
            "Real recovery can legitimately correct accumulated error.",
          ],
        ],
        [
          "Descriptor and ICP evidence both depend on environmental geometry.",
          "Similar places can fool both, so another consistency check is valuable.",
        ],
        "Agreement is strongest when evidence sources have different failure modes.",
        "6.4",
        90,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "What is Scan Context contributing that frame-to-map ICP alone may not?",
        ["ch6-relocalization"],
        3,
        [
          [
            "Direct steering commands",
            "Localization descriptors do not control actuators.",
          ],
          ["GPS satellite corrections", "Scan Context uses scan geometry."],
          [
            "A claim of globally unique localization",
            "Descriptors can have similar candidates.",
          ],
          [
            "A fast place candidate after pose loss",
            "Correct. It reduces a large map search to likely keyframes.",
          ],
        ],
        [
          "ICP needs a nearby initial pose for local convergence.",
          "A compact global descriptor can retrieve such a neighborhood.",
        ],
        "Global recognition complements precise local tracking.",
        "6.4",
        90,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If K184 and K912 descriptor distances become nearly equal, what should change?",
        ["ch6-relocalization"],
        1,
        [
          [
            "Select the larger keyframe id as a heuristic",
            "Identifiers do not resolve ambiguity.",
          ],
          [
            "Test multiple hypotheses with geometry",
            "Correct. Similar scores mean one candidate should not be treated as certain.",
          ],
          [
            "Set localization covariance to zero",
            "Ambiguity should increase, not erase, uncertainty.",
          ],
          [
            "Disable the local tracker permanently",
            "The tracker can resume after a validated recovery.",
          ],
        ],
        [
          "Near-equal retrieval scores indicate place ambiguity.",
          "Testing several candidates prevents premature commitment.",
        ],
        "Represent multiple hypotheses when global place evidence is ambiguous.",
        "6.4",
        90,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A museum robot wakes without a pose. Which recovery design transfers?",
        ["ch6-relocalization"],
        2,
        [
          [
            "Drive randomly until local odometry becomes global",
            "Odometry tracks relative motion and cannot identify the initial room alone.",
          ],
          [
            "Assume charging-station starts are highly likely",
            "That brittle assumption fails after manual relocation.",
          ],
          [
            "Retrieve places, then align and verify",
            "Correct. Coarse place recognition plus local geometry recovers global pose.",
          ],
          [
            "Use wheel speed as an absolute room label",
            "Speed does not identify place.",
          ],
        ],
        [
          "The robot has the same kidnapped-position problem.",
          "Stored place signatures can seed precise local alignment.",
        ],
        "Coarse-to-fine relocalization transfers to indoor mobile robots.",
        "6.4",
        90,
      ),
    },
  ),
  c(
    "keyframe-alias",
    {
      kind: "table",
      caption: "Map-keyframe candidates",
      columns: [
        "Keyframe",
        "Scene",
        "Descriptor distance",
        "Route compatibility",
      ],
      rows: [
        ["K20", "north parking deck", 0.22, "yes"],
        ["K77", "south parking deck", 0.2, "no"],
        ["K91", "service tunnel", 0.61, "yes"],
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which candidate policy is strongest?",
        ["ch6-relocalization"],
        1,
        [
          [
            "Accept K77 because its descriptor distance is smallest",
            "The tiny score advantage conflicts with route evidence.",
          ],
          [
            "Test K20/K77 with geometry and route compatibility",
            "Correct. The top scores are close and the decks may be visually aliased.",
          ],
          [
            "Accept K91 because route compatibility is yes",
            "Its descriptor evidence is much weaker and scene type differs.",
          ],
          [
            "Average all keyframe poses",
            "Averaging distinct places produces a meaningless location.",
          ],
        ],
        [
          "K20 and K77 have nearly tied visual scores.",
          "Route and geometric checks can resolve that ambiguity.",
        ],
        "Fuse place appearance with independent context instead of ranking by one score.",
        "6.4",
        90,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "What map-design issue makes K20 and K77 hard to separate?",
        ["ch6-relocalization"],
        3,
        [
          [
            "Their keyframe numbers differ",
            "Identifiers do not affect appearance.",
          ],
          [
            "Both have compatible routes",
            "The table says K77 is incompatible.",
          ],
          [
            "They use different sensor types",
            "Both are compared with the same descriptor.",
          ],
          [
            "Parking decks share geometry",
            "Correct. Repeated scene structure causes place aliasing.",
          ],
        ],
        [
          "Scan Context summarizes spatial layout.",
          "Similar layouts can produce similar descriptors at distant places.",
        ],
        "Map diversity affects global localization discriminability.",
        "6.4",
        90,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which extra observation most directly favors K20 over K77?",
        ["ch6-relocalization"],
        0,
        [
          [
            "North-deck route history",
            "Correct. It is independent context consistent with K20.",
          ],
          [
            "A lower display brightness",
            "Display settings do not indicate deck location.",
          ],
          [
            "A larger keyframe database",
            "More entries do not distinguish these two candidates by themselves.",
          ],
          [
            "The same repeated pillar pattern",
            "That is the ambiguous evidence already shared.",
          ],
        ],
        [
          "The candidates have similar descriptor scores.",
          "Recent route history identifies which region is reachable.",
        ],
        "Use temporal and topological constraints to reject impossible place matches.",
        "6.4",
        90,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If a distinctive north-deck sign is added to the descriptor input, what effect is expected?",
        ["ch6-relocalization"],
        2,
        [
          [
            "Both decks become more similar",
            "A unique sign adds discriminating information.",
          ],
          [
            "Treat route history as too unreliable to use",
            "Appearance and route evidence can coexist.",
          ],
          [
            "K20 should separate more clearly from K77",
            "Correct. The unique feature breaks the shared-geometry ambiguity.",
          ],
          [
            "ICP no longer needs any points",
            "Local geometric refinement remains useful.",
          ],
        ],
        [
          "The current descriptor emphasizes common deck structure.",
          "A unique landmark increases place specificity.",
        ],
        "Distinctive stable features improve global place recognition.",
        "6.4",
        90,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A train station robot confuses two identical platforms. Which countermeasure transfers best?",
        ["ch6-relocalization"],
        3,
        [
          [
            "Choose the platform with the smaller numeric label",
            "Labels in software are not sensor evidence.",
          ],
          [
            "Average both platform poses",
            "The average lies at neither valid platform.",
          ],
          [
            "Ignore timetable and route history",
            "Those are valuable independent constraints.",
          ],
          [
            "Combine scene match, signage, and reachable routes",
            "Correct. Independent identity and topology break visual symmetry.",
          ],
        ],
        [
          "The platforms create a place-aliasing problem analogous to the decks.",
          "Unique landmarks and temporal context disambiguate them.",
        ],
        "Relocalization benefits from appearance, geometry, and topology together.",
        "6.4",
        90,
      ),
    },
  ),
  c(
    "orb-match-outliers",
    {
      kind: "table",
      caption: "Two-frame feature match",
      columns: ["Stage", "Count"],
      rows: [
        ["ORB keypoints each image", 1000],
        ["descriptor matches", 310],
        ["RANSAC geometric inliers", 42],
        ["inliers on one moving bus", 31],
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which next step best protects ego-motion estimation?",
        ["ch6-visual"],
        3,
        [
          [
            "Use all 310 descriptor matches equally",
            "Most matches are not geometrically verified.",
          ],
          [
            "Estimate motion from the moving bus inliers alone",
            "That estimates bus motion rather than camera motion.",
          ],
          [
            "Increase keypoints without examining spatial support",
            "More features can repeat the same dynamic-scene bias.",
          ],
          [
            "Mask movers; require distributed static inliers",
            "Correct. Ego motion should be constrained by the static environment.",
          ],
        ],
        [
          "RANSAC leaves few inliers and most lie on one moving object.",
          "Removing dynamic regions and checking coverage targets the failure.",
        ],
        "Feature count is not a substitute for correct, static geometric support.",
        "6.5",
        91,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "Why can 42 RANSAC inliers still yield a wrong vehicle pose?",
        ["ch6-visual"],
        0,
        [
          [
            "Moving-object features dominate the motion model",
            "Correct. RANSAC finds a motion model, which may belong to the bus.",
          ],
          [
            "ORB descriptors contain no visual information",
            "They encode local appearance for matching.",
          ],
          [
            "RANSAC selects points in alphabetical order",
            "Selection is based on geometric consistency.",
          ],
          [
            "Forty-two is too many points for pose estimation",
            "The issue is support quality and distribution, not simply count.",
          ],
        ],
        [
          "Most inliers lie on the bus.",
          "Those points share bus motion rather than the static-world camera motion.",
        ],
        "Robust estimators still need the correct data-generating model.",
        "6.5",
        91,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which match set better supports camera motion?",
        ["ch6-visual"],
        1,
        [
          [
            "200 matches clustered on one moving truck",
            "They mainly observe truck motion.",
          ],
          [
            "60 static matches across scene depth",
            "Correct. Static, distributed support constrains camera pose.",
          ],
          [
            "500 unverified nearest descriptors",
            "Descriptor similarity alone includes outliers.",
          ],
          [
            "20 matches all on one straight image edge",
            "Poor geometry can leave pose components weakly constrained.",
          ],
        ],
        [
          "Camera motion is defined relative to the static scene.",
          "Spatially distributed inliers provide stronger geometry.",
        ],
        "Evaluate correspondence quality, motion class, and spatial coverage.",
        "6.5",
        91,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If the bus leaves and static inliers rise to 170 across the frame, what should happen?",
        ["ch6-visual"],
        2,
        [
          [
            "Pose worsens when fewer objects are visible",
            "Static geometric support has improved.",
          ],
          [
            "ORB stops being rotation invariant",
            "Scene composition does not change the descriptor design.",
          ],
          [
            "Ego-motion estimation should become more stable",
            "Correct. More distributed static inliers better constrain the model.",
          ],
          [
            "Loop closure becomes unnecessary forever",
            "Future drift and loss can still occur.",
          ],
        ],
        [
          "Dynamic-model contamination is removed.",
          "A larger static consensus improves pose observability.",
        ],
        "Changes in scene support predict changes in visual-localization reliability.",
        "6.5",
        91,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A sports camera estimates its motion while players fill the view. Which lesson transfers?",
        ["ch6-visual"],
        0,
        [
          [
            "Use static field and stadium structure",
            "Correct. These features belong to the stationary reference frame.",
          ],
          [
            "Use the fastest player because motion is largest",
            "That estimates player movement.",
          ],
          [
            "Treat descriptor matches as static features",
            "Players create coherent dynamic outliers.",
          ],
          [
            "Disable geometric verification",
            "Verification helps reject inconsistent correspondences.",
          ],
        ],
        [
          "The desired camera pose is relative to the venue, not the players.",
          "Static landmarks provide that reference.",
        ],
        "Dynamic-scene feature reasoning transfers to camera tracking broadly.",
        "6.5",
        91,
      ),
    },
  ),
  c(
    "visual-low-light",
    {
      kind: "log",
      caption: "Night visual odometry",
      lines: [
        "day: 850 ORB features, 220 verified matches",
        "night: 190 ORB features, 28 verified matches",
        "IMU: healthy",
        "camera exposure: long; motion blur visible",
        "pose covariance rises at night",
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Which response best maintains localization at night?",
        ["ch6-visual", "ch6-fusion"],
        1,
        [
          [
            "Increase trust in the 28 matches because they are scarce",
            "Scarcity does not make weak measurements more reliable.",
          ],
          [
            "Use IMU, improve imaging, raise visual uncertainty",
            "Correct. It preserves continuity while honestly downweighting degraded vision.",
          ],
          [
            "Set covariance to the daytime value",
            "That hides the observed information loss.",
          ],
          [
            "Discard IMU because the camera is the primary sensor",
            "The healthy complementary sensor is especially valuable now.",
          ],
        ],
        [
          "Feature and match counts fall sharply with blur.",
          "Fusion should reflect the reduced visual information and use inertial continuity.",
        ],
        "A robust estimator adapts uncertainty when a modality degrades.",
        "6.5",
        93,
      ),
      diagnosis: p(
        "diagnosis",
        "foundational",
        "Which observation most directly explains the covariance increase?",
        ["ch6-visual"],
        3,
        [
          [
            "The scene occurs after sunset on a calendar",
            "Time label alone does not measure sensing quality.",
          ],
          [
            "The IMU is healthy",
            "Healthy inertial data supports rather than explains the visual degradation.",
          ],
          [
            "Daytime has more features",
            "This is comparative but does not identify the night mechanism as directly.",
          ],
          [
            "Blur reduces verified feature matches",
            "Correct. The pose update has less reliable visual constraint.",
          ],
        ],
        [
          "Visual odometry relies on repeatable feature correspondences.",
          "Blur reduces both detection and geometric verification.",
        ],
        "Connect estimator uncertainty to the information actually observed.",
        "6.5",
        93,
      ),
      comparison: p(
        "comparison",
        "advanced",
        "Which intervention targets the visual cause rather than only its consequence?",
        ["ch6-visual"],
        2,
        [
          [
            "Force covariance lower in software",
            "That changes reported confidence without adding information.",
          ],
          [
            "Ignore the night runs in evaluation",
            "Removing evidence does not improve operation.",
          ],
          [
            "Improve lighting to reduce blur",
            "Correct. It seeks more stable image features at the source.",
          ],
          [
            "Increase GPS map font size",
            "Display formatting does not affect camera images.",
          ],
        ],
        [
          "The log identifies blur from long exposure.",
          "Imaging changes can improve the visual measurement before fusion.",
        ],
        "Distinguish measurement improvement from confidence manipulation.",
        "6.5",
        93,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If exposure shortens but images become noisier, what should engineers do next?",
        ["ch6-visual"],
        0,
        [
          [
            "Measure the resulting feature repeatability and pose error rather than assume improvement",
            "Correct. The change trades blur against noise and needs task-level evaluation.",
          ],
          [
            "Declare success because shorter is always better",
            "Short exposure can remove too much signal.",
          ],
          [
            "Set every pixel to its average value",
            "That destroys local features.",
          ],
          [
            "Remove geometric verification to keep more matches",
            "More unverified matches can increase outliers.",
          ],
        ],
        [
          "Exposure affects both blur and signal-to-noise.",
          "The net localization effect is empirical.",
        ],
        "Evaluate imaging changes by downstream geometric performance.",
        "6.5",
        93,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "An augmented-reality headset loses tracking in a dim hallway. Which AV response transfers?",
        ["ch6-visual", "ch6-fusion"],
        3,
        [
          [
            "Pretend the daytime covariance still applies",
            "Confidence should reflect current evidence.",
          ],
          [
            "Use blurred matches with maximum weight",
            "Degraded measurements should not dominate.",
          ],
          [
            "Turn off inertial sensing because it drifts",
            "Short-term inertial support is valuable during visual degradation.",
          ],
          [
            "Fuse inertial motion, improve imaging, and expose rising uncertainty",
            "Correct. It balances continuity, measurement quality, and honest confidence.",
          ],
        ],
        [
          "Both systems lose visual constraints under low light.",
          "Inertial fusion bridges short gaps while imaging and confidence adapt.",
        ],
        "Visual-inertial degradation handling transfers across mobile devices.",
        "6.5",
        93,
      ),
    },
  ),
  c(
    "dynamic-visual-scene",
    {
      kind: "table",
      caption: "Visual feature support",
      columns: ["Region", "Verified matches", "Motion"],
      rows: [
        ["moving truck", 95, "independent"],
        ["road surface", 18, "static"],
        ["buildings", 22, "static"],
        ["pedestrians", 31, "independent"],
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which pose-estimation input should receive priority?",
        ["ch6-visual"],
        2,
        [
          [
            "All truck and pedestrian matches because they are most numerous",
            "Numerous dynamic features support other-object motion.",
          ],
          [
            "Only the truck because it forms the largest consensus",
            "Its consensus can dominate with the wrong reference motion.",
          ],
          [
            "Static road and building matches with robust spatial checks",
            "Correct. They observe camera motion relative to the world.",
          ],
          [
            "No matches because any dynamic object invalidates the frame",
            "Static support remains available.",
          ],
        ],
        [
          "Ego pose should be estimated relative to stationary structure.",
          "Dynamic features need segmentation or competing-motion handling.",
        ],
        "Select features by reference-frame validity, not count alone.",
        "6.5",
        93,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "A visual odometry estimate follows the truck's lane change. What most likely happened?",
        ["ch6-visual"],
        1,
        [
          [
            "The map changed lanes with the truck",
            "The global map remains fixed.",
          ],
          [
            "Dynamic truck features dominated the motion model",
            "Correct. The estimator interpreted object motion as camera motion.",
          ],
          [
            "GPS multipath rotated the image pixels",
            "The symptom directly tracks a visual moving object.",
          ],
          [
            "The controller changed the truck's steering",
            "Ego control does not command the truck.",
          ],
        ],
        [
          "The truck supplies the largest verified feature group.",
          "A single-model estimator can lock onto that independent motion.",
        ],
        "Dynamic-object dominance creates coherent but wrong visual motion.",
        "6.5",
        93,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which scene offers better visual ego-motion support?",
        ["ch6-visual"],
        0,
        [
          [
            "Static textured structures distributed across depth and image",
            "Correct. Diverse stationary features constrain camera motion.",
          ],
          [
            "One close moving bus filling the frame",
            "The bus mainly provides its own motion.",
          ],
          [
            "A blank wall with no corners",
            "Feature extraction and geometry are weak.",
          ],
          [
            "A crowd moving in several directions with no background",
            "Multiple dynamic motions make the static reference hard to recover.",
          ],
        ],
        [
          "Visual odometry needs trackable features tied to the world.",
          "Spatial and depth diversity improve pose constraints.",
        ],
        "Scene composition determines visual localization observability.",
        "6.5",
        93,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If semantic masking removes truck and pedestrian features, what tradeoff follows?",
        ["ch6-visual"],
        3,
        [
          [
            "Every remaining feature becomes an outlier",
            "Static features are the desired support.",
          ],
          [
            "Camera intrinsics become unknown",
            "Masking does not change calibration.",
          ],
          ["The map frame becomes dynamic", "The map remains fixed."],
          [
            "Dynamic bias falls, but too few static matches may increase uncertainty",
            "Correct. Filtering improves validity while reducing measurement count.",
          ],
        ],
        [
          "Masking removes known dynamic regions.",
          "Only 40 static verified matches remain, so confidence must reflect their adequacy.",
        ],
        "Outlier rejection can trade bias for variance.",
        "6.5",
        93,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A broadcast camera pans across a soccer match. Which AV lesson transfers to estimating camera motion?",
        ["ch6-visual"],
        1,
        [
          [
            "Use players as the stationary world reference",
            "Players move independently.",
          ],
          [
            "Anchor motion to field lines and stadium structure",
            "Correct. Those features are fixed in the venue frame.",
          ],
          [
            "Treat the largest team cluster as the camera",
            "Team motion is not camera motion.",
          ],
          [
            "Ignore geometric verification because the field is known",
            "Verification still rejects mismatches.",
          ],
        ],
        [
          "The goal is camera motion relative to the venue.",
          "Static field features provide that coordinate reference.",
        ],
        "Reference-frame-aware feature selection transfers to video stabilization.",
        "6.5",
        93,
      ),
    },
  ),
  c(
    "loop-closure-drift",
    {
      kind: "log",
      caption: "ORB-SLAM route",
      lines: [
        "start and end at same parking space",
        "odometry end offset: 14.2 m",
        "bag-of-words retrieves start keyframe",
        "geometric verification: 126 inliers",
        "pose graph optimization not yet run",
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Which next action best uses the loop evidence?",
        ["ch6-visual", "ch6-relocalization"],
        3,
        [
          [
            "Reset every pose to the start location",
            "That destroys the route geometry.",
          ],
          [
            "Ignore the match because odometry reports a different place",
            "The accumulated drift is exactly why loop closure is needed.",
          ],
          [
            "Accept the place match without geometry",
            "Geometric verification is already present and should inform a correction.",
          ],
          [
            "Add the verified loop constraint and optimize the pose graph",
            "Correct. The global constraint can distribute accumulated drift across the route.",
          ],
        ],
        [
          "The route physically returns to its start and the match has strong geometry.",
          "Pose graph optimization reconciles local odometry with that global constraint.",
        ],
        "Loop closure converts place recognition into a consistent trajectory correction.",
        "6.5",
        92,
      ),
      diagnosis: p(
        "diagnosis",
        "foundational",
        "Why can the end offset grow even if each frame-to-frame estimate is only slightly wrong?",
        ["ch6-visual"],
        0,
        [
          [
            "Small relative errors accumulate over a long trajectory",
            "Correct. Visual odometry integrates incremental motion.",
          ],
          [
            "The parking space moves whenever the camera does",
            "The physical start remains fixed.",
          ],
          [
            "Bag-of-words creates all odometry error",
            "Retrieval occurs after drift has accumulated.",
          ],
          [
            "One feature mismatch always produces exactly 14.2 m error",
            "The log supports cumulative rather than single-step error.",
          ],
        ],
        [
          "Each local estimate becomes the basis of the next pose.",
          "Bias and noise compound across frames.",
        ],
        "Local accuracy does not guarantee global consistency.",
        "6.5",
        92,
      ),
      comparison: p(
        "comparison",
        "advanced",
        "Why is geometric verification important after bag-of-words retrieval?",
        ["ch6-visual"],
        2,
        [
          [
            "It makes image brightness identical",
            "Geometry does not normalize all appearance.",
          ],
          [
            "It converts the camera into a LiDAR",
            "The sensor modality remains visual.",
          ],
          [
            "It tests whether feature correspondences support a consistent relative pose",
            "Correct. Appearance similarity alone can retrieve a different-looking-alike place.",
          ],
          [
            "It removes the need for a map",
            "Loop constraints operate within a map or trajectory graph.",
          ],
        ],
        [
          "Bag-of-words proposes a likely place from appearance.",
          "Geometric inliers test spatial consistency between the frames.",
        ],
        "Use coarse retrieval for speed and geometry for acceptance.",
        "6.5",
        92,
      ),
      causal: p(
        "causal",
        "intermediate",
        "What should pose-graph optimization do to the 14.2 m endpoint discrepancy?",
        ["ch6-visual"],
        1,
        [
          [
            "Assign the full correction to one arbitrary frame",
            "That creates an unrealistic trajectory discontinuity.",
          ],
          [
            "Distribute correction across poses according to constraints and uncertainty",
            "Correct. Optimization seeks a globally consistent trajectory.",
          ],
          [
            "Increase the discrepancy because the loop is verified",
            "The loop constraint should reduce inconsistency.",
          ],
          [
            "Delete all frame-to-frame measurements",
            "Local constraints still describe route shape.",
          ],
        ],
        [
          "The graph contains local motion constraints plus a start-end loop.",
          "Optimization balances them rather than discarding either set.",
        ],
        "Global constraints correct accumulated drift coherently.",
        "6.5",
        92,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A cleaning robot returns to its dock but its map says it is 5 m away. Which response transfers?",
        ["ch6-visual", "ch6-relocalization"],
        0,
        [
          [
            "Verify the dock as a known place and optimize accumulated trajectory drift",
            "Correct. A trusted revisit supplies a global loop constraint.",
          ],
          [
            "Move the physical dock to the estimated pose",
            "The map estimate, not the dock, is inconsistent.",
          ],
          [
            "Ignore the dock because odometry is continuous",
            "Continuous odometry can drift.",
          ],
          [
            "Set every map point to the robot's final pose",
            "That collapses the map rather than correcting it.",
          ],
        ],
        [
          "The known dock is analogous to the verified start keyframe.",
          "Its revisit can constrain the full trajectory.",
        ],
        "Loop-closure reasoning transfers to indoor SLAM.",
        "6.5",
        92,
      ),
    },
  ),
  c(
    "kalman-weighting",
    {
      kind: "table",
      caption: "One-dimensional position update",
      columns: ["Source", "Estimate", "Std. dev."],
      rows: [
        ["motion prediction", "10.0 m", "0.4 m"],
        ["LiDAR measurement", "10.3 m", "0.2 m"],
        ["camera measurement", "11.2 m", "1.5 m"],
      ],
    },
    {
      application: p(
        "application",
        "intermediate",
        "Where should a consistency-aware fused estimate lie?",
        ["ch6-fusion"],
        1,
        [
          [
            "Exactly 11.2 m because camera is the latest row",
            "Latest position in a table does not imply highest precision.",
          ],
          [
            "Near 10.2-10.3 m, weighted toward LiDAR and prediction",
            "Correct. Their uncertainties are much smaller and their estimates agree.",
          ],
          [
            "At the unweighted mean of all three values",
            "Equal averaging ignores the stated uncertainty.",
          ],
          [
            "At 0 m because estimates disagree",
            "Disagreement does not imply a zero position.",
          ],
        ],
        [
          "LiDAR is the most precise observation and agrees with prediction.",
          "The noisy camera should influence the result less.",
        ],
        "Fusion weights measurements by uncertainty and consistency.",
        "6.6",
        94,
      ),
      diagnosis: p(
        "diagnosis",
        "advanced",
        "A fusion output lands at 10.5 m, the simple mean. What design flaw is most likely?",
        ["ch6-fusion"],
        2,
        [
          [
            "It used a nonlinear vehicle model",
            "The exact simple mean indicates equal arithmetic weighting more directly.",
          ],
          [
            "It applied an inverse map transform",
            "A frame error would not specifically produce the mean of these values.",
          ],
          [
            "It ignored the unequal measurement covariance",
            "Correct. Equal weighting gives the noisy camera too much influence.",
          ],
          [
            "It rejected the camera as an outlier",
            "Rejecting camera would produce a value near 10.15 m.",
          ],
        ],
        [
          "The arithmetic mean of 10.0, 10.3, and 11.2 is 10.5.",
          "A proper uncertainty-aware result remains near the first two values.",
        ],
        "Estimator weights should be traceable to declared uncertainty.",
        "6.6",
        94,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which measurement should have the largest influence, assuming the uncertainties are calibrated?",
        ["ch6-fusion"],
        3,
        [
          [
            "Camera, because its number is largest",
            "Magnitude does not determine reliability.",
          ],
          [
            "Prediction, because models are always exact",
            "Prediction has nonzero uncertainty.",
          ],
          [
            "All three equally, because they measure position",
            "Their stated precision differs strongly.",
          ],
          [
            "LiDAR, because it has the smallest standard deviation",
            "Correct. Smaller variance corresponds to greater weight in a Kalman-style update.",
          ],
        ],
        [
          "The table supplies uncertainty for each source.",
          "LiDAR's 0.2-meter standard deviation is smallest.",
        ],
        "Measurement influence follows information, not recency or magnitude.",
        "6.6",
        94,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If camera uncertainty falls from 1.5 m to 0.15 m after better calibration, what should change?",
        ["ch6-fusion"],
        0,
        [
          [
            "The camera should receive more weight if its innovations remain credible",
            "Correct. Lower calibrated uncertainty represents more information.",
          ],
          [
            "LiDAR must be removed from the estimator",
            "Complementary data can still improve robustness.",
          ],
          [
            "The fused estimate must equal 11.2 m exactly",
            "Prediction and LiDAR retain nonzero influence.",
          ],
          [
            "Motion prediction uncertainty becomes zero",
            "Camera calibration does not change model process noise.",
          ],
        ],
        [
          "Kalman gain depends on relative uncertainty.",
          "A more precise camera measurement should move the update more strongly.",
        ],
        "Improved measurement quality changes fusion quantitatively, not absolutely.",
        "6.6",
        94,
      ),
      transfer: p(
        "transfer",
        "intermediate",
        "A wearable fuses a precise step counter and a noisy indoor beacon. Which lesson transfers?",
        ["ch6-fusion"],
        2,
        [
          [
            "Always trust the beacon because it is absolute",
            "Absolute measurements can still be noisy or biased.",
          ],
          [
            "Average both equally regardless of quality",
            "Equal weighting discards uncertainty information.",
          ],
          [
            "Weight the update by calibrated uncertainty and consistency",
            "Correct. Relative and absolute evidence should contribute according to information.",
          ],
          [
            "Set position to the device serial number",
            "Identifier data is unrelated to location.",
          ],
        ],
        [
          "The sources provide complementary motion and position information.",
          "Uncertainty-aware fusion balances their strengths.",
        ],
        "Kalman weighting principles transfer to personal localization.",
        "6.6",
        94,
      ),
    },
  ),
  c(
    "kalman-outlier",
    {
      kind: "log",
      caption: "Fusion innovations",
      lines: [
        "predicted x: 48.2 m, sigma: 0.5 m",
        "LiDAR x: 48.5 m",
        "camera x: 48.0 m",
        "GPS x: 71.4 m",
        "GPS reports sigma: 0.4 m",
        "urban canyon detected",
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which estimator response best handles the GPS claim?",
        ["ch6-fusion", "ch6-gps"],
        3,
        [
          [
            "Trust GPS fully because its reported sigma is smallest",
            "A sensor-reported covariance can be overconfident under multipath.",
          ],
          [
            "Average GPS equally with LiDAR and camera",
            "The grossly inconsistent value would corrupt the estimate.",
          ],
          [
            "Reject every future GPS measurement forever",
            "The current outlier does not justify permanent exclusion.",
          ],
          [
            "Innovation-gate the GPS and inflate or adapt its uncertainty in this context",
            "Correct. Cross-sensor consistency contradicts the reported confidence.",
          ],
        ],
        [
          "GPS differs by more than 23 meters while other evidence agrees within 0.5 meter.",
          "Urban canyon context supports a temporary multipath outlier.",
        ],
        "Robust fusion checks empirical consistency, not only declared covariance.",
        "6.6",
        94,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "What is inconsistent about the GPS measurement model?",
        ["ch6-fusion"],
        1,
        [
          [
            "Its position is expressed in meters",
            "Meters are appropriate after coordinate conversion.",
          ],
          [
            "It claims low uncertainty despite a huge innovation against consistent evidence",
            "Correct. The covariance does not describe observed error in this condition.",
          ],
          [
            "It provides an absolute position",
            "Absolute position is the intended measurement.",
          ],
          [
            "It arrives in an urban area",
            "Context raises suspicion but the innovation reveals the inconsistency.",
          ],
        ],
        [
          "A 0.4-meter sigma predicts measurements near the state.",
          "A 23-meter discrepancy is extraordinarily unlikely under that model.",
        ],
        "Calibrate uncertainty across the conditions where a sensor operates.",
        "6.6",
        94,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which evidence pair provides the strongest immediate cross-check?",
        ["ch6-fusion"],
        0,
        [
          [
            "LiDAR and camera agree near the motion prediction",
            "Correct. Independent local observations support the same state.",
          ],
          [
            "GPS position and its own reported sigma",
            "A sensor cannot independently validate its own overconfidence.",
          ],
          [
            "Urban-canyon label and map file size",
            "File size does not observe position.",
          ],
          [
            "Vehicle speed and dashboard brightness",
            "Brightness is unrelated to pose.",
          ],
        ],
        [
          "Three sources cluster around 48 meters.",
          "Their agreement makes the isolated GPS jump less plausible.",
        ],
        "Independent agreement is powerful outlier evidence.",
        "6.6",
        94,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If the filter accepts the GPS with high weight, what effect is most likely?",
        ["ch6-fusion"],
        2,
        [
          [
            "The estimate remains near 48.3 m",
            "High GPS weight would pull it strongly away.",
          ],
          [
            "LiDAR range becomes physically longer",
            "Fusion output does not change raw LiDAR measurements.",
          ],
          [
            "The fused pose jumps toward the wrong GPS location and may misplace planning",
            "Correct. An overconfident outlier can dominate the state.",
          ],
          [
            "Urban buildings stop reflecting signals",
            "Estimator choice cannot alter the environment.",
          ],
        ],
        [
          "Kalman updates move the state toward high-confidence measurements.",
          "Here that measurement is a large outlier.",
        ],
        "Overconfident measurement models can turn one sensor failure into a system failure.",
        "6.6",
        94,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A temperature controller receives one sensor reading 40 C above three agreeing sensors, but it reports high confidence. Which lesson transfers?",
        ["ch6-fusion"],
        1,
        [
          [
            "Trust the self-reported confidence over all consistency evidence",
            "Confidence can be miscalibrated under failure.",
          ],
          [
            "Gate the innovation and investigate condition-dependent sensor fault",
            "Correct. Independent agreement and physical plausibility justify robust handling.",
          ],
          [
            "Average the outlier equally to be fair to every sensor",
            "Sensors should be weighted by reliability, not social fairness.",
          ],
          [
            "Raise the target temperature to match the outlier",
            "Changing the goal hides rather than diagnoses the sensor fault.",
          ],
        ],
        [
          "The measurement conflicts dramatically with independent evidence.",
          "Robust estimation tests innovations before control uses them.",
        ],
        "Outlier-gating principles transfer to many sensor-control systems.",
        "6.6",
        94,
      ),
    },
  ),
  c(
    "nonlinear-fusion",
    {
      kind: "scenario",
      text: "A vehicle estimates x, y, speed, and heading while turning sharply. The motion update contains sine and cosine of heading. A basic linear filter consistently cuts the corner and reports innovations with curved structure.",
    },
    {
      application: p(
        "application",
        "advanced",
        "Which estimator change most directly addresses the stated model mismatch?",
        ["ch6-fusion"],
        2,
        [
          [
            "Keep the linear model and force covariance smaller",
            "Greater confidence cannot repair incorrect dynamics.",
          ],
          [
            "Delete heading from the state",
            "Heading is essential to turning motion.",
          ],
          [
            "Use an EKF/UKF-style nonlinear update and validate its assumptions",
            "Correct. The motion relation is explicitly nonlinear.",
          ],
          [
            "Average every pose without a motion model",
            "That discards useful temporal structure.",
          ],
        ],
        [
          "Sine and cosine make state evolution nonlinear.",
          "A nonlinear filter approximates or propagates that relationship rather than ignoring it.",
        ],
        "Match the estimator family to the state and measurement models.",
        "6.6",
        96,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "What symptom most strongly points to model mismatch rather than random zero-mean noise?",
        ["ch6-fusion"],
        0,
        [
          [
            "A repeatable corner-cutting bias tied to sharp turns",
            "Correct. Structured error varies systematically with the nonlinear maneuver.",
          ],
          [
            "Different individual sensor readings",
            "Random variation is expected even under a good model.",
          ],
          [
            "The state contains four values",
            "State dimension alone does not imply failure.",
          ],
          [
            "The vehicle sometimes travels straight",
            "Straight motion does not explain turn-specific bias.",
          ],
        ],
        [
          "The error repeats in the same maneuver class.",
          "Its curved innovation pattern follows neglected turn dynamics.",
        ],
        "Residual structure can reveal a wrong process model.",
        "6.6",
        96,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "When is the classic linear Kalman filter most defensible?",
        ["ch6-fusion"],
        3,
        [
          [
            "When every model is strongly nonlinear and discontinuous",
            "That violates its main assumption.",
          ],
          [
            "When uncertainty is never measured",
            "Kalman weighting requires covariance models.",
          ],
          [
            "When sensors provide no observations",
            "Without updates, it only propagates a model.",
          ],
          [
            "When dynamics and measurements are adequately linear with near-Gaussian noise",
            "Correct. Those match the classic filter assumptions described in the chapter.",
          ],
        ],
        [
          "The standard filter derives optimal linear-Gaussian updates.",
          "Nonlinear variants are used when those relationships are not adequate.",
        ],
        "Estimator simplicity is justified by model fit, not habit.",
        "6.6",
        96,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If turn rates become small enough for a local linear approximation, what may happen?",
        ["ch6-fusion"],
        1,
        [
          [
            "Heading becomes physically meaningless",
            "Heading still defines motion direction.",
          ],
          [
            "Linearization error may shrink and the simpler filter may perform adequately",
            "Correct. Mild curvature can be approximated locally.",
          ],
          [
            "All sensor noise becomes zero",
            "Motion regime does not eliminate measurement noise.",
          ],
          [
            "GPS blockage disappears",
            "Turning rate is unrelated to signal availability.",
          ],
        ],
        [
          "Nonlinearity matters through the region traversed by the state.",
          "Small changes can make a local linear approximation more accurate.",
        ],
        "Model adequacy depends on operating regime as well as equation form.",
        "6.6",
        96,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A radar tracks an aircraft using range and bearing, which are nonlinear functions of Cartesian position. Which lesson transfers?",
        ["ch6-fusion"],
        0,
        [
          [
            "Use a nonlinear measurement update or transformation and check consistency",
            "Correct. The observation geometry violates a direct linear model.",
          ],
          [
            "Treat range as x and bearing as y",
            "Those quantities have different geometry and units.",
          ],
          [
            "Remove uncertainty because radar is precise",
            "Precise sensors still have noise and nonlinear mapping.",
          ],
          [
            "Ignore temporal motion during turns",
            "Aircraft dynamics remain essential.",
          ],
        ],
        [
          "The measurement relation contains nonlinear coordinate conversion.",
          "A suitable filter accounts for that geometry.",
        ],
        "Nonlinear fusion principles transfer to tracking systems broadly.",
        "6.6",
        96,
      ),
    },
  ),
  c(
    "tracking-and-recovery",
    {
      kind: "table",
      caption: "Localization modes",
      columns: ["Mode", "Rate", "Search scope", "Current state"],
      rows: [
        ["local tracker", "20 Hz", "near predicted pose", "covariance rising"],
        ["global relocalizer", "1 Hz", "all keyframes", "candidate found"],
        ["controller", "50 Hz", "uses current pose", "active"],
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which mode transition is safest after covariance crosses its limit?",
        ["ch6-architecture", "ch6-relocalization"],
        1,
        [
          [
            "Keep full-speed control on the uncertain local pose indefinitely",
            "That lets a degraded estimate drive physical motion.",
          ],
          [
            "Enter a degraded safe behavior, validate the global candidate, then reinitialize local tracking",
            "Correct. It coordinates risk containment with coarse-to-fine recovery.",
          ],
          [
            "Run only the controller because it has the highest rate",
            "High rate does not create accurate pose evidence.",
          ],
          [
            "Average every keyframe into one pose",
            "Distinct locations cannot be averaged meaningfully.",
          ],
        ],
        [
          "The local tracker has declared excessive uncertainty.",
          "Global recovery can propose a new pose, but it must be verified before resuming normal control.",
        ],
        "Localization architecture needs explicit health-driven mode transitions.",
        "6.1",
        84,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "Why should the 1 Hz relocalizer not replace the 20 Hz tracker during normal operation?",
        ["ch6-architecture"],
        3,
        [
          [
            "Global descriptors contain no place information",
            "They are designed for place retrieval.",
          ],
          [
            "The tracker cannot use an initialized pose",
            "Local tracking explicitly benefits from one.",
          ],
          [
            "Control needs only one pose per minute",
            "Dynamic control requires frequent updates.",
          ],
          [
            "Global search is coarser and slower, while control needs high-rate precise pose",
            "Correct. The modules solve complementary operating modes.",
          ],
        ],
        [
          "The relocalizer searches a large database and supplies a candidate.",
          "The tracker maintains precise temporal continuity at a much higher rate.",
        ],
        "Use specialized global and local estimators together.",
        "6.1",
        84,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which signal should trigger global recovery more directly than elapsed clock time?",
        ["ch6-architecture"],
        0,
        [
          [
            "Tracking uncertainty or consistency exceeding a validated threshold",
            "Correct. It reflects estimator health.",
          ],
          [
            "The dashboard theme changing color",
            "Interface style does not measure pose quality.",
          ],
          [
            "A fixed hourly schedule regardless of localization quality",
            "Recovery need depends on state, not the wall clock alone.",
          ],
          [
            "The number of passengers",
            "Passenger count does not directly observe localization health.",
          ],
        ],
        [
          "The architecture should switch when local evidence becomes unreliable.",
          "Covariance and residual checks measure that condition.",
        ],
        "Mode transitions should follow health evidence.",
        "6.8",
        97,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If global search runs continuously at maximum rate on the same processor, what risk can increase?",
        ["ch6-architecture"],
        2,
        [
          [
            "The map becomes globally unique",
            "More search does not eliminate aliasing.",
          ],
          [
            "Local pose updates become automatically more accurate",
            "They may instead lose compute time.",
          ],
          [
            "Compute contention can delay the high-rate tracker and control inputs",
            "Correct. A recovery service can harm nominal deadlines if not scheduled carefully.",
          ],
          [
            "GPS satellites stop transmitting",
            "Processor scheduling cannot affect satellites.",
          ],
        ],
        [
          "Global retrieval is more computationally expensive than local tracking.",
          "Unbounded execution can compete with time-critical tasks.",
        ],
        "Recovery capability must fit the real-time system budget.",
        "6.7",
        96,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A mobile AR system has fast frame tracking and a slow place recognizer. Which architecture transfers best?",
        ["ch6-architecture"],
        3,
        [
          [
            "Use slow place recognition for every display frame",
            "Its rate cannot meet smooth rendering needs.",
          ],
          [
            "Never run place recognition after tracking loss",
            "Then the system cannot recover globally.",
          ],
          [
            "Trust a lost local tracker forever",
            "Local propagation can drift without bound.",
          ],
          [
            "Track locally at high rate and invoke verified global recovery when health degrades",
            "Correct. It combines responsiveness and robustness.",
          ],
        ],
        [
          "Both systems need frequent local motion and occasional global correction.",
          "Health-based switching coordinates the two.",
        ],
        "Dual-rate localization architecture transfers to AR and robotics.",
        "6.1",
        84,
      ),
    },
  ),
  c(
    "uncertainty-fallback",
    {
      kind: "log",
      caption: "Pose health monitor",
      lines: [
        "position sigma: 0.18 -> 0.42 -> 0.91 -> 1.60 m",
        "lane half-width: 1.75 m",
        "map-match residual: increasing",
        "global recovery: no verified candidate",
        "vehicle speed: 50 km/h",
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which immediate behavior best follows from the health trend?",
        ["ch6-architecture"],
        0,
        [
          [
            "Reduce risk and execute a validated minimal-risk stop while seeking recovery",
            "Correct. Uncertainty approaches lane scale and no replacement pose is verified.",
          ],
          [
            "Maintain speed until sigma exceeds the entire road width",
            "Waiting consumes physical margin and can misplace the vehicle earlier.",
          ],
          [
            "Set sigma back to 0.18 m in software",
            "Changing a reported number does not restore information.",
          ],
          [
            "Select an unverified global candidate at random",
            "A wrong global jump can be worse than a controlled stop.",
          ],
        ],
        [
          "Pose uncertainty and residuals are worsening monotonically.",
          "At road speed, the system should contain risk before lane-level ambiguity.",
        ],
        "Localization health must drive a physical fallback, not only a warning.",
        "6.8",
        97,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "Why is lane half-width relevant to the uncertainty threshold?",
        ["ch6-architecture"],
        2,
        [
          [
            "It determines GPS satellite count",
            "Road width does not control signal availability.",
          ],
          [
            "It makes every lane exactly safe",
            "Lane geometry is a constraint, not a guarantee.",
          ],
          [
            "Position error of that scale can place the estimated vehicle in the wrong lateral region",
            "Correct. The uncertainty becomes large relative to the control corridor.",
          ],
          ["It sets camera exposure time", "Camera exposure is unrelated."],
        ],
        [
          "Planning and control rely on lane-relative position.",
          "Uncertainty near the lane scale threatens the meaning of that reference.",
        ],
        "Thresholds should connect estimator uncertainty to task geometry.",
        "6.8",
        97,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which health policy is stronger?",
        ["ch6-architecture"],
        1,
        [
          [
            "Use one universal covariance limit for every speed and road",
            "Consequence and stopping margin vary with context.",
          ],
          [
            "Validate thresholds against lane geometry, speed, residuals, and fallback distance",
            "Correct. It links statistical health to physical risk.",
          ],
          [
            "Ignore residual trends until localization stops publishing",
            "Degradation can be hazardous before total loss.",
          ],
          [
            "Trigger recovery whenever any sensor has tiny noise",
            "Small noise is not evidence of failure.",
          ],
        ],
        [
          "The same pose error has different consequence at different speeds and road widths.",
          "A contextual policy better reflects operational risk.",
        ],
        "Estimator-health limits should be safety-derived.",
        "6.8",
        97,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If speed falls substantially while pose uncertainty is unchanged, what changes?",
        ["ch6-architecture"],
        3,
        [
          [
            "The pose instantly becomes more accurate",
            "Speed reduction does not add position information.",
          ],
          [
            "Map-match residual becomes zero automatically",
            "Residual reflects geometry, not simply speed.",
          ],
          ["The lane becomes physically wider", "Road geometry is unchanged."],
          [
            "Distance consumed during detection and fallback delay decreases",
            "Correct. Lower speed adds physical response margin even though uncertainty remains.",
          ],
        ],
        [
          "Localization quality and motion consequence are separate dimensions.",
          "Slowing can reduce risk while recovery continues.",
        ],
        "A fallback can manage consequence without pretending to fix estimation.",
        "6.8",
        97,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A surgical robot's tool-pose covariance rises near a critical structure and no reliable re-registration is available. Which lesson transfers?",
        ["ch6-architecture"],
        1,
        [
          [
            "Continue because the commanded path is unchanged",
            "The path is unsafe if the tool pose is uncertain.",
          ],
          [
            "Enter a safe hold or retract behavior tied to task-scale uncertainty",
            "Correct. Physical fallback should activate before uncertainty reaches the hazard boundary.",
          ],
          [
            "Set covariance to zero to avoid alarming the operator",
            "Hidden uncertainty increases risk.",
          ],
          [
            "Choose a random registration candidate",
            "An unverified pose can cause immediate harm.",
          ],
        ],
        [
          "The estimator is losing task-relevant spatial certainty.",
          "A controlled safe state contains consequence while evidence is restored.",
        ],
        "Uncertainty-triggered fallback transfers across safety-critical robots.",
        "6.8",
        97,
      ),
    },
  ),
  c(
    "localization-evaluation",
    {
      kind: "table",
      caption: "Two localization systems",
      columns: ["Metric", "System A", "System B"],
      rows: [
        ["median error", "0.09 m", "0.14 m"],
        ["99th-percentile error", "3.8 m", "0.62 m"],
        ["lost recoveries", "4/20", "19/20"],
        ["update deadline met", "99.9%", "99.7%"],
        ["night route", "not tested", "tested"],
      ],
    },
    {
      application: p(
        "application",
        "advanced",
        "Which conclusion is most defensible for a safety-critical pilot?",
        ["ch6-architecture"],
        2,
        [
          [
            "Choose A solely because its median error is lower",
            "Its tail and recovery evidence are much worse.",
          ],
          [
            "Choose B as universally superior in all conditions",
            "One system lacks night evidence and neither table proves universality.",
          ],
          [
            "B has stronger tail and recovery evidence, but deployment still needs matched-condition testing",
            "Correct. It weighs safety-relevant metrics without overstating scope.",
          ],
          [
            "The two systems are identical because both usually meet deadlines",
            "Their error tails and recovery rates differ substantially.",
          ],
        ],
        [
          "System B sacrifices some typical accuracy for far better tail and recovery behavior.",
          "A fair decision still requires comparable condition coverage.",
        ],
        "Evaluate localization with tails, recovery, timing, and domain coverage together.",
        "6.8",
        97,
      ),
      diagnosis: p(
        "diagnosis",
        "intermediate",
        "Why can System A's 0.09 m median be misleading?",
        ["ch6-architecture"],
        3,
        [
          [
            "Median is never a valid statistic",
            "It validly describes typical error.",
          ],
          [
            "A lower number always means worse accuracy",
            "Lower typical error is usually better.",
          ],
          [
            "Deadline performance determines every position error",
            "Timing and accuracy are related but distinct.",
          ],
          [
            "Rare 3.8 m failures and poor recovery are hidden by the middle observation",
            "Correct. Safety can be dominated by tail events.",
          ],
        ],
        [
          "Half the samples lie on each side of the median.",
          "That statistic says little about severe rare errors.",
        ],
        "Typical performance cannot substitute for failure-distribution evidence.",
        "6.8",
        97,
      ),
      comparison: p(
        "comparison",
        "foundational",
        "Which added metric would best clarify operational consequence?",
        ["ch6-architecture"],
        0,
        [
          [
            "Distance and time spent outside lane-relevant error bounds",
            "Correct. It connects pose error to physical duration and geometry.",
          ],
          [
            "Number of characters in each system name",
            "Naming has no operational effect.",
          ],
          [
            "Color of the compute enclosure",
            "Enclosure color does not measure localization.",
          ],
          [
            "Total map file size without access timing",
            "Storage size alone does not show safety consequence.",
          ],
        ],
        [
          "Position errors matter through their magnitude and persistence relative to the task.",
          "Bound-exceedance duration captures that exposure.",
        ],
        "Add metrics that connect estimation error to vehicle risk.",
        "6.8",
        97,
      ),
      causal: p(
        "causal",
        "intermediate",
        "If System A gains reliable global recovery but its 99th-percentile error is unchanged, what improves?",
        ["ch6-architecture"],
        1,
        [
          [
            "Its rare error magnitude necessarily falls",
            "The question holds that percentile unchanged.",
          ],
          [
            "Time spent lost may decrease even though large deviations still occur",
            "Correct. Recovery shortens failure duration without preventing every onset.",
          ],
          [
            "Its night evidence appears automatically",
            "A new capability does not create an evaluation dataset.",
          ],
          [
            "System B's median error increases",
            "Changing A does not cause B's metric to move.",
          ],
        ],
        [
          "Recovery acts after tracking fails.",
          "It can reduce duration while leaving the initial tail error distribution similar.",
        ],
        "Separate failure prevention, magnitude, and recovery duration.",
        "6.8",
        97,
      ),
      transfer: p(
        "transfer",
        "advanced",
        "A warehouse localization benchmark reports only average position error. Which evaluation lesson transfers?",
        ["ch6-architecture"],
        3,
        [
          [
            "Average error proves safe operation near workers",
            "Averages can hide rare large deviations.",
          ],
          [
            "Recovery tests are unnecessary indoors",
            "Robots can become lost in any environment.",
          ],
          [
            "Timing never matters below road speed",
            "Control still depends on timely pose updates.",
          ],
          [
            "Measure tails, lost-state recovery, deadlines, and condition coverage",
            "Correct. These reveal failure severity, duration, responsiveness, and scope.",
          ],
        ],
        [
          "The benchmark currently describes only typical magnitude.",
          "Safety requires evidence about rare failures and operational recovery.",
        ],
        "Localization evaluation principles transfer across mobile-robot deployments.",
        "6.8",
        97,
      ),
    },
  ),
];

export const chapter6Assessment: ChapterAssessment = {
  chapterId: 6,
  objectives,
  cases,
};
