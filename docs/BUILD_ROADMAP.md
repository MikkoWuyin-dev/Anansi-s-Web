# ANANSI'S WEB
## Build Roadmap — v1.0

**Date:** 2026-10-16
**Companions:** `docs/PRD.md` (v1.1 product truth), `docs/MCD.md` (v1.0 technical truth)
**Status:** Phases 0 to 2 complete; the library is at 24 of 300 topics. Phases 3 onward are planned, not built.
**Audience:** any engineer or coding agent picking up the build.

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

| Phase | Name | Unlocks | Depends on |
|---|---|---|---|
| 0 | Foundations | a building, testing app | none |
| 1 | Content layer | a real topic pool | 0 |
| 2 | Selection engine | deterministic daily stories | 1 |
| 3 | State and persistence | a journey that survives reloads | 2 |
| 4 | The ritual loop | the core product experience | 3 |
| 5 | History and progress | continuity, the 90-day count | 4 |
| 6 | The 3D world | the stage, Anansi, the search | 4 |
| 7 | Modes and design system | light mode, visual governance | 6 |
| 8 | Evolution and surprises | the web that grows | 5, 6 |
| 9 | Quality gates | measured, audited product | 7, 8 |
| 10 | Hardening and deployment | a live, protected, shipped site | 9 |
| 11 | The accounts era | cloud sync, cross device | 10 |

Parallelism: Phase 1 is content work and can run alongside Phase 2 scaffolding. Phase 6 can start once Phase 4's beats are settled, and does not need Phase 5.

---

## Phase 0 — Foundations (COMPLETE)

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

## Phase 1 — Content layer

**Goal:** a reviewed, validated topic pool that ships as a static bundle inside budget.

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

## Phase 2 — Selection engine (COMPLETE, 2026-10-16)

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

## Phase 3 — State and persistence

**Goal:** a journey that survives reloads, restarts, and a corrupt store.

### 3.1 Stores and middleware

- **Deliverable:** `src/state/` with small zustand stores persisting through the localStorage middleware, namespaced `anansi:v1:*` per MCD §5.
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

---

## Phase 4 — The ritual loop

**Goal:** the core product experience, fully operable without any 3D.

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

---

## Phase 5 — History and progress

### 5.1 The history drawer

- **Deliverable:** the conventional, practical list required alongside the visual metaphor (PRD §23): searchable, filterable by All, Explored, and Learned, and inspectable.
- **Done when:** filters and search work against the 30-day store and the drawer is keyboard reachable.

### 5.2 The journey counter

- **Deliverable:** "37 / 90" as the model, never a streak, with no shame messaging and no punishment for missed days (PRD §19, §21).
- **Done when:** the counter reads from accepted days only and missing days produce no warning of any kind.

### 5.3 Optional domain filtering

- **Deliverable:** a domain filter, if it proves useful in use.
- **Done when:** it reuses the history store rather than duplicating logic.

---

## Phase 6 — The 3D world

**Goal:** the stage. Authored camera, user touches but never navigates.

### 6.1 The canvas

- **Deliverable:** a single lazy-loaded R3F `<Canvas>` behind the already-painted DOM shell, with `frameloop="demand"` and explicit invalidation.
- **Done when:** the hero and action are usable before the scene loads, and an idle page does not draw frames.

### 6.2 The web graph

- **Deliverable:** a generated graph of nodes and strands, seeded deterministically from the journey so a returning user's web is theirs (MCD §4 rule 4).
- **Done when:** the same seed reproduces the same graph exactly, and objects can anchor to nodes.

### 6.3 The camera rig

- **Deliverable:** an authored camera component driven by a beat timeline: `idle → searching → revealing → celebrating → resting`. Cursor parallax and touch tilt modulate but never command.
- **Done when:** there is no free orbit and no scroll-to-travel, and every beat is framed by design.

### 6.4 Object families

- **Deliverable:** one seeded parametric generator per family (clocks, keys, eyes, books, and so on) returning geometry, material, and idle-motion parameters. No one-off meshes, no imported assets.
- **Done when:** N instances of a family are visibly varied yet unmistakably the same family.

### 6.5 Anansi

- **Deliverable:** a procedural Anansi whose personality is carried by motion rather than mesh detail, isolated in his own component so a modelled asset can replace him later without touching anything else.
- **Done when:** his component is swappable in isolation and nothing else imports his internals.

### 6.6 The search choreography

- **Deliverable:** the search as an event, not a spinner: the web activates, Anansi moves between strands, investigates, returns with a topic.
- **Done when:** the search reads as a searching spider, and the frame time stays **≤ 16 ms** on mid-range desktop.

### 6.7 Density mapping

- **Deliverable:** stage richness as a pure function of journey progress, matching the early, middle, and late arc (PRD §20).
- **Done when:** an early journey renders sparse and a late one dense, from the same generator set.

### 6.8 Physical interaction

- **Deliverable:** spring-based response throughout via react-spring: inertia, displacement, tension, rotation, depth, hover and click reactions. No linear tweens, and no decoration-only animation.
- **Done when:** every significant animation reinforces the living-web feeling, and any that does not is removed.

