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
  const choices = choiceSpecs.map(([text, feedback, misconception], index) => ({ id: CHOICE_IDS[index], text, feedback, misconception })) as AssessmentProbe["choices"];
  return { skill, difficulty, prompt, objectiveIds, choices, correctChoiceId: CHOICE_IDS[correctIndex], reasoning, takeaway, references: [{ section, page }] };
}

function assessmentCase(id: string, stimulus: AssessmentCase["stimulus"], probes: AssessmentCase["probes"]): AssessmentCase {
  return { id, chapterId: 8, stimulus, probes };
}

const objectives: ChapterAssessment["objectives"] = [
  { id: "ch8-dbw-loop", chapterId: 8, behavior: "Trace commands, measured state, ECU computation, communication, and actuator response through a drive-by-wire feedback loop.", priority: "core", references: [{ section: "8.1-8.2", page: 124 }] },
  { id: "ch8-network-timing", chapterId: 8, behavior: "Diagnose control risk caused by network delay, jitter, loss, ordering, and stale signals.", priority: "core", references: [{ section: "8.2-8.3", page: 125 }] },
  { id: "ch8-redundancy-faults", chapterId: 8, behavior: "Use independent sensors, ECUs, power, communication, and actuators to detect faults and preserve bounded control.", priority: "core", references: [{ section: "8.3", page: 126 }] },
  { id: "ch8-longitudinal-control", chapterId: 8, behavior: "Reason about throttle and braking commands for speed, gap, and stopping objectives.", priority: "core", references: [{ section: "8.4", page: 127 }] },
  { id: "ch8-lateral-control", chapterId: 8, behavior: "Reason about steering, cross-track error, heading, curvature, speed, and look-ahead effects.", priority: "core", references: [{ section: "8.4", page: 127 }] },
  { id: "ch8-integrated-control", chapterId: 8, behavior: "Coordinate longitudinal and lateral actions when tire force, stability, comfort, and collision constraints interact.", priority: "core", references: [{ section: "8.4", page: 128 }] },
  { id: "ch8-pid-response", chapterId: 8, behavior: "Infer proportional, integral, and derivative effects from response traces and tune against rise time, bias, overshoot, noise, and oscillation.", priority: "core", references: [{ section: "8.5", page: 128 }] },
  { id: "ch8-saturation-windup", chapterId: 8, behavior: "Diagnose actuator saturation and integral windup and choose bounded anti-windup behavior.", priority: "core", references: [{ section: "8.5", page: 129 }] },
  { id: "ch8-mpc-prediction", chapterId: 8, behavior: "Reason about prediction horizon, vehicle model, state estimates, receding updates, and cost weights.", priority: "core", references: [{ section: "8.6", page: 129 }] },
  { id: "ch8-mpc-constraints", chapterId: 8, behavior: "Encode and interpret actuator, state, stability, and obstacle constraints including infeasibility.", priority: "core", references: [{ section: "8.6", page: 130 }] },
  { id: "ch8-stability-fallback", chapterId: 8, behavior: "Select monitoring, degraded modes, and minimal-risk fallback from control and hardware evidence.", priority: "core", references: [{ section: "8.3-8.7", page: 126 }] },
];

