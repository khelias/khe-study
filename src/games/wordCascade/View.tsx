/**
 * WordCascadeView – One cascade per letter
 *
 * One downward cascade (column) per letter. Constant stream of letters; tap the
 * correct one to lock it. Stream starts pre-filled (no blank), loops seamlessly.
 * Level scales speed and difficulty.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useWrongStrikes } from '../../hooks/useWrongStrikes';
import { GAME_CONFIG } from '../data';
import { ALPHABET } from '../../curriculum/packs/language/vocabulary';
import { PaidHintButtons } from '../../components/shared';
import type { WordCascadeProblem } from '../../types/game';

// -----------------------------------------------------------------------------
// Constants (scalable by level where noted)
// -----------------------------------------------------------------------------
const CASCADE_VIEW_HEIGHT_PX = 220;
const LETTER_TILE_PX = 44;
const LETTERS_PER_CYCLE = 16;
const CYCLE_COPIES = 3;
const CYCLE_PX = LETTERS_PER_CYCLE * LETTER_TILE_PX;

const FALL_DURATION_BASE_S = 5;
const FALL_DURATION_MIN_S = 3.5;
const FALL_DURATION_VARIANCE = 0.6;
const TARGET_LETTER_PROB_BASE = 0.4;
const TARGET_LETTER_PROB_MIN = 0.25;

const WRONG_FEEDBACK_MS = 500;
const GAME_OVER_DELAY_MS = 900;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface WordCascadeViewProps {
  problem: WordCascadeProblem;
  onAnswer: (isCorrect: boolean) => void;
  soundEnabled: boolean;
  level?: number;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

// -----------------------------------------------------------------------------
// Distractor helpers (Estonian-aware)
// -----------------------------------------------------------------------------
const SIMILAR_LETTERS: Record<string, string[]> = {
  A: ['Ä', 'E', 'O'],
  Ä: ['A', 'E', 'Ö'],
  E: ['A', 'Ä', 'I'],
  I: ['E', 'L', 'J'],
  O: ['Ö', 'A', 'Q'],
  Ö: ['O', 'Ü', 'Õ'],
  U: ['Ü', 'V', 'Y'],
  Ü: ['U', 'Ö', 'Y'],
  Õ: ['O', 'Ö', 'A'],
  K: ['G', 'H', 'R'],
  G: ['K', 'Q', 'C'],
  P: ['B', 'R', 'D'],
  B: ['P', 'D', 'R'],
  T: ['D', 'L', 'F'],
  D: ['T', 'B', 'P'],
  S: ['Z', 'Š', 'C'],
  Š: ['S', 'Z', 'Ž'],
  Z: ['S', 'Ž', 'Š'],
  Ž: ['Z', 'Š', 'S'],
  L: ['I', 'T', 'J'],
  R: ['K', 'P', 'N'],
  M: ['N', 'W', 'H'],
  N: ['M', 'R', 'H'],
};

function getDistractorLetter(targetWord: string, neededLetter: string | null): string {
  const targetChars = targetWord.split('');
  const hasUpper = targetChars.some((c) => c !== c.toLowerCase());
  const hasLower = targetChars.some((c) => c !== c.toUpperCase());
  const isTitleCase =
    targetChars.length > 0 &&
    targetChars[0]! === targetChars[0]!.toUpperCase() &&
    targetChars.slice(1).every((c) => c === c.toLowerCase());
  const caseStyle: 'upper' | 'lower' | 'title' | 'mixed' = !hasLower
    ? 'upper'
    : !hasUpper
      ? 'lower'
      : isTitleCase
        ? 'title'
        : 'mixed';
  const targetCharsUpper = targetWord.toUpperCase().split('');
  const availableLetters = ALPHABET.filter((letter) => !targetCharsUpper.includes(letter));
  if (availableLetters.length === 0) {
    const fallback = ALPHABET[Math.floor(Math.random() * ALPHABET.length)] ?? 'A';
    return caseStyle === 'upper' ? fallback : fallback.toLowerCase();
  }
  const referenceLetter =
    neededLetter?.toUpperCase() ??
    targetCharsUpper[Math.floor(Math.random() * targetCharsUpper.length)] ??
    'A';
  const similar = SIMILAR_LETTERS[referenceLetter];
  const distractor = similar?.length
    ? (() => {
        const valid = similar.filter((l) => availableLetters.includes(l));
        return valid.length > 0
          ? (valid[Math.floor(Math.random() * valid.length)] ?? availableLetters[0] ?? 'A')
          : (availableLetters[Math.floor(Math.random() * availableLetters.length)] ?? 'A');
      })()
    : (availableLetters[Math.floor(Math.random() * availableLetters.length)] ?? 'A');
  if (caseStyle === 'upper') return distractor;
  if (caseStyle === 'lower' || caseStyle === 'title') return distractor.toLowerCase();
  return Math.random() > 0.5 ? distractor : distractor.toLowerCase();
}

/** Target-letter probability in stream; decreases with level (harder). */
function targetProbForLevel(level: number): number {
  const t = Math.min(level, 15) / 15;
  return TARGET_LETTER_PROB_BASE - (TARGET_LETTER_PROB_BASE - TARGET_LETTER_PROB_MIN) * t;
}

