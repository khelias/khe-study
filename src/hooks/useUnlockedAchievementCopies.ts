import { useGameStore } from '../stores/gameStore';
import { ACHIEVEMENTS } from '../engine/achievements';
import { getAchievementCopy } from '../utils/achievementCopy';
import { useTranslation } from '../i18n/useTranslation';
import type { AchievementUnlock } from '../types/achievement';

interface UnlockedAchievementsResult {
  ids: string[];
  enriched: AchievementUnlock[];
}

/**
 * Reads unlocked achievement IDs from the store and enriches them with
 * localized title/description copy. Returns both shapes so callers that need
 * raw IDs (e.g. AchievementsModal) and callers that need enriched objects
 * (e.g. StatsModal, SettingsMenu) can share one source of truth.
 */
export const useUnlockedAchievementCopies = (): UnlockedAchievementsResult => {
  const ids = useGameStore((state) => state.activeLearnerProfile.meta.achievements);
  const t = useTranslation();

  const enriched: AchievementUnlock[] = ids
    .map((id) => {
      const achievement = ACHIEVEMENTS[id];
      if (!achievement) return null;
      const copy = getAchievementCopy(t, achievement.id);
      return {
        id: achievement.id,
        title: copy.title,
        desc: copy.desc,
        icon: achievement.icon,
      };
    })
    .filter((a): a is AchievementUnlock => a !== null);

  return { ids, enriched };
};
