/**
 * AnswerCardView Component
 *
 * Shared answer-card shell: a prompt card, a grid of options and paid hints.
 * The game's view supplies the prompt, how an option renders and which one is
 * correct (letter_match, sentence_logic).
 */

import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { useAnswerLock } from '../../hooks/useAnswerLock';
import { GAME_CONFIG } from '../../games/data';
import { PaidHintButtons } from '../shared';
import type { GameViewProps } from '../../games/registry';

/** Props the game's view receives from GameRenderer and passes on. */
export interface AnswerCardGameProps<P> extends Omit<GameViewProps, 'problem'> {
  problem: P;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

interface AnswerCardViewProps<O> extends AnswerCardGameProps<{
  type: string;
  uid: string;
  options: readonly O[];
}> {
  prompt: ReactNode;
  instruction?: ReactNode;
  isCorrect: (opt: O) => boolean;
  optionId: (opt: O) => string;
  renderOption: (opt: O, idx: number) => ReactNode;
  gridClassName: string;
  optionClassName: string;
}

export const AnswerCardView = <O,>({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  prompt,
  instruction,
  isCorrect,
  optionId,
  renderOption,
  gridClassName,
  optionClassName,
}: AnswerCardViewProps<O>): React.ReactElement => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const gameId = gameType ?? problem.type;
  const paidHints = GAME_CONFIG[gameId]?.paidHints ?? [];
  const [disabled, setDisabled] = useState<string[]>([]);
  const [showWrongHint, setShowWrongHint] = useState(false);
  const problemUid: string = problem.uid;

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problemUid);
  if (lastSyncedUid !== problemUid) {
    setLastSyncedUid(problemUid);
    setDisabled([]);
    setShowWrongHint(false);
  }

  const { isLocked, lock } = useAnswerLock(problemUid);

  const handleChoice = (opt: O): void => {
    if (isLocked()) return;

    playSound('click', soundEnabled);

    if (isCorrect(opt)) {
      lock();
      onAnswer(true);
    } else {
      setDisabled([...disabled, optionId(opt)]);
      setShowWrongHint(true);
      window.setTimeout(() => setShowWrongHint(false), 1200);
      onAnswer(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div className="mb-4 sm:mb-6 p-3 sm:p-6 bg-surface rounded-xl border border-b-6 sm:border-b-8 border-rule text-center w-full">
        {prompt}
      </div>
      {instruction && (
        <div className="text-xs sm:text-sm font-semibold text-ink-2 mb-2 px-2 text-center">
          {instruction}
        </div>
      )}
      {/* Wrong-answer feedback: reserve space to prevent layout shift. */}
      <div
        className={`mb-2 w-full max-w-sm min-h-[2.25rem] transition-opacity duration-300 ${
          showWrongHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {showWrongHint && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border-2 border-bad/30 bg-bad/10 px-3 py-1.5 text-center text-sm font-semibold text-bad"
          >
            {formatText(t.feedback.notThisOne)}
          </div>
        )}
      </div>
      <div className={`grid ${gridClassName} w-full`}>
        {problem.options.map((opt, idx) => {
          const isDisabled = disabled.includes(optionId(opt));
          return (
            <button
              key={idx}
              data-testid={`standard-answer-${idx}`}
              disabled={isDisabled}
              onClick={() => handleChoice(opt)}
              className={`
                rounded-lg border-b-4 sm:border-b-[6px] text-2xl sm:text-3xl font-semibold flex items-center justify-center transition-all p-1
                ${optionClassName}
                ${isDisabled ? 'bg-sunken border-sunken opacity-40 cursor-not-allowed scale-95' : 'hover:border-muted active:bg-sunken active:border-b-0 active:translate-y-1 transition-all duration-200'}
              `}
            >
              {renderOption(opt, idx)}
            </button>
          );
        })}
      </div>
      {paidHints.length > 0 && (
        <PaidHintButtons hints={paidHints} stars={stars} onHintClick={() => {}} />
      )}
    </div>
  );
};
