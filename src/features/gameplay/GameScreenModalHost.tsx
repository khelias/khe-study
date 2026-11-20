import React from 'react';
import { StatsModal } from '../modals/StatsModal';
import { AchievementsModal } from '../modals/AchievementsModal';
import { ShopModal } from '../modals/ShopModal';
import { LevelSelectorModal } from '../modals/LevelSelectorModal';
import { GameDescriptionModal } from './GameDescriptionModal';
import type { Stats } from '../../types/stats';
import type { AchievementUnlock } from '../../types/achievement';

interface GameScreenModalHostProps {
  // Stats
  showStats: boolean;
  stats: Stats;
  unlockedAchievements: AchievementUnlock[];
  onCloseStats: () => void;

  // Achievements
  showAchievements: boolean;
  unlockedAchievementIds: string[];
  onCloseAchievements: () => void;

  // Shop
  showShop: boolean;
  onCloseShop: () => void;

  // Level selector
  showLevelSelector: boolean;
  currentLevel: number;
  gameType: string;
  onCloseLevelSelector: () => void;
  onLevelChange: (newLevel: number) => void;

  // Game description
  showGameDescription: boolean;
  onCloseGameDescription: () => void;
}

export const GameScreenModalHost: React.FC<GameScreenModalHostProps> = ({
  showStats,
  stats,
  unlockedAchievements,
  onCloseStats,
  showAchievements,
  unlockedAchievementIds,
  onCloseAchievements,
  showShop,
  onCloseShop,
  showLevelSelector,
  currentLevel,
  gameType,
  onCloseLevelSelector,
  onLevelChange,
  showGameDescription,
  onCloseGameDescription,
}) => {
  return (
    <>
      {showStats && (
        <StatsModal
          stats={stats}
          unlockedAchievements={unlockedAchievements}
          onClose={onCloseStats}
        />
      )}
      {showAchievements && (
        <AchievementsModal
          unlockedAchievements={unlockedAchievementIds}
          stats={stats}
          onClose={onCloseAchievements}
        />
      )}
      {showShop && <ShopModal onClose={onCloseShop} />}
      {showLevelSelector && (
        <LevelSelectorModal
          currentLevel={currentLevel}
          gameType={gameType}
          onClose={onCloseLevelSelector}
          onLevelChange={onLevelChange}
        />
      )}
      {showGameDescription && (
        <GameDescriptionModal gameType={gameType} onClose={onCloseGameDescription} />
      )}
    </>
  );
};
