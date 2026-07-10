import { describe, expect, it } from "vitest";
import type { ChapterAssessment, QuizQuestion } from "../types";
import { chapter1Assessment } from "./quizCases1";
import {
  buildQuestionBank,
  COGNITIVE_SKILLS,
  createQuizAttempt,
} from "./quizBank";

function seededRandom(initialSeed = 0x5eed1234): () => number {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
}

describe("authored assessment bank", () => {
  it("builds exactly 100 questions balanced across five reasoning skills", () => {
    const bank = buildQuestionBank(chapter1Assessment);

    expect(bank).toHaveLength(100);
    expect(new Set(bank.map((question) => question.id)).size).toBe(100);
    expect(new Set(bank.map((question) => question.prompt)).size).toBe(100);
    expect(new Set(bank.map((question) => question.caseId)).size).toBe(20);

    COGNITIVE_SKILLS.forEach((skill) => {
      expect(
        bank.filter((question) => question.skill === skill),
        skill,
      ).toHaveLength(20);
    });

    bank.forEach((question) => {
      expect(question.choices).toHaveLength(4);
      expect(question.stimulus).toBeDefined();
      expect(question.objectiveIds?.length).toBeGreaterThan(0);
      expect(question.reasoning?.length).toBeGreaterThan(0);
      expect(question.takeaway?.length).toBeGreaterThan(15);
      expect(question.references?.length).toBeGreaterThan(0);
      expect(
        question.choices.every(
          (choice) => choice.feedback && choice.feedback.length >= 12,
        ),
      ).toBe(true);
      expect(
        new Set(
          question.choices.map((choice) =>
            choice.feedback?.trim().toLowerCase(),
          ),
        ).size,
      ).toBeGreaterThanOrEqual(3);
      expect(
        question.choices.some(
          (choice) => choice.id === question.correctChoiceId,
        ),
      ).toBe(true);
      expect(question.correctChoiceId).not.toMatch(/correct|answer/i);
    });
  });

  it("selects two questions per skill without repeating a case", () => {
    const bank = buildQuestionBank(chapter1Assessment);
    const attempt = createQuizAttempt(bank, 10, seededRandom());

    expect(attempt).toHaveLength(10);
    expect(new Set(attempt.map((question) => question.id)).size).toBe(10);
    expect(new Set(attempt.map((question) => question.caseId)).size).toBe(10);
    COGNITIVE_SKILLS.forEach((skill) => {
      expect(
        attempt.filter((question) => question.skill === skill),
        skill,
      ).toHaveLength(2);
    });
    attempt.forEach((question: QuizQuestion) => {
      expect(
        question.choices.some(
          (choice) => choice.id === question.correctChoiceId,
        ),
      ).toBe(true);
    });
  });

  it("rejects incomplete case collections", () => {
    const incomplete: ChapterAssessment = {
      ...chapter1Assessment,
      cases: chapter1Assessment.cases.slice(0, 19),
    };

    expect(() => buildQuestionBank(incomplete)).toThrow(/exactly 20 cases/i);
  });

  it("retains the structured stimulus instead of flattening it into the prompt", () => {
    const [question] = buildQuestionBank(chapter1Assessment);
    const assessmentCase = chapter1Assessment.cases.find(
      (item) => item.id === question.caseId,
    );

    expect(question.stimulus).toEqual(assessmentCase?.stimulus);
    expect(question.prompt).not.toContain(
      "A highway feature controls speed and steering",
    );
  });
});
