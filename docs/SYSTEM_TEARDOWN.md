# Anansi's Web — System Teardown

- **Document type:** Whole-repository audit and state assessment
- **Subject:** `C:\dev\Anansi's Web` — https://github.com/MikkoWuyin-dev/Anansi-s-Web
- **Original audit:** 2026-10-16 (v1.0)
- **Last updated:** 2026-10-16 (v2.4)
- **Auditor:** Buffy (automated code agent)
- **Status:** Complete — every state claim verified by command execution

---

## Amendment history

**v2.0 — 2026-10-16.** Updated after the scaffold and content layers were built, and after the MCD was reconciled with the code so that the two no longer disagree.

| v1 claim | v2 reality |
|---|---|
| `npm run typecheck` fails (missing `node:url` types) | Passes, exit 0 |
| `npm run build` fails (no `/src/main.tsx`) | Passes, exit 0, `dist/` produced |
| `npm run test` finds no test files | 4 files, 44 tests, exit 0 |
| No Git repository | Repository with 3 commits, pushed to GitHub, LF-normalised |
| `src/`, `content/`, `scripts/` all absent | All three exist and are populated |
| Application source: 0 lines | 828 lines in `src/`, 897 in `scripts/`, 24 topics in `content/` |
| R1, R2, R3 (unrecoverable, unbuildable, untypechecked) | Resolved |
| Next step: "Step 2 — Scaffold" | Scaffold and content layer done; engine is next |

Sections that changed: 1, 3, 5, 6, 7, 8, 9, 10, 11, 12. Sections 2 and 4 are product truth and did not change.

**v2.1 — 2026-10-16.** Same-day follow-up. The MCD §10 governance state files were created: `AGENTS.md` was written by the project owner, and `ui-registry.md`, `memory.md`, and `docs/scope/` were produced by the `/imprint`, `/remember`, and `/scope` workflows. Every statement in this document that said those files were missing or empty has been corrected to match, and R4 has been re-graded. The four files remain untracked in Git.

**v2.2 — 2026-10-16.** The four §10 state files were committed as `95a8b1e`, in the same commit as the `AGENTS.md` protocol that now governs their upkeep. Every current-state statement below that described them as untracked has been corrected, and R4 has closed. The two version-control rows also dropped their commit counts, a figure that had already decayed with every commit made since v2.0. The v2.1 note above is left as written: it records the state at that check, not now.

**v2.3 — 2026-10-16.** R5 addressed, on the project owner's instruction: `.github/workflows/verify.yml` runs the gate on every push and pull request. Its two commands were run against a pristine clone and the gate was proven to fail a deliberately broken tree (§5.10), but the workflow has never run on the remote, so R5 is reduced rather than closed and roadmap 10.1's "done when" is unmet. The repository map, the present-versus-missing block, the risk register, and the next moves are updated to match.

**v2.4 — 2026-10-16.** The workflow was committed and pushed as `ca1502d`, and its first run came back **green**: run `38947782059`, `completed / success` in 16 seconds, every step passing (§5.10). R5 therefore moves to Resolved and the CI rows, the risk register, the next moves, and the quick reference now describe a gate that runs rather than one that might. What remains unproven is the failure path on the remote: no deliberately broken commit has been pushed, because that would put a red commit on `main`.

---

## 0. How to read this document

A whole-repo teardown written for a human engineer or a coding agent arriving cold. It answers three questions, in order:

1. **What is this project?** (intent, product, philosophy) — §2, §4
2. **What actually exists on disk right now?** (verified state, not aspiration) — §3, §5, §6, §7
3. **What is the gap, and what should happen next?** (delta, risks, plan) — §9, §10, §11

Every claim about the current state was produced by running commands in the repository, not by trusting the documentation. The commands and their raw results are in §5 so they can be re-run and reproduced.

**The one-line state:** the project builds, typechecks, and tests cleanly; the content pipeline and its gate are proven end to end; the selection engine, the ritual loop, the history surface, and the entire 3D stage are not yet written. The plan that sequences them lives in `docs/BUILD_ROADMAP.md`.

---

## 1. Executive summary

**Anansi's Web** is a fully static, accountless, single-page 3D web experience that gives the user one intriguing topic per day to research and then explain aloud in their own words. It is a *discovery and articulation ritual*, not a learning platform. The north star in both design documents is *"make curiosity irresistible, then get out of the way"*, and — unusually for a consumer web product — **time-on-site is treated as a failure signal.**

The design is ratified and mature: a Product Requirements Document (PRD v1.1) and a Master Context Document (MCD v1.0) that locks six architectural decisions and specifies the stack, the engine contract, the data schemas, performance budgets, and accessibility commitments. A bundled set of 13 workflow skills in `skills/` defines the human-plus-agent process for building it.

