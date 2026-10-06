import type { LocalizedText, SourceRef } from './common';
import type { SceneElement } from './scene';

export type QuestionType =
  | 'multipleChoice'
  | 'trueFalse'
  | 'ordering'
  | 'matching'
  | 'memory'
  | 'scenario'
  | 'find'
  | 'map'
  | 'lessonChoice';

interface QuestionBase {
  id: string;
  /** Story the question belongs to (used for review grouping). */
  storyId: string;
  /** Topic key used to group mistakes in the review system. */
  topic: string;
  prompt: LocalizedText;
  explanation: LocalizedText;
  sources?: SourceRef[];
}

export interface AnswerOption {
  id: string;
  text: LocalizedText;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multipleChoice';
  options: AnswerOption[];
  correctOptionId: string;
}

/** "Choose the correct lesson": same mechanics as multiple choice, shown as value cards. */
export interface LessonChoiceQuestion extends QuestionBase {
  type: 'lessonChoice';
  options: AnswerOption[];
  correctOptionId: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'trueFalse';
  correct: boolean;
}

/** Items are listed in the correct order; `timeline` renders them as a timeline game. */
export interface OrderingQuestion extends QuestionBase {
  type: 'ordering';
  timeline?: boolean;
  items: AnswerOption[];
}

export interface MatchingPair {
  id: string;
  left: LocalizedText;
  right: LocalizedText;
}

export interface MatchingQuestion extends QuestionBase {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface MemoryQuestion extends QuestionBase {
  type: 'memory';
  pairs: MatchingPair[];
}

export interface ScenarioOption extends AnswerOption {
  feedback: LocalizedText;
}

/** Decision game: choose the right response in a situation. */
export interface ScenarioQuestion extends QuestionBase {
  type: 'scenario';
  options: ScenarioOption[];
  correctOptionId: string;
}

export interface FindItem {
  id: string;
  element: SceneElement;
  label: LocalizedText;
}

/** Find game: select every object that belongs to the story among illustrated objects. */
export interface FindQuestion extends QuestionBase {
  type: 'find';
  items: FindItem[];
  correctIds: string[];
}

export type MapPlaceId = 'makkah' | 'madinah' | 'egypt' | 'jerusalem' | 'judi' | 'mesopotamia';

/** Map interaction: tap the right place on a simple illustrated map. */
export interface MapQuestion extends QuestionBase {
  type: 'map';
  places: MapPlaceId[];
  correctPlace: MapPlaceId;
}

export type Question =
  | MultipleChoiceQuestion
  | LessonChoiceQuestion
  | TrueFalseQuestion
  | OrderingQuestion
  | MatchingQuestion
  | MemoryQuestion
  | ScenarioQuestion
  | FindQuestion
  | MapQuestion;

export type AnswerInput =
  | { type: 'option'; optionId: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'order'; ids: string[] }
  | { type: 'pairs'; mistakes: number }
  | { type: 'memory'; moves: number }
  | { type: 'selection'; ids: string[] }
  | { type: 'place'; place: MapPlaceId };
