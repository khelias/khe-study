import { describe, expect, it } from 'vitest';

import { buildCurriculumAuditReport } from '../curriculumAudit';

describe('curriculum audit report', () => {
  it('covers the registered skills, packs, and game bindings', () => {
    const report = buildCurriculumAuditReport();

    expect(report.summary.totalSkills).toBeGreaterThan(15);
    expect(report.summary.totalPacks).toBeGreaterThan(20);
    expect(report.summary.totalGameBindings).toBeGreaterThan(20);
    expect(report.summary.unboundPacks).toBe(0);
    expect(report.summary.skillsWithoutPacks).toBe(0);
    expect(report.summary.skillsWithoutConsumers).toBe(0);
  });

  it('maps locale-backed vocabulary packs to the games that resolve by skill', () => {
    const report = buildCurriculumAuditReport();
    const vocabularyEt = report.packs.find((row) => row.packId === 'language.vocabulary.et');

    expect(vocabularyEt).toBeDefined();
    expect(vocabularyEt?.consumers.map((consumer) => consumer.gameId)).toEqual([
      'letter_match',
      'picture_pairs',
      'word_builder',
      'word_cascade',
    ]);
    expect(vocabularyEt?.consumers.every((consumer) => consumer.mode === 'skill-locale')).toBe(
      true,
    );
  });

  it('exempts covered arithmetic spec pools from shallow-pack warnings', () => {
    const report = buildCurriculumAuditReport();
    const specPackIds = [
      'math.addition_within_20',
      'math.addition_within_100',
      'math.subtraction_within_20',
      'math.subtraction_within_100',
      'math.multiplication_1_5',
      'math.multiplication_1_10',
    ];

    expect(report.summary.packsBelowMinimum).toBe(6);
    expect(report.summary.shallowPacks).toBe(0);

    const SPEC_CONSUMER_MECHANICS = new Set(['math_snake', 'fact_drill']);
    for (const packId of specPackIds) {
      const row = report.packs.find((pack) => pack.packId === packId);
      if (!row) throw new Error(`${packId} missing from audit report`);
      expect(row.difficultySignals).toContain('arithmetic-spec=covered');
      expect(row.warnings).not.toContain('shallow_item_count<6');
      expect(
        row.consumers.every((consumer) =>
          consumer.mechanic ? SPEC_CONSUMER_MECHANICS.has(consumer.mechanic) : true,
        ),
      ).toBe(true);
    }
  });

  it('surfaces authored difficulty and level-range signals when packs declare them', () => {
    const report = buildCurriculumAuditReport();
    const shapeShift = report.packs.find(
      (row) => row.packId === 'math.geometry_shapes.shape_shift_puzzles',
    );
    const spatial = report.packs.find(
      (row) => row.packId === 'language.spatial_sentences.scene_pack',
    );
    const syllablesEt = report.packs.find((row) => row.packId === 'language.syllabification.et');
    const syllablesEn = report.packs.find((row) => row.packId === 'language.syllabification.en');
    const vocabularyEt = report.packs.find((row) => row.packId === 'language.vocabulary.et');
    const vocabularyEn = report.packs.find((row) => row.packId === 'language.vocabulary.en');
    const time = report.packs.find((row) => row.packId === 'math.time_reading.core');

    expect(shapeShift?.difficultySignals).toContain('difficulty=easy/hard/medium');
    expect(spatial?.difficultySignals).toEqual(
      expect.arrayContaining(['difficulty=easy/hard/medium', 'levels=1-open-ended']),
    );
    expect(spatial?.warnings).not.toContain('no_explicit_difficulty_signal');
    expect(syllablesEt?.difficultySignals).toEqual(
      expect.arrayContaining(['difficulty=easy/hard/medium', 'levels=1-open-ended']),
    );
    expect(syllablesEn?.difficultySignals).toEqual(
      expect.arrayContaining(['difficulty=easy/hard/medium', 'levels=1-open-ended']),
    );
    expect(vocabularyEt?.difficultySignals).toEqual(
      expect.arrayContaining(['difficulty=easy/hard/medium', 'levels=1-open-ended']),
    );
    expect(vocabularyEn?.difficultySignals).toEqual(
      expect.arrayContaining(['difficulty=easy/hard/medium', 'levels=1-open-ended']),
    );
    expect(vocabularyEt?.warnings).not.toContain('no_explicit_difficulty_signal');
    expect(vocabularyEn?.warnings).not.toContain('no_explicit_difficulty_signal');
    expect(time?.difficultySignals).toContain('levels=1-open-ended');
  });

  it('tracks the expanded balance equation stage pack as level-ranged content', () => {
    const report = buildCurriculumAuditReport();
    const balance = report.packs.find((row) => row.packId === 'math.balance_equations.core');

    expect(balance).toBeDefined();
    expect(balance?.itemCount).toBe(6);
    expect(balance?.difficultySignals).toContain('levels=1-open-ended');
    expect(balance?.warnings).not.toContain('shallow_item_count<6');
    expect(balance?.consumers).toEqual([
      { gameId: 'balance_scale', mechanic: 'balance_scale', mode: 'direct-pack' },
    ]);
  });

  it('tracks the expanded time reading stage pack as level-ranged content', () => {
    const report = buildCurriculumAuditReport();
    const time = report.packs.find((row) => row.packId === 'math.time_reading.core');

    expect(time).toBeDefined();
    expect(time?.itemCount).toBe(8);
    expect(time?.itemKinds).toEqual({ stage: 8 });
    expect(time?.difficultySignals).toContain('levels=1-open-ended');
    expect(time?.warnings).not.toContain('shallow_item_count<6');
    expect(time?.consumers).toEqual([
      { gameId: 'time_match', mechanic: 'time_match', mode: 'direct-pack' },
    ]);
  });

  it('tracks the expanded addition memory stage pack as level-ranged content', () => {
    const report = buildCurriculumAuditReport();
    const additionMemory = report.packs.find((row) => row.packId === 'math.addition_memory.core');

    expect(additionMemory).toBeDefined();
    expect(additionMemory?.itemCount).toBe(8);
    expect(additionMemory?.itemKinds).toEqual({ stage: 8 });
    expect(additionMemory?.difficultySignals).toContain('levels=1-open-ended');
    expect(additionMemory?.warnings).not.toContain('shallow_item_count<6');
    expect(additionMemory?.consumers).toEqual([
      { gameId: 'memory_math', mechanic: 'memory_math', mode: 'direct-pack' },
    ]);
  });
});
