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
  onAnswer: (isCorrect: boolean, options?: AnswerOptions) => void;
  onMove?: (direction: Direction) => void;
  soundEnabled: boolean;
  level?: number;
  /** Passed to Shape Shift for star-based hints (outline / place one piece) */
  stars?: number;
  spendStars?: (count: number) => boolean;
  /** A game's own failure that costs a round life (BattleLearn's five misses). */
  onFailure?: () => void;
  /** A timed round's clock stopped (the fact drill). */
  onTimeUp?: () => void;
  paused?: boolean;
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
  onFailure,
  onTimeUp,
  paused,
}) => {
  const t = useTranslation();

  // Get game from registry
  const gameEntry = gameRegistry.get(gameType);

  if (!gameEntry) {
    return (
      <div className="text-center p-8 text-bad">
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
      onFailure={onFailure}
      onTimeUp={onTimeUp}
      paused={paused}
    />
  );
};
