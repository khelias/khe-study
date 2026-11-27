import type { Constellation, SkySeason } from '../../types/game';

export const SEASONS: readonly SkySeason[] = ['winter', 'spring', 'summer', 'autumn'];

/** Found and total constellations of each season, for Minu taevas' rings. */
export function seasonCounts(
  items: readonly Constellation[],
  foundIds: ReadonlySet<string>,
): Record<SkySeason, { found: number; total: number }> {
  return Object.fromEntries(
    SEASONS.map((s) => {
      const inSeason = items.filter((c) => c.season === s);
      return [
        s,
        { found: inSeason.filter((c) => foundIds.has(c.id)).length, total: inSeason.length },
      ];
    }),
  ) as Record<SkySeason, { found: number; total: number }>;
}

/**
 * The season this find completes: the traced ids plus this one cover the
 * season and the traced ids alone did not. No stored state, and it cannot
 * repeat, since the next problem's traced ids already cover the season.
 */
export function seasonCompletedBy(
  items: readonly Constellation[],
  tracedIds: readonly string[],
  id: string,
): SkySeason | null {
  const found = items.find((c) => c.id === id);
  if (!found || tracedIds.includes(id)) return null;
  const inSeason = items.filter((c) => c.season === found.season);
  const after = new Set([...tracedIds, id]);
  return inSeason.every((c) => after.has(c.id)) ? found.season : null;
}
