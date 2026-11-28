/**
 * PatternTrainView Component
 *
 * Game view for pattern recognition games.
 * Header shows only generic game name (in GameScreen). Tips and paid hints available.
 */

import type { GameViewProps } from '../registry';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';
import { AnswerMarkIcon } from '../../components/shared/AnswerMark';
import { useAnswerMarks } from '../../hooks/useAnswerMarks';
import type { PatternProblem } from '../../types/game';
import { useEliminateWrongOption, wrongOptionIndices } from '../../hooks/useEliminateWrongOption';

type AnswerHandler = GameViewProps['onAnswer'];

interface PatternTrainViewProps {
  problem: PatternProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const PatternTrainView: React.FC<PatternTrainViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const [trainState, setTrainState] = useState<'enter' | 'idle' | 'leave'>('enter');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const problemUid = problem.uid;
  const answerIdx = problem.options.indexOf(problem.answer);
  const marks = useAnswerMarks<number>(problemUid, answerIdx, soundEnabled);
  const patternPreview = useMemo(() => problem.patternCycle.join(' '), [problem.patternCycle]);

  const gameId = gameType ?? 'pattern';
  const config = GAME_CONFIG[gameId];
  const paidHints = config?.paidHints ?? [];

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problemUid);
  if (lastSyncedUid !== problemUid) {
    setLastSyncedUid(problemUid);
    setTrainState('enter');
    setSelectedOption(null);
  }

  // After the reset above sets trainState to 'enter', schedule the
  // transition to 'idle'. Fires every time trainState becomes 'enter'.
  useEffect(() => {
    if (trainState !== 'enter') return;
    const timer = setTimeout(() => setTrainState('idle'), 600);
    return () => clearTimeout(timer);
  }, [trainState]);

  // A long train is wider than a phone, so bring the empty wagon into view.
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = trackRef.current;
    if (trainState === 'idle' && track) track.scrollLeft = track.scrollWidth;
  }, [trainState]);

  const { eliminated: eliminatedOptions, eliminate } = useEliminateWrongOption(
    wrongOptionIndices(problem.options, problem.answer),
    [problemUid],
    spendStars,
  );
  const handlePaidHint = (hintId: string) => {
    if (hintId === 'eliminate') eliminate();
  };

  const handleChoice = (opt: string, idx: number): void => {
    if (marks.markOf(idx) === 'wrong' || trainState === 'leave') return;

    setSelectedOption(idx);

    const isCorrect = opt === problem.answer;

    if (isCorrect) {
      const revealed = marks.markRight(idx);
      setTrainState('leave');
      setTimeout(() => {
        onAnswer(true, { revealed });
        setSelectedOption(null);
      }, 700);
    } else {
      marks.markWrong(idx);
      setTimeout(() => {
        onAnswer(false);
        setSelectedOption(null);
      }, 350);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white via-teal-50 to-emerald-50 border-2 sm:border-3 border-teal-200 shadow-lg px-3 sm:px-6 py-4 sm:py-6 overflow-hidden">
          <div className="absolute inset-x-6 bottom-4 h-1.5 sm:h-2 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400 rounded-full opacity-80"></div>
          <div className="absolute inset-x-8 bottom-2 h-1 bg-slate-300 rounded-full opacity-60"></div>

          <div
            ref={trackRef}
            className={`flex items-end gap-2 sm:gap-3 overflow-x-auto pb-6 sm:pb-8 transition-transform duration-700 ease-out ${
              trainState === 'enter' ? 'opacity-0 -translate-x-6' : ''
            } ${trainState === 'leave' ? 'opacity-0 translate-x-10' : ''}`}
          >
            <div className="flex items-end justify-center shrink-0 text-5xl sm:text-6xl leading-none translate-y-1 sm:translate-y-1.5">
              🚂
            </div>
            {problem.sequence.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className="relative w-12 h-16 sm:w-16 sm:h-20 rounded-2xl bg-white/90 border-2 border-teal-200 shadow-md flex items-center justify-center text-2xl sm:text-4xl shrink-0"
              >
                <span className="drop-shadow-sm">{item}</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-700 rounded-full"></span>
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-700 rounded-full"></span>
                </div>
              </div>
            ))}
            <div className="relative w-12 h-16 sm:w-16 sm:h-20 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-100/80 shadow-md flex items-center justify-center text-2xl sm:text-4xl shrink-0">
              <span className="font-black text-amber-700">?</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-700 rounded-full"></span>
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-700 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {marks.markOf(answerIdx) === 'shown' && (
        <p
          role="status"
          className="mt-3 w-full max-w-md rounded-xl border-2 border-ok px-3 py-2 text-center text-base text-ink"
        >
          {formatText(
            t.gameScreen.pattern.feedbackReason
              .replace('{pattern}', patternPreview)
              .replace('{answer}', problem.answer),
          )}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md mt-4 sm:mt-5">
        {problem.options.map((opt, idx) => {
          const isEliminated = eliminatedOptions.includes(idx);
          if (isEliminated) {
            return (
              <div
                key={idx}
                className="h-16 sm:h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100/50"
                aria-hidden
              />
            );
          }
          const leaving = trainState === 'leave';
          const { mark, className, disabled, ...markProps } = marks.buttonProps(
            idx,
            leaving
              ? 'bg-white border-teal-200'
              : selectedOption === idx
                ? 'bg-emerald-200 border-emerald-400 scale-[1.02] shadow-lg'
                : 'bg-white border-teal-200 hover:border-teal-400 hover:bg-teal-50 active:scale-95',
            'bg-white border-teal-200',
          );
          return (
            <button
              key={idx}
              {...markProps}
              disabled={disabled || leaving}
              onClick={() => handleChoice(opt, idx)}
              className={`
                h-16 sm:h-24 rounded-2xl border-2 text-3xl sm:text-5xl flex items-center justify-center
                transition-all duration-200 shadow-md ${className}
              `}
            >
              {opt}
              <AnswerMarkIcon mark={mark} />
            </button>
          );
        })}
      </div>

      {paidHints.length > 0 && (
        <PaidHintButtons
          hints={paidHints}
          stars={stars}
          onHintClick={handlePaidHint}
          disabled={trainState === 'leave'}
        />
      )}
    </div>
  );
};
