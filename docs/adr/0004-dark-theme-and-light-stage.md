# ADR-0004: Dark theme with the shared toggle, play areas on a light stage

- **Status:** Accepted (2026-10-23)
- **Supersedes:** none
- **Superseded by:** none
- **Related:** [estate ADR-017](https://github.com/khelias/khe-architecture/blob/main/decisions/017-shared-theme-toggle-and-footer.md), [estate ADR-021](https://github.com/khelias/khe-architecture/blob/main/decisions/021-family-shell-and-design-check.md)

## Context

Estate ADR-021 point 2 asks every room to show light and dark, following the system, and ADR-017 gives the shared header a theme toggle whose override is stored per site. Tarkade Mängud was light only: `data-theme="light"` on `<html>` kept the header light on a dark system, and ADR-017's "light only for now" for the study games was meant to end with a dark theme of its own.

The shell (menu, dialogs, notifications, header bar, result screen) already reads the family tokens from `src/index.css`, so it can follow a dark block. The games' play areas cannot yet: they hold about 900 hard-coded colours in 20 files and no token utility, and `shapeDash` draws on a canvas with its own look. ADR-021 point 1 lets play areas keep their own look. Some shell parts are rendered by a game inside its play area: the result screen (fact drill, BattleLearn), dialogs (robot path, BattleLearn, pattern) and the tip button.

The games hub on the same origin, `games.khe.ee`, stores its theme choice under `khe-theme`.

The family's dark `sunken` (`#0f1211`) is 1.03:1 against dark `paper` (`#0b0d0d`). The picker's picture wells and the hover and pressed states of rows and buttons all use `sunken`, so in dark they would not show.

## Decision

The shell follows the system theme and shows the shared header's toggle (`useThemeOverride` from `@khelias/ui/react`), stored under `khe-theme`, the key the hub uses on the same origin, so a choice made on the hub carries into the study room and back. An inline script from `themeInitScript('khe-theme')` applies a stored choice before first paint.

Play areas stay light until each moves to tokens. The play container on the game screen carries the class `light-stage`, which sets the light token values on itself, so in dark it shows as a light panel inside the dark shell. Shell parts that a game renders inside the stage carry `theme-shell` on their root, which takes the dark values back under the same selectors that set them on `:root`.

ADR-021 point 2 says a room that commits its content to one theme has its header take that theme. That does not apply here: the room is not committed to light, only its unconverted play areas are, and each leaves the stage when it moves to tokens.

Dark `sunken` in this app is `#171c1b` (1.13:1 on dark paper, as close to light's 1.09:1 as dark allows), a deviation from the family table. Whether the family value should change for every room is a question for khe-sites `DESIGN.md`, not decided here. The dark state colours (`ok`, `bad`, `star`, `heart`) are the app's own, at 4.5:1 on dark paper, surface, sunken and every shop theme's dark ground.

## Alternatives considered

**Move every game's play area onto tokens now.** Rejected for this change: about 900 colours in 20 files, each needing a look in both themes, would hold the shell's dark theme back by weeks. It stays the route back from this decision, one game at a time.

**Keep game pages wholly light, header included.** Rejected: the header and the game's own chrome would flip between themes on every navigation from the menu, and ADR-021 point 2's exception is for a room committed to one theme, which this one is not.

**An own storage key, such as `khe-study-theme`.** Rejected: `games.khe.ee` is one site in ADR-017's terms, and a visitor who chose dark on the hub would land in a light study room. Undoing the shared key costs a visitor one click.

## Consequences

**Positive.**

- The study room follows a dark system setting and shares the visitor's choice with the hub.
- Every game keeps working unchanged; nothing in a play area is light-on-dark or dark-on-light.
- A game moving to tokens drops the stage for itself alone.

**Negative.**

- In dark, game screens show a light panel inside a dark page until their games move to tokens.
- A new shell part rendered inside a play area needs `theme-shell` on its root, or it shows light in dark.
- The dark `sunken` differs from the family's until `DESIGN.md` settles it.

## References

- `src/index.css`: the light block on `:root, .light-stage`, the two dark blocks on `:root` and `.theme-shell`.
- `src/__tests__/designTokens.test.ts`: the values, the identical dark blocks and the contrast floors.
- `src/theme/themeHead.ts`: the first-paint script.
- `src/components/StudySiteHeader.tsx`: the toggle.
- `src/features/gameplay/GameScreenView.tsx`: the stage.
