# Anansi's Web — System Teardown

- **Document type:** Whole-repository audit and state assessment
- **Subject:** `C:\dev\Anansi's Web` — https://github.com/MikkoWuyin-dev/Anansi-s-Web
- **Original audit:** 2026-10-16 (v1.0)
- **Last updated:** 2026-10-17 (v2.8)
- **Auditor:** Buffy (automated code agent)
- **Status:** Complete — every current-state claim is compared against the repository by `npm run docs:check`

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

**v2.5 — 2026-10-16.** The document's own factual claims were made self-checking. `npm run docs:check`, a new step in the gate ahead of the build, measures the repository and compares the result against the claims below — counts, file lists, tracked-state statements, the gate's composition, and the toolchain — failing `npm run verify` when they disagree. The first run found nineteen stale claims, three of them older than this change: the header version disagreed with the closing line, the map's file count had drifted, and the documentation weight in §3 was two lines out. §5.11 records the gate and its limits; §10 carries it as R13 with R14 for what it cannot reach; §5.1 and §5.3 carry the current gate and suite numbers.

**v2.6 — 2026-10-16.** The selection engine's decision record was captured. `docs/specs/0001-selection-engine.md` (241 lines) is the repository's first spec, produced by `/architect` from the product owner's answers across three rounds of questions. Two authoritative documents were reconciled with it in the same task, because the owner's decision to trade the guaranteed weekly cap on returns for a tuned chance made both stale: MCD §5's resurfacing bullet and roadmap 2.6's done-when line. Also reconciled: MCD §5's `HistoryEvent` input, now `TopicRecord`, and MCD §5 and roadmap 2.2's excluded-domain rule, which lives at authoring rather than inside the engine. The map, the present-versus-missing block, the path table, §7.2, and the next moves follow; R6's action now names the spec task that closes it.

**v2.7 — 2026-10-16.** Phase 2 was built against spec 0001. `src/engine/` gained the contract (`types.ts`), the frozen tuning object (`tuning.ts`) and the entry point (`offer.ts`), with 30 new tests: 20 rule tests, 6 statistical simulations over 100 and 365 days, and the purity test that reads the module's own source and fails when an import crosses into `app/`, `state/` or `world/`. R6 therefore closes, the suite stands at 8 files and 109 tests, and §7.2 describes the rules rather than the plan. Three deliberate breakages — a widened exclusion window, a shortened return absence, a neutered difficulty spread — each failed the suite, which is the mutation check roadmap 2.7 asks for. The documents that described the engine as unbuilt are corrected: roadmap 2.1 drops `Progress` from the engine's schema, which spec 0001 puts in the state layer; the scope's four engine milestones are ticked and the engine primitives row is `existing`; and the spec moves to *In Progress* with a note recording the three rules the build had to choose (a repeated-domain guard, a dominance ratio, and the rarity roll read from a per-day stream).

**v2.8 — 2026-10-17.** The documentation architecture was walked end to end on the project owner's instruction, and the discrepancies it exposed were reconciled. `KNOWLEDGE INDEX.md` (483 lines, at the root) is the new navigation map; the map below, the path table, the documentation deep-dive and the quick reference now name it, while the present block cannot, because its paths are split on whitespace and the name contains a space. Its own draft hedges were resolved: it declared an intended location in `docs/` while sitting at the root, omitted `npm run docs:check` from its verification entry points, called the skill count unverified, and listed six artifacts as missing that have all since landed. Stale status claims elsewhere were corrected: MCD §13 still said the engine was unbuilt, 79 tests, and purity unenforced; this document's deep-dive still said Phases 2 onward were unbuilt and `docs/specs/` absent; and its repository map claimed to list every tracked file while omitting `AGENTS.md`, `memory.md`, `ui-registry.md` and `docs/scope/`. `AGENTS.md` was reconciled with the five-step gate, the current counts, the enforced engine boundary, and the owner's standing instruction to commit at the end of each implementation task.

---

## 0. How to read this document

A whole-repo teardown written for a human engineer or a coding agent arriving cold. It answers three questions, in order:

