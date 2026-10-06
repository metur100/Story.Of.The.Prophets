import type { DayKey, Language } from './common';
import type { BadgeId } from './story';

export interface Settings {
  language: Language;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  largeText: boolean;
}

export interface StoryProgress {
  completed: boolean;
  bestStars: number;
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

/** A story the player left part-way through; "Continue story" resumes here. */
export interface StoryRun {
  storyId: string;
  stepIndex: number;
  results: boolean[];
  xpEarned: number;
}

export interface ReviewItem {
  questionId: string;
  topic: string;
  box: number;
  correctCount: number;
  incorrectCount: number;
  lastSeen: string;
  nextReviewDate: string;
  mastered: boolean;
}

export interface Stats {
  questionsAnswered: number;
  correctAnswers: number;
  reviewsCorrect: number;
  perfectStories: number;
}

export interface GameState {
  version: number;
  onboarded: boolean;
  name: string;
  settings: Settings;
  xp: number;
  stories: Record<string, StoryProgress>;
  completedScenes: string[];
  learnedLessons: string[];
  correctlyAnswered: string[];
  badges: Partial<Record<BadgeId, string>>;
  review: Record<string, ReviewItem>;
  dailyCompleted: DayKey[];
  run: StoryRun | null;
  stats: Stats;
}
