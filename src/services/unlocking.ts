import type { Story, StoryProgress } from '@/models';

export type StoryStatus = 'locked' | 'available' | 'completed';

type ProgressMap = Record<string, StoryProgress>;

const sorted = (stories: readonly Story[]) => [...stories].sort((a, b) => a.order - b.order);

/** Stories follow the chronological order of the prophets: each one opens the next. */
export function storyStatus(story: Story, progress: ProgressMap, stories: readonly Story[]): StoryStatus {
  if (progress[story.id]?.completed) return 'completed';
  const list = sorted(stories);
  const index = list.findIndex((s) => s.id === story.id);
  if (index <= 0) return 'available';
  return progress[list[index - 1].id]?.completed ? 'available' : 'locked';
}

/** The story that must be completed to unlock this one (for the "why is it locked?" message). */
export function unlockingStory(story: Story, stories: readonly Story[]): Story | null {
  const list = sorted(stories);
  const index = list.findIndex((s) => s.id === story.id);
  return index > 0 ? list[index - 1] : null;
}

/** The first available story that is not completed yet. */
export function nextStory(progress: ProgressMap, stories: readonly Story[]): Story | null {
  return sorted(stories).find((s) => storyStatus(s, progress, stories) === 'available') ?? null;
}

export function completedStories(progress: ProgressMap, stories: readonly Story[]): Story[] {
  return sorted(stories).filter((s) => progress[s.id]?.completed);
}
