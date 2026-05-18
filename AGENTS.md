# khe-study

Smart Games. Educational game platform with 18 small games for the Estonian
curriculum (reading, math, logic, memory). Adaptive difficulty, profile-based
visibility, stars/hearts/levels economy. Live at games.khe.ee/study/.

The project is mid-architecture: ADR-0001 (bounded contexts) and ADR-0002
(learner profile / per-skill mastery) are partially in flight. New code should
follow the ADR direction, not the older shape implied by some legacy modules.

## Tech stack

- React 19, TypeScript 6.0 (strict, `noUncheckedIndexedAccess`, no implicit `any`)
- Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite` plugin). Theme extends via `@theme` in `src/index.css`.
- Zustand 5 (`gameStore` for persistence, `playSessionStore` for session state)
- React Router 7
- Vitest + Testing Library + happy-dom
- Playwright (E2E)
- Knip (dead-code check), Prettier, ESLint 9 + typescript-eslint
- Lucide icons
- Node 24+

## Commands

- `npm run dev` / `build` / `preview`
- `npm run lint` / `lint:dead` / `typecheck` / `format` / `format:check`
- `npm run test` / `test:run` / `test:coverage`
- `npm run test:e2e` / `test:e2e:ui`

## Layout

```
src/
  engine/         pure business logic (RNG, scoring, progression, audio,
                  adaptiveDifficulty, answerHandler, achievements,
                  errorBoundary). NO UI code here.
  curriculum/     skill packs by domain (astronomy, geometry, language, math)
                  + skills definitions. ADR-0002 destination.
  learner/        learner-profile model (ADR-0002, in flight)
  games/          per-game data + generators
  features/       UI workflows (gameplay, menu, modals, routing)
  components/     shared UI atoms + gameViews/
  hooks/, utils/, types/, services/persistence/, diagnostics/
  i18n/           type-safe translation system
                  - useTranslation.tsx is the API. Don't add a competing i18n
                    library without an ADR - would invalidate the type-safe key system.
                  - locales/et.ts and locales/en.ts. Add keys to BOTH.
  stores/         Zustand stores (gameStore persistent, playSessionStore session)
  monetization/   future-proofing (currently all flags open/free)
docs/adr/         0001-bounded-contexts, 0002-learner-profile
```

## Architectural rules (HARD)

1. **Logic in `src/engine/`, NOT in components.** If a component contains
   non-trivial decision logic, extract it.
2. **No `any` in TypeScript.** Use strict interfaces in `src/types/`.
3. **All user-facing strings via `useTranslation`.** Never hardcode text in JSX.
4. **Add new keys to BOTH `et.ts` AND `en.ts`.** ET is default; EN must stay in sync.
5. **Custom i18n stays.** Don't add `i18next` or another i18n library
   without an ADR.
6. **Error Boundaries everywhere user-facing.** Friendly fallback, never a
   white screen. (`src/engine/errorBoundary.tsx`)
7. **Engine modules need test coverage.** Coverage thresholds enforced for
   `src/engine`, `src/stores`, `src/games`, `src/curriculum`,
   `src/services/persistence`.

## Architecture migration (in flight)

- ADR-0001 (bounded contexts): newer dirs (`curriculum/`, `learner/`,
  `services/`) reflect this. Older modules in `src/engine/` and `src/games/`
  may be reshaped.
- ADR-0002 (learner profile / per-skill mastery): replaces per-profile-per-
  game adaptive model with `SkillMastery`. Adult persona is the target.
- Don't fight either ADR when adding code. If unsure, ask.

## UI verification

For UI changes, verify interactively against the running Vite dev server
using `mcp__playwright__*` tools (navigate, click, snapshot, console messages).
Prefer this over `preview_*` snapshots - Playwright MCP gives real interaction,
console errors, and network requests in one place. Dev server serves the app
at `/study/` base path; navigate to `http://localhost:5173/study/` (or the
port `npm run dev` prints).

E2E suite under `e2e/` (`npm run test:e2e`) is the durable check; MCP browser
is for in-loop verification while iterating.

## Quality gate (CI on push to main)

```bash
npm run lint
npm run lint:dead
npm run typecheck
npm run format:check
npm run test:coverage
npm run build
npm run test:e2e
```

## Deployment

GH Actions self-hosted runner on homelab VM (`/home/khe/actions-runner`).
Push to main: build on runner, then `cp -r dist/* /srv/data/games/study/`. No
runtime server today. Backend + sync is ROADMAP Phase 2.

## Vite base path

App served at `/study/`, not root. `vite.config.ts` has `base: '/study/'` and
`BrowserRouter` uses `basename="/study"`. Don't break this when refactoring routing.
