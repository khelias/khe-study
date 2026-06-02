# Roadmap

**Status:** Draft, 2026-04-23. Living document — revise as reality informs the plan.

This roadmap turns the project from a **polished front-end showcase** into an **architecture reference project with a real product behind it**: a learning platform usable by both children (Estonian curriculum, grades 1–6) and adults (general knowledge, languages, refresher content), unified by a single persona-agnostic domain model.

The document is organized as:

1. **Vision & positioning** — the north star.
2. **Current state** — honest inventory of what exists today.
3. **Target domain model** — bounded contexts the work converges toward.
4. **Phases 0–6** — sequential, each with scope, non-goals, and exit criteria.
5. **Open decisions** — questions to resolve before certain phases start.

---

## 1. Vision & positioning

Two goals carried together:

- **Product goal.** A learning platform where the same engine serves a 7-year-old practicing multiplication tables and an adult practicing Estonian river names. One app, one account model, two UX registers.
- **Reference goal.** A codebase that demonstrates, at a level an enterprise architect would accept, the decoupling of four concerns that commercial ed-tech routinely conflates:
  - **Skill** (what is being learned — e.g. multiplication 1–10, Estonian vocabulary A1)
  - **Mechanic** (how the player interacts — Math Snake, Balance Scale, Word Master)
  - **Content** (the data instances — which words, which facts, which problems)
  - **Meta-progression** (the collection / economy layer — theme unlocks, wallet, achievements)

Today all four are welded together inside the `games/` folder. The roadmap's backbone is separating them cleanly, then building real concerns (sync, auth, observability, content CMS) on top.

**What this is not:**

- Not a competitor to Duolingo, Lingvist, or Lumosity on scale.
- Not a SaaS with growth targets. The differentiator is **Estonian cultural and curricular content** plus **family + self-use bridge** — niche by design.
- Not an excuse to ship a hobby app with enterprise scaffolding. Every architectural layer must justify its existence against a real user concern. If it doesn't, it doesn't ship.

---

## 2. Current state

### What is solid

- Pure engine layer (`src/engine/`): `rng.ts`, `adaptiveDifficulty.ts`, `progression.ts`, `achievements.ts`, `stats.ts` — deterministic, testable, UI-independent. 76% coverage.
- Declarative game registry — 23 games registered via `src/games/registrations.ts`, `src/games/registry.ts`. Extension pattern proven.
- TypeScript strict mode (`noUncheckedIndexedAccess`, no implicit `any`), ESLint with `no-explicit-any`, Prettier enforced in CI, colocated `__tests__/` throughout.
- State split: persistent `gameStore` + session `playSessionStore` in `src/stores/`.
- Persistence adapter pattern already scaffolded (`src/services/persistence/`: `apiAdapter.ts` + `localStorageAdapter.ts` behind `persistenceService.ts`).
- i18n scaffolding live (`src/i18n/locales/{et,en}.ts`).
- Monetization scaffolding live (`src/monetization/` — feature flags, tiers, hooks, no active gates).
- CI/CD: GitHub Actions quality gate (lint / dead-code check / typecheck / format-check / unit / E2E / build) plus self-hosted-runner deploy → `games.khe.ee/study/`. See `.github/workflows/ci.yml` + `deploy.yml`.
- Playwright E2E safety net: four smoke scenarios covering menu load, category expansion, game navigation, balance-scale answer → stats.
- Whole-game Playwright QA: every `GAME_CONFIG` game route now has a render smoke that fails on route errors, lingering loading state, `console.error`, or page exceptions.
- Manual full-game browser QA baseline recorded in [docs/qa/2026-04-27-full-game-qa.md](docs/qa/2026-04-27-full-game-qa.md): menu/modals plus all 23 game routes were opened in the in-app browser and each route received at least one real interaction. Immediate findings already fixed: Shape Dash hardcoded English strings, Shop/Level close aria labels, and Shape Shift drag anchoring/release.
- Gameplay screen refactored into container + pure view + modal host (`src/features/gameplay/GameScreen.tsx` + `GameScreenView.tsx` + `GameScreenModalHost.tsx`) with heavy side-effect orchestration extracted into named hooks (`useMathSnakeMovement`, `useGameScreenEffects`, `useUnlockedAchievementCopies`).
- ADRs recorded: [ADR-0001](docs/adr/0001-bounded-contexts.md) (five bounded contexts), [ADR-0002](docs/adr/0002-learner-profile.md) (persona-agnostic learner identity).
- `ARCHITECTURE.md` documents current shape; supersession by ADRs is explicit where relevant.
- Curriculum context scaffolded (`src/curriculum/`) with `Skill`, `ContentPack<TItem>`, and singleton registries. 19 skills + 22 packs live: `astronomy.visible_constellations` (single-pack), `language.syllabification` (multi-locale: et + en), `language.spatial_sentences` (Sentence Logic scenes), `language.vocabulary` (multi-locale word packs for word builder / cascade / pairs / letter match), fifteen math skills (`addition_within_20`, `addition_within_100`, `subtraction_within_20`, `subtraction_within_100`, `multiplication_1_to_5`, `multiplication_1_to_10`, `geometry_shapes`, `pattern_sequences`, `unit_conversions`, `compare_numbers`, `time_reading`, `balance_equations`, `addition_memory`, `grid_navigation`, `mixed_problem_solving`), and Shape Dash / Shape Shift geometry content. Each snake math skill has one focused pack; `math_snake` engine (one mechanic) powers six bindings collapsed into one mechanic-level menu card ("NUMBRIMADU") via `MechanicCard` + `PackPickerModal`. `shape_dash` is bound to `MATH_GEOMETRY_SHAPES_PACK`; `shape_shift` is bound to `SHAPE_SHIFT_PUZZLES_PACK`; `pattern` is bound to `MATH_PATTERN_SEQUENCES_PACK`; `unit_conversion` is bound to `MATH_UNIT_CONVERSIONS_PACK`; `compare_sizes` is bound to `MATH_COMPARE_NUMBERS_PACK`; `time_match` is bound to `MATH_TIME_READING_PACK`; `balance_scale` is bound to `MATH_BALANCE_EQUATIONS_PACK`; `memory_math` is bound to `MATH_ADDITION_MEMORY_PACK`; `robo_path` is bound to `MATH_GRID_NAVIGATION_PACK`; `battlelearn` is bound to `MATH_BATTLELEARN_PACK`; `sentence_logic` is bound to `LANGUAGE_SPATIAL_SENTENCES_PACK`; word vocabulary games declare `LANGUAGE_VOCABULARY_SKILL` and resolve locale-specific words at runtime. Their generators own placement/shuffling/runtime state while the question/puzzle/scene/word/pattern/unit/comparison/time/balance/memory/grid-stage/battle-stage banks live in curriculum. `GameConfig` gained `mechanic?: string`; a parallel `MECHANICS` map (`MechanicConfig`) in `data.ts` defines mechanic-level display (title, theme, emoji). `MenuScreen` groups bindings sharing a mechanic into one card; tapping opens a pack picker listing the bindings with per-binding level/highscore/difficulty. `GameRegistryEntry` carries optional `skillIds` + `contentPackId`. Three lookup shapes exist: `getPackItems(id)` for single-pack, `getPackItemsForLocale(skillId, locale)` for multi-locale, and **spec-pool packs** for procedural content (math DSL). `GameConfig` also has optional `visualTheme` so bindings sharing a component can diverge visually (cosmic theme on multiplication variants).
- Learner context scaffolded (`src/learner/`) with `LearnerProfile`, `SkillMastery`, `MechanicPreference`, and a legacy game→skill migration map. `gameStore.learners[] + activeLearnerId` model multiple learners on one device; `activeLearnerProfile` is a derived mirror kept in sync by `commitActiveLearner`. Mechanic difficulty is read from `mechanicPreference[mechanicId].difficulty` (Phase 5f), skill challenge from `skillMastery[skillId].factsKnown` rolling stats. `ProfileType` and the legacy `levels[profile][game]` cache are fully removed; generators receive only `level`, `learner`, and `context` (with optional `skillChallenge.factsKnown` for closed-set spaced repetition).

### What is debt

