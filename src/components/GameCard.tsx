// Game card component
import React, { useMemo } from 'react';
import { FadeIn } from './EnhancedAnimations';
import { GameConfig } from '../types/game';
import { Lock, Trophy, type LucideIcon } from 'lucide-react';
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

  return (
    <FadeIn delay={delay} className="h-full">
      <button
        onClick={onClick}
        disabled={isLocked}
        aria-label={ariaLabel}
        className={`
          group relative grid h-full w-full grid-cols-[auto_1fr_auto] items-center gap-2.5 overflow-hidden rounded-lg
          ${gameConfig.theme.bg} border border-slate-200 p-3 text-left shadow-sm transition duration-200
          hover:border-slate-300 hover:shadow-md active:bg-slate-50 sm:gap-3 sm:p-3.5
          ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        `}
      >
        <span
          className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${gameConfig.theme.accent}`}
          aria-hidden
        />

        <div
          className={`
          flex h-10 w-10 items-center justify-center rounded-lg border border-white/70 sm:h-11 sm:w-11
          ${gameConfig.theme.iconBg} ${gameConfig.theme.text}
        `}
        >
          <IconComponent size={22} aria-hidden />
        </div>

        <div className="text-left flex-1 min-w-0">
          <h3
            className={`text-sm sm:text-base font-bold ${gameConfig.theme.text} flex items-center gap-2 truncate`}
          >
            {formatText(gameTitle)}
            {isLocked && <Lock size={14} aria-hidden className="shrink-0" />}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-snug text-slate-600 sm:text-sm">
            {descText}
          </p>
          {curriculumSummary && curriculumLine && (
            <p
              className="mt-1 truncate text-[11px] font-semibold leading-snug text-slate-500"
              title={formatText(curriculumSummary.title)}
            >
              {curriculumLine}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {badge && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                {formatText(badge)}
              </span>
            )}
            {gameConfig.difficulty && difficultyText && (
              <span
                className={`
                text-[11px] font-bold px-2 py-0.5 rounded-md
                ${
                  gameConfig.difficulty === 'easy'
                    ? 'bg-green-100 text-green-700'
                    : gameConfig.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }
              `}
              >
                {formatText(difficultyText)}
              </span>
            )}
            {highScore !== undefined && highScore > 0 && (
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Trophy size={12} aria-hidden />
                {formatText(t.game.highScore || 'High Score')}: {highScore}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {progress && (
            <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-md overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[0.62rem] font-bold text-slate-500 uppercase tracking-wide">
            {formatText(t.level)}
          </span>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/80 border border-slate-200 sm:h-11 sm:w-11">
            <span className={`text-lg font-black ${gameConfig.theme.text}`}>{level}</span>
          </div>
        </div>
      </button>
    </FadeIn>
  );
};
