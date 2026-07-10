import { describe, expect, it } from "vitest";
import { COGNITIVE_SKILLS } from "./quizBank";
import { loadQuestionBank, QUIZ_CHAPTER_IDS } from "./questions";

describe("book question banks", () => {
  it("loads 100 distinct four-choice questions for every chapter", async () => {
    const banks = await Promise.all(
      QUIZ_CHAPTER_IDS.map((chapterId) => loadQuestionBank(chapterId)),
    );

    banks.forEach((questions, index) => {
      const chapterId = QUIZ_CHAPTER_IDS[index];
      expect(questions, `Chapter ${chapterId}`).toHaveLength(100);
      expect(new Set(questions.map((question) => question.id)).size).toBe(100);
      expect(new Set(questions.map((question) => question.prompt)).size).toBe(
        100,
      );
      questions.forEach((question) => {
        expect(question.choices).toHaveLength(4);
        expect(
          new Set(question.choices.map((choice) => choice.text)).size,
        ).toBe(4);
        expect(
          question.choices.some(
            (choice) => choice.id === question.correctChoiceId,
          ),
        ).toBe(true);
        expect(question.explanation.length).toBeGreaterThan(20);
      });
    });
  });

  it("uses the authored reasoning architecture for migrated chapters", async () => {
    const authoredChapterIds = QUIZ_CHAPTER_IDS;
    const banks = await Promise.all(
      authoredChapterIds.map((chapterId) => loadQuestionBank(chapterId)),
    );

    banks.forEach((questions, index) => {
      const chapterId = authoredChapterIds[index];
      expect(new Set(questions.map((question) => question.caseId)).size).toBe(
        20,
      );
      COGNITIVE_SKILLS.forEach((skill) => {
        expect(
          questions.filter((question) => question.skill === skill),
          `Chapter ${chapterId} ${skill}`,
        ).toHaveLength(20);
      });
      questions.forEach((question) => {
        expect(question.stimulus).toBeDefined();
        expect(question.reasoning?.length).toBeGreaterThan(0);
        expect(question.objectiveIds?.length).toBeGreaterThan(0);
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
          `${question.id} feedback diversity`,
        ).toBeGreaterThanOrEqual(3);
        expect(question.prompt).not.toMatch(
          /which statement best describes|which chapter concept|according to this chapter|study notes|which term should|which concept best explains/i,
        );
      });
    });
  });

  it("rejects chapter ids outside the book", async () => {
    await expect(loadQuestionBank(0)).rejects.toThrow(/no quiz bank exists/i);
    await expect(loadQuestionBank(15)).rejects.toThrow(/no quiz bank exists/i);
  });
});
