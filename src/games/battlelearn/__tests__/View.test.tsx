import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BattleLearnView } from '../View';
import { generateBattleLearn } from '../generator';
import { createRng } from '../../../engine/rng';
import { usePlaySessionStore } from '../../../stores/playSessionStore';

vi.mock('../../../engine/audio', () => ({
  playSound: vi.fn(),
}));

const START = new Date('2026-01-01T10:00:00Z').getTime();

describe('BattleLearnView response timing', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: START });
    usePlaySessionStore.getState().resetSessionState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('restarts the response timer when a problem cell opens the question', () => {
    const problem = generateBattleLearn(1, createRng(4));
    usePlaySessionStore.getState().setProblem(problem);
    const row = problem.cellGrid.findIndex((cells) => cells.includes('problem'));
    const col = problem.cellGrid[row]?.indexOf('problem') ?? -1;
    expect(col).toBeGreaterThanOrEqual(0);

    render(<BattleLearnView problem={problem} onAnswer={vi.fn()} soundEnabled={false} />);
    vi.setSystemTime(START + 30_000);
    fireEvent.click(screen.getByTestId(`battlelearn-cell-${row}-${col}`));

    expect(usePlaySessionStore.getState().problemStartedAt).toBe(START + 30_000);
  });
});
