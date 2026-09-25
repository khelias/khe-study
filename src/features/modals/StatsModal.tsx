import React from 'react';
import { Trophy, Star, Wallet } from 'lucide-react';
import { GAME_CONFIG } from '../../games/data';
import { StatsDashboard, GameTypeStats } from '../../components/StatsDashboard';
import { useTranslation } from '../../i18n/useTranslation';
import { useGameStore } from '../../stores/gameStore';
import { useProfileText } from '../../hooks/useProfileText';
import { Stats } from '../../types/stats';
import { AchievementUnlock } from '../../types/achievement';
import { getLocale } from '../../i18n';
import { getGameCurriculumSummary } from '../../games/curriculumSummary';
import { AppModal, AppModalHeader } from '../../components/shared';

interface StatsModalProps {
  stats: Stats;
  unlockedAchievements: AchievementUnlock[];
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, unlockedAchievements, onClose }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const locale = getLocale();
  const highScores = useGameStore((state) => state.highScores);
  const spendableStars = useGameStore((state) => state.stars);

  return (
    <AppModal labelledBy="stats-modal-title" onClose={onClose} size="2xl">
      <AppModalHeader
        title={t.statsModal.title}
        titleId="stats-modal-title"
        onClose={onClose}
        closeLabel={t.statsModal.close}
      />

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
              <Wallet size={18} className="text-amber-600" aria-hidden />
              {formatText(t.stats.spendableStars)}
            </div>
            <div className="text-3xl font-black text-slate-900">{spendableStars}</div>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {formatText(t.stats.spendableStarsHint)}
            </p>
          </div>
          {/* Neutral on purpose: lifetime stars are a record, not a second wallet. */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-700">
              <Star size={18} className="text-slate-500" aria-hidden />
              {formatText(t.stats.totalStars)}
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.collectedStars || 0}</div>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {formatText(t.stats.lifetimeStarsHint)}
            </p>
          </div>
        </div>

        {/* Enhanced dashboard */}
        <StatsDashboard stats={stats} unlockedAchievements={unlockedAchievements} />

        {/* Game type statistics */}
        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
          <GameTypeStats stats={stats} />
        </div>

        {/* Max levels */}
        {stats.maxLevels && Object.keys(stats.maxLevels).length > 0 && (
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-4">{t.statsModal.highestLevels}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(stats.maxLevels).map(([gameType, level]) => {
                const config = GAME_CONFIG[gameType];
                if (!config) return null;
                const gameTitle: string =
                  t.games[config.id as keyof typeof t.games]?.title ?? config.title;
                const curriculumSummary = getGameCurriculumSummary(gameType, locale);
                return (
                  <div
                    key={gameType}
                    className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-600">
                        {formatText(gameTitle)}
                      </div>
                      {curriculumSummary && (
                        <div
                          className="truncate text-[11px] font-semibold text-slate-500"
                          title={formatText(curriculumSummary.title)}
                        >
                          {formatText(curriculumSummary.label)}
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-black text-slate-800">{level}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* High Scores */}
        {highScores && Object.keys(highScores).length > 0 && (
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" />
              {formatText(t.game.highScore || 'High Scores')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(highScores)
                .sort((a, b) => b[1] - a[1]) // Sort by score descending
                .map(([gameType, score]) => {
                  const config = GAME_CONFIG[gameType];
                  if (!config) return null;
                  const gameTitle: string =
                    t.games[config.id as keyof typeof t.games]?.title ?? config.title;
                  const curriculumSummary = getGameCurriculumSummary(gameType, locale);
                  return (
                    <div
                      key={gameType}
                      className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-600">
                          {formatText(gameTitle)}
                        </div>
                        {curriculumSummary && (
                          <div
                            className="truncate text-[11px] font-semibold text-slate-500"
                            title={formatText(curriculumSummary.title)}
                          >
                            {formatText(curriculumSummary.label)}
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-black text-yellow-600">{score}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};
