import { test, expect } from './fixtures';

/**
 * Phase 0 safety-net smoke tests.
 *
 * Three flows that exercise the shell without leaning on deep game logic,
 * so they survive content changes (curriculum migration, theme swaps) and
 * catch regressions from the bigger structural refactors planned in
 * ROADMAP.md (GameScreen decomposition, Skill × Mechanic × Content
 * decoupling, backend sync).
 *
 * The tests target the default Estonian locale because that's what a
 * freshly loaded app renders. If a future change moves to English-default
 * or adds a locale picker on first load, update selectors here.
 */

const GAME_STORE_KEY = 'smart_adv_v45_pro';
const LOCALE_STORAGE_KEY = 'app_locale';

/**
 * Pre-seed `hasSeenTutorial: true` so the first-run welcome modal never
 * opens. Without this, the modal's backdrop intercepts every click.
 * Zustand's persist middleware merges this partial state with defaults
 * on rehydrate, so we don't need to list every field.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ storeKey, localeKey }: { storeKey: string; localeKey: string }) => {
      window.localStorage.setItem(
        storeKey,
        JSON.stringify({ state: { hasSeenTutorial: true }, version: 0 }),
      );
      window.localStorage.setItem(localeKey, 'et');
    },
    { storeKey: GAME_STORE_KEY, localeKey: LOCALE_STORAGE_KEY },
  );
});

test.describe('smart games — smoke', () => {
  test('menu loads with learner progress and at least one game card', async ({ page }) => {
    await page.goto('/study/');

    // A first visit has no favourites, so the menu lists every game and no Lemmikud pill.
    await expect(page.getByRole('button', { name: /^Kaalud - / })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lemmikud' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Muuda lemmikuid/i })).toBeVisible();
  });

  test('the header rooms button opens the rooms list with Games current', async ({ page }) => {
    await page.goto('/study/', { referer: 'https://games.khe.ee/' });

    const rooms = page.locator('#khe-rooms');
    await expect(rooms).toBeHidden();
    await page.getByRole('button', { name: /^Mängud ?, Toad$/ }).click();
    await expect(rooms).toBeVisible();
    await expect(rooms.getByRole('link')).toHaveCount(7);
    const current = rooms.locator('[aria-current="true"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAttribute('data-khe-room', 'games');
    await expect(current).toHaveAttribute('href', 'https://games.khe.ee/?lang=et');

    await page.keyboard.press('Escape');
    await expect(rooms).toBeHidden();
  });

  test('a subject pill shows its games without age-tier filtering', async ({ page }) => {
    await page.goto('/study/');

    await page.getByRole('button', { name: 'Keelemängud' }).click();

    // Syllable Builder used to be hidden behind the 5+ profile tier. The menu
    // now lists games from the learner-progress view instead of profile filters.
    await expect(page.getByRole('button', { name: /SILBIMEISTER/i })).toBeVisible();
  });

  test('clicking a game card navigates to game route and shows game UI', async ({ page }) => {
    await page.goto('/study/');

    await page.getByRole('button', { name: /^Kaalud - / }).click();

    // Route changed to /games/<slug>, and the tab names the game.
    await expect(page).toHaveURL(/\/study\/games\/balance-scale/);
    await expect(page).toHaveTitle('Kaalud | Tarkade mängud');

    // A game-screen chrome element is present (level badge has a stable aria-label).
    await expect(page.getByRole('button', { name: /muuda taset|change level/i })).toBeVisible();
  });

  test('the back button leaves a game for the menu in one step', async ({ page }) => {
    await page.goto('/study/');
    await page.getByRole('button', { name: /^Kaalud - / }).click();
    await expect(page.getByRole('button', { name: /muuda taset|change level/i })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/study\/(\?.*)?$/);
    await expect(page.getByRole('button', { name: /^Kaalud - / })).toBeVisible();
    await expect(page).toHaveTitle('Tarkade mängud | KHE Games');
  });

  test('balance_scale: clicking an answer records the attempt in stats', async ({ page }) => {
    await page.goto('/study/games/balance-scale');

    // Wait for the 3-column answer grid to render an active option.
    // Disabled options render as <div aria-hidden>, so :not([disabled]) selects live ones.
    const answerBtn = page.locator('div.grid.grid-cols-3 > button:not([disabled])').first();
    await expect(answerBtn).toBeVisible({ timeout: 10_000 });

    // Click any answer. Whether correct or wrong, the engine calls recordAnswer
    // which increments stats.correctAnswers or stats.wrongAnswers. We only care
    // that the answer-handling path runs end-to-end.
    await answerBtn.click();

    // Poll persisted zustand state for the stat increment. Keeps the assertion
    // independent of RNG (we don't know whether the click was correct) and
    // independent of transient UI animations.
    await page.waitForFunction(
      (storeKey) => {
        const raw = window.localStorage.getItem(storeKey);
        if (!raw) return false;
        try {
          const parsed = JSON.parse(raw) as {
            state?: {
              activeLearnerProfile?: {
                meta?: { stats?: { correctAnswers?: number; wrongAnswers?: number } };
              };
            };
          };
          const stats = parsed.state?.activeLearnerProfile?.meta?.stats;
          return (stats?.correctAnswers ?? 0) + (stats?.wrongAnswers ?? 0) > 0;
        } catch {
          return false;
        }
      },
      GAME_STORE_KEY,
      { timeout: 10_000 },
    );
  });
});
