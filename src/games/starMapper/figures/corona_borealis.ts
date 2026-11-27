import { circle, join, poly, spin } from './shapes';
import type { Creature, Point } from './types';

// Põhjakroon: a crown on the half ring of stars, spinning once.
const RING: readonly Point[] = [
  [23, -33],
  [35, -11],
  [21, 13],
  [3, 18],
  [-13, 20],
  [-31, 12],
  [-38, -19],
];
const INSIDE: Point = [-2, -30];
const tip = ([x, y]: Point): Point => {
  const dx = INSIDE[0] - x;
  const dy = INSIDE[1] - y;
  const len = Math.hypot(dx, dy);
  return [x + (dx / len) * 14, y + (dy / len) * 14];
};

export const CORONA_BOREALIS: Creature = {
  id: 'corona_borealis',
  anchors: [76127, 75695, 76267, 76952, 77512, 78159, 78493],
  parts: [
    {
      id: 'crown',
      d: join(
        poly(...RING),
        poly(...RING.map(([x, y]): Point => [x * 1.2, y * 1.2 + 4])),
        ...RING.slice(1, -1).map((p) => join(poly(p, tip(p)), circle(tip(p), 2.4))),
      ),
    },
  ],
  motions: [
    {
      part: '*',
      origin: [0, 0],
      frames: spin(360),
    },
  ],
  durationMs: 3000,
};
