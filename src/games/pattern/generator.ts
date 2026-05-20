import { getPackItems } from '../../curriculum';
import {
  MATH_PATTERN_SEQUENCES_PACK,
  getPatternTemplatesForLevel,
  getPatternThemes,
  type PatternSequenceItem,
} from '../../curriculum/packs/math/pattern_sequences';
import { getRandom, uid } from '../../engine/rng';
import type { PatternProblem, RngFunction } from '../../types/game';

export function generatePattern(level: number, rng: RngFunction = Math.random): PatternProblem {
  const patternItems = getPackItems<PatternSequenceItem>(MATH_PATTERN_SEQUENCES_PACK.id);
  const theme = getRandom(getPatternThemes(patternItems), rng);
  if (!theme) {
    throw new Error('No theme found for pattern game');
  }
  const items = [...theme.symbols];
  const pool = [...items].sort(() => rng() - 0.5);
  const A = pool[0];
  const B = pool[1];
  const C = pool[2];
  const D = pool[3];
  if (!A || !B || !C || !D) {
    throw new Error('Not enough pattern items');
  }
  const templatePool = getPatternTemplatesForLevel(patternItems, level, false);
  const picked = getRandom(templatePool, rng);
  if (!picked) {
    throw new Error('No pattern template found');
  }

  const lengthBoost = Math.min(2, Math.floor(level / 4));
  const sequenceLength = Math.min(picked.length + lengthBoost, 6);
  const sequence = Array.from({ length: sequenceLength }, (_, index) => {
    const cycleIndex = picked.cycle[index % picked.cycle.length] ?? 0;
    return pool[cycleIndex] ?? A;
  });
  const nextIndex = picked.cycle[sequenceLength % picked.cycle.length] ?? 0;
  const answer = pool[nextIndex] ?? A;
  const patternCycle = picked.cycle.map((index) => pool[index] ?? A);

  // Ensure the correct answer is always among the choices
  const opts = new Set([answer]);
  while (opts.size < 3) {
    const randomItem = getRandom(items, rng);
    if (randomItem && randomItem !== answer) opts.add(randomItem);
  }

  return {
    type: 'pattern',
    sequence,
    answer,
    options: Array.from(opts).sort(() => rng() - 0.5),
    patternRule: picked.id,
    patternCycle,
    uid: uid(rng),
  };
}
