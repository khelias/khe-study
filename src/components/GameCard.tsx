// Game card component
import React, { useMemo } from 'react';
import { FadeIn } from './EnhancedAnimations';
import { GameConfig } from '../types/game';
import { ChevronRight, Lock, Trophy, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';

const DefaultIcon = () => null;

interface Progress {
  current: number;
  total: number;
}

interface CurriculumSummaryLabel {
  packTitle: string;
  label: string;
  detail: string;
  title: string;
}

interface GameCardProps {
  gameConfig: GameConfig & {
    iconComponent?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  };
  level: number;
  onClick: () => void;
  isLocked?: boolean;
  progress?: Progress | null;
  badge?: string | null;
  delay?: number;
  highScore?: number; // Optional high score to display
  curriculumSummary?: CurriculumSummaryLabel | null;
}

export const GameCard: React.FC<GameCardProps> = ({
  gameConfig,
  level,
  onClick,
  isLocked = false,
  progress = null,
  badge = null,
  delay = 0,
  highScore,
  curriculumSummary = null,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const IconComponent = useMemo(
    () => gameConfig.iconComponent || DefaultIcon,
    [gameConfig.iconComponent],
  );

  // Get translated title and description (assert string for i18n key access)
  const gameTitle: string =
    t.games[gameConfig.id as keyof typeof t.games]?.title ?? gameConfig.title;
  const gameDesc: string = t.games[gameConfig.id as keyof typeof t.games]?.desc ?? gameConfig.desc;
  const difficultyText = gameConfig.difficulty
    ? ((t.difficulty[gameConfig.difficulty] ?? gameConfig.difficulty) as string)
    : null;
  const levelLabel = formatText(t.game.level);
  const descText = formatText(gameDesc);
  // The pack title is often the description itself; then show only the rest.
  const curriculumLine = curriculumSummary
    ? formatText(
        curriculumSummary.packTitle === gameDesc
          ? curriculumSummary.detail
          : curriculumSummary.label,
      )
    : '';
  const ariaLabel = `${formatText(gameTitle)} - ${descText}${
    curriculumSummary ? ` - ${formatText(curriculumSummary.title)}` : ''
  } - ${levelLabel} ${level}`;
  const showScore = highScore !== undefined && highScore > 0;
  const hasMeta = Boolean(badge) || Boolean(difficultyText) || showScore;

  return (
    <FadeIn delay={delay}>
      <button
        onClick={onClick}
        disabled={isLocked}
        aria-label={ariaLabel}
        className="fam-row fam-list-row sm:gap-4 sm:px-2"
      >
        <IconComponent size={22} className="text-muted" aria-hidden />

        <div className="min-w-0">
          <h3 className="flex min-w-0 items-center gap-2 text-[15px] font-semibold leading-snug text-ink">
            <span className="truncate">{formatText(gameTitle)}</span>
            {isLocked && <Lock size={14} aria-hidden className="shrink-0 text-muted" />}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted">{descText}</p>
          {curriculumSummary && curriculumLine && (
            <p className="fam-label mt-0.5 truncate" title={formatText(curriculumSummary.title)}>
              {curriculumLine}
            </p>
          )}

          {hasMeta && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {badge && <span className="fam-pill">{formatText(badge)}</span>}
              {gameConfig.difficulty && difficultyText && (
                <span className="fam-pill">{formatText(difficultyText)}</span>
              )}
              {showScore && (
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Trophy size={12} aria-hidden />
                  {formatText(t.game.highScore || 'High Score')}: {highScore}
                </span>
              )}
            </div>
          )}

          {progress && (
            <div className="mt-2 h-1 w-full overflow-hidden bg-sunken">
              <div
                className="h-full bg-ok transition-all duration-500"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="flex flex-col items-end leading-tight">
            <span className="fam-label">{formatText(t.level)}</span>
            <span className="text-base font-semibold tabular-nums text-ink">{level}</span>
          </span>
          <ChevronRight size={18} className="text-muted" aria-hidden />
        </div>
      </button>
    </FadeIn>
  );
};
