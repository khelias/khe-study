import React, { useMemo } from 'react';
import { ChevronRight, Layers, type LucideIcon } from 'lucide-react';
import { FadeIn } from './EnhancedAnimations';
import type { MechanicConfig } from '../types/game';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';

const DefaultIcon = () => null;

interface MechanicCardProps {
  mechanicConfig: MechanicConfig & {
    iconComponent?: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  };
  packCount: number;
  badge?: string | null;
  delay?: number;
  onClick: () => void;
}

export const MechanicCard: React.FC<MechanicCardProps> = ({
  mechanicConfig,
  packCount,
  badge = null,
  delay = 0,
  onClick,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const IconComponent = useMemo(
    () => mechanicConfig.iconComponent || DefaultIcon,
    [mechanicConfig.iconComponent],
  );

  const mechanicCopy = t.mechanics[mechanicConfig.id as keyof typeof t.mechanics];
  const title: string = mechanicCopy?.title ?? mechanicConfig.title;
  const desc: string = mechanicCopy?.desc ?? mechanicConfig.desc;

  const countTemplate =
    packCount === 1 ? t.menuSpecific.packCount_one : t.menuSpecific.packCount_other;
  const countLabel = countTemplate.replace('{count}', String(packCount));

  const ariaLabel = `${formatText(title)} - ${formatText(desc)} - ${countLabel}`;

  return (
    <FadeIn delay={delay}>
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="fam-row fam-list-row sm:gap-4 sm:px-2"
      >
        <IconComponent size={22} className="text-muted" aria-hidden />

        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-snug text-ink">
            {formatText(title)}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-muted">{formatText(desc)}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {badge && <span className="fam-pill">{formatText(badge)}</span>}
            <span className="fam-pill">
              <Layers size={12} className="text-muted" aria-hidden />
              {countLabel}
            </span>
          </div>
        </div>

        <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
      </button>
    </FadeIn>
  );
};
