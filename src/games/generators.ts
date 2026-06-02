import { getPackItems } from '../curriculum';
import { MATH_ADDITION_WITHIN_20_PACK } from '../curriculum/packs/math/addition_within_20';
import { MATH_ADDITION_WITHIN_100_PACK } from '../curriculum/packs/math/addition_within_100';
import { MATH_SUBTRACTION_WITHIN_20_PACK } from '../curriculum/packs/math/subtraction_within_20';
import { MATH_SUBTRACTION_WITHIN_100_PACK } from '../curriculum/packs/math/subtraction_within_100';
import { MATH_MULTIPLICATION_1_5_PACK } from '../curriculum/packs/math/multiplication_1_5';
import { MATH_MULTIPLICATION_1_10_PACK } from '../curriculum/packs/math/multiplication_1_10';
import type { ArithmeticSpec } from '../curriculum/packs/math/types';
import {
  MATH_GEOMETRY_SHAPES_PACK,
  getShapeDashCheckpointQuestions,
  getShapeDashGateQuestions,
  getShapeDashShapeLabel,
  type ShapeDashGateShape,
  type ShapeDashGeometryItem,
} from '../curriculum/packs/math/geometry_shapes';
import { generateBalanceScale } from './balanceScale/generator';
import { generateTimeMatch } from './timeMatch/generator';
import { generateCompareSizes } from './compareSizes/generator';
import { generateUnitConversion } from './unitConversion/generator';
import { generatePattern } from './pattern/generator';
import { generateMemoryMath } from './memoryMath/generator';
import { generatePicturePairs } from './picturePairs/generator';
import { generateSyllableBuilder } from './syllableBuilder/generator';
import { generateLetterMatch } from './letterMatch/generator';
import { generateSentenceLogic } from './sentenceLogic/generator';
import { generateStarMapper } from './starMapper/generator';
import { generateRoboPath } from './roboPath/generator';
import { generateWordBuilder } from './wordBuilder/generator';
import { generateWordCascade, generateWordCascadeLong } from './wordCascade/generator';
import {
  MATH_BATTLELEARN_PACK,
  getBattleLearnCellDistribution,
  getBattleLearnProfileStage,
  type BattleLearnCurriculumItem,
  type BattleLearnProfile,
} from '../curriculum/packs/math/battlelearn';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../curriculum/packs/geometry/shapeShiftPuzzles';
import { uid } from '../engine/rng';
import { getLocale } from '../i18n/index';
import { createMathSnakeProblem } from '../engine/mathSnake';
import { buildFactForOperator, buildFactPool, pickNextFact } from '../engine/factDrill';
import { placeShips } from '../engine/battlelearn';
import {
  generateBattleLearnOptions,
  generateBattleLearnQuestionForStage,
  shuffleOptionsWithCorrect,
} from './battlelearnQuestions';
import { GATE_WIDTH, getMinObstacleGap, SPIKE_WIDTH } from '../engine/shapeDash';
import type {
  RngFunction,
  ShapeShiftProblem,
  Puzzle,
  PieceState,
  ShapeType,
  GeneratorFunction,
  GeneratorContext,
  BattleLearnProblem,
  BattleLearnCellType,
  ShapeDashProblem,
  ShapeDashObstacle,
  ShapeDashCheckpoint,
  ShapeDashStar,
  ShapeDashJumpPad,
  ShapeDashBoostZone,
  ShapeDashShapeGate,
  ShapeDashTerrainSegment,
} from '../types/game';

