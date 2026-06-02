/**
 * Game Registrations
 *
 * This file registers all games with the game registry.
 * To add a new game:
 * 1. Create the game view component
 * 2. Create the generator function
 * 3. Create the validator function
 * 4. Add registration here
 *
 * Games are automatically registered when this module is imported.
 */

import { gameRegistry } from './registry';
import { GAME_CONFIG } from './data';
import { Generators } from './generators';
// Side-effect import: registers skills + content packs before any mechanic binding
// below references them by id.
import '../curriculum';
// Per-mechanic register modules (ADR-0001 colocation pattern). Each module
// has a side effect: it registers its binding with `gameRegistry` on import.
import './balanceScale/register';
import './timeMatch/register';
import './compareSizes/register';
import './unitConversion/register';
import './pattern/register';
import './memoryMath/register';
import './picturePairs/register';
import './syllableBuilder/register';
import './letterMatch/register';
import './sentenceLogic/register';
import './starMapper/register';
import './roboPath/register';
import './wordBuilder/register';
import './wordCascade/register';
import './shapeShift/register';
import {
  MATH_ADDITION_WITHIN_20_SKILL,
  MATH_ADDITION_WITHIN_100_SKILL,
  MATH_SUBTRACTION_WITHIN_20_SKILL,
  MATH_SUBTRACTION_WITHIN_100_SKILL,
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
  MATH_DIVISION_FACTS_1_TO_5_SKILL,
  MATH_DIVISION_FACTS_1_TO_10_SKILL,
} from '../curriculum/skills/math';
import { MATH_ADDITION_WITHIN_20_PACK } from '../curriculum/packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../curriculum/packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../curriculum/packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../curriculum/packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../curriculum/packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../curriculum/packs/math/multiplication_1_10';
import { MATH_DIVISION_FACTS_1_5_PACK } from '../curriculum/packs/math/division_facts_1_5';
import { MATH_DIVISION_FACTS_1_10_PACK } from '../curriculum/packs/math/division_facts_1_10';
import { MATH_GEOMETRY_SHAPES_PACK } from '../curriculum/packs/math/geometry_shapes';
import {
  MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_PACK,
  MATH_BATTLELEARN_PACK,
} from '../curriculum/packs/math/battlelearn';
import { ShapeDashView, BattleLearnView, FactDrillView } from '../components/gameViews';
import { MathSnakeView } from '../components/MathSnakeView';
import {
  validateMathSnake,
  validateShapeDash,
  validateBattleLearn,
  validateFactDrill,
} from './validators';

/**
 * Register all games with the registry
 *
 * This function is called automatically when the module is imported.
 */
