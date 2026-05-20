/**
 * BattleLearn question generators.
 *
 * Extracted from `generators.ts` to keep that file focused on the per-game
 * generator dispatch table. The exported `generateBattleLearnQuestion` is
 * called from `useAnswerHandler` when a player answers and the next question
 * needs to be issued without rebuilding the board.
 *
 * The internal helpers (`generateBattleLearnQuestionForStage`,
 * `generateBattleLearnOptions`, `shuffleOptionsWithCorrect`) are also
 * exported because the `battlelearn` generator in `generators.ts` uses them
 * to build the initial problem.
 */

import { getPackItems } from '../curriculum';
import {
  MATH_BATTLELEARN_PACK,
  getBattleLearnCountObjectLabels,
  getBattleLearnMultiplicationFactStage,
  getBattleLearnQuestionStage,
  getBattleLearnSequencePatterns,
  type BattleLearnCurriculumItem,
  type BattleLearnProfile,
  type BattleLearnQuestionFlow,
  type BattleLearnQuestionKind,
} from '../curriculum/packs/math/battlelearn';
import { getLocale, getTranslations } from '../i18n/index';
import type { RngFunction, BattleLearnProblem } from '../types/game';

/**
 * BattleLearn Question Generators
 * These functions generate different types of questions for the BattleLearn game
 */

// Helper to format translation with parameters
function formatQuestion(template: string, params: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.split(`{${key}}`).join(String(value));
  }
  return result;
}

interface GeneratedBattleLearnQuestion {
  prompt: string;
  correctAnswer: number | string;
}

export function generateBattleLearnQuestionForStage(
  curriculumItems: readonly BattleLearnCurriculumItem[],
  flow: BattleLearnQuestionFlow,
  profile: BattleLearnProfile,
  level: number,
  rng: RngFunction,
  gridSize: number,
): GeneratedBattleLearnQuestion {
  const stage = getBattleLearnQuestionStage(curriculumItems, flow, profile, level);
  const kind = stage.questionKinds[Math.floor(rng() * stage.questionKinds.length)]!;
  return generateBattleLearnQuestionByKind(kind, curriculumItems, level, rng, gridSize);
}

function generateBattleLearnQuestionByKind(
  kind: BattleLearnQuestionKind,
  curriculumItems: readonly BattleLearnCurriculumItem[],
  level: number,
  rng: RngFunction,
  gridSize: number,
): GeneratedBattleLearnQuestion {
  switch (kind) {
    case 'count_ships':
      return generateCountShipsQuestion(level, rng);
    case 'count_objects':
      return generateCountObjectsQuestion(level, rng, curriculumItems);
    case 'simple_addition':
      return generateSimpleAddition(level, rng);
    case 'simple_subtraction':
      return generateSimpleSubtraction(level, rng);
    case 'greater_than':
      return generateGreaterThanQuestion(level, rng);
    case 'less_than':
      return generateLessThanQuestion(level, rng);
    case 'ammunition':
      return generateAmmunitionQuestion(level, rng);
    case 'missing_number_add':
      return generateMissingNumber(level, rng);
    case 'missing_number_sub':
      return generateMissingNumberSub(level, rng);
    case 'word_problem_1':
      return generateWordProblem1(level, rng);
    case 'word_problem_2':
      return generateWordProblem2(level, rng);
    case 'two_step':
      return generateTwoStepProblem(level, rng);
    case 'time_problem':
      return generateTimeProblem(level, rng);
    case 'coin_problem':
      return generateCoinProblem(level, rng);
    case 'navigate':
      return generateNavigateQuestion(level, rng, gridSize);
    case 'sequence_next':
      return generateSequenceQuestion(level, rng, curriculumItems);
    case 'area':
      return generateAreaProblem(level, rng);
    case 'perimeter':
      return generatePerimeterProblem(level, rng);
    case 'word_problem_3':
      return generateWordProblem3(level, rng);
    case 'logic_puzzle':
      return generateLogicPuzzle(level, rng);
    case 'pattern_next':
      return generatePatternQuestion(level, rng, curriculumItems);
    case 'distance':
      return generateDistanceQuestion(level, rng, gridSize);
    case 'multi_move':
      return generateMultiMoveQuestion(level, rng, gridSize);
    case 'fleet_multiply':
      return generateFleetMultiplyQuestion(level, rng);
    case 'multiplication_fact':
      return generateMultiplicationFactQuestion(level, rng, curriculumItems);
    case 'formation_count':
      return generateFormationCount(level, rng);
    case 'vector_add':
      return generateVectorAddition(level, rng);
  }
  const exhaustive: never = kind;
  void exhaustive;
  throw new Error('Unsupported BattleLearn question kind');
}

