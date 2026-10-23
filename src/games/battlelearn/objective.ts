import type { SessionObjectiveText } from '../registry';
import type { BattleLearnProblem, GameHeaderObjective } from '../../types/game';

export const battleLearnObjective = (
  problem: BattleLearnProblem,
  { t, formatText }: SessionObjectiveText,
): GameHeaderObjective => {
  const totalShips = Math.max(1, problem.ships.length);
  const sunkShips = problem.sunkShips.length;
  const remainingShips = Math.max(0, totalShips - sunkShips);
  return {
    label: formatText(t.battlelearn.shipsRemaining),
    value: `${remainingShips}/${totalShips}`,
    percent: (remainingShips / totalShips) * 100,
    ariaLabel: `${formatText(t.battlelearn.shipsRemaining)} ${remainingShips}/${totalShips}`,
  };
};
