import type {
  AssessmentCase,
  AssessmentChoice,
  AssessmentProbe,
  ChapterAssessment,
  CognitiveSkill,
  QuizDifficulty,
  QuizStimulus,
} from "../types";

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
  })) as [AssessmentChoice, AssessmentChoice, AssessmentChoice, AssessmentChoice];

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
  stimulus: QuizStimulus,
  probes: AssessmentCase["probes"],
): AssessmentCase {
  return { id, chapterId: 1, stimulus, probes };
}

const objectives: ChapterAssessment["objectives"] = [
  { id: "ch1-automation-responsibility", chapterId: 1, behavior: "Classify automation from monitoring, fallback, and operating-domain responsibilities.", priority: "core", references: [{ section: "1.1", page: 3 }] },
  { id: "ch1-system-pipeline", chapterId: 1, behavior: "Trace evidence and failures through perception, localization, prediction, planning, and control.", priority: "core", references: [{ section: "1.2", page: 4 }] },
  { id: "ch1-history-design-shifts", chapterId: 1, behavior: "Explain how AV design shifted from infrastructure guidance to onboard sensing and computation.", priority: "supporting", references: [{ section: "1.3", page: 6 }] },
  { id: "ch1-deployment-evidence", chapterId: 1, behavior: "Infer deployment readiness from operational evidence rather than milestone labels.", priority: "core", references: [{ section: "1.3", page: 8 }] },
  { id: "ch1-societal-tradeoffs", chapterId: 1, behavior: "Evaluate mobility, safety, congestion, labor, environmental, and infrastructure tradeoffs.", priority: "core", references: [{ section: "1.4", page: 10 }] },
  { id: "ch1-equity-access", chapterId: 1, behavior: "Evaluate whether an AV deployment distributes access, risks, and benefits fairly.", priority: "supporting", references: [{ section: "1.4", page: 11 }] },
  { id: "ch1-privacy-security", chapterId: 1, behavior: "Connect AV data practices and cyber failures to privacy and physical safety consequences.", priority: "core", references: [{ section: "1.4", page: 11 }] },
  { id: "ch1-perception-robustness", chapterId: 1, behavior: "Diagnose perception limitations caused by weather, lighting, occlusion, and semantic ambiguity.", priority: "core", references: [{ section: "1.5", page: 12 }] },
  { id: "ch1-planning-uncertainty", chapterId: 1, behavior: "Choose planning responses that account for uncertain agents and changing conditions.", priority: "core", references: [{ section: "1.5", page: 13 }] },
  { id: "ch1-control-reliability", chapterId: 1, behavior: "Reason about latency, stability, road conditions, redundancy, and fail-safe control.", priority: "core", references: [{ section: "1.5", page: 14 }] },
  { id: "ch1-ethics-governance", chapterId: 1, behavior: "Justify accountable AV decisions using transparent policy and stakeholder reasoning.", priority: "core", references: [{ section: "1.6", page: 14 }] },
];

