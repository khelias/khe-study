import { useMediaQuery } from './useMediaQuery';

/** A phone, upright or on its side: the game screen plays under one thin bar. */
const COMPACT_PLAY_QUERY = '(max-width: 767px), (max-height: 520px)';

export const useCompactPlay = (): boolean => useMediaQuery(COMPACT_PLAY_QUERY);
