# Full-game QA smoke prompt

Drop this entire file into a fresh Claude Code session (or any Playwright-MCP
capable agent) once you want a hands-on QA pass over every game in the
platform. Currently most-pointed at the LearnerProfile migration (Phase 0
through Phase 6), which is the freshest and biggest risk surface; expand the
"Phase-specific spot checks" section when a new migration lands.

References: [ADR-0001](../adr/0001-bounded-contexts.md),
[ADR-0002](../adr/0002-learner-profile.md), [ROADMAP §7](../../ROADMAP.md)
change log for what shipped recently.

The result of one such pass belongs under `docs/qa/YYYY-MM-DD-<title>.md`
alongside the existing QA baselines.

---

## Paste from here

You're running a post-migration smoke pass on khe-study using Playwright MCP.

## Why this matters

The LearnerProfile migration replaced the legacy
`ProfileType: 'starter' | 'advanced'` + `gameStore.levels[profile][gameType]`
model with `LearnerProfile + SkillMastery + MechanicPreference + learners[]`
across seven phases (0, 1, 2, 3, 3.5, 4, 5, 6). The unit suite (~549 tests) is
green and we have one targeted browser smoke for the Phase 6 learner switcher,
but no one has played each game end-to-end since the second half of the
migration landed. The whole shape of risk here is **silent regressions** — a
generator that no longer crashes still might read the wrong axis, return
level 1, lose a variant, or miss a skill-mastery write. Unit tests don't catch
that; only playing does.

Read the source of truth before assuming anything:

- `src/learner/types.ts` — `LearnerProfile`, `SkillMastery`,
  `MechanicPreference`, `FactStats`.
- `src/stores/gameStore.ts` — persistence shape, version migrations,
  `commitActiveLearner`, learner CRUD actions.
- `src/games/data.ts` — `GAME_CONFIG`, `MECHANICS`, `getMechanicIdForGame`.
- `src/types/game.ts` — `GeneratorContext` shape (includes
  `skillChallenge.factsKnown`).
- `src/hooks/useGameEngine.ts` — how the generator context is assembled per
  game tick.

## What the migration did, phase by phase

| Phase | Persist | Change                                                                                                                                                                                                                                                                                                                   |
| ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0     | —       | Skill mapping audit only.                                                                                                                                                                                                                                                                                                |
| 1     | v3→v4   | Added `recordSkillAttempt` (rolling stats). Seeded `skillMastery[skillId].level` from legacy `levels[profile][gameType]` via `Math.max`.                                                                                                                                                                                 |
| 2     | (same)  | Flipped reads: `getLevelForGame` reads `skillMastery` first; legacy `levels` becomes mirror.                                                                                                                                                                                                                             |
| 3     | v4→v5   | Removed `gameStore.profile` + `setProfile`. Flattened `levels[profile][gameType]` → `levels[gameType]` (max across starter+advanced wins).                                                                                                                                                                               |
| 3.5   | —       | Removed `PROFILES`, `ProfileType`, `allowedProfiles`, generator `profile` parameter. Packs that branched on profile rewritten to flat level-stage lists.                                                                                                                                                                 |
| 4     | v5→v6   | Dropped the legacy `levels` cache entirely. Learner is the only source for level reads.                                                                                                                                                                                                                                  |
| 5     | v6→v7   | Added `LearnerProfile.mechanicPreference: Record<mechanicId, {difficulty, variant?, lastUpdatedAt}>`. Seeded from skill levels grouped by mechanic, max wins ties. Slices a–f:                                                                                                                                           |
|       |         | • 5a: added field + migration                                                                                                                                                                                                                                                                                            |
|       |         | • 5b: dual-write to mechanic axis on level up                                                                                                                                                                                                                                                                            |
|       |         | • 5c: `pickWeakestFact(pool, factsKnown, rng)` — 70% weakest / 30% retention for closed-set skills (multiplication 1-5, fact drills, etc.)                                                                                                                                                                               |
|       |         | • 5d: Picture Pairs variant via `mechanicPreference.picture_pairs.variant`; default by `ageHint < 5 ? 'emoji_only' : 'emoji_word'`                                                                                                                                                                                       |
|       |         | • 5e: extended `GeneratorContext` with `skillChallenge?: { factsKnown? }` (Option B — no signature break)                                                                                                                                                                                                                |
|       |         | • 5f: flipped `getLevelForGame` to read only `mechanicPreference.difficulty` (default 1); skill mastery now owns only `factsKnown`                                                                                                                                                                                       |
| 6     | v7→v8   | `gameStore.learners[]` + `activeLearnerId`; `activeLearnerProfile` is a derived mirror kept in sync by `commitActiveLearner`. `addLearner`, `removeLearner`, `setActiveLearner` actions. Settings menu learner switcher. Device-level state (inventory, achievements, stars) intentionally still shared across learners. |

