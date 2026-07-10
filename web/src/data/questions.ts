import type { QuizQuestion } from "../types";
import { buildQuestionBank } from "./quizBank";

export const QUIZ_CHAPTER_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
] as const;

type QuizChapterId = (typeof QUIZ_CHAPTER_IDS)[number];
type QuestionBankLoader = () => Promise<QuizQuestion[]>;

const bankLoaders: Record<QuizChapterId, QuestionBankLoader> = {
  1: () =>
    import("./quizCases1").then(({ chapter1Assessment }) =>
      buildQuestionBank(chapter1Assessment),
    ),
  2: () =>
    import("./quizCases2").then(({ chapter2Assessment }) =>
      buildQuestionBank(chapter2Assessment),
    ),
  3: () =>
    import("./quizCases3").then(({ chapter3Assessment }) =>
      buildQuestionBank(chapter3Assessment),
    ),
  4: () =>
    import("./quizCases4").then(({ chapter4Assessment }) =>
      buildQuestionBank(chapter4Assessment),
    ),
  5: () =>
    import("./quizCases5").then(({ chapter5Assessment }) =>
      buildQuestionBank(chapter5Assessment),
    ),
  6: () =>
    import("./quizCases6").then(({ chapter6Assessment }) =>
      buildQuestionBank(chapter6Assessment),
    ),
  7: () =>
    import("./quizCases7").then(({ chapter7Assessment }) =>
      buildQuestionBank(chapter7Assessment),
    ),
  8: () =>
    import("./quizCases8").then(({ chapter8Assessment }) =>
      buildQuestionBank(chapter8Assessment),
    ),
  9: () =>
    import("./quizCases9").then(({ chapter9Assessment }) =>
      buildQuestionBank(chapter9Assessment),
    ),
  10: () =>
    import("./quizCases10").then(({ chapter10Assessment }) =>
      buildQuestionBank(chapter10Assessment),
    ),
  11: () =>
    import("./quizCases11").then(({ chapter11Assessment }) =>
      buildQuestionBank(chapter11Assessment),
    ),
  12: () =>
    import("./quizCases12").then(({ chapter12Assessment }) =>
      buildQuestionBank(chapter12Assessment),
    ),
  13: () =>
    import("./quizCases13").then(({ chapter13Assessment }) =>
      buildQuestionBank(chapter13Assessment),
    ),
  14: () =>
    import("./quizCases14").then(({ chapter14Assessment }) =>
      buildQuestionBank(chapter14Assessment),
    ),
};

const bankCache = new Map<QuizChapterId, Promise<QuizQuestion[]>>();

function isQuizChapterId(chapterId: number): chapterId is QuizChapterId {
  return QUIZ_CHAPTER_IDS.includes(chapterId as QuizChapterId);
}

/** Load and validate one chapter bank without placing every chapter in the initial bundle. */
export function loadQuestionBank(chapterId: number): Promise<QuizQuestion[]> {
  if (!isQuizChapterId(chapterId)) {
    return Promise.reject(
      new RangeError(`No quiz bank exists for Chapter ${chapterId}.`),
    );
  }

  const cached = bankCache.get(chapterId);
  if (cached) return cached;

  const pending = bankLoaders[chapterId]().catch((error: unknown) => {
    bankCache.delete(chapterId);
    throw error;
  });
  bankCache.set(chapterId, pending);
  return pending;
}
