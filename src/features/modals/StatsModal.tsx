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

const GameValueRow: React.FC<{ gameType: string; value: number }> = ({ gameType, value }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const config = GAME_CONFIG[gameType];
  if (!config) return null;
  const gameTitle: string = t.games[config.id as keyof typeof t.games]?.title ?? config.title;
  const curriculumSummary = getGameCurriculumSummary(gameType, getLocale());
  return (
    <div className="fam-row flex items-center justify-between gap-3 px-2 py-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink">{formatText(gameTitle)}</div>
        {curriculumSummary && (
          <div className="truncate text-xs text-muted" title={formatText(curriculumSummary.title)}>
            {formatText(curriculumSummary.label)}
          </div>
        )}
      </div>
      <span className="text-lg font-semibold tabular-nums text-ink">{value}</span>
    </div>
  );
};

export const StatsModal: React.FC<StatsModalProps> = ({ stats, unlockedAchievements, onClose }) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
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
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
          <div className="fam-row px-2 py-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Wallet size={18} className="text-muted" aria-hidden />
              {formatText(t.stats.spendableStars)}
            </div>
            <div className="flex items-center gap-1.5 text-3xl font-semibold tabular-nums text-ink">
              {spendableStars}
              <Star size={22} className="fill-star text-star" aria-hidden />
            </div>
            <p className="mt-1 text-xs text-muted">{formatText(t.stats.spendableStarsHint)}</p>
          </div>
          {/* Neutral on purpose: lifetime stars are a record, not a second wallet. */}
          <div className="fam-row px-2 py-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Star size={18} className="text-muted" aria-hidden />
              {formatText(t.stats.totalStars)}
            </div>
            <div className="text-3xl font-semibold tabular-nums text-ink">
              {stats.collectedStars || 0}
            </div>
            <p className="mt-1 text-xs text-muted">{formatText(t.stats.lifetimeStarsHint)}</p>
          </div>
        </div>

        <StatsDashboard stats={stats} unlockedAchievements={unlockedAchievements} />

        <section className="border-t border-rule-strong pt-5">
          <GameTypeStats stats={stats} />
        </section>

        {stats.maxLevels && Object.keys(stats.maxLevels).length > 0 && (
          <section className="border-t border-rule-strong pt-5">
            <h3 className="fam-heading mb-2">{t.statsModal.highestLevels}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
              {Object.entries(stats.maxLevels).map(([gameType, level]) => (
                <GameValueRow key={gameType} gameType={gameType} value={level} />
              ))}
            </div>
          </section>
        )}

        {highScores && Object.keys(highScores).length > 0 && (
          <section className="border-t border-rule-strong pt-5">
            <h3 className="fam-heading mb-2 flex items-center gap-2">
              <Trophy size={20} className="text-muted" aria-hidden />
              {formatText(t.game.highScore || 'High scores')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6">
              {Object.entries(highScores)
                .sort((a, b) => b[1] - a[1]) // Sort by score descending
                .map(([gameType, score]) => (
                  <GameValueRow key={gameType} gameType={gameType} value={score} />
                ))}
            </div>
          </section>
        )}
      </div>
    </AppModal>
  );
};
