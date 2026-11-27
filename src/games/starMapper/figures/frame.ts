import { brightStar } from '../sky/brightStars';
import { centreOf, equatorialVector, type Vec3 } from '../sky/astro';
import type { Point } from './types';

const DEG = Math.PI / 180;
/** Tangent-plane units per degree. */
const UNITS = 10;

/**
 * The stars' positions in the figure's tangent plane: a gnomonic projection
 * about the mean of their directions, north up and west to the right (as
 * seen from below), in tenths of a degree. The creature files are drawn on
 * these coordinates.
 */
export function tangentPoints(hips: readonly number[]): Map<number, Point> {
  const stars = hips.map(brightStar);
  const centre = centreOf(stars);
  const c = equatorialVector(centre.ra, centre.dec);
  const ra = centre.ra * DEG;
  const dec = centre.dec * DEG;
  const east: Vec3 = [-Math.sin(ra), Math.cos(ra), 0];
  const north: Vec3 = [-Math.sin(dec) * Math.cos(ra), -Math.sin(dec) * Math.sin(ra), Math.cos(dec)];
  const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return new Map(
    stars.map((s) => {
      const v = equatorialVector(s.ra, s.dec);
      const k = dot(v, c);
      return [s.hip, [(-dot(v, east) / k / DEG) * UNITS, (-dot(v, north) / k / DEG) * UNITS]];
    }),
  );
}

/** A similarity transform (turn, scale, shift) as SVG's matrix(a b -b a e f). */
export interface Similarity {
  a: number;
  b: number;
  e: number;
  f: number;
}

/** The least-squares similarity that carries the source points onto the target points. */
export function fitSimilarity(src: readonly Point[], dst: readonly Point[]): Similarity {
  const count = src.length;
  const mean = (pts: readonly Point[]): Point => [
    pts.reduce((s, p) => s + p[0], 0) / count,
    pts.reduce((s, p) => s + p[1], 0) / count,
  ];
  const [sx, sy] = mean(src);
  const [dx, dy] = mean(dst);
  let re = 0;
  let im = 0;
  let norm = 0;
  for (let i = 0; i < count; i++) {
    const qx = src[i]![0] - sx;
    const qy = src[i]![1] - sy;
    const px = dst[i]![0] - dx;
    const py = dst[i]![1] - dy;
    re += px * qx + py * qy;
    im += py * qx - px * qy;
    norm += qx * qx + qy * qy;
  }
  const a = norm ? re / norm : 1;
  const b = norm ? im / norm : 0;
  return { a, b, e: dx - (a * sx - b * sy), f: dy - (b * sx + a * sy) };
}
