import React from 'react';
import { Loader2 } from 'lucide-react';
import { NotificationSystem } from '../../components/NotificationSystem';
import { TipButton } from '../../components/TipButton';
import { GameHeader } from '../../components/GameHeader';
import { StreakLine } from '../../components/StreakLine';
import { GameRenderer } from './GameRenderer';
import { gameRegistry } from '../../games/registry';
import '../../games/registrations';
import type { Direction, Problem } from '../../types/game';
import type { AnswerOptions } from '../../hooks/useAnswerHandler';
import type { Notification } from '../../types/notification';
import type { RoundState } from '../../engine/round';
import { useTranslation } from '../../i18n/useTranslation';
import { useProfileText } from '../../hooks/useProfileText';

interface GameScreenViewProps {
  // Notifications
  notifications: Notification[];
  onNotificationDismiss: (id: string) => void;

  // Header
  score: number;
  round: RoundState | null;
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

  // Game area
  problem: Problem | null;
  soundEnabled: boolean;
  stars: number;
  spendStars: (amount: number) => boolean;
  onFailure: () => void;
  onTimeUp: () => void;
  onAnswer: (isCorrect: boolean, options?: AnswerOptions) => void;
  onMove: ((direction: Direction) => void) | undefined;
  paused: boolean;

  // Tip
  onTipReplay: () => void;
  canReopenTip: boolean;
}

export const GameScreenView: React.FC<GameScreenViewProps> = ({
  notifications,
  onNotificationDismiss,
  score,
  round,
  showSettingsMenu,
  settingsMenuRef,
  settingsMenuSlot,
  onReturnToMenu,
  onSettingsClick,
  onShopClick,
  currentLevel,
  gameType,
  onLevelBadgeClick,
  problem,
  soundEnabled,
  stars,
  spendStars,
  onFailure,
  onTimeUp,
  onAnswer,
  onMove,
  paused,
  onTipReplay,
  canReopenTip,
}) => {
  const t = useTranslation();
  const { formatText } = useProfileText();
  const entry = gameRegistry.get(gameType);
  const tipPlacement = entry?.config.tipPlacement ?? 'fixed';
  const immersive = entry?.config.stage === 'immersive';
  const problemRenderKey = problem ? (entry?.renderKey?.(problem) ?? problem.uid) : undefined;
  const gameAndTipClassName =
    tipPlacement === 'inline'
      ? 'w-full flex flex-col items-center gap-3 pb-8'
      : 'w-full flex justify-center pb-8';
  const sessionObjective = problem
    ? (entry?.sessionObjective?.(problem, { t, formatText }) ?? null)
    : null;

  const renderer = problem ? (
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
      onFailure={onFailure}
      onTimeUp={onTimeUp}
      paused={paused}
    />
  ) : null;
  const tip = (placement: 'fixed' | 'inline') => (
    <TipButton
      onTip={onTipReplay}
      soundEnabled={soundEnabled}
      disabled={!canReopenTip}
      placement={placement}
    />
  );

  return (
    <div
      className={`app-bg flex h-full min-h-0 flex-col ${immersive ? 'overflow-hidden' : 'overflow-y-auto'} overflow-x-hidden overscroll-contain font-sans select-none`}
    >
      <NotificationSystem notifications={notifications} onDismiss={onNotificationDismiss} />

      <GameHeader
        score={score}
        stars={stars}
        round={round}
        sessionObjective={sessionObjective}
        onReturnToMenu={onReturnToMenu}
        onSettingsClick={onSettingsClick}
        onShopClick={onShopClick}
        currentLevel={currentLevel}
        gameType={gameType}
        onLevelClick={onLevelBadgeClick}
        showSettingsMenu={showSettingsMenu}
        settingsMenuRef={settingsMenuRef}
      >
        {settingsMenuSlot}
      </GameHeader>

      {immersive ? (
        <div
          data-stage="immersive"
          className="relative min-h-0 w-full flex-1 overflow-hidden pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
        >
          <StreakLine />
          {!problem ? (
            <Loader2 className="animate-spin mx-auto mt-20 text-muted" size={48} />
          ) : (
            <div key={problemRenderKey} className="absolute inset-0">
              {renderer}
              <div data-tip className="absolute right-3 top-1/2 -translate-y-1/2">
                {tip('inline')}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          data-stage="boxed"
          className="light-stage flex-1 flex flex-col items-center p-3 max-w-2xl mx-auto w-full relative pb-24 pt-3 transition-colors duration-500 sm:p-4 sm:pb-24"
        >
          <StreakLine />
          {!problem ? (
            <Loader2 className="animate-spin mt-20 text-muted" size={48} />
          ) : (
            <div key={problemRenderKey} className={gameAndTipClassName}>
              {renderer}
              {tip(tipPlacement)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
