import { expect, learnerProfile, seedStore, test, type Page } from './fixtures';

const CLASSIC_BG = '#f6f6f2';
const SEA_BG = '#e0f2fe';

const appBg = (page: Page) =>
  page.evaluate(() => document.documentElement.style.getPropertyValue('--app-bg').trim());

async function switchLearner(page: Page, name: string) {
  await page.getByRole('button', { name: 'Seaded' }).click();
  await page.getByRole('menuitem', { name: /Õppija/ }).click();
  await page.getByRole('menuitemradio', { name }).click();
}

test('two learners keep their own stars and themes', async ({ page }) => {
  const mari = learnerProfile('Mari', 'mari');
  const jaan = learnerProfile('Jaan', 'jaan');
  // A store from before v11: the device's stars go to the learner active then.
  await seedStore(page, {
    stars: 100,
    learners: [mari, jaan],
    activeLearnerId: 'mari',
    activeLearnerProfile: mari,
  });
  await page.goto('/study/');

  await page.getByRole('button', { name: 'Tähed 100' }).click();
  await page.getByRole('button', { name: 'Osta teema Meri, hind 30 tähte' }).click();
  await expect(page.getByRole('button', { name: 'Teema Meri on kasutusel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Tähed 70' })).toBeVisible();
  expect(await appBg(page)).toBe(SEA_BG);

  await switchLearner(page, 'Jaan');
  await expect(page.getByRole('button', { name: 'Tähed 0' })).toBeVisible();
  await expect.poll(() => appBg(page)).toBe(CLASSIC_BG);
  await page.getByRole('button', { name: 'Tähed 0' }).click();
  await expect(page.getByRole('button', { name: 'Osta teema Meri, hind 30 tähte' })).toBeDisabled();
  await page.keyboard.press('Escape');

  await switchLearner(page, 'Mari');
  await expect(page.getByRole('button', { name: 'Tähed 70' })).toBeVisible();
  await expect.poll(() => appBg(page)).toBe(SEA_BG);
});

test('the shop gives free stars only while the demo switch is on', async ({ page }) => {
  await seedStore(page, { stars: 3 }, { once: true });
  await page.goto('/study/');

  await page.getByRole('button', { name: 'Tähed 3' }).click();
  await expect(page.getByRole('heading', { name: 'Teemad' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tasuta tähed' })).toHaveCount(0);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Seaded' }).click();
  const demo = page.getByRole('menuitemcheckbox', { name: 'Tasuta tähed poes' });
  await expect(demo).toHaveAttribute('aria-checked', 'false');
  await demo.click();
  await expect(demo).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Seaded' }).click();

  await page.getByRole('button', { name: 'Tähed 3' }).click();
  await page.getByRole('button', { name: /Lisa 50 tähte/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Tähed 53' })).toBeVisible();

  // The switch belongs to the device: a reload keeps it.
  await page.reload();
  await page.getByRole('button', { name: 'Seaded' }).click();
  await expect(page.getByRole('menuitemcheckbox', { name: 'Tasuta tähed poes' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});
