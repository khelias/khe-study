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
  const gameEmoji = gameConfig?.emoji ?? '🎮';
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
          tone: 'emerald' as const,
        }
      : null);
  const objectivePercent = Math.max(0, Math.min(100, objective?.percent ?? 0));
  const objectiveBarClass = objective?.tone === 'blue' ? 'bg-blue-500' : 'bg-emerald-500';
  const objectiveIsLevelControl = !sessionObjective && showLevelProgress;
  const objectiveClassName =
    'flex h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 shadow-sm';
  const objectiveContent = objective && (
    <>
      <span className="max-w-24 shrink-0 truncate text-[0.62rem] font-black uppercase leading-none tracking-normal text-slate-500 sm:max-w-none">
        {objective.label}
      </span>
      <span className="shrink-0 text-xs font-black text-slate-800">{objective.value}</span>
      <span className="h-2 min-w-20 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner">
        <span
          className={`block h-full rounded-full transition-all duration-500 ease-out ${objectiveBarClass}`}
          style={{ width: `${objectivePercent}%` }}
        />
      </span>
    </>
  );

  return (
    <div className="w-full border-b border-slate-200 bg-slate-50/95">
      <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <button
            onClick={onReturnToMenu}
            aria-label={t.gameScreen.returnToMenu}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-slate-100 active:scale-95"
          >
            <Home size={18} aria-hidden className="text-slate-600" />
          </button>
          <button
            type="button"
            onClick={onGameNameClick}
            title={formatText(t.gameScreen.gameDescriptionTitle)}
            className="mx-auto flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-transparent px-3 py-1.5 text-center text-slate-900 transition-colors hover:border-slate-200 hover:bg-white/90 hover:shadow-sm active:scale-[0.99]"
            aria-label={formatText(t.gameScreen.gameDescriptionTitle)}
          >
            <span className="text-lg" aria-hidden>
              {gameEmoji}
            </span>
            <span className="block min-w-0 truncate text-base font-black leading-tight sm:text-lg">
              {gameName}
            </span>
            <Info size={13} aria-hidden className="shrink-0 text-slate-400" />
          </button>
          <div className="relative justify-self-end" ref={settingsMenuRef}>
            <button
              onClick={onSettingsClick}
              aria-label={formatText(t.menu.settings)}
              title={formatText(t.menu.settings)}
              aria-expanded={showSettingsMenu}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95"
            >
              {showSettingsMenu ? (
                <X size={18} aria-hidden className="text-slate-600" />
              ) : (
                <Menu size={18} aria-hidden className="text-slate-600" />
              )}
            </button>
            {showSettingsMenu && children}
          </div>
        </div>

        {objective && (
          <div className="mt-2 min-w-0">
            {objectiveIsLevelControl ? (
              <button
                type="button"
                onClick={onLevelClick}
                className={`${objectiveClassName} transition-colors hover:border-slate-300 hover:bg-white active:scale-[0.99]`}
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

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onLevelClick}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 text-sm font-black text-purple-700 shadow-sm transition-colors hover:bg-purple-100"
            aria-label="Change level"
          >
            <TrendingUp size={15} aria-hidden className="text-purple-600" />
            <span className="hidden sm:inline">{formatText(t.game.level)}</span>
            {currentLevel}
          </button>

          <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5">
            <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 text-xs font-black text-blue-700 shadow-sm">
              <Trophy size={15} aria-hidden className="text-blue-600" />
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
