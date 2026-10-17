# ANANSI'S WEB
## Master Context Document — v1.0

**Date:** 2026-10-11 (amended 2026-10-16)  
**Companion to:** docs/PRD.md (v1.1)  
**Status:** Ratified — implementation authorized

---

> **This is the canonical context file.** Every session that works on Anansi's Web — human or AI — reads this document first. It carries the ratified decisions, the reasoning behind them, the technical contracts, and the workflow rituals. When a session must choose between momentum and this document, this document wins. If a decision here must change, change it here first, with the product owner's consent — nowhere else.

---

**Amendments**

- **2026-10-16** — §5's `Topic` schema aligned with the implemented schema in `src/content/types.ts`: titles are stored in natural case, and `tags` is a closed union of the PRD §11 characteristics. Both were invited by the schema's own "refine during build" note. §13 rewritten to record what is built and what is not. §3 lists the two documents added since ratification. Made with the product owner's consent, as the preamble requires.
- **2026-10-16** — §13's weak-points line corrected: the §10 state files are committed (`95a8b1e`), so they are no longer unversioned. A status correction rather than a decision change, made on the product owner's instruction to commit the outstanding work.
- **2026-10-16** — §13's weak-points line corrected again: a GitHub Actions workflow (`.github/workflows/verify.yml`) now runs the gate on push and pull requests, so "there is no CI" no longer holds. The runner's first result came back green on 2026-10-16 (run 38947782059), so §13 states it as running; the failure path has been demonstrated only locally. Made on the product owner's instruction, and the mechanism was already the roadmap's Phase 10.1 deliverable.
- **2026-10-16** — §13's verified line updated: `npm run verify` now runs five steps, the added one being `npm run docs:check`, which compares the current-state claims in `docs/SYSTEM_TEARDOWN.md` against the repository and fails the gate when they disagree. A status correction rather than a decision change; it executes the verification half of the maintenance protocol in `AGENTS.md` §11, and the figures it cannot reach are recorded as such in the teardown.
- **2026-10-17** — §5's local state schema extended to match spec 0002 as built: `Identity` added for the generated client id, and `Progress` gains `acceptedDayKeys`, because a 30 day history cannot carry a 90 day count. The schema now also states the `version: 1` envelope and per key validation. A schema correction, not a change to the day rules, made with the product owner's consent.
- **2026-10-17** — §13 rewritten again: the selection engine is built and verified against §5 and spec 0001, so it moves from "not built" to "built", the purity convention is now enforced by a test, and the next step becomes state and persistence. A status correction rather than a decision change; no rule, contract or tuning value in §5 changed.

---

## 1. What This Product Is

Anansi's Web is a daily discovery-and-articulation ritual. A visitor enters a living 3D diorama of Anansi's web, asks for a story, watches Anansi search, receives **one topic title with no explanation**, accepts it, and leaves to research and explain it in their own words. A 30-day rolling history and a shame-free 90-day journey give the ritual continuity, and the web itself grows richer as the journey accumulates.

The product succeeds when the user **leaves quickly and returns tomorrow**. Time-on-site is a failure signal. North star: **make curiosity irresistible, then get out of the way.**

Product-level truth lives in `docs/PRD.md`. This document owns *how we build it*.

---

## 2. Ratified Decisions

Six decisions were made through an architect session on 2026-10-11 and are locked. Any change to these requires the product owner's explicit consent and an update to both documents.

### D1 — The web is a stage, not a navigable world

The camera is **authored**. It drifts, tracks Anansi's search, and frames the ritual's beats. The user touches the world (objects react, parallax answers the cursor) but never pilots the camera. There is no free orbit, no scroll-to-travel.

**Why:** the core loop is enter → accept → leave; free navigation is time-on-site fuel and directly opposes §2 of the PRD. Authored cameras also keep mobile touch interactions intentional and make the accessibility fallback real — the 3D layer is never load-bearing for understanding.

