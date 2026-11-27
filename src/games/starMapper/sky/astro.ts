/**
 * Sky maths for Tähistaevas. Pure functions, the one projection the overlay,
 * the fallback sky and the WebGL renderer share. Angles are degrees unless a
 * name says radians; times are UTC milliseconds.
 *
 * World frame (the same as three.js): x east, y up, -z north. The camera's
 * yaw is the azimuth it faces (0 north, 90 east), its pitch the altitude.
 */

export type Vec3 = readonly [number, number, number];
/** Row-major 3×3 matrix. */
export type Mat3 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface Camera {
  yaw: number;
  pitch: number;
  /** Vertical field of view. */
  fov: number;
}

export interface Observer {
  lat: number;
  lon: number;
}

/** The centre of Estonia in whole degrees. */
export const OBSERVER: Observer = { lat: 59, lon: 25 };

export const FOV_MIN = 25;
export const FOV_MAX = 100;
export const PITCH_MIN = -5;
export const PITCH_MAX = 89;

const RAD = Math.PI / 180;
const J2000 = 2451545.0;
const HOUR_MS = 3_600_000;

export const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));
export const wrap360 = (x: number): number => ((x % 360) + 360) % 360;

export function julianDate(utcMs: number): number {
  return utcMs / 86_400_000 + 2440587.5;
}

/** Greenwich mean sidereal time in hours, 0-24. */
export function gmstHours(jd: number): number {
  const h = 18.697374558 + 24.06570982441908 * (jd - J2000);
  return ((h % 24) + 24) % 24;
}

/** Local sidereal time in degrees, 0-360. */
export function localSiderealDeg(utcMs: number, lon: number = OBSERVER.lon): number {
  return wrap360(gmstHours(julianDate(utcMs)) * 15 + lon);
}

/** Last Sunday of a month (1-12) of a year, as a day of the month. */
function lastSunday(year: number, month: number): number {
  const last = new Date(Date.UTC(year, month, 0));
  return last.getUTCDate() - last.getUTCDay();
}

/** Estonian time's offset from UTC in hours: 3 in summer time (EEST), else 2. */
export function estonianOffsetHours(utcMs: number): number {
  const year = new Date(utcMs).getUTCFullYear();
  const start = Date.UTC(year, 2, lastSunday(year, 3), 1);
  const end = Date.UTC(year, 9, lastSunday(year, 10), 1);
  return utcMs >= start && utcMs < end ? 3 : 2;
}

/** UTC milliseconds of an Estonian local clock time; month is 1-12. */
export function estonianLocalToUtc(year: number, month: number, day: number, hour: number): number {
  const guess = Date.UTC(year, month - 1, day, hour) - 2 * HOUR_MS;
  return Date.UTC(year, month - 1, day, hour) - estonianOffsetHours(guess) * HOUR_MS;
}

/** The Estonian local calendar date and hour of a moment; month is 1-12. */
export function estonianLocal(utcMs: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
} {
  const d = new Date(utcMs + estonianOffsetHours(utcMs) * HOUR_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
  };
}

/** The sun's right ascension and declination, low precision (about 0.01°). */
export function sunPosition(utcMs: number): { ra: number; dec: number } {
  const n = julianDate(utcMs) - J2000;
  const L = wrap360(280.46 + 0.9856474 * n);
  const g = wrap360(357.528 + 0.9856003 * n) * RAD;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const eps = (23.439 - 0.0000004 * n) * RAD;
  return {
    ra: wrap360(Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / RAD),
    dec: Math.asin(Math.sin(eps) * Math.sin(lambda)) / RAD,
  };
}

export function equatorialToHorizontal(
  ra: number,
  dec: number,
  utcMs: number,
  observer: Observer = OBSERVER,
): { alt: number; az: number } {
  const H = (localSiderealDeg(utcMs, observer.lon) - ra) * RAD;
  const d = dec * RAD;
  const phi = observer.lat * RAD;
  const up = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
  const north = Math.cos(phi) * Math.sin(d) - Math.sin(phi) * Math.cos(d) * Math.cos(H);
  const east = -Math.cos(d) * Math.sin(H);
  return { alt: Math.asin(clamp(up, -1, 1)) / RAD, az: wrap360(Math.atan2(east, north) / RAD) };
}

export function sunAltitude(utcMs: number, observer: Observer = OBSERVER): number {
  const sun = sunPosition(utcMs);
  return equatorialToHorizontal(sun.ra, sun.dec, utcMs, observer).alt;
}

export function horizontalToVector(alt: number, az: number): Vec3 {
  const a = alt * RAD;
  const z = az * RAD;
  return [Math.cos(a) * Math.sin(z), Math.sin(a), -Math.cos(a) * Math.cos(z)];
}

