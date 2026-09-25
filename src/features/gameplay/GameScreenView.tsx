import React from 'react';
import { Loader2 } from 'lucide-react';
import { Confetti } from '../../components/shared/Confetti';
import { NotificationSystem } from '../../components/NotificationSystem';
import { TipButton } from '../../components/TipButton';
import { EnhancedConfetti } from '../../components/EnhancedAnimations';
import { ParticleEffect } from '../../components/ParticleEffect';
import { GameHeader, type GameHeaderObjective } from '../../components/GameHeader';
import { GameRenderer } from './GameRenderer';
import type { Direction, Problem } from '../../types/game';
import type { Notification } from '../../types/notification';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';

// playSessionStore's bgClass when no answer flash is showing.
const RESTING_BG_CLASS = 'bg-slate-50';

interface GameScreenViewProps {
  // Background / overlay effects
  bgClass: string;
  confetti: boolean;
  enhancedConfetti: boolean;
  particleActive: boolean;
  onEnhancedConfettiComplete: () => void;

  // Notifications
  notifications: Notification[];
  onNotificationDismiss: (id: string) => void;

  // Header
  score: number;
  stars: number;
  hearts: number;
  levelProgress: { correctAnswers: number; totalAnswers: number } | null;
  levelUpRequirement: number;
  showLevelProgress: boolean;
  showSettingsMenu: boolean;
  settingsMenuRef: React.RefObject<HTMLDivElement>;
  settingsMenuSlot: React.ReactNode;
  onReturnToMenu: () => void;
  onSettingsClick: () => void;
  onShopClick: () => void;

  // HUD actions
  currentLevel: number;
  gameType: string;
  onLevelBadgeClick: () => void;
  onGameNameClick: () => void;

  // Game area
  problem: Problem | null;
  soundEnabled: boolean;
  spendStars: (amount: number) => boolean;
  spendHeart: () => boolean;
  endGame: () => void;
  onAnswer: (
    isCorrect: boolean,
    shouldShowAchievement?: () => boolean,
    options?: { skipHeartDeduction?: boolean },
  ) => void;
  onMove: ((direction: Direction) => void) | undefined;

  // Tip
  onTipReplay: () => void;
  canReopenTip: boolean;
}

export const GameScreenView: React.FC<GameScreenViewProps> = ({
  bgClass,
  confetti,
  enhancedConfetti,
  particleActive,
  onEnhancedConfettiComplete,
  notifications,
  onNotificationDismiss,
  score,
  stars,
  hearts,
  levelProgress,
  levelUpRequirement,
  showLevelProgress,
  showSettingsMenu,
  settingsMenuRef,
  settingsMenuSlot,
  onReturnToMenu,
  onSettingsClick,
  onShopClick,
  currentLevel,
  gameType,
  onLevelBadgeClick,
  onGameNameClick,
  problem,
  soundEnabled,
  spendStars,
  spendHeart,
  endGame,
  onAnswer,
  onMove,
  onTipReplay,
  canReopenTip,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const baseGameType = gameType.replace('_adv', '');
  const tipPlacement = baseGameType === 'shape_dash' ? 'inline' : 'fixed';
  const problemRenderKey =
    problem?.type === 'shape_shift' ? `${problem.uid}:${problem.puzzle.id}` : problem?.uid;
  const gameAndTipClassName =
    tipPlacement === 'inline'
      ? 'w-full flex flex-col items-center gap-3 pb-8'
      : 'w-full flex justify-center pb-8';
  const sessionObjective: GameHeaderObjective | null =
    problem?.type === 'battlelearn'
      ? (() => {
          const totalShips = Math.max(1, problem.ships.length);
          const sunkShips = problem.sunkShips.length;
          const remainingShips = Math.max(0, totalShips - sunkShips);
          return {
            label: formatText(t.battlelearn.shipsRemaining),
            value: `${remainingShips}/${totalShips}`,
            percent: (remainingShips / totalShips) * 100,
            tone: 'blue',
            ariaLabel: `${formatText(t.battlelearn.shipsRemaining)} ${remainingShips}/${totalShips}`,
          };
        })()
      : null;

  // The resting bgClass is the theme; the green/red answer flash overrides only its colour.
  const flashClass = bgClass === RESTING_BG_CLASS ? '' : bgClass;

  return (
    <div
      className={`app-bg flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain font-sans ${flashClass} select-none transition-colors duration-500`}
    >
      {confetti && <Confetti />}
      {enhancedConfetti && (
        <EnhancedConfetti active={enhancedConfetti} onComplete={onEnhancedConfettiComplete} />
      )}
      <ParticleEffect type="success" active={particleActive} />

      <NotificationSystem notifications={notifications} onDismiss={onNotificationDismiss} />

      <GameHeader
        score={score}
        stars={stars}
        hearts={hearts}
        levelProgress={levelProgress}
        levelUpRequirement={levelUpRequirement}
        showLevelProgress={showLevelProgress}
        sessionObjective={sessionObjective}
        onReturnToMenu={onReturnToMenu}
        onSettingsClick={onSettingsClick}
        onShopClick={onShopClick}
        currentLevel={currentLevel}
        gameType={gameType}
        onLevelClick={onLevelBadgeClick}
        onGameNameClick={onGameNameClick}
        showSettingsMenu={showSettingsMenu}
        settingsMenuRef={settingsMenuRef}
      >
        {settingsMenuSlot}
      </GameHeader>

      <div className="flex-1 flex flex-col items-center p-3 max-w-2xl mx-auto w-full relative pb-24 pt-3 sm:p-4 sm:pb-24">
        {!problem ? (
          <Loader2 className="animate-spin mt-20 text-slate-400" size={48} />
        ) : (
          <div key={problemRenderKey} className={gameAndTipClassName}>
            <GameRenderer
              key={`${problem.type}-${problemRenderKey}-${'target' in problem ? problem.target : ''}`}
              gameType={gameType}
              problem={problem}
              onAnswer={onAnswer}
              onMove={onMove}
              soundEnabled={soundEnabled}
              level={currentLevel}
              stars={stars}
              spendStars={spendStars}
              spendHeart={spendHeart}
              endGame={endGame}
            />

            <TipButton
              onTip={onTipReplay}
              soundEnabled={soundEnabled}
              disabled={!canReopenTip}
              placement={tipPlacement}
            />
          </div>
        )}
      </div>
    </div>
  );
};
