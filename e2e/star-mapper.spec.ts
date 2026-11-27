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

/** A learner at a star_mapper level, nothing traced. */
function learnerAtLevel(level: number) {
  const seeded = learnerWithRounds('star_mapper', 0);
  const learner = seeded.learners[0]!;
  return {
    ...learner,
    mechanicPreference: {
      star_mapper: {
        ...learner.mechanicPreference.star_mapper!,
        difficulty: level,
        highestLevel: level,
      },
    },
  };
}

/** A point on the sky at least 40 px from every tappable star. */
async function freePoint(page: Page, near: { x: number; y: number }) {
  const stars = await page.locator('[data-hip]').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }),
  );
  for (let ring = 0; ring < 12; ring++) {
    for (let a = 0; a < 8; a++) {
      const p = {
        x: near.x + Math.cos((a * Math.PI) / 4) * ring * 20,
        y: near.y + Math.sin((a * Math.PI) / 4) * ring * 20,
      };
      if (stars.every((s) => Math.hypot(s.x - p.x, s.y - p.y) > 40)) return p;
    }
  }
  return near;
}

const noWebgl = () => {
  type GetContext = (this: HTMLCanvasElement, type: string, ...rest: unknown[]) => unknown;
  const proto = HTMLCanvasElement.prototype as unknown as { getContext: GetContext };
  const real = proto.getContext;
  proto.getContext = function (type, ...rest) {
    return type.startsWith('webgl') ? null : real.call(this, type, ...rest);
  };
};

async function openSky(page: Page, query = '') {
  await page.goto(`/study/games/star-mapper${query}`);
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
      // Every level 1 constellation is an easy one, so its creature comes alive.
      await expect(page.locator('[data-creature]')).toBeVisible();
      await page.waitForTimeout(2500);
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
          rollingStats: learner.skillMastery[skillId]?.rollingStats ?? {
            attempts: 0,
            correct: 0,
            avgResponseMs: 0,
          },
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
    // Level 9's dawn comes after 60 s; a slow search can lose a night, and
    // the same night starts again with no lines drawn.
    const figure = await currentFigure(page);
    for (let night = 0; night < 3; night++) {
      await drawFigure(page, figure);
      const done = await page
        .getByText('Leitud')
        .waitFor({ timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      if (done) break;
      await page.waitForTimeout(2500);
    }
    await expect(page.getByText('Leitud')).toBeVisible({ timeout: 5000 });
    expect(errors).toEqual([]);
  });

  for (const width of [390, 1280]) {
    test(`a hidden treasure opens when zoomed in at ${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = trackErrors(page);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await seedForPlay(page);
      // Seed 1's first task is Suur Vanker, with Mizar and Alcor beside its handle.
      await openSky(page, '?seed=1');
      const sparkle = page.locator('[data-k="treasure"] path');
      const box = await sparkle.boundingBox();
      if (!box) throw new Error('no treasure on screen');
      const sky = (await page.locator('[data-phase] svg[role="group"]').boundingBox())!;
      const centre = { x: sky.x + sky.width / 2, y: sky.y + sky.height / 2 };
      // Bring the treasure to the middle, then zoom in on it.
      const from = await freePoint(page, { x: box.x, y: box.y });
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(from.x + centre.x - box.x, from.y + centre.y - box.y, { steps: 10 });
      await page.waitForTimeout(150);
      await page.mouse.up();
      await page.mouse.move(centre.x, centre.y);
      for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -400);
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Peidetud aare' }).click();
      await expect(page.getByText('Aare', { exact: true })).toBeVisible();
      if (SCREENSHOTS) await page.screenshot({ path: `${SCREENSHOTS}/treasure-${width}.png` });
      await page.getByRole('button', { name: 'Sulge', exact: true }).click();
      await expect(page.getByText('Aare', { exact: true })).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }

  for (const width of [390, 1280]) {
    test(`the dawn wins a level 5 task once, without WebGL, at ${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = trackErrors(page);
      await page.addInitScript(noWebgl);
      await page.clock.install();
      const learner = learnerAtLevel(5);
      await seedForPlay(page, {
        learners: [learner],
        activeLearnerId: learner.id,
        activeLearnerProfile: learner,
      });
      await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await page.goto('/study/games/star-mapper');
      await page.clock.runFor(2000);
      await expect(page.locator('[data-webgl="failed"]').first()).toBeVisible();
      await expect(page.getByRole('progressbar', { name: 'Aeg koiduni' })).toBeVisible();
      await expect(page.locator('[data-phase="draw"]')).toBeVisible();
      if (SCREENSHOTS) await page.screenshot({ path: `${SCREENSHOTS}/nowebgl-${width}.png` });

      await page.clock.runFor(70_000);
      if (SCREENSHOTS) await page.screenshot({ path: `${SCREENSHOTS}/dawn-${width}.png` });
      let slept = false;
      for (let i = 0; i < 40 && !slept; i++) {
        await page.clock.runFor(500);
        slept = (await page.locator('[data-pose="sleep"]').count()) > 0;
      }
      expect(slept).toBe(true);
      if (SCREENSHOTS) await page.screenshot({ path: `${SCREENSHOTS}/dawn-won-${width}.png` });
      await page.clock.runFor(2500);
      await expect(page.locator('[data-pose="sleep"]')).toHaveCount(0);
      const now = Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
      expect(now).toBeLessThan(10);
      // three.js reports the context it could not create; the gradient sky takes over.
      expect(errors.filter((e) => !e.includes('Error creating WebGL context'))).toEqual([]);
    });
  }

  for (const [width, height, name] of [
    [320, 568, 'narrow'],
    [844, 390, 'landscape'],
  ] as const) {
    test(`fits a ${name} phone`, async ({ page }) => {
      test.setTimeout(60_000);
      const errors = trackErrors(page);
      await page.setViewportSize({ width, height });
      await seedForPlay(page);
      await openSky(page);
      const bar = await page.locator('nav.sky-bar').boundingBox();
      if (!bar) throw new Error('no bar');
      if (name === 'landscape') {
        // No room under the task: the owl steps aside.
        await expect(page.locator('.sky-owl')).toBeHidden();
      } else {
        const owl = await page.locator('.sky-owl button').boundingBox();
        const bubble = await page.locator('.sky-bubble').boundingBox();
        if (!owl || !bubble) throw new Error('no owl or bubble');
        expect(owl.y + owl.height).toBeLessThanOrEqual(bar.y);
        expect(bubble.y + bubble.height).toBeLessThanOrEqual(bar.y);
        expect(bubble.x + bubble.width).toBeLessThanOrEqual(width);
        // With the hint row open the owl climbs above it.
        await page.getByRole('button', { name: 'Vihje' }).click();
        const hint = await page.getByRole('button', { name: /Järgmine joon/ }).boundingBox();
        await page.waitForTimeout(100);
        const raised = await page.locator('.sky-owl button').boundingBox();
        if (!hint || !raised) throw new Error('no hint row');
        expect(raised.y + raised.height).toBeLessThanOrEqual(hint.y);
      }
      if (SCREENSHOTS) await page.screenshot({ path: `${SCREENSHOTS}/${name}.png` });
      expect(errors).toEqual([]);
    });
  }
});
