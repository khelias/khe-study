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
  Award,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { useProfileText } from '../hooks/useProfileText';
import { getLocale, setLocale, type SupportedLocale } from '../i18n';
import { getMechanicIdForGame } from '../games/data';
import { useGameStore } from '../stores/gameStore';
import { InlinePrompt } from './shared/InlinePrompt';
import type { AchievementUnlock } from '../types/achievement';

export interface SettingsMenuContentProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReturnToMenu: () => void;
  onClose: () => void;
  onShowAchievements?: () => void;
  onShowStats?: () => void;
  onShowShop?: () => void;
  unlockedAchievements?: AchievementUnlock[];
  isGameScreen?: boolean;
  onDeleteProgress?: () => void;
  /** Phase 5d: current game type (when inside a game) so mechanic-specific
   *  preferences (like Picture Pairs variant) can surface only for the right
   *  game. */
  gameType?: string;
  /** Optional title rendered above the sections (used by the bottom-sheet
   *  shell; desktop dropdown leaves it undefined). */
  heading?: string;
  /** Future-fit hook: Phase 6 paywall may disable Add learner with a tooltip. */
  addLearnerDisabledReason?: string;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="py-1">
    <div className="px-4 pt-2 pb-1 text-[0.65rem] font-black uppercase tracking-wider text-slate-500">
      {title}
    </div>
    <div role="group">{children}</div>
  </div>
);

const rowClass =
  'w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 focus-visible:bg-slate-100 focus-visible:outline-none';

