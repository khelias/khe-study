import React from 'react';
import { Check, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { getAchievementCopy } from '../../utils/achievementCopy';
import type { Stats } from '../../types/stats';
import { AppModal, AppModalHeader } from '../../components/shared';

interface AchievementsModalProps {
  unlockedAchievements: string[];
  stats: Stats;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  unlockedAchievements,
  stats,
  onClose,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const allAchievements = Object.values(ACHIEVEMENTS);
  const unlockedSet: Set<string> = new Set(unlockedAchievements);

  return (
    <AppModal labelledBy="achievements-modal-title" onClose={onClose} size="2xl">
      <AppModalHeader
        title={formatText(t.achievements.modalTitle)}
        titleId="achievements-modal-title"
        onClose={onClose}
        closeLabel={formatText(t.common.close)}
      />

      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-baseline gap-3 px-2">
          <div className="text-3xl font-semibold tabular-nums text-ink">
            {unlockedAchievements.length} / {allAchievements.length}
          </div>
          <p className="fam-label">{formatText(t.achievements.collectedLabel)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
          {allAchievements.map((achievement) => {
            const isUnlocked: boolean = unlockedSet.has(achievement.id);
            const copy = getAchievementCopy(t, achievement.id);
            const progress = achievement.progress(stats);
            const cappedCurrent = Math.min(progress.current, progress.target);
            const progressPercent =
              progress.target > 0 ? Math.min(100, (cappedCurrent / progress.target) * 100) : 0;
            return (
              <div key={achievement.id} className="fam-row px-2 py-4">
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sunken text-3xl',
                      isUnlocked ? '' : 'opacity-40 grayscale',
                    ].join(' ')}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-ink">{formatText(copy.title)}</h3>
                      <span
                        className={[
                          'fam-pill shrink-0',
                          isUnlocked ? 'border-ok text-ok' : 'text-muted',
                        ].join(' ')}
                      >
                        {isUnlocked ? (
                          <Check size={12} aria-hidden />
                        ) : (
                          <Lock size={12} aria-hidden />
                        )}
                        {formatText(isUnlocked ? t.achievements.unlocked : t.achievements.locked)}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{formatText(copy.desc)}</p>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted">
                        <span>{formatText(t.achievements.progress)}</span>
                        <span className="font-semibold tabular-nums text-ink">
                          {cappedCurrent}/{progress.target}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
                        <div
                          className={[
                            'h-full rounded-full transition-all duration-500',
                            isUnlocked ? 'bg-ok' : 'bg-ink',
                          ].join(' ')}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppModal>
  );
};
