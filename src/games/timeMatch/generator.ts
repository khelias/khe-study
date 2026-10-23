import { getPackItems } from '../../curriculum';
import {
  MATH_TIME_READING_PACK,
  getTimeReadingStage,
  type TimeReadingStageItem,
} from '../../curriculum/packs/math/time_reading';
import { getRandom, uid } from '../../engine/rng';
import type { RngFunction, TimeMatchProblem } from '../../types/game';

const MINUTES_PER_DIAL = 12 * 60;

/** A canonical 12-hour time: "3:05", "12:30". */
export const toTimeLabel = (hour12: number, minute: number): string =>
  `${hour12}:${minute.toString().padStart(2, '0')}`;

/** Minutes since 12:00 on the dial, wrapped onto it, as a canonical label. */
const dialLabel = (totalMinutes: number): string => {
  const wrapped = ((totalMinutes % MINUTES_PER_DIAL) + MINUTES_PER_DIAL) % MINUTES_PER_DIAL;
  return toTimeLabel(Math.floor(wrapped / 60) || 12, wrapped % 60);
};

/**
 * time_match generator. The clock has no day or night, so every time is on the
 * 12-hour dial: 03:00 and 15:00 are the same answer and never two options.
 */
export function generateTimeMatch(level: number, rng: RngFunction = Math.random): TimeMatchProblem {
  const stage = getTimeReadingStage(
    getPackItems<TimeReadingStageItem>(MATH_TIME_READING_PACK.id),
    level,
  );
  const minuteCandidates =
    stage.allowedMinutes ??
    Array.from({ length: 60 / stage.stepMinutes }, (_, index) => index * stage.stepMinutes);
  const hour12 = Math.floor(rng() * 12) + 1;
  const minute = getRandom(minuteCandidates, rng) ?? 0;
  const correct = toTimeLabel(hour12, minute);
  const opts = new Set([correct]);
  let safety = 0;
  while (opts.size < stage.optionCount && safety < 50) {
    safety++;
    const delta = getRandom(stage.distractorMinuteOffsets, rng) ?? stage.stepMinutes;
    const sign = rng() > 0.5 ? 1 : -1;
    opts.add(dialLabel((hour12 % 12) * 60 + minute + sign * delta));
  }
  while (opts.size < stage.optionCount) {
    const fallbackHour = Math.floor(rng() * 12) + 1;
    const fallbackMinute = getRandom(minuteCandidates, rng) ?? 0;
    opts.add(toTimeLabel(fallbackHour, fallbackMinute));
  }
  return {
    type: 'time_match',
    minutes: minute,
    display: { hour: hour12, minute },
    answer: correct,
    options: Array.from(opts).sort(() => rng() - 0.5),
    labelStyle: stage.labelStyle,
    uid: uid(rng),
  };
}
