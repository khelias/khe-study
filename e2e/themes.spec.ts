import { test, expect, type Page } from '@playwright/test';

const GAME_STORE_KEY = 'smart_adv_v45_pro';
const LOCALE_STORAGE_KEY = 'app_locale';
const SEEDED_FLAG = 'e2e_themes_seeded';

const CLASSIC_BG = '#f8fafc';
const SEA_BG = '#e0f2fe';

// Seed once per tab: addInitScript reruns on reload and would otherwise wipe
// the purchase this test is checking survives.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ storeKey, localeKey, flag }: { storeKey: string; localeKey: string; flag: string }) => {
      if (window.sessionStorage.getItem(flag)) return;
      window.sessionStorage.setItem(flag, '1');
      window.localStorage.setItem(
        storeKey,
        JSON.stringify({ state: { hasSeenTutorial: true, stars: 100 }, version: 0 }),
      );
      window.localStorage.setItem(localeKey, 'et');
    },
    { storeKey: GAME_STORE_KEY, localeKey: LOCALE_STORAGE_KEY, flag: SEEDED_FLAG },
  );
});

async function appBg(page: Page): Promise<string> {
  return page.evaluate(() => document.documentElement.style.getPropertyValue('--app-bg').trim());
}

async function appBgImage(page: Page): Promise<string> {
  return page
    .locator('.app-bg')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundImage);
}

async function openShop(page: Page) {
  await page.goto('/study/?openShop=true');
  await expect(page.getByRole('heading', { name: 'Teemad' })).toBeVisible();
}

test('buying a theme applies it at once and keeps it after reload', async ({ page }) => {
  await openShop(page);
  expect(await appBg(page)).toBe(CLASSIC_BG);
  expect(await appBgImage(page)).toBe('none');

  await page.getByRole('button', { name: 'Osta teema Meri, hind 30 tähte' }).click();

  await expect(page.getByRole('button', { name: 'Teema Meri on kasutusel' })).toBeDisabled();
  expect(await appBg(page)).toBe(SEA_BG);
  expect(await appBgImage(page)).not.toBe('none');

  await page.reload();
  await expect.poll(() => appBg(page)).toBe(SEA_BG);
  expect(await appBgImage(page)).not.toBe('none');

  await openShop(page);
  await page.getByRole('button', { name: 'Kasuta teemat Klassikaline' }).click();

  await expect(
    page.getByRole('button', { name: 'Teema Klassikaline on kasutusel' }),
  ).toBeDisabled();
  expect(await appBg(page)).toBe(CLASSIC_BG);
  expect(await appBgImage(page)).toBe('none');
});