function registerAllGames(): void {
  // Word Builder: registration in src/games/wordBuilder/register.ts.

  // Word Cascade (core + long bindings): registration in
  // src/games/wordCascade/register.ts.

  // Syllable Builder: registration in src/games/syllableBuilder/register.ts.

  // Pattern Train: registration in src/games/pattern/register.ts.

  // Sentence Logic: registration in src/games/sentenceLogic/register.ts.

  // Memory Math: registration in src/games/memoryMath/register.ts.

  // Picture Pairs: registration in src/games/picturePairs/register.ts.

  // Robo Path: registration in src/games/roboPath/register.ts.

  // -------------------------------------------------------------------------
  // Snake family — one mechanic (MathSnakeView + mathSnake engine), many skills.
  // Each binding is a distinct menu card bound to a focused ArithmeticSpec pack.
  // Add a new operation / range by writing one pack + one binding; no engine code.
  // -------------------------------------------------------------------------

  // Addition kuni 20
  const additionSnakeConfig = GAME_CONFIG.addition_snake;
  const additionSnakeGenerator = Generators.addition_snake;
  if (additionSnakeConfig && additionSnakeGenerator) {
    gameRegistry.register({
      id: 'addition_snake',
      component: MathSnakeView,
      generator: additionSnakeGenerator,
      config: additionSnakeConfig,
      validator: validateMathSnake,
      skillIds: [MATH_ADDITION_WITHIN_20_SKILL.id],
      contentPackId: MATH_ADDITION_WITHIN_20_PACK.id,
    });
  }

  // Addition kuni 100
  const additionBigSnakeConfig = GAME_CONFIG.addition_big_snake;
  const additionBigSnakeGenerator = Generators.addition_big_snake;
  if (additionBigSnakeConfig && additionBigSnakeGenerator) {
    gameRegistry.register({
      id: 'addition_big_snake',
      component: MathSnakeView,
      generator: additionBigSnakeGenerator,
      config: additionBigSnakeConfig,
      validator: validateMathSnake,
      skillIds: [MATH_ADDITION_WITHIN_100_SKILL.id],
      contentPackId: MATH_ADDITION_WITHIN_100_PACK.id,
    });
  }

  // Subtraction kuni 20
  const subtractionSnakeConfig = GAME_CONFIG.subtraction_snake;
  const subtractionSnakeGenerator = Generators.subtraction_snake;
  if (subtractionSnakeConfig && subtractionSnakeGenerator) {
    gameRegistry.register({
      id: 'subtraction_snake',
      component: MathSnakeView,
      generator: subtractionSnakeGenerator,
      config: subtractionSnakeConfig,
      validator: validateMathSnake,
      skillIds: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
      contentPackId: MATH_SUBTRACTION_WITHIN_20_PACK.id,
    });
  }

  // Subtraction kuni 100
  const subtractionBigSnakeConfig = GAME_CONFIG.subtraction_big_snake;
  const subtractionBigSnakeGenerator = Generators.subtraction_big_snake;
  if (subtractionBigSnakeConfig && subtractionBigSnakeGenerator) {
    gameRegistry.register({
      id: 'subtraction_big_snake',
      component: MathSnakeView,
      generator: subtractionBigSnakeGenerator,
      config: subtractionBigSnakeConfig,
      validator: validateMathSnake,
      skillIds: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
      contentPackId: MATH_SUBTRACTION_WITHIN_100_PACK.id,
    });
  }

  // Multiplication 1–5 — cosmic theme, 2. klass
  const multiplicationSnakeConfig = GAME_CONFIG.multiplication_snake;
  const multiplicationSnakeGenerator = Generators.multiplication_snake;
  if (multiplicationSnakeConfig && multiplicationSnakeGenerator) {
    gameRegistry.register({
      id: 'multiplication_snake',
      component: MathSnakeView,
      generator: multiplicationSnakeGenerator,
      config: multiplicationSnakeConfig,
      validator: validateMathSnake,
      skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_5_PACK.id,
    });
  }

  // Multiplication 1–10 — cosmic theme, 3. klass
  const multiplicationBigSnakeConfig = GAME_CONFIG.multiplication_big_snake;
  const multiplicationBigSnakeGenerator = Generators.multiplication_big_snake;
  if (multiplicationBigSnakeConfig && multiplicationBigSnakeGenerator) {
    gameRegistry.register({
      id: 'multiplication_big_snake',
      component: MathSnakeView,
      generator: multiplicationBigSnakeGenerator,
      config: multiplicationBigSnakeConfig,
      validator: validateMathSnake,
      skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_10_PACK.id,
    });
  }

  // -------------------------------------------------------------------------
  // Fact Drill family — one mechanic (FactDrillView + factDrill engine), many
  // skills. Each binding reuses the same engine + view; the only per-binding
  // data is the factor range + skill + pack. Future addition / subtraction
  // fact sidumised land as data-only changes (one generator + one binding).
  // -------------------------------------------------------------------------

  const multiplicationFactDrill1To5Config = GAME_CONFIG.multiplication_fact_drill_1_5;
  const multiplicationFactDrill1To5Generator = Generators.multiplication_fact_drill_1_5;
  if (multiplicationFactDrill1To5Config && multiplicationFactDrill1To5Generator) {
    gameRegistry.register({
      id: 'multiplication_fact_drill_1_5',
      component: FactDrillView,
      generator: multiplicationFactDrill1To5Generator,
      config: multiplicationFactDrill1To5Config,
      validator: validateFactDrill,
      skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_5_PACK.id,
    });
  }

  const multiplicationFactDrill1To10Config = GAME_CONFIG.multiplication_fact_drill_1_10;
  const multiplicationFactDrill1To10Generator = Generators.multiplication_fact_drill_1_10;
  if (multiplicationFactDrill1To10Config && multiplicationFactDrill1To10Generator) {
    gameRegistry.register({
      id: 'multiplication_fact_drill_1_10',
      component: FactDrillView,
      generator: multiplicationFactDrill1To10Generator,
      config: multiplicationFactDrill1To10Config,
      validator: validateFactDrill,
      skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
      contentPackId: MATH_MULTIPLICATION_1_10_PACK.id,
    });
  }

  const additionFactDrillWithin20Config = GAME_CONFIG.addition_fact_drill_within_20;
  const additionFactDrillWithin20Generator = Generators.addition_fact_drill_within_20;
  if (additionFactDrillWithin20Config && additionFactDrillWithin20Generator) {
    gameRegistry.register({
      id: 'addition_fact_drill_within_20',
      component: FactDrillView,
      generator: additionFactDrillWithin20Generator,
      config: additionFactDrillWithin20Config,
      validator: validateFactDrill,
      skillIds: [MATH_ADDITION_WITHIN_20_SKILL.id],
      contentPackId: MATH_ADDITION_WITHIN_20_PACK.id,
    });
  }

  const additionFactDrillWithin100Config = GAME_CONFIG.addition_fact_drill_within_100;
  const additionFactDrillWithin100Generator = Generators.addition_fact_drill_within_100;
  if (additionFactDrillWithin100Config && additionFactDrillWithin100Generator) {
    gameRegistry.register({
      id: 'addition_fact_drill_within_100',
      component: FactDrillView,
      generator: additionFactDrillWithin100Generator,
      config: additionFactDrillWithin100Config,
      validator: validateFactDrill,
      skillIds: [MATH_ADDITION_WITHIN_100_SKILL.id],
      contentPackId: MATH_ADDITION_WITHIN_100_PACK.id,
    });
  }

  const subtractionFactDrillWithin20Config = GAME_CONFIG.subtraction_fact_drill_within_20;
  const subtractionFactDrillWithin20Generator = Generators.subtraction_fact_drill_within_20;
  if (subtractionFactDrillWithin20Config && subtractionFactDrillWithin20Generator) {
    gameRegistry.register({
      id: 'subtraction_fact_drill_within_20',
      component: FactDrillView,
      generator: subtractionFactDrillWithin20Generator,
      config: subtractionFactDrillWithin20Config,
      validator: validateFactDrill,
      skillIds: [MATH_SUBTRACTION_WITHIN_20_SKILL.id],
      contentPackId: MATH_SUBTRACTION_WITHIN_20_PACK.id,
    });
  }

  const subtractionFactDrillWithin100Config = GAME_CONFIG.subtraction_fact_drill_within_100;
  const subtractionFactDrillWithin100Generator = Generators.subtraction_fact_drill_within_100;
  if (subtractionFactDrillWithin100Config && subtractionFactDrillWithin100Generator) {
    gameRegistry.register({
      id: 'subtraction_fact_drill_within_100',
      component: FactDrillView,
      generator: subtractionFactDrillWithin100Generator,
      config: subtractionFactDrillWithin100Config,
      validator: validateFactDrill,
      skillIds: [MATH_SUBTRACTION_WITHIN_100_SKILL.id],
      contentPackId: MATH_SUBTRACTION_WITHIN_100_PACK.id,
    });
  }

  const divisionFactDrill1To5Config = GAME_CONFIG.division_fact_drill_1_5;
  const divisionFactDrill1To5Generator = Generators.division_fact_drill_1_5;
  if (divisionFactDrill1To5Config && divisionFactDrill1To5Generator) {
    gameRegistry.register({
      id: 'division_fact_drill_1_5',
      component: FactDrillView,
      generator: divisionFactDrill1To5Generator,
      config: divisionFactDrill1To5Config,
      validator: validateFactDrill,
      skillIds: [MATH_DIVISION_FACTS_1_TO_5_SKILL.id],
      contentPackId: MATH_DIVISION_FACTS_1_5_PACK.id,
    });
  }

  const divisionFactDrill1To10Config = GAME_CONFIG.division_fact_drill_1_10;
  const divisionFactDrill1To10Generator = Generators.division_fact_drill_1_10;
  if (divisionFactDrill1To10Config && divisionFactDrill1To10Generator) {
    gameRegistry.register({
      id: 'division_fact_drill_1_10',
      component: FactDrillView,
      generator: divisionFactDrill1To10Generator,
      config: divisionFactDrill1To10Config,
      validator: validateFactDrill,
      skillIds: [MATH_DIVISION_FACTS_1_TO_10_SKILL.id],
      contentPackId: MATH_DIVISION_FACTS_1_10_PACK.id,
    });
  }

  // Letter Match: registration in src/games/letterMatch/register.ts.

  // Balance Scale: registration side-effect lives in the mechanic folder.
  // See src/games/balanceScale/register.ts.

  // Time Match: registration in src/games/timeMatch/register.ts.

  // Compare Sizes: registration in src/games/compareSizes/register.ts.

  // Unit Conversion: registration in src/games/unitConversion/register.ts.

  // Star Mapper: registration in src/games/starMapper/register.ts.

  // Shape Shift: registration in src/games/shapeShift/register.ts.

  // Shape Dash (Geometry Dash–inspired runner with geometry checkpoints)
  const shapeDashConfig = GAME_CONFIG.shape_dash;
  const shapeDashGenerator = Generators.shape_dash;
  if (shapeDashConfig && shapeDashGenerator) {
    gameRegistry.register({
      id: 'shape_dash',
      component: ShapeDashView,
      generator: shapeDashGenerator,
      config: shapeDashConfig,
      validator: validateShapeDash,
      skillIds: [MATH_GEOMETRY_SHAPES_VERBAL_SKILL.id],
      contentPackId: MATH_GEOMETRY_SHAPES_PACK.id,
    });
  }

  // BattleLearn (profile-based difficulty in generator)
  const battlelearnConfig = GAME_CONFIG.battlelearn;
  const battlelearnGenerator = Generators.battlelearn;
  if (battlelearnConfig && battlelearnGenerator) {
    gameRegistry.register({
      id: 'battlelearn',
      component: BattleLearnView,
      generator: battlelearnGenerator,
      config: battlelearnConfig,
      validator: validateBattleLearn,
      skillIds: [MATH_MIXED_PROBLEM_SOLVING_SKILL.id],
      contentPackId: MATH_BATTLELEARN_PACK.id,
    });
  }

  const battlelearnMultiplicationConfig = GAME_CONFIG.battlelearn_multiplication;
  if (battlelearnMultiplicationConfig && battlelearnGenerator) {
    gameRegistry.register({
      id: 'battlelearn_multiplication',
      component: BattleLearnView,
      generator: battlelearnGenerator,
      config: battlelearnMultiplicationConfig,
      validator: validateBattleLearn,
      skillIds: [MATH_MULTIPLICATION_1_TO_10_SKILL.id],
      contentPackId: MATH_BATTLELEARN_MULTIPLICATION_PACK.id,
    });
  }

  const battlelearnMultiplication1To5Config = GAME_CONFIG.battlelearn_multiplication_1_5;
  if (battlelearnMultiplication1To5Config && battlelearnGenerator) {
    gameRegistry.register({
      id: 'battlelearn_multiplication_1_5',
      component: BattleLearnView,
      generator: battlelearnGenerator,
      config: battlelearnMultiplication1To5Config,
      validator: validateBattleLearn,
      skillIds: [MATH_MULTIPLICATION_1_TO_5_SKILL.id],
      contentPackId: MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK.id,
    });
  }
}

// Auto-register games when module is imported
registerAllGames();
