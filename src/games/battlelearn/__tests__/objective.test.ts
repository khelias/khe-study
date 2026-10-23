import { describe, expect, it } from 'vitest';
import { battleLearnObjective } from '../objective';
import { generateBattleLearn } from '../generator';
import { createRng } from '../../../engine/rng';
import { et } from '../../../i18n/locales/et';
import type { BattleLearnProblem, Ship } from '../../../types/game';

const text = { t: et, formatText: (value: string) => `[${value}]` };

const withShips = (ships: Ship[], sunkShips: string[]): BattleLearnProblem => ({
  ...generateBattleLearn(1, createRng(1)),
  ships,
  sunkShips,
});

const ship = (id: string): Ship => ({ id, length: 1, positions: [[0, 0]], hits: 0 });

describe('battleLearnObjective', () => {
  it('fills as ships sink', () => {
    const problem = withShips(['a', 'b', 'c', 'd', 'e'].map(ship), ['a', 'b']);

    expect(battleLearnObjective(problem, text)).toEqual({
      label: `[${et.battlelearn.shipsSunk}]`,
      value: '2/5',
      percent: 40,
      ariaLabel: `[${et.battlelearn.shipsSunk}] 2/5`,
    });
  });

  it('counts at least one ship on a board without ships', () => {
    const objective = battleLearnObjective(withShips([], []), text);

    expect(objective).toMatchObject({ value: '0/1', percent: 0 });
  });
});
