import { circle, join, poly } from './shapes';
import type { Creature, Point } from './types';

// Orion as the thresher with Koot ja Reha, the flail and the rake (MT30 p.91).
// The flail's swingle beats twice.
const BETELGEUSE: Point = [-48, -72];
const BELLATRIX: Point = [27, -61];
const ALNITAK: Point = [-12, 22];
const MINTAKA: Point = [10, 6];
const JOINT: Point = [-95, -160];
/** The arm lifts twice; the swingle follows it, then beats on its own. */
const THRESH = [
  { at: 0, rotate: 0 },
  { at: 0.25, rotate: 10 },
  { at: 0.5, rotate: 0 },
  { at: 0.75, rotate: 10 },
  { at: 1, rotate: 0 },
];

export const ORION: Creature = {
  id: 'orion',
  anchors: [27989, 25336, 26727, 25930, 26311, 27366, 24436, 26207],
  parts: [
    {
      id: 'body',
      d: join(
        circle([2, -100], 10),
        poly([0, -90], [-8, -70]),
        poly(BETELGEUSE, BELLATRIX),
        poly(BETELGEUSE, ALNITAK),
        poly(BELLATRIX, MINTAKA),
        poly([-16, 30], [14, 13]),
        poly(ALNITAK, [-30, 101], [-40, 108]),
        poly(MINTAKA, [53, 86], [64, 92]),
      ),
    },
    {
      id: 'rake',
      d: join(poly(BELLATRIX, [58, -22]), poly([60, -92], [82, 98]), poly([66, 104], [100, 90])),
    },
    {
      id: 'teeth',
      d: join(poly([72, 102], [74, 112]), poly([82, 98], [84, 108]), poly([92, 94], [94, 104])),
    },
    { id: 'arm', d: join(poly(BETELGEUSE, [-75, -115], JOINT), circle(JOINT, 3)) },
    { id: 'swingle', d: poly(JOINT, [-58, -184]) },
  ],
  motions: [
    {
      part: 'arm',
      origin: BETELGEUSE,
      frames: THRESH,
    },
    {
      part: 'swingle',
      origin: BETELGEUSE,
      frames: THRESH,
    },
    {
      part: 'swingle',
      origin: JOINT,
      frames: [
        { at: 0, rotate: 0 },
        { at: 0.25, rotate: -70 },
        { at: 0.5, rotate: 0 },
        { at: 0.75, rotate: -70 },
        { at: 1, rotate: 0 },
      ],
    },
  ],
  durationMs: 3000,
};
