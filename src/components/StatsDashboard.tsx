// Statistics dashboard
import React from 'react';
import { BarChart3, Trophy, Target, TrendingUp, Clock, Hash, type LucideIcon } from 'lucide-react';
import { Stats } from '../types/stats';
import { AchievementUnlock } from '../types/achievement';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import { getLocale } from '../i18n';
import { getGameCurriculumSummary } from '../games/curriculumSummary';
import { ACHIEVEMENTS } from '../engine/achievements';

interface StatsDashboardProps {
  stats: Stats;
  unlockedAchievements?: AchievementUnlock[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  unlockedAchievements = [],
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const accuracy: number =
    stats.gamesPlayed > 0
      ? Math.round((stats.correctAnswers / (stats.correctAnswers + stats.wrongAnswers)) * 100)
      : 0;

  const totalAnswers: number = stats.correctAnswers + stats.wrongAnswers;
  const avgTimePerGame: number =
    stats.gamesPlayed > 0 ? Math.floor(stats.totalTimePlayed / stats.gamesPlayed) : 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes: number = Math.floor(seconds / 60);
    const secs: number = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  interface StatCard {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtitle?: string;
  }

  const statCards: StatCard[] = [
    {
      icon: Trophy,
      label: formatText(t.stats.gamesPlayed),
      value: stats.gamesPlayed,
    },
    {
      icon: Target,
      label: formatText(t.stats.accuracy),
      value: `${accuracy}%`,
      subtitle: `${stats.correctAnswers} / ${totalAnswers}`,
    },
    {
      icon: TrendingUp,
      label: formatText(t.stats.bestStreak),
      value: stats.maxStreak,
      subtitle: formatText(t.stats.streakSuffix),
    },
    {
      icon: Hash,
      label: formatText(t.stats.totalScore),
      value: stats.totalScore,
    },
    {
      icon: Clock,
      label: formatText(t.stats.playTime),
      value: formatTime(stats.totalTimePlayed),
      subtitle:
        avgTimePerGame > 0 ? `~${formatTime(avgTimePerGame)} ${formatText(t.stats.perGame)}` : '',
    },
    {
      icon: BarChart3,
      label: formatText(t.stats.achievements),
      value: `${unlockedAchievements.length} / ${Object.keys(ACHIEVEMENTS).length}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="fam-row flex items-center gap-3 px-2 py-3">
            <Icon size={20} aria-hidden className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink">{card.label}</div>
              {card.subtitle && <div className="text-xs text-muted">{card.subtitle}</div>}
            </div>
            <div className="shrink-0 text-lg font-semibold tabular-nums text-ink">{card.value}</div>
          </div>
        );
      })}
    </div>
  );
};

// Game type statistics
interface GameTypeStatsProps {
  stats: Stats;
}

export const GameTypeStats: React.FC<GameTypeStatsProps> = ({ stats }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const locale = getLocale();
  const gameTypes: Record<string, number> = stats.gamesByType || {};
  const totalGames: number = Object.values(gameTypes).reduce((a, b) => a + b, 0);

  if (totalGames === 0) {
    return <div className="py-8 text-center text-muted">{formatText(t.stats.noGamesPlayed)}</div>;
  }

  const sortedTypes: [string, number][] = Object.entries(gameTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <h3 className="fam-heading mb-4">{formatText(t.stats.mostPlayedGames)}</h3>
      {sortedTypes.map(([type, count]) => {
        const percentage: number = (count / totalGames) * 100;
        // Stats saved while the `_adv` bindings existed (2026-01/02) still carry the suffix.
        const baseType = type.replace('_adv', '');
        const gameLabel: string =
          t.games[baseType as keyof typeof t.games]?.title ?? type.replace(/_/g, ' ');
        const curriculumSummary = getGameCurriculumSummary(baseType, locale);
        return (
          <div key={type} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <div className="min-w-0 pr-3">
                <div className="font-semibold text-ink">{formatText(gameLabel)}</div>
                {curriculumSummary && (
                  <div
                    className="truncate text-xs text-muted"
                    title={formatText(curriculumSummary.title)}
                  >
                    {formatText(curriculumSummary.label)}
                  </div>
                )}
              </div>
              <span className="shrink-0 tabular-nums text-muted">
                {count} {formatText(t.stats.gamesLabel)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-ink transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