**Consequence:** the world is choreography. Camera moves are designed, not emergent.

### D2 — React + React Three Fiber, Vite SPA, TypeScript throughout

The 3D scene and the DOM UI live in **one component tree**. No SSR. Scene chunk is lazy-loaded after first paint.

**Stack:**

| Concern | Choice |
|---|---|
| Framework | React 18+ (function components, hooks only) |
| 3D | three.js via @react-three/fiber + @react-three/drei |
| Motion | react-spring (spring physics is the house motion style) |
| State | zustand (small stores, localStorage persistence via middleware) |
| Build | Vite, single-page, static output |
| Language | TypeScript, strict mode |

**Why:** scene-as-components means the world and the UI evolve together; drei and react-spring supply the physical interaction feel (§31) off the shelf; R3F's on-demand rendering model is the direct implementation of PRD §35.

**Consequence:** no Three.js imperative code outside R3F idioms except where R3F cannot reach (documented escapes allowed, but isolated).

### D3 — Fully procedural Memphis art; no imported 3D assets

Every object is generated in code: geometric primitives, flat-shaded materials, the PRD palette, no textures, no GLTFs. Each object family (clocks, keys, eyes, books…) is a **parametric generator** — a seeded function producing endless variants. Anansi is procedural too, with personality carried by **motion, not mesh detail**. His component is isolated so a single modeled asset can be swapped in later without touching anything else.

**Why:** Memphis *is* primitives and flat color — the aesthetic and the technique coincide. Procedural generation makes the evolving web (§20) a multiplication of existing generators rather than an asset backlog, and the scene ships as math (kilobytes, no pipeline, no licensing).

**Consequence:** art direction lives in generator parameters. Design iteration = tuning numbers in code.

### D4 — Fully static: no backend, client-side engine, localStorage state

There is no server in V1. The curated topic library ships as a static JSON bundle. The controlled-serendipity engine runs in the browser as a pure TypeScript module. All user state persists in localStorage. Deployment target is any static host (Netlify/Vercel/Pages).

**Why:** with accounts deferred, a server has nothing left to do — and zero backend is the maximal form of "seamless, hitch-free first use": nothing to bootstrap, nothing to fail, nothing to wait for.

**Consequence:** the engine must stay a pure, isolated module (see §5) so it can lift to a server function unchanged in the accounts era.

### D5 — Day rules: local midnight, three topics, two rerolls

- **Day key** = the user's local calendar date (`YYYY-MM-DD` in their own timezone). Everything daily keys off it.
- Per day: up to **3 topics** offered, i.e. up to **2 rerolls**. The third story is **the day's story** — it persists unchanged until local midnight.
- Every story shown counts as **Explored** (feeds the engine), rerolled or not.
- **Zero anti-gaming armor.** A user spoofing their clock spoils their own ritual. This is consistent with the PRD's trust philosophy (§19, §21).

**Consequence:** a day's offers must be **stable across reloads** — the engine is seeded deterministically per browser + day key (see §5), so refreshing never reshuffles.

### D6 — Accountless V1; accounts deferred to "the accounts era"

No auth, no signup, no profile. All state is per-browser. When accounts eventually arrive, the planned shape is Supabase (Postgres, auth, RLS, edge function hosting the engine), plus a one-time sync lifting local history into the cloud. Nothing built now is thrown away — the engine and schemas are designed to make that migration additive.

**Trade accepted by the product owner:** no cross-device sync; clearing browser data clears the journey. A future export/import feature may soften this but is explicitly out of V1 scope.

---

## 3. Repository Layout

