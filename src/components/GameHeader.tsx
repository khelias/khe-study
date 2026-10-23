/**
 * GameHeader Component
 *
 * Practical in-game HUD.
 *
 * Most games solve this with stable zones: navigation/context on the left,
 * the current objective in the middle, and run resources on the right.
 */

import React from 'react';
import { Home, Info, Menu, TrendingUp, Trophy, X } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { GameIcon } from './gameIcons';
import { useProfileText } from '../hooks/useProfileText';
import { GAME_CONFIG } from '../games/data';
import { ResourceBadge } from './shared/ResourceBadge';
import type { GameHeaderObjective } from '../types/game';

interface GameHeaderProps {
  score: number; // Current game session score
  stars: number; // Persistent currency
  hearts: number; // Persistent global resource
  levelProgress: {
    correctAnswers: number;
    totalAnswers: number;
  } | null;
  levelUpRequirement: number; // How many correct answers needed to level up
  /** When false (e.g. onGameWin games), level progress bar is hidden */
  showLevelProgress?: boolean;
  onReturnToMenu: () => void;
  onSettingsClick: () => void;
  currentLevel: number;
  gameType: string;
  onLevelClick: () => void;
  onGameNameClick: () => void;
  sessionObjective?: GameHeaderObjective | null;
  showSettingsMenu: boolean;
  settingsMenuRef: React.RefObject<HTMLDivElement>;
  onShopClick?: () => void; // Optional shop handler
  children?: React.ReactNode; // For settings menu dropdown
}

const MAX_HEARTS = 5;

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  stars,
  hearts,
  levelProgress,
  levelUpRequirement,
  showLevelProgress = true,
  onReturnToMenu,
  onSettingsClick,
  currentLevel,
  gameType,
  onLevelClick,
  onGameNameClick,
  sessionObjective,
  showSettingsMenu,
  settingsMenuRef,
  onShopClick,
  children,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();

  const progressCount = levelProgress?.correctAnswers || 0;
  const progressTotal = levelUpRequirement;
  const progressPercent =
    progressTotal > 0 ? Math.min(100, (progressCount / progressTotal) * 100) : 0;
  const gameConfig = GAME_CONFIG[gameType];
  const gameTitleStr: string =
    gameConfig && t.games[gameType as keyof typeof t.games]
      ? t.games[gameType as keyof typeof t.games].title
      : gameType.toUpperCase();
  const gameName = formatText(gameTitleStr);
  const objective =
    sessionObjective ??
    (showLevelProgress
      ? {
          label: formatText(t.gameScreen.progressLabel),
          value: `${progressCount}/${progressTotal}`,
          percent: progressPercent,
        }
      : null);
  const objectivePercent = Math.max(0, Math.min(100, objective?.percent ?? 0));
  const objectiveIsLevelControl = !sessionObjective && showLevelProgress;
  const objectiveClassName = 'flex min-h-[44px] w-full min-w-0 items-center gap-3 rounded-lg px-2';
  const objectiveContent = objective && (
    <>
      <span className="fam-label max-w-24 shrink-0 truncate sm:max-w-none">{objective.label}</span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
        {objective.value}
      </span>
      <span className="h-1.5 min-w-20 flex-1 overflow-hidden rounded-full bg-sunken">
        <span
          className="block h-full rounded-full bg-ink transition-all duration-500 ease-out"
          style={{ width: `${objectivePercent}%` }}
        />
      </span>
    </>
  );

  return (
    <div className="w-full border-b border-rule bg-paper">
      <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <button
            onClick={onReturnToMenu}
            aria-label={t.gameScreen.returnToMenu}
            className="fam-icon-btn shrink-0"
          >
            <Home size={18} aria-hidden />
          </button>
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
          <div className="flex items-center gap-2 justify-self-end">
            <button
              type="button"
              onClick={onGameNameClick}
              title={formatText(t.gameScreen.gameDescriptionTitle)}
              className="fam-icon-btn"
              aria-label={formatText(t.gameScreen.gameDescriptionTitle)}
            >
              <Info size={18} aria-hidden />
            </button>
            <div className="relative" ref={settingsMenuRef}>
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
          </div>
        </div>

        {objective && (
          <div className="mt-1 min-w-0">
            {objectiveIsLevelControl ? (
              <button
                type="button"
                onClick={onLevelClick}
                className={`${objectiveClassName} transition-colors hover:bg-sunken active:bg-sunken`}
                aria-label={objective.ariaLabel ?? objective.label}
              >
                {objectiveContent}
              </button>
            ) : (
              <div
                className={objectiveClassName}
                aria-label={objective.ariaLabel ?? objective.label}
              >
                {objectiveContent}
              </div>
            )}
          </div>
        )}

        <div className="mt-1 flex items-center gap-1">
          <button
            type="button"
            onClick={onLevelClick}
            className="fam-btn-quiet shrink-0 text-sm font-semibold tabular-nums text-ink"
            aria-label="Change level"
          >
            <TrendingUp size={16} aria-hidden className="text-muted" />
            <span className="hidden font-medium text-muted sm:inline">
              {formatText(t.game.level)}
            </span>
            {currentLevel}
          </button>

          <div className="ml-auto flex min-w-0 items-center justify-end gap-1">
            <div className="flex shrink-0 items-center gap-1.5 px-2 text-sm font-semibold tabular-nums text-ink">
              <Trophy size={16} aria-hidden className="text-muted" />
              {score}
            </div>
            <ResourceBadge type="stars" value={stars} compact={true} onClick={onShopClick} />
            <ResourceBadge
              type="hearts"
              value={hearts}
              maxValue={MAX_HEARTS}
              compact={true}
              onClick={onShopClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
