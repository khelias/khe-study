import { test as base, type Page } from '@playwright/test';
import { APP_KEY } from '../src/games/data';

export { expect, type Page } from '@playwright/test';

// The dev server proxies the consent banner to games.khe.ee (estate ADR-019); an empty one keeps
// every spec off the live site.
export const test = base.extend({
  context: async ({ context }, provide) => {
    await context.route('**/assets/analytics-consent.js', (route) =>
      route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    await provide(context);
  },
});

/** Seeds the persisted game store and the Estonian locale before every load of the page. */
export function seedStore(page: Page, state: Record<string, unknown> = {}) {
  return page.addInitScript(
    ({ storeKey, seed }) => {
      window.localStorage.setItem(
        storeKey,
        JSON.stringify({ state: { hasSeenTutorial: true, ...seed }, version: 0 }),
      );
      window.localStorage.setItem('app_locale', 'et');
    },
    { storeKey: APP_KEY, seed: state },
  );
}
