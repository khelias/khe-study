import { curve, join, poly, rock } from './shapes';
import type { Creature } from './types';

// Kassiopeia's throne: the W is the top of its back; the throne rocks.
export const CASSIOPEIA: Creature = {
  id: 'cassiopeia',
  anchors: [8886, 6686, 4427, 3179, 746],
  parts: [
    {
      id: 'back',
      d: join(
        poly([-61, -40], [-33, 0], [3, -4], [26, 37], [64, 6]),
        poly([-61, -40], [-82, 16]),
        poly([64, 6], [43, 62]),
      ),
    },
    { id: 'seat', d: join(poly([-82, 16], [43, 62]), poly([-86, 28], [39, 74])) },
    { id: 'legs', d: join(poly([-86, 28], [-92, 42]), poly([39, 74], [33, 88])) },
    { id: 'rocker', d: curve([-104, 34], [-36, 88], [46, 92]) },
  ],
  motions: [{ part: '*', origin: [-30, 74], frames: rock(5, 2) }],
  durationMs: 3000,
};
