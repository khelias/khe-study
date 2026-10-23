import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../meta/contrast';
import { DARK, HEADING_TEXT, LIGHT, SMALL_TEXT } from '../test/tokenValues';

// happy-dom replaces the global URL, which node:fs does not accept, so resolve from the cwd.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

/** Custom properties of the first block whose selector list starts with `selector`. */
function cssBlock(selector: string): Map<string, string> {
  const escaped = selector.replace(/[[\]().*+?^$|\\]/g, '\\$&');
  const open = new RegExp(`^[ \\t]*${escaped}[^{]*\\{`, 'm').exec(css);
  if (open === null) throw new Error(`index.css has no ${selector} block`);
  const bodyStart = open.index + open[0].length;
  const body = css.slice(bodyStart, css.indexOf('}', bodyStart));
  const properties = new Map<string, string>();
  for (const declaration of body.split(';')) {
    const trimmed = declaration.trim();
    if (!trimmed.startsWith('--')) continue;
    const colon = trimmed.indexOf(':');
    properties.set(
      trimmed.slice(2, colon).trim(),
      trimmed
        .slice(colon + 1)
        .trim()
        .toLowerCase(),
    );
  }
  return properties;
}

const light = cssBlock(':root,');
const systemDark = cssBlock(":root:not([data-theme='light']),");
const forcedDark = cssBlock(":root[data-theme='dark'],");
const grounds = ['paper', 'surface', 'sunken'] as const;

describe('design tokens in src/index.css', () => {
  it('hold the light values', () => {
    for (const [name, value] of Object.entries(LIGHT)) expect(light.get(name), name).toBe(value);
  });

  it('hold the dark values', () => {
    for (const [name, value] of Object.entries(DARK))
      expect(forcedDark.get(name), name).toBe(value);
  });

  it('give the system-dark block the values of [data-theme="dark"]', () => {
    expect(forcedDark.size).toBeGreaterThan(0);
    expect(systemDark).toEqual(forcedDark);
  });

  it('give every rule under the system-dark selector a twin under [data-theme="dark"]', () => {
    const SYSTEM = ":root:not([data-theme='light'])";
    const FORCED = ":root[data-theme='dark']";
    const rules = (prefix: string) => {
      const found = new Map<string, string>();
      for (const match of css.matchAll(/^[ \t]*([^{}@/;]+)\{([^}]*)\}/gm)) {
        const selectors = match[1]!.split(',').map((part) => part.trim());
        if (!selectors.every((selector) => selector.startsWith(prefix))) continue;
        const rest = selectors.map((selector) => selector.slice(prefix.length)).join(',');
        found.set(rest, match[2]!.replace(/\s+/g, ' ').trim());
      }
      return found;
    };
    const system = rules(SYSTEM);
    expect(system.size).toBeGreaterThan(2);
    expect(rules(FORCED)).toEqual(system);
  });

  it('set every light token in dark too', () => {
    const colourTokens = [...light.keys()].filter((name) => name !== 'float-shadow');
    for (const name of colourTokens) expect(forcedDark.has(name), name).toBe(true);
  });

  it.each([
    ['light', LIGHT],
    ['dark', DARK],
  ] as const)('keep text readable on every %s ground', (_mode, values) => {
    for (const ground of grounds) {
      expect(
        contrastRatio(values[HEADING_TEXT], values[ground]),
        `${HEADING_TEXT} on ${ground}`,
      ).toBeGreaterThanOrEqual(7);
      for (const text of SMALL_TEXT) {
        expect(
          contrastRatio(values[text], values[ground]),
          `${text} on ${ground}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
