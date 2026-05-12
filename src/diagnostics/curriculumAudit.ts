import '../curriculum';
import '../games/registrations';

import { contentPackRegistry, skillRegistry } from '../curriculum';
import type { AnyContentPack, LocaleCode, Skill, SkillId } from '../curriculum';
import { gameRegistry } from '../games/registry';
import type { GameRegistryEntry } from '../games/registry';

export type ContentPackConsumerMode = 'direct-pack' | 'skill-locale';

export interface ContentPackConsumer {
  gameId: string;
  mechanic: string;
  mode: ContentPackConsumerMode;
}

export interface ContentPackAuditRow {
  packId: string;
  skillId: SkillId;
  skillName: Record<LocaleCode, string>;
  learningTarget: string;
  locale: LocaleCode;
  skillLocales: LocaleCode[];
  itemCount: number;
  itemKinds: Record<string, number>;
  difficultySignals: string[];
  hasEmbeddedLocalization: boolean;
  consumers: ContentPackConsumer[];
  warnings: string[];
}

export interface SkillContentAuditRow {
  skillId: SkillId;
  skillName: Record<LocaleCode, string>;
  learningTarget: string;
  packIds: string[];
  locales: LocaleCode[];
  consumerGameIds: string[];
  warnings: string[];
}

export interface CurriculumAuditReport {
  summary: {
    totalSkills: number;
    totalPacks: number;
    totalGameBindings: number;
    packsBelowMinimum: number;
    shallowPacks: number;
    unboundPacks: number;
    skillsWithoutPacks: number;
    skillsWithoutConsumers: number;
  };
  packs: ContentPackAuditRow[];
  skills: SkillContentAuditRow[];
}

const DEFAULT_MINIMUM_ITEM_COUNT = 6;
const OPEN_ENDED = 'open-ended';

interface AuditOptions {
  minimumItemCount?: number;
}

interface LevelBounds {
  min: number;
  max?: number;
  hasOpenEndedMax: boolean;
}

interface ArithmeticSpecCoverage {
  covered: boolean;
  signals: string[];
}

const EXPECTED_ARITHMETIC_OPS_BY_SKILL_PREFIX: Record<string, readonly string[]> = {
  'math.addition_': ['add_result', 'add_missing'],
  'math.subtraction_': ['sub_result', 'sub_missing_minuend', 'sub_missing_subtrahend'],
  'math.multiplication_': ['mul_result', 'mul_missing'],
  'math.division_': ['div_result', 'div_missing'],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function uniqueSorted<T extends string | number>(values: readonly T[]): T[] {
  return Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b)));
}

