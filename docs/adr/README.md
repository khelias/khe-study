# Architecture Decision Records

This directory holds ADRs for the platform. An ADR captures an architecturally significant decision, the context that led to it, the alternatives considered, and the consequences accepted. ADRs are append-only: a decision is never edited to say the opposite; a new ADR supersedes an old one.

## Format

Lightweight Michael Nygard style. Every ADR has:

1. **Status** — Accepted, Superseded, Deprecated. Include date.
2. **Context** — the forces at play, described factually.
3. **Decision** — the choice made, stated in one or two sentences plus specifics.
4. **Alternatives considered** — the options rejected, each with a reason.
5. **Consequences** — what becomes easier, what becomes harder, what becomes irreversible.
6. **References** — files, commits, previous ADRs.

## Index

| #                                | Title                                           | Status   |
| -------------------------------- | ----------------------------------------------- | -------- |
| [0001](0001-bounded-contexts.md) | Platform organized as five bounded contexts     | Accepted |
| [0002](0002-learner-profile.md)  | Learner identity separates from difficulty tier | Accepted |

## Adding a new ADR

1. Number sequentially, zero-padded to four digits.
2. Kebab-case the title: `NNNN-short-title.md`.
3. Never renumber. If an ADR turns out wrong, write a new one that supersedes it and update both statuses.
4. Update the index above in the same commit.
