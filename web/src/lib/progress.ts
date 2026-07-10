export interface CourseProgress {
  completed: number[];
  bestScores: Record<number, number>;
  lastChapter: number;
}

const STORAGE_KEY = "autonomous-driving-lab-progress-v1";
const EMPTY_PROGRESS: CourseProgress = {
  completed: [],
  bestScores: {},
  lastChapter: 1,
};

export function readProgress(): CourseProgress {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_PROGRESS;
    const parsed = JSON.parse(stored) as Partial<CourseProgress>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      bestScores: parsed.bestScores ?? {},
      lastChapter: parsed.lastChapter ?? 1,
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function rememberChapter(chapterId: number): void {
  const progress = readProgress();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...progress, lastChapter: chapterId }),
  );
}

export function completeChapter(chapterId: number, score: number): void {
  const progress = readProgress();
  const completed = Array.from(new Set([...progress.completed, chapterId]));
  const bestScores = {
    ...progress.bestScores,
    [chapterId]: Math.max(progress.bestScores[chapterId] ?? 0, score),
  };
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ completed, bestScores, lastChapter: chapterId }),
  );
  window.dispatchEvent(new CustomEvent("course-progress"));
}
