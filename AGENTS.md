# khe-study

Workspace-wide rules (push, review, docs, estate ADRs) are in [khe-workspace
`AGENTS.md`](https://github.com/khelias/khe-workspace/blob/main/AGENTS.md).

Smart Games: small educational games for the Estonian curriculum (reading,
math, logic, memory) with two-axis adaptive difficulty (per-mechanic
difficulty, per-skill mastery), rounds with three lives of their own, stars
and levels, and several learners on one device. Live at games.khe.ee/study/. `ARCHITECTURE.md` has
the detail; `ROADMAP.md` the phases.

## Stack

React 19, Vite 8, Tailwind v4 (theme via `@theme` in `src/index.css`),
Zustand 5, React Router 7, Vitest with happy-dom, Playwright, Knip, ESLint
with typescript-eslint, and three.js (pinned exactly) for the star game's sky
only. Node 26 (`.nvmrc`).

The stack moves on its own schedule. Code shared with the other app repos
comes only as a versioned presentation package. The KHE site header is
`<SiteHeader>` from `@khelias/ui` (khe-ui), pinned exactly and never
automerged by Renovate
([estate ADR-014](https://github.com/khelias/khe-architecture/blob/main/decisions/014-shared-ui-packages.md)).
`src/components/StudySiteHeader.tsx` wires it to `getLocale`/`setLocale`
and passes the shared theme toggle from `useThemeOverride`
([estate ADR-014](https://github.com/khelias/khe-architecture/blob/main/decisions/014-shared-ui-packages.md) point 7).
The KHE family's values (khe-sites `DESIGN.md`), light and dark, are custom
properties in `src/index.css` (`--paper`, `--ink`, `--rule`, `--study` and the
rest): light on `:root`, dark under `prefers-color-scheme: dark` and again
under `[data-theme="dark"]`, the two dark blocks kept equal by
`src/__tests__/designTokens.test.ts`
([ADR 0004](docs/decisions/0004-dark-theme-and-light-stage.md), estate ADR-035
point 2). They are exposed to Tailwind through `@theme inline` (`bg-paper`,
`text-ink`, `border-rule`), and the header's `--khe-header-*`
properties on `.site-header` read them, unlayered so they beat the package
defaults, with the `.ee` in the Tarkade mängud green. The theme choice is
stored under `khe-theme`, the games hub's key on the same origin, so a choice
made on the hub carries in; `src/theme/themeHead.ts` puts the first-paint
script into `<head>`. Each shop theme has a light and a dark
ground (`palette.background`, `palette.backgroundDark`).
The menu's footer is `<SiteFooter>` from the same package
([estate ADR-014](https://github.com/khelias/khe-architecture/blob/main/decisions/014-shared-ui-packages.md) point 7):
GitHub, LinkedIn, Privacy and the hosting line, with the strings in
`siteFooter` of `src/i18n/locales`; `src/index.css` places it and sets its
`--khe-footer-*` values to the family tokens.
The analytics consent banner is khe-sites', loaded unstamped from the
games.khe.ee root (`/assets/analytics-consent.js` in `index.html`, kept
out of the bundle by `vite-ignore`), proxied to games.khe.ee by the dev
server and stubbed by `e2e/fixtures.ts`, which ESLint makes every
Playwright spec import
([estate ADR-019](https://github.com/khelias/khe-architecture/blob/main/decisions/019-consent-banner-from-the-origin-root.md)).
The look follows the KHE family layer
([estate ADR-035](https://github.com/khelias/khe-architecture/blob/main/decisions/035-family-shell-and-design-check-with-its-exceptions.md)):
Tarkade mängud is a game inside the Games room, its header is the family
chrome with the rooms menu (Mängud current, the game's name after the slash,
the mark to the khe.ee front page), its `.ee` and footer focus in the
family's `study` green. That frame shows only to a visitor who came from
khe.ee or the games hub. Opened directly or installed, the app shows the
product view: its own name, the theme toggle and the language switcher, with
a KHE.ee link in the menu's footer
([estate ADR-035](https://github.com/khelias/khe-architecture/blob/main/decisions/035-family-shell-and-design-check-with-its-exceptions.md) point 11).
`src/theme/themeHead.ts` puts the script that decides into `<head>`.
Everything below the header is the game's content and off the family rule
(estate ADR-035 point 13): its look is decided here and in `docs/decisions/`. It
still uses the family values today: the menu, dialogs,
notifications, the header bar and the result screen sit on `paper` with
Familjen Grotesk titles and headings (`fam-title`, `fam-heading`), lists as rows over
`rule` hairlines, one filled button per view (`fam-btn-primary`, ink on paper) and outlined ones
(`fam-btn`), and dialogs, menus and toasts as the one floating layer
(`fam-float` over `fam-scrim`); these classes live in `src/index.css`. `study`
is the app's one accent, used for focus and the header's `.ee`; `ok`, `bad`,
`star` and `heart` are its state colours, each naming a state, never an
accent. Chrome strings carry no emoji or capitals; a star cost renders the
lucide star beside the number. The game picker shows each menu entry
with a drawn picture of its play area: rows with the picture in a `sunken`
well on phone, and on desktop (768px and up, chosen with `useMediaQuery`)
subject pills (`fam-chip`) over a grid of tiles on `study` at 10%, the
room's one accent rather than a colour per game. A picture is
`src/games/<folder>/Picture.tsx` on the token colours, collected in
`src/games/menuPictures.ts` by menu entry (a game, or its mechanic's card),
and `src/games/__tests__/menuPictures.test.ts` fails on a missing one.
The games' play areas keep their own light look within the check's baseline
until each moves to the tokens: the game screen's play container is a
`light-stage`, which carries the light values and in dark shows as a light
panel inside the dark shell, and a shell part a game renders on the stage
(the result screen, `AppModal`, `TipButton`) carries `theme-shell` to take the
theme back ([ADR 0004](docs/decisions/0004-dark-theme-and-light-stage.md)).
`npm run lint` ends
with `khe-design-lint` (estate ADR-035 point 8; usage in khe-ui `AGENTS.md`),
against `khe-design-lint-baseline.json`. The content being off the family
rule does not take it out of the check: the check reads all of `src/`, the
baseline only shrinks, and a departure this repo decides on takes an opt-out
line with its reason.
`khe-design-lint.json` names the curriculum, the achievements (whose emoji
are badge pictures) and the shop themes as content, exempt from the emoji,
palette and dash rules.
One game takes the whole screen under the header with its own night-sky look:
star_mapper (Tähistaevas) declares `GameConfig.stage: 'immersive'`, so
`GameScreenView` gives it the full height without the `light-stage`
([ADR 0007](docs/decisions/0007-immersive-play-area-and-webgl.md)). Its WebGL sky is
`src/games/starMapper/sky/SkyRenderer.ts`, the only module that imports
`three` or the full star catalogue, loaded by `import()` so neither is in the
entry bundle; its colours sit in `.sky-stage` in `src/index.css` with their
design-lint opt-outs. The sky data under `src/games/starMapper/sky/data/` is
cut from d3-celestial at a pinned commit by `node scripts/build-sky-data.mjs`;
rerun it rather than editing the JSON. A constellation's folk names and story
in the locales need a source in
`src/curriculum/packs/astronomy/folkSources.ts`, which `packs.test.ts` checks.
The Phase 2 backend is TypeScript on Node
([ADR 0006](docs/decisions/0006-backend-in-typescript-on-node.md)),
shipped as a CI-built image pinned in khe-homelab
([estate ADR-008](https://github.com/khelias/khe-architecture/blob/main/decisions/008-container-images.md));
an AI feature copies the adventure proxy's guard pattern rather than calling
a shared service
([estate ADR-003](https://github.com/khelias/khe-architecture/blob/main/decisions/003-adventure-proxy-stays-adventure-only.md)).
It follows the estate backend pattern
([estate ADR-004](https://github.com/khelias/khe-architecture/blob/main/decisions/004-app-backend-and-identity.md)).

Familjen Grotesk, the family's type
([khe-sites `DESIGN.md` "Typography"](https://github.com/khelias/khe-sites/blob/main/DESIGN.md#typography)),
is self-hosted: woff2 files in `src/assets/fonts/`, `@font-face` in
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
`src/engine/rng.ts` ([ADR-0003](docs/decisions/0003-codeql-insecure-randomness.md)).
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
  offline/      the service worker, its kill-switch, build plugin and registration
  hooks/ utils/ types/ diagnostics/
docs/decisions/ 0001 bounded contexts, 0002 learner profile, 0003 CodeQL,
                0004 dark theme and the light stage, 0005 rounds and
                progress per learner, 0006 the backend language,
                0007 the immersive play area and WebGL
scripts/        build-sky-data.mjs cuts the star game's sky data
e2e/            Playwright suite; offline.spec.ts runs on production builds
```

## Themes

A theme is a folder `src/meta/themes/<id>/` with `theme.json` (id equal to
the folder name, `{ et, en }` name and description, tier, cost, palette with
a light `background` and a dark `backgroundDark`) and
optional art named by `art`. No code change: the catalog picks it up through
`import.meta.glob`, and `src/meta/__tests__/themeCatalogData.test.ts` fails if
it is invalid or either ground makes that theme mode's text unreadable. Owned themes
are device-scoped (`gameStore.ownedThemeIds`); the applied one is per learner
(`preferences.theme`).

## Architecture

- ADR-0002 (learner profile, per-skill mastery) is done: `gameStore.learners[]`
  plus `activeLearnerId`; `getLevelForGame` reads
  `mechanicPreference[mechanicId].difficulty`; skill mastery owns
  `factsKnown` for closed-set weakest-fact drilling
  (lifetime accuracy; `lastSeen` is stored but not read yet). A registry
  entry's `factKey` names the fact an answer is recorded under; star_mapper
  returns the constellation, so a traced one is `factsKnown[id].correct > 0`.
- ADR-0001 (bounded contexts): Curriculum and Learner are live;
  Meta-progression has started (`src/meta/`, its state still in `gameStore`);
  PlaySession and Identity moves are still ahead. Work with both ADRs,
  and ask when a change seems to fight them.
- ADR-0005 (Accepted 2026-10-24): games play in rounds with three lives of
  their own, a level rises after three rounds that reach their goal, and
  stars, achievements, records, stats and owned themes belong to the
  learner. Run 3 of ROADMAP Phase 1.7 built the rounds: each registry entry
  declares its `round` (`src/engine/round.ts`), `useRoundFlow` ends a round
  and `GameResultScreen` is its one end screen. Until Runs 4 and 6 land,
  stars and owned themes are still device state in `gameStore`, and the
  shop's free stars are not yet behind the demo switch.

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
5. `src/engine`, `src/stores`, `src/games`, `src/curriculum` and `src/meta`
   have enforced coverage thresholds, so new code there comes with tests.
6. Per-game logic lives in the game's registry entry (`src/games/<mechanic>/register.ts`:
   config, problem hooks) or its folder, so adding a game needs no code outside
   `src/games/` beyond its problem type and locale strings. A new menu entry
   also adds its `Picture.tsx` and a `menuPictures` line.
   `src/games/__tests__/registryContract.test.ts` fails on a `case` label or a
   `===` / `!==` comparison naming a game id or problem type elsewhere, except in
   the files on its `COMPARISON_ALLOWLIST`.
7. The app is served at `/study/`: `PRODUCT_ROOT` in `src/theme/productRoot.ts`
   is the `base` in `vite.config.js` and the `basename` on `BrowserRouter` in
   `src/main.tsx`, trailing slash included, because `/study` is outside the
   worker's scope. `public/manifest.webmanifest` repeats the path. Routing
   refactors keep them together. The dev server is at
   `http://localhost:5173/study/`.

## Installed app

The app installs to a home screen as Tarkade mängud and plays offline after
the first visit ([estate ADR-041](https://github.com/khelias/khe-architecture/blob/main/decisions/041-installed-apps-stay-on-their-paths-with-a-worker-each.md)).
`public/manifest.webmanifest` describes it; the icons in `public/` are
rendered with `rsvg-convert` from `src/assets/app-icon.svg`. It opens in
Estonian, in a tab and installed, until a language is chosen ([khe-sites ADR-001](https://github.com/khelias/khe-sites/blob/main/docs/decisions/001-khe-ee-pages-are-one-static-page-per-language.md) point 8).
`serviceWorkerPlugin` in `vite.config.js` compiles `src/offline/sw.ts` into
`dist/sw.js`, with every built file but the licence texts in its precache,
under the cache prefix `study-shell-`. Navigations go to the network first
and fall back to the saved page, also when the files a new page names do not
arrive within three seconds. A new worker takes over as soon as it has
saved the whole build, without reloading a running game, so the next start
opens the new build. `npm run test:e2e` builds production itself for
`e2e/offline.spec.ts`, served by `e2e/server.ts` on port 4263.

### Kill-switch

`sw.js` stays at its URL for good: deleting it leaves the old worker running
on every device. If a deployed worker misbehaves, set
`serviceWorkerPlugin({ killSwitch: true })` in `vite.config.js` and push to
`main`. The deploy then publishes `src/offline/killSwitch.ts` as `sw.js`, and
each device, on its next visit online, removes the `study-shell-` caches,
unregisters the worker and reloads the page once. A learner's progress is in
`localStorage` and stays. Then fix the cause, remove the option and ship a
normal build.

## Deployment

Push to main runs lint, typecheck and unit tests on the self-hosted homelab
runner, then builds and copies `dist/` to `/srv/data/games/study/`; a failure
stops the deploy. Because of that runner, a fork PR's run is approved as
the workspace `AGENTS.md` says
([estate ADR-023](https://github.com/khelias/khe-architecture/blob/main/decisions/023-agent-pushes-where-its-session-allows.md)
point 5).
E2E runs only in CI. No runtime server; backend and sync are ROADMAP
Phase 2.

What this repo publishes on `games.khe.ee/study/` is also copied hourly to
the Cloudflare edge fallback ([estate ADR-016](https://github.com/khelias/khe-architecture/blob/main/decisions/016-static-fallback-at-the-edge.md)), which serves it when the
homelab is down, so it must be fit for a third-party host.

Automated writers
([estate ADR-007](https://github.com/khelias/khe-architecture/blob/main/decisions/007-automated-writers.md)): Renovate
automerges npm patch and minor updates of stable packages, 0.x patches of
devDependencies, GitHub Actions minor and patch updates, digests and pins
(`renovate.json`), and every merge to `main` deploys. An npm or Actions
update is raised only once its release is three days old. Lock file
maintenance is not held by that, so its weekly PR waits for a merge by hand.
The way back from a bad one is to revert its commit on `main` and push,
which redeploys the previous state.
