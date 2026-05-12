import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Type,
  Brain,
  Scale,
  BookOpen,
  GraduationCap,
  TrainFront,
  Bot,
  Clock3,
  Ruler,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Hash,
  FileText,
  Layers,
  Search,
  Star,
  Anchor,
  Pencil,
  Heart,
  Trophy,
  HelpCircle,
  Sparkles,
  Zap,
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
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';
import { getAchievementCopy } from '../../utils/achievementCopy';
import { SettingsMenu } from '../../components/SettingsMenu';
import { AppModal, AppModalHeader } from '../../components/shared';
import type { AchievementUnlock } from '../../types/achievement';
import { gameIdToSlug } from '../../utils/gameSlug';
import { getLocale } from '../../i18n';
import { getGameCurriculumSummary } from '../../games/curriculumSummary';

const ICON_MAP = {
  Type,
  Brain,
  Scale,
  BookOpen,
  GraduationCap,
  TrainFront,
  Bot,
  Clock3,
  Ruler,
  Gamepad2,
  Hash,
  FileText,
  Layers,
  Search,
  Star,
  Anchor,
  Sparkles,
  Zap,
};

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
    <div className="flex h-full min-h-0 flex-col items-center overflow-hidden bg-slate-50 font-sans animate-in fade-in">
      {/* Scrollable area so viewport resize (e.g. mobile URL bar) doesn't reset scroll */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        {/* Content area with padding; extra bottom for iOS safe area / browser chrome */}
        <div
          className="w-full max-w-5xl mx-auto px-3 sm:px-4 pt-5 sm:pt-6 flex flex-col items-center"
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
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-normal">
                  {formatText(t.menuSpecific.heading)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  {t.menuSpecific.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
                  aria-label={formatText(t.menuSpecific.showTutorial)}
                  title={formatText(t.menuSpecific.showTutorial)}
                >
                  <HelpCircle size={20} aria-hidden />
                </button>
                <div className="relative" ref={settingsMenuRef}>
                  <button
                    onClick={() => {
                      setShowSettingsMenu(!showSettingsMenu);
                      playClick();
                    }}
                    aria-label={settingsLabel}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 active:scale-95"
                    title={settingsLabel}
                  >
                    {showSettingsMenu ? (
                      <X size={18} className="text-slate-600" />
                    ) : (
                      <Menu size={18} className="text-slate-600" />
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

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200 pt-2">
              <button
                onClick={() => {
                  setShowShop(true);
                  playClick();
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 text-[0.72rem] font-bold text-slate-600 shadow-sm transition-colors hover:border-amber-300 hover:bg-white hover:text-slate-900 sm:text-xs"
              >
                <Star size={14} className="fill-yellow-400 text-yellow-600" aria-hidden />
                <span>{formatText(t.menu.stars)}</span>
                <span className="font-black text-slate-900">{stars}</span>
              </button>

              <button
                onClick={() => {
                  setShowAchievements(true);
                  playClick();
                }}
                className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 text-[0.72rem] font-bold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 sm:text-xs"
                title={formatText(t.menuSpecific.showAchievements)}
                aria-label={t.menuSpecific.showAchievements}
              >
                <Trophy size={14} className="text-amber-600" aria-hidden />
                <span>{formatText(t.menu.achievements)}</span>
                <span className="font-black text-slate-900">{unlockedAchievements.length}</span>
              </button>

              <button
                onClick={() => {
                  setShowShop(true);
                  playClick();
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-2.5 text-[0.72rem] font-bold text-slate-600 shadow-sm transition-colors hover:border-rose-300 hover:bg-white hover:text-slate-900 sm:text-xs"
              >
                <Heart size={14} className="fill-red-500 text-red-500" aria-hidden />
                <span>{formatText(t.game.hearts)}</span>
                <span className="font-black text-slate-900">{hearts}/5</span>
              </button>
            </div>
          </div>

          {/* Favourites Section */}
          <div className="w-full mb-5 sm:mb-6">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <button
                onClick={() => {
                  playClick();
                  setShowFavourites(!showFavourites);
                }}
                className="inline-flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-white"
              >
                <Heart className="w-5 h-5 shrink-0 text-rose-500" aria-hidden />
                <span className="truncate text-sm font-black text-slate-800 sm:text-base">
                  {formatText(t.menu.favourites)}
                </span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-black text-slate-500">
                  {favouriteGameIds.length}
                </span>
                {showFavourites ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                )}
              </button>
              <button
                onClick={() => {
                  playClick();
                  setEditFavouritesDraft([...favouriteGameIds]);
                  setShowEditFavourites(true);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                aria-label={formatText(t.menuSpecific.editFavourites)}
                title={formatText(t.menuSpecific.editFavourites)}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Favourites games grid */}
            {showFavourites && (
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3 animate-fadeIn sm:gap-3">
                {favouriteGameIds.map((key) => {
                  const conf = GAME_CONFIG[key];
                  if (!conf) return null;
                  const Icon = ICON_MAP[conf.icon as keyof typeof ICON_MAP] || Type;
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
                      <div className="flex items-center gap-2 mb-2 px-1 text-slate-500 text-sm font-semibold">
                        <CategoryIcon className="w-4 h-4" aria-hidden />
                        <span>{categoryName}</span>
                      </div>
                      {categoryGames.map(([key, conf]) => {
                        const isChecked = editFavouritesDraft.includes(key);
                        const gameName: string =
                          t.games[key as keyof typeof t.games]?.title ?? conf.title;
                        const GameIcon = ICON_MAP[conf.icon as keyof typeof ICON_MAP] || Type;
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 cursor-pointer"
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
                              className="w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${conf.theme.iconBg} ${conf.theme.text}`}
                              aria-hidden
                            >
                              <GameIcon size={18} />
                            </span>
                            <span className="font-semibold text-slate-800">
                              {formatText(gameName)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-200 bg-white p-4">
                <button
                  onClick={() => {
                    playClick();
                    setShowEditFavourites(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  {formatText(t.menuSpecific.save)}
                </button>
              </div>
            </AppModal>
          )}

          {/* Games by category - Refined */}
          <div className="w-full pb-6 sm:pb-10">
            <div className="mb-2 px-1">
              <h2 className="text-xs font-black uppercase tracking-wide text-slate-500">
                {formatText(t.menuSpecific.allGames)}
              </h2>
            </div>
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
                <div key={category.id} className="mb-2.5 sm:mb-3">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 sm:px-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <CategoryIcon className="w-5 h-5 text-slate-500" aria-hidden />
                      <span className="font-bold text-sm sm:text-base text-slate-700">
                        {formatText(
                          t.categories[category.id as keyof typeof t.categories]?.name ||
                            category.name,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded-md">
                        {items.length}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      )}
                    </div>
                  </button>

                  {/* Games grid */}
                  {isExpanded && (
                    <div className="grid grid-cols-1 gap-2.5 mt-2.5 md:grid-cols-2 xl:grid-cols-3 animate-fadeIn sm:gap-3">
                      {items.map((item, idx) => {
                        if (item.kind === 'mechanic') {
                          const mechanicConf = MECHANICS[item.mechanicId];
                          if (!mechanicConf) return null;
                          const Icon = ICON_MAP[mechanicConf.icon as keyof typeof ICON_MAP] || Type;
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
                        const Icon = ICON_MAP[conf.icon as keyof typeof ICON_MAP] || Type;
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

          {/* Pack picker — opened from a mechanic card */}
          {activeMechanicId &&
            (() => {
              const mechanicConf = MECHANICS[activeMechanicId];
              if (!mechanicConf) return null;
              const bindings = Object.entries(GAME_CONFIG)
                .filter(([, conf]) => conf.mechanic === activeMechanicId)
                .map(([key, conf]) => {
                  const Icon = ICON_MAP[conf.icon as keyof typeof ICON_MAP] || Type;
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

          {/* Shared footer — matches launcher (games.khe.ee) and adventure */}
          <footer className="w-full pt-6 pb-4 text-center text-[0.7rem] tracking-wider font-light text-slate-400">
            Self-hosted in Tallinn
            <span className="mx-2 opacity-50">·</span>
            <a
              href={`/privacy?lang=${locale}`}
              className="text-slate-400 hover:text-slate-600 transition-colors no-underline"
            >
              Privacy
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};
