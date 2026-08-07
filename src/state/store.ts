/**
 * Persisted application state.
 *
 * One store, persisted to AsyncStorage, holding progress, settings and the
 * spaced-repetition schedule. Everything the learner has earned survives an
 * app restart; nothing here needs a network connection or an account.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  Grade,
  ReviewItem,
  categoryMastery,
  createReviewItem,
  dueCount,
  dueItems,
  reviewItem,
} from './srs';

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  /** Best quiz score as a fraction, 0–1. */
  bestScore: number;
  attempts: number;
  lastSeen: number;
  /** Index of the card the learner stopped on, so lessons resume in place. */
  lastCardIndex: number;
}

export interface DrillResult {
  drillId: string;
  correct: number;
  total: number;
  at: number;
  /** Longest run of correct answers in the session. */
  bestStreak: number;
}

export interface Settings {
  instrument: string;
  volume: number;
  haptics: boolean;
  /** Show note names on the keyboard. */
  labelMode: 'none' | 'letters' | 'c-only' | 'all';
  preferFlats: boolean;
  /** A4 reference in Hz. */
  tuning: number;
  metronomeBpm: number;
  /** Play a I–IV–V–I before ear training questions. */
  earTrainingContext: boolean;
  dailyGoalXp: number;
  countIn: boolean;
}

export interface Stats {
  totalAnswers: number;
  correctAnswers: number;
  lessonsCompleted: number;
  drillsCompleted: number;
  /** Seconds spent in lessons and drills. */
  timeSpent: number;
  bestDrillStreak: number;
}

export interface StreakState {
  current: number;
  longest: number;
  /** ISO date (YYYY-MM-DD) of the last day with any activity. */
  lastActiveDay: string | null;
  /** XP earned today, for the daily goal ring. */
  todayXp: number;
}

interface AppState {
  xp: number;
  progress: Record<string, LessonProgress>;
  reviews: Record<string, ReviewItem>;
  recentDrills: DrillResult[];
  unlockedAchievements: string[];
  settings: Settings;
  stats: Stats;
  streak: StreakState;
  hasOnboarded: boolean;

  // Actions
  awardXp: (amount: number) => void;
  startLesson: (lessonId: string) => void;
  saveLessonPosition: (lessonId: string, cardIndex: number) => void;
  completeLesson: (lessonId: string, score: number, xpReward: number) => void;
  recordDrill: (result: Omit<DrillResult, 'at'>, xpReward: number) => void;
  recordAnswer: (correct: boolean) => void;
  addReviewItems: (items: Array<{ id: string; category: string }>) => void;
  gradeReview: (id: string, grade: Grade) => void;
  addTime: (seconds: number) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  unlockAchievement: (id: string) => void;
  setOnboarded: (value: boolean) => void;
  resetProgress: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  instrument: 'grand',
  volume: 0.8,
  haptics: true,
  labelMode: 'c-only',
  preferFlats: false,
  tuning: 440,
  metronomeBpm: 100,
  earTrainingContext: true,
  dailyGoalXp: 120,
  countIn: true,
};

const DEFAULT_STATS: Stats = {
  totalAnswers: 0,
  correctAnswers: 0,
  lessonsCompleted: 0,
  drillsCompleted: 0,
  timeSpent: 0,
  bestDrillStreak: 0,
};

const DEFAULT_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastActiveDay: null,
  todayXp: 0,
};

/** Local calendar day, not UTC — a streak should follow the user's midnight. */
function today(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
}

/**
 * Fold today's activity into the streak.
 *
 * Called on every XP award. Same day is a no-op; a gap of exactly one day
 * extends the streak; anything larger restarts it at 1.
 */
