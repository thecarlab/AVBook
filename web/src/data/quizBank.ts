import type { QuizConcept, QuizQuestion } from "../types";

const QUESTION_COUNT = 100;

function related<T>(items: T[], index: number, offset: number): T {
  return items[(index + offset) % items.length];
}

function makeChoices(
  id: string,
  correct: string,
  distractors: readonly [string, string, string] | string[],
): QuizQuestion["choices"] {
  return [correct, ...distractors.slice(0, 3)].map((text, index) => ({
    id: `${id}-${index === 0 ? "correct" : `d${index}`}`,
    text,
  }));
}

export function buildQuestionBank(
  chapterId: number,
  concepts: QuizConcept[],
): QuizQuestion[] {
  if (concepts.length < 12) {
    throw new Error(`Chapter ${chapterId} needs at least 12 quiz concepts.`);
  }

  const questionsByVariant: QuizQuestion[][] = Array.from({ length: 9 }, () => []);

  concepts.forEach((concept, index) => {
    const next = related(concepts, index, 1);
    const second = related(concepts, index, 2);
    const third = related(concepts, index, 3);
    const termDistractors = [next.term, second.term, third.term];
    const scenarioDistractors = [next.scenario, second.scenario, third.scenario];
    const pairingDistractors = [
      `${next.term} — ${concept.distractors[0]}`,
      `${second.term} — ${concept.distractors[1]}`,
      `${third.term} — ${concept.distractors[2]}`,
    ];
    const variants: Array<{
      suffix: string;
      prompt: string;
      correct: string;
      distractors: string[];
    }> = [
      {
        suffix: "definition",
        prompt: `Which statement best describes ${concept.term}?`,
        correct: concept.correct,
        distractors: concept.distractors,
      },
      {
        suffix: "identify",
        prompt: `Which chapter concept matches this description: ${concept.clue}`,
        correct: concept.term,
        distractors: termDistractors,
      },
      {
        suffix: "scenario",
        prompt: `${concept.scenario} Which concept best explains this situation?`,
        correct: concept.term,
        distractors: termDistractors,
      },
      {
        suffix: "pairing",
        prompt: `Which pairing accurately captures the idea in this clue: ${concept.clue}`,
        correct: `${concept.term} — ${concept.correct}`,
        distractors: pairingDistractors,
      },
      {
        suffix: "notes",
        prompt: `Which sentence belongs in accurate study notes about ${concept.term}?`,
        correct: concept.correct,
        distractors: concept.distractors,
      },
      {
        suffix: "role",
        prompt: `According to this chapter, what is the primary role or meaning of ${concept.term}?`,
        correct: concept.correct,
        distractors: concept.distractors,
      },
      {
        suffix: "example",
        prompt: `Which example best illustrates ${concept.term}?`,
        correct: concept.scenario,
        distractors: scenarioDistractors,
      },
      {
        suffix: "clue",
        prompt: `A classmate writes, “${concept.clue}” Which term should label that note?`,
        correct: concept.term,
        distractors: termDistractors,
      },
      {
        suffix: "review",
        prompt: `During a review of ${concept.term}, which statement should the class keep?`,
        correct: concept.correct,
        distractors: concept.distractors,
      },
    ];

    variants.forEach((variant, variantIndex) => {
      const id = `ch${chapterId}-${concept.id}-${variant.suffix}`;
      const choices = makeChoices(id, variant.correct, variant.distractors);
      questionsByVariant[variantIndex].push({
        id,
        chapterId,
        prompt: variant.prompt,
        choices,
        correctChoiceId: choices[0].id,
        explanation: concept.correct,
        section: concept.section,
        page: concept.page,
      });
    });
  });

  return questionsByVariant.flat().slice(0, QUESTION_COUNT);
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createQuizAttempt(
  bank: QuizQuestion[],
  count = 10,
  random = Math.random,
): QuizQuestion[] {
  return shuffle(bank, random)
    .slice(0, count)
    .map((question) => {
      const choices = shuffle(question.choices, random);
      return { ...question, choices };
    });
}
