/**
 * TimeGameView Component
 *
 * Clock game: read the analog clock and choose the matching time. Visual feedback on clock; optional quarter/half label; paid hint to eliminate one wrong option; correct-answer sound; accessible.
 */

import React, { useEffect, useRef, useState } from 'react';
import { playSound } from '../../engine/audio';
import { TimeDisplay } from '../../components/shared/TimeDisplay';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';
import type { TimeMatchProblem } from '../../types/game';
import { useEliminateWrongOption, wrongOptionIndices } from '../../hooks/useEliminateWrongOption';
import { useAnswerLock } from '../../hooks/useAnswerLock';
import { useTranslation } from '../../i18n/useTranslation';
import { timeMatchLabel } from './labels';

type AnswerHandler = (answer: boolean) => void;

interface TimeGameViewProps {
  problem: TimeMatchProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

const OPTION_BASE =
  'h-14 sm:h-16 rounded-xl sm:rounded-2xl border-b-4 sm:border-b-[6px] font-black flex items-center justify-center text-center leading-tight transition-all p-1.5 sm:p-2 shadow-sm box-border shrink-0';
const OPTION_CLASS = {
  digital: `${OPTION_BASE} text-base sm:text-xl w-[88px] sm:w-[104px]`,
  // "kolmveerand 12" needs the column's width and may wrap.
  spoken: `${OPTION_BASE} text-sm sm:text-lg w-full`,
} as const;

export const TimeGameView: React.FC<TimeGameViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const gameId = gameType ?? 'time_match';
  const paidHints = GAME_CONFIG[gameId]?.paidHints ?? [];
  const [disabled, setDisabled] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problem.uid);
  if (lastSyncedUid !== problem.uid) {
    setLastSyncedUid(problem.uid);
    setDisabled([]);
    setFeedback(null);
  }

  // Clear pending feedback timers when the problem changes or on unmount.
  // No setState in here, so the set-state-in-effect rule doesn't apply, and
  // the ref is touched only inside the effect cleanup, not during render.
  useEffect(() => {
    const timeouts = feedbackTimeoutsRef;
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, [problem.uid]);

  const { eliminated: eliminatedIndices, eliminate } = useEliminateWrongOption(
    wrongOptionIndices(problem.options, problem.answer),
    [problem.uid],
    spendStars,
  );
  const handlePaidHint = (hintId: string) => {
    if (hintId === 'eliminate') eliminate();
  };

  const { isLocked, lock } = useAnswerLock(problem.uid);

  const handleChoice = (opt: string): void => {
    if (isLocked()) return;
    const correct = opt === problem.answer;
    if (correct) lock();
    playSound('click', soundEnabled);
    feedbackTimeoutsRef.current.forEach(clearTimeout);
    feedbackTimeoutsRef.current = [];
    if (correct) {
      playSound('correct', soundEnabled);
      setFeedback('correct');
      onAnswer(true);
      const id = setTimeout(() => setFeedback(null), 500);
      feedbackTimeoutsRef.current.push(id);
    } else {
      setFeedback('wrong');
      setDisabled((prev) => [...prev, opt]);
      onAnswer(false);
      const id = setTimeout(() => setFeedback(null), 600);
      feedbackTimeoutsRef.current.push(id);
    }
  };

  const { hour, minute } = problem.display;

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <TimeDisplay hour={hour} minute={minute} feedback={feedback} />
      <div
        className={`grid gap-2 sm:gap-3 w-full max-w-sm mt-4 sm:mt-5 justify-items-center ${problem.options.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}
      >
        {problem.options.map((opt, idx) => {
          const isEliminated = eliminatedIndices.includes(idx);
          if (isEliminated) {
            return (
              <div
                key={idx}
                className={`${OPTION_CLASS[problem.labelStyle]} border-dashed border-slate-200 bg-slate-100/50`}
                aria-hidden
              />
            );
          }
          const isDisabled = disabled.includes(opt);
          return (
            <button
              key={idx}
              disabled={isDisabled}
              onClick={() => handleChoice(opt)}
              className={`
                ${OPTION_CLASS[problem.labelStyle]}
                bg-white border-blue-200 text-slate-700
                ${isDisabled ? 'bg-slate-100 border-slate-100 opacity-40 cursor-not-allowed scale-95' : 'hover:border-blue-400 hover:-translate-y-1 active:scale-95 active:border-b-0 active:translate-y-1'}
              `}
            >
              {timeMatchLabel(opt, problem.labelStyle, t)}
            </button>
          );
        })}
      </div>
      {paidHints.length > 0 && (
        <div className="mt-4 w-full max-w-sm flex justify-center">
          <PaidHintButtons hints={paidHints} stars={stars} onHintClick={handlePaidHint} />
        </div>
      )}
    </div>
  );
};
