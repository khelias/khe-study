import { expect, test as base, type Page } from '@playwright/test';
import { ACHIEVEMENTS } from '../src/engine/achievements';
import { createStats } from '../src/engine/stats';
import { createLearnerProfileFromLegacyProgress } from '../src/learner';
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

/**
 * Seeds the persisted game store and the Estonian locale before every load of the page, or with
 * `once` only on the tab's first load, so a reload keeps what the page stored.
 */
export function seedStore(
  page: Page,
  state: Record<string, unknown> = {},
  { once = false }: { once?: boolean } = {},
) {
  return page.addInitScript(
    ({ storeKey, seed, once }) => {
      if (once && window.sessionStorage.getItem('e2e_seeded')) return;
      window.sessionStorage.setItem('e2e_seeded', '1');
      window.localStorage.setItem(
        storeKey,
        JSON.stringify({ state: { hasSeenTutorial: true, ...seed }, version: 0 }),
      );
      window.localStorage.setItem('app_locale', 'et');
    },
    { storeKey: APP_KEY, seed: state, once },
  );
}

/** Every game seen and every badge owned, so no first-time sheet or badge covers the play. */
export function seedForPlay(page: Page, extra: Record<string, unknown> = {}) {
  const gameIds = Object.keys(GAME_CONFIG);
  return seedStore(page, {
    stars: 0,
    unlockedAchievements: Object.keys(ACHIEVEMENTS),
    stats: {
      ...createStats(),
      gamesPlayed: gameIds.length,
      gamesByType: Object.fromEntries(gameIds.map((id) => [id, 1])),
    },
    ...extra,
  });
}

/** A fresh learner profile, as the store keeps it. */
export function learnerProfile(displayName = 'Learner', id?: string) {
  return createLearnerProfileFromLegacyProgress({
    id,
    displayName,
    legacyProfileId: '__active__',
    levelsByProfile: { __active__: {} },
    locale: 'et',
    now: 0,
  });
}

/** A learner with `roundsReached` rounds won at level 1 of a mechanic, as the store keeps it. */
export function learnerWithRounds(mechanicId: string, roundsReached: number) {
  const base = learnerProfile();
  const learner = {
    ...base,
    mechanicPreference: {
      [mechanicId]: { mechanicId, difficulty: 1, highestLevel: 1, roundsReached, lastUpdatedAt: 0 },
    },
  };
  return { learners: [learner], activeLearnerId: learner.id, activeLearnerProfile: learner };
}

/** Answers letter-match right `times` times. */
export async function answerLetterMatch(page: Page, times: number): Promise<void> {
  for (let answer = 0; answer < times; answer++) {
    const letter = (await page.getByTestId('letter-match-prompt').textContent())?.trim() ?? '';
    const option = page
      .locator('[data-testid^="standard-answer-"]')
      .filter({ hasText: new RegExp(`^${letter.toLowerCase()}$`) });
    const clicked = await option.elementHandle();
    await option.click();
    // The game view remounts for each problem, so the tapped button leaves the page.
    if (answer < times - 1) {
      await expect.poll(() => clicked?.evaluate((el) => el.isConnected)).toBe(false);
    }
  }
}

/** Letter Match's round: eight letters. */
export const LETTER_MATCH_ROUND = 8;
