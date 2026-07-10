import type {
  AssessmentCase,
  AssessmentChoice,
  AssessmentChoiceId,
  AssessmentProbe,
  ChapterAssessment,
  CognitiveSkill,
  QuizDifficulty,
  QuizStimulus,
} from "../types";

type ChoiceSpec = readonly [string, string, string?];
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
  return { id, chapterId: 13, stimulus, probes };
}

const objectives: ChapterAssessment["objectives"] = [
  {
    id: "ch13-readiness",
    chapterId: 13,
    behavior:
      "Judge deployment maturity from operating-domain and fallback evidence.",
    priority: "core",
    references: [{ section: "13.1", page: 195 }],
  },
  {
    id: "ch13-strategy",
    chapterId: 13,
    behavior:
      "Compare consumer, robotaxi, platform, and purpose-built deployment strategies.",
    priority: "core",
    references: [
      { section: "13.2", page: 195 },
      { section: "13.3", page: 198 },
    ],
  },
  {
    id: "ch13-scaling",
    chapterId: 13,
    behavior:
      "Diagnose technical, mapping, infrastructure, and geographic scaling constraints.",
    priority: "core",
    references: [
      { section: "13.3", page: 198 },
      { section: "13.4", page: 200 },
    ],
  },
  {
    id: "ch13-regulation",
    chapterId: 13,
    behavior:
      "Reason about regulation, liability, evidence, and public trust across jurisdictions.",
    priority: "core",
    references: [{ section: "13.4", page: 200 }],
  },
  {
    id: "ch13-economics",
    chapterId: 13,
    behavior:
      "Evaluate capital, operating, validation, and unit-economic evidence.",
    priority: "core",
    references: [{ section: "13.4", page: 200 }],
  },
  {
    id: "ch13-human",
    chapterId: 13,
    behavior:
      "Treat access, communication, supervision, and dignity as deployment requirements.",
    priority: "core",
    references: [{ section: "13.5", page: 200 }],
  },
  {
    id: "ch13-future",
    chapterId: 13,
    behavior:
      "Evaluate hybrid autonomy and vehicle-computing paths without assuming inevitability.",
    priority: "supporting",
    references: [{ section: "13.6", page: 201 }],
  },
];

