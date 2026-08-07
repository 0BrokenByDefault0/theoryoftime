/**
 * The curriculum: every stage, in order, from first note to reharmonisation.
 */

import { Lesson, Stage } from './types';
import { firstSoundsStage, intervalsStage } from './lessons/foundations';
import { modesStage, scalesStage } from './lessons/scales';
import { chordsStage, harmonyStage } from './lessons/chords';
import { chromaticStage, rhythmStage } from './lessons/rhythm';
import { compositionStage, mixingStage, soundDesignStage } from './lessons/production';

export const STAGES: Stage[] = [
  firstSoundsStage,
  intervalsStage,
  scalesStage,
  modesStage,
  chordsStage,
  harmonyStage,
  rhythmStage,
  chromaticStage,
  soundDesignStage,
  mixingStage,
  compositionStage,
];

export const STAGES_BY_ID: Record<string, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
);

export const ALL_LESSONS: Lesson[] = STAGES.flatMap((s) => s.lessons);

export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(
  ALL_LESSONS.map((l) => [l.id, l]),
);

/** The stage a lesson belongs to. */
export const STAGE_OF_LESSON: Record<string, Stage> = Object.fromEntries(
  STAGES.flatMap((stage) => stage.lessons.map((lesson) => [lesson.id, stage])),
);

export function getStage(id: string): Stage | undefined {
  return STAGES_BY_ID[id];
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS_BY_ID[id];
}

export const TOTAL_LESSONS = ALL_LESSONS.length;
export const TOTAL_XP_AVAILABLE = ALL_LESSONS.reduce((sum, l) => sum + l.xp, 0);

/**
 * Lessons are gated by their `requires` list. A stage unlocks once the previous
 * stage is at least two-thirds complete — enough to keep the path moving
 * without letting someone skip the foundations entirely.
 */
export function isLessonUnlocked(
  lessonId: string,
  completed: Record<string, boolean>,
): boolean {
  const lesson = LESSONS_BY_ID[lessonId];
  if (!lesson) return false;
  if (!lesson.requires?.length) return true;
  return lesson.requires.every((id) => completed[id]);
}

export function isStageUnlocked(stageId: string, completed: Record<string, boolean>): boolean {
  const index = STAGES.findIndex((s) => s.id === stageId);
  if (index <= 0) return true;
  const previous = STAGES[index - 1];
  const done = previous.lessons.filter((l) => completed[l.id]).length;
  return done / previous.lessons.length >= 0.66;
}

export function stageProgress(
  stageId: string,
  completed: Record<string, boolean>,
): { done: number; total: number; fraction: number } {
  const stage = STAGES_BY_ID[stageId];
  if (!stage) return { done: 0, total: 0, fraction: 0 };
  const done = stage.lessons.filter((l) => completed[l.id]).length;
  return { done, total: stage.lessons.length, fraction: done / stage.lessons.length };
}

/** The next lesson the learner should do — drives the home screen's hero card. */
export function nextLesson(completed: Record<string, boolean>): { lesson: Lesson; stage: Stage } | null {
  for (const stage of STAGES) {
    for (const lesson of stage.lessons) {
      if (!completed[lesson.id] && isLessonUnlocked(lesson.id, completed)) {
        return { lesson, stage };
      }
    }
  }
  return null;
}
