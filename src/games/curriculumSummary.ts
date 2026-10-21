import type { AnyContentPack, LocaleCode } from '../curriculum/types';
import { contentPackRegistry, skillRegistry } from '../curriculum/registry';
import type { Difficulty } from '../types/game';
import { gameRegistry, type GameRegistryEntry } from './registry';

// Menu routes do not mount gameplay hooks, so load registrations here before
// reading game -> skill/content-pack bindings.
import './registrations';

export interface GameCurriculumSummary {
  packId: string;
  packTitle: string;
  skillName: string | null;
  itemCount: number;
  difficultyLabels: readonly string[];
  focusLabels: readonly string[];
  label: string;
  /** `label` without the pack title, for a card whose description already names it. */
  detail: string;
  title: string;
}

const DIFFICULTY_ORDER: readonly Difficulty[] = ['easy', 'medium', 'hard'];

const DIFFICULTY_LABELS: Record<LocaleCode, Record<Difficulty, string>> = {
  et: {
    easy: 'lihtne',
    medium: 'keskmine',
    hard: 'raske',
  },
  en: {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getLocalizedText(value: unknown, locale: LocaleCode): string | null {
  if (typeof value === 'string') return value;
  if (!isRecord(value)) return null;

  const localized = value[locale] ?? value.en ?? value.et;
  return typeof localized === 'string' ? localized : null;
}

function getStringField(item: unknown, field: string): string | null {
  if (!isRecord(item)) return null;
  const value = item[field];
  return typeof value === 'string' ? value : null;
}

function getPackTitle(pack: AnyContentPack, locale: LocaleCode): string {
  return getLocalizedText(pack.title, locale) ?? pack.id;
}

function getSkillName(pack: AnyContentPack, locale: LocaleCode): string | null {
  const skill = skillRegistry.get(pack.skillId);
  return getLocalizedText(skill?.name, locale);
}

function getPackForEntry(entry: GameRegistryEntry, locale: LocaleCode): AnyContentPack | null {
  if (entry.contentPackId) {
    return contentPackRegistry.get(entry.contentPackId) ?? null;
  }

  for (const skillId of entry.skillIds ?? []) {
    const pack =
      contentPackRegistry.findBySkillAndLocale(skillId, locale) ??
      contentPackRegistry.getBySkill(skillId)[0];
    if (pack) return pack;
  }

  return null;
}

function getDifficultyLabels(pack: AnyContentPack, locale: LocaleCode): string[] {
  const present = new Set<string>();
  for (const item of pack.items) {
    const difficulty = getStringField(item, 'difficulty');
    if (difficulty) present.add(difficulty);
  }

  return DIFFICULTY_ORDER.filter((difficulty) => present.has(difficulty)).map(
    (difficulty) => DIFFICULTY_LABELS[locale][difficulty],
  );
}

function slugToLabel(slug: string): string {
  return slug.replace(/[_-]+/g, ' ');
}

function getFocusLabels(pack: AnyContentPack, locale: LocaleCode): string[] {
  const labelsByFocus = new Map<string, string>();

  for (const item of pack.items) {
    const focus = getStringField(item, 'focus');
    if (!focus || labelsByFocus.has(focus)) continue;

    const label = isRecord(item) ? getLocalizedText(item.learningOutcome, locale) : null;
    labelsByFocus.set(focus, label ?? slugToLabel(focus));
  }

  return Array.from(labelsByFocus.values());
}

function formatFocusCount(count: number, locale: LocaleCode): string {
  if (locale === 'et') {
    return count === 1 ? '1 fookus' : `${count} fookust`;
  }

  return count === 1 ? '1 focus area' : `${count} focus areas`;
}

function joinLabels(labels: readonly string[]): string {
  return labels.join(' / ');
}

export function getGameCurriculumSummary(
  gameId: string,
  locale: LocaleCode,
): GameCurriculumSummary | null {
  const entry = gameRegistry.get(gameId);
  if (!entry) return null;

  const pack = getPackForEntry(entry, locale);
  if (!pack) return null;

  const packTitle = getPackTitle(pack, locale);
  const skillName = getSkillName(pack, locale);
  const itemCount = pack.items.length;
  const difficultyLabels = getDifficultyLabels(pack, locale);
  const focusLabels = getFocusLabels(pack, locale);

  // No item count in the labels: an item is a word in one pack and a problem
  // generator in another, so the number misleads.
  const detailParts: string[] = [];
  if (difficultyLabels.length > 0) detailParts.push(joinLabels(difficultyLabels));
  if (focusLabels.length > 0) detailParts.push(formatFocusCount(focusLabels.length, locale));

  const titleParts = [packTitle];
  if (skillName) titleParts.push(skillName);
  if (difficultyLabels.length > 0) titleParts.push(joinLabels(difficultyLabels));
  if (focusLabels.length > 0) titleParts.push(joinLabels(focusLabels));

  return {
    packId: pack.id,
    packTitle,
    skillName,
    itemCount,
    difficultyLabels,
    focusLabels,
    label: [packTitle, ...detailParts].join(' · '),
    detail: detailParts.join(' · '),
    title: titleParts.join(' · '),
  };
}
