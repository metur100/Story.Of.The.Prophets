import type { BadgeId, GameState, Story } from '@/models';

export interface BadgeDefinition {
  id: BadgeId;
  icon: string;
  color: string;
}

export const BADGES: readonly BadgeDefinition[] = [
  { id: 'story_explorer', icon: 'scroll', color: '#C8743A' },
  { id: 'history_learner', icon: 'map', color: '#2F8A5A' },
  { id: 'prophet_explorer', icon: 'trophy', color: '#B8860B' },
  { id: 'sabr_champion', icon: 'shield', color: '#2F5AA8' },
  { id: 'knowledge_seeker', icon: 'book', color: '#6E43AE' },
  { id: 'perfect_story', icon: 'star', color: '#F2B544' },
  { id: 'review_master', icon: 'refresh', color: '#1C7C8C' },
  { id: 'daily_learner', icon: 'sun', color: '#E8A317' },
];

export const KNOWLEDGE_SEEKER_ANSWERS = 50;
export const HISTORY_LEARNER_STORIES = 4;

export function isBadgeEarned(id: BadgeId, state: GameState, stories: readonly Story[]): boolean {
  const completed = stories.filter((s) => state.stories[s.id]?.completed).length;
  switch (id) {
    case 'story_explorer':
      return completed >= 1;
    case 'history_learner':
      return completed >= HISTORY_LEARNER_STORIES;
    case 'prophet_explorer':
      return stories.length > 0 && completed === stories.length;
    case 'sabr_champion': {
      const sabrLessons = stories.flatMap((s) => s.lessons).filter((l) => l.value === 'sabr');
      return sabrLessons.length > 0 && sabrLessons.every((l) => state.learnedLessons.includes(l.id));
    }
    case 'knowledge_seeker':
      return state.stats.correctAnswers >= KNOWLEDGE_SEEKER_ANSWERS;
    case 'perfect_story':
      return state.stats.perfectStories > 0;
    case 'review_master':
      return state.stats.reviewsCorrect >= 10;
    case 'daily_learner':
      return state.dailyCompleted.length >= 5;
  }
}

export function awardBadges(
  state: GameState,
  stories: readonly Story[],
  nowIso: string,
): { state: GameState; newBadges: BadgeId[] } {
  const newBadges = BADGES.map((b) => b.id).filter((id) => !state.badges[id] && isBadgeEarned(id, state, stories));
  if (newBadges.length === 0) return { state, newBadges };
  const badges = { ...state.badges };
  for (const id of newBadges) badges[id] = nowIso;
  return { state: { ...state, badges }, newBadges };
}
