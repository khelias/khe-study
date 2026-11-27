import { expect, learnerWithRounds, seedForPlay, test, type Page } from './fixtures';
import { readFileSync } from 'node:fs';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../src/curriculum/skills/astronomy';

const FIGURES = JSON.parse(
  readFileSync(new URL('../src/games/starMapper/sky/data/figures.json', import.meta.url), 'utf8'),
) as Record<string, number[][]>;
const SCREENSHOTS = process.env.STAR_MAPPER_SHOTS;

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

/** The constellation whose figure stars are on the sky as buttons. */
async function currentFigure(page: Page): Promise<number[][]> {
  const hips = await page
    .locator('[data-hip]')
    .evaluateAll((els) => els.map((el) => Number(el.getAttribute('data-hip'))));
  const first = hips[0];
  const entry = Object.entries(FIGURES).find(
    ([, lines]) =>
      lines.flat().includes(first ?? -1) && lines.flat().every((h) => hips.includes(h)),
  );
  if (!entry) throw new Error('no figure on the sky');
  return entry[1];
}

async function centreOf(page: Page, hip: number) {
  const box = await page.locator(`[data-hip="${hip}"]`).boundingBox();
  if (!box) throw new Error(`star ${hip} is not on screen`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Drags every figure line from star to star. */
async function drawFigure(page: Page, lines: number[][]) {
  for (const [a, b] of lines) {
    const from = await centreOf(page, a!);
    const to = await centreOf(page, b!);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 5 });
    await page.mouse.up();
  }
}

async function openSky(page: Page) {
  await page.goto('/study/games/star-mapper');
  await expect(page.locator('[data-phase]')).toBeVisible({ timeout: 10_000 });
  // Glides and the lazy sky chunk settle.
  await page.waitForTimeout(1500);
}

test.describe('Tähistaevas', () => {
  for (const width of [390, 1280]) {
    test(`level 1 is drawn to the found card at ${width}px`, async ({ page }) => {
      test.setTimeout(90_000);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      const errors = trackErrors(page);
      await seedForPlay(page);
      await openSky(page);
      await expect(page.getByText(/^Joonista /)).toBeVisible();
      if (SCREENSHOTS) await page.screenshot({ path: `${SCREENSHOTS}/draw-${width}.png` });

      await drawFigure(page, await currentFigure(page));
      await expect(page.getByText('Leitud')).toBeVisible({ timeout: 5000 });
      if (SCREENSHOTS) await page.screenshot({ path: `${SCREENSHOTS}/found-${width}.png` });
      await page.getByRole('button', { name: 'Edasi' }).click();
      // Software WebGL in headless Chromium is slow at desktop width.
      await expect(page.getByText('Leitud')).toHaveCount(0, { timeout: 15_000 });
      await expect(page.locator('[data-phase="draw"]')).toBeVisible();

      expect(errors).toEqual([]);
    });
  }

  test('level 9 is found by panning, then drawn', async ({ page }) => {
    test.setTimeout(90_000);
    const errors = trackErrors(page);
    const seeded = learnerWithRounds('star_mapper', 0);
    const learner = seeded.learners[0]!;
    const skillId = ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id;
    const factsKnown = Object.fromEntries(
      Object.keys(FIGURES).map((id) => [
        id,
        { attempts: 1, correct: 1, avgResponseMs: 1000, lastSeen: 0 },
      ]),
    );
    const traced = {
      ...learner,
      mechanicPreference: {
        star_mapper: { ...learner.mechanicPreference.star_mapper!, difficulty: 9, highestLevel: 9 },
      },
      skillMastery: {
        ...learner.skillMastery,
        [skillId]: {
          skillId,
          level: 1,
          rollingStats: learner.skillMastery[skillId]?.rollingStats,
          factsKnown,
          lastPlayedAt: 0,
        },
      },
    };
    await seedForPlay(page, {
      learners: [traced],
      activeLearnerId: traced.id,
      activeLearnerProfile: traced,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await openSky(page);
    await expect(page.getByText(/^Leia taevast /)).toBeVisible();
    await expect(page.locator('[data-phase="find"]')).toBeVisible();

    // Sweep the sky: tap a grid of points on each view, then turn left by most of a screen.
    const sky = page.locator('[data-phase] svg[role="group"]');
    const box = await sky.boundingBox();
    if (!box) throw new Error('no sky');
    const isFound = async () => (await page.locator('[data-phase="draw"]').count()) > 0;
    const drag = async (dx: number, dy: number) => {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + dx, y + dy, { steps: 8 });
      // A pause before letting go leaves no inertia.
      await page.waitForTimeout(120);
      await page.mouse.up();
    };
    let found = false;
    for (const tilt of [0, 1]) {
      if (tilt) await drag(0, box.height * 0.45);
      for (let turn = 0; turn < 12 && !found; turn++) {
        for (const fy of [0.3, 0.45, 0.6, 0.75]) {
          for (const fx of [0.2, 0.5, 0.8]) {
            await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
            if (await isFound()) {
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found) await drag(-box.width * 0.75, 0);
      }
      if (found) break;
    }
    expect(found).toBe(true);
    await page.waitForTimeout(900);
    await drawFigure(page, await currentFigure(page));
    await expect(page.getByText('Leitud')).toBeVisible({ timeout: 5000 });
    expect(errors).toEqual([]);
  });
});
