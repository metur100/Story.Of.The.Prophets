import type { FlowStep, Story } from '@/models';

/**
 * Builds the interactive sequence of a story:
 * INTRO → STORY → INTERACTION → STORY → QUESTION → STORY → MINI GAME → LESSON → QUIZ (→ REWARD screen).
 * Scene interactions alternate between "interaction" and "question" so the child acts regularly.
 */
export function buildStoryFlow(story: Story): FlowStep[] {
  const steps: FlowStep[] = [{ kind: 'intro' }];
  story.scenes.forEach((scene, index) => {
    steps.push({ kind: 'scene', sceneId: scene.id });
    if (scene.interactionId) {
      steps.push({ kind: 'question', questionId: scene.interactionId, role: index === 0 ? 'interaction' : 'question' });
    }
  });
  steps.push({ kind: 'question', questionId: story.miniGameId, role: 'miniGame' });
  steps.push({ kind: 'lessons' });
  for (const id of story.quizIds) steps.push({ kind: 'question', questionId: id, role: 'quiz' });
  return steps;
}

/** Number of question steps (used to size the score). */
export function questionCount(story: Story): number {
  return buildStoryFlow(story).filter((s) => s.kind === 'question').length;
}

/** Scene ids that have been reached once the player is at `stepIndex`. */
export function scenesReached(story: Story, stepIndex: number): string[] {
  return buildStoryFlow(story)
    .slice(0, stepIndex + 1)
    .flatMap((s) => (s.kind === 'scene' ? [s.sceneId] : []));
}
