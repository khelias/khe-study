import type { SessionObjectiveText } from '../registry';
import type { BattleLearnProblem, GameHeaderObjective } from '../../types/game';

export const battleLearnObjective = (
  problem: BattleLearnProblem,
  { t, formatText }: SessionObjectiveText,
): GameHeaderObjective => {
  const totalShips = Math.max(1, problem.ships.length);
  const sunk = Math.min(problem.sunkShips.length, totalShips);
  return {
    label: formatText(t.battlelearn.shipsSunk),
    value: `${sunk}/${totalShips}`,
    percent: (sunk / totalShips) * 100,
    ariaLabel: `${formatText(t.battlelearn.shipsSunk)} ${sunk}/${totalShips}`,
  };
};
