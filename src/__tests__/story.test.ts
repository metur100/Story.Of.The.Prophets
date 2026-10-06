import { getStory, STORIES } from '@/content';
import type { Question } from '@/models';
import { evaluateAnswer, scoreQuiz } from '@/services/quiz';
import { buildStoryFlow, questionCount, scenesReached } from '@/services/storyFlow';
import { completedStories, nextStory, storyStatus, unlockingStory } from '@/services/unlocking';

const done = (...ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, { completed: true, bestStars: 3, bestScore: 100, attempts: 1 }]));

describe('story progression', () => {
  const adam = getStory('adam')!;

  it('follows INTRO → STORY → INTERACTION → STORY → QUESTION → STORY → MINI GAME → LESSON → QUIZ', () => {
    const kinds = buildStoryFlow(adam).map((s) => (s.kind === 'question' ? s.role : s.kind));
    expect(kinds).toEqual(['intro', 'scene', 'interaction', 'scene', 'question', 'scene', 'miniGame', 'lessons', 'quiz', 'quiz', 'quiz']);
  });

  it('counts the scored questions', () => {
    expect(questionCount(adam)).toBe(6);
  });

  it('tracks which scenes have been reached', () => {
    expect(scenesReached(adam, 0)).toEqual([]);
    expect(scenesReached(adam, 1)).toEqual(['adam-s1']);
    expect(scenesReached(adam, 5)).toEqual(['adam-s1', 'adam-s2', 'adam-s3']);
  });

  it('every story uses the same interactive structure', () => {
    for (const story of STORIES) {
      const flow = buildStoryFlow(story);
      expect(flow[0].kind).toBe('intro');
      expect(flow.filter((s) => s.kind === 'scene')).toHaveLength(3);
      expect(flow.some((s) => s.kind === 'question' && s.role === 'miniGame')).toBe(true);
      expect(flow.filter((s) => s.kind === 'question' && s.role === 'quiz')).toHaveLength(3);
      // The child interacts regularly: never more than one story page in a row.
      for (let i = 1; i < flow.length; i++) {
        expect(flow[i].kind === 'scene' && flow[i - 1].kind === 'scene').toBe(false);
      }
    }
  });
});

describe('unlock system', () => {
  it('opens only the first story at the start', () => {
    expect(STORIES.map((s) => storyStatus(s, {}, STORIES))).toEqual([
      'available', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked',
    ]);
    expect(nextStory({}, STORIES)?.id).toBe('adam');
  });

  it('unlocks stories in chronological order and explains why one is locked', () => {
    const progress = done('adam');
    expect(storyStatus(getStory('nuh')!, progress, STORIES)).toBe('available');
    expect(storyStatus(getStory('ibrahim')!, progress, STORIES)).toBe('locked');
    expect(unlockingStory(getStory('ibrahim')!, STORIES)?.id).toBe('nuh');
    expect(unlockingStory(getStory('adam')!, STORIES)).toBeNull();
    expect(completedStories(progress, STORIES).map((s) => s.id)).toEqual(['adam']);
  });

  it('has nothing left when every story is complete', () => {
    expect(nextStory(done(...STORIES.map((s) => s.id)), STORIES)).toBeNull();
  });
});

describe('question scoring', () => {
  const text = (s: string) => ({ en: s, de: s, bs: s });
  const base = { storyId: 's', topic: 't', prompt: text('p'), explanation: text('e') };

  it('scores find questions only when exactly the right objects are chosen', () => {
    const q: Question = {
      ...base,
      id: 'f',
      type: 'find',
      items: [],
      correctIds: ['ark', 'rain'],
    };
    expect(evaluateAnswer(q, { type: 'selection', ids: ['rain', 'ark'] })).toBe(true);
    expect(evaluateAnswer(q, { type: 'selection', ids: ['ark'] })).toBe(false);
    expect(evaluateAnswer(q, { type: 'selection', ids: ['ark', 'rain', 'well'] })).toBe(false);
  });

  it('scores map questions by place', () => {
    const q: Question = { ...base, id: 'm', type: 'map', places: ['makkah', 'egypt'], correctPlace: 'egypt' };
    expect(evaluateAnswer(q, { type: 'place', place: 'egypt' })).toBe(true);
    expect(evaluateAnswer(q, { type: 'place', place: 'makkah' })).toBe(false);
  });

  it('scores lesson choices, timelines and true/false', () => {
    const lesson: Question = { ...base, id: 'l', type: 'lessonChoice', options: [{ id: 'a', text: text('a') }], correctOptionId: 'a' };
    expect(evaluateAnswer(lesson, { type: 'option', optionId: 'a' })).toBe(true);
    const timeline: Question = { ...base, id: 'o', type: 'ordering', timeline: true, items: ['x', 'y', 'z'].map((id) => ({ id, text: text(id) })) };
    expect(evaluateAnswer(timeline, { type: 'order', ids: ['x', 'y', 'z'] })).toBe(true);
    expect(evaluateAnswer(timeline, { type: 'order', ids: ['y', 'x', 'z'] })).toBe(false);
    const tf: Question = { ...base, id: 'tf', type: 'trueFalse', correct: true };
    expect(evaluateAnswer(tf, { type: 'boolean', value: true })).toBe(true);
  });

  it('turns results into stars', () => {
    expect(scoreQuiz([true, true, true, true, true, true]).stars).toBe(3);
    expect(scoreQuiz([true, true, true, true, true, false]).stars).toBe(2);
    expect(scoreQuiz([true, false, false, false, false, false]).stars).toBe(1);
  });
});
