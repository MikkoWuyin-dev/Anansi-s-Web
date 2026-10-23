# Scope: Anansi's Web

A daily ritual where someone asks a living web for one story, receives a title and nothing else, then leaves to research it and explain it aloud in their own words. Built for curious adults who want a reason to think about something new each day, not a course to complete.

**Reconciled 2026-10-22** against the code and `npm run verify`: features 1 to 12 were built, their suites are in place and the gate is green, so their build, verify and test boxes are ticked on that evidence rather than on a fresh run of each ritual. `npm run docs:check` now fails when a row here disagrees with its own section or when a section with nothing left to do is still marked `in-progress`.

**Build approach:** Tracer Bullet (vertical slices; prove the whole pipe works end to end before building any part of it fully). (basis: `docs/BUILD_ROADMAP.md` already orders content, then engine, then state, then loop, then world, and its own practical start ships 40 to 60 topics before growing to the full pool, so the sequence already agrees with this approach).
**Workflow:** Beta (after `/develop`, `/check verify` then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less. (basis: a real product with performance budgets and accessibility requirements, but no payments, accounts, or personal data, so `GA` is not warranted).

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

Phase order mirrors `docs/BUILD_ROADMAP.md`, so this scope and the roadmap read in the same direction. (basis: `docs/BUILD_ROADMAP.md`).

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Product and technical specification | Enrolled | existing |
| B | Build scaffold | Enrolled | existing |
| C | DOM shell | Enrolled | existing |
| D | Content schema and authoring pipeline | Enrolled | done |
| E | Engine primitives | Enrolled | existing |
| F | Session and governance rituals | Enrolled | existing |
| 1 | Selection engine | Foundation | done |
| 2 | Local state and persistence | Foundation | done |
| 3 | Content pool to launch size | Foundation | in-progress |
| 4 | The daily ruling and the reveal | Slice 1 | done |
| 5 | Taking a story, and the journey count | Slice 1 | done |
| 6 | An accessible loop with honest states | Slice 1 | done |
| 7 | The history drawer | Slice 2 | done |
| 8 | The canvas and the web graph | Slice 3 | done |
| 9 | The authored camera and the search | Slice 3 | done |
| 10 | Object families, Anansi, and density | Slice 3 | done |
| 11 | The world without motion, and on mobile | Slice 3 | done |
| 12 | Light mode and the sun and moon switch | Slice 4 | done |
| 13 | The evolving web and hidden interactions | Slice 5 | done |
| 14 | Measured performance and accessibility | Quality | done |
| 15 | The display face and its network cost | Quality | done |
| 16 | Continuous integration and dependency decisions | Release | done |
| 17 | Deploy the static site | Release | in-progress |

## Enrolled

### A. Product and technical specification · existing
The four documents that govern everything — product truth, technical truth, build order, and the dated state assessment — plus the feature specs and the scope record. The root navigation index was folded into `AGENTS.md` on 2026-10-20. code in `docs/`

### B. Build scaffold · existing
A Vite, React, and TypeScript single page app in strict mode that typechecks, tests, and builds, with the palette carried as CSS custom properties. code in `package.json`, `vite.config.ts`, `tsconfig.json`

### C. DOM shell · existing
The hero line, the primary action, the live region, and the first procedural strands, with reduced motion already honoured. code in `src/app/`

### D. Content schema and authoring pipeline · done
Types, schema validation, near duplicate detection, coverage reporting, bundle compilation, and the loader, with a reviewed pool that is still short of the 300 topic target (`npm run content:report`). code in `src/content/`, `scripts/`, `content/topics/`

### E. Engine primitives · existing
The pure engine holds the selection entry point, the frozen tuning object, the contract shapes, the local day key and the seeded random source, with the purity boundary enforced by test. code in `src/engine/`

### F. Session and governance rituals · existing
The rituals from the master context document: `AGENTS.md` is written, `ui-registry.md` and `memory.md` were created alongside this scope, and `KNOWLEDGE INDEX.md`, added on 2026-10-17, was folded into `AGENTS.md` on 2026-10-20, when `memory.md` became the single record of current state. code in `AGENTS.md`, `CLAUDE.md`, `ui-registry.md`, `memory.md`

## Foundation

### 1. Selection engine · done
The heart of controlled serendipity: from the pool, the day, and the history log, choose the day's story and any rerolls, deterministically, and without ever feeling mechanical.
**Done when:** two calls for the same day return identical offers; no topic offered in the last 30 days can be offered again; a long generated sequence shows no run of three same domain topics and no visible rotation; and a return is confined to flagged topics after a 60 day absence at about one day in seven, the guaranteed weekly cap having been traded for that tuned chance (spec 0001, 2026-10-16).

spec [0001](../specs/0001-selection-engine.md)

- [x] Design it (spec): `/architect selection engine`
- [x] Build it: `/develop selection engine`
  - [x] The contract and the frozen tuning object
  - [x] The day's guards, purity, and one reproducible story per call
  - [x] The 30 day window, the day's own exclusions, and the thin pool fallback
  - [x] Scoring, the rolling difficulty spread, and the return rule with its rarity roll
- [x] Verify it: `/check verify`
- [x] Test it: `/test`

### 2. Local state and persistence · done
Keep the journey in the browser under the `anansi:v1:*` namespace so a reload, a restart, or a damaged store never loses the ritual or breaks it.
**Done when:** state written in one session returns identical after a reload; a hand edited store containing garbage starts a fresh day instead of crashing; a stale day key rolls over at local midnight; and history older than 30 days prunes itself.

spec [0002](../specs/0002-local-state-and-persistence.md)

- [x] Design it (spec): `/architect local state and persistence`
- [x] Build it: `/develop local state and persistence`
  - [x] The four validated stores and the storage seam
  - [x] The day's rollover, the 30 day prune, the tally and the journey roll
  - [x] The generated client id and the per day stream
  - [x] Cross tab rehydration, and a storage failure that never throws
- [x] Verify it: `/check verify`
- [x] Test it: `/test`

### 3. Content pool to launch size · in-progress
Grow the reviewed pool from the current seed pool to the launch target, with the spread across domains and difficulty that the engine needs to feel like serendipity.
**Done when:** the pool holds 300 or more reviewed topics covering every domain, validation reports no coverage gap, and the compiled bundle stays at or under 150 kB gzip.
- [ ] Build it: `/develop content pool to launch size`

The review gate and promotion steps already exist, so this needs execution rather than a new decision. (basis: `content/review/README.md` documents the reading against the quality philosophy and the exclusions, and the four promotion steps).

## Slice 1: the daily ritual

The walking skeleton. This is the thin real thread through content, engine, state, and interface, and it is the whole product promise: it must work with no 3D at all, which is why it is built before the stage.

### 4. The daily ruling and the reveal · done
Ask for a story, watch the search resolve, and receive one title with nothing attached to it.
**Done when:** a search offers a title only, with no definition, summary, category, or difficulty anywhere in the DOM; up to two rerolls never repeat a story already offered today; the third story becomes the day's story and stays identical until local midnight; and every story shown, rerolled or not, is recorded as Explored.
code in `src/app/`

spec [0003](../specs/0003-ritual-loop.md)

- [x] Design it (spec): `/architect daily ruling and reveal`
- [x] Build it: `/develop daily ruling and reveal`
  - [x] The thin thread: subscribe to the store, the search beat, and the title alone (AC-1, AC-2, AC-5, AC-15)
  - [x] The ruling: two rerolls, no repeat, and the sealed third story (AC-3, AC-4)
  - [x] The resurfacing line and its lavender accent, including after a reload (AC-8)
  - [x] Markup tests that fail if domain, difficulty, or tags reach the DOM (AC-2, AC-16)
- [x] Verify it: `/check verify daily ruling and reveal`
- [x] Test it: `/test daily ruling and reveal`

### 5. Taking a story, and the journey count · done
Let the person take the story and later mark it understood, and show a quiet count of how far the journey has come.
**Done when:** taking a story records the day and advances the count exactly once; the counter reads from taken days only and shows no streak, warning, or penalty for a missed day; and marking a story Learned persists and appears in the history filters.
code in `src/app/`, `src/state/`

spec [0003](../specs/0003-ritual-loop.md)

- [x] Design it (spec): `/architect taking a story and the journey count`
- [x] Build it: `/develop taking a story and the journey count`
  - [x] Taking a story, closing the day's ruling, and counting the day once (AC-6)
  - [x] The inline learned mark, and its state after a reload (AC-7)
  - [x] The quiet journey count on the taken state, built in Phase 5.2, not in spec 0003
- [x] Verify it: `/check verify taking a story and the journey count`
- [x] Test it: `/test taking a story and the journey count`

### 6. An accessible loop with honest states · done
The ritual has to complete by keyboard alone, and it must never show a blank screen when the pool is empty, a load fails, or the search is still running.
**Done when:** the whole loop completes with the keyboard alone and with reduced motion set; focus is always visible; the reveal and each reroll are announced in a live region; and the empty, error, and loading states each say what happened and what to do next.
code in `src/app/`

spec [0003](../specs/0003-ritual-loop.md)

- [x] Design it (spec): `/architect accessible loop and honest states`
- [x] Build it: `/develop accessible loop and honest states`
  - [x] The empty pool, the failed search with Try again, and the blocked storage line (AC-9, AC-10, AC-11)
  - [x] Keyboard, focus, and live region across the whole loop (AC-12)
  - [x] Reduced motion parity, and the midnight rollover while open (AC-13, AC-14)
  - [x] The node suite and the real browser pass (AC-16)
- [x] Verify it: `/check verify accessible loop and honest states`
- [x] Test it: `/test accessible loop and honest states`

## Slice 2: continuity

### 7. The history drawer · done
The plain practical list the ritual needs alongside the metaphor: the rolling 30 days, searchable and filterable, with the quiet journey count beside it.
**Done when:** the drawer lists the rolling 30 day history and can be searched and filtered by All, Explored, and Learned; it is reachable and operable by keyboard; and it reads from the same store rather than keeping its own copy.
code in `src/app/`

spec [0004](../specs/0004-history-drawer-and-journey-count.md)

- [x] Design it (spec): `/architect history drawer`
- [x] Build it: `/develop history drawer`
  - [x] The view: visible rows joined to titles, grouped by day, with the filters as a partition (AC-2, AC-4, AC-7)
  - [x] Search and the honest empty states (AC-5, AC-6)
  - [x] The count, the day labels, and the corner control wired to the live store (AC-1, AC-8, AC-10, AC-11)
  - [x] Focus, Escape, reduced motion, and the markup purity test (AC-3, AC-9, AC-12, AC-13, AC-14)
- [x] Verify it: `/check verify history drawer`
- [x] Test it: `/test history drawer`

## Slice 3: the stage

The world thickens the display segment of the thread that already runs. It is built here because it choreographs beats that must exist first.

### 8. The canvas and the web graph · done
A single lazy loaded canvas behind the already painted shell, holding a generated web of nodes and strands that a returning visitor can recognise as theirs.
**Done when:** the hero and the action are usable before the scene loads; an idle page draws no frames; the same seed reproduces the same graph exactly; and objects can anchor to nodes.
code in `src/world/`, `src/app/`

spec [0005](../specs/0005-the-3d-stage.md)

- [x] Design it (spec): `/architect the stage`
- [x] Build it: `/develop the stage`
  - [x] The palette reader, the beats, and the description, with the source scan that forbids colour literals (AC-9, AC-18, AC-19)
  - [x] The seeded graph: density, strands, anchors (AC-5, AC-6, AC-7)
  - [x] The lazy canvas after first paint, on demand rendering, the WebGL probe, the boundary, the pixel ratio cap (AC-1, AC-2, AC-3, AC-4, AC-15, AC-17)
  - [x] The graph drawn as one strand buffer and one bead mesh (AC-2, AC-6, AC-7)
- [x] Verify it: `/check verify the stage`
- [x] Test it: `/test the stage`

### 9. The authored camera and the search · done
The search as an event rather than a spinner: the web wakes, Anansi moves between strands and returns with a story, framed throughout by a camera the visitor never drives.
**Done when:** there is no free orbit and no travelling by scroll; every beat from idle to resting is framed by design; the search reads as a searching spider; and frame time stays at or under 16 ms on a mid range desktop.
code in `src/world/`

spec [0005](../specs/0005-the-3d-stage.md)

- [x] Design it (spec): `/architect the stage`
- [x] Build it: `/develop the stage`
  - [x] The authored camera: five beat frames, a bounded pointer tilt, no orbit or scroll travel (AC-8, AC-9)
  - [x] The search choreography: the web wakes, Anansi moves and returns, and the 900 ms pause retires (AC-9, AC-12, AC-13)
- [x] Verify it: `/check verify the stage`
- [x] Test it: `/test the stage`

### 10. Object families, Anansi, and density · done
One seeded generator per object family, a procedural Anansi whose character comes from motion rather than mesh detail, and a web whose richness follows the journey.
**Done when:** many instances of one family look varied yet unmistakably related; Anansi's component can be swapped for a modelled asset without touching anything else; and an early journey renders sparse while a late one renders dense from the same generators.
code in `src/world/`

spec [0005](../specs/0005-the-3d-stage.md)

- [x] Design it (spec): `/architect the stage`
- [x] Build it: `/develop the stage`
  - [x] Five seeded families, one primitive each, drawn as five instanced meshes (AC-10)
  - [x] Anansi isolated in his own component, with nothing else importing his internals (AC-11)
  - [x] Objects per family and beat impulse as a pure function of the journey (AC-6, AC-10)
- [x] Verify it: `/check verify the stage`
- [x] Test it: `/test the stage`

### 11. The world without motion, and on mobile · done
The stage has to stay fully understandable when motion is reduced, and has to survive on a phone without losing the mystery.
**Done when:** under reduced motion the web is still and the search resolves in place with identical information and affordances; the mobile tier keeps all three beats intact with touch first interactions; and the scene chunk stays at or under 350 kB gzip with the shell at or under 250 kB gzip.
code in `src/world/`, `src/app/`

spec [0005](../specs/0005-the-3d-stage.md)

- [x] Design it (spec): `/architect the stage`
- [x] Build it: `/develop the stage`
  - [x] Reduced motion: static objects, Anansi at the hub, the search in place, no tilt (AC-14)
  - [x] The phone tier: thinner graph and objects, pulled-back frames, touch tilt (AC-15)
  - [x] The measured budgets, both chunks inside their caps and zero idle frames (AC-16)
- [x] Verify it: `/check verify the stage`
- [x] Test it: `/test the stage`

## Slice 4: modes

### 12. Light mode and the sun and moon switch · done
A swapped token set for daylight and a playful switch that belongs to the world rather than sitting on top of it.
**Done when:** both modes pass contrast checks for text, controls, and focus states; the switch works by keyboard and the choice persists; and its transition respects reduced motion.
- [x] Design the token set (spec): `docs/specs/0006-the-light-token-set.md` (2026-10-20), which leaves the switch to its own decisions
- [x] The light token set, its roles, and the contrast contract (7.1, 2026-10-20): a second set on the document attribute, three role tokens, `src/app/tokens.test.ts` over both sets, and the stage recolouring on a mode change
- [x] The sun and moon switch (7.2, 2026-10-20): one authority on `<html data-mode>`, the choice under `anansi:v1:mode` applied before the first paint, a live system preference when nothing is chosen, and a view transition reduced motion removes (spec `0007`)
- [x] Verify both modes: `/check verify light mode`
- [x] Imprint both token sets: roadmap 7.3, reviewed against the code on 2026-10-20

## Slice 5: the web grows

### 13. The evolving web and hidden interactions · done
Make accumulated history visible so a returning visitor feels they built this, and add small rewards for curiosity that can never interfere with the ritual.
**Done when:** a returning visitor can see their history in the world without reading a list; removing every hidden interaction leaves the main path unchanged; and none of them can interrupt the core task.

spec [0008](../specs/0008-the-evolving-web.md) · [0009](../specs/0009-hidden-interactions.md)

- [x] Design the evolving web (spec): `docs/specs/0008-the-evolving-web.md` (2026-10-20)
- [x] One standing thread and knot per kept day, from the tally, in two extra draw calls (8.1, 2026-10-20)
- [x] A kept story's filament holds instead of fading, and the canvas description names the weave
- [x] Decide the hidden interactions (8.2): the word, the `naming` beat, and the two reactions that need no input (spec 0009, 2026-10-22)
- [x] Build the hidden interactions (8.2): the word, the naming beat, the sealed clocks, and the kept knot (2026-10-22)

## Quality

### 14. Measured performance and accessibility · done
Replace aspirations with numbers: measure every budget, and audit the experience honestly, including what is not yet true.
**Done when:** every budget is measured and met or explicitly accepted by the owner (shell, scene, compiled bundle, first usable interaction, idle graphics work, frame time, Lighthouse on desktop and mobile); the accessibility audit passes for keyboard, focus, contrast, screen reader controls, and a canvas that describes the world's state; and findings are triaged with the blocking ones fixed.
spec [0010](../specs/0010-measured-quality.md)

- [x] Design it (spec): `docs/specs/0010-measured-quality.md` (2026-10-23)
- [x] Measure every budget against the production build and record the verdicts (9.1, 2026-10-23)
- [x] Audit the keyboard path, heading outline, contrast, canvas description and live region (9.2, 2026-10-23)
- [x] Triage the three-layer review's findings (9.4, 2026-10-23)

One budget is accepted rather than met: Lighthouse mobile scores 69 to 73 against 75, and the owner chose on 2026-10-23 to keep the world immediate and record the miss (`docs/reviews/2026-10-23-phase-9.md`).

### 15. The display face and its network cost · done
The display face was fetched from a third party on every visit, which sat against the product's own principle of sustainable web design.
**Done when:** serving it from our own origin, or consciously accepting the external request, is a recorded decision with its reasoning, rather than something that happened by default.
spec [0011](../specs/0011-the-display-face.md)

- [x] Design it (spec): `docs/specs/0011-the-display-face.md` (2026-10-23)
- [x] Self-host the latin variable subset, preload it, and ship its licence (9.3, 2026-10-23)

## Release

### 16. Continuous integration and dependency decisions · done
The branch is protected by the gate, but six development advisories wait on upgrades that break major versions and need a deliberate call.
**Done when:** every push and pull request runs typecheck, tests, and content validation, and a deliberately broken commit fails the check; and the advisories are either resolved with the suite green or deferred with the reasoning written down.
spec [0012](../specs/0012-toolchain-currency.md)

- [x] Design it (spec): `docs/specs/0012-toolchain-currency.md` (2026-10-23)
- [x] Prove the failure half of the gate for typecheck, content, tests and docs, without a red commit on `main` (10.1, 2026-10-23)
- [x] Upgrade to Vite 8, Vitest 5 and plugin-react 6 with the suite green and zero advisories (10.2, 2026-10-23)

### 17. Deploy the static site · in-progress
Put the finished ritual on a static host with no backend and no accounts, so it can be reached for real.
**Done when:** the built site is live, the budgets still hold in production, and there is still no authentication of any kind.
spec [0013](../specs/0013-static-deploy.md)

- [x] Design it (spec): `docs/specs/0013-static-deploy.md` (2026-10-23)
- [x] Prepare the host, the asset Worker and the deploy manifest, and ratify no analytics for v1 (10.4, 2026-10-23)
- [x] Publish and verify the live site: serving, no auth, the ritual, Lighthouse desktop 89 and mobile 66 to 70 (10.4, 2026-10-23)
- [ ] Remove the host's injected analytics beacon, or amend the no-analytics decision
- [ ] Reconcile AC-5 with the host's 200 single-page fallback for unknown paths

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- **The accounts era**: cloud sync, cross device history, export and import, and optional analytics · needs a decision · GA
- **A domain filter for history**: offered only if real use shows it helps · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies, so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves, and each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` with 2 to 5 milestones; the tier's closing boxes (`Verify it` at Alpha and above, `Test it` at Beta and above) |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` and its milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is**; `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; at Beta the last stage is `/test` |

- **Next step** is the first unticked box, always a command or a tracked milestone.
- **needs a decision** before `planned` means run `/architect` first; otherwise go straight to `/develop`. The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, never here**: the scope carries only the milestone rollup.
- **Status** moves `planned` → `in-progress` → `done`, plus `existing` (built before the workflow) and `dropped` (cut from scope, kept for history). `done` means this workflow built and verified it; `existing` means it predates the workflow, and `/develop` and `/sync` leave those rows alone.
- **The status is written twice on purpose**: on the row above and on the section heading below. They must be the same word, and `npm run docs:check` fails when they are not.
- **Approach tag** beside a heading overrides the build approach for that one feature. No tag means it inherits the default above.
- **Workflow tier tag** beside a heading sets that one feature's rigor above or below the project default. No tag means it inherits. At **Beta** each feature runs `/check verify` then `/test` after `/develop`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link is added by `/architect`, the code path by `/develop`. It appears only once those exist.

This stays a single file because the phases are slices of one continuous thread rather than distinct areas. (basis: foundations before features, and vertical slices of one product path, so there is no separate epic to promote yet).

## References

**Project sources:** `docs/PRD.md` (product truth, exclusions, accessibility and performance requirements), `docs/MCD.md` (ratified architecture, the engine contract, the world rules, and the workflow rituals), `docs/BUILD_ROADMAP.md` (phase order, deliverables, budgets, and gates), `docs/SYSTEM_TEARDOWN.md` (dated state assessment), `AGENTS.md` (operating instructions and the product invariants), `content/review/README.md` (the content review gate), `src/content/types.ts` (the content schema).

**Practices & standards:** vertical slices ship real value early; foundations before features; the data model is the costliest thing to redo; a budget is a gate rather than an aspiration; reduced motion and keyboard operation are first class requirements, not enhancements; AI proposed content needs human validation before it ships.
