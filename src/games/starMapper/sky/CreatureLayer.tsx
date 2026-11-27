import React, { useEffect, useRef } from 'react';
import type { ScreenPoint } from './astro';
import { fitSimilarity, tangentPoints } from '../figures/frame';
import { partTransforms, timeline } from '../figures/motion';
import type { Creature, Point } from '../figures/types';

export interface ShownCreature {
  creature: Creature;
  /** Draws in and moves when it appears; otherwise it shows still (the atlas). */
  animate: boolean;
}

export type CreatureFrame = (at: (hip: number) => ScreenPoint, timeMs: number) => void;

const STROKE_PX = 1.7;
/** Each creature's anchors in its tangent plane, in anchor order: static data. */
const anchorPoints = new Map<string, Point[]>();
const anchorsOf = (c: Creature): Point[] => {
  let points = anchorPoints.get(c.id);
  if (!points) {
    const plane = tangentPoints(c.anchors);
    points = c.anchors.map((hip) => plane.get(hip)!);
    anchorPoints.set(c.id, points);
  }
  return points;
};

interface Nodes {
  group: SVGGElement;
  root: SVGGElement | null;
  parts: SVGGElement[];
  paths: SVGPathElement[];
  start: number | null;
  /** Drawn in and at rest: only its placement changes from now on. */
  settled: boolean;
}

/**
 * Line-art creatures between the stars, in the overlay. Each frame fits the
 * creature's anchors to their screen positions, so it turns and scales with
 * the camera; a new one draws its stroke in, moves, then holds still.
 */
export const CreatureLayer: React.FC<{
  creatures: readonly ShownCreature[];
  reducedMotion: boolean;
  frameRef: React.RefObject<CreatureFrame | null>;
}> = ({ creatures, reducedMotion, frameRef }) => {
  const rootRef = useRef<SVGGElement>(null);
  const nodes = useRef(new Map<string, Nodes>());

  // The nodes a frame writes, collected when the set of creatures changes;
  // a creature that stays keeps its start time.
  useEffect(() => {
    const next = new Map<string, Nodes>();
    for (const group of rootRef.current?.querySelectorAll<SVGGElement>('[data-creature]') ?? []) {
      const id = group.dataset.creature ?? '';
      const known = nodes.current.get(id);
      next.set(id, {
        group,
        root: group.querySelector<SVGGElement>('[data-root]'),
        parts: [...group.querySelectorAll<SVGGElement>('[data-part]')],
        paths: [...group.querySelectorAll('path')],
        start: known?.group === group ? known.start : null,
        settled: known?.group === group ? known.settled : false,
      });
    }
    nodes.current = next;
  }, [creatures]);

  useEffect(() => {
    frameRef.current = (at, timeMs) => {
      for (const { creature, animate } of creatures) {
        const n = nodes.current.get(creature.id);
        if (!n) continue;
        const dst: Point[] = [];
        let visible = true;
        for (const hip of creature.anchors) {
          const p = at(hip);
          if (!p.visible) visible = false;
          dst.push([p.x, p.y]);
        }
        if (!visible) {
          n.group.setAttribute('display', 'none');
          continue;
        }
        n.group.removeAttribute('display');
        const m = fitSimilarity(anchorsOf(creature), dst);
        const scale = Math.hypot(m.a, m.b) || 1;
        n.group.setAttribute(
          'transform',
          `matrix(${[m.a, m.b, -m.b, m.a, m.e, m.f].map((v) => v.toFixed(4)).join(' ')})`,
        );
        n.group.setAttribute('stroke-width', (STROKE_PX / scale).toFixed(3));
        if (n.settled) continue;

        n.start ??= timeMs;
        const { drawn, t } = timeline(creature, timeMs - n.start, !animate || reducedMotion);
        const rest = t >= 1;
        const transforms = rest ? null : partTransforms(creature, t);
        n.root?.setAttribute('transform', transforms?.get('*') ?? '');
        for (const el of n.parts) {
          el.setAttribute('transform', transforms?.get(el.dataset.part ?? '') ?? '');
        }
        for (const path of n.paths) {
          if (drawn < 1) {
            path.setAttribute('stroke-dasharray', '1 1');
            path.setAttribute('stroke-dashoffset', (1 - drawn).toFixed(3));
          } else {
            path.removeAttribute('stroke-dasharray');
            path.removeAttribute('stroke-dashoffset');
          }
        }
        n.settled = rest && drawn >= 1;
      }
    };
    return () => {
      frameRef.current = null;
    };
  });

  return (
    <g ref={rootRef} className="sky-creature" aria-hidden>
      {creatures.map(({ creature }) => (
        <g key={creature.id} data-creature={creature.id} display="none">
          <g data-root>
            {creature.parts.map((p) => (
              <g key={p.id} data-part={p.id}>
                <path d={p.d} pathLength={1} />
              </g>
            ))}
          </g>
        </g>
      ))}
    </g>
  );
};
