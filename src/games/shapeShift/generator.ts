import { getPackItems } from '../../curriculum';
import { SHAPE_SHIFT_PUZZLES_PACK } from '../../curriculum/packs/geometry/shapeShiftPuzzles';
import { uid } from '../../engine/rng';
import type {
  GeneratorContext,
  PieceState,
  Puzzle,
  RngFunction,
  ShapeShiftProblem,
  ShapeType,
} from '../../types/game';

/**
 * shape_shift generator. Mechanic: drag/rotate geometric pieces onto the board
 * to match a target outline. Mode and difficulty scale with level; expert mode
 * adds a decoy piece. Content: SHAPE_SHIFT_PUZZLES_PACK. Recently-played
 * puzzles are avoided via session history + persisted avoid list.
 */
export function generateShapeShift(
  level: number,
  rng: RngFunction = Math.random,
  context: GeneratorContext = {},
): ShapeShiftProblem {
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
  const freshSessionAvailablePuzzles = persistedFreshPuzzles.filter((p) => !history.includes(p.id));
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
}
