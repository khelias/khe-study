import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { PRODUCT_ROOT } from './src/theme/productRoot';
import { themeHeadPlugin } from './src/theme/themeHead';
import { serviceWorkerPlugin } from './src/offline/serviceWorkerPlugin';

const LICENSE_FILE = 'third-party-licenses.md';

/** The star data is not an npm package, so Vite's notice leaves out its licence. */
const skyDataLicensePlugin = () => ({
  name: 'sky-data-license',
  apply: 'build',
  writeBundle(options) {
    const text = readFileSync('src/games/starMapper/sky/data/LICENSE', 'utf8');
    appendFileSync(join(options.dir, LICENSE_FILE), `\n## Star data (d3-celestial)\n\n${text}`);
  },
});

export default defineConfig({
  base: PRODUCT_ROOT,
  plugins: [
    react(),
    tailwindcss(),
    themeHeadPlugin(),
    serviceWorkerPlugin(),
    skyDataLicensePlugin(),
  ],
  // The default .vite/license.md is not copied by the deploy's `cp -r dist/*`.
  build: { license: { fileName: LICENSE_FILE } },
  // The consent banner is khe-sites', served at the games.khe.ee root (estate ADR-019).
  server: {
    proxy: {
      '/assets/analytics-consent.js': { target: 'https://games.khe.ee', changeOrigin: true },
    },
  },
});
