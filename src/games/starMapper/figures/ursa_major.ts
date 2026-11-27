import { bob, circle, closed, join, poly, spin, spokes } from './shapes';
import type { Creature, Point } from './types';

// Suur Vanker: Peedu's wagon (MT46). The four bowl stars are the box, the
// handle is the shaft; the wagon rolls and its wheels turn.
const MEGREZ: Point = [12, -5];
const PHECDA: Point = [45, 26];
const MERAK: Point = [113, -16];
const DUBHE: Point = [95, -67];
const WHEEL_A: Point = [73, 33];
const WHEEL_B: Point = [107, 11];

export const URSA_MAJOR: Creature = {
  id: 'ursa_major',
  anchors: [67301, 65378, 62956, 59774, 58001, 53910, 54061],
  parts: [
    {
      id: 'box',
      d: join(
        closed(MEGREZ, PHECDA, MERAK, DUBHE),
        poly([23, 5], [101, -50]),
        poly([34, 16], [107, -33]),
      ),
    },
    {
      id: 'shaft',
      d: join(
        poly(MEGREZ, [-42, 3], [-86, 7], [-138, 53]),
        poly([15, -1], [-39, 7], [-83, 11], [-135, 57]),
        poly([-146, 44], [-130, 62]),
      ),
    },
    { id: 'wheelA', d: join(circle(WHEEL_A, 16), circle(WHEEL_A, 2.5), spokes(WHEEL_A, 16, 3)) },
    { id: 'wheelB', d: join(circle(WHEEL_B, 16), circle(WHEEL_B, 2.5), spokes(WHEEL_B, 16, 3)) },
  ],
  motions: [
    { part: '*', origin: [0, 0], frames: bob(-6, 5) },
    { part: 'wheelA', origin: WHEEL_A, frames: spin(-360) },
    { part: 'wheelB', origin: WHEEL_B, frames: spin(-360) },
  ],
  durationMs: 3000,
};
