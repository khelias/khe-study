import type { Translations } from '../../i18n';
import type { TimeMatchProblem } from '../../types/game';

/**
 * The label a child reads for a canonical time ("3:30"). Spoken labels count
 * the way each language does: Estonian toward the next hour ("pool 4"),
 * English from the current one ("half past 3"), both "quarter to" the next.
 */
export function timeMatchLabel(
  time: string,
  style: TimeMatchProblem['labelStyle'],
  t: Translations,
): string {
  if (style === 'digital') return time;
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const labels = t.gameScreen.timeMatch;
  const templates: Partial<Record<number, string>> = {
    0: labels.oClock,
    15: labels.quarterPast,
    30: labels.halfPast,
    45: labels.quarterTo,
  };
  const template = templates[minute];
  if (!template) return time;
  return template.replace('{hour}', String(hour)).replace('{nextHour}', String((hour % 12) + 1));
}
