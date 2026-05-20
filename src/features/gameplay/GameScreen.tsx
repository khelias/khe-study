import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameAudio } from '../../hooks/useGameAudio';
import { useAnswerHandler } from '../../hooks/useAnswerHandler';
import { useGameTips } from '../../hooks/useGameTips';
import { useMathSnakeMovement } from '../../hooks/useMathSnakeMovement';
import { useGameScreenEffects } from '../../hooks/useGameScreenEffects';
import { useUnlockedAchievementCopies } from '../../hooks/useUnlockedAchievementCopies';
import { SettingsMenu } from '../../components/SettingsMenu';
import { calculateLevelUpRequirement } from '../../engine/progression';
import { GAME_CONFIG } from '../../games/data';
import { GameScreenView } from './GameScreenView';
import { GameScreenModalHost } from './GameScreenModalHost';
import { useGameScreenStores } from './useGameScreenStores';
import './gameScreen.css';

export const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  // prettier-ignore
  const {
    getLevelForGame, stars, hearts, stats, soundEnabled, toggleSound, setLevel,
    spendStars, spendHeart, gameType, problem, score, levelProgress, bgClass,
    confetti, enhancedConfetti, particleActive, adaptiveDifficulty, notifications,
    setProblem, returnToMenu, setEnhancedConfetti, endGame, addNotification,
    removeNotification, resetLevelProgress,
  } = useGameScreenStores();

  // Composite hooks
  const { generateUniqueProblemForGame } = useGameEngine();
  const { playClick } = useGameAudio(soundEnabled);
  const { handleAnswer: handleAnswerBase } = useAnswerHandler();
  const handleMathSnakeMove = useMathSnakeMovement();
  const { ids: unlockedAchievementIds, enriched: unlockedAchievements } =
    useUnlockedAchievementCopies();

  // Local UI state
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [showGameDescription, setShowGameDescription] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const hasAutoShownDescriptionRef = useRef(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const achievementShown = notifications.some((n) => n.type === 'achievement');

  const { handleTipReplay, canReopenTip } = useGameTips(
    gameType,
    problem,
    notifications,
    addNotification,
    isCompactLayout,
  );

  useGameScreenEffects({
    showSettingsMenu,
    settingsMenuRef,
    setShowSettingsMenu,
    setIsCompactLayout,
    showGameDescription,
    setShowGameDescription,
    hasAutoShownDescriptionRef,
    generateUniqueProblemForGame,
    playClick,
  });

  // Wrap handleAnswer so games can opt into skipHeartDeduction and the underlying
  // handler can check whether an achievement popup is already visible.
  const handleAnswer = (
    isCorrect: boolean,
    shouldShowAchievement?: () => boolean,
    options?: { skipHeartDeduction?: boolean },
  ): void => {
    handleAnswerBase(isCorrect, shouldShowAchievement ?? (() => !achievementShown), options);
  };

  const handleNotificationDismiss = (id: string): void => {
    const notification = notifications.find((n) => n.id === id);
    removeNotification(id);
    // Level-up: next problem and level record are handled by levelUpOnDismiss in useAnswerHandler.
    // Do not call handleNextLevel() here or we would set the problem twice and double-record level up.
    if (notification?.type === 'levelUp') return;
  };

  const handleLevelChange = (newLevel: number): void => {
    if (!gameType) return;
    setLevel(gameType, newLevel);
    resetLevelProgress();
    const newProblem = generateUniqueProblemForGame(gameType, newLevel, adaptiveDifficulty);
    setProblem(newProblem);
    setShowLevelSelector(false);
  };

  const handleReturnToMenu = (): void => {
    playClick();
    void navigate('/', { replace: true });
    void returnToMenu();
  };

  if (!gameType) return null;

  const currentLevel = getLevelForGame(gameType);

  const settingsMenuSlot = (
    <SettingsMenu
      soundEnabled={soundEnabled}
      gameType={gameType}
      onToggleSound={() => {
        playClick();
        toggleSound();
      }}
      onReturnToMenu={handleReturnToMenu}
      onClose={() => setShowSettingsMenu(false)}
      onShowAchievements={() => setShowAchievements(true)}
      onShowStats={() => setShowStats(true)}
      onShowShop={() => setShowShop(true)}
      unlockedAchievements={unlockedAchievements}
      isGameScreen={true}
    />
  );

  return (
    <>
      <GameScreenView
        bgClass={bgClass}
        confetti={confetti}
        enhancedConfetti={enhancedConfetti}
        particleActive={particleActive}
        onEnhancedConfettiComplete={() => setEnhancedConfetti(false)}
        notifications={notifications}
        onNotificationDismiss={handleNotificationDismiss}
        score={score}
        stars={stars}
        hearts={hearts}
        levelProgress={levelProgress}
        levelUpRequirement={calculateLevelUpRequirement(currentLevel)}
        showLevelProgress={
          GAME_CONFIG[gameType]?.levelUpStrategy !== 'onGameWin' &&
          GAME_CONFIG[gameType]?.sessionMode !== 'continuous'
        }
        showSettingsMenu={showSettingsMenu}
        settingsMenuRef={settingsMenuRef as React.RefObject<HTMLDivElement>}
        settingsMenuSlot={settingsMenuSlot}
        onReturnToMenu={handleReturnToMenu}
        onSettingsClick={() => {
          setShowSettingsMenu(!showSettingsMenu);
          playClick();
        }}
        onShopClick={() => {
          setShowShop(true);
          playClick();
        }}
        currentLevel={currentLevel}
        gameType={gameType}
        onLevelBadgeClick={() => setShowLevelSelector(true)}
        onGameNameClick={() => {
          playClick();
          setShowGameDescription(true);
        }}
        problem={problem}
        soundEnabled={soundEnabled}
        spendStars={spendStars}
        spendHeart={spendHeart}
        endGame={endGame}
        onAnswer={handleAnswer}
        onMove={handleMathSnakeMove}
        onTipReplay={handleTipReplay}
        canReopenTip={canReopenTip}
      />

      <GameScreenModalHost
        showStats={showStats}
        stats={stats}
        unlockedAchievements={unlockedAchievements}
        onCloseStats={() => setShowStats(false)}
        showAchievements={showAchievements}
        unlockedAchievementIds={unlockedAchievementIds}
        onCloseAchievements={() => setShowAchievements(false)}
        showShop={showShop}
        heartsAtZero={hearts <= 0}
        onCloseShop={() => setShowShop(false)}
        showLevelSelector={showLevelSelector}
        currentLevel={currentLevel}
        gameType={gameType}
        onCloseLevelSelector={() => setShowLevelSelector(false)}
        onLevelChange={handleLevelChange}
        showGameDescription={showGameDescription}
        onCloseGameDescription={() => {
          playClick();
          setShowGameDescription(false);
        }}
      />
    </>
  );
};
