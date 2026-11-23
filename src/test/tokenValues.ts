/**
 * The token values src/index.css sets, light and dark (khe-sites DESIGN.md, ADR 0004). The
 * token test checks the stylesheet against them, and the theme catalog test measures the shop
 * themes' grounds against them, so both read one copy.
 */
export const LIGHT = {
  paper: '#f6f6f2',
  surface: '#ffffff',
  sunken: '#eaeae4',
  ink: '#111315',
  'ink-2': '#3b3f42',
  muted: '#63686b',
  rule: '#e2e2db',
  'rule-strong': '#c6c6bd',
  study: '#2f6b3a',
  ok: '#1b7341',
  bad: '#b42318',
  star: '#985600',
  heart: '#c42b3c',
  scrim: 'rgb(18 20 21 / 0.4)',
  'float-shadow': '0 12px 32px rgb(0 0 0 / 0.14)',
} as const;

export const DARK = {
  paper: '#0c0e0f',
  surface: '#15181a',
  sunken: '#1d2124',
  ink: '#f1f2ee',
  'ink-2': '#c5c9c6',
  muted: '#8b928f',
  rule: '#252a2d',
  'rule-strong': '#3d4448',
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
