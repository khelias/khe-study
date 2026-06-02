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
import './mathSnake/register';
import './factDrill/register';
import {
  MATH_MULTIPLICATION_1_TO_5_SKILL,
  MATH_MULTIPLICATION_1_TO_10_SKILL,
  MATH_GEOMETRY_SHAPES_VERBAL_SKILL,
  MATH_MIXED_PROBLEM_SOLVING_SKILL,
} from '../curriculum/skills/math';
import { MATH_GEOMETRY_SHAPES_PACK } from '../curriculum/packs/math/geometry_shapes';
import {
  MATH_BATTLELEARN_MULTIPLICATION_1_5_PACK,
  MATH_BATTLELEARN_MULTIPLICATION_PACK,
  MATH_BATTLELEARN_PACK,
} from '../curriculum/packs/math/battlelearn';
import { ShapeDashView, BattleLearnView } from '../components/gameViews';
import { validateShapeDash, validateBattleLearn } from './validators';

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

  // Snake family (6 bindings): registration in src/games/mathSnake/register.ts.

  // Fact Drill family (8 bindings): registration in src/games/factDrill/register.ts.

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
