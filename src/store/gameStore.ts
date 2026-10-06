import { create } from 'zustand';

import { STORIES } from '@/content';
import type { BadgeId, GameState, Language, Settings, Story } from '@/models';
import {
  type AnswerMode,
  applyAnswer,
  applyDailyComplete,
  applyLessonsLearned,
  applyStoryComplete,
  applyStoryStep,
  createInitialState,
  finalizeBadges,
  type StoryReward,
} from '@/services/gameEngine';
import { levelFromXp } from '@/services/xp';
import { clearGameState, loadGameState, saveGameState } from '@/storage/persistence';

export type Celebration = { kind: 'badge'; id: BadgeId } | { kind: 'level'; level: number };

export interface StoryOutcome extends Omit<StoryReward, 'state'> {
  learningXp: number;
}

interface GameStore {
  hydrated: boolean;
  game: GameState;
  celebrations: Celebration[];
  /** While true (e.g. inside a story), queued celebrations wait instead of interrupting. */
  celebrationsPaused: boolean;

  hydrate: (deviceLanguage: Language) => Promise<void>;
  completeOnboarding: (name: string, language: Language) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setName: (name: string) => void;
  recordAnswer: (question: { id: string; topic: string }, correct: boolean, mode: AnswerMode) => number;
  saveStep: (story: Story, stepIndex: number, results: boolean[], xpEarned: number) => void;
  learnLessons: (story: Story) => number;
  completeStory: (story: Story, results: boolean[], learningXp: number) => StoryOutcome;
  completeDaily: (day: string) => number;
  completeReviewSession: () => void;
  resetProgress: () => Promise<void>;
  dismissCelebration: () => void;
  setCelebrationsPaused: (paused: boolean) => void;
}

/** Applies badges and queues celebrations (new badges, level-ups) after every engine step. */
function commit(get: () => GameStore, set: (partial: Partial<GameStore>) => void, next: GameState) {
  const before = get().game;
  const { state, newBadges } = finalizeBadges(next, STORIES, new Date());
  const levelBefore = levelFromXp(before.xp);
  const levelAfter = levelFromXp(state.xp);
  const celebrations: Celebration[] = [
    ...get().celebrations,
    ...(levelAfter > levelBefore ? [{ kind: 'level' as const, level: levelAfter }] : []),
    ...newBadges.map((id) => ({ kind: 'badge' as const, id })),
  ];
  set({ game: state, celebrations });
}

export const useGameStore = create<GameStore>((set, get) => ({
  hydrated: false,
  game: createInitialState('en'),
  celebrations: [],
  celebrationsPaused: false,

  hydrate: async (deviceLanguage) => {
    const stored = await loadGameState();
    set({ game: stored ?? createInitialState(deviceLanguage), hydrated: true });
  },

  completeOnboarding: (name, language) => {
    const game = get().game;
    set({ game: { ...game, onboarded: true, name: name.trim(), settings: { ...game.settings, language } } });
  },

  updateSettings: (patch) => {
    const game = get().game;
    set({ game: { ...game, settings: { ...game.settings, ...patch } } });
  },

  setName: (name) => set({ game: { ...get().game, name: name.trim() } }),

  recordAnswer: (question, correct, mode) => {
    const { state, xp } = applyAnswer(get().game, question, correct, mode, new Date());
    commit(get, set, state);
    return xp;
  },

  saveStep: (story, stepIndex, results, xpEarned) => {
    set({ game: applyStoryStep(get().game, story, stepIndex, results, xpEarned) });
  },

  learnLessons: (story) => {
    const { state, xp } = applyLessonsLearned(get().game, story);
    commit(get, set, state);
    return xp;
  },

  completeStory: (story, results, learningXp) => {
    const { state, ...rest } = applyStoryComplete(get().game, story, results, new Date());
    commit(get, set, state);
    return { ...rest, learningXp };
  },

  completeDaily: (day) => {
    const { state, xp } = applyDailyComplete(get().game, day);
    commit(get, set, state);
    return xp;
  },

  completeReviewSession: () => commit(get, set, get().game),

  resetProgress: async () => {
    const language = get().game.settings.language;
    await clearGameState();
    set({ game: createInitialState(language), celebrations: [] });
  },

  dismissCelebration: () => set({ celebrations: get().celebrations.slice(1) }),
  setCelebrationsPaused: (paused) => set({ celebrationsPaused: paused }),
}));

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Persists the game state shortly after every change (debounced). */
export function startAutoSave(): () => void {
  return useGameStore.subscribe((store, previous) => {
    if (!store.hydrated || store.game === previous.game) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveGameState(useGameStore.getState().game).catch(() => undefined);
    }, 300);
  });
}
