import { circle, join, poly, sway } from './shapes';
import type { Creature, Point } from './types';

// Kaksikud: two twins hand in hand, Castor's and Pollux's heads; each waves.
const SHOULDER_A: Point = [-31, -54];
const SHOULDER_B: Point = [-62, -14];
const HANDS: Point = [-50, -30];

export const GEMINI: Creature = {
  id: 'gemini',
  anchors: [36850, 37826, 34693, 32246, 30343, 35550, 34088, 31681],
  parts: [
    {
      id: 'twins',
      d: join(
        circle([-65, -74], 9),
        poly([-57, -70], [-15, -55], [46, -5]),
        poly([46, -5], [96, 19]),
        poly([46, -5], [88, 38]),
        poly(SHOULDER_A, HANDS),
        circle([-91, -37], 9),
        poly([-83, -33], [-37, 27], [1, 42]),
        poly([1, 42], [65, 83]),
        poly([1, 42], [48, 96]),
        poly(SHOULDER_B, HANDS),
      ),
    },
    { id: 'waveA', d: poly(SHOULDER_A, [-40, -84], [-36, -102]) },
    { id: 'waveB', d: poly(SHOULDER_B, [-94, -6], [-112, -12]) },
  ],
  motions: [
    { part: 'waveA', origin: SHOULDER_A, frames: sway(-22, 0.4) },
    { part: 'waveB', origin: SHOULDER_B, frames: sway(22, 0.4) },
  ],
  durationMs: 2600,
};
