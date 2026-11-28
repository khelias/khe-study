import type { ContentPack, LocaleCode } from '../../types';
import { MATH_UNIT_CONVERSIONS_SKILL } from '../../skills/math';

export type UnitConversionCategory = 'length' | 'mass' | 'volume';
export type UnitConversionFocus =
  | 'first_length_mass'
  | 'add_volume'
  | 'starter_mixed_review'
  | 'advanced_core_units'
  | 'advanced_large_units'
  | 'advanced_wide_range'
  | 'advanced_fluent_review';

export interface UnitConversionDefinitionItem {
  kind: 'conversion';
  id: string;
  category: UnitConversionCategory;
  from: string;
  to: string;
  factor: number;
  emoji: string;
}

export interface UnitConversionStageItem {
  kind: 'stage';
  minLevel: number;
  maxLevel?: number;
  focus: UnitConversionFocus;
  learningOutcome: Record<LocaleCode, string>;
  conversionIds: readonly string[];
  minValue: number;
  maxValue: number;
  optionCount: number;
}

export type UnitConversionItem = UnitConversionDefinitionItem | UnitConversionStageItem;

const CONVERSIONS: readonly UnitConversionDefinitionItem[] = [
  {
    kind: 'conversion',
    id: 'length_m_cm',
    category: 'length',
    from: 'm',
    to: 'cm',
    factor: 100,
    emoji: '📏',
  },
  {
    kind: 'conversion',
    id: 'length_km_m',
    category: 'length',
    from: 'km',
    to: 'm',
    factor: 1000,
    emoji: '📐',
  },
  {
    kind: 'conversion',
    id: 'length_cm_mm',
    category: 'length',
    from: 'cm',
    to: 'mm',
    factor: 10,
    emoji: '📏',
  },
  {
    kind: 'conversion',
    id: 'mass_kg_g',
    category: 'mass',
    from: 'kg',
    to: 'g',
    factor: 1000,
    emoji: '⚖️',
  },
  {
    kind: 'conversion',
    id: 'mass_t_kg',
    category: 'mass',
    from: 't',
    to: 'kg',
    factor: 1000,
    emoji: '🏋️',
  },
  {
    kind: 'conversion',
    id: 'volume_l_ml',
    category: 'volume',
    from: 'l',
    to: 'ml',
    factor: 1000,
    emoji: '🧪',
  },
  {
    kind: 'conversion',
    id: 'volume_l_dl',
    category: 'volume',
    from: 'l',
    to: 'dl',
    factor: 10,
    emoji: '🥛',
  },
];

