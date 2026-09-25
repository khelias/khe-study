import { describe, expect, it } from 'vitest';
import { contrastRatio, isHexColour, relativeLuminance } from '../contrast';

describe('contrast', () => {
  it('accepts only #rrggbb colours', () => {
    expect(isHexColour('#0f172a')).toBe(true);
    expect(isHexColour('#FFF')).toBe(false);
    expect(isHexColour('0f172a')).toBe(false);
    expect(isHexColour(12)).toBe(false);
  });

  it('computes WCAG luminance at the extremes', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('computes the contrast ratio in either order', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    // Known value: slate-600 on white is about 7.58:1.
    expect(contrastRatio('#475569', '#ffffff')).toBeCloseTo(7.58, 1);
  });

  it('rejects malformed input', () => {
    expect(() => relativeLuminance('red')).toThrow();
  });
});
