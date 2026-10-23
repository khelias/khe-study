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
  /** Current game type (when inside a game) so mechanic-specific
   *  preferences (like Picture Pairs variant) can surface only for the right
   *  game. */
  gameType?: string;
  /** Optional title rendered above the sections (used by the bottom-sheet
   *  shell; desktop dropdown leaves it undefined). */
  heading?: string;
  /** When set, Add learner is disabled and this explains why. */
  addLearnerDisabledReason?: string;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="py-1">
    <div className="fam-label px-4 pb-1 pt-2">{title}</div>
    <div role="group">{children}</div>
  </div>
);

const rowBase =
  'flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-[15px] transition-colors focus-visible:-outline-offset-2';

const rowClass = `${rowBase} text-ink hover:bg-sunken focus-visible:bg-sunken`;

const subRowClass = (current: boolean): string =>
  `flex min-h-11 w-full items-center pl-11 pr-4 py-2 text-left text-sm transition-colors hover:bg-sunken ${
    current ? 'bg-sunken font-semibold text-ink' : 'text-ink-2'
  }`;

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

  const gameId = gameType ?? '';
  const mechanicId = gameId ? getMechanicIdForGame(gameId) : null;
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
        <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
          <Settings size={18} aria-hidden className="text-muted" />
          <span className="fam-heading">{heading}</span>
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
          <span className="flex items-center gap-3">
            <Users size={16} aria-hidden className="text-muted" />
            <span>{formatText(t.menuSpecific.learnersHeading)}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1 text-sm text-muted">
            <span className="max-w-[8rem] truncate">{activeLearner?.displayName ?? ''}</span>
            {showLearnersMenu ? (
              <ChevronDown size={14} aria-hidden />
            ) : (
              <ChevronRight size={14} aria-hidden />
            )}
          </span>
        </button>
        {showLearnersMenu && (
          <div className="max-h-48 overflow-y-auto" role="menu">
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
                  className={`min-w-0 flex-1 ${subRowClass(l.id === activeLearnerId)}`}
                >
                  <span className="truncate">{l.displayName}</span>
                </button>
                {learners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRemoveLearnerTarget({ id: l.id, name: l.displayName })}
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-muted transition-colors hover:bg-bad/10 hover:text-bad"
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
          className={`${rowClass} disabled:cursor-not-allowed disabled:text-muted`}
        >
          <UserPlus size={16} aria-hidden className="text-muted" />
          <span>{formatText(t.menuSpecific.addLearner)}</span>
        </button>
      </Section>

      {hasProgressSection && (
        <>
          <div className="border-t border-rule" aria-hidden />
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
                <span className="flex items-center gap-3">
                  <Award size={16} aria-hidden className="text-muted" />
                  <span>{formatText(t.menuSpecific.showAchievements)}</span>
                </span>
                {unlockedAchievements.length > 0 && (
                  <span className="text-sm tabular-nums text-muted">
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
                <BarChart3 size={16} aria-hidden className="text-muted" />
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
                <ShoppingBag size={16} aria-hidden className="text-muted" />
                <span>{formatText(t.shop.title)}</span>
              </button>
            )}
          </Section>
        </>
      )}

      <div className="border-t border-rule" aria-hidden />
      <Section title={formatText(t.menuSpecific.sectionPreferences)}>
        <button
          type="button"
          role="menuitem"
          aria-expanded={showLanguageMenu}
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className={`${rowClass} justify-between`}
        >
          <span className="flex items-center gap-3">
            <Languages size={16} aria-hidden className="text-muted" />
            <span>{formatText(t.menuSpecific.language)}</span>
          </span>
          <span className="flex items-center gap-1 text-muted">
            <span aria-hidden className="fam-fact">
              {currentLocale === 'et' ? 'ET' : 'EN'}
            </span>
            {showLanguageMenu ? (
              <ChevronDown size={14} aria-hidden />
            ) : (
              <ChevronRight size={14} aria-hidden />
            )}
          </span>
        </button>
        {showLanguageMenu && (
          <div role="menu">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === 'et'}
              onClick={() => handleLanguageChange('et')}
              className={subRowClass(currentLocale === 'et')}
            >
              Eesti
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={currentLocale === 'en'}
              onClick={() => handleLanguageChange('en')}
              className={subRowClass(currentLocale === 'en')}
            >
              English
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
            <Volume2 size={16} aria-hidden className="text-muted" />
          ) : (
            <VolumeX size={16} aria-hidden className="text-muted" />
          )}
          <span>
            {formatText(
              soundEnabled ? t.menuSpecific.toggleSoundOff : t.menuSpecific.toggleSoundOn,
            )}
          </span>
        </button>

        {showPicturePairsVariantToggle && (
          <div role="group">
            <div className="fam-label pb-1 pl-11 pr-4 pt-2">
              {formatText(t.menuSpecific.picturePairsVariantLabel)}
            </div>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={effectiveVariant === 'emoji_only'}
              onClick={() => setMechanicVariant('picture_pairs', 'emoji_only')}
              className={subRowClass(effectiveVariant === 'emoji_only')}
            >
              {formatText(t.menuSpecific.picturePairsVariantEmojiOnly)}
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={effectiveVariant === 'emoji_word'}
              onClick={() => setMechanicVariant('picture_pairs', 'emoji_word')}
              className={subRowClass(effectiveVariant === 'emoji_word')}
            >
              {formatText(t.menuSpecific.picturePairsVariantEmojiWord)}
            </button>
          </div>
        )}
      </Section>

      <div className="border-t border-rule" aria-hidden />
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
            <Home size={16} aria-hidden className="text-muted" />
            <span>{formatText(t.gameScreen.returnToMenu)}</span>
          </button>
        ) : (
          onDeleteProgress && (
            <button
              type="button"
              role="menuitem"
              onClick={() => setDeleteProgressOpen(true)}
              className={`${rowBase} text-bad hover:bg-bad/10 focus-visible:bg-bad/10`}
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
