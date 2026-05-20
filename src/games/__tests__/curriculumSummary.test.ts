import { describe, expect, it } from 'vitest';
import { getGameCurriculumSummary } from '../curriculumSummary';

describe('game curriculum summaries', () => {
  it('summarizes direct content-pack bindings with difficulty tiers', () => {
    const summary = getGameCurriculumSummary('shape_shift', 'et');

    expect(summary).toMatchObject({
      packId: 'math.geometry_shapes.shape_shift_puzzles',
      packTitle: 'Kujundite ladumise pusled',
      itemCount: 25,
      difficultyLabels: ['lihtne', 'keskmine', 'raske'],
      focusLabels: [],
    });
    expect(summary?.label).toBe(
      'Kujundite ladumise pusled · 25 sisuühikut · lihtne / keskmine / raske',
    );
  });

  it('chooses locale-specific packs for skill-only vocabulary bindings', () => {
    const etSummary = getGameCurriculumSummary('word_builder', 'et');
    const enSummary = getGameCurriculumSummary('word_builder', 'en');

    expect(etSummary).toMatchObject({
      packId: 'language.vocabulary.et',
      packTitle: 'Eesti sõnavara',
      itemCount: 200,
      difficultyLabels: ['lihtne', 'keskmine', 'raske'],
    });
    expect(etSummary?.label).toContain('3 fookust');

    expect(enSummary).toMatchObject({
      packId: 'language.vocabulary.en',
      packTitle: 'English vocabulary',
      itemCount: 90,
      difficultyLabels: ['easy', 'medium', 'hard'],
    });
    expect(enSummary?.label).toContain('3 focus areas');
    expect(enSummary?.title).toContain('Read short 3-4 letter words');
  });

  it('summarizes the long word cascade binding from the long vocabulary packs', () => {
    const summary = getGameCurriculumSummary('word_cascade_long', 'et');

    expect(summary).toMatchObject({
      packId: 'language.vocabulary.long_words.et',
      packTitle: 'Pikad sõnad',
      itemCount: 20,
      difficultyLabels: ['raske'],
      focusLabels: ['Pikemate 8-11-täheliste sõnade lugemine Sõnakoses'],
    });
  });

  it('keeps small DSL-spec packs visible without inventing difficulty metadata', () => {
    const summary = getGameCurriculumSummary('addition_snake', 'et');

    expect(summary).toMatchObject({
      packId: 'math.addition_within_20',
      packTitle: 'Liitmine kuni 20',
      itemCount: 2,
      difficultyLabels: [],
      focusLabels: [],
      label: 'Liitmine kuni 20 · 2 sisuühikut',
    });
  });

  it('returns null for games without registry bindings', () => {
    expect(getGameCurriculumSummary('unknown_game', 'et')).toBeNull();
  });
});
