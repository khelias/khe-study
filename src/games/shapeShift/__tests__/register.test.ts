import { describe, expect, it } from 'vitest';
import { gameRegistry } from '../../registry';
import { generateShapeShift } from '../generator';
import { createRng } from '../../../engine/rng';
import '../register';

describe('shape_shift registration', () => {
  it('remounts the view when the puzzle changes under the same uid', () => {
    const problem = generateShapeShift(1, createRng(3));

    expect(gameRegistry.get('shape_shift')?.renderKey?.(problem)).toBe(
      `${problem.uid}:${problem.puzzle.id}`,
    );
  });
});
