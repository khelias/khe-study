import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    // Vitest replaces (not merges) default excludes when this is set, so restate
    // the defaults with glob prefixes; bare "node_modules/" does not match nested paths.
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/engine/**/*.{ts,tsx}',
        'src/stores/**/*.{ts,tsx}',
        'src/games/**/*.{ts,tsx}',
        'src/curriculum/**/*.{ts,tsx}',
        'src/services/persistence/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/__tests__/**',
        '**/types.ts',
        'src/services/persistence/index.ts',
        '**/*.config.js',
        '**/*.config.ts',
        '**/main.jsx',
        'dist/',
        // Per-mechanic view components (ADR-0001 colocation). These are
        // presentational React views — historically they lived in
        // src/components/gameViews/ (outside the coverage scope) and moved into
        // src/games/<mechanic>/View.tsx during Phase 1.6. Coverage stays focused
        // on logic (generators, validators, engine), per "logic in engine, not
        // components". Interaction behaviour is covered by the Playwright E2E suite.
        'src/games/**/View.tsx',
      ],
      thresholds: {
        lines: 54,
        functions: 58,
        branches: 44,
        statements: 54,
        'src/engine/**': {
          lines: 64,
          functions: 80,
          branches: 60,
          statements: 65,
        },
        'src/stores/**': {
          lines: 40,
          functions: 50,
          branches: 15,
          statements: 40,
        },
        'src/games/**': {
          lines: 49,
          functions: 43,
          branches: 40,
          statements: 48,
        },
        'src/curriculum/**': {
          lines: 85,
          functions: 75,
          branches: 65,
          statements: 85,
        },
        'src/services/persistence/**': {
          lines: 80,
          functions: 85,
          branches: 70,
          statements: 80,
        },
      },
    },
  },
});
