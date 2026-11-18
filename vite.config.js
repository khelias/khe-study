import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { PRODUCT_ROOT } from './src/theme/productRoot';
import { themeHeadPlugin } from './src/theme/themeHead';
import { serviceWorkerPlugin } from './src/offline/serviceWorkerPlugin';

export default defineConfig({
  base: PRODUCT_ROOT,
  plugins: [react(), tailwindcss(), themeHeadPlugin(), serviceWorkerPlugin()],
  // The default .vite/license.md is not copied by the deploy's `cp -r dist/*`.
  build: { license: { fileName: 'third-party-licenses.md' } },
  // The consent banner is khe-sites', served at the games.khe.ee root (estate ADR-019).
  server: {
    proxy: {
      '/assets/analytics-consent.js': { target: 'https://games.khe.ee', changeOrigin: true },
    },
  },
});
