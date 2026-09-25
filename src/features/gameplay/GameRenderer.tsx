import React from 'react';
import { gameRegistry } from '../../games/registry';
import type { Problem, Direction } from '../../types/game';
import { useTranslation } from '../../i18n/useTranslation';
import type { AnswerOptions } from '../../hooks/useAnswerHandler';

// Import registrations to ensure games are registered
import '../../games/registrations';

interface GameRendererProps {
  gameType: string;
  problem: Problem;
  onAnswer: (
    isCorrect: boolean,
    shouldShowAchievement?: () => boolean,
    options?: AnswerOptions,
  ) => void;
  onMove?: (direction: Direction) => void;
  soundEnabled: boolean;
  level?: number;
  /** Passed to Shape Shift for star-based hints (outline / place one piece) */
  stars?: number;
  spendStars?: (count: number) => boolean;
  /** Passed to BattleLearn for strike-based heart deduction (e.g. 5 misses = 1 heart) */
  spendHeart?: () => void;
  /** Passed to BattleLearn to end game when hearts hit 0 after spending from 5 misses */
  endGame?: () => void;
}

export const GameRenderer: React.FC<GameRendererProps> = ({
  gameType,
  problem,
  onAnswer,
  onMove,
  soundEnabled,
  level,
  stars,
  spendStars,
  spendHeart,
  endGame,
}) => {
  const t = useTranslation();

  // Handle advanced versions by removing '_adv' suffix
  const baseGameType = gameType.replace('_adv', '');

  // Get game from registry
  const gameEntry = gameRegistry.get(baseGameType);

  if (!gameEntry) {
    return (
      <div className="text-center p-8 text-red-600">
        {t.errors.unknownGameType}: "{gameType}"
      </div>
    );
  }

  // Render the game component
  const Component = gameEntry.component;
  return (
    <Component
      problem={problem}
      onAnswer={onAnswer}
      onMove={onMove}
      soundEnabled={soundEnabled}
      level={level}
      gameType={gameType}
      stars={stars}
      spendStars={spendStars}
      spendHeart={spendHeart}
      endGame={endGame}
    />
  );
};
