# Session memory

Handoff for the next agent. Read `AGENTS.md` and `KNOWLEDGE INDEX.md` first; this file records
working state, not requirements.

## Where the project is

Phase 6 (the 3D world) is built: steps 6.1 to 6.10 all landed on 2026-10-18. The canvas, the
seeded graph, the authored camera, five object families, a procedural Anansi, the 1400 ms search
choreography, the springs, the reduced motion and touch tiers, and the measured budget all exist,
and the ritual is unchanged without them.

- Spec: `docs/specs/0005-the-3d-stage.md` (`In Progress`, the built line names 6.1 to 6.10, 86
  world tests). Scope features 8 to 11 are `in-progress` with their build milestones ticked, and
  roadmap 6.1 to 6.10 are marked built.
- Code: `src/world/` holds `graph.ts`, `families.ts`, `spider.ts`, `choreography.ts`, `density.ts`,
  `camera.ts`, `palette.ts`, `stage.ts`, `Scene.tsx`, `Web.tsx`, `Objects.tsx`, `Anansi.tsx`, and
  `CameraRig.tsx`; `src/app/WorldLayer.tsx` arms the scene and reads both media queries;
  `src/app/ritual.ts` holds the reveal for the choreography and maps the `celebrating` beat.
- Tests: 41 new, so `src/app/` holds 63, `src/world/` holds 86, and the suite is 308 in 27 files.
- Records: teardown at v3.4, MCD §13, roadmap Phase 6, the scope, `ui-registry.md`, the knowledge
  index, and `AGENTS.md` §14 all reconciled.

## Decisions a reader cannot infer from the code alone

- `families.ts` and `spider.ts` are not named `Objects.ts` or `Anansi.ts` for the same reason
  `Web.tsx` is not `Graph.tsx`: Windows and TypeScript treat the names as the same file, and both
  the typecheck and the module graph break. Keep a different stem for the pure module beside a
  component.
- The search's duration is the choreography's `SEARCH_MS` (1400 ms) imported by `ritual.ts`. The
  engine decides and records the story first, then the reveal waits for the movement. The old
  900 ms pause is gone; the controller boundary (an injected `wait`, skipped under reduced motion)
  is what made the swap safe.
- `celebrating` is transient in `App.tsx`: `beatFor(view, celebrating)` returns it for 900 ms after
  a story is taken, then the view rests. It is skipped under reduced motion.
- Anansi's travel is a spring of a scalar progress from 0 to 1 through a keyframed path, not a
  spring of position. Leaving the searching beat resets the progress to 0 rather than springing
  back to it, because that would retrace the whole route home. He is already near the hub by the
  time the reveal arrives.
- `Web.tsx` mounts the yellow filament at zero opacity all the time so its shader compiles with
  the stage. Before that, the first reveal paid a 60 to 90 ms compile in the middle of the search.
- `@react-spring/three` writes animated values to the three object itself, and the demand
  frameloop will not draw unless something invalidates. Each spring is given
  `onChange: () => invalidate()`, and the camera also invalidates while its tilt is animating.
  Without that, a tilt moved the spring but never the picture.
- `Objects.tsx` draws each family as one instanced mesh inside one `animated.group`; the impulse is
  group scale and lean, so twenty objects remain five draw calls and the matrix painting happens
  once per graph, not per frame.
- The scene's dev hook now exposes `gl` and the object count (through a ref, because the hook is
  created once) and Anansi writes `window.__anansiSpider`. All of it is dropped in production.
- The world stays a leaf: it imports the engine's seeded stream, React, three, the renderer, and
  the springs, and never the app, the state layer, or the content. `purity.test.ts` also fails if
  anything but `Anansi.tsx` imports `spider.ts`, or anything but `Scene.tsx` imports `Anansi.tsx`.

## Verified on 2026-10-18

- `npm run verify` → exit 0 (308 tests in 27 files; content and documentation checks clean; build;
  shell 57.14 kB gzip, scene 238.02 kB gzip against 250 and 350).
- Browser pass (1280 × 800, Intel UHD Graphics): the stage armed after the shell; zero idle frames
  over two second readings at 0, 45, and 60 days; a search moved Anansi to the first anchor at 208
  ms and the second at 407 ms, held, and was home by 907 ms; the camera reached the revealing frame
  (`z 6.5`); the label followed every beat; the filament drew on the reveal; `celebrating` lasted
  900 ms and became `resting`; 118 `gl.render` calls measured 1.2 ms median, 2.1 ms p95, 2.5 ms
  max, none over 16 ms; 15 objects at 60 days drew 226 strand vertices and 28 draw calls.
- Density live: 5 objects and 40 line vertices at day 0, 10 and 140 at day 45, 15 and 226 at day 60,
  same generators. The count read `45 / 90` and `60 / 90` from seeded progress.
- Phone tier (390 × 844): 10 objects at 60 days, 120 line vertices, camera `z 11.02`, touch tilt
  moved the camera 0.095 and settled inside the 0.098 bound, and the idle page returned to zero
  frames after the tilt.
- One incidental live check of the WebGL probe: a tab whose contexts were exhausted never mounted
  the stage, showed no error, and the ritual stayed fully operable.

## Not verified, and why

The reduced motion branch has still not been taken live: the preview cannot emulate the media
query, so the zero-impulse objects, the in-place search, and the snap-to-frame camera rest on unit
tests and code (R17). The error boundary has never caught a real scene throw. The frame-time figure
is the time spent inside `gl.render`, not a GPU timer. Lighthouse and first usable interaction are
Phase 9's. The reduced motion path of the world is the main thing to check first with an emulated
profile.

## Next justified action

Phase 7, starting with 7.1: light mode as a swapped token set. The stage already reads the
`--anansi-*` tokens at mount, so a second token set reaches the world without touching
`src/world/`. Then 7.2 the sun and moon switch and 7.3 the `/imprint` pass. The Phase 6 work is
committed locally and not pushed.
