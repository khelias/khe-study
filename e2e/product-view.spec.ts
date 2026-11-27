import { APP_KEY } from '../src/games/data';
import { expect, seedStore, test } from './fixtures';

const HUB = 'https://games.khe.ee/';

test.beforeEach(({ page }) => seedStore(page));

test('opened directly, the app shows its own header and a KHE.ee link in the footer', async ({
  page,
}) => {
  await page.goto('/study/');
  await expect(page.locator('html')).toHaveAttribute('data-khe-view', 'product');
  await expect(page.locator('.site-header__title')).toHaveText('Tarkade mängud');
  await expect(page.locator('.site-header__rooms')).toBeHidden();
  await expect(page.locator('.site-header__brand')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Tume teema' })).toBeVisible();
  await expect(page.locator('.site-footer__home')).toHaveAttribute('href', /^https:\/\/khe\.ee\//);
});

test('arriving from the games hub keeps the KHE frame', async ({ page }) => {
  await page.goto('/study/', { referer: HUB });
  await expect(page.locator('html')).not.toHaveAttribute('data-khe-view', 'product');
  await expect(page.locator('.site-header__rooms')).toBeVisible();
});

test('installed, the app shows its own header even when arriving from the hub', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'standalone', { value: true });
  });
  await page.goto('/study/', { referer: HUB });
  await expect(page.locator('html')).toHaveAttribute('data-khe-view', 'product');
});

// Fresh pages of the context, which the page-scoped seedStore leaves without a stored language.
test('with no language chosen the app opens in Estonian; a link shows its language without choosing it', async ({
  context,
}) => {
  const tab = await context.newPage();
  await tab.goto('/study/');
  await expect(tab.locator('html')).toHaveAttribute('lang', 'et');

  await tab.goto('/study/?lang=en');
  await expect(tab.locator('html')).toHaveAttribute('lang', 'en');
  await tab.goto('/study/');
  await expect(tab.locator('html')).toHaveAttribute('lang', 'et');

  const afterChoice = await context.newPage();
  await afterChoice.addInitScript(() => {
    window.localStorage.setItem('app_locale', 'en');
  });
  await afterChoice.goto('/study/');
  await expect(afterChoice.locator('html')).toHaveAttribute('lang', 'en');
});

test('a linked language stays in the address through a navigation, so a reload keeps it', async ({
  context,
}) => {
  const page = await context.newPage();
  await page.addInitScript((storeKey) => {
    window.localStorage.setItem(
      storeKey,
      JSON.stringify({ state: { hasSeenTutorial: true }, version: 0 }),
    );
  }, APP_KEY);
  await page.goto('/study/?lang=en');
  await page.getByRole('button', { name: /^Scales - / }).click();
  await expect(page).toHaveURL(/\/study\/games\/balance-scale\?lang=en$/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.evaluate(() => window.localStorage.getItem('app_locale'))).toBeNull();
});

test('the shell fills the dynamic viewport and keeps overscroll inside', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/study/');
  const shell = page.locator('.app-bg').first();
  await expect(shell).toBeVisible();
  expect((await shell.boundingBox())?.height).toBe(844);
  const overscroll = await page.evaluate(
    () => getComputedStyle(document.documentElement).overscrollBehaviorY,
  );
  expect(overscroll).toBe('contain');
});
