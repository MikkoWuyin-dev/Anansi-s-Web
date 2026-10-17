# Scope: Anansi's Web

A daily ritual where someone asks a living web for one story, receives a title and nothing else, then leaves to research it and explain it aloud in their own words. Built for curious adults who want a reason to think about something new each day, not a course to complete.

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
| D | Content schema and authoring pipeline | Enrolled | in-progress |
| E | Engine primitives | Enrolled | in-progress |
| F | Session and governance rituals | Enrolled | in-progress |
| 1 | Selection engine | Foundation | in-progress |
| 2 | Local state and persistence | Foundation | planned |
| 3 | Content pool to launch size | Foundation | planned |
| 4 | The daily ruling and the reveal | Slice 1 | planned |
| 5 | Taking a story, and the journey count | Slice 1 | planned |
| 6 | An accessible loop with honest states | Slice 1 | planned |
| 7 | The history drawer | Slice 2 | planned |
| 8 | The canvas and the web graph | Slice 3 | planned |
| 9 | The authored camera and the search | Slice 3 | planned |
| 10 | Object families, Anansi, and density | Slice 3 | planned |
| 11 | The world without motion, and on mobile | Slice 3 | planned |
| 12 | Light mode and the sun and moon switch | Slice 4 | planned |
| 13 | The evolving web and hidden interactions | Slice 5 | planned |
| 14 | Measured performance and accessibility | Quality | planned |
| 15 | The display face and its network cost | Quality | planned |
| 16 | Continuous integration and dependency decisions | Release | planned |
| 17 | Deploy the static site | Release | planned |

## Enrolled

### A. Product and technical specification · existing
The four documents that govern everything: product truth, technical truth, build order, and the dated state assessment. code in `docs/`

### B. Build scaffold · existing
A Vite, React, and TypeScript single page app in strict mode that typechecks, tests, and builds, with the palette carried as CSS custom properties. code in `package.json`, `vite.config.ts`, `tsconfig.json`

### C. DOM shell · existing
The hero line, the primary action, the live region, and the first procedural strands, with reduced motion already honoured. code in `src/app/`

### D. Content schema and authoring pipeline · in-progress
Types, schema validation, near duplicate detection, coverage reporting, bundle compilation, and the loader, with 24 reviewed topics of a 300 topic target. code in `src/content/`, `scripts/`, `content/topics/`

### E. Engine primitives · existing
The pure engine holds the selection entry point, the frozen tuning object, the contract shapes, the local day key and the seeded random source, with 44 tests including the purity boundary. code in `src/engine/`

### F. Session and governance rituals · in-progress
The rituals from the master context document: `AGENTS.md` is written, and `ui-registry.md` and `memory.md` were created alongside this scope. code in `AGENTS.md`, `ui-registry.md`, `memory.md`

## Foundation

### 1. Selection engine · in-progress
The heart of controlled serendipity: from the pool, the day, and the history log, choose the day's story and any rerolls, deterministically, and without ever feeling mechanical.
**Done when:** two calls for the same day return identical offers; no topic offered in the last 30 days can be offered again; a long generated sequence shows no run of three same domain topics and no visible rotation; and a return is confined to flagged topics after a 60 day absence at about one day in seven, the guaranteed weekly cap having been traded for that tuned chance (spec 0001, 2026-10-16).

spec [0001](../specs/0001-selection-engine.md)

- [x] Design it (spec): `/architect selection engine`
- [x] Build it: `/develop selection engine`
  - [x] The contract and the frozen tuning object
  - [x] The day's guards, purity, and one reproducible story per call
  - [x] The 30 day window, the day's own exclusions, and the thin pool fallback
  - [x] Scoring, the rolling difficulty spread, and the return rule with its rarity roll
- [ ] Verify it: `/check verify`
- [ ] Test it: `/test`

### 2. Local state and persistence · needs a decision
Keep the journey in the browser under the `anansi:v1:*` namespace so a reload, a restart, or a damaged store never loses the ritual or breaks it.
**Done when:** state written in one session returns identical after a reload; a hand edited store containing garbage starts a fresh day instead of crashing; a stale day key rolls over at local midnight; and history older than 30 days prunes itself.
- [ ] Design it (spec): `/architect local state and persistence`

