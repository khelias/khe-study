# ADR-0001: Platform organized as five bounded contexts

- **Status:** Accepted (2026-04-23)
- **Supersedes:** none
- **Superseded by:** none

## Context

The project started as a single-purpose learning game for children and grew to 18 games sharing a progression system and adaptive-difficulty engine. Today, skill, mechanic, and content are welded together inside `src/games/`:

- `constellations.ts` pairs specific star-pattern content with the "connect the dots" mechanic.
- `syllableWords.ts` pairs Estonian syllable data with the syllable-game view.
- `sentenceTranslations.ts` pairs Estonian-English sentence pairs with one specific game view.
- `generators.ts` switches on game type and produces both problem instances and mechanic parameters in the same function.

Adding a new subject — e.g. multiplication tables — requires writing a new generator, a new content file, and often a new game view, even when a suitable mechanic already exists elsewhere. Adding a second persona (the adult use-case in `ROADMAP.md` §1) requires reasoning about persona, skill level, difficulty tier, and content appropriateness as one tangled concern, because those concepts do not exist as separate entities.

The product vision in `ROADMAP.md` (children and adults on one codebase; 50+ skills; collectible themes as meta-progression; eventual paywall) cannot be delivered on the current organization without large regret later.

## Decision

The domain is organized into five bounded contexts. Each owns its types, its tests, and — once a backend exists — its server-side tables or modules. Cross-context communication happens via explicit interfaces, not direct imports.

1. **Learner** — `LearnerProfile`, `SkillMastery`. Owns who the player is and what they have demonstrably learned.
2. **Curriculum** — `Skill`, `ContentPack`, `ContentItem`. Owns the curriculum graph and the content instances bound to each skill.
3. **Gameplay** — `GameMechanic`, `PlaySession`, `AdaptiveEngine`. Owns how the player interacts, the transient state of a session, and the difficulty engine.
4. **Meta-progression** — `Wallet`, `Inventory`, `UnlockCatalog`, `Achievement`. Owns the collection and economy layer around play, independent of any single session or skill.
5. **Entitlement** — `Tier`, `FeatureFlag`, `Paywall`. Owns whether a given profile has access to a given feature. Feature-flag scaffolding already exists in `src/monetization/`; this ADR formalizes that it is its own context.

A game is no longer a first-class domain entity. What the registry in `src/games/registrations.ts` registers is a _binding_ of the form `{ mechanic, compatibleSkills[], defaultContentPackId }`. The same mechanic can serve multiple skills; the same skill can be rendered by multiple mechanics.

## Alternatives considered

**Status quo (one context).** Keep everything in `src/games/` and rely on conventions. Rejected: cannot express persona without reshaping `Profile`, cannot version content separately from release cadence, cannot add entitlement gating without code changes scattered across the file set. The cost of migration grows with each additional game; decomposing now is cheaper than decomposing later.

**Two contexts (Player, Game).** Groups skill + content + mechanic + meta-progression together under "Game". Rejected: conflates content authoring with code release (one of the problems `ROADMAP.md` Phase 4 explicitly addresses) and collapses the distinction between "earned" (Meta-progression) and "bought" (Entitlement), which must diverge once a paywall exists.

**Seven or more contexts.** Split Assessment out of Gameplay, Achievement out of Meta-progression, Locale and Accessibility as their own contexts, etc. Rejected for now: premature for current scale. Revisit when any single context reaches ~8 entity files or grows a recurring cross-cutting concern.

**Feature-first (vertical) slicing only.** Organize by subject: `src/multiplication/`, `src/reading/`, `src/estonian/`. Rejected: each feature would duplicate mechanic code, adaptive-difficulty logic, and meta-progression plumbing. The project's architectural leverage depends on the _horizontal_ reuse of the engine across subjects.

**Full DDD with aggregate roots, repositories, and application services.** Rejected for this phase: the bounded contexts give the correct seam for the current work without the ceremony. Aggregates can be introduced inside a context later if the context grows to need them; the boundaries set here will not have to move.

## Consequences

**Positive.**

- Adding a new skill becomes a data change (one `ContentPack`) plus a metadata entry (one `Skill`). No mechanic code is touched. No game view is added.
- Adding a new mechanic becomes a code change in one context. Existing skills gain that mechanic via the binding registry.
- The adult persona from `ROADMAP.md` §5 becomes expressible without new domain concepts: same `LearnerProfile` entity with a different `persona` value; same curriculum, filtered `ContentPacks`; same engine, different UX register.
- Each context is testable in isolation. Integration tests live at the seams, not inside them.
- When a backend lands (`ROADMAP.md` Phase 2), the bounded contexts become the natural module or service boundary. The persistence adapter pattern in `src/services/persistence/` already enforces this at the data-access seam.

**Negative.**

- Cross-context coordination becomes explicit ceremony we do not pay today. Ending a `PlaySession` must update both Learner's `SkillMastery` and Meta-progression's `Wallet`; this becomes an orchestrated step, not an implicit side effect.
- Requires discipline. It will be tempting for Gameplay code to import directly from Meta-progression. The codebase needs an ESLint import-restriction rule or a documented review policy to guard the boundary.
- Phase 1 migration is not free. Existing game data in `src/games/` must be restructured into `ContentPacks` before any new feature benefits from the decomposition.

**Irreversible commitments.**

- The names and scope of the five contexts become load-bearing for all subsequent ADRs, file organization, and eventual database schema. Re-splitting a context later is possible but expensive once data has been persisted under that context's schema.

## References

- `ROADMAP.md` §3 — target domain model diagram; §4 Phase 1 — the migration that realizes this decision in code.
- `src/games/registrations.ts` — the current registry to be extended with bindings in Phase 1.
- `src/monetization/` — existing Entitlement scaffolding (feature flags, tiers, hooks).
- `src/services/persistence/` — existing adapter pattern that will survive the decomposition unchanged.
