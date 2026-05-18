# ADR 0003 — Game-mechanic progression separates from skill mastery

**Status:** Accepted — 2026-05-18
**Supersedes:** none
**Superseded by:** none
**Related:** [ADR-0001](0001-bounded-contexts.md), [ADR-0002](0002-learner-profile.md)

## Context

[ADR-0002](0002-learner-profile.md) introduced `SkillMastery` as the per-skill record of a learner's demonstrated ability. The ADR states: "The adaptive engine reads from `skillMastery[skillId].level` and writes back to the same record." Read literally, this collapses two things into one number:

1. **How hard the questions should be** (skill mastery — a property of the learner, applicable to any game that exercises the skill).
2. **How complex the game mechanic should be** (mechanic progression — grid size, obstacle density, unlocked question kinds, speed — a property of the specific game's UX ramp).

An audit of the 33 registered game bindings (as of 2026-05-18) shows the conflation is load-bearing for a sizable minority of the catalogue:

- **~13 of 33 bindings drive non-question mechanics from level**: all three BattleLearn variants (`gridSize`, `shipLengths`); all six snake bindings (`numStars`, `numJumpPads`, `numBoosts`, `numSegments`); Robo Path (`gridSize`, obstacle count); Shape Dash (`speed`, `numObstacles`, `numCheckpoints`, jump pads); Shape Shift, Star Mapper, Pattern Train (mode and difficulty bands).
- **~6 bindings gate content by level**: BattleLearn switches question kinds at levels 4, 7, 11; multiplication packs unlock `mul_missing` at level 3.
- **~20 bindings use level only to scale question difficulty** (fact-drill family, letter/word/syllable games, balance scale, memory match, etc.) — these are the cases ADR-0002's literal reading handles cleanly.

If [ADR-0002](0002-learner-profile.md) is wired in as written, learners with high `skillMastery[multiplication_1_to_10].level` would start a fresh BattleLearn: multiplication session on a large grid with the most complex ship configuration, without ever having experienced the mechanic's ramp. The question difficulty is appropriate to their mastery; the mechanic complexity is not. The opposite case is symmetric: a learner who has played BattleLearn:multiplication to level 8 but has zero skill mastery (because they were guessing) cannot have their question difficulty reset without also losing their grid familiarity.

The two values diverge in meaning. They should diverge in storage.

## Decision

Split learner progression into two independent values that the adaptive engine reads jointly and writes independently:

```ts
interface LearnerProfile {
  // ... fields from ADR-0002
  skillMastery: Record<SkillId, SkillMastery>; // per-skill, ADR-0002
  mechanicProgression: Record<GameBindingId, MechanicProgression>; // per-binding, this ADR
}

interface MechanicProgression {
  bindingId: GameBindingId; // e.g. 'battlelearn_multiplication_1_5'
  level: number;
  lastPlayedAt: number;
}
```

Three properties of this split are load-bearing:

1. **`mechanicProgression` is keyed by binding id, not mechanic id.** Three BattleLearn bindings (`battlelearn`, `battlelearn_multiplication`, `battlelearn_multiplication_1_5`) each have their own mechanic progression. They share a view component (implementation detail) but expose distinct curricula and distinct level-to-stage maps. A learner who has reached level 8 on `battlelearn` (mixed problem solving) has no implicit credit on `battlelearn_multiplication` — different content, different question kinds, different ramp.
2. **The adaptive engine reads both, writes them separately.** Question generation reads `skillMastery[skillId].level` to choose how hard the next problem should be. Stage selection (grid size, unlocked question kinds, obstacle density) reads `mechanicProgression[bindingId].level`. A correct answer updates skill mastery; finishing a session or hitting a level-up condition updates mechanic progression. The two can move at different rates.
3. **Bindings whose level controls _only_ question difficulty have a degenerate `mechanicProgression`.** For the ~20 bindings in the fact-drill family and similar, `mechanicProgression[bindingId].level` exists for storage symmetry but is unused at read time — generators read skill mastery only. No special case in the type system; the generator chooses what it needs.

The current `gameStore.levels[profileType][gameType]` storage maps cleanly to `mechanicProgression` keyed by binding id. Migration is a rename plus a reshape, not a re-design.

## Alternatives considered

**Keep ADR-0002 as written (one number per skill).** Rejected — produces visible UX regressions on the ~13 bindings that drive mechanic complexity from level. A learner with high multiplication mastery who tries BattleLearn: multiplication for the first time would be served the largest grid and the densest ship layout with no introduction.

**Key `mechanicProgression` by mechanic id, not binding id.** Considered for the BattleLearn case: three bindings share the `battlelearn` view, so they could conceivably share mechanic progression. Rejected — different bindings have different stage maps (BattleLearn-mixed defines 7+ stages, BattleLearn-multiplication-1-5 defines 3). A shared "mechanic level 8" has no consistent meaning across bindings with different stage depths. Sharing progression also undermines the binding abstraction from [ADR-0001](0001-bounded-contexts.md), which says a binding is the curriculum-content unit the registry exposes; collapsing them by mechanic re-mixes content concerns the registry split out.

**Seed new-game `mechanicProgression` from `skillMastery`.** Considered: when a learner with high multiplication mastery opens a fresh BattleLearn: multiplication, start them at mechanic level 3 instead of 1, so they skip the simplest grids they would find boring. Rejected for now — solves a hypothetical UX problem we have no data on, and we can add it later by writing a seeder that runs at first-session-of-binding without changing the storage shape. Kept open as a future refinement; the data shape this ADR specifies does not preclude it.

**Per-mechanic-level component, per-binding-level only for content gates.** Hybrid approach. Rejected — the additional indirection saves no storage and forces every generator to reason about two binding-scoped progression sources (mechanic-shared and binding-specific gate-state). The flat per-binding model is simpler and the audit shows binding-shared mechanics are the minority case.

## Consequences

**Easier:**

- Question generators that already take `level: number` keep the signature; they now read it from `skillMastery[skillId].level` instead of the per-binding store. No type churn.
- Mechanic ramp logic (grid sizes, obstacle counts) reads from a stable per-binding value untouched by skill mastery drift. Existing BattleLearn / Shape Dash / Snake generators move their `level` source over without rewriting the ramp math.
- Cross-game skill consistency works the way [ADR-0002](0002-learner-profile.md) promised: multiplication mastery earned in TEHTESPRINT shows up in NUMBRIMADU and BattleLearn: multiplication's question difficulty.
- Future skill-based features (badges, content-pack auto-selection, recommended-next-game) read one source of truth per skill.

**Harder:**

- Two progression values per binding to display in the UI where today there is one. The "TASE 5" badge on game tiles needs a decision: skill mastery, mechanic progression, or both? Defer to the binding's nature (skill-only bindings show mastery; mechanic-heavy bindings show mechanic level).
- Reset semantics gain an axis. "Reset progress for this game" now means: reset mechanic progression but keep skill mastery (the learner's demonstrated ability shouldn't vanish), reset both, or neither? Default: reset mechanic only. Add a separate "reset skill mastery" action if needed.
- Adaptive-difficulty engine signatures take both values where applicable. Most call sites need only one; the engine module needs an interface that doesn't force every caller to thread both.

**Irreversible (once wired):**

- The shape of `LearnerProfile` includes both fields. Removing `mechanicProgression` later would require either collapsing back into skill mastery (the regression this ADR avoids) or moving mechanic state into a separate aggregate, both of which involve a real migration.

## References

- [ADR-0001](0001-bounded-contexts.md) — bounded contexts; `mechanicProgression` lives in the Learner context alongside `skillMastery`.
- [ADR-0002](0002-learner-profile.md) — `LearnerProfile` and `SkillMastery` shape; this ADR adds a sibling field, does not replace.
- `src/games/generators.ts` lines 1035-1049, 1767, 1853-1992, 2177-2241 — current mechanic-ramp logic that reads level for non-question purposes.
- `src/curriculum/packs/math/battlelearn.ts` — `profile_stage` and `question_stage` items, the clearest case of level-keyed mechanic and content state co-located with curriculum.
- `src/stores/gameStore.ts` line 391 — current `levels[profile][gameType]` storage; migration target for `mechanicProgression`.
