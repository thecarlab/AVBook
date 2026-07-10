import type { ChapterAssessment } from "../types";
type C = ChapterAssessment["cases"][number];
type P = C["probes"]["application"];
type S = keyof C["probes"];
const ids = ["a", "b", "c", "d"] as const;
function q(
  skill: S,
  prompt: string,
  objectives: [string, ...string[]],
  correct: 0 | 1 | 2 | 3,
  choices: [string, string, string, string],
  feedback: [string, string, string, string],
  reasoning: [string, ...string[]],
  takeaway: string,
  section: string,
  page: number,
  difficulty: P["difficulty"] = "intermediate",
): P {
  return {
    skill,
    difficulty,
    prompt,
    objectiveIds: objectives,
    choices: choices.map((text, i) => ({
      id: ids[i],
      text,
      feedback: feedback[i],
    })) as P["choices"],
    correctChoiceId: ids[correct],
    reasoning,
    takeaway,
    references: [{ section, page }],
  };
}
function c(id: string, stimulus: C["stimulus"], probes: C["probes"]): C {
  return { id, chapterId: 12, stimulus, probes };
}
const objectives: ChapterAssessment["objectives"] = [
  {
    id: "ch12-repeatability",
    chapterId: 12,
    behavior:
      "Use deterministic replay, versioning, and regression evidence to attribute behavior changes.",
    priority: "core",
    references: [{ section: "12.1", page: 177 }],
  },
  {
    id: "ch12-digital-twin",
    chapterId: 12,
    behavior:
      "Evaluate synchronized virtual replicas against physical data and model drift.",
    priority: "core",
    references: [{ section: "12.1", page: 179 }],
  },
  {
    id: "ch12-test-layers",
    chapterId: 12,
    behavior:
      "Choose MIL, SIL, and HIL by the implementation, timing, and hardware boundary under test.",
    priority: "core",
    references: [{ section: "12.2", page: 180 }],
  },
  {
    id: "ch12-hil",
    chapterId: 12,
    behavior:
      "Design real-time HIL timing, electrical-interface, and fault-injection tests.",
    priority: "core",
    references: [{ section: "12.2", page: 184 }],
  },
  {
    id: "ch12-scenarios",
    chapterId: 12,
    behavior:
      "Specify parameterized scenarios and measure meaningful behavioral coverage.",
    priority: "core",
    references: [{ section: "12.3", page: 187 }],
  },
  {
    id: "ch12-adversarial",
    chapterId: 12,
    behavior:
      "Generate plausible stress cases through constrained search and falsification.",
    priority: "core",
    references: [{ section: "12.3", page: 188 }],
  },
  {
    id: "ch12-monte-carlo",
    chapterId: 12,
    behavior:
      "Estimate uncertain outcomes with randomized trials, intervals, and dependence-aware sampling.",
    priority: "core",
    references: [{ section: "12.3", page: 190 }],
  },
  {
    id: "ch12-importance",
    chapterId: 12,
    behavior:
      "Use biased rare-event sampling with likelihood-ratio correction and variance checks.",
    priority: "core",
    references: [{ section: "12.3", page: 190 }],
  },
  {
    id: "ch12-reality-gap",
    chapterId: 12,
    behavior:
      "Detect simulator-to-road mismatch and bound claims with physical validation.",
    priority: "core",
    references: [{ section: "12.1-12.3", page: 179 }],
  },
  {
    id: "ch12-safety-claims",
    chapterId: 12,
    behavior:
      "Prioritize suites and state safety claims using coverage, tail risk, traceability, and evidence limits.",
    priority: "core",
    references: [{ section: "12.3", page: 191 }],
  },
];
const cases: C[] = [
  c(
    "repeatable-merge-regression",
    {
      kind: "log",
      caption: "Merge replay before and after commit",
      lines: [
        "scenario seed 412; assets v7",
        "old: min gap 2.3 s",
        "new: min gap 0.7 s",
        "initial states and weather hashes match",
        "new planner latency +38 ms",
      ],
    },
    {
      application: q(
        "application",
        "What is the best first action?",
        ["ch12-repeatability"],
        0,
        [
          "Bisect the change with the same replay",
          "Run a different merge whose traffic and weather also change before comparing the two builds",
          "Average old and new gaps and call the merged value a stable baseline",
          "Replace the logged seed after each run so the failure explores broader traffic",
        ],
        [
          "Correct; matched replay supports attribution.",
          "Changed conditions weaken diagnosis.",
          "Averages hide regression.",
          "Changing seeds loses reproduction.",
        ],
        [
          "The environment is held fixed.",
          "Latency is a plausible changed mechanism.",
        ],
        "Regression tests should isolate software change from scenario variation.",
        "12.1",
        178,
        "advanced",
      ),
      diagnosis: q(
        "diagnosis",
        "Which evidence makes this a regression?",
        ["ch12-repeatability"],
        1,
        [
          "Both builds finish the route, while no safety threshold or matched initial state is recorded",
          "The same versioned scenario loses safety margin after the commit",
          "The new build has a later calendar timestamp and therefore contains newer algorithms",
          "One random road run also has a small gap under a different traffic realization",
        ],
        [
          "Completion can hide risk.",
          "Correct; matched behavior worsens.",
          "Newer is not safer.",
          "That run is not attributable.",
        ],
        [
          "Inputs match by hash.",
          "The output crosses from comfortable to hazardous.",
        ],
        "A regression is a reproducible adverse change against a defined baseline.",
        "12.1",
        178,
      ),
      comparison: q(
        "comparison",
        "Which rerun gives stronger causal evidence?",
        ["ch12-repeatability"],
        2,
        [
          "A new map with heavier traffic and the new build, followed by a qualitative engineer impression",
          "The old build on a sunny route and the new build in fog with no seed control",
          "Both builds on seed 412 with identical assets",
          "Two new-build runs whose initial vehicle positions differ by several meters",
        ],
        [
          "Many factors differ.",
          "Weather is confounded.",
          "Correct; software is the main changed factor.",
          "This tests variability, not the commit.",
        ],
        ["Matched conditions support a controlled comparison."],
        "Repeatability is valuable because it makes changes interpretable.",
        "12.1",
        177,
      ),
      causal: q(
        "causal",
        "How can added planner latency reduce the merge gap?",
        ["ch12-repeatability"],
        3,
        [
          "It changes the lead vehicle's recorded route before the simulator initializes actor state",
          "It makes the road physically shorter while preserving each timestamp in the event log",
          "It improves the freshness of each trajectory by delaying publication until more old frames accumulate",
          "The plan acts on an older traffic state",
        ],
        [
          "Latency does not rewrite initialization.",
          "Road geometry is fixed.",
          "Delay reduces freshness.",
          "Correct; actors move during delay.",
        ],
        [
          "The environment evolves during 38 ms.",
          "A formerly safe command may arrive late.",
        ],
        "Timing changes can become behavioral regressions.",
        "12.1",
        178,
      ),
      transfer: q(
        "transfer",
        "A LiDAR update improves recall but old fog replays now brake late. What transfers?",
        ["ch12-repeatability"],
        0,
        [
          "Keep the recall gain and reopen the matched fog regression",
          "Discard the prior fog suite because its expected output predates the new sensor model",
          "Compare aggregate recall with braking latency after converting both to an unweighted mean",
          "Change simulator fog and firmware together so the new system receives a more favorable input",
        ],
        [
          "Correct; both benefits and regressions matter.",
          "Old safety cases remain relevant.",
          "Mixed metrics hide thresholds.",
          "This confounds causes.",
        ],
        ["An upstream improvement can alter downstream timing."],
        "Rerun system-level regressions after component updates.",
        "12.1",
        178,
      ),
    },
  ),
  c(
    "nondeterministic-replay",
    {
      kind: "table",
      caption: "Five nominally identical runs",
      columns: ["Run", "seed logged", "min gap"],
      rows: [
        [1, "no", "2.1 s"],
        [2, "no", "0.8 s"],
        [3, "no", "1.7 s"],
        [4, "no", "0.9 s"],
        [5, "no", "2.0 s"],
      ],
    },
    {
      application: q(
        "application",
        "What should be fixed before comparing builds?",
        ["ch12-repeatability"],
        1,
        [
          "Select the safest run as the baseline because it best represents intended behavior under nominal traffic",
          "Log and control all random sources",
          "Increase traffic randomness while retaining no record of actor draws or scheduler order",
          "Use one run per build and attribute any gap difference to code rather than sampling",
        ],
        [
          "Cherry-picking biases evidence.",
          "Correct; reproduction needs controlled randomness.",
          "This worsens traceability.",
          "One draw cannot separate variance.",
        ],
        ["Outcomes vary widely under the same label."],
        "Record seeds, versions, and nondeterministic scheduling inputs.",
        "12.1",
        177,
      ),
      diagnosis: q(
        "diagnosis",
        "What is the main evidence problem?",
        ["ch12-repeatability"],
        2,
        [
          "The gap unit is seconds rather than meters, so safety comparison cannot use temporal separation",
          "Five trials exceed the storage capacity required for simulation-based regression testing",
          "The scenario is not reproducible from its logs",
          "Variation proves the planner has no deterministic code paths under any fixed random sequence",
        ],
        [
          "Time gap is useful.",
          "Storage is not shown.",
          "Correct; random state is missing.",
          "Uncontrolled trials do not prove that.",
        ],
        ["Seed is absent in every row."],
        "An unrepeatable failure is difficult to debug or certify.",
        "12.1",
        177,
      ),
      comparison: q(
        "comparison",
        "Which summary is more honest?",
        ["ch12-monte-carlo"],
        3,
        [
          "Minimum gap is 2.1 s because the highest observed value best captures nominal capability",
          "The system passes because three of five gaps exceed 1.5 s and the two low values can be ignored",
          "The mean gap proves no individual run entered a risky tail, even without reporting dispersion",
          "Report the distribution and low-gap frequency",
        ],
        [
          "This selects the best run.",
          "Low outcomes remain evidence.",
          "Means do not describe tails.",
          "Correct; variability is material.",
        ],
        ["Two trials fall below one second."],
        "Stochastic tests need distributions, not a preferred example.",
        "12.3",
        190,
      ),
      causal: q(
        "causal",
        "Why can scheduler nondeterminism change a closed-loop result?",
        ["ch12-repeatability"],
        0,
        [
          "Message order changes state and later actions",
          "A scheduler alters the physical map file each time a process receives CPU time",
          "Random execution converts every sensor packet into independent ground truth before planning",
          "Closed-loop feedback removes dependence on timing once the first action is issued",
        ],
        [
          "Correct; early differences propagate.",
          "The map need not change.",
          "Packets remain measurements.",
          "Feedback can amplify differences.",
        ],
        ["Actions affect later observations."],
        "Control simulations can diverge from small execution-order changes.",
        "12.1",
        178,
      ),
      transfer: q(
        "transfer",
        "A failure occurs once in 500 CI runs. What transfers?",
        ["ch12-repeatability", "ch12-safety-claims"],
        1,
        [
          "Delete it as noise because rare failures contribute little to average route success across the full suite",
          "Preserve artifacts and replay its random state",
          "Raise the pass threshold so the one failure falls below reporting precision in future dashboards",
          "Replace the scenario with a common easy case that gives a more stable CI completion rate",
        ],
        [
          "Rarity can increase importance.",
          "Correct; capture enables diagnosis.",
          "Reporting changes do not fix it.",
          "This loses the counterexample.",
        ],
        ["Rare failures need exact provenance."],
        "Archive seeds, traces, and versions for every counterexample.",
        "12.1",
        178,
      ),
    },
  ),
  c(
    "digital-twin-battery-drift",
    {
      kind: "log",
      caption: "Twin-to-fleet comparison",
      lines: [
        "twin predicts peak battery 46 C",
        "vehicle measures 58 C",
        "error grows with pack age",
        "energy prediction remains within 2%",
        "cooling controller uses twin forecast",
      ],
    },
    {
      application: q(
        "application",
        "What is the best response?",
        ["ch12-digital-twin"],
        2,
        [
          "Keep the thermal forecast because the same twin predicts energy accurately on this route and vehicle",
          "Lower the measured vehicle temperature in the log until it agrees with the virtual replica",
          "Recalibrate aging and thermal parameters",
          "Increase simulated traffic load so predicted energy error grows to resemble the thermal error",
        ],
        [
          "One accurate output does not validate another.",
          "Measurements should not be falsified.",
          "Correct; drift is structured.",
          "That does not repair thermal physics.",
        ],
        ["Error correlates with pack age."],
        "A digital twin needs continuous parameter and residual validation.",
        "12.1",
        179,
      ),
      diagnosis: q(
        "diagnosis",
        "What does the pattern suggest?",
        ["ch12-digital-twin"],
        3,
        [
          "The physical battery cools faster than the twin in older packs, despite the higher measured temperature",
          "Every twin component is invalid because one thermal output differs while energy remains close",
          "The vehicle sensor is faulty because a virtual model defines the reference temperature by design",
          "The twin omits age-dependent thermal behavior",
        ],
        [
          "Direction is wrong.",
          "Subsystem validity can differ.",
          "A model is not ground truth.",
          "Correct; residual grows with age.",
        ],
        ["Energy and thermal predictions separate."],
        "Residual structure can localize twin mismatch.",
        "12.1",
        179,
      ),
      comparison: q(
        "comparison",
        "Which evidence best validates the update?",
        ["ch12-digital-twin"],
        0,
        [
          "Held-out vehicles across pack ages",
          "The same vehicle and route used to fit thermal parameters, reported without a residual distribution",
          "A photorealistic battery rendering whose colors resemble a thermal image but lacks temperature data",
          "Lower training loss after adding parameters, with no physical measurements or forecast test",
        ],
        [
          "Correct; it tests generalization.",
          "Fit data can overstate accuracy.",
          "Appearance is not thermal fidelity.",
          "Loss is indirect.",
        ],
        ["The claimed correction is age-dependent."],
        "Validate a twin against held-out physical counterparts.",
        "12.1",
        179,
      ),
      causal: q(
        "causal",
        "Why can an outdated twin produce unsafe cooling control?",
        ["ch12-digital-twin"],
        1,
        [
          "The virtual pack physically supplies less coolant to the real vehicle through the simulation network",
          "Forecast underestimation delays cooling demand",
          "Temperature error removes the battery's real heat capacity from the vehicle hardware after deployment",
          "A twin prediction changes ambient weather before the physical sensor records it",
        ],
        [
          "The twin is informational.",
          "Correct; control trusts a low forecast.",
          "Hardware physics remain.",
          "The twin does not control weather.",
        ],
        ["Control consumes the forecast."],
        "Model bias propagates when virtual predictions drive physical decisions.",
        "12.1",
        179,
      ),
      transfer: q(
        "transfer",
        "A tire twin matches dry handling but misses wet slip. What transfers?",
        ["ch12-digital-twin", "ch12-reality-gap"],
        2,
        [
          "Use dry agreement as evidence for wet friction because the tire and vehicle identifiers are unchanged",
          "Tune the controller around the inaccurate wet twin while leaving its residual unreported",
          "Calibrate wet physics with vehicle data",
          "Remove wet routes from simulation while retaining wet-road deployment claims",
        ],
        [
          "Condition changes the physics.",
          "This hides model error.",
          "Correct; target data is needed.",
          "Claims exceed testing.",
        ],
        ["Twin fidelity is operating-condition specific."],
        "Validate virtual replicas across the conditions they support.",
        "12.1",
        179,
      ),
    },
  ),
  c(
    "mil-control-concept",
    {
      kind: "scenario",
      text: "A team is choosing a lane controller structure and wants to sweep gains across 50,000 idealized curves before production code or an ECU exists.",
    },
    {
      application: q(
        "application",
        "Which layer fits this question?",
        ["ch12-test-layers"],
        3,
        [
          "On-road testing with a prototype vehicle, production sensors, and public traffic before selecting the control structure",
          "HIL using a purchased ECU even though executable control software and interfaces have not been defined",
          "SIL of production binaries that do not yet exist, with thread timing as the primary output",
          "MIL for rapid design-space exploration",
        ],
        [
          "Premature and risky.",
          "Hardware adds little now.",
          "No binaries exist.",
          "Correct; abstract logic is the target.",
        ],
        ["The question is algorithmic and early-stage."],
        "Use MIL to explore models before implementation constraints dominate.",
        "12.2",
        180,
      ),
      diagnosis: q(
        "diagnosis",
        "What would MIL fail to establish?",
        ["ch12-test-layers"],
        0,
        [
          "Production ECU deadline behavior",
          "Whether one abstract gain produces less overshoot than another in modeled dynamics",
          "Sensitivity to modeled curve radius and vehicle speed over a large parameter sweep",
          "Functional correctness of the controller equation under the assumptions encoded in its plant model",
        ],
        [
          "Correct; real hardware timing is absent.",
          "MIL can compare that.",
          "MIL supports sweeps.",
          "MIL targets that question.",
        ],
        ["No physical ECU participates."],
        "Each simulation layer has a validation boundary.",
        "12.2",
        180,
      ),
      comparison: q(
        "comparison",
        "Why not start with HIL?",
        ["ch12-test-layers"],
        1,
        [
          "HIL cannot include a simulated road or vehicle plant when real hardware is connected through conditioned signals",
          "Hardware integration cost adds little evidence for an unsettled algorithm",
          "HIL runs more scenarios per dollar than an abstract model before interfaces and binaries exist",
          "A real ECU prevents engineers from measuring command timing or closed-loop actuator response",
        ],
        [
          "HIL uses simulated plants.",
          "Correct; test maturity should match design maturity.",
          "HIL is costlier.",
          "Those are HIL strengths.",
        ],
        ["The controller concept changes rapidly."],
        "Escalate fidelity when its evidence becomes relevant.",
        "12.2",
        184,
      ),
      causal: q(
        "causal",
        "How does MIL accelerate early development?",
        ["ch12-test-layers"],
        2,
        [
          "It certifies the eventual production binary and electrical interfaces from a block diagram without later integration tests",
          "It removes model assumptions by replacing each virtual component with physical hardware during the sweep",
          "Cheap controlled models support rapid parameter exploration",
          "It recreates public-road uncertainty at the same fidelity and cost as a full vehicle trial",
        ],
        [
          "Later evidence is needed.",
          "That describes HIL.",
          "Correct; abstraction improves speed.",
          "MIL remains modeled.",
        ],
        ["No hardware scheduling or I/O is required."],
        "Abstraction trades fidelity for efficient hypothesis testing.",
        "12.2",
        180,
      ),
      transfer: q(
        "transfer",
        "After code generation, a mismatch appears. What transfers?",
        ["ch12-test-layers"],
        3,
        [
          "Keep using the abstract model and classify implementation differences as irrelevant to the deployed controller",
          "Move directly to public-road trials while skipping executable-code replay and interface checks",
          "Change model and code together before reproducing which layer first diverges from the reference behavior",
          "Add SIL comparison between model and compiled code",
        ],
        [
          "Deployment uses code.",
          "SIL is the safer next layer.",
          "This loses attribution.",
          "Correct; it checks implementation fidelity.",
        ],
        ["The question has moved from concept to executable behavior."],
        "Advance from MIL to SIL when implementation becomes the risk.",
        "12.2",
        182,
      ),
    },
  ),
  c(
    "sil-threading-regression",
    {
      kind: "log",
      caption: "Production stack in virtual environment",
      lines: [
        "compiled production nodes",
        "camera 30 Hz",
        "planner deadline 50 ms",
        "new build: intermittent 130 ms",
        "CPU saturation and queue growth",
        "no physical ECU",
      ],
    },
    {
      application: q(
        "application",
        "Which test layer should own the first diagnosis?",
        ["ch12-test-layers"],
        0,
        [
          "SIL with profiling and deterministic replay",
          "MIL block diagrams that omit the production message queues and compiled scheduling behavior",
          "HIL fault injection into an ECU before locating the software overload in a hardware-free reproduction",
          "Public-road driving until processor backlog repeats under uncontrolled traffic",
        ],
        [
          "Correct; actual software exposes the bug.",
          "The mechanism is omitted.",
          "HIL can follow after software diagnosis.",
          "Unsafe and hard to repeat.",
        ],
        ["The fault exists in compiled nodes and queues."],
        "Use SIL for implementation and integration defects reproducible without hardware.",
        "12.2",
        182,
      ),
      diagnosis: q(
        "diagnosis",
        "What does this test prove?",
        ["ch12-test-layers"],
        1,
        [
          "The production ECU meets its electrical timing specification because the virtual host completed one run",
          "The software can miss deadlines under the tested workload",
          "The camera's physical photodiodes produce accurate low-light noise on the final vehicle",
          "The actuator bus accepts every voltage level emitted by the real interface board",
        ],
        [
          "No ECU is present.",
          "Correct; software timing fails here.",
          "Synthetic sensors do not prove that.",
          "Electrical I/O is untested.",
        ],
        ["Actual code is running, but hardware is virtual."],
        "State conclusions at the layer actually exercised.",
        "12.2",
        182,
      ),
      comparison: q(
        "comparison",
        "What would HIL add next?",
        ["ch12-hil"],
        2,
        [
          "A more abstract controller model that executes faster by removing production software from the test loop",
          "A larger set of synthetic city textures while preserving the same host CPU and virtual communication path",
          "Target ECU scheduling and physical I/O timing",
          "Proof that simulator camera statistics match every deployed environment",
        ],
        [
          "That reduces fidelity.",
          "This remains SIL-like.",
          "Correct; hardware timing enters.",
          "HIL still uses simulated environment.",
        ],
        ["The remaining question concerns target execution."],
        "HIL adds physical implementation effects, not universal environmental truth.",
        "12.2",
        184,
      ),
      causal: q(
        "causal",
        "Why can SIL expose a bug that MIL misses?",
        ["ch12-test-layers"],
        3,
        [
          "MIL uses the final production scheduler with additional instrumentation that prevents queue growth",
          "SIL removes compiled interfaces and replaces them with ideal mathematical signals before timing is measured",
          "MIL contains more implementation detail than the production binary and therefore masks software defects",
          "SIL executes real code, threads, and interfaces",
        ],
        [
          "MIL is abstract.",
          "SIL retains interfaces.",
          "Direction is reversed.",
          "Correct; implementation behavior is present.",
        ],
        ["The log's mechanism is queue and CPU load."],
        "Executable integration creates failure modes absent from functional models.",
        "12.2",
        182,
      ),
      transfer: q(
        "transfer",
        "A memory leak appears after six simulated hours. What transfers?",
        ["ch12-test-layers", "ch12-repeatability"],
        0,
        [
          "Reproduce it in accelerated SIL with heap traces",
          "Move directly to HIL and remove memory instrumentation so real-time behavior resembles deployment more closely",
          "Shorten every run to five hours and infer that the production stack has stable long-duration resource use",
          "Replace production binaries with an abstract MIL model that has no allocator or heap behavior",
        ],
        [
          "Correct; actual code and acceleration fit.",
          "HIL may add cost without diagnosis.",
          "This hides the leak.",
          "The mechanism disappears.",
        ],
        ["The defect is software-state accumulation."],
        "Choose the least costly layer that preserves the suspected mechanism.",
        "12.2",
        182,
      ),
    },
  ),
];
type M = [
  prompt: string,
  answer: string,
  wrong: [string, string, string],
  why: string,
];
const skills: S[] = [
  "application",
  "diagnosis",
  "comparison",
  "causal",
  "transfer",
];
function misconception(text: string, index: number, why: string): string {
  let reason: string;
  if (/remove|delete|ignore|hide|exclude|shorten|drop|discard/i.test(text))
    reason =
      "It suppresses the counterexample or safeguard instead of resolving the tested failure.";
  else if (/MIL|SIL|HIL|hardware|ECU|software|physical|road/i.test(text))
    reason =
      "It exercises a different abstraction boundary from the mechanism described in the scenario.";
  else if (
    /mean|average|count|hours|runs|mileage|rate|frequency|percent/i.test(text)
  )
    reason =
      "That summary does not measure the coverage, tail, or causal quantity the decision requires.";
  else if (/weight|proposal|sample|probability|divide|distribution/i.test(text))
    reason =
      "It mishandles the sampling distribution, so the resulting risk estimate would be biased.";
  else if (/assume|infer|claim|prove|accept|report/i.test(text))
    reason =
      "It makes a claim broader than the available layer, scenario, or outcome evidence.";
  else if (/duplicate|same|nominal|easy|fixed/i.test(text))
    reason =
      "It adds repetition without covering the missing variation or interaction.";
  else
    reason =
      "It changes the wrong condition and therefore does not test the stated mechanism.";
  const distinction = [
    "It also weakens attribution.",
    "It also leaves the critical boundary untested.",
    "It also hides the safety-relevant tail.",
    "It also breaks traceability to the observed result.",
  ][index];
  const scenarioReason =
    why.charAt(0).toLowerCase() + why.slice(1).replace(/\.$/, "");
  return `${reason} In this case, ${scenarioReason}. ${distinction}`;
}
function mc(
  id: string,
  stimulus: C["stimulus"],
  objective: string,
  section: string,
  page: number,
  start: 0 | 1 | 2 | 3,
  items: [M, M, M, M, M],
): C {
  const probes = {} as C["probes"];
  items.forEach((m, i) => {
    const [prompt, answer, wrong, why] = m,
      k = skills[i],
      ci = ((start + i) % 4) as 0 | 1 | 2 | 3,
      opts = [...wrong];
    opts.splice(ci, 0, answer);
    probes[k] = q(
      k,
      prompt,
      [objective],
      ci,
      opts as [string, string, string, string],
      opts.map((text, j) =>
        j === ci ? `Correct. ${why}` : misconception(text, j, why),
      ) as [string, string, string, string],
      [why],
      why,
      section,
      page,
      i === 0 || i === 4 ? "advanced" : "intermediate",
    );
  });
  return c(id, stimulus, probes);
}
cases.push(
  mc(
    "hil-deadline",
    {
      kind: "scenario",
      text: "A physical brake ECU meets a 30 ms deadline at 40% CPU load but responds in 47 ms at 95% load.",
    },
    "ch12-hil",
    "12.2",
    185,
    1,
    [
      [
        "What should the team do next?",
        "Trace the loaded HIL run",
        [
          "Accept the light-load pass as target evidence",
          "Replace the ECU with an ideal model before measuring timing",
          "Increase simulated stopping distance until 47 ms appears safe",
        ],
        "Target-load timing needs diagnosis.",
      ],
      [
        "What did HIL reveal?",
        "A target-hardware deadline miss",
        [
          "Universal wet-road stopping performance from one virtual scene",
          "A flaw in the abstract control equation under zero load",
          "Perfect camera realism from electrical brake timing",
        ],
        "The physical execution boundary failed.",
      ],
      [
        "Which metric matters most?",
        "Deadline-miss tail",
        [
          "Mean latency pooled with idle cycles and no percentile",
          "Rendered frame color averaged across the emergency stop",
          "Total simulator hours without command timestamps",
        ],
        "Rare late commands drive this requirement.",
      ],
      [
        "Why does load matter?",
        "Tasks contend for execution",
        [
          "CPU load changes road friction inside the simulator",
          "A physical ECU removes scheduling effects from control",
          "Higher utilization shortens the written requirement",
        ],
        "Contention delays the critical task.",
      ],
      [
        "A steering ECU jitters on HIL after passing SIL. What transfers?",
        "Inspect target scheduling and buses",
        [
          "Prefer virtual timing over physical measurements",
          "Retune road curvature until jitter is hidden",
          "Remove timestamps from the hardware trace",
        ],
        "The divergence begins at target hardware.",
      ],
    ],
  ),
  mc(
    "hil-fault-injection",
    {
      kind: "scenario",
      text: "A wheel-speed wire opens for 120 ms. The ECU holds the old value, fails to flag the fault, then reverses brake command on reconnection.",
    },
    "ch12-hil",
    "12.2",
    186,
    2,
    [
      [
        "What mitigation should be tested?",
        "Freshness detection and fallback",
        [
          "Longer hold-last-value with the same confidence",
          "A nominal run with no injected wire fault",
          "A wider road that makes the brake reversal less visible",
        ],
        "Stale state needs bounded handling.",
      ],
      [
        "What causes the reversal?",
        "Fresh speed replaces a stale estimate",
        [
          "The wire mechanically repairs brake hardware",
          "The rig accelerates while measured speed falls",
          "A fault flag triggers before stale data is used",
        ],
        "Reconnection collapses accumulated state error.",
      ],
      [
        "What does physical line opening add over SIL null data?",
        "Electrical interface behavior",
        [
          "Fleet frequency for every wiring fault",
          "Road-surface fidelity from the ECU connector",
          "Proof that all sensors fail with this signature",
        ],
        "The real input circuit is exercised.",
      ],
      [
        "Why is hold-last risky?",
        "The vehicle state keeps changing",
        [
          "Held data becomes fresher during an outage",
          "Reconnection preserves the same estimation error",
          "The actuator receives new physical measurements during the hold",
        ],
        "Staleness grows with time.",
      ],
      [
        "CAN corruption flips steering sign. What transfers?",
        "Inject protocol corruption and verify rejection",
        [
          "Use camera blur as an equivalent electrical test",
          "Infer integrity handling from clean messages",
          "Widen the simulated lane around the sign flip",
        ],
        "Test the actual fault boundary.",
      ],
    ],
  ),
  mc(
    "layer-boundaries",
    {
      kind: "scenario",
      text: "Open questions concern control-law stability, a production deadlock, ECU bus latency, and wet-tire fidelity.",
    },
    "ch12-test-layers",
    "12.2",
    184,
    3,
    [
      [
        "Which sequence is efficient?",
        "MIL, SIL, HIL, physical correlation",
        [
          "Public road first for each unfinished component",
          "HIL for algebra and MIL for target bus timing",
          "One photorealistic SIL run for all four claims",
        ],
        "Fidelity should follow the questioned mechanism.",
      ],
      [
        "Which claim is overbroad?",
        "HIL bus pass proves wet-tire physics",
        [
          "MIL compares controller designs under a plant model",
          "SIL can expose a production deadlock",
          "Physical comparison measures tire-model residuals",
        ],
        "Real ECU timing does not validate virtual tires.",
      ],
      [
        "Which transition targets implementation bugs?",
        "MIL to SIL",
        [
          "HIL back to an abstract block diagram",
          "On-road replay to one still image",
          "Digital twin to an unversioned spreadsheet",
        ],
        "Compiled production code enters in SIL.",
      ],
      [
        "Why does fidelity cost rise?",
        "Integration and synchronization grow",
        [
          "More hardware removes setup and capacity limits",
          "Higher fidelity reduces dependencies at each interface",
          "Signal conditioning becomes unnecessary on physical I/O",
        ],
        "Real components add maintenance and timing constraints.",
      ],
      [
        "Real lens flare is absent in simulation. What changes?",
        "Add measured sensor correlation",
        [
          "Raise a controller gain in MIL",
          "Use the same ideal image stream on HIL",
          "Drop flare cases from the deployment claim",
        ],
        "The missing phenomenon is sensor realism.",
      ],
    ],
  ),
  mc(
    "crosswalk-template",
    {
      kind: "scenario",
      text: "A crosswalk template varies pedestrian timing, speed, occluder width, ego speed, lighting, and friction, but the suite runs one combination.",
    },
    "ch12-scenarios",
    "12.3",
    187,
    0,
    [
      [
        "What should come next?",
        "Sample valid combinations and track coverage",
        [
          "Duplicate the same run under new identifiers",
          "Vary one easy factor and freeze the rest",
          "Claim coverage because each field exists in the schema",
        ],
        "The multidimensional family needs execution evidence.",
      ],
      [
        "Why is one pass weak?",
        "It leaves interactions unexplored",
        [
          "Deterministic tests cannot catch regressions",
          "Crosswalks contain no continuous variables",
          "Templates prevent expected safety properties",
        ],
        "Many combinations change stopping feasibility.",
      ],
      [
        "Which report is useful?",
        "Bins, interactions, and failures",
        [
          "Total run count with no parameter ranges",
          "A screenshot collage selected after failures are removed",
          "Simulator hours pooled across unrelated scenario families",
        ],
        "Coverage should describe tested space.",
      ],
      [
        "Why test interactions?",
        "Moderate factors can combine into failure",
        [
          "Each factor changes the same scalar input",
          "Separate tests reconstruct nonlinear closed-loop outcomes",
          "Friction affects rendering but not stopping",
        ],
        "Joint margins can vanish.",
      ],
      [
        "A merge template adds delay. What transfers?",
        "Extend factors and coverage goals",
        [
          "Delete prior merge evidence",
          "Test delay with the easiest traffic state",
          "Document delay while executing zero latency",
        ],
        "Delay interacts with speed and gap.",
      ],
    ],
  ),
  mc(
    "construction-coverage-hole",
    {
      kind: "scenario",
      text: "Thousands of highway and urban runs include night and rain. Eighty construction runs include neither night nor rain.",
    },
    "ch12-safety-claims",
    "12.3",
    188,
    1,
    [
      [
        "What should be prioritized?",
        "Night and rain construction cases",
        [
          "More nominal highway duplicates",
          "Removal of temporary-rule scenarios",
          "Equal run totals without risk weighting",
        ],
        "The safety-relevant intersection is empty.",
      ],
      [
        "What can aggregate night coverage hide?",
        "The construction-night gap",
        [
          "Night tests use less storage",
          "Darkness makes all scenario families equivalent",
          "Temporary rules appear in each highway run",
        ],
        "Marginal totals hide intersections.",
      ],
      [
        "Which addition is more informative?",
        "A construction-night matrix",
        [
          "Another thousand nominal highway runs",
          "Twenty duplicates of one urban replay",
          "A larger dashboard font for the construction row",
        ],
        "It expands hazard coverage.",
      ],
      [
        "Why can many runs give low confidence?",
        "They may cluster in easy regions",
        [
          "Extra runs invalidate prior failures",
          "Large suites lose traceability by definition",
          "Common scenarios estimate omitted construction risk",
        ],
        "Volume is not breadth.",
      ],
      [
        "A new region adds snow and reversible lanes. What transfers?",
        "Add region-specific interactions",
        [
          "Reuse rain and fixed-lane evidence",
          "Increase nominal urban mileage",
          "Infer coverage from portable scenario files",
        ],
        "The operating domain expanded.",
      ],
    ],
  ),
  mc(
    "adversarial-cut-in",
    {
      kind: "scenario",
      text: "A search tool finds a cut-in that causes collision by teleporting a vehicle laterally 8 m in one frame.",
    },
    "ch12-adversarial",
    "12.3",
    188,
    2,
    [
      [
        "How should this result be handled?",
        "Reject or constrain the implausible motion",
        [
          "Count it as road-frequency evidence without a realism check",
          "Remove kinematic constraints from later searches",
          "Claim the policy fails every ordinary cut-in",
        ],
        "Stress cases need physical plausibility.",
      ],
      [
        "What is the main diagnosis?",
        "The generator exploited simulator freedom",
        [
          "The AV proved safe because the actor teleported",
          "The collision estimates natural cut-in probability",
          "The controller changed the scenario language grammar",
        ],
        "Search found an artifact, not a supported road behavior.",
      ],
      [
        "Which counterexample is stronger?",
        "A feasible high-acceleration cut-in",
        [
          "A vehicle moving through a solid barrier",
          "A negative actor mass chosen by optimization",
          "A missing timestamp interpreted as infinite speed",
        ],
        "It challenges policy within credible dynamics.",
      ],
      [
        "Why constrain adversarial generation?",
        "Validity makes failures actionable",
        [
          "Constraints prevent any hard case from being generated",
          "Plausibility converts biased tests into natural-frequency samples",
          "Physical limits remove need for replay",
        ],
        "Engineers need realizable mechanisms.",
      ],
      [
        "A search exploits camera clipping absent on the real sensor. What transfers?",
        "Calibrate the sensor model before claiming failure",
        [
          "Count the artifact as fleet risk",
          "Disable realism checks for visual attacks",
          "Raise image resolution until the same clipping appears",
        ],
        "Counterexamples inherit simulator assumptions.",
      ],
    ],
  ),
  mc(
    "probabilistic-scenario-spec",
    {
      kind: "scenario",
      text: "A probabilistic scene specification says pedestrians start near the curb, remain outside parked cars, and cross with a learned timing distribution.",
    },
    "ch12-adversarial",
    "12.3",
    189,
    3,
    [
      [
        "What is the main testing value?",
        "Structured random plausible scenes",
        [
          "One fixed script whose actors and times never vary",
          "Unconstrained random coordinates that place pedestrians inside vehicles",
          "Natural road frequencies inferred from syntax without data",
        ],
        "Constraints and distributions support repeatable diversity.",
      ],
      [
        "What should be validated first?",
        "The specified distribution against data",
        [
          "The file extension used by the scenario compiler",
          "The number of comments in the probabilistic program",
          "The prettiest rendered sample chosen by an engineer",
        ],
        "Sampling assumptions shape results.",
      ],
      [
        "How does this differ from one script?",
        "It defines a scenario family",
        [
          "It removes expected properties from testing",
          "It makes random seeds unnecessary",
          "It proves exhaustive coverage of continuous space",
        ],
        "Structured randomness yields many concrete cases.",
      ],
      [
        "Why should the test preserve its random seeds?",
        "They reproduce generated counterexamples",
        [
          "Seeds make each draw naturalistic",
          "Seeds eliminate model bias",
          "Seeds provide road-frequency weights",
        ],
        "A sampled failure still needs replay.",
      ],
      [
        "A new occluder constraint is added. What transfers?",
        "Rerun coverage and failure search",
        [
          "Keep old coverage claims unchanged",
          "Delete earlier scenarios as invalid",
          "Infer behavior from the constraint text alone",
        ],
        "The generated distribution changed.",
      ],
    ],
  ),
  mc(
    "monte-carlo-crossing",
    {
      kind: "table",
      caption: "Randomized pedestrian timing",
      columns: ["runs", "failures"],
      rows: [
        [100, 1],
        [1000, 9],
        [10000, 87],
      ],
    },
    "ch12-monte-carlo",
    "12.3",
    190,
    0,
    [
      [
        "What should be reported?",
        "Rate with a confidence interval",
        [
          "The 87 failures without denominator",
          "The best zero-failure batch selected from subsets",
          "A claim of exact population risk from 10,000 draws",
        ],
        "Sampling uncertainty remains.",
      ],
      [
        "Why does the estimate stabilize?",
        "More independent draws reduce sampling error",
        [
          "The true road rate changes toward the simulation result",
          "Later failures overwrite earlier outcomes",
          "A larger sample removes model bias",
        ],
        "Variance falls with effective sample size.",
      ],
      [
        "Which assumption needs checking?",
        "Draws follow the target distribution",
        [
          "Each run uses a different file name",
          "The simulator renders identical colors",
          "Failures occur at integer indices",
        ],
        "The estimate describes its sampling population.",
      ],
      [
        "Why is zero failures in 100 weak?",
        "Rare risk can be missed",
        [
          "Zero proves the event cannot occur",
          "A small sample has no defined denominator",
          "Monte Carlo requires a failure in each batch",
        ],
        "Absence in a small sample gives a wide bound.",
      ],
      [
        "Weather samples are correlated by one long episode. What transfers?",
        "Use dependence-aware intervals or episodes",
        [
          "Treat every frame as independent",
          "Duplicate frames to increase sample size",
          "Ignore weather grouping",
        ],
        "Correlation reduces effective sample size.",
      ],
    ],
  ),
  mc(
    "monte-carlo-seed-bias",
    {
      kind: "scenario",
      text: "Ten thousand simulations reuse 20 traffic seeds, and each seed produces 500 nearly identical actor trajectories.",
    },
    "ch12-monte-carlo",
    "12.3",
    190,
    1,
    [
      [
        "What should the team change?",
        "Increase independent scenario draws",
        [
          "Report 10,000 as independent sample size",
          "Duplicate each seed again",
          "Remove seed identifiers before analysis",
        ],
        "Nominal volume overstates information.",
      ],
      [
        "What is the statistical problem?",
        "Strong within-seed correlation",
        [
          "Twenty seeds exceed simulator capacity",
          "Trajectories cannot be randomized",
          "Failure rates lack units",
        ],
        "Replicates share latent conditions.",
      ],
      [
        "Which interval is more credible?",
        "Clustered by seed",
        [
          "Frame-level binomial interval",
          "No interval after many runs",
          "An interval based on rendered pixel count",
        ],
        "Clusters define independent units.",
      ],
      [
        "Why does duplication not improve precision much?",
        "It adds little new information",
        [
          "Duplicate outcomes change the target population",
          "Repeated runs erase failures",
          "Correlation increases natural road exposure",
        ],
        "Effective sample size stays near seed count.",
      ],
      [
        "A cloud rerun adds new seeds. What transfers?",
        "Compare effective sample size and distributions",
        [
          "Pool counts without checking source",
          "Treat cloud hardware as a new road domain",
          "Discard local evidence",
        ],
        "Independence and population still matter.",
      ],
    ],
  ),
  mc(
    "importance-sampling-weights",
    {
      kind: "table",
      caption: "Cut-in sampling",
      columns: ["region", "natural p", "test q", "failures/tests"],
      rows: [
        ["ordinary", 0.999, 0.5, "1/5000"],
        ["critical", 0.001, 0.5, "900/5000"],
      ],
    },
    "ch12-importance",
    "12.3",
    190,
    2,
    [
      [
        "How should natural risk be estimated?",
        "Weight outcomes by p/q",
        [
          "Use the raw 9.01% test failure rate",
          "Count critical failures as ordinary mileage",
          "Discard ordinary samples because critical cases are more informative",
        ],
        "Biased draws need likelihood correction.",
      ],
      [
        "Why is raw failure rate misleading?",
        "Critical cases are oversampled",
        [
          "The simulator cannot count failures",
          "Natural p and test q are identical",
          "Importance sampling removes randomness",
        ],
        "The test mix differs from road exposure.",
      ],
      [
        "What makes the method efficient?",
        "More samples fall near rare failures",
        [
          "Weights make each failure disappear",
          "It proves the rare-event model exact",
          "It converts simulated miles into physical miles",
        ],
        "Sampling budget targets informative regions.",
      ],
      [
        "Why retain ordinary samples?",
        "They estimate the rest of the distribution",
        [
          "Their weight is zero",
          "Critical samples represent each ordinary outcome",
          "Ordinary behavior has no safety contribution",
        ],
        "The full expectation includes both regions.",
      ],
      [
        "The proposal changes after learning. What transfers?",
        "Recompute weights from the actual proposal",
        [
          "Reuse old q values",
          "Report raw adaptive frequency",
          "Drop proposal logs",
        ],
        "Each draw's correction depends on how it was sampled.",
      ],
    ],
  ),
  mc(
    "importance-weight-bug",
    {
      kind: "scenario",
      text: "A rare-event campaign oversamples near collisions 200 times but reports the raw failure fraction as natural road risk.",
    },
    "ch12-importance",
    "12.3",
    190,
    3,
    [
      [
        "What is the correct response?",
        "Reanalyze with likelihood ratios",
        [
          "Publish raw frequency as miles-based risk",
          "Reduce reported failures by an arbitrary factor of 200",
          "Delete the sampling policy from the audit",
        ],
        "The estimator needs principled weighting.",
      ],
      [
        "What error was made?",
        "Proposal frequency was confused with target probability",
        [
          "The simulator ran too many rare cases",
          "Failures cannot be sampled intentionally",
          "Natural risk equals test difficulty",
        ],
        "Biased exposure changes raw frequency.",
      ],
      [
        "Which record is essential?",
        "Target and proposal density per draw",
        [
          "Screenshot resolution",
          "Scenario file name length",
          "Engineer viewing time",
        ],
        "Weights require p and q.",
      ],
      [
        "Why not divide every result by 200?",
        "Oversampling factor can vary across state",
        [
          "Division is forbidden for probabilities",
          "Each failure has equal natural likelihood",
          "Raw results already include p/q",
        ],
        "Correct weights are sample-specific.",
      ],
      [
        "A learned proposal misses one failure mode. What transfers?",
        "Add coverage and mixture support",
        [
          "Assign missing mode zero natural probability",
          "Trust proposal efficiency alone",
          "Remove the mode from the safety claim",
        ],
        "A proposal cannot estimate regions it never samples.",
      ],
    ],
  ),
  mc(
    "tail-validation-metrics",
    {
      kind: "table",
      caption: "Two controllers",
      columns: ["controller", "mean clearance", "1st percentile", "collisions"],
      rows: [
        ["A", "2.4 m", "0.05 m", 4],
        ["B", "2.1 m", "0.62 m", 0],
      ],
    },
    "ch12-safety-claims",
    "12.3",
    191,
    0,
    [
      [
        "Which result is safer on this evidence?",
        "B has the stronger tail",
        [
          "A because mean clearance is larger",
          "A because four collisions add stress-test coverage",
          "Both because their means exceed two meters",
        ],
        "Low-tail clearance and collisions favor B.",
      ],
      [
        "What does A's mean hide?",
        "Rare near-zero margins",
        [
          "Its controller name",
          "The simulator frame rate",
          "The number of scenario files",
        ],
        "Average performance masks dangerous tails.",
      ],
      [
        "Which metric should gate release?",
        "Collision and low-percentile thresholds",
        [
          "Mean clearance alone",
          "Total route distance",
          "Median rendering latency",
        ],
        "Safety is driven by worst credible outcomes.",
      ],
      [
        "Why can B have lower mean yet safer behavior?",
        "It sacrifices excess margin to protect tails",
        [
          "Means determine each individual sample",
          "Zero collisions increase average distance",
          "Percentiles ignore rare outcomes",
        ],
        "Distribution shape matters.",
      ],
      [
        "A new controller improves mean but worsens tail. What transfers?",
        "Block on the tail regression",
        [
          "Ship on mean improvement",
          "Average the two metrics without limits",
          "Remove low-percentile reporting",
        ],
        "Critical tails need explicit gates.",
      ],
    ],
  ),
  mc(
    "sim-reality-gap",
    {
      kind: "log",
      caption: "Simulator versus track",
      lines: [
        "sim rain detection recall .91",
        "track rain recall .63",
        "sim droplets uniform",
        "track droplets streak and persist",
        "planner unchanged",
      ],
    },
    "ch12-reality-gap",
    "12.3",
    191,
    1,
    [
      [
        "What should the team do?",
        "Calibrate rain sensing from track data",
        [
          "Claim .91 for deployment",
          "Tune planner around ideal detections",
          "Remove track rain from validation",
        ],
        "The sensor model misses key physics.",
      ],
      [
        "What causes the gap?",
        "Unrealistic droplet dynamics",
        [
          "Planner code changed",
          "Track labels are unnecessary",
          "Simulation repeatability lowers recall",
        ],
        "Input statistics differ.",
      ],
      [
        "Which comparison is strongest?",
        "Matched scenes across sim and track",
        [
          "Different routes and weather",
          "Simulator images beside dry track logs",
          "Training loss without physical output",
        ],
        "Matched conditions isolate the model gap.",
      ],
      [
        "Why not fix planning first?",
        "Perception evidence is already mismatched",
        [
          "Planning cannot use detections",
          "Track tests remove closed loop",
          "Rain affects actuator voltage alone",
        ],
        "Repair the earliest demonstrated divergence.",
      ],
      [
        "A LiDAR simulator misses wet-road multipath. What transfers?",
        "Measure and model the residual",
        [
          "Use camera realism as proof",
          "Ignore wet artifacts",
          "Raise point density without validation",
        ],
        "Fidelity is modality-specific.",
      ],
    ],
  ),
  mc(
    "suite-prioritization",
    {
      kind: "table",
      caption: "Candidate nightly suites",
      columns: ["suite", "runtime", "recent failures", "coverage gain"],
      rows: [
        ["nominal", "2 h", 0, "low"],
        ["construction-night", "3 h", 6, "high"],
        ["rain-HIL", "5 h", 2, "medium"],
      ],
    },
    "ch12-safety-claims",
    "12.3",
    191,
    2,
    [
      [
        "With three hours available, what runs?",
        "Construction-night",
        [
          "Nominal plus duplicates",
          "Half of rain-HIL with no valid completion",
          "Random files until time expires",
        ],
        "It fits and yields high risk evidence.",
      ],
      [
        "Why should nominal replay rank below the other suites?",
        "Its marginal information is low",
        [
          "Nominal tests cannot regress",
          "Runtime makes it invalid",
          "Zero failures proves universal safety",
        ],
        "Covered passing regions add less evidence.",
      ],
      [
        "How should rain-HIL be handled?",
        "Schedule a complete dedicated run",
        [
          "Report an incomplete pass",
          "Delete it for runtime",
          "Replace hardware with a screenshot",
        ],
        "Partial execution may not support its claim.",
      ],
      [
        "Why use recent failures in priority?",
        "They identify unstable risk areas",
        [
          "Failures make tests less repeatable",
          "Passing suites should receive all capacity",
          "Priority defines natural frequency",
        ],
        "Regression probability and consequence matter.",
      ],
      [
        "A critical code path changes. What transfers?",
        "Elevate its affected suites",
        [
          "Keep fixed priorities",
          "Run unrelated nominal cases",
          "Suppress historical failures",
        ],
        "Priorities should respond to change impact.",
      ],
    ],
  ),
  mc(
    "bounded-safety-claim",
    {
      kind: "scenario",
      text: "A system passes 2 million simulated urban-day miles, 500 HIL brake faults, and 20 track rain trials. It has no snow, rural, or construction evidence.",
    },
    "ch12-safety-claims",
    "12.3",
    191,
    3,
    [
      [
        "Which claim is supported?",
        "Validated in the tested urban-day and fault scope",
        [
          "Safe across every road and weather domain",
          "Snow readiness from urban mileage",
          "Construction readiness from brake faults",
        ],
        "The claim should match evidence.",
      ],
      [
        "What is the main limitation?",
        "Major ODD gaps remain",
        [
          "Two million miles are too many to analyze",
          "HIL cannot test faults",
          "Track trials erase simulation value",
        ],
        "Volume does not cover omitted domains.",
      ],
      [
        "What strengthens the claim next?",
        "Targeted gap tests",
        [
          "More urban-day duplicates",
          "A larger aggregate mileage label",
          "Removal of ODD boundaries",
        ],
        "New evidence should address missing hazards.",
      ],
      [
        "Why do 500 HIL faults not prove road safety?",
        "They validate a bounded hardware response",
        [
          "Fault tests have no safety value",
          "HIL uses no physical hardware",
          "Brake faults cover all perception domains",
        ],
        "Layer evidence remains scoped.",
      ],
      [
        "Snow operation is requested. What transfers?",
        "Expand the safety case before deployment",
        [
          "Reuse rain as snow evidence",
          "Rename the ODD",
          "Increase urban mileage",
        ],
        "A new domain needs its own validation.",
      ],
    ],
  ),
);
export const chapter12Assessment: ChapterAssessment = {
  chapterId: 12,
  objectives,
  cases,
};
