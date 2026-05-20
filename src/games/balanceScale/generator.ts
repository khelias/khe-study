import { getPackItems } from '../../curriculum';
import {
  MATH_BALANCE_EQUATIONS_PACK,
  getBalanceEquationProgression,
  type BalanceEquationProgressionItem,
} from '../../curriculum/packs/math/balance_equations';
import { uid } from '../../engine/rng';
import type { BalanceScaleProblem, RngFunction } from '../../types/game';

export function generateBalanceScale(
  level: number,
  rng: RngFunction = Math.random,
): BalanceScaleProblem {
  const progression = getBalanceEquationProgression(
    getPackItems<BalanceEquationProgressionItem>(MATH_BALANCE_EQUATIONS_PACK.id),
    level,
  );
  const minSum = progression.minSum;
  const maxSum = progression.maxSum;
  const total = Math.floor(rng() * (maxSum - minSum + 1)) + minSum;
  const randomVisibleWeight = () =>
    Math.floor(rng() * (total - 2 * progression.minVisibleWeight + 1)) +
    progression.minVisibleWeight;

  const l1 = randomVisibleWeight();
  const l2 = total - l1;

  let r1 = randomVisibleWeight();
  if (r1 === l1 && level > 2) {
    r1 = randomVisibleWeight();
  }
  const rHidden = total - r1;

  const opts = new Set([rHidden]);
  let safety = 0;
  while (opts.size < progression.optionCount && safety < 50) {
    safety++;
    const offset =
      progression.distractorOffsets[Math.floor(rng() * progression.distractorOffsets.length)] ?? 1;
    const r = rHidden + offset;
    if (r > 0 && r !== rHidden) opts.add(r);
  }
  safety = 0;
  while (opts.size < progression.optionCount && safety < 50) {
    safety++;
    const fallback = Math.floor(rng() * progression.fallbackMaxOption) + 1;
    if (fallback !== rHidden) opts.add(fallback);
  }
  let fallbackCandidate = 1;
  while (opts.size < progression.optionCount) {
    if (fallbackCandidate !== rHidden) opts.add(fallbackCandidate);
    fallbackCandidate++;
  }

  return {
    type: 'balance_scale',
    display: { left: [l1, l2], right: [r1] },
    answer: rHidden,
    options: Array.from(opts).sort((a, b) => a - b),
    uid: uid(rng),
  };
}
