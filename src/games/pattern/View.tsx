/**
 * PatternTrainView Component
 *
 * Game view for pattern recognition games.
 * Header shows only generic game name (in GameScreen). Tips and paid hints available.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../data';
import { FeedbackModal, PaidHintButtons } from '../../components/shared';
import type { PatternProblem } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;

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
  const [disabled, setDisabled] = useState<number[]>([]);
  const [trainState, setTrainState] = useState<'enter' | 'idle' | 'leave'>('enter');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedbackChoice, setFeedbackChoice] = useState<string | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const eliminatedRef = useRef<number[]>([]);
  useEffect(() => {
    eliminatedRef.current = eliminatedOptions;
  }, [eliminatedOptions]);
  const problemUid = problem.uid;
  const patternPreview = useMemo(() => problem.patternCycle.join(' '), [problem.patternCycle]);

  const baseType = gameType?.replace('_adv', '') ?? 'pattern';
  const config = GAME_CONFIG[baseType];
  const paidHints = config?.paidHints ?? [];

  // Reset state when problem changes (render-time prop comparison).
  // The mirror-into-ref effect above will catch up the empty eliminatedOptions
  // before any non-render code reads the ref.
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problemUid);
  if (lastSyncedUid !== problemUid) {
    setLastSyncedUid(problemUid);
    setDisabled([]);
    setTrainState('enter');
    setSelectedOption(null);
    setFeedbackChoice(null);
    setEliminatedOptions([]);
  }

  // After the reset above sets trainState to 'enter', schedule the
  // transition to 'idle'. Fires every time trainState becomes 'enter'.
  useEffect(() => {
    if (trainState !== 'enter') return;
    const timer = setTimeout(() => setTrainState('idle'), 600);
    return () => clearTimeout(timer);
  }, [trainState]);

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (hintId !== 'eliminate' || !spendStars) return;
      const current = eliminatedRef.current;
      const wrongIndices = problem.options
        .map((opt, idx) => (opt !== problem.answer ? idx : -1))
        .filter((i) => i >= 0 && !current.includes(i));
      if (wrongIndices.length === 0) return;
      if (!spendStars(1)) return;
      const pick = wrongIndices[Math.floor(Math.random() * wrongIndices.length)] as number;
      setEliminatedOptions((prev) => {
        const next: number[] = [...prev, pick];
        eliminatedRef.current = next;
        return next;
      });
    },
    [problem.options, problem.answer, spendStars],
  );

  const handleChoice = (opt: string, idx: number): void => {
    if (disabled.includes(idx) || trainState === 'leave') return;

    playSound('click', soundEnabled);
    setSelectedOption(idx);

    const isCorrect = opt === problem.answer;

    if (isCorrect) {
      setFeedbackChoice(null);
      setTrainState('leave');
      setTimeout(() => {
        onAnswer(true);
        setSelectedOption(null);
      }, 700);
    } else {
      setDisabled((prev) => [...prev, idx]);
      setFeedbackChoice(opt);
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

      <FeedbackModal
        isOpen={!!feedbackChoice}
        onClose={() => setFeedbackChoice(null)}
        title={formatText(t.gameScreen.pattern.feedbackTitle)}
        buttonLabel={formatText(t.game.continue)}
        variant="wrong"
      >
        <>
          <p>
            {formatText(
              t.gameScreen.pattern.feedbackReason
                .replace('{pattern}', patternPreview)
                .replace('{answer}', problem.answer),
            )}
          </p>
          <p className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">
              {formatText(t.gameScreen.pattern.feedbackChoiceLabel)}
            </span>
            <span className="text-xl">{feedbackChoice}</span>
          </p>
          <p className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{formatText(t.gameScreen.pattern.patternLabel)}</span>
            <span className="flex gap-1 text-lg">
              {problem.patternCycle.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </span>
          </p>
        </>
      </FeedbackModal>

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
          const isDisabled = disabled.includes(idx) || trainState === 'leave';
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              disabled={isDisabled}
              onClick={() => handleChoice(opt, idx)}
              className={`
                h-16 sm:h-24 rounded-2xl border-2 text-3xl sm:text-5xl flex items-center justify-center
                transition-all duration-200 shadow-md
                ${
                  isDisabled
                    ? 'bg-slate-200 opacity-40 grayscale cursor-not-allowed border-slate-300'
                    : isSelected
                      ? 'bg-emerald-200 border-emerald-400 scale-[1.02] shadow-lg'
                      : 'bg-white border-teal-200 hover:border-teal-400 hover:bg-teal-50 active:scale-95'
                }
              `}
            >
              {opt}
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
