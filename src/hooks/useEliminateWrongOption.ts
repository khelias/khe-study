import { useRef, useState } from 'react';

const ELIMINATE_COST = 1;

interface EliminationState<T> {
  resetDeps: readonly unknown[];
  /** Bumped on every reset, so deps that change and change back still reset. */
  generation: number;
  eliminated: readonly T[];
}

const sameDeps = (a: readonly unknown[], b: readonly unknown[]): boolean =>
  a.length === b.length && a.every((value, i) => Object.is(value, b[i]));

/** Indices of the options that are not the answer. */
export function wrongOptionIndices<T>(options: readonly T[], answer: T): number[] {
  return options.flatMap((option, idx) => (option === answer ? [] : [idx]));
}

/**
 * The paid "eliminate a wrong option" hint. `eliminate()` spends one star and
 * hides a random wrong option that is still shown; it returns whether it did.
 * The list empties when any of `resetDeps` changes (a new problem or question).
 */
export function useEliminateWrongOption<T>(
  wrongOptions: readonly T[],
  resetDeps: readonly unknown[],
  spendStars?: (count: number) => boolean,
): { eliminated: readonly T[]; eliminate: () => boolean } {
  const [state, setState] = useState<EliminationState<T>>({
    resetDeps,
    generation: 0,
    eliminated: [],
  });
  // Read in the handler so a second tap before the re-render sees the first pick.
  const latestRef = useRef(state);

  let current = state;
  if (!sameDeps(state.resetDeps, resetDeps)) {
    current = { resetDeps, generation: state.generation + 1, eliminated: [] };
    setState(current);
  }
  const eliminated = current.eliminated;

  const eliminate = (): boolean => {
    const latest =
      latestRef.current.generation === current.generation ? latestRef.current : current;
    const remaining = wrongOptions.filter((option) => !latest.eliminated.includes(option));
    if (remaining.length === 0 || !spendStars?.(ELIMINATE_COST)) return false;
    const pick = remaining[Math.floor(Math.random() * remaining.length)] as T;
    const next = { ...current, eliminated: [...latest.eliminated, pick] };
    latestRef.current = next;
    setState(next);
    return true;
  };

  return { eliminated, eliminate };
}
