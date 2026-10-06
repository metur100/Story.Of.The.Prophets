import { useMemo } from 'react';

import { SCENES, STORIES } from '@/content';
import { featuredStoryFor } from '@/services/daily';
import { dueItems } from '@/services/review';
import { completedStories, nextStory, storyStatus } from '@/services/unlocking';
import { levelInfo } from '@/services/xp';
import { useGameStore } from '@/store/gameStore';
import { toDayKey } from '@/utils/date';

/** Derived, read-only view of the player's progress. */
export function useProgress() {
  const game = useGameStore((s) => s.game);
  return useMemo(() => {
    const today = toDayKey(new Date());
    const completed = completedStories(game.stories, STORIES);
    const scores = completed.map((s) => game.stories[s.id].bestScore);
    return {
      today,
      level: levelInfo(game.xp),
      completed,
      recent: [...completed]
        .sort((a, b) => (game.stories[b.id].completedAt ?? '').localeCompare(game.stories[a.id].completedAt ?? ''))
        .slice(0, 3),
      next: nextStory(game.stories, STORIES),
      featured: featuredStoryFor(today, STORIES),
      openStories: STORIES.filter((s) => storyStatus(s, game.stories, STORIES) !== 'locked'),
      dueReviews: dueItems(game.review, new Date().toISOString()),
      pendingReviews: Object.values(game.review).filter((r) => !r.mastered).length,
      dailyDone: game.dailyCompleted.includes(today),
      averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      scenesTotal: SCENES.length,
    };
  }, [game]);
}
