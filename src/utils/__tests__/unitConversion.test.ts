import { describe, expect, it } from 'vitest';
import { buildUnitConversionQuestion } from '../unitConversion';
import { et } from '../../i18n/locales/et';
import { en as enLocale } from '../../i18n/locales/en';
import type { Translations } from '../../i18n';

const en = enLocale as unknown as Translations;

describe('buildUnitConversionQuestion', () => {
  it('counts more than one with the partitive', () => {
    expect(buildUnitConversionQuestion(et, 2, 'm', 'cm')).toBe('Mitu sentimeetrit on 2 meetrit?');
  });

  it('takes the singular after one', () => {
    expect(buildUnitConversionQuestion(et, 1, 'm', 'cm')).toBe('Mitu sentimeetrit on 1 meeter?');
    expect(buildUnitConversionQuestion(en, 1, 'kg', 'g')).toBe('How many grams are in 1 kilogram?');
  });
});
