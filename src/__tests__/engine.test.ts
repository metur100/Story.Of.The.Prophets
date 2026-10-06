import { getStory, STORIES } from '@/content';
import {
  applyAnswer,
  applyDailyComplete,
  applyLessonsLearned,
  applyStoryComplete,
  applyStoryStep,
  createInitialState,
  finalizeBadges,
} from '@/services/gameEngine';
import { dailyQuestionFor, featuredStoryFor } from '@/services/daily';
import { XP } from '@/services/xp';

const NOW = new Date('2026-10-06T10:00:00');
const adam = getStory('adam')!;
const q = { id: 'adam-next', topic: 'adam' };

describe('XP and review', () => {
  it('awards answer XP only once per question', () => {
    const first = applyAnswer(createInitialState(), q, true, 'story', NOW);
    expect(first.xp).toBe(XP.correctAnswer);
    expect(applyAnswer(first.state, q, true, 'story', NOW).xp).toBe(0);
  });

  it('adds wrong answers to the review queue', () => {
    const { state } = applyAnswer(createInitialState(), q, false, 'story', NOW);
    expect(state.review[q.id]).toMatchObject({ box: 0, incorrectCount: 1 });
    const reviewed = applyAnswer(state, q, true, 'review', NOW);
    expect(reviewed.xp).toBe(XP.reviewCorrect);
    expect(reviewed.state.review[q.id].box).toBe(1);
  });
});

describe('story progress', () => {
  it('saves the position for "Continue story" and marks scenes', () => {
    const state = applyStoryStep(createInitialState(), adam, 3, [true], 10);
    expect(state.run).toEqual({ storyId: 'adam', stepIndex: 3, results: [true], xpEarned: 10 });
    expect(state.completedScenes).toEqual(['adam-s1', 'adam-s2']);
  });

  it('counts lessons learned once', () => {
    const first = applyLessonsLearned(createInitialState(), adam);
    expect(first.xp).toBe(adam.lessons.length * XP.lessonLearned);
    expect(first.state.learnedLessons).toHaveLength(adam.lessons.length);
    expect(applyLessonsLearned(first.state, adam).xp).toBe(0);
  });

  it('completes a story, clears the run and rewards once', () => {
    let state = applyStoryStep(createInitialState(), adam, 5, [], 0);
    const reward = applyStoryComplete(state, adam, [true, true, true, true, true, true], NOW);
    expect(reward.lines.map((l) => l.kind)).toEqual(['storyComplete', 'perfectBonus']);
    state = reward.state;
    expect(state.run).toBeNull();
    expect(state.stories.adam).toMatchObject({ completed: true, bestStars: 3, bestScore: 100 });
    expect(state.completedScenes).toEqual(['adam-s1', 'adam-s2', 'adam-s3']);
    const replay = applyStoryComplete(state, adam, [false, true], NOW);
    expect(replay.xp).toBe(0);
    expect(replay.state.stories.adam.bestStars).toBe(3);
  });

  it('awards daily XP once per day', () => {
    const first = applyDailyComplete(createInitialState(), '2026-10-06');
    expect(first.xp).toBe(XP.dailyQuestion);
    expect(applyDailyComplete(first.state, '2026-10-06').xp).toBe(0);
  });
});

describe('badges', () => {
  it('awards Story Explorer, History Learner and Prophet Explorer by completed stories', () => {
    let state = createInitialState();
    for (const [i, story] of STORIES.entries()) {
      state = applyStoryComplete(state, story, [true], NOW).state;
      const { newBadges, state: next } = finalizeBadges(state, STORIES, NOW);
      state = next;
      if (i === 0) expect(newBadges).toEqual(expect.arrayContaining(['story_explorer', 'perfect_story']));
      if (i === 3) expect(newBadges).toContain('history_learner');
      if (i === STORIES.length - 1) expect(newBadges).toContain('prophet_explorer');
    }
  });

  it('awards Sabr Champion after every sabr lesson is learned', () => {
    let state = createInitialState();
    const sabrStories = STORIES.filter((s) => s.lessons.some((l) => l.value === 'sabr'));
    expect(sabrStories.length).toBeGreaterThan(1);
    for (const story of sabrStories.slice(0, -1)) state = applyLessonsLearned(state, story).state;
    expect(finalizeBadges(state, STORIES, NOW).newBadges).not.toContain('sabr_champion');
    state = applyLessonsLearned(state, sabrStories[sabrStories.length - 1]).state;
    expect(finalizeBadges(state, STORIES, NOW).newBadges).toContain('sabr_champion');
  });
});

describe('daily content', () => {
  it('picks a stable daily question only from opened stories', () => {
    expect(dailyQuestionFor('2026-10-06', [])).toBeNull();
    const question = dailyQuestionFor('2026-10-06', [adam]);
    expect(question?.storyId).toBe('adam');
    expect(dailyQuestionFor('2026-10-06', [adam])).toBe(question);
  });

  it('rotates the featured story', () => {
    const a = featuredStoryFor('2026-10-06', STORIES);
    const b = featuredStoryFor('2026-10-07', STORIES);
    expect(a).not.toBe(b);
  });
});
