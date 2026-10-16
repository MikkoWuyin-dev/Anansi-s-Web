# Anansi's Web — System Teardown

- **Document type:** Whole-repository audit and state assessment
- **Subject:** `C:\dev\Anansi's Web`
- **Audit date:** 2026-10-16
- **Auditor:** Buffy (automated code agent)
- **Report status:** Complete — findings verified by direct inspection and command execution

---

## 0. How to read this document

This is a whole-repo teardown written for a human engineer or a coding agent
arriving cold. It answers three questions, in order:

1. **What is this project?** (intent, product, philosophy)
2. **What actually exists on disk right now?** (verified state, not aspiration)
3. **What is the gap between the two, and what should happen next?** (delta, risks, plan)

Every claim about the current state was produced by running commands in the
repository, not by trusting the documentation. The commands and their raw
results are recorded in Section 5 so they can be re-run and reproduced.

The single most important fact, stated plainly up front: **this is a
documentation-complete, code-empty project.** The product is specified in
unusual detail; almost none of it has been implemented. Section 5 and
Section 9 carry the evidence.

---

## 1. Executive summary

**Anansi's Web** is a fully static, accountless, single-page 3D web experience
that gives the user one intriguing topic per day to research and then explain
aloud in their own words. It is a "discovery and articulation ritual", not a
learning platform. The north star, stated in both design documents, is
*"make curiosity irresistible, then get out of the way"* — and, unusually for a
consumer web product, **time-on-site is treated as a failure signal.**

The project has a mature, ratified design: a detailed Product Requirements
Document (PRD v1.1) and a Master Context Document (MCD v1.0) that locks six
architectural decisions and specifies the stack, the selection engine contract,
data schemas, performance budgets, and accessibility commitments. A bundled set
of **13 workflow skills** (in `skills/`) defines the human-plus-agent process for
building it.

Against that specification, the repository currently contains:

| Layer | Specified in docs | Present on disk |
|---|---|---|
| Product definition | PRD v1.1 (950 lines) | Yes |
| Technical truth | MCD v1.0 (305 lines) | Yes |
| Build tooling config | Vite + TS + package.json | Yes (partial, unbuildable) |
| Application source | `src/` (app, world, engine, state, content) | **No** |
| Topic content library | `content/topics/` (300+ topics) | **No** |
| Authoring scripts | `scripts/` | **No** |
| Workflow state files | `AGENTS.md`, `memory.md`, `ui-registry.md`, `docs/specs/`, `docs/scope/` | **No** |
| Version control | implied | **No Git repo** |

**Headline state:** `npm run build` fails, `npm run typecheck` fails,
`npm run test` finds nothing to run. This is expected for a scaffold stage, but
it means the project cannot currently produce a single artifact. The dependency
tree, however, is installed, clean, and version-consistent — the foundation is
sound; the structure above it does not exist yet.

**Single biggest risk:** the project is not under version control. A rich,
ratified body of design and workflow knowledge exists as untracked files on one
machine. This outranks every code-level issue in this report.

---

## 2. Identity of the project

| Attribute | Value |
|---|---|
| Product name | Anansi's Web |
| Package name | `anansis-web` |
| Version | `0.1.0` |
| Product type | Interactive single-page web application (SPA) |
| Purpose | Daily articulation practice via controlled serendipitous topic discovery |
| Core loop | Discover → Research → Understand → Explain |
| Signature challenge | 90-day articulation journey (shame-free, no streaks) |
| History | 30-day rolling, local-first |
| Design direction | Immersive, playful, unconventional, Memphis-inspired 3D |
| Architecture | Fully static, accountless, local-first (no backend in V1) |
| Project UUID | `972034cb-feab-483c-ab18-91be95480bbe` (in `.freebuff/project-id`) |

**Naming.** The product is named for Anansi, the Akan/Ashanti spider figure
associated with storytelling, wit, intelligence, and speech. The application
conceptualises itself as Anansi's Web: a strange, beautiful, interconnected
world of stories and knowledge. The PRD explicitly requires that mythological
and cultural claims be verified before appearing in public-facing copy, and that
the representation stay respectful.

**The philosophical stance, because it explains many technical choices.** The
user receives only a topic *title*, deliberately with no explanation, definition,
category, or "did you know" text. The mystery is the feature: the user must ask
"what is that?", leave the site to research it, and explain it aloud. The web
animates the act of *searching* so that discovery feels like an event, not a
loading spinner. This is why topic titles are unadorned, why the reveal is
restrained, and why the 3D layer is decorative-by-design rather than
navigation.

---

## 3. Repository map