**Built so far:**

| Layer | State |
|---|---|
| Product definition (PRD v1.1) | Ratified |
| Technical truth (MCD v1.0) | Ratified |
| Build tooling | Vite + React 18 + TypeScript strict, builds and serves |
| DOM shell | Hero line and primary action, palette tokens, reduced-motion mode |
| Content layer | 24 reviewed topics, validation and compile pipeline, typed bundle, loader |
| Engine | Two pure primitives only: the day key and the seeded PRNG |
| Version control | Git history on `main`, LF-normalised, GitHub remote (`origin`) |
| CI | `.github/workflows/verify.yml` runs on every push and PR; first run green (2026-10-16) |
| Selection engine, state, the loop, history | **Not started** |
| The 3D world (`src/world/`) | **Not started** |
| Light mode | **Not started** |
| `ui-registry.md`, `memory.md`, `docs/scope/` | Present and tracked (2026-10-16) |

**Headline state:** the foundation is real and honest. All four gates (`typecheck`, `content:check`, `test`, `build`) exit 0, and the content gate has been *proven to fail* on malformed and drifted input rather than assumed to. The product, however, does not yet do the one thing it exists to do: choose a topic.

**Single biggest risk:** delivery pace against scope. The remaining work — engine, state, loop, history, and an entire procedural 3D stage — is substantially larger than what has been built. The governance gap has narrowed: CI runs the gate on every push and pull request and its first run was green, so the gate no longer depends on someone remembering, and the governance files the adopted workflow depends on (`AGENTS.md`, `ui-registry.md`, `memory.md`, `docs/scope/`) were written late on 2026-10-16 and are now tracked, so nothing in the adopted workflow is unversioned; cross-session continuity still rests on documents rather than on an enforced process.

---

## 2. Identity of the project

| Attribute | Value |
|---|---|
| Product name | Anansi's Web |
| Package name | `anansis-web` |
| Version | `0.1.0` |
| Repository | https://github.com/MikkoWuyin-dev/Anansi-s-Web |
| Product type | Interactive single-page web application (SPA) |
| Purpose | Daily articulation practice via controlled serendipitous topic discovery |
| Core loop | Discover → Research → Understand → Explain |
| Signature challenge | 90-day articulation journey (shame-free, no streaks) |
| History | 30-day rolling, local-first |
| Design direction | Immersive, playful, unconventional, Memphis-inspired 3D |
| Architecture | Fully static, accountless, local-first (no backend in V1) |
| Runtime requirement | Node ≥ 22.6 (authoring scripts use native type stripping) |

**Naming.** The product is named for Anansi, the Akan/Ashanti spider figure associated with storytelling, wit, intelligence, and speech. The PRD requires that mythological and cultural claims be verified before appearing in public-facing copy, and that the representation stay respectful.

**The philosophical stance, because it explains many technical choices.** The user receives only a topic *title*, deliberately with no explanation, definition, category, or "did you know" text. The mystery is the feature: the user must ask "what is that?", leave the site to research it, and explain it aloud. This is why topic titles are unadorned, why the reveal is restrained, and why the 3D layer is decorative-by-design rather than navigation.

---

## 3. Repository map

Every tracked file, by area.

```
C:\dev\Anansi's Web\                        134 tracked files
├── .gitattributes              LF enforced; binaries marked
├── .gitignore                  node_modules, dist, .freebuff, generated report html
├── .github/
│   └── workflows/verify.yml    npm ci + npm run verify on push and PR (green 2026-10-16)
├── index.html                  Vite entry; Space Grotesk; favicon
├── package.json                scripts (dev/build/typecheck/test/verify/content:*)
├── package-lock.json           lockfile v3
├── tsconfig.json               strict TS 5.6; includes src, scripts, vite.config
├── vite.config.ts              React plugin; @/* alias; vitest node env
│
├── docs/
│   ├── PRD.md                  950 lines   Product Requirements Document v1.1
│   ├── MCD.md                  329 lines   Master Context Document v1.0 (amended)
│   ├── BUILD_ROADMAP.md        494 lines   Phases 0 to 11, the build sequence
│   ├── SYSTEM_TEARDOWN.md      this file    Whole-repo state assessment
│   └── system-teardown.html                Generated rendering (gitignored)
│
├── content/                    the library source of truth
│   ├── topics/                 24 reviewed JSON entries, one per topic
│   └── review/README.md        the human validation gate for AI candidates
│
├── scripts/                    authoring tools, run by Node type stripping
│   ├── validate-content.ts     schema, dedupe, coverage; exits non-zero on error
│   ├── compile-content.ts      writes the bundle; --check detects drift
│   ├── report-content.ts       coverage, difficulty spread, bundle size
│   └── lib/
│       ├── validate.ts         pure rules
│       ├── compile.ts          pure bundle renderer
│       ├── load.ts             file IO, workspace root resolution
│       └── *.test.ts           30 tests
│
├── src/
│   ├── main.tsx                mounts React into #root
│   ├── vite-env.d.ts           Vite client types
│   ├── app/
│   │   ├── App.tsx             shell: hero, primary action, live region
│   │   └── styles.css          palette tokens, layout, reduced motion
│   ├── content/
│   │   ├── types.ts            THE schema: Domain, Tag, Difficulty, Topic
│   │   ├── topics.generated.ts GENERATED bundle (committed, drift checked)
│   │   └── loader.ts           getLibrary() seam for the engine
│   └── engine/                 PURE. Imports nothing from app/ or state/
│       ├── dayKey.ts           local YYYY-MM-DD day key
│       ├── rng.ts              FNV-1a seed hash + mulberry32 PRNG
│       └── *.test.ts           14 tests
│
└── skills/                     75 files, ~6,400 lines — the workflow toolkit
```

