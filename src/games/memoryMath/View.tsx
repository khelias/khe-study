/**
 * MemoryGameView Component
 *
 * Game view for memory math matching games.
 */

import React, { useCallback, useState } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';
import type { MemoryMathProblem } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;
type CardState = {
  id: string;
  content: string;
  matched?: boolean;
  flipped?: boolean;
  solved?: boolean;
  matchId?: string;
  type?: string;
};

interface MemoryGameViewProps {
  problem: MemoryMathProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

export const MemoryGameView: React.FC<MemoryGameViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const baseType = gameType?.replace('_adv', '') ?? 'memory_math';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  const [cards, setCards] = useState<CardState[]>(problem.cards || []);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const problemUid: string = problem.uid;

  // Reset state when problem changes (render-time prop comparison).
  const [lastSyncedUid, setLastSyncedUid] = useState<string>(problemUid);
  if (lastSyncedUid !== problemUid) {
    setLastSyncedUid(problemUid);
    setCards(problem.cards);
    setFlipped([]);
    setMatchedPairs(0);
    setShowCelebration(false);
  }

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (hintId !== 'reveal_pair' || !spendStars) return;
      const solvedMatchIds = new Set(
        cards.map((c, i) => (cards[i]?.solved && c.matchId ? c.matchId : null)).filter(Boolean),
      );
      const unsolvedMatchIds = [...new Set(cards.map((c) => c.matchId).filter(Boolean))].filter(
        (mid) => mid && !solvedMatchIds.has(mid),
      );
      if (unsolvedMatchIds.length === 0) return;
      if (!spendStars(1)) return;
      const pickMatchId = unsolvedMatchIds[
        Math.floor(Math.random() * unsolvedMatchIds.length)
      ] as string;
      const indices = cards
        .map((c, i) => (c.matchId === pickMatchId ? i : -1))
        .filter((i) => i >= 0);
      if (indices.length !== 2) return;
      playSound('click', soundEnabled);
      setCards((prev) => {
        const next = prev.slice();
        if (next[indices[0]!]) next[indices[0]!] = { ...next[indices[0]!]!, flipped: true };
        if (next[indices[1]!]) next[indices[1]!] = { ...next[indices[1]!]!, flipped: true };
        return next;
      });
      setTimeout(() => {
        setCards((prev) => {
          const next = prev.slice();
          if (next[indices[0]!]) next[indices[0]!] = { ...next[indices[0]!]!, flipped: false };
          if (next[indices[1]!]) next[indices[1]!] = { ...next[indices[1]!]!, flipped: false };
          return next;
        });
      }, 2500);
    },
    [cards, spendStars, soundEnabled],
  );

  const handleCard = (index: number): void => {
    if (flipped.length >= 2 || cards[index]?.flipped || cards[index]?.solved) return;
    playSound('click', soundEnabled);

    const newCards = [...cards];
    if (newCards[index]) {
      newCards[index] = { ...newCards[index], flipped: true };
    }
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const i1 = newFlipped[0];
      const i2 = newFlipped[1];
      if (i1 !== undefined && i2 !== undefined) {
        const card1 = newCards[i1];
        const card2 = newCards[i2];
        if (card1 && card2 && card1.matchId === card2.matchId) {
          playSound('correct', soundEnabled);
          setMatchedPairs((prev) => prev + 1);
          setTimeout(() => {
            const solvedCards = [...newCards];
            if (solvedCards[i1] && solvedCards[i2]) {
              solvedCards[i1] = { ...solvedCards[i1], solved: true };
              solvedCards[i2] = { ...solvedCards[i2], solved: true };
            }
            setCards(solvedCards);
            setFlipped([]);

            // Check if all pairs are found
            const allSolved = solvedCards.every((c) => c.solved);
            if (allSolved) {
              setShowCelebration(true);
              setTimeout(() => {
                onAnswer(true);
                setShowCelebration(false);
              }, 1500);
            }
          }, 600);
        } else {
          setTimeout(() => {
            const resetCards = [...newCards];
            if (resetCards[i1] && resetCards[i2]) {
              resetCards[i1] = { ...resetCards[i1], flipped: false };
              resetCards[i2] = { ...resetCards[i2], flipped: false };
            }
            setCards(resetCards);
            setFlipped([]);
          }, 1200);
        }
      }
    }
  };

  const totalPairs = cards.length / 2;
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      {/* Cards - blue/pink theme to match rest of app */}
      <div className="w-full max-w-md mx-auto">
        <div className="w-full grid grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 aspect-square relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-pink-50 border-2 border-blue-200/80 shadow-lg">
          {showCelebration && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none rounded-2xl">
              <div className="text-5xl sm:text-8xl animate-bounce drop-shadow-lg">🎉</div>
            </div>
          )}

          {cards.map((card, i) => {
            const isFlipped = card.flipped || card.solved;
            const isMath = card.type === 'math';

            return (
              <button
                key={card.id}
                onClick={() => handleCard(i)}
                disabled={card.solved}
                className={`
                  relative rounded-xl sm:rounded-2xl flex items-center justify-center
                  text-sm sm:text-lg md:text-xl font-black transition-all duration-200
                  border-2 shadow-md
                  ${
                    card.solved
                      ? 'opacity-35 scale-[0.96] pointer-events-none bg-slate-100/80 border-slate-200'
                      : isFlipped
                        ? 'bg-white border-blue-400 text-slate-800 shadow-lg hover:shadow-lg'
                        : 'bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-600/80 text-transparent hover:from-blue-500 hover:to-indigo-600 hover:scale-[1.02] hover:border-indigo-600 active:scale-[0.98]'
                  }
                `}
              >
                {!isFlipped && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl sm:rounded-2xl">
                    <span className="text-3xl sm:text-4xl opacity-95 drop-shadow-sm">🧠</span>
                  </div>
                )}

                <div
                  className={`${isFlipped ? 'block' : 'invisible'} transition-opacity duration-200`}
                >
                  <span
                    className={`
                    inline-block px-2 py-1 rounded-lg text-center font-bold
                    ${isMath ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200' : 'bg-pink-100 text-pink-800 ring-1 ring-pink-200'}
                  `}
                  >
                    {card.content}
                  </span>
                  <span className="absolute top-1 right-1 text-xs opacity-60" aria-hidden>
                    {isMath ? '➕' : '✓'}
                  </span>
                </div>

                {card.solved && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl sm:text-3xl animate-pulse opacity-80">✨</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Pairs and progress - under the cards */}
        {totalPairs > 0 && (
          <div className="w-full mt-4 sm:mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm sm:text-base font-bold text-blue-700">
                {formatText(t.gameScreen.memoryMath.pairsLabel)}: {matchedPairs}/{totalPairs}
              </span>
              <span className="text-sm sm:text-base font-bold text-pink-600 tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-3 sm:h-4 bg-blue-200/70 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-pink-500 transition-all duration-500 ease-out rounded-full min-w-[0.5rem]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {paidHints.length > 0 && (
        <div className="mt-4 w-full max-w-md flex justify-center">
          <PaidHintButtons
            hints={paidHints}
            stars={stars}
            onHintClick={handlePaidHint}
            disabled={showCelebration}
          />
        </div>
      )}
    </div>
  );
};
