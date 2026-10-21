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

The stack moves on its own schedule. Code shared with the other app repos
comes only as a versioned presentation package. The KHE site header is
`<SiteHeader>` from `@khelias/ui` (khe-ui), pinned exactly and never
automerged by Renovate
([estate ADR-014](https://github.com/khelias/khe-architecture/blob/main/decisions/014-shared-ui-packages.md)).
`src/components/StudySiteHeader.tsx` wires it to `getLocale`/`setLocale`;
the KHE family's light header values (khe-sites `DESIGN.md`) are the
`--khe-header-*` properties on `.site-header` in `src/index.css`, unlayered so
they beat the package defaults, with the `.ee` in the Tarkade Mängud green.
The menu's footer is `<SiteFooter>` from the same package
([estate ADR-017](https://github.com/khelias/khe-architecture/blob/main/decisions/017-shared-theme-toggle-and-footer.md)):
GitHub, LinkedIn, Privacy and the hosting line, with the strings in
`siteFooter` of `src/i18n/locales`; `src/index.css` places it and sets its
`--khe-footer-*` values to the family's light ones.
The look follows the KHE family layer
([estate ADR-018](https://github.com/khelias/khe-architecture/blob/main/decisions/018-rooms-menu-in-the-shared-header.md)):
Tarkade Mängud is a game inside the Games room, its header is the family
chrome with the rooms menu (Mängud current, the game's name after the slash,
the mark to the khe.ee front page) and the game keeps its own themes as
application content. Temporary difference: the app is light only, marked
`data-theme="light"` on `<html>` so the header's dots stay light, so it does
not yet follow a dark system setting as ADR-018 asks, and it shows no theme
toggle until it does; then it uses the shared header's toggle (estate
ADR-017). A dark theme, and a single
accent token, get their own plan.
The Phase 2 backend is TypeScript on Node
([estate ADR-009](https://github.com/khelias/khe-architecture/blob/main/decisions/009-backend-language-per-app.md)),
shipped as a CI-built image pinned in khe-homelab
([estate ADR-008](https://github.com/khelias/khe-architecture/blob/main/decisions/008-container-images.md));
an AI feature copies the adventure proxy's guard pattern rather than calling
a shared service
([estate ADR-003](https://github.com/khelias/khe-architecture/blob/main/decisions/003-adventure-proxy-stays-adventure-only.md)).
It follows the estate backend pattern
([estate ADR-004](https://github.com/khelias/khe-architecture/blob/main/decisions/004-app-backend-and-identity.md)): identity from the edge
JWT (Cloudflare Access), authorization in the app, one write path with a
revision log, its own Postgres with versioned migrations, and the
operational baseline (health endpoint, structured logs, a restore test
before anyone else's data).

Inter is self-hosted: woff2 files in `src/assets/fonts/`, `@font-face` in
`src/index.css`, the OFL in `public/fonts/`. The page makes no request to
Google. `vite build` writes `dist/third-party-licenses.md`.

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
  `factsKnown` for closed-set weakest-fact drilling
  (lifetime accuracy; `lastSeen` is stored but not read yet).
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
6. Per-game logic lives in the game's registry entry (`src/games/<mechanic>/register.ts`:
   config, problem hooks) or its folder, so adding a game needs no code outside
   `src/games/` beyond its problem type and locale strings.
   `src/games/__tests__/registryContract.test.ts` fails on a `case` label or a
   `===` / `!==` comparison naming a game id or problem type elsewhere, except in
   the files on its `COMPARISON_ALLOWLIST`.
7. The app is served at `/study/`: `base: '/study/'` in `vite.config.js` and
   `basename="/study"` on `BrowserRouter` in `src/main.tsx`. Routing refactors
   keep both. The dev server is at `http://localhost:5173/study/`.

## Deployment

Push to main runs lint, typecheck and unit tests on the self-hosted homelab
runner, then builds and copies `dist/` to `/srv/data/games/study/`; a failure
stops the deploy. Because of that runner, a fork PR's run is approved only
after reading its `.github/workflows/` diff
([estate ADR-006](https://github.com/khelias/khe-architecture/blob/main/decisions/006-branch-protection.md)).
E2E runs only in CI. No runtime server; backend and sync are ROADMAP
Phase 2.

What this repo publishes on `games.khe.ee/study/` is also copied hourly to
the Cloudflare edge fallback ([estate ADR-016](https://github.com/khelias/khe-architecture/blob/main/decisions/016-static-fallback-at-the-edge.md)), which serves it when the
homelab is down, so it must be fit for a third-party host.

Automated writers
([estate ADR-007](https://github.com/khelias/khe-architecture/blob/main/decisions/007-automated-writers.md)): Renovate
automerges npm patch and minor updates of stable packages, 0.x patches of
devDependencies, GitHub Actions minor and patch updates, digests, pins and
lock file maintenance (`renovate.json`), and every merge to `main` deploys.
The way back from a bad one is to revert its commit on `main` and push,
which redeploys the previous state. A new automated writer joins the
estate's writer register in khe-meta in the same change.
