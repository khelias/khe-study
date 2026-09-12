# ADR 0003 — CodeQL excludes js/insecure-randomness repo-wide

**Status:** Accepted — 2026-09-12
**Supersedes:** none
**Superseded by:** none
**Related:** none

## Context

CodeQL reports 20 open alerts against `main`, all of them the same rule, `js/insecure-randomness`, rated high severity. Every one of them has the same sink:

```ts
uid: uid(rng),
```

and `uid` is a single function, `src/engine/rng.ts:33`:

```ts
export const uid = (rng: RngFunction = Math.random): string => {
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    const intVal = Math.floor(rng() * 0xffffff);
    parts.push(intVal.toString(36));
  }
  // ...
};
```

The rule fires because CodeQL treats identifier generation as a security-sensitive context by default: a predictable identifier is a finding when the identifier authorizes something. In this codebase it authorizes nothing. The values are round and attempt identifiers, used as React keys and as the join key between a generated question and the attempt record it produces. The app is a client-only static build with no auth, no sessions, no tokens and no server-side secret; a learner who predicts the next `uid` gains the ability to predict the next `uid`.

The alerts became a merge blocker rather than background noise when [#83](https://github.com/khelias/khe-study/pull/83) colocated every mechanic into `src/games/<mechanic>/`. That refactor moved the same `Math.random()` call sites to new paths, so CodeQL reported 11 of the 20 as _new_ alerts introduced by the PR. A pure file move is not a new security finding, and any future refactor that touches these paths will produce the same false signal.

## Decision

Exclude `js/insecure-randomness` from CodeQL analysis repo-wide, via a config file referenced by the workflow.

`.github/codeql/codeql-config.yml`:

```yaml
query-filters:
  - exclude:
      id: js/insecure-randomness
```

`.github/workflows/codeql.yml` passes `config-file: ./.github/codeql/codeql-config.yml` to `github/codeql-action/init`. The config file carries the rationale as a comment so that the exclusion is readable where it takes effect, not only here.

The exclusion is scoped to one rule id. Every other CodeQL query stays active, including the rest of the JavaScript security suite.

## Alternatives considered

**Route `uid()` through `crypto.getRandomValues()`.** Rejected. The RNG is deliberately deterministic: `createRng(seed)` is a seeded LCG, documented in `src/engine/rng.ts` as existing "for testability", and `src/engine/__tests__/rng.test.ts:135` asserts that two generators created from the same seed produce the same `uid`. Seeded replay is what makes generated game rounds reproducible in tests. A crypto-backed `uid()` breaks that invariant to fix a problem the app does not have.

**Dismiss the 20 alerts individually in the GitHub security UI.** Rejected. Dismissals are per alert and keyed to a location; the #83 refactor demonstrates that moving a file resurrects every one of them as a new alert. The dismissal state would also live only in GitHub's UI, invisible to anyone reading the repo.

**Add inline `// codeql[js/insecure-randomness]` suppressions at each call site.** Rejected. Twenty comments expressing one decision, each of which has to be carried by hand through every future refactor, and none of which explains the reasoning where a reader would look for it.

**Leave the rule on and accept a permanently red CodeQL check.** Rejected. CodeQL is not a required status check in branch protection, so this is survivable, but a check that is always red is a check nobody reads. A genuine finding would arrive into a channel that has been trained to be ignored.

**Narrow the exclusion to specific paths instead of the whole repo.** Considered and not taken for now. `uid()` is called from every mechanic folder and from `src/engine/`, so a path list would enumerate most of `src/` and would need editing on every new mechanic. The rule-id exclusion is the smaller surface.

## Consequences

**Positive.**

- The 20 standing alerts on `main` clear on the next analysis run.
- Refactors that relocate generator code stop producing phantom security findings. #83 is the immediate beneficiary.
- The CodeQL check becomes a signal again: red means something new.
- The rationale is written down twice, in the config comment and here, with a stated condition for revisiting.

**Negative.**

- If the app later introduces anything that genuinely needs unpredictable values, CodeQL will not catch a weak-randomness mistake in it. This is the real cost of the decision, and it is why the revisit condition is explicit rather than implied.
- A reader who sees `Math.random()` in a future security-sensitive position gets no tooling nudge. The ROADMAP Phase 2 backend work is the first place this could bite.

**Revisit when.** The app gains auth, sessions, tokens, password or invite-code generation, or any server-side secret. At that point the correct move is to narrow the exclusion to the game engine paths rather than to delete it wholesale, since the seeded-RNG argument still holds for round identifiers.

## References

- `src/engine/rng.ts` — `createRng`, `uid`; the single sink behind all 20 alerts.
- `src/engine/__tests__/rng.test.ts:135` — the seeded-determinism assertion that rules out a crypto-backed `uid()`.
- `.github/codeql/codeql-config.yml` — the exclusion and its inline rationale.
- `.github/workflows/codeql.yml` — passes the config to `codeql-action/init`.
- [#83](https://github.com/khelias/khe-study/pull/83) — the refactor that surfaced 11 of the alerts as "new".
