/**
 * The games today's path may pick (src/meta/path.ts), read from the game
 * configs and the skills each binding records.
 */

import { LEGACY_GAME_SKILL_IDS } from '../learner/legacyProgress';
import { readableFor, type PathCandidate } from '../meta/path';
import { CATEGORIES, GAME_CONFIG } from './data';

export const PATH_CANDIDATES: readonly PathCandidate[] = Object.entries(GAME_CONFIG).map(
  ([gameId, config]) => ({
    gameId,
    subject: config.category,
    skillIds: LEGACY_GAME_SKILL_IDS[gameId] ?? [],
    needsReading: config.needsReading ?? false,
  }),
);

type FocusSubject = { subject: string; skillIds: readonly string[] };

const subjectsOf = (candidates: readonly PathCandidate[]): FocusSubject[] =>
  Object.keys(CATEGORIES).map((subject) => ({
    subject,
    skillIds: [
      ...new Set(candidates.filter((c) => c.subject === subject).flatMap((c) => c.skillIds)),
    ],
  }));

/** The subjects a parent can focus on, each with the skills its games practise. */
export const FOCUS_SUBJECTS: readonly FocusSubject[] = subjectsOf(PATH_CANDIDATES);

/** The focuses the path can serve for a learner of `ageHint`. */
export const focusSubjectsFor = (ageHint: number | undefined): FocusSubject[] =>
  subjectsOf(readableFor(PATH_CANDIDATES, ageHint)).filter((s) => s.skillIds.length > 0);

/** The subject whose games practise a skill. */
export const subjectOfSkill = (skillId: string): string | null =>
  FOCUS_SUBJECTS.find((s) => s.skillIds.includes(skillId))?.subject ?? null;
