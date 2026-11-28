/**
 * GameHeader Component
 *
 * Practical in-game HUD.
 *
 * Most games solve this with stable zones: navigation/context on the left,
 * the current objective in the middle, and run resources on the right.
 * On a phone it is one thin bar; level and score are then in the menu.
 */

import React, { useState } from 'react';
import { Heart, Home, Menu, TrendingUp, Trophy, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { GameIcon } from './gameIcons';
import { useProfileText } from '../hooks/useProfileText';
import { GAME_CONFIG, gameHasLevels } from '../games/data';
import { isTimedRound, ROUND_LIVES, roundHasLives, type RoundState } from '../engine/round';
import { ResourceBadge } from './shared/ResourceBadge';
import type { GameHeaderObjective } from '../types/game';
import { useCompactPlay } from '../hooks/useCompactPlay';

interface GameHeaderProps {
  score: number; // Current game session score
  stars: number; // Persistent currency
  /** The round being played: its goal strip and its lives. */
  round: RoundState | null;
  onReturnToMenu: () => void;
  onSettingsClick: () => void;
  currentLevel: number;
  gameType: string;
  onLevelClick: () => void;
  sessionObjective?: GameHeaderObjective | null;
  showSettingsMenu: boolean;
  settingsMenuRef: React.RefObject<HTMLDivElement>;
  onShopClick?: () => void; // Optional shop handler
  children?: React.ReactNode; // For settings menu dropdown
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  stars,
  round,
  onReturnToMenu,
  onSettingsClick,
  currentLevel,
  gameType,
  onLevelClick,
  sessionObjective,
  showSettingsMenu,
  settingsMenuRef,
  onShopClick,
  children,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const compact = useCompactPlay();

  const gameConfig = GAME_CONFIG[gameType];
  const hasLevels = gameHasLevels(gameType);
  const gameTitleStr: string =
    gameConfig && t.games[gameType as keyof typeof t.games]
      ? t.games[gameType as keyof typeof t.games].title
      : gameType.toUpperCase();
  const gameName = formatText(gameTitleStr);
  const objective =
    sessionObjective ??
    (round && !isTimedRound(round.spec)
      ? {
          label: formatText(t.gameScreen.roundLabel),
          value: `${round.progress}/${round.spec.size}`,
          percent: (round.progress / round.spec.size) * 100,
        }
      : null);
  const lives = round && roundHasLives(round.spec) ? round.lives : null;
  // The heart that just emptied pulses once (board 3A frame 3); a gained life does not.
  const [livesSeen, setLivesSeen] = useState(lives);
  const [lostHeart, setLostHeart] = useState<number | null>(null);
  if (livesSeen !== lives) {
    setLivesSeen(lives);
    setLostHeart(lives !== null && livesSeen !== null && lives < livesSeen ? lives : null);
  }
  const objectivePercent = Math.max(0, Math.min(100, objective?.percent ?? 0));
  const objectiveClassName = 'flex min-h-[44px] w-full min-w-0 items-center gap-3 rounded-lg px-2';
  const objectiveBar = (minWidth: string) => (
    <span className={`h-1.5 ${minWidth} flex-1 overflow-hidden rounded-full bg-sunken`}>
      <span
        className="block h-full rounded-full bg-ink transition-all duration-500 ease-out"
        style={{ width: `${objectivePercent}%` }}
      />
    </span>
  );
  const objectiveContent = objective && (
    <>
      <span className="fam-label max-w-24 shrink-0 truncate sm:max-w-none">{objective.label}</span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
        {objective.value}
      </span>
      {objectiveBar('min-w-20')}
    </>
  );

  const home = (
    <button
      onClick={onReturnToMenu}
      aria-label={t.gameScreen.returnToMenu}
      className="fam-icon-btn shrink-0"
    >
      <Home size={18} aria-hidden />
    </button>
  );
  const menu = (
    <div className="relative shrink-0" ref={settingsMenuRef}>
      <button
        onClick={onSettingsClick}
        aria-label={formatText(t.menu.settings)}
        title={formatText(t.menu.settings)}
        aria-expanded={showSettingsMenu}
        className="fam-icon-btn"
      >
        {showSettingsMenu ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
      </button>
      {showSettingsMenu && children}
    </div>
  );
  const hearts = lives !== null && (
    <div
      data-testid="round-lives"
      role="img"
      aria-label={formatText(t.gameScreen.roundLives).replace('{count}', String(lives))}
      className="flex shrink-0 items-center gap-0.5 px-1"
    >
      {Array.from({ length: ROUND_LIVES }, (_, i) => {
        const justLost = lostHeart === i;
        return (
          <Heart
            key={justLost ? `${i}-lost` : i}
            onAnimationEnd={justLost ? () => setLostHeart(null) : undefined}
            size={16}
            aria-hidden
            className={`${i < lives ? 'fill-heart text-heart' : 'text-rule-strong'}${justLost ? ' heart-lost' : ''}${lives === 1 && i === 0 ? ' lives-last' : ''}`}
          />
        );
      })}
    </div>
  );

  if (compact) {
    return (
      <div
        data-testid="game-bar"
        className="w-full border-b border-rule bg-paper pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]"
      >
        <div className="flex h-14 items-center gap-1 px-2">
          {home}
          <div className="min-w-0 flex-1 px-1">
            {objective && (
              <div
                data-testid="round-goal"
                role="img"
                className="flex min-h-[44px] w-full min-w-0 items-center gap-2"
                aria-label={objective.ariaLabel ?? objective.label}
              >
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                  {objective.value}
                </span>
                {objectiveBar('min-w-8')}
              </div>
            )}
          </div>
          {hearts}
          <ResourceBadge value={stars} compact={true} onClick={onShopClick} />
          {menu}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-b border-rule bg-paper">
      <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          {home}
          <div className="flex min-w-0 items-center justify-center gap-2 text-ink">
            <GameIcon
              name={gameConfig?.icon}
              size={18}
              className="shrink-0 text-muted"
              aria-hidden
            />
            <span className="block min-w-0 truncate text-base font-semibold leading-tight sm:text-lg">
              {gameName}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-self-end">{menu}</div>
        </div>

        {objective && (
          <div className="mt-1 min-w-0">
            <div
              data-testid="round-goal"
              className={objectiveClassName}
              aria-label={objective.ariaLabel ?? objective.label}
            >
              {objectiveContent}
            </div>
          </div>
        )}

        <div className="mt-1 flex items-center gap-1">
          {hasLevels && (
            <button
              type="button"
              onClick={onLevelClick}
              className="fam-btn-quiet shrink-0 text-sm font-semibold tabular-nums text-ink"
              aria-label={formatText(t.gameScreen.changeLevel)}
            >
              <TrendingUp size={16} aria-hidden className="text-muted" />
              <span className="font-medium text-muted">{formatText(t.game.level)}</span>
              {currentLevel}
            </button>
          )}

          {hearts}

          <div className="ml-auto flex min-w-0 items-center justify-end gap-1">
            <div
              data-testid="session-score"
              className="flex shrink-0 items-center gap-1.5 px-2 text-sm font-semibold tabular-nums text-ink"
            >
              <Trophy size={16} aria-hidden className="text-muted" />
              {score}
            </div>
            <ResourceBadge value={stars} compact={true} onClick={onShopClick} />
          </div>
        </div>
      </div>
    </div>
  );
};
