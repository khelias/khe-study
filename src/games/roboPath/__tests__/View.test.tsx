/**
 * A failed program costs a round life (the handler's part) and clears the
 * program so the same task starts again (the view's part): Phase 1.7's
 * failure table, khe-meta plan study-game-feel-and-progression, Run 3.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '../../../i18n';
import type { RoboPathProblem } from '../../../types/game';
import { RoboPathView } from '../View';

vi.mock('../../../engine/audio', () => ({ playSound: vi.fn(), playMoment: vi.fn() }));

const problem: RoboPathProblem = {
  type: 'robo_path',
  uid: 'robo-1',
  grid: [
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  gridSize: 3,
  start: [0, 0],
  goal: [2, 2],
  obstacles: [[1, 0]],
  correctPath: ['DOWN', 'DOWN', 'RIGHT', 'RIGHT'],
  options: [],
  optimalMoves: 4,
};

describe('RoboPathView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setLocale('et');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function run(onAnswer: (answer: boolean) => void) {
    fireEvent.click(screen.getByRole('button', { name: 'Käivita robot' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400 * 4);
    });
    expect(onAnswer).toHaveBeenCalledOnce();
    expect(onAnswer).toHaveBeenCalledWith(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
  }

  it('a crash reports a failure once and clears the program for the same task', async () => {
    const onAnswer = vi.fn();
    render(<RoboPathView problem={problem} onAnswer={onAnswer} soundEnabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Paremale' }));

    await run(onAnswer);

    expect(screen.getByText('Lisa käsud...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paremale' })).toBeEnabled();
  });

  it('a program that stops short of the goal reports a failure and clears it too', async () => {
    const onAnswer = vi.fn();
    render(<RoboPathView problem={problem} onAnswer={onAnswer} soundEnabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Alla' }));

    await run(onAnswer);

    expect(screen.getByText('Lisa käsud...')).toBeInTheDocument();
  });
});
