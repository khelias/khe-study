import { clamp } from '../sky/astro';
import type { Creature, CreatureKeyframe, CreatureMotion } from './types';

/** How long a creature's stroke takes to draw in before it moves. */
export const DRAW_IN_MS = 1200;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a = 0, b = 0, t: number) => a + (b - a) * t;

/** The pose between keyframes at t (0-1), eased per segment. */
export function poseAt(
  frames: readonly CreatureKeyframe[],
  t: number,
): { rotate: number; x: number; y: number } {
  const first = frames[0];
  if (!first) return { rotate: 0, x: 0, y: 0 };
  let a = first;
  let b = first;
  for (const f of frames) {
    if (f.at <= t) a = f;
    if (f.at >= t) {
      b = f;
      break;
    }
    b = f;
  }
  const span = b.at - a.at;
  const k = span > 0 ? ease((t - a.at) / span) : 0;
  return { rotate: lerp(a.rotate, b.rotate, k), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
}

const transformOf = (m: CreatureMotion, t: number): string => {
  const { rotate, x, y } = poseAt(m.frames, t);
  const [ox, oy] = m.origin;
  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotate.toFixed(2)} ${ox} ${oy})`;
};

/** Every part's SVG transform at t, '*' for the whole drawing; a part without motion is absent. */
export function partTransforms(creature: Creature, t: number): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of creature.motions) {
    const prev = out.get(m.part);
    const next = transformOf(m, t);
    out.set(m.part, prev ? `${prev} ${next}` : next);
  }
  return out;
}

/**
 * Where a creature is at `elapsedMs` since it appeared: the share of the
 * stroke drawn and the motion's t. Still (reduced motion, the atlas) is
 * the whole drawing at rest.
 */
export function timeline(creature: Creature, elapsedMs: number, still: boolean) {
  if (still) return { drawn: 1, t: 1 };
  return {
    drawn: clamp(elapsedMs / DRAW_IN_MS, 0, 1),
    t: clamp((elapsedMs - DRAW_IN_MS) / creature.durationMs, 0, 1),
  };
}
