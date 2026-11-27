import { describe, expect, it } from 'vitest';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../../../curriculum/packs/astronomy/visibleFromEstonia';
import { seasonCompletedBy, seasonCounts } from '../seasons';

const ITEMS = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items;
const winter = ITEMS.filter((c) => c.season === 'winter').map((c) => c.id);

describe('season rings', () => {
  it('counts found and total per season', () => {
    const counts = seasonCounts(ITEMS, new Set(winter.slice(0, 2)));
    expect(counts.winter).toEqual({ found: 2, total: winter.length });
    expect(counts.summer.found).toBe(0);
    const total = Object.values(counts).reduce((s, c) => s + c.total, 0);
    expect(total).toBe(ITEMS.length);
  });

  it('plays the moment on the completing find only', () => {
    const last = winter[winter.length - 1]!;
    const before = winter.slice(0, -1);
    expect(seasonCompletedBy(ITEMS, before, last)).toBe('winter');
    expect(seasonCompletedBy(ITEMS, before.slice(1), last)).toBeNull();
    // Already traced: the next problem's traced ids cover the season.
    expect(seasonCompletedBy(ITEMS, winter, last)).toBeNull();
    expect(seasonCompletedBy(ITEMS, [], 'no_such')).toBeNull();
  });
});
