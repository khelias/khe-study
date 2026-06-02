/**
 * Snake-family registrations. See src/games/balanceScale/register.ts for the
 * established colocation pattern (ADR-0001, Phase 1.6).
 *
 * One mechanic (MathSnakeView + mathSnake engine), six skills. Each binding is a
 * distinct menu card bound to a focused ArithmeticSpec pack. Add a new
 * operation / range by writing one pack + one binding; no engine code.
 */

import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_ADDITION_WITHIN_100_SKILL,
  MATH_SUBTRACTION_WITHIN_20_SKILL,
  MATH_SUBTRACTION_WITHIN_100_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
} from '../../curriculum/skills/math';
import { MATH_ADDITION_WITHIN_20_PACK } from '../../curriculum/packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../../curriculum/packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../../curriculum/packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../../curriculum/packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../../curriculum/packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../../curriculum/packs/math/multiplication_1_10';
import { MathSnakeView } from './View';
import { gameRegistry } from '../registry';
import {
  ADDITION_SNAKE_CONFIG,
  ADDITION_BIG_SNAKE_CONFIG,
  SUBTRACTION_SNAKE_CONFIG,
  SUBTRACTION_BIG_SNAKE_CONFIG,
  MULTIPLICATION_SNAKE_CONFIG,
  MULTIPLICATION_BIG_SNAKE_CONFIG,
} from './config';
import {
  generateAdditionSnake,
  generateAdditionBigSnake,
  generateSubtractionSnake,
  generateSubtractionBigSnake,
  generateMultiplicationSnake,
  generateMultiplicationBigSnake,
} from './generator';
import { validateMathSnake } from './validator';

// Addition kuni 20
gameRegistry.register({
  id: 'addition_snake',
  component: MathSnakeView,
  generator: generateAdditionSnake,
  config: ADDITION_SNAKE_CONFIG,
  validator: validateMathSnake,
  skillIds: [MATH_ADDITION_WITHIN_20_SKILL.id],
  contentPackId: MATH_ADDITION_WITHIN_20_PACK.id,
});

// Addition kuni 100
gameRegistry.register({
  id: 'addition_big_snake',
  component: MathSnakeView,
  generator: generateAdditionBigSnake,
  config: ADDITION_BIG_SNAKE_CONFIG,
  validator: validateMathSnake,
  skillIds: [MATH_ADDITION_WITHIN_100_SKILL.id],
  contentPackId: MATH_ADDITION_WITHIN_100_PACK.id,
});

// Subtraction kuni 20
gameRegistry.register({
  id: 'subtraction_snake',
  component: MathSnakeView,
  generator: generateSubtractionSnake,
  config: SUBTRACTION_SNAKE_CONFIG,
  validator: validateMathSnake,
  skillIds: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
  contentPackId: MATH_SUBTRACTION_WITHIN_20_PACK.id,
});

// Subtraction kuni 100
gameRegistry.register({
  id: 'subtraction_big_snake',
  component: MathSnakeView,
  generator: generateSubtractionBigSnake,
  config: SUBTRACTION_BIG_SNAKE_CONFIG,
  validator: validateMathSnake,
  skillIds: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
  contentPackId: MATH_SUBTRACTION_WITHIN_100_PACK.id,
});

// Multiplication 1–5 — cosmic theme, 2. klass
gameRegistry.register({
  id: 'multiplication_snake',
  component: MathSnakeView,
  generator: generateMultiplicationSnake,
  config: MULTIPLICATION_SNAKE_CONFIG,
  validator: validateMathSnake,
  skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
  contentPackId: MATH_MULTIPLICATION_1_5_PACK.id,
});

// Multiplication 1–10 — cosmic theme, 3. klass
gameRegistry.register({
  id: 'multiplication_big_snake',
  component: MathSnakeView,
  generator: generateMultiplicationBigSnake,
  config: MULTIPLICATION_BIG_SNAKE_CONFIG,
  validator: validateMathSnake,
  skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
  contentPackId: MATH_MULTIPLICATION_1_10_PACK.id,
});
