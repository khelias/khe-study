import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BalanceScaleView } from '../View';
import { generateBalanceScale } from '../generator';
import { createRng } from '../../../engine/rng';

vi.mock('../../../engine/audio', () => ({ playSound: vi.fn() }));

describe('BalanceScaleView', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('records one answer for two taps while the scale settles', () => {
    const problem = generateBalanceScale(2, createRng(5));
    const onAnswer = vi.fn();
    render(<BalanceScaleView problem={problem} onAnswer={onAnswer} soundEnabled={false} />);

    const button = screen.getByRole('button', { name: String(problem.answer) });
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('lets the child try again after a wrong weight', () => {
    const problem = generateBalanceScale(2, createRng(5));
    const wrong = problem.options.find((option) => option !== problem.answer);
    if (wrong === undefined) throw new Error('No wrong option');
    const onAnswer = vi.fn();
    render(<BalanceScaleView problem={problem} onAnswer={onAnswer} soundEnabled={false} />);

    fireEvent.click(screen.getByRole('button', { name: String(wrong) }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    fireEvent.click(screen.getByRole('button', { name: String(problem.answer) }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onAnswer.mock.calls).toEqual([[false], [true]]);
  });
});
