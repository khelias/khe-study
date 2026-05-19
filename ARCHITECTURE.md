# Architecture Documentation

## Overview

**Smart Games** is an educational web platform built as an extensible, testable reference codebase with a real product on top. This document describes the **current** code structure. The **target** structure — five bounded contexts, persona-agnostic learner profile, backend-backed sync — is captured in [`docs/adr/`](docs/adr/README.md) and the phased plan in [`ROADMAP.md`](ROADMAP.md). Parts of this document describe code that will be restructured as Phase 1 lands; where that is the case the section notes it and points at the ADR.

## Technology Stack

### Core

- **React** 19.2 — UI.
- **TypeScript** 5.9 — strict mode, `noUncheckedIndexedAccess`, no implicit `any`.
- **Vite** 7.2 — build + dev server.
- **Zustand** 4.5 — state.
- **Tailwind CSS** 3.4 — styling.
- **React Router** 7 — client routing.

### Testing & quality

- **Vitest** 1.6 with **Happy DOM** 20, **React Testing Library** 16.
- **Playwright** 1.59 — E2E.
- **ESLint** 9 with typescript-eslint 8 and `eslint-config-prettier`.
- **Knip** 6 — unused file/dependency detection; intentionally inactive scaffolding is allowlisted in `knip.jsonc`.
- **Prettier** 3 — formatting; checked in CI.

## Project structure

Directory-level map; file-level details live in the code, not here.

```
src/
├── components/          # UI components
│   ├── gameViews/       # One view component per registered game (see registrations.ts)
│   ├── shared/          # Cross-game UI primitives (GameProblemModal, GameStatsBar, etc.)
│   └── *.tsx            # Top-level: GameHeader, SettingsMenu, GameCard, NotificationSystem, …
├── engine/              # Pure game logic (deterministic, UI-independent, 76% covered)
├── features/            # Screen-level composition
│   ├── gameplay/        # GameScreen (container) + GameScreenView + GameScreenModalHost + game-screen children
│   ├── menu/            # MenuScreen
│   └── modals/          # Stats / Achievements / Shop / LevelSelector modals
├── curriculum/          # Skills + ContentPacks (what is learned + its data)
├── games/               # Game registry + data + generators + validators
├── hooks/               # Reusable React hooks (useGameEngine, useAnswerHandler, …)
├── i18n/                # Type-safe translations (see src/i18n/README.md)
├── monetization/        # Feature-flag + tier scaffolding (inert; see src/monetization/README.md)
├── services/persistence # Adapter boundary for future backend sync
├── stores/              # Zustand: gameStore (persistent) + playSessionStore (session)
├── types/               # Shared type definitions
├── utils/               # Cross-cutting helpers
├── test/                # Vitest setup + utilities
├── App.tsx
└── main.tsx

docs/
├── adr/                 # Architecture Decision Records (authoritative)
├── shared-components.md # Cookbook for GameProblemModal + GameStatsBar
e2e/                     # Playwright specs
.github/workflows/       # ci.yml (quality gate) + deploy.yml (self-hosted runner → homelab)
```

## Architecture principles

