# 0005. The 3D stage behind the ritual

**Date**: 2026-10-18
**Status**: In Progress
**Built**: 2026-10-18 — steps 6.1 to 6.3: the lazy canvas, the seeded graph, and the authored camera, 45 tests

## Summary

This spec builds the world the ritual has so far only described. One canvas loads after the page is already usable, a seeded web is drawn behind the text, and a small Anansi searches it when a story is asked for. The stage never becomes navigation: the camera is authored, the user touches the world but never pilots it, and the DOM carries the product even when the scene is absent.

## Context

Four phases built a complete ritual in the DOM, and the product still looks like a page. The PRD's central image is a physical diorama you peer into, and the MCD's D1 to D3 fix how it is built: one R3F canvas, procedural Memphis geometry, an authored camera, and on-demand rendering. What remains is the stage itself, and it is the largest single piece of the product: a graph, a camera, objects, a character, choreography, density, physical motion, and two fallbacks.

The constraints are unusually sharp for a build this size. The idle page must draw no frames, the scene chunk must stay under 350 kB gzip, the search must hold 16 ms frames, and every beat must survive with motion turned off and on a phone. There is no art pipeline and no imported asset: every object is a function of numbers, so the art direction lives in generator parameters and is cheap to tune and expensive to get wrong in code.

The risk is not that the world fails to render. It is that it grows into a second interface, competes with the reveal, or turns the ritual into a place to hang around. The stage has to stay a stage.

## Requirements

**User stories**:

- As a first time visitor, I want the page usable before the world arrives, so that curiosity is never waiting on a download.
- As a returning visitor, I want the web to look like mine, so that the journey feels accumulated rather than reset.
- As a person who asked for a story, I want to watch Anansi search, so that the reveal feels like an event rather than a spinner.
- As a person with reduced motion or a phone, I want the same ritual with the same information, so that the stage is an enhancement and never a gate.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: The hero line and the primary action are painted and operable before the scene module loads; the scene mounts only after the first paint, on an idle callback.
- **AC-2**: The stage is one canvas, fixed behind the shell, and it never receives pointer events; every control in the shell is clickable and focusable over it.
- **AC-3**: An idle page draws no frames. With no input, no beat change, and no resize, the renderer's frame count does not advance.
- **AC-4**: Frames are drawn only on explicit invalidation: mount, a beat change, a progress change, a resize, or a user interaction. No component runs a perpetual frame loop.
- **AC-5**: The graph is a pure function of a journey seed. The same seed produces an identical graph, node for node and strand for strand, in any session and any order of calls.
- **AC-6**: Density is a pure function of days completed: node and strand counts rise with the early, middle and late arc, never fall, and stay inside the scene budget at 90 days.
- **AC-7**: The graph exposes node indices as anchors, so objects and Anansi attach to the web without re-deriving geometry.
- **AC-8**: The camera is authored. There is no orbit control, no scroll to travel, and no pointer drag that moves the camera; cursor parallax and touch tilt are bounded modulation only.
- **AC-9**: Five beats (`idle`, `searching`, `revealing`, `celebrating`, `resting`) are explicit values the stage reacts to, and each has a framed camera position and a description.
- **AC-10**: Object families are seeded parametric generators that return geometry and material parameters from primitives; many instances of one family vary visibly yet read as one family.
- **AC-11**: Anansi is isolated in his own component. No other module imports his internals, and swapping his component for a modeled asset touches nothing else.
- **AC-12**: The search reads as a search, not a spinner, and the frame time stays at or under 16 ms on a mid range desktop.
- **AC-13**: Motion is spring based, no linear tween, and ambient life comes from bounded impulses, not a perpetual loop.
- **AC-14**: Under `prefers-reduced-motion` the web is still, the search resolves in place, there is no parallax, and every piece of information and every affordance is identical.
- **AC-15**: On a phone the stage keeps the same three beats with reduced density, a capped pixel ratio, and touch first equivalents.
- **AC-16**: The scene chunk is at or under 350 kB gzip, the shell stays at or under 250 kB gzip, and idle GPU work stays near zero.
- **AC-17**: When WebGL is unavailable or the scene throws, the ritual is unchanged and the failure is never shown to the person.
- **AC-18**: The stage carries an accessible description of the world's state that follows the beat, and the canvas is never focusable and never traps focus.
- **AC-19**: No hex colour literal appears anywhere in `src/world/`; materials read the palette tokens that already live in one place.

## Options considered

### Option 1: Keep the world in CSS

Draw the web with CSS transforms and a handful of absolutely positioned elements, with no canvas.

**Pros**:
- No new chunk, no WebGL, no frame budget.
- Trivial to keep accessible and reduced motion safe.

**Cons**:
- The MCD's D2 and D3 require a procedural 3D stage, and an authored camera cannot frame beats in CSS.
- Object families and density by multiplication are impossible without a scene graph.

### Option 2: A navigable 3D world

Give the camera to the user: orbit, zoom and scroll to travel through the web.

**Pros**:
- The richest sense of place, and the most obvious use of 3D.

