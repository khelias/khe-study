/**
 * WordGameView Component
 *
 * Game view for word builder games.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { GAME_CONFIG } from '../../games/data';
import { PaidHintButtons } from '../shared';
import type { WordBuilderProblem, LetterObject } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;

interface WordGameViewProps {
  problem: WordBuilderProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

/** Returns ids of pool letters that are distractors (excess over target) */
function getDistractorIds(target: string, pool: LetterObject[]): string[] {
  const need = new Map<string, number>();
  for (const c of target) {
    const key = c.toUpperCase();
    need.set(key, (need.get(key) ?? 0) + 1);
  }
  const ids: string[] = [];
  for (const l of pool) {
    const key = l.char.toUpperCase();
    const n = need.get(key) ?? 0;
    if (n > 0) {
      need.set(key, n - 1);
    } else {
      ids.push(l.id);
    }
  }
  return ids;
}

export const WordGameView: React.FC<WordGameViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const baseType = gameType?.replace('_adv', '') ?? 'word_builder';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];

  // Builds the slate of empty/prefilled slots and the matching letter pool
  // (with prefilled letters removed) for the current problem.
  const buildInitialState = (
    p: WordBuilderProblem,
  ): {
    word: Array<{ char: string; id: string } | null>;
    pool: Array<{ char: string; id: string }>;
  } => {
    const word: Array<{ char: string; id: string } | null> = [];
    for (let i = 0; i < p.target.length; i++) {
      if (p.preFilledPositions?.includes(i)) {
        const char = p.target[i];
        word[i] = char ? { char, id: `prefilled-${i}` } : null;
      } else {
        word[i] = null;
      }
    }
    const pool = [...(p.shuffled || [])];
    p.preFilledPositions?.forEach((idx) => {
      const char = p.target[idx];
      if (char) {
        const indexInPool = pool.findIndex((l) => l.char.toUpperCase() === char.toUpperCase());
        if (indexInPool !== -1) pool.splice(indexInPool, 1);
      }
    });
    return { word, pool };
  };

  const [userWord, setUserWord] = useState<Array<{ char: string; id: string } | null>>(
    () => buildInitialState(problem).word,
  );
  const [pool, setPool] = useState<Array<{ char: string; id: string }>>(
    () => buildInitialState(problem).pool,
  );
  const [eliminatedLetterIds, setEliminatedLetterIds] = useState<string[]>([]);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problem.uid);
  if (lastSyncedUid !== problem.uid) {
    setLastSyncedUid(problem.uid);
    const { word, pool: nextPool } = buildInitialState(problem);
    setEliminatedLetterIds([]);
    setUserWord(word);
    setPool(nextPool);
    setWrongFeedback(null);
  }

  const isPreFilled = useCallback(
    (index: number): boolean => problem.preFilledPositions?.includes(index) ?? false,
    [problem.preFilledPositions],
  );

  const handleSelect = (letter: LetterObject): void => {
    playSound('click', soundEnabled);

    // Use functional updates to avoid stale state
    setUserWord((prevWord) => {
      // Find first empty (non-prefilled) slot
      const emptyIndex = prevWord.findIndex((l, idx) => !isPreFilled(idx) && l === null);
      if (emptyIndex === -1) return prevWord; // All non-prefilled slots are full

      const newWord = [...prevWord];
      newWord[emptyIndex] = letter;

      // Check if all positions are filled (defer onAnswer to avoid setState-during-render)
      if (newWord.every((l) => l !== null)) {
        const userString = newWord.map((l) => l.char).join('');
        const isCorrect = userString.toLowerCase() === problem.target.toLowerCase();
        if (isCorrect) {
          setTimeout(() => onAnswer(true), 0);
        } else {
          setWrongFeedback(problem.target);
          setTimeout(() => {
            onAnswer(false);
            const resetWord: Array<{ char: string; id: string } | null> = [];
            for (let i = 0; i < problem.target.length; i++) {
              if (problem.preFilledPositions?.includes(i)) {
                const char = problem.target[i];
                resetWord[i] = char ? { char, id: `prefilled-${i}` } : null;
              } else {
                resetWord[i] = null;
              }
            }
            const resetPool = [...(problem.shuffled || [])];
            problem.preFilledPositions?.forEach((idx) => {
              const char = problem.target[idx];
              if (char) {
                const indexInPool = resetPool.findIndex(
                  (l) => l.char.toUpperCase() === char.toUpperCase(),
                );
                if (indexInPool !== -1) {
                  resetPool.splice(indexInPool, 1);
                }
              }
            });
            setUserWord(resetWord);
            setPool(resetPool);
            setWrongFeedback(null);
          }, 1500);
        }
      }

      return newWord;
    });

    setPool((prev) => prev.filter((l) => l.id !== letter.id));
  };

  const visiblePool = useMemo(
    () => pool.filter((l) => !eliminatedLetterIds.includes(l.id)),
    [pool, eliminatedLetterIds],
  );

  const getResetState = useCallback(() => {
    const resetWord: Array<{ char: string; id: string } | null> = [];
    for (let i = 0; i < problem.target.length; i++) {
      if (problem.preFilledPositions?.includes(i)) {
        const char = problem.target[i];
        resetWord[i] = char ? { char, id: `prefilled-${i}` } : null;
      } else {
        resetWord[i] = null;
      }
    }
    const resetPool = [...(problem.shuffled || [])];
    problem.preFilledPositions?.forEach((idx) => {
      const char = problem.target[idx];
      if (char) {
        const indexInPool = resetPool.findIndex((l) => l.char.toUpperCase() === char.toUpperCase());
        if (indexInPool !== -1) resetPool.splice(indexInPool, 1);
      }
    });
    return { resetWord, resetPool };
  }, [problem.target, problem.shuffled, problem.preFilledPositions]);

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (!spendStars) return;
      if (hintId === 'reveal_next') {
        const firstEmpty = userWord.findIndex((l, idx) => !isPreFilled(idx) && l === null);
        if (firstEmpty === -1) return;
        const neededChar = problem.target[firstEmpty];
        if (!neededChar) return;
        const letterInPool = pool.find(
          (l) =>
            l.char.toUpperCase() === neededChar.toUpperCase() &&
            !eliminatedLetterIds.includes(l.id),
        );
        if (!letterInPool) return;
        if (!spendStars(1)) return;
        const nextWord: Array<{ char: string; id: string } | null> = [...userWord];
        nextWord[firstEmpty] = letterInPool;
        setUserWord(nextWord);
        setPool((prev) => prev.filter((l) => l.id !== letterInPool.id));
        if (nextWord.every((l) => l !== null)) {
          const userString = nextWord.map((l) => l.char).join('');
          const isCorrect = userString.toLowerCase() === problem.target.toLowerCase();
          const { resetWord, resetPool } = getResetState();
          const delay = isCorrect ? 0 : 1500;
          if (!isCorrect) setWrongFeedback(problem.target);
          setTimeout(() => {
            onAnswer(isCorrect);
            if (!isCorrect) {
              setUserWord(resetWord);
              setPool(resetPool);
              setWrongFeedback(null);
            }
          }, delay);
        }
        return;
      }
      if (hintId === 'eliminate') {
        const distractorIds = getDistractorIds(problem.target, pool);
        const stillPresent = distractorIds.filter((id) => !eliminatedLetterIds.includes(id));
        if (stillPresent.length === 0) return;
        if (!spendStars(1)) return;
        const pick = stillPresent[Math.floor(Math.random() * stillPresent.length)]!;
        setEliminatedLetterIds((prev) => [...prev, pick]);
      }
    },
    [
      problem.target,
      pool,
      userWord,
      eliminatedLetterIds,
      spendStars,
      onAnswer,
      getResetState,
      isPreFilled,
    ],
  );

  const handleRemove = (letter: LetterObject, idx: number): void => {
    // Cannot remove pre-filled letters
    if (isPreFilled(idx)) return;

    playSound('click', soundEnabled);

    // Use functional updates to avoid stale state
    setUserWord((prev) => {
      const newUserWord = [...prev];
      newUserWord[idx] = null;
      return newUserWord;
    });

    setPool((prev) => [...prev, letter]);
  };

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div
        data-testid="word-builder-emoji"
        className="text-6xl sm:text-9xl mb-4 sm:mb-8 animate-bounce filter drop-shadow-xl"
      >
        {problem.emoji}
      </div>

      {/* Hint - always reserve space to prevent layout shift */}
      <div
        className={`mb-2 text-sm sm:text-base text-orange-600 font-bold min-h-[1.5rem] transition-opacity duration-300 ${
          problem.preFilledPositions && problem.preFilledPositions.length > 0
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        {problem.preFilledPositions && problem.preFilledPositions.length > 0 && (
          <>💡 {t.gameScreen.wordBuilder.preFilled}</>
        )}
      </div>

      {/* Wrong-answer feedback — reserve space to prevent layout shift. */}
      <div
        className={`mb-2 w-full max-w-sm min-h-[2.25rem] transition-opacity duration-300 ${
          wrongFeedback ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {wrongFeedback && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-lg border-2 border-rose-200 bg-rose-50 px-3 py-1.5 text-center text-sm font-bold text-rose-700"
          >
            {t.feedback.correctAnswerIs.replace('{answer}', wrongFeedback)}
          </div>
        )}
      </div>

      {/* Silhouette positions */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-8 min-h-[3.5rem] sm:min-h-[4.5rem] flex-wrap justify-center">
        {Array.from({ length: problem.target.length }).map((_, i) => {
          const isPrefilled = isPreFilled(i);
          const letter = userWord[i];

          return (
            <button
              key={i}
              onPointerDown={(e) => {
                if (letter && !isPrefilled) {
                  e.preventDefault();
                  handleRemove(letter, i);
                }
              }}
              type="button"
              disabled={isPrefilled}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl border-b-3 sm:border-b-4 flex items-center justify-center text-2xl sm:text-3xl font-black transition-all ${
                isPrefilled
                  ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-500 text-green-700 cursor-not-allowed'
                  : letter
                    ? 'bg-orange-100 border-orange-400 text-orange-600 scale-100 cursor-pointer hover:bg-orange-200'
                    : 'bg-slate-100 border-slate-200 border-dashed scale-95'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {letter ? letter.char : ''}
            </button>
          );
        })}
      </div>

      {/* Letter pool */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
        {visiblePool.map((l) => (
          <button
            key={l.id}
            onPointerDown={(e) => {
              e.preventDefault();
              handleSelect(l);
            }}
            type="button"
            className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl border-b-[4px] sm:border-b-[6px] border-slate-200 text-2xl sm:text-3xl font-black text-slate-700 shadow-sm active:translate-y-2 active:border-b-0 hover:bg-orange-50 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            {l.char}
          </button>
        ))}
      </div>
      {paidHints.length > 0 && (
        <PaidHintButtons hints={paidHints} stars={stars ?? 0} onHintClick={handlePaidHint} />
      )}
    </div>
  );
};
