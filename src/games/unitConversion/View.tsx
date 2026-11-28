/**
 * UnitConversionView Component
 *
 * Game view for unit conversion games.
 */

import type { GameViewProps } from '../registry';
import React, { useMemo } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { buildUnitConversionQuestion } from '../../utils/unitConversion';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';
import type { UnitConversionProblem } from '../../types/game';
import { useAnswerLock } from '../../hooks/useAnswerLock';
import { useAnswerMarks } from '../../hooks/useAnswerMarks';
import { AnswerMarkIcon } from '../../components/shared/AnswerMark';
import { useEliminateWrongOption, wrongOptionIndices } from '../../hooks/useEliminateWrongOption';

type AnswerHandler = GameViewProps['onAnswer'];

interface UnitConversionViewProps {
  problem: UnitConversionProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const UnitConversionView: React.FC<UnitConversionViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const gameId = gameType ?? 'unit_conversion';
  const paidHints = GAME_CONFIG[gameId]?.paidHints ?? [];
  const questionText = useMemo(
    () => buildUnitConversionQuestion(t, problem.value, problem.fromUnit, problem.toUnit),
    [t, problem.value, problem.fromUnit, problem.toUnit],
  );

  const { eliminated: eliminatedIndices, eliminate } = useEliminateWrongOption(
    wrongOptionIndices(problem.options, problem.answer),
    [problem.uid],
    spendStars,
  );
  const handlePaidHint = (hintId: string) => {
    if (hintId === 'eliminate') eliminate();
  };

  const { isLocked, lock } = useAnswerLock(problem.uid);
  const marks = useAnswerMarks<number>(problem.uid, problem.answer, soundEnabled);

  const handleChoice = (opt: number): void => {
    if (isLocked()) return;
    const isCorrect = opt === problem.answer;
    if (isCorrect) lock();

    if (isCorrect) {
      onAnswer(true, { revealed: marks.markRight(opt) });
    } else {
      marks.markWrong(opt);
      onAnswer(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      {/* Task display */}
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border-b-6 sm:border-b-8 border-teal-200 shadow-lg text-center w-full max-w-md">
        {/* Question */}
        <h2 className="text-lg sm:text-2xl font-black text-teal-700 mb-2 sm:mb-3">
          {formatText(questionText)}
        </h2>

        {/* Conversion visually */}
        <div className="text-xl sm:text-3xl font-bold text-slate-600 bg-teal-50 rounded-xl p-3 sm:p-4 border-2 border-teal-200">
          {formatText(`${problem.value} ${problem.fromUnit} = ? ${problem.toUnit}`)}
        </div>
      </div>

      <div className="text-xs sm:text-sm font-semibold text-slate-600 mb-2 px-2 text-center">
        {t.unitConversion.instruction}
      </div>

      {/* Options - 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
        {problem.options.map((opt, idx) => {
          const isEliminated = eliminatedIndices.includes(idx);
          if (isEliminated) {
            return (
              <div
                key={idx}
                className="h-20 sm:h-24 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 bg-slate-100/50 min-h-[5rem] sm:min-h-[6rem]"
                aria-hidden
              />
            );
          }
          const { mark, className, ...markProps } = marks.buttonProps(
            opt,
            'bg-gradient-to-br from-white to-teal-50 border-teal-300 hover:border-teal-500 hover:bg-teal-100 hover:scale-105 hover:-translate-y-1 hover:shadow-xl active:scale-95 active:border-b-2 active:translate-y-1',
            'bg-white border-teal-300',
          );
          return (
            <button
              key={idx}
              {...markProps}
              onClick={() => handleChoice(opt)}
              className={`
                h-20 sm:h-24 rounded-2xl sm:rounded-3xl border-b-6 sm:border-b-8
                text-2xl sm:text-3xl font-black flex items-center justify-center
                transition-all shadow-lg ${className}
              `}
            >
              <span className={mark ? '' : 'text-teal-700'}>
                {opt} {problem.toUnit}
              </span>
              <AnswerMarkIcon mark={mark} />
            </button>
          );
        })}
      </div>
      {paidHints.length > 0 && (
        <PaidHintButtons hints={paidHints} stars={stars} onHintClick={handlePaidHint} />
      )}
    </div>
  );
};
