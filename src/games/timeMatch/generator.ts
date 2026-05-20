import { getPackItems } from '../../curriculum';
import {
  MATH_TIME_READING_PACK,
  getTimeReadingStage,
  type TimeReadingStageItem,
} from '../../curriculum/packs/math/time_reading';
import { getRandom, uid } from '../../engine/rng';
import type { RngFunction, TimeMatchProblem } from '../../types/game';

export function generateTimeMatch(level: number, rng: RngFunction = Math.random): TimeMatchProblem {
  const stage = getTimeReadingStage(
    getPackItems<TimeReadingStageItem>(MATH_TIME_READING_PACK.id),
    level,
  );
  const minuteCandidates =
    stage.allowedMinutes ??
    Array.from({ length: 60 / stage.stepMinutes }, (_, index) => index * stage.stepMinutes);
  const hour24 = Math.floor(rng() * 24);
  const minute = getRandom(minuteCandidates, rng) ?? 0;
  const toLabel = (h24: number, m: number) =>
    `${h24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  const toWrappedLabel = (totalMinutes: number) => {
    const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
    return toLabel(Math.floor(wrapped / 60), wrapped % 60);
  };
  const correct = toLabel(hour24, minute);
  const opts = new Set([correct]);
  let safety = 0;
  while (opts.size < stage.optionCount && safety < 50) {
    safety++;
    const delta = getRandom(stage.distractorMinuteOffsets, rng) ?? stage.stepMinutes;
    const sign = rng() > 0.5 ? 1 : -1;
    opts.add(toWrappedLabel(hour24 * 60 + minute + sign * delta));
  }
  while (opts.size < stage.optionCount) {
    const fallbackHour = Math.floor(rng() * 24);
    const fallbackMinute = getRandom(minuteCandidates, rng) ?? 0;
    opts.add(toLabel(fallbackHour, fallbackMinute));
  }
  return {
    type: 'time_match',
    hours: hour24,
    minutes: minute,
    display: { hour: hour24 % 12 || 12, minute },
    answer: correct,
    options: Array.from(opts).sort(() => rng() - 0.5),
    uid: uid(rng),
  };
}
