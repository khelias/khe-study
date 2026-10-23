import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Hash,
  Star,
  Pencil,
  Heart,
  Trophy,
  HelpCircle,
} from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { useGameAudio } from '../../hooks/useGameAudio';
import { GameCard } from '../../components/GameCard';
import { MechanicCard } from '../../components/MechanicCard';
import { StatsModal } from '../modals/StatsModal';
import { AchievementsModal } from '../modals/AchievementsModal';
import { TutorialModal } from '../modals/TutorialModal';
import { ShopModal } from '../modals/ShopModal';
import { PackPickerModal } from '../modals/PackPickerModal';
import { GAME_CONFIG, CATEGORIES, MECHANICS } from '../../games/data';
import { ACHIEVEMENTS } from '../../engine/achievements';
import { SiteFooter } from '@khelias/ui/react';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { getAchievementCopy } from '../../utils/achievementCopy';
import { SettingsMenu } from '../../components/SettingsMenu';
import { AppModal, AppModalHeader } from '../../components/shared';
import type { AchievementUnlock } from '../../types/achievement';
import { gameIdToSlug } from '../../utils/gameSlug';
import { getLocale } from '../../i18n';
import { getGameCurriculumSummary } from '../../games/curriculumSummary';
import { gameIcon } from '../../components/gameIcons';

const CATEGORY_ICON_MAP = {
  language: BookOpen,
  math: Hash,
  logic: Bot,
  memory: Brain,
};

