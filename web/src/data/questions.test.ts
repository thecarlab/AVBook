import { describe, expect, it } from "vitest";
import { questionBanks } from "./questions";

describe("book question banks", () => {
  it("contains 100 distinct four-choice questions for every chapter", () => {
    expect(Object.keys(questionBanks)).toHaveLength(14);
    Object.entries(questionBanks).forEach(([chapterId, questions]) => {
      expect(questions, `Chapter ${chapterId}`).toHaveLength(100);
      expect(new Set(questions.map((question) => question.id)).size).toBe(100);
      expect(new Set(questions.map((question) => question.prompt)).size).toBe(100);
      questions.forEach((question) => {
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices.map((choice) => choice.text)).size).toBe(4);
        expect(question.choices.some((choice) => choice.id === question.correctChoiceId)).toBe(true);
        expect(question.explanation.length).toBeGreaterThan(20);
      });
    });
  });
});