**Cons**:
- Directly contradicts D1 and PRD §29, and turns time on site into the metric the product exists to avoid.
- Makes the mobile and reduced motion tiers much harder to keep identical.

### Option 3: An authored diorama over a seeded graph

One lazy canvas, a graph generated from the journey seed, a camera driven by the ritual's beats, procedural objects anchored to nodes, and a small Anansi who searches on cue.

**Pros**:
- Matches D1 to D3 exactly, and every beat is designed rather than emergent.
- Density and object variety come from multiplication, so the world grows without an asset pipeline.

**Cons**:
- The most code of any phase, with four performance constraints to hold at once.
- Art direction lives in numbers, so the first pass will need tuning.

### Option 4: A pre-rendered scene with DOM parallax

Ship a rendered image or short loop of the web and layer the DOM over it.

**Pros**:
- Predictable cost and the smallest scene chunk.
- Looks finished on day one.

**Cons**:
- Cannot react, cannot evolve with progress, and cannot host a searching spider.
- Replacing it later is a rewrite, not a tuning pass.

## Decision

**Chosen option**: Option 3: An authored diorama over a seeded graph

The stage is one lazy canvas behind the shell, drawing a deterministic web whose density follows the journey, framed by an authored camera that answers five beats, with procedural objects and an isolated Anansi.

## Rationale

Option 1 cannot satisfy D2 and D3, and Option 2 contradicts the product's own reason for existing. Option 4 is the tempting shortcut, and it fails the two things the world is for: reacting to the person and reflecting their history. Option 3 costs the most up front and is the only one where the web is a function of the journey rather than a backdrop, which is what makes a returning visitor's web theirs and makes the search an event.

The sharp constraints are what make the choice safe rather than reckless. On-demand rendering means an idle page pays nothing; a seeded pure generator means the world is testable without a GPU; and the DOM carrying the product means the scene can fail without taking the ritual with it.

## Feature design

**Data model sketch** (nothing is persisted; the graph is derived on every mount):

```ts
type Beat = 'idle' | 'searching' | 'revealing' | 'celebrating' | 'resting'

interface WorldNode {
  id: string                 // 'node-<spoke>-<ring>'
  position: [number, number, number]
  radius: number             // bead size in world units
  depth: number              // -1 (far) to 1 (near), drives size and opacity
}

interface WorldStrand {
  from: number               // node index
  to: number                 // node index
  sag: number                // 0 to 1, how far the midpoint droops
}

interface WebGraph {
  seed: number
  nodes: WorldNode[]
  strands: WorldStrand[]
  anchors: number[]          // node indices objects may attach to
}

interface GraphInput {
  seed: string               // `${clientId}:${journeyStart}`
  days: number               // daysCompleted(progress)
  mobile: boolean            // reduced density tier
}
```

**State transitions**:

`idle → searching → revealing → celebrating → resting`, with `resting → searching` on a reroll and `resting → idle` at local midnight. The stage reads the ritual's own view; it never owns a transition.

**API surface**:

| Function | Key inputs | Key outputs | Errors |
|---|---|---|---|
| `graphFor(input: GraphInput)` | seed, days, mobile | `WebGraph` | none, total function |
| `densityFor(days, mobile)` | days, mobile | node and strand counts | none, clamped |
| `hashSeed(seed: string)` | seed string | 32 bit number | none |
| `beatFor(view: RitualView)` | the ritual view | `Beat` | none |
| `descriptionFor(beat, days)` | beat, days | one sentence | none |
| `readPalette(token)` | a token reader | `Palette` | throws on a missing token |
| `<WorldLayer beat days />` | beat, days | the canvas container | caught by its boundary |

**Value sourcing**:

| Value | Where it comes from |
|---|---|
| Journey seed | `identity.clientId` and `progress.journeyStart`, both already in the store |
| Days completed | `daysCompleted(progress)`, the same function the count uses |
| Beat | `ritualView(...)`, mapped by `beatFor` in `src/app/ritual.ts` |
| Density | `densityFor(days, mobile)`, inside the graph generator |
| Mobile tier | `window.matchMedia('(max-width: 40rem)')`, the same breakpoint the stylesheet uses |
| Palette | the `--anansi-*` custom properties on `:root`, read once at mount |
| Accessible description | `descriptionFor(beat, days)`, rendered as the container's `aria-label` |

**Key invariants**:

- `graphFor` is total and deterministic: no clock, no random source outside the seed, no DOM.
- Every strand index is a valid node index, and every node is reachable from the hub.
- Node count never exceeds 120 and strand count never exceeds 240 at 90 days.
- The stage never renders a topic field other than nothing at all: no title, domain, difficulty, or tag reaches the world.
- No component calls `useFrame` to animate on its own; every frame is invalidated on purpose.
- The canvas container is `pointer-events: none` and `aria-hidden` is never applied to the container that carries the description.

**Security model**:

Nothing leaves the browser. The stage reads no storage, writes none, and makes no request. The client id seeds the graph and is never displayed, logged, or sent. The accessible description names the state of the world only, never a topic.

