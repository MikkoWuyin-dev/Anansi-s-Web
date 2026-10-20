# Session memory

Handoff for the next agent. Read `AGENTS.md` and `KNOWLEDGE INDEX.md` first; this file records
working state, not requirements.

## Where the project is

Phases 0 to 6 are complete. Phase 7 is two thirds done: 7.1 (the light token set) and 7.2 (the sun
and moon switch) landed on 2026-10-20; 7.3, the `/imprint` pass over everything built since the
registry's first entries, has not started. Everything through 7.2 is committed and pushed to
`origin/main`.

- Specs: `docs/specs/0006-the-light-token-set.md` (built; AC-2 superseded) and
  `docs/specs/0007-the-sun-and-moon-switch.md` (`Built`, 2026-10-20).
- Code: the mode is one authority on `<html data-mode>`; `src/state/mode.ts` stores the choice,
  `src/app/mode.ts` resolves and applies it, `src/app/ModeSwitch.tsx` is the button, `index.html`
  sets the attribute before the module loads.
- Tests: 337 in 31 files — `src/app/` 85, `src/state/` 56, `src/world/` 87, `src/engine/` 44.
- Records: teardown v3.7, MCD §§7 and 13, roadmap 7.2, the scope (feature 12 in progress),
  `ui-registry.md`, and this file were reconciled on 2026-10-20.

## The mode (specs 0006 and 0007)

- `<html data-mode="light|dark">` is the only thing the stylesheet reads. `:root[data-mode='light']`
  holds the daytime values. Do not reintroduce a `prefers-color-scheme` media query for the tokens:
  it cannot be overridden by a click, and `tokens.test.ts` fails if one appears.
- The stored shape is `{version: 1, choice}` under `anansi:v1:mode`, where choice is
  `system | light | dark`. `system` is what "no choice" means — there is no separate absence state.
  An unknown or malformed value falls back to `system`, and a refused write is swallowed.
- `resolveMode(choice, system)` and `toggleChoice(choice, system)` are pure and node-testable;
  `applyMode` writes the attribute and the one `theme-color` meta (read from `--anansi-surface`, so
  the colour is never restated in script).
- The pre-paint script in `index.html` must stay before `/src/main.tsx` and must set the attribute
  from the resolved value. The test asserts the assignment, not merely the property name — the first
  version of that test passed with the assignment deleted.
- `App.tsx` follows the system live only while the choice is `system`, crossfades through
  `startViewTransition` when it exists, and skips that under `prefers-reduced-motion`.
- Three roles exist because the palette names hues, not jobs: `--anansi-surface`,
  `--anansi-action-edge` (the yellow fill is 1.06:1 on paper), `--anansi-lavender-text`.

## Phase 6 decisions worth keeping

- `families.ts` and `spider.ts` are not `Objects.ts` or `Anansi.ts`: Windows and TypeScript treat
  those as the same file as the `.tsx` beside them. Keep a different stem for a pure module.
- The search is `SEARCH_MS` (1400 ms) from `choreography.ts`, imported by `ritual.ts`; the engine
  decides and records first, then the reveal waits. `celebrating` is transient (900 ms) and skipped
  under reduced motion.
- Anansi's travel is a spring of scalar progress through a keyframed path, reset (not sprung back)
  when the searching beat ends. `Web.tsx` mounts the yellow filament at zero opacity so its shader
  compiles with the stage.
- `@react-spring/three` needs `onChange: () => invalidate()` or the demand frameloop never draws.
- The world stays a leaf: it imports the engine's seeded stream, React, three, the renderer, and the
  springs, never the app, state, or content.

## Installed reference skills (2026-10-18)

Thirteen `threejs-*` packs from `CloudAI-X/threejs-skills` sit in `skills/` with the eight earlier
design packs, all tracked since 2026-10-20. They are reference material, not workflow skills, and
they target three.js r186 while this project pins 0.169: check an API against the installed version.
`threejs-react-three-fiber` and `threejs-performance` are the two relevant to the stage.

## Verified on 2026-10-20

- `npm run verify` → exit 0: typecheck, content check, 337 tests in 31 files, documentation check
  (203 claims), build. Shell 57.74 kB gzip, scene 238.06 kB gzip, stylesheet 2.90 kB gzip.
- Switch pass (`127.0.0.1:5173`, storage cleared): the button was 44 × 44, named "Switch to light
  mode"; a press moved the document to light (`--anansi-surface #f2efe4`, `color-scheme: light`,
  `theme-color #f2efe4`), stored `{"version":1,"choice":"light"}`, kept focus, and renamed itself.
  Tab landed on the switch before History; Enter flipped it back to dark. A reload with the stored
  light choice arrived light, with the moon glyph showing (`sun 0`, `moon 1`).
- Layout: at 1280 × 800 the cluster sat at `x 1081–1232, y 40–84` (hero at `y 211`); at 390 × 844 at
  `x 219–370, y 20–64` (hero at `y 286`); no horizontal overflow.
- Colour scheme emulation in both directions still recolours the mounted canvas without a reload
  (the 7.1 pass), and the canvas label is mode-neutral.

## Not verified, and why

The preview webview in that session produced no frames, so CSS transitions stayed at
`currentTime 0`, screenshots could not be captured, and `:focus-visible` could not match because
`document.hasFocus()` was false. The crossfade, the glyph's turn, the focus ring, and the absence of
a first-paint flash therefore rest on the code and the tests (R17), not on observation. The reduced
motion media query still cannot be emulated, so its switch branch is CSS-asserted only. The error
boundary has never caught a real scene throw. The frame-time figure is time inside `gl.render`, not
a GPU timer. Lighthouse and first usable interaction are Phase 9's. Light mode has not been judged
on a real phone or in daylight.

## Next justified action

Phase 7.3, the `/imprint` pass: read `skills/imprint` and the current `ui-registry.md`, then capture
every component built since the registry's first entries — the ritual's story and learned states,
the history drawer, the stage layer, the mode switch (already recorded on 2026-10-20), and both
token sets — so a later component can be built from the registry alone. After that Phase 8 needs a
product decision (the evolving web and the hidden interactions) before any code: it is a design
question for the owner, not an implementation detail.
