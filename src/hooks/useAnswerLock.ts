import { useRef } from 'react';

/**
 * Lets one answer through per problem, so a double tap does not record two.
 * A ref, not state, so a second tap that arrives before the re-render is
 * still seen. `lock()` returns false while this problem is already answered;
 * `unlock()` reopens it (after a wrong answer the child may try again). A new
 * `problemKey` starts unlocked.
 */
export function useAnswerLock(problemKey: string): {
  isLocked: () => boolean;
  lock: () => boolean;
  unlock: () => void;
} {
  const lockedKeyRef = useRef<string | null>(null);

  const isLocked = (): boolean => lockedKeyRef.current === problemKey;

  const lock = (): boolean => {
    if (isLocked()) return false;
    lockedKeyRef.current = problemKey;
    return true;
  };

  const unlock = (): void => {
    lockedKeyRef.current = null;
  };

  return { isLocked, lock, unlock };
}