function touchStreak(streak: StreakState, gainedXp: number): StreakState {
  const day = today();
  if (streak.lastActiveDay === day) {
    return { ...streak, todayXp: streak.todayXp + gainedXp };
  }
  const current = streak.lastActiveDay === yesterday() ? streak.current + 1 : 1;
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDay: day,
    todayXp: gainedXp,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      xp: 0,
      progress: {},
      reviews: {},
      recentDrills: [],
      unlockedAchievements: [],
      settings: DEFAULT_SETTINGS,
      stats: DEFAULT_STATS,
      streak: DEFAULT_STREAK,
      hasOnboarded: false,

      awardXp: (amount) =>
        set((state) => ({
          xp: state.xp + amount,
          streak: touchStreak(state.streak, amount),
        })),

      startLesson: (lessonId) =>
        set((state) => {
          const existing = state.progress[lessonId];
          return {
            progress: {
              ...state.progress,
              [lessonId]: existing
                ? { ...existing, lastSeen: Date.now() }
                : {
                    lessonId,
                    completed: false,
                    bestScore: 0,
                    attempts: 0,
                    lastSeen: Date.now(),
                    lastCardIndex: 0,
                  },
            },
          };
        }),

      saveLessonPosition: (lessonId, cardIndex) =>
        set((state) => {
          const existing = state.progress[lessonId];
          if (!existing) return state;
          return {
            progress: {
              ...state.progress,
              [lessonId]: { ...existing, lastCardIndex: cardIndex, lastSeen: Date.now() },
            },
          };
        }),

      completeLesson: (lessonId, score, xpReward) =>
        set((state) => {
          const existing = state.progress[lessonId];
          const wasCompleted = existing?.completed ?? false;
          // Replaying a lesson should not inflate XP or the completion count,
          // but a better score should still be recorded.
          const gained = wasCompleted ? Math.round(xpReward * 0.25) : xpReward;
          return {
            xp: state.xp + gained,
            streak: touchStreak(state.streak, gained),
            stats: {
              ...state.stats,
              lessonsCompleted: state.stats.lessonsCompleted + (wasCompleted ? 0 : 1),
            },
            progress: {
              ...state.progress,
              [lessonId]: {
                lessonId,
                completed: true,
                bestScore: Math.max(existing?.bestScore ?? 0, score),
                attempts: (existing?.attempts ?? 0) + 1,
                lastSeen: Date.now(),
                lastCardIndex: existing?.lastCardIndex ?? 0,
              },
            },
          };
        }),

      recordDrill: (result, xpReward) =>
        set((state) => ({
          xp: state.xp + xpReward,
          streak: touchStreak(state.streak, xpReward),
          recentDrills: [{ ...result, at: Date.now() }, ...state.recentDrills].slice(0, 40),
          stats: {
            ...state.stats,
            drillsCompleted: state.stats.drillsCompleted + 1,
            bestDrillStreak: Math.max(state.stats.bestDrillStreak, result.bestStreak),
          },
        })),

      recordAnswer: (correct) =>
        set((state) => ({
          stats: {
            ...state.stats,
            totalAnswers: state.stats.totalAnswers + 1,
            correctAnswers: state.stats.correctAnswers + (correct ? 1 : 0),
          },
        })),

      addReviewItems: (items) =>
        set((state) => {
          const reviews = { ...state.reviews };
          items.forEach(({ id, category }) => {
            if (!reviews[id]) reviews[id] = createReviewItem(id, category);
          });
          return { reviews };
        }),

      gradeReview: (id, grade) =>
        set((state) => {
          const existing = state.reviews[id];
          if (!existing) return state;
          return { reviews: { ...state.reviews, [id]: reviewItem(existing, grade) } };
        }),

      addTime: (seconds) =>
        set((state) => ({
          stats: { ...state.stats, timeSpent: state.stats.timeSpent + seconds },
        })),

      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      unlockAchievement: (id) =>
        set((state) =>
          state.unlockedAchievements.includes(id)
            ? state
            : { unlockedAchievements: [...state.unlockedAchievements, id] },
        ),

      setOnboarded: (value) => set({ hasOnboarded: value }),

      resetProgress: () =>
        set({
          xp: 0,
          progress: {},
          reviews: {},
          recentDrills: [],
          unlockedAchievements: [],
          stats: DEFAULT_STATS,
          streak: DEFAULT_STREAK,
        }),
    }),
    {
      name: 'theoryoftime-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // Settings and progress persist; nothing here is derived state.
      version: 1,
    },
  ),
);

// ── Derived selectors ─────────────────────────────────────────────────────

/**
 * Levels get progressively longer, but never punishingly so — the curve is
 * quadratic, so level 20 is reachable without grinding.
 */
export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 45;
}

export function levelFromXp(xp: number): { level: number; intoLevel: number; forLevel: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, intoLevel: remaining, forLevel: xpForLevel(level) };
}

export function useLevel() {
  const xp = useStore((s) => s.xp);
  return levelFromXp(xp);
}

export function useLessonProgress(lessonId: string): LessonProgress | undefined {
  return useStore((s) => s.progress[lessonId]);
}

export function useIsCompleted(lessonId: string): boolean {
  return useStore((s) => s.progress[lessonId]?.completed ?? false);
}

export function useDueReviewCount(): number {
  const reviews = useStore((s) => s.reviews);
  return dueCount(reviews);
}

export function useDueReviews(limit = 20): ReviewItem[] {
  const reviews = useStore((s) => s.reviews);
  return dueItems(reviews, Date.now(), limit);
}

export function useMastery(category: string): number {
  const reviews = useStore((s) => s.reviews);
  return categoryMastery(reviews, category);
}

export function useAccuracy(): number {
  const stats = useStore((s) => s.stats);
  return stats.totalAnswers === 0 ? 0 : stats.correctAnswers / stats.totalAnswers;
}

/** Today's progress toward the daily XP goal, 0–1. */
export function useDailyProgress(): { earned: number; goal: number; fraction: number } {
  const streak = useStore((s) => s.streak);
  const goal = useStore((s) => s.settings.dailyGoalXp);
  // Yesterday's number must not leak into today's ring.
  const earned = streak.lastActiveDay === today() ? streak.todayXp : 0;
  return { earned, goal, fraction: goal ? Math.min(1, earned / goal) : 0 };
}

export { today };
