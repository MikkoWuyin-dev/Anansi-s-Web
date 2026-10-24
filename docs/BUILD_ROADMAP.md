# ANANSI'S WEB
## Build Roadmap — v1.0

**Date:** 2026-10-16
**Companions:** `docs/PRD.md` (v1.1 product truth), `docs/MCD.md` (v1.0 technical truth)
**Audience:** any engineer or coding agent picking up the build.

Phase status is stated once, in the **Status** column of the phase map below, and each phase heading carries the same word. `npm run docs:check` fails when the two disagree, so this document cannot quietly claim a phase is unbuilt after it ships.

---

## How to use this document

The MCD owns *what the system must be*. This document owns *the order we build it in*, and for every step it states a **deliverable** (what exists when the step is done) and **done when** (how we prove it). A step is finished only when its `done when` line passes, not when the code is written.

Three rules govern the whole sequence:

1. **The engine stays pure.** Anything in `src/engine/` imports nothing from `app/`, `world/`, or `state/`. Data goes in, decisions come out. This is what makes the accounts-era migration a lift and shift (MCD §3, D4).
2. **The DOM carries the product; the canvas enhances it.** Every ritual beat must be operable and understandable with no 3D at all (MCD §9). That is why the loop is built before the world.
3. **Budgets are gates, not aspirations** (MCD §8). If a phase breaks a budget, the phase waits.

Ordering logic: **content feeds the engine, the engine feeds the loop, the loop feeds the world.** The world is built last because it choreographs beats that must already exist.

---

## Phase map

| Phase | Name | Status | Unlocks | Depends on |
|---|---|---|---|---|
| 0 | Foundations | built | a building, testing app | none |
| 1 | Content layer | built | a real topic pool | 0 |
| 2 | Selection engine | built | deterministic daily stories | 1 |
| 3 | State and persistence | built | a journey that survives reloads | 2 |
| 4 | The ritual loop | built | the core product experience | 3 |
| 5 | History and progress | built | continuity, the 90-day count | 4 |
| 6 | The 3D world | built | the stage, Anansi, the search | 4 |
| 7 | Modes and design system | built | light mode, visual governance | 6 |
| 8 | Evolution and surprises | built | the web that grows | 5, 6 |
| 9 | Quality gates | built | measured, audited product | 7, 8 |
| 10 | Hardening and deployment | built | a live, protected, shipped site | 9 |
| 11 | The accounts era | deferred | cloud sync, cross device | 10 |

`built` means every step in the phase is delivered; `in progress` means some steps are; `planned` means none is; `deferred` means the phase is deliberately held. The heading of each phase restates the same word, which is what the check compares.

Parallelism: Phase 1 is content work and can run alongside Phase 2 scaffolding. Phase 6 can start once Phase 4's beats are settled, and does not need Phase 5.

---

## Phase 0 — Foundations (BUILT)

Recorded so the document is self-contained.

**Built and verified**

- Vite + React 18 + TypeScript strict SPA that builds, typechecks, and runs.
- The DOM shell with the hero line and the primary action.
- Palette tokens as CSS custom properties, the only place raw colour is allowed.
- The first two pure engine primitives: the day key and the seeded PRNG, with 14 passing tests.
- Node types pinned to the runtime major, so the Vite config typechecks.

**Evidence**

| Check | Command | Result |
|---|---|---|
| Types | `npm run typecheck` | exit 0 |
| Tests | `npm run test` | exit 0, 2 files, 14 tests |
| Build | `npm run build` | exit 0, 46 kB gzip JS, 1.25 kB gzip CSS |
| Dev | `npm run dev` | serves HTTP 200 |

**On disk**

```
src/main.tsx              entry, mounts React into #root
src/vite-env.d.ts         Vite client types
src/app/App.tsx           shell: hero line, primary action, live region
src/app/styles.css        palette tokens, layout, reduced motion
src/engine/dayKey.ts      local YYYY-MM-DD day key            (MCD D5)
src/engine/rng.ts         FNV-1a seed hash + mulberry32 PRNG   (MCD §5)
src/engine/*.test.ts      14 tests in the node environment
```

**Installed and ready for later phases:** three 0.169, @react-three/fiber 8.18, @react-three/drei 9.122, @react-spring/web and /three 9.7.5, zustand 4.5.7.

**Known debt carried forward:** light mode is unimplemented; six dev only `npm audit` advisories need breaking Vite and Vitest upgrades; the MCD §10 governance files were written later on 2026-10-16 (`AGENTS.md`, `ui-registry.md`, `memory.md`, and `docs/scope/`) and are now tracked (`95a8b1e`).

---

## Phase 1 — Content layer (BUILT, COMPLETE 2026-10-24)

**Goal:** a reviewed, validated topic pool that ships as a static bundle inside budget.

**Built so far:** the pipeline, the validator, the coverage report, the compiled bundle and the loader are all in place, and every topic entered through the review gate in `content/review/` rather than by direct authoring. Three batches — 2026-10-22 and the two of 2026-10-24 — took the pool to 300: twelve or thirteen topics in each of the 24 domains, exactly 100 at each difficulty level, and each batch's sheet stays in `content/review/` as the record of what was reviewed. `npm run content:report` measures the bundle at 13.2 kB gzip against the 150 kB cap.

### 1.1 Define the content types

- **Deliverable:** `src/content/types.ts` exporting `Topic` and `Domain`, matching the MCD §5 schema exactly (stable slug `id`, display `title`, `domain`, `difficulty` 1 to 3, `tags`, `resurfacing`, `added`).
- **Note:** `difficulty` is internal and must never reach the DOM.
- **Done when:** the engine can import the types without importing anything from `app/` or `world/`.

