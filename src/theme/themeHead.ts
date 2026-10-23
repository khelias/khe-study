import type { Plugin } from 'vite';
import { themeInitScript } from '@khelias/ui/theme';
import { THEME_STORAGE_KEY } from './themeKey';

/** Puts the inline script that applies a stored theme before first paint at the top of `<head>`. */
export function themeHeadPlugin(): Plugin {
  return {
    name: 'khe-theme-head',
    transformIndexHtml: () => [
      { tag: 'script', children: themeInitScript(THEME_STORAGE_KEY), injectTo: 'head-prepend' },
    ],
  };
}
