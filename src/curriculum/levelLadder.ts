/**
 * Packs with a `starter` and an `advanced` track serve one level ladder: the
 * starter track for levels 1-5, then the advanced track from level 6 with its
 * stage levels shifted down by 5, so level 6 opens the first advanced stage.
 */
const STARTER_TRACK_LAST_LEVEL = 5;

type PackTrack = 'starter' | 'advanced';

interface TrackLevel {
  track: PackTrack;
  /** The level to look the stage up with inside that track. */
  stageLevel: number;
}

export function getTrackLevel(level: number): TrackLevel {
  if (level <= STARTER_TRACK_LAST_LEVEL) {
    return { track: 'starter', stageLevel: Math.max(1, level) };
  }
  return { track: 'advanced', stageLevel: level - STARTER_TRACK_LAST_LEVEL };
}