### 3. Content pool to launch size
Grow the reviewed pool from the current 24 topics to the launch target, with the spread across domains and difficulty that the engine needs to feel like serendipity.
**Done when:** the pool holds 300 or more reviewed topics covering every domain, validation reports no coverage gap, and the compiled bundle stays at or under 150 kB gzip.
- [ ] Build it: `/develop content pool to launch size`

The review gate and promotion steps already exist, so this needs execution rather than a new decision. (basis: `content/review/README.md` documents the reading against the quality philosophy and the exclusions, and the four promotion steps).

## Slice 1: the daily ritual

The walking skeleton. This is the thin real thread through content, engine, state, and interface, and it is the whole product promise: it must work with no 3D at all, which is why it is built before the stage.

### 4. The daily ruling and the reveal · needs a decision
Ask for a story, watch the search resolve, and receive one title with nothing attached to it.
**Done when:** a search offers a title only, with no definition, summary, category, or difficulty anywhere in the DOM; up to two rerolls never repeat a story already offered today; the third story becomes the day's story and stays identical until local midnight; and every story shown, rerolled or not, is recorded as Explored.
- [ ] Design it (spec): `/architect daily ruling and reveal`

### 5. Taking a story, and the journey count · needs a decision
Let the person take the story and later mark it understood, and show a quiet count of how far the journey has come.
**Done when:** taking a story records the day and advances the count exactly once; the counter reads from taken days only and shows no streak, warning, or penalty for a missed day; and marking a story Learned persists and appears in the history filters.
- [ ] Design it (spec): `/architect taking a story and the journey count`

### 6. An accessible loop with honest states · needs a decision
The ritual has to complete by keyboard alone, and it must never show a blank screen when the pool is empty, a load fails, or the search is still running.
**Done when:** the whole loop completes with the keyboard alone and with reduced motion set; focus is always visible; the reveal and each reroll are announced in a live region; and the empty, error, and loading states each say what happened and what to do next.
- [ ] Design it (spec): `/architect accessible loop and honest states`

## Slice 2: continuity

### 7. The history drawer · needs a decision
The plain practical list the ritual needs alongside the metaphor: the rolling 30 days, searchable and filterable.
**Done when:** the drawer lists the rolling 30 day history and can be searched and filtered by All, Explored, and Learned; it is reachable and operable by keyboard; and it reads from the same store rather than keeping its own copy.
- [ ] Design it (spec): `/architect history drawer`

## Slice 3: the stage

The world thickens the display segment of the thread that already runs. It is built here because it choreographs beats that must exist first.

### 8. The canvas and the web graph · needs a decision
A single lazy loaded canvas behind the already painted shell, holding a generated web of nodes and strands that a returning visitor can recognise as theirs.
**Done when:** the hero and the action are usable before the scene loads; an idle page draws no frames; the same seed reproduces the same graph exactly; and objects can anchor to nodes.
- [ ] Design it (spec): `/architect canvas and web graph`

### 9. The authored camera and the search · needs a decision
The search as an event rather than a spinner: the web wakes, Anansi moves between strands and returns with a story, framed throughout by a camera the visitor never drives.
**Done when:** there is no free orbit and no travelling by scroll; every beat from idle to resting is framed by design; the search reads as a searching spider; and frame time stays at or under 16 ms on a mid range desktop.
- [ ] Design it (spec): `/architect authored camera and search`

### 10. Object families, Anansi, and density · needs a decision
One seeded generator per object family, a procedural Anansi whose character comes from motion rather than mesh detail, and a web whose richness follows the journey.
**Done when:** many instances of one family look varied yet unmistakably related; Anansi's component can be swapped for a modelled asset without touching anything else; and an early journey renders sparse while a late one renders dense from the same generators.
- [ ] Design it (spec): `/architect object families Anansi and density`

### 11. The world without motion, and on mobile · needs a decision
The stage has to stay fully understandable when motion is reduced, and has to survive on a phone without losing the mystery.
**Done when:** under reduced motion the web is still and the search resolves in place with identical information and affordances; the mobile tier keeps all three beats intact with touch first interactions; and the scene chunk stays at or under 350 kB gzip with the shell at or under 250 kB gzip.
- [ ] Design it (spec): `/architect reduced motion and mobile world`

## Slice 4: modes