Net effect on the data path:

```
                 Phase 6 store
gameStore.learners[]  →  activeLearnerId  →  activeLearnerProfile
                                              ├── skillMastery[skillId]
                                              │   ├── level   (legacy, unused after 5f)
                                              │   ├── rollingStats
                                              │   └── factsKnown          ← skill challenge axis
                                              ├── mechanicPreference[mechId]
                                              │   ├── difficulty           ← mechanic axis (NEW)
                                              │   └── variant?
                                              ├── ageHint?
                                              └── persona
```

## Concrete risks to hunt

Each item below is a specific failure mode the unit tests cannot catch.

1. **Level-1 regression.** `getMechanicIdForGame(gameType)` resolves the wrong
   mechanic, so `mechanicPreference[mechanicId]` is `undefined`, so the game
   always opens at level 1 even when migration should have seeded a higher
   level. Verify by seeding a v6 payload with `skillMastery[X].level = 7`
   on a known skill (e.g. `math.multiplication_1_to_10`), letting v6→v7
   migrate, and confirming the matching games (`multiplication_snake`,
   `multiplication_fact_drill_1_10`) open at level 7. Equivalent risk for the
   v4→v5 flatten step on hand-crafted v4 payloads.
2. **Skill sharing visibility.** Several games share one skill (e.g.
   `LANGUAGE_VOCABULARY_SKILL` is used by `word_builder`, `word_cascade`,
   `picture_pairs`, `letter_match`). After Phase 2, levelling up in one should
   show through in the others — but only as long as those games share the
   same mechanic too. Since Phase 5f reads mechanicPreference not skillMastery,
   skill-shared but mechanic-distinct games no longer share level. Confirm
   this is the intended behaviour (it is — the level axis is mechanic-scoped).
   What you're actually checking is that no game crashes when its mechanic
   pref is empty.
3. **Picture Pairs variant.** `effectiveVariant = preference?.variant ??
(ageHint < 5 ? 'emoji_only' : 'emoji_word')`. Default after Phase 5d is
   `emoji_word` (card shows emoji + word) — this is a behaviour change from
   the historical "emoji only" status quo. Toggle in Settings (visible only
   inside the `picture_pairs` game) must persist and flip the card content
   instantly.
4. **Closed-set spaced repetition.** When
   `skillMastery[skillId].factsKnown` is non-empty AND the skill is closed-set
   (multiplication 1-5/1-10, division 1-5/1-10, fact drills, sub_missing,
   etc. — see `isClosedSetSkill`), the next fact picker is 70% weakest /
   30% random. Visual sanity only: confirm the game keeps generating valid
   problems and doesn't softlock if `factsKnown` is empty, sparse, or
   saturated. Check by playing 10+ Fact Sprint rounds and watching the
   problem stream.
5. **Math Snake family (6 bindings).** `addition_snake`,
   `addition_big_snake`, `subtraction_snake`, `subtraction_big_snake`,
   `multiplication_snake`, `multiplication_big_snake` share one engine. If
   one breaks, all six likely do. Each must accept a movement input,
   intercept an answer, and grow on correct (+2 cells per spec from Slice 3c).
6. **Fact Sprint family (8 bindings).** Timed continuous mode under one
   `FAKTISPRINT` menu card. `sessionMode: 'continuous'` should skip mid-
   session level-up and suppress the level-progress HUD. Wrong-answer feedback
   should show the correct answer.
