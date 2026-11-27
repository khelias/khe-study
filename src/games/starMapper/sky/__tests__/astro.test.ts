import { describe, expect, it } from 'vitest';
import {
  angleBetween,
  applyMat3,
  bestEveningUtc,
  bvToRgb,
  cameraFacing,
  cameraInBand,
  figureMargin,
  equatorialToHorizontal,
  equatorialVector,
  estonianLocal,
  estonianLocalToUtc,
  estonianOffsetHours,
  gmstHours,
  horizontalToVector,
  magToSize,
  OBSERVER,
  project,
  skyMatrix,
  sunAltitude,
  tonightsDarkHour,
  unproject,
  vectorToHorizontal,
} from '../astro';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../../../../curriculum/packs/astronomy/visibleFromEstonia';
import { brightStar } from '../brightStars';

const POLARIS = brightStar(11767);
const VEGA = brightStar(91262);

describe('sidereal time', () => {
  it('GMST at J2000.0 is 18.697374558 h', () => {
    expect(gmstHours(2451545.0)).toBeCloseTo(18.697374558, 9);
  });
});

describe('Estonian time', () => {
  it('switches to summer time on the last Sunday of March and back in October', () => {
    // 2026: 29 March and 25 October; 2027: 28 March and 31 October (01:00 UTC).
    expect(estonianOffsetHours(Date.UTC(2026, 2, 29, 0, 59))).toBe(2);
    expect(estonianOffsetHours(Date.UTC(2026, 2, 29, 1, 0))).toBe(3);
    expect(estonianOffsetHours(Date.UTC(2026, 9, 25, 0, 59))).toBe(3);
    expect(estonianOffsetHours(Date.UTC(2026, 9, 25, 1, 0))).toBe(2);
    expect(estonianOffsetHours(Date.UTC(2027, 2, 28, 1, 0))).toBe(3);
    expect(estonianOffsetHours(Date.UTC(2027, 2, 27, 12))).toBe(2);
    expect(estonianOffsetHours(Date.UTC(2027, 9, 31, 1, 0))).toBe(2);
    expect(estonianOffsetHours(Date.UTC(2027, 9, 30, 12))).toBe(3);
  });

  it('turns a local clock time into UTC and back', () => {
    const winter = estonianLocalToUtc(2026, 1, 15, 21);
    expect(new Date(winter).getUTCHours()).toBe(19);
    const summer = estonianLocalToUtc(2026, 7, 15, 23);
    expect(new Date(summer).getUTCHours()).toBe(20);
    expect(estonianLocal(summer)).toEqual({ year: 2026, month: 7, day: 15, hour: 23 });
  });
});

describe('positions', () => {
  it('Polaris stands within 1° of 59° at any time', () => {
    for (let h = 0; h < 48; h += 5) {
      const t = Date.UTC(2026, 0, 1) + h * 3_600_000 * 97;
      expect(Math.abs(equatorialToHorizontal(POLARIS.ra, POLARIS.dec, t).alt - 59)).toBeLessThan(1);
    }
  });

  it('Vega culminates at about 70°', () => {
    let max = -90;
    const start = Date.UTC(2026, 7, 1);
    for (let m = 0; m < 24 * 60; m += 5) {
      max = Math.max(max, equatorialToHorizontal(VEGA.ra, VEGA.dec, start + m * 60_000).alt);
    }
    expect(max).toBeGreaterThan(69);
    expect(max).toBeLessThan(71);
  });

  it('the sky matrix agrees with the alt-az formula', () => {
    const t = Date.UTC(2026, 10, 27, 19);
    const { alt, az } = equatorialToHorizontal(VEGA.ra, VEGA.dec, t);
    const v = applyMat3(skyMatrix(t), equatorialVector(VEGA.ra, VEGA.dec));
    expect(angleBetween(v, horizontalToVector(alt, az))).toBeLessThan(1e-6);
    const back = vectorToHorizontal(v);
    expect(back.alt).toBeCloseTo(alt, 6);
    expect(back.az).toBeCloseTo(az, 6);
  });

  it('the sun is low at midnight in December and high at noon in June', () => {
    expect(sunAltitude(estonianLocalToUtc(2026, 12, 21, 0))).toBeLessThan(-40);
    expect(sunAltitude(estonianLocalToUtc(2026, 6, 21, 13))).toBeGreaterThan(50);
  });
});

