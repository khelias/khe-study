import { expect, test, type Page } from './fixtures';
import { GAME_CONFIG } from '../src/games/data';

const GAME_STORE_KEY = 'smart_adv_v45_pro';
const LOCALE_STORAGE_KEY = 'app_locale';
const ANALYTICS_CONSENT_KEY = 'khe.analyticsConsent.v1';
const GAME_IDS = Object.keys(GAME_CONFIG);

function seededStoreState() {
  return {
    state: {
      hasSeenTutorial: true,
      hearts: 5,
      stars: 150,
      stats: {
        gamesPlayed: GAME_IDS.length,
        correctAnswers: 0,
        wrongAnswers: 0,
        totalScore: 0,
        maxStreak: 0,
        currentStreak: 0,
        maxLevels: {},
        gamesByType: Object.fromEntries(GAME_IDS.map((id) => [id, 1])),
        totalTimePlayed: 0,
        lastPlayed: null,
        collectedStars: 0,
        maxSnakeLength: 0,
      },
    },
    version: 0,
  };
}

function attachRuntimeFailureCapture(page: Page): {
  consoleErrors: string[];
  pageErrors: string[];
} {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  return { consoleErrors, pageErrors };
}

async function waitForGameReady(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /muuda taset|change level/i })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('.animate-spin')).toHaveCount(0);
}

async function waitForRecordedAnswer(page: Page): Promise<void> {
  await page.waitForFunction(
    (storeKey) => {
      const raw = window.localStorage.getItem(storeKey);
      if (!raw) return false;
      try {
        const parsed = JSON.parse(raw) as {
          state?: { stats?: { correctAnswers?: number; wrongAnswers?: number } };
        };
        const stats = parsed.state?.stats;
        return (stats?.correctAnswers ?? 0) + (stats?.wrongAnswers ?? 0) > 0;
      } catch {
        return false;
      }
    },
    GAME_STORE_KEY,
    { timeout: 10_000 },
  );
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({
      storeKey,
      localeKey,
      analyticsConsentKey,
      seededStore,
    }: {
      storeKey: string;
      localeKey: string;
      analyticsConsentKey: string;
      seededStore: ReturnType<typeof seededStoreState>;
    }) => {
      window.localStorage.setItem(storeKey, JSON.stringify(seededStore));
      window.localStorage.setItem(localeKey, 'et');
      window.localStorage.setItem(
        analyticsConsentKey,
        JSON.stringify({ value: 'denied', updatedAt: '2026-04-27T00:00:00.000Z' }),
      );
    },
    {
      storeKey: GAME_STORE_KEY,
      localeKey: LOCALE_STORAGE_KEY,
      analyticsConsentKey: ANALYTICS_CONSENT_KEY,
      seededStore: seededStoreState(),
    },
  );
});

