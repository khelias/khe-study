/**
 * GameResultScreen Component
 *
 * Generic result screen for various game completion states:
 * - victory: Player won the game (e.g., BattleLearn all ships sunk)
 * - perfect: Player achieved perfect score (e.g., RoboPath optimal path)
 * - gameOver: Player ran out of hearts
 *
 * Supersedes the old dedicated game-over screen with a reusable result surface.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlarmClock, HeartCrack, Star, Trophy } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { usePlaySessionStore } from '../../stores/playSessionStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { useGameAudio } from '../../hooks/useGameAudio';
import { ShopModal } from '../modals/ShopModal';
import { isSnakeGameType } from '../../engine/mathSnake';
import { SnakeSessionSummary } from './SnakeSessionSummary';

export type GameResultType = 'victory' | 'perfect' | 'gameOver' | 'timeUp';

interface GameResultScreenProps {
  type: GameResultType;
  onContinue?: () => void; // For victory/perfect - continue to next problem
  onRetry?: () => void; // For perfect/timeUp - try again for better score
  customMessage?: string; // Optional custom message
  // Extra stat cards (e.g. fact-drill best streak + accuracy) rendered
  // between the score/high-score grid and the action buttons.
  extraStats?: React.ReactNode;
}

export const GameResultScreen: React.FC<GameResultScreenProps> = ({
  type,
  onContinue,
  onRetry,
  customMessage,
  extraStats,
}) => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { formatText } = useProfileText();
  const score = usePlaySessionStore((state) => state.score);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const gameType = usePlaySessionStore((state) => state.gameType);
  const returnToMenu = usePlaySessionStore((state) => state.returnToMenu);
  const rescueAttempt = usePlaySessionStore((state) => state.rescueAttempt);
  const highScoreEligible = usePlaySessionStore((state) => state.highScoreEligible);
  const snakeSessionStats = usePlaySessionStore((state) => state.snakeSessionStats);
  const getHighScore = useGameStore((state) => state.getHighScore);
  const hearts = useGameStore((state) => state.hearts);
  const { playClick } = useGameAudio(soundEnabled);
  const [showShop, setShowShop] = useState(false);

  const highScore = gameType ? getHighScore(gameType) : 0;
  const isNewRecord = highScoreEligible && gameType && score > 0 && score >= highScore;
  const showSnakeSessionSummary = type === 'gameOver' && gameType && isSnakeGameType(gameType);

  const headerTitle: string =
    gameType && t.games[gameType as keyof typeof t.games]
      ? t.games[gameType as keyof typeof t.games].title
      : formatText(t.game.gameOver);

  // Configuration based on result type
  const config = {
    victory: {
      icon: <Trophy size={40} className="text-star" aria-hidden />,
      title: formatText(t.battlelearn?.victory || 'Victory!'),
      message: customMessage || formatText(t.battlelearn?.allShipsSunk || 'Great job!'),
      primaryButton: formatText(t.game.continue || 'Continue'),
      primaryAction: onContinue,
      secondaryButton: formatText(t.game.returnToMenu),
      showScore: true,
    },
    perfect: {
      icon: <Star size={40} className="fill-star text-star" aria-hidden />,
      title: formatText(t.roboPath?.perfect ?? 'Perfect!'),
      message:
        customMessage ||
        formatText(t.roboPath?.perfectMessage ?? 'You found the optimal solution!'),
      primaryButton: formatText(t.roboPath?.continueButton || 'Next Level'),
      primaryAction: onContinue,
      secondaryButton: onRetry
        ? formatText(t.roboPath?.tryAgainButton || 'Try Again')
        : formatText(t.game.returnToMenu),
      secondaryAction: onRetry,
      showScore: true,
    },
    timeUp: {
      icon: <AlarmClock size={40} className="text-muted" aria-hidden />,
      title: formatText(t.game.timeUp || 'Time up!'),
      message: customMessage || '',
      primaryButton: formatText(t.game.retry || 'Try again'),
      primaryAction: onRetry,
      secondaryButton: formatText(t.game.returnToMenu),
      showScore: true,
    },
    gameOver: {
      icon: <HeartCrack size={40} className="text-heart" aria-hidden />,
      title: formatText(t.game.gameOver),
      message: customMessage || formatText(t.game.scoreMessage.replace('{score}', String(score))),
      primaryButton:
        hearts > 0
          ? formatText(t.game.rescueAttempt || 'Päästa katse')
          : formatText(t.shop?.getMoreHearts || 'Get More Hearts'),
      primaryAction:
        hearts > 0 && gameType
          ? () => {
              playClick();
              rescueAttempt();
            }
          : undefined, // No hearts: open shop modal instead
      secondaryButton: formatText(t.game.returnToMenu),
      showScore: true,
      showHeartWarning: hearts === 0,
    },
  };

  const currentConfig = config[type];

  type ActionFn = () => void;

  const handlePrimaryAction = () => {
    playClick();

    // Game over with no hearts: open shop as modal so user can buy and then retry same game
    if (type === 'gameOver' && hearts === 0) {
      setShowShop(true);
      return;
    }

    const action: ActionFn | undefined = currentConfig.primaryAction;
    if (action) action();
  };

  const handleSecondaryAction = () => {
    playClick();
    const secAction: ActionFn | undefined =
      'secondaryAction' in currentConfig ? currentConfig.secondaryAction : undefined;
    if (secAction) void secAction();
    else {
      void navigate('/', { replace: true });
      void returnToMenu();
    }
  };

  return (
    <div className="theme-shell fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-paper px-4 py-8 animate-in fade-in">
      {showShop && <ShopModal onClose={() => setShowShop(false)} openedFromNoHearts={true} />}
      <div className="my-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4">{currentConfig.icon}</div>
          {type !== 'gameOver' && headerTitle && <p className="fam-label mb-1">{headerTitle}</p>}
          <h2 className="fam-title">{currentConfig.title}</h2>
          {currentConfig.message && (
            <p className="mx-auto mt-2 max-w-xs text-[15px] text-ink-2">{currentConfig.message}</p>
          )}
        </div>

        {'showHeartWarning' in currentConfig && currentConfig.showHeartWarning && (
          <div className="mb-6 rounded-lg border border-heart/40 bg-heart/10 p-3">
            <p className="text-center text-sm font-medium text-ink">
              {formatText(t.game.noHeartsLeft || 'No hearts left! Visit the shop to get more.')}
            </p>
          </div>
        )}

        {showSnakeSessionSummary && <SnakeSessionSummary stats={snakeSessionStats} />}

        {currentConfig.showScore && (
          <div className="mb-8 grid grid-cols-2 border-y border-rule py-4">
            <div className="px-4 text-center">
              <div className="fam-label mb-1">{formatText(t.game.score)}</div>
              <div className="text-3xl font-semibold text-ink tabular-nums">{score}</div>
            </div>
            <div className="border-l border-rule px-4 text-center">
              <div className="fam-label mb-1">{formatText(t.game.highScore || 'High Score')}</div>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl font-semibold text-ink tabular-nums">
                  {highScore > 0 ? highScore : '-'}
                </span>
                {isNewRecord && (
                  <span className="text-sm font-semibold text-star">
                    {formatText(t.game.newRecord || 'New!')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {extraStats && <div className="mb-8">{extraStats}</div>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="fam-btn fam-btn-primary flex-1"
          >
            {currentConfig.primaryButton}
          </button>
          <button type="button" onClick={handleSecondaryAction} className="fam-btn flex-1">
            {currentConfig.secondaryButton}
          </button>
        </div>
      </div>
    </div>
  );
};
