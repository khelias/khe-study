# ADR-0002: Learner identity separates from difficulty tier

- **Status:** Accepted (2026-04-23)
- **Supersedes:** none
- **Superseded by:** none
- **Related:** [ADR-0001](0001-bounded-contexts.md)

## Context

The current identity concept in the codebase is `Profile`, defined in `src/types/profile.ts` and `src/types/game.ts:27`:

```ts
export type ProfileType = 'starter' | 'advanced';

export interface Profile {
  id: ProfileType;
  label: string;
  desc: string;
  levelStart: number;
  difficultyOffset: number;
  emoji: string;
}
```

A `ProfileType` is two values — `'starter'` and `'advanced'` — and each profile conflates four different things:

1. Who the learner is (`label`, `emoji`)
2. What difficulty tier they start at (`levelStart`, `difficultyOffset`)
3. How their progress is stored (`gameStore.levels[profileType][gameType] = number`)
4. Which UX to render (current code branches on `profile === 'starter'` in a few places)

The conflation has three concrete problems:

- **Difficulty is per-profile, not per-skill.** A learner who is strong at counting but weak at reading gets the same level in both. The current adaptive-difficulty engine (`src/engine/adaptiveDifficulty.ts`) can nudge within a profile but cannot express the fact that mastery of one skill is independent of mastery of another.
- **Adult persona cannot be expressed.** `ROADMAP.md` §5 targets a second persona (adult) that shares the engine but needs a different UX register (calmer visuals, spaced-repetition cadence, different copy voice). Adding `'adult'` as a third `ProfileType` value only multiplies the `levels[profile][gameType]` space; it does not model what actually changes between kid and adult.
- **Identity has no stable handle.** Profile is a category, not a name. Two children sharing the device cannot have separate inventories and achievements because they share `'starter'` or `'advanced'`. Phase 2 sync cannot key server state on `ProfileType`.

The Learner bounded context introduced in [ADR-0001](0001-bounded-contexts.md) needs a concrete aggregate root. This ADR defines it.

## Decision

Introduce `LearnerProfile` as the root aggregate of the Learner context. Deprecate `Profile` and `ProfileType` in their current form.

```ts
type Persona = 'kid' | 'adult';

interface LearnerProfile {
  id: string; // uuid, stable across renames
  displayName: string;
  persona: Persona; // drives UX register, not difficulty
  ageHint?: number; // optional, for default content curation only
  preferences: {
    locale: 'et' | 'en';
    theme?: string; // meta-progression context populates this
  };
  skillMastery: Record<SkillId, SkillMastery>; // SkillId arrives in Phase 1
  createdAt: number;
  updatedAt: number;
}

interface SkillMastery {
  skillId: SkillId;
  level: number;
  rollingStats: { attempts: number; correct: number; avgResponseMs: number };
  lastPlayedAt: number;
}
```

Four properties of this shape are load-bearing:

1. **`persona` drives UX register, nothing else.** It is not age. It is not relationship. It is not mode. It is the bundle of visual register, motion scale, copy voice, and session cadence targets. `'kid'` and `'adult'` is the minimum set the product currently supports; `'teen'` is a cheap future addition; anything orthogonal (e.g. "family mode", "classroom mode") goes elsewhere, not in `persona`.
2. **Difficulty is per-skill, via `SkillMastery`.** There is no `difficultyOffset` on the profile. The adaptive engine reads from `skillMastery[skillId].level` and writes back to the same record.
3. **`ageHint` is optional and advisory.** It exists so that when a new adult profile is created, the default content pack suggestions skew accordingly. It is not a difficulty input and never will be.
4. **`id` is a uuid.** Not an incrementing integer, not a slug. Sync requires stability under rename; the same learner on two devices must share an id without collision.

## Alternatives considered

**Retrofit `Profile` with a `persona` field.** Leaves `difficultyOffset` and `levelStart` in place. Rejected — the four-way conflation above remains, and the migration cost is not meaningfully smaller than doing it right.

**Two separate types, `KidProfile` and `AdultProfile`.** Rejected — every store, selector, and UI component then branches on the discriminator. A tagged union with a single `persona` discriminator expresses the same intent with none of the branching.

**Per-skill profiles with no top-level `LearnerProfile`.** The learner becomes an emergent property of their skill records. Rejected — achievements, inventory, wallet, and theme ownership all need a stable identity to attach to. A top-level aggregate is required for the Meta-progression context (ADR-0001) to function.

**Keep `ProfileType` but add `'adult'` as a third tier.** Rejected — worst of both worlds: adds a code branch everywhere without solving the difficulty-per-skill problem, and commits the project to growing `ProfileType` indefinitely.

**Full identity service now — email, password, PII, birth year.** Rejected for this phase. `LearnerProfile.id` is enough identity for the client-only MVP. Phase 2 backend introduces auth (magic link per ROADMAP §4 Phase 2), at which point `LearnerProfile` links to an `AccountIdentity` record; the aggregate boundary does not move.

## Consequences

**Positive.**

- The adult persona from `ROADMAP.md` §5 becomes a data change: create a `LearnerProfile` with `persona: 'adult'`. No new code branches.
- Difficulty matches how learning actually works: a child may be at level 5 for `multiplication_1_10` and level 2 for `estonian_vocabulary_a1`. The engine already supports per-dimension progression; this ADR lets the data model reflect it.
- Collection, inventory, achievement, and wallet ownership (Meta-progression context, ADR-0001) all attach to a stable `LearnerProfile.id`.
- Phase 2 backend sync has an obvious boundary: one `LearnerProfile` row server-side per learner, with a one-to-many to `SkillMastery` rows. The persistence adapter pattern in `src/services/persistence/` already supports this shape.
- Multiple learners on one device become cheap. Today there is one active `profile` string; tomorrow `gameStore` holds a `LearnerProfile[]` and an `activeLearnerId`.

**Negative.**

- This ADR cannot be implemented in isolation. `SkillId` is defined by the Curriculum context, which is Phase 1 work. Until Phase 1 names skills, the `skillMastery` field stays empty.
- Migration from existing localStorage data requires a mapping from the current `(ProfileType, gameType) → level` matrix onto `(SkillId) → SkillMastery.level`. The mapping itself becomes a Phase 1 deliverable and must be covered by a round-trip test before old data is discarded.
- UX-register implementation (theme, typography, motion scale, copy voice) is Phase 5 work. Until then, `persona` is stored but not visually differentiated.

**Irreversible commitments.**

- `LearnerProfile.id` format (uuid) is persisted the moment the first profile is created. Changing it later means migrating every persisted record and every server reference.
- `persona` enum values carry UX-register meaning. Once shipped, values cannot be repurposed without a visible product change.
- `ageHint` remains optional forever. Making it required in a future ADR would break every profile that predates the change.

## References

- [ADR-0001](0001-bounded-contexts.md) — Learner is one of five bounded contexts.
- `ROADMAP.md` §5 — adult UX register; §4 Phase 1 — where the `Skill` vocabulary and the migration arrive.
- `src/types/profile.ts`, `src/types/game.ts:27` — current `Profile` and `ProfileType` to be deprecated.
- `src/stores/gameStore.ts` — current `levels[profile][gameType]` structure to be migrated.
- `src/engine/adaptiveDifficulty.ts` — current adaptive engine; rewires to read `SkillMastery` in Phase 1.
- `src/services/persistence/` — adapter pattern that survives the migration unchanged.