### 1.2 Author the curated library

- **Deliverable:** `content/topics/` with one reviewed entry per topic, versioned in the repository. Target **300 or more**, spread across the PRD §12 domains with a balanced internal difficulty mix (PRD §13).
- **Method:** each entry is human-reviewed against the quality philosophy (PRD §10, §11) and the exclusions (PRD §14) before entering the pool. AI assistance is authoring time only and lands in `content/review/`, never straight into `content/topics/`.
- **Practical start:** ship a first reviewed batch of 40 to 60 spanning every domain, wire the pipeline end to end against it, then grow to 300. Do not block the build on the full pool.
- **Done when:** every entry carries a unique slug, a valid domain, and a difficulty, and a human has signed off on the batch.

### 1.3 Build the authoring scripts

- **Deliverable:** `scripts/` with schema validation, near-duplicate detection, and domain/difficulty coverage reporting.
- **Done when:** the scripts exit non-zero on a deliberately malformed or duplicated entry, and report coverage gaps.

### 1.4 Compile the bundle and load it

- **Deliverable:** `scripts/` compilation producing the static JSON bundle, plus a loader in `src/content/` that the engine receives as `library`.
- **Done when:** the app loads the bundle and the loader performs no selection logic of its own.

### 1.5 Enforce the content budget

- **Deliverable:** a measured, gzipped bundle size recorded in the repository.
- **Done when:** the bundle is **≤ 150 kB gzip at 300 topics** (MCD §8).

---

## Phase 2 — Selection engine (BUILT, COMPLETE 2026-10-16)

**Goal:** controlled serendipity that is deterministic per day and feels random.

**Spec:** `docs/specs/0001-selection-engine.md` (captured 2026-10-16) settles the entry point, the rules, the tuning values and the thin pool fallback. Steps 2.6 and 2.2 below were amended to match it.

### 2.1 Fix the schemas in code

- **Deliverable:** `src/engine/types.ts` (or equivalent) implementing `TopicRecord` and `DayState` from MCD §5, and the `SelectionInput` contract: `library`, `history: TopicRecord[]`, `day`, `rng`. `HistoryEvent` is retired: one record type covers it. `Progress` is deliberately not an engine input; spec 0001 leaves it to the state layer, which step 3.5 owns.
- **Done when:** the engine's entry point takes `SelectionInput` and returns data only. No DOM, no React, no storage, no clock read inside the engine (the date arrives through the input).

### 2.2 Hard exclusions

- **Deliverable:** rules that remove any topic presented within the last 30 days. Excluded domains (PRD §14) are enforced upstream at authoring, so the pool never contains one and the engine carries no exclusion list.
- **Done when:** a topic presented yesterday can never be offered today, proven by test.

### 2.3 Determinism per day

- **Deliverable:** the PRNG seeded from `(clientId, dayKey)`, so the offer sequence for a day is fixed.
- **Done when:** generating a day twice, in separate calls, yields byte-identical offers; and two different day keys yield different offers. The existing `rng.test.ts` already pins the primitive.

### 2.4 Diversity weighting

- **Deliverable:** scoring that penalises recently seen domains and tags, boosts time since exposure, holds a rolling difficulty spread across levels 1, 2, and 3, and avoids both monotonous category rotation and mechanical alternation.
- **Done when:** a long generated sequence shows no run of three same-domain topics and no visible rotation pattern, asserted statistically over many seeds.

### 2.5 Rerolls

- **Deliverable:** the next story of the day differs from every story already offered today, and every offered story is logged as Explored, rerolled or not.
- **Done when:** requesting three stories never repeats one, and the history log records all three.

### 2.6 Intentional resurfacing

- **Deliverable:** a rare, weighted event restricted to `resurfacing: true` topics and to a long absence of at least 60 days, rare by chance rather than by schedule, carrying the *"Anansi has brought this one back."* treatment flag.
- **Done when:** a simulation over a year never resurfaces a topic inside its 60-day absence gap or its 30-day exclusion window, and keeps the rate near one day in seven. The guaranteed weekly cap is deliberately dropped: the input cannot tell a return from a first showing, so the cap is unenforceable as specified. Spec 0001 records the trade and the derivation that would restore it.

### 2.7 The engine test suite

- **Deliverable:** tests for every rule above, in the `node` environment the Vitest config already assumes.
- **Done when:** `npm run test` covers exclusions, determinism, diversity, reroll uniqueness, resurfacing cadence, and the difficulty spread, and a deliberately broken rule fails the suite.

**Gate G3, in part.** Every engine rule has a test, and three deliberate breakages — a widened window, a shortened return absence, a neutered spread — each fail the suite. The reload half of G3 is not reachable from the engine alone: determinism across a reload depends on the state layer rebuilding the per-day stream, which is Phase 3's responsibility, so G3 clears when that lands with a rebuild test.

---

## Phase 3 — State and persistence (BUILT, COMPLETE 2026-10-17)

**Goal:** a journey that survives reloads, restarts, and a corrupt store.

**Spec:** `docs/specs/0002-local-state-and-persistence.md` (captured 2026-10-17) settles the four keys, the version envelope, the per slice reset, the accepted day tally, the rollover and the stream helper. Step 3.1 is written to match it.

### 3.1 Stores and middleware

- **Deliverable:** `src/state/` with four small zustand stores (vanilla, no React), namespaced `anansi:v1:*` per MCD §5, each persisting through one validating storage adapter. Spec 0002 deliberately does not use zustand's `persist` middleware: it binds to `window` and replaces state wholesale, which is the opposite of resetting one damaged slice.
- **Done when:** state written in one session reappears after a reload with identical values.

