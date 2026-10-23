// PackPickerModal — opened from a mechanic card on MenuScreen.
// Lists the bindings inside that mechanic so the user can pick a content
// pack (skill). Each row starts the corresponding game binding by id.
import React from 'react';
import { ChevronRight, Trophy, Type, type LucideIcon } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { AppModal, AppModalHeader } from '../../components/shared';
import { difficultyLabel } from '../../utils/difficultyLabel';
import type { GameConfig, MechanicConfig } from '../../types/game';

interface CurriculumSummaryLabel {
  label: string;
  title: string;
}

interface PackPickerModalProps {
  mechanicConfig: MechanicConfig;
  bindings: Array<{
    config: GameConfig;
    iconComponent: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
    level: number;
    highScore: number;
    isNew: boolean;
    curriculumSummary?: CurriculumSummaryLabel | null;
  }>;
  onSelect: (gameId: string) => void;
  onClose: () => void;
}

export const PackPickerModal: React.FC<PackPickerModalProps> = ({
  mechanicConfig,
  bindings,
  onSelect,
  onClose,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();

  const mechanicCopy = t.mechanics[mechanicConfig.id as keyof typeof t.mechanics];
  const mechanicTitle: string = mechanicCopy?.title ?? mechanicConfig.title;
  const heading = formatText(mechanicTitle);

  return (
    <AppModal labelledBy="pack-picker-title" onClose={onClose} size="md">
      <AppModalHeader
        title={heading}
        titleId="pack-picker-title"
        subtitle={formatText(t.menuSpecific.choosePack)}
        onClose={onClose}
        closeLabel={String(t.common.close)}
      />

      <div className="px-4 pb-2 sm:px-5">
        <ul className="flex flex-col">
          {bindings.map((binding) => {
            const { config, iconComponent, level, highScore, isNew, curriculumSummary } = binding;
            const Icon = iconComponent || Type;
            const title: string = t.games[config.id as keyof typeof t.games]?.title ?? config.title;
            const desc: string = t.games[config.id as keyof typeof t.games]?.desc ?? config.desc;
            const difficultyText = difficultyLabel(t, config);

            return (
              <li key={config.id} className="fam-row last:border-b-0">
                <button
                  onClick={() => onSelect(config.id)}
                  className="fam-list-row"
                  aria-label={`${formatText(title)} - ${formatText(desc)}${
                    curriculumSummary ? ` - ${formatText(curriculumSummary.title)}` : ''
                  }`}
                >
                  <Icon size={22} className="text-muted" aria-hidden />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold leading-snug text-ink">
                      {formatText(title)}
                    </div>
                    <div className="truncate text-sm leading-snug text-muted">
                      {formatText(desc)}
                    </div>
                    {curriculumSummary && (
                      <div
                        className="fam-label mt-0.5 truncate"
                        title={formatText(curriculumSummary.title)}
                      >
                        {formatText(curriculumSummary.label)}
                      </div>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {isNew && (
                        <span className="fam-pill">{formatText(t.menuSpecific.newGame)}</span>
                      )}
                      {difficultyText && (
                        <span className="fam-pill">{formatText(difficultyText)}</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Trophy size={12} aria-hidden />
                        {highScore > 0 ? highScore : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="flex flex-col items-end leading-tight">
                      <span className="fam-label">{formatText(t.game.level)}</span>
                      <span className="text-base font-semibold tabular-nums text-ink">{level}</span>
                    </span>
                    <ChevronRight size={18} className="text-muted" aria-hidden />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </AppModal>
  );
};