Every file outside `node_modules/` (84 files total), with its role.

```
C:\dev\Anansi's Web\
├── .freebuff/
│   └── project-id                37 B   Project UUID (Freebuff tooling)
├── docs/
│   ├── PRD.md                    950 lines  Product Requirements Document v1.1
│   └── MCD.md                    305 lines  Master Context Document v1.0
├── skills/                       75 files / ~5,900 lines  Workflow skill toolkit
│   ├── architect/                (11 files) Design/decision specs → docs/specs/
│   ├── audit/                    (12 files) Bootstrap AGENTS.md context files
│   ├── check/                    ( 6 files) Runtime verify + fresh-model review
│   ├── debug/                    ( 2 files) Root-cause bug investigation loop
│   ├── develop/                  (12 files) Build feature from an approved spec
│   ├── document/                 ( 7 files) PR/changelog/release-note/postmortem
│   ├── imprint/                  ( 1 file ) Extract UI patterns → ui-registry.md
│   ├── recover/                  ( 1 file ) Diagnose failure type before responding
│   ├── remember/                 ( 1 file ) Session save/restore → memory.md
│   ├── review/                   ( 1 file ) Post-feature three-layer report
│   ├── scope/                    (13 files) Living scope → docs/scope/
│   ├── sync/                     ( 3 files) Reconcile AGENTS.md + scope + specs
│   └── test/                     ( 5 files) Test suite authoring
├── index.html                    Vite HTML entry (references /src/main.tsx)
├── package.json                  Manifest + scripts (dev/build/typecheck/test)
├── package-lock.json             Lockfile v3, 221 packages
├── tsconfig.json                 TS 5.6 strict config, @/* → src/*
├── vite.config.ts                Vite + React plugin, vitest config
└── .gitignore                    node_modules/, dist/, *.local, .DS_Store
```

**Line-count weight distribution.** The repository's mass is almost entirely
prose and process, not code:

| Category | Files | Approx. lines |
|---|---|---|
| Product/technical docs | 2 | 1,255 |
| Workflow skills | 75 | ~5,900 |
| Build config (JSON/TS/HTML) | 5 | ~160 |
| Application source | 0 | 0 |

---

## 4. What the project is meant to be (condensed PRD)

The PRD is 950 lines across 40 sections. This is the load-bearing content, not a
substitute for reading it.

**The problem.** People constantly encounter concepts they know exist but cannot
explain — why airplane windows have rounded corners, why déjà vu happens, what
the Cobra Effect is. Meanwhile many people want to become better communicators
but have no consistent practice. Anansi's Web supplies the missing trigger: one
interesting thing to learn and explain every day.

**The core loop (PRD §5).** Enter → Anansi is already active → ask for a story →
Anansi visibly searches the web → a topic is revealed with no explanation →
user accepts it ("I'll take this") or rerolls → accepted topic is logged → user
leaves to research → explains aloud → optionally marks it learned → returns
another day.

**The Daily Ruling (PRD §9, MCD D5).** Each day offers at most three stories:
the first after the search, then up to two rerolls. The *third* story is "the
day's story" and persists unchanged until local midnight. Every story shown
counts as **Explored**, rerolled or not, and feeds the diversity engine.

**Controlled serendipity (PRD §17).** Selection uses hidden intelligence —
recency penalties, domain/tag diversity weighting, time-since-exposure boosts,
a rolling difficulty spread, and rare "intentional resurfacing" — but the user
must experience it as pure randomness. The rules stay invisible.

**Difficulty (PRD §13).** Three internal levels — familiar subject/unfamiliar
explanation, familiar concept/deeper understanding, obscure concept — never
surfaced to the user, used only to keep variety.

**Exclusions (PRD §14).** No politics, religion, explicit sexuality, graphic
medical topics, highly technical mathematics, or sensitive/controversial
subject matter requiring specialist handling.

**Location independence (PRD §15).** No personalisation from IP, country, or
local events. Diversity comes from the pool, not inferred location.

**Progress philosophy (PRD §19, §21).** "37 / 90", never "37-day streak". No
shame messaging, no leaderboards, no XP, no compulsion notifications. Missing
days is not punished.

**Evolving web (PRD §20).** The 3D world grows denser — strands, objects,
connections — as the journey accumulates, so the user feels "I built this".

**History (PRD §22).** 30-day rolling, in-browser, searchable, filterable
(All / Explored / Learned), auto-cleaned after retention.

**Explicit V1 non-goals (PRD §38).** No AI tutoring, no chat with Anansi, no
recording studio, no speech analysis, no social features, no leaderboards, no
monetisation, no personalisation, **no authentication, no backend**. The app is
fully static. AI is used at *authoring time only*, never at runtime, and
AI-proposed topics require human validation before shipping.