- **Skill ≡ Mechanic ≡ Content welding.** Remaining content is mostly several inline generator branches in `src/games/generators.ts` (constellations migrated in Slice 1, syllables in Slice 2, math*snake's equation pool in Slice 3, Shape Dash geometry in Slice 5, Shape Shift puzzles in Slice 6, Sentence Logic scenes in Slice 7, vocabulary words in Slice 8, Pattern Train themes/templates in Slice 10, Unit Conversion definitions in Slice 11, Compare Sizes stage specs in Slice 12, Time Match stage specs in Slice 13, Balance Scale progression specs in Slice 14, Memory Math progression specs in Slice 15, Robo Path grid/obstacle progression specs in Slice 16, BattleLearn board/question progression specs in Slice 17; Shape Shift grid math moved from `games/` to `engine/` in Slice 9 — see §7). Three pack shapes now proven: static single-pack, multi-locale, procedural DSL. Adding a new math skill is already a pack + one binding, zero engine change — first proven by `math_snake` (six bindings across +/−/× within 20/100/1–5/1–10), then by `fact_drill` (eight timed-sprint bindings reusing the same +/−/× packs and a new `math.division_facts_1_to*{5,10}`skill pair).`math.multiplication_6_10` and similar future variants remain data-only additions.
- **No server.** `apiAdapter.ts` is a TODO stub. No user identity beyond localStorage. No cross-device sync. No shared content distribution.
- **No observability.** Runtime errors are caught by the root React error boundary, but there is no production telemetry or error-reporting integration yet.
- **No collection / economy layer.** Stars exist as an earned counter; there is no spending target, no inventory, no unlock catalog, no theme application system.
- **Monetization scaffolding has never been exercised.** Feature flags are defined, nothing gates on them. Plumbing without a fixture.
- **Product QA debt is now the blocker before backend work.** The browser pass found the app is stable enough to load and play, but not yet cohesive enough as a product: individual games use different density/color conventions, some mechanics need clearer onboarding, and the economy/progression surfaces compete for attention.
- **Economy semantics are unclear.** Hearts, spendable stars, collected stars, free star purchase, paid hints, achievements, and stats all exist, but the product meaning is not consistent. `ShopModal` still exposes "buy stars" as free, and stats labels do not clearly distinguish earned lifetime stars from current spendable balance.
- **Content-pack depth resolved (Phase 1.5 closed 2026-05-19).** Registry has 23 skills, 28 packs, 34 game bindings. All 28 packs carry an explicit owner-decision in [docs/qa/2026-05-19-content-pack-audit.md](docs/qa/2026-05-19-content-pack-audit.md): 19 authored packs marked "OK" or "OK; copy-reviewed", 8 DSL-spec pools marked "DSL-spec OK", 1 (`math.geometry_shapes.shape_shift_puzzles`) marked "OK; expand-recommended" (25 puzzles, ~30 is the future target but does not block Phase 2).

---

## 2.1 Full-game QA baseline — 2026-04-27

This baseline is the first point where the project can be evaluated as a whole product rather than as a set of migrated mechanics.

**Environment.** Codex in-app browser, local Vite dev server at `http://127.0.0.1:5173/study/`, narrow mobile-like viewport, Estonian locale.

**Coverage.**

- Menu, settings, stats, achievements, shop, tutorial, and favorites editor.
- All 23 registered game routes.
- One real browser interaction per game route.
- Console-error capture through the browser pass and Playwright E2E.
- Local visual artifacts under `/tmp/study-game-qa/`: first-render contact sheet, post-interaction contact sheet, and `interact-results.json`.

**Outcome.** No route failed to render, no unknown-game route appeared, no generic app error appeared, and no captured runtime console error remained after fixes.

**Immediate fixes shipped from the pass.**

- Shape Dash UI and canvas labels now use locale strings instead of hardcoded English.
- Shape Shift drag now keeps the piece centered under the pointer and drops reliably after the pointer leaves the tray.
- Shop and level selector close controls now expose generic close labels instead of the statistics-modal label.
- Shape Shift now has first-session target shadows and puzzle names, rectangular piece footprints, bounds tests for authored targets, same-shape interchangeable snap/validation, and persistent content-pack exposure history to reduce repeated puzzles.

**Next product-quality priorities before Phase 2.**

| Priority        | Area                | Decision / work                                                                                                                                                                                                                                                                                   |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done 2026-04-27 | Regression coverage | Focused interaction E2E now covers Shape Shift drag/drop, Shape Dash jump/run, BattleLearn question modal + answer, one standard answer-card game, and Picture Pairs after peek.                                                                                                                  |
| Done 2026-04-27 | Economy semantics   | Stars are now split into spendable balance vs. lifetime earned stats. Hearts cost 10 stars each, max at 5, and temporary free star top-up remains available until real purchases.                                                                                                                 |
| Done 2026-04-27 | Shape Shift UX      | First pass shipped: puzzle names, target shadows, rectangular piece footprints, compatible-piece snap/validation, and played-content history. Continue content-quality curation.                                                                                                                  |
| Done 2026-04-27 | Shape Dash UX       | Compact portrait playfield, dedicated jump button, later first gate, vertical jump-height gates, forgiving star hitboxes, safer spawn corridors, and content-pack play history.                                                                                                                   |
| P1              | Stats/achievements  | Align copy and contrast: locked achievements are too washed out; stats should not confuse current balance with lifetime collection.                                                                                                                                                               |
| P1              | Content packs       | Audit refreshed in [docs/qa/2026-05-19-content-pack-audit.md](docs/qa/2026-05-19-content-pack-audit.md) (28 packs, 0 shallow warnings). Two packs flagged **expand**: `language.spatial_sentences.scene_pack` (8 → ~20 scenes) and `math.geometry_shapes.shape_shift_puzzles` (20 → ~30 puzzles). |
| P2              | Standard games      | Add short inline task prompts and richer feedback loops to Word Builder, Syllables, Letter Match, Unit Conversion, Compare Sizes, and Sentence Logic.                                                                                                                                             |

The practical conclusion: **Phase 1 is architecturally close, but a Phase 1.5 product-quality pass should happen before backend/auth/sync.** The backend would otherwise preserve and sync unclear product semantics.

---

## 3. Target domain model

Five bounded contexts. Each should own its types, tests, and (eventually) server tables. No cross-context imports except via explicit, narrow interfaces.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Learner Context                          │
│  LearnerProfile   —  id, displayName, ageHint?, persona,        │
│                      skillMastery[], preferences                │
│  SkillMastery     —  skillId, level, lastPlayed, rollingStats   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Curriculum Context                          │
│  Skill            —  id, name, taxonomy (grade/level/subject),  │
│                      prerequisites[], compatibleMechanics[]     │
│  ContentPack      —  id, skillId, locale, version, items[]      │
│  ContentItem      —  skill-specific payload (e.g. {a:7,b:8,op}) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Gameplay Context                           │
│  GameMechanic     —  id, supportedSkillTypes[], view component  │
│  PlaySession      —  profileId, mechanicId, skillId, contentRef,│
│                      startedAt, events[], outcome               │
│  AdaptiveEngine   —  (skillMastery, sessionEvents) → difficulty │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Meta-progression Context                     │
│  Wallet           —  stars, (future: gems, subscription credit) │
│  Inventory        —  ownedThemeIds[], ownedCosmeticIds[]        │
│  UnlockCatalog    —  themes, cosmetics, with price + rarity     │
│  Achievement      —  (unchanged from today)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Entitlement Context                         │
│  Tier             —  free | premium | family                    │
│  FeatureFlag      —  (existing monetization/ scaffolding)       │
│  Paywall          —  rule → allow | block | deferred            │
└─────────────────────────────────────────────────────────────────┘
```

Key point: a `Game` is no longer a primary entity. What the registry registers is a **binding** — `{ mechanic, compatibleSkills, defaultContentPack }`. The same Math Snake mechanic serves multiplication for a second-grader and percentages for an adult, purely by swapping skill + content.

---

## 4. Phases

Each phase is **self-contained**: stopping after any of them leaves the project in a better state than before. No phase depends on a later phase.

### Phase 0 — Foundation & debt paydown

**Goal.** Put the project in a shape where Phase 1's refactor is safe.

**Scope.**

- Decompose `GameScreen.tsx` into `GameScreenContainer` (state wiring) + `GameScreenView` (pure props) + one modal-host component. Target <200 LOC per file.
- Add explicit `typecheck` npm script (`tsc --noEmit`), run in CI before build.
- Add Prettier, enforce via ESLint plugin; single pass over repo.
- Create `docs/adr/` directory. Write **ADR-0001: Bounded contexts of the learning platform** (the diagram in §3 above, the reasoning behind it, alternatives rejected).
- Write **ADR-0002: Persona-agnostic learner model** — deprecate age-tier `Profile` in favor of `LearnerProfile` with optional `ageHint` and persona-driven UX register.
- Add Playwright (or Cypress) with three E2E flows: load the learner-progress menu, play one round of a representative game, earn stars. These become the refactor safety net.

**Non-goals.**

- No domain-model code changes yet. Only ADRs and safety net.
- No backend work.

**Done when.**

- CI runs `lint`, `typecheck`, `test`, `e2e`, `build` — all green.
- ADR-0001 and ADR-0002 merged.
- `GameScreen.tsx` split and passing all tests at the new structure.

**Estimate.** 1–2 weeks calendar (evening work).

---

### Phase 1 — Skill × Mechanic × Content decoupling

**Goal.** Introduce the `Skill` and `ContentPack` entities; migrate existing games so that content is data, not code.

**Scope.**

- Define types for `Skill`, `ContentPack`, `ContentItem` in a new `src/curriculum/` directory.
- Migrate existing inline content (`constellations.ts`, `puzzles.ts`, `syllableWords.ts`, `sentenceTranslations.ts`, `generators.ts`) into ContentPacks, versioned, locale-tagged.
- Introduce `LearnerProfile`, `SkillMastery`, and (added in Phase 5) `MechanicPreference` types. Effective level resolution reads from `LearnerProfile` (specifically `mechanicPreference[mechanicId].difficulty` after the Phase 5 axis split), not from the old difficulty-tier `ProfileType`. Session-scoped adaptive nudging stays in `engine/adaptiveDifficulty.ts` on top of that base.
- `registrations.ts` entries become bindings: each game declares optional `skillIds` and `contentPackId` on the registry entry, plus an optional `mechanic` field on `config` for multi-binding mechanics (`math_snake`, `fact_drill`). Runtime resolves the pack via `getPackItems` / `getPackItemsForLocale`.
- Update `ARCHITECTURE.md` section _Game Data_ to describe the new model. Leave a migration note pointing to ADR-0001.
- Tests: every `Skill` must have at least one golden-path test asserting that its content flows into at least one mechanic without error.

**Non-goals.**

- No backend. Content packs ship as JSON files imported at build time.
- No new games. No adult content yet. No theme collection yet.
- No account system — `LearnerProfile` stays in localStorage.

**Done when.**

- Adding a new skill (e.g. `multiplication_1_10`) to the platform is a data-only change: create a ContentPack JSON, reference it in one registration binding. No engine or component code touched.
- All current games still playable, still passing their tests.
- Coverage on engine holds or improves.

**Risks.**

- Scope creep. The temptation will be to "finally fix" unrelated code while touching every file. Resist — that's Phase 0's job.
- Migration loss. A mistranslation from the old data shape to `ContentPack` breaks a game silently. Mitigated by the E2E tests added in Phase 0.

**Estimate.** 3–4 weeks calendar.

---

### Phase 1.6 — Per-mechanic folder colocation (in flight)

**Goal.** Deliver the ADR-0001 implied target where adding a new mechanic is "one folder", not six central-file edits.

**Why.** Phase 1's "Done when" said "Adding a new skill is data-only". That is true for adding a new pack/binding to an _existing_ mechanic (math_snake +1 variant, battlelearn multiplication). It is NOT true for adding a new mechanic from scratch: today that touches `GAME_CONFIG` in `data.ts`, `Generators` in `generators.ts`, `validators.ts`, `registrations.ts`, `types/game.ts`, both i18n locales, and the gameViews folder. The honest summary is six central-file edits plus two new files. ADR-0001 implicitly targeted a per-mechanic folder; Phase 1 never enforced it. Phase 1.6 finishes that work.

**Pattern (proven 2026-05-20 on `balance_scale`).** Each mechanic owns `src/games/<mechanic>/`:

```
src/games/balanceScale/
  config.ts        BALANCE_SCALE_CONFIG: GameConfig
  generator.ts     generateBalanceScale(level, rng) -> BalanceScaleProblem
  validator.ts     validateBalanceScale: AnswerValidator
  View.tsx         BalanceScaleView component
  register.ts      side-effect: gameRegistry.register({...})
  __tests__/       colocated tests (existing tests stay wherever they sit)
```

Central files become thin composers:

- `data.ts` imports each `<mechanic>/config.ts` and spreads into `GAME_CONFIG`.
- `generators.ts` imports each generator and assigns into the `Generators` map.
- `validators.ts` no longer holds the mechanic's validator (consumers import directly from `<mechanic>/validator.ts`).
- `registrations.ts` adds one `import './<mechanic>/register';` line per mechanic and drops the per-mechanic register block.

The Problem-type union in `types/game.ts` stays central — moving its members out breaks the discriminated union shape. Shared theme palette extracted to `src/games/themes.ts` to avoid `data.ts ⇄ <mechanic>/config.ts` cycles.

**Subtasks (one per mechanic).** Each subtask = create folder + move 4-5 files + update central files + verify quality gate. Expected effort: ~15-30 min per mechanic depending on size.

- [x] `balance_scale` (prototype, 2026-05-20)
- [x] `time_match`
- [x] `compare_sizes`
- [x] `memory_math`
- [x] `pattern` (Pattern Train)
- [x] `unit_conversion`
- [x] `word_builder`
- [x] `word_cascade` + `word_cascade_long`
- [x] `syllable_builder`
- [x] `letter_match`
- [x] `picture_pairs`
- [x] `sentence_logic`
- [x] `star_mapper`
- [x] `robo_path`
- [x] `shape_shift`
- [ ] `shape_dash`
- [x] `math_snake` family (6 bindings sharing one engine)
- [x] `fact_drill` family (8 bindings sharing one engine + the BattleLearn question helpers)
- [x] `battlelearn` family (3 bindings)

**Non-goals.**

- No backend, no new mechanics, no content changes during this phase.
- Don't touch i18n locale layout — keys stay in `et.ts` + `en.ts` (the type-safe key system requires central files).
- Don't move the Problem-type union out of `types/game.ts`.

**Done when.**

- Every mechanic has its own `src/games/<mechanic>/` folder.
- `generators.ts` is reduced to imports + `Generators` map assignment.
- `validators.ts` either thin re-exports or empty (delete if empty).
- Adding a new mechanic from scratch touches 3 central-file lines (data.ts config import, generators.ts generator import, registrations.ts side-effect import) plus the new folder.
- 549+ tests, lint, lint:dead, format:check, build green throughout.

---

### Phase 1.5 — Product QA, game quality, and content depth

**Goal.** Turn the now-decoupled architecture into a cohesive, testable learning product before investing in server-side sync.

This phase is inserted after the 2026-04-27 full-game browser QA. It does not change the target bounded contexts; it hardens the current local-first product so Phase 2 does not lock in unclear economy, stats, onboarding, or content decisions.

**Scope.**

- Expand E2E from route-render smoke to interaction smoke for the highest-risk mechanics:
  - Shape Shift drag/drop
  - Shape Dash jump/run
  - BattleLearn question modal + answer
  - one standard answer-card game
  - one memory-card game after the peek phase
- Settle the economy model in code and copy:
  - lifetime earned stars vs. current spendable stars
  - heart recovery and heart purchase rules
  - whether free star purchase exists only in development
  - how paid hints relate to learning, not just spending
- Redesign first-session clarity for Shape Shift and Shape Dash:
  - Shape Shift: visible goal/outline affordance, clearer drag target, and a first-piece success path
  - Shape Dash: portrait strategy, canvas sizing, and gate explanation
- Review achievements and stats as one system:
  - contrast of locked achievements
  - legacy uppercase/internal game names in achievement descriptions
  - stats labels for current vs. lifetime values
- Keep the content-pack audit current:
  - pack id, skill id, locale, item count, difficulty range, generator consumer, and learning outcome
  - flag shallow packs that are only procedural specs
  - identify which packs need more real authored content before new features
  - current baseline: [docs/qa/2026-05-19-content-pack-audit.md](docs/qa/2026-05-19-content-pack-audit.md)
- Normalize the per-game UI baseline:
  - consistent task prompt placement
  - consistent success/error feedback intensity
  - no mobile overlap between header, badges, hints, and game controls

**Non-goals.**

- No backend or account work.
- No new major game mechanics.
- No real payment or entitlement gating.
- No content CMS. Pack audit may create structured metadata, but packs remain in-repo.

**Done when.**

- Manual full-game QA has a repeatable checklist and current screenshot artifacts.
- E2E catches at least one meaningful interaction per high-risk mechanic, not just first render.
- Economy copy and store fields are internally consistent.
- Shape Shift and Shape Dash have clear first-session flows on mobile.
- Every content pack has an explicit audit row and an owner decision: "enough for now", "expand", "merge", or "replace".

**Estimate.** 1–2 weeks calendar.

---

### Phase 2 — Backend, auth, sync

**Goal.** Server-backed learner profiles with cross-device sync; the `apiAdapter.ts` stub becomes real.

**Scope.**

- **Stack decision required** (see §5 — Open decisions). Default recommendation: backend in Java/Spring Boot with Postgres — matches the author's day-job expertise and gives the reference project its "real" spine. Alternative: Node/TS for single-language stack.
- Server modeling only the Learner, Curriculum (read-only from packs), and Gameplay contexts at this stage. Meta-progression stays local until Phase 3.
- Auth: magic-link email + JWT session. Token refresh on session start. No passwords; no social login in MVP. OIDC provider (Keycloak / Authentik / Zitadel) deferred unless we need SSO.
- Sync model: last-write-wins per field, server clock authoritative. Offline writes queue in `localStorageAdapter` and flush on reconnect. `persistenceService.ts` already hides this.
- Deploy: Dockerized, added to khe-homelab `services/apps/games/` stack. Postgres as a container, not shared with Nextcloud/Immich (isolation). Exposed via NPM + Cloudflare Tunnel at `study.khe.ee` (or `study-api.khe.ee` for the API specifically).
- Observability baseline: structured logs via OpenTelemetry log exporter, `/actuator/health` (or equivalent) wired into Uptime Kuma.

**Non-goals.**

- No real-time multiplayer.
- No CRDT / fancy conflict resolution. Last-write-wins is explicitly sufficient for a single-player learning game.
- No content CMS. Content packs still ship in the client bundle at this stage.

**Done when.**

- A learner profile created on one device is visible on a second device within seconds of login.
- Losing the backend (deliberately stopped) leaves the app playable offline; reconnection syncs.
- Server exposes a typed OpenAPI (or equivalent) contract versioned in the repo.
- New service in khe-homelab is monitored (Uptime Kuma + autoheal healthcheck) and backed up (`backup.sh`).

**Risks.**

- Auth infrastructure is the rabbit hole. Pick magic-link, enforce the scope, ship.
- The Postgres schema for `SkillMastery` with rolling stats can grow unbounded. Cap rolling windows; plan for archival early.

**Estimate.** 3–4 weeks calendar.

---

### Phase 3 — Collection & economy (themes)

**Goal.** Deliver the meta-progression the product vision depends on: earn stars, unlock themes, apply them to the app.

**Scope.**

- New bounded context: `src/meta/` with `Wallet`, `Inventory`, `UnlockCatalog`, `ThemeCatalog`.
- Theme application layer: a ThemeProvider that swaps CSS custom properties (color palette, background art reference, optional particle/decoration slot). Themes are data, not code.
- Asset pipeline: themes bundled as assets in `public/themes/<theme-id>/` for MVP. CDN + dynamic loading only if bundle size becomes a real problem.
- Shop UX: a gated screen where a learner spends stars on themes. Introduce rarity and cost tiers, not for monetization yet but to make collection meaningful.
- Launch with 6–8 themes: 3 "kid" aesthetics (e.g. meri, metsaloomad, kosmos), 3 "adult" aesthetics (e.g. puhas minimalism, kohvi-sooja, skandinaavia), 2 seasonal or unlock-only.
- Server-side: `Inventory` syncs via Phase 2 backend. `Wallet` is authoritative server-side to prevent trivial tampering.

**Non-goals.**

- No real payment. Themes are earned, not bought with money, until Phase 6.
- No user-generated themes.
- No theme trading or social features.

**Done when.**

- A learner can earn, spend, own, and apply themes. Inventory persists and syncs.
- Theme changes are instant and don't require a reload.
- Adding a theme is a content change (JSON + asset drop), not a code change.

**Estimate.** 2–3 weeks calendar.

---

### Phase 4 — Content CMS & curriculum alignment

**Goal.** Decouple content authorship from release cadence; align core skill packs to the Estonian national curriculum (põhikooli ainekava) for grades 1–6.

**Scope.**

- Server-side content storage — packs versioned, profiles pin a pack version, upgrade is explicit. Built-in editor UI is a stretch; JSON-schema-validated files served from the backend are sufficient to start.
- Taxonomy: map every `Skill` to one or more curriculum nodes (subject → grade → topic → subtopic). Schema documented, not invented per pack.
- Delivery: packs fetched over HTTP with caching, not bundled in the client. Offline mode keeps last-fetched pack available.
- Migration: the packs shipped in Phase 1 are the seed content for Phase 4's server-side catalog.
- New skill coverage target: at least one complete pack per mandatory primary-school subject area (matemaatika, eesti keel, loodusõpetus, inimeseõpetus) at grade 1–3 level, pilot only.

**Non-goals.**

- No external authoring tool integration (Contentful, Strapi etc.) — out of scope for a homelab reference.
- No school-facing admin (teachers, classrooms, reports) — that's a separate product.
- No AI-generated content at this stage (Phase 6+ stretch).

**Done when.**

- Releasing new content (new skill or new pack version) is a server-side change only; clients pick it up on next session start.
- At least one curriculum-aligned pack per target subject, peer-reviewed against the ainekava document.

**Estimate.** 3–4 weeks calendar.

---

### Phase 5 — Adult UX register & content

**Goal.** Activate the platform's second persona. Adult users are first-class citizens of the same codebase, not a parallel app.

**Scope.**

- Second UX register (theme + typography + motion scale), chosen by persona on profile creation. Mechanics identical; chrome different.
- Adult-targeted content packs: Eesti jõed, Eesti ajalugu (tähtsamad sündmused), grammatika (käänded, pöörded), vanasõnad, üldteadmised. Start small — two or three well-crafted packs beat ten shallow ones.
- Content selection UI for adults: no "choose a game" menu; instead "what do you want to practice today?" — entry point is the `Skill`, mechanic is the engine's call.
- Session cadence for adults: shorter, sharper, spaced-repetition-flavored — longer intervals between the same skill, smaller sessions. Implementation is a parameter of `AdaptiveEngine`, not a new engine.

**Non-goals.**

- No separate product brand. Same app, same domain.
- No corporate / tööandja features (dashboards, team leaderboards). Consumer-first.

**Done when.**

- A freshly created adult profile completes a meaningful first session in under 3 minutes, with no UI text that reads as infantilizing.
- At least three adult-targeted content packs live.

**Estimate.** 3–4 weeks calendar.

---

### Phase 6 — Production hardening & paywall reality

**Goal.** Make the project genuinely production-grade. Activate the monetization scaffolding in a form that is showcase-truthful, not performative.

**Scope.**

- **Observability.** OpenTelemetry end-to-end (frontend → backend → database), metrics exported to a local Prometheus, traces to a local Tempo/Jaeger, logs to Loki. Dashboards in the existing Grafana. If there is no existing Grafana, installing one is part of this phase.
- **Error tracking.** Self-hosted GlitchTip or similar. Route frontend + backend errors.
- **Paywall activation.** Pick one feature flag from `monetization/config.ts` to actually gate (e.g. `multiple_profiles` or `export_data`). Implement the gate end-to-end with a mock payment flow (no real Stripe charge). Document the full path in an ADR.
- **Rate limiting + abuse protection.** Per-profile session caps, per-IP request rate limiting at the reverse proxy.
- **Backup story.** Postgres logical dump nightly into the existing `backup.sh` tarball. Restore-from-backup tested at least once.
- **Performance budget.** Documented budget for first paint and time-to-playable. Monitored.
- **Public architecture page.** A public `/architecture` route on the site rendering the ADRs and a live system diagram. This is where the project stops being "a game" and starts being "a reference project with a game in front of it".

**Done when.**

- An outage of the Postgres container is caught by Uptime Kuma and announced to Telegram within minutes.
- A frontend runtime exception in production shows up in the error tracker with source maps and user context (pseudonymous).
- The paywall blocks what it says it blocks; the mock payment flow correctly toggles the feature.
- The project can be shown to an interviewer as a reference project and survive scrutiny.

**Estimate.** 3–5 weeks calendar.

---

## 5. Open decisions

These must be resolved before the phase that depends on them. Each will become an ADR.

- **Backend language & framework.** Java/Spring Boot vs. Node/TypeScript vs. Kotlin/Ktor. Decision needed before Phase 2 kickoff. Trade-off: Java matches author's expertise and enterprise-reference credibility; TS removes the context-switch tax and shares types with the frontend.
- **Auth provider.** Magic-link homegrown vs. Keycloak vs. Authentik vs. Zitadel. Decision needed before Phase 2 kickoff. Trade-off: homegrown is 500 lines and fine for MVP, but an external IdP is the more credible reference choice.
- **Content source of truth.** JSON-in-git vs. Postgres-as-CMS vs. a headless CMS (Strapi, Directus). Decision needed before Phase 4. Trade-off: JSON-in-git is version-controlled and diffable but needs a release cycle; Postgres-as-CMS decouples content from deploys.
- **Monetization realism.** Payment-less mock forever, or wire real Stripe in test mode, or real billing with a single €1 tier. Decision needed before Phase 6. Showcase truthfulness vs. operational complexity.
- **Estonian curriculum taxonomy source.** Riigi Teataja ainekava PDFs scraped, HITSA API if one exists, or a custom in-repo taxonomy file peer-reviewed against the PDF. Decision needed before Phase 4.

---

## 6. What this roadmap deliberately excludes

Named so they don't creep in quietly:

- Multiplayer / versus modes.
- Teacher / classroom / school-facing features.
- Parental dashboards as a first-class surface (a read-only "progress summary" is fine; a full parental control panel is a different product).
- Native mobile apps. PWA only.
- AI-generated educational content. The adventure-engine's `proxy/` patterns could eventually be borrowed, but only as an authoring assist, not as runtime content generation.
- Social features (leaderboards, friends, sharing).
- Cross-platform save (e.g. import from Duolingo).

---

## 7. Change log

- **2026-04-23** — Initial draft. Five bounded contexts and six phases proposed. Awaiting decision on backend stack and auth provider before Phase 2.
- **2026-04-23** — Phase 0 landed. ADR-0001 + ADR-0002 written; Prettier + typecheck tooling added; CI quality gate (`ci.yml`) wired; Playwright E2E safety net (four scenarios) shipped; `GameScreen.tsx` decomposed into container + view + modal host with three new named hooks. §2 "What is solid / debt" updated to match. Docs cleanup: deleted obsolete `GAME_UI_REDESIGN.md`, `BATTLELEARN_COMPARISON.md`, `NEXT_GAMES_STRATEGY.md`, `shape-dash-collision-analysis.md`; moved `QUICK_START_GUIDE.md` → `docs/shared-components.md`.
- **2026-04-24** — Phase 1 Slice 1 landed: curriculum context + first content-pack migration. New `src/curriculum/` with `Skill`, `ContentPack<TItem>`, `skillRegistry`, `contentPackRegistry`, `getPackItems()`. Constellations migrated from `src/games/constellations.ts` into `ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK` bound to the `astronomy.visible_constellations` skill. `star_mapper` generator + `StarMapperView` now resolve constellations via the pack registry. `GameRegistryEntry` gained optional `skillIds` + `contentPackId`; the `star_mapper` binding is the first to populate them. 12 new unit tests for the curriculum layer; all 370 unit tests + 4 E2E smoke tests + prod build green.
- **2026-04-24** — Phase 1 Slice 2 landed: syllabification migration surfaces the multi-locale pack pattern. New skill `language.syllabification` bound to two locale-scoped packs (`LANGUAGE_SYLLABIFICATION_ET_PACK`, `LANGUAGE_SYLLABIFICATION_EN_PACK`) under the same skill. Registry gained `findBySkillAndLocale(skillId, locale)` and `getPackItemsForLocale<T>(skillId, locale)` with a "any pack for the skill" fallback for new-locale rollout. `syllable_builder` generator now resolves its word list through `getPackItemsForLocale` using the current `getLocale()`. 7 new unit tests (377 total), lint + E2E + prod build green.
- **2026-04-24** — Phase 1 Slice 3 landed: math_snake migration + first "one mechanic, many skills" binding + v2 cosmic theme. `ArithmeticSpec` DSL (op + optional `unlockLevel`/`factorRange`/`valueRange` overrides) added to `src/types/game.ts`. `math_snake` engine's hard-coded level-gated `generateEquation` refactored to consume a pack spec-pool. New `GameConfig.visualTheme` field lets bindings sharing a component diverge visually.
- **2026-04-24** — Phase 1 Slice 3b landed: snake family expanded + legacy removed + critical routing bugs fixed. The "backward-compat" `math_snake` registration (and its mixed-basics pack) was removed — it was added in 3a on an assumption the user never stated. Replaced with 6 focused snake cards, one per math skill: `addition_snake` (within 20, green), `addition_big_snake` (within 100, teal), `subtraction_snake` (within 20, orange), `subtraction_big_snake` (within 100, pink), `multiplication_snake` (×1–5, cosmic indigo), `multiplication_big_snake` (×1–10, cosmic purple). Engine gained `isSnakeGameType(gameType)` helper + `sub_missing_minuend` range bounds scaled by pack `valueRange` (prev: hardcoded `Math.min(15, …)` / `Math.min(20, …)` caps prevented a "within 100" pack from producing realistic facts). Audit found TWO critical gameType-routing bugs (`useMathSnakeMovement` + `useAnswerHandler`/`answerHandler`) that hardcoded `=== 'math_snake'` — all new snake games would have been broken (no movement, wrong score routing). Fixed by switching to the suffix helper throughout. 4 new pack tests + 2 regression fixes (tests reference the suffix-match rather than literal `math_snake`). All 387 unit tests + 4 E2E + prod build green. See ARCHITECTURE.md §"Snake mechanic audit" for open v2 improvement opportunities (mastery tracking, theme-aware snake colors, session summary screen, wraparound-fairness, menu-crowding).
- **2026-04-25** — Phase 1 Slice 4: mechanic-level menu grouping. `GameConfig` gained `mechanic?: string`; new `MechanicConfig` interface + `MECHANICS` map in `data.ts` (first entry: `math_snake`). All 6 snake bindings declare `mechanic: 'math_snake'`. `MenuScreen` groups bindings sharing a mechanic into one `MechanicCard`; tapping opens `PackPickerModal` listing the bindings with per-binding level/highscore/difficulty. Reduces math category from 6 cards to 1; pattern extends to any future multi-binding mechanic. i18n strings: `mechanics.math_snake`, `menuSpecific.choosePack`, `menuSpecific.packCount_*` (et + en). Pre-stages Phase 5 adult UX ("entry point is the Skill, mechanic is the engine's call") — same binding data, different `groupBy`. 389 unit + build + lint + prettier green.
- **2026-04-25** — Phase 1 Slice 3c landed: snake medium-severity audit follow-up. Five snake mechanic improvements shipped together as one slice because they share the same code surface (engine + view + answer hook + session store): (1) **Growth model** — math apple no longer grows the snake on consumption (`moveMathSnake`); only `resolveMathSnakeAnswer` grows it (+2 correct, 0 wrong). No more "farming" length by guessing. (2) **Walls kill** — `wrapPosition` removed; out-of-bounds returns `collision: true`. (3) **Streak-based grid expansion** — every 5 correct math answers grow the grid by 1 (cap at 10×10) via `expandSnakeGrid` invoked from `useAnswerHandler`. New constants `SNAKE_MIN_GRID_SIZE`, `SNAKE_MAX_GRID_SIZE`, `SNAKE_STREAK_MILESTONE`. (4) **Theme-aware palette** — `VisualTheme.snakePalette: 'emerald' | 'teal' | 'orange' | 'pink' | 'indigo' | 'purple'` drives the head, body, tail, glow ring, `+N` text via the `SNAKE_PALETTES` token table; each of six bindings picks its family. (5) **End-of-session summary** — new `SnakeSessionSummary` component on the game-over result screen shows max length, accuracy, best streak, and top-3 hardest facts (most wrong attempts). Per-fact tracking lives in `playSessionStore.snakeSessionStats.factHistory` — mini-precursor to the Phase 1 mastery tracker. Bonus: `+N` overlay now reflects actual length delta (`+1` apple, `+2` correct answer; was hardcoded `+1`). 2 new engine tests (wall collision + `expandSnakeGrid` cap) plus an updated math-apple growth test — 389 unit + 4 E2E + prod build + lint + prettier all green.
- **2026-04-27** — Phase 1 Slice 5 landed: Shape Dash geometry moved into curriculum. New `math.geometry_shapes` skill + `MATH_GEOMETRY_SHAPES_PACK` hold checkpoint questions, shape-gate prompts, localized options, and shape labels; `shape_dash` registration now declares `skillIds` + `contentPackId`. `Generators.shape_dash` now resolves the pack via `getPackItems()` and owns only run generation, obstacle placement, shuffling, and gate placement. While adding generator tests, a gate-placement regression surfaced: the old 200px gate-distance rule exceeded normal obstacle gaps, so some deterministic runs generated zero shape gates. The gate buffer is now 110px and covered by a generator regression test.
- **2026-04-27** — Phase 1 Slice 6 landed: Shape Shift puzzle data moved into curriculum. `src/games/puzzles.ts` became `src/curriculum/packs/geometry/shapeShiftPuzzles.ts` with `SHAPE_SHIFT_PUZZLES_PACK` bound to the existing `math.geometry_shapes` skill. `shape_shift` registration now declares `skillIds` + `contentPackId`; `Generators.shape_shift` resolves puzzles via `getPackItems()` and keeps only mode selection, recent-puzzle avoidance, piece initialization, decoy generation, and shuffling. Added pack-shape, registry, and generator tests for the binding.
- **2026-04-27** — Phase 1 Slice 7 landed: Sentence Logic scenes moved into curriculum. `src/games/sentenceTranslations.ts` became `src/curriculum/packs/language/spatialSentences.ts`; `SCENE_DB`, scene-name translations, object translations, position translations, and `generateSentence()` now live with the `LANGUAGE_SPATIAL_SENTENCES_PACK` content. New `language.spatial_sentences` skill added. `sentence_logic` registration now declares `skillIds` + `contentPackId`; `Generators.sentence_logic` resolves scenes via `getPackItems()` and keeps only level filtering, random selection, option construction, and locale selection. Added pack-shape, registry, and generator tests for the binding.
- **2026-04-27** — Phase 1 Slice 8 landed: vocabulary words moved into curriculum. `ALPHABET`, the Estonian word list, and the English word list left `src/games/data.ts` for `src/curriculum/packs/language/vocabulary.ts`. New `language.vocabulary` skill binds to `LANGUAGE_VOCABULARY_{ET,EN}_PACK`; `word_builder`, `word_cascade`, `picture_pairs`, and `letter_match` registrations now declare the vocabulary skill. Generators resolve locale-specific vocabulary via `getPackItemsForLocale()` and group words by length in pack helper code. Added pack-shape, registry, and generator coverage for the migration.
- **2026-04-27** — Phase 1 Slice 9 landed: Shape Shift grid math moved to the engine layer. `src/games/shapeShiftGrid.ts` became `src/engine/shapeShiftGrid.ts`; `ShapeShiftView` and `useShapeShiftGame` now import snap/layout helpers from the engine context. This keeps `games/` focused on registry/generator/validator wiring and makes the coordinate model explicitly pure engine logic. Added direct engine tests for snapping, percent conversion, center-distance ordering, and bounds checks.
- **2026-04-27** — Phase 1 Slice 10 landed: Pattern Train themes and repeat-rule templates moved into curriculum. New `math.pattern_sequences` skill + `MATH_PATTERN_SEQUENCES_PACK` hold the symbol themes and `repeat_*` templates. `pattern` registration now declares `skillIds` + `contentPackId`; `Generators.pattern` resolves the pack via `getPackItems()` and owns only theme/template selection, sequence length scaling, and answer-option shuffling. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 11 landed: Unit Conversion definitions moved into curriculum. New `math.unit_conversions` skill + `MATH_UNIT_CONVERSIONS_PACK` hold measurement categories, unit pairs, and factors. `unit_conversion` registration now declares `skillIds` + `contentPackId`; `Generators.unit_conversion` resolves conversion data via `getPackItems()` and keeps only profile/level ranges plus distractor generation. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 12 landed: Compare Sizes stage specs moved into curriculum. New `math.compare_numbers` skill + `MATH_COMPARE_NUMBERS_PACK` hold level ranges, max values, equality odds, display mode, and allowed comparison symbols. `compare_sizes` registration now declares `skillIds` + `contentPackId`; `Generators.compare_sizes` resolves the active stage via `getPackItems()` and keeps only value generation plus display realization. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 13 landed: Time Match stage specs moved into curriculum. New `math.time_reading` skill + `MATH_TIME_READING_PACK` hold level ranges, minute precision, and option counts. `time_match` registration now declares `skillIds` + `contentPackId`; `Generators.time_match` resolves the active stage via `getPackItems()` and keeps only clock sampling plus distractor labels. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 14 landed: Balance Scale progression specs moved into curriculum. New `math.balance_equations` skill + `MATH_BALANCE_EQUATIONS_PACK` hold sum-range growth, profile boost, minimum visible weights, option counts, and distractor offsets. `balance_scale` registration now declares `skillIds` + `contentPackId`; `Generators.balance_scale` resolves progression via `getPackItems()` and keeps only equation construction plus answer-option generation. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 15 landed: Memory Math progression specs moved into curriculum. New `math.addition_memory` skill + `MATH_ADDITION_MEMORY_PACK` hold starter/advanced card-count growth and answer-sum limits. `memory_math` registration now declares `skillIds` + `contentPackId`; `Generators.memory_math` resolves progression via `getPackItems()` and keeps only addition-pair construction plus card shuffling. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 16 landed: Robo Path grid/obstacle progression specs moved into curriculum. New `math.grid_navigation` skill + `MATH_GRID_NAVIGATION_PACK` hold starter/advanced grid sizing, obstacle-count stages, and generation caps. `robo_path` registration now declares `skillIds` + `contentPackId`; `Generators.robo_path` resolves progression via `getPackItems()` and keeps pathfinding, obstacle placement, and command limits. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 17 landed: BattleLearn board/question progression specs moved into curriculum. New `math.mixed_problem_solving` skill + `MATH_BATTLELEARN_PACK` hold profile grid/ship stages, non-ship cell weights, initial/follow-up question stage pools, count-object labels, and sequence patterns. `battlelearn` registration now declares `skillIds` + `contentPackId`; `Generators.battlelearn` and `generateBattleLearnQuestion()` resolve progression via `getPackItems()` while keeping ship placement, concrete question construction, answer-option generation, and board state in the mechanic. Added pack-shape, registry, and generator coverage for the binding.
- **2026-04-27** — Phase 1 Slice 18 landed: Learner progress moved onto the ADR-0002 shape. New `src/learner/` defines `LearnerProfile`, `SkillMastery`, and the legacy game→skill migration map. `gameStore` now persists `activeLearnerProfile`, migrates the active legacy profile's `levels[profile][game]` into `skillMastery[skillId].level`, and dual-writes level changes through the learner profile. The menu no longer renders the starter/advanced profile selector; cards, pack picker rows, gameplay level progress, and level selection read levels through `getLevelForGame()`. The visible menu UI was simplified around one learner-progress surface, with neutral cards, icon controls, and no hidden 7+ default for fresh users. Legacy `profile` remains only as a temporary generator compatibility input.
- **2026-04-27** — Phase 1 Slice 19 landed: Whole-game QA smoke added. New Playwright coverage iterates every `GAME_CONFIG` id, opens the corresponding `/study/games/:slug` route, verifies game chrome and loaded state, and fails on `console.error` or uncaught page exceptions. This raises the safety net from a single representative game to all current game bindings.
- **2026-04-27** — Phase 1.5 inserted from manual full-game browser QA. The in-app browser pass covered menu surfaces plus all 23 game routes with one real interaction per game. Immediate QA fixes shipped in `c0f834f`: Shape Dash locale text, Shape Shift drag anchoring/window pointer release, Shop/Level close aria labels, and a Shape Shift drag regression test. Roadmap updated with the conclusion that product QA, economy semantics, high-risk interaction E2E, and content-pack audit should precede Phase 2 backend/auth/sync work.
- **2026-04-27** — Phase 1.5 Slice 1 landed: focused interaction E2E added for high-risk mechanics. Coverage now exercises Shape Shift drag/drop, Shape Dash jump input, BattleLearn modal-answer flow, Letter Match answer recording, and Picture Pairs post-peek card taps. Stable QA hooks were added only where role/text selectors were not enough; BattleLearn's hidden cell-type hook is dev-only.
- **2026-04-27** — Phase 1.5 Slice 2 landed: economy semantics settled. `gameStore.stars` is the spendable star balance; `stats.collectedStars` is lifetime earned stars for statistics and achievements. Spending stars on hints/hearts no longer lowers lifetime earned stars, and temporary free star top-up stays in the shop until real purchases exist without counting as earned-star progress.
- **2026-04-27** — Phase 1.5 Slice 3 landed: Shape Shift first-pass QA fixes. The board now shows puzzle names and target shadows by default; the shape model supports rectangular footprints; authored targets are bounds-tested; same-shape pieces such as sun rays can snap and validate interchangeably; generated content-pack item ids are stored in `gameStore.playedContentByPack` and passed back to generators to reduce repeats. The weakest existing puzzles were curated in-place: butterfly and sword were redrawn, and fish/cat/rocket/robot gained the missing details that make them readable. Broader content-quality expansion remains open under the content-pack audit.
- **2026-04-28** — Phase 1.5 Slice 4 landed: content-pack audit baseline added in `docs/qa/2026-04-28-content-pack-audit.md`, backed by `buildCurriculumAuditReport()` in `src/diagnostics/curriculumAudit.ts`. Baseline state: 19 skills, 22 packs, 23 game bindings, no unbound packs/skills, and 9 shallow packs below the audit minimum of 6 items.
- **2026-04-28** — Phase 1.5 Slice 5 landed: `math.balance_equations.core` expanded from one global progression config to 6 explicit level stages with sum ranges, advanced-profile boosts, option counts, and staged distractor offsets. `Generators.balance_scale` now resolves the stage by level. Audit state after the slice: 8 shallow packs below the minimum; next recommended slice is `math.time_reading.core`.
- **2026-04-28** — Phase 1.5 Slice 6 landed: `math.time_reading.core` expanded from 5 precision-only stages to 8 learning-outcome stages covering full hours, half hours, quarter hours, 10-minute precision, 5-minute precision, near-hour before/after practice, 24h digital matching, and mixed review. `Generators.time_match` now uses stage-specific allowed minute pools and distractor offsets. Audit state after the slice: 7 shallow packs below the minimum; next recommended slice is `math.addition_memory.core`.
- **2026-04-28** — Phase 1.5 Slice 7 landed: `math.addition_memory.core` expanded from two profile-level growth configs to 8 explicit profile + level stages with learning outcomes, card counts, answer-sum ranges, and minimum addends. `Generators.memory_math` now resolves the stage by profile + level and only constructs unique equation/answer pairs. Audit state after the slice: 6 shallow packs below the minimum; next recommended slice is arithmetic snake spec-coverage audit semantics.
- **2026-04-28** — Phase 1.5 Slice 8 landed: content-pack audit now treats arithmetic snake packs as DSL spec pools instead of authored item banks. Addition, subtraction, and multiplication snake packs emit `arithmetic-spec=covered` only when required operation variants and value/factor ranges are present; covered spec pools no longer receive `shallow_item_count<6`. Audit state after the slice: 6 raw packs remain below 6 items, but 0 packs carry a shallow warning; next recommended slice is staged difficulty metadata for `math.unit_conversions.core`.
- **2026-04-28** — Phase 1.5 Slice 9 landed: `math.unit_conversions.core` now separates measurement conversion definitions from starter/advanced stage metadata. The pack exposes 7 `conversion` items and 7 `stage` items with learning outcomes, level ranges, value ranges, option counts, and allowed conversion ids. `Generators.unit_conversion` resolves the active stage from curriculum data and only handles conversion sampling plus distractor generation. Audit state after the slice: 6 raw packs remain below 6 items, 0 packs carry a shallow warning, and the remaining explicit-metadata work is concentrated in language packs; next recommended slice is `language.spatial_sentences.scene_pack`.
- **2026-04-28** — Phase 1.5 Slice 10 landed: `language.spatial_sentences.scene_pack` now carries scene-level difficulty, minimum level, focus, and localized learning outcomes. `Generators.sentence_logic` resolves its scene pool through `getSpatialSentenceScenesForLevel()` instead of hardcoded position-count filters, preserving the previous level gates while making them auditable. Audit state after the slice: 6 raw packs remain below 6 items, 0 packs carry a shallow warning, and remaining explicit-metadata work is in `language.syllabification.*` and `language.vocabulary.*`; next recommended slice is syllabification difficulty metadata.
- **2026-04-28** — Phase 1.5 Slice 11 landed: `language.syllabification.et` and `language.syllabification.en` now annotate every word with difficulty, minimum level, focus, and localized learning outcomes based on syllable count. Shared helpers in `language/types.ts` expose `withSyllableWordMetadata()` and `getSyllableWordsForLevel()`, and `Generators.syllable_builder` now resolves its word pool through that metadata instead of local syllable-count branching. Audit state after the slice: 6 raw packs remain below 6 items, 0 packs carry a shallow warning, and the remaining explicit-metadata work is isolated to `language.vocabulary.*`.
- **2026-04-28** — Phase 1.5 Slice 12 landed: `language.vocabulary.et` and `language.vocabulary.en` now annotate every word with difficulty, minimum level, focus, and localized learning outcomes based on word length. Shared helpers in `vocabulary.ts` expose metadata-aware level selection for exact lengths, level progression, and available level pools; `word_builder`, `word_cascade`, `picture_pairs`, and `letter_match` now consume those helpers. Audit state after the slice: 6 raw DSL-spec packs remain below 6 items, 0 packs carry a shallow warning, and all content packs now have explicit metadata or spec-coverage signals. Next recommended slice is Estonian vocabulary copy sanity and duplicate checks.
- **2026-04-28** — Phase 1.5 Slice 13 landed: first vocabulary copy-sanity pass removed duplicate word entries from `language.vocabulary.et` and `language.vocabulary.en` (`PIRN`, `SNOW`, `WATER`) and added pack coverage that requires vocabulary entries to be unique, uppercase, and visually anchored. Audit state after the slice: vocabulary counts are now ET 222 / EN 90, all packs remain bound and warning-free; next recommended slice is Estonian vocabulary age/length review for long or ambiguous words.
- **2026-04-28** — Phase 1.5 Slice 14 landed: `language.vocabulary.et` copy review pass reduced the Estonian pack from 222 to 207 items by removing 9-10 letter words and weak visual anchors (`LOODUS`, `ÕIS`, `KORK`, `TÕRU`, duplicate-emoji cases), while replacing several entries with clearer age-fit matches (`PLOOM` -> `VIRSIK`, `PIPAR` -> `PAPRIKA`, `TELEVIISOR` -> `TELER`, `JOOKSMINE` -> `JOOKS`, `NUGA` -> `KAHVEL`). The pack now has regression coverage for max 8-letter ET words, Estonian uppercase letters, no duplicate emoji anchors, and no reviewed-out words. Next recommended slice is the same copy/emoji audit for `language.vocabulary.en`.
- **2026-04-28** — Phase 1.5 Slice 15 landed: `language.vocabulary.en` copy review pass kept the English pack at 90 items while removing the duplicate `PLANT`/`SPRING` sprout anchor and replacing weak visual anchors (`PIGEON`, `GARDEN`, `SPRING`) with clearer age-fit entries (`PARROT`, `TOMATO`, `ROCKET`). `PLANT` and `CLOCK` now use more direct emoji anchors, and EN vocabulary has regression coverage for max 7-letter words, English uppercase letters, no duplicate emoji anchors, and no reviewed-out words. Next recommended slice is vocabulary-game UI smoke for both locales.
- **2026-04-28** — Phase 1.5 Slice 16 landed: vocabulary-game UI smoke added in `e2e/vocabulary-games.spec.ts`. The test opens `word_builder`, `word_cascade`, `picture_pairs`, and `letter_match` in both `et` and `en`, seeds the learner store/locale, verifies locale chrome and vocabulary render targets, and drives reveal/answer flows through paid-hint or answer controls so the copy-reviewed word packs are covered in real game views. Stable test hooks were added to paid hints and word-game emoji surfaces. Next recommended slice is either Shape Shift authored puzzle expansion or surfacing pack difficulty/focus metadata in the learner UI.
- **2026-04-28** — Phase 1.5 Slice 17 landed: Shape Shift authored puzzle pack expanded from 15 to 20 items with five new readable assemblies: `balloon`, `mushroom`, `car_compact`, `bird_simple`, and `castle`. Difficulty coverage is now easy 7 / medium 8 / hard 5. Pack tests now enforce localized names, unique piece ids per puzzle, known shape types, positive dimensions, minimum tier breadth, and board-bounds safety for every target piece. Next recommended slice is surfacing pack difficulty/focus metadata in learner UI or adding the same UI-smoke pattern to another content-heavy game.
- **2026-04-28** — Phase 1.5 Slice 18 landed: curriculum pack metadata is now visible in the learner menu. New `getGameCurriculumSummary()` resolves each game binding to its direct content pack or locale-specific skill pack, then formats pack title, item count, difficulty tiers, and focus count for the active locale. `GameCard` and `PackPickerModal` render the same compact summary, with full focus learning-outcome labels included in title/aria text. Added focused tests for direct pack bindings, locale-specific vocabulary packs, small DSL-spec packs, and unknown games. Next recommended slice is either a metadata-backed progress/mastery detail view or another content-heavy UI smoke.
- **2026-04-28** — Phase 1.5 Slice 19 landed: curriculum pack metadata is now visible in progress/statistics surfaces too. `StatsModal` highest-level and high-score rows, plus `GameTypeStats` most-played rows, render the same `getGameCurriculumSummary()` label used by menu cards, so a learner can see which content pack and difficulty range a progress number belongs to. Added a React test that renders the stats modal and asserts the Shape Shift pack metadata appears in progress rows. Next recommended slice is using pack difficulty/focus for adaptive practice selection, or adding a UI smoke for the next content-heavy game.
- **2026-04-28** — Phase 1.5 Slice 20 landed: removed dead progress UI components that were no longer rendered anywhere. `LearningProgress.tsx` and `GameProgression.tsx` only referenced their own exports (`LearningProgress`, `SkillBreakdown`, `GameProgressionCard`, `LevelProgressIndicator`) and were not connected to menu, gameplay, stats, or barrel exports. The active learner progress surface remains `StatsModal`/`StatsDashboard`, which now carries pack metadata. This keeps the codebase honest: no zombie UI implying a second progress model exists.
- **2026-04-28** — Phase 1.5 Slice 21 landed: removed the dead support code left behind by the progress UI cleanup. `getProgressionRecommendation()`, `calculateGameSuccessScore()`, the old `calculateOptimalDifficulty()` / `getNextLevelDifficulty()` helpers, and their now-unused i18n/type shapes were removed. `src/engine/progression.ts` now only owns active level-up and star-reward rules; adaptive difficulty remains in `src/engine/adaptiveDifficulty.ts`.
- **2026-05-12** — Phase 1 Slice 22 landed: `fact_drill` mechanic — Fact Sprint. Second proof that "one mechanic, many skills" generalizes beyond `math_snake`. Eight bindings under one `FAKTISPRINT` menu card cover the four basic operations: multiplication 1–5/1–10, addition within 20/100, subtraction within 20/100, division 1–5/1–10. All reuse existing arithmetic skill packs except for the new `math.division_facts_1_to_{5,10}` skills + matching packs (the `EquationOp` DSL gained `div_result` / `div_missing`; `math_snake` engine carries the inverse branches too, so a future snake-division binding is data-only). The mechanic adds a `GameConfig.sessionMode: 'continuous'` flag — `useAnswerHandler` honors per-answer score/streak/highscore but skips mid-session level-up and auto problem generation, and `GameScreen` hides the level-progress HUD for continuous bindings. `FactDrillView` owns the session loop (rAF timer with wall-clock delta, lazy-init RNG, `useState`-based session per `react-hooks/purity`), numpad + keyboard input, educational wrong-answer feedback ("Õige vastus oli N"), and a replay-or-exit overlay at time-up. Engine module `src/engine/factDrill.ts` is pure: `buildFactPool`, `pickNextFact`, `factPairKey`, `makeFact(a, b, opSymbol, factorRange, rng, compute, allowSwap)` — `allowSwap` keeps non-commutative ops (−, ÷) in caller order so subtraction stays non-negative and division stays exact-integer. 20 new engine tests; `curriculumAudit` extended to treat `math.division_*` like multiplication (factorRange + matching ops). 516 unit + lint + format + prod build green.
- **2026-05-19** — Phase 3.5 landed: `ProfileType` cleanup. The legacy `'starter' | 'advanced'` profile type and its `PROFILES`, `allowedProfiles`, and generator `profile` parameter all removed from production code. Pack definitions that used profile-keyed stage maps were rewritten as flat level-keyed stage lists. v5→v6 migration drops `levels[profile][game]` after the v4→v5 SkillMastery seed has already extracted the data; the migration retains the active learner's progress and ignores the dormant profile. Every game generator now receives only `level`, `rng`, `context` (with `context.skillChallenge?.factsKnown` for closed-set spaced repetition; no more `profile` parameter).
- **2026-05-19** — Phase 5 landed across six slices: mechanic-preset axis split from skill challenge. `LearnerProfile` gained `mechanicPreference: Record<string, MechanicPreference>` (per-mechanic `{ difficulty, variant?, lastUpdatedAt }`). New `getMechanicIdForGame(gameType)` reads `GAME_CONFIG[gameType]?.mechanic ?? gameType`. v6→v7 migration seeds `mechanicPreference` from existing `skillMastery[skillId].level`, grouped by mechanic, max wins ties. **5a** added the field + migration. **5b** dual-wrote: `recordLevelUp` and `setLevel` updated mechanicPreference alongside skill mastery. **5c** introduced `WEAKEST_FACT_PROBABILITY = 0.7` and `pickWeakestFact(pool, factsKnown, rng)` (70% weakest / 30% retention) used by Fact Drill and Math Snake when `isClosedSetSkill(skillId)` is true. **5d** routed `picture_pairs` variant through `mechanicPreference` with `ageHint < 5 ? 'emoji_only' : 'emoji_word'` default; Settings menu now shows the variant toggle only inside the Picture Pairs game, gated by `mechanicId === 'picture_pairs'`. **5e** extended `GeneratorContext` with `skillChallenge?: { factsKnown? }` (Option B — no signature break) and threaded it through `useGameEngine` to generators. **5f** flipped `getLevelForGame` to read only `mechanicPreference` (default 1); `recordLevelUp` and `setLevel` write only the mechanic axis. Skill mastery now owns only `factsKnown` rolling stats. 549 unit + lint + lint:dead + format + prod build green.
- **2026-05-19** — Phase 6 minimal landed: multi-learner on one device. `gameStore` gained `learners: LearnerProfile[]` + `activeLearnerId: string`; `activeLearnerProfile` is preserved as a derived mirror. New `addLearner({ displayName, persona?, ageHint? })`, `removeLearner(id)`, `setActiveLearner(id)` actions. `commitActiveLearner(state, next)` keeps `learners[]` and `activeLearnerProfile` in sync from every mutator (`recordMechanicLevelUp`, `setMechanicVariant`, `setLevel`, `recordFactAttempt`). v7→v8 migration wraps the existing single learner in `learners: [it]` and sets `activeLearnerId = it.id`. Settings menu now has a learner switcher (toggle showing active name, expandable list with active highlight, X button per learner when count > 1, "Add a new learner" entry using browser `prompt()`). i18n keys added to ET + EN. 7 new store tests cover switching, add/remove, per-learner isolation of `mechanicPreference` and `skillMastery`, fallback active on removal, last-learner protection. Device-level state (inventory, achievements, stars, streaks, daily challenge, unlocks, stats) stays shared across learners — per-learner split is deferred until product calls for it. Removed dead `getDifficultyForGame` helper from `src/engine/adaptiveDifficulty.ts` + 5 stale tests as part of the cleanup pass. 549 unit + lint + lint:dead + format + prod build + browser smoke (add → switch → remove) green.
- **2026-05-19** — Phase 1.5 closed. Honest re-audit showed three "Done when" gaps were still open after Slice 21 (repeatable QA checklist, audit owner-decisions, content depth). Closure pass: (1) Content-pack audit refreshed in [docs/qa/2026-05-19-content-pack-audit.md](docs/qa/2026-05-19-content-pack-audit.md) — 23 skills, 28 packs, 34 game bindings, every pack carries an explicit owner-decision (OK / DSL-spec OK / OK; copy-reviewed / OK; expand-recommended); (2) `language.spatial_sentences.scene_pack` expanded 8 → 20 scenes (talu, mängumaa, veealune, aed, vannituba, spordiväljak, talv, kohvik, garderoob, rongijaam, kelder, muusikatuba) with hand-authored Estonian case forms (adessiiv / inessiiv / genitiiv) for every new anchor; (3) `math.geometry_shapes.shape_shift_puzzles` expanded 20 → 25 (flower, ice_cream, kite, snowman, lighthouse), audit owner-decision "OK; expand-recommended" for the ~30 sihtmaht; (4) `language.vocabulary.et` trimmed 207 → 200 by removing 7 duplicate-plural / 9-letter / niche entries (RAAMATUD, TÄHED, LUMESADU, ŠOKOLAAD, MUUSIK, STOPPER, KAARDID); (5) Repeatable full-game QA smoke prompt added at [docs/qa/full-game-qa-smoke-prompt.md](docs/qa/full-game-qa-smoke-prompt.md), drop-in for any Playwright-MCP session. 549 unit + lint + lint:dead + format:check + prod build green. Phase 2 (backend, auth, sync) is now the next phase to start.
- **2026-05-20** — Phase 1.6 inserted + prototype landed. New phase added (§4 Phase 1.6) to deliver the ADR-0001 implied "per-mechanic folder" target; Phase 1's "data-only" was true only for adding a binding to an _existing_ mechanic, not for a new mechanic from scratch (which today still touches 6 central files). Prototype migration: `balance_scale` moved to `src/games/balanceScale/` with colocated `config.ts`, `generator.ts`, `validator.ts`, `View.tsx`, and `register.ts` (side-effect registration). Shared theme palette extracted to `src/games/themes.ts` to break the `data.ts ⇄ <mechanic>/config.ts` cycle. Central files now thin composers: `data.ts` imports `BALANCE_SCALE_CONFIG`, `generators.ts` imports `generateBalanceScale`, `registrations.ts` does one `import './balanceScale/register';`. New mechanic now adds 3 central-file lines (one import per central file) + a folder, down from 6 central-file blocks + 2 new files. 573 unit + lint + lint:dead + format:check + prod build green. 18 remaining mechanics tracked in §4 Phase 1.6 subtask list.