7. **Multi-learner isolation.** Adding a second learner ("Test"), playing one
   round in any game that bumps a level, switching back to the default
   learner ("Learner"), and confirming that Test's mechanic preference did
   not leak into Learner's. Check by reading
   `state.learners[*].mechanicPreference` in localStorage.
8. **Generator context shape.** Every generator should receive
   `{ level, learner, context }` where `context.skillChallenge?.factsKnown`
   may be present. A generator that destructures the old `profile` parameter
   crashes immediately on load. A generator that ignores `context` quietly
   produces wrong content for closed-set skills.
9. **Migration chain v3→v8.** All four migrators must run in order on a
   stale localStorage payload. The most fragile step historically was v5
   flatten, where partial `stats` objects (missing `gamesByType`) crashed
   `recordGameStart`. If you hand-craft test fixtures, make sure they pass
   through the whole chain without throwing.
10. **Console must stay clean.** Any uncaught error, unhandled rejection, or
    React warning fails the game. Past QA passes (2026-04-27) used this same
    standard.

## How to run it

1. The Playwright MCP tools are `mcp__playwright__browser_*`. Use
   `browser_navigate`, `browser_snapshot` (preferred over screenshot for
   verifying text), `browser_click`, `browser_evaluate`,
   `browser_console_messages`.
2. App base path is `/study/`. Game routes are `/study/games/:slug` where
   slug derives from `gameType` via `src/utils/gameSlug.ts` (kebab-case,
   e.g. `addition_snake` → `addition-snake`).
3. If a Vite dev server is already running on a port like 5173 / 5174 /
   5180, reuse it. Otherwise start one:
   `cd /Users/KaidoHenrik.Elias/Projects/khe/khe-study && npm run dev`
   in the background, wait for the printed URL.
4. The full game list is in `GAME_CONFIG` in `src/games/data.ts`
   (~24 entries). Enumerate them programmatically from the source file, not
   from memory.
5. Locale defaults to Estonian. Switch to English from the header if needed
   (`button[aria-label="Language"]` → "EN" pill) — some test assertions are
   easier in English, but the menu chrome is fully localized so either is
   fine.

## Per-game protocol

For each `gameType` in `GAME_CONFIG`:

1. Navigate to `/study/<slug>` where slug = `gameSlugFromType(gameType)`.
2. Wait for the game surface to render (not the loading state, not the
   error boundary). Use `browser_snapshot` to confirm a game-specific element
   is present.
3. Capture the initial level shown in the HUD if any (`LEVEL N` chip on the
   right). For continuous-mode games (Fact Sprint family), this is hidden;
   read `state.activeLearnerProfile.mechanicPreference[mechanicId]?.difficulty`
   from localStorage instead.
4. Do ONE real interaction. Pick whichever fits:
   - **Numpad/keyboard answer**: Fact Sprint family, Math Snake family,
     Balance Scale, Unit Conversion (when numeric).
   - **Click an answer card**: Compare Sizes, Time Match, Picture Pairs
     (after the peek), Letter Match, Word Builder, Word Cascade, Sentence
     Logic, Memory Math.
   - **Drag/drop**: Shape Shift (existing QA hooks are stable per Slice 3
     bugfix).
   - **Tap to start + jump**: Shape Dash.
   - **Click cell**: BattleLearn, Robo Path, Star Mapper.
