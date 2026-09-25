import { describe, expect, it } from 'vitest';
import { en } from '../locales/en';
import { et } from '../locales/et';

// `en` is cast to `Translations` in `src/i18n/index.ts`, so a key missing in
// English compiles and renders blank. This catches it.
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('locale key parity', () => {
  it('has the same shop keys in et and en', () => {
    expect(keyPaths(en.shop).sort()).toEqual(keyPaths(et.shop).sort());
  });
});
