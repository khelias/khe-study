import React, { useCallback, useState } from 'react';
import type { CompareSizesProblem } from '../types/game';
import { useTranslation } from '../i18n/useTranslation';
import { playSound } from '../engine/audio';
import { GAME_CONFIG } from '../games/data';
import { PaidHintButtons } from './shared';

type CompareOption = 'left' | 'right' | 'equal';

interface CompareSizesViewProps {
  problem: CompareSizesProblem;
  onAnswer: (isCorrect: boolean) => void;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

// Dice face dots patterns (1-6) - using CSS Grid for robust scaling
const DiceFace: React.FC<{ value: number }> = ({ value }) => {
  const getDotPattern = (val: number): boolean[] => {
    const patterns: Record<number, boolean[]> = {
      1: [false, false, false, false, true, false, false, false, false],
      2: [true, false, false, false, false, false, false, false, true],
      3: [true, false, false, false, true, false, false, false, true],
      4: [true, false, true, false, false, false, true, false, true],
      5: [true, false, true, false, true, false, true, false, true],
      6: [true, false, true, true, false, true, true, false, true],
    };
    return patterns[val] ?? patterns[1]!;
  };

  const pattern = getDotPattern(value);

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 sm:border-4 border-gray-800 rounded-lg shadow-lg aspect-square p-1 sm:p-2">
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5 sm:gap-1">
        {pattern.map((hasDot, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {hasDot && <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-gray-900 rounded-full" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CompareSizesView: React.FC<CompareSizesViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const baseType = gameType?.replace('_adv', '') ?? 'compare_sizes';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  const [selectedAnswer, setSelectedAnswer] = useState<CompareOption | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<CompareOption[]>([]);

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problem.uid);
  if (lastSyncedUid !== problem.uid) {
    setLastSyncedUid(problem.uid);
    setEliminatedOptions([]);
  }

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (hintId !== 'eliminate' || !spendStars) return;
      const wrongOptions = problem.options.filter(
        (opt) => opt !== problem.answer && !eliminatedOptions.includes(opt),
      );
      if (wrongOptions.length === 0) return;
      if (!spendStars(1)) return;
      const pick = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] as CompareOption;
      setEliminatedOptions((prev) => [...prev, pick]);
    },
    [problem.options, problem.answer, eliminatedOptions, spendStars],
  );

  const handleAnswer = (userAnswer: CompareOption) => {
    setSelectedAnswer(userAnswer);
    const isCorrect = userAnswer === problem.answer;

    if (soundEnabled) {
      playSound(isCorrect ? 'correct' : 'wrong');
    }

    // Hold the wrong-answer screen longer so the learner can read the
    // educational feedback line ("Õige vastus oli >").
    setTimeout(
      () => {
        onAnswer(isCorrect);
        setSelectedAnswer(null);
      },
      isCorrect ? 800 : 1500,
    );
  };

  const answerWordLabel = (option: CompareOption): string => {
    if (option === 'left') return t.games.compare_sizes.leftBigger;
    if (option === 'right') return t.games.compare_sizes.rightBigger;
    return t.games.compare_sizes.equal;
  };

  const getSymbol = (option: CompareOption) => {
    if (option === 'left') return '>';
    if (option === 'right') return '<';
    return '=';
  };

  // Check if we're using dice visualization
  const isDiceMode = problem.leftItem.visual && problem.leftItem.visual.includes('🎲');

  // Render dice display with responsive layout
  const renderDiceDisplay = (value: number) => {
    if (value <= 6) {
      return <DiceFace value={value} />;
    } else {
      // For double dice (7-12), show two dice
      const firstDie = Math.min(6, value - 6);
      const secondDie = 6;
      return (
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <DiceFace value={secondDie} />
          <DiceFace value={firstDie} />
        </div>
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      {/* Comparison display */}
      <div className="flex flex-row items-center justify-center gap-3 sm:gap-5 lg:gap-8 mb-6 sm:mb-8 w-full max-w-5xl">
        {/* Left item */}
        <div
          className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-4 sm:p-5 lg:p-7 min-w-[110px] sm:min-w-[150px] lg:min-w-[200px] min-h-[110px] sm:min-h-[150px] lg:min-h-[200px] border-3 sm:border-4 border-blue-400 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex-1 max-w-xs relative overflow-hidden"
          aria-label={t.games.compare_sizes.leftItem}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-transparent pointer-events-none"></div>
          {isDiceMode ? (
            <div className="flex flex-col items-center gap-2 sm:gap-4 relative z-10">
              {renderDiceDisplay(problem.leftItem.value)}
              {problem.showNumbers && (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-700 mt-2 drop-shadow-sm">
                  {problem.leftItem.value}
                </div>
              )}
            </div>
          ) : (
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-blue-600 drop-shadow-md relative z-10">
              {problem.leftItem.display}
            </div>
          )}
        </div>

        {/* Middle comparison symbol placeholder - more elegant */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 px-2 sm:px-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 border-3 sm:border-4 border-purple-400 flex items-center justify-center shadow-lg">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-purple-600 animate-pulse">
              ?
            </div>
          </div>
          <div className="text-[10px] sm:text-xs font-semibold text-purple-700 mt-2 text-center max-w-[80px]">
            {t.games.compare_sizes.selectSymbol}
          </div>
        </div>

        {/* Right item */}
        <div
          className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-4 sm:p-5 lg:p-7 min-w-[110px] sm:min-w-[150px] lg:min-w-[200px] min-h-[110px] sm:min-h-[150px] lg:min-h-[200px] border-3 sm:border-4 border-green-400 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex-1 max-w-xs relative overflow-hidden"
          aria-label={t.games.compare_sizes.rightItem}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-200/20 to-transparent pointer-events-none"></div>
          {isDiceMode ? (
            <div className="flex flex-col items-center gap-2 sm:gap-4 relative z-10">
              {renderDiceDisplay(problem.rightItem.value)}
              {problem.showNumbers && (
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-700 mt-2 drop-shadow-sm">
                  {problem.rightItem.value}
                </div>
              )}
            </div>
          ) : (
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-green-600 drop-shadow-md relative z-10">
              {problem.rightItem.display}
            </div>
          )}
        </div>
      </div>

      {/* Symbol selection – same order as above: Left | Middle | Right; colors echo the comparison boxes */}
      <div className="flex gap-3 sm:gap-4 lg:gap-5 justify-center max-w-2xl w-full">
        {(['left', 'equal', 'right'] as const).map((option) => {
          const symbol = getSymbol(option);
          const isEliminated = eliminatedOptions.includes(option);
          const isAvailable = problem.options.includes(option);
          const label =
            option === 'left'
              ? `${symbol} (${t.games.compare_sizes.leftBigger})`
              : option === 'right'
                ? `${symbol} (${t.games.compare_sizes.rightBigger})`
                : `${symbol} (${t.games.compare_sizes.equal})`;

          const baseSize =
            'flex flex-col items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 lg:px-7 py-3 sm:py-4 lg:py-5 rounded-2xl sm:rounded-3xl font-bold w-[100px] sm:w-[120px] lg:w-[140px] h-[80px] sm:h-[96px] lg:h-[112px] border-3 sm:border-4 box-border';

          if (isEliminated) {
            return (
              <div
                key={option}
                className={`${baseSize} border-dashed border-slate-200 bg-slate-100/50 pointer-events-none shrink-0`}
                aria-hidden
              />
            );
          }

          const optionStyles = {
            left: {
              idle: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-500 hover:from-blue-500 hover:to-blue-700 shadow-xl hover:shadow-2xl border-3 sm:border-4 border-blue-400',
              correct:
                'bg-gradient-to-br from-green-500 to-green-600 text-white ring-4 ring-green-300 border-green-400',
              wrong:
                'bg-gradient-to-br from-red-500 to-red-600 text-white ring-4 ring-red-300 border-red-400',
              disabled:
                'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-400 border-slate-300',
            },
            equal: {
              idle: 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white border-purple-500 hover:from-purple-500 hover:to-indigo-600 shadow-xl hover:shadow-2xl border-3 sm:border-4 border-purple-400',
              correct:
                'bg-gradient-to-br from-green-500 to-green-600 text-white ring-4 ring-green-300 border-green-400',
              wrong:
                'bg-gradient-to-br from-red-500 to-red-600 text-white ring-4 ring-red-300 border-red-400',
              disabled:
                'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-400 border-slate-300',
            },
            right: {
              idle: 'bg-gradient-to-br from-green-400 to-emerald-600 text-white border-emerald-500 hover:from-green-500 hover:to-emerald-700 shadow-xl hover:shadow-2xl border-3 sm:border-4 border-green-400',
              correct:
                'bg-gradient-to-br from-green-500 to-green-600 text-white ring-4 ring-green-300 border-green-400',
              wrong:
                'bg-gradient-to-br from-red-500 to-red-600 text-white ring-4 ring-red-300 border-red-400',
              disabled:
                'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-400 border-slate-300',
            },
          };
          const style = optionStyles[option];
          const stateClass =
            selectedAnswer === option
              ? selectedAnswer === problem.answer
                ? style.correct
                : style.wrong
              : isAvailable
                ? style.idle
                : style.disabled;

          return (
            <button
              key={option}
              onClick={() => isAvailable && handleAnswer(option)}
              disabled={!isAvailable || selectedAnswer !== null}
              className={`
                ${baseSize} shrink-0 relative overflow-hidden transition-all duration-300 transform
                ${isAvailable && selectedAnswer === null ? 'hover:scale-105 hover:-translate-y-0.5 active:scale-95' : ''}
                ${stateClass}
                ${!isAvailable || selectedAnswer !== null ? 'opacity-60' : ''}
              `}
              aria-label={label}
              aria-disabled={!isAvailable}
            >
              {isAvailable && selectedAnswer === null && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
              )}
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black drop-shadow-lg relative z-10">
                {symbol}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-center relative z-10 leading-tight">
                {option === 'left'
                  ? t.games.compare_sizes.leftBigger
                  : option === 'right'
                    ? t.games.compare_sizes.rightBigger
                    : t.games.compare_sizes.equal}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visible wrong-answer feedback: shows the correct symbol + label so
          the learner walks away knowing the answer, not just that they missed. */}
      {selectedAnswer && selectedAnswer !== problem.answer && (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 w-full max-w-md rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-center"
        >
          <div className="text-sm sm:text-base font-bold text-rose-700">
            {t.feedback.correctAnswerIs.replace('{answer}', getSymbol(problem.answer))}
          </div>
          <div className="mt-1 text-xs sm:text-sm font-medium text-rose-600">
            {answerWordLabel(problem.answer)}
          </div>
        </div>
      )}
      {/* Screen reader feedback for correct answers (visual cue is the button color). */}
      {selectedAnswer && selectedAnswer === problem.answer && (
        <div className="sr-only" role="status" aria-live="polite">
          {t.feedback.correct[0]}
        </div>
      )}
      {paidHints.length > 0 && (
        <PaidHintButtons hints={paidHints} stars={stars} onHintClick={handlePaidHint} />
      )}
    </div>
  );
};