export const MenuScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const { formatText } = useProfileText();
  const locale = getLocale();
  const stars = useGameStore((state) => state.stars); // Persistent currency
  const hearts = useGameStore((state) => state.hearts); // Persistent global resource
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const stats = useGameStore((state) => state.stats);
  const hasSeenTutorial = useGameStore((state) => state.hasSeenTutorial);
  const getLevelForGame = useGameStore((state) => state.getLevelForGame);
  const getHighScore = useGameStore((state) => state.getHighScore);
  const favouriteGameIds = useGameStore((state) => state.favouriteGameIds);
  const setFavouriteGameIds = useGameStore((state) => state.setFavouriteGameIds);

  const toggleSound = useGameStore((state) => state.toggleSound);
  const resetGame = useGameStore((state) => state.resetGame);
  const markTutorialSeen = useGameStore((state) => state.markTutorialSeen);
  // Game start logic is handled by GameRoute when navigating to /games/:slug

  const { playClick } = useGameAudio(soundEnabled);

  // Hoisted so SettingsMenu + StatsModal share the same converted list
  const unlockedAchievementObjects: AchievementUnlock[] = unlockedAchievements
    .map((id) => {
      const achievement = ACHIEVEMENTS[id];
      if (!achievement) return null;
      const copy = getAchievementCopy(t, achievement.id);
      return {
        id: achievement.id,
        title: copy.title,
        desc: copy.desc,
        icon: achievement.icon,
      };
    })
    .filter((a): a is AchievementUnlock => a !== null);

  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  // Initialize from the ?openShop=true URL hint set by GameResultScreen.
  // The effect below strips the hint from the URL after mount; reading the
  // hint in the initializer avoids a setState-in-effect.
  const [showShop, setShowShop] = useState(
    () =>
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('openShop') === 'true',
  );
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial);
  const [activeMechanicId, setActiveMechanicId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showFavourites, setShowFavourites] = useState(() => favouriteGameIds.length > 0);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEditFavourites, setShowEditFavourites] = useState(false);
  const [editFavouritesDraft, setEditFavouritesDraft] = useState<string[]>([]);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Strip the ?openShop=true hint from the URL after the initial state has
  // already absorbed it (see useState initializer above). Pure URL side-effect,
  // no setState here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openShop') === 'true') {
      window.history.replaceState({}, '', '/');
    }
  }, []);
  const settingsLabel = formatText(t.menu.settings);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  const handleStartGame = (gameType: string) => {
    playClick();

    // Check if player has hearts before starting
    if (hearts <= 0) {
      // Open shop to buy hearts (with flag to show no hearts message)
      setShowShop(true);
      return;
    }

    // Navigate to the game route using URL slug
    const slug = gameIdToSlug(gameType);
    void navigate(`/games/${slug}`);
  };

  const toggleCategory = (categoryId: string) => {
    playClick();
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    markTutorialSeen();
  };

  return (
    <div className="flex h-full min-h-0 flex-col items-center overflow-hidden app-bg font-sans animate-in fade-in">
      {/* Scrollable area so viewport resize (e.g. mobile URL bar) doesn't reset scroll */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        {/* Content area with padding; extra bottom for iOS safe area / browser chrome */}
        <div
          className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-5 sm:pt-6"
          style={{
            paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 1rem)',
          }}
        >
          {/* Modals */}
          {showStats && (
            <StatsModal
              key="stats-modal"
              stats={stats}
              unlockedAchievements={unlockedAchievementObjects}
              onClose={() => setShowStats(false)}
            />
          )}

          {showAchievements && (
            <AchievementsModal
              key="achievements-modal"
              unlockedAchievements={unlockedAchievements}
              stats={stats}
              onClose={() => setShowAchievements(false)}
            />
          )}

          {showShop && (
            <ShopModal
              key="shop-modal"
              onClose={() => setShowShop(false)}
              openedFromNoHearts={hearts <= 0}
            />
          )}

          {showTutorial && <TutorialModal key="tutorial-modal" onClose={handleCloseTutorial} />}

          <div className="w-full mb-4 sm:mb-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h1 className="fam-title">{formatText(t.menuSpecific.heading)}</h1>
                <p className="mt-1 text-[15px] text-ink-2">{t.menuSpecific.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="fam-icon-btn shrink-0"
                  aria-label={formatText(t.menuSpecific.showTutorial)}
                  title={formatText(t.menuSpecific.showTutorial)}
                >
                  <HelpCircle size={18} aria-hidden />
                </button>
                <div className="relative" ref={settingsMenuRef}>
                  <button
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu);
                      playClick();
                    }}
                    aria-label={settingsLabel}
                    className="fam-icon-btn"
                    title={settingsLabel}
                  >
                    {showSettingsMenu ? (
                      <X size={18} aria-hidden />
                    ) : (
                      <Menu size={18} aria-hidden />
                    )}
                  </button>
                  {showSettingsMenu && (
                    <SettingsMenu
                      soundEnabled={soundEnabled}
                      onToggleSound={() => {
                        toggleSound();
                        playClick();
                      }}
                      onReturnToMenu={() => {
                        // Not used in MenuScreen
                      }}
                      onClose={() => setShowSettingsMenu(false)}
                      onShowAchievements={() => {
                        setShowAchievements(true);
                        setShowSettingsMenu(false);
                      }}
                      onShowStats={() => {
                        setShowStats(true);
                        setShowSettingsMenu(false);
                      }}
                      onShowShop={() => {
                        setShowShop(true);
                        setShowSettingsMenu(false);
                      }}
                      unlockedAchievements={unlockedAchievementObjects}
                      isGameScreen={false}
                      onDeleteProgress={() => {
                        resetGame();
                        setShowSettingsMenu(false);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="-ml-2 mt-2 flex flex-wrap items-center gap-x-1">
              <button
                onClick={() => {
                  setShowShop(true);
                  playClick();
                }}
                className="fam-btn-quiet text-sm text-muted"
              >
                <Star size={16} className="fill-star text-star" aria-hidden />
                <span>{formatText(t.menu.stars)}</span>
                <span className="font-semibold tabular-nums text-ink">{stars}</span>
              </button>

              <button
                onClick={() => {
                  setShowAchievements(true);
                  playClick();
                }}
                className="fam-btn-quiet min-w-0 text-sm text-muted"
                title={formatText(t.menuSpecific.showAchievements)}
                aria-label={t.menuSpecific.showAchievements}
              >
                <Trophy size={16} className="text-muted" aria-hidden />
                <span>{formatText(t.menu.achievements)}</span>
                <span className="font-semibold tabular-nums text-ink">
                  {unlockedAchievements.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowShop(true);
                  playClick();
                }}
                className="fam-btn-quiet text-sm text-muted"
              >
                <Heart size={16} className="fill-heart text-heart" aria-hidden />
                <span>{formatText(t.game.hearts)}</span>
                <span className="font-semibold tabular-nums text-ink">{hearts}/5</span>
              </button>
            </div>
          </div>

          {/* Favourites Section */}
          <div className="mb-6 w-full sm:mb-8">
            <div className="fam-row flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  playClick();
                  setShowFavourites(!showFavourites);
                }}
                className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-1 py-2 text-left sm:px-2"
              >
                <Heart className="h-5 w-5 shrink-0 text-muted" aria-hidden />
                <span className="fam-heading min-w-0 truncate">
                  {formatText(t.menu.favourites)}
                </span>
                <span className="text-sm tabular-nums text-muted">{favouriteGameIds.length}</span>
                {showFavourites ? (
                  <ChevronUp className="ml-auto h-5 w-5 shrink-0 text-muted" aria-hidden />
                ) : (
                  <ChevronDown className="ml-auto h-5 w-5 shrink-0 text-muted" aria-hidden />
                )}
              </button>
              <button
                onClick={() => {
                  playClick();
                  setEditFavouritesDraft([...favouriteGameIds]);
                  setShowEditFavourites(true);
                }}
                className="fam-icon-btn shrink-0"
                aria-label={formatText(t.menuSpecific.editFavourites)}
                title={formatText(t.menuSpecific.editFavourites)}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Favourites games grid */}
            {showFavourites && (
              <div className="flex flex-col animate-fadeIn">
                {favouriteGameIds.map((key) => {
                  const conf = GAME_CONFIG[key];
                  if (!conf) return null;
                  const Icon = gameIcon(conf.icon);
                  const gameStats = stats.gamesByType?.[key] || 0;
                  const isNew = gameStats === 0;
                  const currentLevel = getLevelForGame(key);
                  return (
                    <GameCard
                      key={key}
                      gameConfig={{ ...conf, iconComponent: Icon }}
                      level={currentLevel}
                      onClick={() => handleStartGame(key)}
                      badge={isNew ? formatText(t.menuSpecific.newGame) : null}
                      delay={0}
                      highScore={getHighScore(key)}
                      curriculumSummary={getGameCurriculumSummary(key, locale)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Edit Favourites modal */}
          {showEditFavourites && (
            <AppModal
              labelledBy="edit-favourites-title"
              onClose={() => {
                playClick();
                setShowEditFavourites(false);
              }}
              closeOnBackdrop={false}
              size="md"
              scrollable={false}
              contentClassName="flex max-h-[calc(100dvh-2rem)] flex-col"
            >
              <AppModalHeader
                title={formatText(t.menuSpecific.editFavouritesTitle)}
                titleId="edit-favourites-title"
                onClose={() => {
                  playClick();
                  setShowEditFavourites(false);
                }}
                closeLabel={formatText(t.common.close)}
              />
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {Object.values(CATEGORIES).map((category) => {
                  const categoryGames = Object.entries(GAME_CONFIG).filter(
                    ([_key, conf]) => conf.category === category.id,
                  );
                  if (categoryGames.length === 0) return null;
                  const CategoryIcon =
                    CATEGORY_ICON_MAP[category.id as keyof typeof CATEGORY_ICON_MAP] ?? BookOpen;
                  const categoryName = formatText(
                    t.categories[category.id as keyof typeof t.categories]?.name ?? category.name,
                  );
                  return (
                    <div key={category.id} className="mb-4">
                      <div className="fam-label mb-1 flex items-center gap-2 px-1">
                        <CategoryIcon className="h-4 w-4" aria-hidden />
                        <span>{categoryName}</span>
                      </div>
                      {categoryGames.map(([key, conf]) => {
                        const isChecked = editFavouritesDraft.includes(key);
                        const gameName: string =
                          t.games[key as keyof typeof t.games]?.title ?? conf.title;
                        const GameIcon = gameIcon(conf.icon);
                        return (
                          <label
                            key={key}
                            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-sunken"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setEditFavouritesDraft((prev) => prev.filter((id) => id !== key));
                                } else {
                                  setEditFavouritesDraft((prev) => [...prev, key]);
                                }
                              }}
                              className="h-5 w-5 shrink-0 accent-ink"
                            />
                            <GameIcon size={18} className="shrink-0 text-muted" aria-hidden />
                            <span className="min-w-0 break-words text-[15px] font-semibold text-ink">
                              {formatText(gameName)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 border-t border-rule bg-surface p-4">
                <button
                  onClick={() => {
                    playClick();
                    setShowEditFavourites(false);
                  }}
                  className="fam-btn"
                >
                  {formatText(t.common.cancel)}
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setFavouriteGameIds(editFavouritesDraft);
                    setShowEditFavourites(false);
                    if (editFavouritesDraft.length === 0) setShowFavourites(false);
                  }}
                  className="fam-btn fam-btn-primary"
                >
                  {formatText(t.menuSpecific.save)}
                </button>
              </div>
            </AppModal>
          )}

          {/* Games by category - Refined */}
          <div className="w-full pb-6 sm:pb-10">
            <h2 className="fam-label fam-row px-1 pb-2 sm:px-2">
              {formatText(t.menuSpecific.allGames)}
            </h2>
            {Object.values(CATEGORIES).map((category) => {
              // All games appear in their category; favourites also appear in Favourites section
              const categoryGames = Object.entries(GAME_CONFIG).filter(
                ([_key, conf]) => conf.category === category.id,
              );

              if (categoryGames.length === 0) return null;

              // Group consecutive bindings sharing a mechanic into one card.
              // Order is preserved from GAME_CONFIG declaration order.
              const items: Array<
                | { kind: 'mechanic'; mechanicId: string; bindings: typeof categoryGames }
                | { kind: 'solo'; binding: (typeof categoryGames)[number] }
              > = [];
              const seenMechanics = new Set<string>();
              for (const entry of categoryGames) {
                const [, conf] = entry;
                const mechanicId = conf.mechanic;
                if (mechanicId && MECHANICS[mechanicId]) {
                  if (seenMechanics.has(mechanicId)) continue;
                  seenMechanics.add(mechanicId);
                  const bindings = categoryGames.filter(([, c]) => c.mechanic === mechanicId);
                  items.push({ kind: 'mechanic', mechanicId, bindings });
                } else {
                  items.push({ kind: 'solo', binding: entry });
                }
              }

              const isExpanded = expandedCategories[category.id];
              const CategoryIcon =
                CATEGORY_ICON_MAP[category.id as keyof typeof CATEGORY_ICON_MAP] ?? BookOpen;

              return (
                <div key={category.id}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="fam-row flex min-h-14 w-full items-center justify-between gap-3 px-1 py-2 text-left transition-colors hover:bg-sunken active:bg-sunken sm:px-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <CategoryIcon className="h-5 w-5 shrink-0 text-muted" aria-hidden />
                      <span className="fam-heading min-w-0 truncate">
                        {formatText(
                          t.categories[category.id as keyof typeof t.categories]?.name ||
                            category.name,
                        )}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm tabular-nums text-muted">{items.length}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted" aria-hidden />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted" aria-hidden />
                      )}
                    </div>
                  </button>

                  {/* Games grid */}
                  {isExpanded && (
                    <div className="mb-4 flex flex-col animate-fadeIn">
                      {items.map((item, idx) => {
                        if (item.kind === 'mechanic') {
                          const mechanicConf = MECHANICS[item.mechanicId];
                          if (!mechanicConf) return null;
                          const Icon = gameIcon(mechanicConf.icon);
                          const allNew = item.bindings.every(
                            ([k]) => (stats.gamesByType?.[k] || 0) === 0,
                          );
                          return (
                            <MechanicCard
                              key={`mechanic_${item.mechanicId}`}
                              mechanicConfig={{ ...mechanicConf, iconComponent: Icon }}
                              packCount={item.bindings.length}
                              badge={allNew ? formatText(t.menuSpecific.newGame) : null}
                              delay={idx * 50}
                              onClick={() => {
                                playClick();
                                setActiveMechanicId(item.mechanicId);
                              }}
                            />
                          );
                        }
                        const [key, conf] = item.binding;
                        const Icon = gameIcon(conf.icon);
                        const gameStats = stats.gamesByType?.[key] || 0;
                        const isNew = gameStats === 0;
                        const currentLevel = getLevelForGame(key);
                        return (
                          <GameCard
                            key={key}
                            gameConfig={{ ...conf, iconComponent: Icon }}
                            level={currentLevel}
                            onClick={() => handleStartGame(key)}
                            badge={isNew ? formatText(t.menuSpecific.newGame) : null}
                            delay={idx * 50}
                            highScore={getHighScore(key)}
                            curriculumSummary={getGameCurriculumSummary(key, locale)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pack picker, opened from a mechanic card */}
          {activeMechanicId &&
            (() => {
              const mechanicConf = MECHANICS[activeMechanicId];
              if (!mechanicConf) return null;
              const bindings = Object.entries(GAME_CONFIG)
                .filter(([, conf]) => conf.mechanic === activeMechanicId)
                .map(([key, conf]) => {
                  const Icon = gameIcon(conf.icon);
                  const gameStats = stats.gamesByType?.[key] || 0;
                  return {
                    config: conf,
                    iconComponent: Icon,
                    level: getLevelForGame(key),
                    highScore: getHighScore(key),
                    isNew: gameStats === 0,
                    curriculumSummary: getGameCurriculumSummary(key, locale),
                  };
                });
              return (
                <PackPickerModal
                  key={`pack-picker-${activeMechanicId}`}
                  mechanicConfig={mechanicConf}
                  bindings={bindings}
                  onSelect={(gameId) => {
                    setActiveMechanicId(null);
                    handleStartGame(gameId);
                  }}
                  onClose={() => setActiveMechanicId(null)}
                />
              );
            })()}

          <SiteFooter
            label={t.siteFooter.linksLabel}
            links={[
              { label: 'GitHub', href: 'https://github.com/khelias/khe-study', icon: 'github' },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/kaido-henrik-elias/',
                icon: 'linkedin',
              },
              { label: t.siteFooter.privacy, href: `/privacy?lang=${locale}` },
            ]}
            lines={[{ text: t.siteFooter.hosting }]}
          />
        </div>
      </div>
    </div>
  );
};
