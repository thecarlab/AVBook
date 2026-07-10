import type { ChapterAssessment } from "../types";

type AssessmentCase = ChapterAssessment["cases"][number];
type AssessmentProbe = AssessmentCase["probes"]["application"];
type CognitiveSkill = keyof AssessmentCase["probes"];
type QuizDifficulty = AssessmentProbe["difficulty"];
type ChoiceSpec = readonly [text: string, feedback: string, misconception?: string];
type FourChoices = readonly [ChoiceSpec, ChoiceSpec, ChoiceSpec, ChoiceSpec];

const CHOICE_IDS = ["a", "b", "c", "d"] as const;

function probe(
  skill: CognitiveSkill,
  difficulty: QuizDifficulty,
  prompt: string,
  objectiveIds: [string, ...string[]],
  correctIndex: 0 | 1 | 2 | 3,
  choiceSpecs: FourChoices,
  reasoning: [string, ...string[]],
  takeaway: string,
  section: string,
  page: number,
): AssessmentProbe {
  const choices = choiceSpecs.map(([text, feedback, misconception], index) => ({
    id: CHOICE_IDS[index],
    text,
    feedback,
    misconception,
  })) as AssessmentProbe["choices"];

  return {
    skill,
    difficulty,
    prompt,
    objectiveIds,
    choices,
    correctChoiceId: CHOICE_IDS[correctIndex],
    reasoning,
    takeaway,
    references: [{ section, page }],
  };
}

function assessmentCase(
  id: string,
  stimulus: AssessmentCase["stimulus"],
  probes: AssessmentCase["probes"],
): AssessmentCase {
  return { id, chapterId: 3, stimulus, probes };
}

const objectives: ChapterAssessment["objectives"] = [
  { id: "ch3-sensor-evidence", chapterId: 3, behavior: "Select sensor evidence by the physical quantity and operating condition a decision requires.", priority: "core", references: [{ section: "3.1-3.3", page: 33 }] },
  { id: "ch3-camera-evidence", chapterId: 3, behavior: "Reason about camera information, image quality, geometry, and environment-dependent failure modes.", priority: "core", references: [{ section: "3.2", page: 33 }] },
  { id: "ch3-range-sensors", chapterId: 3, behavior: "Compare LiDAR, radar, and ultrasonic evidence by range, geometry, velocity, resolution, and failure mode.", priority: "core", references: [{ section: "3.2", page: 34 }] },
  { id: "ch3-motion-sensors", chapterId: 3, behavior: "Combine GPS and IMU evidence while accounting for signal blockage, measurement noise, and inertial drift.", priority: "core", references: [{ section: "3.3", page: 35 }] },
  { id: "ch3-intrinsic-calibration", chapterId: 3, behavior: "Diagnose and correct camera-internal geometric errors using varied calibration observations.", priority: "core", references: [{ section: "3.4", page: 36 }] },
  { id: "ch3-extrinsic-calibration", chapterId: 3, behavior: "Diagnose cross-sensor frame errors and validate relative sensor-pose estimates.", priority: "core", references: [{ section: "3.4", page: 37 }] },
  { id: "ch3-cleaning-tradeoffs", chapterId: 3, behavior: "Choose image and point-cloud cleaning methods without erasing safety-relevant structure.", priority: "core", references: [{ section: "3.5", page: 37 }] },
  { id: "ch3-fusion-design", chapterId: 3, behavior: "Choose and evaluate low-, mid-, and high-level fusion using calibration, synchronization, uncertainty, and compute evidence.", priority: "core", references: [{ section: "3.6", page: 42 }] },
  { id: "ch3-processing-limits", chapterId: 3, behavior: "Trace latency, missing data, outliers, environmental artifacts, and compute limits into downstream risk.", priority: "core", references: [{ section: "3.7", page: 44 }] },
  { id: "ch3-dataset-reasoning", chapterId: 3, behavior: "Match dataset modalities, temporal structure, annotations, and domains to a proposed AV task and claim.", priority: "core", references: [{ section: "3.8", page: 45 }] },
  { id: "ch3-real-sim-validation", chapterId: 3, behavior: "Design real-versus-simulated sensor comparisons that control trajectory and measure meaningful modality gaps.", priority: "supporting", references: [{ section: "3.9", page: 47 }] },
];

