import type { Translations } from '../i18n';
import type { GameConfig } from '../types/game';

/** The translated difficulty of a game, or null when its config names none. */
export const difficultyLabel = (t: Translations, config: GameConfig | undefined): string | null =>
  config?.difficulty ? (t.difficulty[config.difficulty] ?? config.difficulty) : null;
