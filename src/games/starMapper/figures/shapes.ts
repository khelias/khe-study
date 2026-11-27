import type { Point } from './types';

const n = (v: number) => Math.round(v * 10) / 10;

/** An open polyline through the points. */
export const poly = (...pts: readonly Point[]): string =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join(' ');

/** A closed polygon through the points. */
export const closed = (...pts: readonly Point[]): string => `${poly(...pts)} Z`;

/** A circle as two arcs, so it draws in as a stroke. */
export const circle = ([cx, cy]: Point, r: number): string =>
  `M${n(cx - r)} ${n(cy)} a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0 a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;

/** A quadratic curve from a through control c to b. */
export const curve = (a: Point, c: Point, b: Point): string =>
  `M${n(a[0])} ${n(a[1])} Q${n(c[0])} ${n(c[1])} ${n(b[0])} ${n(b[1])}`;

/** A wheel's spokes: n lines through the hub. */
export const spokes = ([cx, cy]: Point, r: number, count: number): string =>
  Array.from({ length: count }, (_, i) => {
    const a = (Math.PI * i) / count;
    const dx = Math.cos(a) * r;
    const dy = Math.sin(a) * r;
    return poly([cx - dx, cy - dy], [cx + dx, cy + dy]);
  }).join(' ');

/** A ring of points alternating between two radii, for a mane or a crown. */
export const zigzagRing = ([cx, cy]: Point, inner: number, outer: number, points: number) =>
  closed(
    ...Array.from({ length: points * 2 }, (_, i): Point => {
      const a = (Math.PI * i) / points;
      const r = i % 2 ? inner : outer;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    }),
  );

export const join = (...paths: readonly string[]): string => paths.join(' ');

/** A swing out to deg, back past rest (by `rebound`), out again, then rest: steps, beats, waves. */
export const sway = (deg: number, rebound = 1) => [
  { at: 0, rotate: 0 },
  { at: 0.25, rotate: deg },
  { at: 0.5, rotate: -deg * rebound },
  { at: 0.75, rotate: deg },
  { at: 1, rotate: 0 },
];

/** One whole turn by deg (±360). */
export const spin = (deg: number) => [
  { at: 0, rotate: 0 },
  { at: 1, rotate: deg },
];

/** A shift out to (x, y) and back. */
export const bob = (x: number, y: number) => [
  { at: 0, x: 0, y: 0 },
  { at: 0.5, x, y },
  { at: 1, x: 0, y: 0 },
];

/** Turns that rock between ±deg and come back to rest. */
export const rock = (deg: number, times = 1) => [
  { at: 0, rotate: 0 },
  ...Array.from({ length: times }, (_, i) => [
    { at: (4 * i + 1) / (4 * times), rotate: deg },
    { at: (4 * i + 3) / (4 * times), rotate: -deg },
  ]).flat(),
  { at: 1, rotate: 0 },
];
