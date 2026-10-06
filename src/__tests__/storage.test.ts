import AsyncStorage from '@react-native-async-storage/async-storage';

import { getStory } from '@/content';
import { applyStoryStep, createInitialState, STATE_VERSION } from '@/services/gameEngine';
import { clearGameState, loadGameState, migrateState, saveGameState, STORAGE_KEY } from '@/storage/persistence';
import { useGameStore } from '@/store/gameStore';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('persistence', () => {
  it('round-trips progress including an unfinished story', async () => {
    const state = applyStoryStep({ ...createInitialState('de'), name: 'Zejd', onboarded: true }, getStory('nuh')!, 4, [true, false], 10);
    await saveGameState(state);
    expect(await loadGameState()).toEqual(state);
  });

  it('handles empty, corrupt and future data', async () => {
    expect(await loadGameState()).toBeNull();
    await AsyncStorage.setItem(STORAGE_KEY, 'nope{');
    expect(await loadGameState()).toBeNull();
    expect(migrateState({ version: STATE_VERSION + 1 })).toBeNull();
  });

  it('fills in defaults for older data', () => {
    const migrated = migrateState({ version: 1, xp: 12, settings: { language: 'bs' } })!;
    expect(migrated.xp).toBe(12);
    expect(migrated.settings.language).toBe('bs');
    expect(migrated.settings.soundEnabled).toBe(true);
    expect(migrated.run).toBeNull();
  });

  it('clears data', async () => {
    await saveGameState(createInitialState());
    await clearGameState();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('store', () => {
  it('hydrates and resumes a saved story', async () => {
    await saveGameState(applyStoryStep(createInitialState('en'), getStory('adam')!, 2, [true], 10));
    await useGameStore.getState().hydrate('de');
    expect(useGameStore.getState().game.run?.storyId).toBe('adam');
    expect(useGameStore.getState().game.settings.language).toBe('en');
  });

  it('queues a celebration for the first story and resets', async () => {
    await useGameStore.getState().hydrate('en');
    useGameStore.getState().completeStory(getStory('adam')!, [true, true], 0);
    expect(useGameStore.getState().celebrations).toContainEqual({ kind: 'badge', id: 'story_explorer' });
    await useGameStore.getState().resetProgress();
    expect(useGameStore.getState().game.stories).toEqual({});
  });
});