---

## 5. Verified current state (evidence)

These commands were executed in the repository root on 2026-10-16. Exit codes
are the real exit status of the tool, captured without a pipeline swallowing it.

### 5.1 Typecheck — FAILS

```
$ npm run typecheck     # tsc --noEmit
vite.config.ts(4,31): error TS2307: Cannot find module 'node:url' or its corresponding type declarations.
exit code: 2
```

**Cause:** `vite.config.ts` imports `node:url` (for the `@` alias), but
`@types/node` is not installed and not declared. `tsconfig.json` has no
`"types"` allowlist, so `tsc` simply has no Node type definitions to resolve.

### 5.2 Production build — FAILS

```
$ npm run build         # vite build
vite v5.4.21 building for production...
transforming...
✓ 2 modules transformed.
✗ Build failed in 431ms
error during build:
[vite]: Rollup failed to resolve import "/src/main.tsx" from "C:/dev/Anansi's Web/index.html"
exit code: 1
```

**Cause:** `index.html` loads `<script type="module" src="/src/main.tsx">`, but
no `src/` directory exists. There is no entry module. No `dist/` is produced.

### 5.3 Tests — NOTHING TO RUN

```
$ npm run test          # vitest run
RUN  v2.1.9 C:/dev/Anansi's Web
include: src/**/*.test.ts
No test files found, exiting with code 1
exit code: 1
```

**Cause:** the vitest config includes only `src/**/*.test.ts`; `src/` does not
exist.

### 5.4 Dependency installation — HEALTHY

```
$ npm ls --depth=0      # no peer warnings, no "invalid" markers
$ node --version        → v24.13.0
$ npm --version         → 11.6.2
$ lockfileVersion       → 3
```

Installed versions (all consistent with declared ranges):

| Package | Declared | Installed |
|---|---|---|
| react / react-dom | ^18.3.1 | 18.3.1 |
| three | ~0.169.0 | 0.169.0 |
| @react-three/fiber | ^8.17.10 | 8.18.0 |
| @react-three/drei | ^9.114.3 | 9.122.0 |
| @react-spring/web / three | ^9.7.4 | 9.7.5 |
| zustand | ^4.5.5 | 4.5.7 |
| vite | ^5.4.9 | 5.4.21 |
| vitest | ^2.1.3 | 2.1.9 |
| typescript | ~5.6.3 | 5.6.3 |
| @types/react / react-dom | ^18.3.x | 18.3.31 / 18.3.7 |

221 packages in the lockfile; 117 top-level directories in `node_modules`.
`@types/node` is **absent** (see 5.1).

### 5.5 Version control — ABSENT

```
$ git status
fatal: not a git repository (or any of the parent directories): .git
```

There is no `.git` directory. No history, no branches, no remotes, no `.github/`
CI. The entire project — including the ratified design documents — is untracked
local state.

### 5.6 Referenced-but-missing paths

Checked for existence (`PRESENT`/`MISSING`):

```
MISSING  src              (MCD §3: app/, world/, engine/, state/, content/)
MISSING  content          (MCD §3, §6: content/topics/, content/review/)
MISSING  scripts          (MCD §3, §6: validation, dedupe, bundle compilation)
MISSING  docs/specs       (/architect output — no spec exists yet)
MISSING  docs/scope       (/scope output — no scope exists yet)
MISSING  AGENTS.md        (read by every skill; the project's canonical context file)
MISSING  CLAUDE.md        (pointer file to AGENTS.md)
MISSING  memory.md        (/remember session handoff)
MISSING  ui-registry.md   (/imprint visual pattern registry)
MISSING  README.md        (no human entry point)
MISSING  .github, .eslintrc, .prettierrc, .editorconfig
```

---

## 6. Documentation deep-dive

The two documents in `docs/` are the project's brain. They are complementary and
their authority is explicit.

### 6.1 `docs/PRD.md` — Product Requirements Document v1.1

Status line reads *"Product Definition / Pre-Implementation"*. It was amended to
v1.1 on 2026-10-11 through an architect session, and the amendment history is
recorded at the top. The v1.1 amendments are the decisions that make the V1
scope coherent:

- §9 Daily Ruling — three topics, two rerolls, the day's story, the day key
- §16 Fully static delivery; AI strictly authoring-time
- §17 Selection intelligence runs locally in V1
- §19 A day is the user's own local calendar day
- §22 History is local-first, stored in the browser
- §24 Accounts deferred; V1 accountless
- §25 Zero-friction entry — no wall of any kind
- §29 The web is a stage the user watches and touches, never free-navigates
- §30 All objects procedural Memphis; no imported 3D assets
- §35 On-demand rendering — an idle web costs nothing
- §38 Authentication and any backend added to non-goals

