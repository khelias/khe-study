import { buildFactForOperator, buildFactPool, pickNextFact } from '../../engine/factDrill';
import type { FactOperator } from '../../engine/factDrill';
import type { FactDrillProblem, RngFunction } from '../../types/game';

/**
 * Build a fact-drill seed generator. The generator only seeds the first
 * equation; FactDrillView owns subsequent picks via `buildFactForOperator` so
 * the session can keep going without round-tripping through the registry.
 * Operator-specific compute / operand layout / swap policy live entirely inside
 * `buildFactForOperator`.
 */
function makeFactDrillGenerator(operator: FactOperator, range: [number, number]) {
  const fallbackPair: [number, number] = range[0] >= 2 ? [2, 2] : [1, 1];
  return (_level: number, rng: RngFunction = Math.random): FactDrillProblem => {
    const pool = buildFactPool(range);
    const pair = pickNextFact(pool, new Set(), rng) ?? fallbackPair;
    return buildFactForOperator(operator, pair, range, rng);
  };
}

export const generateMultiplicationFactDrill1To5 = makeFactDrillGenerator('×', [2, 5]);
export const generateMultiplicationFactDrill1To10 = makeFactDrillGenerator('×', [2, 10]);

// within_20: operands 1..10 (max sum 20). within_100: operands 1..50 (max 100).
export const generateAdditionFactDrillWithin20 = makeFactDrillGenerator('+', [1, 10]);
export const generateAdditionFactDrillWithin100 = makeFactDrillGenerator('+', [1, 50]);

export const generateSubtractionFactDrillWithin20 = makeFactDrillGenerator('−', [1, 20]);
export const generateSubtractionFactDrillWithin100 = makeFactDrillGenerator('−', [1, 100]);

export const generateDivisionFactDrill1To5 = makeFactDrillGenerator('÷', [2, 5]);
export const generateDivisionFactDrill1To10 = makeFactDrillGenerator('÷', [2, 10]);