export function generateBattleLearnOptions(
  correctAnswer: number | string,
  gridSize: number,
  rng: RngFunction,
): string[] {
  if (
    typeof correctAnswer === 'string' &&
    (correctAnswer.includes('-') || correctAnswer.includes('('))
  ) {
    return generateCoordinateOptions(correctAnswer, gridSize, rng);
  }
  if (correctAnswer === '>' || correctAnswer === '<' || correctAnswer === '=') {
    return ['>', '<', '='];
  }
  return generateOptions(correctAnswer as number, 4, rng);
}

// Starter Profile Question Generators (Level 1-3: Basic counting/arithmetic)

function generateCountShipsQuestion(
  level: number,
  _rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const shipCount = Math.min(level + 1, 10);
  const shipEmoji = '🚢 '.repeat(shipCount);
  return {
    prompt: `${shipEmoji}\n${t.battlelearn.questions.countShips}`,
    correctAnswer: shipCount,
  };
}

function generateSimpleAddition(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 5) + 1;
  return {
    prompt: formatQuestion(t.battlelearn.questions.simpleAddition, { a, b }),
    correctAnswer: a + b,
  };
}

function generateSimpleSubtraction(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const a = Math.floor(rng() * 10) + 5;
  const b = Math.floor(rng() * (a - 1)) + 1;
  return {
    prompt: formatQuestion(t.battlelearn.questions.simpleSubtraction, { a, b }),
    correctAnswer: a - b,
  };
}

function generateGreaterThanQuestion(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const a = Math.floor(rng() * 10) + 1;
  const b = Math.floor(rng() * 10) + 1;
  const larger = Math.max(a, b);
  return {
    prompt: formatQuestion(t.battlelearn.questions.greaterThan, { a, b }),
    correctAnswer: larger,
  };
}

function generateLessThanQuestion(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const a = Math.floor(rng() * 10) + 1;
  const b = Math.floor(rng() * 10) + 1;
  const smaller = Math.min(a, b);
  return {
    prompt: formatQuestion(t.battlelearn.questions.lessThan, { a, b }),
    correctAnswer: smaller,
  };
}

// Starter Profile Question Generators (Level 4-6: Subtraction/addition)

function generateAmmunitionQuestion(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const total = Math.floor(rng() * 10) + 10;
  const fired = Math.floor(rng() * 5) + 3;
  return {
    prompt: formatQuestion(t.battlelearn.questions.ammunition, { total, fired }),
    correctAnswer: total - fired,
  };
}

function generateMissingNumber(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const a = Math.floor(rng() * 10) + 1;
  const missing = Math.floor(rng() * 10) + 1;
  const result = a + missing;
  return {
    prompt: formatQuestion(t.battlelearn.questions.missingNumber, { a, result }),
    correctAnswer: missing,
  };
}

function generateMissingNumberSub(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const a = Math.floor(rng() * 15) + 5;
  const result = Math.floor(rng() * (a - 1)) + 1;
  const missing = a - result;
  return {
    prompt: formatQuestion(t.battlelearn.questions.missingNumberSub, { a, result }),
    correctAnswer: missing,
  };
}

