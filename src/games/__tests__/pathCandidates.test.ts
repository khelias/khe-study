import { describe, expect, it } from 'vitest';
import { CATEGORIES, GAME_CONFIG } from '../data';
import { FOCUS_SUBJECTS, focusSubjectsFor, PATH_CANDIDATES } from '../pathCandidates';

describe('pathCandidates', () => {
  it('offers every game with its subject and skills', () => {
    const candidates = PATH_CANDIDATES;
    expect(candidates.map((c) => c.gameId).sort()).toEqual(Object.keys(GAME_CONFIG).sort());
    expect(candidates.find((c) => c.gameId === 'word_builder')).toMatchObject({
      subject: 'language',
      needsReading: true,
    });
  });

  it('gives each subject the distinct skills of its games', () => {
    const subjects = FOCUS_SUBJECTS;
    expect(subjects.map((s) => s.subject)).toEqual(Object.keys(CATEGORIES));
    for (const { skillIds } of subjects) {
      expect(new Set(skillIds).size).toBe(skillIds.length);
    }
    expect(subjects.find((s) => s.subject === 'math')!.skillIds.length).toBeGreaterThan(3);
  });

  it('offers a learner under seven only focuses with games that need no reading', () => {
    const young = focusSubjectsFor(5).flatMap((s) => s.skillIds);
    const all = FOCUS_SUBJECTS.flatMap((s) => s.skillIds);
    expect(young.length).toBeLessThan(all.length);
    expect(young).not.toContain('language.syllabification');
    expect(focusSubjectsFor(9).flatMap((s) => s.skillIds)).toEqual(all);
  });
});