### 3.2 Load validation

- **Deliverable:** a load path that validates persisted state and falls back to safe defaults when it is absent, partial, or corrupt.
- **Done when:** hand-editing the stored JSON to garbage does not crash the app; it starts a fresh day.

### 3.3 Day rollover

- **Deliverable:** `anansi:v1:today` validated against the current day key on load. A stale day is discarded and a fresh one begins.
- **Done when:** simulating a local midnight rollover produces a new day with a new first story, and the previous day's records remain in history.

### 3.4 Retention

- **Deliverable:** automatic pruning of history older than **30 days**.
- **Done when:** a 45-day synthetic log prunes to 30 days on load.

### 3.5 Progress model

- **Deliverable:** `anansi:v1:progress` with `journeyStart` and `journeysCompleted`. Days completed is the count of distinct day keys with an accepted topic in the current journey. A finished journey rolls into the next with no failure state.
- **Done when:** 90 accepted days rolls to journey two and the counter restarts at 1.

### 3.6 Client identity

- **Deliverable:** a generated, persisted `clientId` used only to seed the engine.
- **Done when:** the id survives reloads and is never transmitted anywhere.

**Built 2026-10-17.** Seven modules under `src/state/` and 50 tests: a round trip through one store, midnight rollover, a 45 day log pruning to 30, a corrupt slice resetting alone, a blocked storage running in memory with `persistent: false`, a 90th acceptance rolling the journey on the next access, the per day stream reproducing a day, and cross tab rehydration. Four deliberate breakages (accepting any schema version, never pruning, ignoring a stale day key, allowing a fourth offer) each fail the suite. Spec 0002 is `In Progress` until the feature's verify and test steps are ticked.

---

## Phase 4 — The ritual loop (BUILT, COMPLETE 2026-10-17)

**Goal:** the core product experience, fully operable without any 3D.

**Spec:** `docs/specs/0003-ritual-loop.md` (captured 2026-10-17) settles the one second search beat, the sealed third story, taking a story closing the day's ruling, the inline learned check, the resurfacing line and its lavender cue, the honest states, the midnight rollover, and the keyboard and reduced motion path. Steps 4.1 to 4.7 are written to match it.

### 4.1 The topic card

- **Deliverable:** the reveal in `src/app/`, showing the title and nothing else. No definition, summary, category, difficulty, or explanation (PRD §8).
- **Done when:** the card renders a title only, and `difficulty` and `domain` never appear in the DOM.

### 4.2 The daily ruling

- **Deliverable:** up to three stories a day. The first after the search, up to two rerolls, and the third is **the day's story**, persisting unchanged until local midnight. Revisiting the site never reshuffles it.
- **Done when:** reloading mid-day shows the identical offer state and the identical day's story.

### 4.3 Accept

- **Deliverable:** the "I'll take this" action committing the topic to history, one per day, driving the 90-day count.
- **Done when:** accepting records the day, marks it accepted, and increments days completed exactly once.

### 4.4 Learned

- **Deliverable:** an explicit mark that moves a topic from Explored to Learned.
- **Done when:** the status change persists and is reflected in history filters.

### 4.5 Resurfacing treatment

- **Deliverable:** the distinct presentation for a resurfaced topic.
- **Done when:** a resurfaced offer is visually and textually distinguishable from a new one.

### 4.6 Empty, error, and loading states

- **Deliverable:** honest states for an empty library, a failed load, and the search in progress.
- **Done when:** no state is a blank screen, and each says what happened and what to do next.

### 4.7 Accessibility of the loop

- **Deliverable:** full keyboard operation, visible focus, semantic controls, live region announcements for the reveal and the rerolls, and reduced-motion parity.
- **Done when:** the whole loop completes with the keyboard alone and with `prefers-reduced-motion` set.

**Built 2026-10-17.** Four modules and 31 tests in `src/app/`: a controller (`ritual.ts`) that derives the whole screen from the store and calls the engine, a semantic markup layer (`RitualScreen.tsx`), a `useSyncExternalStore` hook, and the app's one store instance. No dependency was added: the controller runs under the node environment and the markup is checked through `react-dom/server`, which is why `vite.config.ts` now collects `.test.tsx` too. Verified in a browser by keyboard: a title alone on the reveal, two rerolls without a repeat, the third story sealed with the reroll gone, taking closing the ruling and marking the day, the inline learned confirm holding focus, and learned surviving a reload with the story unchanged. Three deliberate breakages (never recording an offer, leaving the reroll open at the third story, dropping the learned state) each fail the suite and were reverted. The resurfaced treatment, the empty and failed states, the blocked storage line, the reduced motion path, and the midnight rollover rest on controller and markup tests rather than a live session; the spec's Follow-up records what that leaves open.

---

## Phase 5 — History and progress (BUILT, COMPLETE 2026-10-18)

**Goal:** continuity. The last thirty days become inspectable, and the journey has a quiet number.

**Spec:** `docs/specs/0004-history-drawer-and-journey-count.md` (captured 2026-10-18) settles the inline panel, the corner control, the filter partition, the search rules, the day labels, the read only list, and the count's two placements. Steps 5.1 and 5.2 are written to match it; 5.3 is deferred.

### 5.1 The history drawer

- **Deliverable:** the conventional, practical list required alongside the visual metaphor (PRD §23): searchable, filterable by All, Explored, and Learned, and inspectable.
- **Done when:** filters and search work against the 30-day store and the drawer is keyboard reachable.

### 5.2 The journey counter

