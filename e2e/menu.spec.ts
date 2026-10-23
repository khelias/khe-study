import { test, expect, seedStore, type Page } from './fixtures';

const CATEGORIES = ['Keelemängud', 'Matemaatika', 'Loogika', 'Mälu'];

const seed = (page: Page, favouriteGameIds?: string[]) =>
  seedStore(page, favouriteGameIds ? { favouriteGameIds } : {});

const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('rows show a picture under every category heading, and a game opens by its name', async ({
    page,
  }) => {
    await seed(page);
    await page.goto('/study/');
    for (const name of ['Lemmikud', ...CATEGORIES]) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    const row = page.getByRole('button', { name: /^Kaalud - / });
    await expect(row.locator('svg[viewBox="0 0 80 64"]')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Valdkonnad' })).toHaveCount(0);

    await row.click();
    await expect(page).toHaveURL(/\/study\/games\/balance-scale/);
  });

  test('a mechanic row opens the pack picker', async ({ page }) => {
    await seed(page);
    await page.goto('/study/');
    await page.getByRole('button', { name: /^Tehtesprint - / }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('the longest title fits at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await seed(page);
    await page.goto('/study/');
    await expect(page.getByRole('button', { name: /^Laevade uputamine - / }).first()).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});

test.describe('desktop', () => {
  test('pills filter the tile grid and a tile opens its game', async ({ page }) => {
    await seed(page, ['addition_snake']);
    await page.goto('/study/');
    const nav = page.getByRole('navigation', { name: 'Valdkonnad' });
    const all = nav.getByRole('button', { name: 'Kõik' });
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^Kaalud - / })).toBeVisible();

    const memory = nav.getByRole('button', { name: 'Mälu' });
    await memory.click();
    await expect(memory).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: /^Matemaatika mälu - / })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Kaalud - / })).toHaveCount(0);

    await nav.getByRole('button', { name: 'Lemmikud' }).click();
    const favourite = page.getByRole('button', { name: /^Liitmisuss - / });
    await expect(favourite).toBeVisible();
    await favourite.click();
    await expect(page).toHaveURL(/\/study\/games\/addition-snake/);
  });

  test('without favourites there is no Lemmikud pill, and removing the last one falls back to Kõik', async ({
    page,
  }) => {
    await seed(page, ['balance_scale']);
    await page.goto('/study/');
    const nav = page.getByRole('navigation', { name: 'Valdkonnad' });
    await nav.getByRole('button', { name: 'Lemmikud' }).click();

    await nav.getByRole('button', { name: 'Muuda lemmikuid' }).click();
    await page.getByRole('dialog').getByRole('checkbox', { checked: true }).uncheck();
    await page.getByRole('button', { name: 'Salvesta' }).click();

    await expect(nav.getByRole('button', { name: 'Lemmikud' })).toHaveCount(0);
    await expect(nav.getByRole('button', { name: 'Kõik' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /^Kaalud - / })).toBeVisible();
  });

  test('a mechanic tile opens the pack picker', async ({ page }) => {
    await seed(page);
    await page.goto('/study/');
    await page.getByRole('button', { name: /^Numbrimadu - / }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('a three-column tile at 768px keeps the longest title on the page', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await seed(page);
    await page.goto('/study/');
    await expect(page.getByRole('navigation', { name: 'Valdkonnad' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Laevade uputamine - / })).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
