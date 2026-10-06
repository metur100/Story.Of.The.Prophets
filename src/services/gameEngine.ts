import type { BadgeId, DayKey, GameState, Language, Story } from '@/models';
import { awardBadges } from './badges';
import { scoreQuiz, type QuizScore } from './quiz';
import { isDue, recordMistake, recordSuccess } from './review';
import { scenesReached } from './storyFlow';
import { XP } from './xp';

export const STATE_VERSION = 1;

export function createInitialState(language: Language = 'en'): GameState {
  return {
    version: STATE_VERSION,
    onboarded: false,
    name: '',
    settings: { language, soundEnabled: true, hapticsEnabled: true, reducedMotion: false, largeText: false },
    xp: 0,
    stories: {},
    completedScenes: [],
    learnedLessons: [],
    correctlyAnswered: [],
    badges: {},
    review: {},
    dailyCompleted: [],
    run: null,
    stats: { questionsAnswered: 0, correctAnswers: 0, reviewsCorrect: 0, perfectStories: 0 },
  };
}

export type AnswerMode = 'story' | 'review' | 'daily';

export interface EngineResult {
  state: GameState;
  xp: number;
}

/**
 * Records one answer. XP for a correct answer is only granted the first time a question is answered
 * correctly; a wrong answer goes into the spaced-review queue ("Not quite" → review later).
 */
export function applyAnswer(
  state: GameState,
  question: { id: string; topic: string },
  correct: boolean,
  mode: AnswerMode,
  now: Date,
): EngineResult {
  const nowIso = now.toISOString();
  const stats = {
    ...state.stats,
    questionsAnswered: state.stats.questionsAnswered + 1,
    correctAnswers: state.stats.correctAnswers + (correct ? 1 : 0),
  };
  const review = { ...state.review };
  const existing = review[question.id];

  if (!correct) {
    review[question.id] = recordMistake(existing, question.id, question.topic, nowIso);
    return { state: { ...state, stats, review }, xp: 0 };
  }

  let xp = 0;
  const firstTimeCorrect = !state.correctlyAnswered.includes(question.id);
  const correctlyAnswered = firstTimeCorrect ? [...state.correctlyAnswered, question.id] : state.correctlyAnswered;
  if (existing && isDue(existing, nowIso)) {
    review[question.id] = recordSuccess(existing, nowIso);
    if (mode === 'review') {
      xp += XP.reviewCorrect;
      stats.reviewsCorrect += 1;
    }
  }
  if (firstTimeCorrect && mode !== 'review') xp += XP.correctAnswer;
  return { state: { ...state, stats, review, correctlyAnswered, xp: state.xp + xp }, xp };
}

/** Saves the current position so "Continue story" can resume, and marks reached scenes. */
export function applyStoryStep(
  state: GameState,
  story: Story,
  stepIndex: number,
  results: boolean[],
  xpEarned: number,
): GameState {
  const reached = scenesReached(story, stepIndex).filter((id) => !state.completedScenes.includes(id));
  return {
    ...state,
    run: { storyId: story.id, stepIndex, results, xpEarned },
    completedScenes: reached.length ? [...state.completedScenes, ...reached] : state.completedScenes,
  };
}

/** "What did we learn?" – each lesson counts once. */
export function applyLessonsLearned(state: GameState, story: Story): EngineResult {
  const fresh = story.lessons.map((l) => l.id).filter((id) => !state.learnedLessons.includes(id));
  const xp = fresh.length * XP.lessonLearned;
  return {
    state: { ...state, learnedLessons: [...state.learnedLessons, ...fresh], xp: state.xp + xp },
    xp,
  };
}

export interface StoryReward {
  state: GameState;
  xp: number;
  lines: { kind: 'storyComplete' | 'perfectBonus'; xp: number }[];
  score: QuizScore;
  firstCompletion: boolean;
}

export function applyStoryComplete(state: GameState, story: Story, results: readonly boolean[], now: Date): StoryReward {
  const score = scoreQuiz(results);
  const before = state.stories[story.id];
  const firstCompletion = !before?.completed;
  const perfect = score.total > 0 && score.correct === score.total;
  const firstPerfect = perfect && (before?.bestStars ?? 0) < 3;
  const lines: StoryReward['lines'] = [];
  if (firstCompletion) lines.push({ kind: 'storyComplete', xp: XP.storyComplete });
  if (firstPerfect) lines.push({ kind: 'perfectBonus', xp: XP.perfectStoryBonus });
  const xp = lines.reduce((sum, l) => sum + l.xp, 0);
  const allScenes = story.scenes.map((s) => s.id).filter((id) => !state.completedScenes.includes(id));

  return {
    state: {
      ...state,
      xp: state.xp + xp,
      run: null,
      completedScenes: [...state.completedScenes, ...allScenes],
      stories: {
        ...state.stories,
        [story.id]: {
          completed: true,
          attempts: (before?.attempts ?? 0) + 1,
          bestStars: Math.max(before?.bestStars ?? 0, score.stars),
          bestScore: Math.max(before?.bestScore ?? 0, score.percent),
          completedAt: now.toISOString(),
        },
      },
      stats: firstPerfect ? { ...state.stats, perfectStories: state.stats.perfectStories + 1 } : state.stats,
    },
    xp,
    lines,
    score,
    firstCompletion,
  };
}

export function applyDailyComplete(state: GameState, day: DayKey): EngineResult {
  if (state.dailyCompleted.includes(day)) return { state, xp: 0 };
  return {
    state: { ...state, dailyCompleted: [...state.dailyCompleted, day], xp: state.xp + XP.dailyQuestion },
    xp: XP.dailyQuestion,
  };
}

export function finalizeBadges(
  state: GameState,
  stories: readonly Story[],
  now: Date,
): { state: GameState; newBadges: BadgeId[] } {
  return awardBadges(state, stories, now.toISOString());
}
