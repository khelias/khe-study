import type { Translations } from '../i18n';

const resolveUnitLabel = (t: Translations, unit: string, count?: number): string => {
  // One takes the singular: "1 meeter", not "1 meetrit".
  const units = count === 1 ? t.unitConversion.unitsOne : t.unitConversion.units;
  return units[unit as keyof typeof units] ?? unit;
};

export const buildUnitConversionQuestion = (
  t: Translations,
  value: number,
  fromUnit: string,
  toUnit: string,
): string => {
  const fromLabel = resolveUnitLabel(t, fromUnit, value);
  const toLabel = resolveUnitLabel(t, toUnit);
  return t.unitConversion.question
    .replace('{to}', toLabel)
    .replace('{value}', String(value))
    .replace('{from}', fromLabel);
};
