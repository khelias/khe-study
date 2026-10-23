import { expect, test, type Page } from './fixtures';
import { GAME_CONFIG } from '../src/games/data';
import { gameIdToSlug } from '../src/utils/gameSlug';

const GAME_STORE_KEY = 'smart_adv_v45_pro';
const LOCALE_STORAGE_KEY = 'app_locale';
const GAME_IDS = Object.keys(GAME_CONFIG);
const SEEDED_STORE = seededStoreState(GAME_IDS);

function seededStoreState(gameIds: string[]) {
  return {
    state: {
      hasSeenTutorial: true,
      hearts: 5,
      stats: {
        gamesPlayed: gameIds.length,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalScore: 0,
        maxStreak: 0,
        currentStreak: 0,
        maxLevels: {},
        gamesByType: Object.fromEntries(gameIds.map((id) => [id, 1])),
        totalTimePlayed: 0,
        lastPlayed: null,
        collectedStars: 0,
        maxSnakeLength: 0,
      },
    },
    version: 0,
  };
}

function attachRuntimeFailureCapture(page: Page): {
  consoleErrors: string[];
  pageErrors: string[];
} {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  return { consoleErrors, pageErrors };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({
      storeKey,
      localeKey,
      seededStore,
    }: {
      storeKey: string;
      localeKey: string;
      seededStore: ReturnType<typeof seededStoreState>;
    }) => {
      window.localStorage.setItem(storeKey, JSON.stringify(seededStore));
      window.localStorage.setItem(localeKey, 'et');
    },
    { storeKey: GAME_STORE_KEY, localeKey: LOCALE_STORAGE_KEY, seededStore: SEEDED_STORE },
  );
});

test.describe('smart games — all game route QA', () => {
  for (const gameId of GAME_IDS) {
    test(`${gameId} renders without runtime errors`, async ({ page }) => {
      const failures = attachRuntimeFailureCapture(page);
      const slug = gameIdToSlug(gameId);

      await page.goto(`/study/games/${slug}`);

      await expect(page).toHaveURL(new RegExp(`/study/games/${slug}$`));
      await expect(page.getByRole('button', { name: /kuidas mängida/i })).toBeVisible({
        timeout: 10_000,
      });
      // A continuous session (the fact drill) ignores the level and offers no level control.
      const levelButton = page.getByRole('button', { name: /muuda taset|change level/i });
      if (GAME_CONFIG[gameId]?.sessionMode === 'continuous') {
        await expect(levelButton).toHaveCount(0);
      } else {
        await expect(levelButton).toBeVisible();
      }
      await expect(page.getByText(/Tundmatu mängutüüp|Midagi läks valesti/i)).toHaveCount(0);
      await expect(page.locator('.animate-spin')).toHaveCount(0);

      // Give async effects, timers, and canvas/game-loop setup a short window
      // to surface runtime failures after first paint.
      await page.waitForTimeout(300);

      expect(failures.consoleErrors).toEqual([]);
      expect(failures.pageErrors).toEqual([]);
    });
  }
});
