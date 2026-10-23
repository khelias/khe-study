/**
 * LevelUpModal Component
 *
 * Modal displayed when player levels up.
 */

import React from 'react';
import { ArrowRight, Trophy } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import type { GameConfig } from '../../types/game';
import { AppModal } from './AppModal';

interface LevelUpModalProps {
  level: number;
  onNext: () => void;
  gameConfig: GameConfig;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, onNext }) => {
  const t = useTranslation();
  return (
    <AppModal
      labelledBy="level-up-modal-title"
      closeOnBackdrop={false}
      closeOnEscape={false}
      size="sm"
      contentClassName="p-7 text-center sm:p-8"
    >
      <Trophy size={44} strokeWidth={1.75} className="mx-auto mb-4 text-ink" aria-hidden />
      <h2 id="level-up-modal-title" className="fam-heading mb-2">
        {t.levelUp.level} {level}!
      </h2>
      <p className="mb-6 text-[15px] text-ink-2">{t.levelUp.greatWork}</p>

      <button type="button" onClick={onNext} className="fam-btn fam-btn-primary w-full">
        {t.levelUp.nextLevel} <ArrowRight size={18} aria-hidden />
      </button>
    </AppModal>
  );
};