```
/
  docs/
    PRD.md            product truth (v1.1)
    MCD.md            this document
    BUILD_ROADMAP.md  build order: phases, gates, definition of done
    SYSTEM_TEARDOWN.md  verified state of the repository
  skills/             workflow skills (architect, imprint, recover, remember, review)
  content/
    topics/           curated library source — versioned, human-reviewed
    review/           AI-proposed candidates awaiting validation (never shipped directly)
  scripts/            authoring tools: validation, dedupe, bundle compilation, expansion
  src/
    app/              DOM UI: hero, topic card, history drawer, settings, mode switch
    world/            the 3D stage: camera rig, web graph, object families, Anansi, choreography
    engine/           PURE selection logic: day rules, serendipity, resurfacing — no DOM, no React
    state/            zustand stores + localStorage persistence
    content/          compiled topic bundle + loader + types
  ui-registry.md      imprinted visual patterns (maintained by /imprint)
  memory.md           session handoff (maintained by /remember)
```

The `engine/` boundary is the load-bearing one: it imports nothing from `app/`, `world/`, or `state/` — data goes in, decisions come out. This purity is what keeps the accounts-era migration a lift-and-shift.

---

## 4. The 3D World — Technical Rules

1. **One canvas.** The whole stage renders in a single R3F `<Canvas>`, lazy-loaded after the DOM shell paints. The shell shows the hero line and the primary action immediately; the world hydrates in behind it.
2. **On-demand rendering.** Frames are drawn only when something is moving (R3F `frameloop="demand"` + invalidation). Idle web ≈ zero GPU. Ambient life (trembling strands, drifting objects) comes from occasional impulses, not a perpetual animation loop.
3. **Authored camera rig.** The camera is a component driven by a beat timeline: `idle → searching → revealing → celebrating → resting`. Cursor parallax and touch tilt modulate, never command.
4. **Web graph first.** The web is a generated graph (nodes + strands) that everything else hangs from: objects anchor to nodes, Anansi walks the strands, density is a function of progress. Generate the graph deterministically from a per-journey seed so a returning user's web is *theirs*.
5. **Object families are parametric.** One generator per family, seeded, returning geometry + material + idle-motion params. New families are new generator functions, never one-off meshes.
6. **Density mapping.** Stage richness (strands, objects, connections) is a pure function of journey progress — deterministic per stage, matching PRD §20's early/middle/late arc.
7. **Flat shading, palette tokens only.** No textures. Materials sample from the design-system palette (§7). No hardcoded hex anywhere in `world/` or `app/` — tokens only.
8. **Motion budget.** Springs via react-spring; nothing tweens linearly. Every significant animation must reinforce the living-web feeling (§31) — decoration-only animation is a review defect.
9. **Reduced motion is a first-class mode.** With `prefers-reduced-motion`, the web is still and fully functional: no scurry (the search resolves in place with a simple transition), no parallax, no ambient motion. Understanding the product never requires animation (§36).
10. **Mobile is a concept-preserving tier.** Same ritual, touch-first interactions, reduced object density and fidelity. The concept — mysterious web, searching spider, title-only reveal — must survive intact.

---

## 5. The Engine — Selection Contract

The engine is the heart of controlled serendipity (PRD §17–18). It is a **pure TypeScript module**: no DOM, no React, no storage access. Dependencies are injected. Its entry point, its rules and its tuning values are fixed by `docs/specs/0001-selection-engine.md` (2026-10-16).

```
interface SelectionInput {
  library: Topic[];            // the full curated pool
  history: TopicRecord[];      // one record per story shown, rerolled or not
  day: DayState;               // day key + today's offer state
  rng: () => number;           // seeded PRNG
}
```

**Rules it must enforce:**

