import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BalanceScaleView } from '../View';
import { generateBalanceScale } from '../generator';
import { createRng } from '../../../engine/rng';
import type { BalanceScaleProblem } from '../../../types/game';

vi.mock('../../../engine/audio', () => ({ playSound: vi.fn(), playMoment: vi.fn() }));

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
    expect(onAnswer).toHaveBeenCalledWith(true, { revealed: false });
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

    expect(onAnswer.mock.calls).toEqual([[false], [true, { revealed: true }]]);
  });

  it('weighs two unknowns on the left against three weights, and the picked one stands in', () => {
    const problem: BalanceScaleProblem = {
      type: 'balance_scale',
      display: { left: [], right: [5, 4, 7], hidden: { side: 'left', count: 2 } },
      answer: 8,
      options: [6, 7, 8, 9],
      uid: 'two-unknowns',
    };
    const onAnswer = vi.fn();
    const { container } = render(
      <BalanceScaleView problem={problem} onAnswer={onAnswer} soundEnabled={false} />,
    );
    const weights = () =>
      Array.from(container.querySelectorAll('svg text')).map((text) => text.textContent);
    expect(weights().filter((text) => text === '?')).toHaveLength(2);
    expect(weights()).toEqual(expect.arrayContaining(['5', '4', '7']));

    fireEvent.click(screen.getByRole('button', { name: '7' }));
    expect(weights().filter((text) => text === '7')).toHaveLength(3);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(weights().filter((text) => text === '?')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: '8' }));
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(onAnswer.mock.calls).toEqual([[false], [true, { revealed: true }]]);
  });
});