test.describe('smart games — focused interaction QA', () => {
  test('shape_shift: dragging a tray piece places it on the board', async ({ page }) => {
    const failures = attachRuntimeFailureCapture(page);

    await page.goto('/study/games/shape-shift?seed=1');
    await waitForGameReady(page);

    const trayPiece = page.locator('[data-testid^="shape-shift-tray-piece-"]').first();
    const board = page.getByTestId('shape-shift-board');
    await expect(trayPiece).toBeVisible();
    await expect(board).toBeVisible();
    await expect(page.getByTestId('shape-shift-puzzle-name')).toBeVisible();
    await expect(page.getByTestId('shape-shift-board-prompt')).toBeVisible();
    expect(await page.locator('[data-testid^="shape-shift-target-"]').count()).toBeGreaterThan(0);

    const boardBox = await board.boundingBox();
    expect(boardBox).not.toBeNull();
    if (!boardBox) return;

    await trayPiece.hover();
    await page.mouse.down();
    await expect(page.getByTestId('shape-shift-drag-ghost')).toBeVisible();
    await page.mouse.move(boardBox.x + boardBox.width / 2, boardBox.y + boardBox.height / 2, {
      steps: 12,
    });
    await page.mouse.up();

    await expect(page.locator('[data-testid^="shape-shift-board-piece-"]')).toHaveCount(1, {
      timeout: 5_000,
    });
    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
  });

  test('shape_dash: mobile jump input is reachable and unobscured', async ({ page }) => {
    const failures = attachRuntimeFailureCapture(page);
    await page.setViewportSize({ width: 320, height: 568 });

    await page.goto('/study/games/shape-dash?seed=2');
    await waitForGameReady(page);

    const runner = page.getByTestId('shape-dash-jump-button');
    await expect(runner).toBeVisible();
    await expect(runner).toBeInViewport();
    const playerPixels = await page.locator('canvas').evaluate((canvas) => {
      const drawing = canvas as HTMLCanvasElement;
      const context = drawing.getContext('2d');
      if (!context) return 0;

      const sampleX = 0;
      const sampleY = Math.floor(drawing.height * 0.42);
      const sampleWidth = Math.floor(drawing.width * 0.58);
      const sampleHeight = Math.floor(drawing.height * 0.48);
      const image = context.getImageData(sampleX, sampleY, sampleWidth, sampleHeight).data;
      let count = 0;
      for (let i = 0; i < image.length; i += 4) {
        const red = image[i] ?? 0;
        const green = image[i + 1] ?? 0;
        const blue = image[i + 2] ?? 0;
        const alpha = image[i + 3] ?? 0;
        if (alpha > 150 && green > 140 && red < 120 && blue < 180) count += 1;
      }
      return count;
    });
    expect(playerPixels).toBeGreaterThan(100);
    const runnerBox = await runner.boundingBox();
    expect(runnerBox).not.toBeNull();
    if (!runnerBox) return;

    const rightEdgeHitsJump = await page.evaluate(
      ({ x, y }) =>
        document.elementFromPoint(x, y)?.closest('[data-testid="shape-dash-jump-button"]') !== null,
      {
        x: runnerBox.x + runnerBox.width - 24,
        y: runnerBox.y + runnerBox.height / 2,
      },
    );
    expect(rightEdgeHitsJump).toBe(true);
    await runner.click();
    await page.waitForTimeout(300);

    await expect(page.locator('canvas')).toBeVisible();
    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
  });

  test('shape_dash: short landscape viewport can reach jump controls', async ({ page }) => {
    const failures = attachRuntimeFailureCapture(page);
    await page.setViewportSize({ width: 568, height: 320 });

    await page.goto('/study/games/shape-dash?seed=2');
    await waitForGameReady(page);

    const runner = page.getByTestId('shape-dash-jump-button');
    await expect(runner).toBeInViewport();
    await runner.click();

    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
  });

  test('battlelearn: problem modal answer records an attempt', async ({ page }) => {
    const failures = attachRuntimeFailureCapture(page);

    await page.goto('/study/games/battlelearn?seed=4');
    await waitForGameReady(page);

    const problemCell = page.locator('[data-qa-cell-type="problem"]').first();
    await expect(problemCell).toBeVisible();
    await problemCell.click();

    await expect(page.getByTestId('game-problem-modal')).toBeVisible();
    await page.getByTestId('game-problem-option-0').click();
    await waitForRecordedAnswer(page);

    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
  });

  test('letter_match: answer button records an attempt', async ({ page }) => {
    const failures = attachRuntimeFailureCapture(page);

    await page.goto('/study/games/letter-match?seed=5');
    await waitForGameReady(page);

    await page.getByTestId('standard-answer-0').click();
    await waitForRecordedAnswer(page);

    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
  });

  test('picture_pairs: card taps after peek increment moves', async ({ page }) => {
    const failures = attachRuntimeFailureCapture(page);

    await page.goto('/study/games/picture-pairs?seed=6');
    await waitForGameReady(page);

    await expect(page.getByText('Jäta meelde!')).toBeHidden({ timeout: 3_000 });
    await page.getByTestId('picture-pairs-card-0').click();
    await page.getByTestId('picture-pairs-card-1').click();

    await expect(page.getByText('Käigud: 2')).toBeVisible();
    expect(failures.consoleErrors).toEqual([]);
    expect(failures.pageErrors).toEqual([]);
  });
});
