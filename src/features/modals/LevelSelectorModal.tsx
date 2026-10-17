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
        icon={<TrendingUp size={20} className="text-purple-600" aria-hidden />}
        onClose={onClose}
        closeLabel={formatText(t.common.close)}
      />

      <div className="p-5 sm:p-6">
        <div className="space-y-4 mb-6">
          {/* Game info */}
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
            <div className="text-sm font-semibold text-slate-600 mb-1">
              {formatText(String(t.gameScreen.game))}
            </div>
            <div className="text-lg font-black text-slate-800">{formatText(gameTitle)}</div>
          </div>

          {/* Current level */}
          <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
            <div className="text-sm font-semibold text-purple-600 mb-1">
              {formatText(String(t.gameScreen.currentLevel))}
            </div>
            <div className="text-2xl font-black text-purple-700">{currentLevel}</div>
          </div>

          {/* Level selector */}
          <div>
            <div className="text-sm font-semibold text-slate-600 mb-3">
              {formatText(String(t.gameScreen.selectNewLevel))}
            </div>
            <div className="grid max-h-[300px] grid-cols-5 gap-2 overflow-y-auto overflow-x-hidden rounded-xl bg-slate-50 p-2 sm:grid-cols-10">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`
                      h-10 sm:h-12 rounded-lg font-bold text-sm sm:text-base transition-all
                      ${
                        selectedLevel === level
                          ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300'
                          : level === currentLevel
                            ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                            : 'bg-white text-slate-700 hover:bg-purple-50 hover:border-purple-200 border-2 border-slate-200'
                      }
                    `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {formatText(t.common.cancel)}
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedLevel === currentLevel}
            className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            {formatText(t.common.confirm)}
          </button>
        </div>
      </div>
    </AppModal>
  );
};