export const Generators: Record<string, GeneratorFunction> = {
  balance_scale: generateBalanceScale,

  word_builder: generateWordBuilder,

  word_cascade: generateWordCascade,

  word_cascade_long: generateWordCascadeLong,

  pattern: generatePattern,

  memory_math: generateMemoryMath,

  picture_pairs: generatePicturePairs,

  // Each snake generator resolves its own focused pack. One mechanic, many skills.
  addition_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_ADDITION_WITHIN_20_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  addition_big_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_ADDITION_WITHIN_100_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  subtraction_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_SUBTRACTION_WITHIN_20_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  subtraction_big_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_SUBTRACTION_WITHIN_100_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  multiplication_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_MULTIPLICATION_1_5_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  multiplication_big_snake: (level: number, rng: RngFunction = Math.random) => {
    const specs = getPackItems<ArithmeticSpec>(MATH_MULTIPLICATION_1_10_PACK.id);
    return createMathSnakeProblem(specs, level, rng);
  },

  // Fact Drill family — timed single-operator sprints. The generator only
  // seeds the first equation; FactDrillView owns subsequent picks via
  // `buildFactForOperator` so the session can keep going without round-tripping
  // through the registry. Operator-specific compute / operand layout / swap
  // policy live entirely inside `buildFactForOperator`.
  multiplication_fact_drill_1_5: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 5];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    return buildFactForOperator('×', pair, range, rng);
  },

  multiplication_fact_drill_1_10: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 10];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    return buildFactForOperator('×', pair, range, rng);
  },

  // within_20: operands 1..10 (max sum 20). within_100: operands 1..50 (max 100).
  addition_fact_drill_within_20: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 10];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    return buildFactForOperator('+', pair, range, rng);
  },

  addition_fact_drill_within_100: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 50];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    return buildFactForOperator('+', pair, range, rng);
  },

  subtraction_fact_drill_within_20: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 20];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    return buildFactForOperator('−', pair, range, rng);
  },

  subtraction_fact_drill_within_100: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [1, 100];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [1, 1];
    return buildFactForOperator('−', pair, range, rng);
  },

  division_fact_drill_1_5: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 5];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    return buildFactForOperator('÷', pair, range, rng);
  },

  division_fact_drill_1_10: (_level: number, rng: RngFunction = Math.random) => {
    const range: [number, number] = [2, 10];
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? [2, 2];
    return buildFactForOperator('÷', pair, range, rng);
  },

  sentence_logic: generateSentenceLogic,

  letter_match: generateLetterMatch,

  robo_path: generateRoboPath,

  syllable_builder: generateSyllableBuilder,

  time_match: generateTimeMatch,

  unit_conversion: generateUnitConversion,

  compare_sizes: generateCompareSizes,

  star_mapper: generateStarMapper,

  /**
   * Shape Shift Generator
   * Generates geometric puzzle problems with different modes based on level
   */
  shape_shift: (
    level: number,
    rng: RngFunction = Math.random,
    context: GeneratorContext = {},
  ): ShapeShiftProblem => {
    // Select mode based on level
    const mode = level <= 3 ? 'match' : level <= 6 ? 'rotate' : level <= 10 ? 'build' : 'expert';

    // Select difficulty based on level
    const difficulty = level <= 3 ? 'easy' : level <= 7 ? 'medium' : 'hard';

    const puzzles = getPackItems<Puzzle>(SHAPE_SHIFT_PUZZLES_PACK.id);
    const suitablePuzzles = puzzles.filter((p) => p.difficulty === difficulty);
    if (suitablePuzzles.length === 0) {
      throw new Error(`Shape Shift: no puzzles available for difficulty ${difficulty}`);
    }
    const persistentAvoidIds = new Set(context.avoidContentIds ?? []);

    // Smart Shuffle: Avoid recently played puzzles
    // @ts-expect-error -- dynamic property on globalThis for session-scoped history
    if (!globalThis._shapeShiftHistory) globalThis._shapeShiftHistory = [];
    // @ts-expect-error -- dynamic property on globalThis for session-scoped history
    let history = globalThis._shapeShiftHistory as string[];

    // Prefer persisted fresh content, then avoid the current session inside
    // that pool. If persisted history is exhausted, fall back to session-only
    // avoidance so the just-solved puzzle does not look stuck on screen.
    let sessionAvailablePuzzles = suitablePuzzles.filter((p) => !history.includes(p.id));
    if (sessionAvailablePuzzles.length === 0) {
      // @ts-expect-error -- dynamic property on globalThis for session-scoped history
      globalThis._shapeShiftHistory = history.filter(
        (id) => !suitablePuzzles.find((p) => p.id === id),
      );
      // @ts-expect-error -- dynamic property on globalThis for session-scoped history
      history = globalThis._shapeShiftHistory as string[];
      sessionAvailablePuzzles = suitablePuzzles;
    }
    const persistedFreshPuzzles = suitablePuzzles.filter((p) => !persistentAvoidIds.has(p.id));
    const freshSessionAvailablePuzzles = persistedFreshPuzzles.filter(
      (p) => !history.includes(p.id),
    );
    const pool =
      freshSessionAvailablePuzzles.length > 0
        ? freshSessionAvailablePuzzles
        : persistedFreshPuzzles.length > 0
          ? persistedFreshPuzzles
          : sessionAvailablePuzzles;

    const puzzleIndex = Math.floor(rng() * pool.length);
    const puzzle = (pool[puzzleIndex] ?? puzzles[0])!;

    // Add to history
    history.push(puzzle.id);
    if (history.length > 20) history.shift();

    // Helper to generate random rotation
    const randomRotation = (): number => {
      return [0, 90, 180, 270][Math.floor(rng() * 4)] || 0;
    };

    // Helper to shuffle array
    const shuffleArray = <T>(array: T[]): T[] => {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j]!, result[i]!];
      }
      return result;
    };

    // Helper to generate decoy piece
    const generateDecoyPiece = (): PieceState => {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
      const types: ShapeType[] = ['triangle', 'square', 'diamond', 'circle'];
      const sourcePiece = puzzle.pieces[Math.floor(rng() * puzzle.pieces.length)];
      const fallbackSize = Math.max(16, Math.round(puzzle.gridSize * 0.22));
      const size = sourcePiece?.size ?? fallbackSize;

      return {
        id: 'decoy',
        type: types[Math.floor(rng() * types.length)] || 'square',
        color: colors[Math.floor(rng() * colors.length)] || 'gray',
        size,
        width: sourcePiece?.width,
        height: sourcePiece?.height,
        correctPosition: { x: -1, y: -1 },
        correctRotation: 0,
        isDecoy: true,
        currentPosition: null,
        currentRotation: randomRotation(),
      };
    };

    // Prepare piece states
    const pieces: PieceState[] = puzzle.pieces.map((p) => ({
      ...p,
      currentPosition: null,
      currentRotation: mode === 'match' ? p.correctRotation : randomRotation(),
    }));

    // For expert mode, add a decoy piece
    if (mode === 'expert') {
      pieces.push(generateDecoyPiece());
    }

    // Shuffle pieces in tray
    const shuffledPieces = shuffleArray(pieces);

    return {
      type: 'shape_shift',
      uid: uid(rng),
      mode,
      puzzle,
      pieces: shuffledPieces,
      showHints: mode === 'match',
    };
  },

  battlelearn: (level: number, rng: RngFunction = Math.random, context): BattleLearnProblem => {
    const curriculumItems = getPackItems<BattleLearnCurriculumItem>(
      context?.contentPackId ?? MATH_BATTLELEARN_PACK.id,
    );
    const battleProfile: BattleLearnProfile = 'starter';
    const profileStage = getBattleLearnProfileStage(curriculumItems, battleProfile, level);
    const cellDistribution = getBattleLearnCellDistribution(curriculumItems);
    const gridSize = profileStage.gridSize;
    const shipLengths = [...profileStage.shipLengths];

    function buildBattleLearnCellGrid(
      size: number,
      shipList: { positions: Array<[number, number]> }[],
      rngFn: RngFunction,
    ): BattleLearnCellType[][] {
      const grid: BattleLearnCellType[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, (): BattleLearnCellType => 'empty'),
      );
      const shipSet = new Set<string>();
      for (const ship of shipList) {
        for (const [r, c] of ship.positions) {
          shipSet.add(`${r},${c}`);
        }
      }
      const nonShipCells: [number, number][] = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (shipSet.has(`${r},${c}`)) {
            grid[r]![c] = 'ship';
          } else {
            nonShipCells.push([r, c]);
          }
        }
      }
      for (const [r, c] of nonShipCells) {
        const roll = rngFn();
        let sum = 0;
        let cellType: Exclude<BattleLearnCellType, 'ship'> = 'empty';
        for (const entry of cellDistribution.weights) {
          sum += entry.weight;
          if (roll < sum) {
            cellType = entry.cell;
            break;
          }
        }
        grid[r]![c] = cellType;
      }
      return grid;
    }

    const ships = placeShips(gridSize, shipLengths, rng);
    const cellGrid = buildBattleLearnCellGrid(gridSize, ships, rng);
    const question = generateBattleLearnQuestionForStage(
      curriculumItems,
      'initial',
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

    return {
      type: 'battlelearn',
      uid: uid(rng),
      gridSize,
      cellGrid,
      ships,
      revealed: [],
      hits: [],
      sunkShips: [],
      shotAvailable: false,
      question: {
        prompt: question.prompt,
        options: shuffledOptions,
        correctIndex,
      },
      gameWon: false,
    };
  },

  shape_dash: (
    level: number,
    rng: RngFunction = Math.random,
    context: GeneratorContext = {},
  ): ShapeDashProblem => {
    const effectiveLevel = Math.max(1, level);

    // Base scroll speed and run length scale with level. Early levels should
    // teach the rhythm before they ask for fast gate reads and dense jumps.
    const baseSpeed = 96 + effectiveLevel * 14;
    const scrollSpeed = Math.min(250, baseSpeed);
    const runLength = 2850 + effectiveLevel * 300;

    const locale = getLocale();
    const lang = locale === 'et' ? 'et' : 'en';
    const geometryItems = getPackItems<ShapeDashGeometryItem>(MATH_GEOMETRY_SHAPES_PACK.id);
    const questionBank = getShapeDashCheckpointQuestions(geometryItems);
    const shapeGateBank = getShapeDashGateQuestions(geometryItems);
    const persistentAvoidIds = new Set(context.avoidContentIds ?? []);
    const pickPackItems = <T extends { id: string }>(items: readonly T[], count: number): T[] => {
      const fresh = [...items].filter((item) => !persistentAvoidIds.has(item.id));
      const freshShuffled = fresh.sort(() => rng() - 0.5);
      const fallback = [...items]
        .filter((item) => !freshShuffled.some((selected) => selected.id === item.id))
        .sort(() => rng() - 0.5);

      return [...freshShuffled, ...fallback].slice(0, count);
    };

    let obstacles: ShapeDashObstacle[] = [];
    const numObstacles = 4 + Math.floor(effectiveLevel * 1.15);
    const numCheckpoints = Math.min(2, 1 + Math.floor(effectiveLevel / 4));

    // Difficulty scales with level: fewer “easy” first obstacles, slightly tighter gaps at higher levels
    const minGap = getMinObstacleGap(scrollSpeed);
    const firstObstaclesCount = Math.max(3, 7 - effectiveLevel);
    const firstLandingMargin = Math.max(120, 180 - effectiveLevel * 12);
    const firstMinGap = getMinObstacleGap(scrollSpeed, firstLandingMargin);
    const gapVariation = Math.max(40, 100 - effectiveLevel * 8);
    const runInDistance = 880;
    const firstGateDistance = runInDistance + 740;
    const endObstaclePadding = 360;
    const clearAfterCheckpoint = 200;
    const checkpointLeadIn = 60;

    let lastX = runInDistance;

    const obstacleTypes: Array<'spike' | 'block' | 'circle' | 'floating'> = [
      'spike',
      'block',
      'circle',
      'floating',
    ];
    const harderBias = Math.min(0.5, effectiveLevel * 0.08);
    for (let i = 0; i < numObstacles; i++) {
      const useGenerousGap = i < firstObstaclesCount;
      const baseGap = useGenerousGap ? firstMinGap : minGap;
      const gap = baseGap + Math.floor(rng() * gapVariation);
      lastX += gap;
      if (lastX > runLength - endObstaclePadding) break;

      let type: 'spike' | 'block' | 'circle' | 'floating';
      if (effectiveLevel <= 2) {
        type = 'spike';
      } else if (rng() < harderBias) {
        type = rng() > 0.5 ? 'circle' : 'floating';
      } else {
        type = obstacleTypes[Math.floor(rng() * obstacleTypes.length)]!;
      }
      if (type === 'spike') {
        obstacles.push({ id: `obs-${uid(rng)}`, x: lastX, type: 'spike' });
      } else if (type === 'block') {
        obstacles.push({
          id: `obs-${uid(rng)}`,
          x: lastX,
          type: 'block',
          height: 32 + Math.floor(rng() * 24),
        });
      } else if (type === 'circle') {
        obstacles.push({
          id: `obs-${uid(rng)}`,
          x: lastX,
          type: 'circle',
          radius: 16 + Math.floor(rng() * 6),
          offsetY: effectiveLevel <= 2 ? 0 : rng() > 0.6 ? 20 + Math.floor(rng() * 25) : 0,
        });
      } else {
        obstacles.push({
          id: `obs-${uid(rng)}`,
          x: lastX,
          type: 'floating',
          height: 28 + Math.floor(rng() * 16),
          offsetY: 40 + Math.floor(rng() * 50),
        });
      }
    }

    const obstacleWidth = (o: ShapeDashObstacle) =>
      o.type === 'circle' ? 2 * (o.radius ?? 18) : SPIKE_WIDTH;
    const obstacleCenterX = (o: ShapeDashObstacle) => o.x + obstacleWidth(o) / 2;

    // Place checkpoints only in safe zones: after an obstacle, with no obstacle for clearAfterCheckpoint px after the checkpoint.
    const checkpoints: ShapeDashCheckpoint[] = [];
    const safeZones: { start: number; end: number }[] = [];
    for (let i = 0; i < obstacles.length - 1; i++) {
      const gapStart = obstacles[i]!.x + obstacleWidth(obstacles[i]!) + checkpointLeadIn;
      const nextObsX = obstacles[i + 1]!.x;
      const gapEnd = nextObsX - clearAfterCheckpoint;
      if (gapEnd > gapStart + 40) {
        safeZones.push({ start: gapStart, end: gapEnd });
      }
    }
    const selectedCheckpointBank = pickPackItems(questionBank, numCheckpoints);
    const numToPlace = Math.min(numCheckpoints, safeZones.length, selectedCheckpointBank.length);
    const zoneOrder = safeZones
      .map((_, i) => i)
      .sort((a, b) => safeZones[a]!.start - safeZones[b]!.start);
    for (let c = 0; c < numToPlace; c++) {
      const zoneIdx = zoneOrder[c]!;
      const zone = safeZones[zoneIdx]!;
      const x = Math.floor(zone.start + rng() * Math.max(0, zone.end - zone.start - 40));
      const q = selectedCheckpointBank[c]!;
      const prompt = q.prompt[lang];
      const localizedOptions = q.options[lang];
      const options = [...localizedOptions].sort(() => rng() - 0.5);
      const correctIndex = options.indexOf(localizedOptions[q.correctIndex]!);
      const safeCorrectIndex = correctIndex >= 0 ? correctIndex : 0;
      checkpoints.push({
        id: `cp-${uid(rng)}`,
        x,
        contentItemId: q.id,
        question: { prompt, options, correctIndex: safeCorrectIndex },
      });
    }
    checkpoints.sort((a, b) => a.x - b.x);

    // V4: Generate shape gates (3 per run, ~every 30% of run length)
    const shapeGates: ShapeDashShapeGate[] = [];
    const numShapeGates = effectiveLevel <= 2 ? 2 : 3;
    const selectedGateBank = pickPackItems(shapeGateBank, numShapeGates);

    // Define constants for gate positioning
    const GATE_CLEAR_DISTANCE = 260; // Prefer a clear corridor for choosing by jump height.
    const GATE_FALLBACK_CLEAR_DISTANCE = 150; // Keep at least this much room if the run is dense.
    const MAX_REPOSITION_ATTEMPTS = 14; // Max attempts to find valid position
    const REPOSITION_STEP_SIZE = 80; // Step size for repositioning attempts
    const END_GATE_PADDING = 300; // Padding from run end

    for (let g = 0; g < numShapeGates && g < selectedGateBank.length; g++) {
      const segment = (runLength - firstGateDistance - END_GATE_PADDING) / numShapeGates;
      let x = firstGateDistance + g * segment;
      const gateData = selectedGateBank[g]!;

      const isGateTooClose = (candidateX: number, minDistance: number) =>
        obstacles.some((obs) => Math.abs(obstacleCenterX(obs) - candidateX) < minDistance) ||
        checkpoints.some((cp) => Math.abs(cp.x - candidateX) < minDistance) ||
        shapeGates.some((gate) => Math.abs(gate.x - candidateX) < minDistance + GATE_WIDTH);

      const findGatePosition = (minDistance: number): number | null => {
        let candidateX = x;
        for (let attempt = 0; attempt < MAX_REPOSITION_ATTEMPTS; attempt++) {
          if (!isGateTooClose(candidateX, minDistance)) return candidateX;

          const offset = (attempt + 1) * REPOSITION_STEP_SIZE * (attempt % 2 === 0 ? 1 : -1);
          candidateX = firstGateDistance + g * segment + offset;
          candidateX = Math.max(
            firstGateDistance,
            Math.min(candidateX, runLength - END_GATE_PADDING),
          );
        }
        return null;
      };

      // Try to find a valid position for the gate. Prefer a very clear corridor,
      // but allow a slightly denser run rather than removing all gates.
      const positionedX =
        findGatePosition(GATE_CLEAR_DISTANCE) ?? findGatePosition(GATE_FALLBACK_CLEAR_DISTANCE);
      x = positionedX ?? x;

      // If a dense seed still leaves no ideal gate corridor, keep the curriculum
      // item and clear the nearby procedural hazards instead of dropping the gate.
      obstacles = obstacles.filter(
        (obs) => Math.abs(obstacleCenterX(obs) - x) >= GATE_FALLBACK_CLEAR_DISTANCE,
      );
      for (let i = checkpoints.length - 1; i >= 0; i--) {
        if (Math.abs(checkpoints[i]!.x - x) < GATE_FALLBACK_CLEAR_DISTANCE) {
          checkpoints.splice(i, 1);
        }
      }

      // Generate 3 shape options: correct + 2 random wrong
      const allShapes: ShapeDashGateShape[] = [
        'triangle',
        'square',
        'pentagon',
        'hexagon',
        'circle',
      ];
      const wrongShapes = allShapes.filter((s) => s !== gateData.correctShape);
      const shuffledWrong = [...wrongShapes].sort(() => rng() - 0.5);

      const correctShape = {
        type: gateData.correctShape,
        label: getShapeDashShapeLabel(gateData.correctShape, lang),
        isCorrect: true,
      };
      const wrongShapeOptions = [
        {
          type: shuffledWrong[0]!,
          label: getShapeDashShapeLabel(shuffledWrong[0]!, lang),
          isCorrect: false,
        },
        {
          type: shuffledWrong[1]!,
          label: getShapeDashShapeLabel(shuffledWrong[1]!, lang),
          isCorrect: false,
        },
      ].sort(() => rng() - 0.5);

      const shapes = [correctShape, ...wrongShapeOptions].sort(() => rng() - 0.5);
      if (effectiveLevel <= 2) {
        const earlyCorrectLane = g === 0 ? 2 : 1; // First gate on ground, second with a normal jump.
        shapes.splice(shapes.indexOf(correctShape), 1);
        shapes.splice(earlyCorrectLane, 0, correctShape);
      }

      shapeGates.push({
        id: `gate-${uid(rng)}`,
        x,
        contentItemId: gateData.id,
        prompt: gateData.prompt[lang],
        shapes,
      });
    }
    shapeGates.sort((a, b) => a.x - b.x);
    if (effectiveLevel <= 2) {
      shapeGates.forEach((gate, index) => {
        const targetLane = index === 0 ? 2 : 1;
        const currentLane = gate.shapes.findIndex((shape) => shape.isCorrect);
        if (currentLane < 0 || currentLane === targetLane) return;
        const [correctShape] = gate.shapes.splice(currentLane, 1);
        if (correctShape) gate.shapes.splice(targetLane, 0, correctShape);
      });
    }

    type SafeSegment = { start: number; end: number };

    const gameplayStartX = runInDistance + 120;
    const gameplayEndX = runLength - 260;
    const clampZone = (zone: SafeSegment): SafeSegment => ({
      start: Math.max(gameplayStartX, zone.start),
      end: Math.min(gameplayEndX, zone.end),
    });
    const makeCenterZone = (centerX: number, radius: number): SafeSegment =>
      clampZone({ start: centerX - radius, end: centerX + radius });

    const baseForbiddenZones: SafeSegment[] = [
      ...obstacles.map((obs) => makeCenterZone(obstacleCenterX(obs), 108)),
      ...checkpoints.map((cp) => makeCenterZone(cp.x, 120)),
      ...shapeGates.map((gate) => makeCenterZone(gate.x, 210)),
    ];

    const buildSafeSegments = (zones: SafeSegment[], minWidth: number): SafeSegment[] => {
      const sortedZones = zones
        .map(clampZone)
        .filter((zone) => zone.end > zone.start)
        .sort((a, b) => a.start - b.start);
      const segments: SafeSegment[] = [];
      let cursor = gameplayStartX;

      for (const zone of sortedZones) {
        if (zone.start - cursor >= minWidth) {
          segments.push({ start: cursor, end: zone.start });
        }
        cursor = Math.max(cursor, zone.end);
      }

      if (gameplayEndX - cursor >= minWidth) {
        segments.push({ start: cursor, end: gameplayEndX });
      }

      return segments;
    };

    const pickXFromSegments = (
      segments: SafeSegment[],
      usedX: number[],
      minSpacing: number,
      edgePadding: number,
    ): number | null => {
      const eligibleSegments = segments.filter(
        (segment) => segment.end - segment.start > edgePadding * 2,
      );
      if (eligibleSegments.length === 0) return null;

      for (let attempt = 0; attempt < 80; attempt++) {
        const totalWidth = eligibleSegments.reduce(
          (sum, segment) => sum + (segment.end - segment.start - edgePadding * 2),
          0,
        );
        let pick = rng() * totalWidth;
        let selected = eligibleSegments[0]!;

        for (const segment of eligibleSegments) {
          const width = segment.end - segment.start - edgePadding * 2;
          if (pick <= width) {
            selected = segment;
            break;
          }
          pick -= width;
        }

        const availableWidth = selected.end - selected.start - edgePadding * 2;
        const x = Math.floor(selected.start + edgePadding + rng() * availableWidth);
        if (usedX.every((used) => Math.abs(used - x) >= minSpacing)) return x;
      }

      return null;
    };

    // V3: Generate stars in clear, reachable lanes.
    const stars: ShapeDashStar[] = [];
    const STARS_PER_LEVEL_SCALING = 0.3; // Additional stars per level (0.3 = 1 star every ~3 levels)
    const numStars = 3 + Math.floor(effectiveLevel * STARS_PER_LEVEL_SCALING);
    const starHeights = [24, 84, 124, 164]; // run, low jump, high jump, double-jump lanes
    const starSegments = buildSafeSegments(baseForbiddenZones, 96);
    const fallbackStarSegments = buildSafeSegments(baseForbiddenZones, 56);

    for (let s = 0; s < numStars; s++) {
      const usedStarX = stars.map((star) => star.x);
      const x =
        pickXFromSegments(starSegments, usedStarX, 170, 32) ??
        pickXFromSegments(fallbackStarSegments, usedStarX, 120, 20);
      if (x === null) break;

      const laneOffset = Math.floor(rng() * starHeights.length);
      const y = starHeights[(s + laneOffset) % starHeights.length]!;
      stars.push({ id: `star-${uid(rng)}`, x, y });
    }

    // V3: Generate jump pads in clear ground sections.
    const jumpPads: ShapeDashJumpPad[] = [];
    if (effectiveLevel >= 4) {
      const numJumpPads = effectiveLevel >= 8 ? 2 : 1;
      const jumpPadForbiddenZones = [
        ...baseForbiddenZones,
        ...stars.map((star) => makeCenterZone(star.x, 90)),
      ];
      const jumpPadSegments = buildSafeSegments(jumpPadForbiddenZones, 180);

      for (let j = 0; j < numJumpPads; j++) {
        const x = pickXFromSegments(
          jumpPadSegments,
          jumpPads.map((pad) => pad.x),
          520,
          24,
        );
        if (x !== null) {
          jumpPads.push({ id: `pad-${uid(rng)}`, x });
        }
      }
    }

    // V3: Generate boost zones only in long clear corridors.
    const boostZones: ShapeDashBoostZone[] = [];
    if (effectiveLevel >= 3) {
      const numBoosts = 1 + Math.floor(effectiveLevel / 5);
      const boostForbiddenZones = [
        ...baseForbiddenZones,
        ...stars.map((star) => makeCenterZone(star.x, 90)),
        ...jumpPads.map((pad) => makeCenterZone(pad.x, 120)),
      ];

      for (let b = 0; b < numBoosts; b++) {
        const width = 170 + Math.floor(rng() * 40);
        const boostSegments = buildSafeSegments(boostForbiddenZones, width + 80);
        const usedBoostX = boostZones.map((zone) => zone.x + zone.width / 2);
        const centerX = pickXFromSegments(boostSegments, usedBoostX, 520, width / 2 + 24);

        if (centerX !== null) {
          boostZones.push({ id: `boost-${uid(rng)}`, x: Math.floor(centerX - width / 2), width });
        }
      }
    }

    // V4: Generate terrain segments (varied heights for visual interest)
    const terrainSegments: ShapeDashTerrainSegment[] = [];
    const numSegments = 8 + Math.floor(effectiveLevel * 0.5);
    const segmentWidth = runLength / numSegments;
    const themes: Array<'cave' | 'sky' | 'neon' | 'default'> = ['cave', 'sky', 'neon', 'default'];

    for (let s = 0; s < numSegments; s++) {
      const x = s * segmentWidth;
      const types: Array<'flat' | 'raised' | 'gap' | 'ramp'> = ['flat', 'flat', 'raised', 'ramp']; // Bias toward flat
      const type = types[Math.floor(rng() * types.length)]!;
      const height = type === 'raised' ? 20 + Math.floor(rng() * 30) : 0;
      const theme = themes[Math.floor(s / 3) % themes.length]!; // Change theme every 3 segments

      terrainSegments.push({
        id: `terrain-${uid(rng)}`,
        x,
        width: segmentWidth,
        height,
        type,
        theme,
      });
    }

    return {
      type: 'shape_dash',
      uid: uid(rng),
      obstacles,
      checkpoints,
      scrollSpeed,
      runLength,
      stars,
      jumpPads,
      boostZones,
      shapeGates,
      terrainSegments,
      contentItemIds: [
        ...checkpoints
          .map((checkpoint) => checkpoint.contentItemId)
          .filter((id): id is string => Boolean(id)),
        ...shapeGates.map((gate) => gate.contentItemId).filter((id): id is string => Boolean(id)),
      ],
    };
  },
};

// BattleLearn question generators live in their own file; re-export the
// public entry so existing import paths keep working.
export { generateBattleLearnQuestion } from './battlelearnQuestions';