**Weight distribution.** The repository's mass is still mostly prose and process, but the balance is shifting toward code.

| Category | Files | Lines |
|---|---|---|
| Workflow skills | 75 | 6,403 |
| Project documentation | 4 | 2,386 |
| Authoring scripts | 8 | 897 |
| Application source | 10 | 828 |
| Content (24 JSON + 1 README) | 25 | 335 |
| Build config | 6 | ~160 |

---

## 4. What the project is meant to be (condensed PRD)

The PRD is 950 lines across 40 sections. This is the load-bearing content, not a substitute for reading it.

**The problem.** People constantly encounter concepts they know exist but cannot explain. Meanwhile many want to become better communicators but have no consistent practice. Anansi's Web supplies the missing trigger: one interesting thing to learn and explain every day.

**The core loop (PRD §5).** Enter → Anansi is already active → ask for a story → Anansi visibly searches the web → a topic is revealed with no explanation → user accepts ("I'll take this") or rerolls → accepted topic is logged → user leaves to research → explains aloud → optionally marks it learned → returns another day.

**The Daily Ruling (PRD §9, MCD D5).** Each day offers at most three stories: the first after the search, then up to two rerolls. The *third* is "the day's story" and persists unchanged until local midnight. Every story shown counts as **Explored**, rerolled or not, and feeds the diversity engine.

**Controlled serendipity (PRD §17).** Selection uses hidden intelligence — recency penalties, domain and tag diversity weighting, time-since-exposure boosts, a rolling difficulty spread, and rare intentional resurfacing — but the user must experience pure randomness. The rules stay invisible.

**Difficulty (PRD §13).** Three internal levels — familiar subject with an unfamiliar explanation, familiar concept with deeper understanding, obscure concept — never surfaced to the user, used only to keep variety.

**Exclusions (PRD §14).** No politics, religion, explicit sexuality, graphic medical topics, highly technical mathematics, or sensitive subject matter requiring specialist handling.

**Location independence (PRD §15).** No personalisation from IP, country, or local events. Diversity comes from the pool, not inferred location.

**Progress philosophy (PRD §19, §21).** "37 / 90", never "37-day streak". No shame messaging, no leaderboards, no XP, no compulsion notifications.

**Evolving web (PRD §20).** The 3D world grows denser — strands, objects, connections — as the journey accumulates, so the user feels "I built this".

**History (PRD §22).** 30-day rolling, in-browser, searchable, filterable (All / Explored / Learned), auto-cleaned after retention.

**Explicit V1 non-goals (PRD §38).** No AI tutoring, no chat with Anansi, no recording studio, no speech analysis, no social features, no leaderboards, no monetisation, no personalisation, **no authentication, no backend**. AI is used at *authoring time only*, and AI-proposed topics require human validation before shipping.

---

## 5. Verified current state (evidence)

Run in the repository root on 2026-10-16. Exit codes are the real status, captured without a pipeline swallowing them.

### 5.1 The single gate — PASSES

```
$ npm run verify      # typecheck && content:check && test && build
exit 0
```

### 5.2 Typecheck — PASSES

```
$ npm run typecheck   # tsc --noEmit
exit 0
```

Covers `src/`, `scripts/`, and `vite.config.ts`. `@types/node@24.19.2` is installed, pinned to the runtime major (Node 24.13), which fixed the v1 failure on `node:url`.

### 5.3 Tests — PASS, 44 of them

