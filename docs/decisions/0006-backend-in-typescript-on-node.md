# ADR-0006: The Phase 2 backend is TypeScript on Node

- **Status:** Accepted (2026-09-28)
- **Supersedes:** none
- **Superseded by:** none
- **Related:** [estate ADR-004](https://github.com/khelias/khe-architecture/blob/main/decisions/004-app-backend-and-identity.md), [estate ADR-008](https://github.com/khelias/khe-architecture/blob/main/decisions/008-container-images.md), [ADR-0005](0005-rounds-and-progress-per-learner.md)

## Context

Phase 2 of the [roadmap](../../ROADMAP.md) adds a backend for syncing a learner's progress. How app backends store data and authenticate is estate ADR-004; the language was left to each app. Estate ADR-004 point 7 keeps one shared platform underneath: the container platform of estate ADR-008, the JWT contract of estate ADR-004 point 3, and OpenAPI as the API contract.

This backend is single-learner sync with last-write-wins, a thin layer over storage, next to a frontend game engine written in TypeScript. The other planned backend, khe-trips', has a relational core with per-trip roles, concurrent edits and server-side jobs, and pulled toward a different stack at the time; its language is that repo's own decision.

The repo is also a reference project, so the choice is partly about what the code shows, not only about what ships fastest.

This decision was estate ADR-009, which also gave khe-trips its language; it moved here when the estate register kept only estate-wide decisions.

## Decision

The backend is TypeScript on Node, with Postgres per estate ADR-004 point 2. The server can share the frontend game engine as it is, for example to validate a change to a learner's in-game wallet with the same code the client runs.

## Alternatives considered

**Java with Spring Boot, as first planned for khe-trips.** Rejected: a heavy runtime for a thin sync layer, and the shared engine code would be lost.

## Consequences

- The engine's rules have one implementation on both sides of the wire.
- The study backend adds no new runtime to the homelab: the adventure proxy already runs on Node.
- This answers the backend-language question Phase 2 left open; the auth provider follows estate ADR-004 point 3.
- Revisit if the backend outgrows a thin sync layer.
