/**
 * AnswerCardView Component
 *
 * Shared answer-card shell: a prompt card, a grid of options and paid hints.
 * The game's view supplies the prompt, how an option renders and which one is
 * correct (letter_match, sentence_logic).
 */

import React from 'react';
import type { ReactNode } from 'react';
import { useAnswerLock } from '../../hooks/useAnswerLock';
import { useAnswerMarks } from '../../hooks/useAnswerMarks';
import { GAME_CONFIG } from '../../games/data';
import { PaidHintButtons } from '../shared';
import { AnswerMarkIcon } from '../shared/AnswerMark';
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
  const gameId = gameType ?? problem.type;
  const paidHints = GAME_CONFIG[gameId]?.paidHints ?? [];
  const problemUid: string = problem.uid;
  const { isLocked, lock } = useAnswerLock(problemUid);
  const rightOption = problem.options.find(isCorrect);
  const marks = useAnswerMarks<string>(
    problemUid,
    rightOption === undefined ? '' : optionId(rightOption),
    soundEnabled,
  );

  const handleChoice = (opt: O): void => {
    if (isLocked()) return;

    if (isCorrect(opt)) {
      lock();
      onAnswer(true, { revealed: marks.markRight(optionId(opt)) });
    } else {
      marks.markWrong(optionId(opt));
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
      <div className={`grid ${gridClassName} w-full`}>
        {problem.options.map((opt, idx) => {
          const { mark, className, ...markProps } = marks.buttonProps(
            optionId(opt),
            'hover:border-muted active:bg-sunken active:border-b-0 active:translate-y-1 transition-all duration-200',
            '',
          );
          return (
            <button
              key={idx}
              data-testid={`standard-answer-${idx}`}
              {...markProps}
              onClick={() => handleChoice(opt)}
              className={`
                rounded-lg border-b-4 sm:border-b-[6px] text-2xl sm:text-3xl font-semibold flex items-center justify-center transition-all p-1
                ${optionClassName}
                ${className}
                ${mark === 'wrong' ? 'cursor-not-allowed' : ''}
              `}
            >
              {renderOption(opt, idx)}
              <AnswerMarkIcon mark={mark} />
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
