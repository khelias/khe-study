import React from 'react';
import type { GameConfig } from '../types/game';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import { menuPicture } from '../games/menuPictures';
import { MenuEntry, type MenuEntryLayout } from './MenuEntry';

interface GameCardProps {
  gameConfig: GameConfig;
  level: number;
  layout: MenuEntryLayout;
  onClick: () => void;
  delay?: number;
}

export const GameCard: React.FC<GameCardProps> = ({
  gameConfig,
  level,
  layout,
  onClick,
  delay,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const copy = t.games[gameConfig.id as keyof typeof t.games];
  const title = formatText(copy?.title ?? gameConfig.title);
  const description = formatText(copy?.desc ?? gameConfig.desc);
  const levelLabel = formatText(t.level);

  return (
    <MenuEntry
      layout={layout}
      Picture={menuPicture(gameConfig.id)}
      title={title}
      description={description}
      metaLabel={levelLabel}
      metaValue={level}
      delay={delay}
      onClick={onClick}
    />
  );
};
