export type DemoKind =
  | "comma-sensor-evidence"
  | "tampa-bsm-evidence"
  | "comma-localization-evidence"
  | "comma-control-alignment"
  | "comma-timing-audit"
  | "road-can-evidence"
  | "nhtsa-safety-evidence"
  | "cassi-deployment-evidence";

export interface DemoDefinition {
  id: string;
  kind: DemoKind;
  title: string;
  description: string;
  accent: "lime" | "cyan" | "coral";
}

export interface ChapterSection {
  number: string;
  title: string;
  page: number;
  summary?: string;
}

export interface Chapter {
  id: number;
  title: string;
  shortTitle: string;
  summary: string;
  pageStart: number;
  pageEnd: number;
  sections: ChapterSection[];
  demos: DemoDefinition[];
}

export type CognitiveSkill =
  "application" | "diagnosis" | "comparison" | "causal" | "transfer";

export type QuizDifficulty = "foundational" | "intermediate" | "advanced";

export interface ChapterReference {
  section: string;
  page: number;
}

export interface LearningObjective {
  id: string;
  chapterId: number;
  behavior: string;
  priority: "core" | "supporting";
  references: [ChapterReference, ...ChapterReference[]];
}

export type QuizStimulus =
  | { kind: "scenario"; text: string }
  | {
      kind: "table";
      caption: string;
      columns: string[];
      rows: Array<Array<string | number>>;
    }
  | { kind: "log"; caption: string; lines: string[] }
  | { kind: "image"; src: string; alt: string; caption: string };

export type AssessmentChoiceId = "a" | "b" | "c" | "d";

export interface AssessmentChoice {
  id: AssessmentChoiceId;
  text: string;
  feedback: string;
  misconception?: string;
}

export interface AssessmentProbe {
  skill: CognitiveSkill;
  difficulty: QuizDifficulty;
  prompt: string;
  objectiveIds: [string, ...string[]];
  choices: [
    AssessmentChoice,
    AssessmentChoice,
    AssessmentChoice,
    AssessmentChoice,
  ];
  correctChoiceId: AssessmentChoiceId;
  reasoning: [string, ...string[]];
  takeaway: string;
  references: [ChapterReference, ...ChapterReference[]];
}

export interface AssessmentCase {
  id: string;
  chapterId: number;
  stimulus: QuizStimulus;
  probes: Record<CognitiveSkill, AssessmentProbe>;
}

export interface ChapterAssessment {
  chapterId: number;
  objectives: LearningObjective[];
  cases: AssessmentCase[];
}

export interface QuizChoice {
  id: string;
  text: string;
  feedback?: string;
  misconception?: string;
}

export interface QuizQuestion {
  id: string;
  chapterId: number;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
  section: string;
  page: number;
  caseId?: string;
  skill?: CognitiveSkill;
  difficulty?: QuizDifficulty;
  objectiveIds?: string[];
  stimulus?: QuizStimulus;
  reasoning?: string[];
  takeaway?: string;
  references?: ChapterReference[];
}

export interface QuizAnswer {
  questionId: string;
  choiceId: string;
}
