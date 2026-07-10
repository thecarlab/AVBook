import { beforeAll, describe, expect, it } from "vitest";
import type { QuizQuestion, QuizStimulus } from "../types";
import { chapters } from "./chapters";
import { createQuizAttempt } from "./quizBank";
import { loadQuestionBank, QUIZ_CHAPTER_IDS } from "./questions";

const CUE_WORDS =
  /\b(always|never|only|every|automatically|guarantee(?:d|s)?|impossible|must)\b/i;
const RECALL_WRAPPERS =
  /which statement best describes|which chapter concept|according to this chapter|study notes|which term should|which concept best explains/i;

function stimulusText(stimulus: QuizStimulus | undefined): string {
  if (!stimulus) return "";
  if (stimulus.kind === "scenario") return stimulus.text;
  if (stimulus.kind === "log")
    return [stimulus.caption, ...stimulus.lines].join(" ");
  if (stimulus.kind === "table")
    return [
      stimulus.caption,
      ...stimulus.columns,
      ...stimulus.rows.flat(),
    ].join(" ");
  return `${stimulus.caption} ${stimulus.alt}`;
}

function correctChoice(question: QuizQuestion) {
  const choice = question.choices.find(
    (item) => item.id === question.correctChoiceId,
  );
  if (!choice) throw new Error(`Missing answer choice for ${question.id}`);
  return choice;
}

function seededRandom(initialSeed: number): () => number {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x1_0000_0000;
  };
}

let authoredBanks: Array<[string, QuizQuestion[]]> = [];

beforeAll(async () => {
  const banks = await Promise.all(
    QUIZ_CHAPTER_IDS.map((chapterId) => loadQuestionBank(chapterId)),
  );
  authoredBanks = banks
    .map(
      (questions, index) =>
        [String(QUIZ_CHAPTER_IDS[index]), questions] as [
          string,
          QuizQuestion[],
        ],
    )
    .filter(([, questions]) =>
      questions.every((question) => question.skill && question.caseId),
    );
});

describe("authored quiz corpus quality", () => {
  it("does not leak answers through option length or extreme cue words", () => {
    const failures: string[] = [];
    authoredBanks.forEach(([chapterId, questions]) => {
      let uniquelyLongestCorrect = 0;
      let correctCueCount = 0;
      let distractorCueCount = 0;
      let distractorCount = 0;

      questions.forEach((question) => {
        const correct = correctChoice(question);
        const distractors = question.choices.filter(
          (choice) => choice.id !== question.correctChoiceId,
        );
        if (
          correct.text.length >
          Math.max(...distractors.map((choice) => choice.text.length))
        ) {
          uniquelyLongestCorrect += 1;
        }
        if (CUE_WORDS.test(correct.text)) correctCueCount += 1;
        distractors.forEach((choice) => {
          distractorCount += 1;
          if (CUE_WORDS.test(choice.text)) distractorCueCount += 1;
        });
      });

      const longestRate = uniquelyLongestCorrect / questions.length;
      const correctCueRate = correctCueCount / questions.length;
      const distractorCueRate = distractorCueCount / distractorCount;
      const cueRateGap = Math.abs(correctCueRate - distractorCueRate);
      if (longestRate > 0.4) {
        failures.push(
          `Chapter ${chapterId}: longest-correct ${(longestRate * 100).toFixed(1)}% > 40.0%`,
        );
      }
      if (cueRateGap > 0.1) {
        failures.push(
          `Chapter ${chapterId}: cue-rate gap ${(cueRateGap * 100).toFixed(1)}pp > 10.0pp ` +
            `(correct ${(correctCueRate * 100).toFixed(1)}%, distractors ${(distractorCueRate * 100).toFixed(1)}%)`,
        );
      }
    });
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("keeps prompts and stimuli unique and free of recall wrappers", () => {
    authoredBanks.forEach(([chapterId, questions]) => {
      expect(
        new Set(
          questions.map((question) => question.prompt.trim().toLowerCase()),
        ).size,
        `Chapter ${chapterId} prompts`,
      ).toBe(100);
      expect(
        new Set(questions.map((question) => question.caseId)).size,
        `Chapter ${chapterId} cases`,
      ).toBe(20);
      questions.forEach((question) => {
        expect(question.prompt).not.toMatch(RECALL_WRAPPERS);
        expect(stimulusText(question.stimulus)).not.toMatch(RECALL_WRAPPERS);
      });
    });
  });

  it("uses opaque ids and shuffles choices without changing the answer key", () => {
    authoredBanks.forEach(([chapterId, questions]) => {
      questions.forEach((question) => {
        expect(
          question.choices.every(
            (choice) => !/correct|answer/i.test(choice.id),
          ),
        ).toBe(true);
      });

      const attempt = createQuizAttempt(
        questions,
        10,
        seededRandom(0x600d + Number(chapterId)),
      );
      const correctPositions = attempt.map((question) =>
        question.choices.findIndex(
          (choice) => choice.id === question.correctChoiceId,
        ),
      );
      expect(
        new Set(correctPositions).size,
        `Chapter ${chapterId} shuffled answer positions`,
      ).toBeGreaterThan(1);
      expect(correctPositions.every((position) => position >= 0)).toBe(true);
    });
  });

  it("uses section and page references that exist in the chapter catalog", () => {
    authoredBanks.forEach(([chapterId, questions]) => {
      const chapter = chapters.find((item) => item.id === Number(chapterId));
      expect(chapter, `Chapter ${chapterId} catalog entry`).toBeDefined();
      const validSections = new Set(
        chapter?.sections.map((section) => section.number),
      );

      questions.forEach((question) => {
        expect(
          question.references?.length,
          `${question.id} references`,
        ).toBeGreaterThan(0);
        question.references?.forEach((reference) => {
          expect(
            validSections.has(reference.section),
            `${question.id} section ${reference.section}`,
          ).toBe(true);
          expect(reference.page, `${question.id} page`).toBeGreaterThanOrEqual(
            chapter?.pageStart ?? 0,
          );
          expect(reference.page, `${question.id} page`).toBeLessThanOrEqual(
            chapter?.pageEnd ?? 0,
          );
        });
      });
    });
  });
});
