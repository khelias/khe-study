import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../../../curriculum/packs/astronomy/visibleFromEstonia';
import { starOrder } from '../drawing';
import { CREATURES } from '../figures';
import { fitSimilarity, tangentPoints, type Similarity } from '../figures/frame';
import { DRAW_IN_MS, partTransforms, poseAt, timeline } from '../figures/motion';
import { CreatureLayer, type CreatureFrame } from '../sky/CreatureLayer';
import type { Point } from '../figures/types';

const PACK = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items;
const applySimilarity = (m: Similarity, [x, y]: Point): Point => [
  m.a * x - m.b * y + m.e,
  m.b * x + m.a * y + m.f,
];

describe('creatures', () => {
  it('covers the ten easy constellations', () => {
    const easy = PACK.filter((c) => c.difficulty === 'easy').map((c) => c.id);
    expect([...CREATURES.keys()].sort()).toEqual(easy.sort());
  });

  it("anchors every creature on its constellation's figure stars", () => {
    for (const creature of CREATURES.values()) {
      const figure = PACK.find((c) => c.id === creature.id)!;
      expect(new Set(creature.anchors)).toEqual(new Set(starOrder(figure.lines)));
    }
  });

  it('moves only parts it draws and ends every motion at rest', () => {
    for (const creature of CREATURES.values()) {
      const parts = new Set(creature.parts.map((p) => p.id));
      for (const m of creature.motions) {
        expect(m.part === '*' || parts.has(m.part)).toBe(true);
        const end = poseAt(m.frames, 1);
        expect(end.x).toBeCloseTo(0);
        expect(end.y).toBeCloseTo(0);
        expect(end.rotate % 360).toBeCloseTo(0);
      }
      expect(creature.durationMs).toBeGreaterThanOrEqual(2000);
      expect(creature.durationMs).toBeLessThanOrEqual(4000);
    }
  });

  it('draws Suur Vanker on the tangent coordinates its file uses', () => {
    const p = tangentPoints(CREATURES.get('ursa_major')!.anchors);
    const dubhe = p.get(54061)!;
    expect(dubhe[0]).toBeCloseTo(95, -1);
    expect(dubhe[1]).toBeCloseTo(-67, -1);
  });

  it('fits a turned, scaled and shifted copy exactly', () => {
    const src: Point[] = [
      [0, 0],
      [10, 0],
      [0, 20],
    ];
    const turn = { a: 0.5, b: 1.2, e: 30, f: -4 };
    const dst = src.map((q) => applySimilarity(turn, q));
    const m = fitSimilarity(src, dst);
    expect(m.a).toBeCloseTo(turn.a);
    expect(m.b).toBeCloseTo(turn.b);
    expect(m.e).toBeCloseTo(turn.e);
    expect(m.f).toBeCloseTo(turn.f);
  });

  it('draws in, then moves, then holds still', () => {
    const c = CREATURES.get('cygnus')!;
    expect(timeline(c, 0, false)).toEqual({ drawn: 0, t: 0 });
    expect(timeline(c, DRAW_IN_MS, false).drawn).toBe(1);
    expect(timeline(c, DRAW_IN_MS + c.durationMs / 2, false).t).toBeCloseTo(0.5);
    expect(timeline(c, 99_000, false)).toEqual({ drawn: 1, t: 1 });
    expect(timeline(c, 0, true)).toEqual({ drawn: 1, t: 1 });
    expect(partTransforms(c, 0.2).get('wingA')).toContain('rotate(');
  });
});

describe('CreatureLayer', () => {
  function renderLayer(reducedMotion: boolean) {
    const frameRef: { current: CreatureFrame | null } = { current: null };
    const creature = CREATURES.get('orion')!;
    const points = tangentPoints(creature.anchors);
    const utils = render(
      <svg>
        <CreatureLayer
          creatures={[{ creature, animate: true }]}
          reducedMotion={reducedMotion}
          frameRef={frameRef}
        />
      </svg>,
    );
    const at = (hip: number) => {
      const [x, y] = points.get(hip)!;
      return { x: x + 200, y: y + 300, visible: true };
    };
    return { ...utils, frame: (ms: number) => frameRef.current?.(at, ms), creature };
  }

  it('shows the still drawing under reduced motion', () => {
    const { container, frame } = renderLayer(true);
    frame(10);
    const group = container.querySelector('[data-creature="orion"]')!;
    expect(group.getAttribute('display')).toBeNull();
    const matrix = /matrix\(([^)]*)\)/.exec(group.getAttribute('transform') ?? '')![1]!.split(' ');
    [1, 0, 0, 1, 200, 300].forEach((v, i) => expect(Number(matrix[i])).toBeCloseTo(v, 3));
    for (const path of group.querySelectorAll('path')) {
      expect(path.getAttribute('stroke-dasharray')).toBeNull();
    }
    for (const part of group.querySelectorAll('[data-part]')) {
      expect(part.getAttribute('transform')).toBe('');
    }
  });

  it('draws the stroke in, then moves', () => {
    const { container, frame } = renderLayer(false);
    frame(1000);
    frame(1000 + DRAW_IN_MS / 2);
    const path = container.querySelector('[data-creature="orion"] path')!;
    expect(path.getAttribute('stroke-dashoffset')).toBe('0.500');
    frame(1000 + DRAW_IN_MS + 700);
    expect(path.getAttribute('stroke-dasharray')).toBeNull();
    expect(container.querySelector('[data-part="swingle"]')!.getAttribute('transform')).toContain(
      'rotate(',
    );
  });

  it('hides a creature whose stars are off screen', () => {
    const frameRef: { current: CreatureFrame | null } = { current: null };
    const { container } = render(
      <svg>
        <CreatureLayer
          creatures={[{ creature: CREATURES.get('lyra')!, animate: false }]}
          reducedMotion={false}
          frameRef={frameRef}
        />
      </svg>,
    );
    frameRef.current?.(() => ({ x: Number.NaN, y: Number.NaN, visible: false }), 0);
    expect(container.querySelector('[data-creature="lyra"]')!.getAttribute('display')).toBe('none');
  });
});