function generateTimeProblem(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const start = Math.floor(rng() * 12) + 1;
  const duration = Math.floor(rng() * 5) + 1;
  const end = start + duration;
  return {
    prompt: formatQuestion(t.battlelearn.questions.timeProblem, { start, duration }),
    correctAnswer: end > 24 ? end - 24 : end,
  };
}

function generateCoinProblem(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const count = Math.floor(rng() * 10) + 2;
  const value = Math.floor(rng() * 5) + 1;
  return {
    prompt: formatQuestion(t.battlelearn.questions.coinProblem, { count, value }),
    correctAnswer: count * value,
  };
}

function generateCountObjectsQuestion(
  _level: number,
  rng: RngFunction,
  curriculumItems: readonly BattleLearnCurriculumItem[],
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const locale = getLocale();
  const labels = getBattleLearnCountObjectLabels(curriculumItems, locale);
  const item = labels[Math.floor(rng() * labels.length)]!;
  const count = Math.min(Math.floor(rng() * 5) + 2, 10);
  const shipEmoji = '🚢 '.repeat(count);
  return {
    prompt: `${shipEmoji}\n${formatQuestion(t.battlelearn.questions.countObjects, { item })}`,
    correctAnswer: count,
  };
}

function generateLogicPuzzle(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: string } {
  const t = getTranslations();
  // Template is "If a > b and b > c, then a ? c" so we need a > b > c; answer is ">"
  const c = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 4) + c + 1;
  const a = Math.floor(rng() * 4) + b + 1;
  return {
    prompt: formatQuestion(t.battlelearn.questions.logicPuzzle, { a, b, c }),
    correctAnswer: '>',
  };
}

function generateWordProblem1(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const a = Math.floor(rng() * 5) + 2;
  const b = Math.floor(rng() * 5) + 2;
  return {
    prompt: formatQuestion(t.battlelearn.questions.wordProblem1, { a, b }),
    correctAnswer: a + b,
  };
}

function generateWordProblem2(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const total = Math.floor(rng() * 10) + 10;
  const left = Math.floor(rng() * (total - 2)) + 1;
  return {
    prompt: formatQuestion(t.battlelearn.questions.wordProblem2, { total, left }),
    correctAnswer: total - left,
  };
}

function generateTwoStepProblem(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const initial = Math.floor(rng() * 5) + 5;
  const a = Math.floor(rng() * 3) + 1;
  const b = Math.floor(rng() * 3) + 1;
  return {
    prompt: formatQuestion(t.battlelearn.questions.twoStep, { a, b, initial }),
    correctAnswer: initial + a - b,
  };
}

// Starter Profile Question Generators (Level 7+: Coordinates/logic)

function generateNavigateQuestion(
  _level: number,
  rng: RngFunction,
  gridSize: number,
): { prompt: string; correctAnswer: string } {
  const t = getTranslations();
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const directions = ['navigate', 'navigateLeft', 'navigateUp', 'navigateDown'] as const;
  const direction = directions[Math.floor(rng() * directions.length)]!;
  const moves = Math.floor(rng() * 2) + 1;

  if (direction === 'navigate') {
    const startCol = Math.floor(rng() * Math.max(1, gridSize - 1 - moves));
    const startRow = Math.floor(rng() * gridSize) + 1;
    const correctCol = cols[Math.min(startCol + moves, gridSize - 1)];
    const start = `${cols[startCol]}-${startRow}`;
    return {
      prompt: formatQuestion(t.battlelearn.questions.navigate, { start, moves }),
      correctAnswer: `${correctCol}-${startRow}`,
    };
  }
  if (direction === 'navigateLeft') {
    const startCol = Math.floor(rng() * Math.max(1, gridSize - 1 - moves)) + moves;
    const startRow = Math.floor(rng() * gridSize) + 1;
    const correctCol = cols[Math.max(0, startCol - moves)];
    const start = `${cols[startCol]}-${startRow}`;
    return {
      prompt: formatQuestion(t.battlelearn.questions.navigateLeft, { start, moves }),
      correctAnswer: `${correctCol}-${startRow}`,
    };
  }
  if (direction === 'navigateUp') {
    const startCol = Math.floor(rng() * Math.min(gridSize, cols.length));
    const startRow = Math.floor(rng() * Math.max(1, gridSize - moves)) + moves + 1; // so startRow - moves >= 1
    const correctRow = startRow - moves;
    const start = `${cols[startCol]}-${startRow}`;
    return {
      prompt: formatQuestion(t.battlelearn.questions.navigateUp, { start, moves }),
      correctAnswer: `${cols[startCol]}-${correctRow}`,
    };
  }
  // navigateDown
  const startCol = Math.floor(rng() * Math.min(gridSize, cols.length));
  const startRow = Math.floor(rng() * Math.max(1, gridSize - moves)) + 1; // so startRow + moves <= gridSize
  const correctRow = startRow + moves;
  const start = `${cols[startCol]}-${startRow}`;
  return {
    prompt: formatQuestion(t.battlelearn.questions.navigateDown, { start, moves }),
    correctAnswer: `${cols[startCol]}-${correctRow}`,
  };
}

