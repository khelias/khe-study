import { appendFileSync, cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import {
  answerLetterMatch,
  expect,
  LETTER_MATCH_ROUND,
  seedForPlay,
  test,
  type Page,
} from './fixtures';
import { isShellCache } from '../src/offline/names';
import { BUILD_A, BUILD_B, BUILD_KILLED, LIVE } from './offline-paths';

const OTHER_APP_CACHE = 'adventure-shell-keep';

function deploy(build: string): void {
  rmSync(LIVE, { recursive: true, force: true });
  cpSync(build, LIVE, { recursive: true });
}

const buildMark = (page: Page) => page.locator('meta[name="e2e-build"]').getAttribute('content');
const cacheNames = (page: Page) => page.evaluate(() => caches.keys());
const shellCaches = async (page: Page) => (await cacheNames(page)).filter(isShellCache);
const menuShown = (page: Page) =>
  expect(page.getByRole('button', { name: /^Kaalud - / })).toBeVisible();

async function openControlled(page: Page): Promise<void> {
  await page.goto('/study/');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await menuShown(page);
}

/** Asks for the deployed worker and waits until its install has failed. */
function updateFails(page: Page): Promise<void> {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const found = new Promise<ServiceWorker | null>((resolve) => {
      registration.addEventListener('updatefound', () => resolve(registration.installing), {
        once: true,
      });
    });
    await registration.update();
    const worker = await found;
    await new Promise<void>((resolve) => {
      const done = () => {
        if (worker?.state === 'redundant') resolve();
      };
      worker?.addEventListener('statechange', done);
      done();
    });
  });
}

test.beforeEach(async ({ page }) => {
  deploy(BUILD_A);
  await seedForPlay(page);
});

test('the manifest names the app on its own path, with every icon it lists served', async ({
  page,
}) => {
  await page.goto('/study/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('/study/manifest.webmanifest');
  const response = await page.request.get(href ?? '');
  expect(response.headers()['content-type']).toContain('application/manifest+json');
  const manifest = (await response.json()) as {
    id: string;
    name: string;
    scope: string;
    start_url: string;
    display: string;
    icons: { src: string; sizes: string; purpose: string }[];
  };
  expect(manifest).toMatchObject({
    id: '/study/',
    name: 'Tarkade mängud',
    scope: '/study/',
    start_url: '/study/',
    display: 'standalone',
  });
  expect(manifest.icons.map(({ sizes, purpose }) => `${sizes} ${purpose}`)).toEqual([
    '192x192 any',
    '512x512 any',
    '512x512 maskable',
  ]);
  for (const icon of manifest.icons) {
    const image = await page.request.get(icon.src);
    expect(image.headers()['content-type']).toBe('image/png');
  }
});

test('offline, the app reloads, opens a game by its address and plays a round', async ({
  page,
  context,
}) => {
  await openControlled(page);
  await context.setOffline(true);
  await page.reload();
  await menuShown(page);

  await page.goto('/study/games/letter-match?seed=4');
  await answerLetterMatch(page, LETTER_MATCH_ROUND);
  await expect(page.getByRole('heading', { name: 'Ring tehtud!' })).toBeVisible();
});

test('a new build replaces the old one, offline too, and leaves another app’s cache', async ({
  page,
  context,
}) => {
  await openControlled(page);
  await page.evaluate((name) => caches.open(name), OTHER_APP_CACHE);
  const [oldShell] = await shellCaches(page);

  deploy(BUILD_B);
  await page.goto('/study/');
  expect(await buildMark(page)).toBe('b');
  await expect
    .poll(() => shellCaches(page), { timeout: 15_000 })
    .toEqual([expect.not.stringMatching(oldShell ?? '')]);
  expect(await cacheNames(page)).toContain(OTHER_APP_CACHE);

  await context.setOffline(true);
  await page.reload();
  expect(await buildMark(page)).toBe('b');
});

test('an update that cannot fetch every file keeps the running worker and its cache', async ({
  page,
  context,
}) => {
  await openControlled(page);
  const before = await shellCaches(page);

  deploy(BUILD_B);
  // The server answers this one with the page and a 200, as nginx does.
  rmSync(`${LIVE}/icon-512.png`);
  await updateFails(page);
  expect(await shellCaches(page)).toEqual(before);

  await context.setOffline(true);
  await page.reload();
  expect(await buildMark(page)).toBe('a');
  await menuShown(page);
});

test('a failed update under the same version keeps the running cache', async ({
  page,
  context,
}) => {
  await openControlled(page);
  const before = await shellCaches(page);

  appendFileSync(`${LIVE}/sw.js`, '\n// new bytes, same version\n');
  rmSync(`${LIVE}/icon-512.png`);
  await updateFails(page);
  expect(await shellCaches(page)).toEqual(before);

  await context.setOffline(true);
  await page.reload();
  await menuShown(page);
});

test('a new page whose files cannot arrive opens the saved build', async ({ page }) => {
  await openControlled(page);

  deploy(BUILD_B);
  const html = `${LIVE}/index.html`;
  writeFileSync(
    html,
    readFileSync(html, 'utf8').replace(/assets\/index-[^"]+\.js/, 'assets/index-gone.js'),
  );
  await page.goto('/study/');
  expect(await buildMark(page)).toBe('a');
  await menuShown(page);
});

test('leaving a game comes back to the app’s own path, which reloads offline', async ({
  page,
  context,
}) => {
  await openControlled(page);
  await page.goto('/study/games/no-such-game');
  await menuShown(page);
  expect(new URL(page.url()).pathname).toBe('/study/');

  await context.setOffline(true);
  await page.reload();
  await menuShown(page);
});

test('a consent script that never answers does not hold the app back', async ({ page }) => {
  await openControlled(page);
  await page.route('**/assets/analytics-consent.js', () => undefined);
  await page.goto('/study/', { waitUntil: 'commit' });
  await menuShown(page);
});

test('the kill-switch empties the app’s caches, unregisters and reloads the page once', async ({
  page,
}) => {
  await openControlled(page);
  await page.evaluate((name) => caches.open(name), OTHER_APP_CACHE);

  deploy(BUILD_KILLED);
  let loads = 0;
  page.on('load', () => (loads += 1));
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });

  const withdrawn = () =>
    page
      .evaluate(async () => ({
        controlled: Boolean(navigator.serviceWorker.controller),
        workers: (await navigator.serviceWorker.getRegistrations()).length,
      }))
      .catch(() => null);
  await expect.poll(withdrawn, { timeout: 15_000 }).toEqual({ controlled: false, workers: 0 });
  expect(await shellCaches(page)).toEqual([]);
  expect(await cacheNames(page)).toContain(OTHER_APP_CACHE);

  await page.waitForTimeout(1_000);
  expect(loads).toBe(1);
  await menuShown(page);
});
