import { expect, seedStore, test } from './fixtures';

const HUB = 'https://games.khe.ee/';

test.beforeEach(({ page }) => seedStore(page));

test('opened directly, the app shows its own header and a KHE.ee link in the footer', async ({
  page,
}) => {
  await page.goto('/study/');
  await expect(page.locator('html')).toHaveAttribute('data-khe-view', 'product');
  await expect(page.locator('.site-header__title')).toHaveText('Tarkade Mängud');
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
test('installed with no language chosen, the app opens in Estonian; a browser tab and a chosen language keep theirs', async ({
  context,
}) => {
  const tab = await context.newPage();
  await tab.goto('/study/');
  await expect(tab.locator('html')).toHaveAttribute('lang', 'en');

  const installed = await context.newPage();
  await installed.addInitScript(() => {
    Object.defineProperty(navigator, 'standalone', { value: true });
  });
  await installed.goto('/study/');
  await expect(installed.locator('html')).toHaveAttribute('lang', 'et');

  const installedOnAndroid = await context.newPage();
  await installedOnAndroid.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = (query) =>
      query === '(display-mode: standalone)'
        ? { ...matchMedia(query), matches: true, media: query }
        : matchMedia(query);
  });
  await installedOnAndroid.goto('/study/');
  await expect(installedOnAndroid.locator('html')).toHaveAttribute('lang', 'et');

  const installedAfterChoice = await context.newPage();
  await installedAfterChoice.addInitScript(() => {
    Object.defineProperty(navigator, 'standalone', { value: true });
    window.localStorage.setItem('app_locale', 'en');
  });
  await installedAfterChoice.goto('/study/');
  await expect(installedAfterChoice.locator('html')).toHaveAttribute('lang', 'en');
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
