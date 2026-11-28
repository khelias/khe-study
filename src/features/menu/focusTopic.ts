import type { Translations } from '../../i18n';
import { getLocale } from '../../i18n';
import { skillRegistry } from '../../curriculum';
import type { ParentFocus } from '../../meta/types';

/** A skill's name in the current language. */
export const skillName = (skillId: string): string =>
  skillRegistry.get(skillId)?.name[getLocale()] ?? skillId;

/** A subject's name, as the picker's headings call it. */
export const subjectName = (t: Translations, subject: string): string =>
  t.categories[subject as keyof typeof t.categories]?.name ?? subject;

/** What a parent's focus is called on the path and in the parent's list. */
export const focusTopic = (t: Translations, focus: ParentFocus): string =>
  focus.kind === 'skill' ? skillName(focus.skillId) : subjectName(t, focus.subject);