The PRD routes all engineering questions to the MCD, explicitly naming it the
canonical technical companion.

### 6.2 `docs/MCD.md` — Master Context Document v1.0

Status line reads *"Ratified — implementation authorized"*, dated 2026-10-11.
Its preamble states the governance rule that matters most for any agent reading
this: **"Every session that works on Anansi's Web — human or AI — reads this
document first."** Where momentum and the MCD conflict, the MCD wins; changing a
decision here requires the product owner's consent and an update to both
documents first.

**Section 13 ("Where We Are") is the project's own honest status statement:**
*"PRD v1.1 and this MCD are ratified. Nothing has been scaffolded yet. Next
step: Step 2 — Scaffold the Vite + React + TS + R3F project, then the data
layer, engine, world, and loop in the agreed order."*

Note the numbering: the MCD refers to a "confirmed implementation plan" whose
Step 1 is not present in the repository. There is no implementation plan file on
disk — this is a dangling reference (see Section 9).

### 6.3 The six ratified decisions (MCD §2)

These are locked and load-bearing. Any implementation must respect them.

| ID | Decision | Consequence |
|---|---|---|
| **D1** | The web is a stage, not a navigable world. Camera is authored, never user-piloted. | Camera moves are designed choreography; no free orbit; mobile touch is intentional; the 3D layer is never load-bearing. |
| **D2** | React + React Three Fiber, Vite SPA, TypeScript throughout. One component tree, no SSR, scene chunk lazy-loaded. | drei + react-spring supply physical feel; R3F's on-demand rendering implements PRD §35 directly. |
| **D3** | Fully procedural Memphis art; no imported 3D assets. | Art direction lives in generator parameters; the evolving web scales by multiplying generators, shipping as kilobytes of math. Anansi's component is isolated so a modeled asset can be swapped in later. |
| **D4** | Fully static: no backend, client-side engine, localStorage state. | The engine must stay a pure isolated module so it can lift to a server function unchanged. |
| **D5** | Day rules: local midnight, 3 topics, 2 rerolls, seeded determinism. | A day's offers must be **stable across reloads**; the engine is seeded from `(clientId, dayKey)`. |
| **D6** | Accountless V1; accounts deferred to "the accounts era". | No cross-device sync; clearing browser data clears the journey. Future: Supabase + one-time local→cloud sync. |

---

## 7. Ratified technical contracts

This section distils the MCD's contracts, because they are what a build must
implement. Treat these as the interface specification.

### 7.1 Stack (MCD D2)

| Concern | Choice |
|---|---|
| Framework | React 18+, function components, hooks only, no SSR |
| 3D | three.js via @react-three/fiber + @react-three/drei |
| Motion | react-spring — spring physics is the house style; no linear tweens |
| State | zustand — small stores, localStorage persistence via middleware |
| Build | Vite, single-page, static output |
| Language | TypeScript, strict mode |

### 7.2 The engine — selection contract (MCD §5)

The engine is the heart of controlled serendipity and must be a **pure
TypeScript module**: no DOM, no React, no storage access; dependencies injected.

```ts
interface SelectionInput {
  library: Topic[];            // the full curated pool
  history: HistoryEvent[];     // complete local event log
  day: DayState;               // day key + today's offer state
  rng: () => number;           // seeded PRNG
}
```

Rules it must enforce:

- **Hard exclusions** — topics presented in the last 30 days (except intentional
  resurfacing); excluded domains per PRD §14.
- **Determinism per day** — PRNG seeded from `(clientId, dayKey)`; a reload,
  re-visit, or restart offers the same stories in the same order.
- **Diversity weighting** — penalise recently seen domains/tags, boost
  time-since-exposure, maintain a rolling difficulty spread across levels 1/2/3,
  and prevent both monotonous rotation and mechanical alternation.
- **Intentional resurfacing** — rare, weighted, only for eligible topics, only
  after a long gap, capped (initially at most one per rolling week).
- **Rerolls** — the next story of the day must differ from everything offered so
  far today; rerolled stories are logged as Explored.

### 7.3 Data schemas (MCD §5, initial shapes)

