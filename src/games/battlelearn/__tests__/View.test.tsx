import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BattleLearnView } from '../View';
import { generateBattleLearn } from '../generator';
import { createRng } from '../../../engine/rng';
import { usePlaySessionStore } from '../../../stores/playSessionStore';
import { playSound } from '../../../engine/audio';
import type { BattleLearnCellType, BattleLearnProblem } from '../../../types/game';

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

  it('confirms a won game from the victory screen without answering', () => {
    const onAnswer = vi.fn();
    const won = { ...generateBattleLearn(1, createRng(4)), gameWon: true };

    render(
      <MemoryRouter>
        <BattleLearnView problem={won} onAnswer={onAnswer} soundEnabled={false} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Jätka|Continue/ }));

    expect(onAnswer).toHaveBeenCalledWith(true, undefined, { confirmsGameWin: true });
  });
});

const findCell = (
  problem: BattleLearnProblem,
  type: BattleLearnCellType,
): [number, number] | null => {
  for (let row = 0; row < problem.cellGrid.length; row++) {
    const col = problem.cellGrid[row]?.indexOf(type) ?? -1;
    if (col >= 0) return [row, col];
  }
  return null;
};

const strikeLabel = (): string =>
  screen.getByLabelText(/vee tabamust|water hits/).getAttribute('aria-label') ?? '';

describe('BattleLearnView free water', () => {
  beforeEach(() => {
    usePlaySessionStore.getState().resetSessionState();
    vi.mocked(playSound).mockClear();
  });

  it.each(['star', 'heart'] as const)('a %s cell adds no strike and plays no success', (type) => {
    let problem: BattleLearnProblem | null = null;
    let cell: [number, number] | null = null;
    for (let seed = 1; seed < 200 && !cell; seed++) {
      problem = generateBattleLearn(1, createRng(seed));
      cell = findCell(problem, type);
    }
    if (!problem || !cell) throw new Error(`No ${type} cell in 200 seeds`);
    usePlaySessionStore.getState().setProblem(problem);

    render(<BattleLearnView problem={problem} onAnswer={vi.fn()} soundEnabled={true} />);
    const before = strikeLabel();
    fireEvent.click(screen.getByTestId(`battlelearn-cell-${cell[0]}-${cell[1]}`));

    expect(strikeLabel()).toBe(before);
    expect(vi.mocked(playSound)).not.toHaveBeenCalledWith('success', true);
  });

  it('an empty cell adds a strike', () => {
    const problem = generateBattleLearn(1, createRng(4));
    const cell = findCell(problem, 'empty');
    if (!cell) throw new Error('No empty cell');
    usePlaySessionStore.getState().setProblem(problem);

    render(<BattleLearnView problem={problem} onAnswer={vi.fn()} soundEnabled={true} />);
    const before = strikeLabel();
    fireEvent.click(screen.getByTestId(`battlelearn-cell-${cell[0]}-${cell[1]}`));

    expect(strikeLabel()).not.toBe(before);
  });

  it('opening a question plays no wrong sound', () => {
    const problem = generateBattleLearn(1, createRng(4));
    const cell = findCell(problem, 'problem');
    if (!cell) throw new Error('No problem cell');
    usePlaySessionStore.getState().setProblem(problem);

    render(<BattleLearnView problem={problem} onAnswer={vi.fn()} soundEnabled={true} />);
    fireEvent.click(screen.getByTestId(`battlelearn-cell-${cell[0]}-${cell[1]}`));

    expect(vi.mocked(playSound)).not.toHaveBeenCalledWith('wrong', true);
  });
});