```
$ npm run test        # vitest run
 ✓ scripts/lib/compile.test.ts    ( 9 tests)
 ✓ src/engine/dayKey.test.ts      ( 5 tests)
 ✓ src/engine/rng.test.ts         ( 9 tests)
 ✓ scripts/lib/validate.test.ts   (21 tests)
 Test Files  4 passed (4)
      Tests  44 passed (44)
exit 0
```

### 5.4 Content gate — PASSES, and fails correctly

```
$ npm run content:check
src/content/topics.generated.ts is up to date (24 topics)
exit 0
```

Proven to reject bad input rather than assumed to. Three probes were run:

| Probe | Result |
|---|---|
| An entry with a bad domain, difficulty 9, an unknown tag, repeated tags, a non-boolean flag, a malformed date, an unknown field, and an all-caps title | **exit 1**, all eight violations reported with file and field |
| A valid new topic added but the bundle not rebuilt | **exit 1**, "bundle is out of date" |
| Sources and bundle in agreement | **exit 0** |

### 5.5 Build — PASSES

```
$ npm run build       # vite build
dist/index.html                   1.24 kB │ gzip:  0.66 kB
dist/assets/index-BvgtmmxL.css    2.95 kB │ gzip:  1.25 kB
dist/assets/index-s7JqPggi.js   148.36 kB │ gzip: 47.55 kB
✓ built in 2.25s
exit 0
```

### 5.6 Dev server — SERVES

```
$ npm run dev
http://127.0.0.1:5173/  →  HTTP 200
```

The rendered shell was inspected in a browser: the heading "What story do you want to tell today?", the button "Find me a story", and a live region reading **"The web holds 24 stories. Anansi cannot search it yet."** — which proves the content pipeline reaches the UI. Console clean; layout left-aligned and off-centre by design; no horizontal overflow; reduced-motion rule present.

### 5.7 Version control — PRESENT

```
$ git log --oneline
f7b5095 Add the content layer: schema, authoring pipeline, and a seed library
4242762 Complete the scaffold so the app builds, typechecks, and tests
442a43a Establish repository with ratified specs and build scaffold

$ git ls-remote origin
f7b5095886d22739801355b171b39c22836f88f9  HEAD   (matches local HEAD)
```

Branch `main` tracks `origin/main` on GitHub and is level with it as of v2.3; the governance commits `95a8b1e` through `884746d` are on the remote, pushed from this checkout. `.gitattributes` enforces `* text=auto eol=lf`, and `git ls-files --eol` reports LF for every tracked file, so the CRLF churn that v1 flagged is gone.

### 5.8 Dependency installation — HEALTHY

221 packages in the lockfile, no peer warnings. Installed and consistent with declared ranges: react 18.3.1, three 0.169.0, @react-three/fiber 8.18.0, @react-three/drei 9.122.0, @react-spring/web and /three 9.7.5, zustand 4.5.7, vite 5.4.21, vitest 2.1.9, typescript 5.6.3, @types/node 24.19.2.

### 5.9 Present versus missing

```
PRESENT  src/app        src/engine        src/content
PRESENT  content/topics content/review    scripts
PRESENT  AGENTS.md      ui-registry.md    memory.md
PRESENT  docs/scope     .gitattributes    .gitignore
PRESENT  .github/workflows/verify.yml     CI gate (runs green)
MISSING  src/world      src/state         docs/specs
MISSING  README.md
```

`AGENTS.md` is written, and `ui-registry.md`, `memory.md`, and `docs/scope/` were created later on 2026-10-16. All four are tracked: committed as `95a8b1e`. `.github/` followed the same day and is committed with them.

### 5.10 CI workflow — RUNS ON THE REMOTE, GREEN

`.github/workflows/verify.yml` runs on `ubuntu-latest` on every push and pull request: `actions/checkout@v7`, `actions/setup-node@v7` with Node `24.x` and the npm cache, then `npm ci` and `npm run verify`. The action versions are the current majors as of 2026-10-16, the file parses as valid YAML, and its two commands were executed against a pristine clone of `884746d`:

| Command | Result |
|---|---|
| `npm ci` | exit 0, 221 packages |
| `npm run verify` | exit 0 — 44 tests passed, 4 files, `dist/` produced |
| `npm run verify` with an injected `TS2322` in `src/app/App.tsx` | exit 2 — the gate fails a broken tree |

