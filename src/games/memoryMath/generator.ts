import { getPackItems } from '../../curriculum';
import {
  MATH_ADDITION_MEMORY_PACK,
  getMemoryMathProgression,
  type MemoryMathProgressionItem,
} from '../../curriculum/packs/math/addition_memory';
import { uid } from '../../engine/rng';
import type { MemoryMathProblem, RngFunction } from '../../types/game';

export function generateMemoryMath(
  level: number,
  rng: RngFunction = Math.random,
): MemoryMathProblem {
  const progression = getMemoryMathProgression(
    getPackItems<MemoryMathProgressionItem>(MATH_ADDITION_MEMORY_PACK.id),
    'starter',
    level,
  );
  const cardCount = progression.cardCount;
  const pairs: Array<{ eq: string; ans: number }> = [];
  const cards: Array<{ id: string; content: string; matched?: boolean }> = [];
  const sumSpan = progression.maxAnswerSum - progression.minAnswerSum + 1;

  let safety = 0;
  while (pairs.length < cardCount / 2) {
    safety++;
    if (safety > 200) {
      throw new Error('Could not generate unique memory math pairs');
    }
    const sum = Math.floor(rng() * sumSpan) + progression.minAnswerSum;
    if (pairs.some((p) => p.ans === sum)) continue;

    const maxAddend = Math.max(progression.minAddend, sum - progression.minAddend);
    const a = Math.floor(rng() * (maxAddend - progression.minAddend + 1)) + progression.minAddend;
    const eq = `${a} + ${sum - a}`;
    const id = pairs.length;
    const matchId = `pair-${id}`;
    pairs.push({ eq, ans: sum });
    cards.push({
      id: `q-${id}`,
      content: eq,
      type: 'math',
      matchId,
    } as MemoryMathProblem['cards'][0]);
    cards.push({
      id: `a-${id}`,
      content: `${sum}`,
      type: 'answer',
      matchId,
    } as MemoryMathProblem['cards'][0]);
  }
  return { type: 'memory_math', cards: cards.sort(() => rng() - 0.5), pairs, uid: uid(rng) };
}
