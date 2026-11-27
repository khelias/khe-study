import React, { useEffect, useRef } from 'react';
import {
  applyMat3,
  equatorialVector,
  horizontalToVector,
  magToSize,
  projector,
  skyMatrix,
  type Camera,
  type ScreenPoint,
  type Vec3,
} from './astro';
import { BRIGHT_STARS } from './brightStars';
import type { FigureLine, SkyStar } from '../../../types/game';

export interface AtlasFigure {
  id: string;
  name: string;
  lines: readonly FigureLine[];
  centre: { ra: number; dec: number };
  found: boolean;
}

export interface OverlayFrame {
  camera: Camera;
  sceneUtc: number;
  width: number;
  height: number;
}

export interface DragLine {
  fromHip: number;
  pointerId: number;
  x: number;
  y: number;
}

interface SkyOverlayProps {
  stars: readonly SkyStar[];
  starLabel: (star: SkyStar, index: number) => string;
  /** Draw the stars themselves (the sky without WebGL has none). */
  showDots: boolean;
  drawnLines: readonly FigureLine[];
  wrongLines: readonly FigureLine[];
  guideLines: readonly FigureLine[] | null;
  ringHips: ReadonlySet<number> | null;
  selectedHip: number | null;
  hop: { from: number; to: number } | null;
  atlas: readonly AtlasFigure[] | null;
  directions: { north: string; east: string; south: string; west: string };
  flare: boolean;
  /** Set by the overlay: draws a frame; the view calls it from the frame loop. */
  frameRef: React.RefObject<((frame: OverlayFrame) => void) | null>;
  /** Screen positions of the tappable stars as of the last frame. */
  positionsRef: React.RefObject<Map<number, ScreenPoint>>;
  dragRef: React.RefObject<DragLine | null>;
  /** True when the view took the press; otherwise it falls through to the sky's pan. */
  onStarPointerDown: (hip: number, e: React.PointerEvent<SVGGElement>) => boolean;
  onStarActivate: (hip: number) => void;
  onAtlasOpen: (id: string) => void;
  backgroundProps: React.SVGProps<SVGSVGElement>;
  ariaLabel: string;
}

const DIRECTIONS = [
  ['north', 0],
  ['east', 90],
  ['south', 180],
  ['west', 270],
] as const;

const lineKey = ([a, b]: FigureLine) => `${a}-${b}`;
const HIDDEN: ScreenPoint = { x: Number.NaN, y: Number.NaN, visible: false };
/** The four directions sit 1.5° above the horizon. */
const HORIZON_MARKS = Object.fromEntries(
  DIRECTIONS.map(([name, az]) => [name, horizontalToVector(1.5, az)]),
) as Record<(typeof DIRECTIONS)[number][0], Vec3>;

/**
 * The SVG layer over the sky: tappable stars as buttons, drawn and guide lines,
 * rings, the hop arrow, the four directions and the atlas. Positions come
 * from `astro.ts` each frame and are written straight to the DOM through refs.
 */