- **Deliverable:** "37 / 90" as the model, never a streak, with no shame messaging and no punishment for missed days (PRD §19, §21).
- **Done when:** the counter reads from accepted days only and missing days produce no warning of any kind.

### 5.3 Optional domain filtering — DEFERRED

- **Deliverable:** a domain filter, if it proves useful in use.
- **Done when:** it reuses the history store rather than duplicating logic.

**Deferred 2026-10-18.** The pool is 24 topics across few populated domains, so a domain filter would mostly return empty results and would put domain back on a surface the reveal keeps clean. It waits until the pool covers the domains, and it must reuse the view this phase built.

**Built 2026-10-18.** `src/app/history.ts` derives the whole panel from the store and the library: rows with their titles resolved (a record whose topic has left the library is dropped), day groups newest first, the three filters as a partition (All, Explored as not yet learned, Learned), counts on each filter, the folded title and date search, the Today and Yesterday labels through `Intl`, and the `N / 90` count. `src/app/HistoryPanel.tsx` renders it, and `App.tsx` holds the open state, the query, and the filter for the session, opening from a pinned corner control with the heading focused and Escape returning focus to the control. The count appears on the taken story and in the panel header, and is absent before the first taken day. Verified in a browser: keyboard open and close, the filter partition, case and accent folding, the ISO and locale written date search, the clear control, the query surviving a close, a live history rewrite from another tab updating the open panel, and no domain, difficulty, or tag in the DOM. Four deliberate breakages (opening the Explored filter to learned rows, titling a missing topic with its id, removing accent folding, showing the count at zero) each fail the suite and were reverted byte for byte.

---

## Phase 6 — The 3D world (BUILT 2026-10-18, 6.1 to 6.10)

**Goal:** the stage. Authored camera, user touches but never navigates.

**Spec:** `docs/specs/0005-the-3d-stage.md` (captured 2026-10-18) settles the stage's composition, the phone tier, Anansi's resting presence, the reveal beat, the graph contract, the five beats, and the palette rule. Steps 6.1 to 6.10 were built the same day.

### 6.1 The canvas — BUILT 2026-10-18

- **Deliverable:** a single lazy-loaded R3F `<Canvas>` behind the already-painted DOM shell, with `frameloop="demand"` and explicit invalidation.
- **Done when:** the hero and action are usable before the scene loads, and an idle page does not draw frames.
- **Built:** `src/world/Scene.tsx` is the lazy chunk and `src/app/WorldLayer.tsx` arms it two frames after the shell paints, behind a WebGL probe and an error boundary. Verified in a browser: the arm marker landed after the first contentful paint, a two second idle reading moved the frame counter by zero, a search advanced it once per beat, the canvas took no pointer event, and the shell bundle stayed at 56.48 kB gzip.

### 6.2 The web graph — BUILT 2026-10-18

- **Deliverable:** a generated graph of nodes and strands, seeded deterministically from the journey so a returning user's web is theirs (MCD §4 rule 4).
- **Done when:** the same seed reproduces the same graph exactly, and objects can anchor to nodes.
- **Built:** `src/world/graph.ts` draws the web as plain data (no three.js) from `clientId` and `journeyStart`: 11 beads and 20 strands at the start, 71 and 140 at ninety days, 9 and 16 in the phone tier, with anchors for the objects to come. `src/world/Web.tsx` renders it as one line segment buffer and one instanced mesh. 13 tests pin determinism (by geometry, not the seed label), the density curve, reachability, the caps, and the anchors.

### 6.3 The camera rig — BUILT 2026-10-18

- **Deliverable:** an authored camera component driven by a beat timeline: `idle → searching → revealing → celebrating → resting`. Cursor parallax and touch tilt modulate but never command.
- **Done when:** there is no free orbit and no scroll-to-travel, and every beat is framed by design.
- **Built:** `src/world/camera.ts` fixes one frame per beat and holds the parallax bound as plain data; `src/world/CameraRig.tsx` eases toward the frame, stops once framed, and asks for no more frames until something changes. No orbit control, drag, wheel or scroll listener exists, and `purity.test.ts` fails the suite if one appears. Verified live: a search moved the camera from the idle frame to the revealing frame and stopped, the idle page still drew zero frames, and the pointer never moved the camera beyond 0.14 world units. The phone tier pulls every frame back by 1.45. Touch tilt remains for 6.9.

### 6.4 Object families — BUILT 2026-10-18

- **Deliverable:** one seeded parametric generator per family (clocks, keys, eyes, books, and so on) returning geometry, material, and idle-motion parameters. No one-off meshes, no imported assets.
- **Done when:** N instances of a family are visibly varied yet unmistakably the same family.
- **Built:** `src/world/families.ts` generates clocks, keys, eyes, books, and planets from one primitive each, varying proportions, turn, tone, and phase; `src/world/Objects.tsx` draws every family as one instanced mesh, so the five families cost five draw calls however full the web is. 12 tests pin determinism, the shared primitive, the variation, the anchoring, and the density arc.

### 6.5 Anansi — BUILT 2026-10-18

- **Deliverable:** a procedural Anansi whose personality is carried by motion rather than mesh detail, isolated in his own component so a modelled asset can replace him later without touching anything else.
- **Done when:** his component is swappable in isolation and nothing else imports his internals.
- **Built:** `src/world/spider.ts` holds the eight-leg layout, the alternating gait, and the body dip as plain data; `src/world/Anansi.tsx` draws two body spheres, two eyes, and eight two-segment legs, and only `Scene.tsx` imports him. `purity.test.ts` fails the suite if any other module imports `spider.ts` or `Anansi.tsx`.

