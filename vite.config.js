import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { themeHeadPlugin } from './src/theme/themeHead';

export default defineConfig({
  base: '/study/',
  plugins: [react(), tailwindcss(), themeHeadPlugin()],
  // The default .vite/license.md is not copied by the deploy's `cp -r dist/*`.
  build: { license: { fileName: 'third-party-licenses.md' } },
  // The consent banner is khe-sites', served at the games.khe.ee root (estate ADR-019).
  server: {
    proxy: {
      '/assets/analytics-consent.js': { target: 'https://games.khe.ee', changeOrigin: true },
    },
  },
});
