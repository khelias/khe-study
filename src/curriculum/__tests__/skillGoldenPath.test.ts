/**
 * Phase 1 "Done when": every Skill must have at least one golden-path test
 * asserting that its content flows into at least one mechanic without error.
 *
 * This file iterates every registered Skill, finds a game binding that declares
 * it (either via `skillIds` directly, or via a `contentPackId` whose pack is
 * bound to the skill), and exercises the binding's generator at level 1 with a
 * deterministic seed. Failure means a skill has no consumer or its consumer
 * crashes on first call — both of which the Phase 1 contract forbids.
 */

import { describe, it, expect } from 'vitest';

import '../index';
import '../../games/registrations';

import { contentPackRegistry, skillRegistry } from '../registry';
import { gameRegistry } from '../../games/registry';
import { createRng } from '../../engine/rng';
import type { GeneratorContext } from '../../types/game';

const BASE_CONTEXT: GeneratorContext = {
  avoidContentIds: [],
};

interface SkillBinding {
  skillId: string;
  gameId: string;
}

function findBindingForSkill(skillId: string): SkillBinding | undefined {
  const games = gameRegistry.getAll();

  // Direct skillIds match
  const directMatch = games.find((g) => g.skillIds?.includes(skillId));
  if (directMatch) return { skillId, gameId: directMatch.id };

  // Indirect via shared contentPack
  const packsForSkill = contentPackRegistry.getBySkill(skillId);
  for (const pack of packsForSkill) {
    const consumer = games.find((g) => g.contentPackId === pack.id);
    if (consumer) return { skillId, gameId: consumer.id };
  }

  return undefined;
}

describe('Phase 1 skill golden path', () => {
  const skills = skillRegistry.getAll();

  it('registry has skills', () => {
    expect(skills.length).toBeGreaterThan(0);
  });

  it.each(skills.map((s) => [s.id]))(
    'skill %s has at least one game binding that produces a problem',
    (skillId) => {
      const binding = findBindingForSkill(skillId);
      expect(
        binding,
        `skill "${skillId}" has no game binding (neither via skillIds nor via contentPackId)`,
      ).toBeDefined();
      if (!binding) return; // narrows for TS

      const entry = gameRegistry.get(binding.gameId);
      expect(entry, `gameRegistry missing entry for ${binding.gameId}`).toBeDefined();
      if (!entry) return;

      const rng = createRng(42);
      let problem: unknown;
      expect(() => {
        problem = entry.generator(1, rng, BASE_CONTEXT);
      }, `generator for ${binding.gameId} (skill ${skillId}) threw at level 1`).not.toThrow();

      expect(
        problem,
        `generator for ${binding.gameId} (skill ${skillId}) returned no problem`,
      ).toBeDefined();
      const typed = problem as { type?: unknown } | null;
      // Problem.type may be the binding id (e.g. 'addition_snake') or the
      // shared mechanic id (e.g. 'fact_drill') depending on how the mechanic
      // emits problems. Either is acceptable — the contract is "non-empty
      // string", not "matches the binding id".
      expect(
        typeof typed?.type,
        `problem from ${binding.gameId} (skill ${skillId}) missing type`,
      ).toBe('string');
      expect((typed?.type as string).length).toBeGreaterThan(0);
    },
  );
});
