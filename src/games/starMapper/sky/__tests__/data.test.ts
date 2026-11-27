import { describe, expect, it } from 'vitest';
import catalog from '../data/catalog.json';
import bright from '../data/bright.json';
import figures from '../data/figures.json';

const catalogHips = new Map(catalog.map((row) => [row[0], row]));

describe('sky data', () => {
  it('holds 3800-4000 stars', () => {
    expect(catalogHips.size).toBeGreaterThanOrEqual(3800);
    expect(catalogHips.size).toBeLessThanOrEqual(4000);
  });

  it('has Polaris at Dec ≈ 89.26°', () => {
    expect(catalogHips.get(11767)?.[2]).toBeCloseTo(89.26, 2);
  });

  it('has every figure endpoint in the catalogue', () => {
    for (const [id, lines] of Object.entries(figures as Record<string, number[][]>)) {
      for (const [a, b] of lines) {
        expect(catalogHips.has(a), `${id} ${a}`).toBe(true);
        expect(catalogHips.has(b), `${id} ${b}`).toBe(true);
      }
    }
  });

  it('has every bright star in the catalogue', () => {
    for (const [hip] of bright) expect(catalogHips.has(hip)).toBe(true);
  });

  it('rounds coordinates to three decimals', () => {
    for (const [, ra, dec] of catalog) {
      expect(Math.round(ra! * 1000)).toBeCloseTo(ra! * 1000, 6);
      expect(Math.round(dec! * 1000)).toBeCloseTo(dec! * 1000, 6);
    }
  });
});