```ts
interface Topic {
  id: string;             // stable slug: "the-cobra-effect"
  title: string;          // display: "THE COBRA EFFECT"
  domain: Domain;         // one of PRD §12
  difficulty: 1 | 2 | 3;  // internal only — never surfaced
  tags: string[];         // quality characteristics from PRD §11
  resurfacing: boolean;   // eligible for intentional resurfacing
  added: string;          // ISO date it entered the library
}

interface TopicRecord {           // one per presented topic
  topicId: string;
  dayKey: string;
  presentedAt: number;            // epoch ms
  accepted: boolean;              // the day's commitment — drives the 90-day count
  status: 'explored' | 'learned';
}

interface DayState {              // anansi:v1:today — validated on load
  dayKey: string;
  offeredTopicIds: string[];      // up to 3, in offer order
  acceptedTopicId: string | null;
}

interface Progress {              // anansi:v1:progress
  journeyStart: string;           // day key the current journey began
  journeysCompleted: number;      // full 90s already finished
}
```

**localStorage namespace:** `anansi:v1:*`. Days completed = count of distinct
day keys with an accepted topic in the current journey. A completed journey rolls
into the next one gracefully (no failure state).

### 7.4 The 3D world — technical rules (MCD §4)

1. **One canvas** — single R3F `<Canvas>`, lazy-loaded after the DOM shell paints.
2. **On-demand rendering** — `frameloop="demand"` + invalidation; idle web ≈
   zero GPU; ambient life from occasional impulses, not a perpetual loop.
3. **Authored camera rig** — beat timeline `idle → searching → revealing →
   celebrating → resting`; cursor parallax and touch tilt modulate, never command.
4. **Web graph first** — deterministic generated graph (nodes + strands);
   objects anchor to nodes, Anansi walks strands, density is a function of
   progress, seeded per journey.
5. **Object families are parametric** — one seeded generator per family returning
   geometry + material + idle-motion params; never one-off meshes.
6. **Density mapping** — stage richness is a pure function of journey progress.
7. **Flat shading, palette tokens only** — no textures, no hardcoded hex in
   `world/` or `app/`.
8. **Motion budget** — springs only; decoration-only animation is a review defect.
9. **Reduced motion is a first-class mode** — still web, identical information,
   no scurry, no parallax.
10. **Mobile is a concept-preserving tier** — same ritual, touch-first, reduced
    density; the concept must survive intact.

### 7.5 Content pipeline (MCD §6)

- Source of truth: `content/topics/`, one entry per topic, versioned and
  human-reviewed.
- **Launch target: 300+ topics**, spread across the PRD §12 domains with a
  balanced internal difficulty mix.
- AI-assisted expansion is authoring-time only; candidates land in
  `content/review/` and require human validation. **The runtime never sees
  AI-generated content.**
- `scripts/` compiles the source into the static bundle and runs schema, dedupe,
  and domain/difficulty coverage validation in CI.

### 7.6 Design system (MCD §7, PRD §34)

| Token | Value | Role |
|---|---|---|
| `--anansi-jet` | `#19323C` | structural grounding |
| `--anansi-black` | `#08090A` | deep grounding, dark-mode base |
| `--anansi-yellow` | `#FAFF00` | high-attention accent — sparing by rule |
| `--anansi-strawberry` | `#FF3E41` | expressive secondary |
| `--anansi-lavender` | `#885A89` | expressive secondary |

Yellow is described as the most regulated token: it marks the *one* thing that
matters most in the current moment. Light and dark are both required, swapped via
a playful animated sun/moon interaction, and must both pass contrast checks.
Typography: a bold geometric display face for titles/hero, a readable sans for
UI. **Visual patterns are governed by `ui-registry.md`**, which does not yet
exist.

### 7.7 Performance budgets (MCD §8) — enforced, not aspirational

| Budget | Target |
|---|---|
| App shell JS (gzip, pre-scene) | ≤ 250 KB |
| Scene chunk (gzip, lazy) | ≤ 350 KB |
| Topic bundle (gzip, 300 topics) | ≤ 150 KB |
| First usable interaction (mid-range mobile, 4G) | ≤ 3.5 s |
| Idle steady-state GPU | ≈ 0 (on-demand rendering) |
| Search-animation frame time (mid-range desktop) | ≤ 16 ms |
| Lighthouse performance | ≥ 85 desktop / ≥ 75 mobile |

If a feature breaks a budget, the feature waits.

### 7.8 Accessibility commitments (MCD §9, PRD §36)

Full keyboard operability and visible focus; the semantic DOM layer carries the
product with the canvas as enhancement only; the canvas carries an accessible
description of the world's state; `prefers-reduced-motion` yields a still but
fully functional web; contrast passes in both modes.

---

## 8. The workflow skills system