5. Confirm:
   - No console error or React warning since navigation
     (`browser_console_messages` with the appropriate filter).
   - Score / streak / hearts updates plausibly (or the HUD shows
     game-specific feedback like Fact Sprint's "Õige vastus oli N" on miss).
   - Returning to menu via the Home control or the settings → "Return to
     menu" path doesn't crash.
6. Record per-game result (see "What to report").

## Phase-specific spot checks (do once each, not per-game)

After the basic 24-game pass, run these focused checks. Each one targets a
specific failure mode that the basic per-game pass cannot expose.

- **Picture Pairs variant default.** Fresh state (clear localStorage, accept
  the welcome screen). Open `picture_pairs`. Verify cards show emoji + word
  by default (this is Phase 5d's new default — previously emoji-only).
- **Picture Pairs variant toggle persistence.** While inside `picture_pairs`,
  open Settings, flip variant `emoji_word` → `emoji_only`, confirm cards
  re-render without word text and that
  `state.activeLearnerProfile.mechanicPreference.picture_pairs.variant`
  flipped in localStorage. Reload the page, confirm the variant survives.
- **Multi-learner isolation.** Settings → learner switcher → "Add a new
  learner" → name "Test". Switch to Test. Play one round in any game that
  records level-up (easiest: Balance Scale until level up triggers). Switch
  back to "Learner". Confirm
  `state.learners[<learner id>].mechanicPreference` ≠
  `state.learners[<test id>].mechanicPreference`. Confirm
  `state.activeLearnerProfile.mechanicPreference` matches the currently
  selected learner.
- **v5 → v6 → v7 → v8 migration chain.** Clear localStorage. Then seed it
  with a v5 payload (write `version: 5` JSON; cribbing from
  `src/stores/gameStore.ts` migration handler keeps you honest about the
  exact shape). Reload, confirm `localStorage.getItem('smart_adv_v45_pro')`
  now reads `version: 8` and the data was carried forward correctly. The
  riskiest step is v5→v6 which drops the legacy `levels` map.
- **Migration with non-trivial skill mastery.** Seed a v6 payload with
  `skillMastery['math.multiplication_1_to_10'].level: 7`, reload, open
  `multiplication_snake`, confirm it opens at level 7 (or as close as the
  level-up rules allow). The mechanic-pref seed step lives at
  `src/stores/gameStore.ts` `seedMechanicPreferenceFromSkillMastery`.
- **Generator crash check.** While the menu is open, browse to each game
  category and tap every binding's mechanic card. Confirm the pack picker
  modal (where applicable) shows the right bindings with the right per-
  binding levels — if a generator crashed silently before navigation,
  you'll see a wrong level here.

## Seeding state from the browser

Use `mcp__playwright__browser_evaluate` to read/write `localStorage`
directly. The store key is `smart_adv_v45_pro`.

Read current state:

```js
JSON.parse(localStorage.getItem('smart_adv_v45_pro') ?? 'null');
```

Force a specific persist version on the next reload by overwriting
`localStorage` then calling `location.reload()`. Use the smallest possible
payload — Zustand's persist middleware fills defaults. The full state shape
is documented by `INITIAL_STATE` in `src/stores/gameStore.ts`.

Example: seed Mari as a second learner with level 5 in
`multiplication_snake`:

```js
localStorage.setItem(
  'smart_adv_v45_pro',
  JSON.stringify({
    version: 8,
    state: {
      learners: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          displayName: 'Learner',
          persona: 'kid',
          skillMastery: {},
          mechanicPreference: {},
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          displayName: 'Mari',
          persona: 'kid',
          skillMastery: {},
          mechanicPreference: {
            math_snake: { mechanicId: 'math_snake', difficulty: 5, lastUpdatedAt: Date.now() },
          },
        },
      ],
      activeLearnerId: '00000000-0000-0000-0000-000000000002',
    },
  }),
);
location.reload();
```

For migration tests, write `version: 5/6/7` with the older shape and the
runtime migrators will fire on reload. Read `gameStore.ts` for the canonical
older shapes — do NOT guess them.

## What to report

Write the result to `docs/qa/YYYY-MM-DD-post-migration-smoke.md` with this
structure:

1. **Environment block.** Date, dev server URL, browser MCP version,
   Playwright build, locale used.
2. **Per-game table.** One row per gameType:
   `gameType | slug | level seen | interaction | console errors | pass/fail | note`.
3. **Phase-specific check results.** One bullet per focused check above,
   pass/fail with the concrete observation.
4. **Three-paragraph net summary.**
   - Result: N pass / M fail, top 3 failure modes if any.
   - Whether the level-1 regression risk fired anywhere.
   - Whether the migration chain survived end-to-end.

Copy console errors verbatim, not paraphrased. If a game produced a stack
trace, paste the first 10 lines.

## Don't

- Don't change source code. This is observation only. File issues as
  findings, don't fix in this session.
- Don't run the unit suite — that's already green. The whole point of this
  pass is to catch what the unit suite can't.
- Don't skip games because they "should be fine" — silent regressions are
  exactly the failure mode this is hunting.
- Don't seed localStorage with a payload you didn't read against
  `gameStore.ts` first.