export function vectorToHorizontal(v: Vec3): { alt: number; az: number } {
  const [x, y, z] = v;
  return { alt: Math.asin(clamp(y, -1, 1)) / RAD, az: wrap360(Math.atan2(x, -z) / RAD) };
}

/** Unit vector of a right ascension and declination in the equatorial frame. */
export function equatorialVector(ra: number, dec: number): Vec3 {
  const a = ra * RAD;
  const d = dec * RAD;
  return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)];
}

/** The rotation from the equatorial frame to the world frame at a moment. */
export function skyMatrix(utcMs: number, observer: Observer = OBSERVER): Mat3 {
  const t = localSiderealDeg(utcMs, observer.lon) * RAD;
  const p = observer.lat * RAD;
  const [st, ct, sp, cp] = [Math.sin(t), Math.cos(t), Math.sin(p), Math.cos(p)];
  return [-st, ct, 0, cp * ct, cp * st, sp, sp * ct, sp * st, -cp];
}

export function applyMat3(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/** The camera's right, up and forward unit vectors in the world frame. */
export function cameraBasis(camera: Camera): { right: Vec3; up: Vec3; forward: Vec3 } {
  const y = camera.yaw * RAD;
  const p = camera.pitch * RAD;
  return {
    right: [Math.cos(y), 0, Math.sin(y)],
    up: [-Math.sin(p) * Math.sin(y), Math.cos(p), Math.sin(p) * Math.cos(y)],
    forward: [Math.cos(p) * Math.sin(y), Math.sin(p), -Math.cos(p) * Math.cos(y)],
  };
}

export interface ScreenPoint {
  x: number;
  y: number;
  /** In front of the camera; a point behind it has no place on the screen. */
  visible: boolean;
}

/** Pixels per unit of tangent at the screen centre for a viewport height. */
export function focalPx(camera: Camera, height: number): number {
  return height / 2 / Math.tan((camera.fov * RAD) / 2);
}

/** Projects world-frame directions for one camera; the basis is worked out once. */
export function projector(camera: Camera, width: number, height: number): (v: Vec3) => ScreenPoint {
  const { right, up, forward } = cameraBasis(camera);
  const f = focalPx(camera, height);
  return (v) => {
    const depth = forward[0] * v[0] + forward[1] * v[1] + forward[2] * v[2];
    if (depth <= 1e-6) return { x: Number.NaN, y: Number.NaN, visible: false };
    const x = right[0] * v[0] + right[1] * v[1] + right[2] * v[2];
    const y = up[0] * v[0] + up[1] * v[1] + up[2] * v[2];
    return { x: width / 2 + (x / depth) * f, y: height / 2 - (y / depth) * f, visible: true };
  };
}

/** A world-frame direction to viewport pixels (origin top left). */
export function project(v: Vec3, camera: Camera, width: number, height: number): ScreenPoint {
  return projector(camera, width, height)(v);
}

/** Viewport pixels back to a world-frame direction. */
export function unproject(
  x: number,
  y: number,
  camera: Camera,
  width: number,
  height: number,
): Vec3 {
  const { right, up, forward } = cameraBasis(camera);
  const f = focalPx(camera, height);
  const a = (x - width / 2) / f;
  const b = -(y - height / 2) / f;
  const v: Vec3 = [
    forward[0] + a * right[0] + b * up[0],
    forward[1] + a * right[1] + b * up[1],
    forward[2] + a * right[2] + b * up[2],
  ];
  const len = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / len, v[1] / len, v[2] / len];
}

/** Angle between two unit vectors. */
export function angleBetween(a: Vec3, b: Vec3): number {
  return Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1)) / RAD;
}

/** A camera facing a world direction, pitch kept in the allowed range. */
export function cameraFacing(v: Vec3, fov: number): Camera {
  const { alt, az } = vectorToHorizontal(v);
  return { yaw: az, pitch: clamp(alt, PITCH_MIN, PITCH_MAX), fov: clamp(fov, FOV_MIN, FOV_MAX) };
}

/** A star's colour from its B-V index, as 0-1 RGB (a fit to blackbody colours). */
export function bvToRgb(bv: number): [number, number, number] {
  const t = clamp(bv, -0.4, 2.0);
  let r: number;
  let g: number;
  let b: number;
  if (t < 0) r = 0.61 + 0.11 * t + 0.1 * t * t;
  else if (t < 0.4) r = 0.83 + (0.17 * t) / 0.4;
  else r = 1;
  if (t < 0) g = 0.7 + 0.07 * t + 0.1 * t * t;
  else if (t < 0.4) g = 0.87 + 0.11 * t;
  else if (t < 1.6) g = 0.98 - 0.16 * ((t - 0.4) / 1.2) - 0.16 * ((t - 0.4) / 1.2) ** 2;
  else g = 0.82 - 0.5 * ((t - 1.6) / 0.4) ** 2;
  if (t < 0.4) b = 1;
  else if (t < 1.5) b = 1 - 0.47 * ((t - 0.4) / 1.1) + 0.1 * ((t - 0.4) / 1.1) ** 2;
  else b = 0.63 - 0.6 * ((t - 1.5) / 0.44) ** 2;
  return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1)];
}

