import { test as base } from '@playwright/test';

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
