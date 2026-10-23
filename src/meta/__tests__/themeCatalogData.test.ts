import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../contrast';
import { THEME_CATALOG } from '../themeCatalog';
import { DARK, HEADING_TEXT, LIGHT, SMALL_TEXT } from '../../test/tokenValues';

const themesDir = resolve(process.cwd(), 'src/meta/themes');
const themeFolders = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => existsSync(resolve(themesDir, name, 'theme.json')));

/** The app's text colours of one theme mode that sit directly on the themed ground. */
function expectReadable(values: typeof LIGHT | typeof DARK, background: string) {
  expect(contrastRatio(values[HEADING_TEXT], background), HEADING_TEXT).toBeGreaterThanOrEqual(7);
  for (const text of SMALL_TEXT) {
    expect(contrastRatio(values[text], background), text).toBeGreaterThanOrEqual(4.5);
  }
}

describe('shipped theme catalog', () => {
  it('loads every theme.json without dropping any', () => {
    expect(THEME_CATALOG.map((t) => t.id).sort()).toEqual([...themeFolders].sort());
  });

  it('has exactly one default theme, and it is free', () => {
    const defaults = THEME_CATALOG.filter((t) => t.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]?.cost).toBe(0);
  });

  it.each(THEME_CATALOG.map((t) => [t.id, t.palette.background] as const))(
    '%s keeps app text readable on its light ground',
    (_id, background) => expectReadable(LIGHT, background),
  );

  it.each(THEME_CATALOG.map((t) => [t.id, t.palette.backgroundDark] as const))(
    '%s keeps app text readable on its dark ground',
    (_id, background) => expectReadable(DARK, background),
  );
});
