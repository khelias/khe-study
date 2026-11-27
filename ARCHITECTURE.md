# Architecture Documentation

## Overview

**Smart Games** is an educational web platform built as an extensible, testable reference codebase with a real product on top. This document describes the **current** code structure. The **target** structure — five bounded contexts, persona-agnostic learner profile, backend-backed sync — is captured in [`docs/decisions/`](docs/decisions/README.md) and the phased plan in [`ROADMAP.md`](ROADMAP.md). Parts of this document describe code that will be restructured as Phase 1 lands; where that is the case the section notes it and points at the ADR.

## Technology Stack

### Core

Major versions; `package.json` has the exact ones.

- **React** 19 — UI.
- **TypeScript** 7 (`tsc`), with the TS 6 compat package as `typescript` for typescript-eslint — strict mode, `noUncheckedIndexedAccess`, no implicit `any`.
- **Vite** 8 — build + dev server.
- **Zustand** 5 — state.
- **Tailwind CSS** 4 — styling, via `@tailwindcss/vite`.
- **React Router** 7 — client routing.

### Testing & quality

- **Vitest** 5 with **Happy DOM** 21, **React Testing Library** 16.
- **Playwright** 1 — E2E.
- **ESLint** 10 with typescript-eslint 8 and `eslint-config-prettier`.
- **Knip** 6 — unused file/dependency detection; intentionally inactive scaffolding is allowlisted in `knip.jsonc`.
- **Prettier** 3 — formatting; checked in CI.

## Project structure

Directory-level map; file-level details live in the code, not here.

```
src/
├── components/          # UI components
│   ├── gameViews/       # AnswerCardView (shared answer-card shell)
│   ├── shared/          # Cross-game UI primitives (GameProblemModal, GameStatsBar, etc.)
│   └── *.tsx            # Top-level: GameHeader, SettingsMenu, GameCard, NotificationSystem, …
├── engine/              # Pure game logic (deterministic, UI-independent, 76% covered)
├── features/            # Screen-level composition
│   ├── gameplay/        # GameScreen (container) + GameScreenView + GameScreenModalHost + game-screen children
│   ├── menu/            # MenuScreen
│   ├── modals/          # Stats / Achievements / Shop (+ ThemeShopSection) / LevelSelector / PackPicker / Tutorial modals
│   ├── routing/         # GameRoute: starts a game from its URL slug
│   └── theme/           # useAppliedTheme + ThemeApplier (CSS variables on <html>)
├── curriculum/          # Skills + ContentPacks (what is learned + its data)
├── games/               # Game registry, data.ts, one folder per mechanic
├── learner/             # LearnerProfile types, legacy-progress migration, skill classification
├── diagnostics/         # Curriculum audit report (skills, packs, bindings), asserted by its test
├── meta/                # Meta-progression: theme catalog + purchase/apply rules (pure), themes/<id>/ data
├── hooks/               # Reusable React hooks (useGameEngine, useAnswerHandler, …)
├── i18n/                # Type-safe translations (see src/i18n/README.md)
├── offline/             # Installed app: service worker, kill-switch, build plugin, registration
├── stores/              # Zustand: gameStore (persistent) + playSessionStore (session)
├── types/               # Shared type definitions
├── utils/               # Cross-cutting helpers
├── test/                # Vitest setup + utilities
├── App.tsx
└── main.tsx

docs/
├── decisions/           # Architecture Decision Records (authoritative)
├── shared-components.md # Cookbook for GameProblemModal + GameStatsBar
e2e/                     # Playwright specs
.github/workflows/       # ci.yml (quality gate) + codeql.yml + deploy.yml (self-hosted runner → homelab)
```

## Architecture principles

