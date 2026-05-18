import type { LocaleCode, SkillId } from '../curriculum/types';

export type Persona = 'kid' | 'adult';

export interface SkillMastery {
  skillId: SkillId;
  level: number;
  rollingStats: {
    attempts: number;
    correct: number;
    avgResponseMs: number;
  };
  lastPlayedAt: number;
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
  createdAt: number;
  updatedAt: number;
}
