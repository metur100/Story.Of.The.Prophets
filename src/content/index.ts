import type { Question, Story, StoryLesson, StoryScene } from '@/models';

import adam from './prophets/adam.json';
import ibrahim from './prophets/ibrahim.json';
import isa from './prophets/isa.json';
import muhammad from './prophets/muhammad.json';
import musa from './prophets/musa.json';
import nuh from './prophets/nuh.json';
import yunus from './prophets/yunus.json';
import yusuf from './prophets/yusuf.json';

// JSON imports are widened by TypeScript; the content test suite verifies the shape.
export const STORIES: readonly Story[] = [adam, nuh, ibrahim, musa, yusuf, yunus, isa, muhammad]
  .map((s) => s as unknown as Story)
  .sort((a, b) => a.order - b.order);

export const QUESTIONS: readonly Question[] = STORIES.flatMap((s) => s.questions);
export const LESSONS: readonly StoryLesson[] = STORIES.flatMap((s) => s.lessons);
export const SCENES: readonly StoryScene[] = STORIES.flatMap((s) => s.scenes);

const storyMap = new Map(STORIES.map((s) => [s.id, s] as const));
const questionMap = new Map(QUESTIONS.map((q) => [q.id, q] as const));
const sceneMap = new Map(SCENES.map((s) => [s.id, s] as const));

export const getStory = (id: string): Story | undefined => storyMap.get(id);
export const getQuestion = (id: string): Question | undefined => questionMap.get(id);
export const getScene = (id: string): StoryScene | undefined => sceneMap.get(id);
