import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TimeGameView } from '../View';
import { generateTimeMatch } from '../generator';
import { timeMatchLabel } from '../labels';
import { createRng } from '../../../engine/rng';
import { et } from '../../../i18n/locales/et';

vi.mock('../../../engine/audio', () => ({ playSound: vi.fn(), playMoment: vi.fn() }));

describe('TimeGameView', () => {
  it('records one answer for two quick taps on the right time', () => {
    const problem = generateTimeMatch(3, createRng(5));
    const onAnswer = vi.fn();
    render(<TimeGameView problem={problem} onAnswer={onAnswer} soundEnabled={false} />);

    const button = screen.getByRole('button', {
      name: timeMatchLabel(problem.answer, problem.labelStyle, et),
    });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(true, { revealed: false });
  });
});
