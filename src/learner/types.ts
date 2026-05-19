import type { LocaleCode, SkillId } from '../curriculum/types';

export type Persona = 'kid' | 'adult';

export interface SkillRollingStats {
  attempts: number;
  correct: number;
  avgResponseMs: number;
}

/**
 * Per-fact mastery for closed-set skills (e.g. multiplication 1-5).
 * Each `factKey` (e.g. "4x5") accumulates its own attempts/correct/avgResponseMs
 * so the adaptive engine can pick the weakest fact next. Open-set skills do
 * not populate `factsKnown`.
 */
export interface FactStats {
  attempts: number;
  correct: number;
  avgResponseMs: number;
  lastSeen: number;
}

export interface SkillMastery {
  skillId: SkillId;
  level: number;
  rollingStats: SkillRollingStats;
  factsKnown?: Record<string, FactStats>;
  lastPlayedAt: number;
}

/**
 * Per-mechanic, per-learner UX setting. `difficulty` is the on-screen "TASE N"
 * level for that mechanic (grid size, speed, obstacle density). `variant`
 * captures mode toggles (e.g. picture_pairs emoji_only vs emoji_word). One
 * entry per mechanic id (matches `GameConfig.mechanic` or, for singletons,
 * the gameType id).
 */
export interface MechanicPreference {
  mechanicId: string;
  difficulty: number;
  variant?: string;
  lastUpdatedAt: number;
}

export interface LearnerProfile {
  id: string;
  displayName: string;
  persona: Persona;
  ageHint?: number;
  preferences: {
    locale: LocaleCode;
    theme?: string;
  };
  skillMastery: Record<SkillId, SkillMastery>;
  mechanicPreference: Record<string, MechanicPreference>;
  createdAt: number;
  updatedAt: number;
}
