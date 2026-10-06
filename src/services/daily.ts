import type { DayKey, Question, Story } from '@/models';
import { dayNumber } from '@/utils/date';
import { seededRandom } from '@/utils/random';

const DAILY_TYPES = new Set<Question['type']>(['multipleChoice', 'trueFalse', 'lessonChoice']);

/**
 * One question per calendar day, the same for the whole day and fully offline.
 * Questions come from stories the player has already unlocked, so nothing is spoiled.
 */
export function dailyQuestionFor(day: DayKey, openStories: readonly Story[]): Question | null {
  const pool = openStories.flatMap((s) => s.questions).filter((q) => DAILY_TYPES.has(q.type));
  if (pool.length === 0) return null;
  const random = seededRandom(dayNumber(day) * 104729 + 7);
  return pool[Math.floor(random() * pool.length)];
}

/** Featured story of the day (rotates through all stories). */
export function featuredStoryFor(day: DayKey, stories: readonly Story[]): Story | null {
  if (stories.length === 0) return null;
  const n = dayNumber(day);
  return stories[((n % stories.length) + stories.length) % stories.length];
}
