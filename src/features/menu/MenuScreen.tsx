import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  BookOpen,
  Bot,
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
import type { MenuEntryLayout } from '../../components/MenuEntry';
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
import type { GameConfig, MechanicConfig } from '../../types/game';
import { gameIdToSlug } from '../../utils/gameSlug';
import { getLocale } from '../../i18n';
import { getGameCurriculumSummary } from '../../games/curriculumSummary';
import { gameIcon } from '../../components/gameIcons';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const CATEGORY_ICON_MAP = {
  language: BookOpen,
  math: Hash,
  logic: Bot,
  memory: Brain,
};

type MenuItem =
  | { kind: 'mechanic'; mechanic: MechanicConfig; packCount: number }
  | { kind: 'game'; game: GameConfig };

/**
 * A category's menu entries in GAME_CONFIG order, with the bindings that share a mechanic
 * grouped into one mechanic card where the first of them stands.
 */
function categoryItems(categoryId: string): MenuItem[] {
  const games = Object.values(GAME_CONFIG).filter((conf) => conf.category === categoryId);
  const items: MenuItem[] = [];
  const seenMechanics = new Set<string>();
  for (const game of games) {
    const mechanic = game.mechanic ? MECHANICS[game.mechanic] : undefined;
    if (!mechanic) {
      items.push({ kind: 'game', game });
    } else if (!seenMechanics.has(mechanic.id)) {
      seenMechanics.add(mechanic.id);
      const packCount = games.filter((c) => c.mechanic === mechanic.id).length;
      items.push({ kind: 'mechanic', mechanic, packCount });
    }
  }
  return items;
}

const CATEGORY_ITEMS = Object.values(CATEGORIES)
  .map((category) => ({ category, items: categoryItems(category.id) }))
  .filter(({ items }) => items.length > 0);

const ALL_FILTER = 'all';
const FAVOURITES_FILTER = 'favourites';

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
  const isDesktop = useMediaQuery('(min-width: 768px)');
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
  const [filterId, setFilterId] = useState(ALL_FILTER);
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

  const categorySections = CATEGORY_ITEMS.map(({ category, items }) => ({
    id: category.id,
    name: formatText(t.categories[category.id as keyof typeof t.categories]?.name ?? category.name),
    items,
  }));
  const favouriteItems = favouriteGameIds.flatMap((gameId): MenuItem[] => {
    const game = GAME_CONFIG[gameId];
    return game ? [{ kind: 'game', game }] : [];
  });

  const filters = [
    { id: ALL_FILTER, label: formatText(t.menuSpecific.allFilter) },
    ...(favouriteItems.length > 0
      ? [{ id: FAVOURITES_FILTER, label: formatText(t.menu.favourites) }]
      : []),
    ...categorySections.map((section) => ({ id: section.id, label: section.name })),
  ];
  // A favourites filter left from a store change elsewhere falls back to every game.
  const activeFilter = filters.some((filter) => filter.id === filterId) ? filterId : ALL_FILTER;
  const tileItems =
    activeFilter === ALL_FILTER
      ? categorySections.flatMap((section) => section.items)
      : activeFilter === FAVOURITES_FILTER
        ? favouriteItems
        : (categorySections.find((section) => section.id === activeFilter)?.items ?? []);

  const renderItem = (item: MenuItem, layout: MenuEntryLayout, delay: number) => {
    if (item.kind === 'mechanic') {
      return (
        <MechanicCard
          key={`mechanic_${item.mechanic.id}`}
          mechanicConfig={item.mechanic}
          packCount={item.packCount}
          layout={layout}
          delay={delay}
          onClick={() => {
            playClick();
            setActiveMechanicId(item.mechanic.id);
          }}
        />
      );
    }
    return (
      <GameCard
        key={item.game.id}
        gameConfig={item.game}
        level={getLevelForGame(item.game.id)}
        layout={layout}
        delay={delay}
        onClick={() => handleStartGame(item.game.id)}
      />
    );
  };

  const editFavouritesButton = (
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
  );

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
          className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-5 sm:pt-6 md:max-w-5xl"
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

          {isDesktop ? (
            <>
              <nav
                aria-label={formatText(t.menuSpecific.subjects)}
                className="mb-6 flex w-full flex-wrap items-center gap-2"
              >
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={activeFilter === filter.id}
                    onClick={() => {
                      playClick();
                      setFilterId(filter.id);
                    }}
                    className="fam-chip"
                  >
                    {filter.label}
                  </button>
                ))}
                {editFavouritesButton}
              </nav>
              <div className="grid w-full grid-cols-3 gap-x-3 gap-y-5 pb-10 lg:grid-cols-4">
                {tileItems.map((item, idx) => renderItem(item, 'tile', idx * 20))}
              </div>
            </>
          ) : (
            <div className="w-full pb-6">
              <section className="mb-6">
                <div className="flex items-center justify-between gap-3 border-b border-rule pb-1">
                  <h2 className="fam-label">{formatText(t.menu.favourites)}</h2>
                  {editFavouritesButton}
                </div>
                {favouriteItems.map((item, idx) => renderItem(item, 'row', idx * 50))}
              </section>
              {categorySections.map(({ id, name, items }) => (
                <section key={id} className="mb-6">
                  <h2 className="fam-label border-b border-rule pb-2">{name}</h2>
                  {items.map((item, idx) => renderItem(item, 'row', idx * 50))}
                </section>
              ))}
            </div>
          )}

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
                {categorySections.map(({ id, name }) => {
                  const categoryGames = Object.entries(GAME_CONFIG).filter(
                    ([_key, conf]) => conf.category === id,
                  );
                  const CategoryIcon =
                    CATEGORY_ICON_MAP[id as keyof typeof CATEGORY_ICON_MAP] ?? BookOpen;
                  return (
                    <div key={id} className="mb-4">
                      <div className="fam-label mb-1 flex items-center gap-2 px-1">
                        <CategoryIcon className="h-4 w-4" aria-hidden />
                        <span>{name}</span>
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
                    if (editFavouritesDraft.length === 0) setFilterId(ALL_FILTER);
                  }}
                  className="fam-btn fam-btn-primary"
                >
                  {formatText(t.menuSpecific.save)}
                </button>
              </div>
            </AppModal>
          )}

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