### 6.6 The search choreography — BUILT 2026-10-18

- **Deliverable:** the search as an event, not a spinner: the web activates, Anansi moves between strands, investigates, returns with a topic.
- **Done when:** the search reads as a searching spider, and the frame time stays **≤ 16 ms** on mid-range desktop.
- **Built:** `src/world/choreography.ts` is a 1400 ms keyframed route from the hub to two anchors and home, with holds where the gait stops, and a wake value per beat. `ritual.ts` now decides the story at once and holds the reveal for that duration, replacing the 900 ms pause; `celebrating` is used for 900 ms after a story is kept. Verified live: Anansi crossed to the first anchor at 208 ms and the second at 407 ms, held, and was home by 907 ms; the filament appeared on the reveal. 118 `gl.render` calls during a search measured 1.2 ms median, 2.1 ms p95, 2.5 ms max on Intel UHD Graphics.

### 6.7 Density mapping — BUILT 2026-10-18

- **Deliverable:** stage richness as a pure function of journey progress, matching the early, middle, and late arc (PRD §20).
- **Done when:** an early journey renders sparse and a late one dense, from the same generator set.
- **Built:** `src/world/density.ts` maps days completed to objects per family (one to four, one to two on a phone) and to the strength of a beat's impulse, alongside the graph's own node and strand counts. Verified live: zero days drew five objects and 40 strand vertices, forty five days drew ten and 140, sixty days fifteen and 226, from the same generators.

### 6.8 Physical interaction — BUILT 2026-10-18

- **Deliverable:** spring-based response throughout via react-spring: inertia, displacement, tension, rotation, depth, hover and click reactions. No linear tweens, and no decoration-only animation.
- **Done when:** every significant animation reinforces the living-web feeling, and any that does not is removed.
- **Built:** `@react-spring/three` now drives the camera's pointer tilt, a bounded beat impulse through each object family (displacement, rotation and scale), Anansi's travel, and the web's wake and reveal. The stage receives no pointer events by rule, so its hover reaction is the camera tilt and its click reactions are the beat changes; the DOM controls keep their own. The physics was verified live: a touch tilt moved the camera 0.095 units and settled inside the 0.098 bound, and the idle page returned to zero frames after it.

### 6.9 Reduced motion and mobile — BUILT 2026-10-18

- **Deliverable:** a still but fully functional web under `prefers-reduced-motion` (search resolves in place), and a concept-preserving mobile tier with reduced density and touch-first equivalents.
- **Done when:** the reduced-motion path carries identical information and affordances, and the mobile tier keeps all three beats intact.
- **Built:** `WorldLayer` reads both media queries and passes them down. Under reduced motion Anansi stays at the hub, the objects take no impulse, the web changes state without travelling, the camera snaps, and no tilt listener is attached, while the description still follows the beat. On a phone the graph and objects are thinned, frames are pulled back, the pixel ratio is capped, and touch tilts by 0.7 of the mouse bound. Verified live at 390 × 844: ten objects at sixty days, `z 11.02` frames, touch tilt 0.095, all three beats intact. The reduced motion branch itself remains unit-tested rather than observed (R17).

### 6.10 The scene budget — BUILT 2026-10-18

- **Deliverable:** a measured scene chunk.
- **Done when:** the scene chunk is **≤ 350 kB gzip**, the pre-scene shell is **≤ 250 kB gzip**, and idle GPU is effectively zero.
- **Built:** the production build emits a 57.14 kB gzip shell and a 238.02 kB gzip scene, both inside budget. Idle GPU is zero frames over two second readings at zero, forty five, and sixty days; a search drew 118 frames with a 1.2 ms median render call. Lighthouse and first usable interaction remain Phase 9's measurements.

---

## Phase 7 — Modes and design system (BUILT 2026-10-20)

### 7.1 The light token set — BUILT 2026-10-20

- **Deliverable:** light mode as a swapped token set, with yellow still the single most regulated accent and jet re-cast for structural grounding.
- **Done when:** both modes pass contrast checks for text, controls, and focus states.
- **Built:** `styles.css` declares a second `:root` under `:root[data-mode='light']` with every colour role re-declared. Step 7.2 later moved the selector onto the document attribute, so no media query chooses a token set any more; `src/app/tokens.test.ts` fails if one reappears. Three roles were added so the swap is safe: `--anansi-surface` (the page, because `--anansi-black` is the label on the yellow action), `--anansi-action-edge` (the boundary a yellow fill cannot draw on paper), and `--anansi-lavender-text` (the one lavender label, 5.74:1 in dark and 4.71:1 in light). `src/app/tokens.test.ts` computes the WCAG ratio of every text pair, the focus ring, and the action's boundary from the stylesheet's own text, and fails on any raw colour outside the two token blocks. The stage reads the palette once per mode in `Scene.tsx` and `WorldLayer` subscribes to the colour scheme, so the web, the objects, and Anansi recolour together without a reload. Verified live with the scheme emulated in both directions: the mounted canvas recoloured in place, the drawer read as dark text on paper, and the idle page returned to zero frames. `npm run verify` → exit 0, 317 tests in 28 files, shell 57.19 kB and scene 238.06 kB gzip. Spec: `docs/specs/0006-the-light-token-set.md`.

### 7.2 The sun and moon switch — BUILT 2026-10-20

