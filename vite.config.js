import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/study/',
  plugins: [react(), tailwindcss()],
  // The default .vite/license.md is not copied by the deploy's `cp -r dist/*`.
  build: { license: { fileName: 'third-party-licenses.md' } },
});
