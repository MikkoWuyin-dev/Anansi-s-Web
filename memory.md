# Session memory

Handoff for the next agent. Read `AGENTS.md` and `KNOWLEDGE INDEX.md` first; this file records
working state, not requirements.

## Where the project is

Phase 6 (the 3D world) is in progress: the canvas, the web graph, and the authored camera are
built, and the ritual is unchanged without them. On 2026-10-18 the stage was designed in
`docs/specs/0005-the-3d-stage.md` and steps 6.1 to 6.3 were built.

- Spec: `docs/specs/0005-the-3d-stage.md` (`In Progress`, built line names 6.1 to 6.3; scope
  features 8 and 9 are `in-progress` with their build milestones ticked, and roadmap 6.1 to 6.3
  are marked built).
- Code: `src/world/graph.ts` (the seeded generator), `camera.ts` (the beat frames and the parallax
  bound), `palette.ts` (tokens), `stage.ts` (beats and the description), `Scene.tsx` (the lazy
  canvas), `Web.tsx` (the drawn web), `CameraRig.tsx` (the easing rig), and
  `src/app/WorldLayer.tsx` (the arming, the guards, the label, the media queries).
- Tests: 51 new, so `src/app/` holds 62, `src/world/` holds 45, and the suite is 266 in 23 files.
- Records: teardown at v3.3, MCD §13, roadmap Phase 6, the scope, `ui-registry.md` (Stage), the
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
- The dev-only `window.__anansiStage` hook reports the frame counter, the last draw's counts, and
  the camera position. Production builds drop it.
- The camera eases rather than snapping, and it stops by not invalidating once it is within 0.002
  units of the frame. That is why an idle page stays at zero frames with a camera in the scene.
  `useFrame` running inside a demand loop is the mechanism: it asks for the next frame only while
  there is somewhere left to go.
- Reduced motion is read once in `WorldLayer` and passed down, so no world module touches
  `matchMedia`; the rig snaps to the frame and ignores the pointer when it is true.

## Verified on 2026-10-18

- `npm run verify` → exit 0 (266 tests in 23 files; content and documentation checks clean; build;
  shell 56.48 kB gzip, scene 221.12 kB gzip against the 350 kB budget).
- Browser pass: the canvas mounted after the first contentful paint (`anansi:stage-armed` mark at
  754 ms, FCP 754 ms), an idle page drew zero frames over two seconds, a search advanced the frame
  counter once per beat and stopped, the label followed the beats, the drawn geometry was 11 beads
  and 20 strands on desktop and 9 and 16 at 390 px, the canvas ratio stayed at the device ratio
  under the 1.5 cap, `elementFromPoint` never returned the canvas, and the desktop screenshot
  showed the web behind the title.
- Camera evidence from the same session: the idle frame was `[0, 0.35, 7.6]` on desktop, a search
  moved the camera from the idle frame to the revealing frame (`z 6.5`) and stopped there, the
  phone tier framed the same beat at `z 9.425` (6.5 × 1.45), the parallax never left its 0.14
  unit bound, a wheel and a scroll event changed nothing, and the idle page still drew zero
  frames.
- Three mutation probes: ignoring the graph seed fails the determinism test, giving two beats one
  sentence fails the description test, and dropping the pointer clamp fails the parallax bound
  test. All were reverted byte for byte.

## Not verified, and why

The WebGL probe and the error boundary have not been exercised in a browser (refusing WebGL needs a
browser flag or a profile change), so AC-17 rests on their shape. The camera's reduced motion
branch has not been taken live either: the media query cannot be flipped from the page, so it rests
on the unit test for zero parallax and on code. The parallax checks ran against the real cursor
rather than a scripted one, because the preview tab's frame scheduling is bursty under software
WebGL. The objects, Anansi, the springs, and the 16 ms search frame time are unbuilt.

## Next justified action

Step 6.4, the object families: one seeded parametric generator per family (clocks, keys, eyes,
books, planets) returning geometry, material, and idle motion, anchored to the graph's anchors.
Then 6.5 Anansi, 6.6 the search choreography that retires the 900 ms pause, 6.8 springs, 6.9 the
reduced motion and touch pass, and 6.10 the measured scene budget. No approval gate is open; the
Phase 6 work is committed locally and not pushed.