- **Deliverable:** the playful animated sun/moon interaction (PRD §33), integrated into the world rather than bolted on, keyboard operable, and reduced-motion safe.
- **Done when:** the switch works by keyboard, the choice persists, and the transition respects reduced motion.
- **Built:** the mode moved to one authority, `<html data-mode>`, because a media query cannot be overridden by a click. `src/state/mode.ts` stores the choice under `anansi:v1:mode` and validates it; `src/app/mode.ts` resolves the choice against the system preference, follows that preference live when nothing is chosen, flips what is showing on every press, and writes the attribute; `ModeSwitch.tsx` is a native 44 px button whose sun-in-dark, moon-in-light glyph is drawn from tokens and whose name says which mode it moves to; `index.html` sets the attribute before the module loads, so a reload never flashes the other mode; the change crossfades through the browser's view transition, which `prefers-reduced-motion` removes. `applyMode` also writes the resolved surface into `theme-color`, so the browser chrome follows the page rather than the system. Twenty new tests: six for the stored shape, nine for resolution, toggling, the attribute, the chrome, and the pre-paint script, four for the switch (its markup, and the reduced-motion rules), and one that pins the light set to the attribute rather than a media query. Spec: `docs/specs/0007-the-sun-and-moon-switch.md`.

### 7.3 Imprint the registry — BUILT 2026-10-20

- **Deliverable:** `ui-registry.md` capturing the visual patterns of every component built so far, per the MCD §10 `/imprint` ritual. The registry was established early, on 2026-10-16, with an audit baseline and entries for the shell and the action; this phase extends it to everything built in the meantime.
- **Done when:** a later component can be built from the registry alone and match what came before.
- **Built:** the registry was read against the code entry by entry. Every component the app renders now has one — the shell, the action, the story and its return cue, the ghost, the learned confirm, the honest states, the history control and panel, the filter row, the count, the stage, the object families, Anansi, the search choreography, the switch, and the reduced-motion and phone tier — and the two token sets are recorded with the role each one exists for. The pass found three real drifts, all from this week: the page background was still written as `--anansi-black` where it had become `--anansi-surface`, the corner control was described as absolutely positioned after it moved into the `.controls` cluster, and the reduced-motion row predated the switch and the view transition. All three are corrected, and the registry now opens with the date of the review so a later pass knows how stale it may be.

---

## Phase 8 — Evolution and surprises (BUILT 2026-10-20, COMPLETE 2026-10-22)

### 8.1 The evolving web — BUILT 2026-10-20

- **Deliverable:** accumulated history represented visually, so the user feels *"I built this."* Density is already a function of progress; this phase makes the accumulation legible.
- **Done when:** a returning user can see their history in the world without reading a list.
- **Built:** `src/world/kept.ts` turns each day in `acceptedDayKeys` into one standing thread and one knot, anchored to an existing node and running outward from the hub, seeded by the day itself so a day's thread never belongs to another. The tally is the source rather than the history, because history prunes at thirty days and the world must not lose its earliest marks: nothing new is stored, and an existing journey shows its past on the first frame. `Web.tsx` draws every thread in one line buffer and every knot in one instanced mesh, so the weave costs two draw calls however many days were kept, and the reveal filament holds at `0.45` while today's story is kept instead of fading to nothing. The canvas description names the weave without a number. Ten new tests (the generator's count, determinism, stability, ceiling, phone tier and filament floor, plus the markup's description). Verified live: an empty journey drew 28 calls, one kept day drew 30, and forty five day keys written into storage appeared immediately at the same 30 calls. Spec: `docs/specs/0008-the-evolving-web.md`.

### 8.2 Hidden interactions — BUILT 2026-10-22

- **Deliverable:** small surprises that reward curiosity (PRD §32): unexpected reactions, easter eggs, unusual hover states.
- **Done when:** none of them can interfere with the core task, and the primary path is unchanged when they are removed.
- **Spec:** `docs/specs/0009-hidden-interactions.md`.
- **Built:** three surprises, none announced: typing his name answers once through a `naming` beat of its own; the clock family turns toward the hub when the third story seals the day; and the knot of the story just kept pulses once in the celebrating beat. No new storage key, no draw call while idle, and no pointer on the stage. Reduced motion keeps the information and drops the movement. Hover on the stage and an idle animation were rejected on the pointer rule and the zero idle frames budget. Verified live: the word answered in the description and the live region, the second attempt did nothing, the history search was untouched, and the idle page still drew zero frames.

---

## Phase 9 — Quality gates (BUILT 2026-10-23)

**Goal:** measured, audited, and honest about what is not yet true.

**Specs:** `docs/specs/0010-measured-quality.md`, `docs/specs/0011-the-display-face.md`. **Report:** `docs/reviews/2026-10-23-phase-9.md`.

### 9.1 Performance — BUILT 2026-10-23

- **Deliverable:** recorded measurements for every MCD §8 budget.
- **Done when:** shell ≤ 250 kB gzip, scene ≤ 350 kB gzip, bundle ≤ 150 kB gzip, first usable interaction ≤ 3.5 s on mid-range mobile over 4G, idle GPU ≈ 0, search frames ≤ 16 ms, Lighthouse ≥ 85 desktop and ≥ 75 mobile.
- **Built:** measured 2026-10-23 against the production build served by `npm run preview`, with Lighthouse 13. Met: shell 62.68 kB gzip, scene 238.81 kB gzip, topic bundle 5.6 kB gzip (14.0 kB projected at 300), idle 0 draw calls over 2.0 s (counted by patching the WebGL prototypes), search frame time 1.0 ms median `gl.render` call, Lighthouse desktop 85. Missed: Lighthouse mobile 69 to 73 over three runs against 75, and mobile time-to-interactive 4.5 to 5.7 s with the scene counted, because the lazy scene chunk's parse lands inside the throttled load; with that chunk blocked the page scores 99 and is interactive at 1.7 s. The owner chose on 2026-10-23 to keep the world immediate and record the miss rather than defer the scene or drop it on narrow screens. Accessibility and SEO scored 100 in every run.

