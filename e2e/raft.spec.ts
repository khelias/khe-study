import { expect, learnerAtLevel, seedForPlay, test, type Page } from './fixtures';

/** The raft's round (board 2A): eight buoys to the far bank. */
const RAFT_ROUND = 8;

async function openGame(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByTestId('raft-stage')).toBeVisible({ timeout: 10_000 });
}

/** Picks a level the learner has reached from the level selector. */
async function stepToLevel(page: Page, level: number): Promise<void> {
  await page.getByRole('button', { name: /muuda taset/i }).click();
  await page.getByRole('button', { name: String(level), exact: true }).click();
  await page.getByRole('button', { name: 'Kinnita' }).click();
  await expect(page.getByRole('button', { name: /muuda taset/i })).toContainText(String(level));
}

const unknownWeights = (page: Page) => page.locator('[data-qa-answer] svg text', { hasText: '?' });

test.describe('the raft', () => {
  test('Kaalud crosses the river: a buoy per right answer, a red one after a wrong weight, the far bank at the end', async ({
    page,
  }) => {
    await seedForPlay(page);
    await openGame(page, '/study/games/balance-scale?seed=5');
    const raft = page.getByTestId('raft-stage');
    const goal = page.getByTestId('round-goal');
    const buoys = raft.locator('[data-buoy]');
    const options = page.locator('[data-testid=raft-stage] + div > button:not([disabled])');
    const task = () => raft.getAttribute('data-task');
    const answer = async () =>
      (await page.locator('[data-qa-answer]').getAttribute('data-qa-answer')) ?? '';

    await expect(buoys).toHaveCount(RAFT_ROUND);
    await expect(goal).toHaveAccessibleName('Ring 0/8');
    // The game bar gives its goal strip to the raft: the buoys are the only goal on the page.
    await expect(page.getByTestId('round-goal')).toHaveCount(1);
    await expect(raft.getByTestId('round-goal')).toHaveCount(1);

    let shown = await task();
    const first = await answer();
    await options
      .filter({ hasNotText: new RegExp(`^${first}$`) })
      .first()
      .click();
    await expect(page.getByTestId('round-lives')).toHaveAccessibleName('Elusid alles: 2', {
      timeout: 5_000,
    });
    await options.filter({ hasText: new RegExp(`^${first}$`) }).click();
    await expect(raft).toHaveAttribute('data-progress', '1', { timeout: 5_000 });
    await expect(buoys.first()).toHaveAttribute('data-buoy', 'missed');
    await expect(buoys.nth(1)).toHaveAttribute('data-buoy', 'next');

    for (let step = 2; step <= RAFT_ROUND; step++) {
      // The raft stays; the next task comes aboard as it stops.
      await expect.poll(task).not.toBe(shown);
      shown = await task();
      const value = await answer();
      await options.filter({ hasText: new RegExp(`^${value}$`) }).dispatchEvent('click');
      await expect(raft).toHaveAttribute('data-progress', String(step), { timeout: 5_000 });
    }
    await expect(goal).toHaveAccessibleName('Ring 8/8');
    await expect(buoys.last()).toHaveAttribute('data-buoy', 'passed');

    const end = page.getByTestId('round-end');
    await expect(end.getByRole('heading', { name: 'Ring tehtud!' })).toBeVisible({
      timeout: 5_000,
    });
  });
});

test.describe('one level step per raft game', () => {
  test('Kaalud: level 12 hangs two equal unknowns where level 11 hangs one', async ({ page }) => {
    await seedForPlay(page, learnerAtLevel('balance_scale', 11, 12));
    await openGame(page, '/study/games/balance-scale?seed=3');
    await expect(unknownWeights(page)).toHaveCount(1);

    await stepToLevel(page, 12);
    await expect(unknownWeights(page)).toHaveCount(2);
  });

  test('Mõõtühikud: level 11 converts 50 to 100 where level 10 converts 10 to 50', async ({
    page,
  }) => {
    const value = async () => {
      const text = (await page.getByText(/^\d+ \w+ = \? \w+$/).textContent()) ?? '';
      return Number(text.split(' ')[0]);
    };
    await seedForPlay(page, learnerAtLevel('unit_conversion', 10, 11));
    await openGame(page, '/study/games/unit-conversion?seed=3');
    expect(await value()).toBeLessThanOrEqual(50);
    expect(await value()).toBeGreaterThanOrEqual(10);

    await stepToLevel(page, 11);
    await expect.poll(value).toBeGreaterThanOrEqual(50);
    expect(await value()).toBeLessThanOrEqual(100);
  });

  test('Arvude võrdlemine: level 2 opens the equals sign', async ({ page }) => {
    await seedForPlay(page, learnerAtLevel('compare_sizes', 1, 2));
    await openGame(page, '/study/games/compare-sizes?seed=3');
    const equal = page.getByRole('button', { name: /Nad on võrdsed/ });
    await expect(equal).toBeDisabled();

    await stepToLevel(page, 2);
    await expect(equal).toBeEnabled();
  });

  test('Kellamäng: level 5 reads the clock in digits where level 4 says it in words', async ({
    page,
  }) => {
    const options = page.locator('[data-testid=raft-stage] + div > button');
    await seedForPlay(page, learnerAtLevel('time_match', 4, 5));
    await openGame(page, '/study/games/time-match?seed=3');
    await expect(options.first()).not.toHaveText(/^\d{1,2}:\d{2}$/);

    await stepToLevel(page, 5);
    await expect(options.first()).toHaveText(/^\d{1,2}:\d{2}$/);
    await expect(options).toHaveCount(4);
  });
});
