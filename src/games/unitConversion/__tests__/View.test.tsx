import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { UnitConversionView } from '../View';
import { generateUnitConversion } from '../generator';
import { createRng } from '../../../engine/rng';

vi.mock('../../../engine/audio', () => ({ playSound: vi.fn() }));

describe('UnitConversionView', () => {
  it('records one answer for two quick taps on the right value', () => {
    const problem = generateUnitConversion(2, createRng(5));
    const onAnswer = vi.fn();
    render(<UnitConversionView problem={problem} onAnswer={onAnswer} soundEnabled={false} />);

    const button = screen.getByRole('button', { name: `${problem.answer} ${problem.toUnit}` });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });
});
