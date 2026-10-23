import React from 'react';
import type { MechanicConfig } from '../types/game';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import { menuPicture } from '../games/menuPictures';
import { MenuEntry, type MenuEntryLayout } from './MenuEntry';

interface MechanicCardProps {
  mechanicConfig: MechanicConfig;
  packCount: number;
  layout: MenuEntryLayout;
  onClick: () => void;
  delay?: number;
}

export const MechanicCard: React.FC<MechanicCardProps> = ({
  mechanicConfig,
  packCount,
  layout,
  onClick,
  delay,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const copy = t.mechanics[mechanicConfig.id as keyof typeof t.mechanics];
  const title = formatText(copy?.title ?? mechanicConfig.title);
  const description = formatText(copy?.desc ?? mechanicConfig.desc);
  const countTemplate =
    packCount === 1 ? t.menuSpecific.packCount_one : t.menuSpecific.packCount_other;
  const countLabel = countTemplate.replace('{count}', String(packCount));

  return (
    <MenuEntry
      layout={layout}
      Picture={menuPicture(mechanicConfig.id)}
      title={title}
      description={description}
      metaLabel={countLabel}
      delay={delay}
      onClick={onClick}
    />
  );
};
