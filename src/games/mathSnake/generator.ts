import { getPackItems } from '../../curriculum';
import { MATH_ADDITION_WITHIN_20_PACK } from '../../curriculum/packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../../curriculum/packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../../curriculum/packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../../curriculum/packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../../curriculum/packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../../curriculum/packs/math/multiplication_1_10';
import type { ArithmeticSpec } from '../../curriculum/packs/math/types';
import { createMathSnakeProblem } from '../../engine/mathSnake';
import type { MathSnakeProblem, RngFunction } from '../../types/game';

/**
 * Build a snake generator bound to a focused ArithmeticSpec pack. One mechanic
 * (mathSnake engine + MathSnakeView), many skills — each binding resolves its
 * own pack at runtime.
 */
function makeSnakeGenerator(packId: string) {
  return (level: number, rng: RngFunction = Math.random): MathSnakeProblem => {
    const specs = getPackItems<ArithmeticSpec>(packId);
    return createMathSnakeProblem(specs, level, rng);
  };
}

export const generateAdditionSnake = makeSnakeGenerator(MATH_ADDITION_WITHIN_20_PACK.id);
export const generateAdditionBigSnake = makeSnakeGenerator(MATH_ADDITION_WITHIN_100_PACK.id);
export const generateSubtractionSnake = makeSnakeGenerator(MATH_SUBTRACTION_WITHIN_20_PACK.id);
export const generateSubtractionBigSnake = makeSnakeGenerator(MATH_SUBTRACTION_WITHIN_100_PACK.id);
export const generateMultiplicationSnake = makeSnakeGenerator(MATH_MULTIPLICATION_1_5_PACK.id);
export const generateMultiplicationBigSnake = makeSnakeGenerator(MATH_MULTIPLICATION_1_10_PACK.id);