### 6.9 Reduced motion and mobile

- **Deliverable:** a still but fully functional web under `prefers-reduced-motion` (search resolves in place), and a concept-preserving mobile tier with reduced density and touch-first equivalents.
- **Done when:** the reduced-motion path carries identical information and affordances, and the mobile tier keeps all three beats intact.

### 6.10 The scene budget

- **Deliverable:** a measured scene chunk.
- **Done when:** the scene chunk is **≤ 350 kB gzip**, the pre-scene shell is **≤ 250 kB gzip**, and idle GPU is effectively zero.

---

## Phase 7 — Modes and design system

### 7.1 The light token set

- **Deliverable:** light mode as a swapped token set, with yellow still the single most regulated accent and jet re-cast for structural grounding.
- **Done when:** both modes pass contrast checks for text, controls, and focus states.

### 7.2 The sun and moon switch

- **Deliverable:** the playful animated sun/moon interaction (PRD §33), integrated into the world rather than bolted on, keyboard operable, and reduced-motion safe.
- **Done when:** the switch works by keyboard, the choice persists, and the transition respects reduced motion.

### 7.3 Imprint the registry

- **Deliverable:** `ui-registry.md` capturing the visual patterns of every component built so far, per the MCD §10 `/imprint` ritual. The registry was established early, on 2026-10-16, with an audit baseline and entries for the shell and the action; this phase extends it to everything built in the meantime.
- **Done when:** a later component can be built from the registry alone and match what came before.

---

## Phase 8 — Evolution and surprises

### 8.1 The evolving web

- **Deliverable:** accumulated history represented visually, so the user feels *"I built this."* Density is already a function of progress; this phase makes the accumulation legible.
- **Done when:** a returning user can see their history in the world without reading a list.

### 8.2 Hidden interactions

- **Deliverable:** small surprises that reward curiosity (PRD §32): unexpected reactions, easter eggs, unusual hover states.
- **Done when:** none of them can interfere with the core task, and the primary path is unchanged when they are removed.

---

## Phase 9 — Quality gates

**Goal:** measured, audited, and honest about what is not yet true.

### 9.1 Performance

- **Deliverable:** recorded measurements for every MCD §8 budget.
- **Done when:** shell ≤ 250 kB gzip, scene ≤ 350 kB gzip, bundle ≤ 150 kB gzip, first usable interaction ≤ 3.5 s on mid-range mobile over 4G, idle GPU ≈ 0, search frames ≤ 16 ms, Lighthouse ≥ 85 desktop and ≥ 75 mobile.

### 9.2 Accessibility audit

- **Deliverable:** an audit against MCD §9 and PRD §36.
- **Done when:** full keyboard operation, visible focus throughout, sufficient contrast in both modes, screen-reader-friendly controls, and the canvas carrying an accessible description of the world's state.

### 9.3 Font and network decisions

- **Deliverable:** a decision on the externally loaded display face, which is currently fetched from Google Fonts and sits mildly against PRD §35.
- **Done when:** self-hosting or accepting the request is a recorded decision, not an accident.

### 9.4 Production review

- **Deliverable:** the MCD §10 `/review` three-layer report: plan alignment, system integrity, production readiness.
- **Done when:** findings are triaged and the blocking ones are fixed.

---

## Phase 10 — Hardening and deployment

### 10.1 Continuous integration

- **Deliverable:** a GitHub Actions workflow running typecheck, tests, and content validation on every push and pull request. Built ahead of this phase on 2026-10-16 as `.github/workflows/verify.yml`, which runs the whole `npm run verify` gate rather than a subset of its steps; it is committed and pushed, and its first remote run came back green on 2026-10-16 (run 38947782059), so it is delivered and running. The gate gained a fifth step on 2026-10-16 — `npm run docs:check`, which fails when the current-state claims in `docs/SYSTEM_TEARDOWN.md` no longer match the repository — and the same workflow runs it.
- **Done when:** a deliberately broken commit fails the check, and main stays green. The green half now holds on the remote. The failure half holds locally only — the gate exits 2 on an injected type error and 0 on the clean tree — because pushing a broken commit to `main` in order to watch it fail would leave a red commit on `main`.

### 10.2 Dependency hygiene

- **Deliverable:** a decision on the six dev-only advisories (esbuild via Vite 5, tinypool via Vitest 2), whose fixes require breaking major upgrades.
- **Done when:** upgrades are either performed with the suite green, or consciously deferred with the reasoning recorded.

### 10.3 Project governance files

- **Deliverable:** `AGENTS.md` filled with the ratified stack and conventions, plus `memory.md` for session handoff, per MCD §10. Both were written on 2026-10-16 and need to stay current and tracked.
- **Done when:** a fresh session can start from `AGENTS.md` plus the MCD and continue without re-deriving decisions.

### 10.4 Deploy

- **Deliverable:** the static site on a static host, previously ratifying the privacy-friendly analytics decision (the first thing to add when usage insight is wanted, requiring no architecture change).
- **Done when:** the built site is live, the budgets hold in production, and auth is still correctly absent.

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

*End of Build Roadmap. Phases 1 onward are unbuilt; Phase 0 is verified as recorded above.*