1. **Separation of concerns.** Presentation (`components/`, `features/`), business logic (`engine/`), state (`stores/`), data/config (`games/data.ts`). The engine layer has no React or browser dependencies.
2. **Feature-first composition.** Whole-screen flows live in `features/<feature>/`, each owning its own components, screens, and modals.
3. **Container / view split.** Stateful containers read stores and own handlers; view components take props. The gameplay screen is the canonical example — see [Gameplay screen composition](#gameplay-screen-composition).
4. **Type safety end-to-end.** Strict TypeScript, exhaustive unions, no `any`. Exhaustiveness is enforced at generator and validator boundaries.
5. **Testability as a first-class property.** The engine is unit-tested without DOM; components are tested with RTL; user journeys are covered by Playwright.
6. **i18n as an orthogonal layer.** All user-facing strings route through `useTranslation`.

See [ADR-0001](docs/decisions/0001-bounded-contexts.md) for the target bounded-context decomposition that these principles converge toward.

## State management

Two Zustand stores with well-defined responsibilities.

### `gameStore` (persistent, `localStorage`)

Owns cross-session state organized along ADR-0002's `LearnerProfile` aggregate plus device-level shared state:

- **Per-learner**: `learners: LearnerProfile[]` + `activeLearnerId`. Each learner carries `skillMastery[skillId]` (rolling stats + `factsKnown` for closed-set skills), `mechanicPreference[mechanicId]` (the level played at as `difficulty`, the `highestLevel` reached, the `roundsReached` toward the next, and the variant), `ageHint?`, `persona`, `preferences.theme` (the applied theme) and `meta` (`LearnerMeta` from `src/meta/types.ts`: spendable `stars`, `stats` with the stars earned in `collectedStars`, unlocked `achievements`, `highScores` and `ownedThemeIds`, ADR 0005 point 4). `activeLearnerProfile` is a derived mirror kept in sync by `commitActiveLearner` from every mutator.
- **Device-level**: sound, the tutorial flag, favourites, the content seen per pack and `demoStarsEnabled`, the settings switch that shows the shop's free stars (ADR 0005 point 5).

Actions: `earnStars`, `spendStars`, `buyStars` (refused while the demo switch is off), `updateStats`, `updateHighScore`, `setLevel` (refuses a level above the highest reached), `recordRoundResult` (the level rule of ADR 0005 point 3), `getLevelProgress`, `setMechanicVariant`, `toggleSound`, `setDemoStarsEnabled`, `addLearner`, `removeLearner`, `setActiveLearner`, `buyTheme` (debit, grant and apply in one `set`), `applyTheme`. Zustand `persist` middleware serializes to `localStorage` under key `smart_adv_v45_pro` at version 11 (v9 to v10 dropped the device hearts and seeded `highestLevel` from `difficulty`; v10 to v11 moved the device's stars, stats, achievements, high scores and owned themes into the learner active then, the others starting empty, and dropped the global score).

### Themes (`src/meta/`)

Pure rules, no React: `themeCatalog.ts` validates every `themes/<id>/theme.json` collected by `import.meta.glob` and drops invalid ones, `inventory.ts` decides purchase and apply, `contrast.ts` is the WCAG check the catalog test runs on every background. Ownership is the learner's (`meta.ownedThemeIds`), and a purchase is one `set()` of the active learner. `ThemeApplier` (in `App.tsx`) writes `--app-bg`, `--app-bg-dark` and `--app-bg-image` on `<html>` in a layout effect; `.app-bg` in `src/index.css` reads the light or the dark ground by the theme that shows. The App, menu and game-screen roots use `.app-bg`, and so do the shop's theme swatches, each with its own theme's variables inline; on the game screen the answer flash (`bgClass`, the `.answer-ok` and `.answer-bad` utilities) overrides only the colour.

### `playSessionStore` (in-memory, per play)

Owns session state: current `gameType`, `problem`, `score`, the `round` being played and the `roundResult` of the one that ended, `bestStreak`, `bgClass`, confetti/particle flags, `adaptiveDifficulty` snapshot, notifications queue, `gameStartTime`. Actions: `setProblem`, `addScore`, `addNotification` / `removeNotification`, `recordRoundAnswer`, `loseRoundLife`, `finishTimedRound`, `endRound`, `startNextRound`, `returnToMenu`, `updateAdaptiveDifficulty`. Discarded on menu return.

### Rounds

A game is played in rounds (ADR 0005 point 1). Each registry entry declares its `round` (`src/engine/round.ts`: a goal kind of tasks, board, run, puzzle or timed, and a size from Phase 1.7's growth table). A round has three lives of its own: `useAnswerHandler` counts a right answer toward the goal; a wrong one and a game's own failure (the snake's crash, BattleLearn's five misses) go through `useRoundFlow().failTask`, which takes a life and restarts the task where the entry registers `restartTask`. A timed round (the fact drill) has no lives and is judged by `useRoundFlow().timeUp` when the view's clock stops; it has no levels, so it leaves the level rule alone. When a round ends, `useRoundFlow().finishRound` gives a reached round its stars (`calculateStarReward`, one more when no life was lost), applies the level rule through `recordRoundResult`, collects the achievements of the round and, after the last answer's feedback, shows `GameResultScreen`, the one end screen for every game; its next round starts with three lives.

The split is load-bearing: persistent data survives reloads but is free of transient UI noise; session data disappears automatically when the play ends. `getLevelForGame(gameType)` reads `activeLearnerProfile.mechanicPreference[getMechanicIdForGame(gameType)]?.difficulty ?? 1`; skill mastery owns `factsKnown` for the spaced-repetition picker, not the level.

### Flow

```
User input → component handler → store action → store update
                                              → subscribed component re-render
                                              → effect (e.g. persistence, notification)
```

## Game engine

Pure, deterministic modules in `src/engine/`. All are UI-independent, ~76% test coverage.

| Module                  | Responsibility                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `rng.ts`                | Seeded deterministic RNG, `createRng(seed)`.                                        |
| `adaptiveDifficulty.ts` | `(recentAccuracy, streaks) → effectiveLevel` adjustment.                            |
| `round.ts`              | A round's goal, lives and end: the goal per kind, a life lost, the timed judgement. |
| `progression.ts`        | The level rule (three reached rounds at the highest level), star rewards.           |
| `achievements.ts`       | Static `ACHIEVEMENTS` table: progress per achievement, unlock derived from it.      |
| `stats.ts`              | Stats aggregation (answers, streaks, play time, highest levels, max snake length).  |
| `answerHandler.ts`      | Pure answer-processing logic; used by `useAnswerHandler`.                           |
| `mathSnake.ts`          | Snake movement, collision, apple spawning, math-challenge resolution.               |
| `shapeShiftGrid.ts`     | Shape Shift grid coordinate conversion, snap math, draw ordering, bounds checks.    |
| `shapeDash.ts`          | Shape-Dash physics primitives (AABB, obstacle bounds, checkpoint detection).        |
| `factDrill.ts`          | Fact Drill sprint session: fact pool, weakest-fact picking, scoring, timer ticks.   |
| `battlelearn.ts`        | BattleLearn ship placement, shot resolution, sunk and win checks.                   |
| `audio.ts`              | Sound effects API; respects `soundEnabled` from store.                              |
| `errorBoundary.tsx`     | React error boundary used in root composition.                                      |

## Custom hooks

Top-level hooks in `src/hooks/`. All are idiomatic React hooks — they either encapsulate effect orchestration or derive data from stores.

- **`useGameEngine`** — owns the dedupe history (the entry's `problemKey` and `dedupeWord`) and records the entry's `contentItemIds` as played; exposes `generateUniqueProblemForGame`, `validateAnswer`, `getRng`.
- **`useAnswerHandler`** — answer → score/stats/achievement pipeline; coordinates engine + both stores.
- **`useGameAudio`** — gated sound playback driven by `soundEnabled`.
- **`useGameTips`** — shows a game's tips (`t.gameScreen.tips[<game id>]`) as toasts, the first once per session and the rest on replay; none for a config with `tipToast: false`. `getGameTips` is the same lookup for the How to play modal.
- **`useEliminateWrongOption`** — the paid "eliminate a wrong option" hint shared by the option-list views: checks that a wrong option is left, spends one star, hides a random one, and resets when its reset deps change (new problem, new question).
- **`useMathSnakeMovement`** — returns the directional-input handler for Math Snake games (extracted from `GameScreen`; returns `undefined` for non-snake games).
- **`useGameScreenEffects`** — bundles six gameplay-screen lifecycle effects (settings-click-outside, compact-layout query, initial problem generation, level-progress reset, auto-open game description, escape-to-close).
- **`useUnlockedAchievementCopies`** — reads unlocked-achievement IDs and enriches them with i18n copy; returns both raw IDs and enriched `AchievementUnlock[]`.
- **`useWrongStrikes`** — consecutive-wrong tracking used by games with crash-on-N-wrong mechanics.
- **`useProfileText`** — formats copy through `LearnerProfile` (persona, ageHint). Name predates the profile/learner rename; kept as-is to avoid touching every call site.

## Game data and registry

The registry makes game additions data-driven: no dispatch on game type outside `src/games/`; `src/games/__tests__/registryContract.test.ts` fails on a `case` label or a `===` / `!==` comparison naming a registered id or problem type anywhere else, and drives a fixture binding through the engine, the play-session store and the tips. What is left is its `COMPARISON_ALLOWLIST`: `answerHandler.ts`, `useAnswerHandler.ts`, `useMathSnakeMovement.ts` and `SettingsMenuContent.tsx`, the snake, fact drill, cascade and BattleLearn answer paths and the picture_pairs variant toggle. The test fails when an allowlisted file stops comparing on type. Each mechanic owns `src/games/<mechanic>/`; `balanceScale/` is the reference:

- **`config.ts`**: `BALANCE_SCALE_CONFIG: GameConfig`, the binding's UI metadata, difficulty, category and paid hints, plus optional `mechanic`, `sessionMode`, `visualTheme` and `tipPlacement` (`'inline'` puts the tip replay button below the view instead of floating it; shape dash).
- **`generator.ts`**: `generateBalanceScale(level, rng)` returns a `BalanceScaleProblem`. Generators match `GeneratorFunction`, `(level, rng?, context?) => Problem`, where `context: GeneratorContext` carries `avoidContentIds`, `contentPackId`, `variant`, `ageHint` and optional `skillChallenge.factsKnown` for closed-set spaced repetition. Balance scale reads its stage specs from `MATH_BALANCE_EQUATIONS_PACK` via `getPackItems`.
- **`validator.ts`**: `validateBalanceScale: AnswerValidator`, a pure `(problem, userAnswer) => boolean` that rejects any other `problem.type`.
- **`View.tsx`**: `BalanceScaleView`. `letter_match` and `sentence_logic` have their own `View.tsx` on the shared `AnswerCardView` shell.
- **`Picture.tsx`**: `BalanceScalePicture`, the menu picture: an 80 by 64 drawing of the play area on `PictureFrame`, coloured only through token utilities so it follows the theme. A mechanic with several bindings has one, for its card; `games/menuPictures.ts` maps each menu entry to its picture and `menuPicture(id)` finds a binding's through its mechanic.
- **`register.ts`**: imports the four above and calls `gameRegistry.register({ id, component, generator, config, validator, round, skillIds?, contentPackId?, ...problem hooks })` as a module side effect. The optional problem hooks, typed for the mechanic's own problem: `problemKey` (dedupe key, default `${type}:${uid}`), `dedupeWord` (word games), `contentItemIds` (pack items recorded as played), `cloneProblem` (fresh nested arrays on `setProblem`, default a shallow copy), `questionKey` (the answer timer restarts when it changes; the snake bindings return the equation), `renderKey` (remounts the view when it changes, default `uid`; shape shift adds the puzzle id; star_mapper returns a constant so its WebGL sky stays mounted from task to task), `factKey` (the closed-set fact an answer is recorded under; star_mapper's constellation id) `sessionObjective` (the objective in the game header in place of the round's goal; BattleLearn shows the ships sunk) and `restartTask` (the same task from its start after a failure, for a view that does not reset itself; Word Cascade). A mechanic with several bindings (snake, fact drill, BattleLearn, word cascade) registers each binding here.

Central files:

- **`games/data.ts`**: imports each mechanic's config into `GAME_CONFIG`, plus `MECHANICS` (menu metadata for multi-binding mechanics), `CATEGORIES`, `ICONS` and the `getMechanicIdForGame(gameType)` helper.
- **`games/registry.ts`**: the `gameRegistry` singleton and the `GameRegistryEntry`, `GameViewProps` and `AnswerValidator` types. `skillIds` + `contentPackId` are set on curriculum-bound bindings.
- **`games/registrations.ts`**: imports `src/curriculum/` first so pack lookups resolve, then one `import './<mechanic>/register';` per mechanic: 19 mechanics, 34 bindings. There is no central generator or validator map.
- **`types/game.ts`**: the `Problem` discriminated union stays central; each mechanic's problem interface is a member.

The **Skill × Mechanic × Content welding** called out as debt in ROADMAP §2 is paid down: content lives in curriculum packs, generators own placement, shuffling and runtime state. Fifteen content migrations have landed: constellations → `ASTRONOMY_VISIBLE_FROM_ESTONIA_PACK` (Slice 1), syllables → `LANGUAGE_SYLLABIFICATION_{ET,EN}_PACK` (Slice 2), the snake family's arithmetic specs → six focused math packs (Slice 3), Shape Dash's checkpoint/gate question bank → `MATH_GEOMETRY_SHAPES_PACK` (Slice 5), Shape Shift's puzzle database → `SHAPE_SHIFT_PUZZLES_PACK` (Slice 6), Sentence Logic's scene/sentence data → `LANGUAGE_SPATIAL_SENTENCES_PACK` (Slice 7), vocabulary words → `LANGUAGE_VOCABULARY_{ET,EN}_PACK` (Slice 8), Pattern Train's themes/templates → `MATH_PATTERN_SEQUENCES_PACK` (Slice 10), unit conversion definitions → `MATH_UNIT_CONVERSIONS_PACK` (Slice 11), Compare Sizes' level-stage specs → `MATH_COMPARE_NUMBERS_PACK` (Slice 12), Time Match's minute-precision stages → `MATH_TIME_READING_PACK` (Slice 13), Balance Scale's progression specs → `MATH_BALANCE_EQUATIONS_PACK` (Slice 14), Memory Math's card/sum progression → `MATH_ADDITION_MEMORY_PACK` (Slice 15), Robo Path's grid/obstacle progression → `MATH_GRID_NAVIGATION_PACK` (Slice 16), and BattleLearn's board/question progression → `MATH_BATTLELEARN_PACK` (Slice 17). Shape Shift's grid coordinate helpers moved out of `games/` into `engine/shapeShiftGrid.ts` in Slice 9. Three shapes of pack consumption now exist:

- **Static single-pack**: binding sets `contentPackId`; generator calls `getPackItems(id)`. Used by `star_mapper`, `shape_dash`, `shape_shift`, and `sentence_logic`.
- **Multi-locale skill**: binding sets only `skillIds`; generator calls `getPackItemsForLocale(skillId, locale)`. Used by `syllable_builder` and the vocabulary-backed word games.
- **Procedural DSL pack**: pack items are spec-recipes, not static instances. The engine owns range-scaling logic; specs carry op kind + optional per-spec overrides. Used by the six snake bindings. Multiple bindings point to different packs → appear under one mechanic card in the menu using the same underlying component.

## Curriculum (skills + content packs)

`src/curriculum/` owns the Curriculum bounded context from ADR-0001. Mechanics consume packs via bindings; they do not import content files directly.

A pack with a `starter` and an `advanced` track is one level ladder: levels 1-5 play the starter stages and level 6 on the advanced ones, with stage levels shifted by 5. `curriculum/levelLadder.ts` (`getTrackLevel`) does the mapping for every generator that reads tracks.

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

Each mechanic's view is `src/games/<mechanic>/View.tsx`. `GameRenderer` looks the binding up in `gameRegistry` and passes `{ problem, onAnswer, onMove, soundEnabled, level, gameType, stars, spendStars, onFailure, onTimeUp, paused }`; `onFailure` is a game's own failure that costs a round life and `onTimeUp` stops a timed round; `paused` is true while the game description sheet is open, and the fact drill's clock and Shape Dash's run hold still. A view sits on the light stage of ADR 0004 unless its config sets `stage: 'immersive'` (ADR 0007): then `GameScreenView` gives it the whole height under the header, edge to edge, and floats the tip button over it. Tähistaevas (`starMapper/`) is the one immersive game: `sky/astro.ts` holds the pure sky maths and the one projection that the SVG overlay (`sky/SkyOverlay.tsx`), the camera (`sky/useSkyCamera.ts`) and the three.js renderer (`sky/SkyRenderer.ts`, a lazy chunk loaded by `sky/SkyCanvas.tsx`) share; without WebGL the overlay plays on a CSS gradient sky. Its play layer: `figures/` holds line-art creatures for the ten easy constellations, drawn in each figure's tangent plane and fitted to the stars' screen positions each frame by `sky/CreatureLayer.tsx`; `nightClock.ts` is the pure night-before-dawn clock the view feeds frame deltas while a task is open (a time budget from level 5 that fails the task once); `treasures.ts` lists the hidden sky objects a problem may carry (`treasureId`), shown below 40° field of view; `Owl.tsx` is the game's own companion with a speech bubble; `seasons.ts` counts Minu taevas' rings and finds the find that completes a season. `src/components/gameViews/` holds only the `AnswerCardView` shell, which the `letter_match` and `sentence_logic` views fill with their prompt, options and correct answer.

### Shared components

Cross-game UI primitives in `src/components/shared/`:

- `GameProblemModal` — pauses gameplay to show a multiple-choice question. Used by BattleLearn + MathSnake. See [`docs/shared-components.md`](docs/shared-components.md).
- `GameStatsBar` — renders game-specific counters above the global `GameHeader`. No game uses it yet.
- `FeedbackModal` — the feedback sheet (Pattern's wrong-answer explanation). A level-up shows on the round's end screen.
- `PaidHintButtons`, `ResourceBadge` — economy UI.
- `Confetti`, `TimeDisplay`, `SvgWeight` — one-off display primitives.
- `KHEIcon`, `SmartGamesLogo` — brand assets.

### Top-level components

`GameHeader`, `GameCard`, `MechanicCard`, `SettingsMenu` (+ `SettingsMenuContent`), `StudySiteHeader`, `NotificationSystem` (slots by type: right, wrong and streak in the centre, hint and info at the top, tips at the bottom, achievements as a blocking overlay), `FeedbackSystem`, `TipButton`, `ControlPad`, `ParticleEffect`, `EnhancedAnimations`, `StatsDashboard`, `AccessibilityHelpers`.

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

On a phone (`useCompactPlay`, `(max-width: 767px), (max-height: 520px)`) `App.tsx` drops `StudySiteHeader` on the whole `/games/:gameSlug` route, so the game bar is the only chrome, and `GameHeader` renders one row of at most 56px: home, the round's progress, hearts, stars and the menu. The level, the round's score, the game description and the theme toggle are in `SettingsMenuContent`'s game section; the level and score only on a phone, the description and theme on every width (the desktop header has no info button and, during play, no theme toggle). `SettingsMenu` picks its bottom sheet by the same query. A game that puts its own card over the stage marks it with `data-card-up`, and `src/index.css` then hides the shell's tip button (`[data-tip]`); Tähistaevas does so for its found, atlas and treasure cards, caps the found card at half the screen on a phone, and glides the found figure into the sky between its top panel and the card (`cameraInBand`).

Child components in the same folder: `GameRenderer` (looks up the view from the registry), `GameDescriptionModal`, `GameResultScreen`, and mechanic-specific result details such as `SnakeSessionSummary`.

This layout is the template for any future screen-level refactor: container owns wiring, views take props, modal orchestration is isolated, and heavy side-effect orchestration goes into named hooks.

## Internationalization

Type-safe system in `src/i18n/`. Current locales: Estonian (default) and English. See [`src/i18n/README.md`](src/i18n/README.md) for structure, usage, and how to add a locale. The `useTranslation` hook returns a strongly-typed translations object; a new key missing from any locale is a compile error.

## Monetization

None in code: everything is free. ADR-0001 names the **Entitlement** bounded context; its first code is ROADMAP Phase 6 work.

## Testing

### Layers

- **Engine unit tests** (`src/engine/__tests__/`) — deterministic, no DOM. 76% coverage target 80%+.
- **Hook + utility tests** — `src/hooks/__tests__/`, `src/utils/__tests__/`, `src/stores/__tests__/`.
- **Component tests** — colocated `__tests__/` folders using Happy DOM + React Testing Library.
- **End-to-end** (`e2e/`) — Playwright smoke suite: menu loads with learner-progress game cards, a subject pill shows its games without age-tier filtering, game-card click navigates to the game route, balance-scale answer records in stats, and every `GAME_CONFIG` route renders without runtime console/page errors. `offline.spec.ts` runs on production builds: an offline reload and a played round, an update to a new build, a failed update, and the kill-switch.

### Principles

- Behavior, not implementation.
- Deterministic (seeded RNG).
- Fast: unit suite runs under 2 seconds, E2E under 5.
- AAA pattern (Arrange-Act-Assert).

### Commands

See [`AGENTS.md`](AGENTS.md#commands).

## Code quality

Enforced by CI. Every push to `main` runs the full gate; PRs are expected to land green.

- **ESLint** 10 with typescript-eslint and `eslint-config-prettier`.
- **Knip** — `npm run lint:dead` checks unused files and dependencies.
- **TypeScript** strict mode: `strict: true`, `noUncheckedIndexedAccess`, no implicit `any`, no unused locals/parameters. Dedicated `npm run typecheck` script runs `tsc --noEmit` before build.
- **Prettier** — single source of formatting; `npm run format` writes, `npm run format:check` verifies (CI uses the latter).
- **Import discipline** — conventions enforced by reviewers; ADR-0001 anticipates an eventual ESLint import-restriction rule at context boundaries.

## Extensibility

### Adding a new game

`GameRenderer` needs no change: it resolves the view from the registry. A new mechanic is a folder plus a few central lines; `balanceScale/` is the example to copy.

1. **Problem type**: add the problem interface (`BalanceScaleProblem extends BaseProblem`, `type: 'balance_scale'`) to `src/types/game.ts` and to the `Problem` union.
2. **Config**: `src/games/<mechanic>/config.ts` exports the `GameConfig`:
   ```ts
   export const BALANCE_SCALE_CONFIG: GameConfig = {
     id: 'balance_scale',
     title: 'SCALES',
     icon: 'Scale',
     emoji: '⚖️',
     desc: 'Balance the scales',
     difficulty: 'hard',
     category: 'math',
     // Optional: mechanic, visualTheme, sessionMode, paidHints, tipToast, tipPlacement
   };
   ```
   Import it into `src/games/data.ts` and add it to `GAME_CONFIG`. A mechanic with several bindings also gets a `MECHANICS` entry and `mechanic` on each binding's config.
3. **Generator**: `generator.ts` exports `generateBalanceScale(level, rng)`, a `GeneratorFunction`. A curriculum-bound generator resolves content via `getPackItems(contentPackId)` or `getPackItemsForLocale(skillId, locale)` instead of hardcoding it.
4. **Validator**: `validator.ts` exports `validateBalanceScale: AnswerValidator`, pure `(problem, userAnswer) => boolean`, false for any other `problem.type`.
5. **View**: `View.tsx` exports `BalanceScaleView`, which takes the props `GameRenderer` passes (`problem`, `onAnswer`, `soundEnabled`, `level`, `stars`, `spendStars`, `onFailure`, `onTimeUp`, ...). A plain answer-card game can build its view on `AnswerCardView` from `src/components/gameViews/`.
6. **Register**: `register.ts` wires the four together:
   ```ts
   gameRegistry.register({
     id: 'balance_scale',
     component: BalanceScaleView,
     generator: generateBalanceScale,
     config: BALANCE_SCALE_CONFIG,
     validator: validateBalanceScale,
     skillIds: [MATH_BALANCE_EQUATIONS_SKILL.id],
     contentPackId: MATH_BALANCE_EQUATIONS_PACK.id,
   });
   ```
   Add the problem hooks the mechanic needs (`problemKey`, `dedupeWord`, `contentItemIds`, `cloneProblem`, `questionKey`, `renderKey`, `sessionObjective`; see above). Then add `import './<mechanic>/register';` to `src/games/registrations.ts`.
7. **Picture**: `Picture.tsx` draws the play area for the menu (see above); add it to `src/games/menuPictures.ts`, or `menuPictures.test.ts` fails.
8. **i18n**: add strings to `src/i18n/locales/et.ts` **and** `en.ts`. A missing key is a compile error. Tips go under `gameScreen.tips.<game id>` and are found by id.
9. **Tests**: generator and validator tests in the mechanic's `__tests__/` or in `src/games/__tests__/`; extend the Playwright smoke suite if the mechanic is genuinely new.

A curriculum-bound game (one mechanic + one or more skills + a content pack) declares `skillIds` and `contentPackId` on the registry entry, as above. A new binding of an existing mechanic (another snake pack, another fact drill) needs no new mechanic code: a pack, a config in that mechanic's `config.ts` and in `GAME_CONFIG`, and one more `register` call in its `register.ts`; it shares its mechanic's picture. A new menu entry, a game of its own, needs its own `Picture.tsx`.

### Adding a locale

See [`src/i18n/README.md`](src/i18n/README.md).

## Performance

Practical defaults, not premature optimization:

- `React.memo` / `useCallback` / `useMemo` used where profiling showed real wins (game views, heavy animated components).
- No route splitting: the app ships as one JS chunk, about 816 kB minified and 239 kB gzipped (`npm run build`, 2026-10-02). Vite warns on chunks over 500 kB minified, so every build prints that warning.

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

- **Growth model no longer rewards wrong answers.** Math apples are now challenge triggers, not food: `moveMathSnake` does not grow the snake on math-apple consumption. `resolveMathSnakeAnswer` is the only growth source for math interactions — correct answer +2 segments, wrong answer 0 (and a round life). Net per math apple: +2 if right, 0 if wrong. No more "farming" length by guessing.
- **End-of-session summary added.** `SnakeSessionSummary` (rendered by `GameResultScreen` for any `*_snake` game-over state) shows max length, accuracy, best in-session streak, and the top 3 hardest facts (most wrong attempts). Per-fact tracking lives in `playSessionStore.snakeSessionStats.factHistory` and is the precursor to the Phase 1 mastery tracker.
- **Theme-aware snake palette.** `VisualTheme.snakePalette: 'emerald' | 'teal' | 'orange' | 'pink' | 'indigo' | 'purple'` drives head, body (alternating), tail, glow ring, and `+N` text colour via the `SNAKE_PALETTES` token table in `MathSnakeView`. Each of the six snake bindings now picks its own family (additsioon → emerald, suur liitmine → teal, lahutamine → orange, suur lahutamine → pink, korrutus → indigo, suur korrutus → purple).
- **In-session progression.** Grid starts at `SNAKE_MIN_GRID_SIZE` (7) and expands by one every `SNAKE_STREAK_MILESTONE` (5) correct answers, capped at `SNAKE_MAX_GRID_SIZE` (10). `expandSnakeGrid` is invoked from `useAnswerHandler` after a correct snake answer when the new streak hits the milestone. Speed remains one-step-per-input (no autoadvance) — kid-friendly.
- **Walls now kill (no wraparound).** `moveMathSnake` returns `collision: true` when the next head leaves the grid; `wrapPosition` removed. Solves the unfair "tail appears from nowhere" case that touch input made worse.
- **`+N` overlay shows actual delta.** `MathSnakeView` captures the snake-length delta on growth and renders `+1` for normal apple, `+2` for correct math answer (was hardcoded `+1`).

### Open (low) — polish

- **Menu crowding after 6 snake cards.** Resolved: the six snake bindings share one mechanic card (`Numbrimadu`, 6 harjutust) that opens the pack picker, and the menu shows it as one row or tile with the snake picture.
- **Accessibility.** No ARIA labels for snake segments, apple state, or modal. Screen readers cannot announce gameplay. Keyboard-only works (arrow + WASD); no alternate input for users who can't use keyboard.
- **`MathSnakeProblem.specs` on the problem state.** Same reference duplicated into every generated problem. Acceptable (session store is in-memory) but cleaner to resolve from pack registry via binding id at challenge time.

### v2 opportunities — would materially lift the game

- **Per-fact mastery tracking (persistent).** Slice 3c added a session-scoped mini-version (`snakeSessionStats.factHistory` → top-3 hardest in summary). The full Phase 1 mastery tracker promotes that across sessions: persist `SkillMastery` per fact, weight the generator toward weak facts, surface a mastery grid ("25 squares, X green, Y yellow, Z red"). Fits ADR-0002.
- **Score model measures exploration, not math performance.** High score = how many normal apples eaten. "Got 8/10 multiplication facts right" is now in the session summary but not promoted into a persistent leaderboard.
- **Daily challenge pack.** Every day, a generated "daily practice" picks 10 weakest facts across all packs, presents as a sub-challenge. Drives return visits without requiring a backend.
- **Bonus apple at streak milestones.** Slice 3c grows the grid every 5-correct; layering a one-shot bonus apple (or shimmer effect) on the same milestone would make the variable-reward loop more visible.

## Deployment

Three workflows in `.github/workflows/`:

- **`ci.yml`**: quality gate on push to `main` and on PRs: lint, dead-code check, typecheck, format check, unit tests with coverage, build, and a separate Playwright E2E job. PRs also get dependency review.
- **`codeql.yml`**: CodeQL analysis on push to `main`, on PRs and weekly (see [ADR-0003](docs/decisions/0003-codeql-insecure-randomness.md)).
- **`deploy.yml`**: on push to `main` or `workflow_dispatch`, on a self-hosted runner on the homelab VM: lint, typecheck and unit tests, then build and `cp -r dist/* /srv/data/games/study/` into the directory nginx serves as `games.khe.ee/study/`. It does not wait for CI.

The build also holds the web app manifest and the service worker that make the app installable and playable offline ([estate ADR-041](https://github.com/khelias/khe-architecture/blob/main/decisions/041-installed-apps-stay-on-their-paths-with-a-worker-each.md)); `AGENTS.md` "Installed app" has how it updates and how to withdraw it.

There is no runtime backend today; Phase 2 adds one per ROADMAP §4.

## Where this document stops

What this document **does not** cover:

- Phased implementation plan and sequencing → [`ROADMAP.md`](ROADMAP.md).
- Target domain model (bounded contexts) and learner identity → [`docs/decisions/0001-bounded-contexts.md`](docs/decisions/0001-bounded-contexts.md), [`docs/decisions/0002-learner-profile.md`](docs/decisions/0002-learner-profile.md).
- Module-level specifics → [`src/i18n/README.md`](src/i18n/README.md), [`docs/shared-components.md`](docs/shared-components.md).

When this document and an ADR disagree, the ADR wins.