/** A star's drawn diameter in CSS pixels at the default zoom, from its magnitude. */
export function magToSize(mag: number): number {
  return clamp(1.2 + 1.6 * (6.5 - mag) ** 0.9, 1.2, 14);
}

/** The mean direction of a set of stars, as right ascension and declination. */
export function centreOf(points: readonly { ra: number; dec: number }[]): {
  ra: number;
  dec: number;
} {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const p of points) {
    const v = equatorialVector(p.ra, p.dec);
    x += v[0];
    y += v[1];
    z += v[2];
  }
  const len = Math.hypot(x, y, z) || 1;
  return { ra: wrap360(Math.atan2(y, x) / RAD), dec: Math.asin(z / len) / RAD };
}

/** Altitude of an object at its upper culmination. */
export function culminationAltitude(dec: number, lat: number = OBSERVER.lat): number {
  return 90 - Math.abs(lat - dec);
}

/** The sun is this far below the horizon or more in the game's dark sky. */
export const DARK_SUN_ALT = -6;
/** The year whose calendar the best evenings are computed in. */
export const BEST_YEAR = 2026;
const EVENING_HOURS = [22, 21, 23, 20] as const;

export interface BestEvening {
  /** 1-12 */
  month: number;
  /** Local Estonian clock hour. */
  hour: number;
}

/**
 * The month and evening hour (on the 15th) a direction stands highest in a
 * dark sky from Estonia, preferring 22:00, then 21, 23 and 20.
 */
export function bestEvening(ra: number, dec: number): BestEvening {
  const culm = culminationAltitude(dec);
  let best: BestEvening & { alt: number } = { month: 1, hour: 21, alt: -90 };
  for (const hour of EVENING_HOURS) {
    let hourBest: BestEvening & { alt: number } = { month: 1, hour, alt: -90 };
    for (let month = 1; month <= 12; month++) {
      const t = estonianLocalToUtc(BEST_YEAR, month, 15, hour);
      if (sunAltitude(t) > DARK_SUN_ALT) continue;
      const { alt } = equatorialToHorizontal(ra, dec, t);
      if (alt > hourBest.alt) hourBest = { month, hour, alt };
    }
    if (hourBest.alt >= culm - 3) return { month: hourBest.month, hour: hourBest.hour };
    if (hourBest.alt > best.alt) best = hourBest;
  }
  return { month: best.month, hour: best.hour };
}

/** UTC milliseconds of a best evening on the 15th of its month. */
export function bestEveningUtc(evening: BestEvening, year: number = BEST_YEAR): number {
  return estonianLocalToUtc(year, evening.month, 15, evening.hour);
}

/**
 * The first full hour from 18:00 tonight (Estonian time) with a dark sky;
 * tonight's date is the evening the given moment belongs to.
 */
export function tonightsDarkHour(nowUtcMs: number): number | null {
  const local = estonianLocal(nowUtcMs);
  const eveningDay = local.hour < 12 ? local.day - 1 : local.day;
  const start = estonianLocalToUtc(local.year, local.month, eveningDay, 18);
  for (let h = 0; h <= 12; h++) {
    const t = start + h * HOUR_MS;
    if (sunAltitude(t) <= DARK_SUN_ALT) return t;
  }
  return null;
}

/** The vertical field of view that shows a figure of this angular radius whole. */
export function fovToFit(radius: number, aspect: number): number {
  const half = Math.min(80, radius * 1.35 + 4) * RAD;
  const vertical = (2 * Math.atan(Math.tan(half) / Math.min(1, Math.max(aspect, 0.3)))) / RAD;
  return clamp(vertical, FOV_MIN, FOV_MAX);
}

/** Shortest signed turn from one azimuth to another, -180 to 180. */
export function yawDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

export const easeOut = (t: number): number => 1 - (1 - t) ** 3;

const SIDEREAL_DAY_MS = 86_164_091;

/**
 * The sky time to add to `toUtc` so the sky stands as it did at `fromUtc`,
 * turning the short way round: a time-lapse from one scene to the next runs
 * this offset down to 0.
 */
export const siderealTurnMs = (fromUtc: number, toUtc: number): number =>
  (yawDelta(localSiderealDeg(toUtc), localSiderealDeg(fromUtc)) / 360) * SIDEREAL_DAY_MS;
