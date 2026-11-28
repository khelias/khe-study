import {
  answerLetterMatch,
  expect,
  learnerProfile,
  LETTER_MATCH_ROUND,
  seedForPlay,
  seedStore,
  test,
  type Page,
} from './fixtures';
import { APP_KEY, GAME_CONFIG } from '../src/games/data';
import { localDay } from '../src/meta/path';

function seedLearner(page: Page, meta: Record<string, unknown>, play = false) {
  const base = learnerProfile('Mia', 'mia');
  const learner = { ...base, meta: { ...base.meta, ...meta } };
  const state = { learners: [learner], activeLearnerId: 'mia', activeLearnerProfile: learner };
  return play ? seedForPlay(page, state) : seedStore(page, state, { once: true });
}

const storedPath = (page: Page) =>
  page.evaluate((key) => {
    const store = JSON.parse(window.localStorage.getItem(key) ?? '{}') as {
      state: { activeLearnerProfile: { meta: { path: { slots: { gameId: string }[] } } } };
    };
    return store.state.activeLearnerProfile.meta.path.slots.map((s) => s.gameId);
  }, APP_KEY);

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("today's path runs to its stickers, the streak and the album", async ({ page }) => {
    const earnedAt = Date.now();
    await seedLearner(
      page,
      {
        path: {
          day: localDay(earnedAt),
          slots: [
            { gameId: 'balance_scale', stickerId: 'fox' },
            { gameId: 'letter_match', stickerId: null },
            { gameId: 'letter_match', stickerId: null },
          ],
        },
        album: [{ stickerId: 'fox', gameId: 'balance_scale', earnedAt }],
      },
      true,
    );
    await page.goto('/study/');
    await expect(page.getByRole('heading', { level: 1, name: 'Tänane rada' })).toBeVisible();
    await expect(page.getByTestId('path-slot-0')).toHaveAttribute('data-state', 'done');

    await page.getByRole('button', { name: 'Mängi: Tähedetektiiv' }).click();
    await expect(page).toHaveURL(/\/games\/letter-match\?path=1/);
    await answerLetterMatch(page, LETTER_MATCH_ROUND);
    const end = page.getByTestId('round-end');
    await expect(end.getByTestId('path-sticker')).toContainText('Uus kleeps albumisse: Siil', {
      timeout: 5_000,
    });

    await end.getByRole('button', { name: 'Raja 3. ring' }).click();
    await expect(page).toHaveURL(/\?path=2/);
    await answerLetterMatch(page, LETTER_MATCH_ROUND);
    await expect(end.getByTestId('path-day-stickers')).toBeVisible({ timeout: 5_000 });
    await expect(end.getByTestId('path-day-streak')).toContainText('1 päev järjest');

    await end.getByRole('button', { name: 'Vaata albumit' }).click();
    await expect(page).toHaveURL(/\/study\/album$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Minu album' })).toBeVisible();
    await expect(page.getByTestId('album-sticker')).toHaveText([
      'RebaneKaalud, täna',
      'SiilTähedetektiiv, täna',
      'ÖökullTähedetektiiv, täna',
    ]);

    await page.getByRole('link', { name: 'Tagasi menüüsse' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Tänane rada tehtud!' }),
    ).toBeVisible();
    await expect(page.getByTestId('path-streak')).toContainText('1 päev järjest');
  });
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("a parent's focus behind the PIN changes the path", async ({ page }) => {
    await seedLearner(page, {});
    await page.goto('/study/');
    await expect(page.getByTestId('path-slot-2')).toBeVisible();

    await page.getByTestId('learner-chip').click();
    await page.getByRole('menuitem', { name: 'Lapsevanemale' }).click();
    const dialog = page.getByTestId('parent-modal');
    const type = async (pin: string) => {
      for (const digit of pin)
        await dialog.getByRole('button', { name: digit, exact: true }).click();
    };
    await type('1357');
    await type('1357');
    await dialog.getByRole('radio', { name: 'Matemaatika' }).check();
    await expect(dialog.getByTestId('parent-preview')).toContainText('Täna harjutad: Matemaatika');
    await dialog.getByRole('button', { name: 'Sulge' }).click();

    await expect(page.getByTestId('path-focus')).toHaveText('Täna harjutad: Matemaatika');
    const games = await storedPath(page);
    expect(games.slice(0, 2).map((id) => GAME_CONFIG[id]?.category)).toEqual(['math', 'math']);

    await page.reload();
    await page.getByTestId('learner-chip').click();
    await page.getByRole('menuitem', { name: 'Lapsevanemale' }).click();
    await expect(dialog.getByText('Sisesta PIN')).toBeVisible();
    await type('1357');
    await expect(dialog.getByRole('radio', { name: 'Matemaatika' })).toBeChecked();
  });
});