- **Hard exclusions:** topics presented in the last 30 days (except intentional resurfacing, below); excluded domains (PRD §14) — enforced upstream, at authoring and validation, so a topic in an excluded domain never enters `content/topics/`. The engine receives no list of them and must not carry one.
- **Determinism per day:** the PRNG is seeded from `(clientId, dayKey)`. A reload, a re-visit, a device restart — the same day offers the same stories in the same order. The day's story never changes mid-day (D5).
- **Diversity weighting:** penalize domains and tags seen recently; boost time-since-exposure; maintain a rolling difficulty spread across levels 1/2/3; prevent monotonous category rotation *and* mechanical alternation — the sequence must feel, not look, random.
- **Intentional resurfacing:** a rare, weighted event — only topics flagged resurfacing-eligible, only after a long absence (at least 60 days since their last showing), and rare by chance rather than by schedule: one roll per offer at a tuned probability, initially one day in seven, so roughly one day a week carries a return without ever promising one. The earlier "at most one per rolling week" cap is **withdrawn**: the input records that a topic was shown, never that it was a return, so the cap cannot be enforced from it. Spec `docs/specs/0001-selection-engine.md` records the trade and the derivation that would restore the cap. Resurfaced topics get the *"Anansi has brought this one back."* treatment (§18).
- **Rerolls:** each reroll asks the engine for the next story of the day, which must differ from all stories offered so far today. Rerolled stories are logged as Explored.

**Topic schema.** The runtime source of truth is `src/content/types.ts`; this snippet mirrors it.

```ts
// Domain: closed union of the 24 spheres in PRD §12.
// Tag:    closed union of the 12 characteristics in PRD §11.

interface Topic {
  id: string;              // stable slug, identical to the source file name
  title: string;           // natural case: "The Cobra Effect"
  domain: Domain;          // one of the 24 in PRD §12
  difficulty: 1 | 2 | 3;   // internal only — never surfaced to users
  tags: Tag[];             // at least one; closed union from PRD §11
  resurfacing: boolean;    // eligible for intentional resurfacing
  added: string;           // ISO date, YYYY-MM-DD
}
```

Two refinements were made during the build, both invited by this schema's own "refine during build" note:

- **`title` is stored in natural case**, not display case. The reveal uppercases it in CSS, so casing stays a presentation concern and screen readers are not handed an all-caps string.
- **`tags` is a closed union** of the twelve PRD §11 characteristics rather than `string[]`, so the validator catches typos and coverage can be measured.

The library source is one file per topic at `content/topics/<id>.json`, and `id` must equal the file name.

**Local state schema (localStorage, namespace `anansi:v1:*`)**:

Each value is stored under its own key, carries `version: 1`, and is validated when read, so one damaged key resets that store alone (spec 0002).

```ts
interface Identity {             // anansi:v1:identity
  clientId: string;              // generated once, seeds the engine, never sent
}

interface TopicRecord {          // one per presented topic
  topicId: string;
  dayKey: string;                // day it was presented
  presentedAt: number;           // epoch ms
  accepted: boolean;             // the day's commitment — drives the 90-day count
  status: 'explored' | 'learned';
}

interface DayState {             // anansi:v1:today — validated on load
  dayKey: string;
  offeredTopicIds: string[];     // up to 3, in offer order
  acceptedTopicId: string | null;
}

interface Progress {             // anansi:v1:progress
  journeyStart: string;          // day key the current journey began
  journeysCompleted: number;     // full 90s already finished
  acceptedDayKeys: string[];     // the current journey's accepted days, at most 90
}
```

Days completed = the length of `acceptedDayKeys`, one per distinct day with an accepted topic in the current journey. The tally is kept because the 30 day history it is drawn from prunes long before a 90 day journey ends. A completed journey rolls into the next one gracefully (§19 has no failure state).

---

## 6. Content Pipeline

- The library source of truth is `content/topics/` — one entry per topic, versioned, human-reviewed.
- **Launch target: 300+ topics**, spread across the PRD §12 domains, with a balanced internal difficulty mix (§13).
- Every topic is reviewed against the quality philosophy and exclusions (PRD §10, §11, §14) before entering the pool. The review checklist lives with the authoring scripts.
- AI-assisted expansion (PRD §16) is **authoring-time only**: scripts propose candidates into `content/review/`; nothing ships without human validation. The runtime never sees AI-generated content.
- `scripts/` compiles the source into the static bundle the app loads and runs validation (schema, dedupe, domain/difficulty coverage) in CI.