const cases: AssessmentCase[] = [
  assessmentCase(
    "fog-closing-object",
    { kind: "log", caption: "Highway sensing at 20 m/s", lines: ["camera: vehicle confidence 0.31", "LiDAR: sparse cluster at 56-61 m", "radar: stable range 58 m; closing speed 9 m/s", "ultrasonic: no return", "planner: lane marked clear"] },
    {
      application: probe("application", "advanced", "Which immediate response best uses the available evidence?", ["ch3-sensor-evidence", "ch3-fusion-design"], 0, [
        ["Keep uncertain obstacle, slow, and seek confirmation.", "Correct. Radar supplies decision-relevant range rate while the other sensors indicate degraded, not empty, space."],
        ["Continue at 20 m/s until the camera class exceeds 0.50.", "A semantic threshold should not suppress stable collision-relevant range evidence.", "Treating low class confidence as free space"],
        ["Use the ultrasonic non-return to veto the radar track.", "Ultrasonic sensing is intended for nearby obstacles, so a distant non-return is uninformative."],
        ["Discard all sensors because their outputs differ.", "The modalities measure complementary quantities and need not produce identical records."],
      ], ["Fog weakens visual contrast and can thin LiDAR returns.", "The radar measurement directly establishes a closing object and shrinking margin."], "Act on the risk supported by complementary evidence before semantic certainty arrives.", "3.2", 35),
      diagnosis: probe("diagnosis", "intermediate", "What is the planner's most consequential interpretation error?", ["ch3-sensor-evidence", "ch3-processing-limits"], 1, [
        ["It accepts a radar range measured in meters.", "Range is a relevant quantity and its units are appropriate."],
        ["It treats weak visual evidence as a clear lane.", "Correct. Uncertain identity is not a negative occupancy measurement."],
        ["It receives data from sensors with different update formats.", "Heterogeneous formats are expected in a multisensor stack."],
        ["It notes that ultrasonic sensing has no return.", "That record is expected for an object far outside parking range."],
      ], ["Three records are compatible with an object near 58 m.", "Only the camera's semantic confidence is weak, yet the planner erases the full hypothesis."], "Keep unknown, absent, and low-confidence states distinct.", "3.7", 44),
      comparison: probe("comparison", "foundational", "Which measurement contributes most directly to an immediate longitudinal collision-risk calculation?", ["ch3-range-sensors"], 2, [
        ["Camera RGB values without a depth estimate", "Color supports recognition but does not directly provide separation and closing rate."],
        ["The number of LiDAR returns without their coordinates", "A count alone does not establish relative motion."],
        ["Radar range and closing speed", "Correct. These quantities directly support time-to-conflict reasoning."],
        ["The ultrasonic non-return", "The object is outside the short operating range of that sensor."],
      ], ["Longitudinal conflict depends on separation and relative velocity.", "Radar reports both despite the adverse visibility."], "Judge sensor value by the decision variable it supplies.", "3.2", 35),
      causal: probe("causal", "intermediate", "Why can fog produce this pattern of disagreement without any sensor being completely broken?", ["ch3-camera-evidence", "ch3-range-sensors"], 3, [
        ["Fog changes the vehicle's GPS coordinates but no optical measurements.", "GPS position is not the cause of the visual and LiDAR degradation shown."],
        ["Ultrasonic waves become the sole long-range sensing signal.", "Ultrasonic sensors remain short range."],
        ["Radar loses all Doppler information whenever image contrast falls.", "Radar uses radio waves and can retain range-rate evidence in conditions that hurt cameras."],
        ["Droplets weaken vision and LiDAR; radar may remain usable.", "Correct. The sensing mechanisms have different environment-dependent failure modes."],
      ], ["Camera, LiDAR, and radar interact with the environment through different physical signals.", "A common weather condition can therefore change their reliability unequally."], "Sensor disagreement can be expected evidence about conditions, not merely a software fault.", "3.2", 35),
      transfer: probe("transfer", "advanced", "A quarry vehicle enters dust: video contrast collapses, laser returns become intermittent, and radar reports a closing truck. Which principle transfers?", ["ch3-sensor-evidence", "ch3-fusion-design"], 0, [
        ["Keep the radar hazard, slow, and track sensor uncertainty.", "Correct. The same complementary-evidence strategy applies under dust."],
        ["Declare the road clear because two modalities are degraded.", "Two degraded modalities do not negate a credible third measurement."],
        ["Wait for ultrasonic sensing to identify the distant truck.", "The truck is beyond the appropriate range for ultrasonic sensing."],
        ["Copy the camera confidence into the radar measurement.", "Reliability should be modeled per modality rather than overwritten."],
      ], ["Dust and fog differ, but both selectively degrade optical sensing.", "A reversible response can preserve safety while evidence accumulates."], "Transfer fusion reasoning by sensing mechanism and uncertainty, not by weather label.", "3.6", 42),
    },
  ),
  assessmentCase(
    "garage-clearance",
    { kind: "table", caption: "Low-speed parking measurements", columns: ["Source", "Observation"], rows: [["front camera", "glare obscures curb edge"], ["front-left ultrasonic", "0.82 m"], ["front-right ultrasonic", "0.79 m"], ["center ultrasonic", "0.22 m for 18 consecutive frames"], ["LiDAR", "vertical column at 0.81 m"]] },
    {
      application: probe("application", "intermediate", "Which evidence should govern the next 20 cm of motion?", ["ch3-range-sensors", "ch3-fusion-design"], 1, [
        ["The camera alone, because images have the highest resolution.", "Glare has removed the relevant curb evidence from this image."],
        ["Trust agreeing side sensors; flag the frozen center reading.", "Correct. Independent nearby measurements agree on usable clearance and expose one inconsistent channel."],
        ["Long-range radar alone, because it is robust in weather.", "Radar is poorly matched to fine parking clearance and garage multipath."],
        ["The 0.22 m center value alone, because the smallest is safest.", "A persistent inconsistent value needs diagnosis; blindly accepting it can immobilize the vehicle."],
      ], ["Three measurements place nearby structure around 0.8 m.", "The center value is temporally stuck and spatially inconsistent with the scene."], "Use corroboration and sensor health, not a single extreme reading.", "3.2", 35),
      diagnosis: probe("diagnosis", "foundational", "Which observation most strongly suggests a sensor-channel fault rather than a real obstacle?", ["ch3-range-sensors", "ch3-processing-limits"], 2, [
        ["The camera suffers glare near the garage entrance.", "Glare explains degraded imagery but not the center distance record."],
        ["LiDAR detects a vertical column.", "That is consistent with the two side ultrasonic ranges."],
        ["Center stays 0.22 m while neighbors change.", "Correct. A frozen, isolated channel is characteristic of stale or faulty data."],
        ["The vehicle is moving slowly.", "Low speed is the intended operating context for ultrasonic sensing."],
      ], ["A physical obstacle would normally change range as the vehicle moves.", "The unchanged value also lacks support from adjacent sensors."], "Temporal behavior can reveal faults that one measurement cannot.", "3.7", 44),
      comparison: probe("comparison", "intermediate", "Why is ultrasonic evidence more useful here than it was in the highway fog case?", ["ch3-range-sensors"], 3, [
        ["Sound waves provide traffic-sign color in garages.", "Ultrasonic sensing supplies distance, not color semantics."],
        ["Ultrasonic sensors estimate global latitude more accurately indoors.", "They measure nearby range rather than global position."],
        ["Garage walls eliminate all echo ambiguity.", "Hard surfaces can create multipath, so ambiguity still needs handling."],
        ["The obstacles are within short range and the maneuver is low speed.", "Correct. That operating condition matches the sensor's intended strength."],
      ], ["Ultrasonic transducers provide local clearance measurements.", "Their limited range is a weakness on highways but appropriate in parking."], "A sensor's usefulness changes with range and task.", "3.2", 35),
      causal: probe("causal", "advanced", "A soft, angled panel replaces the hard column. Why might the ultrasonic return disappear even though clearance is unchanged?", ["ch3-range-sensors"], 0, [
        ["The surface deflects or absorbs the acoustic pulse.", "Correct. Echo strength depends on material and incidence angle."],
        ["The panel changes the camera focal length electronically.", "An external surface does not alter camera intrinsics."],
        ["GPS satellites stop transmitting inside all parking bays.", "GPS blockage is unrelated to this local echo mechanism."],
        ["LiDAR directly deletes all points closer than one meter.", "That behavior would depend on configuration, not the panel alone."],
      ], ["Ultrasonic distance requires a detectable returning echo.", "Material absorption and specular reflection can reduce that return."], "Range sensors can miss real objects when their signal interaction is unfavorable.", "3.2", 35),
      transfer: probe("transfer", "intermediate", "A warehouse robot docks beside shelving with centimeter-scale clearance. Which design transfers best?", ["ch3-range-sensors", "ch3-fusion-design"], 1, [
        ["Use just a distant GNSS fix to control final docking.", "Global positioning is not precise or local enough for final clearance."],
        ["Fuse proximity and geometry; detect frozen channels.", "Correct. The same local-range and health-check reasoning applies."],
        ["Disable all redundant sensors to prevent disagreement.", "Redundancy is valuable when disagreement is interpreted rather than hidden."],
        ["Treat all missing echoes as proof of open space.", "Missing returns can result from material and angle."],
      ], ["Docking and parking share low speed and short clearance.", "Independent geometry plus channel-health checks make the decision more robust."], "Transfer sensor selection by measurement scale and failure mode.", "3.6", 42),
    },
  ),
  assessmentCase(
    "urban-canyon-position",
    { kind: "log", caption: "Localization evidence between tall buildings", lines: ["GPS: position jumps 18 m east; reported accuracy 24 m", "IMU: smooth yaw rate; small persistent gyro bias", "wheel speed: 11.8 m/s, no abrupt change", "map match: GPS fix lies across two buildings", "filter covariance before update: low"] },
    {
      application: probe("application", "advanced", "How should the estimator process this update?", ["ch3-motion-sensors", "ch3-fusion-design"], 2, [
        ["Replace the fused pose with the GPS fix because global sensors cannot drift.", "GPS can be degraded by obstruction and multipath, as the reported accuracy indicates."],
        ["Ignore GPS forever and declare the IMU globally accurate.", "IMU propagation is continuous but accumulates drift without external correction."],
        ["Reject the GPS jump, propagate motion, increase uncertainty.", "Correct. The update conflicts with its own quality field and the independent motion/map evidence."],
        ["Reset wheel speed to zero so it agrees with the building location.", "Changing a healthy measurement would hide rather than resolve the inconsistency."],
      ], ["The GPS fix has poor stated accuracy and violates the map.", "IMU and wheel measurements support continuous motion, but propagation uncertainty must grow."], "Fuse measurements according to quality and consistency, not sensor name.", "3.6", 43),
      diagnosis: probe("diagnosis", "intermediate", "What estimator defect is most clearly exposed by the low pre-update covariance?", ["ch3-motion-sensors", "ch3-processing-limits"], 3, [
        ["The camera uses RGB rather than grayscale.", "No camera data participates in this log."],
        ["The wheel-speed sample rate is too high for localization.", "High-rate motion evidence is useful; no rate failure is shown."],
        ["The map contains tall buildings.", "The environment causes degradation, but covariance should represent it."],
        ["The filter is overconfident in GPS-degraded space.", "Correct. Its uncertainty does not reflect the loss of reliable global evidence."],
      ], ["Urban canyons increase GPS uncertainty and multipath risk.", "A low covariance causes an implausible fix to receive excessive authority."], "Uncertainty must respond to sensing conditions before a bad update arrives.", "3.7", 44),
      comparison: probe("comparison", "foundational", "Which comparison best explains why GPS and IMU are complementary?", ["ch3-motion-sensors"], 0, [
        ["GPS gives degradable global fixes; IMU drifts continuously.", "Correct. Their error behaviors can constrain one another."],
        ["GPS and IMU both measure image color but at different resolutions.", "Neither sensor's primary role is image formation."],
        ["IMU is globally bounded while GPS error generally grows.", "This reverses their typical long-term behavior."],
        ["GPS is useful just in tunnels and IMU just under open sky.", "Their relative strengths are generally the opposite."],
      ], ["Satellite fixes provide an external spatial reference.", "Inertial measurements bridge gaps at high rate but integrate bias."], "Complementary error behavior is a central reason to fuse sensors.", "3.3", 35),
      causal: probe("causal", "intermediate", "If GPS remains unavailable for ten minutes, what effect should be expected even with smooth IMU measurements?", ["ch3-motion-sensors"], 1, [
        ["The IMU becomes an absolute geographic reference after enough samples.", "Integration does not create an external global reference."],
        ["Small acceleration and gyro biases accumulate into growing pose error.", "Correct. Persistent bias integrates into velocity, position, and heading drift."],
        ["Radar Doppler directly recalibrates the IMU without landmarks.", "No such correction is guaranteed by radar alone."],
        ["The vehicle's true motion stops when satellite messages stop.", "Sensor availability does not determine physical motion."],
      ], ["IMU outputs are relative motion measurements.", "Repeated integration turns a small systematic bias into increasing state error."], "Smooth inertial output can still be steadily wrong.", "3.3", 35),
      transfer: probe("transfer", "advanced", "An indoor drone loses external beacons but retains an IMU and optical odometry. Which response transfers?", ["ch3-motion-sensors", "ch3-fusion-design"], 2, [
        ["Hold covariance fixed because two local sensors remain.", "Both local estimates can drift, so uncertainty should evolve."],
        ["Replace all motion estimates with the last beacon coordinate.", "A frozen position conflicts with continuing flight."],
        ["Propagate locally; validate later beacons by consistency.", "Correct. This mirrors GPS-denied fusion behavior."],
        ["Infer global truth from motor commands alone.", "Commands do not prove realized motion in disturbances."],
      ], ["The drone has continuous relative evidence but temporarily lacks a global anchor.", "Reacquisition should correct drift without blindly accepting an outlier."], "The global-fix versus local-drift tradeoff transfers across mobile robots.", "3.6", 43),
    },
  ),
  assessmentCase(
    "intrinsic-edge-residuals",
    { kind: "table", caption: "Checkerboard reprojection residuals", columns: ["Image region", "Mean residual", "Direction"], rows: [["center", "0.4 px", "mixed"], ["mid-radius", "2.1 px", "outward"], ["corners", "7.8 px", "outward"], ["all poses", "same radial pattern", "repeatable"]] },
    {
      application: probe("application", "intermediate", "Which recalibration plan most directly addresses the pattern?", ["ch3-intrinsic-calibration"], 3, [
        ["Move the LiDAR bracket without collecting new camera images.", "The residual exists within camera images and does not implicate another sensor frame."],
        ["Change the GPS datum used by the route planner.", "A geographic reference cannot correct image-plane distortion."],
        ["Use one checkerboard image centered in the frame.", "Center-only observations poorly constrain edge distortion."],
        ["Calibrate intrinsics from varied, image-spanning poses.", "Correct. Diverse coverage supplies the geometry needed to constrain camera intrinsics."],
      ], ["Residual magnitude grows with image radius in a repeatable pattern.", "Intrinsic calibration models focal geometry, principal point, and lens distortion."], "Calibration observations should excite every parameter that must be estimated.", "3.4", 36),
      diagnosis: probe("diagnosis", "foundational", "Which fault class best matches the evidence?", ["ch3-intrinsic-calibration", "ch3-extrinsic-calibration"], 0, [
        ["Camera distortion is under-modeled.", "Correct. Radial residuals tied to image location are characteristic of an internal camera model error."],
        ["The camera-to-LiDAR translation is wrong.", "No cross-sensor overlay is involved, and an extrinsic shift would not create this radial image pattern."],
        ["Radar Doppler has the wrong sign.", "Radar is absent from the evidence."],
        ["The IMU clock is delayed.", "A time offset would depend on motion rather than image radius."],
      ], ["The same pattern occurs across target poses.", "Error is small near the center and increases toward the optical periphery."], "Use the structure of residuals to separate intrinsic, extrinsic, and temporal faults.", "3.4", 36),
      comparison: probe("comparison", "intermediate", "How would a pure camera-to-LiDAR extrinsic error usually differ from this fault?", ["ch3-intrinsic-calibration", "ch3-extrinsic-calibration"], 1, [
        ["It would directly change the camera's lens distortion coefficients.", "Extrinsics do not alter the internal lens model."],
        ["Cross-sensor misregistration, not a camera-only radial pattern.", "Correct. Extrinsics govern relative pose between sensors."],
        ["It would appear just as random pixel noise with zero structure.", "Rigid pose errors produce systematic cross-modal displacement."],
        ["It would be visible just in GPS latitude.", "Extrinsic camera-LiDAR alignment is unrelated to geographic latitude."],
      ], ["Intrinsics map rays to pixels inside one camera.", "Extrinsics map coordinates between different mounted sensors."], "Identify whether an error lives within a sensor or between sensor frames.", "3.4", 37),
      causal: probe("causal", "advanced", "Why would collecting all checkerboard images near the frame center preserve this failure?", ["ch3-intrinsic-calibration"], 2, [
        ["The camera cannot detect any checkerboard corners near its center.", "Center corners are detectable; they are simply less informative about peripheral distortion."],
        ["Central images change the LiDAR pulse frequency.", "LiDAR is not part of intrinsic camera calibration."],
        ["Central poses poorly constrain edge distortion.", "Correct. Parameter observability depends on spatially varied target coverage."],
        ["A centered target forces the principal point to equal GPS north.", "Image and geographic reference frames are unrelated here."],
      ], ["The reported center residual is already small.", "Without edge observations, several distortion settings can fit the central data similarly."], "A low training residual is weak evidence when calibration coverage is narrow.", "3.4", 36),
      transfer: probe("transfer", "intermediate", "A replacement lens is installed without moving the camera housing. What should be revalidated first?", ["ch3-intrinsic-calibration", "ch3-extrinsic-calibration"], 3, [
        ["Just the radar-to-vehicle transform", "The radar mount was not changed."],
        ["Just the GPS satellite ephemeris", "Lens replacement does not alter satellite data."],
        ["Nothing, because the external camera pose is unchanged", "A new lens can change focal length and distortion even when the housing stays fixed."],
        ["Calibrate intrinsics; verify cross-sensor projection.", "Correct. Internal optics changed, and downstream fusion should be revalidated."],
      ], ["Extrinsic pose may remain mechanically similar.", "The new optical system changes how rays map to pixels."], "Maintenance can invalidate one calibration layer while leaving another nominally unchanged.", "3.4", 36),
    },
  ),
  assessmentCase(
    "camera-lidar-rigid-offset",
    { kind: "log", caption: "Cross-modal overlay after maintenance", lines: ["camera-only lane detector: stable", "LiDAR-only wall fit: stable", "projected points: shifted right on every static wall", "shift increases predictably with depth", "timestamps: synchronized within 2 ms", "mounting bracket: removed and reinstalled yesterday"] },
    {
      application: probe("application", "advanced", "What is the most defensible recovery procedure?", ["ch3-extrinsic-calibration"], 0, [
        ["Calibrate the camera-LiDAR transform using shared features.", "Correct. The individual sensors are healthy, but their relative pose is no longer supported."],
        ["Denoise the camera until LiDAR points move left.", "Image denoising cannot change the coordinate transform used for projection."],
        ["Replace GPS latitude with the wall's pixel column.", "Geographic position is not the missing cross-sensor relation."],
        ["Increase the fusion confidence threshold and keep the old transform.", "A threshold hides evidence without repairing geometry."],
      ], ["Static structures are systematically displaced despite synchronized timestamps.", "The bracket intervention directly threatens relative sensor pose."], "Re-estimate the parameter class implicated by maintenance and residual structure.", "3.4", 37),
      diagnosis: probe("diagnosis", "intermediate", "Which explanation best fits all lines of the log?", ["ch3-extrinsic-calibration"], 1, [
        ["Both sensors independently fail in exactly compensating ways.", "Their standalone outputs remain stable, making two coordinated failures less plausible."],
        ["The reinstalled bracket changed the camera-LiDAR transform.", "Correct. A rigid, scene-wide cross-modal shift follows naturally."],
        ["The camera's RGB channels are permuted.", "Channel order would affect color, not point projection geometry."],
        ["An IMU bias moved all walls in the world.", "The test is on static geometry and timestamps are synchronized."],
      ], ["The failure appears only when data are expressed in a common frame.", "Mechanical reinstallation is a direct cause of relative-pose change."], "Healthy component outputs do not prove healthy calibration between components.", "3.4", 37),
      comparison: probe("comparison", "foundational", "Which observation most clearly separates this fault from camera lens distortion?", ["ch3-intrinsic-calibration", "ch3-extrinsic-calibration"], 2, [
        ["The camera records digital images.", "Both correctly and incorrectly calibrated cameras do so."],
        ["The scene contains walls at different depths.", "Depth helps analyze the error but is not alone decisive."],
        ["Only cross-sensor overlays shift.", "Correct. That localizes the problem between frames rather than within the camera model."],
        ["The vehicle was serviced yesterday.", "Maintenance is a clue, but the cross-modal residual is stronger direct evidence."],
      ], ["Intrinsic faults alter camera image geometry itself.", "Here the camera and LiDAR are individually consistent and disagree only after transformation."], "Compare standalone and fused outputs to localize calibration faults.", "3.4", 37),
      causal: probe("causal", "intermediate", "Why can a small bracket rotation create larger pixel error for some projected structures?", ["ch3-extrinsic-calibration"], 3, [
        ["Rotation changes the radar carrier frequency.", "Radar is not involved in this projection."],
        ["All LiDAR points receive the same physical depth.", "The points retain different depths."],
        ["Pixel coordinates cannot depend on camera focal geometry.", "Projection explicitly depends on focal parameters and transformed direction."],
        ["Angular error becomes depth-dependent pixel displacement.", "Correct. A small pose error can have nonuniform image consequences."],
      ], ["Extrinsic rotation changes where a 3D point lies in the camera frame.", "Perspective projection turns the changed direction and depth into pixel error."], "Mechanical tolerances can be small yet perceptually consequential.", "3.4", 37),
      transfer: probe("transfer", "advanced", "A radar unit is replaced and radar tracks no longer coincide with camera detections. What transfers from this case?", ["ch3-extrinsic-calibration", "ch3-fusion-design"], 0, [
        ["Validate radar-camera timing and pose on common targets.", "Correct. Replacement can invalidate both temporal and spatial relations."],
        ["Copy the previous LiDAR transform because all range sensors share one pose.", "Each physical sensor has its own mounting transform."],
        ["Raise camera resolution until radar coordinates change.", "Resolution cannot repair radar-camera geometry."],
        ["Assume correct fusion if both devices power on.", "Operational hardware can still be mutually miscalibrated."],
      ], ["The failure occurs at the interface between two healthy modalities.", "A common-target validation tests the actual association geometry."], "Cross-sensor calibration must follow the installed hardware, not a sensor category.", "3.6", 42),
    },
  ),
  assessmentCase(
    "moving-object-time-offset",
    { kind: "log", caption: "Camera-LiDAR overlay at a crosswalk", lines: ["camera frame: 12:00:04.100", "LiDAR sweep midpoint: 12:00:04.000", "static poles: aligned within 3 px", "cyclist at 8 m/s: LiDAR cluster trails image by 0.8 m", "extrinsic target test: passed"] },
    {
      application: probe("application", "advanced", "What change should the team test first?", ["ch3-fusion-design", "ch3-processing-limits"], 1, [
        ["Re-estimate camera distortion from the moving cyclist.", "Static image geometry and the target test do not implicate intrinsics."],
        ["Align sensing time and compensate supported motion.", "Correct. The 100 ms offset predicts the cyclist's 0.8 m displacement."],
        ["Delete all moving-object returns before fusion.", "That would remove the safety-relevant evidence rather than align it."],
        ["Increase display resolution while retaining the timestamps.", "More pixels do not remove a temporal offset."],
      ], ["The spatial residual equals speed multiplied by timestamp separation.", "Static poles align because they do not expose the same motion-dependent error."], "Treat timestamps as part of sensor geometry when the world moves.", "3.6", 42),
      diagnosis: probe("diagnosis", "intermediate", "Which failure best explains aligned poles but a trailing cyclist cluster?", ["ch3-fusion-design"], 2, [
        ["A constant camera-LiDAR translation error", "A rigid translation would also displace static poles."],
        ["Camera color-channel noise", "Color noise does not create a speed-proportional point-cloud lag."],
        ["A cross-sensor timestamp offset", "Correct. Motion exposes a delay that static landmarks largely conceal."],
        ["GPS latitude quantization", "Global position quantization does not match this local overlay pattern."],
      ], ["The error is selective for moving structure.", "Its magnitude agrees with the logged speed and 0.1 s separation."], "Use residual structure, not just residual magnitude, to distinguish spatial and temporal calibration.", "3.7", 44),
      comparison: probe("comparison", "foundational", "Which validation scene is most informative after the timing fix?", ["ch3-fusion-design"], 3, [
        ["A blank wall recorded by one sensor", "It cannot test cross-modal timing."],
        ["A parked vehicle observed once", "A static object weakly exposes timing error."],
        ["A checkerboard photographed with the LiDAR off", "That can support camera intrinsics but not synchronization."],
        ["Known-speed objects plus static landmarks", "Correct. Static landmarks check pose while motion reveals remaining time-dependent residuals."],
      ], ["A good test separates the competing causes.", "Varying speed should vary a timing residual but not a rigid-pose residual."], "Validation stimuli should excite the error mode being tested.", "3.6", 43),
      causal: probe("causal", "intermediate", "Why does a 100 ms mismatch become more dangerous as object speed increases?", ["ch3-processing-limits"], 0, [
        ["Position error grows with velocity times delay.", "Correct. Faster motion turns the same delay into a larger spatial error."],
        ["The camera focal length shortens at high object speed.", "Object speed does not mechanically alter focal length."],
        ["LiDAR stops measuring distance whenever an object moves.", "LiDAR still measures returns; the measurements represent an earlier instant."],
        ["Static calibration targets begin moving in memory.", "The risk comes from physical motion during the delay."],
      ], ["A timestamp identifies when evidence was true.", "Using it at a later instant without propagation creates a speed-dependent position error."], "Latency converts motion into state-estimation error.", "3.7", 44),
      transfer: probe("transfer", "advanced", "A 20 Hz radar track is fused with a 30 Hz camera stream, and fast cars show doubled tracks. What lesson transfers?", ["ch3-fusion-design", "ch3-range-sensors"], 1, [
        ["Force both sensors to emit identical semantic labels.", "Label vocabulary does not align measurement time."],
        ["Inspect time and latency before association tuning.", "Correct. Rate and latency differences can make one object appear at two states."],
        ["Discard radar Doppler because it reveals motion.", "Doppler can help propagate the track to a common time."],
        ["Assume the higher-rate camera is generally current.", "Frame rate alone does not establish capture or delivery time."],
      ], ["The symptom is motion-dependent duplication across asynchronous streams.", "Alignment should precede threshold tuning."], "Synchronize evidence before interpreting disagreement as multiple objects.", "3.6", 43),
    },
  ),
  assessmentCase(
    "denoising-edge-budget",
    { kind: "table", caption: "Night-camera filter trial", columns: ["Pipeline", "Impulse noise left", "Edge retention", "Latency"], rows: [["Gaussian", "18%", "71%", "3 ms"], ["Median", "5%", "86%", "4 ms"], ["Bilateral", "9%", "93%", "14 ms"], ["NLM", "3%", "95%", "48 ms"]] },
    {
      application: probe("application", "intermediate", "The perception budget allows 8 ms and thin lane edges matter. Which trial is the strongest starting point?", ["ch3-cleaning-tradeoffs", "ch3-processing-limits"], 2, [
        ["Gaussian, because the lowest latency is the key quantity.", "It sacrifices substantially more edge evidence and leaves more impulse noise."],
        ["NLM, because its image scores are highest.", "Its 48 ms latency violates the stated budget."],
        ["Median, followed by task-level lane-recall validation.", "Correct. It removes most impulse noise, retains more edges than Gaussian, and meets the budget."],
        ["No processing, because filters necessarily destroy all edges.", "The measured trials show useful tradeoffs, not total destruction."],
      ], ["The decision has three constraints: noise, edge evidence, and latency.", "Median is the feasible measured compromise, but must be validated on the downstream task."], "Choose preprocessing by end-task evidence under the actual compute budget.", "3.5", 38),
      diagnosis: probe("diagnosis", "advanced", "After deploying NLM, offline image quality rises but emergency-braking reaction is later. What is the likeliest mechanism?", ["ch3-processing-limits", "ch3-cleaning-tradeoffs"], 3, [
        ["NLM makes objects physically farther away.", "Filtering cannot change the physical scene."],
        ["Higher edge retention forces GPS drift.", "The modalities and failure mechanisms are unrelated."],
        ["Impulse-noise removal generally lowers detector confidence.", "The table does not support this universal claim."],
        ["A 48 ms delay makes cleaner evidence stale.", "Correct. Quality gains can be outweighed by decision latency."],
      ], ["The degradation is temporal, not necessarily visual.", "The deployed filter adds an order of magnitude more delay than the feasible choices."], "A cleaner measurement can be a worse control input if it arrives too late.", "3.7", 44),
      comparison: probe("comparison", "foundational", "Why is the bilateral result more relevant than Gaussian when boundary location is critical?", ["ch3-cleaning-tradeoffs"], 0, [
        ["It preserves edges while reducing noise.", "Correct. Its edge-aware behavior matches the boundary-sensitive task."],
        ["It claims zero latency on all processors.", "The trial records 14 ms, not zero."],
        ["It converts the image into a LiDAR point cloud.", "It remains an image filter."],
        ["It removes the need to test a detector.", "Image metrics alone do not guarantee task performance."],
      ], ["Boundary-sensitive tasks depend on discontinuities that smoothing can blur.", "The measured edge-retention difference is therefore decision-relevant."], "Compare filters on the information the downstream model consumes.", "3.5", 38),
      causal: probe("causal", "intermediate", "Why can aggressive smoothing reduce small-sign detection even when global noise decreases?", ["ch3-cleaning-tradeoffs"], 1, [
        ["It changes the sign's legal meaning.", "The semantic class is not physically changed."],
        ["Smoothing erases small-sign edges and contrast.", "Correct. A small signal can be treated as noise by an overly strong filter."],
        ["It increases the sign's actual distance from the camera.", "Filtering acts on pixels, not world geometry."],
        ["It makes radar measure color.", "Radar does not recover lost visual texture."],
      ], ["Small objects contain limited spatial evidence.", "A kernel that averages across their boundary reduces separability."], "Noise suppression is harmful when the signal resembles the noise scale.", "3.5", 38),
      transfer: probe("transfer", "advanced", "A new camera has more shot noise but twice the compute throughput. How should the team reuse these results?", ["ch3-cleaning-tradeoffs", "ch3-dataset-reasoning"], 2, [
        ["Copy the old winner without collecting new data.", "Noise statistics and hardware changed, so the old ranking may not transfer."],
        ["Select NLM solely because compute doubled.", "Twice the throughput may still not meet the deadline, and task effects remain unknown."],
        ["Test night latency and small-boundary recall.", "Correct. It preserves the evaluation logic while re-estimating changed quantities."],
        ["Remove all noisy frames from the dataset.", "That would hide the deployment condition instead of designing for it."],
      ], ["The old table supplies hypotheses, not permanent constants.", "New noise and compute require new measurements under the same safety criteria."], "Transfer an evaluation method, not an unverified parameter setting.", "3.5", 41),
    },
  ),
  assessmentCase(
    "sparse-lidar-pedestrian",
    { kind: "log", caption: "Rain cleanup regression", lines: ["before cleanup: long-range pedestrian recall 0.78; false clusters/frame 14", "after fixed-radius removal: recall 0.42; false clusters/frame 3", "removed rain returns: usually isolated", "removed pedestrian at 48 m: 4 vertically consistent points", "nearby cars: hundreds of dense points"] },
    {
      application: probe("application", "advanced", "What is the best next experiment?", ["ch3-cleaning-tradeoffs"], 3, [
        ["Increase the fixed neighbor requirement until all false clusters disappear.", "That is likely to erase still more sparse distant objects."],
        ["Keep all points, because no outlier can be removed safely.", "The before-cleanup false-cluster burden is real."],
        ["Evaluate just on nearby cars, whose density makes the filter look stable.", "That excludes the harmed population."],
        ["Test range-aware density; score rain rejection plus recall.", "Correct. Expected sampling density changes with range, while persistence and shape add evidence beyond local count."],
      ], ["The filter confuses sparse sampling with spurious sampling.", "A range-aware trial directly targets that confound."], "Outlier criteria must respect how legitimate evidence density changes across the sensing envelope.", "3.5", 39),
      diagnosis: probe("diagnosis", "intermediate", "What does the recall pattern reveal about the fixed-radius rule?", ["ch3-cleaning-tradeoffs"], 0, [
        ["Density assumptions favor nearby, sampled surfaces.", "Correct. Distant valid targets naturally have fewer neighbors."],
        ["It improves all classes equally.", "Pedestrian recall falls sharply."],
        ["It measures object velocity more accurately than radar.", "The rule uses local point density, not Doppler."],
        ["It is an intrinsic camera-calibration error.", "The failure is in LiDAR point filtering."],
      ], ["Cars remain dense while the distant pedestrian is represented by four returns.", "The global threshold treats different sampling regimes as equivalent."], "Aggregate point density is not a universal proxy for validity.", "3.5", 39),
      comparison: probe("comparison", "foundational", "Which removed cluster has stronger evidence of being a real object?", ["ch3-cleaning-tradeoffs", "ch3-range-sensors"], 1, [
        ["One isolated return that appears in one sweep", "This matches the rain-outlier pattern."],
        ["Four vertical returns persisting on one path", "Correct. Structure and temporal consistency distinguish it from isolated precipitation."],
        ["Any cluster with the largest raw intensity", "Intensity alone can be affected by material and weather."],
        ["Whichever cluster is closest to the sensor", "Range affects density but does not decide reality by itself."],
      ], ["Multiple independent cues support the vertical persistent cluster.", "The isolated transient return has little corroboration."], "Use spatial and temporal consistency, not neighbor count alone, to judge sparse evidence.", "3.5", 40),
      causal: probe("causal", "intermediate", "Why do fixed-radius neighbor counts tend to fall for distant targets?", ["ch3-range-sensors", "ch3-cleaning-tradeoffs"], 2, [
        ["Distant targets generally move faster.", "Distance does not determine speed."],
        ["Rain changes all objects into one point.", "The sparse-sampling issue exists even without that transformation."],
        ["Ray spacing grows with range.", "Correct. The same angular separation covers a larger physical gap at distance."],
        ["GPS removes LiDAR neighbors outside cities.", "GPS does not control LiDAR beam spacing."],
      ], ["LiDAR sampling is organized by beam directions.", "Metric separation between adjacent rays increases with range."], "Filtering parameters should reflect sensor sampling geometry.", "3.5", 40),
      transfer: probe("transfer", "advanced", "A model-removal step deletes low curbs together with the road plane. What principle transfers?", ["ch3-cleaning-tradeoffs", "ch3-processing-limits"], 3, [
        ["Everything close to a fitted model is noise.", "Safety-relevant structure can be close to the dominant surface."],
        ["Disable all geometric modeling forever.", "Model removal can still help when residuals and exceptions are handled carefully."],
        ["Judge success only by the number of points removed.", "Removal volume does not capture retained hazards."],
        ["Validate removal on small boundary objects.", "Correct. The filter's assumptions must be tested where true structure resembles the nuisance model."],
      ], ["Both failures erase weak but legitimate evidence because it resembles an unwanted pattern.", "Targeted recall tests expose the cost."], "Every cleanup rule needs a retention test for plausible edge cases.", "3.5", 40),
    },
  ),
  assessmentCase(
    "voxel-size-pole-recall",
    { kind: "table", caption: "LiDAR downsampling on an embedded processor", columns: ["Voxel edge", "Points/frame", "Latency", "Thin-pole recall"], rows: [["0.05 m", "118k", "73 ms", "0.94"], ["0.20 m", "42k", "31 ms", "0.90"], ["0.50 m", "12k", "14 ms", "0.58"]] },
    {
      application: probe("application", "intermediate", "The deadline is 40 ms and thin poles are safety relevant. Which configuration is best supported?", ["ch3-cleaning-tradeoffs", "ch3-processing-limits"], 0, [
        ["0.20 m, with validation across range and weather", "Correct. It meets the deadline with a small measured recall loss relative to the infeasible fine grid."],
        ["0.05 m, because recall makes deadlines irrelevant", "Its 73 ms latency violates the deployment constraint."],
        ["0.50 m, because the fewest points must be safest", "The large recall collapse is a direct safety cost."],
        ["Randomly switch voxel size every frame", "Uncontrolled switching makes evidence and latency inconsistent."],
      ], ["Only two configurations satisfy the deadline.", "Among them, 0.20 m preserves substantially more thin-object evidence."], "Select a Pareto-feasible operating point, then validate it beyond the benchmark slice.", "3.5", 41),
      diagnosis: probe("diagnosis", "advanced", "Why does recall collapse between 0.20 m and 0.50 m?", ["ch3-cleaning-tradeoffs"], 1, [
        ["The camera loses its principal point.", "This is LiDAR spatial aggregation, not camera calibration."],
        ["Large cells erase sparse near-scale structures.", "Correct. Thin poles can cease to form a distinct point pattern."],
        ["Radar Doppler becomes negative.", "Radar is absent from the trial."],
        ["Every 0.50 m voxel contains exactly one complete object.", "Objects cross cells and small objects may be absorbed by surrounding structure."],
      ], ["The performance change is nonlinear despite a smooth reduction in point count.", "The voxel scale approaches the width of the target structure."], "Downsampling can cross a resolution threshold where an object representation disappears.", "3.5", 41),
      comparison: probe("comparison", "foundational", "Which claim is justified by the table?", ["ch3-cleaning-tradeoffs"], 2, [
        ["More points always make the complete AV safer.", "The table shows recall and latency, not total-system safety."],
        ["0.50 m is universally optimal on every processor.", "Its recall is poor and hardware may differ."],
        ["0.20 m dominates 0.50 m for this deadline-sensitive thin-pole task.", "Correct. Both meet 40 ms, but 0.20 m has much higher measured recall."],
        ["0.05 m should be deployed because offline latency never affects control.", "Deployment latency directly affects freshness."],
      ], ["A dominance claim compares relevant measured dimensions under the stated constraint.", "0.20 m is better in recall and still feasible in time."], "Make conclusions conditional on the task, metrics, and operating constraint.", "3.5", 41),
      causal: probe("causal", "intermediate", "How can downsampling improve end-to-end responsiveness?", ["ch3-processing-limits", "ch3-cleaning-tradeoffs"], 3, [
        ["It makes the physical LiDAR rotate faster.", "Software downsampling does not change sensor mechanics."],
        ["It guarantees perfect detection by removing ambiguity.", "It can also remove useful detail."],
        ["It changes past timestamps into future timestamps.", "It reduces work; it does not alter capture time."],
        ["Fewer points cut compute and preserve freshness.", "Correct. Lower workload can reduce backlog and stale decisions."],
      ], ["Point count is a major input to downstream processing cost.", "Reducing it can shorten latency if the retained representation is adequate."], "Efficiency matters because delayed perception is degraded perception.", "3.7", 44),
      transfer: probe("transfer", "advanced", "A higher-resolution LiDAR replaces the tested unit. What should happen to the 0.20 m setting?", ["ch3-cleaning-tradeoffs", "ch3-dataset-reasoning"], 0, [
        ["Retune for sampling, compute, and recall.", "Correct. The physical sampling and workload that produced the table have changed."],
        ["Keep it permanently because voxel size is sensor-independent.", "The useful tradeoff depends on input density and task scale."],
        ["Increase it automatically in proportion to point count.", "That might erase extra detail without measuring the task impact."],
        ["Remove downsampling and skip latency measurement.", "The new sensor may increase compute pressure."],
      ], ["The old setting was supported by a specific sensor-task-hardware combination.", "Replacement changes at least two members of that combination."], "Revalidate preprocessing whenever the evidence distribution or compute platform changes.", "3.5", 41),
    },
  ),
  assessmentCase(
    "fusion-level-retrofit",
    { kind: "table", caption: "Retrofit options for a deployed perception stack", columns: ["Option", "Change required", "Measured gain", "Risk"], rows: [["Late decision fusion", "combine existing object lists", "+5% recall", "duplicate tracks"], ["Mid-level fusion", "share learned features", "+11% recall", "retrain both branches"], ["Raw early fusion", "joint raw tensors", "+13% recall", "tight sync/calibration; 2.4x compute"]] },
    {
      application: probe("application", "advanced", "The team can update the fusion service but cannot retrain certified detectors this release. Which option is defensible?", ["ch3-fusion-design", "ch3-processing-limits"], 1, [
        ["Raw early fusion, ignoring compute and certification limits", "It violates both stated constraints."],
        ["Late fusion with association and uncertainty tests", "Correct. It works with existing outputs while addressing its measured risk."],
        ["Mid-level fusion without touching either detector", "Feature fusion requires internal access and retraining according to the table."],
        ["No fusion evaluation because the gain is smaller than 100%", "A smaller gain may still be valuable and should be evaluated against risk."],
      ], ["The release constraint rules out methods requiring internal retraining.", "Late fusion is feasible but needs safeguards for its known association failure."], "Architecture choice must respect both evidence quality and integration constraints.", "3.6", 43),
      diagnosis: probe("diagnosis", "intermediate", "Late fusion creates two tracks for one car when camera and radar estimates differ slightly. Where is the most direct fault?", ["ch3-fusion-design"], 2, [
        ["Camera intrinsic calibration must be the only cause.", "Several sources can create output disagreement."],
        ["The car is physically duplicated.", "The symptom is a known decision-association risk."],
        ["Output association misses compatible estimates.", "Correct. Late fusion must reconcile independently produced objects."],
        ["Raw sensor tensors were combined too early.", "This architecture does not combine raw tensors."],
      ], ["Both detectors already emit objects.", "Duplication occurs when the fusion service decides whether those objects correspond."], "Localize a fusion error at the stage where representations are combined.", "3.6", 43),
      comparison: probe("comparison", "foundational", "What advantage does early fusion seek relative to late fusion?", ["ch3-fusion-design"], 3, [
        ["It removes every synchronization requirement.", "Raw evidence is especially sensitive to timing and calibration."],
        ["It guarantees lower compute.", "The table shows 2.4x compute."],
        ["It preserves detector independence for certification.", "It couples the branches more tightly."],
        ["Early fusion preserves detail before decisions.", "Correct. Earlier combination can exploit cross-modal structure unavailable in final object lists."],
      ], ["Late outputs are compressed decisions.", "Early fusion can use lower-level correspondences but pays alignment and compute costs."], "Fusion level trades information access against coupling and operational complexity.", "3.6", 43),
      causal: probe("causal", "intermediate", "Why does raw early fusion demand tighter calibration than combining final object lists?", ["ch3-fusion-design", "ch3-extrinsic-calibration"], 0, [
        ["Raw data must align in space and time.", "Correct. Small alignment errors directly contaminate shared low-level patterns."],
        ["Final object lists contain no coordinates.", "They normally contain state estimates used for association."],
        ["Calibration matters only after planning.", "It is fundamental before cross-sensor combination."],
        ["Early fusion physically moves the sensors.", "The method changes computation, not mounting."],
      ], ["Early fusion combines detailed samples rather than abstract hypotheses.", "Their correspondence depends directly on timing and transforms."], "The earlier representations meet, the more faithfully their coordinate systems must agree.", "3.6", 42),
      transfer: probe("transfer", "advanced", "Next release permits retraining but the embedded GPU has little headroom. How should the choice be revisited?", ["ch3-fusion-design", "ch3-processing-limits"], 1, [
        ["Select the largest offline recall number regardless of runtime.", "An infeasible pipeline cannot deliver timely evidence."],
        ["Benchmark fusion accuracy, calibration, and hardware latency.", "Correct. The changed constraint opens mid-level fusion but compute and robustness remain decision variables."],
        ["Assume mid-level fusion has no retraining cost now that it is permitted.", "Permission does not eliminate engineering or validation cost."],
        ["Keep the old architecture solely because changing is possible.", "Possibility alone is neither a reason to change nor to stay."],
      ], ["A constraint changed, so the feasible set changed.", "A controlled benchmark is needed to compare the newly feasible option on deployment metrics."], "Revisit architecture when constraints change, but require fresh system-level evidence.", "3.6", 43),
    },
  ),
  assessmentCase(
    "radar-camera-association",
    { kind: "table", caption: "Foggy intersection at one timestamp", columns: ["Evidence", "Bearing", "Range", "Closing speed", "Class confidence"], rows: [["Radar R1", "-4 deg", "31 m", "6 m/s", "n/a"], ["Radar R2", "+8 deg", "34 m", "0 m/s", "n/a"], ["Camera B1", "-3 deg", "unknown", "unknown", "vehicle 0.46"], ["Camera B2", "+7 deg", "unknown", "unknown", "sign 0.82"]] },
    {
      application: probe("application", "advanced", "How should the fusion layer represent R1 and B1?", ["ch3-fusion-design", "ch3-range-sensors"], 2, [
        ["Delete R1 because B1 has confidence below 0.50.", "Weak classification does not negate collision-relevant radar motion."],
        ["Declare two unrelated objects because the bearings are not numerically identical.", "Sensor uncertainty and calibration permit small bearing differences."],
        ["Keep a shared-object hypothesis with radar rate and uncertain class.", "Correct. The measurements are compatible and contribute different attributes without overstating identity."],
        ["Assign R1 to B2 because B2 has higher class confidence.", "Class confidence does not outweigh incompatible bearing and zero-speed evidence."],
      ], ["R1 and B1 are close in bearing within plausible uncertainty.", "Radar supplies motion while the fog-degraded camera supplies tentative semantics."], "Fuse compatible evidence while preserving uncertainty in attributes that remain weak.", "3.6", 42),
      diagnosis: probe("diagnosis", "intermediate", "A rule associates every radar return with the highest-confidence camera box. What failure will this scene expose?", ["ch3-fusion-design"], 3, [
        ["The radar will start producing RGB pixels.", "Association does not change sensor modality."],
        ["The camera frame rate will equal the radar rate.", "The rule does not synchronize capture."],
        ["All static signs will acquire correct vehicle speeds.", "That is the opposite of the likely misassociation."],
        ["R1 links to B2 despite incompatible geometry.", "Correct. Confidence-only matching ignores physical compatibility."],
      ], ["B2 has the largest semantic confidence but lies near R2, not R1.", "A valid association must use location, time, and uncertainty as well as class evidence."], "Association confidence is not the same as detector confidence.", "3.6", 43),
      comparison: probe("comparison", "foundational", "Which sensor contributes the most direct evidence that the -4 degree object is approaching?", ["ch3-range-sensors"], 0, [
        ["R1 radar closing speed", "Correct. Doppler-derived relative motion directly supports the approaching claim."],
        ["Camera B1's vehicle confidence", "A class score does not directly measure closing speed."],
        ["Camera B2's sign confidence", "It concerns another bearing and no motion quantity."],
        ["Radar R2's stationary report", "It describes the +8 degree return."],
      ], ["The question asks about relative longitudinal motion.", "Only R1 supplies that quantity for the relevant bearing."], "Match a claim to the measurement that directly supports it.", "3.2", 35),
      causal: probe("causal", "intermediate", "Why should fusion avoid forcing R1 to inherit a highly certain vehicle class?", ["ch3-fusion-design", "ch3-camera-evidence"], 1, [
        ["Radar can never contribute to any object hypothesis.", "Radar is already contributing useful range and motion."],
        ["Radar confirms occupancy; fog leaves camera semantics weak.", "Correct. Confidence in existence does not automatically resolve class."],
        ["Every occupied object is necessarily a sign.", "Occupancy does not imply that class."],
        ["Class uncertainty prevents braking on an approaching object.", "Risk response can use existence and motion without exact class."],
      ], ["Modalities support different state components.", "Strong range-rate evidence cannot manufacture missing visual detail."], "Propagate uncertainty per attribute instead of assigning one confidence to the whole fused object.", "3.6", 43),
      transfer: probe("transfer", "advanced", "At night, a radar return overlaps two adjacent camera boxes. What is the best transfer of this reasoning?", ["ch3-fusion-design", "ch3-processing-limits"], 2, [
        ["Always choose the brighter box.", "Brightness is not a universal association criterion."],
        ["Duplicate the full radar speed into both tracks with certainty.", "That can create two falsely approaching objects."],
        ["Keep links unresolved until later evidence separates them.", "Correct. The evidence does not yet justify a single certain match."],
        ["Discard the radar return because the camera is ambiguous.", "That throws away useful collision evidence."],
      ], ["One measurement is compatible with multiple hypotheses.", "Preserving alternatives avoids premature irreversible assignment."], "When association is ambiguous, represent ambiguity rather than hiding it.", "3.6", 43),
    },
  ),
  assessmentCase(
    "gps-imu-filter-confidence",
    { kind: "table", caption: "Localization through a tunnel", columns: ["Time", "GPS status", "IMU-integrated position error", "Filter 95% bound"], rows: [["entry", "good", "0.4 m", "0.8 m"], ["10 s inside", "none", "2.1 m", "3.2 m"], ["40 s inside", "none", "9.8 m", "11.5 m"], ["exit first fix", "reported good", "8.9 m innovation", "1.0 m"]] },
    {
      application: probe("application", "advanced", "How should the system handle the first GPS fix at tunnel exit?", ["ch3-motion-sensors", "ch3-fusion-design"], 3, [
        ["Snap immediately to it because its status says good.", "A large innovation after blockage deserves consistency checks."],
        ["Ignore all future GPS fixes permanently.", "Fresh GPS can correct drift once validated."],
        ["Keep the small 1.0 m bound while changing position by 8.9 m.", "That would conceal the disagreement."],
        ["Gate the fix by uncertainty; update gradually or reject.", "Correct. The large residual may be a valid drift correction or a reacquisition outlier."],
      ], ["IMU-only uncertainty grew during the outage.", "The first external fix strongly disagrees and should be assessed, not blindly accepted or discarded."], "Fusion must test measurement consistency and update confidence along with state.", "3.3", 35),
      diagnosis: probe("diagnosis", "intermediate", "Which row shows that the filter is likely overconfident?", ["ch3-motion-sensors"], 0, [
        ["Exit: 8.9 m jump versus 1.0 m bound.", "Correct. The stated uncertainty poorly anticipates the observed disagreement."],
        ["The entry row: error is below the bound.", "That row appears statistically plausible."],
        ["The 10 s row: GPS is absent.", "Absence alone is expected in a tunnel."],
        ["The 40 s row: the bound has grown.", "Growing uncertainty is appropriate during inertial propagation."],
      ], ["A confidence bound should make large residuals rare under its model.", "An 8.9 m correction against 1.0 m declared uncertainty is a warning."], "Evaluate localization confidence against innovations, not status flags alone.", "3.3", 35),
      comparison: probe("comparison", "foundational", "What complementary roles do GPS and IMU play in this sequence?", ["ch3-motion-sensors"], 1, [
        ["GPS supplies high-rate angular velocity while IMU supplies latitude.", "Those roles are reversed or incorrect."],
        ["IMU bridges blockage; validated GPS bounds drift.", "Correct. Their error behaviors are complementary."],
        ["Both remain independent of time and bias.", "IMU bias accumulates and GPS availability changes."],
        ["GPS makes inertial calibration unnecessary.", "IMU bias and alignment still matter."],
      ], ["The IMU continues when satellite reception disappears.", "Its integrated error grows, so external position measurements are useful when they return."], "Fuse sensors whose strengths cover each other's failure intervals.", "3.3", 35),
      causal: probe("causal", "intermediate", "Why does IMU-only position error accelerate over a long outage?", ["ch3-motion-sensors"], 2, [
        ["The tunnel physically stretches the road.", "The error is estimated position, not roadway geometry."],
        ["GPS secretly doubles every acceleration sample.", "GPS is absent."],
        ["Inertial bias integrates into position error.", "Correct. Repeated integration turns persistent bias into growing drift."],
        ["Radar reflections directly rewrite the IMU clock.", "No such evidence appears in the case."],
      ], ["Inertial measurements describe change rather than absolute position.", "Bias accumulates each integration step and propagates to downstream state."], "High-rate continuity does not imply bounded long-term error.", "3.3", 35),
      transfer: probe("transfer", "advanced", "A vehicle loses GPS under dense trees instead of in a tunnel. What transfers?", ["ch3-motion-sensors", "ch3-dataset-reasoning"], 3, [
        ["Assume tree cover causes no localization degradation because the road is outdoors.", "Satellite visibility can still be obstructed."],
        ["Freeze the last GPS coordinate until reception returns.", "That ignores real vehicle motion."],
        ["Report the same uncertainty at every outage duration.", "Inertial uncertainty should generally grow with unsupported propagation."],
        ["Propagate with IMU, grow uncertainty, and validate reacquired GPS before correction.", "Correct. The same complementary-sensor logic applies to a different blockage domain."],
      ], ["Both settings interrupt reliable absolute positioning.", "The estimator must remain continuous without pretending drift is absent."], "Transfer the failure model across environments that remove the same measurement support.", "3.3", 35),
    },
  ),
  assessmentCase(
    "occluded-track-gap",
    { kind: "log", caption: "Pedestrian track beside a delivery van", lines: ["t=0.0 s: pedestrian visible, heading east", "t=0.2 s: pedestrian enters occlusion", "t=1.0 s: tracker interpolates straight east", "t=1.1 s: pedestrian reappears heading southeast", "planner clearance used interpolated centerline with 0.2 m uncertainty"] },
    {
      application: probe("application", "advanced", "What is the safest estimator change during this occlusion?", ["ch3-processing-limits", "ch3-fusion-design"], 0, [
        ["Propagate multiple plausible motions or a widening distribution, then use reappearance evidence to update it.", "Correct. The hidden pedestrian can change direction, so uncertainty should grow rather than collapse."],
        ["Continue the last heading with fixed 0.2 m certainty.", "The log shows that this confident extrapolation missed the turn."],
        ["Delete the pedestrian at the first missing frame.", "Occlusion is not evidence that the hazard ceased to exist."],
        ["Replace the hidden track with the van's velocity.", "The occluder and pedestrian are distinct objects."],
      ], ["Missing observations remove constraints on motion.", "A turn during the gap is plausible and material to clearance."], "Represent what could happen during missing data, not merely the easiest interpolation.", "3.7", 44),
      diagnosis: probe("diagnosis", "intermediate", "What is the central reasoning error in the logged planner input?", ["ch3-processing-limits"], 1, [
        ["It uses positions measured in meters.", "Meters are appropriate for clearance."],
        ["It treats a model-filled gap as nearly as certain as a direct observation.", "Correct. The narrow bound is unsupported during occlusion."],
        ["It records that the pedestrian was once visible.", "Track history is useful evidence."],
        ["It distinguishes the van from the pedestrian.", "That distinction is necessary."],
      ], ["The interpolation is one hypothesis about unobserved motion.", "The reappearance outside its narrow bound reveals overconfidence."], "Imputed states require uncertainty that reflects the missing evidence.", "3.7", 44),
      comparison: probe("comparison", "foundational", "Which estimate is more defensible at t=1.0 s?", ["ch3-processing-limits"], 2, [
        ["An exact eastbound point because straight motion is common", "Common does not mean certain under occlusion."],
        ["No track and no residual risk", "The last observation and occluder support continued existence."],
        ["A predicted region covering straight and plausible turning motions", "Correct. It retains useful history without pretending the hidden path was observed."],
        ["The pedestrian's final reappearance copied backward as known fact", "That would leak future information into an online estimate."],
      ], ["Prediction should use information available at the time.", "A region can reflect both continuity and plausible maneuver uncertainty."], "Good prediction is calibrated about alternatives, not just accurate in hindsight.", "3.7", 44),
      causal: probe("causal", "intermediate", "Why can straight-line interpolation create unsafe clearance even if its endpoints are correct?", ["ch3-processing-limits"], 3, [
        ["Endpoints force every intermediate path to be straight.", "Many curved paths can connect endpoints."],
        ["Interpolation changes the van into a pedestrian.", "It changes an estimate, not object identity."],
        ["Missing frames contain more pixels than visible frames.", "The issue is unobserved motion, not pixel count."],
        ["The true path can deviate between observations, and control acts before the later endpoint is known.", "Correct. Online safety depends on possible intermediate occupancy."],
      ], ["Endpoint agreement does not constrain the hidden trajectory enough.", "A planner must protect against plausible paths at decision time."], "Temporal interpolation is not a measurement of what happened between frames.", "3.7", 44),
      transfer: probe("transfer", "advanced", "A LiDAR sweep is missing during a lane change while radar continues. What transfers?", ["ch3-fusion-design", "ch3-processing-limits"], 0, [
        ["Use radar-supported motion, retain the missing LiDAR status, and widen attributes that radar cannot constrain.", "Correct. Available evidence can maintain part of the state without inventing absent geometry."],
        ["Synthesize a perfect LiDAR sweep and mark it observed.", "That hides uncertainty and provenance."],
        ["Discard the radar because one modality is missing.", "Radar remains useful for motion and range."],
        ["Freeze all object states until LiDAR returns.", "Objects continue moving during the gap."],
      ], ["Partial sensing does not imply either complete ignorance or complete certainty.", "Uncertainty should grow specifically in dimensions no longer observed."], "Track evidence provenance and degrade confidence selectively during sensor gaps.", "3.7", 44),
    },
  ),
  assessmentCase(
    "reflective-facade-phantom",
    { kind: "log", caption: "Wet-night point-cloud anomaly", lines: ["LiDAR: 9-point cluster appears 2 m behind glass facade", "camera: facade and reflected headlights; no physical object", "radar: no persistent return at cluster bearing", "next 4 sweeps: cluster jumps with headlight angle", "map: solid building wall at that location"] },
    {
      application: probe("application", "advanced", "How should perception handle this cluster?", ["ch3-cleaning-tradeoffs", "ch3-fusion-design"], 1, [
        ["Declare a stationary pedestrian solely because nine LiDAR points exist.", "Point count alone ignores contradictory geometry and temporal behavior."],
        ["Lower its occupancy confidence using map inconsistency, non-persistence, and cross-modal evidence while preserving a cautious unknown state.", "Correct. Several independent cues support an artifact, but a safety system should record uncertainty rather than silently erase evidence."],
        ["Recalibrate GPS latitude until the cluster moves outdoors.", "Global coordinates are not the primary cause of angle-dependent reflection."],
        ["Increase headlight brightness to stabilize the return.", "That may strengthen the reflective artifact."],
      ], ["The cluster violates the mapped wall and changes with illumination geometry.", "Camera and radar do not corroborate a physical object."], "Mitigate artifacts with independent constraints while preserving uncertainty about unresolved evidence.", "3.7", 44),
      diagnosis: probe("diagnosis", "intermediate", "Which clue most strongly favors a reflection artifact over a real stationary object?", ["ch3-processing-limits"], 2, [
        ["The scene is at night.", "Real objects also exist at night."],
        ["The cluster has nine points.", "A small cluster can be either real or spurious."],
        ["Its position jumps with headlight angle behind a mapped solid surface.", "Correct. Dependence on illumination geometry plus impossible location contradicts stable physical occupancy."],
        ["The vehicle has a camera.", "Sensor availability alone is not diagnostic."],
      ], ["A real stationary object should remain spatially consistent across sweeps.", "The map constraint makes the behind-wall hypothesis physically implausible."], "Seek causal and geometric signatures that distinguish artifacts from sparse real objects.", "3.7", 44),
      comparison: probe("comparison", "foundational", "Which evidence would most increase belief that the cluster is a real obstacle?", ["ch3-fusion-design", "ch3-range-sensors"], 3, [
        ["A stronger reflection in the glass", "That supports the artifact mechanism."],
        ["A larger map wall at the same location", "That further contradicts physical occupancy behind it."],
        ["More isolated points that jump independently", "Non-persistent instability remains suspicious."],
        ["Persistent, physically reachable geometry corroborated by camera or radar over several timestamps", "Correct. Persistence, feasibility, and independent sensing all support reality."],
      ], ["Evidence strength grows when independent sources agree on a stable world explanation.", "The proposed observation reverses the current contradictions."], "Corroboration should be physical, temporal, and cross-modal.", "3.6", 42),
      causal: probe("causal", "intermediate", "Why can a glass facade generate a phantom LiDAR location?", ["ch3-range-sensors", "ch3-processing-limits"], 0, [
        ["A reflected optical path can return with delay and direction that the sensor interprets as a direct path to a surface.", "Correct. The ranging assumption is violated by multipath reflection."],
        ["Glass changes the vehicle's true wheelbase.", "Vehicle geometry is unrelated."],
        ["The map writes points into the sensor packet.", "The map is only a later consistency check."],
        ["Radar Doppler forces LiDAR beams through walls.", "The sensors do not interact that way."],
      ], ["Time-of-flight ranging assumes a path from sensor to target and back.", "Specular or multipath returns can make the inferred endpoint false."], "A sensor can measure a real signal whose usual physical interpretation is wrong.", "3.7", 44),
      transfer: probe("transfer", "advanced", "A radar track appears beside a metal barrier only when a truck passes. What should transfer from this case?", ["ch3-range-sensors", "ch3-fusion-design"], 1, [
        ["Any barrier-adjacent track must be deleted by location alone.", "Real hazards can occur near barriers."],
        ["Test multipath by checking temporal coupling to the truck, physical feasibility, and independent-sensor persistence.", "Correct. It probes whether the return follows reflection geometry rather than a stable object."],
        ["Use camera color to change radar carrier frequency.", "The modalities cannot be modified that way."],
        ["Accept the track as certain because radar handles poor weather.", "Weather robustness does not eliminate multipath artifacts."],
      ], ["Both symptoms may result from indirect propagation paths.", "Controlled temporal and geometric checks distinguish the artifact mechanism."], "Robust sensors still have modality-specific failure modes that fusion must model.", "3.7", 44),
    },
  ),
  assessmentCase(
    "sensor-pipeline-backlog",
    { kind: "table", caption: "Production perception timing", columns: ["Stage", "Input rate", "Mean processing", "Queue policy"], rows: [["camera detector", "30 Hz", "46 ms/frame", "unbounded"], ["LiDAR detector", "10 Hz", "62 ms/sweep", "latest only"], ["fusion", "10 Hz", "18 ms/set", "wait for matching camera frame"]] },
    {
      application: probe("application", "advanced", "Which intervention most directly prevents camera evidence from becoming progressively stale?", ["ch3-processing-limits", "ch3-fusion-design"], 2, [
        ["Add an even larger unbounded queue.", "That stores more stale work while arrival still exceeds service."],
        ["Make fusion wait for every historical camera frame.", "That propagates the backlog downstream."],
        ["Use a bounded latest-relevant-frame policy and reduce detector load or add compute until service meets the effective rate.", "Correct. It controls age while fixing or limiting the overload."],
        ["Remove timestamps from all messages.", "That would hide staleness instead of resolving it."],
      ], ["Camera frames arrive every 33 ms but require 46 ms to process.", "An unbounded queue therefore grows unless work is skipped or capacity improves."], "Control both throughput and data age in real-time sensor pipelines.", "3.7", 44),
      diagnosis: probe("diagnosis", "intermediate", "After two minutes, detections are accurate for scenes from several seconds ago. What is the primary failure?", ["ch3-processing-limits"], 3, [
        ["Camera intrinsic calibration drifted exactly several seconds.", "Calibration affects geometry, not systematic delivery age."],
        ["LiDAR range resolution became camera latency.", "The modalities' properties are being conflated."],
        ["The detector learned future frames.", "It is processing old frames, not future ones."],
        ["Arrival rate exceeds camera service rate, so the unbounded queue accumulates delay.", "Correct. Accurate but old outputs are a queueing failure."],
      ], ["At 30 Hz, each frame has about 33 ms of compute time if processed serially.", "The 46 ms mean cannot keep pace."], "Freshness can fail even when per-frame inference is correct.", "3.7", 44),
      comparison: probe("comparison", "foundational", "Why is the LiDAR queue less likely to grow under the measured means?", ["ch3-processing-limits"], 0, [
        ["A sweep arrives every 100 ms and mean processing is 62 ms, with a latest-only policy.", "Correct. Service is faster than mean arrival spacing and old work is bounded."],
        ["LiDAR has no processing cost.", "The table reports 62 ms."],
        ["Every LiDAR sweep contains fewer than one point.", "No such evidence is given."],
        ["The camera queue automatically accelerates LiDAR.", "The queue policies are distinct."],
      ], ["Rate determines available time per item.", "The queue policy also prevents indefinite historical accumulation."], "Evaluate latency using rate, service time, and queue policy together.", "3.7", 44),
      causal: probe("causal", "intermediate", "Why can waiting for a matching camera frame delay otherwise timely LiDAR evidence?", ["ch3-fusion-design", "ch3-processing-limits"], 1, [
        ["LiDAR distances cease to exist until photographed.", "The measurements already exist."],
        ["Fusion completion is gated by the slowest required input, so camera backlog becomes system latency.", "Correct. A dependency transfers upstream delay to the combined output."],
        ["Matching changes the physical camera frame rate.", "It changes processing flow, not capture hardware."],
        ["The fusion stage has negative compute time.", "It adds another 18 ms."],
      ], ["Fusion cannot publish a required pair until both members arrive.", "The stale branch therefore determines the age of the whole set."], "Synchronous fusion inherits the worst timing behavior of its required inputs.", "3.6", 43),
      transfer: probe("transfer", "advanced", "A new semantic model doubles camera latency but improves offline accuracy. What evaluation should decide deployment?", ["ch3-processing-limits", "ch3-dataset-reasoning"], 2, [
        ["Compare only per-frame accuracy on stored images.", "That ignores the pipeline effect that caused this case."],
        ["Deploy it because model size is a proxy for safety.", "Size does not establish timely task performance."],
        ["Replay representative sensor rates on target hardware and measure age-at-decision, dropped work, and downstream safety metrics.", "Correct. It tests the accuracy-latency tradeoff in the real execution context."],
        ["Disable the camera timestamps to make latency look smaller.", "That obscures the metric rather than improving performance."],
      ], ["The proposed model changes both inference quality and service capacity.", "End-to-end replay reveals which effect dominates decisions."], "Validate models as pipeline components, not isolated benchmark functions.", "3.7", 44),
    },
  ),
  assessmentCase(
    "dataset-task-mismatch",
    { kind: "table", caption: "Candidate training corpora", columns: ["Dataset", "Modalities", "Temporal structure", "Labels"], rows: [["A", "front camera", "independent frames", "2D boxes"], ["B", "camera, LiDAR, GPS/IMU, maps", "20 s sequences", "3D tracks and future trajectories"], ["C", "front camera, steering", "5 s sequences", "control pairs"], ["D", "LiDAR, GPS", "independent sweeps", "road/non-road points"]] },
    {
      application: probe("application", "advanced", "Which dataset best supports training and evaluating a multimodal pedestrian-motion predictor?", ["ch3-dataset-reasoning", "ch3-fusion-design"], 3, [
        ["A, because any 2D box determines a future trajectory.", "Independent frames do not provide supervised temporal motion."],
        ["C, because steering labels fully describe pedestrian intent.", "Vehicle controls do not label pedestrian futures."],
        ["D, because road segmentation is equivalent to tracking people.", "Its labels and temporal structure do not match the task."],
        ["B, because synchronized multimodal sequences include tracks and future trajectories.", "Correct. Its evidence and targets align with fusion and prediction."],
      ], ["The task needs observations over time and future-motion supervision.", "Dataset B alone provides both plus the proposed sensor modalities."], "Choose data by the claim and task interface, not by dataset fame or size alone.", "3.8", 45),
      diagnosis: probe("diagnosis", "intermediate", "A team converts Dataset A into five-frame clips by grouping adjacent file names, then reports tracking accuracy. What is the core validity risk?", ["ch3-dataset-reasoning"], 0, [
        ["File adjacency may not establish continuous scenes or consistent object identities.", "Correct. Synthetic grouping cannot create missing temporal provenance and track labels."],
        ["2D boxes contain too many future trajectories.", "They contain no such supervision as described."],
        ["Camera frames cannot depict objects.", "They can support detection; the issue is temporal continuity."],
        ["Tracking requires ultrasonic audio labels.", "Ultrasonic sensing is not inherently required for visual tracking."],
      ], ["Dataset A explicitly consists of independent frames.", "Tracking metrics assume meaningful cross-frame identity and time order."], "Do not infer temporal supervision from a storage convention.", "3.8", 45),
      comparison: probe("comparison", "foundational", "For an end-to-end steering study, why is Dataset C a better direct fit than B?", ["ch3-dataset-reasoning"], 1, [
        ["It has fewer modalities, which always improves models.", "Fewer modalities are not universally better."],
        ["It pairs the input stream with the control target the study aims to predict.", "Correct. The task label matches the proposed output."],
        ["It guarantees geographic diversity.", "The table gives no domain coverage."],
        ["It contains 3D future trajectories.", "Those belong to Dataset B."],
      ], ["End-to-end learning requires aligned sensor-control examples.", "Dataset C explicitly supplies them."], "Label-task alignment can matter more than adding unrelated annotations.", "3.8", 46),
      causal: probe("causal", "intermediate", "Why can random frame-level train/test splitting inflate results on Dataset B?", ["ch3-dataset-reasoning"], 2, [
        ["Randomization always removes every easy example.", "It does not guarantee that."],
        ["The test set becomes larger than the road network by definition.", "Size is not the central issue."],
        ["Near-duplicate moments from the same 20 s sequence can land in both sets, leaking scene and track context.", "Correct. Temporal correlation violates the intended independence."],
        ["GPS and IMU cannot coexist in one dataset.", "They are commonly combined."],
      ], ["Adjacent frames share environment, actors, and appearance.", "A model can appear to generalize while recognizing nearly identical context."], "Split sequential driving data at the scene or route level when evaluating generalization.", "3.8", 46),
      transfer: probe("transfer", "advanced", "The project changes from motion prediction to road-surface segmentation. How should dataset choice change?", ["ch3-dataset-reasoning"], 3, [
        ["Keep B solely because it was selected first.", "The required target has changed."],
        ["Use A because boxes directly label every road point.", "2D object boxes are not road-surface labels."],
        ["Use C because steering angles uniquely determine road pixels.", "Controls do not provide dense segmentation supervision."],
        ["Reassess D and other sources for sensor coverage, dense road labels, domain diversity, and the intended deployment sensor.", "Correct. Dataset D now aligns more closely, but coverage and domain still require validation."],
      ], ["The output representation changed from future tracks to per-point surface class.", "Selection criteria must follow the new task and operating domain."], "Dataset suitability is conditional, not an intrinsic ranking.", "3.8", 45),
    },
  ),
  assessmentCase(
    "geographic-domain-shift",
    { kind: "log", caption: "Detection evaluation history", lines: ["training: 920 h, sunny coastal city", "validation: random clips from same fleets and routes", "validation pedestrian recall: 0.93", "deployment: snowy rural roads, road salt on lenses", "deployment pedestrian recall: 0.61", "rare winter clothing in training: 0.4%"] },
    {
      application: probe("application", "advanced", "What is the strongest data response?", ["ch3-dataset-reasoning"], 0, [
        ["Collect and label representative snowy rural scenes, use route-disjoint splits, and report performance by condition.", "Correct. It directly addresses environmental, geographic, and appearance gaps while creating a credible test."],
        ["Repeat the same random city split until recall rises.", "That measures the familiar domain again."],
        ["Delete winter deployment failures from evaluation.", "That hides the target risk."],
        ["Add only more sunny footage from the same routes.", "Volume within the old domain does not cover the missing conditions."],
      ], ["Training and validation share sources while deployment changes weather, geography, and sensor cleanliness.", "Representative collection and disjoint evaluation test the intended claim."], "Close domain gaps with targeted evidence and honest partitions.", "3.8", 46),
      diagnosis: probe("diagnosis", "intermediate", "Why did 0.93 validation recall fail to predict deployment?", ["ch3-dataset-reasoning"], 1, [
        ["Recall can only be computed in snow.", "Recall is valid in either condition but reflects its evaluation distribution."],
        ["The validation distribution was too similar to training and omitted major deployment conditions.", "Correct. The metric estimated in-domain performance, not snowy rural generalization."],
        ["All coastal pedestrians are mislabeled by definition.", "No evidence supports that."],
        ["Road salt improves every camera image.", "The log identifies lens contamination as a deployment challenge."],
      ], ["Random fleet clips preserve route and environmental overlap.", "The deployment domain contains underrepresented conditions and appearances."], "A metric is only as predictive as the population it samples.", "3.8", 46),
      comparison: probe("comparison", "foundational", "Which new evaluation slice most directly tests the suspected failure?", ["ch3-dataset-reasoning", "ch3-camera-evidence"], 2, [
        ["Sunny coastal daytime on known routes", "That repeats the current favorable slice."],
        ["Studio images of clean lenses without pedestrians", "It excludes the target and deployment artifacts."],
        ["Snowy rural scenes stratified by lens contamination and winter pedestrian appearance", "Correct. It varies the named factors in the failure domain."],
        ["A larger random sample from the old validation pool", "More of the same distribution does not isolate the shift."],
      ], ["The log names snow, rural context, salt, and rare clothing.", "A stratified slice measures where and how much each condition matters."], "Evaluate on conditions that exercise the proposed failure mechanism.", "3.8", 46),
      causal: probe("causal", "intermediate", "How can road salt reduce camera detector recall?", ["ch3-camera-evidence", "ch3-cleaning-tradeoffs"], 3, [
        ["It increases GPS satellite count.", "That does not restore image evidence."],
        ["It makes pedestrians physically transparent.", "The change is at the sensor surface."],
        ["It directly alters LiDAR beam count in this camera-only model.", "The logged detector is visual."],
        ["Deposits scatter and obscure light, reducing local contrast and changing textures from training.", "Correct. Both information loss and distribution shift can weaken detections."],
      ], ["The camera depends on light reaching the imager cleanly.", "Contamination degrades and transforms the pixels used by the detector."], "Sensor-surface condition is part of the data distribution.", "3.2", 34),
      transfer: probe("transfer", "advanced", "The model will next deploy in a dense tropical city. What lesson transfers?", ["ch3-dataset-reasoning"], 0, [
        ["Build a target-domain audit and collect representative weather, traffic, road, and sensor-condition slices before claiming readiness.", "Correct. The specific domain differs, but the need to measure coverage transfers."],
        ["Assume the snowy rural retraining covers every climate and city.", "One added domain does not guarantee universal generalization."],
        ["Use only the original coastal validation because it has the highest score.", "That score is not evidence for the tropical target."],
        ["Remove all geography metadata so shift cannot be observed.", "That prevents diagnosis rather than improving coverage."],
      ], ["Deployment conditions changed again.", "Coverage should be reassessed against the new target rather than inherited by assertion."], "Treat every material operating-domain change as a new generalization claim to test.", "3.8", 46),
    },
  ),
  assessmentCase(
    "real-sim-sensor-gap",
    { kind: "table", caption: "Same-route real and simulator captures", columns: ["Property", "Real rig", "Simulator default"], rows: [["camera FOV", "92 deg", "70 deg"], ["exposure", "auto; glare clips", "fixed; no clipping"], ["LiDAR beams", "64 with dropouts", "128 perfect"], ["timestamp jitter", "0-18 ms", "0 ms"], ["weather", "light rain", "clear"]] },
    {
      application: probe("application", "advanced", "What should be done before attributing a model gap to 'simulation' in general?", ["ch3-real-sim-validation", "ch3-dataset-reasoning"], 1, [
        ["Compare scores without changing anything because the trajectory is shared.", "Shared trajectory does not control sensor configuration and weather."],
        ["Match FOV, beam pattern, timing, exposure behavior, and weather where possible, then vary remaining gaps one at a time.", "Correct. Controlled alignment makes causal attribution more credible."],
        ["Make the simulator more visually attractive without recording settings.", "Aesthetic similarity is not a controlled sensor experiment."],
        ["Delete real captures because they contain imperfections.", "Those imperfections are part of the deployment evidence."],
      ], ["Several known variables differ simultaneously.", "Matching or ablating them distinguishes sensor-model mismatch from a vague domain label."], "A real-sim comparison needs controlled sensor conditions, not just a shared route.", "3.9", 47),
      diagnosis: probe("diagnosis", "intermediate", "A small cyclist appears only in the real camera's outer 15 degrees. Why is a simulator miss not yet a model-quality comparison?", ["ch3-real-sim-validation", "ch3-camera-evidence"], 2, [
        ["Cyclists cannot exist in simulators.", "They can be represented."],
        ["Real cameras never have defined FOV.", "The table reports one."],
        ["The simulator's narrower FOV excludes the cyclist from its input, so the evaluated evidence differs.", "Correct. A detector cannot find an object outside the rendered frame."],
        ["LiDAR beam count determines camera crop exactly.", "Those are separate configurations."],
      ], ["The real FOV is 22 degrees wider.", "Input coverage must be comparable before attributing output difference to learning."], "Check whether both systems were given the same observable scene before comparing algorithms.", "3.9", 47),
      comparison: probe("comparison", "foundational", "Which simulator change most directly tests sensitivity to the real LiDAR's missing returns?", ["ch3-real-sim-validation", "ch3-range-sensors"], 3, [
        ["Increase virtual camera saturation only", "That does not alter point-cloud completeness."],
        ["Add more perfect beams", "That moves farther from the real sampling pattern."],
        ["Remove all timestamps", "It confounds timing rather than isolating dropout."],
        ["Match the 64-beam layout and inject measured range-dependent dropout while holding the route fixed", "Correct. It changes the hypothesized LiDAR factor under control."],
      ], ["The causal factor is missing point evidence.", "A matched beam and dropout model isolates its effect on downstream performance."], "Simulation is most useful when parameters encode measured sensor behavior.", "3.9", 47),
      causal: probe("causal", "intermediate", "Why can perfect zero-jitter simulation overestimate fusion performance?", ["ch3-real-sim-validation", "ch3-fusion-design"], 0, [
        ["It removes temporal misalignment that can corrupt real cross-modal correspondence for moving objects.", "Correct. A model may never learn or endure the real timing variation."],
        ["It forces all simulated objects to stop moving.", "Zero timestamp jitter does not imply zero object motion."],
        ["It changes camera pixels into GPS coordinates.", "No such conversion occurs."],
        ["It guarantees worse calibration than the real rig.", "It may instead make alignment unrealistically easy."],
      ], ["Real measurements may refer to slightly different instants.", "Perfect simulated timing removes a source of association and projection error."], "A simulator that omits uncertainty can produce optimistic system estimates.", "3.9", 47),
      transfer: probe("transfer", "advanced", "A second simulator has photorealistic rendering but undocumented LiDAR noise. How should it be evaluated?", ["ch3-real-sim-validation", "ch3-dataset-reasoning"], 1, [
        ["Accept it because appearance alone proves sensor fidelity.", "Visual realism does not validate range noise."],
        ["Run matched-scene distribution and task comparisons for each modality, documenting unsupported settings.", "Correct. Modality-specific evidence is needed before claiming transfer fidelity."],
        ["Compare only total file size.", "Storage size does not establish physical realism."],
        ["Assume undocumented parameters equal the real rig.", "That is precisely the uncertainty to measure."],
      ], ["Photorealism addresses only part of the sensor stack.", "Matched measurements and downstream ablations expose whether LiDAR behavior transfers."], "Validate simulation fidelity per sensor and task, not as one visual impression.", "3.9", 47),
    },
  ),
  assessmentCase(
    "fusion-ablation-evidence",
    { kind: "table", caption: "3D detection ablation", columns: ["Model", "Day mAP", "Rain mAP", "Pedestrian rain recall"], rows: [["Camera + LiDAR fusion", "0.74", "0.61", "0.68"], ["Camera only", "0.69", "0.38", "0.41"], ["LiDAR only", "0.63", "0.55", "0.62"]] },
    {
      application: probe("application", "advanced", "Which deployment conclusion is best supported?", ["ch3-fusion-design", "ch3-dataset-reasoning"], 2, [
        ["Remove LiDAR because camera-only day mAP is high.", "That ignores the severe rain loss."],
        ["Claim fusion has solved all adverse-weather sensing.", "Rain performance remains lower than day and no universal claim is justified."],
        ["Retain fusion for complementary robustness and investigate the remaining rain gap with condition-specific tests.", "Correct. Fusion leads each reported slice, while the residual degradation remains material."],
        ["Deploy LiDAR only because it has the lowest day score.", "Lower day performance is not an advantage."],
      ], ["Fusion improves both day and rain results relative to either ablation.", "Its rain score still trails its own day score."], "Use ablations to identify modality contribution without turning a relative gain into a solved-problem claim.", "3.9", 47),
      diagnosis: probe("diagnosis", "intermediate", "What does the camera-only rain collapse suggest?", ["ch3-camera-evidence", "ch3-fusion-design"], 3, [
        ["Cameras cannot detect anything in daylight.", "Day mAP is strong."],
        ["LiDAR labels are leaking into the camera-only branch.", "The table alone does not show leakage."],
        ["Rain improves visual contrast for every target.", "The measured direction is opposite."],
        ["The visual branch is especially sensitive to adverse appearance, and LiDAR supplies partially compensating geometry.", "Correct. The ablation pattern supports complementary failure behavior."],
      ], ["Camera-only loses 0.31 mAP from day to rain, much more than LiDAR-only.", "Fusion rain performance is closer to the LiDAR result while exceeding it."], "Conditioned ablations reveal when a modality contributes, not merely whether it contributes on average.", "3.6", 42),
      comparison: probe("comparison", "foundational", "Which comparison isolates the incremental value of camera evidence in rain most directly?", ["ch3-fusion-design"], 0, [
        ["Fusion rain performance versus LiDAR-only rain performance", "Correct. These configurations differ by adding camera evidence to the LiDAR baseline, assuming training is otherwise controlled."],
        ["Camera-only day versus LiDAR-only rain", "Both modality and condition change."],
        ["Fusion day versus camera-only rain", "Weather and architecture both change."],
        ["Pedestrian recall versus overall mAP within one row", "Those are different metrics and targets."],
      ], ["A useful ablation changes one component at a time.", "The rain fusion-to-LiDAR comparison holds the condition fixed."], "Design comparisons that isolate the contribution being claimed.", "3.9", 47),
      causal: probe("causal", "intermediate", "Why can fusion exceed both single-modality models rather than merely average them?", ["ch3-fusion-design"], 1, [
        ["Fusion creates new physical photons and laser returns.", "It cannot add raw facts that were never sensed."],
        ["Joint reasoning can use visual semantics and LiDAR geometry to resolve ambiguities each branch retains alone.", "Correct. Complementary features can support better decisions than either isolated representation."],
        ["The lowest score is automatically discarded from every example.", "Fusion is not necessarily an oracle selector."],
        ["All errors across sensors are guaranteed independent.", "Some failures are correlated, so this cannot be assumed."],
      ], ["Camera and LiDAR measure different aspects of the scene.", "A learned or designed fusion stage can exploit agreement and complementary detail."], "Fusion gains arise from complementary evidence, not arithmetic averaging alone.", "3.6", 42),
      transfer: probe("transfer", "advanced", "Radar is proposed as a third modality. Which study best tests its value?", ["ch3-fusion-design", "ch3-dataset-reasoning"], 2, [
        ["Add radar and report one aggregate metric without baselines.", "That cannot isolate contribution or operating condition."],
        ["Test radar only on the sunny training set.", "That misses the conditions motivating radar robustness."],
        ["Run controlled with/without-radar ablations by weather, range, and motion, including latency and calibration cost.", "Correct. It measures both contribution and system price in the relevant regimes."],
        ["Assume radar helps because it is a different sensor.", "Different modalities can still add little or introduce new failures."],
      ], ["Radar's expected contribution is conditional on weather and motion evidence.", "Compute and alignment costs can offset accuracy gains."], "Evaluate each added sensor through controlled, condition-aware system ablations.", "3.9", 47),
    },
  ),
  assessmentCase(
    "multi-environment-suite",
    { kind: "table", caption: "Operating requirements for one vehicle", columns: ["Scene", "Critical evidence", "Constraint"], rows: [["foggy highway", "long-range closing speed", "poor contrast"], ["tunnel", "continuous ego motion", "GPS unavailable"], ["parking", "0.2-3 m clearance", "tight geometry"], ["urban signs", "text/color semantics", "mixed lighting"]] },
    {
      application: probe("application", "advanced", "Which sensor suite is best justified by the full table?", ["ch3-sensor-evidence", "ch3-fusion-design"], 3, [
        ["GPS alone", "It fails in the tunnel and does not measure obstacles or sign semantics."],
        ["Ultrasonic sensors alone", "They help nearby parking clearance but not long-range speed or visual semantics."],
        ["One front camera with no motion sensors", "It lacks robust direct range-rate, short-range coverage, and tunnel continuity."],
        ["Camera, radar, LiDAR or equivalent geometry sensing, ultrasonic, and fused GPS/IMU with calibrated timing", "Correct. The complementary suite covers the distinct quantities and failure settings."],
      ], ["No single listed modality supplies every critical quantity under every constraint.", "The combined suite pairs semantics, geometry, motion, near-field range, and localization continuity."], "Sensor selection should cover decision variables and failure modes across the operating design domain.", "3.1", 33),
      diagnosis: probe("diagnosis", "intermediate", "A design uses camera and GPS only. Which requirement is least adequately supported?", ["ch3-sensor-evidence", "ch3-range-sensors"], 0, [
        ["Reliable long-range closing speed in fog", "Correct. Visual contrast is poor and GPS does not directly measure another object's relative velocity."],
        ["Reading sign color in clear daylight", "The camera directly supports this."],
        ["Global position before entering the tunnel", "GPS may provide it when reception is good."],
        ["Recording an RGB image", "The camera does so by design."],
      ], ["The critical missing quantity is another object's range rate under degraded vision.", "Radar is designed to contribute that evidence."], "Find coverage gaps by tracing each requirement to a physical measurement.", "3.2", 35),
      comparison: probe("comparison", "foundational", "Why are ultrasonic sensors more useful in parking than on the foggy highway?", ["ch3-range-sensors"], 1, [
        ["They recognize sign text at all distances.", "They provide short-range echo distance, not visual semantics."],
        ["Their short-range distance sensing matches nearby clearance, not a target tens of meters ahead.", "Correct. Utility depends on the sensor's operating range and the decision horizon."],
        ["They replace IMU angular-rate measurements.", "They do not measure ego rotation."],
        ["Fog makes ultrasound travel backward.", "That is not the reason for the task mismatch."],
      ], ["Parking hazards occur within the near-field envelope.", "Highway braking requires earlier evidence at much longer range."], "A sensor can be valuable in one horizon and uninformative in another.", "3.2", 35),
      causal: probe("causal", "intermediate", "Why is calibrated timing still necessary after choosing complementary sensors?", ["ch3-fusion-design", "ch3-processing-limits"], 2, [
        ["It makes every sensor measure the same physical quantity.", "Complementarity means they intentionally measure different things."],
        ["It eliminates all environmental degradation.", "Fog, glare, and blockage still occur."],
        ["Fusion must relate measurements to a common scene state; motion during offsets otherwise creates false disagreement.", "Correct. Complementary data are useful only when their time relationship is known."],
        ["It raises ultrasonic range to highway distance.", "Synchronization does not change sensor physics."],
      ], ["The vehicle and surrounding objects move between captures.", "A common temporal reference is required for valid spatial association."], "Coverage without alignment can turn complementary evidence into contradiction.", "3.6", 42),
      transfer: probe("transfer", "advanced", "Cost forces removal of one modality. How should the decision be made?", ["ch3-sensor-evidence", "ch3-dataset-reasoning"], 3, [
        ["Remove the physically largest sensor without testing.", "Size is not the stated safety objective."],
        ["Remove the modality with the fewest raw bytes.", "Data volume does not measure unique coverage."],
        ["Choose whichever sensor has the lowest standalone benchmark in sunny scenes.", "Standalone aggregate results can hide unique adverse-condition value."],
        ["Run requirement-level and condition-level ablations, then document uncovered hazards and mitigations before removal.", "Correct. It reveals unique contribution and residual risk."],
      ], ["Each modality covers different rows and failure modes.", "A controlled ablation quantifies what alternatives can and cannot replace."], "Cost decisions need explicit evidence about lost safety coverage.", "3.8", 46),
    },
  ),
];

export const chapter3Assessment: ChapterAssessment = {
  chapterId: 3,
  objectives,
  cases,
};
