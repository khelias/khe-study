import { describe, expect, it } from 'vitest';
import { generateTimeMatch, toTimeLabel } from '../generator';
import { timeMatchLabel } from '../labels';
import { createRng } from '../../../engine/rng';
import { et } from '../../../i18n/locales/et';
import { en as enLocale } from '../../../i18n/locales/en';
import type { Translations } from '../../../i18n';

const en = enLocale as unknown as Translations;

describe('timeMatchLabel', () => {
  it.each([
    ['3:00', 'kell 3', '3 o’clock'],
    ['3:30', 'pool 4', 'half past 3'],
    ['3:15', 'veerand 4', 'quarter past 3'],
    ['3:45', 'kolmveerand 4', 'quarter to 4'],
    ['12:00', 'kell 12', '12 o’clock'],
    ['12:30', 'pool 1', 'half past 12'],
    ['11:45', 'kolmveerand 12', 'quarter to 12'],
  ])('reads %s as "%s" and "%s"', (time, etLabel, enLabel) => {
    expect(timeMatchLabel(time, 'spoken', et)).toBe(etLabel);
    expect(timeMatchLabel(time, 'spoken', en)).toBe(enLabel);
  });

  it('shows the digital face as it is', () => {
    expect(timeMatchLabel('3:05', 'digital', et)).toBe('3:05');
  });
});

describe('generateTimeMatch', () => {
  const parse = (label: string) => label.split(':').map(Number) as [number, number];

  it('offers spoken labels for levels 1-4 and the digital face from level 5', () => {
    for (const level of [1, 2, 3, 4]) {
      expect(generateTimeMatch(level, createRng(level)).labelStyle).toBe('spoken');
    }
    for (const level of [5, 10, 13]) {
      expect(generateTimeMatch(level, createRng(level)).labelStyle).toBe('digital');
    }
  });

  it('keeps every option on the 12-hour dial, with no two the same time', () => {
    for (let level = 1; level <= 15; level++) {
      for (let seed = 1; seed <= 40; seed++) {
        const problem = generateTimeMatch(level, createRng(seed * 97 + level));
        expect(new Set(problem.options).size).toBe(problem.options.length);
        expect(problem.options).toContain(problem.answer);
        for (const option of problem.options) {
          const [hour, minute] = parse(option);
          expect(hour).toBeGreaterThanOrEqual(1);
          expect(hour).toBeLessThanOrEqual(12);
          expect(minute).toBeLessThan(60);
        }
        expect(problem.answer).toBe(toTimeLabel(problem.display.hour, problem.display.minute));
      }
    }
  });

  it('keeps spoken options on the quarter hours so each has a spoken name', () => {
    for (let seed = 1; seed <= 40; seed++) {
      for (const option of generateTimeMatch(4, createRng(seed)).options) {
        expect([0, 15, 30, 45]).toContain(parse(option)[1]);
      }
    }
  });
});
