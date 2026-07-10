import { describe, expect, it } from "vitest";
import type { QuizConcept, QuizQuestion } from "../types";
import { buildQuestionBank, createQuizAttempt } from "./quizBank";

const concepts: QuizConcept[] = Array.from({ length: 12 }, (_, index) => ({
  id: `concept-${index}`,
  chapterId: 1,
  term: `Term ${index}`,
  correct: `Correct statement ${index}`,
  distractors: [
    `Distractor A ${index}`,
    `Distractor B ${index}`,
    `Distractor C ${index}`,
  ],
  clue: `Clue ${index}.`,
  scenario: `Scenario ${index}.`,
  section: "1.1",
  page: 2,
}));

describe("quiz bank", () => {
  it("builds exactly 100 unique questions", () => {
    const bank = buildQuestionBank(1, concepts);
    expect(bank).toHaveLength(100);
    expect(new Set(bank.map((question) => question.id)).size).toBe(100);
    expect(new Set(bank.map((question) => question.prompt)).size).toBe(100);
    expect(bank.every((question) => question.choices.length === 4)).toBe(true);
  });

  it("selects ten unique questions and preserves the correct answer", () => {
    const bank = buildQuestionBank(1, concepts);
    const randomValues = [0.17, 0.82, 0.43, 0.61, 0.09];
    let index = 0;
    const attempt = createQuizAttempt(bank, 10, () => {
      const value = randomValues[index % randomValues.length];
      index += 1;
      return value;
    });

    expect(attempt).toHaveLength(10);
    expect(new Set(attempt.map((question) => question.id)).size).toBe(10);
    attempt.forEach((question: QuizQuestion) => {
      expect(question.choices.some((choice) => choice.id === question.correctChoiceId)).toBe(true);
    });
  });
});
