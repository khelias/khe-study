/**
 * LevelSelectorModal Component
 *
 * Modal for manually changing the level of the current game.
 */

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { GAME_CONFIG } from '../../games/data';
import { AppModal, AppModalHeader } from '../../components/shared';

interface LevelSelectorModalProps {
  currentLevel: number;
  gameType: string;
  onClose: () => void;
  onLevelChange: (level: number) => void;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  currentLevel,
  gameType,
  onClose,
  onLevelChange,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevel);

  const handleConfirm = () => {
    if (selectedLevel !== currentLevel) {
      onLevelChange(selectedLevel);
    }
    onClose();
  };

  // Get game title (translated)
  const gameConfig = GAME_CONFIG[gameType];
  const gameTitle: string = gameConfig
    ? (t.games[gameConfig.id as keyof typeof t.games]?.title ?? gameConfig.title)
    : gameType;

  // Generate level options (1-20, or reasonable range)
  const maxLevel = 20;
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <AppModal labelledBy="level-selector-title" onClose={onClose} size="md">
      <AppModalHeader
        title={formatText(String(t.gameScreen.selectLevel))}
        titleId="level-selector-title"
        icon={<TrendingUp size={20} aria-hidden />}
        onClose={onClose}
        closeLabel={formatText(t.common.close)}
      />

      <div className="p-5 sm:p-6">
        <div className="mb-6 space-y-5">
          <div>
            <div className="fam-row flex items-center justify-between gap-3 py-3">
              <div className="fam-label">{formatText(String(t.gameScreen.game))}</div>
              <div className="min-w-0 truncate font-semibold text-ink">{formatText(gameTitle)}</div>
            </div>
            <div className="fam-row flex items-center justify-between gap-3 py-3">
              <div className="fam-label">{formatText(String(t.gameScreen.currentLevel))}</div>
              <div className="text-lg font-semibold tabular-nums text-ink">{currentLevel}</div>
            </div>
          </div>

          <div>
            <div className="fam-label mb-3">{formatText(String(t.gameScreen.selectNewLevel))}</div>
            <div className="grid max-h-[300px] grid-cols-5 gap-2 overflow-y-auto overflow-x-hidden p-1">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  aria-pressed={selectedLevel === level}
                  className={[
                    'fam-btn h-11 px-0 tabular-nums',
                    selectedLevel === level
                      ? 'border-2 border-ink bg-sunken'
                      : level === currentLevel
                        ? 'bg-sunken'
                        : '',
                  ].join(' ')}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="fam-btn flex-1">
            {formatText(t.common.cancel)}
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedLevel === currentLevel}
            className="fam-btn fam-btn-primary flex-1"
          >
            {formatText(t.common.confirm)}
          </button>
        </div>
      </div>
    </AppModal>
  );
};