const STAGES: readonly UnitConversionStageItem[] = [
  {
    kind: 'stage',
    minLevel: 1,
    maxLevel: 3,
    focus: 'first_length_mass',
    learningOutcome: {
      et: 'Esimesed pikkuse ja massi teisendused',
      en: 'First length and mass conversions',
    },
    conversionIds: ['length_m_cm', 'mass_kg_g'],
    minValue: 1,
    maxValue: 5,
    optionCount: 4,
  },
  {
    kind: 'stage',
    minLevel: 4,
    maxLevel: 5,
    focus: 'add_volume',
    learningOutcome: {
      et: 'Lisanduvad liitri ja milliliitri teisendused',
      en: 'Add litre and millilitre conversions',
    },
    conversionIds: ['length_m_cm', 'mass_kg_g', 'volume_l_ml'],
    minValue: 1,
    maxValue: 10,
    optionCount: 4,
  },
  {
    kind: 'stage',
    minLevel: 6,
    maxLevel: 7,
    focus: 'starter_mixed_review',
    learningOutcome: {
      et: 'Segatud kordus tuttavate ühikutega',
      en: 'Mixed review with familiar units',
    },
    conversionIds: ['length_m_cm', 'mass_kg_g', 'volume_l_ml', 'volume_l_dl'],
    minValue: 1,
    maxValue: 20,
    optionCount: 4,
  },
  {
    kind: 'stage',
    minLevel: 8,
    maxLevel: 10,
    focus: 'advanced_core_units',
    learningOutcome: {
      et: 'Põhiühikute teisendamine suuremate arvudega',
      en: 'Core unit conversions with larger numbers',
    },
    conversionIds: ['length_m_cm', 'mass_kg_g', 'volume_l_ml', 'volume_l_dl'],
    minValue: 10,
    maxValue: 50,
    optionCount: 4,
  },
  {
    kind: 'stage',
    minLevel: 11,
    maxLevel: 14,
    focus: 'advanced_large_units',
    learningOutcome: {
      et: 'Kilomeetri ja tonni kaasamine',
      en: 'Include kilometre and tonne conversions',
    },
    conversionIds: [
      'length_m_cm',
      'length_km_m',
      'length_cm_mm',
      'mass_kg_g',
      'mass_t_kg',
      'volume_l_ml',
      'volume_l_dl',
    ],
    minValue: 50,
    maxValue: 100,
    optionCount: 4,
  },
  {
    kind: 'stage',
    minLevel: 15,
    maxLevel: 17,
    focus: 'advanced_wide_range',
    learningOutcome: {
      et: 'Kõigi ühikute teisendamine laiemas arvupiirkonnas',
      en: 'Convert all units across a wider number range',
    },
    conversionIds: [
      'length_m_cm',
      'length_km_m',
      'length_cm_mm',
      'mass_kg_g',
      'mass_t_kg',
      'volume_l_ml',
      'volume_l_dl',
    ],
    minValue: 100,
    maxValue: 500,
    optionCount: 4,
  },
  {
    kind: 'stage',
    minLevel: 18,
    focus: 'advanced_fluent_review',
    learningOutcome: {
      et: 'Sorav segakordus kõigi teisendustega',
      en: 'Fluent mixed review with all conversions',
    },
    conversionIds: [
      'length_m_cm',
      'length_km_m',
      'length_cm_mm',
      'mass_kg_g',
      'mass_t_kg',
      'volume_l_ml',
      'volume_l_dl',
    ],
    minValue: 100,
    maxValue: 1000,
    optionCount: 4,
  },
];

const ITEMS: readonly UnitConversionItem[] = [...CONVERSIONS, ...STAGES];

export function getUnitConversionsByCategory(
  items: readonly UnitConversionItem[],
): Record<UnitConversionCategory, UnitConversionDefinitionItem[]> {
  const conversions = items.filter(
    (item): item is UnitConversionDefinitionItem => item.kind === 'conversion',
  );

  return {
    length: conversions.filter((item) => item.category === 'length'),
    mass: conversions.filter((item) => item.category === 'mass'),
    volume: conversions.filter((item) => item.category === 'volume'),
  };
}

export function getUnitConversionItems(
  items: readonly UnitConversionItem[],
): UnitConversionDefinitionItem[] {
  return items.filter((item): item is UnitConversionDefinitionItem => item.kind === 'conversion');
}

/** The stage of the pack's one level ladder (growth table): no level easier than the one below. */
export function getUnitConversionStage(
  items: readonly UnitConversionItem[],
  level = 1,
): UnitConversionStageItem {
  const stage = items.find(
    (item): item is UnitConversionStageItem =>
      item.kind === 'stage' &&
      level >= item.minLevel &&
      (item.maxLevel === undefined || level <= item.maxLevel),
  );
  if (!stage) {
    throw new Error(`No unit conversion stage found for level ${level}`);
  }
  return stage;
}

export const MATH_UNIT_CONVERSIONS_PACK: ContentPack<UnitConversionItem> = {
  id: 'math.unit_conversions.core',
  skillId: MATH_UNIT_CONVERSIONS_SKILL.id,
  locale: 'et',
  version: '1.2.0',
  title: {
    et: 'Ühikute teisendused',
    en: 'Unit conversions',
  },
  items: ITEMS,
};