### 9.2 Accessibility audit — BUILT 2026-10-23

- **Deliverable:** an audit against MCD §9 and PRD §36.
- **Done when:** full keyboard operation, visible focus throughout, sufficient contrast in both modes, screen-reader-friendly controls, and the canvas carrying an accessible description of the world's state.
- **Built:** one defect found and fixed: the story's title was an `h2` and the story state has no other heading, so the outline began at level two. It is now the page's `h1`, every state keeps exactly one, and `src/app/RitualScreen.test.tsx` fails if either changes. The audit walked the built page by keyboard at 390 by 844 through a whole day, opened and closed the history panel with Escape returning focus to its control, and switched modes with Enter while the attribute, the switch's name, and `theme-color` followed. The canvas description changed with each ritual state and never carried a title. Live light mode measured 15.49:1 for primary text and 5.66:1 for the secondary; the tokens test computes the rest in both modes. Focus rings and the reduced-motion branches could not be observed in the preview webview and are recorded as unverified.

### 9.3 Font and network decisions — BUILT 2026-10-23

- **Deliverable:** a decision on the externally loaded display face, which is currently fetched from Google Fonts and sits mildly against PRD §35.
- **Done when:** self-hosting or accepting the request is a recorded decision, not an accident.
- **Built:** self-hosted. Space Grotesk's latin variable subset sits in `public/fonts/` with its OFL licence, `styles.css` declares it once with `font-display: swap`, and `index.html` preloads it with the CORS mode the stylesheet uses, so a visit fetches it once. The two Google preconnects and the stylesheet link are gone and no third-party request remains. `public/robots.txt` was added in the same pass because Lighthouse's robots audit fails on a host that answers 404.

### 9.4 Production review — BUILT 2026-10-23

- **Deliverable:** the MCD §10 `/review` three-layer report: plan alignment, system integrity, production readiness.
- **Done when:** findings are triaged and the blocking ones are fixed.
- **Built:** `docs/reviews/2026-10-23-phase-9.md`, six findings with severities and dispositions. Both blocking findings are the mobile miss and its interaction cost, accepted by the owner rather than fixed; the rest are two verification gaps and two small keyboard or tap-target issues, recorded with follow-ups. Plan alignment and system integrity pass.

---

## Phase 10 — Hardening and deployment (BUILT)

**Specs:** `docs/specs/0012-toolchain-currency.md`, `docs/specs/0013-static-deploy.md`.

### 10.1 Continuous integration — BUILT 2026-10-23

- **Deliverable:** a GitHub Actions workflow running typecheck, tests, and content validation on every push and pull request. Built ahead of this phase on 2026-10-16 as `.github/workflows/verify.yml`, which runs the whole `npm run verify` gate rather than a subset of its steps; it is committed and pushed, and its first remote run came back green on 2026-10-16 (run 38947782059), so it is delivered and running. The gate gained a fifth step on 2026-10-16 — `npm run docs:check` — and the same workflow runs it.
- **Done when:** a deliberately broken commit fails the check, and main stays green. The green half holds on the remote. The failure half now has evidence for every step, proved locally without putting a red commit on `main`: an injected type error made the whole gate exit 2, an invalid topic made `content:check` exit 1 naming the file and the allowed domains, a failing test made `test` exit 1 naming the test, and flipped spec status made `docs:check` exit 1 naming the spec; the clean tree exits 0. The probes were removed and nothing was committed.

### 10.2 Dependency hygiene — BUILT 2026-10-23

- **Deliverable:** a decision on the six dev-only advisories (esbuild via Vite 5, tinypool via Vitest 2), whose fixes require breaking major upgrades.
- **Done when:** upgrades are either performed with the suite green, or consciously deferred with the reasoning recorded.
- **Built:** upgraded rather than deferred, on the owner's decision before deploy. Vite 5.4.21 → 8.3.5, Vitest 2.1.9 → 5.0.5, `@vitejs/plugin-react` 4.7.0 → 6.1.2, and the Node floor 22.6 → 22.12 for Vitest 5; CI already runs 24.x. `npm audit` now reports zero. `vite.config.ts` takes `defineConfig` from `vitest/config`, the lockfile was regenerated and a clean `npm ci` reproduced the suite, and the 365-day statistical simulation was given an explicit twenty second timeout after it failed at 4.93 s against Vitest 5's five second default — the assertions did not change. `npm run verify` exits 0 with 360 tests; the build is 62.54 kB shell and 232.08 kB scene, and Lighthouse desktop moved to 90 while mobile stayed 68 to 71. Spec 0012.

### 10.3 Project governance files — BUILT 2026-10-23

- **Deliverable:** `AGENTS.md` filled with the ratified stack and conventions, plus `memory.md` for session handoff, per MCD §10. Both were written on 2026-10-16 and need to stay current and tracked.
- **Done when:** a fresh session can start from `AGENTS.md` plus the MCD and continue without re-deriving decisions.
- **Built:** both are tracked, current, and inside their line budgets, and `docs:check` resolves every path and `npm run` script they name. The session that built Phase 9 and this phase started from `AGENTS.md` and `memory.md` alone and found the phase it was asked for; the only gaps it hit were facts that belonged in `memory.md` and were added there. The Node floor in `AGENTS.md` moved with the upgrade.

### 10.4 Deploy — BUILT 2026-10-23, TWO ACCEPTED DEVIATIONS

