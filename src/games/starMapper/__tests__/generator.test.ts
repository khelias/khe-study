import { describe, expect, it } from 'vitest';
import '../../../curriculum';
import { createRng } from '../../../engine/rng';
import { gameRegistry } from '../../registry';
import '../register';
import { ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK } from '../../../curriculum/packs/astronomy/visibleFromEstonia';
import { isClosedSetSkill } from '../../../learner/skillClassification';
import { ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL } from '../../../curriculum/skills/astronomy';
import type { FactStats } from '../../../learner/types';
import type { GeneratorContext } from '../../../types/game';
import {
  angleBetween,
  cameraBasis,
  equatorialToHorizontal,
  horizontalToVector,
  sunAltitude,
} from '../sky/astro';
import { BRIGHT_STARS } from '../sky/brightStars';
import { FIND_MIN_ANGLE, generateStarMapper, modeForLevel, tracedIdsFrom } from '../generator';

const ALL_IDS = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items.map((c) => c.id);

const fact = (correct: number, attempts = Math.max(correct, 1)): FactStats => ({
  attempts,
  correct,
  avgResponseMs: 1000,
  lastSeen: 0,
});

function tracedAll(): GeneratorContext {
  return {
    skillChallenge: { factsKnown: Object.fromEntries(ALL_IDS.map((id) => [id, fact(1)])) },
  };
}

describe('star_mapper generator', () => {
  it('picks the mode per level band', () => {
    expect([1, 2].map(modeForLevel)).toEqual(['draw', 'draw']);
    expect([3, 4].map(modeForLevel)).toEqual(['draw_name', 'draw_name']);
    expect([5, 8].map(modeForLevel)).toEqual(['memory', 'memory']);
    expect([9, 14].map(modeForLevel)).toEqual(['find', 'find']);
  });

  it('draws with guides at levels 1-2 and names at 3-4', () => {
    const p1 = generateStarMapper(1, createRng(1));
    expect(p1.mode).toBe('draw');
    expect(p1.showGuide).toBe(true);
    expect(p1.constellation.difficulty).toBe('easy');
    const p3 = generateStarMapper(3, createRng(2));
    expect(p3.mode).toBe('draw_name');
    expect(p3.options).toHaveLength(4);
    expect(new Set(p3.options).size).toBe(4);
    expect(p3.options).toContain(p3.correctAnswer);
  });

  it('asks from memory at level 6 only for a traced constellation', () => {
    const traced = generateStarMapper(6, createRng(3), tracedAll());
    expect(traced.mode).toBe('memory');
    expect(traced.showGuide).toBe(false);
    const untraced = generateStarMapper(6, createRng(3), {});
    expect(untraced.mode).toBe('draw');
    expect(untraced.showGuide).toBe(true);
  });

  it('counts a key with only wrong attempts as untraced', () => {
    const context: GeneratorContext = {
      skillChallenge: { factsKnown: Object.fromEntries(ALL_IDS.map((id) => [id, fact(0, 3)])) },
    };
    expect(tracedIdsFrom(context)).toEqual([]);
    expect(generateStarMapper(6, createRng(4), context).mode).toBe('draw');
  });

  it('a learner with no facts at level 9 traces first', () => {
    expect(generateStarMapper(9, createRng(5)).mode).toBe('draw');
  });

  it('starts Leia taevast at least 60° away from the target', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const p = generateStarMapper(10, createRng(seed), tracedAll());
      expect(p.mode).toBe('find');
      const target = equatorialToHorizontal(
        p.constellation.centre.ra,
        p.constellation.centre.dec,
        p.sceneUtc,
      );
      const forward = cameraBasis({ ...p.cameraStart, fov: 60 }).forward;
      expect(
        angleBetween(forward, horizontalToVector(target.alt, target.az)),
      ).toBeGreaterThanOrEqual(FIND_MIN_ANGLE);
    }
  });

  it('offers the figure stars and real neighbours brighter than 4.5 as decoys', () => {
    const p = generateStarMapper(7, createRng(6), tracedAll());
    const figure = new Set(p.constellation.lines.flat());
    const decoys = p.stars.filter((s) => !figure.has(s.hip));
    expect(decoys.length).toBeGreaterThan(0);
    for (const s of decoys) {
      expect(BRIGHT_STARS.get(s.hip)).toEqual(s);
      expect(s.mag).toBeLessThan(4.5);
    }
    for (const hip of figure) expect(p.stars.some((s) => s.hip === hip)).toBe(true);
  });

  it('sets every scene in a dark sky', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const p = generateStarMapper(10, createRng(seed), tracedAll());
      expect(sunAltitude(p.sceneUtc)).toBeLessThanOrEqual(-6);
    }
  });

  it('keeps played constellations away while others remain', () => {
    const easy = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items
      .filter((c) => c.difficulty === 'easy')
      .map((c) => c.id);
    const avoid = easy.slice(0, -1);
    for (let seed = 1; seed <= 10; seed++) {
      expect(
        generateStarMapper(1, createRng(seed), { avoidContentIds: avoid }).constellation.id,
      ).toBe(easy[easy.length - 1]);
    }
  });

  it('asks from memory even when every untraced one is unplayed', () => {
    const easy = ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK.items
      .filter((c) => c.difficulty === 'easy')
      .map((c) => c.id);
    const context: GeneratorContext = {
      avoidContentIds: easy,
      skillChallenge: { factsKnown: Object.fromEntries(easy.map((id) => [id, fact(1)])) },
    };
    const modes = Array.from(
      { length: 30 },
      (_, seed) => generateStarMapper(6, createRng(seed * 7919 + 104729), context).mode,
    );
    expect(modes.filter((m) => m === 'memory').length).toBeGreaterThan(10);
    expect(modes).toContain('draw');
  });

  it('carries the traced ids for the atlas', () => {
    const p = generateStarMapper(2, createRng(7), {
      skillChallenge: { factsKnown: { orion: fact(2), leo: fact(0, 1) } },
    });
    expect(p.tracedIds).toEqual(['orion']);
  });
});

describe('star_mapper registry entry', () => {
  it('records the answer under the constellation as a closed-set fact', () => {
    const entry = gameRegistry.get('star_mapper');
    const p = generateStarMapper(1, createRng(8));
    expect(entry?.factKey?.(p)).toBe(p.constellation.id);
    expect(isClosedSetSkill(ASTRONOMY_VISIBLE_CONSTELLATIONS_SKILL.id)).toBe(true);
  });

  it('keeps the sky mounted across problems', () => {
    const entry = gameRegistry.get('star_mapper');
    const a = generateStarMapper(1, createRng(9));
    const b = generateStarMapper(1, createRng(10));
    expect(entry?.renderKey?.(a)).toBe(entry?.renderKey?.(b));
    expect(entry?.config.stage).toBe('immersive');
  });
});