`skills/` holds a self-contained, agent-agnostic development workflow toolkit —
75 files across 13 skills, roughly 5,900 lines. It is a vendored process layer,
not application code and not authored for this product specifically. Each skill
is a `SKILL.md` (with YAML front matter: `name`, `description`,
`allowed-tools`) plus supporting mode, template, and reference files.

Notable: several skills carry an explicit shared "Output style" block that bans
em dashes, en dashes, and hyphenated compounds in everything they produce, and
requires plain, warm, second-person language presented as recommendations rather
than orders.

### 8.1 Skill inventory

| Skill | Purpose |
|---|---|
| `architect` | Structured discovery, option weighing, build spec → `docs/specs/`. Four modes: FEATURE, ARCHITECTURE, CROSS-CUTTING, ENHANCEMENT. |
| `audit` | Bootstraps the `AGENTS.md` context files every other skill reads. Greenfield, whole-repo, area, and gap-fill phases. |
| `check` | Pre-merge gate. `verify` drives the real app against the spec; `review` runs a senior code review on a *different* model; writes to `docs/reviews/`. |
| `debug` | Reproduce → localize → hypothesize → test → fix → verify. One hypothesis at a time; smallest fix; hands a regression test to `test`. |
| `develop` | Builds a feature from an approved spec plus `AGENTS.md`. Gates on the spec; routes back to `architect` if a load-bearing decision is unmade. |
| `document` | Writes PR body, changelog, release notes, or postmortem from real commits/diffs. |
| `imprint` | Extracts visual patterns after building any UI component → `ui-registry.md`, so later components match earlier ones. |
| `recover` | Diagnoses the *type* of failure (bug / polluted session / wrong foundation) before responding. |
| `remember` | `save`/`restore` session state → `memory.md`. Explicitly forbidden from persisting secrets. |
| `review` | Post-feature three-layer report (plan alignment, system integrity, production readiness). Reports, never fixes. |
| `scope` | Turns an idea into a living coarse scope in `docs/scope/`: plan, next slice, enroll a feature, reconcile after shipping. |
| `sync` | After a change: surgical edits to `AGENTS.md`, scope reconciliation, flags stale specs. |
| `test` | Writes a test suite for changed-but-uncommitted code; picks strategy per file; reads `test preferences.json` for the framework. |

### 8.2 The intended pipeline

The skills form a chain: `/scope` (what, in what order) → `/architect` (design,
decide, spec) → `/develop` (build) → `/check` (verify + review) → `/test`
(suite) → `/document` (prose) → `/sync` (reconcile knowledge),
with `/imprint` after any UI, `/remember` at session boundaries, `/recover`
and `/debug` on failure.

### 8.3 Ritual obligations the MCD imposes on this project

The MCD §10 commits the project to five rituals, drawn from this toolkit:
`/architect` before any non-trivial feature, `/imprint` after any UI component,
`/review` after any feature, `/remember save`/`restore` at session boundaries,
and `/recover` when something breaks.

**Critical coupling:** `AGENTS.md` is the canonical context file that the skill
system (and every agent tool) reads, and it does not exist. The MCD also names
`ui-registry.md` and `memory.md` as maintained artifacts, and neither exists.
In effect, the project has adopted a process whose required state files are all
missing — the process cannot function as designed until at least `AGENTS.md`
is created.

---

## 9. Gap analysis: specification vs reality

### 9.1 Path-by-path delta

| Planned (source) | Status | Notes |
|---|---|---|
| `docs/PRD.md` | Present | v1.1, 950 lines, ratified |
| `docs/MCD.md` | Present | v1.0, 305 lines, ratified |
| `src/app/` | Missing | DOM UI: hero, topic card, history drawer, settings, mode switch |
| `src/world/` | Missing | Camera rig, web graph, object families, Anansi, choreography |
| `src/engine/` | Missing | Pure selection logic — the load-bearing boundary |
| `src/state/` | Missing | zustand stores + localStorage persistence |
| `src/content/` | Missing | Compiled topic bundle + loader + types |
| `src/main.tsx` | Missing | Referenced by `index.html` — the build entry point |
| `content/topics/` | Missing | 300+ curated topics (MCD §6) |
| `content/review/` | Missing | AI-proposed candidates awaiting validation |
| `scripts/` | Missing | Validation, dedupe, bundle compilation |
| `ui-registry.md` | Missing | Imprinted visual patterns |
| `memory.md` | Missing | Session handoff |
| `AGENTS.md` / `CLAUDE.md` | Missing | Context files every skill reads |
| `docs/specs/` | Missing | `/architect` output — no spec exists |
| `docs/scope/` | Missing | `/scope` output — no scope exists |
| CI (`.github/`) | Missing | MCD §6 expects validation "in CI" |
| Lint/format config | Missing | No ESLint, Prettier, or EditorConfig |