const cases: AssessmentCase[] = [
  makeCase(
    "readiness-claim",
    {
      kind: "table",
      caption: "Service evidence",
      columns: ["Condition", "Operation"],
      rows: [
        ["mapped downtown, clear", "driverless"],
        ["heavy rain", "service suspended"],
        ["unmapped road", "dispatch refused"],
        ["supported-route fault", "remote assistance requested"],
      ],
    },
    {
      application: q(
        "application",
        "intermediate",
        "Which public claim fits the evidence?",
        ["ch13-readiness"],
        "c",
        {
          a: [
            "Unrestricted autonomy across road and weather conditions",
            "Rain and unmapped roads are excluded.",
          ],
          b: [
            "Driver assistance that requires constant onboard supervision",
            "Supported trips are driverless.",
          ],
          c: [
            "Driverless service inside a constrained operating domain",
            "Correct. The evidence supports a bounded deployment.",
          ],
          d: [
            "A laboratory prototype without any public operation",
            "The table describes an operating service.",
          ],
        },
        [
          "The service completes trips without an onboard driver.",
          "Its geography, weather, and fallback remain bounded.",
        ],
        "Maturity claims should name the demonstrated operating domain.",
        "13.1",
        195,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What most directly contradicts a claim of universal autonomy?",
        ["ch13-readiness"],
        "a",
        {
          a: [
            "Dispatch is refused on unmapped roads and in heavy rain",
            "Correct. Explicit exclusions disprove universal operation.",
          ],
          b: [
            "The service completes mapped downtown trips driverlessly",
            "That supports high automation in one domain.",
          ],
          c: [
            "Remote assistance exists for supported-route faults",
            "Support design alone does not prove universality.",
          ],
          d: [
            "The evidence is summarized in a four-row table",
            "Presentation format does not limit autonomy.",
          ],
        },
        [
          "Universal operation cannot depend on specific mapping and weather.",
          "Two rows identify those dependencies.",
        ],
        "Look for excluded conditions when auditing broad readiness language.",
        "13.1",
        195,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which additional evidence would most strengthen an expansion claim?",
        ["ch13-readiness", "ch13-scaling"],
        "d",
        {
          a: [
            "A new brand name for the existing downtown service",
            "Branding adds no operational coverage.",
          ],
          b: [
            "More rides in the same clear mapped blocks",
            "Volume helps reliability but not new-domain coverage.",
          ],
          c: [
            "A promotional video filmed on one supported street",
            "A selected video is weak systematic evidence.",
          ],
          d: [
            "Validated results in new weather and road classes",
            "Correct. It directly tests the proposed scope change.",
          ],
        },
        [
          "The expansion claim concerns conditions outside current evidence.",
          "Representative validation must cover those conditions.",
        ],
        "Evidence should match the dimension of the claimed expansion.",
        "13.1",
        195,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If rain operation is validated but unmapped roads remain excluded, what changes?",
        ["ch13-readiness"],
        "b",
        {
          a: [
            "The service becomes unrestricted across all geographies",
            "The unmapped-road boundary remains.",
          ],
          b: [
            "The domain broadens but remains constrained",
            "Correct. One condition is added without removing every limit.",
          ],
          c: [
            "Driverless operation becomes supervised assistance",
            "Weather validation does not add a supervising driver.",
          ],
          d: [
            "Remote assistance becomes technically unnecessary",
            "Supported-route faults may still require it.",
          ],
        },
        [
          "Rain is one operating-domain dimension.",
          "Geographic map dependence remains a separate boundary.",
        ],
        "Scope changes incrementally when one constraint is resolved.",
        "13.1",
        195,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A mine robot works without a driver in surveyed tunnels but stops at unknown branches. Which lesson transfers?",
        ["ch13-readiness"],
        "d",
        {
          a: [
            "No driver means it operates in any physical environment",
            "Its unknown-branch limit disproves this.",
          ],
          b: [
            "Surveyed tunnels make the robot a supervised aid",
            "The robot is driverless in its domain.",
          ],
          c: [
            "A stopped mission indicates no useful autonomy",
            "Safe refusal can be appropriate domain handling.",
          ],
          d: [
            "High autonomy can remain bounded by mapped conditions",
            "Correct. The mine is a defined operating domain.",
          ],
        },
        [
          "The robot owns the task in surveyed tunnels.",
          "It refuses locations outside that supported map.",
        ],
        "Operating-domain reasoning transfers beyond road transport.",
        "13.1",
        195,
      ),
    },
  ),
  makeCase(
    "consumer-supervision",
    {
      kind: "log",
      caption: "Broad consumer rollout",
      lines: [
        "feature available on 480,000 vehicles",
        "driver must watch road continuously",
        "OTA updates every six weeks",
        "fleet supplies diverse clips",
        "misuse events rise after ambiguous marketing",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which release change addresses the clearest human-risk evidence?",
        ["ch13-strategy", "ch13-human"],
        "a",
        {
          a: [
            "Clarify supervision, monitor use, and misuse limits",
            "Correct. The observed harm involves responsibility confusion.",
          ],
          b: [
            "Rename the feature while preserving the same ambiguity",
            "A new label does not clarify duties.",
          ],
          c: [
            "Collect more clips without changing driver communication",
            "More data does not resolve misuse directly.",
          ],
          d: [
            "Shorten OTA intervals before validating each update",
            "Faster release can increase uncontrolled change.",
          ],
        },
        [
          "The system requires continuous human monitoring.",
          "Misuse rises when marketing blurs that responsibility.",
        ],
        "Human supervision is an engineered deployment interface.",
        "13.3",
        198,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why does fleet size not establish driverless readiness?",
        ["ch13-readiness", "ch13-strategy"],
        "c",
        {
          a: [
            "Large fleets provide no useful driving data",
            "They can provide broad empirical data.",
          ],
          b: [
            "OTA updates prevent all safety evaluation",
            "Updates can be evaluated through controlled release.",
          ],
          c: [
            "More exposure does not transfer fallback duty",
            "Correct. Drivers still monitor and intervene.",
          ],
          d: [
            "Consumer vehicles cannot contain automation software",
            "The rollout already uses such software.",
          ],
        },
        [
          "Fleet size measures reach and data opportunity.",
          "Automation responsibility is defined by who monitors and handles failure.",
        ],
        "Scale and automation level are different deployment dimensions.",
        "13.3",
        198,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What is the central advantage of this strategy?",
        ["ch13-strategy"],
        "b",
        {
          a: [
            "It removes supervision from the first release",
            "The log requires continuous supervision.",
          ],
          b: [
            "It learns broadly from deployed-vehicle data",
            "Correct. Fleet scale supports rapid learning.",
          ],
          c: [
            "It limits operation to one mapped service zone",
            "The rollout is broad consumer distribution.",
          ],
          d: [
            "It avoids regulatory and marketing scrutiny",
            "Misuse has already created scrutiny risk.",
          ],
        },
        [
          "Many deployed vehicles encounter varied conditions.",
          "OTA delivery supports repeated updates at broad scale.",
        ],
        "A strategy advantage can coexist with serious supervision risk.",
        "13.3",
        198,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If engagement monitoring improves but marketing remains ambiguous, what is plausible?",
        ["ch13-human"],
        "d",
        {
          a: [
            "All drivers interpret the feature responsibilities correctly",
            "Ambiguous communication remains.",
          ],
          b: [
            "Fleet diversity disappears from the collected clips",
            "Monitoring does not remove deployment diversity.",
          ],
          c: [
            "The feature changes into a driverless robotaxi",
            "Driver fallback is unchanged.",
          ],
          d: [
            "Some misuse falls, while responsibility confusion persists",
            "Correct. One control improves without fixing communication.",
          ],
        },
        [
          "Engagement monitoring can catch some inattentive use.",
          "Marketing still shapes users' mental model before intervention.",
        ],
        "Human-risk controls should address behavior and communication together.",
        "13.5",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A widely deployed medical aid still requires clinician review. Which lesson transfers?",
        ["ch13-human"],
        "a",
        {
          a: [
            "State review duties clearly and monitor unsafe reliance",
            "Correct. Broad use can amplify misunderstanding of fallback.",
          ],
          b: [
            "Treat installation count as proof of independent diagnosis",
            "Reach does not transfer clinical responsibility.",
          ],
          c: [
            "Hide limitations to encourage early adoption",
            "Hidden limits increase misuse risk.",
          ],
          d: [
            "Increase updates while dropping validation evidence",
            "Release speed cannot replace safety checks.",
          ],
        },
        [
          "The aid scales broadly while retaining human fallback.",
          "Users need an accurate responsibility model.",
        ],
        "Supervision design transfers across high-stakes automation.",
        "13.5",
        200,
      ),
    },
  ),
  makeCase(
    "geofenced-robotaxi",
    {
      kind: "table",
      caption: "Robotaxi expansion",
      columns: ["Metric", "City A", "City B candidate"],
      rows: [
        ["HD map", "validated", "not built"],
        ["weather", "dry", "frequent snow"],
        ["remote operations", "local team", "not staffed"],
        ["driverless miles", "2.1 M", "0"],
        ["target launch", "operating", "three months"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which decision best follows from the evidence?",
        ["ch13-strategy", "ch13-scaling"],
        "d",
        {
          a: [
            "Launch City B on City A evidence without changes",
            "The new city differs on several critical dimensions.",
          ],
          b: [
            "Treat map construction as the single remaining task",
            "Snow and operations also lack evidence.",
          ],
          c: [
            "Cancel expansion because no new city is feasible",
            "The table shows gaps, not impossibility.",
          ],
          d: [
            "Stage mapping, snow tests, operations, then launch",
            "Correct. The plan closes the specific evidence gaps.",
          ],
        },
        [
          "City B has no mapped, weather, operational, or mileage evidence.",
          "A staged launch can build that evidence under controlled scope.",
        ],
        "Geofenced scaling repeats validation work in each new domain.",
        "13.3",
        198,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is City A's mileage insufficient for City B?",
        ["ch13-scaling"],
        "a",
        {
          a: [
            "Weather, maps, and support differ in City B",
            "Correct. Exposure does not cover those changed conditions.",
          ],
          b: [
            "Mileage evidence loses value after crossing a city boundary",
            "It remains useful within its tested conditions.",
          ],
          c: [
            "Driverless vehicles cannot operate in snowy regions",
            "The table shows missing validation, not a permanent ban.",
          ],
          d: [
            "Remote operations have no role in robotaxi service",
            "The current city uses a local team.",
          ],
        },
        [
          "Transfer requires similarity between source and target domains.",
          "Several safety-relevant dimensions differ here.",
        ],
        "Operational evidence is conditional on the environment and service system.",
        "13.3",
        198,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What is this strategy's primary tradeoff?",
        ["ch13-strategy"],
        "c",
        {
          a: [
            "Fast global reach with little local validation cost",
            "Each candidate city needs new work.",
          ],
          b: [
            "Continuous driver supervision in each operating trip",
            "The service is intended to be driverless.",
          ],
          c: [
            "Tighter domain, slower geographic expansion",
            "Correct. Geofencing reduces variability while increasing replication cost.",
          ],
          d: [
            "No mapping cost but limited access to fleet data",
            "HD mapping is a central requirement here.",
          ],
        },
        [
          "City A has deep validated operation.",
          "City B requires maps, tests, and support before comparable service.",
        ],
        "Controlled-domain safety and geographic scale can pull in opposite directions.",
        "13.3",
        198,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If a validated snow stack is added, which gap remains most visible?",
        ["ch13-scaling"],
        "b",
        {
          a: [
            "City A loses its existing driverless mileage",
            "Work in City B does not erase City A evidence.",
          ],
          b: [
            "City B lacks maps, staff, and operations",
            "Correct. Weather is one row among several gaps.",
          ],
          c: [
            "The target launch becomes unrestricted Level 5",
            "Geofencing and local infrastructure remain.",
          ],
          d: [
            "Remote support becomes incompatible with snow",
            "No such incompatibility is stated.",
          ],
        },
        [
          "Weather validation closes one domain difference.",
          "Map and operational readiness remain unresolved.",
        ],
        "Scaling barriers should be tracked as separate dependencies.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A warehouse autonomy vendor expands to a new facility layout. Which lesson transfers?",
        ["ch13-scaling"],
        "c",
        {
          a: [
            "Reuse old metrics as proof of the new layout",
            "Changed geometry needs local evidence.",
          ],
          b: [
            "Ignore staff procedures during technical validation",
            "Operations are part of service readiness.",
          ],
          c: [
            "Map, test, staff, then expand supported area",
            "Correct. Expansion should follow evidence for the new domain.",
          ],
          d: [
            "Treat controlled-domain scaling as cost free",
            "Replication creates material work.",
          ],
        },
        [
          "The facility is another bounded domain with new geometry and operations.",
          "A staged evidence process contains expansion risk.",
        ],
        "Geofenced scaling logic transfers to private facilities.",
        "13.3",
        198,
      ),
    },
  ),
  makeCase(
    "platform-partner-quality",
    {
      kind: "log",
      caption: "Shared autonomy platform",
      lines: [
        "core stack released to six vehicle partners",
        "three sensor suites differ",
        "partner A passes reference tests",
        "partner B changes fusion thresholds",
        "partner C omits a safety monitor",
        "field performance varies by integration",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which governance mechanism best addresses the variance?",
        ["ch13-strategy", "ch13-scaling"],
        "b",
        {
          a: [
            "Let each partner self-declare compatibility without tests",
            "The field variance shows this is insufficient.",
          ],
          b: [
            "Certify interfaces, scenarios, and monitors",
            "Correct. The platform needs evidence at the deployed configuration.",
          ],
          c: [
            "Require identical company branding across all vehicles",
            "Branding does not align sensors or safety behavior.",
          ],
          d: [
            "Measure core-stack code size instead of integration",
            "Field failures arise from configuration differences.",
          ],
        },
        [
          "The common core runs with different sensors and partner changes.",
          "Deployment assurance must include those integrations.",
        ],
        "Platform scale shifts quality control toward interfaces and conformance.",
        "13.2",
        197,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why can a strong reference stack still yield uneven field results?",
        ["ch13-strategy"],
        "d",
        {
          a: [
            "Reference software cannot be reused across vehicles",
            "Reuse is possible through an integration model.",
          ],
          b: [
            "Partner vehicles use identical hardware and policy",
            "The log describes meaningful differences.",
          ],
          c: [
            "Field results depend solely on national regulation",
            "Technical integration also changes outcomes.",
          ],
          d: [
            "Partner sensor, monitor, and execution details differ",
            "Correct. The deployed system is more than the core code.",
          ],
        },
        [
          "Partners changed inputs and safeguards around the stack.",
          "Those choices alter the behavior that reaches the road.",
        ],
        "Evaluate the complete deployed configuration, not a software label.",
        "13.2",
        197,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What advantage does a shared platform offer?",
        ["ch13-strategy"],
        "a",
        {
          a: [
            "Shared components distribute work across partners",
            "Correct. Shared infrastructure can reduce duplicated work.",
          ],
          b: [
            "Partner integration quality no longer affects safety",
            "The field evidence shows the opposite.",
          ],
          c: [
            "Vehicle hardware differences disappear from deployment",
            "Three sensor suites remain.",
          ],
          d: [
            "Regulatory approval transfers to all configurations",
            "Approval depends on the deployed system and jurisdiction.",
          ],
        },
        [
          "Six partners reuse one core stack.",
          "Shared development can accelerate ecosystem adoption.",
        ],
        "Platform reuse and integration assurance are complementary needs.",
        "13.2",
        197,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If conformance tests require the safety monitor, what should change?",
        ["ch13-scaling"],
        "c",
        {
          a: [
            "Partner C's omitted monitor becomes acceptable",
            "The requirement makes it a failure.",
          ],
          b: [
            "Sensor suites become physically identical",
            "Conformance can allow different validated implementations.",
          ],
          c: [
            "Catch a missing safeguard before release",
            "Correct. The test turns an implicit expectation into a gate.",
          ],
          d: [
            "Fusion thresholds need no scenario testing",
            "Other integration choices still require evidence.",
          ],
        },
        [
          "Partner C currently omits a specified safeguard.",
          "A conformance gate can block that incomplete configuration.",
        ],
        "Executable interface requirements improve platform quality control.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A hospital shares robotic software across several hardware vendors. Which lesson transfers?",
        ["ch13-strategy"],
        "d",
        {
          a: [
            "Validate the source repository and skip deployed systems",
            "Hardware and configuration still change behavior.",
          ],
          b: [
            "Treat vendor branding as a conformance result",
            "A name does not establish function.",
          ],
          c: [
            "Permit safety features to be optional without disclosure",
            "Optional safeguards create uncontrolled variance.",
          ],
          d: [
            "Certify each integration against shared contracts",
            "Correct. The complete deployment must meet the common evidence bar.",
          ],
        },
        [
          "The shared software runs within heterogeneous embodied systems.",
          "Conformance testing contains partner-specific risk.",
        ],
        "Platform governance transfers across robot ecosystems.",
        "13.2",
        197,
      ),
    },
  ),
  makeCase(
    "purpose-built-vehicle",
    {
      kind: "table",
      caption: "Purpose-built shuttle program",
      columns: ["Factor", "Result"],
      rows: [
        ["bidirectional cabin", "no driver controls"],
        ["sensor placement", "optimized around body"],
        ["prototype safety", "promising"],
        ["manufacturing line", "not established"],
        ["approval", "new vehicle form review"],
        ["capital need", "high"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which program plan best matches the evidence?",
        ["ch13-strategy", "ch13-economics"],
        "a",
        {
          a: [
            "Validate service while building production evidence",
            "Correct. Product and production risks need parallel work.",
          ],
          b: [
            "Treat prototype safety as proof of low-cost mass production",
            "Prototype performance does not establish manufacturing scale.",
          ],
          c: [
            "Remove optimized sensors to resemble a conventional car",
            "That discards a design advantage without solving scale.",
          ],
          d: [
            "Skip vehicle-form review because no driver controls exist",
            "The unconventional form increases review need.",
          ],
        },
        [
          "The integrated design has operational promise.",
          "Manufacturing, capital, and regulatory paths remain immature.",
        ],
        "A product concept and a scalable business are separate achievements.",
        "13.2",
        197,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What is the clearest commercialization bottleneck?",
        ["ch13-economics"],
        "c",
        {
          a: [
            "The body contains sensors around its perimeter",
            "Sensor integration is a stated design benefit.",
          ],
          b: [
            "The cabin can travel in two directions",
            "That supports fleet usability.",
          ],
          c: [
            "Production and approval systems are missing",
            "Correct. These gaps prevent scaling beyond prototypes.",
          ],
          d: [
            "The prototype has promising safety evidence",
            "That supports further development rather than blocking it.",
          ],
        },
        [
          "A fieldable fleet requires repeatable manufacturing and legal approval.",
          "Neither is available in the table.",
        ],
        "Commercial readiness includes production and regulatory infrastructure.",
        "13.2",
        197,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What advantage comes from the purpose-built form?",
        ["ch13-strategy"],
        "b",
        {
          a: [
            "It reuses an established driver-control layout",
            "The design removes driver controls.",
          ],
          b: [
            "It jointly optimizes space, sensors, and fleet use",
            "Correct. The vehicle is designed around autonomous service.",
          ],
          c: [
            "It inherits an existing mass-production line",
            "The line is not established.",
          ],
          d: [
            "It avoids approval for unconventional vehicle design",
            "New-form review remains.",
          ],
        },
        [
          "The body is not constrained by a human driver's position.",
          "Sensor and cabin architecture can be integrated from the start.",
        ],
        "Purpose-built integration trades legacy reuse for design freedom.",
        "13.2",
        197,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If manufacturing yield remains low, what economic effect follows?",
        ["ch13-economics"],
        "d",
        {
          a: [
            "Per-vehicle production cost tends to fall rapidly",
            "Low yield wastes materials and capacity.",
          ],
          b: [
            "Prototype safety evidence becomes invalid by definition",
            "Manufacturing and safety evidence are related but distinct.",
          ],
          c: [
            "Approval review becomes unnecessary",
            "Production inefficiency does not remove regulation.",
          ],
          d: [
            "Expansion consumes more capital per usable vehicle",
            "Correct. Poor yield raises unit cost and slows scale.",
          ],
        },
        [
          "A low fraction of produced units becomes deployable.",
          "More inputs are required for each usable shuttle.",
        ],
        "Manufacturing yield connects engineering maturity to unit economics.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A company designs a delivery robot body from scratch. Which lesson transfers?",
        ["ch13-economics"],
        "a",
        {
          a: [
            "Evaluate production and approval with function",
            "Correct. A working prototype is not a scalable product.",
          ],
          b: [
            "Assume design freedom creates an existing supply chain",
            "A new form may require new suppliers and tooling.",
          ],
          c: [
            "Ignore unit cost until citywide deployment begins",
            "Late cost discovery can end the program.",
          ],
          d: [
            "Treat sensor placement as the sole business constraint",
            "Production, regulation, and operations also matter.",
          ],
        },
        [
          "The robot gains integration freedom from a purpose-built form.",
          "It also inherits tooling and regulatory-development burdens.",
        ],
        "Productization reasoning transfers across novel autonomous hardware.",
        "13.2",
        197,
      ),
    },
  ),
  makeCase(
    "rapid-rollout-incident",
    {
      kind: "log",
      caption: "Urban fleet incident review",
      lines: [
        "service area expanded 3x in six weeks",
        "new intersection class had limited validation",
        "vehicle entered an unsafe post-collision state",
        "operator response procedure was unclear",
        "regulator suspended the permit",
        "public complaints rose sharply",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which recovery plan addresses the whole failure chain?",
        ["ch13-regulation", "ch13-scaling"],
        "c",
        {
          a: [
            "Resume the full area after a software restart",
            "Restarting does not close validation or operational gaps.",
          ],
          b: [
            "Focus on public messaging without changing service",
            "Communication cannot substitute for containment.",
          ],
          c: [
            "Constrain service, validate, repair response",
            "Correct. The plan addresses exposure, technical evidence, and operations.",
          ],
          d: [
            "Remove incident logs before the permit review",
            "Evidence loss undermines diagnosis and trust.",
          ],
        },
        [
          "Expansion introduced an under-tested intersection class.",
          "The incident response also failed after the initial event.",
        ],
        "Deployment recovery must address prevention, containment, and governance.",
        "13.2",
        197,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What made geographic expansion a causal risk rather than a neutral business event?",
        ["ch13-scaling"],
        "a",
        {
          a: [
            "New road cases lacked comparable validation",
            "Correct. Exposure changed faster than evidence coverage.",
          ],
          b: [
            "The service area was described with a number",
            "A numerical description does not create risk.",
          ],
          c: [
            "Operators worked in an urban environment",
            "Urban operation was already part of the service.",
          ],
          d: [
            "The permit had a public regulator",
            "Regulation responded after the safety gap.",
          ],
        },
        [
          "The new area included a distinct intersection class.",
          "Validation did not grow with that operational scope.",
        ],
        "Scaling changes the distribution of scenarios a system must handle.",
        "13.4",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which readiness gate is stronger before another expansion?",
        ["ch13-regulation"],
        "d",
        {
          a: [
            "A launch date selected by the marketing team",
            "A date does not establish safety evidence.",
          ],
          b: [
            "Aggregate mileage from the original service blocks",
            "Old-area exposure omits the new road class.",
          ],
          c: [
            "One successful drive through the new intersection",
            "One pass provides weak coverage.",
          ],
          d: [
            "Scenario tests, fallback drills, independent review",
            "Correct. It tests both driving and incident response.",
          ],
        },
        [
          "The failure involved an under-tested scenario and unclear operations.",
          "A compound gate covers both pathways.",
        ],
        "Readiness gates should reflect observed failure mechanisms.",
        "13.4",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If the scenario model improves but operator procedure remains unclear, what remains?",
        ["ch13-regulation"],
        "b",
        {
          a: [
            "The original intersection class becomes unvalidated again",
            "Technical improvement can retain its evidence.",
          ],
          b: [
            "Post-failure containment may stay delayed",
            "Correct. Operational response is a separate control.",
          ],
          c: [
            "Permit suspension ends without regulator review",
            "Technical work does not determine legal action alone.",
          ],
          d: [
            "Public trust rises independently of future conduct",
            "Trust depends on evidence and transparent response.",
          ],
        },
        [
          "The unsafe state was worsened by unclear response procedure.",
          "A better driving model does not specify incident operations.",
        ],
        "Independent safeguards must each be repaired and verified.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A campus delivery fleet triples its area and encounters unseen stair ramps. Which lesson transfers?",
        ["ch13-scaling"],
        "c",
        {
          a: [
            "Mileage in the old area proves ramp handling",
            "Old routes did not contain the new feature.",
          ],
          b: [
            "Continue expansion while collecting failures passively",
            "That exposes users before a safety case exists.",
          ],
          c: [
            "Pause growth; validate ramps and recovery",
            "Correct. Evidence and fallback should precede renewed exposure.",
          ],
          d: [
            "Treat an operator manual as a perception upgrade",
            "Documentation cannot detect geometry.",
          ],
        },
        [
          "The expansion introduces a new physical scenario class.",
          "The fleet also needs a response if the robot becomes unsafe.",
        ],
        "Scope-control lessons transfer to smaller autonomous fleets.",
        "13.4",
        200,
      ),
    },
  ),
  makeCase(
    "program-economics",
    {
      kind: "table",
      caption: "Autonomy program economics",
      columns: ["Metric", "Year 1", "Year 4"],
      rows: [
        ["annual spend", "$420 M", "$610 M"],
        ["commercial vehicles", "0", "140"],
        ["revenue/vehicle", "-", "$52 k"],
        ["remote support/vehicle", "1:2", "1:3"],
        ["validated markets", "1", "2"],
        ["additional capital committed", "$90 M", "$40 M"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which management decision is most evidence based?",
        ["ch13-economics"],
        "b",
        {
          a: [
            "Scale vehicles immediately because revenue is positive",
            "Revenue is small relative to spend and support remains intensive.",
          ],
          b: [
            "Test lower support and replication before scaling",
            "Correct. Those variables drive unit and expansion economics.",
          ],
          c: [
            "Ignore validation cost when computing future capital",
            "Validation is a recurring scaling expense.",
          ],
          d: [
            "Judge viability from vehicle count without cash need",
            "A fleet count omits cost and capital runway.",
          ],
        },
        [
          "Year-four revenue is modest beside annual program spend.",
          "Support ratios and market replication have improved only slightly.",
        ],
        "Economic scaling needs a credible mechanism, not revenue presence alone.",
        "13.4",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why can 140 commercial vehicles coexist with poor economic viability?",
        ["ch13-economics"],
        "d",
        {
          a: [
            "Commercial operation prevents revenue collection",
            "The table reports revenue per vehicle.",
          ],
          b: [
            "Vehicle count determines annual spend exactly",
            "Spend includes development and validation overhead.",
          ],
          c: [
            "Validated markets have no deployment value",
            "Market validation is necessary but costly.",
          ],
          d: [
            "Support and program costs can exceed revenue",
            "Correct. Deployment scale does not imply positive unit or program economics.",
          ],
        },
        [
          "Approximate vehicle revenue is far below $610 million.",
          "A one-to-three support ratio also adds recurring labor.",
        ],
        "Commercial presence and sustainable economics are different milestones.",
        "13.4",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which metric better tests whether the service can scale?",
        ["ch13-economics"],
        "a",
        {
          a: [
            "Per-ride margin after support and fleet costs",
            "Correct. It connects revenue to variable operating burden.",
          ],
          b: [
            "Total research papers published by the company",
            "Research output does not establish service margin.",
          ],
          c: [
            "Maximum prototype speed on a closed track",
            "Peak speed does not reveal unit economics.",
          ],
          d: [
            "Number of colors offered on each vehicle",
            "Product color has little relation to service viability.",
          ],
        },
        [
          "Scaling a service multiplies both revenue and variable cost.",
          "Contribution margin indicates whether that multiplication helps.",
        ],
        "Economic evidence should connect activity to incremental cost.",
        "13.4",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If remote support improves from 1:3 to 1:20, what changes first?",
        ["ch13-economics"],
        "c",
        {
          a: [
            "Sensor hardware becomes less expensive by definition",
            "Support productivity does not set component price.",
          ],
          b: [
            "City approval transfers across jurisdictions",
            "Regulatory replication remains separate.",
          ],
          c: [
            "Labor cost per supported vehicle can decline",
            "Correct. One operator can cover a larger fleet.",
          ],
          d: [
            "Program development spending becomes zero",
            "Core engineering and validation costs remain.",
          ],
        },
        [
          "The same operator effort is spread across more vehicles.",
          "That can improve service unit economics if safety is preserved.",
        ],
        "Operational productivity is one lever in fleet economics.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A security-robot startup has paying pilots but high human monitoring. Which lesson transfers?",
        ["ch13-economics"],
        "b",
        {
          a: [
            "Paying pilots prove profitable mass deployment",
            "Pilot revenue can coexist with labor-heavy operation.",
          ],
          b: [
            "Margin after monitoring and validation costs",
            "Correct. Those costs determine whether fleet growth is sustainable.",
          ],
          c: [
            "Exclude operator labor because the robot is autonomous",
            "Human support is an actual service input.",
          ],
          d: [
            "Use prototype count as the sole business metric",
            "Count omits revenue and cost structure.",
          ],
        },
        [
          "The robot service resembles a supported AV fleet.",
          "Monitoring and site setup can dominate nominal autonomy economics.",
        ],
        "Unit-economic reasoning transfers across autonomy businesses.",
        "13.4",
        200,
      ),
    },
  ),
  makeCase(
    "strategy-selection",
    {
      kind: "table",
      caption: "Regional mobility goals",
      columns: ["Goal", "Priority"],
      rows: [
        ["driverless downtown service in 18 months", "high"],
        ["national geographic coverage", "low initially"],
        ["capital budget", "moderate"],
        ["existing consumer fleet", "none"],
        ["city mapping access", "granted"],
        ["snow", "rare"],
      ],
    },
    {
      application: q(
        "application",
        "intermediate",
        "Which deployment strategy fits the stated priorities best?",
        ["ch13-strategy"],
        "d",
        {
          a: [
            "Supervised features distributed through an existing fleet",
            "The region has no consumer fleet and wants driverless service.",
          ],
          b: [
            "A national launch before local mapping begins",
            "National reach is a low initial priority.",
          ],
          c: [
            "A new purpose-built vehicle and factory before any pilot",
            "That adds capital and schedule risk beyond the goal.",
          ],
          d: [
            "A geofenced robotaxi pilot using the granted map access",
            "Correct. It aligns with local driverless scope and conditions.",
          ],
        },
        [
          "The goal is bounded downtown driverless service.",
          "Mapping access and rare snow reduce two local barriers.",
        ],
        "Strategy fit depends on objectives and available assets.",
        "13.3",
        198,
      ),
      diagnosis: q(
        "diagnosis",
        "advanced",
        "Why is a consumer-first strategy poorly matched here?",
        ["ch13-strategy"],
        "b",
        {
          a: [
            "Consumer strategies cannot gather real-world data",
            "A broad fleet can be a data advantage.",
          ],
          b: [
            "It needs fleet reach and retains supervision",
            "Correct. Both conflict with current assets and the driverless goal.",
          ],
          c: [
            "It requires each city to build HD maps first",
            "That is more characteristic of geofenced robotaxis.",
          ],
          d: [
            "It begins with a purpose-built bidirectional cabin",
            "That describes another strategy.",
          ],
        },
        [
          "No consumer fleet is available for distribution.",
          "The target service also seeks no onboard driver fallback.",
        ],
        "Reject strategies whose enabling assets and responsibility model do not fit.",
        "13.3",
        198,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What tradeoff accompanies the best-fit strategy?",
        ["ch13-strategy"],
        "c",
        {
          a: [
            "It gains immediate national coverage at low local cost",
            "The strategy is locally constrained.",
          ],
          b: [
            "It removes the need for city-specific operations",
            "A geofenced fleet needs local support.",
          ],
          c: [
            "It speeds local control but slows geographic replication",
            "Correct. Domain focus helps validation while each city adds work.",
          ],
          d: [
            "It depends on continuous supervision by customer drivers",
            "The goal is driverless downtown service.",
          ],
        },
        [
          "Map access enables a focused launch.",
          "The same map and validation process must be repeated elsewhere.",
        ],
        "Strategy advantages and scaling costs should be stated together.",
        "13.3",
        198,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If national coverage becomes the top priority, what happens to the strategy fit?",
        ["ch13-strategy"],
        "a",
        {
          a: [
            "City-by-city geofencing becomes less attractive",
            "Correct. Its replication burden conflicts with rapid geographic scale.",
          ],
          b: [
            "Map access in the first city becomes illegal",
            "Priority change does not revoke access.",
          ],
          c: [
            "Snow frequency necessarily rises in the region",
            "Business priority does not alter weather.",
          ],
          d: [
            "Driverless operation converts to a vehicle factory",
            "A goal shift does not create manufacturing capacity.",
          ],
        },
        [
          "The current strategy is optimized for one bounded city.",
          "National scale changes the dominant evaluation criterion.",
        ],
        "A strategy ranking can reverse when objectives change.",
        "13.3",
        198,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A university wants autonomous night shuttles on one mapped campus. Which lesson transfers?",
        ["ch13-strategy"],
        "d",
        {
          a: [
            "Start with nationwide consumer distribution",
            "The goal is one controlled service area.",
          ],
          b: [
            "Build a new vehicle factory before route testing",
            "That is disproportionate to the service goal.",
          ],
          c: [
            "Choose a strategy while ignoring campus operations",
            "Local support is part of deployment.",
          ],
          d: [
            "Use a bounded pilot matched to local conditions",
            "Correct. Strategy should fit the local objective and assets.",
          ],
        },
        [
          "The campus is a constrained domain with direct map access.",
          "A scoped service can validate operation before expansion.",
        ],
        "Deployment-strategy fit transfers to institutional mobility.",
        "13.3",
        198,
      ),
    },
  ),
  makeCase(
    "mapping-maintenance",
    {
      kind: "log",
      caption: "Map-dependent service",
      lines: [
        "construction changes 7% of lanes monthly",
        "map refresh median: 9 days",
        "vehicles report map conflicts",
        "temporary barriers cause fallback stops",
        "city expansion adds 4,200 lane-km",
        "map team staffing unchanged",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which scaling investment best addresses the evidence?",
        ["ch13-scaling", "ch13-economics"],
        "a",
        {
          a: [
            "Automate change detection and speed map validation",
            "Correct. The service needs timely map maintenance at larger scale.",
          ],
          b: [
            "Add lane-kilometers without changing the map process",
            "That increases backlog and stale-map exposure.",
          ],
          c: [
            "Suppress vehicle map-conflict reports",
            "Those reports identify real maintenance gaps.",
          ],
          d: [
            "Treat temporary barriers as permanent route closures",
            "That reduces service rather than improving update speed.",
          ],
        },
        [
          "Road changes occur faster than the nine-day refresh.",
          "Expansion multiplies map volume while staffing stays fixed.",
        ],
        "Map-dependent scaling requires a maintenance system, not a one-time map.",
        "13.4",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why are fallback stops rising near construction?",
        ["ch13-scaling"],
        "c",
        {
          a: [
            "Vehicles lose all sensors whenever a barrier appears",
            "No total sensor loss is stated.",
          ],
          b: [
            "Construction reduces the number of map employees",
            "Staffing is unchanged, not reduced by each site.",
          ],
          c: [
            "Live road geometry diverges from the stale map",
            "Correct. The planner encounters unexpected lane structure.",
          ],
          d: [
            "Map conflict reports physically move the barriers",
            "Reports observe rather than cause the mismatch.",
          ],
        },
        [
          "Seven percent of lanes change monthly.",
          "Median refresh lags those temporary conditions.",
        ],
        "Map freshness is an operational reliability variable.",
        "13.4",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which metric better measures map operations?",
        ["ch13-scaling"],
        "b",
        {
          a: [
            "Total map file size without change age",
            "Size does not show whether roads are current.",
          ],
          b: [
            "Road-change-to-fleet-update time",
            "Correct. It measures the full maintenance response.",
          ],
          c: [
            "Number of map colors shown in an editor",
            "Display palette does not measure freshness.",
          ],
          d: [
            "Vehicle maximum speed on unchanged lanes",
            "Speed does not evaluate update operations.",
          ],
        },
        [
          "The failure arises from delayed change incorporation.",
          "Detection-to-deployment time captures that process.",
        ],
        "Operational metrics should track the mechanism that creates service risk.",
        "13.4",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If lane coverage doubles with the same update capacity, what is plausible?",
        ["ch13-scaling"],
        "d",
        {
          a: [
            "Refresh delay is expected to fall because the map is larger",
            "More work with fixed capacity tends to increase delay.",
          ],
          b: [
            "Construction frequency becomes zero",
            "Coverage growth does not stop road work.",
          ],
          c: [
            "Vehicle sensors become less important",
            "Live sensing remains essential around change.",
          ],
          d: [
            "Backlog and stale-map exposure can increase",
            "Correct. Update demand rises without added service capacity.",
          ],
        },
        [
          "The map team processes a larger network with the same resources.",
          "Queueing pressure can lengthen refresh time.",
        ],
        "Scaling input volume without process capacity creates operational debt.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "An indoor robot service depends on detailed facility maps. Which lesson transfers?",
        ["ch13-scaling"],
        "a",
        {
          a: [
            "Build a change-detection and validated-update workflow",
            "Correct. Furniture and construction can stale indoor maps too.",
          ],
          b: [
            "Assume the commissioning map remains current indefinitely",
            "Facilities change after deployment.",
          ],
          c: [
            "Ignore robot reports that conflict with the map",
            "Those reports can identify real changes.",
          ],
          d: [
            "Expand sites before measuring update capacity",
            "That can multiply unresolved stale-map risk.",
          ],
        },
        [
          "Both services rely on environment models that change over time.",
          "Maintenance latency affects operational safety and availability.",
        ],
        "Map operations transfer to other autonomy deployments.",
        "13.4",
        200,
      ),
    },
  ),
  makeCase(
    "fleet-data-bias",
    {
      kind: "table",
      caption: "Fleet training data",
      columns: ["Condition", "Share", "Failure rate"],
      rows: [
        ["dry suburban", "72%", "0.3%"],
        ["urban night", "18%", "1.4%"],
        ["snow", "2%", "8.7%"],
        ["rural unmarked", "8%", "3.9%"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which data plan most directly targets risk rather than volume?",
        ["ch13-strategy", "ch13-scaling"],
        "b",
        {
          a: [
            "Collect more dry suburban clips at the same distribution",
            "That reinforces the dominant low-failure condition.",
          ],
          b: [
            "Target snow and rural failures in controlled tests",
            "Correct. These conditions have high risk and low coverage.",
          ],
          c: [
            "Remove condition labels before sampling",
            "Then coverage gaps become harder to detect.",
          ],
          d: [
            "Train on the largest geographic market alone",
            "Market size does not ensure safety coverage.",
          ],
        },
        [
          "Snow has the highest failure rate and lowest share.",
          "Rural roads also show elevated failure with modest data.",
        ],
        "Fleet data value depends on coverage of risk-relevant conditions.",
        "13.3",
        198,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why can millions of fleet miles still leave a snow weakness?",
        ["ch13-scaling"],
        "d",
        {
          a: [
            "Mileage records cannot include weather labels",
            "Condition metadata can be collected.",
          ],
          b: [
            "Snow failures are lower than suburban failures",
            "The table shows the reverse.",
          ],
          c: [
            "Large fleets operate in one identical environment",
            "The table includes several conditions.",
          ],
          d: [
            "The dataset has little snow exposure",
            "Correct. Aggregate scale hides sparse subdomains.",
          ],
        },
        [
          "Only two percent of data covers snow.",
          "A large total can still yield limited examples for that condition.",
        ],
        "Aggregate data volume is not the same as balanced domain coverage.",
        "13.3",
        198,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which metric exposes this weakness better than total miles?",
        ["ch13-scaling"],
        "a",
        {
          a: [
            "Failures and sample counts by condition",
            "Correct. It connects performance to representation.",
          ],
          b: [
            "Average vehicle age across the entire fleet",
            "Age does not reveal snow performance.",
          ],
          c: [
            "Number of OTA releases during the year",
            "Release count says little about domain quality.",
          ],
          d: [
            "Total image bytes stored without condition labels",
            "Bytes can be dominated by repetitive dry scenes.",
          ],
        },
        [
          "The concern is concentrated in specific conditions.",
          "Disaggregated evidence makes those concentrations visible.",
        ],
        "Subgroup metrics prevent scale from hiding coverage gaps.",
        "13.3",
        198,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If snow sampling rises but labels remain noisy, what can happen?",
        ["ch13-scaling"],
        "c",
        {
          a: [
            "Snow becomes a dry suburban condition in the world",
            "Label noise changes data, not weather.",
          ],
          b: [
            "Failure rates become irrelevant to evaluation",
            "Observed outcomes still matter.",
          ],
          c: [
            "More data, but still little useful supervision",
            "Correct. Poor labels can blunt the targeted collection.",
          ],
          d: [
            "Rural sample share is required to fall to zero",
            "Snow collection need not eliminate rural data.",
          ],
        },
        [
          "More examples provide exposure.",
          "Noisy targets may prevent the model from learning the intended distinctions.",
        ],
        "Data acquisition and annotation quality are separate scaling levers.",
        "13.3",
        198,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A medical fleet has abundant common scans but few rare-pathology cases. Which lesson transfers?",
        ["ch13-scaling"],
        "b",
        {
          a: [
            "Total scan count proves rare-condition performance",
            "Aggregate volume can hide sparse subgroups.",
          ],
          b: [
            "Measure subgroup errors and target risky gaps",
            "Correct. Collection should follow risk and representation.",
          ],
          c: [
            "Remove pathology labels before evaluation",
            "That prevents subgroup analysis.",
          ],
          d: [
            "Sample the easiest common scans alone",
            "That deepens the coverage imbalance.",
          ],
        },
        [
          "Both datasets are dominated by common low-failure conditions.",
          "Rare high-consequence cases need targeted evidence.",
        ],
        "Risk-weighted data strategy transfers to other safety AI.",
        "13.3",
        198,
      ),
    },
  ),
  makeCase(
    "regulatory-fragmentation",
    {
      kind: "table",
      caption: "Three-jurisdiction launch",
      columns: ["Rule", "Region A", "Region B", "Region C"],
      rows: [
        [
          "remote operator",
          "licensed locally",
          "not recognized",
          "required onsite",
        ],
        ["incident report", "24 h", "72 h", "immediate"],
        ["driverless permit", "city", "state", "national"],
        ["data retention", "30 days", "180 days", "90 days"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which launch architecture best handles the table?",
        ["ch13-regulation", "ch13-scaling"],
        "d",
        {
          a: [
            "Use Region A policy everywhere without review",
            "The regions define conflicting requirements.",
          ],
          b: [
            "Delay incident reports until the longest window",
            "Region C requires immediate reporting.",
          ],
          c: [
            "Treat one permit as valid across all authorities",
            "Permit scope differs by region.",
          ],
          d: [
            "Use auditable local jurisdiction profiles",
            "Correct. The service can enforce each region's obligations.",
          ],
        },
        [
          "Licensing, reporting, permits, and retention vary independently.",
          "A configurable compliance layer makes those differences explicit.",
        ],
        "Regulatory fragmentation becomes an engineering and operations requirement.",
        "13.4",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why can a technically identical fleet face different launch dates?",
        ["ch13-regulation"],
        "b",
        {
          a: [
            "Vehicle software changes the law in each region",
            "Software does not define legal authority.",
          ],
          b: [
            "Operating duties differ by jurisdiction",
            "Correct. Readiness includes local legal and operational work.",
          ],
          c: [
            "Technical performance has no role in any permit",
            "Safety evidence remains relevant.",
          ],
          d: [
            "Data retention determines road friction",
            "Retention policy does not alter vehicle dynamics.",
          ],
        },
        [
          "The table shows different authorities and operator rules.",
          "The fleet must satisfy each before service.",
        ],
        "Deployment timing depends on institutional as well as technical readiness.",
        "13.4",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which change would most reduce repeated compliance work?",
        ["ch13-regulation"],
        "a",
        {
          a: [
            "Shared definitions and reciprocal evidence",
            "Correct. Shared rules can reduce duplicate interpretation and testing.",
          ],
          b: [
            "More vehicle colors in each regional fleet",
            "Appearance does not harmonize regulation.",
          ],
          c: [
            "A longer incident report in every region",
            "Length does not resolve conflicting timing and authority.",
          ],
          d: [
            "Removing audit trails from local operations",
            "Audits support compliance rather than causing fragmentation.",
          ],
        },
        [
          "Current rules vary in both meaning and authority.",
          "Reciprocal standards could let evidence travel more efficiently.",
        ],
        "Harmonization can lower scaling friction without lowering the safety bar.",
        "13.4",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If Region B recognizes Region A operator licenses, what changes?",
        ["ch13-regulation"],
        "c",
        {
          a: [
            "Region C no longer requires onsite staff",
            "The policy change applies only to Region B.",
          ],
          b: [
            "Every data-retention period becomes thirty days",
            "Retention rules are unchanged.",
          ],
          c: [
            "One staffing barrier falls while other permits remain",
            "Correct. Recognition closes one regulatory dependency.",
          ],
          d: [
            "Technical validation becomes unnecessary in Region B",
            "License recognition does not prove vehicle safety.",
          ],
        },
        [
          "The operator credential can now transfer to Region B.",
          "Permit authority, reporting, and retention remain distinct.",
        ],
        "Regulatory progress can be modular rather than all-or-nothing.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A drone service spans cities with different flight rules. Which lesson transfers?",
        ["ch13-regulation"],
        "d",
        {
          a: [
            "Apply the most convenient city's rules to every flight",
            "Local authorities can impose different obligations.",
          ],
          b: [
            "Assume one pilot license satisfies every permit",
            "Credential and operation approval are separate.",
          ],
          c: [
            "Remove location from compliance decisions",
            "Location determines governing rules.",
          ],
          d: [
            "Encode local requirements and preserve auditable evidence",
            "Correct. Operations can then adapt by jurisdiction.",
          ],
        },
        [
          "Both services cross fragmented local regulatory systems.",
          "Configuration and auditability reduce compliance ambiguity.",
        ],
        "Jurisdiction-aware operations transfer to other mobile services.",
        "13.4",
        200,
      ),
    },
  ),
  makeCase(
    "liability-evidence",
    {
      kind: "log",
      caption: "Near-collision record",
      lines: [
        "map update installed 03:10",
        "sensor health nominal",
        "planner selected lane change 03:42:18.220",
        "remote operator message arrived 03:42:18.470",
        "vehicle executed at 03:42:18.310",
        "roadside unit signal timing later found stale",
        "driverless service terms assign monitoring to fleet",
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which investigation approach best supports fair liability analysis?",
        ["ch13-regulation"],
        "a",
        {
          a: [
            "Preserve timing and trace duties across vehicle, fleet, and infrastructure",
            "Correct. The event spans several actors and ordered decisions.",
          ],
          b: [
            "Blame the component with the latest timestamp",
            "Timing alone does not establish causal duty.",
          ],
          c: [
            "Assign fault to the passenger because they used the service",
            "The terms assign monitoring to the fleet.",
          ],
          d: [
            "Delete stale-signal records before legal review",
            "That removes potentially causal evidence.",
          ],
        },
        [
          "The vehicle, remote operator, and roadside signal all contribute evidence.",
          "Responsibility depends on timing, causal effect, and assigned duty.",
        ],
        "Liability analysis needs traceable sociotechnical evidence.",
        "13.4",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is the remote operator message unlikely to have caused the executed lane change?",
        ["ch13-regulation"],
        "c",
        {
          a: [
            "Remote messages cannot affect fleet vehicles",
            "They may affect later actions.",
          ],
          b: [
            "The operator lacked any monitoring responsibility",
            "Fleet responsibility is stated, not operator irrelevance.",
          ],
          c: [
            "Execution began 160 ms before the message arrived",
            "Correct. The causal order rules out that message as the trigger.",
          ],
          d: [
            "The map update occurred earlier that day",
            "Map timing does not establish the message's causal role.",
          ],
        },
        [
          "Vehicle execution was timestamped at .310.",
          "The operator message arrived at .470.",
        ],
        "Ordered timestamps can eliminate some causal hypotheses.",
        "13.4",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which record is most useful for reconstructing system intent?",
        ["ch13-regulation"],
        "b",
        {
          a: [
            "The passenger's preferred music station",
            "Cabin preference does not explain planning.",
          ],
          b: [
            "Planner decision, inputs, version, and execution trace",
            "Correct. These link observed state to commanded action.",
          ],
          c: [
            "The vehicle's exterior color at the time",
            "Color has no causal role.",
          ],
          d: [
            "The company's total annual advertising spend",
            "Advertising does not reconstruct this event.",
          ],
        },
        [
          "Intent is encoded in the planner decision and its inputs.",
          "Version and execution data make that decision reproducible.",
        ],
        "Accountability improves when automated decisions are traceable.",
        "13.4",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If roadside freshness validation had rejected the stale timing, what might improve?",
        ["ch13-regulation"],
        "d",
        {
          a: [
            "The remote message would arrive before it was sent",
            "Freshness checks cannot reverse time.",
          ],
          b: [
            "The map update would be removed from storage",
            "Signal validation is a separate input control.",
          ],
          c: [
            "Every lane change becomes safe by definition",
            "Other failures can remain.",
          ],
          d: [
            "The planner avoids trusting an expired infrastructure state",
            "Correct. One misleading input is contained.",
          ],
        },
        [
          "The roadside timing was stale during planning.",
          "A freshness gate can prevent that value from influencing the maneuver.",
        ],
        "Interface validation can break a causal chain before a decision.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A hospital robot incident spans software, operator, and smart-door messages. Which lesson transfers?",
        ["ch13-regulation"],
        "a",
        {
          a: [
            "Trace timestamps, versions, inputs, actions, and assigned duties",
            "Correct. This reconstructs both mechanism and responsibility.",
          ],
          b: [
            "Choose the nearest employee as the responsible actor",
            "Physical proximity is not a causal analysis.",
          ],
          c: [
            "Treat smart infrastructure as outside the system",
            "Its message may affect robot behavior.",
          ],
          d: [
            "Discard logs to reduce legal exposure",
            "Evidence destruction undermines learning and accountability.",
          ],
        },
        [
          "The event crosses technical and organizational boundaries.",
          "A shared timeline links those contributions.",
        ],
        "Sociotechnical accountability transfers across automated services.",
        "13.4",
        200,
      ),
    },
  ),
  makeCase(
    "public-trust-recovery",
    {
      kind: "table",
      caption: "Survey after a service incident",
      columns: ["Measure", "Before", "After"],
      rows: [
        ["trust service", "68%", "31%"],
        ["understand operating limits", "42%", "39%"],
        ["want independent report", "55%", "84%"],
        ["support limited relaunch", "61%", "47%"],
        ["incident details published", "none", "none"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which response is most likely to support justified trust?",
        ["ch13-regulation", "ch13-human"],
        "b",
        {
          a: [
            "Increase advertising while withholding incident detail",
            "The survey asks for independent evidence.",
          ],
          b: [
            "Publish findings, limits, remedies, and independent validation",
            "Correct. Trust can be tied to transparent corrective evidence.",
          ],
          c: [
            "Resume unrestricted service before the investigation",
            "That increases exposure without closing the gap.",
          ],
          d: [
            "Remove operating-limit education from the relaunch",
            "Limit understanding is already low.",
          ],
        },
        [
          "Trust fell sharply and demand for independent review rose.",
          "No incident details have yet been published.",
        ],
        "Trust recovery should be evidence based rather than promotional.",
        "13.4",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What does the limit-understanding result reveal?",
        ["ch13-human"],
        "d",
        {
          a: [
            "Most riders gained a precise operating-domain model",
            "Understanding remains below forty percent.",
          ],
          b: [
            "Trust fell because every rider read the incident report",
            "No details were published.",
          ],
          c: [
            "Independent review has little public interest",
            "Demand rose to 84 percent.",
          ],
          d: [
            "The service communicated capabilities poorly before and after",
            "Correct. Understanding was low and then declined.",
          ],
        },
        [
          "Limit understanding was only 42 percent before the incident.",
          "The response did not improve it.",
        ],
        "Public trust depends partly on accurate capability communication.",
        "13.5",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which trust measure is more meaningful than app downloads?",
        ["ch13-human"],
        "a",
        {
          a: [
            "Understanding, observed reliability, and response transparency",
            "Correct. These connect belief to actual service behavior.",
          ],
          b: [
            "Number of logo views during the relaunch campaign",
            "Exposure does not establish informed trust.",
          ],
          c: [
            "Total push notifications sent to riders",
            "Message count does not show comprehension.",
          ],
          d: [
            "Vehicle paint brightness in promotional images",
            "Appearance does not measure confidence or safety.",
          ],
        },
        [
          "Trust should reflect competence, limits, and accountable response.",
          "Downloads can occur without any of those conditions.",
        ],
        "Measure informed trust, not attention alone.",
        "13.5",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If an independent report confirms fixes but limits remain unclear, what is plausible?",
        ["ch13-human"],
        "c",
        {
          a: [
            "Operating limits disappear from the service",
            "Communication does not change the domain itself.",
          ],
          b: [
            "Every rider returns immediately after publication",
            "Evidence cannot guarantee individual behavior.",
          ],
          c: [
            "Safety confidence may recover while misuse risk persists",
            "Correct. Remedy evidence and mental models are separate.",
          ],
          d: [
            "Independent review becomes a vehicle-control module",
            "Review is governance, not actuation.",
          ],
        },
        [
          "The report can support confidence in corrective action.",
          "Unclear limits still permit overreliance.",
        ],
        "Trust and correct use require evidence plus comprehension.",
        "13.5",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A public-service AI loses trust after a harmful error. Which lesson transfers?",
        ["ch13-human"],
        "b",
        {
          a: [
            "Increase feature claims before releasing evidence",
            "Broader claims can deepen mistrust.",
          ],
          b: [
            "Disclose the failure, limits, remedies, and external review",
            "Correct. The response makes trust conditional on verifiable action.",
          ],
          c: [
            "Measure success from website traffic alone",
            "Traffic is not informed confidence.",
          ],
          d: [
            "Hide the operating limits to simplify messaging",
            "Hidden limits increase misuse.",
          ],
        },
        [
          "The public needs both causal explanation and evidence of change.",
          "External review reduces sole reliance on the operator's claim.",
        ],
        "Accountable trust recovery transfers beyond AVs.",
        "13.4",
        200,
      ),
    },
  ),
  makeCase(
    "accessible-shuttle",
    {
      kind: "table",
      caption: "Senior-mobility shuttle",
      columns: ["Feature", "Pilot status"],
      rows: [
        ["wheelchair boarding", "manual ramp; 14-minute delay"],
        ["audio instructions", "not available"],
        ["visual instructions", "small screen"],
        ["caregiver booking", "unsupported"],
        ["unplanned stop", "app message only"],
        ["ride completion", "88% overall; 61% mobility-device users"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which redesign most directly addresses the completion gap?",
        ["ch13-human"],
        "c",
        {
          a: [
            "Increase maximum shuttle speed between stops",
            "The failures concern boarding and communication.",
          ],
          b: [
            "Collect more rides without changing access features",
            "More exposure preserves the barrier.",
          ],
          c: [
            "Integrate boarding, multimodal guidance, and caregiver support",
            "Correct. The redesign targets the observed journey barriers.",
          ],
          d: [
            "Replace completion reporting with overall mileage",
            "Mileage would hide the subgroup gap.",
          ],
        },
        [
          "Mobility-device users complete far fewer rides.",
          "Several physical and communication features are missing.",
        ],
        "Accessibility is a core system requirement across the entire journey.",
        "13.5",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why can the 88 percent overall completion rate mislead?",
        ["ch13-human"],
        "a",
        {
          a: [
            "It hides the 61 percent result for mobility-device users",
            "Correct. Aggregate success masks unequal service quality.",
          ],
          b: [
            "Completion rates cannot be measured for shuttles",
            "The pilot reports them directly.",
          ],
          c: [
            "A manual ramp increases every rider's completion",
            "It creates a delay and applies to a subgroup.",
          ],
          d: [
            "Audio instructions are listed as available",
            "The table says they are absent.",
          ],
        },
        [
          "The aggregate combines riders with different access needs.",
          "One intended group experiences much lower success.",
        ],
        "Disaggregate service outcomes to reveal exclusion.",
        "13.5",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which change improves both independence and exception handling?",
        ["ch13-human"],
        "d",
        {
          a: [
            "A larger logo on the booking application",
            "Brand visibility does not help during a stop.",
          ],
          b: [
            "Faster acceleration with the same user interface",
            "Motion speed does not resolve communication.",
          ],
          c: [
            "One more overall ride-completion dashboard",
            "Measurement alone does not change access.",
          ],
          d: [
            "Audio, tactile, visual, and caregiver communication paths",
            "Correct. Several users can receive and respond to status.",
          ],
        },
        [
          "The current app-only path excludes some riders and helpers.",
          "Multiple channels support ordinary and exceptional situations.",
        ],
        "Redundant human interfaces can be accessibility infrastructure.",
        "13.5",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If ramp delay falls but app-only stop messages remain, what is expected?",
        ["ch13-human"],
        "b",
        {
          a: [
            "Every completion gap is removed at once",
            "Communication barriers remain.",
          ],
          b: [
            "Boarding improves while exception access stays uneven",
            "Correct. One barrier changes and another persists.",
          ],
          c: [
            "Caregiver booking becomes available by itself",
            "Ramp timing does not change booking software.",
          ],
          d: [
            "Visual text becomes larger on the screen",
            "No interface change is stated.",
          ],
        },
        [
          "A faster ramp directly improves boarding.",
          "App-only alerts still exclude riders who cannot use that channel.",
        ],
        "Accessibility interventions should be evaluated barrier by barrier.",
        "13.5",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "An autonomous clinic cart serves patients with varied abilities. Which lesson transfers?",
        ["ch13-human"],
        "c",
        {
          a: [
            "Use one small visual display for every patient",
            "A single channel excludes some users.",
          ],
          b: [
            "Measure average task completion without subgroups",
            "Aggregate data can hide unequal outcomes.",
          ],
          c: [
            "Design multimodal access and test by user need",
            "Correct. Requirements should reflect real interaction diversity.",
          ],
          d: [
            "Treat accessibility as a post-launch cosmetic update",
            "Core tasks may be impossible without it.",
          ],
        },
        [
          "Both services interact directly with users who have different abilities.",
          "Multimodal design and disaggregated testing reveal barriers.",
        ],
        "Human-centered autonomy principles transfer to care robotics.",
        "13.5",
        200,
      ),
    },
  ),
  makeCase(
    "digital-booking-access",
    {
      kind: "log",
      caption: "On-demand service analytics",
      lines: [
        "smartphone booking required",
        "service area includes low-connectivity neighborhoods",
        "requests from call center: rejected",
        "no cash option",
        "failed bookings highest among riders over 70",
        "vehicles idle 22% of service hours",
      ],
    },
    {
      application: q(
        "application",
        "intermediate",
        "Which service change best uses existing idle capacity?",
        ["ch13-human", "ch13-economics"],
        "d",
        {
          a: [
            "Raise smartphone requirements for every rider",
            "That deepens the identified barrier.",
          ],
          b: [
            "Move vehicles away from low-connectivity areas",
            "That reduces service where access is weakest.",
          ],
          c: [
            "Increase idle time while preserving booking rules",
            "Unused capacity already exists.",
          ],
          d: [
            "Accept phone, kiosk, and accessible payment requests",
            "Correct. More riders can reach the available fleet.",
          ],
        },
        [
          "Vehicles have substantial unused time.",
          "Booking and payment channels exclude likely riders.",
        ],
        "Service access can be an operational and economic improvement together.",
        "13.5",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What explains idle vehicles alongside unmet demand?",
        ["ch13-human"],
        "b",
        {
          a: [
            "The fleet has no vehicles in the service area",
            "The log reports idle fleet hours.",
          ],
          b: [
            "The booking interface blocks some potential riders",
            "Correct. Demand cannot enter the dispatch system.",
          ],
          c: [
            "Call centers physically disable vehicle batteries",
            "Request rejection is a software policy.",
          ],
          d: [
            "Older riders prefer longer travel times",
            "No such preference is shown.",
          ],
        },
        [
          "Requests arrive through a call center but are rejected.",
          "Smartphone and payment requirements create a demand bottleneck.",
        ],
        "A digital interface can constrain utilization as strongly as vehicle supply.",
        "13.5",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which metric better tracks inclusive service access?",
        ["ch13-human"],
        "a",
        {
          a: [
            "Booking success by age, channel, connectivity, and payment",
            "Correct. It reveals which interface conditions block trips.",
          ],
          b: [
            "Vehicle speed averaged across successful trips",
            "Speed says little about failed requests.",
          ],
          c: [
            "Total app screen views without trip outcomes",
            "Views do not prove access.",
          ],
          d: [
            "Number of autonomous sensors per vehicle",
            "Hardware count does not measure booking inclusion.",
          ],
        },
        [
          "The observed failure occurs before a ride is dispatched.",
          "Disaggregated booking outcomes measure that stage.",
        ],
        "Measure every step of the service funnel, not only completed rides.",
        "13.5",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If call-center booking is accepted, what is a plausible near-term effect?",
        ["ch13-human", "ch13-economics"],
        "c",
        {
          a: [
            "Low-connectivity neighborhoods gain more broadband",
            "Booking policy cannot change infrastructure.",
          ],
          b: [
            "Vehicle sensing cost falls by the same percentage",
            "Channel access does not alter sensors.",
          ],
          c: [
            "Some rejected demand converts into rides and utilization",
            "Correct. A blocked request path becomes dispatchable.",
          ],
          d: [
            "Smartphone booking stops functioning for current users",
            "An added channel need not remove the existing one.",
          ],
        },
        [
          "The call center already receives requests.",
          "Accepting them can fill current idle capacity.",
        ],
        "Removing access friction can improve both equity and utilization.",
        "13.5",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A meal-delivery robot serves residents with unreliable internet. Which lesson transfers?",
        ["ch13-human"],
        "d",
        {
          a: [
            "Require an always-on high-end smartphone",
            "That repeats the connectivity barrier.",
          ],
          b: [
            "Judge access from completed app orders alone",
            "Failed non-app demand remains invisible.",
          ],
          c: [
            "Send idle robots away from low-connectivity blocks",
            "That worsens geographic access.",
          ],
          d: [
            "Offer phone, SMS, kiosk, and assisted ordering",
            "Correct. Multiple channels reduce digital exclusion.",
          ],
        },
        [
          "The service has physical capacity but a digital access constraint.",
          "Alternative channels connect excluded demand to the fleet.",
        ],
        "Inclusive service design transfers across autonomous delivery.",
        "13.5",
        200,
      ),
    },
  ),
  makeCase(
    "external-communication",
    {
      kind: "table",
      caption: "Unsignalized crosswalk trial",
      columns: ["Interface", "Pedestrian understood yield", "Crossing delay"],
      rows: [
        ["vehicle stops silently", "64%", "4.8 s"],
        ["external display says YIELDING", "81%", "3.6 s"],
        ["projected path animation", "73%", "4.1 s"],
        ["display in unfamiliar language", "51%", "5.7 s"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which next design study best follows the evidence?",
        ["ch13-human"],
        "a",
        {
          a: [
            "Test standardized multimodal signals across user groups",
            "Correct. Language and comprehension vary across interfaces.",
          ],
          b: [
            "Adopt the unfamiliar-language display in every city",
            "It performs worst in this trial.",
          ],
          c: [
            "Remove stopping behavior and rely on the display",
            "Communication cannot replace physical yielding.",
          ],
          d: [
            "Measure only vehicle throughput at crossings",
            "Pedestrian understanding is the observed issue.",
          ],
        },
        [
          "The clear text display improves average comprehension.",
          "Its language dependency produces poor transfer.",
        ],
        "Human communication needs standardized, inclusive evidence.",
        "13.5",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is the unfamiliar-language result important for scaling?",
        ["ch13-human", "ch13-scaling"],
        "c",
        {
          a: [
            "Language choice changes vehicle braking physics",
            "The vehicle still stops; comprehension changes.",
          ],
          b: [
            "Every city uses the same visual conventions",
            "The result suggests conventions differ.",
          ],
          c: [
            "An interface can fail when user assumptions change",
            "Correct. Local understanding is part of deployment context.",
          ],
          d: [
            "Pedestrians require a smartphone to see the display",
            "The interface is external on the vehicle.",
          ],
        },
        [
          "The signal is physically visible but poorly understood.",
          "That separates interface availability from semantic success.",
        ],
        "Human-interface validation must transfer across populations.",
        "13.5",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What remains the strongest primary safety signal?",
        ["ch13-human"],
        "d",
        {
          a: [
            "A bright display while the vehicle continues moving",
            "Words cannot override conflicting motion.",
          ],
          b: [
            "A projected path without speed reduction",
            "Prediction graphics do not guarantee yielding.",
          ],
          c: [
            "A marketing promise about courteous behavior",
            "A promise is not an immediate physical cue.",
          ],
          d: [
            "A clear deceleration and stable stop before the crossing",
            "Correct. Vehicle motion directly demonstrates yielding.",
          ],
        },
        [
          "External displays can support understanding.",
          "The physical trajectory remains the most immediate commitment.",
        ],
        "Human-facing messages should agree with observable vehicle behavior.",
        "13.5",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If display meaning conflicts with vehicle motion, what is plausible?",
        ["ch13-human"],
        "b",
        {
          a: [
            "Pedestrian certainty improves because there are more cues",
            "Contradictory cues can reduce certainty.",
          ],
          b: [
            "Confusion and delayed crossing can increase",
            "Correct. Users must decide which signal to trust.",
          ],
          c: [
            "The crosswalk becomes a mapped highway",
            "Interface conflict does not change road type.",
          ],
          d: [
            "Vehicle braking distance falls automatically",
            "A display does not change friction or speed.",
          ],
        },
        [
          "People compare explicit signals with motion cues.",
          "Conflict makes the vehicle's intent harder to infer.",
        ],
        "Consistency is a requirement for trustworthy external communication.",
        "13.5",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A warehouse robot signals workers before crossing an aisle. Which lesson transfers?",
        ["ch13-human"],
        "a",
        {
          a: [
            "Pair standardized signals with an observable slow approach",
            "Correct. Message and motion should communicate the same intent.",
          ],
          b: [
            "Use text understood only by the engineering team",
            "Workers may not share that convention.",
          ],
          c: [
            "Project a path while accelerating into the aisle",
            "The cues conflict and reduce trust.",
          ],
          d: [
            "Evaluate robot speed without worker comprehension",
            "Safe interaction includes human interpretation.",
          ],
        },
        [
          "Workers infer intent from both interface and trajectory.",
          "A shared convention must also be tested with actual users.",
        ],
        "Human-robot communication principles transfer to industrial spaces.",
        "13.5",
        200,
      ),
    },
  ),
  makeCase(
    "operations-workforce",
    {
      kind: "table",
      caption: "Robotaxi operations transition",
      columns: ["Role", "Before", "After scale"],
      rows: [
        ["safety driver", "220", "0"],
        ["remote assistance", "20", "74"],
        ["fleet maintenance", "35", "81"],
        ["map operations", "18", "49"],
        ["customer accessibility", "4", "22"],
        ["training offered", "remote ops only", "remote ops only"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which workforce plan best matches the changed task mix?",
        ["ch13-human", "ch13-economics"],
        "b",
        {
          a: [
            "End every training program after safety drivers leave",
            "Several new roles grow substantially.",
          ],
          b: [
            "Offer pathways across operations, maintenance, maps, and access",
            "Correct. Training should reflect the full emerging workload.",
          ],
          c: [
            "Train all workers for remote assistance alone",
            "That ignores larger maintenance and mapping demand.",
          ],
          d: [
            "Keep role counts fixed while expanding the fleet",
            "The table shows task demand changes with scale.",
          ],
        },
        [
          "Driving roles fall while four service roles grow.",
          "Current training covers only one destination.",
        ],
        "Automation changes task composition rather than simply removing labor.",
        "13.5",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What is the main weakness in the current training offer?",
        ["ch13-human"],
        "d",
        {
          a: [
            "It includes any remote-operations content",
            "That role does grow and needs preparation.",
          ],
          b: [
            "It begins before the fleet reaches scale",
            "Early training can improve transition readiness.",
          ],
          c: [
            "It changes the number of safety drivers",
            "Training responds to role change rather than setting count.",
          ],
          d: [
            "It ignores most growing occupational pathways",
            "Correct. Maintenance, maps, and accessibility also expand.",
          ],
        },
        [
          "Remote assistance grows by 54 roles.",
          "The other three service categories grow by 95 combined.",
        ],
        "Transition programs should follow measured demand, not one visible role.",
        "13.5",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which metric better evaluates workforce transition quality?",
        ["ch13-human"],
        "c",
        {
          a: [
            "Fleet mileage without employee outcomes",
            "Mileage does not show worker transition.",
          ],
          b: [
            "Number of automation press releases",
            "Publicity is not an employment outcome.",
          ],
          c: [
            "Placement, wage, retention, and training completion by role",
            "Correct. These show whether pathways produce durable work.",
          ],
          d: [
            "Maximum vehicle speed during the year",
            "Speed does not evaluate labor adaptation.",
          ],
        },
        [
          "The policy goal concerns affected workers and new service capacity.",
          "Role-level outcomes measure both.",
        ],
        "Workforce evidence should track people through the transition.",
        "13.5",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If map operations remain understaffed while service expands, what can follow?",
        ["ch13-human", "ch13-scaling"],
        "a",
        {
          a: [
            "Map backlog can grow and degrade service readiness",
            "Correct. More domains create more change-maintenance work.",
          ],
          b: [
            "Safety-driver roles return in the same quantity",
            "Understaffing does not prescribe that exact response.",
          ],
          c: [
            "Remote assistance becomes physically impossible",
            "It may still operate with other constraints.",
          ],
          d: [
            "Customer-access work disappears from the service",
            "Map staffing does not remove accessibility needs.",
          ],
        },
        [
          "Map demand rises from 18 to 49 roles in the plan.",
          "An unfilled capacity gap can delay updates and launches.",
        ],
        "Workforce capacity is part of technical service reliability.",
        "13.5",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A logistics firm automates warehouse driving. Which lesson transfers?",
        ["ch13-human"],
        "b",
        {
          a: [
            "Treat every driver role as one identical task",
            "Workers often perform maintenance and exception duties too.",
          ],
          b: [
            "Map old tasks to emerging operations and service roles",
            "Correct. Task analysis supports realistic transition paths.",
          ],
          c: [
            "Offer training for one new job without demand evidence",
            "A narrow program can miss actual growth.",
          ],
          d: [
            "Evaluate transition only from robot throughput",
            "Worker outcomes remain invisible.",
          ],
        },
        [
          "Automation changes movement work while creating support needs.",
          "A task-to-role map can guide training and staffing.",
        ],
        "Workforce-transition reasoning transfers across automation sectors.",
        "13.5",
        200,
      ),
    },
  ),
  makeCase(
    "hybrid-operations",
    {
      kind: "table",
      caption: "Proposed hybrid service",
      columns: ["Condition", "Vehicle role", "Human role"],
      rows: [
        ["mapped clear route", "drives", "monitors fleet"],
        [
          "construction conflict",
          "slows and requests help",
          "selects approved route",
        ],
        ["sensor degradation", "minimal-risk stop", "dispatches support"],
        ["unmapped road", "refuses entry", "plans alternate service"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which design priority is most important for this hybrid model?",
        ["ch13-future", "ch13-human"],
        "d",
        {
          a: [
            "Maximize the number of human requests without limits",
            "Excess requests can overload support.",
          ],
          b: [
            "Hide mode changes to simplify the rider display",
            "Users and operators need state awareness.",
          ],
          c: [
            "Let humans issue unrestricted motion commands",
            "Remote action needs validated boundaries.",
          ],
          d: [
            "Define safe transitions, authority, workload, and fallback",
            "Correct. Hybrid value depends on reliable coordination.",
          ],
        },
        [
          "The vehicle and human exchange responsibility across conditions.",
          "Each transition needs a safe state and clear authority.",
        ],
        "Hybrid autonomy is an interface architecture, not a vague compromise.",
        "13.6",
        201,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "What scaling risk appears if construction requests triple?",
        ["ch13-future", "ch13-economics"],
        "a",
        {
          a: [
            "Human support can become a service-capacity bottleneck",
            "Correct. More requests compete for a finite operator pool.",
          ],
          b: [
            "Mapped clear routes become technically impossible",
            "They may continue without assistance.",
          ],
          c: [
            "Minimal-risk stops lose their braking function",
            "Request volume does not remove vehicle control.",
          ],
          d: [
            "Unmapped roads become automatically validated",
            "Human load does not expand the domain.",
          ],
        },
        [
          "Construction conflicts require operator input.",
          "Trip scale can outgrow available assistance capacity.",
        ],
        "Hybrid systems must model human service rates and queues.",
        "13.6",
        201,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "What is the hybrid model's central benefit here?",
        ["ch13-future"],
        "c",
        {
          a: [
            "It promises operation without any defined limits",
            "The table contains explicit refusals and fallback.",
          ],
          b: [
            "It removes the need for vehicle safe states",
            "Minimal-risk stop is a core safeguard.",
          ],
          c: [
            "It keeps routine autonomy while containing difficult cases",
            "Correct. Humans assist bounded exceptions rather than every trip.",
          ],
          d: [
            "It converts remote support into consumer supervision",
            "Fleet operators and onboard drivers have different roles.",
          ],
        },
        [
          "The vehicle handles mapped nominal routes independently.",
          "Humans enter for defined construction and support events.",
        ],
        "Hybrid deployment can trade operational scope against support burden.",
        "13.6",
        201,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If operator response exceeds the safe waiting time, what should occur?",
        ["ch13-future", "ch13-human"],
        "b",
        {
          a: [
            "The vehicle proceeds through construction without a route",
            "That bypasses the reason for assistance.",
          ],
          b: [
            "The vehicle stays in or reaches a minimal-risk state",
            "Correct. Physical safety cannot depend on prompt human availability.",
          ],
          c: [
            "The rider becomes responsible for remote dispatch",
            "Passengers were not assigned that duty.",
          ],
          d: [
            "The map marks the conflict as resolved",
            "A timeout does not change road conditions.",
          ],
        },
        [
          "Operator help is uncertain in time.",
          "The vehicle already has a designed safe-stop behavior.",
        ],
        "Human assistance needs a time-bounded autonomous fallback.",
        "13.6",
        201,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A field robot handles routine rows but asks an agronomist about anomalies. Which lesson transfers?",
        ["ch13-future"],
        "d",
        {
          a: [
            "Drive through anomalies while waiting for expert input",
            "An unsafe action should not depend on response speed.",
          ],
          b: [
            "Request expert help for every nominal meter",
            "That destroys the scaling benefit.",
          ],
          c: [
            "Keep responsibility transitions implicit",
            "Operators need clear mode and authority.",
          ],
          d: [
            "Define exception triggers, queue limits, and safe waiting behavior",
            "Correct. Human expertise becomes a bounded service.",
          ],
        },
        [
          "The robot automates common work and escalates unusual cases.",
          "Scaling requires controlled exception and fallback design.",
        ],
        "Hybrid operational reasoning transfers to domain-expert robotics.",
        "13.6",
        201,
      ),
    },
  ),
  makeCase(
    "vehicle-computing-future",
    {
      kind: "table",
      caption: "Future fleet workloads",
      columns: ["Workload", "Deadline", "Best reuse"],
      rows: [
        ["emergency braking", "20 ms", "one vehicle"],
        ["nearby hazard map", "2 s", "local vehicles"],
        ["fleet model training", "hours", "global fleet"],
        ["battery support to grid", "minutes", "local grid"],
        ["software update", "overnight", "fleet"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which allocation best fits these workload differences?",
        ["ch13-future"],
        "a",
        {
          a: [
            "Onboard brake, edge hazard map, cloud fleet training",
            "Correct. Placement follows latency and reuse.",
          ],
          b: [
            "Cloud brake, onboard global training, edge-only updates",
            "This reverses critical timing and scale.",
          ],
          c: [
            "Grid controls every emergency brake over the network",
            "Network dependence violates the 20 ms local need.",
          ],
          d: [
            "One processor location for every workload",
            "The tasks have incompatible latency and scope.",
          ],
        },
        [
          "Emergency action must remain local.",
          "Neighborhood and fleet workloads benefit from broader sharing at looser deadlines.",
        ],
        "Future vehicle computing is a placement problem across timescales.",
        "13.6",
        201,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Why is cloud-only braking a poor architecture?",
        ["ch13-future"],
        "c",
        {
          a: [
            "Cloud systems cannot perform numerical computation",
            "They provide substantial compute.",
          ],
          b: [
            "Braking contains no digital control signals",
            "Modern actuation is software controlled.",
          ],
          c: [
            "Network delay and outage can exceed the local deadline",
            "Correct. The safety loop needs bounded onboard response.",
          ],
          d: [
            "Fleet training must use the brake processor",
            "The workloads can be separated.",
          ],
        },
        [
          "The braking deadline is only 20 ms.",
          "Wide-area communication adds variable delay and availability.",
        ],
        "Safety-critical local control should survive external connectivity loss.",
        "13.6",
        201,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which workload gains most from nearby edge sharing?",
        ["ch13-future"],
        "b",
        {
          a: [
            "One vehicle's immediate brake actuator loop",
            "Local control has the tightest deadline.",
          ],
          b: [
            "A hazard map useful to vehicles in the same area",
            "Correct. Local reuse and a two-second deadline fit edge exchange.",
          ],
          c: [
            "Multi-hour global fleet model training",
            "Global cloud aggregation fits that scope better.",
          ],
          d: [
            "A mechanical wheel bearing with no data path",
            "A passive part is not the listed compute workload.",
          ],
        },
        [
          "The hazard is geographically local and shareable.",
          "Its deadline allows short-range communication and aggregation.",
        ],
        "Place computation where data value and timing overlap.",
        "13.6",
        201,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If edge connectivity fails, what should remain functional?",
        ["ch13-future"],
        "d",
        {
          a: [
            "The hazard map receives fresh neighbor reports",
            "The communication path is unavailable.",
          ],
          b: [
            "Cloud training completes on the roadside unit",
            "Edge failure does not move the global workload there.",
          ],
          c: [
            "Grid support runs without local vehicle energy state",
            "Coordination may degrade without data.",
          ],
          d: [
            "Onboard emergency sensing, planning, and braking",
            "Correct. Core safety should not depend on edge service.",
          ],
        },
        [
          "The workload table places emergency braking onboard.",
          "Connectivity enhances cooperation but is not the safety foundation.",
        ],
        "Collaborative services need graceful local independence.",
        "13.6",
        201,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A fleet of inspection drones shares findings through edge nodes. Which lesson transfers?",
        ["ch13-future"],
        "a",
        {
          a: [
            "Keep flight safety onboard and share regional findings",
            "Correct. Placement follows deadline and reuse.",
          ],
          b: [
            "Route motor stabilization through a distant cloud",
            "Wide-area delay threatens flight control.",
          ],
          c: [
            "Store every global model only on one drone",
            "Fleet-scale learning needs broader resources.",
          ],
          d: [
            "Stop local navigation whenever edge service drops",
            "Graceful independence should preserve core flight.",
          ],
        },
        [
          "Drones have local control and shared regional information needs.",
          "Those map to onboard and edge tiers respectively.",
        ],
        "Vehicle-computing placement transfers to other mobile fleets.",
        "13.6",
        201,
      ),
    },
  ),
  makeCase(
    "scaling-decision",
    {
      kind: "table",
      caption: "Board expansion review",
      columns: ["Dimension", "Evidence"],
      rows: [
        ["safety", "city A tail risk within target"],
        ["city B", "snow and roadworks untested"],
        ["economics", "positive ride margin; map overhead high"],
        ["regulation", "conditional permit possible"],
        ["accessibility", "wheelchair completion gap remains"],
        ["operations", "remote support near capacity"],
      ],
    },
    {
      application: q(
        "application",
        "advanced",
        "Which expansion decision best integrates the evidence?",
        ["ch13-scaling", "ch13-economics", "ch13-human"],
        "c",
        {
          a: [
            "Launch City B at full scale because City A is safe",
            "The target domain and service gaps differ.",
          ],
          b: [
            "Cancel the program because some gaps remain",
            "The evidence supports bounded progress, not abandonment.",
          ],
          c: [
            "Run a limited City B pilot after closing critical gaps",
            "Correct. Scope can match evidence while building new coverage.",
          ],
          d: [
            "Expand routes before adding support capacity",
            "Operations are already near their limit.",
          ],
        },
        [
          "City A provides a useful safety foundation.",
          "City B weather, access, and support evidence remain incomplete.",
        ],
        "Scaling decisions should combine technical and human service readiness.",
        "13.4",
        200,
      ),
      diagnosis: q(
        "diagnosis",
        "intermediate",
        "Which current constraint can grow worse merely by adding vehicles?",
        ["ch13-scaling", "ch13-economics"],
        "a",
        {
          a: [
            "Remote support load that is already near capacity",
            "Correct. More trips can create more assistance requests.",
          ],
          b: [
            "City A's existing tail-risk evidence",
            "New vehicles do not erase recorded evidence.",
          ],
          c: [
            "The definition of a conditional permit",
            "Fleet size does not rewrite the legal term.",
          ],
          d: [
            "The physical existence of snow in City B",
            "Vehicle count does not change weather.",
          ],
        },
        [
          "Remote support is an operational queue.",
          "Expansion increases arrivals unless autonomy or staffing changes.",
        ],
        "Identify capacity constraints before multiplying demand.",
        "13.4",
        200,
      ),
      comparison: q(
        "comparison",
        "foundational",
        "Which pair best describes readiness for City B?",
        ["ch13-scaling"],
        "d",
        {
          a: [
            "Positive ride margin and complete snow validation",
            "Snow remains untested.",
          ],
          b: [
            "Full accessibility and unlimited remote capacity",
            "Both are contradicted by the table.",
          ],
          c: [
            "No safety evidence and no permit path",
            "City A evidence and a conditional permit path exist.",
          ],
          d: [
            "Promising base evidence with target-domain gaps",
            "Correct. The case is neither ready nor empty.",
          ],
        },
        [
          "Existing operation supplies a starting point.",
          "Several City B and service-system dimensions remain unresolved.",
        ],
        "Readiness judgments can preserve both strengths and limitations.",
        "13.4",
        200,
      ),
      causal: q(
        "causal",
        "intermediate",
        "If wheelchair completion reaches parity and support capacity doubles, what remains?",
        ["ch13-scaling"],
        "b",
        {
          a: [
            "The ride margin becomes negative by definition",
            "Access and staffing improvements do not force that outcome.",
          ],
          b: [
            "Snow and roadwork validation still limits City B",
            "Correct. Technical target-domain evidence remains missing.",
          ],
          c: [
            "City A loses its safety performance",
            "City B preparation does not degrade City A automatically.",
          ],
          d: [
            "The conditional permit path disappears",
            "Those improvements can support rather than remove approval.",
          ],
        },
        [
          "Two human-service constraints would improve.",
          "Environmental and construction scenario evidence is unchanged.",
        ],
        "Closing one readiness category does not close the whole safety case.",
        "13.4",
        200,
      ),
      transfer: q(
        "transfer",
        "advanced",
        "A regional transit agency evaluates autonomous buses for a second county. Which lesson transfers?",
        ["ch13-scaling"],
        "c",
        {
          a: [
            "Use first-county success as complete proof",
            "Routes, weather, users, and operations can differ.",
          ],
          b: [
            "Evaluate technology without service accessibility",
            "Transit readiness includes rider access.",
          ],
          c: [
            "Match pilot scope to local evidence and capacity",
            "Correct. Expansion should close target-specific gaps.",
          ],
          d: [
            "Treat a permit pathway as a safety result",
            "Legal and technical evidence are distinct.",
          ],
        },
        [
          "The second county is a new operational and institutional domain.",
          "A bounded pilot can test the changed conditions.",
        ],
        "Integrated scaling logic transfers to public transit deployment.",
        "13.4",
        200,
      ),
    },
  ),
];

export const chapter13Assessment: ChapterAssessment = {
  chapterId: 13,
  objectives,
  cases,
};
