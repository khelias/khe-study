import { circle, join, poly } from './shapes';
import type { Creature, Point } from './types';

// Lüüra: a lyre on its parallelogram, Vega its jewel; the strings shimmer.
const C: Point = [-3, 32];
const D: Point = [-22, 38];
const strings = [0.2, 0.4, 0.6, 0.8].map((t) =>
  poly([-12 + 31 * t, -38 + 6 * t], [D[0] + (C[0] - D[0]) * t, D[1] + (C[1] - D[1]) * t]),
);

export const LYRA: Creature = {
  id: 'lyra',
  anchors: [91262, 91919, 91971, 92420, 93194, 92791],
  parts: [
    {
      id: 'frame',
      d: join(
        'M-22 38 Q-30 0 -12 -38',
        'M-3 32 Q21 2 19 -32',
        poly([-14, -39], [21, -32]),
        poly(D, C),
        circle([22, -23], 5),
      ),
    },
    { id: 'strings', d: join(...strings) },
  ],
  motions: [
    {
      part: 'strings',
      origin: [0, 0],
      frames: [
        { at: 0, x: 0 },
        { at: 0.1, x: 1.4 },
        { at: 0.2, x: -1.4 },
        { at: 0.3, x: 1.1 },
        { at: 0.4, x: -1.1 },
        { at: 0.55, x: 0.8 },
        { at: 0.7, x: -0.6 },
        { at: 0.85, x: 0.3 },
        { at: 1, x: 0 },
      ],
    },
  ],
  durationMs: 2400,
};