---

## 7. Design System

**Palette (PRD §34) — token roles:**

| Token | Value | Role |
|---|---|---|
| `--anansi-jet` | `#19323C` | structural grounding |
| `--anansi-black` | `#08090A` | deep grounding, dark-mode base |
| `--anansi-yellow` | `#FAFF00` | high-attention accent — sparing by rule |
| `--anansi-strawberry` | `#FF3E41` | expressive secondary |
| `--anansi-lavender` | `#885A89` | expressive secondary |

Yellow is the most regulated token in the system: it marks the *one* thing that matters most in the current moment (the reveal, the primary action). If everything glows, nothing does.

**Light/dark:** both modes are token sets, swapped via the playful sun/moon interaction (§33). Dark is expected to be the native feel of the world; both modes must pass contrast checks (§36).

**Typography:** bold geometric display face for titles and the hero line; a highly readable sans for UI. Exact faces are picked during the first UI build and imprinted.

**Motion:** spring physics everywhere (react-spring); no linear tweens; interaction responses are physical — inertia, tension, displacement (§31).

**Visual patterns are governed by `ui-registry.md`** — every UI component's patterns are imprinted there after building (`/imprint`) and read before building the next one. The registry is the consistency enforcer across sessions.

---

## 8. Performance Budgets

Enforced, not aspirational. Measured at each `/review`.

| Budget | Target |
|---|---|
| App shell JS (gzip, pre-scene) | ≤ 250 KB |
| Scene chunk (gzip, lazy) | ≤ 350 KB |
| Topic bundle (gzip, 300 topics) | ≤ 150 KB |
| First usable interaction (mid-range mobile, 4G) | ≤ 3.5 s |
| Idle steady-state GPU | ≈ 0 (on-demand rendering) |
| Search-animation frame time (mid-range desktop) | ≤ 16 ms |
| Lighthouse performance | ≥ 85 desktop / ≥ 75 mobile |

Budgets exist to protect §35 — *the illusion of complexity without computational complexity*. If a feature breaks a budget, the feature waits.

---

## 9. Accessibility Commitments

- The ritual is fully operable by keyboard; visible focus states throughout.
- The semantic DOM layer (hero, actions, reveal, history) carries the product; the canvas is an enhancement, never a gate.
- The canvas element carries an accessible description of the world's state.
- `prefers-reduced-motion` → still web, identical information, identical affordances (§4, rule 9).
- Contrast passes in both modes; readable typography; screen-reader-friendly controls (§36).

---

## 10. Workflow Rituals

The project has five workflow skills in `skills/`. They are followed directly (read the SKILL.md and do what it says).

| Ritual | When | Effect |
|---|---|---|
| `/architect` | Before any non-trivial feature | Align language, resolve decisions, produce a plan; nothing builds until the plan is confirmed |
| `/imprint` | After building **any** UI component | Extract visual patterns → `ui-registry.md`; run `/imprint audit` first if the registry doesn't exist yet on existing UI |
| `/review` | After completing any feature | Three-layer report (plan alignment, system integrity, production readiness) with severities; reports, never fixes |
| `/remember save` | End of every session | Essential state → `memory.md` (never secrets) |
| `/remember restore` | Start of every session | Read `memory.md` + context files; confirm understanding before continuing |
| `/recover` | When something breaks | Diagnose the failure mode (bug / polluted session / wrong foundation) *before* responding |

The memory-restore habit: at session start, `memory.md` and this document together are the entry point — MCD for standing truth, memory for where we left off.

---

## 11. Glossary

