import type { ContentPack, LocaleCode } from '../../types';
import { MATH_TIME_READING_SKILL } from '../../skills/math';

export type TimeReadingFocus =
  | 'full_hour'
  | 'half_hour'
  | 'quarter_hour'
  | 'ten_minutes'
  | 'five_minutes'
  | 'near_hour'
  | 'digital'
  | 'mixed_review';

/**
 * How the answers read: `spoken` as a child says the time ("pool 4", "half past
 * 3"), `digital` as a 12-hour clock face ("3:05").
 */
export type TimeLabelStyle = 'spoken' | 'digital';

export interface TimeReadingStageItem {
  kind: 'stage';
  minLevel: number;
  maxLevel?: number;
  focus: TimeReadingFocus;
  learningOutcome: Record<LocaleCode, string>;
  labelStyle: TimeLabelStyle;
  stepMinutes: number;
  allowedMinutes?: readonly number[];
  optionCount: number;
  distractorMinuteOffsets: readonly number[];
}

const ITEMS: readonly TimeReadingStageItem[] = [
  {
    kind: 'stage',
    minLevel: 1,
    maxLevel: 1,
    focus: 'full_hour',
    learningOutcome: { et: 'Täistunni lugemine', en: 'Read full hours' },
    labelStyle: 'spoken',
    stepMinutes: 60,
    allowedMinutes: [0],
    optionCount: 3,
    distractorMinuteOffsets: [60, 120],
  },
  {
    kind: 'stage',
    minLevel: 2,
    maxLevel: 2,
    focus: 'half_hour',
    learningOutcome: { et: 'Täis- ja pooltunni eristamine', en: 'Read full and half hours' },
    labelStyle: 'spoken',
    stepMinutes: 30,
    allowedMinutes: [0, 30],
    optionCount: 3,
    distractorMinuteOffsets: [30, 60, 90],
  },
  {
    kind: 'stage',
    minLevel: 3,
    maxLevel: 4,
    focus: 'quarter_hour',
    learningOutcome: { et: 'Veerandtundide lugemine', en: 'Read quarter hours' },
    labelStyle: 'spoken',
    stepMinutes: 15,
    allowedMinutes: [0, 15, 30, 45],
    optionCount: 4,
    distractorMinuteOffsets: [15, 30, 45],
  },
  {
    kind: 'stage',
    minLevel: 5,
    maxLevel: 5,
    focus: 'ten_minutes',
    learningOutcome: { et: '10-minutilise täpsusega aeg', en: 'Read time to 10 minutes' },
    labelStyle: 'digital',
    stepMinutes: 10,
    optionCount: 4,
    distractorMinuteOffsets: [10, 20, 30],
  },
  {
    kind: 'stage',
    minLevel: 6,
    maxLevel: 7,
    focus: 'five_minutes',
    learningOutcome: { et: '5-minutilise täpsusega aeg', en: 'Read time to 5 minutes' },
    labelStyle: 'digital',
    stepMinutes: 5,
    optionCount: 5,
    distractorMinuteOffsets: [5, 10, 15, 30],
  },
  {
    kind: 'stage',
    minLevel: 8,
    maxLevel: 9,
    focus: 'near_hour',
    learningOutcome: {
      et: 'Aeg vahetult enne ja pärast täistundi',
      en: 'Read times just before and after the hour',
    },
    labelStyle: 'digital',
    stepMinutes: 5,
    allowedMinutes: [0, 5, 10, 50, 55],
    optionCount: 5,
    distractorMinuteOffsets: [5, 10, 15, 60],
  },
  {
    kind: 'stage',
    minLevel: 10,
    maxLevel: 12,
    focus: 'digital',
    learningOutcome: {
      et: 'Osutitega kella aeg numbritega',
      en: 'Match the clock hands to digital time',
    },
    labelStyle: 'digital',
    stepMinutes: 5,
    optionCount: 6,
    distractorMinuteOffsets: [5, 10, 15, 30, 60],
  },
  {
    kind: 'stage',
    minLevel: 13,
    focus: 'mixed_review',
    learningOutcome: {
      et: 'Segatud kordus 5-minutilise täpsusega',
      en: 'Mixed review to 5 minutes',
    },
    labelStyle: 'digital',
    stepMinutes: 5,
    optionCount: 6,
    distractorMinuteOffsets: [5, 10, 15, 20, 30, 45, 60],
  },
];

export function getTimeReadingStage(
  items: readonly TimeReadingStageItem[],
  level: number,
): TimeReadingStageItem {
  const stage = items.find(
    (item) => level >= item.minLevel && (item.maxLevel === undefined || level <= item.maxLevel),
  );
  if (!stage) {
    throw new Error(`No time reading stage found for level ${level}`);
  }
  return stage;
}

export const MATH_TIME_READING_PACK: ContentPack<TimeReadingStageItem> = {
  id: 'math.time_reading.core',
  skillId: MATH_TIME_READING_SKILL.id,
  locale: 'et',
  version: '1.2.0',
  title: {
    et: 'Kellaaja lugemise astmed',
    en: 'Reading time stages',
  },
  items: ITEMS,
};