describe('projection', () => {
  const camera = { yaw: 140, pitch: 35, fov: 60 };

  it('projects the camera direction to the screen centre', () => {
    const v = horizontalToVector(35, 140);
    const p = project(v, camera, 400, 800);
    expect(p.visible).toBe(true);
    expect(p.x).toBeCloseTo(200, 6);
    expect(p.y).toBeCloseTo(400, 6);
  });

  it('round-trips through unproject', () => {
    const v = unproject(57, 610, camera, 400, 800);
    const p = project(v, camera, 400, 800);
    expect(p.x).toBeCloseTo(57, 6);
    expect(p.y).toBeCloseTo(610, 6);
  });

  it('puts a point above the centre higher on the screen and east to the right', () => {
    const up = project(horizontalToVector(45, 140), camera, 400, 800);
    const east = project(horizontalToVector(35, 150), camera, 400, 800);
    expect(up.y).toBeLessThan(400);
    expect(east.x).toBeGreaterThan(200);
  });

  it('hides a point behind the camera', () => {
    expect(project(horizontalToVector(-35, 320), camera, 400, 800).visible).toBe(false);
  });

  it('handles the RA wrap at 0h', () => {
    const t = Date.UTC(2026, 9, 1, 20);
    const m = skyMatrix(t);
    const a = applyMat3(m, equatorialVector(359.9, 20));
    const b = applyMat3(m, equatorialVector(0.1, 20));
    expect(angleBetween(a, b)).toBeLessThan(0.2);
  });

  it('centres a figure in a band and fits it there', () => {
    const v = horizontalToVector(40, 200);
    const band = { top: 120, bottom: 420 };
    const c = cameraInBand(v, 8, band, 390, 800);
    const centre = project(v, c, 390, 800);
    expect(centre.x).toBeCloseTo(195, 6);
    expect(centre.y).toBeCloseTo(270, 6);
    // The figure's edge, with its margin, stays inside the band.
    const edge = project(horizontalToVector(40 + figureMargin(8), 200), c, 390, 800);
    expect(edge.y).toBeGreaterThanOrEqual(band.top - 1e-6);
  });

  it('keeps the figure stars it is given inside the band', () => {
    const v = horizontalToVector(40, 200);
    const band = { top: 120, bottom: 420 };
    const stars = [horizontalToVector(46, 188), horizontalToVector(34, 212)];
    const c = cameraInBand(v, 8, band, 390, 800, stars);
    for (const star of stars) {
      const p = project(star, c, 390, 800);
      expect(p.y).toBeGreaterThanOrEqual(band.top);
      expect(p.y).toBeLessThanOrEqual(band.bottom);
    }
  });

  it('takes the widest view when no view fits the band', () => {
    const v = horizontalToVector(5, 200);
    expect(cameraInBand(v, 25, { top: 100, bottom: 250 }, 390, 800).fov).toBe(100);
  });

  it('faces a direction within the allowed pitch', () => {
    const c = cameraFacing(horizontalToVector(89.9, 10), 200);
    expect(c.pitch).toBeLessThanOrEqual(89);
    expect(c.fov).toBe(100);
  });
});

describe('star look', () => {
  it('colours a hot star blue and a cool star red', () => {
    const [rb, , bb] = bvToRgb(-0.3);
    const [rr, , br] = bvToRgb(1.6);
    expect(bb).toBeGreaterThan(rb);
    expect(rr).toBeGreaterThan(br);
  });

  it('draws a bright star bigger than a faint one', () => {
    expect(magToSize(0)).toBeGreaterThan(magToSize(5));
  });
});

describe('best evening of every pack item', () => {
  const items = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items;

  it.each(items.map((c) => [c.id, c] as const))('%s is dark and above 20°', (_id, c) => {
    const t = bestEveningUtc(c.bestEvening);
    expect(sunAltitude(t)).toBeLessThanOrEqual(-6);
    expect(equatorialToHorizontal(c.centre.ra, c.centre.dec, t).alt).toBeGreaterThan(20);
  });

  it('puts Kassiopeia (never sets) and Lüüra and Luik (summer) in a dark sky', () => {
    for (const id of ['cassiopeia', 'lyra', 'cygnus']) {
      const c = items.find((i) => i.id === id);
      expect(c).toBeDefined();
    }
    expect(items.find((i) => i.id === 'cassiopeia')?.circumpolar).toBe(true);
    expect(items.find((i) => i.id === 'lyra')?.circumpolar).toBe(false);
  });

  it('finds tonight a dark hour all year, midsummer included', () => {
    for (let month = 1; month <= 12; month++) {
      const t = tonightsDarkHour(estonianLocalToUtc(2026, month, 21, 15));
      expect(t).not.toBeNull();
      expect(sunAltitude(t ?? 0)).toBeLessThanOrEqual(-6);
    }
  });

  it('uses the observer at whole degrees', () => {
    expect(OBSERVER).toEqual({ lat: 59, lon: 25 });
  });
});
