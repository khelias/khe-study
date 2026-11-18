import { expect, test as base, type Page } from '@playwright/test';
import { ACHIEVEMENTS } from '../src/engine/achievements';
import { createStats } from '../src/engine/stats';
import { APP_KEY, GAME_CONFIG } from '../src/games/data';

export { expect, type Page };

// The dev server proxies the consent banner to games.khe.ee (estate ADR-019); an empty one keeps
// every spec off the live site.
export const test = base.extend({
  context: async ({ context }, provide) => {
    await context.route('**/assets/analytics-consent.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    await provide(context);
  },
});

/** Seeds the persisted game store and the Estonian locale before every load of the page. */
export function seedStore(page: Page, state: Record<string, unknown> = {}) {
  return page.addInitScript(
    ({ storeKey, seed }) => {
      window.localStorage.setItem(
        storeKey,
        JSON.stringify({ state: { hasSeenTutorial: true, ...seed }, version: 0 }),
      );
      window.localStorage.setItem('app_locale', 'et');
    },
    { storeKey: APP_KEY, seed: state },
  );
}

/** Every game seen and every badge owned, so no first-time sheet or badge covers the play. */
export function seedForPlay(page: Page, hearts = 5) {
  const gameIds = Object.keys(GAME_CONFIG);
  return seedStore(page, {
    hearts,
    stars: 0,
    unlockedAchievements: Object.keys(ACHIEVEMENTS),
    stats: {
      ...createStats(),
      gamesPlayed: gameIds.length,
      gamesByType: Object.fromEntries(gameIds.map((id) => [id, 1])),
    },
  });
}

/** Answers letter-match right five times, which raises the level. */
export async function answerLetterMatchToLevelUp(page: Page): Promise<void> {
  for (let answer = 0; answer < 5; answer++) {
    const letter = (await page.getByTestId('letter-match-prompt').textContent())?.trim() ?? '';
    const option = page
      .locator('[data-testid^="standard-answer-"]')
      .filter({ hasText: new RegExp(`^${letter.toLowerCase()}$`) });
    const clicked = await option.elementHandle();
    await option.click();
    // The game view remounts for each problem, so the tapped button leaves the page.
    if (answer < 4) {
      await expect.poll(() => clicked?.evaluate((el) => el.isConnected)).toBe(false);
    }
  }
}