function generateSequenceQuestion(
  _level: number,
  rng: RngFunction,
  curriculumItems: readonly BattleLearnCurriculumItem[],
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const patterns = getBattleLearnSequencePatterns(curriculumItems, 'starter_sequence');
  const pattern = patterns[Math.floor(rng() * patterns.length)]!;
  return {
    prompt: formatQuestion(t.battlelearn.questions.sequenceNext, {
      sequence: pattern.sequence.join(', '),
    }),
    correctAnswer: pattern.answer,
  };
}

function generateAreaProblem(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const width = Math.floor(rng() * 4) + 2;
  const height = Math.floor(rng() * 4) + 2;
  return {
    prompt: formatQuestion(t.battlelearn.questions.areaProblem, { width, height }),
    correctAnswer: width * height,
  };
}

function generatePerimeterProblem(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const width = Math.floor(rng() * 4) + 2;
  const height = Math.floor(rng() * 4) + 2;
  return {
    prompt: formatQuestion(t.battlelearn.questions.perimeterProblem, { width, height }),
    correctAnswer: 2 * (width + height),
  };
}

// Advanced Profile Question Generators (Level 1-5)

function generatePatternQuestion(
  _level: number,
  rng: RngFunction,
  curriculumItems: readonly BattleLearnCurriculumItem[],
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const patterns = getBattleLearnSequencePatterns(curriculumItems, 'advanced_pattern');
  const pattern = patterns[Math.floor(rng() * patterns.length)]!;
  return {
    prompt: formatQuestion(t.battlelearn.questions.patternNext, {
      pattern: pattern.sequence.join(', '),
    }),
    correctAnswer: pattern.answer,
  };
}

function generateDistanceQuestion(
  _level: number,
  rng: RngFunction,
  gridSize: number,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const useRow = rng() < 0.5;
  const col1 = Math.floor(rng() * gridSize);
  const row1 = Math.floor(rng() * gridSize) + 1;

  if (useRow) {
    // Same column, different rows
    const row2 = Math.min(row1 + Math.floor(rng() * 3) + 2, gridSize);
    const distance = Math.abs(row2 - row1);
    const coord1 = `${cols[col1]}-${row1}`;
    const coord2 = `${cols[col1]}-${row2}`;
    return {
      prompt: formatQuestion(t.battlelearn.questions.distance, {
        coord1,
        coord2,
      }),
      correctAnswer: distance,
    };
  } else {
    // Same row, different columns
    const col2 = Math.min(col1 + Math.floor(rng() * 3) + 2, gridSize - 1);
    const distance = Math.abs(col2 - col1);
    const coord1 = `${cols[col1]}-${row1}`;
    const coord2 = `${cols[col2]}-${row1}`;
    return {
      prompt: formatQuestion(t.battlelearn.questions.distance, {
        coord1,
        coord2,
      }),
      correctAnswer: distance,
    };
  }
}

