# ADR-0005: Play in rounds; progress, rewards and lives belong to the learner

- **Status:** Accepted (2026-10-24)
- **Supersedes:** none
- **Superseded by:** none
- **Related:** [ADR-0001](0001-bounded-contexts.md), [ADR-0002](0002-learner-profile.md), [estate ADR-004](https://github.com/khelias/khe-architecture/blob/main/decisions/004-app-backend-and-identity.md), [estate ADR-021](https://github.com/khelias/khe-architecture/blob/main/decisions/021-family-shell-and-design-check.md)

## Context

The product audit of 2026-10-23 (`docs/qa/2026-10-23-product-audit.md`) found that no game has a goal per play: a standard game runs until the device's hearts reach 0. Hearts belong to the device, so siblings share them, they never refill, and the shop's free +50 stars make hearts and stars cost nothing. A level needs 5, 7, 10, 12 or 15 right answers in one play at 80% accuracy; leaving the game loses the count, and the level selector lets a child jump to any of 20 levels. Stars, achievements, high scores, stats and owned themes are device state in `gameStore`; only levels, skill mastery and preferences are per learner (ADR-0002). Achievements give nothing. Nothing connects one game to another or one day to the next.

The household plays in short moments, in homework practice a parent sets, and in free time, with children from 5 to 11 or older on one device. Run 2 of Phase 1.7 drew the directions on two Design canvases and the operator chose from them on 2026-10-23 and 2026-10-24.

## Decision

1. **A game is played in rounds.** A round has a visible goal: about eight tasks, or one board, run or puzzle, as each entry's round is set in Phase 1.7's growth table. A round has three lives of its own that refill when the next round starts. A wrong answer, and a game's own failure (the snake hitting itself, three wrong taps in Word Cascade, a crash in Shape Dash), cost a life and restart the task; the round ends when its goal is reached or its lives run out. A mismatch in a memory game costs nothing. The 60-second drill is its own round with no lives.
2. **No hearts outside a round.** The device's hearts, their purchase with stars and the shop's heart offer go.
3. **A level rises after three rounds that reach their goal** in that mechanic, at its current level, shown on the round's end screen. Progress toward the next level is stored and survives leaving the game. The level selector offers only levels the learner has reached.
4. **Progress and rewards belong to the learner.** Stars, achievements, high scores, stats and owned themes move from the device into the learner's profile; on migration the device's values go to the learner active at that moment. A round's end gives stars. Every round on today's path gives a sticker for the learner's album; an achievement gives a special sticker. In BattleLearn a star cell gives a star and a heart cell gives back a round life. Stars buy themes and hints.
5. **The shop's free stars stay only behind a demo switch,** off by default, for showing the app without playing.
6. **Today's path.** Each learner has a path of three rounds a day, picked from the learner's weakest skills or from a focus a parent sets, and a streak of days with a finished path. The parent's focus sits behind a four-digit PIN kept on the device. The PIN keeps a child out of a setting; it is not security, and it gives way to the edge login of estate ADR-004 when Phase 2 arrives.
7. **Where the shell ends,** per estate ADR-021 point 1, as drawn: the feedback layer and the companion are play area; the result screen is shell; the path is shell with the star colour for its streak; the album page and stickers are a picture inside a shell frame. No new surface puts colour into the shell, so no estate decision changes.

## Alternatives considered

**Rounds without lives.** Rejected as the default: the games that held children in the audit (snake, Robo Path, Word Cascade, Shape Dash) all carry a little risk. A switch to turn lives off for the youngest stays possible without changing this decision.

**Keep hearts, per learner.** Rejected: a shared pool across games still needs refill rules and a shop link, and a child who runs out cannot play anything.

**Keep answer targets for levels.** Rejected: fifteen answers in one play is out of reach on the snake's board and lost on leaving; rounds give the level a unit the child sees.

**A story world, or a map per subject, as the journey.** Rejected for Phase 1.7: the story world needs chapters, story copy and voice, and the browsers that children use offer no dependable Estonian speech. Today's path covers the daily streak and the parent's homework, and the album covers collecting; a world can wrap them later.

**Remove the free stars outright.** Rejected by the operator: the portfolio needs a way to show the shop without hours of play.

## Consequences

**Positive.**

- Every play has a beginning, a goal and an end screen that shows what was earned and what comes next.
- Siblings on one device keep their own stars, stickers, records and themes.
- A level is a thing the child sees grow, round by round, and keeps.
- The meta-progression context (ADR-0001) gets its first real state: wallet, inventory, album and path per learner.

**Negative.**

- A persisted-store migration moves device state to one learner; other learners on the device start without stars or themes.
- Every game view changes how it reports failure, since a failure now costs a round life instead of a device heart.
- The PIN is a soft gate, and a forgotten PIN needs a reset path.

**Irreversible once shipped.** Learners' stores carry the per-learner wallet and album; going back to device state would need another migration.

## References

- `docs/qa/2026-10-23-product-audit.md`: the audit.
- Phase 1.7 in `ROADMAP.md`.
- `src/stores/gameStore.ts`: device state today (hearts, stars, achievements, stats, owned themes).
- `src/engine/progression.ts`: today's answer targets.
- `src/learner/types.ts`: the learner profile this decision extends.
