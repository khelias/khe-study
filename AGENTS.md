# khe-study

Smart Games: small educational games for the Estonian curriculum (reading,
math, logic, memory) with two-axis adaptive difficulty (per-mechanic
difficulty, per-skill mastery), a stars/hearts/levels economy and several
learners on one device. Live at games.khe.ee/study/. `ARCHITECTURE.md` has
the detail; `ROADMAP.md` the phases.

## Stack

React 19, Vite 8, Tailwind v4 (theme via `@theme` in `src/index.css`),
Zustand 5, React Router 7, Vitest with happy-dom, Playwright, Knip, ESLint
with typescript-eslint. Node 24.

TypeScript is two packages on purpose: `@typescript/native` (TS 7) supplies
`tsc`, and `typescript` is aliased to `@typescript/typescript6` because
typescript-eslint does not support TS 7 yet. A plain Renovate bump of
`typescript` to 7 breaks lint. Strict, `noUncheckedIndexedAccess`.

## Commands

- `npm run dev` / `build` / `preview`
- `npm run lint` / `lint:dead` (Knip) / `typecheck` / `format:check`
- `npm run test:run` / `test:coverage` / `test:e2e`

CI runs lint, lint:dead, typecheck, format:check, test:coverage, build and
test:e2e. CodeQL is a separate, non-required workflow; its config excludes
`js/insecure-randomness` because every hit is the seeded `uid()` in
`src/engine/rng.ts` ([ADR-0003](docs/adr/0003-codeql-insecure-randomness.md)).
Do not widen that exclusion without an ADR.

## Layout

```
src/
  engine/       pure logic: RNG, scoring, progression, adaptive difficulty,
                answer handling, achievements, error boundary. No UI.
  curriculum/   skill packs by domain + skill definitions (ADR-0002)
  learner/      LearnerProfile, SkillMastery, MechanicPreference, FactStats
  meta/         meta-progression: theme catalog, purchase/apply rules (pure),
                themes/<id>/ theme data
  games/        per-game data, generators and the registry
  features/     UI workflows (gameplay, menu, modals, routing, theme)
  components/   shared UI atoms + gameViews/
  i18n/         type-safe translations: useTranslation.tsx, locales/et.ts, en.ts
  stores/       gameStore (persistent), playSessionStore (per play)
  monetization/ inert flag scaffolding, everything free
  hooks/ utils/ types/ services/persistence/ diagnostics/
docs/adr/       0001 bounded contexts, 0002 learner profile, 0003 CodeQL
e2e/            Playwright suite
```

## Themes

A theme is a folder `src/meta/themes/<id>/` with `theme.json` (id equal to
the folder name, `{ et, en }` name and description, tier, cost, palette) and
optional art named by `art`. No code change: the catalog picks it up through
`import.meta.glob`, and `src/meta/__tests__/themeCatalogData.test.ts` fails if
it is invalid or its background makes the app's text unreadable. Owned themes
are device-scoped (`gameStore.ownedThemeIds`); the applied one is per learner
(`preferences.theme`).

## Architecture

- ADR-0002 (learner profile, per-skill mastery) is done: `gameStore.learners[]`
  plus `activeLearnerId`; `getLevelForGame` reads
  `mechanicPreference[mechanicId].difficulty`; skill mastery owns
  `factsKnown` for closed-set spaced repetition. Legacy `ProfileType` and the
  `levels[profile][gameType]` matrix are gone.
- ADR-0001 (bounded contexts): Curriculum and Learner are live;
  Meta-progression has started (`src/meta/`, its state still in `gameStore`);
  PlaySession and Identity moves are still ahead. Work with both ADRs,
  and ask when a change seems to fight them.

## Rules

1. Non-trivial decision logic lives in `src/engine/` (gameplay) or
   `src/meta/` (economy, themes), not in components.
2. No `any`; shared interfaces go in `src/types/`, a context's own types in
   its `types.ts` (`src/curriculum/`, `src/learner/`, `src/meta/`).
3. Every user-facing string goes through `useTranslation`, and every new key
   goes into both `et.ts` (default) and `en.ts`. No i18next or other i18n
   library without an ADR: it would replace the type-safe key system.
4. User-facing screens sit under an error boundary
   (`src/engine/errorBoundary.tsx`): a friendly fallback, never a white screen.
5. `src/engine`, `src/stores`, `src/games`, `src/curriculum`, `src/meta` and
   `src/services/persistence` have enforced coverage thresholds, so new code
   there comes with tests.
6. The app is served at `/study/`: `base: '/study/'` in `vite.config.js` and
   `basename="/study"` on `BrowserRouter` in `src/main.tsx`. Routing refactors
   keep both. The dev server is at `http://localhost:5173/study/`.

## Deployment

Push to main builds on the self-hosted homelab runner and copies `dist/` to
`/srv/data/games/study/`. No runtime server; backend and sync are ROADMAP
Phase 2.
