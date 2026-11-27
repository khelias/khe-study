import { circle, curve, join, poly, rock, zigzagRing } from './shapes';
import type { Creature, Point } from './types';

// Lõvi: the sickle is its head and mane, Regulus its front paw, Denebola
// its tail; it shakes its mane.
const HEAD: Point = [66, -44];

export const LEO: Creature = {
  id: 'leo',
  anchors: [49669, 49583, 50583, 50335, 48455, 47908, 54872, 57632, 54879],
  parts: [
    { id: 'mane', d: zigzagRing(HEAD, 26, 34, 11) },
    {
      id: 'face',
      d: join(
        circle(HEAD, 17),
        circle([60, -50], 2),
        circle([73, -50], 2),
        poly([64, -38], [68, -38]),
      ),
    },
    {
      id: 'body',
      d: join(
        curve([42, -30], [-30, -30], [-98, -14]),
        poly([-98, -14], [-192, 40]),
        curve([48, 4], [-30, 30], [-102, 38]),
        poly([-102, 38], [-180, 46]),
        poly([52, 0], [58, 74], [66, 90]),
        poly([30, 14], [34, 80], [42, 94]),
        poly([-102, 38], [-112, 96]),
        poly([-150, 44], [-158, 98]),
        curve([-192, 40], [-224, 26], [-212, -6]),
        circle([-212, -10], 4),
      ),
    },
  ],
  motions: [
    { part: 'mane', origin: HEAD, frames: rock(9, 3) },
    { part: 'face', origin: HEAD, frames: rock(4, 3) },
  ],
  durationMs: 2400,
};