- **Deliverable:** the static site on a static host, previously ratifying the privacy-friendly analytics decision (the first thing to add when usage insight is wanted, requiring no architecture change).
- **Done when:** the built site is live, the budgets hold in production, and auth is still correctly absent.
- **Live:** the owner published the build at `https://anansis-web.pxxl.click/` on 2026-10-23. Verified on the origin: page, font (22,288 bytes, `font/woff2`), robots and hashed assets 200 with immutable caching for a year, no cookie, no session, no account route. The day ran find → take → understood → confirm → learned with the tallies correct. Lighthouse 13 on the host: desktop **89**, mobile **66 and 70**, accessibility and SEO **100**. The 3D scene did not mount in the review browser, which is the designed DOM fallback and not evidence that the canvas draws.
- **Two deviations, accepted by the owner on 2026-10-23:** the host injects Cloudflare's Web Analytics beacon (`static.cloudflareinsights.com`, posted to `/cdn-cgi/rum`) into the HTML response. Nothing in the build contains it, it contradicts the ratified no-analytics decision and AC-2, and it was left as it is for now rather than fixed. Unknown paths also answer 200 with the ritual instead of 404 (AC-5), because the host applies a single-page fallback; there are no routes to protect. Spec 0013 records both, and neither is called met.
- **Prepared:** the owner ratified **no analytics for v1** and held publishing back. `deploy/worker.js` is the whole server (`env.ASSETS.fetch`), `sites.manifest.json` points at the built output, and spec 0013 carries the publish-and-verify steps. The kit was proved on workerd locally with Wrangler 4.152: page, font, robots and assets 200 with the right types, unknown paths 404, and `env.ASSETS` present only when the local config declares the binding. The owner then published on their own Cloudflare-served domain rather than through the prepared host.

---

## Phase 11 — The accounts era (deferred, not abandoned)

Recorded so the future stays cheap. Nothing here is built now.

- **11.1 Supabase** (Postgres, auth, RLS) for per-user cloud state.
- **11.2 Lift the engine** to an edge function against the identical `SelectionInput` contract. The purity rule from Phase 2 is what makes this a move rather than a rewrite.
- **11.3 One-time sync** lifting local history into the cloud on first account creation.
- **11.4 Cross-device persistence** and journey export and import.
- **11.5 Analytics**, if wanted, as the only new integration.

---

## Dependency graph

```
Phase 0  Foundations
   |
   v
Phase 1  Content --------.
   |                     |
   v                     v
Phase 2  Engine      (parallel: further authoring)
   |
   v
Phase 3  State
   |
   v
Phase 4  Ritual loop ---.
   |                     |
   v                     v
Phase 5  History     Phase 6  World
   |                     |
   '------.   .----------'
          v   v
   Phase 7  Modes and design system
          |
          v
   Phase 8  Evolution and surprises
          |
          v
   Phase 9  Quality gates
          |
          v
   Phase 10 Hardening and deployment
          |
          v
   Phase 11 The accounts era
```

---

## Gate table

Do not start a phase until the gate above it is clear.

| Gate | Condition to pass |
|---|---|
| G1 | Types, tests, and build all exit 0, and the shell renders the hero and action |
| G2 | 300 or more reviewed topics, validated by script, bundle ≤ 150 kB gzip |
| G3 | Every engine rule has a test, and a day is provably deterministic across reloads |
| G4 | A corrupt store recovers, midnight rolls over, 30-day retention prunes, 90 accepted days rolls into journey two |
| G5 | The full loop completes by keyboard alone with motion reduced |
| G6 | History is searchable and filterable, and the counter shows no streak pressure |
| G7 | The scene is ≤ 350 kB gzip, frames ≤ 16 ms, idle GPU ≈ 0, no free camera |
| G8 | Both modes pass contrast, the switch is keyboard operable, and the registry exists |
| G9 | Every MCD §8 budget is measured and met, and the §9 audit passes |
| G10 | CI is green, advisories decided, governance files written, site deployed |

---

## Definition of done for V1

The product is V1 complete when, on a live static host with no backend and no accounts:

1. A first-time visitor lands directly in the ritual with no wall of any kind, and the first "Find me a story" works immediately.
2. A day offers at most three stories, the third persists until local midnight, and reloading never reshuffles them.
3. A revealed topic shows a title and nothing else.
4. Accepting records the day and advances the counter toward 90, with no streak pressure anywhere.
5. History holds 30 days, is searchable, filterable by All, Explored, and Learned, and prunes itself.
6. The web visibly grows with the journey, and the camera is authored throughout.
7. Both light and dark modes work, and reduced motion yields a still but fully functional web.
8. Every performance budget in MCD §8 is met and recorded.
9. The engine remains pure, so the accounts era is a lift and shift.

---

## Standing risks

| Risk | Watch for |
|---|---|
| Scope drift toward engagement | Time on site is a failure signal (PRD §2). Any feature that increases session length needs justification, not a default yes. |
| Engine impurity | The first `import` from `state/` or `app/` into `engine/` breaks the migration story. Catch it in review. |
| The 3D stage outrunning its budget | The illusion of complexity is the requirement; computational complexity is the failure mode (PRD §35). |
| Content quality dilution | 300 thin topics are worse than 120 good ones. The review gate is the product. |
| Governance decay | The MCD §10 rituals are cheap and compound. Skipping them is how the ratified decisions quietly stop being true. |
| Dual authority drift | If the PRD and MCD ever disagree, the MCD governs technical decisions and the PRD governs product intent. Change them together, with the product owner's consent. |

---

*End of Build Roadmap. Where each phase stands is the Status column of the phase map; what exists is the code and its tests.*