export const SettingsMenuContent: React.FC<SettingsMenuContentProps> = ({
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
  heading,
  addLearnerDisabledReason,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showLearnersMenu, setShowLearnersMenu] = useState(false);
  const [addLearnerOpen, setAddLearnerOpen] = useState(false);
  const [removeLearnerTarget, setRemoveLearnerTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteProgressOpen, setDeleteProgressOpen] = useState(false);
  const currentLocale = getLocale();

  const learners = useGameStore((state) => state.learners);
  const activeLearnerId = useGameStore((state) => state.activeLearnerId);
  const setActiveLearner = useGameStore((state) => state.setActiveLearner);
  const addLearner = useGameStore((state) => state.addLearner);
  const removeLearner = useGameStore((state) => state.removeLearner);

  const handleAddLearnerSubmit = (name: string): void => {
    const id = addLearner({ displayName: name });
    setActiveLearner(id);
    setAddLearnerOpen(false);
  };

  const handleRemoveLearnerConfirm = (): void => {
    if (!removeLearnerTarget) return;
    removeLearner(removeLearnerTarget.id);
    setRemoveLearnerTarget(null);
  };

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

  const handleLanguageChange = (locale: SupportedLocale): void => {
    setLocale(locale);
    setShowLanguageMenu(false);
  };

  const activeLearner = learners.find((l) => l.id === activeLearnerId);

  const hasProgressSection = onShowAchievements || onShowStats || onShowShop;

  return (
    <>
      {heading && (
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <Settings size={16} aria-hidden className="text-slate-500" />
          <span className="text-base font-black text-slate-800">{heading}</span>
        </div>
      )}

      <Section title={formatText(t.menuSpecific.sectionProfile)}>
        <button
          type="button"
          role="menuitem"
          aria-expanded={showLearnersMenu}
          onClick={() => setShowLearnersMenu(!showLearnersMenu)}
          className={`${rowClass} justify-between`}
        >
          <span className="flex items-center gap-2">
            <Users size={16} aria-hidden className="text-slate-600" />
            <span>{formatText(t.menuSpecific.learnersHeading)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-slate-500">
            <span className="max-w-[8rem] truncate">{activeLearner?.displayName ?? ''}</span>
            {showLearnersMenu ? (
              <ChevronDown size={14} aria-hidden />
            ) : (
              <ChevronRight size={14} aria-hidden />
            )}
          </span>
        </button>
        {showLearnersMenu && (
          <div className="bg-slate-50 max-h-48 overflow-y-auto" role="menu">
            {learners.map((l) => (
              <div key={l.id} className="flex items-center">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={l.id === activeLearnerId}
                  onClick={() => {
                    setActiveLearner(l.id);
                    setShowLearnersMenu(false);
                  }}
                  className={`flex-1 px-6 py-2 text-left text-sm hover:bg-slate-100 transition-colors ${
                    l.id === activeLearnerId
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-slate-700'
                  }`}
                >
                  {l.displayName}
                </button>
                {learners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRemoveLearnerTarget({ id: l.id, name: l.displayName })}
                    className="px-3 py-2 hover:bg-red-50 text-red-500 transition-colors"
                    aria-label={formatText(t.menuSpecific.removeLearner)}
                  >
                    <X size={14} aria-hidden />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          role="menuitem"
          onClick={() => setAddLearnerOpen(true)}
          disabled={Boolean(addLearnerDisabledReason)}
          title={addLearnerDisabledReason}
          className={`${rowClass} text-purple-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <UserPlus size={16} aria-hidden />
          <span>{formatText(t.menuSpecific.addLearner)}</span>
        </button>
      </Section>

      {hasProgressSection && (
        <>
          <div className="border-t border-slate-200" aria-hidden />
          <Section title={formatText(t.menuSpecific.sectionProgress)}>
            {onShowAchievements && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onShowAchievements();
                  onClose();
                }}
                className={`${rowClass} justify-between`}
              >
                <span className="flex items-center gap-2">
                  <Award size={16} aria-hidden className="text-amber-600" />
                  <span>{formatText(t.menuSpecific.showAchievements)}</span>
                </span>
                {unlockedAchievements.length > 0 && (
                  <span className="text-sm font-bold text-purple-700">
                    {unlockedAchievements.length}
                  </span>
                )}
              </button>
            )}
            {onShowStats && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onShowStats();
                  onClose();
                }}
                className={rowClass}
              >
                <BarChart3 size={16} aria-hidden className="text-blue-600" />
                <span>{formatText(t.menu.stats)}</span>
              </button>
            )}
            {onShowShop && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onShowShop();
                  onClose();
                }}
                className={rowClass}
              >
                <ShoppingBag size={16} aria-hidden className="text-purple-600" />
                <span>{formatText(t.shop.title)}</span>
              </button>
            )}
          </Section>
        </>
      )}

      <div className="border-t border-slate-200" aria-hidden />
      <Section title={formatText(t.menuSpecific.sectionPreferences)}>
        <button
          type="button"
          role="menuitem"
          aria-expanded={showLanguageMenu}
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className={`${rowClass} justify-between`}
        >
          <span className="flex items-center gap-2">
            <Languages size={16} aria-hidden className="text-slate-600" />
            <span>{formatText(t.menuSpecific.language)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <span aria-hidden>{currentLocale === 'et' ? '🇪🇪' : '🇬🇧'}</span>
            {showLanguageMenu ? (
              <ChevronDown size={14} aria-hidden />
            ) : (
              <ChevronRight size={14} aria-hidden />
            )}
          </span>
        </button>
        {showLanguageMenu && (
          <div className="bg-slate-50" role="menu">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === 'et'}
              onClick={() => handleLanguageChange('et')}
              className={`w-full px-6 py-2 text-left text-sm hover:bg-slate-100 transition-colors ${
                currentLocale === 'et' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700'
              }`}
            >
              <span aria-hidden>🇪🇪 </span>Eesti
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === 'en'}
              onClick={() => handleLanguageChange('en')}
              className={`w-full px-6 py-2 text-left text-sm hover:bg-slate-100 transition-colors ${
                currentLocale === 'en' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700'
              }`}
            >
              <span aria-hidden>🇬🇧 </span>English
            </button>
          </div>
        )}

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onToggleSound();
            onClose();
          }}
          className={rowClass}
        >
          {soundEnabled ? (
            <Volume2 size={16} aria-hidden className="text-slate-600" />
          ) : (
            <VolumeX size={16} aria-hidden className="text-red-500" />
          )}
          <span>
            {formatText(
              soundEnabled ? t.menuSpecific.toggleSoundOff : t.menuSpecific.toggleSoundOn,
            )}
          </span>
        </button>

        {showPicturePairsVariantToggle && (
          <div className="bg-slate-50/70" role="group">
            <div className="px-6 pt-2 pb-1 text-[0.65rem] font-black uppercase tracking-wider text-slate-500">
              {formatText(t.menuSpecific.picturePairsVariantLabel)}
            </div>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={effectiveVariant === 'emoji_only'}
              onClick={() => setMechanicVariant('picture_pairs', 'emoji_only')}
              className={`w-full px-6 py-2 text-left text-sm transition-colors hover:bg-slate-100 ${
                effectiveVariant === 'emoji_only'
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-700'
              }`}
            >
              {formatText(t.menuSpecific.picturePairsVariantEmojiOnly)}
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={effectiveVariant === 'emoji_word'}
              onClick={() => setMechanicVariant('picture_pairs', 'emoji_word')}
              className={`w-full px-6 py-2 text-left text-sm transition-colors hover:bg-slate-100 ${
                effectiveVariant === 'emoji_word'
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-700'
              }`}
            >
              {formatText(t.menuSpecific.picturePairsVariantEmojiWord)}
            </button>
          </div>
        )}
      </Section>

      <div className="border-t border-slate-200" aria-hidden />
      <Section title={formatText(t.menuSpecific.sectionSystem)}>
        {isGameScreen ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onReturnToMenu();
              onClose();
            }}
            className={rowClass}
          >
            <Home size={16} aria-hidden className="text-slate-600" />
            <span>{formatText(t.gameScreen.returnToMenu)}</span>
          </button>
        ) : (
          onDeleteProgress && (
            <button
              type="button"
              role="menuitem"
              onClick={() => setDeleteProgressOpen(true)}
              className={`${rowClass} text-red-600 hover:bg-red-50 focus-visible:bg-red-50`}
            >
              <Trash2 size={16} aria-hidden />
              <span>{formatText(t.menuSpecific.deleteProgress)}</span>
            </button>
          )
        )}
      </Section>

      {addLearnerOpen && (
        <InlinePrompt
          variant="input"
          title={formatText(t.menuSpecific.addLearnerTitle)}
          message={formatText(t.menuSpecific.addLearnerNamePrompt)}
          placeholder={formatText(t.menuSpecific.addLearnerNamePlaceholder)}
          confirmLabel={formatText(t.common.save)}
          cancelLabel={formatText(t.common.cancel)}
          onConfirm={handleAddLearnerSubmit}
          onCancel={() => setAddLearnerOpen(false)}
        />
      )}

      {removeLearnerTarget && (
        <InlinePrompt
          variant="confirm"
          title={formatText(t.menuSpecific.removeLearnerTitle)}
          message={formatText(t.menuSpecific.removeLearnerConfirm).replace(
            '{name}',
            removeLearnerTarget.name,
          )}
          confirmLabel={formatText(t.common.delete)}
          cancelLabel={formatText(t.common.cancel)}
          destructive
          onConfirm={handleRemoveLearnerConfirm}
          onCancel={() => setRemoveLearnerTarget(null)}
        />
      )}

      {deleteProgressOpen && onDeleteProgress && (
        <InlinePrompt
          variant="confirm"
          title={formatText(t.menuSpecific.deleteProgressTitle)}
          message={formatText(t.menuSpecific.deleteProgressConfirm)}
          confirmLabel={formatText(t.common.delete)}
          cancelLabel={formatText(t.common.cancel)}
          destructive
          onConfirm={() => {
            onDeleteProgress();
            setDeleteProgressOpen(false);
            onClose();
          }}
          onCancel={() => setDeleteProgressOpen(false)}
        />
      )}
    </>
  );
};