### 12. Light mode and the sun and moon switch · needs a decision
A swapped token set for daylight and a playful switch that belongs to the world rather than sitting on top of it.
**Done when:** both modes pass contrast checks for text, controls, and focus states; the switch works by keyboard and the choice persists; and its transition respects reduced motion.
- [ ] Design it (spec): `/architect light mode and the mode switch`

## Slice 5: the web grows

### 13. The evolving web and hidden interactions · needs a decision
Make accumulated history visible so a returning visitor feels they built this, and add small rewards for curiosity that can never interfere with the ritual.
**Done when:** a returning visitor can see their history in the world without reading a list; removing every hidden interaction leaves the main path unchanged; and none of them can interrupt the core task.
- [ ] Design it (spec): `/architect evolving web and hidden interactions`

## Quality

### 14. Measured performance and accessibility · needs a decision
Replace aspirations with numbers: measure every budget, and audit the experience honestly, including what is not yet true.
**Done when:** every budget is measured and met (shell, scene, compiled bundle, first usable interaction, idle graphics work, frame time, Lighthouse on desktop and mobile); the accessibility audit passes for keyboard, focus, contrast, screen reader controls, and a canvas that describes the world's state; and findings are triaged with the blocking ones fixed.
- [ ] Design it (spec): `/architect measured performance and accessibility`

### 15. The display face and its network cost · needs a decision
The display face is currently fetched from a third party on every visit, which sits against the product's own principle of sustainable web design.
**Done when:** serving it from our own origin, or consciously accepting the external request, is a recorded decision with its reasoning, rather than something that happened by default.
- [ ] Design it (spec): `/architect display face and network cost`

## Release

### 16. Continuous integration and dependency decisions · needs a decision
Nothing currently protects the branch, and six development advisories wait on upgrades that break major versions and need a deliberate call.
**Done when:** every push and pull request runs typecheck, tests, and content validation, and a deliberately broken commit fails the check; and the advisories are either resolved with the suite green or deferred with the reasoning written down.
- [ ] Design it (spec): `/architect continuous integration and dependency decisions`

### 17. Deploy the static site · needs a decision
Put the finished ritual on a static host with no backend and no accounts, so it can be reached for real.
**Done when:** the built site is live, the budgets still hold in production, and there is still no authentication of any kind.
- [ ] Design it (spec): `/architect deploy the static site`

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- **The accounts era**: cloud sync, cross device history, export and import, and optional analytics · needs a decision · GA
- **A domain filter for history**: offered only if real use shows it helps · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies, so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves, and each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` with 2 to 5 milestones; the tier's closing boxes (`Verify it` at Alpha and above, `Test it` at Beta and above) |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` and its milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is**; `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; at Beta the last stage is `/test` |

- **Next step** is the first unticked box, always a command or a tracked milestone.
- **needs a decision** means run `/architect` first; otherwise go straight to `/develop`. The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, never here**: the scope carries only the milestone rollup.
- **Status** moves `planned` → `in-progress` → `done`, plus `existing` (built before the workflow) and `dropped` (cut from scope, kept for history). `done` means this workflow built and verified it; `existing` means it predates the workflow, and `/develop` and `/sync` leave those rows alone.
- **Approach tag** beside a heading overrides the build approach for that one feature. No tag means it inherits the default above.
- **Workflow tier tag** beside a heading sets that one feature's rigor above or below the project default. No tag means it inherits. At **Beta** each feature runs `/check verify` then `/test` after `/develop`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link is added by `/architect`, the code path by `/develop`. It appears only once those exist.

This stays a single file because the phases are slices of one continuous thread rather than distinct areas. (basis: foundations before features, and vertical slices of one product path, so there is no separate epic to promote yet).

## References

**Project sources:** `docs/PRD.md` (product truth, exclusions, accessibility and performance requirements), `docs/MCD.md` (ratified architecture, the engine contract, the world rules, and the workflow rituals), `docs/BUILD_ROADMAP.md` (phase order, deliverables, budgets, and gates), `docs/SYSTEM_TEARDOWN.md` (dated state assessment), `AGENTS.md` (operating instructions and the product invariants), `content/review/README.md` (the content review gate), `src/content/types.ts` (the content schema).

**Practices & standards:** vertical slices ship real value early; foundations before features; the data model is the costliest thing to redo; a budget is a gate rather than an aspiration; reduced motion and keyboard operation are first class requirements, not enhancements; AI proposed content needs human validation before it ships.
