import type {
  AssessmentCase,
  ChapterAssessment,
  CognitiveSkill,
  QuizQuestion,
  QuizStimulus,
} from "../types";

const QUESTION_COUNT = 100;
const CASE_COUNT = 20;

export const COGNITIVE_SKILLS: readonly CognitiveSkill[] = [
  "application",
  "diagnosis",
  "comparison",
  "causal",
  "transfer",
];

const FORBIDDEN_RECALL_WRAPPERS = [
  /which statement best describes/i,
  /which chapter concept/i,
  /according to this chapter/i,
  /study notes/i,
  /which term should/i,
  /which concept best explains/i,
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function stimulusText(stimulus: QuizStimulus): string {
  switch (stimulus.kind) {
    case "scenario":
      return stimulus.text;
    case "table":
      return [
        stimulus.caption,
        ...stimulus.columns,
        ...stimulus.rows.flat(),
      ].join(" ");
    case "log":
      return [stimulus.caption, ...stimulus.lines].join(" ");
    case "image":
      return `${stimulus.caption} ${stimulus.alt}`;
  }
}

function validateCase(
  assessmentCase: AssessmentCase,
  assessment: ChapterAssessment,
  objectiveIds: Set<string>,
): void {
  const label = `Chapter ${assessment.chapterId}, case ${assessmentCase.id}`;
  assert(
    assessmentCase.chapterId === assessment.chapterId,
    `${label} has the wrong chapterId.`,
  );
  assert(assessmentCase.id.trim().length > 0, `${label} needs an id.`);
  assert(
    !FORBIDDEN_RECALL_WRAPPERS.some((pattern) =>
      pattern.test(stimulusText(assessmentCase.stimulus)),
    ),
    `${label}'s stimulus uses a recall-only wrapper.`,
  );

  const probeKeys = Object.keys(assessmentCase.probes);
  assert(
    probeKeys.length === COGNITIVE_SKILLS.length,
    `${label} needs exactly five probes.`,
  );

  COGNITIVE_SKILLS.forEach((skill) => {
    const probe = assessmentCase.probes[skill];
    assert(probe, `${label} is missing its ${skill} probe.`);
    assert(
      probe.skill === skill,
      `${label}'s ${skill} probe has a mismatched skill.`,
    );
    assert(
      probe.prompt.trim().length >= 20,
      `${label}'s ${skill} prompt is too short.`,
    );
    assert(
      !FORBIDDEN_RECALL_WRAPPERS.some((pattern) => pattern.test(probe.prompt)),
      `${label}'s ${skill} prompt uses a recall-only wrapper.`,
    );
    assert(
      probe.choices.length === 4,
      `${label}'s ${skill} probe needs four choices.`,
    );
    assert(
      new Set(probe.choices.map((choice) => choice.id)).size === 4,
      `${label}'s ${skill} choice ids must be unique.`,
    );
    assert(
      new Set(probe.choices.map((choice) => choice.text.trim().toLowerCase()))
        .size === 4,
      `${label}'s ${skill} choice text must be unique.`,
    );
    assert(
      probe.choices.some((choice) => choice.id === probe.correctChoiceId),
      `${label}'s ${skill} answer key does not match a choice.`,
    );
    probe.choices.forEach((choice) => {
      assert(
        choice.text.trim().length > 0,
        `${label}'s ${skill} choices cannot be empty.`,
      );
      assert(
        choice.feedback.trim().length >= 12,
        `${label}'s ${skill} choices need feedback.`,
      );
    });
    assert(
      new Set(
        probe.choices.map((choice) => choice.feedback.trim().toLowerCase()),
      ).size >= 3,
      `${label}'s ${skill} probe needs distinct misconception feedback.`,
    );
    assert(
      probe.reasoning.length > 0,
      `${label}'s ${skill} probe needs reasoning.`,
    );
    assert(
      probe.takeaway.trim().length >= 15,
      `${label}'s ${skill} probe needs a takeaway.`,
    );
    assert(
      probe.references.length > 0,
      `${label}'s ${skill} probe needs a reference.`,
    );
    probe.objectiveIds.forEach((objectiveId) => {
      assert(
        objectiveIds.has(objectiveId),
        `${label}'s ${skill} probe uses unknown objective ${objectiveId}.`,
      );
    });
  });
}

export function buildQuestionBank(
  assessment: ChapterAssessment,
): QuizQuestion[] {
  assert(
    assessment.cases.length === CASE_COUNT,
    `Chapter ${assessment.chapterId} needs exactly 20 cases.`,
  );
  assert(
    assessment.objectives.length > 0,
    `Chapter ${assessment.chapterId} needs learning objectives.`,
  );

  const objectiveIds = new Set(
    assessment.objectives.map((objective) => objective.id),
  );
  assert(
    objectiveIds.size === assessment.objectives.length,
    `Chapter ${assessment.chapterId} learning-objective ids must be unique.`,
  );
  assessment.objectives.forEach((objective) => {
    assert(
      objective.chapterId === assessment.chapterId,
      `Objective ${objective.id} has the wrong chapterId.`,
    );
    assert(
      objective.references.length > 0,
      `Objective ${objective.id} needs a chapter reference.`,
    );
  });

  const caseIds = new Set(
    assessment.cases.map((assessmentCase) => assessmentCase.id),
  );
  assert(
    caseIds.size === assessment.cases.length,
    `Chapter ${assessment.chapterId} case ids must be unique.`,
  );
  assessment.cases.forEach((assessmentCase) =>
    validateCase(assessmentCase, assessment, objectiveIds),
  );

  const bank = assessment.cases.flatMap((assessmentCase) =>
    COGNITIVE_SKILLS.map((skill) => {
      const probe = assessmentCase.probes[skill];
      const id = `ch${assessment.chapterId}-${assessmentCase.id}-${skill}`;
      const choices = probe.choices.map((choice, index) => ({
        id: `${id}-c${index + 1}`,
        text: choice.text,
        feedback: choice.feedback,
        misconception: choice.misconception,
      }));
      const correctIndex = probe.choices.findIndex(
        (choice) => choice.id === probe.correctChoiceId,
      );
      const [primaryReference] = probe.references;

      return {
        id,
        chapterId: assessment.chapterId,
        caseId: assessmentCase.id,
        skill,
        difficulty: probe.difficulty,
        objectiveIds: [...probe.objectiveIds],
        stimulus: assessmentCase.stimulus,
        prompt: probe.prompt,
        choices,
        correctChoiceId: choices[correctIndex].id,
        explanation: `${probe.reasoning.join(" ")} ${probe.takeaway}`,
        reasoning: [...probe.reasoning],
        takeaway: probe.takeaway,
        references: probe.references.map((reference) => ({ ...reference })),
        section: primaryReference.section,
        page: primaryReference.page,
      } satisfies QuizQuestion;
    }),
  );

  assert(
    bank.length === QUESTION_COUNT,
    `Chapter ${assessment.chapterId} must produce 100 questions.`,
  );
  assert(
    new Set(bank.map((question) => question.id)).size === QUESTION_COUNT,
    "Question ids must be unique.",
  );
  assert(
    new Set(bank.map((question) => question.prompt.trim().toLowerCase()))
      .size === QUESTION_COUNT,
    `Chapter ${assessment.chapterId} question prompts must be unique.`,
  );
  COGNITIVE_SKILLS.forEach((skill) => {
    assert(
      bank.filter((question) => question.skill === skill).length === CASE_COUNT,
      `Chapter ${assessment.chapterId} needs 20 ${skill} questions.`,
    );
  });

  return bank;
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function shuffleChoices(
  questions: QuizQuestion[],
  random: () => number,
): QuizQuestion[] {
  return questions.map((question) => ({
    ...question,
    choices: shuffle(question.choices, random),
  }));
}

export function createQuizAttempt(
  bank: QuizQuestion[],
  count = 10,
  random = Math.random,
): QuizQuestion[] {
  const isAuthoredBank =
    bank.length > 0 &&
    bank.every((question) => question.skill && question.caseId);
  if (!isAuthoredBank)
    return shuffleChoices(shuffle(bank, random).slice(0, count), random);

  assert(
    count === 10,
    "Authored assessment attempts contain exactly ten questions.",
  );
  const selected: QuizQuestion[] = [];
  const usedCases = new Set<string>();

  COGNITIVE_SKILLS.forEach((skill) => {
    const candidates = shuffle(
      bank.filter((question) => question.skill === skill),
      random,
    );
    const skillQuestions: QuizQuestion[] = [];
    for (const question of candidates) {
      if (!question.caseId || usedCases.has(question.caseId)) continue;
      skillQuestions.push(question);
      usedCases.add(question.caseId);
      if (skillQuestions.length === 2) break;
    }
    assert(
      skillQuestions.length === 2,
      `The bank cannot supply two unique-case ${skill} questions.`,
    );
    selected.push(...skillQuestions);
  });

  assert(
    selected.length === 10,
    "Authored attempts must contain ten questions.",
  );
  assert(
    new Set(selected.map((question) => question.caseId)).size === 10,
    "Authored attempts must use ten unique cases.",
  );
  COGNITIVE_SKILLS.forEach((skill) => {
    assert(
      selected.filter((question) => question.skill === skill).length === 2,
      `Authored attempts need two ${skill} questions.`,
    );
  });

  return shuffleChoices(shuffle(selected, random), random);
}