### 9.2 Build/run state delta

| Intended capability | Actual state |
|---|---|
| `npm run dev` | Starts Vite, but the app cannot render — no entry module |
| `npm run build` | **Fails** — unresolved `/src/main.tsx` |
| `npm run typecheck` | **Fails** — missing `node:url` types |
| `npm run test` | **Fails** — no test files in the configured glob |
| Produce `dist/` | No — build never completes |
| `npm install` | Works; 221 packages, clean tree |

### 9.3 Documentation consistency notes (minor, but fixable now)

- **Dangling reference:** MCD §13 refers to a "confirmed implementation plan" and
  its "Step 2 — Scaffold", but no plan file exists in the repository. Either the
  plan lives outside the repo or it was never written to disk.
- **Toolkit vs project mix:** `skills/` is a general-purpose workflow toolkit
  committed into the product repository. Nothing in the docs explains this
  decision. It nearly triples the repository's prose mass and is unrelated to
  the shipped product. A reasonable engineer might vendor it elsewhere or
  document why it lives here.
- **Skill drift from this project:** several skills describe richer default
  behaviour than the MCD rituals (for example `check` writes `docs/reviews/`
  and `architect` writes `docs/specs/`, neither of which exists yet). The MCD and
  the toolkit should be reconciled once the first feature is built.
- **PRD §34 palette vs MCD §7 roles** agree on values; the MCD adds roles and the
  "most regulated token" rule for yellow. No conflict.
- **Font loading:** `index.html` pulls Space Grotesk from Google Fonts via
  `<link rel="preconnect">` + stylesheet. This is an external network dependency
  and a third-party request, mildly in tension with PRD §35's "minimal
  unnecessary network requests". Worth a conscious decision (self-host or accept).

---

## 10. Risk register

Ordered by severity. Each is a concrete, actionable item.

### R1 — No version control (CRITICAL)

There is no Git repository. The entire project — including the ratified PRD and
MCD, the 75-file skill toolkit, and the lockfile — exists only as untracked files
on one machine. A disk failure, an accidental delete, or a bad edit loses
everything with no recovery. Every other risk in this report is recoverable; this
one is not.

**Action:** `git init`, add a sensible `.gitignore` (already close — consider
adding `.freebuff/` or keeping it deliberately), and make an initial commit
capturing the current ratified state.

### R2 — The project cannot build (CRITICAL for any progress)

`npm run build` fails on a missing entry module, so nothing can be produced,
deployed, or reviewed. This is the expected state for a scaffold that was never
completed, but it must be the first thing resolved.

**Action:** complete the scaffold — create `src/main.tsx` and a minimal app
shell — and re-run the three commands until they pass.

### R3 — Missing Node types break typecheck (HIGH, trivial)

`vite.config.ts` needs `node:url`, but `@types/node` is absent, so
`npm run typecheck` fails even before application code exists.

**Action:** add `@types/node` to `devDependencies`. Consider also adding an
explicit `"types"` list to `tsconfig.json` to keep the global type surface
intentional. Note `tsconfig.json` already sets `"include": ["src", "vite.config.ts"]`,
which is correct once `src/` exists.

### R4 — Process state files absent (HIGH)

`AGENTS.md`, `memory.md`, and `ui-registry.md` are required by the adopted
workflow and the MCD but do not exist. The `/audit` skill exists precisely to
create `AGENTS.md`; the workflow cannot function without it.

**Action:** run `/audit` (or hand-write `AGENTS.md`) to capture coding standards
and the ratified stack, then let `/imprint` seed `ui-registry.md` after the first
UI component.

### R5 — The engine boundary is unspecified in code (MEDIUM)

MCD §3 and §5 declare the `engine/` purity boundary load-bearing — it must import
nothing from `app/`, `world/`, or `state/`, and must run with no DOM, React, or
storage access. This is only a convention today; nothing enforces it.

**Action:** when the engine is written, enforce the boundary structurally
(directory placement plus, ideally, a lint rule or a test that asserts no
forbidden imports), and test it in the `node` vitest environment the config
already assumes.

### R6 — Test configuration assumes tests that do not exist (MEDIUM)

`vitest` is configured for `environment: 'node'` and `src/**/*.test.ts`. That
suits pure engine tests but offers no path for React component tests (which
would need `jsdom` and a DOM environment). No `setupFiles` are configured.