**Observed on the remote.** Run [38947782059](https://github.com/MikkoWuyin-dev/Anansi-s-Web/actions/runs/38947782059), on `ca1502d` — the push that added the workflow — reports `completed / success` after 16 seconds, with every step green: `actions/checkout@v7`, `actions/setup-node@v7`, `npm ci`, `npm run verify`. Read from the Actions API on 2026-10-16 rather than inferred.

**Still unproven: the failure path.** No deliberately broken commit has been pushed, because doing so would put a red commit on `main`. The remote half of roadmap 10.1's "done when" — a broken commit failing the check while `main` stays green — is therefore demonstrated locally only.

---

## 6. Documentation deep-dive

Four documents in `docs/`, in a clear authority order.

### 6.1 `docs/PRD.md` — Product Requirements Document v1.1

*"Product Definition / Pre-Implementation"*, amended to v1.1 on 2026-10-11 through an architect session. Its amendment history records the decisions that make V1 coherent: §9 the Daily Ruling, §16 fully static delivery, §17 local selection intelligence, §19 the local day, §22 local-first history, §24 accounts deferred, §25 zero-friction entry, §29 the web as a stage, §30 procedural only, §35 on-demand rendering, §38 no auth or backend. It routes all engineering questions to the MCD.

### 6.2 `docs/MCD.md` — Master Context Document v1.0

*"Ratified — implementation authorized"*, 2026-10-11. Its governance rule matters most: **"Every session that works on Anansi's Web — human or AI — reads this document first."** Where momentum and the MCD conflict, the MCD wins, and changing a decision requires the product owner's consent plus an update to both documents.

It was amended on 2026-10-16 so that its contracts match the code: §13 now records what is built and what is not, §5's schema mirrors `src/content/types.ts`, and §3 lists the documents added since ratification. An "Amendments" block records what changed and why. It remains the canonical document, and should be amended again before any further decision changes.

### 6.3 `docs/BUILD_ROADMAP.md` — Build Roadmap v1.0

Written to own the build order: 12 phases (0 Foundations through 11 the accounts era), roughly 85 numbered steps each with a **Deliverable** and a **done when** acceptance line, plus a dependency graph, a gate table, a V1 definition of done, and a standing-risk register. Phase 0 is marked complete; Phase 1 records the content layer. Phases 2 onward are unbuilt.

Its ordering argument is the useful part: *content feeds the engine, the engine feeds the loop, the loop feeds the world* — which is why the 3D stage is last and the DOM has to carry the product on its own first.

### 6.4 `docs/SYSTEM_TEARDOWN.md` — this document

The state assessment. v1 recorded a documentation-complete, code-empty project; v2 records a building, tested, version-controlled foundation with the content layer live.

---

## 7. Ratified technical contracts and their implementation status

The MCD's contracts, each with what the code actually does today.

### 7.1 Stack (MCD D2) — IMPLEMENTED

| Concern | Choice | Status |
|---|---|---|
| Framework | React 18, function components, hooks only, no SSR | In use |
| 3D | three.js via @react-three/fiber + @react-three/drei | Installed, **unused** |
| Motion | react-spring; spring physics, no linear tweens | Installed, **unused** |
| State | zustand with localStorage persistence | Installed, **unused** |
| Build | Vite, single-page, static output | In use |
| Language | TypeScript, strict | In use |

### 7.2 The engine — PARTIALLY IMPLEMENTED

The contract is unchanged: `src/engine/` must be a pure TypeScript module taking `SelectionInput` (`library`, `history`, `day`, `rng`) with no DOM, no React, no storage, dependencies injected.

**Built:** the two primitives that underpin it — `getDayKey()`, the user's local `YYYY-MM-DD`, and `createRng(seed)`, a deterministic mulberry32 seeded through an FNV-1a hash, tested for same-seed determinism and cross-seed difference.

**Not built:** exclusions, diversity weighting, rerolls, resurfacing, difficulty spread, and the `SelectionInput` entry point itself.

**Purity is a convention, not a constraint.** `src/engine/` currently imports nothing from `app/` or `state/`, but nothing enforces that. One careless import breaks the accounts-era migration story, and no lint rule or test would catch it.

### 7.3 The content schema — IMPLEMENTED, with two documented refinements

The MCD's §5 schema is marked *"initial shape — refine during build"*. Two refinements were made, both recorded in `src/content/types.ts`:

1. **`title` is stored in natural case** ("The Cobra Effect"), not display case. Casing becomes a CSS concern, so the design can change it without touching content, and screen readers are not handed an all-caps string. The validator rejects all-caps titles.
2. **`tags` is a closed union** of the twelve PRD §11 characteristics rather than `string[]`, so the validator catches typos and coverage can be measured.

`Domain` is a closed union of the 24 PRD §12 spheres. `Difficulty` is `1 | 2 | 3`.

**This divergence has been closed.** The MCD licenses refinement here, and it was amended on 2026-10-16 to carry the schema above, with the change recorded in its own amendments block, as its preamble requires.

Also note: the authoring scripts run under **Node's type stripping**, which erases types but cannot transform them. That rules out `enum` and `namespace` anywhere in code the scripts import. This constraint is documented at the top of `types.ts` and is why `engines.node` is now `>=22.6.0`.

### 7.4 The 3D world (MCD §4) — NOT STARTED

None of the ten rules is implemented: no canvas, no on-demand rendering, no camera rig, no web graph, no object families, no Anansi, no density mapping, no motion budget, and no reduced-motion path in the world (though the DOM shell does honour `prefers-reduced-motion`). `src/world/` does not exist.

### 7.5 Design system (MCD §7) — PARTIALLY IMPLEMENTED

| Token | Value | Status |
|---|---|---|
| `--anansi-jet` | `#19323C` | Defined |
| `--anansi-black` | `#08090A` | Defined |
| `--anansi-yellow` | `#FAFF00` | Defined, spent on exactly one element |
| `--anansi-strawberry` | `#FF3E41` | Defined |
| `--anansi-lavender` | `#885A89` | Defined |

All hex lives in one `:root` block, honouring the "tokens only" rule. Two derived text neutrals (`--anansi-ink`, `--anansi-dim`) were added, because the PRD palette carries no light neutral and text on near-black would otherwise fail contrast. **Light mode is not implemented** (PRD §33 requires both). `ui-registry.md` now exists, established on 2026-10-16 by an audit of these styles.

### 7.6 Performance budgets (MCD §8) — MEASURED WHERE POSSIBLE

| Budget | Target | Measured |
|---|---|---|
| App shell JS (gzip, pre-scene) | ≤ 250 kB | **47.55 kB** |
| Scene chunk (gzip, lazy) | ≤ 350 kB | n/a, no scene |
| Topic bundle (gzip, 300 topics) | ≤ 150 kB | **1.6 kB at 24**, ~19 kB projected |
| First usable interaction | ≤ 3.5 s | Not measured |
| Idle GPU | ≈ 0 | n/a, no canvas |
| Search animation frame time | ≤ 16 ms | n/a |
| Lighthouse | ≥ 85 desktop / ≥ 75 mobile | Not measured |

The content budget holds with wide margin. The projection to 300 topics is a linear extrapolation and rough, but there is roughly eight times the headroom.

### 7.7 The workflow skills system

`skills/` holds a self-contained, agent-agnostic development workflow toolkit — 75 files, ~6,400 lines, 13 skills — vendored into the product repository. It is a process layer, not application code.

| Skill | Purpose |
|---|---|
| `architect` | Structured discovery and build specs → `docs/specs/` |
| `audit` | Bootstraps the `AGENTS.md` context files |
| `check` | Pre-merge runtime verification and fresh-model review |
| `debug` | Root-cause investigation loop |
| `develop` | Builds a feature from an approved spec |
| `document` | PR body, changelog, release notes, postmortem |
| `imprint` | Extracts visual patterns → `ui-registry.md` |
| `recover` | Diagnoses the failure type before responding |
| `remember` | Session save and restore → `memory.md` |
| `review` | Post-feature three-layer report |
| `scope` | Living scope → `docs/scope/` |
| `sync` | Reconciles `AGENTS.md`, scope, and specs |
| `test` | Test suite authoring |

The MCD §10 commits the project to five rituals drawn from this toolkit. **The state files those rituals depend on now exist:** `AGENTS.md` is written, and `memory.md`, `ui-registry.md`, and `docs/scope/` were created on 2026-10-16. Only `docs/specs/` is still absent, which is expected until a feature passes through `/architect`. All four files are tracked as of `95a8b1e`, so continuity rests on the four documents in `docs/` plus four versioned state files rather than on an enforced workflow.

---

## 8. The content pipeline

Worth its own section because it is the one complete, self-guarding subsystem.

```
content/topics/<id>.json          human reviewed, one entry per topic
        │
        ├─ npm run content:validate   schema, dedupe, near duplicates, coverage
        │
        ├─ npm run content:build      → src/content/topics.generated.ts
        │                                (typed, id-sorted, committed)
        └─ npm run content:report     coverage table, difficulty spread,
                                      bundle size and projection
```

**Design decisions worth knowing:**

- The compiled bundle is **committed rather than built on demand**, so typecheck, test, and build all work without running the authoring scripts. Drift is caught by `content:check`, which is wired into `npm run verify`.
- The bundle is a **typed `.ts` array**, not JSON, so a bad entry fails the typecheck as well as the validator.
- `src/content/loader.ts` is a deliberate **seam**: `getLibrary()` performs no selection logic and can later become an async fetch without touching a caller.
- The library is **one file per topic**, so review diffs are per topic and `id` must equal the file name.

**Current library:** 24 topics, one per domain, balanced 8 / 8 / 8 across difficulty levels. That is the seed batch, not the target — MCD §6 sets a launch goal of 300 or more.

**Known weaknesses:** the near-duplicate threshold (Jaccard 0.7 on significant title words) is an untuned default. Near-duplicate detection is O(n²) and will need attention well before 300 topics. The review queue at `content/review/` is documented but has no automated candidate generation.

---

## 9. Gap analysis

### 9.1 Path-by-path

| Planned (MCD §3) | Status | Notes |
|---|---|---|
| `docs/PRD.md` | Present | v1.1, 950 lines |
| `docs/MCD.md` | Present | v1.0, 329 lines, amended 2026-10-16 to match the code |
| `src/app/` | Present | Shell only: hero, action, tokens, styles |
| `src/world/` | **Missing** | The entire 3D stage |
| `src/engine/` | Partial | Day key and PRNG only |
| `src/state/` | **Missing** | No zustand stores, no persistence |
| `src/content/` | Present | Types, generated bundle, loader |
| `content/topics/` | Present | 24 of 300+ |
| `content/review/` | Present | Documented queue |
| `scripts/` | Present | Validate, compile, report |
| `ui-registry.md` | Present | Established 2026-10-16 by `/imprint audit`; tracked |
| `memory.md` | Present | Written 2026-10-16 by `/remember save`; tracked |
| `AGENTS.md` | Present | Written by the project owner; tracked |
| `docs/specs/` | **Missing** | `/architect` never run |
| `docs/scope/` | Present | 6 enrolled and 17 planned features, 2026-10-16; tracked |
| `README.md` | **Missing** | Repo has a one-line description and no entry point |
| `.github/workflows/verify.yml` | Present | Runs the gate on push and PR, satisfying MCD §6's "in CI" expectation; first run green 2026-10-16 |

### 9.2 Capability delta

| Intended capability | State |
|---|---|
| Build, typecheck, test | **Working** |
| Content validation gate | **Working, and proven to fail correctly** |
| Serve the shell | **Working** |
| Choose a topic for today | Not built |
| Accept or reroll | Not built |
| Persist a journey across reloads | Not built |
| Show 30-day history | Not built |
| Show 37 / 90 | Not built |
| Render the web and Anansi | Not built |
| Light mode | Not built |
| Ship to a host | Not built |

### 9.3 Documentation consistency

- **The MCD and this teardown agree as of 2026-10-16.** The MCD's §13 status and its §5 schema were reconciled with the code in the same pass that produced this document, so no document now contradicts another.
- **Roadmap Phase 1 is now complete** and could be ticked, and its `done when` for the 300-topic target is deliberately unmet.
- **The teardown v1 is superseded** by this document but remains in the git history.
- **`skills/` has no license or attribution** and is published publicly, a decision made knowingly.
- **The display font is fetched from Google Fonts**, an external request mildly against PRD §35. Recorded in the roadmap as a decision still to make.

---

## 10. Risk register

Re-statused from v1. Three of the original critical risks are closed, and both risks added in v2 have closed since: R4 by committing the state files, R5 by the first green CI run.

### Resolved

| ID | v1 risk | Resolution |
|---|---|---|
| **R1** | No version control; a disk failure loses everything | Git repository on `main`, pushed to GitHub, LF normalised via `.gitattributes` |
| **R2** | The project cannot build | All four gates exit 0; `dist/` produced and confirmed to render |
| **R3** | Missing Node types break typecheck | `@types/node@24.19.2`, pinned to the runtime major |
| **R4** | Process state files untracked; loseable with the working tree | All four committed as `95a8b1e`; upkeep is now an explicit obligation in `AGENTS.md` §11 |
| **R5** | No CI; the gate ran only when someone remembered | `.github/workflows/verify.yml` (committed `ca1502d`) runs it on every push and pull request; run `38947782059` green, 16 s, all steps passing. The failure path is proven locally, not yet on the remote |

### Open

**R6 — Engine purity is unenforced (MEDIUM).** The `engine/` boundary is the load-bearing rule for the accounts-era migration, and nothing detects a violating import.
*Action:* a lint rule or a test asserting `src/engine/**` imports nothing from `app/`, `state/`, or `world/`.

**R7 — Content quality per topic is unguarded (MEDIUM).** The validator checks shape, not substance. Nothing stops 300 thin topics from clearing the gate and shipping. MCD §6 calls quality more important than quantity, but only human review enforces it.
*Action:* accept this as a human gate, and keep the review checklist beside the authoring scripts as MCD §6 intends.

**R8 — The 3D stage is the whole remaining risk (MEDIUM).** Ten MCD §4 rules, a procedural object generator per family, a choreographed camera, and a ≤ 350 kB scene budget are all unbuilt and unmeasured. This is the largest and least certain body of work in the project.
*Action:* build it in the roadmap's order (graph, camera, families, Anansi, choreography) and measure the budget as it grows.

**R9 — Scope versus delivery (MEDIUM).** The product's core value — choosing a topic — does not exist yet. Valuable groundwork is done, but the ritual is not.
*Action:* Phase 2, the selection engine, is the shortest path to a product that does its job.

**R10 — No linting or formatting (LOW).** No ESLint, Prettier, or EditorConfig. TypeScript strict mode covers some ground, but the MCD §4 rule 7 "no hardcoded hex" and React hooks rules are unenforced.

**R11 — Dev-only advisory debt (LOW).** `npm audit` reports 6 advisories (3 moderate, 1 high, 2 critical) in `esbuild` via Vite 5 and `tinypool` via Vitest 2. All are dev dependencies, none ship to production, and the fixes require breaking major upgrades (Vite 8, Vitest 5).

**R12 — Peer-version fragility (LOW).** React 18 with R3F 8, drei 9, and three 0.169 is consistent today, but R3F 9 targets React 19. Upgrading React without R3F would break the scene layer before it is even written.

---

## 11. Where we are and what is next

The plan lives in `docs/BUILD_ROADMAP.md`. This is the position on it.

| Phase | State |
|---|---|
| 0 — Foundations | **Complete** |
| 1 — Content layer | **Complete**, except growing the library to 300 |
| 2 — Selection engine | Next |
| 3 — State and persistence | Not started |
| 4 — The ritual loop | Not started |
| 5 — History and progress | Not started |
| 6 — The 3D world | Not started |
| 7 — Modes and design system | Not started |
| 8 — Evolution and surprises | Not started |
| 9 — Quality gates | Not started |
| 10 — Hardening and deployment | Not started |
| 11 — The accounts era | Deferred |

**Recommended order of the next moves:**

1. **Phase 2, the selection engine.** It is the product's core value, it is pure and therefore cheap to test, and everything downstream depends on it. Determinism per day and the 30-day exclusion window are the two rules to get right first.
2. **Prove the CI failure path on the remote.** The gate is green there, but no broken commit has been seen to fail it remotely; a throwaway branch carrying a deliberate type error would settle roadmap 10.1's done-when without putting a red commit on `main`.
3. **Keep the governance files current.** `AGENTS.md`, `ui-registry.md`, `memory.md`, and `docs/scope/` were committed as `95a8b1e`, which closed R4; the standing duty is the maintenance protocol in `AGENTS.md` §11.

**Definition of done for V1** — the deployed static site renders the hero and the search ritual; a day offers at most three deterministic, reload-stable topics; accepting logs history and advances the 90-day count; the 30-day history is viewable and filterable; the web visibly evolves; both light and dark modes work; reduced motion is fully functional; keyboard and screen-reader paths work; and every performance budget in MCD §8 is met.

---

## 12. Quick reference

**Start here when picking up this project:**

1. `docs/MCD.md` — canonical technical truth (decisions §2, engine contract §5, tokens §7).
2. `docs/PRD.md` — product truth (loop §5, Daily Ruling §9, serendipity §17, non-goals §38).
3. `docs/BUILD_ROADMAP.md` — the build sequence and what to do next.
4. `docs/SYSTEM_TEARDOWN.md` — this document; the state.

**Commands**

```bash
npm install            # 221 packages
npm run dev            # serves http://127.0.0.1:5173/
npm run verify         # THE gate: typecheck + content:check + test + build
npm run typecheck      # tsc --noEmit, covers src/, scripts/, vite.config.ts
npm run test           # vitest run — 44 tests
npm run build          # vite build → dist/
npm run content:validate   # validate the library; exits non-zero on error
npm run content:build      # compile the bundle
npm run content:check      # fail if the committed bundle has drifted
npm run content:report     # coverage, difficulty spread, bundle size
```

**Key facts to carry forward**

- The project builds, typechecks, tests, and serves cleanly. The content gate is real and proven to fail correctly.
- The engine is pure by contract and must stay that way; nothing enforces it yet.
- The DOM carries the product; the canvas enhances it. No 3D exists yet, and the shell works without it.
- Time-on-site is a failure signal. Features that increase session length oppose the product's purpose.
- AI is used at authoring time only. Nothing AI-generated ships without human review.
- Node ≥ 22.6 is required: the authoring scripts rely on native type stripping, which forbids `enum` and `namespace` in shared code.
- CI runs the gate on every push and pull request and the first run was green on 2026-10-16. The one gap left is that no broken commit has yet been seen to fail it on the remote. The §10 governance files are tracked as of `95a8b1e`.

---

*End of System Teardown v2.2. All state claims verified against the repository on 2026-10-16.*
