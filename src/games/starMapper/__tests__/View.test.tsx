import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StarMapperView } from '../View';
import { setLocale } from '../../../i18n';
import {
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
  getConstellationById,
} from '../../../curriculum/packs/astronomy/visibleFromEstonia';
import type { StarMapperProblem } from '../../../types/game';

vi.mock('../../../engine/audio', () => ({ playSound: vi.fn() }));

const traceProblem = (id: string): StarMapperProblem => {
  const constellation = getConstellationById(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items, id);
  if (!constellation) throw new Error(`No constellation ${id}`);
  return {
    type: 'star_mapper',
    uid: id,
    mode: 'trace',
    constellation,
    distractorStars: [],
    showGuide: true,
    correctAnswer: id,
    playerLines: [],
  };
};

describe('StarMapperView', () => {
  beforeEach(() => {
    setLocale('et');
  });

  it('names a constellation once when its folk name is the same', () => {
    render(
      <StarMapperView
        problem={traceProblem('ursa_minor')}
        onAnswer={vi.fn()}
        soundEnabled={false}
      />,
    );
    expect(screen.getAllByText('Väike Vanker')).toHaveLength(1);
  });

  it('labels each star in Estonian, by name where it has one', () => {
    render(
      <StarMapperView problem={traceProblem('lyra')} onAnswer={vi.fn()} soundEnabled={false} />,
    );
    expect(screen.getByRole('button', { name: 'Täht Vega' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Täht 2' })).toBeTruthy();
  });
});
