import { curve, join, poly, sway } from './shapes';
import type { Creature } from './types';

// Pegasus: a winged horse whose body is the great square; it gallops.

export const PEGASUS: Creature = {
  id: 'pegasus',
  anchors: [113963, 113881, 677, 1067],
  parts: [
    {
      id: 'body',
      d: join(
        'M-80 0 Q-80 -62 0 -62 Q80 -62 80 0 Q80 62 0 62 Q-80 62 -80 0 Z',
        curve([62, -38], [92, -58], [108, -96]),
        curve([78, -14], [104, -40], [122, -84]),
        poly([108, -96], [136, -84], [140, -74], [122, -84]),
        curve([-78, -12], [-112, -6], [-122, 32]),
      ),
    },
    {
      id: 'wing',
      d: join(
        curve([-20, -60], [-30, -120], [-70, -140]),
        curve([-70, -140], [-30, -100], [10, -62]),
      ),
    },
    {
      id: 'front',
      d: join(poly([40, 56], [48, 86], [40, 110]), poly([22, 60], [30, 90], [24, 112])),
    },
    {
      id: 'hind',
      d: join(poly([-42, 58], [-54, 86], [-48, 110]), poly([-62, 52], [-72, 82], [-66, 106])),
    },
  ],
  motions: [
    {
      part: '*',
      origin: [0, 0],
      frames: [
        { at: 0, y: 0 },
        { at: 0.25, y: -5 },
        { at: 0.5, y: 0 },
        { at: 0.75, y: -5 },
        { at: 1, y: 0 },
      ],
    },
    { part: 'front', origin: [31, 58], frames: sway(24) },
    { part: 'hind', origin: [-52, 55], frames: sway(-20) },
    {
      part: 'wing',
      origin: [-5, -61],
      frames: sway(12),
    },
  ],
  durationMs: 2000,
};
