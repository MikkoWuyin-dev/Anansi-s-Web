# Session memory

Handoff for the next agent. Read `AGENTS.md` and `KNOWLEDGE INDEX.md` first; this file records
working state, not requirements.

## Where the project is

Phase 6 (the 3D world, 6.1 to 6.10) landed on 2026-10-18. Phase 7.1 (the light token set) landed on
2026-10-20, so the app now has both modes as token sets under the system preference. Phase 7.2, the
sun and moon switch, has not started.

- Specs: `docs/specs/0005-the-3d-stage.md` (`In Progress`) and
  `docs/specs/0006-the-light-token-set.md` (`In Progress`, 7.1 named in its built line).
- Code: `src/world/` holds the graph, families, spider, choreography, density, camera, palette,
  stage, and the five components; `src/app/WorldLayer.tsx` arms the scene and reads the width,
  motion, and colour-scheme queries; `src/app/styles.css` holds both token blocks.
- Tests: 317 in 28 files — `src/app/` 71, `src/world/` 87.
- Records: teardown v3.6, MCD §§7 and 13, roadmap Phase 7 (7.1 built), the scope (feature 12 in
  progress), `ui-registry.md`, the knowledge index, and `AGENTS.md` §14 all reconciled on
  2026-10-20.

## The light token set (spec 0006)

- Light mode is the same `--anansi-*` names under `@media (prefers-color-scheme: light)`; dark is
  the base block and the unexpressed preference. No rule below the tokens knows the mode, and
  `src/app/tokens.test.ts` fails if either block misses a colour role or if a raw colour appears
  outside the two blocks.
- Three roles exist because the palette names hues, not jobs: `--anansi-surface` is the page
  (because `--anansi-black` is the label on the yellow action), `--anansi-action-edge` is the inset
  ring that gives the yellow fill a boundary on paper (1.06:1 without it), and
  `--anansi-lavender-text` is the one lavender label (3.67:1 as the raw hue in dark, 5.74:1 lifted).
- The contrast contract is arithmetic in the test, not a claim in prose: text 4.5:1, ring and edge
  3:1, the label on yellow 4.5:1, both modes.
- `Scene.tsx` resolves the palette once with `useMemo(() => documentPalette(), [mode])` and passes
  it to the web, the objects, and Anansi. `purity.test.ts` fails if any other component reads the
  document, so do not reintroduce per-component palette reads.
- `descriptionFor('idle')` no longer says "in the dark": the label has to be true in both modes.
- The dark link label (`.story__back`) is now `--anansi-lavender-text`, not the raw lavender, which
  is a deliberate contrast repair in dark mode.

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

- `npm run verify` → exit 0: typecheck, content check, 317 tests in 28 files, documentation check,
  build. Shell 57.19 kB gzip, scene 238.06 kB gzip, stylesheet 2.52 kB gzip.
- Browser pass (Chromium, 1280 × 800, page already running): switching the emulated colour scheme to
  light turned the body to `#f2efe4` with `color-scheme: light` and recoloured the mounted canvas in
  place — dark ink beads and lavender strands on paper — without a reload; switching back restored
  `#08090a` and `#edf1f1`. The action showed its jet ring on paper; the history drawer's heading,
  counts, search field, and empty state read as dark text on paper. The idle page drew no further
  frames after the switch. No console errors or failed requests.
- The canvas label read "A sparse web. Anansi waits at its centre." in both modes.

## Verified on 2026-10-18 (still true, not re-measured)

- Idle: zero frames over two second readings at 0, 45, and 60 days. A search moved Anansi to the
  first anchor at 208 ms, the second at 407 ms, home by 907 ms; the camera reached `z 6.5`; the
  filament drew on the reveal; 118 `gl.render` calls measured 1.2 ms median, 2.1 ms p95, 2.5 ms max
  on Intel UHD Graphics.
- Density and the phone tier: 5/10/15 objects at 0/45/60 days, camera `z 11.02` and touch tilt
  0.095 on a 390 × 844 viewport.

## Not verified, and why

The reduced motion branch has still not been taken live — the browser tools can emulate the colour
scheme but not `prefers-reduced-motion` — so the zero-impulse objects, the in-place search, and the
snap-to-frame camera rest on unit tests (R17). The error boundary has never caught a real scene
throw. The frame-time figure is time inside `gl.render`, not a GPU timer. Lighthouse and first
usable interaction are Phase 9's. Light mode has not been judged on a real phone or in daylight.

## Next justified action

Phase 7.2, the sun and moon switch: a keyboard-operable control whose choice persists and overrides
the system preference, reduced-motion safe, and integrated into the world rather than bolted on. It
must work with the existing token swap (a `data-mode` attribute is the natural override for the
media query) and with `WorldLayer`'s mode read. Then 7.3's `/imprint` pass. The Phase 6 work, the
21 skill packs, and 7.1 are committed locally and not pushed.
