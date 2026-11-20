/**
 * useWrongStrikes – shared wrong-answer / miss counter
 *
 * Used by games that allow a number of wrong attempts before a round life is lost.
 * Word Cascade: 3 wrong taps. BattleLearn: 5 misses.
 */

import { useCallback, useEffect, useState } from 'react';

export interface UseWrongStrikesOptions {
  /** Max wrong count before penalty (e.g. 3 or 5). */
  maxStrikes: number;
  /** Optional: reset strikes when this value changes (e.g. problem.uid for new game). */
  resetDeps?: unknown;
}

export interface UseWrongStrikesResult {
  strikes: number;
  addStrike: () => void;
  resetStrikes: () => void;
  isAtMax: boolean;
  triesLeft: number;
}

export function useWrongStrikes(options: UseWrongStrikesOptions): UseWrongStrikesResult {
  const { maxStrikes, resetDeps } = options;
  const [strikes, setStrikes] = useState(0);

  useEffect(() => {
    if (resetDeps === undefined) return;
    const id = setTimeout(() => setStrikes(0), 0);
    return () => clearTimeout(id);
  }, [resetDeps]);

  const addStrike = useCallback(() => {
    setStrikes((prev) => Math.min(maxStrikes, prev + 1));
  }, [maxStrikes]);

  const resetStrikes = useCallback(() => {
    setStrikes(0);
  }, []);

  const isAtMax = strikes >= maxStrikes;
  const triesLeft = Math.max(0, maxStrikes - strikes);

  return {
    strikes,
    addStrike,
    resetStrikes,
    isAtMax,
    triesLeft,
  };
}
