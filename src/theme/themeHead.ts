import type { Plugin } from 'vite';
import { themeInitScript } from '@khelias/ui/theme';
import { viewInitScript } from '@khelias/ui/view';
import { PRODUCT_ROOT } from './productRoot';
import { THEME_STORAGE_KEY } from './themeKey';

/** Puts the inline scripts that set the stored theme and the page's view before first paint at the top of `<head>`. */
export function themeHeadPlugin(): Plugin {
  return {
    name: 'khe-theme-head',
    transformIndexHtml: () => [
      { tag: 'script', children: themeInitScript(THEME_STORAGE_KEY), injectTo: 'head-prepend' },
      { tag: 'script', children: viewInitScript(PRODUCT_ROOT), injectTo: 'head-prepend' },
    ],
  };
}