const cases: AssessmentCase[] = [
  assessmentCase(
    "monitoring-and-fallback",
    { kind: "scenario", text: "A highway feature controls speed and steering. The driver must watch the road continuously and take over immediately when lane markings disappear; the feature cannot independently reach a safe stop." },
    {
      application: probe("application", "intermediate", "Which classification is best supported by the stated responsibilities?", ["ch1-automation-responsibility"], 1, [
        ["Level 1, because highway use limits the operating domain.", "Controlling both speed and steering exceeds single-axis assistance.", "Counting the operating domain instead of automated functions"],
        ["Level 2; monitoring and fallback remain human.", "Correct: combined control remains partial automation when supervision and fallback stay human."],
        ["Level 3, because the system issues a takeover request.", "A takeover request alone does not make the system responsible for monitoring while engaged.", "Treating any takeover request as conditional automation"],
        ["Level 4, because it performs both steering and speed control.", "Level 4 also requires the system to handle fallback inside its operating domain.", "Equating two-axis control with high automation"],
      ], ["The system automates both lateral and longitudinal motion.", "The driver nevertheless monitors the environment and remains the fallback."], "Automation level follows responsibility, not the number of controlled actuators alone.", "1.1", 3),
      diagnosis: probe("diagnosis", "intermediate", "A marketing team calls this conditional automation. Which evidence most directly contradicts that claim?", ["ch1-automation-responsibility"], 2, [
        ["The feature is limited to highways.", "A restricted operating domain can apply to higher automation levels too."],
        ["It controls both steering and speed.", "Two-axis control supports Level 2 but does not identify the monitoring actor."],
        ["The driver retains road monitoring.", "Correct: continuous human monitoring is incompatible with the claimed system-monitoring role."],
        ["Lane markings can disappear.", "A boundary condition matters, but the decisive evidence is who monitors it."],
      ], ["Conditional automation assumes the system performs the driving task while engaged.", "The stated design assigns environmental monitoring to the driver."], "Responsibility statements are stronger classification evidence than feature names.", "1.1", 3),
      comparison: probe("comparison", "foundational", "Which redesign would create the clearest move toward Level 3 behavior?", ["ch1-automation-responsibility"], 3, [
        ["Add a larger dashboard icon while keeping continuous supervision.", "A display change does not transfer monitoring responsibility."],
        ["Allow operation on more highway segments without changing fallback.", "A wider domain does not change who monitors or handles failure."],
        ["Increase steering torque while retaining the same driver duties.", "Actuator authority is not the missing responsibility."],
        ["Transfer domain monitoring to the system with a managed takeover.", "Correct: this changes the monitoring role while preserving a human fallback request."],
      ], ["The current design leaves monitoring with the driver.", "Level 3 behavior requires system monitoring during the automated task."], "Compare automation by the allocation of the dynamic driving task and fallback.", "1.1", 3),
      causal: probe("causal", "advanced", "If the driver-monitoring requirement is removed but no safe fallback is added, what new risk becomes central?", ["ch1-automation-responsibility", "ch1-control-reliability"], 3, [
        ["The vehicle directly becomes Level 5 across all environments.", "Removing supervision does not remove operating-domain limits."],
        ["Longitudinal control stops working whenever lane markings fade.", "The stated change concerns responsibility, not a necessary loss of speed control."],
        ["The highway operating domain becomes irrelevant to classification.", "Domain limits still bound where the feature may operate."],
        ["A failed takeover can leave no actor able to reach safety.", "Correct: transferring monitoring without a dependable fallback creates an unsafe responsibility gap."],
      ], ["The system would now detect the boundary itself.", "Without a safe fallback, a nonresponsive driver leaves the transition unmanaged."], "Changing one responsibility requires checking the entire fallback chain.", "1.1", 3),
      transfer: probe("transfer", "intermediate", "A low-speed campus shuttle has no steering wheel, operates only on mapped roads, and stops safely when conditions leave its domain. Which principle from this case changes its classification?", ["ch1-automation-responsibility"], 3, [
        ["Low speed makes supervision unnecessary across automation levels.", "Speed affects risk but does not define automation responsibility."],
        ["Removing a steering wheel proves unrestricted full automation.", "Interface design does not prove operation in all environments."],
        ["Mapped roads convert lateral control into driver assistance.", "Mapping is an operating-domain constraint, not evidence of human supervision."],
        ["System fallback works within a restricted operating domain.", "Correct: that responsibility pattern supports high automation within the mapped domain."],
      ], ["Unlike the highway feature, the shuttle does not depend on human fallback.", "Its system can reach a safe state inside a restricted domain."], "The same responsibility test transfers across vehicle form and speed.", "1.1", 3),
    },
  ),
  assessmentCase(
    "operating-domain-boundary",
    { kind: "table", caption: "Automated service capability", columns: ["Condition", "System response"], rows: [["Mapped downtown, clear weather", "Completes trip without a driver"], ["Heavy snow", "Declines dispatch and remains parked"], ["Unmapped rural road", "Declines dispatch"], ["Failure during supported trip", "Pulls over safely"]] },
    {
      application: probe("application", "foundational", "Which automation claim is supported by the complete table?", ["ch1-automation-responsibility"], 2, [
        ["Level 2, because weather affects sensing.", "Weather limits do not imply continuous driver supervision."],
        ["Level 3, because a passenger could be asked to help.", "The table shows no human fallback request."],
        ["Level 4: system fallback within a limited domain.", "Correct: it completes or safely ends trips in its supported conditions."],
        ["Level 5, because no driver is present downtown.", "Level 5 cannot depend on mapped geography or weather exclusions."],
      ], ["The system performs the full task and fallback in supported conditions.", "It explicitly refuses conditions outside that operating domain."], "High automation can be driverless without being universal.", "1.1", 3),
      diagnosis: probe("diagnosis", "intermediate", "Which observation most strongly reveals why the service is not Level 5?", ["ch1-automation-responsibility"], 3, [
        ["It pulls over after a failure.", "Safe fallback supports high automation rather than disproving it."],
        ["It has no driver on supported trips.", "Driverless operation can occur at Level 4."],
        ["It uses mapped roads downtown.", "Mapping alone is not decisive if universal operation were otherwise possible."],
        ["It excludes snow and unmapped roads.", "Correct: explicit environment exclusions disprove unrestricted operation."],
      ], ["Level 5 requires operation across environments and conditions.", "The service has clear geographic and weather boundaries."], "Look for excluded conditions when evaluating a universal-autonomy claim.", "1.1", 3),
      comparison: probe("comparison", "intermediate", "Which proposed upgrade changes fallback capability rather than merely expanding the domain?", ["ch1-automation-responsibility", "ch1-control-reliability"], 0, [
        ["Add an independent safe-stop braking path.", "Correct: this directly strengthens the system's ability to manage failure."],
        ["Map three neighboring downtown districts.", "This expands geography but does not change fallback."],
        ["Collect more snow images for later model training.", "This may widen weather coverage but is not itself a fallback mechanism."],
        ["Increase the maximum passenger capacity.", "Capacity does not alter the driving-task allocation."],
      ], ["Fallback concerns what happens after the active system cannot continue.", "An independent stopping path addresses that event directly."], "Domain expansion and failure handling are separate design dimensions.", "1.1", 3),
      causal: probe("causal", "intermediate", "If snow operation is validated but rural roads remain unsupported, what classification conclusion changes?", ["ch1-automation-responsibility"], 1, [
        ["The service necessarily becomes Level 5.", "One remaining geographic exclusion still prevents universal operation."],
        ["The domain broadens; Level 4 reasoning can remain.", "Correct: broader conditions do not erase the remaining domain boundary."],
        ["It falls to Level 2 because weather sensing became more complex.", "Complexity does not reassign monitoring to a driver."],
        ["It becomes Level 3 because fallback is now weather-dependent.", "The table still assigns safe fallback to the system."],
      ], ["Validated snow removes one restriction.", "The unmapped-road restriction still defines a limited domain."], "Classification changes only when the relevant responsibility or universality condition changes.", "1.1", 3),
      transfer: probe("transfer", "advanced", "A warehouse robot completes all navigation and safe stops inside one facility but cannot operate outdoors. Which AV lesson applies?", ["ch1-automation-responsibility"], 1, [
        ["Any unmanned machine has unrestricted autonomy.", "Absence of a driver does not eliminate environmental boundaries."],
        ["Domain-limited full-task performance need not be universal.", "Correct: the warehouse is analogous to a defined operating domain."],
        ["Indoor maps imply continuous human supervision.", "Mapping does not establish human responsibility."],
        ["Safe stopping lowers autonomy because it interrupts the mission.", "Safe fallback is evidence of stronger autonomous responsibility."],
      ], ["The robot owns navigation and fallback inside its facility.", "Its inability to operate outdoors limits the domain."], "Operational-domain reasoning transfers beyond road vehicles.", "1.1", 3),
    },
  ),
  assessmentCase(
    "pedestrian-pipeline",
    { kind: "log", caption: "Crosswalk event", lines: ["camera: pedestrian detected at 22 m", "tracker: velocity estimate unavailable", "predictor: assumes stationary", "planner: holds 35 km/h", "controller: tracks commanded speed accurately"] },
    {
      application: probe("application", "intermediate", "Which intervention addresses the earliest consequential gap in this pipeline?", ["ch1-system-pipeline", "ch1-planning-uncertainty"], 0, [
        ["Pass motion estimates and uncertainty to planning.", "Correct: detection exists, but missing motion evidence is converted into an unsafe stationary assumption."],
        ["Increase controller steering authority.", "The controller is accurately following an unsafe command."],
        ["Replace the global route to avoid all crosswalks.", "The immediate problem is local agent reasoning, not destination routing."],
        ["Raise the commanded speed to clear the crossing sooner.", "That amplifies the consequence of the failed prediction."],
      ], ["Perception detects the person but does not estimate motion.", "Prediction turns missing evidence into certainty, which drives the planner's unsafe decision."], "Fix the earliest faulty inference rather than the downstream module that obeyed it.", "1.2", 4),
      diagnosis: probe("diagnosis", "foundational", "Which subsystem is performing correctly despite the unsafe outcome?", ["ch1-system-pipeline"], 3, [
        ["Motion tracking, because the person was detected.", "Detection and velocity estimation are different outputs."],
        ["Prediction, because stationary is one possible future.", "It ignored missing evidence instead of representing uncertainty."],
        ["Planning, because the route remains feasible.", "Holding speed near an uncertain pedestrian is not a safe local plan."],
        ["Control; it follows the supplied command accurately.", "Correct: accurate execution can still reproduce an upstream planning error."],
      ], ["The log explicitly says the controller tracks its command accurately.", "The command itself is unsafe because of upstream reasoning."], "System outcome and module correctness are not the same question.", "1.2", 4),
      comparison: probe("comparison", "advanced", "Which predictor output would give the planner the strongest safety-relevant information?", ["ch1-system-pipeline", "ch1-planning-uncertainty"], 2, [
        ["One stationary trajectory with no confidence value.", "This repeats the unsupported certainty in the log."],
        ["The pedestrian class label copied from detection.", "A label does not describe future occupancy."],
        ["Probabilistic paths with uncertainty bounds.", "Correct: planning can evaluate crossing risk across credible futures."],
        ["A higher-resolution image without an updated track.", "More pixels do not automatically supply future motion."],
      ], ["The planner needs possible future states, not only current identity.", "A distribution exposes uncertainty rather than hiding it."], "Useful prediction communicates alternatives and confidence to planning.", "1.2", 4),
      causal: probe("causal", "intermediate", "If the velocity estimate becomes reliable and points toward the crosswalk, what downstream change should occur first?", ["ch1-system-pipeline", "ch1-planning-uncertainty"], 1, [
        ["Localization should move the map origin toward the pedestrian.", "Agent motion does not redefine the vehicle's map frame."],
        ["Increase predicted probability of crosswalk occupancy.", "Correct: the new motion evidence first changes the forecast supplied to planning."],
        ["Control should brake before receiving a revised trajectory.", "Normal pipeline responsibility calls for planning to produce the motion command."],
        ["Perception should remove the pedestrian label.", "Reliable motion strengthens rather than invalidates the track."],
      ], ["Velocity toward the crossing changes likely future position.", "Prediction is the immediate consumer of that evidence."], "Trace a changed signal through the pipeline in dependency order.", "1.2", 4),
      transfer: probe("transfer", "intermediate", "A delivery robot sees a rolling ball emerge from behind a van but no child is visible. Which transferred response best uses the pipeline lesson?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 2, [
        ["Treat no visible child as proof the path is clear.", "Occlusion makes absence of detection weak evidence."],
        ["Continue until a child detector produces a bounding box.", "Waiting converts uncertainty into avoidable stopping delay."],
        ["Model hidden-agent risk and preserve stopping margin.", "Correct: prediction and planning should respond to an occlusion cue before certainty."],
        ["Disable perception because the ball is not a road user.", "The ball supplies contextual evidence about a possible hidden agent."],
      ], ["The van creates an occluded region and the ball is a semantic cue.", "A safe plan accounts for a plausible hidden pedestrian."], "The perception-prediction-planning chain transfers to other mobile robots.", "1.5", 13),
    },
  ),
  assessmentCase(
    "pose-error-propagation",
    { kind: "table", caption: "Lane-keeping investigation", columns: ["Signal", "Observation"], rows: [["Camera lane fit", "stable in vehicle frame"], ["Map match", "vehicle pose shifted 1.8 m right"], ["Planner", "path centered on mapped lane"], ["Controller", "cross-track error near zero"]] },
    {
      application: probe("application", "intermediate", "Which subsystem should be investigated first?", ["ch1-system-pipeline"], 2, [
        ["Camera perception, because all lane events begin with an image.", "The camera lane fit is stable in its own frame."],
        ["Control, because it produces steering commands.", "The controller reports near-zero error to the path it was given."],
        ["Localization, because the map-frame pose is displaced.", "Correct: a shifted pose can make a valid mapped path wrong in the physical world."],
        ["Prediction, because other vehicles may change lanes.", "No dynamic-agent symptom is shown."],
      ], ["The anomalous evidence appears in the map match.", "Planner and controller can be internally consistent with a wrong pose."], "Check coordinate-frame assumptions before retuning downstream behavior.", "1.2", 4),
      diagnosis: probe("diagnosis", "advanced", "Why can the controller report near-zero error while the physical vehicle is off center?", ["ch1-system-pipeline"], 0, [
        ["It tracks a path from the wrong estimated pose.", "Correct: internal consistency does not guarantee world-frame accuracy."],
        ["A stable camera fit forces steering to zero.", "Camera stability alone does not determine the controller's reference."],
        ["Prediction overwrites all localization updates.", "The pipeline does not assign prediction that role."],
        ["The map directly moves with the physical vehicle.", "The map is the reference; the estimated pose is what shifted."],
      ], ["The planner centers a path in the map using the biased pose.", "The controller accurately tracks that biased reference."], "A wrong reference can make every downstream residual look deceptively good.", "1.2", 4),
      comparison: probe("comparison", "foundational", "Which additional check best separates a localization error from a control error?", ["ch1-system-pipeline"], 1, [
        ["Compare two controller gain settings against the same biased pose.", "Both tests retain the suspected localization error."],
        ["Compare estimated map pose with an independent positioning source.", "Correct: an independent pose observation tests the disputed subsystem."],
        ["Count the number of planned waypoints.", "Waypoint count does not validate physical pose."],
        ["Measure camera frame rate without examining geometry.", "Frame rate cannot confirm map alignment."],
      ], ["The disputed quantity is the vehicle's map-frame pose.", "An independent reference can confirm or reject its bias."], "Diagnostic evidence should directly observe the suspected state.", "1.2", 4),
      causal: probe("causal", "intermediate", "After correcting the 1.8 m pose bias, what should happen if planning and control were otherwise sound?", ["ch1-system-pipeline"], 3, [
        ["Camera lane fit should become unstable in the vehicle frame.", "Pose correction does not require degrading the camera fit."],
        ["The global destination should move 1.8 m right.", "A pose correction should not alter the intended destination."],
        ["Controller cross-track error should stay exactly zero throughout.", "A transient correction can create nonzero error."],
        ["Physical and mapped lanes should align.", "Correct: the corrected frame restores agreement between map path and road."],
      ], ["Planning already centers the path in the mapped lane.", "Correct localization places that reference in the physical lane."], "Predict downstream recovery from the dependency that was repaired.", "1.2", 4),
      transfer: probe("transfer", "intermediate", "A drone holds zero error to a commanded corridor but flies parallel to the real corridor after a GPS jump. Which AV lesson applies?", ["ch1-system-pipeline"], 1, [
        ["Increase motor gain until physical and mapped corridors coincide.", "Control gain cannot correct a displaced reference frame."],
        ["Validate localization before retuning path tracking.", "Correct: the same reference-error propagation occurs in aerial navigation."],
        ["Remove the planned corridor and fly open loop.", "Discarding the reference does not diagnose the pose jump."],
        ["Treat low tracking error as proof of global accuracy.", "That is the exact inference the evidence disproves."],
      ], ["The drone tracks its internal command accurately.", "The GPS jump makes that command wrong in the world frame."], "Pipeline reasoning transfers to any robot that plans in an estimated frame.", "1.2", 4),
    },
  ),
  assessmentCase(
    "sensor-disagreement",
    { kind: "log", caption: "Fog encounter", lines: ["camera: object confidence 0.28", "LiDAR: sparse returns at 31-35 m", "radar: stable range 33 m, closing speed 7 m/s", "planner: labels lane clear", "vehicle speed: 20 m/s"] },
    {
      application: probe("application", "advanced", "Which immediate system response best uses the available evidence?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 3, [
        ["Ignore radar because it has lower spatial resolution than the camera.", "Lower spatial detail does not erase stable range and closing-speed evidence."],
        ["Keep speed because neither camera nor LiDAR is individually confident.", "Agreement is not required before preserving safety margin."],
        ["Classify the object precisely before changing the plan.", "Collision risk can be managed before semantic identity is certain."],
        ["Represent an uncertain obstacle and slow while seeking confirmation.", "Correct: the fused evidence supports occupancy risk even without a confident class."],
      ], ["Fog weakens camera and LiDAR, while radar supplies stable range-rate evidence.", "At 20 m/s, waiting for semantic certainty consumes stopping margin."], "Fusion should preserve complementary evidence and expose uncertainty to planning.", "1.5", 12),
      diagnosis: probe("diagnosis", "intermediate", "What is the planner's clearest reasoning error?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 0, [
        ["It treats low confidence as clear space.", "Correct: low classification confidence is not a negative occupancy measurement."],
        ["It uses a closing-speed value from radar.", "Closing speed is directly relevant to collision risk."],
        ["It notices sparse LiDAR returns in fog.", "Recognizing degraded sensing is appropriate."],
        ["It receives more than one sensor modality.", "Multiple modalities are valuable when their reliability is interpreted correctly."],
      ], ["Several measurements suggest an object may occupy the lane.", "The planner collapses uncertainty into a clear-lane claim."], "Unknown and absent are different states in safety-critical perception.", "1.5", 12),
      comparison: probe("comparison", "intermediate", "Which evidence is most useful for deciding whether immediate longitudinal action is needed?", ["ch1-perception-robustness"], 1, [
        ["The camera's uncertain object class alone.", "Class uncertainty does not quantify time-to-conflict."],
        ["Radar range and closing speed, cross-checked.", "Correct: these measurements directly support collision-risk estimation."],
        ["The number of pixels in the foggy image.", "Pixel count is not a direct hazard measure."],
        ["The map's posted speed limit without live sensing.", "A legal limit does not describe the current obstacle."],
      ], ["Longitudinal risk depends on separation and relative motion.", "Radar supplies both while other sensors provide partial corroboration."], "Select evidence by the decision it must support, not by sensor prestige.", "1.5", 12),
      causal: probe("causal", "foundational", "If the camera confidence rises after leaving the fog but radar still reports the same closing object, what should change?", ["ch1-perception-robustness"], 2, [
        ["The radar measurement should be discarded immediately.", "Improved vision does not invalidate consistent radar evidence."],
        ["The planner should accelerate because uncertainty decreased.", "Greater certainty about an obstacle strengthens, not removes, the hazard."],
        ["Classification may improve; stopping margin remains.", "Correct: semantic confidence changes without erasing range-rate risk."],
        ["Localization should reset because the weather changed.", "Weather transition does not imply a pose reset."],
      ], ["The new observation mainly improves semantic information.", "The stable closing range continues to determine immediate collision risk."], "Different evidence updates different parts of the world model.", "1.5", 12),
      transfer: probe("transfer", "advanced", "A medical robot sees a weak camera outline but a reliable proximity sensor reports a person moving closer. Which response transfers the AV principle?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 0, [
        ["Slow the robot and retain the uncertain person hypothesis.", "Correct: complementary proximity evidence warrants a reversible safety action."],
        ["Continue because the camera class is below threshold.", "This repeats the error of treating uncertainty as absence."],
        ["Disable the proximity sensor because it lacks semantic labels.", "Its distance evidence is directly useful to collision avoidance."],
        ["Wait for contact to confirm the hypothesis.", "Confirmation by collision defeats the safety objective."],
      ], ["The sensors provide different but compatible evidence.", "A conservative action preserves safety while more evidence arrives."], "Uncertainty-aware fusion applies wherever robots share space with people.", "1.5", 12),
    },
  ),
  assessmentCase(
    "infrastructure-to-onboard",
    { kind: "table", caption: "Two automation proposals", columns: ["Proposal", "Guidance", "Environment"], rows: [["A", "Radio signals embedded in dedicated roads", "Structured lanes"], ["B", "Onboard cameras, LiDAR, radar, and computation", "Existing mixed roads"]] },
    {
      application: probe("application", "intermediate", "A city cannot rebuild most roads. Which proposal better fits that constraint, and why?", ["ch1-history-design-shifts"], 1, [
        ["A, because dedicated guidance removes all infrastructure cost.", "Embedded roadway guidance requires the reconstruction the city cannot fund."],
        ["B shifts road adaptation into onboard sensing.", "Correct: the vehicle can interpret existing roads without universal embedded guidance."],
        ["A, because structured lanes support operation across conditions.", "Structure narrows conditions; it does not guarantee universal robustness."],
        ["B, because onboard sensors need no road rules or maps.", "Onboard autonomy still depends on road conventions and often maps."],
      ], ["Proposal A depends on purpose-built roadway signals.", "Proposal B carries sensing and computation onboard."], "Historical architectures encode different infrastructure assumptions.", "1.3", 6),
      diagnosis: probe("diagnosis", "intermediate", "Proposal A works on a test lane but fails immediately on an ordinary street. What is the most likely architectural cause?", ["ch1-history-design-shifts"], 2, [
        ["Its onboard perception model overfits ordinary streets.", "The proposal does not rely on onboard scene perception."],
        ["Its control loop necessarily has too much steering authority.", "Nothing in the evidence identifies actuator authority."],
        ["The street lacks the external guidance the design assumes.", "Correct: the architecture moved intelligence into dedicated infrastructure."],
        ["Its radar cannot recognize embedded radio signals.", "The design expects roadway guidance, not radar recognition of it."],
      ], ["The successful environment contains embedded guidance.", "The failed environment removes that required input."], "Diagnose a system by testing the assumptions that differ between environments.", "1.3", 6),
      comparison: probe("comparison", "advanced", "Which comparison most fairly captures the tradeoff between the proposals?", ["ch1-history-design-shifts", "ch1-societal-tradeoffs"], 3, [
        ["A is generally safer; B is generally cheaper.", "Neither absolute follows across deployment conditions."],
        ["A needs no vehicle computation; B needs no infrastructure.", "Both systems still require vehicle control and supporting infrastructure."],
        ["A solves mixed traffic; B works just in dedicated lanes.", "The table states the reverse environmental emphasis."],
        ["A uses structured roads; B shifts complexity onboard.", "Correct: this states the real allocation tradeoff without absolutes."],
      ], ["External guidance can simplify scene interpretation.", "Onboard sensing accepts greater vehicle complexity to work on less-specialized roads."], "Compare where sensing, intelligence, and deployment cost are placed.", "1.3", 6),
      causal: probe("causal", "intermediate", "If proposal A loses one embedded signal segment, which effect follows most directly?", ["ch1-history-design-shifts", "ch1-control-reliability"], 0, [
        ["Guidance fails without redundancy or fallback.", "Correct: the missing infrastructure removes a required navigation input in that segment."],
        ["All onboard cameras become miscalibrated.", "Roadway signal loss does not alter camera calibration."],
        ["Proposal A directly converts into proposal B.", "An architecture cannot gain onboard perception merely from an outage."],
        ["Traffic demand outside the segment becomes zero.", "Guidance failure does not erase transportation demand."],
      ], ["Proposal A depends on continuous roadway guidance.", "A missing segment creates a local single point of failure without a backup."], "Architectural dependencies predict failure propagation.", "1.3", 6),
      transfer: probe("transfer", "intermediate", "An automated port can install markers on every private lane. Which lesson supports reconsidering proposal A there?", ["ch1-history-design-shifts"], 2, [
        ["Private sites eliminate the need for fail-safe control.", "Controlled access reduces variability but not failure risk."],
        ["Onboard sensing is prohibited wherever infrastructure is available.", "The lesson is a tradeoff, not a prohibition."],
        ["Controlled domains can make road guidance practical.", "Correct: the port satisfies the architecture's strongest deployment assumption."],
        ["Markers make the system unrestricted Level 5.", "A private marked domain remains restricted."],
      ], ["The port controls its lanes and can maintain guidance markers.", "That changes the cost and coverage disadvantage seen on public roads."], "Old architectural ideas may become useful when deployment assumptions change.", "1.3", 6),
    },
  ),
  assessmentCase(
    "challenge-learning",
    { kind: "table", caption: "Competition evidence", columns: ["Event", "Observed result"], rows: [["2004 desert challenge", "Best vehicle stopped after 7.4 miles"], ["2005 desert challenge", "Five vehicles finished; winner completed 132 miles"], ["2007 urban challenge", "Vehicles handled traffic rules and other road users"]] },
    {
      application: probe("application", "intermediate", "Which conclusion is best supported by the sequence rather than by one event alone?", ["ch1-deployment-evidence"], 3, [
        ["The 2004 result proved desert autonomy infeasible.", "Later finishes directly contradict that permanent conclusion."],
        ["A desert finish proves unrestricted urban readiness.", "The 2007 event added qualitatively different interaction demands."],
        ["Competition ranking alone measures public-road safety.", "A finish time does not establish a complete deployment safety case."],
        ["Failure analysis and harder challenges drove progress.", "Correct: the progression shows learning followed by expanded task demands."],
      ], ["Performance changed sharply between the two desert events.", "The later urban event then tested a broader set of behaviors."], "Milestones matter as evidence of capability progression, not trivia in isolation.", "1.3", 8),
      diagnosis: probe("diagnosis", "foundational", "Why would a team study the 2004 failures before designing for 2005?", ["ch1-deployment-evidence"], 0, [
        ["Failures expose reliability limits hidden by successes.", "Correct: early termination reveals concrete subsystem weaknesses."],
        ["The exact year determines which sensors can function.", "Calendar date is not a technical failure mechanism."],
        ["A longer course generally requires a different automation level.", "Course length does not assign monitoring responsibility."],
        ["Competition rules replace the need for engineering tests.", "Rules define tasks; they do not diagnose vehicle faults."],
      ], ["No vehicle finished in 2004, so the failure set was rich.", "Addressing repeated breakdowns can improve endurance and robustness."], "Failure evidence is a design input, not merely a poor score.", "1.3", 8),
      comparison: probe("comparison", "intermediate", "What did the 2007 urban task add beyond a longer version of the desert route?", ["ch1-deployment-evidence", "ch1-planning-uncertainty"], 1, [
        ["Just a requirement for higher maximum speed.", "Urban difficulty centered on interaction and rules, not simply speed."],
        ["Rule compliance and interaction with traffic.", "Correct: these demands test prediction and decision making in a dynamic setting."],
        ["A return to embedded roadway radio guidance.", "The challenge progression emphasized onboard autonomous systems."],
        ["Proof that all weather conditions were solved.", "The event scope cannot establish universal environmental robustness."],
      ], ["Desert navigation emphasizes terrain and route completion.", "Urban driving adds regulated multi-agent behavior."], "Compare evaluation environments by the capabilities they stress.", "1.3", 9),
      causal: probe("causal", "advanced", "If the 2005 teams had optimized only course speed while preserving frequent system crashes, what outcome would be most likely?", ["ch1-deployment-evidence", "ch1-control-reliability"], 2, [
        ["Higher speed would ensure a finish before failures occur.", "Greater speed does not remove crash probability and can worsen consequences."],
        ["The vehicles would become ready for urban traffic rules.", "Speed optimization does not supply interaction reasoning."],
        ["Reliability failures would still end the mission.", "Correct: completion requires sustained operation, not peak speed alone."],
        ["Sensor modality would no longer matter.", "Reliable navigation still depends on sensing."],
      ], ["The earlier event ended through failures long before course completion.", "Optimizing a nonbinding metric leaves that limiting cause intact."], "Improve the bottleneck revealed by the evaluation, not the most visible metric.", "1.3", 8),
      transfer: probe("transfer", "advanced", "A hospital robot succeeds in empty halls but fails during visiting hours. Which competition lesson gives the strongest next evaluation?", ["ch1-deployment-evidence"], 1, [
        ["Repeat just the empty-hall course until its time improves.", "That does not test the interaction failure."],
        ["Stage tests with people, rules, and harder interactions.", "Correct: difficulty should expand toward the demonstrated deployment gap."],
        ["Declare general readiness from the successful controlled run.", "Success in one domain does not transfer automatically."],
        ["Remove logging so behavior more closely resembles deployment.", "Logging is needed to diagnose the new failures."],
      ], ["The robot's missing capability appears only with dynamic agents.", "A progressive challenge can isolate and then stress that capability."], "Evaluation should evolve from controlled navigation toward realistic interaction.", "1.3", 8),
    },
  ),
  assessmentCase(
    "accessible-shuttle",
    { kind: "table", caption: "Proposed rural shuttle pilot", columns: ["Measure", "Value"], rows: [["Wheelchair-accessible stops", "2 of 14"], ["Smartphone-only booking", "required"], ["Service area", "low-transit neighborhoods"], ["Fare", "$4 per trip"]] },
    {
      application: probe("application", "intermediate", "Which change most directly aligns the pilot with its mobility-access goal?", ["ch1-equity-access", "ch1-societal-tradeoffs"], 0, [
        ["Add accessible stops plus phone or kiosk booking.", "Correct: this removes two barriers for the people the service is meant to include."],
        ["Increase vehicle speed while keeping the same stops.", "Faster trips do not fix physical and digital exclusion."],
        ["Move the pilot to a high-transit downtown district.", "That abandons the stated service gap rather than addressing it."],
        ["Collect more passenger location history by default.", "Additional surveillance does not improve booking or boarding access."],
      ], ["The pilot targets underserved neighborhoods.", "Its stop and booking design excludes riders with mobility or digital-access constraints."], "Accessibility claims must be tested against the complete service journey.", "1.4", 11),
      diagnosis: probe("diagnosis", "intermediate", "Why could ridership remain low even if the autonomous driving performs safely?", ["ch1-equity-access"], 2, [
        ["Safe automation generally reduces demand for transit.", "Safety does not imply lower demand."],
        ["A rural route cannot provide social value.", "The chapter identifies underserved mobility as a potential benefit."],
        ["Booking and boarding barriers exclude intended riders.", "Correct: service accessibility can fail independently of driving capability."],
        ["A four-dollar fare proves the control system is unstable.", "Fare and vehicle stability are unrelated measures."],
      ], ["Only two stops support wheelchairs and booking requires a smartphone.", "Those constraints can block access before a ride begins."], "Deployment success includes human access, not only autonomous operation.", "1.4", 11),
      comparison: probe("comparison", "foundational", "Which evaluation compares equity more meaningfully?", ["ch1-equity-access"], 3, [
        ["Average vehicle speed versus maximum vehicle speed.", "This compares performance, not distribution of access."],
        ["Number of sensors versus number of compute units.", "Hardware counts do not show who can use the service."],
        ["Total rides without identifying unmet demand.", "Aggregate use can hide exclusion among target groups."],
        ["Completion rates by access-relevant rider groups.", "Correct: disaggregated outcomes reveal whether barriers are distributed unevenly."],
      ], ["Equity concerns who receives benefits and encounters barriers.", "Disaggregated completion data directly measures that distribution."], "Aggregate success can conceal unequal access.", "1.4", 11),
      causal: probe("causal", "intermediate", "If kiosk booking is added but inaccessible stops remain, what outcome is most defensible?", ["ch1-equity-access"], 1, [
        ["All accessibility barriers are eliminated.", "Physical boarding access remains unresolved."],
        ["Digital access improves; wheelchair barriers remain.", "Correct: one intervention removes one barrier, not the other."],
        ["The pilot directly becomes environmentally neutral.", "Booking channels do not determine emissions."],
        ["Autonomous-driving reliability necessarily decreases.", "A booking change does not imply a driving-system fault."],
      ], ["Kiosks provide an alternative to smartphone booking.", "Only two stops still support wheelchair boarding."], "Evaluate interventions against each distinct barrier they target.", "1.4", 11),
      transfer: probe("transfer", "advanced", "A city deploys autonomous grocery delivery to a neighborhood with poor broadband. Which transferred design best preserves access?", ["ch1-equity-access"], 2, [
        ["Require a new high-end phone for all orders.", "That reproduces the digital barrier."],
        ["Serve just blocks with the strongest home Wi-Fi.", "That directs benefits away from the access gap."],
        ["Offer offline ordering and accessible pickup.", "Correct: multiple channels and physical access broaden participation."],
        ["Judge equity just by total delivery distance.", "Distance does not show which residents can use the service."],
      ], ["The new context changes the service but retains a digital-access constraint.", "Alternative ordering and pickup paths reduce dependence on broadband."], "Inclusive design principles transfer across autonomous mobility services.", "1.4", 11),
    },
  ),
  assessmentCase(
    "workforce-transition",
    { kind: "scenario", text: "A freight company plans a five-year transition to autonomous highway trucks. Its 600 drivers perform long-haul driving, local delivery, inspection, customer handoff, and incident response." },
    {
      application: probe("application", "advanced", "Which transition plan best addresses the actual work described?", ["ch1-societal-tradeoffs"], 1, [
        ["Eliminate all roles immediately because highway automation replaces all tasks.", "The scenario lists several tasks outside highway driving."],
        ["Phase deployment around affected tasks and fund retraining.", "Correct: it responds to task-level displacement and creates a managed transition."],
        ["Keep job titles unchanged while silently removing paid duties.", "Nominal continuity does not protect workers from lost work."],
        ["Evaluate just fuel savings because employment is outside deployment design.", "The chapter treats workforce disruption as a core societal effect."],
      ], ["Automation targets long-haul driving first, not every duty.", "A staged, task-aware plan can connect displaced workers to remaining and emerging roles."], "Analyze automation at the task level and plan for distributional effects.", "1.4", 11),
      diagnosis: probe("diagnosis", "intermediate", "Management predicts exactly 600 jobs will disappear in year one. What is the main flaw in that estimate?", ["ch1-societal-tradeoffs"], 0, [
        ["It treats one automated task as an eliminated role.", "Correct: the work bundle and five-year rollout contradict a one-step one-for-one estimate."],
        ["Autonomous trucks cannot affect employment.", "The chapter explicitly identifies displacement risk."],
        ["Inspection and handoff should stay with the same person forever.", "Tasks can be reorganized even if they are not automated."],
        ["A workforce estimate should depend just on vehicle speed.", "Speed does not capture role redesign or rollout timing."],
      ], ["Each driver performs multiple tasks.", "The automation scope and deployment schedule affect how roles change."], "Job impact estimates need task composition, adoption timing, and new-role demand.", "1.4", 11),
      comparison: probe("comparison", "intermediate", "Which metric better compares two transition strategies?", ["ch1-societal-tradeoffs"], 2, [
        ["Number of autonomous-truck press releases.", "Publicity is not a worker outcome."],
        ["Maximum demonstration speed.", "Technical speed does not measure transition quality."],
        ["Track gains, job loss, retraining, and wages.", "Correct: it evaluates benefits and who bears transition costs."],
        ["Percentage of trucks painted with a new logo.", "Branding has no causal link to workforce adaptation."],
      ], ["A societal comparison must include system benefits and distributional consequences.", "Employment, training, and wages make the tradeoff visible."], "Use a portfolio of outcomes when one metric hides affected groups.", "1.4", 11),
      causal: probe("causal", "foundational", "If deployment is phased by route while paid retraining begins before displacement, what effect is most plausible?", ["ch1-societal-tradeoffs"], 3, [
        ["All workers are promised a higher wage.", "Training improves options but cannot guarantee an individual outcome."],
        ["Technical highway risk becomes zero.", "Workforce planning does not eliminate driving-system risk."],
        ["No job duties will change.", "The purpose of the transition is to change automated tasks."],
        ["Workers gain time for changed roles.", "Correct: sequencing reduces abrupt displacement and supports adaptation."],
      ], ["The route phase-in spreads changes over time.", "Early paid training prepares workers before their original tasks decline."], "Transition timing can change who absorbs the cost of automation.", "1.4", 11),
      transfer: probe("transfer", "intermediate", "A hospital introduces autonomous supply carts. Which lesson should guide staffing analysis?", ["ch1-societal-tradeoffs"], 0, [
        ["Separate transport from clinical and exception duties.", "Correct: task decomposition reveals what is automated and what work remains."],
        ["Assume all orderly roles disappear when one cart moves autonomously.", "This repeats the one-task-equals-one-job error."],
        ["Ignore workers because the robot operates indoors.", "The social transition exists regardless of road setting."],
        ["Measure just battery capacity when planning retraining.", "Battery performance does not describe workforce change."],
      ], ["The cart automates a movement task within broader hospital roles.", "Task-level analysis supports realistic redesign and training."], "Workforce-transition reasoning transfers across automation domains.", "1.4", 11),
    },
  ),
  assessmentCase(
    "empty-mile-rebound",
    { kind: "table", caption: "Robotaxi pilot change", columns: ["Measure", "Before", "After"], rows: [["Passenger-km/day", 100000, 120000], ["Empty repositioning-km/day", 5000, 42000], ["Average occupancy", 1.7, 1.2], ["Energy per vehicle-km", "-18%", "-18%"]] },
    {
      application: probe("application", "advanced", "Which policy most directly targets the evidence that threatens the environmental benefit?", ["ch1-societal-tradeoffs"], 2, [
        ["Raise maximum acceleration to shorten each trip.", "Faster acceleration can increase energy use and does not reduce empty travel."],
        ["Advertise the 18% vehicle-efficiency gain without other measures.", "Per-kilometer efficiency alone ignores the large mileage increase."],
        ["Limit empty repositioning and promote sharing.", "Correct: it addresses the two observed drivers of excess vehicle-kilometers."],
        ["Remove occupancy reporting from the evaluation.", "Hiding the metric cannot improve the outcome."],
      ], ["Empty mileage grows by 37,000 km and occupancy falls.", "Those changes can offset lower energy per vehicle-kilometer."], "System-wide impact depends on activity as well as per-unit efficiency.", "1.4", 11),
      diagnosis: probe("diagnosis", "intermediate", "Why is the claim 'energy use must fall by 18%' unsupported?", ["ch1-societal-tradeoffs"], 1, [
        ["Vehicle efficiency cannot improve with automation.", "The table explicitly reports a per-kilometer gain."],
        ["Mileage changed; unit savings do not fix total energy.", "Correct: the denominator and activity level both changed."],
        ["Passenger-kilometers are unrelated to transportation demand.", "They are a direct measure of served travel."],
        ["Occupancy affects privacy but not fleet movement.", "Lower occupancy can require more vehicle travel for the same passenger demand."],
      ], ["The 18% value applies to each vehicle-kilometer.", "The fleet now drives many more empty and low-occupancy kilometers."], "Do not infer a total impact from an intensity metric alone.", "1.4", 11),
      comparison: probe("comparison", "foundational", "Which pair of metrics best compares the pilot's transport efficiency before and after?", ["ch1-societal-tradeoffs"], 0, [
        ["Total and per-passenger-km energy.", "Correct: these capture both aggregate impact and useful movement delivered."],
        ["Vehicle paint color and app downloads.", "Neither measures transport or energy efficiency."],
        ["Top speed and number of map tiles.", "These do not reveal fleet activity or delivered mobility."],
        ["Just energy per empty vehicle-kilometer.", "A narrow intensity omits passenger service and total activity."],
      ], ["The policy goal concerns total environmental impact and mobility output.", "Energy per passenger-kilometer relates energy to useful service."], "Choose metrics that preserve both numerator and system purpose.", "1.4", 11),
      causal: probe("causal", "intermediate", "If empty mileage returns to 5,000 km while passenger service stays at 120,000 km, what effect becomes more likely?", ["ch1-societal-tradeoffs"], 3, [
        ["The per-kilometer efficiency gain disappears directly.", "Routing changes do not necessarily alter vehicle efficiency."],
        ["Average occupancy should fall below one.", "Reduced repositioning does not force impossible occupancy."],
        ["Passenger demand becomes zero.", "Service is held constant in the question."],
        ["Fewer empty miles let unit gains cut total energy.", "Correct: the major rebound source is removed while useful travel remains."],
      ], ["The fleet keeps its per-kilometer gain.", "Reducing unoccupied distance lowers the activity that was offsetting it."], "Causal claims improve when the changed factor matches the observed mechanism.", "1.4", 11),
      transfer: probe("transfer", "advanced", "An autonomous warehouse fleet uses 20% less energy per meter but total energy rises. Which first check transfers from the robotaxi case?", ["ch1-societal-tradeoffs"], 1, [
        ["Whether the robots have humanlike names.", "Naming cannot explain fleet energy."],
        ["Check whether total or low-load travel rose.", "Correct: more activity can offset per-meter efficiency."],
        ["Whether the facility has a public road license.", "Licensing does not determine warehouse travel volume."],
        ["Whether all motors have identical torque.", "Motor matching alone does not explain total route activity."],
      ], ["The apparent contradiction matches an intensity-versus-total pattern.", "Travel volume and useful load are the missing quantities."], "Rebound analysis transfers to other autonomous fleets.", "1.4", 11),
    },
  ),
  assessmentCase(
    "location-data-governance",
    { kind: "table", caption: "Fleet data proposal", columns: ["Field", "Retention", "Access"], rows: [["Exact passenger route", "indefinite", "all analytics staff"], ["Cabin audio", "indefinite", "vendor and fleet"], ["Safety event clip", "indefinite", "all analytics staff"], ["Account identifier", "joined to every record", "all analytics staff"]] },
    {
      application: probe("application", "advanced", "Which redesign preserves safety analysis while most directly reducing privacy exposure?", ["ch1-privacy-security"], 1, [
        ["Publish exact routes after removing passenger names.", "Routes can re-identify homes, workplaces, and routines."],
        ["Minimize, unlink, restrict access, and expire raw data.", "Correct: this reduces collection, linkage, audience, and retention while preserving scoped safety records."],
        ["Keep all data indefinitely but add a longer consent form.", "Notice does not remove unnecessary exposure."],
        ["Copy the same records to more vendors for redundancy.", "More copies and recipients expand the privacy and security surface."],
      ], ["The proposal combines sensitive content, broad access, identity linkage, and unlimited retention.", "Data minimization and purpose-bound controls address each source of exposure."], "Privacy protection is a lifecycle design problem, not only an encryption checkbox.", "1.4", 11),
      diagnosis: probe("diagnosis", "intermediate", "Why is removing the passenger name alone insufficient anonymization?", ["ch1-privacy-security"], 2, [
        ["Audio can never contain personal information.", "Cabin audio may contain voices and private conversation."],
        ["Account identifiers are harmless if stored in a database.", "Persistent identifiers directly support record linkage."],
        ["Routes and linked IDs can reveal a person's routine.", "Correct: location traces are highly identifying even without a name field."],
        ["Safety clips become public records automatically.", "The table does not establish public-record status."],
      ], ["Exact origins, destinations, and repeated routes are distinctive.", "Joining them to an account makes re-identification easier."], "Removing one label does not neutralize linked behavioral data.", "1.4", 11),
      comparison: probe("comparison", "foundational", "Which access policy better follows least privilege?", ["ch1-privacy-security"], 3, [
        ["Every employee receives permanent access for convenience.", "Convenience is not a job-based need."],
        ["The vendor receives all cabin audio to improve any future product.", "An open-ended purpose grants excessive data."],
        ["One shared administrator account is used by every analyst.", "Shared credentials prevent individual accountability."],
        ["Use time-limited access to relevant event records.", "Correct: access is scoped by role, purpose, data, and time."],
      ], ["Least privilege limits access to what a task requires.", "The scoped investigator policy has both purpose and time boundaries."], "Access design should match the minimum operational need.", "1.4", 11),
      causal: probe("causal", "intermediate", "If an attacker compromises one analytics account under the original proposal, what design choice increases the likely harm most?", ["ch1-privacy-security"], 0, [
        ["Broad access to linked past records.", "Correct: one credential exposes a large historical and identifiable dataset."],
        ["Safety clips are useful for engineering.", "Usefulness does not itself determine breach scope."],
        ["Vehicles travel on public roads.", "Road setting does not explain database blast radius."],
        ["The fleet has more than one data field.", "Multiplicity matters through sensitivity and linkage, not count alone."],
      ], ["The compromised role can read every category.", "Unlimited retention and linkage increase both volume and identifiability."], "Privacy architecture also limits the blast radius of security failure.", "1.4", 11),
      transfer: probe("transfer", "intermediate", "A smart-building robot records room-level occupant paths. Which AV data lesson applies most directly?", ["ch1-privacy-security"], 2, [
        ["Indoor location data cannot reveal behavior.", "Room sequences can reveal routines and sensitive activities."],
        ["Keep every path because storage is inexpensive.", "Low storage cost does not create a legitimate retention purpose."],
        ["Collect and retain only the resolution and duration needed for the stated service.", "Correct: purpose-bound minimization applies to indoor mobility traces."],
        ["Share identifiers broadly so teams can recognize repeat users.", "Broad linkage increases surveillance risk."],
      ], ["Both systems collect persistent movement patterns.", "The same minimization, separation, and access controls reduce exposure."], "Location privacy principles transfer across mobile cyber-physical systems.", "1.4", 11),
    },
  ),
  assessmentCase(
    "weather-degradation",
    { kind: "table", caption: "Perception in heavy rain", columns: ["Sensor", "Observation"], rows: [["Camera", "glare; lane confidence 0.31"], ["LiDAR", "many rain returns; object clusters unstable"], ["Radar", "stable lead range and range rate"], ["Map", "curve ahead; no live obstacle state"]] },
    {
      application: probe("application", "intermediate", "Which operating response best matches the evidence?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 0, [
        ["Reduce speed, increase margins, and weight reliable radar evidence while monitoring degraded sensors.", "Correct: the response adapts both fusion and planning to reduced visibility."],
        ["Maintain speed because the static map still contains the road.", "The map cannot replace live obstacle and lane evidence."],
        ["Use camera confidence as the only occupancy signal.", "The camera is explicitly degraded and radar remains informative."],
        ["Disable all sensing until rain stops.", "That removes the remaining reliable evidence and cannot support safe motion."],
      ], ["Rain degrades camera and LiDAR in different ways.", "Radar remains useful, but overall uncertainty and stopping risk increase."], "Robust behavior adapts sensor weighting and motion together.", "1.5", 12),
      diagnosis: probe("diagnosis", "intermediate", "Why would simply averaging the three sensor outputs be unsafe?", ["ch1-perception-robustness"], 1, [
        ["Sensor fusion is prohibited in adverse weather.", "Fusion is valuable when reliability is modeled."],
        ["The measurements have different failure modes and reliability under rain.", "Correct: equal weighting can let corrupted returns dominate stable evidence."],
        ["Radar always provides a complete semantic scene.", "Radar has lower spatial and semantic resolution."],
        ["Maps update faster than physical sensors.", "The table describes a static map without live obstacle state."],
      ], ["Camera, LiDAR, and radar quality differ in this condition.", "A meaningful fusion rule accounts for those reliabilities."], "Fusion is evidence weighting, not blind arithmetic averaging.", "1.5", 12),
      comparison: probe("comparison", "advanced", "Which pairing uses each available source for what it supports best?", ["ch1-perception-robustness"], 2, [
        ["Map for live closing speed; radar for lane paint color.", "Those assignments reverse the sources' capabilities."],
        ["Camera alone for all hazards; map ignored because it is static.", "This discards complementary geometry and radar evidence."],
        ["Radar for lead range-rate, map for road geometry prior, camera/LiDAR with reduced confidence.", "Correct: each source contributes within its observed reliability."],
        ["LiDAR rain clusters as confirmed obstacles; radar discarded.", "Unstable precipitation returns should not overrule stable radar."],
      ], ["Radar measures relative motion robustly in the table.", "The map supplies prior road shape while degraded sensors retain limited evidence."], "Assign evidence by capability and condition-specific reliability.", "1.5", 12),
      causal: probe("causal", "foundational", "If speed is reduced while sensing latency stays constant, what safety quantity generally improves?", ["ch1-perception-robustness", "ch1-control-reliability"], 3, [
        ["Camera glare disappears immediately.", "Speed does not remove optical glare."],
        ["Rain returns become semantic labels.", "Motion change does not classify sensor artifacts."],
        ["The static map gains live obstacle positions.", "Speed does not change map contents."],
        ["Distance traveled during sensing and response delay decreases.", "Correct: lower speed reduces distance consumed before a response begins."],
      ], ["Latency remains the same duration.", "Distance accumulated during that duration is proportional to speed."], "Motion policy can compensate partially for degraded sensing.", "1.5", 12),
      transfer: probe("transfer", "advanced", "A farm robot enters dust that degrades cameras and laser scans while wheel radar remains stable. What transfers from the rain case?", ["ch1-perception-robustness"], 0, [
        ["Reassess sensor reliability, slow down, and preserve corroborating evidence.", "Correct: the failure modes differ in detail but the uncertainty response is the same."],
        ["Use the dusty camera as ground truth because it has color.", "Color does not guarantee reliable geometry in dust."],
        ["Assume the field map proves no worker is present.", "A static map cannot establish current occupancy."],
        ["Increase speed to leave the dust before processing changes.", "Higher speed reduces response margin under uncertainty."],
      ], ["Dust creates condition-dependent sensor failures analogous to rain.", "Reliability-aware fusion and conservative motion preserve safety."], "Robustness principles transfer even when the environmental contaminant changes.", "1.5", 12),
    },
  ),
  assessmentCase(
    "occluded-crosswalk",
    { kind: "log", caption: "Approach to a crosswalk", lines: ["parked van blocks right-side sidewalk", "ball appears from behind van", "no pedestrian box detected", "time to crosswalk at current speed: 1.8 s", "comfortable stopping time: 1.5 s"] },
    {
      application: probe("application", "intermediate", "Which plan best accounts for the hidden-region evidence?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 2, [
        ["Continue because the detector reports no pedestrian.", "Occlusion makes the negative detection weak evidence."],
        ["Swerve around the van without checking the opposing lane.", "That substitutes a new unassessed hazard."],
        ["Slow before the crosswalk so a hidden pedestrian remains stoppable.", "Correct: the ball and occlusion justify preserving stopping margin."],
        ["Accelerate to pass before anyone emerges.", "Acceleration shortens reaction time and increases harm."],
      ], ["The van hides a region that matters to the path.", "The ball raises the probability of an unseen person near the crossing."], "Planning must account for unobserved but plausible occupancy.", "1.5", 13),
      diagnosis: probe("diagnosis", "foundational", "What does 'no pedestrian box detected' mean in this scene?", ["ch1-perception-robustness"], 3, [
        ["The sidewalk is certainly empty.", "The sensor cannot see behind the van."],
        ["The pedestrian detector is unnecessary near crosswalks.", "Detection remains useful in visible regions."],
        ["The ball must have moved without a person.", "That is one possibility, not a justified certainty."],
        ["No visible pedestrian was detected; hidden occupancy remains uncertain.", "Correct: the observation is limited by the field of view."],
      ], ["Detection reports on observed image content.", "The critical region is physically occluded."], "Negative sensing evidence is conditional on observability.", "1.5", 12),
      comparison: probe("comparison", "intermediate", "Which cue adds more predictive value than an empty image region alone?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 0, [
        ["The moving ball emerging from the hidden sidewalk area.", "Correct: it is contextual evidence of activity behind the occluder."],
        ["The van's paint color.", "Color does not meaningfully predict hidden occupancy."],
        ["The number of map tiles loaded.", "Tile count does not describe a hidden road user."],
        ["The vehicle's radio volume.", "Cabin audio is unrelated to the scene."],
      ], ["A ball can precede a child entering the roadway.", "Its trajectory connects the hidden region to the vehicle path."], "Semantic context can inform prediction before direct detection.", "1.5", 13),
      causal: probe("causal", "advanced", "If speed increases enough that stopping time becomes 2.1 s while time to the crosswalk stays 1.8 s, what changes?", ["ch1-planning-uncertainty", "ch1-control-reliability"], 1, [
        ["The van becomes less occluding.", "Vehicle speed does not reveal the hidden sidewalk."],
        ["A comfortable stop after a late emergence may no longer fit before the crosswalk.", "Correct: required stopping time now exceeds available time."],
        ["The pedestrian detector becomes more certain.", "Higher speed does not improve image visibility."],
        ["The ball ceases to be a contextual cue.", "Its meaning is unchanged while consequence increases."],
      ], ["Available time is 1.8 seconds.", "Required stopping time would be 2.1 seconds, creating a negative margin."], "Risk depends on uncertainty and the remaining ability to respond.", "1.5", 13),
      transfer: probe("transfer", "intermediate", "At an aisle intersection, a warehouse robot sees a pallet blocking view and hears a forklift alarm. What response transfers best?", ["ch1-perception-robustness", "ch1-planning-uncertainty"], 3, [
        ["Ignore the alarm because no forklift is visible.", "The occlusion explains why visual confirmation is absent."],
        ["Enter the aisle quickly to obtain a better view.", "That consumes stopping margin in the conflict zone."],
        ["Assume the pallet itself will prevent a collision.", "The pallet is an occluder, not a safety barrier across the aisle."],
        ["Slow before the intersection and model a possible hidden forklift.", "Correct: contextual evidence and occlusion justify a conservative approach."],
      ], ["The pallet hides a conflict region and the alarm supplies contextual evidence.", "Slowing preserves a response if the forklift appears."], "Occlusion-aware planning applies to shared workspaces as well as roads.", "1.5", 13),
    },
  ),
  assessmentCase(
    "merge-uncertainty",
    { kind: "table", caption: "Highway merge predictions", columns: ["Agent", "Possible behavior", "Probability"], rows: [["Rear vehicle", "maintains speed", 0.55], ["Rear vehicle", "accelerates to close gap", 0.35], ["Rear vehicle", "slows to yield", 0.10], ["Ego", "merge completion time", "2.4 s"]] },
    {
      application: probe("application", "advanced", "Which planning response best uses the distribution?", ["ch1-planning-uncertainty"], 1, [
        ["Merge because maintaining speed is the single most likely behavior.", "The 35% closing case can still create a serious conflict."],
        ["Evaluate merge trajectories against all credible behaviors and preserve an abort option.", "Correct: risk depends on the consequence-weighted set, not only the mode."],
        ["Wait until one behavior reaches probability 1.0.", "Driving decisions rarely receive complete certainty."],
        ["Ignore the rear vehicle because it is not in front of ego.", "Rear approach speed directly affects merge safety."],
      ], ["The distribution includes a substantial gap-closing possibility.", "A robust plan considers that outcome and retains a safe alternative."], "Planning under uncertainty uses credible futures, not only the most likely one.", "1.5", 13),
      diagnosis: probe("diagnosis", "intermediate", "A planner crashes whenever the rear vehicle accelerates. Which design assumption is most suspect?", ["ch1-planning-uncertainty"], 0, [
        ["It treats the most likely forecast as the only possible future.", "Correct: the repeated failure corresponds to a listed but ignored mode."],
        ["It uses probabilities instead of exact calendar dates.", "Probabilities are appropriate for uncertain behavior."],
        ["It keeps an abort trajectory available.", "An abort option would reduce, not explain, the failure."],
        ["It recognizes that rear traffic affects merging.", "That recognition is necessary for a safe merge."],
      ], ["Acceleration has 0.35 probability and repeatedly causes failure.", "A single-mode plan discards this credible alternative."], "Multimodal forecasts matter when lower-probability outcomes have high consequence.", "1.5", 13),
      comparison: probe("comparison", "foundational", "Which forecast is more useful for this decision?", ["ch1-planning-uncertainty"], 2, [
        ["Rear vehicle exists.", "Existence alone provides no future motion."],
        ["Rear vehicle speed at one instant with no uncertainty.", "One measurement does not express possible reactions during the merge."],
        ["Several future motions with probabilities over the merge horizon.", "Correct: these can be checked against candidate ego trajectories."],
        ["Rear vehicle color and manufacturer.", "Those attributes do not directly determine merge geometry."],
      ], ["The decision unfolds over 2.4 seconds.", "A multimodal horizon forecast describes occupancy during that interval."], "Prediction should match the time and alternatives relevant to planning.", "1.5", 13),
      causal: probe("causal", "intermediate", "If V2V intent confirms the rear vehicle will yield, what should happen to planning uncertainty?", ["ch1-planning-uncertainty"], 3, [
        ["Every road-user uncertainty becomes zero.", "One intent message does not resolve all agents or execution error."],
        ["The merge must be executed regardless of current geometry.", "Intent complements but does not replace safety constraints."],
        ["The rear vehicle should be removed from the world model.", "It remains physically relevant while yielding."],
        ["Probability can shift toward yielding while retaining checks for stale or failed communication.", "Correct: new evidence updates belief but does not justify blind trust."],
      ], ["A communicated intent is informative evidence.", "Messages can be delayed, wrong, or followed imperfectly, so residual uncertainty remains."], "Communication updates prediction; it does not abolish verification.", "1.5", 13),
      transfer: probe("transfer", "advanced", "A service robot must pass a person who may turn unpredictably in a hallway. Which merge principle transfers?", ["ch1-planning-uncertainty"], 0, [
        ["Plan against multiple plausible motions and keep a stopping alternative.", "Correct: the robot should preserve safety across credible human responses."],
        ["Use only the person's most likely path.", "A less likely turn can still create collision risk."],
        ["Wait for a mathematically certain prediction.", "Complete certainty is unrealistic in human interaction."],
        ["Ignore the person after announcing the robot's route.", "Communication does not guarantee compliance."],
      ], ["Both tasks involve coupled motion with an uncertain human agent.", "A robust, reversible plan manages that uncertainty."], "Multi-agent planning principles transfer to other shared spaces.", "1.5", 13),
    },
  ),
  assessmentCase(
    "brake-latency-chain",
    { kind: "table", caption: "Emergency-stop timing at 20 m/s", columns: ["Stage", "Delay"], rows: [["Sensor exposure and transfer", "55 ms"], ["Perception and prediction", "80 ms"], ["Planning", "35 ms"], ["Control and actuator response", "130 ms"], ["Total before meaningful deceleration", "300 ms"]] },
    {
      application: probe("application", "intermediate", "Which first engineering step best addresses the timing evidence?", ["ch1-control-reliability", "ch1-system-pipeline"], 3, [
        ["Tune steering gain without measuring braking stages.", "The measured issue is end-to-end brake latency."],
        ["Optimize only the 35 ms planner because planning selects the stop.", "It is not the largest delay and cannot explain the full chain alone."],
        ["Raise cruising speed so the event completes sooner.", "Higher speed increases distance traveled during delay."],
        ["Set an end-to-end budget and reduce the largest control/actuator and compute contributors.", "Correct: the action follows the measured critical path."],
      ], ["The total response is the sum of dependent stages.", "Control and actuator response is largest, but compute and sensing also consume margin."], "Safety timing must be budgeted end to end.", "1.5", 14),
      diagnosis: probe("diagnosis", "foundational", "How far does the vehicle travel during the 300 ms pre-deceleration delay?", ["ch1-control-reliability"], 1, [
        ["0.6 m", "That corresponds to 30 ms at 20 m/s."],
        ["6 m", "Correct: 20 m/s multiplied by 0.3 s equals 6 m."],
        ["20 m", "That would be one full second of travel."],
        ["60 m", "That would require three seconds at this speed."],
      ], ["Convert 300 ms to 0.3 seconds.", "Distance before deceleration is speed times delay: 20 x 0.3 = 6 meters."], "Small timing delays become material stopping distances at road speed.", "1.5", 14),
      comparison: probe("comparison", "advanced", "Which optimization produces the larger direct latency reduction?", ["ch1-control-reliability"], 0, [
        ["Cut actuator response by 50 ms rather than planner time by 10 ms.", "Correct: the measured critical path falls by 50 ms instead of 10 ms."],
        ["Improve map storage by 1 GB rather than timing any stage.", "Storage capacity is not a measured delay."],
        ["Add a user-interface animation rather than change control timing.", "The display is outside the braking critical path."],
        ["Increase sensor resolution while keeping transfer delay fixed.", "More data may add load without reducing the listed delay."],
      ], ["Dependent stage savings add to total response reduction.", "Fifty milliseconds is the larger measured improvement."], "Prioritize bottlenecks by end-to-end effect, then remeasure.", "1.5", 14),
      causal: probe("causal", "intermediate", "If total delay falls from 300 ms to 150 ms at the same speed, how does pre-deceleration travel change?", ["ch1-control-reliability"], 2, [
        ["It remains 6 m because vehicle speed is unchanged.", "Distance depends on both speed and delay."],
        ["It rises to 12 m because processing is faster.", "Shorter delay reduces, not doubles, travel."],
        ["It falls from 6 m to 3 m.", "Correct: halving time at constant speed halves distance."],
        ["It becomes zero because all delay was removed.", "A 150 ms delay remains."],
      ], ["At 20 m/s for 0.15 seconds, the vehicle travels 3 meters.", "The original 0.3-second distance was 6 meters."], "Latency reduction translates directly into additional physical margin.", "1.5", 14),
      transfer: probe("transfer", "intermediate", "A surgical robot's safety stop passes software tests but the motor takes 180 ms to halt. Which lesson transfers?", ["ch1-control-reliability"], 1, [
        ["Software completion time alone defines physical safety.", "The actuator continues moving after software responds."],
        ["Measure and budget sensing, computation, communication, and actuator response together.", "Correct: the physical stop depends on the full chain."],
        ["A faster display will stop the motor sooner.", "Display timing is not the actuator path."],
        ["Ignore actuator delay if the command is correct.", "Correct commands can still arrive or execute too late."],
      ], ["The safety outcome is physical cessation of motion.", "Software and actuator delays both precede that outcome."], "End-to-end timing is fundamental across safety-critical robots.", "1.5", 14),
    },
  ),
  assessmentCase(
    "low-friction-control",
    { kind: "table", caption: "Curve response", columns: ["Condition", "Dry", "Icy"], rows: [["Speed", "45 km/h", "45 km/h"], ["Commanded steering", "same", "same"], ["Path error", "0.18 m", "1.35 m"], ["Wheel slip", "low", "high"]] },
    {
      application: probe("application", "intermediate", "Which response best addresses the changed road condition?", ["ch1-control-reliability"], 0, [
        ["Reduce speed and adapt control to available traction.", "Correct: lower demand and friction-aware control address the observed slip."],
        ["Increase steering command until dry-road tracking returns.", "More aggressive steering can worsen slip on ice."],
        ["Keep dry-road commands because the planned path is unchanged.", "The same path does not imply the same feasible dynamics."],
        ["Disable wheel-slip sensing to stabilize the estimate.", "Removing direct evidence cannot restore traction."],
      ], ["The path and command are constant while friction-related slip changes.", "Safe control must respect the lower tire-road force available."], "A feasible trajectory depends on current vehicle and road dynamics.", "1.5", 14),
      diagnosis: probe("diagnosis", "advanced", "Why is localization alone unlikely to explain the error increase?", ["ch1-control-reliability", "ch1-system-pipeline"], 2, [
        ["Localization cannot affect path tracking under any condition.", "Pose errors can affect tracking, so this absolute is false."],
        ["The vehicle speed is identical in both runs.", "Equal speed does not separate pose and traction causes."],
        ["High wheel slip appears with the icy error and directly indicates lost traction.", "Correct: the condition-specific physical evidence supports a control-dynamics cause."],
        ["The steering command contains the same number of digits.", "Formatting provides no diagnostic evidence."],
      ], ["The principal new observation is high wheel slip on ice.", "That mechanism can create lateral error despite an unchanged reference."], "Prefer the diagnosis that explains the correlated physical evidence.", "1.5", 14),
      comparison: probe("comparison", "foundational", "Which plan is more robust before entering the icy curve?", ["ch1-control-reliability"], 3, [
        ["One that requires maximum tire force throughout the curve.", "A maximum-demand plan leaves no margin for reduced friction."],
        ["One that assumes dry-road response because the map is unchanged.", "Maps do not guarantee surface friction."],
        ["One that corrects error only after large slip begins.", "Reactive correction arrives after stability margin is consumed."],
        ["One that lowers speed and preserves tire-force margin.", "Correct: it reduces demand before the low-friction maneuver."],
      ], ["Ice lowers available tire force.", "A slower, lower-demand trajectory is feasible across a wider friction range."], "Robust planning and control preserve margin for uncertain dynamics.", "1.5", 14),
      causal: probe("causal", "intermediate", "If speed is reduced before the same-radius curve, what effect is expected?", ["ch1-control-reliability"], 1, [
        ["The road friction coefficient automatically rises.", "Speed does not change the material coefficient itself."],
        ["Required lateral force falls, reducing the tendency to slip.", "Correct: lateral acceleration demand decreases strongly with speed."],
        ["The map coordinate frame rotates with the vehicle.", "Speed change does not redefine the map."],
        ["The controller no longer needs any feedback.", "Disturbances and modeling errors still require feedback."],
      ], ["For a fixed curve radius, lateral acceleration grows with speed squared.", "Reducing speed lowers tire-force demand."], "Motion adaptation can restore physical feasibility without changing the route.", "1.5", 14),
      transfer: probe("transfer", "intermediate", "A legged robot carries the same load from carpet onto a wet tile floor. Which AV principle transfers?", ["ch1-control-reliability"], 0, [
        ["Adapt gait and speed to the new traction limit rather than preserve the old command blindly.", "Correct: the environment changed the feasible control envelope."],
        ["Increase every joint command until the old motion appears.", "Aggressive actuation can increase slipping."],
        ["Assume the planned route guarantees stable contact.", "Path geometry does not determine surface friction."],
        ["Turn off slip feedback because it changed after the transition.", "The change is valuable evidence about the new surface."],
      ], ["Both vehicles face reduced contact friction under an unchanged mission.", "Control demand must adapt to the available force."], "Physical constraints follow the environment across robot types.", "1.5", 14),
    },
  ),
  assessmentCase(
    "opaque-end-to-end-failure",
    { kind: "log", caption: "Unified driving model evaluation", lines: ["clear-day route completion: 98%", "night construction route completion: 61%", "output confidence during failures: 0.94", "intermediate object and lane states: unavailable", "training set: few night construction scenes"] },
    {
      application: probe("application", "advanced", "Which next step best manages the demonstrated deployment risk?", ["ch1-system-pipeline", "ch1-perception-robustness"], 1, [
        ["Deploy because average clear-day completion is high.", "The target condition has a large, high-confidence failure rate."],
        ["Restrict the domain, add independent safety monitoring, and collect targeted evidence before expansion.", "Correct: containment and targeted validation address both exposure and the data gap."],
        ["Raise reported confidence above 0.99 without changing behavior.", "Calibration labels cannot repair unsafe predictions."],
        ["Delete construction scenes so evaluation matches training.", "Removing hard evidence hides rather than resolves the gap."],
      ], ["Failures concentrate in an underrepresented condition and remain confidently wrong.", "The absence of intermediate states also makes diagnosis harder."], "Unified models need domain controls, independent checks, and targeted validation.", "1.2", 5),
      diagnosis: probe("diagnosis", "intermediate", "Which two observations together most strongly indicate a generalization and calibration problem?", ["ch1-perception-robustness"], 3, [
        ["The model is unified and route completion is a percentage.", "Architecture and metric format alone do not show the problem."],
        ["Clear-day completion is 98% and intermediate states are unavailable.", "This shows nominal success and opacity, not calibration by itself."],
        ["The training set is finite and routes contain construction.", "All practical training sets are finite; the failure evidence is more specific."],
        ["Night-construction completion is low while failure confidence remains high.", "Correct: performance shifts by condition and confidence does not reflect error."],
      ], ["The domain-specific completion drop reveals poor transfer.", "High confidence during those failures reveals miscalibration."], "Robustness evaluation must pair outcome with condition and confidence.", "1.2", 5),
      comparison: probe("comparison", "intermediate", "What advantage would a modular diagnostic path provide in this investigation?", ["ch1-system-pipeline"], 2, [
        ["It guarantees higher accuracy in every condition.", "Modularity does not guarantee performance."],
        ["It eliminates the need for night data.", "Every architecture still needs representative validation."],
        ["It exposes intermediate perception, prediction, and planning outputs for fault localization.", "Correct: observable interfaces help identify where evidence first becomes wrong."],
        ["It converts the vehicle into unrestricted full automation.", "Architecture style does not define the automation level."],
      ], ["The current model supplies only final outputs.", "Intermediate states provide testable hypotheses about the failure chain."], "Interpretability is an engineering aid, not a guarantee of correctness.", "1.2", 5),
      causal: probe("causal", "foundational", "If representative night-construction examples are added and confidence calibration improves, what conclusion is justified?", ["ch1-perception-robustness"], 0, [
        ["The identified data and calibration gaps may shrink, but the condition still requires retesting.", "Correct: the changes target plausible causes without proving success before evaluation."],
        ["All future road conditions become solved automatically.", "One targeted dataset cannot establish universal generalization."],
        ["Independent monitoring becomes harmful by definition.", "A validated monitor can still provide containment."],
        ["Intermediate states become unnecessary for every safety case.", "Better data does not erase the value of diagnostic evidence."],
      ], ["The intervention matches the observed underrepresentation and overconfidence.", "Its actual effect remains an empirical question."], "A plausible fix is a hypothesis until the relevant evaluation passes.", "1.2", 5),
      transfer: probe("transfer", "advanced", "A medical model is accurate on common scans but confidently wrong on images from a new device. Which response transfers best?", ["ch1-perception-robustness"], 3, [
        ["Use confidence as proof because it comes from the model.", "The evidence shows confidence can remain high when wrong."],
        ["Mix the devices without tracking source condition.", "That hides the domain-specific failure."],
        ["Remove the new-device evaluation to preserve average accuracy.", "Suppressing evidence increases deployment risk."],
        ["Restrict use, validate targeted data and calibration, and retain independent review.", "Correct: it contains the shift while testing a targeted remedy."],
      ], ["Both systems face an underrepresented domain with confident errors.", "Restricted use and independent checking limit consequences during improvement."], "Generalization and calibration reasoning transfers to other high-stakes AI.", "1.2", 5),
    },
  ),
  assessmentCase(
    "crosswalk-ethical-policy",
    { kind: "scenario", text: "At the legal speed, a pedestrian suddenly enters a crosswalk. Hard braking is likely to avoid impact but may injure an unbelted passenger; swerving would enter a crowded sidewalk. The vehicle has milliseconds to act." },
    {
      application: probe("application", "advanced", "Which design policy is most defensible before such events occur?", ["ch1-ethics-governance", "ch1-control-reliability"], 2, [
        ["Let each vehicle invent a new moral rule during the event.", "Unreviewed real-time policy would be inconsistent and unauditable."],
        ["Always protect the purchaser regardless of road rules or bystander exposure.", "A purchaser-only rule ignores duties to other road users."],
        ["Use a transparent, regulator-reviewed policy that favors lawful braking and minimizes expected harm.", "Correct: it combines predictable control, public accountability, and harm reduction."],
        ["Choose whichever action produces the best marketing result afterward.", "Marketing is not an ethical or safety criterion."],
      ], ["Braking stays in lane and addresses the immediate hazard.", "The governing rule should be specified, reviewed, and testable before deployment."], "Ethical behavior requires both a defensible action rule and accountable governance.", "1.6", 14),
      diagnosis: probe("diagnosis", "intermediate", "What makes 'protect the passenger at any cost' an incomplete policy?", ["ch1-ethics-governance"], 0, [
        ["It ignores harms and rights of pedestrians and other road users.", "Correct: a public-road policy must account for all exposed people."],
        ["Passengers never face injury in emergency braking.", "The scenario explicitly states a passenger risk."],
        ["Every ethical framework requires swerving.", "Ethical frameworks can disagree; none makes that universal claim here."],
        ["Vehicle control cannot execute a policy.", "Control is how a selected safe action is physically carried out."],
      ], ["The proposal gives one stakeholder absolute priority.", "Its consequences are imposed on people who did not choose the vehicle."], "Ethical analysis must identify all affected stakeholders and constraints.", "1.6", 14),
      comparison: probe("comparison", "intermediate", "Which evaluation better supports public accountability?", ["ch1-ethics-governance"], 1, [
        ["Keep the policy secret and report only aggregate miles.", "Secrecy prevents scrutiny of the decision rule."],
        ["Publish the policy, assumptions, scenario tests, and known limitations for independent review.", "Correct: transparent evidence allows stakeholders to examine consistency and tradeoffs."],
        ["Ask one engineer to approve every moral decision alone.", "One private judgment lacks representative oversight."],
        ["Evaluate only passenger comfort in normal driving.", "Normal comfort does not test emergency stakeholder tradeoffs."],
      ], ["Accountability requires a decision rule and evidence others can examine.", "Independent scenario review can expose inconsistent or discriminatory effects."], "Transparency makes ethical commitments testable.", "1.6", 14),
      causal: probe("causal", "advanced", "If passengers can disable emergency braking whenever they prefer, what governance problem follows?", ["ch1-ethics-governance"], 3, [
        ["The vehicle necessarily becomes more stable on every road.", "Disabling braking can increase collision risk."],
        ["Pedestrians gain more control over the vehicle.", "The override is assigned to passengers."],
        ["Regulators no longer need a safety standard.", "Variable user behavior increases the need for clear limits."],
        ["Private preference can transfer collision risk to nonconsenting road users.", "Correct: the override externalizes harm beyond the passenger."],
      ], ["Emergency braking protects people outside the vehicle as well as occupants.", "A unilateral override changes risk for those without a voice in the choice."], "User control must be bounded when its consequences are imposed on others.", "1.6", 15),
      transfer: probe("transfer", "intermediate", "A delivery drone must choose between dropping a package in an empty zone or risking flight over a crowd. Which principle transfers?", ["ch1-ethics-governance"], 0, [
        ["Use a predeclared, reviewable rule that minimizes harm to nonconsenting people.", "Correct: the policy prioritizes public safety and can be audited."],
        ["Protect cargo value regardless of people below.", "Property value does not justify imposing severe human risk."],
        ["Let the drone improvise a hidden rule on each flight.", "A hidden changing policy is neither consistent nor accountable."],
        ["Ask the package recipient to choose after the emergency begins.", "The time and stakeholder problem make that impractical and biased."],
      ], ["The drone action affects bystanders who did not accept the risk.", "A transparent harm-minimizing fallback is the analogous governance response."], "Responsible automation principles transfer across public-space robots.", "1.6", 14),
    },
  ),
  assessmentCase(
    "accountability-after-failure",
    { kind: "log", caption: "Collision evidence", lines: ["fleet update installed 02:00", "camera health warning suppressed by configuration", "remote operator received no alert", "vehicle continued automated operation", "owner followed all operating instructions"] },
    {
      application: probe("application", "advanced", "Which investigation plan best supports fair accountability?", ["ch1-ethics-governance", "ch1-privacy-security"], 3, [
        ["Assign blame to the owner because the vehicle was privately owned.", "The log says the owner followed instructions and shows system-side evidence."],
        ["Delete configuration history to protect trade secrets.", "That destroys evidence needed to understand the failure."],
        ["Treat the collision as random because several actors are involved.", "Multiple actors require causal analysis, not abandonment of it."],
        ["Preserve logs and examine update, warning policy, monitoring duties, and operating instructions.", "Correct: it traces decisions and responsibilities across the deployment chain."],
      ], ["The evidence points to update, configuration, and monitoring interactions.", "Fair accountability depends on causal contribution and assigned duties."], "Investigate the sociotechnical chain before assigning liability.", "1.4", 11),
      diagnosis: probe("diagnosis", "intermediate", "Which control failure made the camera warning more consequential?", ["ch1-ethics-governance", "ch1-control-reliability"], 1, [
        ["The warning used a timestamp.", "A timestamp supports rather than defeats investigation."],
        ["The system continued automation without alerting or entering a safe fallback.", "Correct: the health signal did not trigger containment."],
        ["The owner followed the instructions.", "Compliant use is not a system control failure."],
        ["The event produced more than one log line.", "Log quantity does not create the hazard."],
      ], ["A camera health problem was known but suppressed.", "Neither the operator nor an automated fallback responded."], "Monitoring has safety value only when it leads to an effective response.", "1.5", 14),
      comparison: probe("comparison", "foundational", "Which evidence source is more useful than a simple statement that 'the AI failed'?", ["ch1-ethics-governance"], 2, [
        ["The vehicle's exterior color.", "Color does not identify a causal decision."],
        ["The owner's opinion of automation in general.", "A general attitude does not reconstruct the event."],
        ["Versioned update, configuration, alert, and fallback records.", "Correct: these records show what changed and how the system responded."],
        ["The number of advertisements for the feature.", "Advertising volume is not operational evidence."],
      ], ["The failure may span software, policy, and operations.", "Versioned records can link each stage to the event."], "Accountability improves when system decisions are traceable.", "1.4", 11),
      causal: probe("causal", "intermediate", "If the health warning had triggered an immediate safe stop, what causal claim is strongest?", ["ch1-control-reliability", "ch1-ethics-governance"], 0, [
        ["The warning-to-fallback path could have interrupted the hazardous chain.", "Correct: it acts between detected degradation and continued operation."],
        ["The camera would never degrade again.", "Fallback limits consequence; it does not repair the sensor permanently."],
        ["The update could not contain any defect.", "A safe stop does not prove the update was sound."],
        ["All liability would transfer automatically to the passenger.", "A technical containment does not assign legal responsibility."],
      ], ["The collision followed continued operation after a suppressed warning.", "A safe stop would remove the vehicle from that hazardous state."], "A fail-safe can break a causal chain without eliminating the initiating fault.", "1.5", 14),
      transfer: probe("transfer", "advanced", "A factory robot injures a worker after a maintenance alert is muted by a software update. Which AV lesson transfers?", ["ch1-ethics-governance", "ch1-control-reliability"], 2, [
        ["Blame the nearest person without checking system records.", "Proximity does not establish causal responsibility."],
        ["Treat maintenance and software as unrelated because different teams own them.", "The alert path explicitly connects their decisions."],
        ["Trace version, configuration, alert handling, fallback, and assigned duties.", "Correct: the sociotechnical evidence identifies both mechanism and responsibility."],
        ["Remove all logs after the investigation begins.", "Evidence preservation is essential to accountability."],
      ], ["Both events involve a known health signal suppressed across organizational boundaries.", "The same traceability and duty analysis applies."], "Accountability methods transfer across automated safety-critical systems.", "1.4", 11),
    },
  ),
  assessmentCase(
    "deployment-safety-case",
    { kind: "table", caption: "Pilot readiness review", columns: ["Area", "Evidence"], rows: [["Perception", "clear weather only"], ["Planning", "scripted traffic tests"], ["Control", "dry-road stopping verified"], ["Cybersecurity", "not assessed"], ["Accessibility", "wheelchair boarding not tested"], ["Fallback", "remote operator median response 9 s"]] },
    {
      application: probe("application", "advanced", "What is the most defensible deployment decision?", ["ch1-deployment-evidence", "ch1-control-reliability", "ch1-equity-access"], 1, [
        ["Launch unrestricted service because each technical row has some evidence.", "The evidence is narrow and several safety and access areas are missing."],
        ["Keep the pilot constrained and close the weather, interaction, fallback, security, and access gaps first.", "Correct: scope should match demonstrated capability while critical gaps are tested."],
        ["Remove the readiness table so the gaps cannot delay launch.", "Hiding evidence does not change risk."],
        ["Replace all tests with a public-opinion survey.", "Trust matters, but it cannot establish technical safety."],
      ], ["Evidence covers only benign conditions and leaves important domains unassessed.", "A nine-second median fallback also says nothing about worst-case response."], "Deployment scope should be bounded by the complete safety and service case.", "1.4", 12),
      diagnosis: probe("diagnosis", "intermediate", "Which claim is least supported by the table?", ["ch1-deployment-evidence"], 3, [
        ["The vehicle has some dry-road stopping evidence.", "That is stated directly."],
        ["Wheelchair access needs further evaluation.", "Boarding has not been tested."],
        ["Planning has been exercised in scripted traffic.", "That is stated, though scope is limited."],
        ["The system is ready for unrestricted public operation.", "Correct: multiple conditions and safeguards lack evidence."],
      ], ["Unrestricted operation spans weather, agents, security, access, and fallback.", "The table contains gaps in every one of those dimensions."], "Readiness is limited by missing critical evidence, not the presence of any test result.", "1.4", 12),
      comparison: probe("comparison", "intermediate", "Which next test adds more decision-relevant evidence than repeating the clear, dry scripted route?", ["ch1-deployment-evidence", "ch1-perception-robustness"], 0, [
        ["A controlled rain test with interactive traffic, injected faults, and measured fallback tails.", "Correct: it expands several demonstrated gaps while remaining controlled."],
        ["The same route with a different vehicle paint color.", "Paint does not change the untested capabilities."],
        ["A longer clear route with no new interactions.", "More distance in the same narrow condition adds little coverage."],
        ["A promotional video without recorded metrics.", "Media cannot replace observable test evidence."],
      ], ["Current evidence is concentrated in clear, dry, scripted operation.", "The proposed test changes environment, interaction, failure, and timing dimensions."], "Choose tests that reduce the most important uncertainty in the deployment decision.", "1.4", 12),
      causal: probe("causal", "advanced", "If median remote response improves from 9 s to 4 s but the 99th percentile remains 28 s, what conclusion follows?", ["ch1-control-reliability", "ch1-deployment-evidence"], 2, [
        ["Every fallback event now completes within four seconds.", "A median describes only the middle observation."],
        ["Remote fallback is proven safe for all hazards.", "A 28-second tail can dominate time-critical cases."],
        ["Typical response improved, but worst-case safety concern remains.", "Correct: the central tendency changed while the long tail did not."],
        ["Response-time measurement is no longer needed.", "The tail demonstrates why continued measurement matters."],
      ], ["Half of responses may now be at or below four seconds.", "The 99th percentile still exposes rare but severe delay."], "Safety cases need tail behavior, not averages alone.", "1.5", 14),
      transfer: probe("transfer", "advanced", "A university wants to deploy autonomous snow-removal robots after dry-campus tests only. Which review structure transfers best?", ["ch1-deployment-evidence", "ch1-societal-tradeoffs"], 3, [
        ["Approve campus-wide use because the robot moved successfully once.", "One benign test does not cover snow, people, or fallback."],
        ["Test only battery runtime and infer pedestrian safety.", "Energy evidence cannot substitute for interaction evidence."],
        ["Delay all learning until unrestricted deployment begins.", "Controlled testing should precede exposure of the public."],
        ["Define a limited domain and test snow sensing, interaction, stopping, security, access, and fallback before expansion.", "Correct: scope and evidence advance together across technical and societal dimensions."],
      ], ["The deployment condition differs from the dry test condition.", "Public operation also adds interaction and governance requirements."], "A complete safety case transfers across autonomous public services.", "1.4", 12),
    },
  ),
];

export const chapter1Assessment: ChapterAssessment = {
  chapterId: 1,
  objectives,
  cases,
};