**Configuration required**: none.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

- Determinism: two calls with one seed produce deeply equal graphs, and a different seed differs, verifies **AC-5**.
- Density: zero, forty five and ninety days produce rising node and strand counts inside the caps, and the mobile tier is never denser than the desktop tier, verifies **AC-6**, **AC-15**.
- Anchors: every anchor is a valid node index and anchors are stable for one seed, verifies **AC-7**.
- Idle: after the scene mounts, the frame count is read, two seconds pass, and it has not moved, verifies **AC-3**.
- Invalidation: a beat change advances the frame count by one or more, verifies **AC-4**.
- Shell first: with the scene chunk blocked, the hero and the action are still rendered and operable, verifies **AC-1**.
- No WebGL: with the context refused, the ritual renders and no error text appears, verifies **AC-17**.
- Description: each beat produces its own sentence, and the container carries it as its label, verifies **AC-18**.
- Palette: no `#rrggbb` literal appears in any `src/world/` source, and a missing token throws, verifies **AC-19**.
- Reduced motion: with the media query emulated, no animation runs and the search completes in place, verifies **AC-14**.
- Camera: the scene mounts no orbit or drag controls, and pointer movement never changes the camera's position beyond the parallax bound, verifies **AC-8**.

## Build plan

Ordered as a Tracer Bullet, like every phase before it: the smallest end to end stage first, a seeded graph drawn behind the shell, then the camera, then inhabitants, then choreography, then the two fallbacks, then the measurement.

1. Add the palette reader and the beat to description mapping, with the source scan that forbids hex literals in `src/world/`, satisfying **AC-9**, **AC-18**, **AC-19**.
2. Add the pure graph generator: seed hash, density curve, radial nodes with sagging strands, and anchors, satisfying **AC-5**, **AC-6**, **AC-7**.
3. Mount one lazy canvas behind the shell after first paint, with on demand rendering, explicit invalidation, a WebGL probe, an error boundary, and a pixel ratio cap, satisfying **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-15**, **AC-17**.
4. Draw the graph: one line segment buffer for every strand and one instanced mesh for every bead, satisfying **AC-2**, **AC-6**, **AC-7**.
5. Add the authored camera rig and the five beat timeline, with bounded parallax and no orbit, satisfying **AC-8**, **AC-9**.
6. Add the object families: clocks, keys, eyes, books and planets as seeded parametric generators anchored to nodes, satisfying **AC-10**.
7. Add Anansi behind his own component, resting on a strand and isolated from every other module, satisfying **AC-11**.
8. Add the search choreography and the reveal's single yellow filament, satisfying **AC-9**, **AC-12**, **AC-13**.
9. Wire density to progress on every store change and cap it for the mobile tier, satisfying **AC-6**, **AC-15**.
10. Convert the remaining motion to springs and bound the ambient impulses, satisfying **AC-13**.
11. Add the reduced motion path and the touch equivalents, satisfying **AC-14**, **AC-15**.
12. Measure the scene chunk, idle frames and search frame time, and reconcile the budgets in the teardown, satisfying **AC-16**.

## Consequences

**Positive**:
- The product finally looks like the thing the PRD describes, and the search becomes an event instead of a pause.
- The world is testable without a GPU, because geometry and density are pure functions of the journey.
- A returning visitor's web is theirs, from the same client id the engine already uses.

**Negative / tradeoffs**:
- The scene is the largest chunk in the build, and three.js is the one dependency whose size cannot be argued away.
- Authoring an aesthetic in numbers takes tuning passes, and the first render will look rougher than the document imagines.
- The DOM and the scene can disagree: a beat is known to both, and every new beat has to be handled twice.

**Neutral**:
- The existing CSS web decorations stay until the scene proves it can carry the frame alone.
- The stage mounts only after first paint, so the first seconds remain exactly what the product is today.

## Follow-up

- [ ] The scene chunk's actual gzip size is measured in step 12, and the teardown's budget table gains a real number.
- [ ] Frame time is measured on real hardware, not inferred, before AC-12 is claimed.
- [ ] The CSS strand decorations are retired once the scene reads as the web.
- [ ] `ui-registry.md` gains the stage's patterns after the camera pass.

## References

**Project sources**:
- `docs/MCD.md` §4 (the ten world rules), §7 (palette tokens), §8 (budgets), §9 (accessibility)
- `docs/PRD.md` §7 (search animation), §20 (evolving web), §26 (Anansi), §28 to §31 (aesthetic, web, objects, interaction), §35 (performance), §36 (accessibility)
- `docs/BUILD_ROADMAP.md` Phase 6, sections 6.1 to 6.10
- `docs/specs/0003-ritual-loop.md` (the ritual view the beats read), `docs/specs/0004-history-drawer-and-journey-count.md` (the count and the store read)
- `src/engine/rng.ts` (the seeded stream the graph reuses)

**Practices & standards**:
- Pure generation tested without a renderer, the same pattern as the engine
- On demand rendering with explicit invalidation
- Progressive enhancement: the DOM carries the product, the canvas is an enhancement
