/**
 * Client-side reading progress & streak tracking for The Playing XI.
 *
 * Everything lives in localStorage under one namespaced key:
 *
 *   playing_xi_progress = {
 *     "completedChapters": ["the-coachs-settings", "intro-to-loss"],
 *     "completedExercises": [1, 2, 3],
 *     "streak": { "count": 6, "lastActiveDate": "2026-08-06" }
 *   }
 *
 * UI components listen for the `progress-updated` CustomEvent on `window`
 * and re-render from `loadProgress()` whenever it fires. Mutations only
 * broadcast when the stored data actually changed.
 */

export const STORAGE_KEY = "playing_xi_progress";
export const PROGRESS_EVENT = "progress-updated";

/**
 * Denominator for the exercises tally in the LHN "Match situation" card.
 * Placeholder until exercise content ships.
 */
export const TOTAL_EXERCISES = 24;

export interface Streak {
  /** consecutive days with at least one visit */
  count: number;
  /** local calendar date of the last visit, YYYY-MM-DD */
  lastActiveDate: string;
}

export interface PlayingXIProgress {
  /** chapter slugs, e.g. "the-coachs-settings" */
  completedChapters: string[];
  /** exercise numbers */
  completedExercises: number[];
  streak: Streak;
}

function emptyProgress(): PlayingXIProgress {
  return {
    completedChapters: [],
    completedExercises: [],
    streak: { count: 0, lastActiveDate: "" },
  };
}

/** Format a Date as a local YYYY-MM-DD key (streaks follow local calendar days). */
function dateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

export function loadProgress(): PlayingXIProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<PlayingXIProgress> | null;
    return {
      completedChapters: Array.isArray(parsed?.completedChapters)
        ? parsed.completedChapters.filter((s): s is string => typeof s === "string")
        : [],
      completedExercises: Array.isArray(parsed?.completedExercises)
        ? parsed.completedExercises.filter((n): n is number => typeof n === "number")
        : [],
      streak: {
        count:
          typeof parsed?.streak?.count === "number" && parsed.streak.count > 0
            ? Math.floor(parsed.streak.count)
            : 0,
        lastActiveDate:
          typeof parsed?.streak?.lastActiveDate === "string"
            ? parsed.streak.lastActiveDate
            : "",
      },
    };
  } catch {
    // Corrupted JSON or storage unavailable (private mode) — start clean.
    return emptyProgress();
  }
}

function saveProgress(data: PlayingXIProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full / blocked — progress simply won't persist.
  }
}

/** Notify Header / LHN components that stored progress changed. */
function broadcast(data: PlayingXIProgress): void {
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: data }));
}

/**
 * Record a visit for the daily streak. Idempotent within a calendar day:
 * a same-day revisit changes nothing, a next-day visit increments the
 * count, and a gap longer than a day resets it to 1.
 */
export function touchStreak(): PlayingXIProgress {
  const data = loadProgress();
  const today = todayKey();
  if (data.streak.lastActiveDate === today) return data;
  data.streak.count =
    data.streak.lastActiveDate === yesterdayKey() ? data.streak.count + 1 : 1;
  data.streak.lastActiveDate = today;
  saveProgress(data);
  broadcast(data);
  return data;
}

/** Mark a chapter as read. Duplicates are never added. */
export function completeChapter(chapterId: string): PlayingXIProgress {
  const data = loadProgress();
  if (!data.completedChapters.includes(chapterId)) {
    data.completedChapters.push(chapterId);
    saveProgress(data);
    broadcast(data);
  }
  return data;
}

/** Mark an exercise as passed. Duplicates are never added. */
export function completeExercise(exercise: number): PlayingXIProgress {
  const data = loadProgress();
  if (!data.completedExercises.includes(exercise)) {
    data.completedExercises.push(exercise);
    saveProgress(data);
    broadcast(data);
  }
  return data;
}

export function isChapterComplete(chapterId: string): boolean {
  return loadProgress().completedChapters.includes(chapterId);
}

/** Wipe all stored progress (used for testing / "start over"). */
export function resetProgress(): void {
  const data = emptyProgress();
  saveProgress(data);
  broadcast(data);
}

/**
 * Base initialisation for every page: log the daily visit for the streak
 * and expose a console-friendly handle for testing and future UI.
 */
export function initProgressTracking(): void {
  touchStreak();
  (window as unknown as Record<string, unknown>).playingXI = {
    loadProgress,
    completeChapter,
    completeExercise,
    isChapterComplete,
    touchStreak,
    resetProgress,
  };
}

/**
 * Watch the `#chapter-completion-trigger` element placed at the very end of
 * a chapter page. When it scrolls into view, mark the chapter complete and
 * disconnect — the observer can only fire once per page load.
 */
export function initChapterCompletionTrigger(): void {
  const trigger = document.getElementById("chapter-completion-trigger");
  const chapterId = trigger?.dataset.chapterId;
  if (!trigger || !chapterId) return;

  if (!("IntersectionObserver" in window)) {
    // Legacy fallback: without observer support, count the chapter on load.
    completeChapter(chapterId);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      completeChapter(chapterId);
    }
  });
  observer.observe(trigger);
}
