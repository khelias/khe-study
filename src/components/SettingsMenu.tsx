/**
 * SettingsMenu Component
 *
 * Dropdown menu for game settings (consistent across MenuScreen and GameScreen).
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Home,
  BarChart3,
  Languages,
  Trash2,
  ShoppingBag,
  Users,
  UserPlus,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import { getLocale, setLocale, type SupportedLocale } from '../i18n';
import { getMechanicIdForGame } from '../games/data';
import { useGameStore } from '../stores/gameStore';
import type { AchievementUnlock } from '../types/achievement';

interface SettingsMenuProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReturnToMenu: () => void;
  onClose: () => void;
  // Optional props for full menu (from GameScreen)
  onShowAchievements?: () => void;
  onShowStats?: () => void;
  onShowShop?: () => void; // Shop modal
  unlockedAchievements?: AchievementUnlock[];
  isGameScreen?: boolean; // If true, shows "Return to Menu" instead of "Delete Progress"
  onDeleteProgress?: () => void; // For MenuScreen
  /** Phase 5d: current game type (when inside a game) so mechanic-specific
   *  preferences (like Picture Pairs variant) can surface only for the right
   *  game. */
  gameType?: string;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  soundEnabled,
  onToggleSound,
  onReturnToMenu,
  onClose,
  onShowAchievements,
  onShowStats,
  onShowShop,
  unlockedAchievements = [],
  isGameScreen = false,
  onDeleteProgress,
  gameType,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showLearnersMenu, setShowLearnersMenu] = useState(false);
  const currentLocale = getLocale();

  // Phase 6: learner switcher / add / remove.
  const learners = useGameStore((state) => state.learners);
  const activeLearnerId = useGameStore((state) => state.activeLearnerId);
  const setActiveLearner = useGameStore((state) => state.setActiveLearner);
  const addLearner = useGameStore((state) => state.addLearner);
  const removeLearner = useGameStore((state) => state.removeLearner);

  const handleAddLearner = (): void => {
    const name = prompt(formatText(t.menuSpecific.addLearnerNamePrompt));
    if (!name || !name.trim()) return;
    const id = addLearner({ displayName: name.trim() });
    setActiveLearner(id);
  };

  const handleRemoveLearner = (id: string, name: string): void => {
    const confirmed = confirm(
      formatText(t.menuSpecific.removeLearnerConfirm).replace('{name}', name),
    );
    if (!confirmed) return;
    removeLearner(id);
  };

  // Phase 5d: surface a per-mechanic variant toggle only for picture_pairs
  // while in-game. Other games may grow their own variant toggles later.
  const baseGameType = (gameType ?? '').replace('_adv', '');
  const mechanicId = baseGameType ? getMechanicIdForGame(baseGameType) : null;
  const showPicturePairsVariantToggle = isGameScreen && mechanicId === 'picture_pairs';
  const currentVariant = useGameStore((state) =>
    mechanicId ? state.activeLearnerProfile.mechanicPreference?.[mechanicId]?.variant : undefined,
  );
  const setMechanicVariant = useGameStore((state) => state.setMechanicVariant);
  const ageHint = useGameStore((state) => state.activeLearnerProfile.ageHint);
  const effectiveVariant =
    currentVariant ?? (ageHint != null && ageHint < 5 ? 'emoji_only' : 'emoji_word');

  const handleLanguageChange = (locale: SupportedLocale) => {
    setLocale(locale);
    setShowLanguageMenu(false);
  };

  return (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden z-50 min-w-[180px]">
      {/* Phase 6: learner switcher / add */}
      <div>
        <button
          onClick={() => setShowLearnersMenu(!showLearnersMenu)}
          className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between text-slate-700"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-600" />
            <span>{formatText(t.menuSpecific.learnersHeading)}</span>
          </div>
          <span className="text-sm font-semibold text-slate-500">
            {learners.find((l) => l.id === activeLearnerId)?.displayName ?? ''}
          </span>
        </button>
        {showLearnersMenu && (
          <div className="border-t border-slate-200 bg-slate-50">
            {learners.map((l) => (
              <div key={l.id} className="flex items-center">
                <button
                  onClick={() => {
                    setActiveLearner(l.id);
                    setShowLearnersMenu(false);
                  }}
                  className={`flex-1 px-4 py-2 text-left hover:bg-slate-100 transition-colors ${
                    l.id === activeLearnerId
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-slate-700'
                  }`}
                >
                  {l.displayName}
                </button>
                {learners.length > 1 && (
                  <button
                    onClick={() => handleRemoveLearner(l.id, l.displayName)}
                    className="px-3 py-2 hover:bg-red-50 text-red-500 transition-colors"
                    aria-label={formatText(t.menuSpecific.removeLearner)}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddLearner}
              className="w-full px-4 py-2 text-left hover:bg-slate-100 transition-colors flex items-center gap-2 text-purple-700 font-semibold"
            >
              <UserPlus size={14} />
              <span>{formatText(t.menuSpecific.addLearner)}</span>
            </button>
          </div>
        )}
      </div>
      <div className="border-t border-slate-200" />

      {/* Achievements - only if handlers provided */}
      {onShowAchievements && (
        <>
          <button
            onClick={() => {
              onShowAchievements();
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
          >
            <span className="text-lg">🏅</span>
            <span>{formatText(t.menuSpecific.showAchievements)}</span>
            {unlockedAchievements.length > 0 && (
              <span className="ml-auto text-sm font-bold text-purple-700">
                {unlockedAchievements.length}
              </span>
            )}
          </button>
          <div className="border-t border-slate-200" />
        </>
      )}

      {/* Stats - only if handler provided */}
      {onShowStats && (
        <>
          <button
            onClick={() => {
              onShowStats();
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
          >
            <BarChart3 size={16} className="text-blue-600" />
            <span>{formatText(t.menu.stats)}</span>
          </button>
          <div className="border-t border-slate-200" />
        </>
      )}

      {/* Shop - only if handler provided */}
      {onShowShop && (
        <>
          <button
            onClick={() => {
              onShowShop();
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
          >
            <ShoppingBag size={16} className="text-purple-600" />
            <span>{formatText(t.shop.title)}</span>
          </button>
          <div className="border-t border-slate-200" />
        </>
      )}

      {/* Language selector */}
      <div>
        <button
          onClick={() => {
            setShowLanguageMenu(!showLanguageMenu);
          }}
          className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between text-slate-700"
        >
          <div className="flex items-center gap-2">
            <Languages size={16} className="text-slate-600" />
            <span>{formatText(t.menuSpecific.language)}</span>
          </div>
          <span className="text-sm">{currentLocale === 'et' ? '🇪🇪' : '🇬🇧'}</span>
        </button>
        {showLanguageMenu && (
          <div className="border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                handleLanguageChange('et');
                setShowLanguageMenu(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-slate-100 transition-colors ${
                currentLocale === 'et' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700'
              }`}
            >
              🇪🇪 Eesti
            </button>
            <button
              onClick={() => {
                handleLanguageChange('en');
                setShowLanguageMenu(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-slate-100 transition-colors ${
                currentLocale === 'en' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        )}
      </div>

      {/* Phase 5d: Picture Pairs variant toggle (only inside that game) */}
      {showPicturePairsVariantToggle && (
        <div className="border-t border-slate-200">
          <div className="px-4 pt-2 pb-1 text-xs uppercase tracking-wide text-slate-500">
            {formatText(t.menuSpecific.picturePairsVariantLabel)}
          </div>
          <button
            onClick={() => {
              setMechanicVariant('picture_pairs', 'emoji_only');
            }}
            className={`w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 ${
              effectiveVariant === 'emoji_only'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-700'
            }`}
          >
            <span>{formatText(t.menuSpecific.picturePairsVariantEmojiOnly)}</span>
          </button>
          <button
            onClick={() => {
              setMechanicVariant('picture_pairs', 'emoji_word');
            }}
            className={`w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 ${
              effectiveVariant === 'emoji_word'
                ? 'bg-purple-50 text-purple-700 font-bold'
                : 'text-slate-700'
            }`}
          >
            <span>{formatText(t.menuSpecific.picturePairsVariantEmojiWord)}</span>
          </button>
        </div>
      )}

      {/* Sound toggle */}
      <div className="border-t border-slate-200">
        <button
          onClick={() => {
            onToggleSound();
            onClose();
          }}
          className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
        >
          {soundEnabled ? (
            <Volume2 size={16} className="text-slate-600" />
          ) : (
            <VolumeX size={16} className="text-red-500" />
          )}
          <span>
            {formatText(
              soundEnabled ? t.menuSpecific.toggleSoundOff : t.menuSpecific.toggleSoundOn,
            )}
          </span>
        </button>
      </div>

      {/* Return to Menu (GameScreen) or Delete Progress (MenuScreen) */}
      <div className="border-t border-slate-200">
        {isGameScreen ? (
          <button
            onClick={() => {
              onReturnToMenu();
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
          >
            <Home size={16} className="text-slate-600" />
            <span>{formatText(t.gameScreen.returnToMenu)}</span>
          </button>
        ) : (
          onDeleteProgress && (
            <button
              onClick={() => {
                onDeleteProgress();
                onClose();
              }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
            >
              <Trash2 size={16} />
              <span>{formatText(t.menuSpecific.deleteProgress)}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
