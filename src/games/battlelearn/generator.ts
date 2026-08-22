import { getPackItems } from '../../curriculum';
import {
  MATH_BATTLELEARN_PACK,
  getBattleLearnCellDistribution,
  getBattleLearnProfileStage,
  type BattleLearnCurriculumItem,
  type BattleLearnProfile,
} from '../../curriculum/packs/math/battlelearn';
import { placeShips } from '../../engine/battlelearn';
import { uid } from '../../engine/rng';
import type {
  BattleLearnProblem,
  BattleLearnCellType,
  GeneratorContext,
  RngFunction,
} from '../../types/game';
import {
  generateBattleLearnOptions,
  generateBattleLearnQuestionForStage,
  shuffleOptionsWithCorrect,
} from './questions';

/**
 * battlelearn generator. Mechanic: answer educational questions to earn shots
 * and sink hidden ships on a grid. Difficulty (grid size, ship lengths, cell
 * distribution, question stage) comes from the bound curriculum pack; the
 * default pack can be overridden per binding via context.contentPackId.
 */
export function generateBattleLearn(
  level: number,
  rng: RngFunction = Math.random,
  context?: GeneratorContext,
): BattleLearnProblem {
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
}
