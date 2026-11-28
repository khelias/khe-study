import { useState } from 'react';
import { playMoment } from '../engine/audio';

/** How an answer button shows the child's pick (board 3A frames 1 and 2). */
export type AnswerMark = 'right' | 'wrong' | 'shown';

interface Marks<K> {
  key: string;
  right: K | null;
  wrong: K[];
}

/**
 * Marks answers where they are, in place of a toast: the picked right one,
 * every wrong pick, and after a wrong pick the right one, which the child then
 * taps to go on. A new `problemKey` clears the marks.
 */
export function useAnswerMarks<K>(problemKey: string, rightAnswer: K, soundEnabled: boolean) {
  const [marks, setMarks] = useState<Marks<K>>({ key: problemKey, right: null, wrong: [] });
  const current: Marks<K> =
    marks.key === problemKey ? marks : { key: problemKey, right: null, wrong: [] };

  /** Marks the right pick; true when it was the answer shown after a wrong one. */
  const markRight = (answer: K): boolean => {
    const revealed = current.wrong.length > 0;
    setMarks({ ...current, right: answer });
    playMoment('right', soundEnabled);
    return revealed;
  };

  const markWrong = (answer: K): void => {
    setMarks({ ...current, wrong: [...current.wrong, answer] });
    playMoment('wrong', soundEnabled);
  };

  const markOf = (answer: K): AnswerMark | null => {
    if (current.right === answer) return 'right';
    if (current.wrong.includes(answer)) return 'wrong';
    if (answer === rightAnswer && current.right === null && current.wrong.length > 0) {
      return 'shown';
    }
    return null;
  };

  /** A marked button's state and look; `idleClass` is its look while unmarked. */
  const buttonProps = (answer: K, idleClass: string, markedClass = 'bg-white') => {
    const mark = markOf(answer);
    return {
      mark,
      'data-mark': mark ?? undefined,
      disabled: mark === 'wrong',
      className: mark ? `${markedClass} answer-mark answer-mark-${mark}` : idleClass,
    };
  };

  return { markRight, markWrong, markOf, buttonProps };
}
