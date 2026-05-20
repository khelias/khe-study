/**
 * PicturePairsView Component
 *
 * Classic memory game: match emoji–word pairs from the vocabulary curriculum pack.
 * Designed for progress, juice, and addictiveness (moves counter, celebration).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { playSound } from '../../engine/audio';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../data';
import { PaidHintButtons } from '../../components/shared';
import type { PicturePairsProblem, PicturePairsCard } from '../../types/game';

type AnswerHandler = (answer: boolean) => void;

interface PicturePairsViewProps {
  problem: PicturePairsProblem;
  onAnswer: AnswerHandler;
  soundEnabled: boolean;
  gameType?: string;
  stars?: number;
  spendStars?: (count: number) => boolean;
}

type CardState = PicturePairsCard & { flipped?: boolean; solved?: boolean };

/** Emoji face: separate component so iOS always gets a fresh mount when card flips (avoids blank after peek). */
const EmojiFace: React.FC<{ content: string }> = ({ content }) => (
  <span
    className="emoji-font text-2xl sm:text-4xl md:text-5xl leading-none shrink-0 min-w-[1.5rem] min-h-[1.5rem] inline-block"
    style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, sans-serif' }}
    role="img"
    aria-label={content}
  >
    {content}
  </span>
);

/** Single card: key includes flipped so iOS remounts and repaints emoji when flipping after peek. */
const MemoCard: React.FC<{
  card: CardState;
  index: number;
  isPeeking: boolean;
  isFlipped: boolean;
  onFlip: (index: number) => void;
  disabled: boolean;
}> = React.memo(({ card, index, isPeeking: _isPeeking, isFlipped, onFlip, disabled }) => {
  const isEmoji = card.cardType === 'emoji';
  return (
    <button
      type="button"
      data-testid={`picture-pairs-card-${index}`}
      onClick={() => onFlip(index)}
      disabled={disabled}
      className={`
        relative w-full h-full min-w-0 min-h-0 rounded-xl sm:rounded-2xl flex items-center justify-center
        text-sm sm:text-base font-bold transition-all duration-200
        border-2 shadow-md overflow-hidden
        ${
          card.solved
            ? 'opacity-40 scale-[0.96] pointer-events-none bg-slate-100/80 border-slate-200'
            : isFlipped
              ? 'bg-white border-pink-400 text-slate-800 shadow-lg'
              : 'bg-gradient-to-br from-pink-400 to-amber-500 border-pink-600/80 text-transparent hover:from-pink-500 hover:to-amber-600 hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
    >
      {!isFlipped && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl sm:rounded-2xl">
          <span className="text-2xl sm:text-3xl opacity-90 drop-shadow-sm" aria-hidden>
            🖼️
          </span>
        </div>
      )}

      {isFlipped && (
        <div className="flex items-center justify-center min-w-0 max-w-full max-h-full px-1">
          {isEmoji ? (
            <EmojiFace content={card.content} />
          ) : (
            <span className="font-bold text-pink-900 break-all leading-tight text-center line-clamp-3">
              {card.content}
            </span>
          )}
        </div>
      )}

      {card.solved && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xl sm:text-2xl animate-pulse opacity-80">✨</span>
        </div>
      )}
    </button>
  );
});

MemoCard.displayName = 'MemoCard';

export const PicturePairsView: React.FC<PicturePairsViewProps> = ({
  problem,
  onAnswer,
  soundEnabled,
  gameType,
  stars = 0,
  spendStars,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const baseType = gameType?.replace('_adv', '') ?? 'picture_pairs';
  const paidHints = GAME_CONFIG[baseType]?.paidHints ?? [];
  const [cards, setCards] = useState<CardState[]>(() =>
    problem.cards.map((c) => ({ ...c, flipped: false, solved: false })),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPeeking, setIsPeeking] = useState(true);
  const problemUid = problem.uid;

  useEffect(() => {
    let peekTimerId: ReturnType<typeof setTimeout>;
    const id = setTimeout(() => {
      setCards(problem.cards.map((c) => ({ ...c, flipped: false, solved: false })));
      setFlipped([]);
      setMatchedPairs(0);
      setMoves(0);
      setShowCelebration(false);
      setIsPeeking(true);
      peekTimerId = setTimeout(() => setIsPeeking(false), 1200);
    }, 0);
    return () => {
      clearTimeout(id);
      clearTimeout(peekTimerId!);
    };
  }, [problemUid, problem.cards]);

  const handlePaidHint = useCallback(
    (hintId: string) => {
      if (hintId !== 'reveal_pair' || !spendStars) return;
      const solvedMatchIds = new Set(
        cards.filter((c) => c.solved && c.matchId).map((c) => c.matchId),
      );
      const unsolvedMatchIds = [...new Set(cards.map((c) => c.matchId))].filter(
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
    if (isPeeking || flipped.length >= 2 || cards[index]?.flipped || cards[index]?.solved) return;
    playSound('click', soundEnabled);
    setMoves((prev) => prev + 1);

    const newCards = [...cards];
    const at = newCards[index];
    if (at) {
      newCards[index] = { ...at, flipped: true };
    }
    setCards(newCards);
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const i1 = newFlipped[0];
      const i2 = newFlipped[1];
      if (i1 === undefined || i2 === undefined) return;
      const card1 = newCards[i1];
      const card2 = newCards[i2];
      if (card1 && card2 && card1.matchId === card2.matchId) {
        playSound('correct', soundEnabled);
        setMatchedPairs((prev) => prev + 1);
        setTimeout(() => {
          const solvedCards = newCards.map((c, i) =>
            i === i1 || i === i2 ? { ...c, solved: true } : c,
          );
          setCards(solvedCards);
          setFlipped([]);

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
          const resetCards = newCards.map((c, i) =>
            i === i1 || i === i2 ? { ...c, flipped: false } : c,
          );
          setCards(resetCards);
          setFlipped([]);
        }, 1200);
      }
    }
  };

  const totalPairs = cards.length / 2;
  const progress = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;
  const cols = totalPairs <= 4 ? 2 : totalPairs <= 6 ? 3 : 4;
  const rows = Math.ceil(cards.length / cols);

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 max-w-2xl mx-auto pt-4 sm:pt-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <div
          className="w-full grid gap-2.5 sm:gap-3 relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-gradient-to-br from-pink-50 via-white to-amber-50 border-2 border-pink-200/80 shadow-lg"
          style={{
            aspectRatio: `${cols} / ${rows}`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {isPeeking && (
            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none rounded-2xl bg-pink-100/80">
              <span className="text-lg sm:text-xl font-bold text-pink-800 animate-pulse">
                {formatText(t.gameScreen.picturePairs.peekLabel)}
              </span>
            </div>
          )}
          {showCelebration && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none rounded-2xl">
              <div className="text-5xl sm:text-8xl animate-bounce drop-shadow-lg">🎉</div>
            </div>
          )}

          {cards.map((card, i) => {
            const isFlipped = Boolean(isPeeking || card.flipped || card.solved);
            return (
              <MemoCard
                key={`${card.id}-${i}-${card.flipped ?? false}-${card.solved ?? false}`}
                card={card}
                index={i}
                isPeeking={isPeeking}
                isFlipped={isFlipped}
                onFlip={handleCard}
                disabled={card.solved || isPeeking}
              />
            );
          })}
        </div>

        {totalPairs > 0 && (
          <div className="w-full mt-4 sm:mt-5">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="text-sm sm:text-base font-bold text-pink-700">
                {formatText(t.gameScreen.picturePairs.pairsLabel)}: {matchedPairs}/{totalPairs}
              </span>
              <span className="text-sm font-medium text-amber-700 tabular-nums">
                {formatText(t.gameScreen.picturePairs.movesLabel)}: {moves}
              </span>
              <span className="text-sm sm:text-base font-bold text-amber-600 tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-3 sm:h-4 bg-pink-200/70 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-amber-500 transition-all duration-500 ease-out rounded-full min-w-[0.5rem]"
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
            disabled={showCelebration || isPeeking}
          />
        </div>
      )}
    </div>
  );
};