1. **What is this project?** (intent, product, philosophy) — §2, §4
2. **What actually exists on disk right now?** (verified state, not aspiration) — §3, §5, §6, §7
3. **What is the gap, and what should happen next?** (delta, risks, plan) — §9, §10, §11

Every claim about the current state was produced by running commands in the repository, not by trusting the documentation. The commands and their raw results are in §5 so they can be re-run and reproduced.

**The one-line state:** the project builds, typechecks, and tests cleanly; the content pipeline and its gate are proven end to end; the selection engine now exists as a pure, tested module; the ritual loop, the history surface, and the entire 3D stage are not yet written. The plan that sequences them lives in `docs/BUILD_ROADMAP.md`.

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
| Documentation gate | `npm run docs:check` compares this document's counts, file lists, and tracked-state claims against the repository |
| Selection engine, state, the loop, history | **Not started** |
| The 3D world (`src/world/`) | **Not started** |
| Light mode | **Not started** |
| `ui-registry.md`, `memory.md`, `docs/scope/` | Present and tracked (2026-10-16) |

**Headline state:** the foundation is real and honest. All five gates (`typecheck`, `content:check`, `test`, `docs:check`, `build`) exit 0; the content gate has been *proven to fail* on malformed and drifted input, and the documentation gate on a state claim that no longer holds, rather than assumed to. The product, however, does not yet do the one thing it exists to do: choose a topic.

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
C:\dev\Anansi's Web\                        146 tracked files
├── .gitattributes              LF enforced; binaries marked
├── .gitignore                  node_modules, dist, .freebuff, generated report html
├── .github/
│   └── workflows/verify.yml    npm ci + npm run verify on push and PR (green 2026-10-16)
├── AGENTS.md                   operating rules, onboarding, approval gates, verification
├── index.html                  Vite entry; Space Grotesk; favicon
├── KNOWLEDGE INDEX.md          navigation map: what to read, where knowledge lives
├── memory.md                   session handoff
├── ui-registry.md              captured visual patterns
├── package.json                scripts (dev/build/typecheck/test/verify/content:/docs:check)
├── package-lock.json           lockfile v3
├── tsconfig.json               strict TS 5.6; includes src, scripts, vite.config
├── vite.config.ts              React plugin; @/* alias; vitest node env
│
├── docs/
│   ├── PRD.md                  950 lines   Product Requirements Document v1.1
│   ├── MCD.md                  331 lines   Master Context Document v1.0 (amended)
│   ├── BUILD_ROADMAP.md        498 lines   Phases 0 to 11, the build sequence
│   ├── SYSTEM_TEARDOWN.md      this file    Whole-repo state assessment
│   ├── specs/
│   │   └── 0001-selection-engine.md   252 lines   The engine decision, 2026-10-16
│   ├── scope/
│   │   └── scope.md            212 lines   living scope record
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
│   ├── check-docs.ts           measures the repository; fails on documented drift
│   └── lib/
│       ├── validate.ts         pure rules
│       ├── compile.ts          pure bundle renderer
│       ├── load.ts             file IO, workspace root resolution
│       ├── claims.ts           pure rules for the claims in this document
│       └── *.test.ts           65 tests
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
│   └── engine/                 PURE. Imports nothing from app/, state/ or world/
│       ├── types.ts            the contract: TopicRecord, DayState, Offer, SelectionInput
│       ├── tuning.ts           the frozen numbers, each with the reasoning behind it
│       ├── offer.ts            offerNextStory: eligibility, ranking, the return rule
│       ├── dayKey.ts           local YYYY-MM-DD day key
│       ├── rng.ts              FNV-1a seed hash + mulberry32 PRNG
│       └── *.test.ts           44 tests, including the purity boundary
│
└── skills/                     75 files, ~6,400 lines — the workflow toolkit
```

**Weight distribution.** The repository's mass is still mostly prose and process, but the balance is shifting toward code.

| Category | Files | Lines |
|---|---|---|
| Workflow skills | 75 | 6,403 |
| Project documentation | 4 | 2,468 |
| Authoring scripts | 11 | 2,603 |
| Application source | 17 | 2,243 |
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
$ npm run verify      # typecheck && content:check && test && docs:check && build
exit 0
```

### 5.2 Typecheck — PASSES

```
$ npm run typecheck   # tsc --noEmit
exit 0
```

Covers `src/`, `scripts/`, and `vite.config.ts`. `@types/node@24.19.2` is installed, pinned to the runtime major (Node 24.13), which fixed the v1 failure on `node:url`.

### 5.3 Tests — PASS, 109 of them

```
$ npm run test        # vitest run
 ✓ src/engine/purity.test.ts             ( 4 tests)
 ✓ scripts/lib/compile.test.ts           ( 9 tests)
 ✓ src/engine/rng.test.ts                ( 9 tests)
 ✓ scripts/lib/validate.test.ts          (21 tests)
 ✓ src/engine/offer.test.ts              (20 tests)
 ✓ scripts/lib/claims.test.ts            (35 tests)
 ✓ src/engine/dayKey.test.ts             ( 5 tests)
 ✓ src/engine/offer.statistical.test.ts  ( 6 tests)
 Test Files  8 passed (8)
      Tests  109 passed (109)
exit 0
```

The engine's 44 tests are the 30 added in v2.7 plus the 14 primitives. Three mutations were run against the tuning object to show the rules are load-bearing: `exclusionWindowDays` 30 to 60 failed the 29/30 boundary test, `resurfaceAbsenceDays` 60 to 30 failed the one-day-early test, and clamping the spread factor to 1 failed the over-represented-level test. Each was reverted; `src/engine/tuning.ts` is byte-identical to the committed intent.

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

Branch `main` tracks `origin/main` on GitHub and is level with it as of v2.5; the governance and CI commits `95a8b1e` through `3a00c9a` are on the remote, pushed from this checkout. The documentation gate added in v2.5 is in the working tree and not committed yet. `.gitattributes` enforces `* text=auto eol=lf`, and `git ls-files --eol` reports LF for every tracked file, so the CRLF churn that v1 flagged is gone.

### 5.8 Dependency installation — HEALTHY

221 packages in the lockfile, no peer warnings. Installed and consistent with declared ranges: react 18.3.1, three 0.169.0, @react-three/fiber 8.18.0, @react-three/drei 9.122.0, @react-spring/web and /three 9.7.5, zustand 4.5.7, vite 5.4.21, vitest 2.1.9, typescript 5.6.3, @types/node 24.19.2.

### 5.9 Present versus missing

```
PRESENT  src/app        src/engine        src/content
PRESENT  content/topics content/review    scripts
PRESENT  AGENTS.md      ui-registry.md    memory.md
PRESENT  docs/scope     docs/specs        .gitattributes
PRESENT  .gitignore     .github/workflows/verify.yml   CI gate (runs green)
MISSING  src/world      src/state
MISSING  README.md
```

`AGENTS.md` is written, and `ui-registry.md`, `memory.md`, and `docs/scope/` were created later on 2026-10-16. All four are tracked: committed as `95a8b1e`. `.github/` followed the same day and is committed with them. `docs/specs/` followed on 2026-10-16, when `/architect` captured the selection engine's spec there.

### 5.10 CI workflow — RUNS ON THE REMOTE, GREEN

`.github/workflows/verify.yml` runs on `ubuntu-latest` on every push and pull request: `actions/checkout@v7`, `actions/setup-node@v7` with Node `24.x` and the npm cache, then `npm ci` and `npm run verify`. The action versions are the current majors as of 2026-10-16, the file parses as valid YAML, and its two commands were run against a pristine clone of `884746d` when the workflow was introduced, then again against the working tree on 2026-10-16 for the figures below:

| Command | Result |
|---|---|
| `npm ci` | exit 0, 221 packages |
| `npm run verify` | exit 0 — 109 tests passed, 8 files, `dist/` produced |
| `npm run verify` with an injected `TS2322` in `src/app/App.tsx` | exit 2 — the gate fails a broken tree |
| `npm run docs:check` with a claim edited to be false | exit 1 — the gate fails a drifted document |

**Observed on the remote.** Run [38947782059](https://github.com/MikkoWuyin-dev/Anansi-s-Web/actions/runs/38947782059), on `ca1502d` — the push that added the workflow — reports `completed / success` after 16 seconds, with every step green: `actions/checkout@v7`, `actions/setup-node@v7`, `npm ci`, `npm run verify`. Read from the Actions API on 2026-10-16 rather than inferred.

**Still unproven: the failure path.** No deliberately broken commit has been pushed, because doing so would put a red commit on `main`. The remote half of roadmap 10.1's "done when" — a broken commit failing the check while `main` stays green — is therefore demonstrated locally only.

### 5.11 Documentation gate — CHECKS THIS DOCUMENT

```
$ npm run docs:check
docs/SYSTEM_TEARDOWN.md: 157 claims compared against the repository, no drift
exit 0
```

`scripts/check-docs.ts` measures the repository — the tracked files and the working set, line counts, the topics, the suite as `vitest list --json` collects it, `package.json`, the lockfile, the workflow file, and the scope — and hands those numbers to the pure rules in `scripts/lib/claims.ts`. Those rules compare them against the claims this document makes, and the gate fails when the document and the repository disagree. Counts and sizes are measured over the working set — the tracked files plus anything untracked that is not ignored — so a number holds both before and after the commit that adds a file; a local scratch file that is neither committed nor ignored will change a count and fail the gate until it is dealt with.

Some claims are deliberately left alone, and `claims.ts` records why. The amendment history above records the past, so it is skipped. Claims that need the network or a live install — the CI run id, `npm ci`'s package count, `npm audit`'s advisories — cannot be reproduced inside the gate. One weight-table cell, `Build config`, names a set of files the document never defines and gives an approximate line count, so it is left alone rather than guessed at. And every rule also reports a claim that has *disappeared*, so a check cannot be dropped by deleting the sentence it guarded.

Four probes were run to show the gate fails rather than merely passes:

| Probe | Result |
|---|---|
| The map's file count set to `137` | **exit 1** — line 113, "documented: 137 / repository: 138" |
| The closing line's version set back to `v2.4` | **exit 1** — the header version disagrees with the closing version |
| `AGENTS.md` taken off the disk while both lists still call it present | **exit 1** — the present list and the path table both report "not on disk" |
| The document restored | **exit 0**, 157 claims compared |

**What it does not cover.** The network and live-install figures listed above. The repository map's tree is read for its per-area test totals only; whether a specific tracked file still appears in the tree is left to the file count on its first line. And a fact this document states in a shape the rules do not recognise is simply not compared — which is why each shape carries a minimum and a vanished claim is itself a failure.

---

## 6. Documentation deep-dive

Four documents in `docs/`, in a clear authority order, plus the selection-engine spec under `docs/specs/`, the scope record under `docs/scope/`, and the root `KNOWLEDGE INDEX.md` that navigates all of them.

### 6.1 `docs/PRD.md` — Product Requirements Document v1.1

*"Product Definition / Pre-Implementation"*, amended to v1.1 on 2026-10-11 through an architect session. Its amendment history records the decisions that make V1 coherent: §9 the Daily Ruling, §16 fully static delivery, §17 local selection intelligence, §19 the local day, §22 local-first history, §24 accounts deferred, §25 zero-friction entry, §29 the web as a stage, §30 procedural only, §35 on-demand rendering, §38 no auth or backend. It routes all engineering questions to the MCD.

### 6.2 `docs/MCD.md` — Master Context Document v1.0

*"Ratified — implementation authorized"*, 2026-10-11. Its governance rule matters most: **"Every session that works on Anansi's Web — human or AI — reads this document first."** Where momentum and the MCD conflict, the MCD wins, and changing a decision requires the product owner's consent plus an update to both documents.

It was amended on 2026-10-16 so that its contracts match the code: §13 now records what is built and what is not, §5's schema mirrors `src/content/types.ts`, and §3 lists the documents added since ratification. It was amended again on 2026-10-17, when §13 moved the selection engine from unbuilt to built and named state and persistence as the next step. An "Amendments" block records what changed and why. It remains the canonical document, and should be amended again before any further decision changes.

### 6.3 `docs/BUILD_ROADMAP.md` — Build Roadmap v1.0

Written to own the build order: 12 phases (0 Foundations through 11 the accounts era), roughly 85 numbered steps each with a **Deliverable** and a **done when** acceptance line, plus a dependency graph, a gate table, a V1 definition of done, and a standing-risk register. Phase 0 is marked complete, Phase 1 records the content layer (24 of 300 topics), and Phase 2 is marked complete as of 2026-10-16. Phases 3 onward are unbuilt.

Its ordering argument is the useful part: *content feeds the engine, the engine feeds the loop, the loop feeds the world* — which is why the 3D stage is last and the DOM has to carry the product on its own first.

### 6.4 `docs/SYSTEM_TEARDOWN.md` — this document

The state assessment. v1 recorded a documentation-complete, code-empty project; v2 records a building, tested, version-controlled foundation with the content layer and the selection engine live. Since v2.5 its current-state claims are checked mechanically by `npm run docs:check` (§5.11), so the numbers here are compared against the repository on every run of the gate rather than trusted.

### 6.5 `KNOWLEDGE INDEX.md` — the navigation map

Added at the repository root on 2026-10-17, in answer to `AGENTS.md` §3.2: it names the onboarding route, every authoritative artifact and what question each answers, the technical locations, the bundled skills, the session-handoff rules, and the gaps that were once listed as missing. It is a navigation layer, not an authority: where it and an authoritative document disagree, the document wins, and its own path and script claims were corrected against this repository on 2026-10-17.

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

### 7.2 The engine — IMPLEMENTED (spec 0001, 2026-10-16)

The contract: `src/engine/` is a pure TypeScript module taking `SelectionInput` (`library`, `history`, `day`, `rng`) with no DOM, no React, no storage, no clock read, dependencies injected.

**Built:**

- `types.ts` — `TopicRecord`, `DayState`, `SelectionInput`, and the `Offer` union (a story with `because: 'new' | 'resurfaced' | 'thin-pool'`, or `none` with `day-complete`, `empty-library`, `no-candidate`). `HistoryEvent` is retired.
- `tuning.ts` — one frozen `ENGINE_TUNING` object carrying every number, each with the reasoning behind it, so tuning is a one line change with a test behind it. The three scoring weights are 0.6 domain recency, 0.25 tag overlap, 0.15 time since exposure.
- `offer.ts` — `offerNextStory()`, the single entry point. Rules in fixed order: the day's three-story cap, the empty library, the day's own exclusions, the rarity roll, the 60 day absence for a return, the 30 day exclusion window, and the thin pool.
- `dayKey.ts` and `rng.ts`, the primitives it is built on, unchanged.

**Three rules the build had to choose**, because the spec fixed the behaviour rather than the mechanism, and each is documented in the source:

1. **A repeated-domain guard.** Domain recency alone could not deliver "no three consecutive offers from one domain" at 0.6 weight, so a third story in a row from the same domain is ruled out whenever anything else is available. A pool with only one domain still offers a story, so the guard can never strand the day.
2. **A dominance ratio.** When the best candidate scores at least 1.5 times the second, it wins outright and the draw is not consulted; only a close call is left to the seeded draw. This is what makes AC-11's domain-recency test deterministic rather than probabilistic.
3. **The rarity roll read from a per-day stream.** The contract builds a fresh stream from `(clientId, dayKey)` for every call, so all three offers of a day read the same first value. The chance is therefore 1 in 7 *per day*, which is what keeps the measured share of days carrying a return inside AC-15's 8 to 20 percent band. AC-15's "first 61 days" was read against AC-14's "at least 60 days": the first legal return is day 61, and the test asserts none in days 1 to 60.

**Measured, not asserted.** The statistical suite runs the real engine over 100 and 365 simulated days, three seeds each: no three consecutive same-domain offers, no period 3 or 4 rotation inside a 40 offer window, each difficulty level between 25 and 42 percent of 300 offers, returns on 8 to 20 percent of days, and no return before a 60 day absence. The numbers are the engine's actual output, and the tuning values were left as designed once the bands held.

**Purity is now a constraint.** `src/engine/purity.test.ts` reads the module's own source: every import must resolve to `@/engine/*` or `@/content/*`, no source may read a clock, storage, the DOM or the network (`dayKey.ts`'s default argument is the one documented exception), and `offer.ts` may not import or call `getDayKey`. This closes R6.

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

The MCD §10 commits the project to five rituals drawn from this toolkit. **The state files those rituals depend on all exist:** `AGENTS.md`, `memory.md`, `ui-registry.md`, and `docs/scope/` were created on 2026-10-16 and committed as `95a8b1e`, `docs/specs/` followed with the selection engine's spec, and `KNOWLEDGE INDEX.md` was added on 2026-10-17. Continuity therefore rests on the four documents in `docs/`, the spec and scope records, and five versioned state files, with `npm run docs:check` policing the mechanical half of their upkeep.

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
| `docs/MCD.md` | Present | v1.0, 331 lines, amended 2026-10-16 to match the code and 2026-10-17 to record the engine as built |
| `KNOWLEDGE INDEX.md` | Present | Added at the root 2026-10-17; the navigation map, verified against the repository |
| `src/app/` | Present | Shell only: hero, action, tokens, styles |
| `src/world/` | **Missing** | The entire 3D stage |
| `src/engine/` | Present | Contract, frozen tuning, `offerNextStory`, day key, PRNG; 44 tests including the purity boundary |
| `src/state/` | **Missing** | No zustand stores, no persistence |
| `src/content/` | Present | Types, generated bundle, loader |
| `content/topics/` | Present | 24 of 300+ |
| `content/review/` | Present | Documented queue |
| `scripts/` | Present | Validate, compile, report, and check this document against the repository |
| `ui-registry.md` | Present | Established 2026-10-16 by `/imprint audit`; tracked |
| `memory.md` | Present | Written 2026-10-16 by `/remember save`; tracked |
| `AGENTS.md` | Present | Written by the project owner; tracked |
| `docs/specs/` | Present | `0001-selection-engine.md`, the engine decision, captured 2026-10-16 |
| `docs/scope/` | Present | 6 enrolled and 16 planned features, 1 in progress, 2026-10-16; tracked |
| `README.md` | **Missing** | Repo has a one-line description and no entry point |
| `.github/workflows/verify.yml` | Present | Runs the gate on push and PR, satisfying MCD §6's "in CI" expectation; first run green 2026-10-16 |

### 9.2 Capability delta

| Intended capability | State |
|---|---|
| Build, typecheck, test | **Working** |
| Content validation gate | **Working, and proven to fail correctly** |
| Serve the shell | **Working** |
| Choose a topic for today | Engine built and tested; not yet called by the app |
| Accept or reroll | Not built |
| Persist a journey across reloads | Not built |
| Show 30-day history | Not built |
| Show 37 / 90 | Not built |
| Render the web and Anansi | Not built |
| Light mode | Not built |
| Ship to a host | Not built |

### 9.3 Documentation consistency

- **The MCD and this teardown agree as of 2026-10-17.** The MCD's §13 status and its §5 schema were reconciled with the code on 2026-10-16, and §13 was updated again on 2026-10-17 to record the engine as built, so no document now contradicts another.
- **This document's current-state claims are now enforced.** `npm run docs:check` fails the gate when a count, a file list, a tracked-state statement, a version, or the gate's own composition no longer matches the repository. What remains on trust is what the gate cannot reach: the network and live-install figures, the amendment history, and any fact phrased in a shape the rules do not know.
- **Roadmap Phases 0 to 2 are now marked complete**, and Phase 1's `done when` for the 300-topic target is deliberately unmet at 24 topics.
- **The teardown v1 is superseded** by this document but remains in the git history.
- **`skills/` has no license or attribution** and is published publicly, a decision made knowingly.
- **The display font is fetched from Google Fonts**, an external request mildly against PRD §35. Recorded in the roadmap as a decision still to make.

---

## 10. Risk register

Re-statused from v1. Three of the original critical risks are closed, and the risks added since have closed as they were addressed: R4 by committing the state files, R5 by the first green CI run, R6 by the engine's purity test, R13 by the documentation gate.

### Resolved

| ID | v1 risk | Resolution |
|---|---|---|
| **R1** | No version control; a disk failure loses everything | Git repository on `main`, pushed to GitHub, LF normalised via `.gitattributes` |
| **R2** | The project cannot build | All four gates exit 0; `dist/` produced and confirmed to render |
| **R3** | Missing Node types break typecheck | `@types/node@24.19.2`, pinned to the runtime major |
| **R4** | Process state files untracked; loseable with the working tree | All four committed as `95a8b1e`; upkeep is now an explicit obligation in `AGENTS.md` §11 |
| **R5** | No CI; the gate ran only when someone remembered | `.github/workflows/verify.yml` (committed `ca1502d`) runs it on every push and pull request; run `38947782059` green, 16 s, all steps passing. The failure path is proven locally, not yet on the remote |
| **R6** | Engine purity was unenforced; one violating import breaks the accounts-era migration story | `src/engine/purity.test.ts` (2026-10-16) reads the module's own imports and fails on any crossing into `app/`, `state/` or `world/`, on a clock, DOM, storage or network reference, and on a call to `getDayKey` |
| **R13** | The state assessment's numbers aged silently; nothing re-read them | `npm run docs:check`, a gate step since 2026-10-16, compares its counts, file lists, tracked-state statements, and toolchain claims against the repository and fails on drift (§5.11) |

### Open

**R7 — Content quality per topic is unguarded (MEDIUM).** The validator checks shape, not substance. Nothing stops 300 thin topics from clearing the gate and shipping. MCD §6 calls quality more important than quantity, but only human review enforces it.
*Action:* accept this as a human gate, and keep the review checklist beside the authoring scripts as MCD §6 intends.

**R8 — The 3D stage is the whole remaining risk (MEDIUM).** Ten MCD §4 rules, a procedural object generator per family, a choreographed camera, and a ≤ 350 kB scene budget are all unbuilt and unmeasured. This is the largest and least certain body of work in the project.
*Action:* build it in the roadmap's order (graph, camera, families, Anansi, choreography) and measure the budget as it grows.

**R9 — Scope versus delivery (MEDIUM).** The engine now decides the day's story, but nothing in the app calls it: there is no state layer, no ritual loop and no reveal, so the product still cannot be used.
*Action:* Phase 3 (persistence) and Phase 4 (the loop that consumes `offerNextStory`) are the shortest path now.

**R10 — No linting or formatting (LOW).** No ESLint, Prettier, or EditorConfig. TypeScript strict mode covers some ground, but the MCD §4 rule 7 "no hardcoded hex" and React hooks rules are unenforced.

**R11 — Dev-only advisory debt (LOW).** `npm audit` reports 6 advisories (3 moderate, 1 high, 2 critical) in `esbuild` via Vite 5 and `tinypool` via Vitest 2. All are dev dependencies, none ship to production, and the fixes require breaking major upgrades (Vite 8, Vitest 5).

**R12 — Peer-version fragility (LOW).** React 18 with R3F 8, drei 9, and three 0.169 is consistent today, but R3F 9 targets React 19. Upgrading React without R3F would break the scene layer before it is even written.

**R14 — Claims the documentation gate cannot reach (LOW).** The gate covers the mechanical claims in this document only. The CI run id, `npm ci`'s package count, and `npm audit`'s advisories need the network or a live install, and any fact phrased in a shape `claims.ts` does not recognise is not compared.
*Action:* extend the rules when a claim shape recurs, and keep the unreachable figures stamped with the date, commit, and source that produced them.

---

## 11. Where we are and what is next

The plan lives in `docs/BUILD_ROADMAP.md`. This is the position on it.

| Phase | State |
|---|---|
| 0 — Foundations | **Complete** |
| 1 — Content layer | **Complete**, except growing the library to 300 |
| 2 — Selection engine | **Complete** (2.1 to 2.7), 44 tests |
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

1. **Phase 3, local state and persistence.** The engine exists but nothing stores a day, so `/architect local state and persistence` is the next decision: one `anansi:v1:*` store, a corrupt store that fails safe, a day key that rolls over, and history that prunes at 30 days. It must also build the random source as a fresh stream per call from the client identifier and the day key, and test that a rebuilt stream yields the same day, which is the one determinism guarantee no engine test can reach.
2. **Phase 4, the ritual loop.** Once a day can be stored, the shell can ask the engine for a story, offer a reroll, and record what was shown. That is the first build where a person can use the product.
3. **Prove the CI failure path on the remote.** The gate is green there, but no broken commit has been seen to fail it remotely; a throwaway branch carrying a deliberate type error would settle roadmap 10.1's done-when without putting a red commit on `main`.
4. **Keep the governance files current.** `AGENTS.md`, `ui-registry.md`, `memory.md`, and `docs/scope/` were committed as `95a8b1e`, which closed R4; the standing duty is the maintenance protocol in `AGENTS.md` §11, and `npm run docs:check` now fails the gate when this document's mechanical claims fall behind the repository.

**Definition of done for V1** — the deployed static site renders the hero and the search ritual; a day offers at most three deterministic, reload-stable topics; accepting logs history and advances the 90-day count; the 30-day history is viewable and filterable; the web visibly evolves; both light and dark modes work; reduced motion is fully functional; keyboard and screen-reader paths work; and every performance budget in MCD §8 is met.

---

## 12. Quick reference

**Start here when picking up this project:**

1. `KNOWLEDGE INDEX.md` — the navigation map: what to read, for which question, in what order.
2. `docs/MCD.md` — canonical technical truth (decisions §2, engine contract §5, tokens §7).
3. `docs/PRD.md` — product truth (loop §5, Daily Ruling §9, serendipity §17, non-goals §38).
4. `docs/BUILD_ROADMAP.md` — the build sequence and what to do next.
5. `docs/SYSTEM_TEARDOWN.md` — this document; the state.

**Commands**

```bash
npm install            # 221 packages
npm run dev            # serves http://127.0.0.1:5173/
npm run verify         # THE gate: typecheck + content:check + test + docs:check + build
npm run typecheck      # tsc --noEmit, covers src/, scripts/, vite.config.ts
npm run test           # vitest run — 109 tests
npm run docs:check     # fail if this document has drifted from the repository
npm run build          # vite build → dist/
npm run content:validate   # validate the library; exits non-zero on error
npm run content:build      # compile the bundle
npm run content:check      # fail if the committed bundle has drifted
npm run content:report     # coverage, difficulty spread, bundle size
```

**Key facts to carry forward**

- The project builds, typechecks, tests, and serves cleanly. The content gate is real and proven to fail correctly.
- The engine is pure by contract, and `src/engine/purity.test.ts` now fails the suite when an import crosses the boundary.
- The DOM carries the product; the canvas enhances it. No 3D exists yet, and the shell works without it.
- Time-on-site is a failure signal. Features that increase session length oppose the product's purpose.
- AI is used at authoring time only. Nothing AI-generated ships without human review.
- Node ≥ 22.6 is required: the authoring scripts rely on native type stripping, which forbids `enum` and `namespace` in shared code.
- CI runs the gate on every push and pull request and the first run was green on 2026-10-16. The one gap left is that no broken commit has yet been seen to fail it on the remote. The §10 governance files are tracked as of `95a8b1e`.

---

*End of System Teardown v2.8. All current-state claims are compared against the repository by `npm run docs:check`; the figures the gate cannot reach are dated and sourced in place.*
