# Smart Games

[![CI](https://github.com/khelias/khe-study/actions/workflows/ci.yml/badge.svg)](https://github.com/khelias/khe-study/actions/workflows/ci.yml)
[![CodeQL](https://github.com/khelias/khe-study/actions/workflows/codeql.yml/badge.svg)](https://github.com/khelias/khe-study/actions/workflows/codeql.yml)
[![Deploy](https://github.com/khelias/khe-study/actions/workflows/deploy.yml/badge.svg)](https://github.com/khelias/khe-study/actions/workflows/deploy.yml)

Small learning games for the Estonian curriculum: reading, math, logic and
memory, in Estonian and English. Live at
[games.khe.ee/study/](https://games.khe.ee/study/).

The idea behind it is that one engine can serve both a 7-year-old practising
multiplication and an adult practising Estonian river names: one codebase,
one learner model, two UX registers. Today it is the children's catalogue;
a backend, the adult register and the remaining bounded-context moves are
next ([ROADMAP.md](ROADMAP.md)).

## How it plays

- **Difficulty adapts on two axes.** Each game mechanic has its own level,
  and each skill has its own mastery, so a learner can be on a hard level of
  a simple mechanic and still get the facts they keep missing. For closed
  sets like the multiplication table, practice leans towards the weakest
  facts and keeps revisiting the known ones.
- **Levels are earned, never bought**, by enough correct answers at high
  accuracy. Level-ups award stars; stars buy hearts; a wrong answer costs a
  heart, and no hearts ends the session. Achievements are cosmetic.
- **Several learners share one device**, each with their own progress; stars,
  hearts and achievements are still shared per device.
- Everything is stored in the browser. Nothing syncs across devices yet.

The numbers behind these rules live in `src/engine/` (`progression.ts`,
`adaptiveDifficulty.ts`, `factDrill.ts`); the games themselves are registered
in `src/games/registrations.ts`.

## Running it

Needs Node.js 24 and npm.

```bash
git clone https://github.com/khelias/khe-study.git
cd khe-study
npm install
npm run dev       # http://localhost:5173/study/
npm run test:run
```

Every other command and the quality gate CI enforces are in
[AGENTS.md](AGENTS.md).

## Where it runs

Every push to `main` builds on a self-hosted runner on the homelab VM and
copies the static site into the directory the
[khe-homelab](https://github.com/khelias/khe-homelab) nginx serves. There is
no server component yet.

## More

- [ARCHITECTURE.md](ARCHITECTURE.md) - current code structure
- [docs/adr/](docs/adr/) - architecture decisions: bounded contexts, the
  learner profile
- [ROADMAP.md](ROADMAP.md) - phases, non-goals, open decisions
- [docs/shared-components.md](docs/shared-components.md) - cookbook for the
  shared game components
- [src/i18n/README.md](src/i18n/README.md), [src/monetization/README.md](src/monetization/README.md) -
  the translation system and the inert monetization scaffolding
- [AGENTS.md](AGENTS.md) - commands, layout and rules for working on the code

MIT licensed.
