import React from 'react';
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
        <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50/70 p-4 text-center">
          <div className="text-4xl font-black text-purple-600 mb-2">
            {unlockedAchievements.length} / {allAchievements.length}
          </div>
          <p className="text-sm text-slate-600">{formatText(t.achievements.collectedLabel)}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {allAchievements.map((achievement) => {
            const isUnlocked: boolean = unlockedSet.has(achievement.id);
            const copy = getAchievementCopy(t, achievement.id);
            const progress = achievement.progress(stats);
            const cappedCurrent = Math.min(progress.current, progress.target);
            const progressPercent =
              progress.target > 0 ? Math.min(100, (cappedCurrent / progress.target) * 100) : 0;
            return (
              <div
                key={achievement.id}
                className={[
                  'rounded-xl border-2 p-4 transition-all',
                  isUnlocked
                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md'
                    : 'border-slate-300 bg-slate-50 shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-3xl transition-opacity',
                      isUnlocked ? 'bg-yellow-100' : 'bg-white opacity-70',
                    ].join(' ')}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="text-lg font-black text-slate-800">
                        {formatText(copy.title)}
                      </h3>
                      <span
                        className={[
                          'shrink-0 rounded-full px-2 py-1 text-[0.62rem] font-black uppercase',
                          isUnlocked
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-200 text-slate-700',
                        ].join(' ')}
                      >
                        {formatText(isUnlocked ? t.achievements.unlocked : t.achievements.locked)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{formatText(copy.desc)}</p>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
                        <span>{formatText(t.achievements.progress)}</span>
                        <span className="text-slate-700">
                          {cappedCurrent}/{progress.target}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={[
                            'h-full rounded-full transition-all duration-500',
                            isUnlocked ? 'bg-yellow-500' : 'bg-blue-500',
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
