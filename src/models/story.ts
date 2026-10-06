import type { LocalizedText, SourceRef } from './common';
import type { Question } from './question';
import type { SceneElement, SceneSpec } from './scene';

export type Honorific = 'alayhis-salam' | 'sallallahu-alayhi-wa-sallam';

export interface StoryScene {
  id: string;
  title: LocalizedText;
  text: LocalizedText;
  scene: SceneSpec;
  /** Question shown right after this scene (interaction / question). */
  interactionId?: string;
  sources?: SourceRef[];
}

/** A value taught by the story ("What did we learn?"). */
export interface StoryLesson {
  id: string;
  /** Value tag, e.g. "sabr" – used for value-based badges. */
  value: string;
  title: LocalizedText;
  explanation: LocalizedText;
  example: LocalizedText;
  reflection: LocalizedText;
}

export interface Story {
  id: string;
  order: number;
  prophetName: LocalizedText;
  honorific: Honorific;
  title: LocalizedText;
  description: LocalizedText;
  /** Where the story takes place (shown on the timeline card). */
  place: LocalizedText;
  /** Symbolic object representing the story on the map – never a person. */
  symbol: SceneElement;
  cover: SceneSpec;
  intro: LocalizedText;
  scenes: StoryScene[];
  miniGameId: string;
  quizIds: string[];
  lessons: StoryLesson[];
  questions: Question[];
  sources: SourceRef[];
}

export type FlowStep =
  | { kind: 'intro' }
  | { kind: 'scene'; sceneId: string }
  | { kind: 'question'; questionId: string; role: 'interaction' | 'question' | 'miniGame' | 'quiz' }
  | { kind: 'lessons' };

export type BadgeId =
  | 'story_explorer'
  | 'history_learner'
  | 'prophet_explorer'
  | 'sabr_champion'
  | 'knowledge_seeker'
  | 'perfect_story'
  | 'review_master'
  | 'daily_learner';
