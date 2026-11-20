import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
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

  describe('a wrong answer', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('reports a failure once and clears the board for the same task', () => {
      const ids = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items.slice(0, 4).map((c) => c.id);
      const correct = ids[0]!;
      const onAnswer = vi.fn();
      render(
        <StarMapperView
          problem={{ ...traceProblem(correct), mode: 'identify', options: ids }}
          onAnswer={onAnswer}
          soundEnabled={false}
        />,
      );
      // The four answer options, in the problem's order: the last one is wrong.
      const options = screen
        .getAllByRole('button')
        .filter((b): b is HTMLButtonElement => b.closest('.grid') !== null && !!b.textContent);
      expect(options).toHaveLength(4);

      fireEvent.pointerUp(options[3]!, { button: 0, pointerType: 'mouse' });
      // While the wrong answer shows, only the right option can be picked.
      expect(options.filter((b) => !b.disabled)).toEqual([options[0]]);
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(onAnswer).toHaveBeenCalledOnce();
      expect(onAnswer).toHaveBeenCalledWith(false);
      // Back to idle: every option can be picked again.
      expect(options.every((b) => !b.disabled)).toBe(true);
    });

    it('no lines left: the drawing reports a failure once and the board clears', () => {
      const problem = { ...traceProblem('ursa_minor'), showGuide: false };
      const { stars, lines } = problem.constellation;
      const isRequired = (a: string, b: string) =>
        lines.some((l) => (l.from === a && l.to === b) || (l.from === b && l.to === a));
      const wrongPairs: Array<[string, string]> = [];
      for (const a of stars) {
        for (const b of stars) {
          if (a.id < b.id && !isRequired(a.id, b.id)) wrongPairs.push([a.id, b.id]);
        }
      }
      const onAnswer = vi.fn();
      const { container } = render(
        <StarMapperView problem={problem} onAnswer={onAnswer} soundEnabled={false} />,
      );
      const starTarget = (id: string) =>
        container.querySelectorAll('circle[role="button"]')[stars.findIndex((s) => s.id === id)]!;
      const drawnLines = () => container.querySelectorAll('svg line').length;
      const empty = drawnLines();

      for (const [a, b] of wrongPairs.slice(0, lines.length)) {
        fireEvent.click(starTarget(a));
        fireEvent.click(starTarget(b));
      }
      expect(drawnLines()).toBeGreaterThan(empty);
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(onAnswer).toHaveBeenCalledOnce();
      expect(onAnswer).toHaveBeenCalledWith(false);
      expect(drawnLines()).toBe(empty);
    });
  });
});
