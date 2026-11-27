import { bob, circle, join, poly, sway } from './shapes';
import type { Creature, Point } from './types';

// Luik: a swan flying along the Milky Way, Deneb its tail and Albireo its
// head; the wings beat.
const ROOT_A: Point = [-31, -30];
const ROOT_B: Point = [-27, -40];

export const CYGNUS: Creature = {
  id: 'cygnus',
  anchors: [102098, 100453, 98110, 95947, 102488, 97165],
  parts: [
    {
      id: 'body',
      d: join(
        'M-57 -74 Q-68 -32 -22 -15 Q-12 -60 -57 -74 Z',
        'M-22 -15 Q22 18 30 34 Q58 82 85 97',
        circle([88, 100], 5),
        poly([92, 104], [100, 112]),
        poly([-57, -74], [-64, -88]),
        poly([-50, -76], [-50, -90]),
      ),
    },
    {
      id: 'wingA',
      d: join(
        'M-34 -34 Q-82 -10 -77 39 Q-60 8 -28 -24',
        poly([-50, -20], [-66, 6]),
        poly([-60, -10], [-72, 22]),
      ),
    },
    {
      id: 'wingB',
      d: join(
        'M-28 -42 Q0 -80 44 -72 Q10 -54 -22 -30',
        poly([-6, -56], [16, -72]),
        poly([8, -60], [30, -72]),
      ),
    },
  ],
  motions: [
    { part: '*', origin: [0, 0], frames: bob(5, 8) },
    { part: 'wingA', origin: ROOT_A, frames: sway(-18, 0.6) },
    { part: 'wingB', origin: ROOT_B, frames: sway(18, 0.6) },
  ],
  durationMs: 2600,
};
