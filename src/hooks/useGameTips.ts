/**
 * useGameTips Hook
 *
 * A game's tips as toasts, one per press of the tip button, never on their own
 * at the start. `getTipsForGame` is empty for a game whose config sets
 * `tipToast: false`.
 */

import { useCallback, useState } from 'react';
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
  notifications: Notification[],
  addNotification: (notification: { type: 'tip'; message: string }) => void,
): UseGameTipsResult {
  const t = useTranslation();
  // The next tip of this game; another game starts from its first.
  const [next, setNext] = useState({ gameType, index: 0 });
  const nextIndex = next.gameType === gameType ? next.index : 0;

  const getTipsForGame = useCallback(
    (type: string): string[] => (GAME_CONFIG[type]?.tipToast === false ? [] : getGameTips(t, type)),
    [t],
  );

  const handleTipReplay = useCallback(() => {
    if (!gameType || notifications.some((n) => n.type === 'tip')) return;
    const tips = getTipsForGame(gameType);
    const tipMessage = tips[nextIndex];
    if (!tipMessage) return;
    setNext({ gameType, index: (nextIndex + 1) % tips.length });
    addNotification({ type: 'tip', message: tipMessage });
  }, [addNotification, notifications, gameType, getTipsForGame, nextIndex]);

  const canReopenTip = gameType !== null && getTipsForGame(gameType).length > 0;

  return { getTipsForGame, handleTipReplay, canReopenTip };
}