/** Fall duration in seconds; decreases with level (faster) and varies by column. */
function fallDurationForColumn(colIndex: number, level: number): number {
  const levelFactor = Math.max(0, 1 - (level - 1) * 0.04);
  const base = FALL_DURATION_MIN_S + (FALL_DURATION_BASE_S - FALL_DURATION_MIN_S) * levelFactor;
  const variance = (colIndex % 5) * FALL_DURATION_VARIANCE * 0.5 + (colIndex % 2) * 0.2;
  return Math.max(FALL_DURATION_MIN_S, base + variance);
}

function buildStreamLetters(target: string, colIndex: number, level: number): string[] {
  const need = target[colIndex];
  if (!need) return [];
  const prob = targetProbForLevel(level);
  return Array.from({ length: LETTERS_PER_CYCLE }, () =>
    Math.random() < prob ? need : getDistractorLetter(target, need),
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export const WordCascadeView: React.FC<WordCascadeViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  level = 1,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const baseType = gameType?.replace('_adv', '') ?? 'word_cascade';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  const target = problem.target;
  const isLongWord = target.length >= 9;
  const isVeryLongWord = target.length >= 10;

  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const {
    strikes,
    addStrike,
    resetStrikes,
    isAtMax: strikesAtMax,
    triesLeft,
  } = useWrongStrikes({
    maxStrikes: 3,
    resetDeps: `${problem.uid}-${problem.target}`,
  });
  const [revealedNextLetter, setRevealedNextLetter] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const nextIdx = progress.length;
  const need = target[nextIdx] ?? null;

  const streamPerColumn = useMemo(
    () => target.split('').map((_, i) => buildStreamLetters(target, i, level)),
    [target, level],
  );

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problem.uid);
  if (lastSyncedUid !== problem.uid) {
    setLastSyncedUid(problem.uid);
    setProgress('');
    setStatus('idle');
    resetStrikes();
    setRevealedNextLetter(false);
    setGameEnded(false);
  }

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (hintId !== 'reveal_next' || !spendStars) return;
      if (nextIdx >= target.length) return;
      if (revealedNextLetter) return;
      if (!spendStars(1)) return;
      setRevealedNextLetter(true);
    },
    [spendStars, nextIdx, target.length, revealedNextLetter],
  );

  const handleLetterTap = useCallback(
    (colIndex: number, char: string) => {
      if (gameEnded || status === 'correct') return;
      if (colIndex !== nextIdx || !need) return;
      if (char.toLowerCase() !== need.toLowerCase()) {
        const willBeAtMax = strikes + 1 >= 3;
        addStrike();
        setStatus('wrong');
        playSound('wrong', soundEnabled);
        if (willBeAtMax) {
          setGameEnded(true);
          window.setTimeout(() => onAnswer(false), GAME_OVER_DELAY_MS);
        } else {
          window.setTimeout(() => setStatus('idle'), WRONG_FEEDBACK_MS);
        }
        return;
      }
      resetStrikes();
      playSound('correct', soundEnabled);
      setRevealedNextLetter(false);
      const nextProgress = progress + char;
      setProgress(nextProgress);
      if (nextProgress.toLowerCase() === target.toLowerCase()) {
        setStatus('correct');
        setGameEnded(true);
        window.setTimeout(() => onAnswer(true), 400);
      }
    },
    [
      need,
      progress,
      target,
      status,
      gameEnded,
      soundEnabled,
      onAnswer,
      nextIdx,
      strikes,
      addStrike,
      resetStrikes,
    ],
  );

  const gameTitle = (t.games[baseType as keyof typeof t.games]?.title ??
    t.games['word_cascade' as keyof typeof t.games]?.title ??
    'Word Cascade') as string;
  const stripHeightPx = LETTERS_PER_CYCLE * LETTER_TILE_PX * CYCLE_COPIES;
  const cascadeGapClass = isLongWord ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-2';
  const cascadePaddingClass = isLongWord ? 'p-1.5 sm:p-2' : 'p-2 sm:p-3';
  const columnMaxWidth = isVeryLongWord ? 54 : isLongWord ? 60 : 72;
  const lockedLetterClass = isVeryLongWord
    ? 'text-3xl sm:text-4xl'
    : isLongWord
      ? 'text-4xl sm:text-5xl'
      : 'text-5xl sm:text-6xl';
  const streamLetterClass = isVeryLongWord ? 'text-base sm:text-lg' : 'text-xl';

  const feedbackMessage =
    status === 'wrong'
      ? strikesAtMax
        ? t.gameScreen.wordCascade.outOfTries
        : ((t.gameScreen.wordCascade.triesLeft as string)?.replace('{count}', String(triesLeft)) ??
          `${triesLeft} tries left`)
      : null;

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div
        data-testid="word-cascade-emoji"
        className="text-6xl sm:text-8xl mb-2 sm:mb-3 filter drop-shadow-xl"
        aria-hidden="true"
      >
        {problem.emoji}
      </div>

      {!gameEnded && (
        <div className="flex items-center gap-1 mb-2" aria-label={`${triesLeft} tries left`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={[
                'w-3 h-3 rounded-full border border-red-200 transition-colors',
                i < strikes ? 'bg-red-500' : 'bg-white',
              ].join(' ')}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      <div
        className={`w-full flex justify-center ${cascadeGapClass} rounded-3xl border-2 border-slate-200 bg-slate-50/50 ${cascadePaddingClass} shadow-lg`}
        aria-label={gameTitle}
      >
        {target.split('').map((_, colIndex) => {
          const isActive = colIndex === nextIdx;
          const isDone = colIndex < nextIdx;
          const lockedLetter = progress[colIndex];
          const letters = streamPerColumn[colIndex] ?? [];
          const fallDuration = fallDurationForColumn(colIndex, level);

          return (
            <div
              key={colIndex}
              className={[
                'wc-col flex-1 min-w-0 flex flex-col items-center rounded-xl border-2 transition-all overflow-hidden',
                isActive
                  ? status === 'wrong'
                    ? 'border-red-400 bg-red-50 shadow-md wc-col-wrong'
                    : 'border-purple-400 bg-white shadow-md'
                  : isDone
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-slate-200 bg-slate-100/80 opacity-60',
              ].join(' ')}
              style={{ maxWidth: columnMaxWidth }}
            >
              {isDone ? (
                <div
                  key={`locked-${colIndex}-${lockedLetter}`}
                  className={`w-full flex-1 flex items-center justify-center min-h-[200px] bg-pink-100 text-pink-800 font-black ${lockedLetterClass} rounded-b-xl`}
                  aria-hidden="true"
                >
                  {lockedLetter}
                </div>
              ) : (
                <div
                  key={`stream-${colIndex}`}
                  className="wc-cascade-shaft relative w-full overflow-hidden"
                  style={{ height: CASCADE_VIEW_HEIGHT_PX }}
                >
                  <div
                    className="wc-cascade-strip flex flex-col absolute left-0 right-0"
                    style={{
                      height: stripHeightPx,
                      animation: `wc-fall ${fallDuration}s linear infinite`,
                      animationDelay: `-${fallDuration * 0.3}s`,
                    }}
                  >
                    {Array.from({ length: CYCLE_COPIES }, () => letters)
                      .flat()
                      .map((letter, i) => {
                        const isTarget = need && letter.toLowerCase() === need.toLowerCase();
                        const highlight = revealedNextLetter && isActive && isTarget;
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={!isActive || status === 'correct'}
                            onClick={() => handleLetterTap(colIndex, letter)}
                            className={[
                              `wc-stream-letter w-full min-w-0 shrink-0 flex items-center justify-center rounded-lg border-2 ${streamLetterClass} font-black touch-manipulation`,
                              highlight
                                ? 'bg-amber-200 border-amber-500 text-amber-900 ring-2 ring-amber-400 z-10'
                                : 'bg-white/95 border-purple-200 text-purple-800 shadow-sm',
                            ].join(' ')}
                            style={{ height: LETTER_TILE_PX, minHeight: LETTER_TILE_PX }}
                            aria-label={
                              highlight ? `Letter ${letter} — tap this one` : `Letter ${letter}`
                            }
                          >
                            {letter}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .wc-cascade-shaft {
          contain: layout style paint;
        }
        @keyframes wc-fall {
          0% { transform: translateY(-${CYCLE_PX}px); }
          100% { transform: translateY(0); }
        }
        .wc-cascade-strip {
          will-change: transform;
          top: 0;
        }
        @keyframes wc-wrong-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .wc-col-wrong {
          animation: wc-wrong-shake 0.25s ease-in-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .wc-cascade-strip {
            animation: none !important;
            transform: translateY(0);
          }
          .wc-col-wrong {
            animation: none;
          }
        }
      `}</style>

      <div
        className="mt-3 min-h-[2rem] flex items-center justify-center text-sm font-bold text-slate-600"
        role="status"
        aria-live="polite"
      >
        {feedbackMessage && (
          <span className="text-red-600 animate-in fade-in duration-150">{feedbackMessage}</span>
        )}
      </div>

      {paidHints.length > 0 && (
        <PaidHintButtons
          hints={paidHints}
          stars={stars}
          onHintClick={handlePaidHint}
          disabled={gameEnded || status === 'correct'}
        />
      )}
    </div>
  );
};
