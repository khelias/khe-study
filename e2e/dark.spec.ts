import { test, expect, seedStore, type Page } from './fixtures';
import { THEME_STORAGE_KEY } from '../src/theme/themeKey';

const DARK_PAPER = 'rgb(11, 13, 13)';
const LIGHT_PAPER = 'rgb(250, 250, 250)';

test.beforeEach(({ page }) => seedStore(page));

const htmlGround = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
const appGround = (page: Page) =>
  page
    .locator('.app-bg')
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY);
const toggle = (page: Page) => page.getByRole('button', { name: 'Tume teema' });

test.describe('dark system', () => {
  test.use({ colorScheme: 'dark' });

  test('the shell follows it', async ({ page }) => {
    await page.goto('/study/');
    await expect(toggle(page)).toBeVisible();
    expect(await htmlGround(page)).toBe(DARK_PAPER);
    expect(await appGround(page)).toBe(DARK_PAPER);
  });

  test('the toggle picks light, keeps it after a reload, and clears it back to the system', async ({
    page,
  }) => {
    await page.goto('/study/');
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await toggle(page).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await stored(page)).toBe('light');
    await expect.poll(() => appGround(page)).toBe(LIGHT_PAPER);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect.poll(() => appGround(page)).toBe(LIGHT_PAPER);

    await toggle(page).click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
    expect(await stored(page)).toBeNull();
    await expect.poll(() => appGround(page)).toBe(DARK_PAPER);
  });

  test('the balance scale plays on a light stage under a dark header', async ({ page }) => {
    await page.goto('/study/games/balance-scale');
    const stage = page.locator('.light-stage');
    await expect(stage).toBeVisible();
    expect(await stage.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(LIGHT_PAPER);
    const header = page.locator('.site-header');
    expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(DARK_PAPER);
  });

  test("the fact drill's time-up result screen, rendered on the stage, shows dark", async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/study/games/multiplication-fact-drill-1-5');
    await expect(page.locator('.light-stage')).toBeVisible();
    await page.clock.fastForward(61_000);
    const result = page.locator('.light-stage div.theme-shell.fixed');
    await expect(result).toBeVisible();
    expect(await result.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(DARK_PAPER);
  });
});

test.describe('light system', () => {
  test.use({ colorScheme: 'light' });

  test('a stored dark choice shows before first paint', async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, 'dark');
      document.addEventListener('DOMContentLoaded', () => {
        (window as unknown as { atLoad: unknown }).atLoad = {
          theme: document.documentElement.getAttribute('data-theme'),
          ground: getComputedStyle(document.documentElement).backgroundColor,
        };
      });
    }, THEME_STORAGE_KEY);
    await page.goto('/study/');
    const atLoad = await page.evaluate(() => (window as unknown as { atLoad: unknown }).atLoad);
    expect(atLoad).toEqual({ theme: 'dark', ground: DARK_PAPER });
  });

  test('the hub choice carries in through the shared key', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, 'dark'), THEME_STORAGE_KEY);
    await page.goto('/study/');
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await toggle(page).click();
    expect(await stored(page)).toBeNull();
    await expect.poll(() => appGround(page)).toBe(LIGHT_PAPER);
  });
});
