import { describe, expect, it } from 'vitest';
import { addLine, EMPTY_DRAWING, isComplete, linesLeft } from '../drawing';
import { BRIGHT_STARS } from '../sky/brightStars';
import {
  applyMat3,
  bestEveningUtc,
  cameraFacing,
  equatorialVector,
  projector,
  skyMatrix,
  type Vec3,
} from '../sky/astro';
import {
  ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK,
  getConstellationById,
} from '../../../curriculum/packs/astronomy/visibleFromEstonia';
import type { FigureLine } from '../../../types/game';

const pegasus = getConstellationById(ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items, 'pegasus')!;
const figure = pegasus.lines;
const [first] = figure as [FigureLine];

describe('drawing a figure', () => {
  it('adds nothing for a drag that ends on the star it started from', () => {
    const r = addLine(EMPTY_DRAWING, figure, [first[0], first[0]]);
    expect(r.result).toBe('same-star');
    expect(r.drawing).toBe(EMPTY_DRAWING);
  });

  it('adds a line once, in either direction', () => {
    const once = addLine(EMPTY_DRAWING, figure, first).drawing;
    const again = addLine(once, figure, [first[1], first[0]]);
    expect(again.result).toBe('repeat');
    expect(again.drawing.lines).toHaveLength(1);
  });

  it('counts a line to a star outside the figure against the lines left', () => {
    const r = addLine(EMPTY_DRAWING, figure, [first[0], 1]);
    expect(r.result).toBe('wrong');
    expect(linesLeft(r.drawing, figure)).toBe(figure.length - 1);
    expect(isComplete(r.drawing, figure)).toBe(false);
  });

  it('is complete once every figure line is drawn', () => {
    const done = figure.reduce((d, l) => addLine(d, figure, l).drawing, EMPTY_DRAWING);
    expect(isComplete(done, figure)).toBe(true);
  });

  it('draws a line across 0h short, not around the sky', () => {
    const crossing = figure.find(([a, b]) => {
      const ra = [a, b].map((h) => BRIGHT_STARS.get(h)!.ra);
      return Math.abs(ra[0]! - ra[1]!) > 180;
    });
    expect(crossing).toBeDefined();
    const m = skyMatrix(bestEveningUtc(pegasus.bestEvening));
    const [a, b] = crossing!.map((h) => {
      const s = BRIGHT_STARS.get(h)!;
      return applyMat3(m, equatorialVector(s.ra, s.dec));
    }) as [Vec3, Vec3];
    const sum = [a[0] + b[0], a[1] + b[1], a[2] + b[2]] as const;
    const n = Math.hypot(...sum);
    const toScreen = projector(cameraFacing([sum[0] / n, sum[1] / n, sum[2] / n], 60), 800, 800);
    const [pa, pb] = [toScreen(a), toScreen(b)];
    expect(pa.visible && pb.visible).toBe(true);
    expect(Math.hypot(pa.x - pb.x, pa.y - pb.y)).toBeLessThan(400);
  });
});
