/**
 * useGameTips Hook
 *
 * Shows a game's tips as toasts: the first once per session, the rest on
 * replay. `getTipsForGame` is empty for a game whose config sets `tipToast: false`.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from '../games/data';
import type { Translations } from '../i18n';
import { useTranslation } from '../i18n/useTranslation';
import type { Notification } from '../types/notification';

/** The game's tips from the locale, keyed by game id; `[]` when it has none. */
export function getGameTips(t: Translations, gameType: string): string[] {
  const tips = (t.gameScreen.tips as Partial<Record<string, readonly string[]>>)[gameType];
  return tips ? [...tips] : [];
}

export interface UseGameTipsResult {
  getTipsForGame: (gameType: string) => string[];
  handleTipReplay: () => void;
  canReopenTip: boolean;
}

export function useGameTips(
  gameType: string | null,
  problem: unknown,
  notifications: Notification[],
  addNotification: (notification: { type: 'tip'; message: string }) => void,
  isCompactLayout: boolean,
): UseGameTipsResult {
  const t = useTranslation();
  const tipShownOnceRef = useRef(false);
  const currentTipIndexRef = useRef<number>(0);
  const [canReopenTip, setCanReopenTip] = useState(false);

  const getTipsForGame = useCallback(
    (type: string): string[] => (GAME_CONFIG[type]?.tipToast === false ? [] : getGameTips(t, type)),
    [t],
  );

  const handleTipReplay = useCallback(() => {
    if (!gameType) return;
    const hasTipNotification = notifications.some((n) => n.type === 'tip');
    if (hasTipNotification) return;

    const tips = getTipsForGame(gameType);

    if (tips.length === 0) return;

    // Get next tip in cycle
    const tipMessage = tips[currentTipIndexRef.current];
    if (!tipMessage) return;

    // Move to next tip for next time (cycle back to 0 if at end)
    currentTipIndexRef.current = (currentTipIndexRef.current + 1) % tips.length;

    addNotification({
      type: 'tip',
      message: tipMessage,
    });
  }, [addNotification, notifications, gameType, getTipsForGame]);

  // Reset tip state when game type changes
  useEffect(() => {
    tipShownOnceRef.current = false;
    currentTipIndexRef.current = 0;
    const resetTimer = setTimeout(() => setCanReopenTip(false), 0);
    return () => clearTimeout(resetTimer);
  }, [gameType]);

  // Show learning tip only once per session
  useEffect(() => {
    if (!gameType || !problem) {
      return;
    }

    const hasTipNotification = notifications.some((n) => n.type === 'tip');

    if (!tipShownOnceRef.current && !hasTipNotification) {
      const tips = getTipsForGame(gameType);

      if (tips.length > 0) {
        // Start with first tip
        const tipMessage = tips[0];
        if (tipMessage) {
          tipShownOnceRef.current = true;
          // Next time will show tip at index 1
          currentTipIndexRef.current = 1;
          const tipTimer = setTimeout(() => {
            setCanReopenTip(true);
            if (!isCompactLayout) {
              addNotification({
                type: 'tip',
                message: tipMessage,
              });
            }
          }, 0);
          return () => {
            clearTimeout(tipTimer);
          };
        }
      }
    }
    return undefined;
  }, [gameType, problem, notifications, addNotification, getTipsForGame, isCompactLayout]);

  return { getTipsForGame, handleTipReplay, canReopenTip };
}
