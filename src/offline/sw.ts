/// <reference lib="webworker" />
// The service worker (estate ADR-041). serviceWorkerPlugin compiles this file once per build with
// the constants below filled in.
import { deleteShellCaches, shellCacheName } from './names';

declare const self: ServiceWorkerGlobalScope;
declare const __SW_VERSION__: string;
declare const __SW_BASE__: string;
declare const __SW_PRECACHE__: readonly string[];

const BASE = __SW_BASE__;
const SHELL = shellCacheName(__SW_VERSION__);
const PRECACHE = new Set(__SW_PRECACHE__);
const NAVIGATION_TIMEOUT_MS = 3000;
const ASSET_IN_PAGE = new RegExp(`"${BASE}(assets/[^"]+)"`, 'g');

// nginx answers a missing file under /study/ with the page and a 200, so the type is checked too:
// HTML stored as a script would break the app offline.
function usable(path: string, response: Response): boolean {
  if (!response.ok || response.type !== 'basic' || response.redirected) return false;
  return path === '' || !response.headers.get('content-type')?.includes('text/html');
}

async function fetchFile(path: string): Promise<[string, Response]> {
  const url = BASE + path;
  // Hashed files never change under their name, so the HTTP cache may answer them.
  const response = await fetch(url, { cache: path.startsWith('assets/') ? 'default' : 'reload' });
  if (!usable(path, response)) throw new Error(`precache: ${url} answered ${response.status}`);
  return [url, response];
}

// All or nothing: a deploy deletes the previous build's hashed files, and a failed install must
// leave the running worker and its cache as they were.
async function precache(): Promise<void> {
  const files = await Promise.all([...PRECACHE].map(fetchFile));
  // A new toolchain can change this worker and not its version, and then the cache is the running one.
  const running = await caches.has(SHELL);
  try {
    const cache = await caches.open(SHELL);
    await Promise.all(files.map(([url, response]) => cache.put(url, response)));
  } catch (error) {
    if (!running) await caches.delete(SHELL);
    throw error;
  }
}

// The whole app is one bundle already in memory, so taking over under a running game is safe: it
// plays on, and the next start opens the new build.
self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(deleteShellCaches(SHELL).then(() => self.clients.claim()));
});

// A new build's page names hashed files this worker has not saved. Waiting for them means a
// connection lost in between opens the saved build instead of a blank page.
async function filesArrive(page: Response): Promise<boolean> {
  const html = await page.clone().text();
  const paths = Array.from(html.matchAll(ASSET_IN_PAGE), (match) => match[1] ?? '');
  const arrived = await Promise.all(
    paths
      .filter((path) => !PRECACHE.has(path))
      .map(async (path) => {
        const response = await fetch(BASE + path);
        await response.arrayBuffer();
        return usable(path, response);
      }),
  );
  return arrived.every(Boolean);
}

async function freshPage(network: Promise<Response>): Promise<Response | null> {
  const response = await network;
  if (response.type === 'opaqueredirect') return response;
  return response.ok && (await filesArrive(response)) ? response : null;
}

// Network first, so a deploy shows at once. The answer is not stored: the shell in the cache has
// to stay the one whose files were precached with it.
async function navigate(request: Request): Promise<Response> {
  const network = fetch(request);
  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), NAVIGATION_TIMEOUT_MS);
  });
  const fresh = await Promise.race([freshPage(network), timeout]).catch(() => null);
  return fresh ?? (await caches.match(BASE, { cacheName: SHELL })) ?? network;
}

async function shellFile(request: Request, pathname: string): Promise<Response> {
  return (await caches.match(pathname, { cacheName: SHELL })) ?? fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
  } else if (PRECACHE.has(url.pathname.slice(BASE.length))) {
    event.respondWith(shellFile(request, url.pathname));
  }
});