export const SkyOverlay: React.FC<SkyOverlayProps> = ({
  stars,
  starLabel,
  showDots,
  drawnLines,
  wrongLines,
  guideLines,
  ringHips,
  selectedHip,
  hop,
  atlas,
  directions,
  flare,
  frameRef,
  positionsRef,
  dragRef,
  onStarPointerDown,
  onStarActivate,
  onAtlasOpen,
  backgroundProps,
  ariaLabel,
}) => {
  const nodes = useRef(new Map<string, SVGElement>());
  /** Line elements by key, with the two stars each joins, recorded when they mount. */
  const segments = useRef(new Map<string, { el: SVGElement; a: number; b: number }>());
  const svgRef = useRef<SVGSVGElement>(null);
  const vectors = useRef(new Map<string, Vec3>());

  const vectorOf = (key: string, ra: number, dec: number): Vec3 => {
    const cached = vectors.current.get(key);
    if (cached) return cached;
    const v = equatorialVector(ra, dec);
    vectors.current.set(key, v);
    return v;
  };

  // The nodes a frame moves, collected once per render from their data-k keys.
  useEffect(() => {
    nodes.current.clear();
    segments.current.clear();
    for (const el of svgRef.current?.querySelectorAll<SVGElement>('[data-k]') ?? []) {
      const key = el.dataset.k ?? '';
      nodes.current.set(key, el);
      if (el.dataset.a && el.dataset.b) {
        segments.current.set(key, { el, a: Number(el.dataset.a), b: Number(el.dataset.b) });
      }
    }
  });

  useEffect(() => {
    frameRef.current = ({ camera, sceneUtc, width, height }: OverlayFrame) => {
      const m = skyMatrix(sceneUtc);
      const toScreen = projector(camera, width, height);
      const screen = new Map<number, ScreenPoint>();
      const at = (hip: number): ScreenPoint => {
        const known = screen.get(hip);
        if (known) return known;
        const star = BRIGHT_STARS.get(hip);
        const p = star ? toScreen(applyMat3(m, vectorOf(`hip-${hip}`, star.ra, star.dec))) : HIDDEN;
        screen.set(hip, p);
        return p;
      };
      const place = (key: string, p: ScreenPoint) => {
        const el = nodes.current.get(key);
        if (!el) return;
        if (!p.visible) {
          el.setAttribute('display', 'none');
          return;
        }
        el.removeAttribute('display');
        el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      };
      const segment = (el: SVGElement | undefined, a: ScreenPoint, b: ScreenPoint) => {
        if (!el) return;
        if (!a.visible || !b.visible) {
          el.setAttribute('display', 'none');
          return;
        }
        el.removeAttribute('display');
        el.setAttribute('x1', a.x.toFixed(1));
        el.setAttribute('y1', a.y.toFixed(1));
        el.setAttribute('x2', b.x.toFixed(1));
        el.setAttribute('y2', b.y.toFixed(1));
      };

      const positions = new Map<number, ScreenPoint>();
      for (const s of stars) {
        const p = at(s.hip);
        positions.set(s.hip, p);
        place(`star-${s.hip}`, p);
      }
      positionsRef.current = positions;

      for (const { el, a, b } of segments.current.values()) segment(el, at(a), at(b));

      for (const [name] of DIRECTIONS) place(`dir-${name}`, toScreen(HORIZON_MARKS[name]));

      if (atlas) {
        for (const f of atlas) {
          place(`name-${f.id}`, toScreen(applyMat3(m, vectorOf(f.id, f.centre.ra, f.centre.dec))));
        }
      }

      const drag = dragRef.current;
      segment(
        nodes.current.get('drag'),
        drag ? at(drag.fromHip) : HIDDEN,
        drag ? { x: drag.x, y: drag.y, visible: true } : HIDDEN,
      );
    };
    return () => {
      frameRef.current = null;
    };
  });

  const glow = flare ? 'sky-line sky-line-flare' : 'sky-line';

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 h-full w-full touch-none"
      role="group"
      aria-label={ariaLabel}
      tabIndex={0}
      {...backgroundProps}
    >
      {DIRECTIONS.map(([name]) => (
        <g key={name} data-k={`dir-${name}`} display="none" aria-hidden>
          <text className="sky-direction" textAnchor="middle" y={-6}>
            {directions[name]}
          </text>
        </g>
      ))}

      {atlas?.map((f) => (
        <g key={f.id} className={f.found ? 'sky-atlas-found' : 'sky-atlas-dark'} aria-hidden>
          {f.lines.map((l) => (
            <line
              key={lineKey(l)}
              data-k={`atlas-${f.id}-${lineKey(l)}`}
              data-a={l[0]}
              data-b={l[1]}
              display="none"
            />
          ))}
        </g>
      ))}

      {guideLines?.map((l) => (
        <line
          key={lineKey(l)}
          data-k={`guide-${lineKey(l)}`}
          data-a={l[0]}
          data-b={l[1]}
          className="sky-guide"
          display="none"
        />
      ))}
      {wrongLines.map((l) => (
        <line
          key={lineKey(l)}
          data-k={`wrong-${lineKey(l)}`}
          data-a={l[0]}
          data-b={l[1]}
          className="sky-wrong"
          display="none"
        />
      ))}
      {drawnLines.map((l) => (
        <line
          key={lineKey(l)}
          data-k={`line-${lineKey(l)}`}
          data-a={l[0]}
          data-b={l[1]}
          className={glow}
          display="none"
        />
      ))}
      <line data-k="drag" className="sky-line" display="none" />
      {hop && (
        <line
          data-k="hop"
          data-a={hop.from}
          data-b={hop.to}
          className="sky-hop"
          markerEnd="url(#sky-arrow)"
          display="none"
        />
      )}
      <defs>
        <marker
          id="sky-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" className="sky-hop-head" />
        </marker>
      </defs>

      {stars.map((s, i) => {
        const selected = s.hip === selectedHip;
        const label = starLabel(s, i);
        return (
          <g
            key={s.hip}
            data-k={`star-${s.hip}`}
            display="none"
            data-hip={s.hip}
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={selected}
            className="sky-star cursor-pointer"
            onPointerDown={(e) => {
              if (onStarPointerDown(s.hip, e)) e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onStarActivate(s.hip);
              }
            }}
          >
            <circle r={22} className="sky-hit" />
            {showDots && <circle r={Math.max(1.5, magToSize(s.mag) / 2)} className="sky-dot" />}
            {(ringHips?.has(s.hip) || selected) && (
              <circle r={14} className={selected ? 'sky-ring-selected' : 'sky-ring'} />
            )}
          </g>
        );
      })}

      {atlas
        ?.filter((f) => f.found)
        .map((f) => (
          <g
            key={f.id}
            data-k={`name-${f.id}`}
            display="none"
            role="button"
            tabIndex={0}
            className="cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onAtlasOpen(f.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAtlasOpen(f.id);
              }
            }}
          >
            <rect x={-60} y={-22} width={120} height={44} className="sky-hit" />
            <text className="sky-atlas-name" textAnchor="middle" y={5}>
              {f.name}
            </text>
          </g>
        ))}
    </svg>
  );
};
