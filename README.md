# Smart Games

[![CI](https://github.com/khelias/khe-study/actions/workflows/ci.yml/badge.svg)](https://github.com/khelias/khe-study/actions/workflows/ci.yml)
[![CodeQL](https://github.com/khelias/khe-study/actions/workflows/codeql.yml/badge.svg)](https://github.com/khelias/khe-study/actions/workflows/codeql.yml)
[![Deploy](https://github.com/khelias/khe-study/actions/workflows/deploy.yml/badge.svg)](https://github.com/khelias/khe-study/actions/workflows/deploy.yml)

Learning platform built around the idea that a single engine can serve both a 7-year-old practicing multiplication and an adult practicing Estonian river names — one codebase, one account model, two UX registers. Today the catalog is ~24 small games in Estonian curriculum areas (reading, math, logic, memory) with two-axis adaptive difficulty (per-mechanic + per-skill). The next milestones are adding a backend, activating the adult UX register, and completing the remaining bounded-context moves. See [`ROADMAP.md`](./ROADMAP.md) for phases and scope; see [`ARCHITECTURE.md`](./ARCHITECTURE.md) for current structure; see [`docs/adr/`](./docs/adr/) for the bounded-context and learner-profile decisions.

Live at [games.khe.ee/study/](https://games.khe.ee/study/).

## Contents

- [Games](#games)
- [Running locally](#running-locally)
- [Testing & quality gates](#testing--quality-gates)
- [Deployment](#deployment)
- [Internationalization](#internationalization)
- [Further reading](#further-reading)

## Games

The platform ships ~24 games across four categories. Each game is registered declaratively in `src/games/registrations.ts`. Content packs and skill taxonomy live in `src/curriculum/` (ADR-0001 Curriculum context); the binding ties a generator to one or more skills + an optional content pack.

| Category     | Games                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **Language** | Word Master, Word Cascade, Syllable Master, Sentence Detective, Letter Detective                         |
| **Math**     | Math Snake (×6), Fact Sprint (×8), Unit Conversion, Size Compare, Balance Scale, Clock Game, BattleLearn |
| **Logic**    | Pattern Train, Robo Path, Star Mapper, Shape Shift, Shape Dash                                           |
| **Memory**   | Math Memory, Picture Pairs                                                                               |

Multi-learner on one device is supported via `gameStore.learners[]` + `activeLearnerId`. The Settings menu has a learner switcher (add / switch / remove). Device-level state (achievements, stars, hearts) is currently shared across learners; per-learner split is deferred until product calls for it.

### Adaptive difficulty

Two axes (ADR-0002, completed migration):

- **Mechanic difficulty** (TASE badge, level-up rules) lives on `LearnerProfile.mechanicPreference[mechanicId].difficulty`. Adjustable via the level selector, bumped by `recordLevelUp`. One mechanic, many skills.
- **Skill challenge** (problem selection) lives on `LearnerProfile.skillMastery[skillId]`. `rollingStats` drives adaptive nudging; for closed-set skills like multiplication facts, `factsKnown` powers a 70% weakest / 30% retention picker (`pickWeakestFact`).

The legacy nudge rules still apply on top of mechanic difficulty:

- **Harder:** accuracy > 80% **and** ≥ 3 consecutive correct → effective level rises.
- **Easier:** accuracy < 50% **or** ≥ 3 consecutive wrong → effective level falls.

### Progression & economy

- **Levels** are performance-earned, never purchased. Level-up requires correct answers + 80%+ accuracy; requirements scale (5 → 7 → 10 → 12 → 15+).
- **Stars** are awarded on level-up (1–3 base, scaled by level up to 2.5×, plus perfect-clear bonus). They are spent on hearts (10 stars = 1 heart, max 5).
- **Hearts** are a global resource; wrong answers cost one; zero hearts ends the session.
- **Achievements** are cosmetic unlocks tracked in `src/engine/achievements.ts`.

All state persists in LocalStorage via `gameStore`, which uses an explicit
Zustand persist version and migrates legacy payloads for stars, hearts, levels,
and favourite games. Per-session state (problem, score, level progress,
notifications) lives in `playSessionStore`. Neither syncs across devices yet —
Phase 2 work.

## Running locally

Requires **Node.js 24+** and **npm**.

```bash
git clone <your-fork-url>
cd khe-study
npm install
npm run dev       # http://localhost:5173
```

Production build:

```bash
npm run build     # output: dist/
npm run preview   # serve dist/ locally
```

## Testing & quality gates

The quality gate is enforced in [`.github/workflows/ci.yml`](.github/workflows/ci.yml): lint, dead-code check, typecheck, format check, unit tests with core coverage thresholds, build, and a separate Playwright E2E job. Every commit to `main` must pass all of these.

| Command                 | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `npm run lint`          | ESLint 9 + typescript-eslint                                                |
| `npm run lint:dead`     | Knip unused file/dependency check with intentional scaffolding allowlist    |
| `npm run typecheck`     | `tsc --noEmit` (strict mode, `noUncheckedIndexedAccess`, no implicit `any`) |
| `npm run format:check`  | Prettier check (run `npm run format` to write)                              |
| `npm run test`          | Vitest in watch mode                                                        |
| `npm run test:run`      | Vitest once                                                                 |
| `npm run test:coverage` | Vitest with V8 coverage, used in CI for core engine/state/data services     |
| `npm run test:e2e`      | Playwright E2E (headless Chromium)                                          |
| `npm run test:e2e:ui`   | Playwright interactive UI mode                                              |
| `npm run build`         | Vite production build                                                       |

Coverage thresholds are baseline floors for `src/engine`, `src/stores`, `src/games`, `src/curriculum`, and `src/services/persistence`; broad UI shells are covered by focused component tests and Playwright instead of the global unit coverage percentage. Playwright smoke suite covers menu load, game navigation, vocabulary game flows in both locales, and a per-binding render smoke that fails on `console.error` or page exceptions. The E2E suite is the refactor safety net required by ROADMAP Phase 0.

## Deployment

GitHub Actions deploys `main` to `games.khe.ee/study/` via a self-hosted runner on the homelab VM ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)): build on the runner, then `cp -r dist/* /srv/data/games/study/` into the directory the khe-homelab nginx container already serves. No runtime server component today. Backend + sync is ROADMAP Phase 2.

## Internationalization

Two locales ship: Estonian (default) and English. See [`src/i18n/README.md`](src/i18n/README.md) for the type-safe translation system. All user-facing strings go through `useTranslation`; direct literals in JSX are a lint-adjacent smell.

## Further reading

- [`ROADMAP.md`](./ROADMAP.md) — living product & technical roadmap (phases, non-goals, open decisions).
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — current code structure; bounded-context target in [`docs/adr/0001-bounded-contexts.md`](docs/adr/0001-bounded-contexts.md).
- [`docs/adr/`](./docs/adr/) — Architecture Decision Records.
- [`docs/shared-components.md`](./docs/shared-components.md) — cookbook for `GameProblemModal` and `GameStatsBar`.
- [`src/i18n/README.md`](src/i18n/README.md), [`src/monetization/README.md`](src/monetization/README.md) — module-level docs.