const cases: AssessmentCase[] = [
  assessmentCase(
    "steering-command-feedback-mismatch",
    { kind: "log", caption: "Steer-by-wire step test at 10 km/h", lines: ["commanded road-wheel angle: +8 deg", "ECU command timestamp age: 3 ms", "motor current: limit for 420 ms", "measured road-wheel angle: +2.1 deg", "steering-angle sensors A/B: +2.1 / +2.2 deg", "vehicle yaw response: small"] },
    {
      application: probe("application", "advanced", "What is the safest immediate controller response?", ["ch8-dbw-loop", "ch8-stability-fallback"], 0, [
        ["Declare lost steering authority and execute the bounded stop", "Correct. Independent feedback confirms that the requested angle is not being achieved despite saturated effort."], ["Keep increasing the command until feedback equals 8 degrees", "More demand cannot create authority beyond the current limit and may destabilize the maneuver."], ["Replace measured angle with the command in the state estimator", "That hides the physical mismatch."], ["Assume the vehicle turned because the network was timely", "Delivery of a command is not proof of execution."],
      ], ["The feedback sensors agree and yaw remains small.", "Motor current at the limit indicates insufficient actuation rather than missing command delivery."], "Close the loop on measured physical response, and degrade safely when commanded authority is unavailable.", "8.2", 125),
      diagnosis: probe("diagnosis", "intermediate", "Which component is most directly implicated?", ["ch8-dbw-loop"], 1, [
        ["The communication path, because all commands are old", "The command age is only 3 ms."], ["A saturated steering actuator or mechanical load", "Correct. Command and feedback arrive, but physical output is limited."], ["Both angle sensors, because they agree", "Agreement with yaw makes a common false value less likely."], ["The speed planner, because 10 km/h is not a number", "The speed is valid and not the central mismatch."],
      ], ["The signal path appears timely.", "The command-to-action conversion fails at high motor effort."], "Separate command generation, transport, actuation, and feedback when localizing a DbW fault.", "8.2", 125),
      comparison: probe("comparison", "foundational", "Which evidence most strongly shows that the command was not physically executed?", ["ch8-dbw-loop"], 2, [
        ["The command is +8 degrees", "That states intent only."], ["The ECU timestamp is recent", "That shows timing, not wheel position."], ["Measured angle and yaw remain small", "Correct. Independent measurements describe the actual response."], ["The vehicle uses electronic steering", "Architecture alone does not establish this event."],
      ], ["Actuator feedback measures achieved state.", "Yaw supplies an independent vehicle-level consequence consistent with it."], "Distinguish requested control from verified control.", "8.2", 124),
      causal: probe("causal", "intermediate", "Why can integrator action be dangerous if it continues during this saturation?", ["ch8-saturation-windup", "ch8-stability-fallback"], 3, [
        ["It makes the sensors stop reporting angle", "Sensor reporting is separate."], ["It reduces every stored error to zero", "Persistent error causes accumulation."], ["It mechanically releases the steering load", "The controller cannot directly remove the fault."], ["Integral windup during saturation", "Correct. The actuator cannot realize the command while the integral state keeps growing."],
      ], ["The error remains large while output is capped.", "Recovery can expose the accumulated integral command all at once."], "Freeze or back-calculate integral state when actuator authority is constrained.", "8.5", 129),
      transfer: probe("transfer", "advanced", "Brake pressure is commanded but measured deceleration remains near zero while valve current saturates. What transfers?", ["ch8-dbw-loop", "ch8-redundancy-faults"], 0, [
        ["Lost authority requiring redundant braking", "Correct. The same command-versus-response logic applies to a more urgent actuator."], ["Increase target speed so error decreases", "That abandons the stopping objective."], ["Trust the valve current as proof of deceleration", "Effort is not achieved braking."], ["Disable wheel-speed feedback", "That removes critical verification."],
      ], ["The actuator is being driven but the controlled state does not respond.", "Independent braking paths and immediate fallback are required."], "Verify every safety-critical command through physical response and redundant evidence.", "8.3", 126),
    },
  ),
  assessmentCase(
    "can-command-jitter",
    { kind: "table", caption: "Brake command delivery during adaptive cruise", columns: ["Cycle", "Command", "CAN age on arrival", "Sequence"], rows:[[101,"-0.8 m/s2","4 ms",101],[102,"-1.2 m/s2","6 ms",102],[103,"-2.0 m/s2","74 ms",103],[104,"-0.4 m/s2","5 ms",104],[105,"-1.7 m/s2","41 ms",105]] },
    {
      application: probe("application", "advanced", "Which network-side policy best protects the actuator?", ["ch8-network-timing", "ch8-stability-fallback"], 1, [
        ["Execute every command eventually in arrival order", "A stale braking request can be unsafe after the scene changes."], ["Reject stale commands; enter fallback", "Correct. It bounds state-command mismatch while exposing loss of real-time service."], ["Remove timestamps to save bandwidth", "That prevents freshness checks."], ["Apply the largest historical brake command forever", "A worst old command is not necessarily appropriate now."],
      ], ["Two commands arrive far outside the usual 4-6 ms range.", "Real-time control requires a freshness contract and a response when it is violated."], "Communication correctness includes timing, not just eventual delivery.", "8.2", 125),
      diagnosis: probe("diagnosis", "intermediate", "What failure would a test that checks only sequence numbers miss?", ["ch8-network-timing"], 2, [
        ["A duplicated sequence number", "A sequence check can detect that."], ["A missing integer", "It can detect gaps."], ["Late but ordered command delivery", "Correct. All sequence values are ordered even when age spikes."], ["The presence of acceleration units", "Units are not the timing failure."],
      ], ["Rows 103 and 105 preserve order.", "Their latency nevertheless violates the observed real-time pattern."], "Validate latency and jitter separately from integrity and ordering.", "8.3", 126),
      comparison: probe("comparison", "foundational", "Which cycle presents the clearest stale-command risk?", ["ch8-network-timing"], 3, [
        ["101, because it is the first row", "Its age is low."], ["102, because -1.2 has a decimal", "Numeric formatting is irrelevant."], ["104, because braking is smaller", "Its command is fresh."], ["Cycle 103, with 74 ms age", "Correct. The control request may reflect a substantially older scene."],
      ], ["Command age measures how long the state may have evolved since computation.", "Cycle 103 has the greatest mismatch window."], "Judge network data by freshness relative to the control dynamics.", "8.3", 126),
      causal: probe("causal", "intermediate", "Why can irregular delay create oscillatory gap control even if every command is numerically reasonable?", ["ch8-network-timing", "ch8-longitudinal-control"], 0, [
        ["Late corrections act on obsolete state", "Correct. Variable phase delay destabilizes feedback."], ["CAN messages physically move the lead vehicle", "They only control ego actuators."], ["Reasonable numbers guarantee stable timing", "Control stability depends on when they act."], ["Delay removes the vehicle's inertia", "Inertia remains."],
      ], ["Feedback assumes a known relationship between measurement, computation, and actuation time.", "Jitter changes that relationship from cycle to cycle."], "Timing uncertainty is a control-loop disturbance, not merely an IT metric.", "8.3", 126),
      transfer: probe("transfer", "advanced", "Steering commands arrive fresh but feedback frames are sometimes 90 ms old. What transfers?", ["ch8-network-timing", "ch8-dbw-loop"], 1, [
        ["Fresh command timestamps prove the full loop is fresh", "Feedback age remains a separate risk."], ["Age-check feedback and degrade on stale state", "Correct. Stale feedback corrupts the state used for control."], ["Use old angle as exact because it is measured", "A measurement can be accurate for an obsolete time."], ["Increase steering gain to compensate for unknown age", "That can amplify instability."],
      ], ["Control uses both outgoing commands and incoming state.", "Either direction can make the loop act on obsolete information."], "A real-time contract must cover the entire feedback path.", "8.2", 125),
    },
  ),
  assessmentCase(
    "redundant-angle-disagreement",
    { kind: "log", caption: "Steering sensor monitor", lines: ["angle sensor A: +6.2 deg", "angle sensor B: -5.9 deg", "EPS motor encoder: +6.0 deg", "yaw rate: consistent with left turn", "A/B share one power rail; encoder uses independent rail", "fault appears after B connector service"] },
    {
      application: probe("application", "advanced", "What should the ECU do next?", ["ch8-redundancy-faults", "ch8-stability-fallback"], 2, [
        ["Average A and B to near zero and command harder left", "Averaging a likely fault creates a false state."], ["Trust B because negative angles are more conservative", "Sign alone is not a reliability criterion."], ["Isolate B and limit steering through the backup path", "Correct. Independent evidence supports A/encoder while preserving caution about common dependencies."], ["Ignore all feedback and use commands as measurements", "That opens the physical loop."],
      ], ["Three independent physical cues support a left turn.", "B alone disagrees and was recently serviced."], "Redundancy needs disagreement logic and independence, not blind voting.", "8.3", 126),
      diagnosis: probe("diagnosis", "intermediate", "Which explanation best fits the evidence?", ["ch8-redundancy-faults"], 3, [
        ["The road causes angles to have opposite signs", "One wheel-angle state cannot simultaneously have both signs."], ["Both A and the motor encoder fail identically while yaw also lies", "That requires several coordinated faults."], ["CAN delivery reverses only B's physical connector", "The service clue is local to B."], ["Sensor B or its service path has a polarity/wiring fault", "Correct. Its sign is inverted against independent state evidence."],
      ], ["The mismatch begins after connector work.", "The other feedback channels form a consistent physical account."], "Use fault signatures and maintenance history to localize disagreement.", "8.3", 126),
      comparison: probe("comparison", "foundational", "Which evidence is most independent of the two angle sensors?", ["ch8-redundancy-faults"], 0, [
        ["Vehicle yaw response", "Correct. It observes the vehicle motion caused by steering rather than the same sensor circuit."], ["A minus B", "That uses both disputed channels."], ["Their shared power voltage alone", "It can reveal common supply faults but not achieved turn direction here."], ["A copied angle message", "A copy is not independent."],
      ], ["Functional redundancy can observe the same outcome through different physics.", "Yaw confirms the direction of vehicle response."], "Diverse evidence is stronger than duplicated values sharing one failure path.", "8.3", 126),
      causal: probe("causal", "intermediate", "Why does the shared A/B power rail weaken a simple two-sensor safety argument?", ["ch8-redundancy-faults"], 1, [
        ["A shared rail guarantees opposite signs", "It does not."], ["The shared rail creates a common-cause fault", "Correct. Common-cause faults defeat naive redundancy counts."], ["Power has no role in electronic sensing", "Sensors require it."], ["The encoder necessarily shares every dependency too", "The log says it uses an independent rail."],
      ], ["Redundancy protects against independent faults only to the degree paths are separated.", "A common rail is a shared vulnerability."], "Count independent failure domains, not just sensor units.", "8.7", 131),
      transfer: probe("transfer", "advanced", "Two brake-pressure sensors agree but share one reference line, while wheel deceleration disagrees. What transfers?", ["ch8-redundancy-faults", "ch8-dbw-loop"], 2, [
        ["Two equal numbers must override vehicle motion", "Shared dependency can make agreement misleading."], ["Wheel deceleration is irrelevant to braking", "It is a direct vehicle response."], ["Test common-mode agreement against wheel response", "Correct. Diversity exposes a fault hidden by duplicated channels."], ["Increase pressure solely because the sensors agree", "If their reference is wrong, that may be unsafe."],
      ], ["Both pressure channels can fail together through their reference.", "The physical effect does not match their claim."], "Redundant control verification should cross electrical and physical domains.", "8.3", 126),
    },
  ),
  assessmentCase(
    "brake-redundancy-power-loss",
    { kind: "table", caption: "Emergency-braking architecture fault injection", columns: ["Path", "Power", "Network", "Actuator", "Result"], rows:[["Primary ECU","main 12 V","CAN-A","front brake motor","offline"],["Backup ECU","main 12 V","CAN-B","rear brake motor","offline"],["Mechanical parking brake","independent spring","hardwired","rear latch","available"]] },
    {
      application: probe("application", "advanced", "What design change most directly removes the demonstrated common-mode failure?", ["ch8-redundancy-faults"], 3, [
        ["Add another message on CAN-A", "The failure is loss of shared power, not message count."], ["Run both ECUs on the same larger fuse", "That retains a common power dependency."], ["Remove the independent parking brake", "That discards the only remaining path."], ["Add an independent brake-power path", "Correct. Redundant compute and networks are ineffective when both depend on one failed supply."],
      ], ["Both electronic paths fail together despite separate ECUs and networks.", "Their common 12 V supply is the shared cut set."], "Fault tolerance must separate power, compute, communication, and actuation dependencies.", "8.7", 131),
      diagnosis: probe("diagnosis", "intermediate", "Why did two-network redundancy not preserve service braking?", ["ch8-redundancy-faults"], 0, [
        ["Shared power disabled both ECUs", "Correct. A healthy communication path cannot energize an unpowered ECU or actuator."], ["CAN-B always copies CAN-A faults", "The table does not show a network fault."], ["Rear brakes cannot be electronic", "The architecture includes a rear motor."], ["Parking brakes prevent all service braking", "The parking path remains available but is separate."],
      ], ["CAN-A and CAN-B are distinct and not reported failed.", "Both ECUs list the same unavailable power source."], "Redundancy in one layer cannot compensate for a common dependency in another.", "8.3", 126),
      comparison: probe("comparison", "foundational", "Which path currently offers any deceleration authority?", ["ch8-redundancy-faults", "ch8-stability-fallback"], 1, [
        ["Primary ECU on CAN-A", "It is offline."], ["Independent parking brake", "Correct. It remains available, though its limited behavior must be controlled."], ["Backup ECU on CAN-B", "It shares the lost supply and is offline."], ["An imaginary hydraulic circuit", "None is listed."],
      ], ["Availability must be read across the whole path.", "Only the spring-powered hardwired mechanism has every needed dependency."], "Fallback planning should use verified remaining authority, not nominal architecture labels.", "8.3", 126),
      causal: probe("causal", "intermediate", "Why should the parking brake be applied through a stability-aware strategy rather than latched instantly at speed?", ["ch8-integrated-control", "ch8-stability-fallback"], 2, [
        ["It changes the road's friction coefficient", "The surface remains the same."], ["It restores ECU power", "It is an independent actuator, not a generator."], ["Rear-only braking can destabilize yaw", "Correct. Remaining authority can introduce a new vehicle-dynamics hazard."], ["A parking brake has no physical effect", "It is the only available deceleration path."],
      ], ["The fallback acts primarily at the rear axle.", "Tire-force imbalance at speed can affect directional stability."], "A fallback must be controllable and stable, not merely available.", "8.4", 128),
      transfer: probe("transfer", "advanced", "A steer-by-wire system has two ECUs but one shared steering motor. What transfers?", ["ch8-redundancy-faults"], 3, [
        ["Two ECUs guarantee steering after any fault", "The single motor remains a critical point."], ["Network redundancy replaces actuator redundancy", "A delivered command cannot move a failed actuator."], ["The motor can be ignored in failure analysis", "It is the final physical link."], ["Add actuator redundancy or a bounded fallback", "Correct. Redundancy must extend to the physical function or explicitly bound loss."],
      ], ["Both controllers ultimately depend on one actuator.", "Its failure defeats upstream redundancy."], "Trace safety paths all the way to physical force generation.", "8.3", 126),
    },
  ),
  assessmentCase(
    "lead-vehicle-stop-response",
    { kind: "log", caption: "Longitudinal controller at 22 m/s", lines: ["desired time gap: 2.0 s", "measured gap: 1.6 s and shrinking", "lead deceleration: -2.5 m/s2", "ego throttle: 8% for 300 ms", "ego brake: 0%", "speed setpoint: 22 m/s", "gap objective and speed objective are evaluated separately"] },
    {
      application: probe("application", "advanced", "What control change is most defensible?", ["ch8-longitudinal-control", "ch8-integrated-control"], 0, [
        ["Brake for the shrinking gap", "Correct. Maintaining a cruise setpoint is subordinate to collision avoidance."], ["Hold 22 m/s because the speed error is zero", "That ignores the lead vehicle and closing gap."], ["Steer randomly to create distance", "Unplanned lateral action introduces new hazards."], ["Wait until gap reaches zero before braking", "That eliminates stopping margin."],
      ], ["The vehicle meets speed but violates and worsens the following objective.", "Relative motion requires an immediate longitudinal response."], "Longitudinal control must arbitrate speed tracking against safety-critical gap constraints.", "8.4", 127),
      diagnosis: probe("diagnosis", "intermediate", "What architecture error explains continued throttle?", ["ch8-longitudinal-control", "ch8-integrated-control"], 1, [
        ["Brake-by-wire cannot receive negative acceleration", "It is designed to execute braking commands."], ["The speed and gap loops lack safety arbitration", "Correct. Separate objectives issue incompatible implications without priority."], ["The time gap is longer than desired", "It is shorter and shrinking."], ["Throttle percentage measures lead speed", "It is ego actuation."],
      ], ["The speed loop sees no error and retains throttle.", "The gap loop's safety meaning is not integrated into the command."], "Coordinate objectives before they reach mutually exclusive actuators.", "8.4", 128),
      comparison: probe("comparison", "foundational", "Which state is most important for deciding the first response?", ["ch8-longitudinal-control"], 2, [
        ["Absolute map longitude", "It does not determine imminent closing risk."], ["Cabin temperature", "It is unrelated."], ["Gap and range rate", "Correct. They determine how quickly the safety margin is being consumed."], ["Steering-wheel color", "It carries no longitudinal state."],
      ], ["Collision risk depends on separation and relative motion.", "Cruise speed alone misses a decelerating leader."], "Choose state variables that directly describe the controlled safety objective.", "8.4", 127),
      causal: probe("causal", "intermediate", "Why can a controller with excellent constant-speed tracking still perform poorly here?", ["ch8-longitudinal-control"], 3, [
        ["A set speed physically prevents braking", "The target can be overridden."], ["Good tracking guarantees the lead vehicle matches ego", "The leader has independent behavior."], ["Speed error contains every possible traffic state", "It omits gap and relative velocity."], ["Speed-only feedback omits the obstacle constraint", "Correct. It solves the wrong narrow objective accurately."],
      ], ["Ego speed exactly matches its reference.", "The safety problem exists in relational state outside that loop."], "Controller quality is conditional on choosing the right objective and state.", "8.4", 127),
      transfer: probe("transfer", "advanced", "At a red light, the stop-line controller and comfort controller disagree. What transfers?", ["ch8-longitudinal-control", "ch8-mpc-constraints"], 0, [
        ["Constrain the stop, then optimize comfort", "Correct. Comfort should shape a safe stop, not veto it."], ["Average stop and continue commands", "The average may still cross the line."], ["Honor comfort whenever its confidence is higher", "Confidence is not objective priority."], ["Remove deceleration limits entirely", "Physical and comfort bounds remain important."],
      ], ["One objective is mandatory while the other is a preference.", "A constrained controller can preserve that hierarchy."], "Separate required safety conditions from costs that optimize behavior within them.", "8.6", 130),
    },
  ),
  assessmentCase(
    "high-speed-curve-lookahead",
    { kind: "table", caption: "Pure-pursuit path trial", columns: ["Speed", "Look-ahead", "Peak cross-track error", "Steering reversals"], rows:[["15 km/h","3 m","0.12 m",0],["70 km/h","3 m","0.86 m",7],["70 km/h","12 m","0.29 m",1]] },
    {
      application: probe("application", "advanced", "Which next configuration is best supported for the 70 km/h curve?", ["ch8-lateral-control"], 1, [
        ["Keep 3 m because it worked at low speed", "The high-speed trace shows large error and reversals."], ["Use speed-aware look-ahead", "Correct. The 12 m trial is much smoother at speed, but curvature tradeoffs still require testing."], ["Set look-ahead to zero", "That creates an undefined or hyper-reactive target."], ["Ignore cross-track error and count only speed", "Lateral tracking is the task."],
      ], ["The same short look-ahead becomes oscillatory at high speed.", "The longer look-ahead improves both measured metrics."], "Tune geometric lateral control against speed and path curvature, not one fixed distance.", "8.4", 127),
      diagnosis: probe("diagnosis", "intermediate", "Why does the 3 m setting degrade at 70 km/h?", ["ch8-lateral-control"], 2, [
        ["The road has fewer meters at high speed", "Road geometry is unchanged."], ["Pure pursuit stops producing angles above 15 km/h", "It still produces commands."], ["The near target overreacts at high speed", "Correct. The vehicle travels farther during each reaction and can chase the path."], ["Cross-track error becomes a longitudinal variable", "It remains lateral."],
      ], ["Speed changes how quickly the vehicle advances during sensing and actuation.", "A short look-ahead can command alternating corrections before the response settles."], "Controller geometry must be scaled to vehicle dynamics and timing.", "8.4", 127),
      comparison: probe("comparison", "foundational", "What evidence favors 12 m over 3 m at 70 km/h?", ["ch8-lateral-control"], 3, [
        ["It is numerically larger", "Size alone is not the objective."], ["It was tested at low speed", "Both relevant rows are at 70 km/h."], ["It guarantees zero error everywhere", "The error is 0.29 m."], ["Less error and fewer reversals", "Correct. The comparison holds speed fixed."],
      ], ["A controlled comparison changes look-ahead while keeping speed constant.", "Both lateral accuracy and smoothness improve."], "Prefer evidence from matched-condition controller trials.", "8.4", 127),
      causal: probe("causal", "intermediate", "Why might an excessively long look-ahead cut a sharp corner?", ["ch8-lateral-control"], 0, [
        ["It underweights local curvature", "Correct. Smoothing the path view can omit needed near-term turning."], ["It increases road friction", "Look-ahead is computational."], ["It rotates the steering sensor", "It changes target selection, not calibration."], ["It forces the vehicle to reverse", "No such rule exists."],
      ], ["A distant point summarizes a larger path segment.", "Local curve detail influences the command less strongly."], "The setting trades responsiveness to curvature against high-speed smoothness.", "8.4", 127),
      transfer: probe("transfer", "advanced", "A Stanley controller oscillates only at highway speed. What transfers?", ["ch8-lateral-control", "ch8-stability-fallback"], 1, [
        ["Copy the 12 m look-ahead parameter even though Stanley has no equivalent knob", "Transfer the evaluation logic, not an unrelated parameter."], ["Retune speed scaling, gains, and delay", "Correct. High-speed dynamics can destabilize another lateral law through different parameters."], ["Assume every oscillation is a map error", "Controller and timing causes remain plausible."], ["Increase all gains together", "That can worsen oscillation."],
      ], ["The failure is condition-dependent on speed.", "Relevant controller sensitivities and delays should be replayed under that condition."], "Transfer diagnostic structure across controllers while respecting their distinct mechanisms.", "8.4", 127),
    },
  ),
  assessmentCase(
    "braking-lane-change-coupling",
    { kind: "log", caption: "Emergency avoidance on wet pavement", lines: ["speed: 24 m/s", "planned lateral shift: 3.4 m in 2.0 s", "independent longitudinal command: -6.0 m/s2", "independent lateral command: near steering limit", "estimated combined tire demand: 1.23 x available friction", "yaw-rate monitor: rising beyond envelope"] },
    {
      application: probe("application", "advanced", "What should integrated control do?", ["ch8-integrated-control", "ch8-stability-fallback"], 2, [
        ["Execute both independent commands exactly", "Their combined demand exceeds available friction."], ["Remove all braking and steer at the limit", "That may not preserve collision margin or stability."], ["Re-optimize within the friction envelope", "Correct. The two axes compete for limited tire force."], ["Average acceleration and steering units", "Unlike quantities cannot be averaged into a valid command."],
      ], ["Each command may be feasible alone.", "Their combination violates a shared physical constraint and the yaw response confirms instability."], "Coordinate longitudinal and lateral control through shared vehicle-dynamics limits.", "8.4", 128),
      diagnosis: probe("diagnosis", "intermediate", "What is the main architecture failure?", ["ch8-integrated-control"], 3, [
        ["The vehicle has both brakes and steering", "Those functions are necessary."], ["Wet pavement contains no friction", "It has reduced, not zero, friction."], ["The yaw sensor reports a number", "Monitoring is useful."], ["The loops violate a shared force limit", "Correct. The interface ignores coupled tire limits."],
      ], ["The aggregate demand is 23% above estimated capacity.", "No arbiter has reshaped the two commands before actuation."], "Subsystem feasibility does not imply whole-vehicle feasibility.", "8.4", 128),
      comparison: probe("comparison", "foundational", "Which condition most increases the need for integrated control?", ["ch8-integrated-control"], 0, [
        ["Hard braking and steering on low friction", "Correct. Both actions draw on the same limited force envelope."], ["A parked vehicle with no commands", "There is little interaction to coordinate."], ["Constant low-speed travel on a straight dry road", "Independent loops are less stressed."], ["Reading a map while stationary", "That is not an actuation interaction."],
      ], ["Dynamic coupling becomes critical near physical limits.", "Wet pavement reduces the shared margin."], "Integrated control matters most when axes compete for constrained authority.", "8.4", 128),
      causal: probe("causal", "intermediate", "Why can adding more steering during heavy braking increase path error?", ["ch8-integrated-control"], 1, [
        ["Steering commands always reduce wheel angle", "They request more angle."], ["Saturated tires lose lateral authority", "Correct. Command magnitude is not realized force beyond the friction envelope."], ["Braking makes the planned path disappear", "The path remains a reference."], ["Yaw rate is unrelated to tire force", "It is a key stability response."],
      ], ["Tires have finite combined longitudinal and lateral capacity.", "Once saturated, larger commands can worsen slip rather than tracking."], "Controllers must reason about achievable forces, not just requested inputs.", "8.4", 128),
      transfer: probe("transfer", "advanced", "A roundabout controller accelerates while requesting a near-limit turn. What transfers?", ["ch8-integrated-control", "ch8-mpc-constraints"], 2, [
        ["Acceleration and steering can always be tuned independently", "They interact through speed and tire forces."], ["Use maximum values because roundabouts are circular", "Geometry does not remove physical limits."], ["Jointly constrain speed, curvature, and stability", "Correct. Speed choice changes achievable lateral motion."], ["Hold speed constant regardless of traffic", "Dynamic context still matters."],
      ], ["Higher speed increases lateral acceleration for a given curve.", "An integrated plan trades speed progress against stable tracking."], "Coordinate axes whenever one command changes the feasibility of the other.", "8.6", 130),
    },
  ),
  assessmentCase(
    "proportional-gain-oscillation",
    { kind: "table", caption: "Speed step from 10 to 15 m/s", columns: ["Kp", "Rise time", "Overshoot", "Settling", "Oscillations"], rows:[[0.4,"4.8 s","1%","6.0 s",0],[1.1,"2.1 s","9%","5.2 s",2],[2.4,"0.9 s","31%",">12 s",8]] },
    {
      application: probe("application", "intermediate", "Comfort requires overshoot below 10% and faster response than Kp=0.4. Which trial is the best starting point?", ["ch8-pid-response"], 3, [
        ["Kp=2.4 because rise time alone decides", "It violates overshoot and settling requirements."], ["Kp=0.4 because no oscillation is the only goal", "It is the slow baseline the prompt asks to improve."], ["Choose an untested Kp=10", "The trace suggests higher gain may destabilize further."], ["Kp=1.1, then validate disturbances", "Correct. It meets the stated bound and improves rise time."],
      ], ["The selection must satisfy both response and comfort.", "The middle trial is the only measured point meeting both."], "Tune proportional response using a bundle of time-domain metrics, not one fastest number.", "8.5", 128),
      diagnosis: probe("diagnosis", "intermediate", "What does the Kp=2.4 trace indicate?", ["ch8-pid-response"], 0, [
        ["Over-aggressive correction and overshoot", "Correct. Faster rise is offset by poor damping and long settling."], ["The controller has no response to current error", "It responds very strongly."], ["The target speed is unreachable", "It crosses well beyond the target."], ["The sensor reports constant bias only", "The oscillation is dynamic."],
      ], ["Rise time falls as Kp increases.", "Overshoot and oscillations grow sharply at the highest gain."], "A strong present-error response can trade speed for stability.", "8.5", 128),
      comparison: probe("comparison", "foundational", "Which pair best isolates the effect of increasing Kp?", ["ch8-pid-response"], 1, [
        ["A speed trace and an unrelated steering trace", "The plants and outputs differ."], ["Matched rows with other gains fixed", "Correct. The command and plant condition are matched."], ["One row before and after changing vehicle mass and Kp", "That confounds the cause."], ["The largest and smallest speed units", "Units do not define an experiment."],
      ], ["Controlled tuning changes one gain at a time.", "Response differences can then be attributed more credibly."], "Use matched traces for controller parameter inference.", "8.5", 129),
      causal: probe("causal", "intermediate", "Why does higher Kp reduce rise time but increase overshoot here?", ["ch8-pid-response"], 2, [
        ["It changes the desired speed after every sample", "The target remains 15 m/s."], ["It removes vehicle inertia", "Inertia remains."], ["Inertia carries strong correction past target", "Correct. More force acts before feedback can settle."], ["It makes braking unavailable", "The issue can occur even with bidirectional authority."],
      ], ["Kp scales command with instantaneous error.", "Physical dynamics continue after the error has begun shrinking."], "Feedback gain must be matched to plant inertia and delay.", "8.5", 128),
      transfer: probe("transfer", "advanced", "A lane-centering loop oscillates after Kp is doubled. What transfers?", ["ch8-pid-response", "ch8-lateral-control"], 3, [
        ["Speed Kp=1.1 must be copied to steering", "Gains are plant- and unit-specific."], ["Oscillation proves the lane detector is perfect", "Perception can still contribute noise."], ["Increase Kp again until oscillation is too fast to see", "That can further destabilize control."], ["Restore baseline and retune with steering delay", "Correct. The same evidence method applies to a different plant."],
      ], ["The symptom follows a gain change.", "Lateral dynamics require their own controlled trace and limits."], "Transfer tuning logic, never raw gains, across control channels.", "8.5", 129),
    },
  ),
  assessmentCase(
    "integral-uphill-bias",
    { kind: "log", caption: "Cruise control on a steady grade", lines: ["target speed: 20.0 m/s", "P-only steady speed: 18.7 m/s", "speed error remains +1.3 m/s", "throttle command stabilizes below limit", "adding small Ki: speed converges to 20.0 m/s in 7 s", "no overshoot in this trial"] },
    {
      application: probe("application", "intermediate", "What tuning conclusion is best supported?", ["ch8-pid-response"], 0, [
        ["Use modest integral action, then test saturation", "Correct. Accumulated bias supplies the missing steady effort without proving universal stability."], ["Set Ki as high as possible because this one trace has no overshoot", "Higher integral gain can create sluggishness, overshoot, or windup elsewhere."], ["Remove proportional control entirely", "P provides immediate correction."], ["Treat 18.7 m/s as the new target", "That abandons the commanded speed."],
      ], ["The error is persistent rather than oscillatory.", "Small Ki removes it under an unsaturated steady load."], "Use integral action for sustained bias, and validate its memory during changing conditions.", "8.5", 129),
      diagnosis: probe("diagnosis", "intermediate", "Why does P-only control settle below target?", ["ch8-pid-response"], 1, [
        ["The target is numerically impossible", "The Ki trial reaches it."], ["Residual error sustains hill effort", "Correct. With P-only feedback, command falls with error until equilibrium occurs at a bias."], ["Derivative noise lowers the target", "No D term is described."], ["The throttle is saturated", "The log says it remains below the limit."],
      ], ["The grade creates a constant opposing demand.", "P effort is proportional to error, so equilibrium can require residual error."], "Steady-state bias can be an expected property of proportional feedback under constant load.", "8.5", 129),
      comparison: probe("comparison", "foundational", "Which observation most clearly indicates a steady-state error rather than slow rise time?", ["ch8-pid-response"], 2, [
        ["The target is 20 m/s", "A target alone describes neither."], ["The controller initially accelerates", "Both behaviors can do so."], ["A persistent 1.3 m/s error", "Correct. The response has stopped changing while bias remains."], ["The road is uphill", "It explains the load but not the trace classification alone."],
      ], ["Slow rise continues toward target.", "A stable nonzero error indicates equilibrium away from it."], "Classify response problems from time behavior before changing gains.", "8.5", 128),
      causal: probe("causal", "intermediate", "How does integral action eliminate the bias?", ["ch8-pid-response"], 3, [
        ["It predicts the exact road grade from a map", "It can work without map knowledge."], ["It increases desired speed indefinitely", "The target stays fixed."], ["It cancels every instantaneous sensor fluctuation", "Integral action can actually accumulate low-frequency errors."], ["Stored error adds the needed steady effort", "Correct. The stored error supplies the constant extra throttle."],
      ], ["The positive error persists over time.", "Its integral grows until sufficient effort balances the load at target."], "Integral memory converts persistent error into sustained corrective action.", "8.5", 129),
      transfer: probe("transfer", "advanced", "A steering controller has a constant 0.18 m crosswind offset with no saturation. What transfers?", ["ch8-pid-response", "ch8-lateral-control"], 0, [
        ["Test integral action for crosswind bias", "Correct. Persistent lateral load is analogous, but the new dynamics require validation."], ["Copy the cruise Ki value directly", "Units and plant dynamics differ."], ["Increase Kp without measuring oscillation", "It may reduce bias but destabilize the loop."], ["Ignore the offset because it is constant", "A sustained lane error remains safety relevant."],
      ], ["The offset is sustained under a constant disturbance.", "Integral action may help, but curve transitions can expose memory effects."], "Apply integral reasoning across domains while retuning for the plant.", "8.5", 129),
    },
  ),
  assessmentCase(
    "derivative-noisy-speed",
    { kind: "table", caption: "Brake controller on rough wheel-speed data", columns: ["Kd", "Peak overshoot", "Brake-command RMS noise", "Settling"], rows:[[0.0,"18%","2%","5.1 s"],[0.3,"7%","6%","3.8 s"],[1.2,"4%","29%","6.9 s"]] },
    {
      application: probe("application", "advanced", "Which configuration is the strongest measured compromise?", ["ch8-pid-response"], 1, [
        ["Kd=0 because command smoothness is the only goal", "It has large overshoot and slower settling."], ["Kd=0.3, with filtered-derivative and sensor-noise validation", "Correct. It substantially damps overshoot without the severe command chatter of Kd=1.2."], ["Kd=1.2 because minimum overshoot makes all other metrics irrelevant", "Its 29% command noise and worse settling are problematic."], ["Alternate Kd every sample", "That creates a time-varying controller without evidence."],
      ], ["The middle gain improves overshoot and settling relative to zero.", "The highest gain produces a large noise cost for a small extra overshoot benefit."], "Tune derivative damping against measurement-noise amplification and actuator wear.", "8.5", 129),
      diagnosis: probe("diagnosis", "intermediate", "Why does Kd=1.2 increase brake chatter?", ["ch8-pid-response"], 2, [
        ["Derivative action accumulates constant error forever", "That is integral behavior."], ["Brake commands cannot contain decimals", "Brake commands can contain decimal values."], ["High Kd amplifies rapid measurement noise", "Correct. Rough wheel-speed data creates a noisy error slope."], ["The vehicle loses all inertia", "Physical dynamics remain."],
      ], ["Derivative action depends on rate of error change.", "High-frequency noise has large apparent rates even when state change is small."], "Derivative terms need filtering and trustworthy sampling.", "8.5", 129),
      comparison: probe("comparison", "foundational", "What benefit does Kd=0.3 show relative to Kd=0?", ["ch8-pid-response"], 3, [
        ["It eliminates all brake noise", "Noise rises from 2% to 6%."], ["It makes the speed sensor exact", "Sensor noise remains."], ["It removes proportional and integral action", "Only Kd is being compared."], ["It lowers overshoot and settling time", "Correct. The trace shows useful damping."],
      ], ["Derivative action anticipates a rapidly shrinking error.", "Moderate damping reduces motion past target."], "Judge each term by observed response changes, not by its name.", "8.5", 129),
      causal: probe("causal", "intermediate", "Why can derivative action reduce overshoot?", ["ch8-pid-response"], 0, [
        ["Derivative damping opposes rapid approach", "Correct. It adds damping before the target is crossed deeply."], ["It changes the target to the current speed", "The target remains fixed."], ["It integrates the complete error history", "That is the I term."], ["It raises actuator saturation by definition", "It can demand large transients but saturation is not its purpose."],
      ], ["The slope signals how quickly the state is approaching target.", "Counteraction reduces momentum-driven overshoot."], "Derivative response can improve damping when rate estimates are reliable.", "8.5", 129),
      transfer: probe("transfer", "advanced", "Steering D action chatters on lane-boundary pixel noise. What transfers?", ["ch8-pid-response", "ch8-lateral-control"], 1, [
        ["Increase Kd until each pixel shift creates maximum steering", "That worsens noise amplification."], ["Filter the error-rate signal and retune Kd", "Correct. The derivative input and sampling need conditioning."], ["Remove all lane measurements", "That eliminates feedback."], ["Treat visual noise as actual rapid vehicle motion", "That is the misinterpretation causing chatter."],
      ], ["Pixel noise creates high-frequency error changes.", "A derivative path converts them into steering commands unless filtered."], "Condition derivative signals before increasing predictive damping.", "8.5", 129),
    },
  ),
  assessmentCase(
    "throttle-windup-release",
    { kind: "log", caption: "Hill-climb cruise response", lines: ["target: 25 m/s", "steep grade: speed 19 m/s for 12 s", "throttle limit: 100% for 11.5 s", "integral state: continues rising", "crest at t=12 s: grade load drops", "speed peaks at 31 m/s; throttle remains high for 3.2 s"] },
    {
      application: probe("application", "advanced", "Which controller change best addresses the trace?", ["ch8-saturation-windup", "ch8-pid-response"], 2, [
        ["Increase Ki so the stored command grows faster during the grade", "The actuator is already capped, so extra stored demand worsens recovery."], ["Lower the speed target during each saturation event without reporting it", "That changes the objective and hides unavailable authority."], ["Clamp or back-calculate the integral state from actuator saturation", "Correct. This prevents unreachable commands from accumulating."], ["Keep the present integral logic and add a larger throttle motor", "More authority may change the limit but leaves the controller vulnerable at its next constraint."],
      ], ["The error persists while throttle cannot rise further.", "The stored integral command continues after the grade disappears."], "Anti-windup should keep controller memory consistent with achievable actuation.", "8.5", 129),
      diagnosis: probe("diagnosis", "intermediate", "What evidence distinguishes windup from a simple high proportional gain?", ["ch8-saturation-windup"], 3, [
        ["Speed is below target on the hill", "Several controller limitations could produce that."], ["Throttle reaches 100%", "Saturation is necessary context but does not show stored memory by itself."], ["The road has a crest", "A changing load exposes the issue but is not the controller signature."], ["Stored error keeps throttle high", "Correct. Persistence after the load vanishes reveals stored demand."],
      ], ["A proportional command falls promptly when error shrinks or changes sign.", "The logged integral state and delayed release identify memory accumulation."], "Use post-saturation recovery to diagnose integral windup.", "8.5", 129),
      comparison: probe("comparison", "foundational", "Which trace would indicate effective anti-windup?", ["ch8-saturation-windup"], 0, [
        ["Integral clamps at the limit and releases promptly", "Correct. Controller memory tracks the achievable output."], ["Integral state grows twice as fast while throttle remains at 100%", "That intensifies windup."], ["Speed peak increases while release takes longer", "Those are worse recovery outcomes."], ["Throttle feedback is removed so saturation cannot be logged", "The physical limit remains even if hidden."],
      ], ["Anti-windup acts during limited authority and should improve later recovery.", "Both internal state and vehicle response supply evidence."], "Validate anti-windup through state traces and release transients.", "8.5", 129),
      causal: probe("causal", "intermediate", "Why does the vehicle overspeed after the crest?", ["ch8-saturation-windup"], 1, [
        ["The hill changes the speed target to 31 m/s", "The target remains 25 m/s."], ["Stored demand persists after load falls", "Correct. Plant demand changes faster than controller memory unwinds."], ["The steering angle adds longitudinal speed", "Steering is absent from the trace."], ["Throttle saturation prevents acceleration", "At 100%, it supplies maximum drive effort."],
      ], ["The grade had consumed the full drive command.", "At the crest, the same command is excessive but remains stored."], "Controller memory can turn a vanished disturbance into a delayed overcorrection.", "8.5", 129),
      transfer: probe("transfer", "advanced", "A steering controller sits at its angle limit through a sharp curve, then swings across center on exit. What transfers?", ["ch8-saturation-windup", "ch8-lateral-control"], 2, [
        ["The lane center changed because the actuator saturated", "The physical limit affects execution, not the reference."], ["A larger integral gain will clear the curve with less stored demand", "It tends to accumulate more demand at the limit."], ["Use steering-aware anti-windup and validate the curve-exit transient", "Correct. The same memory-versus-authority mismatch appears laterally."], ["Discard steering-angle feedback and infer angle from the integral state", "That confuses requested and achieved control."],
      ], ["A persistent lateral error occurs while steering cannot increase.", "Release of the constraint can expose accumulated command."], "Apply anti-windup wherever a feedback controller can hit physical bounds.", "8.5", 129),
    },
  ),
  assessmentCase(
    "pid-trace-tuning",
    { kind: "table", caption: "Lane-offset recovery after a 0.5 m disturbance", columns: ["Controller", "Rise", "Peak opposite-side error", "Residual at 8 s", "Steering RMS"], rows:[["A","0.8 s","0.34 m","0.00 m","7.8 deg"],["B","2.7 s","0.04 m","0.16 m","2.1 deg"],["C","1.6 s","0.07 m","0.01 m","3.4 deg"]] },
    {
      application: probe("application", "advanced", "The requirement is residual below 0.03 m with peak crossover below 0.10 m. Which trace is the best basis for deployment tuning?", ["ch8-pid-response"], 3, [
        ["A, since rapid rise compensates for its large crossover and steering demand", "It violates the crossover bound and has the largest actuator activity."], ["B, since minimal steering RMS outweighs its persistent lane bias", "It violates the residual requirement."], ["Blend A and B outputs without a stability test", "An arbitrary blend has no demonstrated response."], ["C, then validate across speed, curvature, and sensor noise", "Correct. C meets both response requirements with moderate effort."],
      ], ["A and B each fail one explicit bound.", "C is the measured feasible candidate, not a claim of universal robustness."], "Select tuning from all required trace features, then broaden validation conditions.", "8.5", 129),
      diagnosis: probe("diagnosis", "intermediate", "Which controller appears under-corrected for sustained offset?", ["ch8-pid-response"], 0, [
        ["B retains 0.16 m residual", "Correct. Its low effort is paired with substantial steady bias."], ["A, because it reaches zero residual", "Its problem is aggressive overshoot."], ["C, because its residual is 0.01 m", "That meets the stated accuracy bound."], ["All three, because each produces steering", "Actuation is expected in lane recovery."],
      ], ["The 8 s residual describes what remains after settling.", "B retains far more error than A or C."], "Distinguish a calm controller from one that simply fails to finish the correction.", "8.5", 128),
      comparison: probe("comparison", "foundational", "What makes C preferable to A under the stated requirements?", ["ch8-pid-response"], 1, [
        ["C has a longer rise time, which by itself defines quality", "Rise time is one metric, not the requirement hierarchy."], ["C keeps crossover within the bound while retaining negligible residual", "Correct. It trades some speed for controlled settling."], ["C uses less road width because its label is later alphabetically", "Labels carry no physical meaning."], ["A has greater steering RMS, which improves passenger comfort", "Higher command activity generally harms comfort and wear."],
      ], ["Both achieve near-zero residual.", "Only C stays below the specified opposite-side excursion."], "Compare feasible response shapes rather than celebrating the fastest transient.", "8.5", 128),
      causal: probe("causal", "intermediate", "Which tuning pattern could plausibly turn A into a response closer to C?", ["ch8-pid-response"], 2, [
        ["Raise proportional action further and remove damping", "That likely increases crossover and command activity."], ["Add integral memory while leaving the aggressive transient unchanged", "A already has zero residual; extra memory may worsen overshoot."], ["Reduce aggressive proportional action and add measured damping", "Correct. A slower, better-damped response matches the observed direction."], ["Change the lane reference after each crossover", "That disguises tracking error rather than tuning it."],
      ], ["A is fast but crosses far beyond center.", "Less immediate gain and more rate damping can trade rise time for stability."], "Infer tuning changes from the response defect being corrected.", "8.5", 129),
      transfer: probe("transfer", "advanced", "The vehicle mass increases by 20% after loading. How should C be used?", ["ch8-pid-response", "ch8-stability-fallback"], 3, [
        ["Treat the old trace as proof of unchanged dynamics", "Mass changes the plant response."], ["Replace C with A because heavier vehicles prefer larger crossover", "The requirement has not changed."], ["Copy the gains and skip loaded testing", "A formerly stable setting may respond more slowly or differently."], ["Use C as a baseline, repeat disturbance tests loaded, and retune within the same bounds", "Correct. The evaluation criteria transfer while plant measurements need renewal."],
      ], ["Controller gains interact with physical dynamics.", "Loading changes acceleration and potentially tire response."], "Revalidate feedback tuning after material plant changes.", "8.5", 129),
    },
  ),
  assessmentCase(
    "mpc-short-horizon-curve",
    { kind: "log", caption: "MPC approaching a blind sharp curve", lines: ["speed: 25 m/s", "horizon: 0.6 s / 15 m", "curve begins: 28 m ahead", "speed cost favors 25 m/s", "lateral-acceleration constraint included", "controller action: hold speed", "at curve entry: braking becomes abrupt; optimization briefly infeasible"] },
    {
      application: probe("application", "advanced", "What change best addresses the anticipatory failure?", ["ch8-mpc-prediction", "ch8-mpc-constraints"], 0, [
        ["Extend or adapt the horizon so the curve and required deceleration enter prediction early", "Correct. The constraint cannot influence optimization while it lies beyond the forecast."], ["Remove the lateral-acceleration constraint to preserve feasibility", "That hides the physical safety limit."], ["Increase the speed weight so holding 25 m/s becomes more attractive", "That intensifies the late braking problem."], ["Use older state estimates so the curve appears farther away", "Stale state worsens prediction."],
      ], ["The horizon covers 15 m while the relevant curve starts 28 m ahead.", "By the time it enters view, the feasible slowing distance has shrunk."], "An MPC horizon should expose constraints early enough for feasible action.", "8.6", 129),
      diagnosis: probe("diagnosis", "intermediate", "Why does a constrained optimizer still choose to hold speed initially?", ["ch8-mpc-prediction"], 1, [
        ["Constraints apply after control, not during optimization", "They apply to predicted states and inputs."], ["The constrained curve is outside the modeled horizon, so no predicted violation is visible yet", "Correct. MPC can reason only over states represented in its forecast."], ["MPC cannot command braking", "Braking is a control input in the chapter model."], ["The vehicle model has no speed state", "The log reports a speed objective."],
      ], ["The prediction ends before the curve.", "Within that limited future, holding speed appears feasible and low cost."], "Predictive control is not foresight beyond its data and horizon.", "8.6", 130),
      comparison: probe("comparison", "foundational", "Which horizon exposes the curve at the current speed?", ["ch8-mpc-prediction"], 2, [
        ["0.2 s, about 5 m", "It is shorter than the present horizon."], ["0.6 s, 15 m", "It ends before 28 m."], ["At least about 1.2 s, 30 m", "Correct. This reaches beyond the curve start before accounting for margin."], ["A horizon expressed in steering degrees", "Horizon is temporal or step-based."],
      ], ["At 25 m/s, distance is speed times time.", "A 1.2 s forecast spans about 30 m."], "Relate prediction length to speed and event distance.", "8.6", 130),
      causal: probe("causal", "intermediate", "Why can a longer horizon improve comfort here?", ["ch8-mpc-prediction"], 3, [
        ["It increases available tire friction", "Road physics are unchanged."], ["It lowers vehicle mass", "The model does not change the plant."], ["It removes optimization cost", "The cost remains."], ["Earlier visibility lets the optimizer distribute deceleration over more time", "Correct. A gradual feasible sequence can replace a late large command."],
      ], ["Comfort is affected by acceleration magnitude and change.", "More planning time permits smaller corrections while meeting the curve constraint."], "Prediction can trade early mild action for late aggressive action.", "8.6", 130),
      transfer: probe("transfer", "advanced", "At 10 m/s the same horizon is used for parking. What transfers?", ["ch8-mpc-prediction"], 0, [
        ["Set horizon from relevant event distance and dynamics rather than reusing highway seconds blindly", "Correct. The useful spatial coverage and computation tradeoff change with speed."], ["Increase horizon until optimization misses its real-time deadline", "Longer prediction is useful only if solved in time."], ["Retain 0.6 s because controller parameters are independent of task", "Parking geometry and speed differ."], ["Remove constraints because parking is slow", "Obstacle and actuator limits still matter."],
      ], ["A fixed time covers less distance at lower speed.", "Parking may need fine spatial planning rather than highway preview."], "Choose horizon in relation to task scale, plant dynamics, and compute budget.", "8.6", 130),
    },
  ),
  assessmentCase(
    "mpc-cost-weight-comfort",
    { kind: "table", caption: "MPC lane-change cost sweep", columns: ["Run", "Path-error weight Q", "Control-effort weight R", "Peak error", "Peak jerk", "Completion"], rows:[["A",10,1,"0.08 m","5.8 m/s3","2.1 s"],["B",4,4,"0.19 m","1.7 m/s3","3.4 s"],["C",1,10,"0.46 m","0.8 m/s3","5.9 s"]] },
    {
      application: probe("application", "advanced", "The bounds are peak error below 0.25 m and peak jerk below 2.0 m/s3. Which run is the strongest candidate?", ["ch8-mpc-prediction"], 1, [
        ["A, since low path error offsets violation of the jerk bound", "The comfort constraint is explicit."], ["B, followed by robustness testing", "Correct. It is the measured run satisfying both bounds."], ["C, since minimum jerk compensates for excessive path error", "It violates the tracking bound."], ["Average A and C commands without solving the constrained problem", "Their average has no demonstrated feasibility."],
      ], ["A and C each violate one bound.", "B demonstrates a feasible measured balance."], "Cost weights express tradeoffs, but requirements decide which tradeoffs are acceptable.", "8.6", 130),
      diagnosis: probe("diagnosis", "intermediate", "Why does C track poorly?", ["ch8-mpc-prediction"], 2, [
        ["Its path-error penalty dominates control effort", "The table shows the reverse."], ["It has no prediction model", "All rows are MPC sweeps."], ["Large R and small Q make control activity expensive relative to path deviation", "Correct. The optimizer accepts error to avoid actuation."], ["Peak jerk directly changes the reference lane", "It reflects command smoothness."],
      ], ["C assigns ten times more weight to effort than one unit to path error.", "Its output is smooth but reluctant to correct."], "MPC behavior follows relative cost scaling, not a generic preference for accuracy.", "8.6", 130),
      comparison: probe("comparison", "foundational", "What change from A to B most directly explains lower jerk and larger path error?", ["ch8-mpc-prediction"], 3, [
        ["The lane-change target was removed", "Completion is still reported."], ["The vehicle gained a second steering rack", "Architecture is unchanged."], ["The horizon became zero", "No horizon change is shown."], ["Control effort became more expensive and tracking error less expensive", "Correct. R rises while Q falls."],
      ], ["An optimizer minimizes the weighted sum it is given.", "Changing relative penalties changes its preferred compromise."], "Interpret cost sweeps through relative priorities and measured response.", "8.6", 130),
      causal: probe("causal", "intermediate", "Why is a high Q not equivalent to a hard path bound?", ["ch8-mpc-prediction", "ch8-mpc-constraints"], 0, [
        ["A penalty can be traded against other costs, while a hard bound excludes violating trajectories", "Correct. Large cost discourages but does not prohibit an error."], ["Q applies to actuator voltage rather than state error", "Q weights state deviation in the chapter formulation."], ["Constraints are used only after optimization", "They define the feasible set during it."], ["A high Q removes model error", "Model mismatch can remain."],
      ], ["Costs rank feasible candidates.", "Constraints define which candidates are admissible."], "Encode nonnegotiable safety limits as constraints rather than preferences alone.", "8.6", 130),
      transfer: probe("transfer", "advanced", "An urban MPC should prioritize pedestrian clearance over comfort. What transfers?", ["ch8-mpc-prediction", "ch8-mpc-constraints"], 1, [
        ["Set a large comfort weight and infer clearance afterward", "That reverses the priority."], ["Encode required clearance as a constraint or dominant safety structure, then tune comfort within feasible motion", "Correct. Safety should shape the admissible set before comfort ranks behavior."], ["Remove control-effort cost and actuator limits", "Aggressive infeasible commands remain harmful."], ["Use highway weights without an urban scenario test", "Objectives and interactions changed."],
      ], ["Clearance is a safety requirement, not merely a ride preference.", "Comfort remains useful among trajectories that respect it."], "Align optimization structure with the hierarchy of driving objectives.", "8.6", 130),
    },
  ),
  assessmentCase(
    "mpc-infeasible-stop",
    { kind: "log", caption: "Obstacle-stop optimization", lines: ["speed: 20 m/s", "obstacle distance: 18 m", "required stop distance at road friction: 27 m", "constraint: no collision", "brake limit: -5 m/s2", "steering corridor: blocked", "solver: infeasible", "software fallback: reuse prior throttle command"] },
    {
      application: probe("application", "advanced", "What should happen when infeasibility is detected?", ["ch8-mpc-constraints", "ch8-stability-fallback"], 2, [
        ["Reuse throttle because it was feasible one cycle earlier", "The current state has crossed into an emergency."], ["Delete the collision constraint until a solution appears", "That produces a mathematically feasible but unsafe plan."], ["Invoke a verified emergency policy: maximum stable braking, warning/escalation, and best achievable impact mitigation", "Correct. Infeasibility signals that the nominal objective cannot be met."], ["Report solver failure while leaving actuators unchanged", "A control action is still required."],
      ], ["The physics require more distance than remains.", "Fallback should minimize harm within real authority rather than repeat a stale action."], "A constrained controller needs an explicit policy for states with no nominal feasible solution.", "8.6", 130),
      diagnosis: probe("diagnosis", "intermediate", "Why is the optimization infeasible?", ["ch8-mpc-constraints"], 3, [
        ["The solver cannot represent braking", "A brake bound is included."], ["The collision constraint is optional", "It is stated as a required constraint."], ["The vehicle has no speed state", "Speed appears in the log."], ["No admissible brake or steering sequence can avoid the obstacle from the current state", "Correct. Stopping distance exceeds clearance and the lateral corridor is blocked."],
      ], ["Longitudinal and lateral escape options both fail their physical tests.", "The feasible set is empty under the safety requirement."], "Infeasibility can be a truthful result about physics, not a software defect.", "8.6", 130),
      comparison: probe("comparison", "foundational", "Which modification creates false feasibility?", ["ch8-mpc-constraints"], 0, [
        ["Removing the collision constraint while keeping the same physical state", "Correct. A solution may then exist by allowing impact."], ["Reporting the stopping-distance estimate", "That improves diagnosis."], ["Using a verified emergency braking policy", "That addresses best achievable mitigation."], ["Logging solver status with timestamps", "That supports monitoring."],
      ], ["Feasibility is defined relative to constraints.", "Deleting the critical one changes the problem rather than solving the hazard."], "Do not turn safety constraints into silent soft preferences under pressure.", "8.6", 130),
      causal: probe("causal", "intermediate", "Why is reusing the previous throttle command especially dangerous?", ["ch8-mpc-prediction", "ch8-stability-fallback"], 1, [
        ["Throttle messages have no timestamps", "The issue is state change, not necessarily missing metadata."], ["Receding-horizon actions are valid for the state that produced them; the new obstacle state demands a different response", "Correct. An old first action loses its safety basis."], ["Prior commands are numerically negative", "The log calls it throttle."], ["Solvers improve when actuators are frozen", "Frozen throttle worsens the emergency."],
      ], ["MPC replans each cycle because state and environment change.", "Infeasibility invalidates the nominal sequence's assumptions."], "Never treat a stale nominal command as a universal solver fallback.", "8.6", 130),
      transfer: probe("transfer", "advanced", "A lane-change MPC becomes infeasible because both adjacent gaps close. What transfers?", ["ch8-mpc-constraints", "ch8-integrated-control"], 2, [
        ["Relax vehicle-collision bounds to complete the lane change", "That sacrifices the reason for the constraints."], ["Keep steering into the blocked gap while the solver retries", "That consumes safety margin."], ["Abort or delay the maneuver using a verified lane-keeping/deceleration fallback", "Correct. The controller should return to a safe feasible mode."], ["Reuse the prior lane-change command until a gap reopens", "That is stale and directionally unsafe."],
      ], ["The desired maneuver is no longer admissible.", "A fallback can preserve current-lane stability while creating time and space."], "Handle infeasibility by changing behavior mode, not weakening collision safety.", "8.6", 130),
    },
  ),
  assessmentCase(
    "mpc-model-mismatch-payload",
    { kind: "table", caption: "Receding-horizon speed response after towing a trailer", columns: ["Cycle", "Predicted accel", "Measured accel", "State update", "Next command"], rows:[[1,"1.8 m/s2","0.9 m/s2","fresh","higher"],[2,"2.0 m/s2","1.0 m/s2","fresh","higher"],[3,"2.1 m/s2","1.0 m/s2","fresh","higher"],[4,"2.2 m/s2","1.1 m/s2","fresh","near limit"]] },
    {
      application: probe("application", "advanced", "What is the best control-engineering response?", ["ch8-mpc-prediction", "ch8-stability-fallback"], 3, [
        ["Keep escalating because receding optimization removes model error", "Fresh replanning exposes the mismatch but does not correct the model itself."], ["Replace measured acceleration with the prediction", "That hides the changed plant."], ["Remove input limits so prediction can be reached", "Actuator limits are physical and safety relevant."], ["Detect the persistent residual, adapt or switch the model, and bound commands until validation", "Correct. The trailer changed the input-to-state dynamics."],
      ], ["Measured acceleration stays roughly half the forecast across fresh updates.", "The optimizer responds by demanding more input from a systematically wrong model."], "Receding feedback needs model-health monitoring when dynamics change.", "8.6", 130),
      diagnosis: probe("diagnosis", "intermediate", "Which fault best matches the trace?", ["ch8-mpc-prediction"], 0, [
        ["The model overestimates acceleration authority after the payload change", "Correct. Forecasts are consistently about twice measured response."], ["State updates are stale", "Each row says fresh."], ["The vehicle accelerates faster than predicted", "The direction is reversed."], ["The reference speed decreases each cycle", "No reference change is shown."],
      ], ["Prediction error has stable sign and scale.", "A changed mass/load is a plausible structured cause."], "Use innovation patterns to distinguish model mismatch from random disturbance.", "8.6", 129),
      comparison: probe("comparison", "foundational", "What does receding-horizon replanning improve here?", ["ch8-mpc-prediction"], 1, [
        ["It makes the original dynamics exact", "The mismatch persists."], ["It incorporates each measured state instead of executing the full old sequence", "Correct. The controller sees under-response each cycle."], ["It removes trailer mass from the vehicle", "Software does not alter payload."], ["It changes actuator bounds into suggestions", "Constraints remain."],
      ], ["Only the first optimized action is applied.", "Fresh measurements prevent completely open-loop execution."], "Replanning limits stale-sequence error but does not replace model validation.", "8.6", 130),
      causal: probe("causal", "intermediate", "Why can this mismatch drive commands toward saturation?", ["ch8-mpc-prediction", "ch8-mpc-constraints"], 2, [
        ["The trailer lowers the desired speed", "No target change is given."], ["Measured state disappears from the optimizer", "It is updated each cycle."], ["The optimizer attributes under-response to insufficient input under an overly optimistic gain model", "Correct. It increases command to close persistent predicted error."], ["Saturation makes the model accurate", "It further limits realized response."],
      ], ["The state remains behind the desired trajectory.", "Within its model, more input appears to be the corrective action."], "Model bias can consume control margin even with fresh feedback.", "8.6", 130),
      transfer: probe("transfer", "advanced", "Tire friction drops in rain and lateral MPC underpredicts yaw. What transfers?", ["ch8-mpc-prediction", "ch8-stability-fallback"], 3, [
        ["Retain dry-road predictions because the path reference is unchanged", "The input-to-motion dynamics changed."], ["Increase steering until yaw matches the dry model", "That can push tires deeper into saturation."], ["Remove the yaw constraint to avoid residuals", "That hides instability."], ["Monitor prediction residuals, reduce the envelope, and select a friction-appropriate model", "Correct. The same model-health logic applies to lateral dynamics."],
      ], ["Measured response contradicts the assumed plant.", "A conservative model and envelope preserve stability during adaptation."], "Adapt control models and limits when operating physics changes.", "8.7", 131),
    },
  ),
  assessmentCase(
    "pid-versus-mpc-selection",
    { kind: "table", caption: "Controller deployment candidates", columns: ["Task", "Dynamics", "Constraints", "Compute budget", "Preview"], rows:[["Cruise on steady test track","near-linear","throttle bounds","tight","none"],["Urban trajectory","coupled speed/steering","obstacles, comfort, actuators","adequate","map + predictions"]] },
    {
      application: probe("application", "advanced", "Which assignment is most defensible?", ["ch8-pid-response", "ch8-mpc-prediction"], 0, [
        ["Validated PID for steady cruise; constrained MPC for the preview-rich urban trajectory", "Correct. Each method matches the task complexity and resources."], ["MPC for cruise with no model, and open-loop steering in the city", "This wastes predictive structure and removes feedback."], ["One untuned PID for both because controller reuse reduces validation", "Reuse does not address coupled constraints."], ["Choose by algorithm name rather than response tests", "Labels do not establish suitability."],
      ], ["Steady cruise is a transparent low-dimensional feedback task.", "Urban control benefits from prediction and explicit multi-axis constraints."], "Select control architecture from task structure, constraints, and execution budget.", "8.4", 127),
      diagnosis: probe("diagnosis", "intermediate", "Why might the urban task expose PID limitations?", ["ch8-integrated-control", "ch8-mpc-constraints"], 1, [
        ["PID cannot receive numerical errors", "Error feedback is its basis."], ["Several future, coupled constraints cannot be represented by independent reactive error loops alone", "Correct. Obstacle clearance and actuator interactions require coordination."], ["Urban maps remove vehicle dynamics", "The physical plant remains."], ["PID uses too much preview", "Basic PID does not exploit the listed preview directly."],
      ], ["The task includes future obstacles and coupled inputs.", "Separate loop tuning does not define a joint feasible trajectory."], "Reactive feedback can be strong locally while incomplete as a constrained planner-controller.", "8.6", 129),
      comparison: probe("comparison", "foundational", "What favors PID for the steady cruise row?", ["ch8-pid-response"], 2, [
        ["It solves obstacle trajectories without state", "No obstacle task is listed."], ["It requires greater compute than predictive optimization", "Its implementation is generally lighter."], ["The plant is stable and near-linear with a simple speed-error objective", "Correct. This matches PID's transparent strengths."], ["Throttle bounds cannot be handled around PID", "Clamps and anti-windup can respect them."],
      ], ["The task has one primary controlled variable and limited preview value.", "A well-tuned simple loop can meet it efficiently."], "Complexity should earn its cost through task-relevant capability.", "8.5", 129),
      causal: probe("causal", "intermediate", "Why can MPC command smoother early braking than a reactive speed PID near a known curve?", ["ch8-mpc-prediction"], 3, [
        ["MPC increases road friction", "It does not alter physics."], ["PID cannot command brake pressure", "PID can command brake pressure."], ["MPC removes the need for feedback", "It replans with feedback."], ["Preview places the future curvature constraint inside optimization before current speed error grows", "Correct. Anticipation spreads correction over time."],
      ], ["A reactive loop waits for present tracking error.", "A predictive model can act on an approaching constraint."], "Preview is useful when future geometry changes what is feasible now.", "8.6", 130),
      transfer: probe("transfer", "advanced", "Compute load makes urban MPC miss deadlines. What should the team do?", ["ch8-network-timing", "ch8-stability-fallback"], 0, [
        ["Reduce model/horizon complexity and maintain a verified timely fallback controller", "Correct. Predictive sophistication has value only when commands arrive on time."], ["Keep the optimizer unchanged and execute late commands", "Stale optimal actions can be unsafe."], ["Remove timing monitors so deadlines appear satisfied", "That hides a control fault."], ["Disable actuator constraints to shorten the problem", "This can produce unsafe infeasible commands."],
      ], ["Real-time feasibility is part of control feasibility.", "A simpler bounded controller can preserve authority during solver overruns."], "Pair advanced control with deadline monitoring and a stable fallback.", "8.3", 126),
    },
  ),
  assessmentCase(
    "slippery-road-stability",
    { kind: "log", caption: "Lane controller enters black ice", lines: ["dry-road tuning: stable at 80 km/h", "ice entry: steering command +4 deg", "measured yaw: 45% below model", "cross-track error grows", "controller raises command to +9 deg", "front tire slip rises; yaw begins oscillating", "friction estimate: drops from .85 to .24"] },
    {
      application: probe("application", "advanced", "What is the best immediate response?", ["ch8-stability-fallback", "ch8-integrated-control"], 1, [
        ["Continue increasing steering until dry-road yaw appears", "That pushes the low-friction tires farther into saturation."], ["Reduce speed and steering demand, switch to a low-friction envelope, and prioritize stability", "Correct. The dry-road controller requests force the surface cannot provide."], ["Freeze friction at .85 to keep the model consistent", "That preserves the harmful mismatch."], ["Add throttle during the oscillation to improve lateral grip", "More speed can increase the required lateral force."],
      ], ["Yaw under-response and rising slip indicate lost lateral authority.", "The falling friction estimate supports a regime change, not a need for more command."], "When control authority falls, reduce demand and preserve the stability envelope.", "8.5", 129),
      diagnosis: probe("diagnosis", "intermediate", "Why does increasing steering fail to recover the path?", ["ch8-integrated-control", "ch8-stability-fallback"], 2, [
        ["The path reference disappears on ice", "The reference remains."], ["Steering angles above 4 degrees are not electronic signals", "They remain valid commands."], ["The tires are near lateral-force saturation, so added angle increases slip rather than proportional yaw", "Correct. The assumed command-to-motion gain collapses."], ["The yaw sensor measures throttle", "It measures rotational response."],
      ], ["Measured yaw is below prediction while slip rises.", "Larger commands then produce oscillation rather than correction."], "A feedback loop can destabilize when actuator-to-state effectiveness changes sharply.", "8.5", 129),
      comparison: probe("comparison", "foundational", "Which trace most directly signals reduced lateral authority?", ["ch8-stability-fallback"], 3, [
        ["Dry-road tuning was once stable", "That describes another condition."], ["The vehicle is traveling at 80 km/h", "Speed contributes to demand but does not demonstrate response loss."], ["The command has a positive sign", "Sign indicates direction."], ["Yaw response is far below prediction while tire slip rises", "Correct. Input increases without the expected controlled-state response."],
      ], ["Authority is the achievable state change from an input.", "The residual and slip show that steering no longer yields modeled yaw."], "Monitor command-to-response effectiveness as a control-health signal.", "8.7", 131),
      causal: probe("causal", "intermediate", "Why does reducing speed help both tracking and stability?", ["ch8-integrated-control"], 0, [
        ["Lower speed reduces lateral acceleration and tire force required for the same curvature", "Correct. The requested path becomes more feasible within available friction."], ["It restores dry pavement under the tires", "The surface remains icy."], ["It removes the need to steer", "Curvature still requires steering."], ["It makes model mismatch irrelevant", "Model adaptation remains valuable."],
      ], ["Lateral acceleration grows with speed squared for a given radius.", "Slowing creates substantial force margin."], "Speed is a powerful integrated-control lever for lateral feasibility.", "8.4", 128),
      transfer: probe("transfer", "advanced", "A loaded vehicle shows brake fade on a descent. What transfers?", ["ch8-stability-fallback", "ch8-longitudinal-control"], 1, [
        ["Increase brake command without checking achieved deceleration", "That repeats the authority-assumption failure."], ["Detect command-response loss, lower speed early, use redundant retardation, and expand stopping margin", "Correct. The control demand should adapt to reduced longitudinal authority."], ["Use dry flat-road stopping distance", "It understates risk."], ["Disable deceleration feedback to avoid residuals", "That hides fade."],
      ], ["In both cases, physical actuation effectiveness falls under a changed condition.", "A safe strategy reduces required force and uses remaining authority."], "Fallback should respond to measured capability, not nominal actuator rating.", "8.3", 126),
    },
  ),
  assessmentCase(
    "ecu-heartbeat-fallback",
    { kind: "table", caption: "Dual-ECU supervisor at highway speed", columns: ["Signal", "Primary", "Backup", "Age"], rows:[["heartbeat","missing","healthy","120 ms"],["steering state","last +1.5 deg","fresh +1.6 deg","6 ms"],["primary command","+3.0 deg","n/a","115 ms"],["backup command","n/a","+1.7 deg","4 ms"],["independent power","failed","healthy","n/a"]] },
    {
      application: probe("application", "advanced", "What takeover behavior is best supported?", ["ch8-redundancy-faults", "ch8-stability-fallback"], 2, [
        ["Continue the primary +3.0 degree command until its heartbeat returns", "It is stale and the primary power has failed."], ["Issue zero steering instantly without considering current angle", "A discontinuity at highway speed can create a lateral transient."], ["Let the healthy backup assume control with bumpless state transfer, bounded authority, and a minimal-risk route", "Correct. Fresh shared state supports continuity while degraded-mode limits manage residual uncertainty."], ["Allow both ECUs to command the actuator concurrently", "Conflicting writers can destabilize steering."],
      ], ["The primary has lost both heartbeat and independent power.", "The backup has fresh state, command, and power."], "Redundant takeover should be decisive, state-consistent, and behaviorally bounded.", "8.7", 131),
      diagnosis: probe("diagnosis", "intermediate", "What evidence most strongly rules out a network-only heartbeat loss?", ["ch8-redundancy-faults"], 3, [
        ["The primary command is +3.0 degrees", "Its value does not identify root cause."], ["Backup state is fresh", "That shows part of the network works."], ["The vehicle is on a highway", "Operating context affects risk, not fault cause."], ["The primary's independent power is reported failed", "Correct. This directly explains loss of ECU output and heartbeat."],
      ], ["A missed heartbeat could arise from communication or compute faults.", "The power monitor adds causal evidence for this event."], "Use cross-layer health signals to distinguish communication loss from controller loss.", "8.3", 126),
      comparison: probe("comparison", "foundational", "Why is the backup command preferable to the stored primary command?", ["ch8-network-timing", "ch8-redundancy-faults"], 0, [
        ["It is based on fresh state and arrives through a healthy powered path", "Correct. Its timing and execution chain are currently supported."], ["Its numerical angle is smaller, which defines correctness", "Magnitude alone does not establish the intended path."], ["Backup commands do not need validation", "They still need monitoring and bounds."], ["Stored commands improve with age", "Their state basis becomes less relevant over time."],
      ], ["The primary request is 115 ms old and its ECU is unpowered.", "The backup closes a current viable loop."], "Prefer commands with a live state-to-actuator safety path.", "8.2", 125),
      causal: probe("causal", "intermediate", "Why is state transfer needed during takeover?", ["ch8-redundancy-faults", "ch8-pid-response"], 1, [
        ["It changes the backup's power supply", "Power is already healthy."], ["Matching current angle and controller memory avoids a command jump caused by inconsistent internal state", "Correct. Integrators and estimates can otherwise restart from incompatible values."], ["It makes the road straight", "Road geometry is unchanged."], ["It converts the backup ECU into a mechanical linkage", "It remains electronic."],
      ], ["The physical steering state continues across controller ownership.", "Internal feedback state should continue as well."], "Bumpless transfer is part of redundancy, not a cosmetic refinement.", "8.7", 131),
      transfer: probe("transfer", "advanced", "The backup ECU is healthy but shares the failed primary power rail. What changes?", ["ch8-redundancy-faults", "ch8-stability-fallback"], 2, [
        ["Its software health is enough to command an unpowered actuator path", "A compute status cannot supply missing energy."], ["Use its command because network age is low", "Freshness does not restore power."], ["Treat takeover as unavailable and invoke a separately powered physical fallback", "Correct. The common-mode dependency defeats the nominal backup."], ["Wait for the shared rail while maintaining highway speed", "That prolongs uncontrolled exposure."],
      ], ["A safety path is available only if each dependency is available.", "Shared power removes both electronic controllers together."], "Supervision should evaluate end-to-end independence before declaring redundancy healthy.", "8.3", 126),
    },
  ),
  assessmentCase(
    "integrated-control-release-test",
    { kind: "table", caption: "Release-candidate validation", columns: ["Scenario", "Nominal result", "Fault response", "Tail latency", "Status"], rows:[["dry lane change","stable","not injected","18 ms","pass"],["wet emergency avoid","yaw limit exceeded","not injected","21 ms","fail"],["CAN 80 ms delay","stable replay","stale commands executed","96 ms","fail"],["steering sensor stuck","path held","fault not detected","20 ms","fail"],["ECU power loss","n/a","backup takeover smooth","24 ms","pass"]] },
    {
      application: probe("application", "advanced", "What release decision is supported?", ["ch8-stability-fallback", "ch8-integrated-control"], 3, [
        ["Release because nominal dry driving passed", "Critical dynamic and fault cases failed."], ["Average the two passes and three failures into a neutral result", "Safety requirements are not a majority vote."], ["Relabel failed rows as stress tests outside validation", "The chapter treats timing, redundancy, and stability as core DbW concerns."], ["Block release until stability, freshness rejection, and sensor-fault detection meet defined criteria", "Correct. The failures expose uncontrolled safety paths."],
      ], ["Wet stability, delayed commands, and an undetected stuck sensor each violate a distinct safety control.", "A successful power-loss takeover does not compensate for them."], "Release evidence should cover nominal control and credible fault behavior against explicit criteria.", "8.3", 126),
      diagnosis: probe("diagnosis", "intermediate", "Which row most directly demonstrates a missing command-freshness policy?", ["ch8-network-timing"], 0, [
        ["CAN 80 ms delay, because stale commands are still executed", "Correct. The controller accepts data outside a safe timing envelope."], ["Dry lane change, because latency is 18 ms", "That row is nominal and passes."], ["Steering sensor stuck, because latency is 20 ms", "That is a diagnostic-coverage failure."], ["ECU power loss, because takeover works", "That validates redundancy behavior."],
      ], ["The delay test explicitly reports old command execution.", "Tail latency is 96 ms and no rejection behavior appears."], "Test real-time failure semantics, not just average compute speed.", "8.3", 126),
      comparison: probe("comparison", "foundational", "Why does the power-loss pass not justify release by itself?", ["ch8-redundancy-faults", "ch8-stability-fallback"], 1, [
        ["Backup takeover has no safety value", "It validates one important fault path."], ["It covers one failure mode while other independent hazards remain uncontrolled", "Correct. Safety cases require coverage across relevant faults."], ["A pass is numerically lower than a fail", "Labels are categorical outcomes."], ["Power faults cannot occur in vehicles", "They are explicitly tested."],
      ], ["The table contains several distinct mechanisms.", "One successful mitigation cannot establish unrelated timing or stability properties."], "Redundancy evidence is specific to the faults and dependencies exercised.", "8.7", 131),
      causal: probe("causal", "intermediate", "Why is the stuck-sensor result dangerous even though the path was held in this replay?", ["ch8-redundancy-faults", "ch8-dbw-loop"], 2, [
        ["Path holding proves the sensor was healthy", "The fault injection says it was stuck."], ["A stuck signal creates immediate network delay", "Value plausibility and timing are different."], ["An undetected fault can be trusted in a later condition where its false state drives unsafe actuation", "Correct. This replay did not excite the harmful consequence."], ["Sensors have no role in feedback control", "They provide the measured state."],
      ], ["A latent diagnostic failure can remain harmless in one trajectory.", "Different steering demand may make the stale value decisive."], "Judge fault detection by coverage, not by accidental benign outcome.", "8.3", 126),
      transfer: probe("transfer", "advanced", "After fixes, what validation provides the strongest release evidence?", ["ch8-stability-fallback", "ch8-mpc-constraints"], 3, [
        ["Repeat the dry lane change and omit former failures", "That does not verify the fixes."], ["Run each fix in isolation with safety monitors disabled", "That removes key evidence."], ["Show one successful demonstration video", "A single run has weak coverage."], ["Rerun matched fault cases plus boundary sweeps, recovery transitions, and timing tails on target hardware", "Correct. It tests both corrected mechanisms and nearby operating limits."],
      ], ["Regression cases confirm specific repairs.", "Boundary and transition tests expose brittle thresholds and fallback interactions."], "Validation should reproduce failures and probe the edges around the repaired behavior.", "8.8", 132),
    },
  ),
];

export const chapter8Assessment: ChapterAssessment = {
  chapterId: 8,
  objectives,
  cases,
};
