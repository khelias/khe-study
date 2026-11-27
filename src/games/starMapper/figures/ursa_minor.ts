import { bob, circle, curve, join, poly, sway } from './shapes';
import type { Creature } from './types';

// Väike Vanker as the little bear: the bowl is its body, the handle its long
// tail ending at Põhjanael; it walks a few steps.

export const URSA_MINOR: Creature = {
  id: 'ursa_minor',
  anchors: [11767, 85822, 82080, 77055, 72607, 75097, 79822],
  parts: [
    {
      id: 'body',
      d: 'M-1 15 Q30 22 44 56 Q42 82 22 89 Q-4 76 -27 40 Q-22 17 -1 15 Z',
    },
    {
      id: 'head',
      d: join(
        circle([45, 82], 11),
        circle([38, 70], 3.5),
        circle([55, 76], 3.5),
        poly([52, 90], [56, 93]),
      ),
    },
    {
      id: 'tail',
      d: join(curve([1, 22], [-14, 0], [-21, -23]), poly([-21, -23], [-15, -70], [-2, -108])),
    },
    { id: 'legA', d: poly([-12, 48], [-24, 60], [-22, 66]) },
    { id: 'legB', d: poly([10, 70], [-2, 82], [0, 88]) },
  ],
  motions: [
    { part: '*', origin: [0, 0], frames: bob(4, 4) },
    { part: 'legA', origin: [-12, 48], frames: sway(18) },
    { part: 'legB', origin: [10, 70], frames: sway(-18) },
  ],
  durationMs: 3200,
};
