/**
 * The path's sticker set, in the order a learner earns them; each id has its
 * drawing in `src/components/stickers/`. An achievement's sticker is its
 * badge in a star rim.
 */
export const PATH_STICKER_IDS = [
  'fox',
  'hedgehog',
  'owl',
  'bear',
  'hare',
  'fish',
  'frog',
  'ladybird',
  'squirrel',
] as const;

export type PathStickerId = (typeof PATH_STICKER_IDS)[number];
