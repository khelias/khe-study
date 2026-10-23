import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { PatternTrainView } from '../View';
import type { PatternProblem } from '../../../types/game';

vi.mock('../../../engine/audio', () => ({ playSound: vi.fn() }));

const problem: PatternProblem = {
  type: 'pattern',
  sequence: ['🏀', '🏀', '⚽', '🏀', '🏀'],
  answer: '⚽',
  options: ['🎾', '⚽', '🎱'],
  patternRule: 'repeat_aab',
  patternCycle: ['🏀', '🏀', '⚽'],
  uid: 'p1',
};

describe('PatternTrainView', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('scrolls a train wider than the screen to the empty wagon once it has arrived', () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(384);
    render(<PatternTrainView problem={problem} onAnswer={vi.fn()} soundEnabled={false} />);
    const track = screen.getByText('?').closest('.overflow-x-auto');
    expect(track?.scrollLeft).toBe(0);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(track?.scrollLeft).toBe(384);
  });
});