| Term | Meaning |
|---|---|
| **The Stage / Diorama** | The world metaphor: authored camera, user watches and touches, never navigates |
| **Anansi** | The character — searcher and deliverer of stories, never a chatbot, never a teacher |
| **Day key** | The user's local calendar date (`YYYY-MM-DD`, their timezone); the key for all daily logic |
| **The day's story** | The third and final story offered in a day; persists unchanged until local midnight |
| **Reroll** | Sending Anansi back to search; max 2 per day; the rerolled story still counts as Explored |
| **Explored / Learned** | Presented by Anansi / explicitly marked learned by the user |
| **Accepted** | The user took the story ("I'll take this") — one per day, drives the 90-day count |
| **Controlled serendipity** | Felt randomness, actual hidden intelligence — the engine's weighting discipline |
| **The Journey** | The 90-day articulation challenge, counted in accepted days (37 / 90, never streaks) |
| **Evolving web** | The world's density and richness growing with journey progress (§20) |
| **Procedural Memphis** | The art direction: all objects code-generated from primitives + flat palette materials |
| **Object family** | A parametric generator producing endless variants of one object type |
| **The accounts era** | The future in which auth, Supabase, and cloud sync arrive; everything now is designed to migrate additively |
| **Imprinting** | Capturing a component's visual patterns into `ui-registry.md` |

---

## 12. Deferred — The Accounts Era

Recorded so the future is cheap, not to build it now.

- **Supabase** (Postgres, auth, RLS) for per-user cloud state; the engine lifts to an edge function with the same `SelectionInput` contract.
- **One-time local → cloud history sync** on first account creation.
- **Cross-device persistence**, **export/import** of the journey.
- Privacy-friendly analytics (e.g. Plausible) — the first thing to add when usage insight is wanted, no architecture change required.

---

## 13. Where We Are

- PRD v1.1 and this MCD are ratified.
- **Built and verified.** The scaffold (Vite + React 18 + TypeScript strict, one component tree), the DOM shell (hero line, primary action, palette tokens, reduced-motion mode), the content layer (schema, validation and compile pipeline, a 24-topic seed library, compiled bundle, loader), the selection engine of §5 (`offerNextStory`, the contract shapes, the frozen tuning object, the day key and the seeded PRNG), and the state layer of spec 0002: four validated stores under `anansi:v1:*`, the day rollover, the 30 day prune, the accepted day tally with the journey roll, the generated client id, the per day stream helper, and cross tab rehydration. `npm run verify` — typecheck, content check, tests, documentation drift check, build — exits 0, with 159 tests passing.
- **Not built.** The ritual loop and its screens, the history drawer, the visible 90-day counter, light mode, and the whole 3D world. `src/world/` does not exist, and nothing in `src/app/` calls the store yet.
- **Weak points.** Engine purity is enforced in the suite rather than by convention: `src/engine/purity.test.ts` fails when an import crosses into the app, state or world layers, or when a source reads a clock, storage, the DOM or the network. CI runs the gate on push and pull requests — `.github/workflows/verify.yml`, committed as `ca1502d`, first run green on 2026-10-16 — so §6's validation is enforced on the remote rather than by memory; its failure path is still proven only locally. The §10 state files (`AGENTS.md`, `ui-registry.md`, `memory.md`, and `docs/scope/`, all created on 2026-10-16) are committed as `95a8b1e`, so the rituals can run and their output stays versioned. The teardown's current-state claims are enforced mechanically by `npm run docs:check`, a gate step since 2026-10-16, while its network and live-install figures remain on trust.
- The build order for what remains, with its gates and acceptance criteria, is `docs/BUILD_ROADMAP.md`. The verified state of the repository is `docs/SYSTEM_TEARDOWN.md`.
- Next step: **the ritual loop** (roadmap Phase 4), the first build a person can use: ask for a story through `offerNextStory`, offer a reroll, record what was shown, and accept the day's story, all through the state layer's actions so the tally and the history cannot drift. The engine is fixed by `docs/specs/0001-selection-engine.md` and the store by `docs/specs/0002-local-state-and-persistence.md`.