function increment(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function collectItemKinds(items: readonly unknown[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    if (isRecord(item) && typeof item.kind === 'string') {
      increment(counts, item.kind);
    }
  }
  return counts;
}

function collectDifficultyValues(items: readonly unknown[]): string[] {
  const values: string[] = [];
  for (const item of items) {
    if (isRecord(item) && typeof item.difficulty === 'string') {
      values.push(item.difficulty);
    }
  }
  return uniqueSorted(values);
}

function collectLevelBounds(items: readonly unknown[]): LevelBounds | null {
  let min: number | undefined;
  let max: number | undefined;
  let hasAnyLevel = false;
  let hasOpenEndedMax = false;

  for (const item of items) {
    if (!isRecord(item)) continue;

    if (typeof item.level === 'number') {
      min = Math.min(min ?? item.level, item.level);
      max = Math.max(max ?? item.level, item.level);
      hasAnyLevel = true;
    }

    if (typeof item.minLevel === 'number') {
      min = Math.min(min ?? item.minLevel, item.minLevel);
      hasAnyLevel = true;
      if (typeof item.maxLevel === 'number') {
        max = Math.max(max ?? item.maxLevel, item.maxLevel);
      } else {
        hasOpenEndedMax = true;
      }
    }
  }

  return hasAnyLevel && min !== undefined ? { min, max, hasOpenEndedMax } : null;
}

function collectNumericRanges(items: readonly unknown[]): string[] {
  const ranges: string[] = [];

  for (const item of items) {
    if (!isRecord(item)) continue;

    for (const [key, value] of Object.entries(item)) {
      if (
        key.endsWith('Range') &&
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
      ) {
        ranges.push(`${key} ${value[0]}-${value[1]}`);
      }
    }
  }

  return uniqueSorted(ranges);
}

function getArithmeticOps(items: readonly unknown[]): string[] {
  const ops: string[] = [];

  for (const item of items) {
    if (isRecord(item) && typeof item.op === 'string') {
      ops.push(item.op);
    }
  }

  return uniqueSorted(ops);
}

function getExpectedArithmeticOps(skillId: SkillId): readonly string[] | null {
  const match = Object.entries(EXPECTED_ARITHMETIC_OPS_BY_SKILL_PREFIX).find(([prefix]) =>
    skillId.startsWith(prefix),
  );
  return match?.[1] ?? null;
}

function hasNumericRange(
  item: Record<string, unknown>,
  key: 'valueRange' | 'factorRange',
): boolean {
  const range = item[key];
  return (
    Array.isArray(range) &&
    range.length === 2 &&
    typeof range[0] === 'number' &&
    typeof range[1] === 'number' &&
    range[0] <= range[1]
  );
}

function inspectArithmeticSpecCoverage(
  skillId: SkillId,
  items: readonly unknown[],
): ArithmeticSpecCoverage {
  const ops = getArithmeticOps(items);
  if (ops.length === 0 || ops.length !== items.length) {
    return { covered: false, signals: [] };
  }

  const expectedOps = getExpectedArithmeticOps(skillId);
  if (!expectedOps) {
    return { covered: false, signals: [`arithmetic-spec=unclassified`, `ops=${ops.join(',')}`] };
  }

  const missingOps = expectedOps.filter((op) => !ops.includes(op));
  const records = items.filter(isRecord);
  const needsFactorRange =
    skillId.startsWith('math.multiplication_') || skillId.startsWith('math.division_');
  const needsValueRange =
    skillId.startsWith('math.addition_') || skillId.startsWith('math.subtraction_');
  const hasRequiredRanges = needsFactorRange
    ? records.every((item) => hasNumericRange(item, 'factorRange'))
    : !needsValueRange || records.every((item) => hasNumericRange(item, 'valueRange'));
  const unlockLevels = uniqueSorted(
    records
      .map((item) => item.unlockLevel)
      .filter((value): value is number => typeof value === 'number'),
  );
  const signals = [
    missingOps.length === 0 && hasRequiredRanges
      ? 'arithmetic-spec=covered'
      : 'arithmetic-spec=incomplete',
    `ops=${ops.join(',')}`,
  ];

  if (missingOps.length > 0) {
    signals.push(`missingOps=${missingOps.join(',')}`);
  }

  if (needsValueRange) {
    signals.push(`valueRanges=${hasRequiredRanges ? 'covered' : 'missing'}`);
  }

  if (needsFactorRange) {
    signals.push(`factorRanges=${hasRequiredRanges ? 'covered' : 'missing'}`);
  }

  if (unlockLevels.length > 0) {
    signals.push(`unlockLevels=${unlockLevels.join(',')}`);
  }

  return { covered: missingOps.length === 0 && hasRequiredRanges, signals };
}

function hasEmbeddedLocalization(value: unknown, depth = 0): boolean {
  if (depth > 8) return false;

  if (Array.isArray(value)) {
    return value.some((item) => hasEmbeddedLocalization(item, depth + 1));
  }

  if (!isRecord(value)) return false;

  if (typeof value.et === 'string' && typeof value.en === 'string') {
    return true;
  }

  if (typeof value.nameEt === 'string' && typeof value.nameEn === 'string') {
    return true;
  }

  return Object.values(value).some((item) => hasEmbeddedLocalization(item, depth + 1));
}

function summarizeDifficultySignals(skillId: SkillId, items: readonly unknown[]): string[] {
  const signals: string[] = [];
  const difficulties = collectDifficultyValues(items);
  const levelBounds = collectLevelBounds(items);
  const numericRanges = collectNumericRanges(items);
  const kinds = collectItemKinds(items);
  const kindNames = Object.keys(kinds).sort();
  const arithmeticSpecCoverage = inspectArithmeticSpecCoverage(skillId, items);

  if (difficulties.length > 0) {
    signals.push(`difficulty=${difficulties.join('/')}`);
  }

  if (levelBounds) {
    const max = levelBounds.hasOpenEndedMax ? OPEN_ENDED : (levelBounds.max ?? levelBounds.min);
    signals.push(`levels=${levelBounds.min}-${max}`);
  }

  signals.push(...numericRanges);

  if (kindNames.length > 0) {
    signals.push(`kinds=${kindNames.map((kind) => `${kind}:${kinds[kind] ?? 0}`).join(',')}`);
  }

  signals.push(...arithmeticSpecCoverage.signals);

  return signals;
}

function learningTargetForSkill(skill: Skill): string {
  const { taxonomy } = skill;
  const grade = taxonomy.grade === undefined ? undefined : `${taxonomy.grade}. klass`;
  return [taxonomy.subject, grade, taxonomy.level, taxonomy.topic].filter(Boolean).join(' / ');
}

function getConsumers(
  pack: AnyContentPack,
  games: readonly GameRegistryEntry[],
): ContentPackConsumer[] {
  const consumers: ContentPackConsumer[] = [];

  for (const game of games) {
    if (game.contentPackId === pack.id) {
      consumers.push({
        gameId: game.id,
        mechanic: game.config.mechanic ?? game.id,
        mode: 'direct-pack',
      });
      continue;
    }

    if (!game.contentPackId && game.skillIds?.includes(pack.skillId)) {
      consumers.push({
        gameId: game.id,
        mechanic: game.config.mechanic ?? game.id,
        mode: 'skill-locale',
      });
    }
  }

  return consumers.sort((a, b) => a.gameId.localeCompare(b.gameId));
}

function buildPackWarnings(
  row: Pick<ContentPackAuditRow, 'itemCount' | 'consumers' | 'difficultySignals'>,
  minimumItemCount: number,
): string[] {
  const warnings: string[] = [];
  const hasCoveredArithmeticSpec = row.difficultySignals.includes('arithmetic-spec=covered');

  if (row.itemCount === 0) {
    warnings.push('empty_pack');
  } else if (row.itemCount < minimumItemCount && !hasCoveredArithmeticSpec) {
    warnings.push(`shallow_item_count<${minimumItemCount}`);
  }

  if (row.consumers.length === 0) {
    warnings.push('unbound_pack');
  }

  if (row.difficultySignals.length === 0) {
    warnings.push('no_explicit_difficulty_signal');
  }

  return warnings;
}

function buildSkillWarnings(
  packIds: readonly string[],
  consumerGameIds: readonly string[],
): string[] {
  const warnings: string[] = [];

  if (packIds.length === 0) {
    warnings.push('no_content_pack');
  }

  if (consumerGameIds.length === 0) {
    warnings.push('no_game_binding');
  }

  return warnings;
}

export function buildCurriculumAuditReport(options: AuditOptions = {}): CurriculumAuditReport {
  const minimumItemCount = options.minimumItemCount ?? DEFAULT_MINIMUM_ITEM_COUNT;
  const skills = skillRegistry.getAll().sort((a, b) => a.id.localeCompare(b.id));
  const packs = contentPackRegistry.getAll().sort((a, b) => a.id.localeCompare(b.id));
  const games = gameRegistry.getAll().sort((a, b) => a.id.localeCompare(b.id));

  const packRows = packs.map((pack): ContentPackAuditRow => {
    const skill = skillRegistry.get(pack.skillId);
    const skillPacks = contentPackRegistry.getBySkill(pack.skillId);
    const skillLocales = uniqueSorted(skillPacks.map((skillPack) => skillPack.locale));
    const consumers = getConsumers(pack, games);
    const difficultySignals = summarizeDifficultySignals(pack.skillId, pack.items);
    const baseRow = {
      packId: pack.id,
      skillId: pack.skillId,
      skillName: skill?.name ?? { et: pack.skillId, en: pack.skillId },
      learningTarget: skill ? learningTargetForSkill(skill) : 'unknown skill',
      locale: pack.locale,
      skillLocales,
      itemCount: pack.items.length,
      itemKinds: collectItemKinds(pack.items),
      difficultySignals,
      hasEmbeddedLocalization: hasEmbeddedLocalization(pack.items),
      consumers,
    };

    return {
      ...baseRow,
      warnings: buildPackWarnings(baseRow, minimumItemCount),
    };
  });

  const skillRows = skills.map((skill): SkillContentAuditRow => {
    const skillPacks = packs.filter((pack) => pack.skillId === skill.id);
    const consumerGameIds = games
      .filter((game) => game.skillIds?.includes(skill.id))
      .map((game) => game.id)
      .sort((a, b) => a.localeCompare(b));
    const locales = skillPacks.map((pack) => pack.locale);

    return {
      skillId: skill.id,
      skillName: skill.name,
      learningTarget: learningTargetForSkill(skill),
      packIds: skillPacks.map((pack) => pack.id).sort((a, b) => a.localeCompare(b)),
      locales: uniqueSorted(locales),
      consumerGameIds,
      warnings: buildSkillWarnings(
        skillPacks.map((pack) => pack.id),
        consumerGameIds,
      ),
    };
  });

  return {
    summary: {
      totalSkills: skills.length,
      totalPacks: packs.length,
      totalGameBindings: games.length,
      packsBelowMinimum: packRows.filter((row) => row.itemCount < minimumItemCount).length,
      shallowPacks: packRows.filter((row) =>
        row.warnings.includes(`shallow_item_count<${minimumItemCount}`),
      ).length,
      unboundPacks: packRows.filter((row) => row.consumers.length === 0).length,
      skillsWithoutPacks: skillRows.filter((row) => row.packIds.length === 0).length,
      skillsWithoutConsumers: skillRows.filter((row) => row.consumerGameIds.length === 0).length,
    },
    packs: packRows,
    skills: skillRows,
  };
}
