# ADR-0007: An immersive play area, and WebGL in a lazy chunk

- **Status:** Accepted (2026-11-27)
- **Supersedes:** none
- **Superseded by:** none
- **Related:** [ADR-0004](0004-dark-theme-and-light-stage.md) (refined by this ADR), [ADR-0005](0005-rounds-and-progress-per-learner.md), [estate ADR-035](https://github.com/khelias/khe-architecture/blob/main/decisions/035-family-shell-and-design-check-with-its-exceptions.md)

## Context

ADR-0004 puts every game's play area on a light stage: a bounded panel, at most `max-w-2xl` wide, with padding, inside the shell. The star game (`star_mapper`, Tähistaevas) becomes the real night sky over Estonia: about 3900 stars to magnitude 6 in their colours, the Milky Way and a treeline, which the learner drags and zooms like a planetarium. A light panel cannot hold a night sky, and a boxed sky leaves most of a phone screen unused.

Drawing a few thousand stars with a twinkle at 60 frames a second, with a textured Milky Way, needs WebGL; SVG or a 2D canvas would carry the per-frame cost on the main thread. three.js is the maintained, typed WebGL library; it adds about 150 KB gzipped, which the rest of the app must not pay for.

The star positions, colours and IAU figures come from Olaf Frohn's d3-celestial (BSD-3, data from the XHIP catalogue and the IAU figures).

## Decision

1. A game may declare `GameConfig.stage: 'immersive'`. Its play area then fills the height under the game header, edge to edge with safe-area insets, without the `light-stage` panel, its padding or its width cap, and it paints its own colours there (estate ADR-035 point 13: what is below the header is the game's content, off the family rule). `'boxed'` stays the default, so every other game keeps ADR-0004's light stage. `star_mapper` is the first immersive game.
2. three.js (`three`, pinned exactly) is a runtime dependency loaded only through a dynamic `import()` from the star game's view. `src/games/starMapper/sky/SkyRenderer.ts` is the only module that imports `three` or the full star catalogue, so both land in one lazy chunk; the entry bundle has neither. Without WebGL the game plays on a CSS gradient sky.
3. The sky data is cut from d3-celestial at one pinned commit by `scripts/build-sky-data.mjs` and committed under `src/games/starMapper/sky/data/` with d3-celestial's licence. Swapping the source means rerunning the script; it is a data choice, not a code dependency. The generator imports only the small `bright.json` (figure stars and stars brighter than magnitude 4.5), since game registrations load eagerly.

## Alternatives considered

**Keep the sky inside the light stage, drawn as SVG.** Rejected: a dark sky inside a light panel looks like a picture of the sky, not the sky, and SVG cannot carry thousands of twinkling stars.

**A 2D canvas without a library.** Rejected: the sphere projection, a Milky Way texture and a point shader would rebuild a good part of three.js by hand.

**Load three.js eagerly.** Rejected: every other game would download the WebGL library.

## Consequences

- One game paints its own full-screen look; the shell's header, toasts, dialogs and result screen keep the theme as before.
- The entry bundle grows by about 44 KB (24 KB gzipped): the bright stars, the figures and the pack are eager (point 3). The sky's chunk, with three.js and the catalogue, loads when the star game opens, and the offline worker precaches it like every other built file.
- A future 3D or full-screen game reuses `stage: 'immersive'` without a new decision.
- The renderer must dispose its WebGL context on unmount, since React StrictMode mounts twice in development.

## References

- `src/types/game.ts` (`GameConfig.stage`), `src/features/gameplay/GameScreenView.tsx`
- `src/games/starMapper/sky/`, `scripts/build-sky-data.mjs`
- d3-celestial: <https://github.com/ofrohn/d3-celestial>