function generateWordProblem3(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const ships = Math.floor(rng() * 4) + 2;
  const perShip = Math.floor(rng() * 5) + 3;
  return {
    prompt: formatQuestion(t.battlelearn.questions.wordProblem3, { ships, perShip }),
    correctAnswer: ships * perShip,
  };
}

// Advanced Profile Question Generators (Level 6-10)

function generateMultiMoveQuestion(
  _level: number,
  rng: RngFunction,
  gridSize: number,
): { prompt: string; correctAnswer: string } {
  const t = getTranslations();
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const startCol = Math.floor(rng() * (gridSize - 3));
  const startRow = Math.floor(rng() * (gridSize - 3)) + 2; // Start from row 2+ to allow upward movement
  const colMoves = Math.floor(rng() * 2) + 1;
  const rowMoves = Math.floor(rng() * 2) + 1;

  const finalCol = startCol + colMoves; // Right = column increases
  const finalRow = startRow - rowMoves; // Up = row number DECREASES (1 is at top)
  const startCoord = `${cols[startCol]}-${startRow}`;
  const finalCoord = `${cols[finalCol]}-${finalRow}`;

  return {
    prompt: formatQuestion(t.battlelearn.questions.multiMove, {
      start: startCoord,
      right: colMoves,
      up: rowMoves,
    }),
    correctAnswer: finalCoord,
  };
}

function generateFleetMultiplyQuestion(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const ships = Math.floor(rng() * 4) + 3;
  const cannons = Math.floor(rng() * 5) + 4;
  return {
    prompt: formatQuestion(t.battlelearn.questions.fleetMultiply, { ships, cannons }),
    correctAnswer: ships * cannons,
  };
}

function generateMultiplicationFactQuestion(
  level: number,
  rng: RngFunction,
  curriculumItems: readonly BattleLearnCurriculumItem[],
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const stage = getBattleLearnMultiplicationFactStage(curriculumItems, level);
  const span = stage.maxFactor - stage.minFactor + 1;
  const a = Math.floor(rng() * span) + stage.minFactor;
  const b = Math.floor(rng() * span) + stage.minFactor;
  return {
    prompt: formatQuestion(t.battlelearn.questions.multiplicationFact, { a, b }),
    correctAnswer: a * b,
  };
}

function generateFormationCount(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const row1 = Math.floor(rng() * 5) + 3;
  const row2 = Math.floor(rng() * 5) + 3;
  const row3 = Math.floor(rng() * 5) + 3;
  return {
    prompt: formatQuestion(t.battlelearn.questions.formationCount, { row1, row2, row3 }),
    correctAnswer: row1 + row2 + row3,
  };
}

// Advanced Profile Question Generators (Level 11+)

function generateVectorAddition(
  _level: number,
  rng: RngFunction,
): { prompt: string; correctAnswer: number } {
  const t = getTranslations();
  const right1 = Math.floor(rng() * 3) + 1;
  const up1 = Math.floor(rng() * 3) + 1;
  const right2 = Math.floor(rng() * 3) + 1;
  const up2 = Math.floor(rng() * 3) + 1;
  const totalMoves = right1 + up1 + right2 + up2;

  return {
    prompt: formatQuestion(t.battlelearn.questions.vectorAdd, {
      right1,
      up1,
      right2,
      up2,
    }),
    correctAnswer: totalMoves,
  };
}

/**
 * Generate numeric options for a problem
 */
function generateOptions(correct: number, count: number, rng: RngFunction): string[] {
  const options = [String(correct)];
  const attempts = new Set<number>([correct]);

  while (options.length < count && attempts.size < count * 3) {
    const offset = Math.floor(rng() * 10) - 5; // -5 to 4
    const wrong = correct + offset;
    if (wrong > 0 && !attempts.has(wrong)) {
      attempts.add(wrong);
      options.push(String(wrong));
    }
  }

  // Fill remaining with random numbers if needed
  while (options.length < count) {
    const wrong = Math.floor(rng() * (correct * 2 + 10)) + 1;
    if (!options.includes(String(wrong))) {
      options.push(String(wrong));
    }
  }

  return options;
}