1. **Separation of concerns.** Presentation (`components/`, `features/`), business logic (`engine/`), state (`stores/`), data/config (`games/data.ts`), persistence boundary (`services/persistence/`). The engine layer has no React or browser dependencies.
2. **Feature-first composition.** Whole-screen flows live in `features/<feature>/`, each owning its own components, screens, and modals.
3. **Container / view split.** Stateful containers read stores and own handlers; view components take props. The gameplay screen is the canonical example — see [Gameplay screen composition](#gameplay-screen-composition).
4. **Type safety end-to-end.** Strict TypeScript, exhaustive unions, no `any`. Exhaustiveness is enforced at generator and validator boundaries.
5. **Testability as a first-class property.** The engine is unit-tested without DOM; components are tested with RTL; user journeys are covered by Playwright.
6. **i18n and monetization as orthogonal layers.** All user-facing strings route through `useTranslation`. Monetization primitives exist but are inert — they activate in ROADMAP Phase 6.

See [ADR-0001](docs/adr/0001-bounded-contexts.md) for the target bounded-context decomposition that these principles converge toward.

## State management

Two Zustand stores with well-defined responsibilities.

### `gameStore` (persistent, `localStorage`)

Owns cross-session state organized along ADR-0002's `LearnerProfile` aggregate plus device-level shared state:

- **Per-learner**: `learners: LearnerProfile[]` + `activeLearnerId`. Each learner carries `skillMastery[skillId]` (rolling stats + `factsKnown` for closed-set skills), `mechanicPreference[mechanicId]` (difficulty + variant), `ageHint?`, `persona`. `activeLearnerProfile` is a derived mirror kept in sync by `commitActiveLearner` from every mutator.
- **Device-level (shared across learners today)**: `stars`, `hearts` (capped at 5), `score`, `stats`, unlocked achievement IDs, sound preferences, inventory, daily challenge, favourites.

Actions: `spendStars`, `spendHeart`, `updateStats`, `updateHighScore`, `setLevel`, `recordLevelUp`, `setMechanicVariant`, `addScore`, `toggleSound`, `addLearner`, `removeLearner`, `setActiveLearner`. Zustand `persist` middleware serializes to `localStorage` under key `smart_adv_v45_pro` at version 8.

### `playSessionStore` (in-memory, per play)

Owns session state: current `gameType`, `problem`, `score`, `levelProgress`, `bgClass`, confetti/particle flags, `adaptiveDifficulty` snapshot, notifications queue, `gameStartTime`. Actions: `setProblem`, `addScore`, `addNotification` / `removeNotification`, `endGame`, `returnToMenu`, `resetLevelProgress`, `updateAdaptiveDifficulty`. Discarded on menu return.

The split is load-bearing: persistent data survives reloads but is free of transient UI noise; session data disappears automatically when the play ends. `getLevelForGame(gameType)` reads `activeLearnerProfile.mechanicPreference[getMechanicIdForGame(gameType)]?.difficulty ?? 1`; skill mastery owns `factsKnown` for the spaced-repetition picker, not the level.

### Flow

```
User input → component handler → store action → store update
                                              → subscribed component re-render
                                              → effect (e.g. persistence, notification)
```

## Game engine

Pure, deterministic modules in `src/engine/`. All are UI-independent, ~76% test coverage.

| Module                  | Responsibility                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `rng.ts`                | Seeded deterministic RNG, `createRng(seed)`.                                       |
| `adaptiveDifficulty.ts` | `(recentAccuracy, streaks) → effectiveLevel` adjustment.                           |
| `progression.ts`        | Level-up requirement curve (5→7→10→12→15+), star rewards, level-up predicate.      |
| `achievements.ts`       | Static `ACHIEVEMENTS` table + unlock condition checks.                             |
| `stats.ts`              | Stats aggregation (answers, streaks, play time, highest levels, max snake length). |
| `answerHandler.ts`      | Pure answer-processing logic; used by `useAnswerHandler`.                          |
| `mathSnake.ts`          | Snake movement, collision, apple spawning, math-challenge resolution.              |
| `shapeShiftGrid.ts`     | Shape Shift grid coordinate conversion, snap math, draw ordering, bounds checks.   |
| `shapeDash.ts`          | Shape-Dash physics primitives (AABB, obstacle bounds, checkpoint detection).       |
| `audio.ts`              | Sound effects API; respects `soundEnabled` from store.                             |
| `errorBoundary.tsx`     | React error boundary used in root composition.                                     |

## Custom hooks

Top-level hooks in `src/hooks/`. All are idiomatic React hooks — they either encapsulate effect orchestration or derive data from stores.

- **`useGameEngine`** — owns the active-problem-key deduplication history; exposes `generateUniqueProblemForGame`, `validateAnswer`, `getRng`.
- **`useAnswerHandler`** — answer → score/stats/achievement pipeline; coordinates engine + both stores.
- **`useGameAudio`** — gated sound playback driven by `soundEnabled`.
- **`useGameTips`** — tip/hint surfacing based on game state.
- **`useMathSnakeMovement`** — returns the directional-input handler for Math Snake games (extracted from `GameScreen`; returns `undefined` for non-snake games).
- **`useGameScreenEffects`** — bundles six gameplay-screen lifecycle effects (settings-click-outside, compact-layout query, initial problem generation, level-progress reset, auto-open game description, escape-to-close).
- **`useUnlockedAchievementCopies`** — reads unlocked-achievement IDs and enriches them with i18n copy; returns both raw IDs and enriched `AchievementUnlock[]`.
- **`useWrongStrikes`** — consecutive-wrong tracking used by games with crash-on-N-wrong mechanics.
- **`useProfileText`** — formats copy through `LearnerProfile` (persona, ageHint). Name predates the profile/learner rename; kept as-is to avoid touching every call site.

## Game data and registry

The registry pattern makes game additions data-driven: no switch statements outside `src/games/`.

- **`games/data.ts`** — `GAME_CONFIG` (per-game UI metadata, difficulty, category, `levelUpStrategy`, optional `mechanic`, optional `sessionMode`, optional `visualTheme`), `MECHANICS` map (mechanic-level menu metadata), `CATEGORIES`, and `getMechanicIdForGame(gameType)` helper.
- **`games/generators.ts`** — one generator function per game type; produces the next `Problem` given `(level, rng, context)` where `context: GeneratorContext` carries `avoidContentIds`, `contentPackId`, `variant`, `ageHint`, and optional `skillChallenge.factsKnown` for closed-set spaced repetition.
- **`games/validators.ts`** — one validator per game type; pure `(problem, userAnswer) → boolean`.
- **`games/registry.ts`** — centralized registry; games register themselves as `{ id, component, generator, config, validator, skillIds?, contentPackId? }`. `skillIds` + `contentPackId` are present on curriculum-migrated bindings.
- **`games/registrations.ts`** — imports everything and calls `gameRegistry.register(...)` for all ~24 bindings. Module side effect on import. Imports `src/curriculum/` first so pack lookups resolve deterministically.

Several inline generator branches still live alongside `generators.ts` — this is the **Skill × Mechanic × Content welding** called out as debt in ROADMAP §2. Fifteen content migrations have landed: constellations → `ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK` (Slice 1), syllables → `LANGUAGE_SYLLABIFICATION_{ET,EN}_PACK` (Slice 2), the snake family's arithmetic specs → six focused math packs (Slice 3), Shape Dash's checkpoint/gate question bank → `MATH_GEOMETRY_SHAPES_PACK` (Slice 5), Shape Shift's puzzle database → `SHAPE_SHIFT_PUZZLES_PACK` (Slice 6), Sentence Logic's scene/sentence data → `LANGUAGE_SPATIAL_SENTENCES_PACK` (Slice 7), vocabulary words → `LANGUAGE_VOCABULARY_{ET,EN}_PACK` (Slice 8), Pattern Train's themes/templates → `MATH_PATTERN_SEQUENCES_PACK` (Slice 10), unit conversion definitions → `MATH_UNIT_CONVERSIONS_PACK` (Slice 11), Compare Sizes' level-stage specs → `MATH_COMPARE_NUMBERS_PACK` (Slice 12), Time Match's minute-precision stages → `MATH_TIME_READING_PACK` (Slice 13), Balance Scale's progression specs → `MATH_BALANCE_EQUATIONS_PACK` (Slice 14), Memory Math's card/sum progression → `MATH_ADDITION_MEMORY_PACK` (Slice 15), Robo Path's grid/obstacle progression → `MATH_GRID_NAVIGATION_PACK` (Slice 16), and BattleLearn's board/question progression → `MATH_BATTLELEARN_PACK` (Slice 17). Shape Shift's grid coordinate helpers moved out of `games/` into `engine/shapeShiftGrid.ts` in Slice 9. Three shapes of pack consumption now exist:

- **Static single-pack**: binding sets `contentPackId`; generator calls `getPackItems(id)`. Used by `star_mapper`, `shape_dash`, `shape_shift`, and `sentence_logic`.
- **Multi-locale skill**: binding sets only `skillIds`; generator calls `getPackItemsForLocale(skillId, locale)`. Used by `syllable_builder` and the vocabulary-backed word games.
- **Procedural DSL pack**: pack items are spec-recipes, not static instances. The engine owns range-scaling logic; specs carry op kind + optional per-spec overrides. Used by the six snake bindings. Multiple bindings point to different packs → appear under one mechanic card in the menu using the same underlying component.

## Curriculum (skills + content packs)

`src/curriculum/` owns the Curriculum bounded context from ADR-0001. Mechanics consume packs via bindings; they do not import content files directly.

- **`curriculum/types.ts`** — `Skill`, `ContentPack<TItem>`, `LocaleCode`, `SkillId`, `ContentPackId`. JSON-serializable by design so packs can later move to a content CMS (ROADMAP Phase 4).
- **`curriculum/registry.ts`** — `skillRegistry` + `contentPackRegistry` singletons. `getPackItems<T>(id)` resolves a pack by id; `getPackItemsForLocale<T>(skillId, locale)` resolves the right pack when a skill has one pack per locale (falls back to any pack of the skill if the locale match is missing).
- **`curriculum/skills/`** — one file per subject, registering `Skill` taxonomy entries.
- **`curriculum/packs/<subject>/<pack>.ts`** — a `ContentPack<TItem>` export plus pack-scoped helper lookups (e.g. `getConstellationById(items, id)`). Helpers take `items` explicitly so the pack module stays stateless.
- **`curriculum/packs/language/vocabulary.ts`** — Estonian and English vocabulary packs plus the Estonian alphabet and word-length grouping helper used by word builder, word cascade, picture pairs, and letter match.
- **`curriculum/packs/language/spatialSentences.ts`** — Sentence Logic scenes, subject/anchor translations, position translations, and sentence construction helpers. The generator owns level-based scene filtering and option construction.
- **`curriculum/packs/geometry/shapeShiftPuzzles.ts`** — Shape Shift puzzle definitions. The generator owns mode selection, history avoidance, piece initialization, and decoys; the puzzle data lives in curriculum.
- **`curriculum/packs/math/types.ts`** — re-exports the `ArithmeticSpec` / `EquationOp` DSL types from `src/types/game.ts`. Math packs are lists of specs (op + optional per-spec overrides), consumed by the `math_snake` engine which owns level-based range scaling.
- **`curriculum/packs/math/geometry_shapes.ts`** — Shape Dash checkpoint and gate content. The pack items carry localized prompts/options; the generator owns only placement, shuffling, and obstacle/run geometry.
- **`curriculum/packs/math/pattern_sequences.ts`** — Pattern Train symbol themes and repeat-rule templates. The generator owns randomization, level boost, and option shuffling.
- **`curriculum/packs/math/unit_conversions.ts`** — Unit Conversion measurement categories, unit pairs, and factors. The generator owns profile/level ranges and distractor generation.
- **`curriculum/packs/math/compare_numbers.ts`** — Compare Sizes level-stage specs: max value, equality chance, display mode, and allowed comparison symbols. The generator owns value generation and display realization.
- **`curriculum/packs/math/time_reading.ts`** — Time Match level-stage specs: minute precision and answer-option count. The generator owns clock sampling and distractor labels.
- **`curriculum/packs/math/balance_equations.ts`** — Balance Scale progression specs: sum range growth, profile boost, minimum visible weights, and answer-option distractor settings. The generator owns equation construction and shuffling.
- **`curriculum/packs/math/addition_memory.ts`** — Memory Math profile progression specs: card count growth and answer-sum limits. The generator owns equation pair construction and card shuffling.
- **`curriculum/packs/math/grid_navigation.ts`** — Robo Path profile/grid/obstacle progression specs. The generator owns pathfinding, obstacle placement, and command limits.
- **`curriculum/packs/math/battlelearn.ts`** — BattleLearn board, cell-distribution, question-stage, object-label, and sequence-pattern specs. The generator owns ship placement, concrete problem construction, answer options, and board state.
- **`curriculum/index.ts`** — imports every skill + pack for side-effect registration. Any module that calls `getPackItems` must import this first (mechanics do so via `games/registrations.ts`).

## Component architecture

### Game views

One view per registered game in `src/components/gameViews/`. Each receives `{ problem, onAnswer, soundEnabled, level, stars, spendStars, spendHeart, endGame, onMove? }` via `GameRenderer` and renders the game UI. Current views:

`BalanceScaleView`, `BattleLearnView`, `MemoryGameView`, `PatternTrainView`, `PicturePairsView`, `RoboPathView`, `ShapeDashView`, `ShapeShiftView`, `StandardGameView` (covers sentence_logic + letter_match), `StarMapperView`, `SyllableGameView`, `TimeGameView`, `UnitConversionView`, `WordCascadeView`, `WordGameView`. `MathSnakeView` and `CompareSizesView` live one level up in `src/components/`.

### Shared components

Cross-game UI primitives in `src/components/shared/`:

- `GameProblemModal` — pauses gameplay to show a multiple-choice question. Used by BattleLearn + MathSnake. See [`docs/shared-components.md`](docs/shared-components.md).
- `GameStatsBar` — renders game-specific counters above the global `GameHeader`.
- `LevelUpModal`, `FeedbackModal` — celebration / feedback surfaces.
- `PaidHintButtons`, `ResourceBadge`, `ResourceDisplay` — economy UI.
- `Confetti`, `TimeDisplay`, `SvgWeight` — one-off display primitives.
- `KHEIcon`, `SmartGamesLogo` — brand assets.

### Top-level components

`GameHeader`, `GameCard`, `SettingsMenu`, `NotificationSystem` (with prioritized hero/level-up/achievement/standard slots), `FeedbackSystem`, `TipButton`, `ParticleEffect`, `EnhancedAnimations`, `MathSnakeView`, `CompareSizesView`, `StatsDashboard`, `AccessibilityHelpers`.

## Gameplay screen composition

`src/features/gameplay/` is the canonical container-view split and the result of ROADMAP Phase 0's debt paydown:

```
GameScreen.tsx (container, ≤ ~230 LOC)
├── reads gameStore + playSessionStore (via flat per-field selectors)
├── owns local UI state (5 modal open/close flags, 2 refs, compact-layout)
├── composes useGameEngine, useGameAudio, useAnswerHandler, useGameTips,
│            useMathSnakeMovement, useGameScreenEffects,
│            useUnlockedAchievementCopies
├── defines handlers (handleAnswer, handleLevelChange, handleReturnToMenu,
│                      handleNotificationDismiss) and the settingsMenuSlot JSX
│
├── <GameScreenView {...}/>         — pure view: background, overlays,
│                                     GameHeader, overlay badges, GameRenderer,
│                                     TipButton
└── <GameScreenModalHost {...}/>    — pure modal shell: Stats / Achievements /
                                      Shop / LevelSelector / GameDescription
```

Child components in the same folder: `GameRenderer` (looks up the view from the registry), `GameDescriptionModal`, `GameResultScreen`, and mechanic-specific result details such as `SnakeSessionSummary`.

This layout is the template for any future screen-level refactor: container owns wiring, views take props, modal orchestration is isolated, and heavy side-effect orchestration goes into named hooks.

## Internationalization

Type-safe system in `src/i18n/`. Current locales: Estonian (default) and English. See [`src/i18n/README.md`](src/i18n/README.md) for structure, usage, and how to add a locale. The `useTranslation` hook returns a strongly-typed translations object; a new key missing from any locale is a compile error.

## Monetization

Feature-flag + tier scaffolding in `src/monetization/`, intentionally inert. No user-facing feature reads these flags today. See [`src/monetization/README.md`](src/monetization/README.md). Activation is ROADMAP Phase 6 work; ADR-0001 names this the **Entitlement** bounded context.

## Testing

### Layers

- **Engine unit tests** (`src/engine/__tests__/`) — deterministic, no DOM. 76% coverage target 80%+.
- **Hook + utility tests** — `src/hooks/__tests__/`, `src/utils/__tests__/`, `src/stores/__tests__/`.
- **Component tests** — colocated `__tests__/` folders using Happy DOM + React Testing Library.
- **End-to-end** (`e2e/`) — Playwright smoke suite: menu loads with learner-progress game cards, category expansion shows games without age-tier filtering, game-card click navigates to the game route, balance-scale answer records in stats, and every `GAME_CONFIG` route renders without runtime console/page errors.

### Principles

- Behavior, not implementation.
- Deterministic (seeded RNG).
- Fast: unit suite runs under 2 seconds, E2E under 5.
- AAA pattern (Arrange-Act-Assert).

### Commands

See [`README.md` → Testing & quality gates](README.md#testing--quality-gates).

## Code quality

Enforced by CI. Every push to `main` runs the full gate; PRs are expected to land green.

- **ESLint** 9 with typescript-eslint and `eslint-config-prettier`.
- **Knip** — `npm run lint:dead` checks unused files and dependencies. `knip.jsonc` allowlists only documented inactive scaffolding (`src/monetization/`, `src/services/persistence/`) plus the static analytics-consent browser asset.
- **TypeScript** strict mode: `strict: true`, `noUncheckedIndexedAccess`, no implicit `any`, no unused locals/parameters. Dedicated `npm run typecheck` script runs `tsc --noEmit` before build.
- **Prettier** — single source of formatting; `npm run format` writes, `npm run format:check` verifies (CI uses the latter).
- **Import discipline** — conventions enforced by reviewers; ADR-0001 anticipates an eventual ESLint import-restriction rule at context boundaries.

## Extensibility

### Adding a new game

This is a zero-touch-on-`GameRenderer` operation thanks to the registry.

1. **Config** — add entry to `src/games/data.ts` `GAME_CONFIG`:
   ```ts
   new_game: {
     id: 'new_game',
     title: 'NEW GAME',
     theme: THEME.blue,
     icon: 'Icon',
     desc: 'Short description',
     difficulty: 'easy',
     category: 'logic',
     // Optional: mechanic, visualTheme, sessionMode, levelUpStrategy
   }
   ```
2. **Generator** — add to `src/games/generators.ts`:
   ```ts
   new_game: (level, rng, context) => ({ type: 'new_game', ... })
   ```
   `context: GeneratorContext` carries optional `avoidContentIds`, `variant`, `ageHint`, and `skillChallenge.factsKnown`.
3. **Validator** — add to `src/games/validators.ts` as a pure `(problem, userAnswer) → boolean`.
4. **View** — create `src/components/gameViews/NewGameView.tsx`, receive the standard props (`problem`, `onAnswer`, `soundEnabled`, `level`, `stars`, `spendStars`, `spendHeart`, `endGame`).
5. **Register** — append to `src/games/registrations.ts`:
   ```ts
   gameRegistry.register({
     id: 'new_game',
     component: NewGameView,
     generator: Generators.new_game,
     config: GAME_CONFIG.new_game,
     validator: validateNewGame,
     // Optional: skillIds, contentPackId — required for curriculum-bound games
   });
   ```
6. **i18n** — add strings to `src/i18n/locales/et.ts` **and** `en.ts`. A missing key is a compile error.
7. **Tests** — unit tests for the generator and validator in colocated `__tests__/` folders; extend the Playwright smoke suite if the mechanic is genuinely new.

For a curriculum-bound game (one mechanic + one or more skills + a content pack), declare `skillIds` and `contentPackId` on the registry entry. The generator then resolves content via `getPackItems(contentPackId)` or `getPackItemsForLocale(skillId, locale)` instead of hardcoding it.

### Adding a locale

See [`src/i18n/README.md`](src/i18n/README.md).

## Performance

Practical defaults, not premature optimization:

- `React.memo` / `useCallback` / `useMemo` used where profiling showed real wins (game views, heavy animated components).
- Vite automatic code splitting at route boundaries.
- The build warns when any chunk exceeds 500 kB gzipped; current main bundle is ~191 kB gzipped.

## Accessibility

WCAG 2.1 AA is the baseline:

- Keyboard navigation (Escape closes modals, Enter/Space on interactive targets, Tab order audited).
- ARIA labels on decorative and interactive elements; screen-reader-only text via `.sr-only`.
- Focus trap in modals (`src/components/AccessibilityHelpers.tsx`).
- `prefers-reduced-motion` respected by animated elements.
- High-contrast support via Tailwind's color palette.

## Snake mechanic audit (Phase 1 Slice 3b)

When the snake family expanded from one card to six, a dedicated audit of
`MathSnakeView` + `mathSnake` engine + movement/answer hooks ran. Two critical
routing bugs were found and fixed; several smaller issues + v2 opportunities
are listed here as the next natural slice boundaries.

### Fixed in this slice (critical)

- **Movement hook hardcoded `baseType !== 'math_snake'`** (`useMathSnakeMovement.ts:30`): all new snake bindings would have been silently non-interactive — arrow keys produced no movement. Replaced with suffix match `endsWith('_snake')` plus a shared `isSnakeGameType(gameType)` helper in `engine/mathSnake.ts`.
- **Answer routing hardcoded `baseGameType === 'math_snake'`** (`engine/answerHandler.ts:187`, `hooks/useAnswerHandler.ts` × 6 call sites): new snake games would have fallen through to `processStandardAnswer`, awarding 10 points per correct answer instead of the snake's "math = stars, apples = points" model, and skipping the snake-specific length/collision stat tracking. Replaced with `isSnakeGameType(gameType)`.
- **Subtraction missing-minuend capped at 15 / 20** (`engine/mathSnake.ts` `sub_missing_minuend`): hardcoded `Math.min(15, maxVal - 1)` / `Math.min(20, maxVal - b)` prevented a "within 100" pack from producing facts like `? − 45 = 30`. Replaced with range bounds driven by the pack's `valueRange`.

### Fixed in the medium-severity follow-up (Phase 1 Slice 3c)

- **Growth model no longer rewards wrong answers.** Math apples are now challenge triggers, not food: `moveMathSnake` does not grow the snake on math-apple consumption. `resolveMathSnakeAnswer` is the only growth source for math interactions — correct answer +2 segments, wrong answer 0 (hearts still tick down). Net per math apple: +2 if right, 0 if wrong. No more "farming" length by guessing.
- **End-of-session summary added.** `SnakeSessionSummary` (rendered by `GameResultScreen` for any `*_snake` game-over state) shows max length, accuracy, best in-session streak, and the top 3 hardest facts (most wrong attempts). Per-fact tracking lives in `playSessionStore.snakeSessionStats.factHistory` and is the precursor to the Phase 1 mastery tracker.
- **Theme-aware snake palette.** `VisualTheme.snakePalette: 'emerald' | 'teal' | 'orange' | 'pink' | 'indigo' | 'purple'` drives head, body (alternating), tail, glow ring, and `+N` text colour via the `SNAKE_PALETTES` token table in `MathSnakeView`. Each of the six snake bindings now picks its own family (additsioon → emerald, suur liitmine → teal, lahutamine → orange, suur lahutamine → pink, korrutus → indigo, suur korrutus → purple).
- **In-session progression.** Grid starts at `SNAKE_MIN_GRID_SIZE` (7) and expands by one every `SNAKE_STREAK_MILESTONE` (5) correct answers, capped at `SNAKE_MAX_GRID_SIZE` (10). `expandSnakeGrid` is invoked from `useAnswerHandler` after a correct snake answer when the new streak hits the milestone. Speed remains one-step-per-input (no autoadvance) — kid-friendly.
- **Walls now kill (no wraparound).** `moveMathSnake` returns `collision: true` when the next head leaves the grid; `wrapPosition` removed. Solves the unfair "tail appears from nowhere" case that touch input made worse.
- **`+N` overlay shows actual delta.** `MathSnakeView` captures the snake-length delta on growth and renders `+1` for normal apple, `+2` for correct math answer (was hardcoded `+1`).

### Open (low) — polish

- **Menu crowding after 6 snake cards.** Math category is now snake-heavy (6 of ~10). Group visually ("Snake family" sub-section) or collapse variants into a tier selector on one card.
- **Accessibility.** No ARIA labels for snake segments, apple state, or modal. Screen readers cannot announce gameplay. Keyboard-only works (arrow + WASD); no alternate input for users who can't use keyboard.
- **`MathSnakeProblem.specs` on the problem state.** Same reference duplicated into every generated problem. Acceptable (session store is in-memory) but cleaner to resolve from pack registry via binding id at challenge time.

### v2 opportunities — would materially lift the game

- **Per-fact mastery tracking (persistent).** Slice 3c added a session-scoped mini-version (`snakeSessionStats.factHistory` → top-3 hardest in summary). The full Phase 1 mastery tracker promotes that across sessions: persist `SkillMastery` per fact, weight the generator toward weak facts, surface a mastery grid ("25 squares, X green, Y yellow, Z red"). Fits ADR-0002.
- **Score model measures exploration, not math performance.** High score = how many normal apples eaten. "Got 8/10 multiplication facts right" is now in the session summary but not promoted into a persistent leaderboard.
- **Daily challenge pack.** Every day, a generated "daily practice" picks 10 weakest facts across all packs, presents as a sub-challenge. Drives return visits without requiring a backend.
- **Bonus apple at streak milestones.** Slice 3c grows the grid every 5-correct; layering a one-shot bonus apple (or shimmer effect) on the same milestone would make the variable-reward loop more visible.

## Deployment

Two-workflow setup in `.github/workflows/`:

- **`ci.yml`** — quality gate on every push and PR: lint, dead-code check, typecheck, format check, unit tests, build, and a separate Playwright E2E job.
- **`deploy.yml`** — on push to `main` only, runs on a self-hosted runner on the homelab VM: builds, then `cp -r dist/* /srv/data/games/study/` into the directory nginx serves as `games.khe.ee/study/`.

There is no runtime backend today; Phase 2 adds one per ROADMAP §4.

## Where this document stops

What this document **does not** cover:

- Phased implementation plan and sequencing → [`ROADMAP.md`](ROADMAP.md).
- Target domain model (bounded contexts) and learner identity → [`docs/adr/0001-bounded-contexts.md`](docs/adr/0001-bounded-contexts.md), [`docs/adr/0002-learner-profile.md`](docs/adr/0002-learner-profile.md).
- Module-level specifics → [`src/i18n/README.md`](src/i18n/README.md), [`src/monetization/README.md`](src/monetization/README.md), [`docs/shared-components.md`](docs/shared-components.md).

When this document and an ADR disagree, the ADR wins.
