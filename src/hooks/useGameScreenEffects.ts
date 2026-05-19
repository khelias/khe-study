import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { usePlaySessionStore } from '../stores/playSessionStore';
import type { Problem } from '../types/game';

interface AdaptiveDifficulty {
  recentAccuracy: boolean[];
  averageResponseTime: number[];
  consecutiveCorrect: number;
  consecutiveWrong: number;
  difficultyMultiplier: number;
  levelAdjustment: number;
}

interface UseGameScreenEffectsParams {
  showSettingsMenu: boolean;
  settingsMenuRef: React.RefObject<HTMLDivElement | null>;
  setShowSettingsMenu: (v: boolean) => void;
  setIsCompactLayout: (v: boolean) => void;
  showGameDescription: boolean;
  setShowGameDescription: (v: boolean) => void;
  hasAutoShownDescriptionRef: React.MutableRefObject<boolean>;
  generateUniqueProblemForGame: (
    gameType: string,
    level: number,
    adaptiveDifficulty: AdaptiveDifficulty,
  ) => Problem | null;
  playClick: () => void;
}

/**
 * Owns the six lifecycle effects the GameScreen container previously inlined:
 * click-outside on the settings popover, compact-layout media query, initial
 * problem generation, level-progress reset on fresh start, first-time auto-open
 * of the game description, and Escape-to-close for that description.
 */
export const useGameScreenEffects = ({
  showSettingsMenu,
  settingsMenuRef,
  setShowSettingsMenu,
  setIsCompactLayout,
  showGameDescription,
  setShowGameDescription,
  hasAutoShownDescriptionRef,
  generateUniqueProblemForGame,
  playClick,
}: UseGameScreenEffectsParams): void => {
  const getLevelForGame = useGameStore((state) => state.getLevelForGame);

  const gameType = usePlaySessionStore((state) => state.gameType);
  const problem = usePlaySessionStore((state) => state.problem);
  const adaptiveDifficulty = usePlaySessionStore((state) => state.adaptiveDifficulty);
  const autoShowGameDescription = usePlaySessionStore((state) => state.autoShowGameDescription);
  const setAutoShowGameDescription = usePlaySessionStore(
    (state) => state.setAutoShowGameDescription,
  );
  const setProblem = usePlaySessionStore((state) => state.setProblem);
  const resetLevelProgress = usePlaySessionStore((state) => state.resetLevelProgress);

  // Settings menu click-outside
  useEffect(() => {
    if (!showSettingsMenu) return;
    const handleClickOutside = (event: MouseEvent): void => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu, settingsMenuRef, setShowSettingsMenu]);

  // Responsive layout detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 639px)');
    const update = (): void => setIsCompactLayout(media.matches);
    update();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, [setIsCompactLayout]);

  // Generate initial problem on mount
  useEffect(() => {
    if (gameType && !problem) {
      const currentLevel = getLevelForGame(gameType);
      const newProblem = generateUniqueProblemForGame(gameType, currentLevel, adaptiveDifficulty);
      setProblem(newProblem);
    }
  }, [
    gameType,
    problem,
    getLevelForGame,
    adaptiveDifficulty,
    generateUniqueProblemForGame,
    setProblem,
  ]);

  // Reset level progress only on fresh start. Do not reset when resuming from game over.
  useEffect(() => {
    if (gameType && !problem) {
      resetLevelProgress();
    }
  }, [gameType, problem, resetLevelProgress]);

  // Auto-show game description on first entry. Defer open to next frame so modal opens after first paint (fixes iOS).
  // Do not cancel rAF in cleanup: clearing the flag re-runs this effect and would cancel the scheduled open.
  useEffect(() => {
    if (!gameType || !problem || !autoShowGameDescription || hasAutoShownDescriptionRef.current)
      return;
    hasAutoShownDescriptionRef.current = true;
    setAutoShowGameDescription(false);
    requestAnimationFrame(() => {
      setShowGameDescription(true);
    });
  }, [
    gameType,
    problem,
    autoShowGameDescription,
    setAutoShowGameDescription,
    setShowGameDescription,
    hasAutoShownDescriptionRef,
  ]);

  // Escape to close the game-description modal
  useEffect(() => {
    if (!showGameDescription) return undefined;
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        playClick();
        setShowGameDescription(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showGameDescription, playClick, setShowGameDescription]);
};
