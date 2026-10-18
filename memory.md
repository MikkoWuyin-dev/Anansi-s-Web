# Session memory

Handoff for the next agent. Read `AGENTS.md` and `KNOWLEDGE INDEX.md` first; this file records
working state, not requirements.

## Where the project is

Phase 6 (the 3D world) is in progress: the canvas and the web graph are built, and the ritual is
unchanged without them. On 2026-10-18 the stage was designed in
`docs/specs/0005-the-3d-stage.md` and steps 6.1 and 6.2 were built.

- Spec: `docs/specs/0005-the-3d-stage.md` (`In Progress`; scope feature 8 is `in-progress` with
  its first four milestones ticked, and roadmap 6.1 and 6.2 are marked built).
- Code: `src/world/graph.ts` (the seeded generator), `palette.ts` (tokens), `stage.ts` (beats and
  the description), `Scene.tsx` (the lazy canvas), `Web.tsx` (the drawn web), and
  `src/app/WorldLayer.tsx` (the arming, the guards, the label).
- Tests: 34 new, so `src/app/` holds 62, `src/world/` holds 28, and the suite is 249 in 22 files.
- Records: teardown at v3.2, MCD §13, roadmap Phase 6, the scope, `ui-registry.md` (Stage), the
  knowledge index, and `AGENTS.md` §14 all reconciled.

## Decisions that a reader cannot infer from the code alone

- The stage's art direction was chosen by the owner across four questions: a web strung in a dark
  void (not a room), the same canvas on phones with reduced density, Anansi as a small resting
  silhouette, and one restrained reveal beat with a single yellow filament. Only the graph and the
  canvas exist so far, so the last two are recorded in the spec and not yet visible.
- The graph is a radial web with irregular spokes and rings, drawn from `hashSeed` of
  `clientId:journeyStart`. It returns plain data with no three.js import, which is why 13 tests can
  pin it in the node environment. Strand count is exactly twice spokes times rings.
- The graph's `seed` field is only a label. The determinism test compares `nodes`, `strands`, and
  `anchors`, because the first version compared whole objects and passed even when the seed was
  ignored. That was found by a mutation probe, not by the test.
- The scene is armed after two animation frames, not one: a React effect can run before the first
  paint, and one `requestAnimationFrame` still runs before it. Two frames guarantee a paint, and
  the dev marker `anansi:stage-armed` is how the browser pass proves it.
- `Web.tsx` is not named `Graph.tsx` on purpose: Windows and TypeScript treat `graph.ts` and
  `Graph.tsx` as the same file name, and the typecheck fails.
- Colours are read from the `--anansi-*` custom properties at mount, so no hex exists in
  `src/world/`. A missing token throws, the boundary catches it, and the ritual carries on.
- `src/world/` is a leaf: it imports only the engine's seeded stream, React, three, and the
  renderer. `purity.test.ts` enforces that, the no-colour-literal rule, and the absence of orbit
  controls and animation loops.
- The dev-only `window.__anansiStage` hook reports the frame counter and the last draw's counts.
  Production builds drop it.

## Verified on 2026-10-18

- `npm run verify` → exit 0 (249 tests in 22 files; content and documentation checks clean; build;
  shell 56.43 kB gzip, scene 220.45 kB gzip against the 350 kB budget).
- Browser pass: the canvas mounted after the first contentful paint (`anansi:stage-armed` mark at
  754 ms, FCP 754 ms), an idle page drew zero frames over two seconds, a search advanced the frame
  counter once per beat and stopped, the label followed the beats, the drawn geometry was 11 beads
  and 20 strands on desktop and 9 and 16 at 390 px, the canvas ratio stayed at the device ratio
  under the 1.5 cap, `elementFromPoint` never returned the canvas, and the desktop screenshot
  showed the web behind the title.
- Two mutation probes: ignoring the graph seed fails the determinism test, and giving two beats one
  sentence fails the description test. Both were reverted byte for byte.

## Not verified, and why

The WebGL probe and the error boundary have not been exercised in a browser (refusing WebGL needs a
browser flag or a profile change), so AC-17 rests on their shape. The phone tier has no screenshot
at that width: the preview compositor refused captures after the resize, so it was verified by the
drawn counts and the pixel ratio instead (R17). The stage has no motion yet, so reduced motion is
trivially satisfied and the camera, objects, Anansi, and the 16 ms search frame time are unbuilt.

## Next justified action

Step 6.3, the authored camera: the five beat timeline with bounded parallax, no orbit, and a framed
position for every beat. Then 6.4 object families, 6.5 Anansi, 6.6 the search choreography that
retires the 900 ms pause, 6.8 springs, 6.9 the reduced motion and touch pass, and 6.10 the measured
scene budget. No approval gate is open; the Phase 6 work is committed locally and not pushed.