/**
 * Generate coordinate options for navigation problems
 */
function generateCoordinateOptions(correct: string, gridSize: number, rng: RngFunction): string[] {
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const options = [correct];
  const attempts = new Set<string>([correct]);

  // Check if coordinate is in (x,y) format or A-1 format
  const isNumericFormat = correct.startsWith('(');

  if (isNumericFormat) {
    // Generate (x,y) format options
    while (options.length < 4 && attempts.size < gridSize * gridSize) {
      const x = Math.floor(rng() * gridSize);
      const y = Math.floor(rng() * gridSize);
      const option = `(${x},${y})`;
      if (!attempts.has(option)) {
        attempts.add(option);
        options.push(option);
      }
    }
  } else {
    // Generate A-1 format options
    while (options.length < 4 && attempts.size < gridSize * gridSize) {
      const col = cols[Math.floor(rng() * Math.min(gridSize, cols.length))];
      const row = Math.floor(rng() * gridSize) + 1;
      const option = `${col}-${row}`;
      if (!attempts.has(option)) {
        attempts.add(option);
        options.push(option);
      }
    }
  }

  return options;
}

/**
 * Shuffle options and place correct answer at specified index
 */
export function shuffleOptionsWithCorrect(
  options: string[],
  correct: number | string,
  correctIndex: number,
  rng: RngFunction,
): string[] {
  const shuffled = [...options];

  // Shuffle all options first
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  // Find and move correct answer to desired index
  const correctStr = String(correct);
  const currentCorrectIndex = shuffled.indexOf(correctStr);
  if (currentCorrectIndex !== -1 && currentCorrectIndex !== correctIndex) {
    [shuffled[currentCorrectIndex], shuffled[correctIndex]] = [
      shuffled[correctIndex]!,
      shuffled[currentCorrectIndex]!,
    ];
  }

  return shuffled;
}

/**
 * Generate a new question for BattleLearn game while preserving board state.
 * Board state (revealed, hits, sunkShips, ships) is preserved across calls.
 */
export function generateBattleLearnQuestion(
  currentProblem: BattleLearnProblem,
  level: number,
  rng: RngFunction = Math.random,
  contentPackId: string = MATH_BATTLELEARN_PACK.id,
): BattleLearnProblem {
  const gridSize = currentProblem.gridSize;
  const curriculumItems = getPackItems<BattleLearnCurriculumItem>(contentPackId);
  const battleProfile: BattleLearnProfile = 'starter';
  const question = generateBattleLearnQuestionForStage(
    curriculumItems,
    'followup',
    battleProfile,
    level,
    rng,
    gridSize,
  );
  const options = generateBattleLearnOptions(question.correctAnswer, gridSize, rng);

  const numOptions = options.length;
  const correctIndex = Math.floor(rng() * numOptions);
  const shuffledOptions = shuffleOptionsWithCorrect(
    options,
    question.correctAnswer,
    correctIndex,
    rng,
  );

  // Return updated problem with new question but SAME board state (keep same uid so view does not remount and lose answeredProblemCells)
  return {
    ...currentProblem,
    uid: currentProblem.uid,
    question: {
      prompt: question.prompt,
      options: shuffledOptions,
      correctIndex,
    },
    // Preserve board state and cell grid
    cellGrid: currentProblem.cellGrid,
    revealed: currentProblem.revealed,
    hits: currentProblem.hits,
    sunkShips: currentProblem.sunkShips,
    ships: currentProblem.ships,
    gameWon: currentProblem.gameWon,
    shotAvailable: currentProblem.shotAvailable,
  };
}
