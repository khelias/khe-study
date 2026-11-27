import { expect, seedForPlay, test } from './fixtures';

for (const [width, height] of [
  [390, 844],
  [844, 390],
] as const) {
  test.describe(`the game screen on a ${width}x${height} phone`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height });
      await seedForPlay(page);
    });

    test('the picker keeps the KHE header, a game plays under its own bar', async ({ page }) => {
      await page.goto('/study/');
      await expect(page.locator('header.site-header')).toBeVisible({ timeout: 10_000 });

      await page.goto('/study/games/letter-match?seed=4');
      const bar = page.getByTestId('game-bar');
      await expect(bar).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('header.site-header')).toHaveCount(0);
      const box = await bar.boundingBox();
      expect(box?.height ?? Infinity).toBeLessThanOrEqual(64);
      await expect(page.getByTestId('round-lives')).toBeVisible();
      await expect(page.getByRole('button', { name: /^Tähed \d+, ava pood$/ })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Muuda taset' })).toHaveCount(0);
    });

    test('the menu holds level, description and theme, inside the screen', async ({ page }) => {
      await page.goto('/study/games/letter-match?seed=4');
      await page.getByRole('button', { name: 'Seaded' }).click({ timeout: 10_000 });
      const sheet = page.getByRole('dialog');
      await expect(sheet).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /^Muuda taset: \d+$/ })).toBeVisible();
      await expect(page.getByTestId('session-score')).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Kuidas mängida' })).toBeVisible();
      await expect(page.getByRole('menuitemcheckbox', { name: 'Tume teema' })).toBeVisible();
      const box = await sheet.boundingBox();
      if (!box) throw new Error('no sheet');
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    });
  });
}
