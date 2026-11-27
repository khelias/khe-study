/**
 * A creature drawn between a constellation's stars when it is found. Paths
 * are in the figure's tangent plane (`frame.ts`): tenths of a degree, north
 * up, west to the right, as the sky is seen from below, centred on the
 * figure's stars. The layer fits the anchors to their screen positions each
 * frame, so the drawing turns and scales with the camera.
 */
export type Point = readonly [number, number];

export interface CreatureKeyframe {
  /** 0 to 1 over the motion. */
  at: number;
  rotate?: number;
  x?: number;
  y?: number;
}

/** Motions of one part compose in their order, the first one outermost. */
export interface CreatureMotion {
  /** A part id, or '*' for the whole drawing. */
  part: string;
  origin: Point;
  frames: readonly CreatureKeyframe[];
}

export interface Creature {
  /** The constellation's pack id. */
  id: string;
  /** Every star of the constellation's figure, as HIP numbers. */
  anchors: readonly number[];
  parts: readonly { id: string; d: string }[];
  motions: readonly CreatureMotion[];
  /** Length of the motion after the stroke has drawn in, 2 to 4 s. */
  durationMs: number;
}