**Action:** keep the node environment for `engine/`, and add a second environment
(or per-file `// @vitest-environment jsdom` comments) when component tests begin.

### R7 — No content protection strategy yet (MEDIUM)

The product ships its entire topic pool as static JSON in the bundle, so the
pool is trivially readable and copyable. The MCD acknowledges the bundle but not
this exposure. Given the ritual's trust philosophy this may be acceptable — but
it should be a conscious decision, not an accident.

### R8 — No linting or formatting baseline (LOW)

No ESLint, Prettier, or EditorConfig. With `strict`, `noUnusedLocals`, and
`noUnusedParameters` already on, TypeScript covers some ground, but consistency
rules (import order, hooks rules, no-hardcoded-hex per MCD §4 rule 7) are
unenforced.

### R9 — Peer-version fragility undocumented (LOW)

The stack pairs React 18, R3F 8, drei 9, and three 0.169. `npm ls` is clean
today, but the ecosystem moves quickly (R3F 9 targets React 19). Upgrading React
without upgrading R3F would break the scene layer.

**Action:** pin intentionally and note the constraint in `AGENTS.md`.

---

## 11. Recommended next steps

The MCD's own ordering is sound and is reproduced here with the missing pieces
filled in. Treat this as a starting build plan, not a rigid mandate.

**Phase 0 — Protect the work (do this first, before any code)**
1. `git init`; commit the current ratified docs and skills (R1).
2. Add `@types/node` to `devDependencies`; confirm `typecheck` passes (R3).

**Phase 1 — Complete the scaffold (make it build and run)**
3. Create `src/main.tsx` and a minimal React app shell that renders the hero line
   and a primary action, styled with the palette tokens. Confirm `build`,
   `typecheck`, and `test` all exit 0.
4. Add a first engine sanity test under `src/engine/` so the test runner has
   something real to execute.

**Phase 2 — Establish the engine (the pure heart)**
5. Implement `src/engine/` against the `SelectionInput` contract and the four
   schema types, with a seeded PRNG and deterministic day-key derivation.
6. Unit-test determinism (same day → same offers), exclusions (30-day window),
   diversity weighting, reroll uniqueness, and rare resurfacing — in the `node`
   environment already configured.

**Phase 3 — Content**
7. Stand up `content/topics/`, `content/review/`, and `scripts/`; compile the
   bundle; validate schema, dedupe, and domain/difficulty coverage. Begin toward
   the 300-topic launch target.

**Phase 4 — State and loop**
8. Implement `src/state/` with the `anansi:v1:*` localStorage schema and the
   daily/rereal loop: search → reveal → accept/reroll → history.

**Phase 5 — The world**
9. Implement `src/world/` in the MCD §4 order: web graph → camera rig → object
   families → Anansi → choreography, with `frameloop="demand"` and the
   reduced-motion mode from the start.

**Phase 6 — Governance and CI**
10. Run `/imprint` after the first UI component; create `AGENTS.md` (R4); wire CI
    to run typecheck, tests, and content validation (R5, R6).

**Definition of done for V1** — the deployed static site renders the hero and
the search ritual; a day offers at most three deterministic, reload-stable
topics; accepting logs history and advances the 90-day count; the 30-day history
is viewable and filterable; the web visibly evolves; both light/dark and
reduced-motion modes work; keyboard and screen-reader paths work; and every
performance budget in MCD §8 is met.

---

## 12. Quick reference

**Start here when picking up this project:**

1. `docs/MCD.md` — the canonical technical truth (MCD §2 decisions, §5 engine
   contract, §7 design tokens).
2. `docs/PRD.md` — the product truth (loop §5, Daily Ruling §9, serendipity §17,
   non-goals §38).
3. `AGENTS.md` — create it; it does not exist yet.

**Commands**

```bash
npm install          # works; 221 packages
npm run dev          # starts Vite; app cannot render (no entry module yet)
npm run build        # FAILS — missing /src/main.tsx
npm run typecheck    # FAILS — missing node:url types
npm run test         # FAILS — no test files
```

**Key facts to carry forward**

- The product is fully specified and fully unbuilt. No `src/`, no content, no
  scripts, no context files.
- The dependency tree is installed, clean, and version-consistent.
- There is no Git repository.
- The engine must be pure and portable — it is designed to lift to a server
  unchanged in a future "accounts era".
- The 3D layer is decorative: the DOM carries the product; the canvas is an
  enhancement, never a gate.
- Time-on-site is a failure signal. Design decisions that increase session
  length oppose the product's stated purpose.

---

*End of System Teardown. All findings verified against the repository on
2026-10-16.*
