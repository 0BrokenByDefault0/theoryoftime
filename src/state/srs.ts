/**
 * Spaced repetition.
 *
 * Music theory is a vocabulary problem as much as a reasoning problem — you
 * cannot analyse a progression if naming a m7♭5 takes ten seconds. An SM-2
 * style scheduler keeps that vocabulary alive with a few minutes a day instead
 * of a cram session that evaporates in a week.
 */

export interface ReviewItem {
  id: string;
  /** What kind of thing this is, so review sessions can be themed. */
  category: string;
  /** Ease factor. Starts at 2.5 and drifts with performance. */
  ease: number;
  /** Days until the next review. */
  interval: number;
  /** Consecutive successful reviews. Resets to 0 on a lapse. */
  repetitions: number;
  /** Epoch millis when this is next due. */
  due: number;
  /** Total times seen, including lapses. */
  seen: number;
  lapses: number;
  lastReviewed: number;
}

/** How well the learner did, in the SM-2 sense. */
export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export const GRADE_AGAIN: Grade = 1;
export const GRADE_HARD: Grade = 3;
export const GRADE_GOOD: Grade = 4;
export const GRADE_EASY: Grade = 5;

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

export function createReviewItem(id: string, category: string, now = Date.now()): ReviewItem {
  return {
    id,
    category,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    due: now,
    seen: 0,
    lapses: 0,
    lastReviewed: 0,
  };
}

/**
 * Advance an item after a review.
 *
 * A grade below 3 is a lapse: the item goes back to the start of the ladder and
 * comes round again in the same session, because forgetting is exactly when
 * repetition is worth most.
 */
export function reviewItem(item: ReviewItem, grade: Grade, now = Date.now()): ReviewItem {
  const seen = item.seen + 1;

  if (grade < 3) {
    return {
      ...item,
      // Only the ease penalty carries forward; the interval restarts.
      ease: Math.max(MIN_EASE, item.ease - 0.2),
      interval: 0,
      repetitions: 0,
      due: now + 60 * 1000,
      seen,
      lapses: item.lapses + 1,
      lastReviewed: now,
    };
  }

  const repetitions = item.repetitions + 1;
  const ease = Math.max(
    MIN_EASE,
    item.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
  );

  const interval =
    repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(item.interval * ease);

  return {
    ...item,
    ease,
    interval,
    repetitions,
    due: now + interval * DAY_MS,
    seen,
    lapses: item.lapses,
    lastReviewed: now,
  };
}

/** Items due now, hardest first so the session front-loads the weak material. */
export function dueItems(items: Record<string, ReviewItem>, now = Date.now(), limit = 30): ReviewItem[] {
  return Object.values(items)
    .filter((item) => item.due <= now)
    .sort((a, b) => a.ease - b.ease || a.due - b.due)
    .slice(0, limit);
}

export function dueCount(items: Record<string, ReviewItem>, now = Date.now()): number {
  return Object.values(items).filter((item) => item.due <= now).length;
}

/**
 * Rough recall probability, used to colour mastery meters. Derived from how
 * far past (or before) the due date we are relative to the interval.
 */
export function retention(item: ReviewItem, now = Date.now()): number {
  if (item.repetitions === 0) return 0;
  const elapsed = (now - item.lastReviewed) / DAY_MS;
  const strength = Math.max(1, item.interval);
  return Math.max(0, Math.min(1, Math.exp(-elapsed / (strength * 1.6))));
}

/** Average retention across a category — the "how solid am I" number. */
export function categoryMastery(
  items: Record<string, ReviewItem>,
  category: string,
  now = Date.now(),
): number {
  const relevant = Object.values(items).filter((i) => i.category === category);
  if (!relevant.length) return 0;
  const total = relevant.reduce((sum, item) => {
    // An item that has never lapsed and has a long interval counts as learned
    // even if it is not due; retention alone would understate that.
    const learned = Math.min(1, item.repetitions / 4);
    return sum + Math.max(retention(item, now), learned * 0.85);
  }, 0);
  return total / relevant.length;
}

export const DAY_IN_MS = DAY_MS;
