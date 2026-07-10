import type { QuizConcept } from "../types";

export const quizConcepts2: Record<number, QuizConcept[]> = {
  8: [
    {
      id: "dbw-electronic-control",
      chapterId: 8,
      term: "Drive-by-wire (DbW)",
      correct:
        "Drive-by-wire replaces mechanical or hydraulic control linkages with electronic signals that software can use to command vehicle functions precisely.",
      distractors: [
        "Drive-by-wire preserves a direct mechanical linkage and uses electronics only to display driver warnings.",
        "Drive-by-wire sends all steering and braking decisions to a remote cloud server before the vehicle can respond.",
        "Drive-by-wire is a sensor-only system that observes vehicle motion but cannot command actuators.",
      ],
      clue:
        "It removes the physical connection between the driver and major mechanical controls so that control can pass through digital systems.",
      scenario:
        "An autonomous controller sends a digital steering command that an electric motor converts into wheel movement without a steering-column linkage.",
      section: "8.1",
      page: 124,
    },
    {
      id: "ecu-coordination",
      chapterId: 8,
      term: "Electronic Control Unit (ECU)",
      correct:
        "The ECU collects sensor information, runs control logic, coordinates timing, and sends safe, timely commands to drive-by-wire actuators.",
      distractors: [
        "The ECU is a passive wiring junction that neither processes sensor data nor issues commands.",
        "The ECU directly measures road geometry with laser pulses and produces a 3D point cloud.",
        "The ECU replaces every actuator by applying steering, throttle, and brake forces mechanically.",
      ],
      clue:
        "The chapter calls this component the brain that links sensed conditions and requested actions to physical actuation.",
      scenario:
        "Wheel-speed and steering-angle readings arrive at one controller, which checks them and then orders steering and braking actuators to respond in sync.",
      section: "8.2",
      page: 124,
    },
    {
      id: "actuators",
      chapterId: 8,
      term: "Drive-by-wire actuators",
      correct:
        "Actuators turn the ECU's digital instructions into physical actions such as changing steering angle, engine power, or brake force.",
      distractors: [
        "Actuators create route plans by predicting the future motion of surrounding vehicles.",
        "Actuators only archive diagnostic logs and never affect vehicle movement.",
        "Actuators replace the communication network by broadcasting raw camera frames to every sensor.",
      ],
      clue:
        "Electronic power steering, electronic throttle control, and electromechanical braking are examples of this final control stage.",
      scenario:
        "After receiving a brake command, an electromechanical unit applies the requested braking force quickly and accurately.",
      section: "8.2",
      page: 125,
    },
    {
      id: "dbw-communication-network",
      chapterId: 8,
      term: "Drive-by-wire communication network",
      correct:
        "Networks such as CAN and automotive Ethernet move ordered, timely data among sensors, ECUs, and actuators so the control loop remains synchronized.",
      distractors: [
        "The network deliberately delays safety commands so that mechanical components can decide whether to accept them.",
        "The network connects only entertainment devices and is isolated from every drive-by-wire component.",
        "The network converts wheel rotation directly into hydraulic pressure without carrying digital messages.",
      ],
      clue:
        "A lost or late signal here can cause vehicle behavior to differ from the ECU's intended command.",
      scenario:
        "A steering-angle update and the resulting motor command travel with very little delay across an in-vehicle CAN link.",
      section: "8.2",
      page: 125,
    },
    {
      id: "dbw-redundancy",
      chapterId: 8,
      term: "Redundancy in drive-by-wire",
      correct:
        "Backup sensors, processors, communication paths, and actuators reduce single points of failure and can preserve control when a component fails.",
      distractors: [
        "Redundancy removes all duplicate components so that failures are easier to reproduce.",
        "Redundancy is used only to increase cabin space and has no functional-safety role.",
        "Redundancy requires the vehicle to stop processing sensor feedback whenever its primary controller is healthy.",
      ],
      clue:
        "Electronic steering or braking cannot rely on a single control unit or data line with no backup.",
      scenario:
        "When the primary steering controller stops responding, an independent controller and communication path maintain basic steering control.",
      section: "8.3",
      page: 127,
    },
    {
      id: "longitudinal-control",
      chapterId: 8,
      term: "Longitudinal control",
      correct:
        "Longitudinal control manages acceleration and braking for tasks such as speed regulation, safe following, smooth stopping, and rear-end collision avoidance.",
      distractors: [
        "Longitudinal control changes only the vehicle's steering angle to reduce cross-track error.",
        "Longitudinal control selects map tiles but cannot influence speed or braking.",
        "Longitudinal control is limited to changing transmission firmware while the vehicle is parked.",
      ],
      clue:
        "This control dimension governs the vehicle's forward and backward motion.",
      scenario:
        "A controller reduces throttle and then applies the brakes to keep a safe gap behind a slowing lead vehicle.",
      section: "8.4",
      page: 127,
    },
    {
      id: "lateral-control",
      chapterId: 8,
      term: "Lateral control",
      correct:
        "Lateral control adjusts steering to keep the vehicle in its lane, follow a planned path, or carry out turns and lane changes.",
      distractors: [
        "Lateral control regulates battery charging current without changing the vehicle's path.",
        "Lateral control controls only forward speed and never issues a steering command.",
        "Lateral control builds a sensor map but leaves path tracking entirely to the human driver.",
      ],
      clue:
        "Pure Pursuit, the Stanley Controller, and LQR are methods discussed for this control dimension.",
      scenario:
        "The vehicle corrects its steering angle after measuring a cross-track error from the center of its planned lane.",
      section: "8.4",
      page: 128,
    },
    {
      id: "integrated-control",
      chapterId: 8,
      term: "Integrated control strategy",
      correct:
        "Integrated control coordinates longitudinal and lateral actions while accounting for interactions among acceleration, braking, steering, and vehicle stability.",
      distractors: [
        "Integrated control prevents steering and speed controllers from exchanging any information during a maneuver.",
        "Integrated control chooses a destination but does not calculate or execute any vehicle motion.",
        "Integrated control applies a fixed steering angle regardless of speed, curvature, or surrounding traffic.",
      ],
      clue:
        "It is especially important when a maneuver, such as merging or emergency avoidance, changes speed and direction at the same time.",
      scenario:
        "During a sharp lane change while accelerating, one controller balances steering demand with the effect of speed on lateral stability.",
      section: "8.4",
      page: 128,
    },
    {
      id: "pid-proportional",
      chapterId: 8,
      term: "PID proportional term",
      correct:
        "The proportional term produces an immediate correction based on current error; excessive proportional gain can cause overshoot and oscillation.",
      distractors: [
        "The proportional term ignores current error and responds only to the total error accumulated since startup.",
        "The proportional term predicts future states by solving a constrained finite-horizon optimization problem.",
        "The proportional term always eliminates steady-state error without any risk of overshoot.",
      ],
      clue:
        "Its contribution is Kp times e(t), so a larger present deviation produces a stronger present response.",
      scenario:
        "A speed controller immediately increases throttle in direct proportion to the gap between desired and measured speed.",
      section: "8.5",
      page: 129,
    },
    {
      id: "pid-integral",
      chapterId: 8,
      term: "PID integral term",
      correct:
        "The integral term accumulates error over time to remove persistent steady-state error, but too much integral action can make the response sluggish or unstable.",
      distractors: [
        "The integral term reacts only to the instantaneous slope of the error and never remembers past error.",
        "The integral term limits actuator commands by enforcing minimum and maximum state constraints.",
        "The integral term is used solely to create a stronger initial response and cannot correct a lasting offset.",
      ],
      clue:
        "It adds up small errors that remain even after the immediate controller response.",
      scenario:
        "A cruise controller gradually adds correction because the car has remained slightly below its target speed for several seconds.",
      section: "8.5",
      page: 129,
    },
    {
      id: "pid-derivative",
      chapterId: 8,
      term: "PID derivative term",
      correct:
        "The derivative term responds to the rate of change of error, providing anticipatory damping that can reduce overshoot and oscillation.",
      distractors: [
        "The derivative term sums every past error equally and is intended mainly to eliminate steady-state offset.",
        "The derivative term commands maximum actuator output whenever the measured error begins to fall.",
        "The derivative term replaces feedback with a precomputed route that never uses current measurements.",
      ],
      clue:
        "Its contribution depends on de(t)/dt and counteracts an error trend before the target is passed too aggressively.",
      scenario:
        "As a steering error begins shrinking very quickly, the controller eases its correction to avoid swinging past the lane center.",
      section: "8.5",
      page: 129,
    },
    {
      id: "mpc-receding-horizon",
      chapterId: 8,
      term: "Model Predictive Control (MPC)",
      correct:
        "MPC predicts future states over a finite horizon, optimizes control inputs under a cost function and constraints, applies only the first action, and repeats with new data.",
      distractors: [
        "MPC uses no vehicle model and selects commands solely from the error measured at the current instant.",
        "MPC executes an entire optimized command sequence without ever updating it from later sensor measurements.",
        "MPC excludes actuator and state limits so that the optimizer can request physically impossible maneuvers.",
      ],
      clue:
        "Its receding-horizon cycle continually replans while balancing trajectory error, control effort, and feasible operating limits.",
      scenario:
        "At each control interval, a vehicle forecasts several future positions, chooses a safe steering and braking sequence, executes its first command, and solves again.",
      section: "8.6",
      page: 130,
    },
  ],
  9: [
    {
      id: "av-computational-pipeline",
      chapterId: 9,
      term: "AV computational pipeline",
      correct:
        "The pipeline converts sensor acquisition through perception, localization, prediction and planning into low-level control signals under strict latency and reliability constraints.",
      distractors: [
        "The pipeline stores raw sensor data indefinitely but does not produce decisions or actuator commands.",
        "The pipeline runs each stage once at startup and then drives without updated environmental input.",
        "The pipeline requires all stages to be isolated so that no stage consumes another stage's output.",
      ],
      clue:
        "It is the structured perception-reasoning-action flow that an AV uses to emulate a human driving loop.",
      scenario:
        "Timestamped camera and LiDAR data become detected objects, a vehicle pose, a planned trajectory, and finally steering and brake commands.",
      section: "9.2",
      page: 134,
    },
    {
      id: "sensor-interface-selection",
      chapterId: 9,
      term: "Sensor-interface selection",
      correct:
        "AV designers match interfaces to bandwidth, latency, robustness, and workload needs, using options such as CAN for small control data and GMSL for high-resolution camera feeds.",
      distractors: [
        "Every AV sensor should use classical CAN because all interfaces provide the same bandwidth and robustness.",
        "USB is always the most automotive-robust option because electromagnetic interference cannot affect it.",
        "GMSL is a low-bandwidth health-monitoring bus that cannot carry video or power.",
      ],
      clue:
        "CAN, USB, GMSL, PCIe, and automotive Ethernet have distinct application domains rather than being interchangeable.",
      scenario:
        "An engineer assigns a low-frequency ultrasonic status message to CAN but a safety-critical high-resolution camera stream to GMSL.",
      section: "9.2",
      page: 135,
    },
    {
      id: "ptp-time-alignment",
      chapterId: 9,
      term: "IEEE 1588 Precision Time Protocol (PTP)",
      correct:
        "PTP aligns distributed sensor timestamps to a common clock so fusion can correlate measurements taken at nearly the same instant.",
      distractors: [
        "PTP compresses point clouds by deleting timestamps before data reaches the fusion module.",
        "PTP intentionally assigns an independent clock to every sensor so their data cannot be correlated.",
        "PTP is an actuator protocol that converts desired velocity directly into hydraulic brake pressure.",
      ],
      clue:
        "The chapter describes it as supporting sub-microsecond alignment across sensor inputs.",
      scenario:
        "Camera, radar, and LiDAR measurements receive synchronized timestamps before they are combined into one environmental estimate.",
      section: "9.2",
      page: 135,
    },
    {
      id: "heterogeneous-workload-mapping",
      chapterId: 9,
      term: "Heterogeneous workload mapping",
      correct:
        "AV systems assign sequential or logic-heavy work to CPUs, parallel neural workloads to GPUs or AI accelerators, and hard real-time actuation to capable CPUs or microcontrollers.",
      distractors: [
        "AV systems must run every perception, planning, and control task on one identical processor regardless of workload structure.",
        "GPUs are selected mainly for recursive graph traversal because they cannot process matrix operations in parallel.",
        "Microcontrollers are used only for cloud analytics and cannot interface with drive-by-wire controllers.",
      ],
      clue:
        "The computational pipeline balances different processor strengths instead of treating CPU, GPU, DSP, NPU, and MCU resources as equivalent.",
      scenario:
        "A neural perception network runs on a GPU while a deterministic low-level brake controller runs on a real-time microcontroller.",
      section: "9.2",
      page: 136,
    },
    {
      id: "middleware-abstraction",
      chapterId: 9,
      term: "AV middleware abstraction",
      correct:
        "Middleware sits between applications and hardware, providing communication and coordination so modules can be developed, tested, and updated without tight hardware coupling.",
      distractors: [
        "Middleware hard-codes every perception algorithm to one sensor vendor so components cannot be reused.",
        "Middleware replaces all application modules with a single mechanical vehicle controller.",
        "Middleware prevents inter-process communication and requires each module to maintain a private copy of the entire AV stack.",
      ],
      clue:
        "It reduces integration complexity by hiding hardware and protocol details behind common services and interfaces.",
      scenario:
        "A planning node is moved to a different compute platform while continuing to exchange the same standardized messages with perception and control.",
      section: "9.3",
      page: 138,
    },
    {
      id: "publish-subscribe",
      chapterId: 9,
      term: "Publish-subscribe communication",
      correct:
        "Publishers broadcast messages on topics and subscribers register for relevant topics, decoupling producers from consumers and supporting asynchronous scaling.",
      distractors: [
        "Each publisher must know and directly invoke the internal code of every future subscriber before sending a message.",
        "A topic may have only one consumer, so perception output cannot serve prediction and planning at the same time.",
        "Subscribers transmit actuator voltages mechanically and cannot receive software messages.",
      ],
      clue:
        "New consumers can receive an existing data stream without modifying the producer that publishes it.",
      scenario:
        "A perception node publishes tracked objects once, while prediction, planning, and logging nodes independently subscribe to that topic.",
      section: "9.3",
      page: 138,
    },
    {
      id: "middleware-lifecycle-management",
      chapterId: 9,
      term: "Middleware lifecycle management",
      correct:
        "Lifecycle management defines module states and safe transitions, coordinates dependencies, and permits selective restart or recovery without stopping the whole system.",
      distractors: [
        "Lifecycle management forces every module to enter active state before any dependency is initialized.",
        "Lifecycle management deletes module state definitions so startup and shutdown order become unpredictable.",
        "Lifecycle management is limited to compressing camera images and cannot support diagnostics or recovery.",
      ],
      clue:
        "Startup, initialization, active, idle, and shutdown are controlled operational states discussed for robust middleware.",
      scenario:
        "A failed localization component is deactivated, restarted, and reinitialized in dependency order while unrelated modules remain available.",
      section: "9.3",
      page: 139,
    },
    {
      id: "ros2-real-time-limits",
      chapterId: 9,
      term: "ROS 2 real-time limitation",
      correct:
        "ROS 2 offers modular DDS-based communication, but its default general-purpose implementations do not guarantee hard real-time behavior without additional real-time engineering.",
      distractors: [
        "ROS 2 natively guarantees bounded execution and ISO 26262 certification for every node under any system load.",
        "ROS 2 cannot use topics, services, actions, or configurable quality-of-service policies.",
        "ROS 2 avoids runtime overhead by requiring all AV functions to execute inside one unmodifiable process.",
      ],
      clue:
        "Thread scheduling unpredictability and transport variability make extra tuning or hardened platforms necessary for critical control loops.",
      scenario:
        "A research stack communicates successfully through ROS 2, but engineers move emergency braking to a certified real-time domain to obtain bounded timing.",
      section: "9.3",
      page: 139,
    },
    {
      id: "rtos-determinism",
      chapterId: 9,
      term: "Real-Time Operating System (RTOS)",
      correct:
        "An RTOS provides bounded response times, deterministic scheduling, and priority-based preemption so safety-critical tasks can meet deadlines.",
      distractors: [
        "An RTOS maximizes average throughput by allowing safety tasks to wait an unbounded time behind background work.",
        "An RTOS requires unrestricted dynamic memory allocation because fragmentation improves timing predictability.",
        "An RTOS is a map format used only to store road geometry and has no role in task execution.",
      ],
      clue:
        "Its defining property is predictable timing rather than merely fast average performance.",
      scenario:
        "An emergency-braking task preempts an infotainment process and completes within its certified response-time budget.",
      section: "9.4",
      page: 140,
    },
    {
      id: "dag-trigger-models",
      chapterId: 9,
      term: "Real-time DAG trigger models",
      correct:
        "Multi-rate DAGs use fixed periodic activations, while processing-chain DAGs trigger work on message arrival; each has different predictability, queue, and latency trade-offs.",
      distractors: [
        "Both DAG models forbid dependencies, so tasks always execute in a random order.",
        "Processing-chain DAGs poll at one fixed rate and never react when a message arrives.",
        "Multi-rate DAGs automatically eliminate data overwrite risks even when producer and consumer sampling rates differ.",
      ],
      clue:
        "The chapter contrasts periodic chassis-style execution with event-driven high-level processing chains.",
      scenario:
        "A brake-control task runs every fixed interval, while a perception consumer starts when a newly detected-object message arrives.",
      section: "9.4",
      page: 140,
    },
    {
      id: "vehicle-programming-interface",
      chapterId: 9,
      term: "Vehicle Programming Interface (VPI)",
      correct:
        "VPI is a bidirectional software-defined bridge that standardizes how high-level autonomy commands reach vehicle hardware and how actuator and diagnostic feedback returns upstream.",
      distractors: [
        "VPI is a one-way camera cable that carries images but cannot send commands or receive vehicle feedback.",
        "VPI binds application logic permanently to one vendor's low-level hardware protocol to prevent portability.",
        "VPI replaces safety checks by accepting every actuator command without timeout, arbitration, or fallback handling.",
      ],
      clue:
        "It translates software intent into steering, throttle, brake, and transmission action while abstracting hardware details.",
      scenario:
        "A planner's desired velocity is converted into standardized throttle and brake requests, and wheel speed plus diagnostic state return through the same interface layer.",
      section: "9.5",
      page: 142,
    },
    {
      id: "hardware-fault-tolerance",
      chapterId: 9,
      term: "AV hardware fault tolerance",
      correct:
        "ECC memory, watchdogs, lockstep processors, redundant power, and related mechanisms detect or tolerate faults so safety-relevant computation can continue or degrade safely.",
      distractors: [
        "Fault-tolerant hardware removes error detection so transient memory faults cannot interrupt normal processing.",
        "A watchdog improves availability by ignoring an unresponsive processor indefinitely.",
        "Lockstep processors deliberately execute unrelated instructions so their outputs cannot be compared.",
      ],
      clue:
        "ISO 26262-oriented hardware uses monitoring and redundancy rather than assuming processors and memory never fail.",
      scenario:
        "Two safety processors execute the same instruction stream and flag a fault when their outputs disagree, while a watchdog can reset an unresponsive unit.",
      section: "9.6",
      page: 146,
    },
  ],
  10: [
    {
      id: "end-to-end-mapping",
      chapterId: 10,
      term: "End-to-end autonomous driving",
      correct:
        "End-to-end driving learns a unified mapping from raw or fused sensory input to a trajectory or control action instead of relying on a fully hand-engineered sequence of modules.",
      distractors: [
        "End-to-end driving requires every intermediate representation to be manually specified and validated before training begins.",
        "End-to-end driving uses no learned model and selects actions only from fixed traffic-rule lookup tables.",
        "End-to-end driving stops at object detection and cannot produce a plan, trajectory, or control command.",
      ],
      clue:
        "It treats much of the perception-to-action pipeline as one trainable problem.",
      scenario:
        "A neural network receives camera frames and directly predicts future ego positions that a low-level controller follows.",
      section: "10.1",
      page: 149,
    },
    {
      id: "uniad",
      chapterId: 10,
      term: "UniAD",
      correct:
        "UniAD is a planning-oriented shared architecture that aligns perception, prediction, and planning toward the final motion-planning task.",
      distractors: [
        "UniAD is a brake-by-wire protocol that carries only actuator commands over CAN.",
        "UniAD separates every driving task into unrelated models that cannot share representations or objectives.",
        "UniAD is a traffic simulator used solely to generate road-surface textures.",
      ],
      clue:
        "The chapter presents it as reducing compounding errors by making formerly sequential subsystems interrelated in one network.",
      scenario:
        "Perception and agent prediction are trained inside a shared network whose outputs are explicitly organized to improve the vehicle's final plan.",
      section: "10.2",
      page: 149,
    },
    {
      id: "drivegpt4",
      chapterId: 10,
      term: "DriveGPT4",
      correct:
        "DriveGPT4 combines multi-frame video and textual queries in a large-language-model-based framework to produce interpretable driving decisions and query-based reasoning.",
      distractors: [
        "DriveGPT4 accepts only wheel-speed values and cannot process video, language, or driving context.",
        "DriveGPT4 is designed to hide its reasoning and prohibits users from asking questions about a decision.",
        "DriveGPT4 is a purely mechanical steering controller with no learned multimodal component.",
      ],
      clue:
        "Its distinguishing feature in the chapter is multimodal explanation through video and language.",
      scenario:
        "A user supplies recent road video and asks why the vehicle slowed; the model returns a driving decision with a textual explanation.",
      section: "10.2",
      page: 149,
    },
    {
      id: "univ2x",
      chapterId: 10,
      term: "UniV2X",
      correct:
        "UniV2X is a cooperative end-to-end system that fuses onboard and infrastructure information to unify agent perception, occupancy prediction, and planning.",
      distractors: [
        "UniV2X disables communication with infrastructure and relies exclusively on a single onboard ultrasonic sensor.",
        "UniV2X is a modular diagnostic tool that records engine codes but performs no perception or planning.",
        "UniV2X transmits every raw sensor byte densely and has no sparse communication or fusion strategy.",
      ],
      clue:
        "It addresses the limitations of sensor-only driving through V2X cooperation and a hybrid dense-sparse transmission pipeline.",
      scenario:
        "An intersection unit shares information about an occluded road user, and the vehicle incorporates it into occupancy prediction and motion planning.",
      section: "10.2",
      page: 149,
    },
    {
      id: "genad",
      chapterId: 10,
      term: "GenAD",
      correct:
        "GenAD treats autonomous driving as a generative task, using a variational autoencoder and structured latent trajectory priors for simultaneous planning and prediction.",
      distractors: [
        "GenAD is a fixed PID controller that cannot learn scene context or future trajectories.",
        "GenAD removes all temporal modeling and predicts each control value from an unrelated random sample.",
        "GenAD is a road-network protocol that authenticates V2X certificates but does not generate motion.",
      ],
      clue:
        "Instance-centric tokenization and a structured latent space are central to this model's generative formulation.",
      scenario:
        "A model encodes scene agents into tokens and samples structured future trajectory representations used for both prediction and planning.",
      section: "10.2",
      page: 149,
    },
    {
      id: "transfuser",
      chapterId: 10,
      term: "TransFuser",
      correct:
        "TransFuser uses transformer attention to integrate camera and LiDAR information for end-to-end urban navigation and global scene reasoning.",
      distractors: [
        "TransFuser discards both camera and LiDAR data and plans only from a destination coordinate.",
        "TransFuser fuses brake pressure with battery voltage but cannot process environmental sensors.",
        "TransFuser keeps camera and LiDAR streams permanently isolated so attention cannot connect their features.",
      ],
      clue:
        "The chapter highlights this model as a multimodal fusion approach for complex urban scenes and long-term planning.",
      scenario:
        "Attention layers connect image features with depth-rich point-cloud features before the network selects a driving trajectory.",
      section: "10.2",
      page: 149,
    },
    {
      id: "joint-optimization",
      chapterId: 10,
      term: "Joint end-to-end optimization",
      correct:
        "Joint optimization trains the connected perception, planning, and control objective together, reducing interface errors and allowing task-relevant features to emerge from data.",
      distractors: [
        "Joint optimization freezes every upstream representation and forbids the final driving objective from influencing learned features.",
        "Joint optimization requires separate incompatible loss functions that can never be trained in the same model.",
        "Joint optimization guarantees certified safety and perfect generalization without diverse training data.",
      ],
      clue:
        "Gradients can shape the full decision pipeline rather than stopping at boundaries between independently engineered modules.",
      scenario:
        "A lane-comfort objective changes both the model's visual representation and its future-trajectory prediction during one training process.",
      section: "10.2",
      page: 150,
    },
    {
      id: "end-to-end-limitations",
      chapterId: 10,
      term: "End-to-end validation challenge",
      correct:
        "Tightly coupled end-to-end models are difficult to interpret, debug, verify, and generalize, and they usually require large, diverse datasets to handle edge cases.",
      distractors: [
        "End-to-end models expose every intermediate decision through fixed interfaces, making certification automatically easier than modular systems.",
        "End-to-end models generalize perfectly from a small, uniform dataset and cannot degrade out of distribution.",
        "End-to-end validation needs only a unit test for one component because errors cannot propagate through a unified model.",
      ],
      clue:
        "A black-box failure may not identify whether perception, prediction, or planning caused the unsafe output.",
      scenario:
        "After an unexpected turn in unusual weather, engineers cannot isolate a faulty module and must analyze or retrain the tightly coupled network.",
      section: "10.2",
      page: 150,
    },
    {
      id: "modular-autonomy",
      chapterId: 10,
      term: "Modular autonomy",
      correct:
        "A modular stack separates sensors, perception, prediction, planning, and control behind defined interfaces so each subsystem can be inspected, tested, and updated independently.",
      distractors: [
        "A modular stack maps raw camera pixels directly to steering with no named intermediate subsystem.",
        "A modular stack prevents component-level metrics and requires every change to retrain one monolithic network.",
        "A modular stack has no interfaces, so all components share undocumented internal memory and cannot be isolated.",
      ],
      clue:
        "Its structured engineering approach makes failures easier to trace to a specific stage.",
      scenario:
        "A team improves pedestrian prediction and validates that module through its object-track input and trajectory output without retraining perception.",
      section: "10.3.1",
      page: 151,
    },
    {
      id: "unified-model-pipeline",
      chapterId: 10,
      term: "Unified end-to-end model pipeline",
      correct:
        "A unified model consumes multimodal raw sensor streams and produces direct control commands or an intermediate trajectory through one monolithic or multitask learned architecture.",
      distractors: [
        "A unified model can output only raw sensor frames and is prohibited from predicting trajectories or controls.",
        "A unified model requires manual feature extraction at every layer and cannot learn a shared representation.",
        "A unified model is a collection of mechanically linked controllers with no trainable parameters.",
      ],
      clue:
        "Convolutional, recurrent, or transformer layers may implicitly combine tasks that a modular stack keeps separate.",
      scenario:
        "RGB images and LiDAR points enter one multitask network whose final output is a sequence of future ego-vehicle positions.",
      section: "10.3.2",
      page: 152,
    },
    {
      id: "hybrid-autonomy",
      chapterId: 10,
      term: "Hybrid autonomy architecture",
      correct:
        "A hybrid architecture combines learned components with structured intermediate representations or rule-based modules to retain flexibility while improving interpretability and validation.",
      distractors: [
        "A hybrid architecture forbids learned components and uses only fixed mechanical responses.",
        "A hybrid architecture removes all module boundaries and is therefore identical to a fully monolithic end-to-end network.",
        "A hybrid architecture requires every safety-critical controller to be replaced by an unverified language model.",
      ],
      clue:
        "It occupies a spectrum between fully modular and fully end-to-end design rather than choosing either extreme.",
      scenario:
        "A vehicle uses neural perception and prediction but retains a structured planner and a validated rule-based low-level controller.",
      section: "10.4",
      page: 154,
    },
    {
      id: "latent-world-model",
      chapterId: 10,
      term: "Latent world model",
      correct:
        "A latent world model encodes the environment compactly, simulates possible future states with learned dynamics, and evaluates imagined outcomes before choosing a plan.",
      distractors: [
        "A latent world model stores only the current steering command and cannot represent or simulate future observations.",
        "A latent world model selects actions without an encoder, dynamics model, or any notion of environmental state.",
        "A latent world model reconstructs the past only and prohibits counterfactual questions about possible agent behavior.",
      ],
      clue:
        "Its encoder, dynamics model, and decoder support imagination-based planning and counterfactual reasoning.",
      scenario:
        "Before acting, a vehicle imagines several latent futures, including one in which a pedestrian moves faster, and chooses the safest trajectory.",
      section: "10.4",
      page: 152,
    },
  ],
  11: [
    {
      id: "cia-confidentiality",
      chapterId: 11,
      term: "Confidentiality",
      correct:
        "Confidentiality limits information access to authorized parties, protecting data such as occupant details, route histories, credentials, and AV communications.",
      distractors: [
        "Confidentiality guarantees that every sensor and service remains reachable during a hardware outage.",
        "Confidentiality proves that control data has not been altered between its creation and use.",
        "Confidentiality requires AV route histories and authentication keys to be publicly readable by default.",
      ],
      clue:
        "In the CIA triad, this property acts like a vault whose contents are available only with proper authorization.",
      scenario:
        "Passenger destinations are encrypted and disclosed only to an authorized navigation service rather than to nearby network listeners.",
      section: "11.2",
      page: 157,
    },
    {
      id: "cia-integrity",
      chapterId: 11,
      term: "Integrity",
      correct:
        "Integrity ensures that data remains accurate and unaltered throughout its lifecycle, including sensor readings, control commands, and system logs.",
      distractors: [
        "Integrity ensures that authorized users can always reach a service even when its hardware has failed.",
        "Integrity means deleting all audit records so unauthorized modifications cannot be discovered.",
        "Integrity permits any node to rewrite a brake command as long as the message arrives before its deadline.",
      ],
      clue:
        "The chapter compares this CIA property to a tamper-evident seal that reveals unauthorized modification.",
      scenario:
        "A signed steering message fails verification after an attacker changes its requested angle, so the vehicle rejects it.",
      section: "11.2",
      page: 158,
    },
    {
      id: "cia-availability",
      chapterId: 11,
      term: "Availability",
      correct:
        "Availability ensures that authorized users and processes can access information and resources when needed, especially for real-time and emergency functions.",
      distractors: [
        "Availability guarantees that private passenger records are unreadable to unauthorized users but says nothing about service uptime.",
        "Availability checks whether a sensor reading was modified but does not require the sensor service to remain reachable.",
        "Availability is improved by allowing spam traffic to consume all V2X bandwidth before legitimate safety messages arrive.",
      ],
      clue:
        "The chapter compares this property to an electrical grid that must provide power when it is needed.",
      scenario:
        "Redundant communication paths keep emergency-response messages accessible after one network interface fails.",
      section: "11.2",
      page: 158,
    },
    {
      id: "av-attack-surface",
      chapterId: 11,
      term: "AV attack surface",
      correct:
        "An AV attack surface is the total set of physical and digital entry points, grouped in the chapter into sensors, in-vehicle systems, and V2X communication.",
      distractors: [
        "An AV attack surface includes only public websites and excludes sensors, ECUs, and vehicle networks.",
        "An AV attack surface is a safety rating that counts only collisions caused by human drivers.",
        "An AV attack surface becomes empty as soon as the vehicle uses more than one sensor modality.",
      ],
      clue:
        "It is broader than a conventional software interface because an AV is an interconnected cyber-physical system.",
      scenario:
        "A security review inventories a camera that can be dazzled, an OBD-II path to CAN, and wireless V2X links as possible adversary entry points.",
      section: "11.3",
      page: 158,
    },
    {
      id: "camera-laser-attack",
      chapterId: 11,
      term: "Camera laser attack",
      correct:
        "A focused high-intensity laser can saturate camera photodiodes, while automatic gain control may darken the rest of the scene and disrupt visual perception.",
      distractors: [
        "A camera laser attack changes GNSS timing by broadcasting counterfeit satellite navigation messages.",
        "A camera laser attack improves exposure by increasing the visibility of every lane marking and pedestrian.",
        "A camera laser attack requires authenticated access to the vehicle operating system before light can affect the sensor.",
      ],
      clue:
        "Local oversaturation and global underexposure can obscure details needed for lane and object recognition.",
      scenario:
        "A bright beam aimed at a forward camera produces a washed-out streak and causes automatic exposure control to make surrounding road features too dark.",
      section: "11.4",
      page: 159,
    },
    {
      id: "gnss-spoofing",
      chapterId: 11,
      term: "GNSS spoofing",
      correct:
        "GNSS spoofing broadcasts synchronized counterfeit satellite-like signals that cause a receiver to calculate false position or time while appearing to retain a signal lock.",
      distractors: [
        "GNSS spoofing blocks all radio energy with noise so the receiver immediately reports that no signal exists.",
        "GNSS spoofing changes a camera image with a printed adversarial patch but never affects navigation coordinates.",
        "GNSS spoofing requires physically replacing the vehicle's odometer and cannot be performed with radio equipment.",
      ],
      clue:
        "Unlike simple jamming, this attack supplies believable but false navigation waveforms rather than merely denying reception.",
      scenario:
        "A software-defined radio gradually overpowers legitimate satellite signals and then shifts the apparent coordinates of a vehicle off its true road.",
      section: "11.4",
      page: 160,
    },
    {
      id: "lidar-relay-attack",
      chapterId: 11,
      term: "LiDAR relay attack",
      correct:
        "A LiDAR relay attack intercepts genuine laser pulses and retransmits them with changed timing, intensity, or angle to shift, create, or obscure perceived objects.",
      distractors: [
        "A LiDAR relay attack protects point clouds by digitally signing every genuine return before it reaches the sensor.",
        "A LiDAR relay attack works only by delaying CAN brake commands and never interacts with emitted light.",
        "A LiDAR relay attack can change color texture in camera images but cannot affect measured range.",
      ],
      clue:
        "The attacker reuses the sensor's real optical signal rather than generating a fully synthetic modulation scheme from scratch.",
      scenario:
        "A photodetector captures a LiDAR pulse and a laser retransmits it after a controlled delay, making a real object appear farther away.",
      section: "11.4",
      page: 163,
    },
    {
      id: "ros-security-gap",
      chapterId: 11,
      term: "ROS security gap",
      correct:
        "The ROS design discussed in the chapter lacks authentication for messaging and node creation, resource isolation, and encrypted node messages, enabling hijacked nodes and tampered traffic.",
      distractors: [
        "ROS authenticates every new node with mandatory certificates and encrypts all messages in its default configuration.",
        "ROS prevents every node from consuming memory, publishing messages, or accessing any shared system resource.",
        "ROS security concerns are limited to physical tire damage and cannot involve topics, services, or node processes.",
      ],
      clue:
        "A compromised node can flood memory until processes are killed, or an attacker can forge traffic on a topic or service.",
      scenario:
        "An unauthorized node continuously publishes messages, exhausts memory, and causes important ROS processes to shut down.",
      section: "11.5.0.1",
      page: 163,
    },
    {
      id: "dds-security-plugins",
      chapterId: 11,
      term: "DDS security plugins in ROS 2",
      correct:
        "DDS defines authentication, access-control, cryptographic, logging, and data-tagging plugin interfaces; the chapter says ROS 2 relies on the first three.",
      distractors: [
        "DDS security provides only image compression and has no identity, permission, or cryptographic function.",
        "ROS 2 uses the DDS logging and data-tagging plugins exclusively while omitting authentication and encryption.",
        "The DDS cryptographic plugin publishes plaintext keys to all participants instead of protecting messages.",
      ],
      clue:
        "PKI certificates, signed governance and permission files, and AES-GCM-GMAC are named in this security architecture.",
      scenario:
        "A ROS 2 participant presents an X.509 certificate, is checked against signed permissions, and exchanges authenticated encrypted DDS traffic.",
      section: "11.5.0.2",
      page: 164,
    },
    {
      id: "can-security-vulnerability",
      chapterId: 11,
      term: "CAN bus security vulnerability",
      correct:
        "Classical CAN lacks source authentication and access control, so a correctly formatted malicious frame can be accepted through entry points such as OBD-II or connected media systems.",
      distractors: [
        "Every CAN frame includes a cryptographically verified sender identity, making forged messages impossible.",
        "CAN permits communication only from one permanent master, so no other node can initiate a message.",
        "The OBD-II port is physically isolated from the vehicle network and cannot expose CAN communication.",
      ],
      clue:
        "A frame indicates its intended message identity but does not prove which node actually transmitted it.",
      scenario:
        "An attacker reaches the in-vehicle network through a diagnostic interface and injects a valid-format frame that receivers mistake for a legitimate command.",
      section: "11.5.0.4",
      page: 165,
    },
    {
      id: "sybil-attack",
      chapterId: 11,
      term: "Sybil attack",
      correct:
        "In a Sybil attack, one malicious VANET node presents multiple virtual identities, creating false consensus or undermining distributed data replication.",
      distractors: [
        "A Sybil attack delays one authentic emergency message but never creates or impersonates additional identities.",
        "A Sybil attack protects routing by forcing every physical node to use exactly one verified identity.",
        "A Sybil attack is a sensor-cleaning method that removes duplicate LiDAR returns from a point cloud.",
      ],
      clue:
        "Many apparently independent reports may secretly originate from the same adversary.",
      scenario:
        "One attacker broadcasts the same false congestion report under several vehicle identities, persuading a receiver that multiple sources agree.",
      section: "11.6.0.1",
      page: 167,
    },
    {
      id: "v2x-replay-attack",
      chapterId: 11,
      term: "V2X replay attack",
      correct:
        "A replay attack records a previously legitimate V2X message and rebroadcasts it after it is stale, causing receivers to treat old information as current.",
      distractors: [
        "A replay attack creates new cryptographic keys and prevents any stored message from being transmitted twice.",
        "A replay attack jams a radio channel with featureless noise without sending a previously valid message.",
        "A replay attack alters only camera pixels and cannot influence traffic information received over V2X.",
      ],
      clue:
        "The message may be authentic in origin but invalid in time.",
      scenario:
        "An attacker retransmits yesterday's genuine crash warning, causing vehicles to reroute around a road that is now clear.",
      section: "11.6.0.14",
      page: 171,
    },
  ],
  12: [
    {
      id: "simulation-repeatability",
      chapterId: 12,
      term: "Repeatable AV simulation",
      correct:
        "Simulation can rerun identical conditions to reproduce bugs and compare software changes consistently, which is difficult in variable physical tests.",
      distractors: [
        "Repeatable simulation changes every environmental variable randomly so a failure can never be reproduced.",
        "Repeatable simulation is useful only after road deployment and cannot support early debugging.",
        "Repeatable simulation forbids hazardous or rare scenarios because they must first be staged with real people.",
      ],
      clue:
        "Controlled conditions let engineers isolate the effect of one algorithm or configuration change.",
      scenario:
        "A team reruns the same foggy nighttime sensor-fusion case before and after a firmware change and compares the two outputs.",
      section: "12.1",
      page: 177,
    },
    {
      id: "simulation-regression-testing",
      chapterId: 12,
      term: "Simulation-based regression testing",
      correct:
        "Regression testing reruns a library of previously validated scenarios to detect whether a new software or hardware change reintroduces old faults or degrades other behavior.",
      distractors: [
        "Regression testing discards all prior scenarios whenever code changes so historical behavior cannot be compared.",
        "Regression testing validates only that new features exist and ignores previously correct safety behavior.",
        "Regression testing requires uncontrolled road conditions and cannot be automated in a simulator.",
      ],
      clue:
        "It protects the established behavioral baseline across successive system versions.",
      scenario:
        "After improving nighttime object detection, automated tests rerun fog, rain, lane-merge, and obstacle-avoidance scenarios to catch unintended degradation.",
      section: "12.1",
      page: 179,
    },
    {
      id: "digital-twin",
      chapterId: 12,
      term: "Digital twin",
      correct:
        "A digital twin is a high-fidelity virtual replica synchronized with real vehicle data for monitoring, predictive diagnostics, testing, and continuous improvement.",
      distractors: [
        "A digital twin is a static drawing that never receives measurements from its physical counterpart.",
        "A digital twin replaces the physical vehicle and therefore cannot support diagnostics or maintenance predictions.",
        "A digital twin records only a route destination and excludes hardware, software, sensors, and environmental behavior.",
      ],
      clue:
        "Its virtual and physical versions form a feedback loop rather than remaining unrelated models.",
      scenario:
        "Live battery-temperature and energy-use data update a virtual vehicle model that predicts a thermal problem before it appears physically.",
      section: "12.1",
      page: 179,
    },
    {
      id: "model-in-the-loop",
      chapterId: 12,
      term: "Model-in-the-Loop (MIL)",
      correct:
        "MIL tests high-level mathematical or graphical models early, before production software and physical hardware are integrated, enabling fast design exploration and logic validation.",
      distractors: [
        "MIL requires a production ECU and real actuators in the feedback loop before an algorithm can be evaluated.",
        "MIL executes only the final compiled production stack and excludes abstract system models.",
        "MIL captures every hardware timing delay and memory-contention effect with complete physical fidelity by definition.",
      ],
      clue:
        "MATLAB/Simulink models and what-if sensitivity studies are typical of this foundational simulation stage.",
      scenario:
        "Before writing deployment code, an engineer tunes a block-diagram lane-keeping controller against a mathematical vehicle model.",
      section: "12.2",
      page: 180,
    },
    {
      id: "software-in-the-loop",
      chapterId: 12,
      term: "Software-in-the-Loop (SIL)",
      correct:
        "SIL compiles and runs actual AV production software against simulated sensors and vehicle dynamics to find implementation, integration, timing, and resource problems.",
      distractors: [
        "SIL validates only equations on paper and never executes the code intended for deployment.",
        "SIL must connect physical ECUs and actuators, so it cannot operate in a fully virtual testbed.",
        "SIL prevents stress testing, performance profiling, and automated continuous-integration runs.",
      ],
      clue:
        "It bridges abstract algorithm design and hardware deployment by exercising real code in a safe virtual environment.",
      scenario:
        "The compiled ROS 2 perception and planning stack consumes synthetic CARLA sensor streams during an automated nightly test.",
      section: "12.2",
      page: 182,
    },
    {
      id: "hardware-in-the-loop",
      chapterId: 12,
      term: "Hardware-in-the-Loop (HIL)",
      correct:
        "HIL connects real components such as ECUs, sensors, or actuators to a real-time simulated environment so electrical, protocol, timing, and physical behavior can be tested in closed loop.",
      distractors: [
        "HIL replaces every physical component with an abstract model and cannot measure actual hardware response.",
        "HIL ignores real-time timing and deliberately sends simulated signals at arbitrary intervals.",
        "HIL is limited to text-based traffic descriptions and cannot exercise control or communication interfaces.",
      ],
      clue:
        "It is the high-fidelity bridge between software-only validation and full-vehicle road testing.",
      scenario:
        "A physical braking ECU receives simulated wheel-speed and obstacle signals, returns a real brake command, and closes the loop with the virtual vehicle.",
      section: "12.2",
      page: 184,
    },
    {
      id: "hil-fault-injection",
      chapterId: 12,
      term: "HIL fault injection",
      correct:
        "HIL fault injection deliberately introduces conditions such as voltage sag, sensor dropout, corrupt CAN traffic, or actuator lag to verify detection, isolation, fallback, and recovery.",
      distractors: [
        "HIL fault injection hides abnormal conditions from the hardware so fallback behavior cannot be observed.",
        "HIL fault injection permanently damages test hardware because controlled simulated faults cannot be used.",
        "HIL fault injection measures only average fuel economy and has no role in safety or resilience testing.",
      ],
      clue:
        "Controlled anomalies expose interface and recovery weaknesses that software-only testing may miss.",
      scenario:
        "A test platform drops selected CAN messages and measures whether the real controller enters a safe degraded mode within its required deadline.",
      section: "12.2",
      page: 186,
    },
    {
      id: "scenario-based-testing",
      chapterId: 12,
      term: "Scenario-based testing",
      correct:
        "Scenario-based testing evaluates AV behavior in defined traffic and environmental contexts, using formalized, repeatable cases to assess rules, margins, transitions, and edge conditions.",
      distractors: [
        "Scenario-based testing evaluates only individual source-code functions and excludes actors, roads, weather, and vehicle behavior.",
        "Scenario-based testing requires every case to be an unstructured road drive that cannot be encoded or replayed.",
        "Scenario-based testing considers only common conditions and deliberately excludes rare safety-critical interactions.",
      ],
      clue:
        "ASAM OpenSCENARIO and OpenDRIVE help make traffic situations machine-executable, portable, and repeatable.",
      scenario:
        "A simulator evaluates whether the AV yields safely when a pedestrian emerges from behind an occluding parked vehicle at an intersection.",
      section: "12.3",
      page: 189,
    },
    {
      id: "advsim",
      chapterId: 12,
      term: "AdvSim",
      correct:
        "AdvSim perturbs surrounding-agent trajectories with search or optimization to produce plausible variations that are more likely to expose failures across the autonomy stack.",
      distractors: [
        "AdvSim validates only fixed prerecorded routes and cannot change another actor's trajectory.",
        "AdvSim generates physically impossible random scenes without preserving traffic plausibility.",
        "AdvSim is a hardware watchdog that resets an ECU after a missed deadline.",
      ],
      clue:
        "Its goal is adversarial realism: safety-critical cases discovered systematically rather than only by hand crafting.",
      scenario:
        "An optimizer slightly changes a neighboring car's plausible merge path until the variation reveals a planner blind spot.",
      section: "12.3",
      page: 189,
    },
    {
      id: "scenic-verifai",
      chapterId: 12,
      term: "SCENIC and VERIFAI",
      correct:
        "SCENIC specifies structured probabilistic scenarios, and VERIFAI explores those input spaces through sampling, falsification, and counterexample generation.",
      distractors: [
        "SCENIC and VERIFAI eliminate all scenario variation and run one deterministic road layout only.",
        "SCENIC directly controls physical brakes, while VERIFAI supplies hydraulic pressure without simulation.",
        "SCENIC and VERIFAI certify a model without searching for failures or generating test inputs.",
      ],
      clue:
        "Together they combine formal scenario description with guided exploration of high-dimensional uncertainty.",
      scenario:
        "A tester specifies probabilistic pedestrian placement and speed, then a tool searches those variations for a counterexample to a safety requirement.",
      section: "12.3",
      page: 190,
    },
    {
      id: "monte-carlo-testing",
      chapterId: 12,
      term: "Monte Carlo AV testing",
      correct:
        "Monte Carlo testing repeats scenarios with randomized variables to estimate statistical performance and failure probability over many trials.",
      distractors: [
        "Monte Carlo testing evaluates one fixed case once and cannot support probability estimates.",
        "Monte Carlo testing changes no actor, weather, timing, or environmental parameter between runs.",
        "Monte Carlo testing proves zero risk whenever the first simulated drive completes successfully.",
      ],
      clue:
        "Pedestrian timing, weather, and other inputs are sampled repeatedly rather than held to one value.",
      scenario:
        "A crossing scenario runs thousands of times with randomized pedestrian arrival and road friction to estimate how often the AV violates a safety margin.",
      section: "12.3",
      page: 191,
    },
    {
      id: "importance-sampling",
      chapterId: 12,
      term: "Importance sampling for AV testing",
      correct:
        "Importance sampling biases scenario generation toward rare, high-impact events so failure risk can be estimated more efficiently than with ordinary natural-frequency sampling.",
      distractors: [
        "Importance sampling removes rare events from the test distribution so only routine driving is evaluated.",
        "Importance sampling treats every scenario as equally informative and never changes the sampling distribution.",
        "Importance sampling replaces statistical evaluation with a single hand-picked demonstration and no probability correction.",
      ],
      clue:
        "It increases how often informative high-risk conditions appear during accelerated testing.",
      scenario:
        "A simulator intentionally samples near-miss merge timings more often than they occur naturally, then accounts for that bias when estimating risk.",
      section: "12.3",
      page: 191,
    },
  ],
  13: [
    {
      id: "chapter-av-maturity",
      chapterId: 13,
      term: "AV industry maturity described in Chapter 13",
      correct:
        "According to Chapter 13, no commercially available vehicle had achieved SAE Level 5, and most AV operation remained limited by conditions, geofences, human oversight, or pre-mapped environments.",
      distractors: [
        "According to Chapter 13, commercially available Level 5 vehicles already operated in every environment without restrictions or oversight.",
        "According to Chapter 13, the AV sector had ended testing because perception, validation, and regulation were fully solved.",
        "According to Chapter 13, autonomous driving involved only traditional automakers and no technology firms, startups, or public agencies.",
      ],
      clue:
        "The chapter presents full autonomy as an unsolved commercial goal and emphasizes limited operational contexts.",
      scenario:
        "A student summarizes the chapter's industry snapshot by distinguishing geofenced or supervised deployments from unrestricted Level 5 operation.",
      section: "13.1",
      page: 195,
    },
    {
      id: "tesla-chapter-strategy",
      chapterId: 13,
      term: "Tesla strategy described in Chapter 13",
      correct:
        "According to Chapter 13, Tesla emphasized camera-based vision and neural networks, fleet data, and over-the-air iteration while its FSD features still required active human supervision.",
      distractors: [
        "According to Chapter 13, Tesla used only LiDAR in tightly geofenced robotaxis and prohibited software updates after sale.",
        "According to Chapter 13, Tesla avoided real-world fleet data and trained its driving system exclusively from hand-written traffic rules.",
        "According to Chapter 13, Tesla's consumer vehicles were described as unrestricted Level 5 systems requiring no driver attention.",
      ],
      clue:
        "The chapter contrasts affordable, scalable vision and rapid fleet learning with sensor-redundancy, edge-case, and supervision concerns.",
      scenario:
        "In a chapter-based comparison, a company distributes incremental driving features to customer cars, learns from fleet data, and updates models over the air.",
      section: "13.2",
      page: 196,
    },
    {
      id: "waymo-chapter-strategy",
      chapterId: 13,
      term: "Waymo strategy described in Chapter 13",
      correct:
        "According to Chapter 13, Waymo combined LiDAR, radar, and cameras for robotaxi operation in carefully mapped geofenced areas, prioritizing redundancy and validation over rapid geographic scale.",
      distractors: [
        "According to Chapter 13, Waymo relied on a camera-only consumer-assistance system deployed without geographic operating limits.",
        "According to Chapter 13, Waymo avoided maps, sensor redundancy, and controlled operating areas to minimize validation effort.",
        "According to Chapter 13, Waymo focused on selling manual-transmission vehicles with no ride-hailing objective.",
      ],
      clue:
        "The approach described in the chapter offers robust multimodal perception but incurs hardware cost and expansion constraints.",
      scenario:
        "In the chapter's deployment comparison, a robotaxi service adds a new city only after detailed mapping and validation of a defined operating zone.",
      section: "13.2",
      page: 196,
    },
    {
      id: "baidu-apollo-chapter",
      chapterId: 13,
      term: "Baidu Apollo model described in Chapter 13",
      correct:
        "According to Chapter 13, Baidu used the open-source Apollo platform and partnerships with automakers, supported by Chinese government pilots, to act as both AV developer and technology enabler.",
      distractors: [
        "According to Chapter 13, Baidu prohibited automaker collaboration and limited its work to one closed proprietary vehicle model.",
        "According to Chapter 13, Baidu received no infrastructure or regulatory support and rejected public pilot programs.",
        "According to Chapter 13, Apollo was a mechanical brake component with no software platform or integration role.",
      ],
      clue:
        "The chapter describes a collaborative platform strategy rather than a focus solely on proprietary vehicles.",
      scenario:
        "A chapter case study shows multiple vehicle manufacturers building on one shared autonomous-driving software platform within government-backed pilots.",
      section: "13.2",
      page: 197,
    },
    {
      id: "zoox-chapter-vehicle",
      chapterId: 13,
      term: "Zoox vehicle concept described in Chapter 13",
      correct:
        "According to Chapter 13, Zoox pursued a purpose-built, fully autonomous, bidirectional ride-sharing vehicle with a symmetrical cabin, no traditional front or back, and no driver controls.",
      distractors: [
        "According to Chapter 13, Zoox added a removable camera kit to conventional private cars while preserving the steering wheel and driver seat.",
        "According to Chapter 13, Zoox designed a one-direction freight locomotive that could not carry ride-sharing passengers.",
        "According to Chapter 13, Zoox avoided new vehicle architecture and relied entirely on retrofitting legacy hydraulic controls.",
      ],
      clue:
        "The chapter links this ground-up architecture to optimized passenger space and sensor placement, but also to manufacturing and regulatory difficulty.",
      scenario:
        "A design described in the chapter carries passengers in a symmetrical cabin and can move equally well in either direction without turning around.",
      section: "13.2",
      page: 197,
    },
    {
      id: "cruise-chapter-case",
      chapterId: 13,
      term: "Cruise case described in Chapter 13",
      correct:
        "According to Chapter 13, a serious 2023 pedestrian incident, reporting concerns, and regulatory action led Cruise to pause autonomous operations and reassess safety and leadership.",
      distractors: [
        "According to Chapter 13, Cruise completed an unrestricted global Level 5 rollout in 2023 with no regulatory scrutiny.",
        "According to Chapter 13, Cruise left autonomous driving because its only product was an open-source mapping library with no vehicles.",
        "According to Chapter 13, the Cruise case demonstrated that aggressive deployment removes the need for transparent incident reporting and safety validation.",
      ],
      clue:
        "The chapter uses this episode to illustrate the tension among rapid innovation, public safety, transparency, and regulation.",
      scenario:
        "A student reviewing the chapter notes that an urban robotaxi operator halted operations after a pedestrian incident exposed safety and reporting concerns.",
      section: "13.2",
      page: 198,
    },
    {
      id: "argo-ai-chapter-case",
      chapterId: 13,
      term: "Argo AI case described in Chapter 13",
      correct:
        "According to Chapter 13, Argo AI shut down in 2022 after strategic, financial, commercialization, regulatory, and cost pressures led Ford and Volkswagen to redirect resources.",
      distractors: [
        "According to Chapter 13, Argo AI became profitable in 2022 and expanded unrestricted robotaxis to every major market.",
        "According to Chapter 13, Argo AI shut down because autonomous navigation had become inexpensive, immediately certifiable, and free of competition.",
        "According to Chapter 13, Ford and Volkswagen increased external funding after deciding that commercialization had no remaining uncertainty.",
      ],
      clue:
        "The chapter presents the shutdown as evidence that moving from prototype to viable product is technically and economically difficult.",
      scenario:
        "In a chapter discussion, investors lose confidence in a venture's path to profitability despite strong sponsors and promising technical work.",
      section: "13.2",
      page: 198,
    },
    {
      id: "consumer-first-deployment",
      chapterId: 13,
      term: "Consumer-first incremental deployment",
      correct:
        "According to Chapter 13, incremental consumer deployment enables rapid data collection, software iteration, and monetization, but can create overreliance, supervision confusion, and public-road safety concerns.",
      distractors: [
        "According to Chapter 13, incremental deployment waits for validated Level 5 autonomy before any customer can receive an assisted-driving feature.",
        "According to Chapter 13, consumer-first deployment gathers no real-world data and cannot use over-the-air software updates.",
        "According to Chapter 13, incremental features eliminate the need to communicate system limits because users cannot misunderstand automation.",
      ],
      clue:
        "The chapter treats speed and scalability as benefits while warning that partially autonomous products still depend on vigilant humans.",
      scenario:
        "A company described in the chapter releases supervised features in stages to a large customer fleet and learns from their operation before full autonomy exists.",
      section: "13.3",
      page: 199,
    },
    {
      id: "geofenced-robotaxi-tradeoff",
      chapterId: 13,
      term: "Geofenced robotaxi trade-off",
      correct:
        "According to Chapter 13, detailed maps, defined zones, and controlled operating conditions can improve robotaxi safety and validation but make expansion costly, slow, and geographically limited.",
      distractors: [
        "According to Chapter 13, geofencing guarantees instant worldwide scalability because no new city requires mapping or validation.",
        "According to Chapter 13, geofenced operation removes all environmental constraints and works equally in every unmapped region.",
        "According to Chapter 13, a geofenced robotaxi cannot use redundant sensors or monitor its defined operating area.",
      ],
      clue:
        "The same operational boundaries that reduce uncertainty also restrict flexibility and market expansion.",
      scenario:
        "A service described in the chapter performs reliably inside one mapped district but must invest heavily before operating in a changing, unfamiliar city.",
      section: "13.3",
      page: 199,
    },
    {
      id: "scaling-barriers",
      chapterId: 13,
      term: "AV scaling barriers in Chapter 13",
      correct:
        "According to Chapter 13, fragmented regulation and liability, public trust, changing map and infrastructure needs, and high sensor, compute, and validation costs impede widespread AV adoption.",
      distractors: [
        "According to Chapter 13, one uniform global liability law and universally ready infrastructure had removed deployment uncertainty.",
        "According to Chapter 13, public trust is unrelated to accidents, transparency, or communication about current system limits.",
        "According to Chapter 13, AV development requires little capital because sensors, computation, mapping, and validation are negligible costs.",
      ],
      clue:
        "The chapter describes barriers that are legal, social, infrastructural, and economic rather than purely algorithmic.",
      scenario:
        "A deployment plan stalls because each jurisdiction has different rules, maps need constant updates, public confidence is low, and the validation budget is large.",
      section: "13.4",
      page: 200,
    },
    {
      id: "human-centered-deployment",
      chapterId: 13,
      term: "Human-centered AV deployment",
      correct:
        "According to Chapter 13, accessibility, predictable motion, multimodal interfaces, rider comfort, and community co-design must be core performance requirements rather than afterthoughts.",
      distractors: [
        "According to Chapter 13, throughput is the only meaningful deployment metric and accessibility can be postponed indefinitely.",
        "According to Chapter 13, users with physical, cognitive, or sensory disabilities need no changes to vehicle layout or interaction design.",
        "According to Chapter 13, internal technical metrics always reveal every community need, so stakeholder workshops add no value.",
      ],
      clue:
        "A shuttle case in the chapter shows that ramps, seating, audio, visual, and tactile cues can be prerequisites for successful service.",
      scenario:
        "Older adults and riders with disabilities help redesign a shuttle's route, prompts, pauses, seating, and boarding features before wider deployment.",
      section: "13.5",
      page: 200,
    },
    {
      id: "future-vehicle-computing",
      chapterId: 13,
      term: "Future vehicle computing described in Chapter 13",
      correct:
        "According to Chapter 13, future AV platforms will co-design computation, communication, and control across heterogeneous onboard, edge, and cloud resources while preserving real-time safety and isolation.",
      distractors: [
        "According to Chapter 13, future AVs will return to isolated fixed-function processors with no workload coordination or network interaction.",
        "According to Chapter 13, real-time scheduling will become unnecessary because pedestrian detection and braking have no timing bounds.",
        "According to Chapter 13, external edge services must share unrestricted memory with safety-critical control so isolation can be eliminated.",
      ],
      clue:
        "The chapter treats the vehicle as a mobile edge node with dynamic workloads and standardized hardware abstractions.",
      scenario:
        "A platform moves suitable work among onboard accelerators and nearby edge infrastructure while a latency-aware scheduler protects emergency-braking deadlines.",
      section: "13.6",
      page: 201,
    },
  ],
  14: [
    {
      id: "vehicle-computing-paradigm",
      chapterId: 14,
      term: "Vehicle Computing (VC) paradigm",
      correct:
        "The VC paradigm treats a vehicle as a computationally capable mobile platform that performs local real-time intelligence while collaborating with peer vehicles and edge infrastructure.",
      distractors: [
        "The VC paradigm treats a vehicle only as a passive transport mechanism that cannot process data or communicate externally.",
        "The VC paradigm requires every sensor byte and control decision to wait for a distant cloud server before the vehicle can act.",
        "The VC paradigm removes onboard sensing, storage, and computation so the vehicle contains only mechanical hardware.",
      ],
      clue:
        "Localized autonomy and coordinated participation in a broader cyber-physical ecosystem are both central to this vision.",
      scenario:
        "A vehicle performs onboard perception and planning yet also exchanges useful information and workload results with nearby vehicles and roadside edge nodes.",
      section: "14.1",
      page: 204,
    },
    {
      id: "decoupled-vc-architecture",
      chapterId: 14,
      term: "Decoupled vehicle-computing architecture",
      correct:
        "Unlike a tightly coupled vertical control flow, the VC architecture uses a vehicle programming interface to share data bidirectionally and expose programmable functions to multiple application layers.",
      distractors: [
        "A decoupled VC architecture hard-wires each sensor to one actuator and prevents any application from using shared vehicle data.",
        "A decoupled VC architecture permits only a single closed-loop controller and excludes system or third-party services.",
        "A decoupled VC architecture removes the interface layer so applications must manipulate undocumented hardware signals directly.",
      ],
      clue:
        "Figure 14.1 contrasts this modular, service-oriented design with a closed, vertically integrated traditional architecture.",
      scenario:
        "ADAS, system software, and approved third-party services access standardized vehicle functions through one programming interface instead of custom hardware links.",
      section: "14.1",
      page: 204,
    },
    {
      id: "access-principle",
      chapterId: 14,
      term: "ACCESS principle",
      correct:
        "ACCESS frames vehicle computing around five dynamic capabilities: computation, communication, energy, sensing, and storage.",
      distractors: [
        "ACCESS contains only acceleration, cabin comfort, engine speed, steering, and suspension.",
        "ACCESS is a security rule that disables communication, sensing, and storage whenever the vehicle moves.",
        "ACCESS describes five cloud-only services that cannot be implemented inside a vehicle.",
      ],
      clue:
        "Figure 14.2 presents the vehicle as a platform whose internal design integrates these five functional domains.",
      scenario:
        "A system architect reviews onboard processors, V2X radios, electric power interaction, environmental sensors, and data drives as one integrated platform.",
      section: "14.1",
      page: 204,
    },
    {
      id: "access-computation",
      chapterId: 14,
      term: "ACCESS computation capability",
      correct:
        "Computation in ACCESS includes high-throughput processors such as GPUs, NPUs, and FPGAs that support onboard inference, sensor fusion, and planning.",
      distractors: [
        "ACCESS computation is limited to a mechanical odometer and cannot execute perception or planning algorithms.",
        "ACCESS computation requires all inference to occur offline after a trip and cannot support real-time decisions.",
        "ACCESS computation refers only to the energy sent from an electric vehicle back into the power grid.",
      ],
      clue:
        "This capability extends beyond traditional ECUs and basic control units to heterogeneous accelerators.",
      scenario:
        "An NPU runs object detection while a GPU fuses sensor features and evaluates candidate vehicle trajectories onboard.",
      section: "14.1",
      page: 205,
    },
    {
      id: "access-communication",
      chapterId: 14,
      term: "ACCESS communication capability",
      correct:
        "Communication in ACCESS uses technologies such as DSRC, C-V2X, and 5G or 6G to exchange timely information with vehicles, infrastructure, pedestrians, and devices.",
      distractors: [
        "ACCESS communication is an internal hydraulic linkage that cannot exchange digital data outside the vehicle.",
        "ACCESS communication prohibits contact with pedestrians and infrastructure and supports cloud upload only while parked.",
        "ACCESS communication stores long-term forensic logs but provides no channel for timely information exchange.",
      ],
      clue:
        "This capability connects the mobile computing platform to the surrounding cyber-physical ecosystem.",
      scenario:
        "A vehicle receives a roadside hazard warning over C-V2X and shares its own safety message with nearby traffic.",
      section: "14.1",
      page: 205,
    },
    {
      id: "access-energy-v2g",
      chapterId: 14,
      term: "ACCESS energy and vehicle-to-grid (V2G)",
      correct:
        "The ACCESS energy capability includes V2G participation, allowing an electric vehicle to supply stored energy during grid stress or emergency response.",
      distractors: [
        "ACCESS energy permits electricity to flow only into the vehicle and rules out any interaction with power distribution.",
        "ACCESS energy refers to encrypting V2X messages and has no relation to batteries or the grid.",
        "ACCESS energy requires the vehicle to disable all transportation functions whenever it is connected to a charger.",
      ],
      clue:
        "The vehicle is treated as an active energy reservoir rather than merely a consumer at a charging station.",
      scenario:
        "During a local outage, parked electric vehicles return a controlled share of stored battery energy to support critical loads.",
      section: "14.1",
      page: 205,
    },
    {
      id: "access-sensing",
      chapterId: 14,
      term: "ACCESS sensing capability",
      correct:
        "Sensing in ACCESS combines high-fidelity tools such as LiDAR, millimeter-wave radar, and multispectrum cameras for environmental modeling and collaborative perception.",
      distractors: [
        "ACCESS sensing uses only destination text and cannot observe objects, range, weather, or road conditions.",
        "ACCESS sensing removes environmental measurements after startup so other vehicles cannot benefit from shared perception.",
        "ACCESS sensing is a scheduling policy that assigns CPU time but gathers no physical-world data.",
      ],
      clue:
        "This capability supplies the data that local and cooperative intelligence use to understand the environment.",
      scenario:
        "LiDAR depth, radar returns, and camera imagery are combined locally and selected observations are shared for cooperative perception.",
      section: "14.1",
      page: 205,
    },
    {
      id: "access-storage",
      chapterId: 14,
      term: "ACCESS storage capability",
      correct:
        "Storage in ACCESS spans low-latency buffers for immediate decisions and high-capacity drives for longitudinal data, diagnostics, forensics, and model improvement.",
      distractors: [
        "ACCESS storage keeps only one current speed value and cannot retain diagnostics, maps, or historical data.",
        "ACCESS storage is used exclusively to steer the front wheels and cannot preserve digital information.",
        "ACCESS storage intentionally delays all real-time data until the trip ends, so no decision buffer is available.",
      ],
      clue:
        "The platform needs both fast temporary access and durable capacity rather than one undifferentiated memory function.",
      scenario:
        "A short-lived sensor buffer feeds an immediate braking decision while a larger drive retains selected logs for later safety analysis.",
      section: "14.1",
      page: 205,
    },
    {
      id: "vc-ecosystem",
      chapterId: 14,
      term: "Vehicle Computing ecosystem",
      correct:
        "The VC ecosystem connects vehicles through V2X to RSUs, cellular towers, edge servers, drones, law enforcement, IoT devices, and other sensing or service nodes.",
      distractors: [
        "The VC ecosystem isolates each vehicle from roadside, edge, civic, and IoT systems to prevent all coordinated services.",
        "The VC ecosystem is confined to an engine compartment and includes no external data flow or infrastructure.",
        "The VC ecosystem permits entertainment traffic only and excludes environmental, safety, warning, and historical information.",
      ],
      clue:
        "Figure 14.3 expands the vehicle's internal platform into a coordinated city-scale cyber-physical network.",
      scenario:
        "A vehicle exchanges traffic and weather data with roadside infrastructure while receiving guidance connected to public-safety and edge services.",
      section: "14.1",
      page: 205,
    },
    {
      id: "idle-civic-computing",
      chapterId: 14,
      term: "Idle vehicle as a civic computing node",
      correct:
        "During parking or charging, a vehicle can contribute spare computation, sensing, and stored route data to HD-map updates, model refinement, environmental monitoring, or emergency communication.",
      distractors: [
        "An idle vehicle must disable every processor, sensor, radio, and storage device and therefore cannot support any auxiliary service.",
        "Civic vehicle computing requires the vehicle to abandon transportation permanently before it can process a map update.",
        "An idle vehicle contributes only mechanical braking force and cannot participate in data or public infrastructure.",
      ],
      clue:
        "The chapter describes parked vehicles as potential computational contributors rather than dormant assets.",
      scenario:
        "While charging overnight, fleet vehicles aggregate prior route observations to update an HD road map without disrupting daytime mobility.",
      section: "14.2",
      page: 206,
    },
    {
      id: "vc-open-challenges",
      chapterId: 14,
      term: "Vehicle Computing research challenges",
      correct:
        "VC requires real-time scheduling under energy limits, portable runtimes for heterogeneous hardware, low-latency mobile middleware, security and privacy, interoperability, auditability, and fair data governance.",
      distractors: [
        "VC has no unresolved engineering questions because mobile nodes always have unlimited power, bandwidth, and identical hardware.",
        "VC interoperability is achieved by preventing different vehicle makes from joining cooperative tasks.",
        "VC data governance assumes all generated data is ownerless, risk-free, and exempt from privacy or ethical constraints.",
      ],
      clue:
        "The chapter treats these issues as central requirements for realizing the paradigm, not as optional additions.",
      scenario:
        "A cross-brand cooperative service must schedule work on different accelerators, maintain latency while connections change, and enforce privacy plus auditable data ownership.",
      section: "14.2",
      page: 207,
    },
    {
      id: "sociotechnical-autonomy",
      chapterId: 14,
      term: "Autonomy as sociotechnical infrastructure",
      correct:
        "The conclusion frames autonomous driving as a multidisciplinary system whose success depends on technical integration, ethical responsibility, inclusion, policy, public engagement, resilience, and accountability.",
      distractors: [
        "The conclusion argues that autonomous driving is solely a perception benchmark and has no relationship to people, policy, infrastructure, or ethics.",
        "The conclusion says rare events, interpretability, liability, fairness, and generalization have all been resolved and need no further work.",
        "The conclusion recommends excluding affected communities because technical capability alone determines responsible deployment.",
      ],
      clue:
        "The final chapter asks readers to view autonomy as more than a closed technical system.",
      scenario:
        "Engineers, urban planners, regulators, and community members jointly evaluate an AV service for safety, accessibility, infrastructure equity, and technical performance.",
      section: "14.2",
      page: 208,
    },
  ],
};
