import { describe, expect, it } from 'vitest';
import {
  CANVAS_HEIGHT_BASE,
  CANVAS_MAX_WIDTH,
  getCanvasHeight,
  getGroundY,
  getPlayerX,
  getResponsiveGateScale,
} from '../layout';

describe('shapeDash layout helpers', () => {
  it('uses desktop aspect ratio for wide viewports and caps at base height', () => {
    expect(getCanvasHeight(CANVAS_MAX_WIDTH, 900)).toBe(CANVAS_HEIGHT_BASE);
    expect(getCanvasHeight(560, 900)).toBe(350);
  });

  it('gives narrow mobile widths a taller canvas while respecting viewport height', () => {
    expect(getCanvasHeight(360, 844)).toBe(304);
    expect(getCanvasHeight(360, 340)).toBe(256);
    expect(getCanvasHeight(200, 200)).toBe(236);
  });

  it('clamps ground depth between minimum and maximum bounds', () => {
    expect(getGroundY(400)).toBe(328);
    expect(getGroundY(236)).toBe(190);
    expect(getGroundY(600)).toBe(528);
  });

  it('scales gate stack down on short canvases without going below minimum', () => {
    expect(getResponsiveGateScale(328)).toBe(1);
    expect(getResponsiveGateScale(190)).toBe(0.8064516129032258);
    expect(getResponsiveGateScale(120)).toBe(0.78);
  });

  it('clamps player horizontal position on narrow and wide screens', () => {
    expect(getPlayerX(896)).toBe(140);
    expect(getPlayerX(400)).toBe(96);
    expect(getPlayerX(240)).toBe(76);
  });
});
