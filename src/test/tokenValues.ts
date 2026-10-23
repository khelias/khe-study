/**
 * The token values src/index.css sets, light and dark (khe-sites DESIGN.md, ADR 0004). The
 * token test checks the stylesheet against them, and the theme catalog test measures the shop
 * themes' grounds against them, so both read one copy.
 */
export const LIGHT = {
  paper: '#fafafa',
  surface: '#ffffff',
  sunken: '#eff1f1',
  ink: '#121415',
  'ink-2': '#363b3d',
  muted: '#5f6567',
  rule: '#e3e5e5',
  'rule-strong': '#c3c7c7',
  study: '#2f6b3a',
  ok: '#1b7341',
  bad: '#b42318',
  star: '#985600',
  heart: '#c42b3c',
  scrim: 'rgb(18 20 21 / 0.4)',
  'float-shadow': '0 12px 32px rgb(0 0 0 / 0.14)',
} as const;

export const DARK = {
  paper: '#0b0d0d',
  surface: '#121615',
  sunken: '#171c1b',
  ink: '#eef1f0',
  'ink-2': '#c4cac7',
  muted: '#8a928f',
  rule: '#232827',
  'rule-strong': '#3a413f',
  study: '#7cc28a',
  ok: '#6cc38f',
  bad: '#f0796c',
  star: '#e3a948',
  heart: '#f27a8b',
  scrim: 'rgb(0 0 0 / 0.6)',
  'float-shadow': '0 12px 32px rgb(0 0 0 / 0.5)',
} as const satisfies Record<keyof typeof LIGHT, string>;

/** Text colours that sit on a ground: headings need 7:1, the rest 4.5:1. */
export const HEADING_TEXT = 'ink';
export const SMALL_TEXT = ['ink-2', 'muted', 'ok', 'bad', 'star', 'heart'] as const;
