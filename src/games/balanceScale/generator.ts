import { getPackItems } from '../../curriculum';
import {
  MATH_BALANCE_EQUATIONS_PACK,
  getBalanceEquationProgression,
  type BalanceEquationProgressionItem,
} from '../../curriculum/packs/math/balance_equations';
import { randomInt, uid } from '../../engine/rng';
import type { BalanceScaleProblem, RngFunction } from '../../types/game';

/** `total` as `count` weights, each at least `min`. */
const splitWeights = (rng: RngFunction, total: number, count: number, min: number): number[] => {
  const weights: number[] = [];
  let rest = total;
  for (let left = count; left > 1; left--) {
    const weight = randomInt(min, rest - (left - 1) * min, rng);
    weights.push(weight);
    rest -= weight;
  }
  weights.push(rest);
  return weights;
};

/** Each pan's sum when every unknown weighs `weight`. */
export function panSums(
  problem: BalanceScaleProblem,
  weight: number,
): { left: number; right: number } {
  const { left, right, hidden } = problem.display;
  const sum = (weights: number[]) => weights.reduce((a, b) => a + b, 0);
  const unknown = hidden.count * weight;
  return {
    left: sum(left) + (hidden.side === 'left' ? unknown : 0),
    right: sum(right) + (hidden.side === 'right' ? unknown : 0),
  };
}

export function generateBalanceScale(
  level: number,
  rng: RngFunction = Math.random,
): BalanceScaleProblem {
  const progression = getBalanceEquationProgression(
    getPackItems<BalanceEquationProgressionItem>(MATH_BALANCE_EQUATIONS_PACK.id),
    level,
  );
  const { minSum, maxSum, minVisibleWeight } = progression;
  // Two equal unknowns need an even total, each even total as likely.
  const total =
    progression.hiddenWeights === 2
      ? 2 * randomInt(Math.ceil(minSum / 2), Math.floor(maxSum / 2), rng)
      : randomInt(minSum, maxSum, rng);

  const full = splitWeights(rng, total, progression.fullPanWeights, minVisibleWeight);
  // One unknown beside a known weight, or two equal unknowns alone (? + ? = 8).
  let known: number[] = [];
  if (progression.hiddenWeights === 1) {
    let weight = randomInt(minVisibleWeight, total - minVisibleWeight, rng);
    if (weight === full[0] && level > 2) {
      weight = randomInt(minVisibleWeight, total - minVisibleWeight, rng);
    }
    known = [weight];
  }
  const answer = (total - (known[0] ?? 0)) / progression.hiddenWeights;
  const side = progression.hiddenSide === 'either' && rng() < 0.5 ? 'left' : 'right';

  const opts = new Set([answer]);
  let safety = 0;
  while (opts.size < progression.optionCount && safety < 50) {
    safety++;
    const offset =
      progression.distractorOffsets[Math.floor(rng() * progression.distractorOffsets.length)] ?? 1;
    const r = answer + offset;
    if (r > 0 && r !== answer) opts.add(r);
  }
  safety = 0;
  while (opts.size < progression.optionCount && safety < 50) {
    safety++;
    const fallback = Math.floor(rng() * progression.fallbackMaxOption) + 1;
    if (fallback !== answer) opts.add(fallback);
  }
  let fallbackCandidate = 1;
  while (opts.size < progression.optionCount) {
    if (fallbackCandidate !== answer) opts.add(fallbackCandidate);
    fallbackCandidate++;
  }

  return {
    type: 'balance_scale',
    display: {
      left: side === 'left' ? known : full,
      right: side === 'left' ? full : known,
      hidden: { side, count: progression.hiddenWeights },
    },
    answer,
    options: Array.from(opts).sort((a, b) => a - b),
    uid: uid(rng),
  };
}
