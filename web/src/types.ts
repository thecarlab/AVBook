export type DemoKind =
  | "sorter"
  | "timeline"
  | "flow"
  | "scenario"
  | "compare"
  | "calibration"
  | "network"
  | "threshold"
  | "tracking"
  | "transform"
  | "registration"
  | "fusion"
  | "planner"
  | "trajectory"
  | "control"
  | "budget"
  | "queue"
  | "tradeoff"
  | "futures"
  | "threats"
  | "testing"
  | "coverage"
  | "architecture"
  | "offload";

export interface DemoDefinition {
  id: string;
  kind: DemoKind;
  title: string;
  description: string;
  accent: "lime" | "cyan" | "coral";
  config: Record<string, unknown>;
}

export interface ChapterSection {
  number: string;
  title: string;
  page: number;
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

export interface QuizConcept {
  id: string;
  chapterId: number;
  term: string;
  correct: string;
  distractors: [string, string, string];
  clue: string;
  scenario: string;
  section: string;
  page: number;
}

export interface QuizChoice {
  id: string;
  text: string;
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
}

export interface QuizAnswer {
  questionId: string;
  choiceId: string;
}
