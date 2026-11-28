import type { Translations } from '../../i18n';
import { GAME_CONFIG } from '../../games/data';

/** A game's name as the menu shows it. */
export const gameTitle = (t: Translations, gameId: string): string =>
  t.games[gameId as keyof typeof t.games]?.title ?? GAME_CONFIG[gameId]?.title ?? gameId;

/** A path sticker's name. */
export const stickerName = (t: Translations, id: string): string =>
  t.album.stickers[id as keyof typeof t.album.stickers] ?? id;

/** Days in a row with a finished path, as a line. */
export const streakText = (t: Translations, days: number): string =>
  (days === 1 ? t.path.streak_one : t.path.streak_other).replace('{count}', String(days));
