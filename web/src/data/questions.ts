import type { QuizQuestion } from "../types";
import { buildQuestionBank } from "./quizBank";
import { quizConcepts1 } from "./quizConcepts1";
import { quizConcepts2 } from "./quizConcepts2";

const conceptMap = { ...quizConcepts1, ...quizConcepts2 };

export const questionBanks: Record<number, QuizQuestion[]> = Object.fromEntries(
  Array.from({ length: 14 }, (_, index) => {
    const chapterId = index + 1;
    return [chapterId, buildQuestionBank(chapterId, conceptMap[chapterId] ?? [])];
  }),
);
