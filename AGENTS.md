# AGENTS.md — Anansi's Web

Loaded at the start of every session, so it holds only what changes rarely. Anything with a number, a date, or "currently" belongs in `memory.md`. `npm run docs:check` keeps this file under 200 lines, its paths real, and every status honest.

## What this is

A daily topic-discovery and articulation ritual. Anansi finds one intriguing topic a day; the person researches it and explains it aloud in their own words. It is not a learning platform. North star: *make curiosity irresistible, then get out of the way.* Time-on-site is a failure signal, not a goal.

V1 is static, accountless, local-first, no backend: React 18 + strict TypeScript + Vite, three.js through `@react-three/fiber`, Zustand, localStorage.

## Commands

- Install: `npm ci` (Node ≥ 22.6)
- Dev server: `npm run dev` (http://127.0.0.1:5173)
- **Gate:** `npm run verify` must exit 0 before work is called done. It runs typecheck, `content:check`, tests, `docs:check`, build. CI runs it on every push (`.github/workflows/verify.yml`).
- One test file: `npx vitest run src/engine/offer.test.ts`
- Content: `npm run content:validate`, `npm run content:build` (after editing `content/topics/`), `npm run content:report`

## Where things live

Start with `memory.md` (current state, open risks, next step). Then read only the rows your task needs, and only the sections named.

| You need | Read |
|---|---|
| Product behaviour, scope, non-goals | `docs/PRD.md`: loop §5, reveal §8, Daily Ruling §9, exclusions §14, serendipity §17, 90 days §19, evolving web §20, history §22, hidden interactions §32, modes §33, accessibility §36, non-goals §38 |
| Architecture, contracts, schemas | `docs/MCD.md`: decisions §2, layout §3, world rules §4, engine contract §5, content §6, design tokens §7, budgets §8, accessibility §9 |
| A feature's requirements and acceptance criteria | `docs/specs/` (one numbered spec per feature; the spec is the contract) |
| Build order, phase status, done-when lines | `docs/BUILD_ROADMAP.md` |
| Feature boundaries and slices | `docs/scope/scope.md` (kept by `/scope`) |
| Visual patterns already in use | `ui-registry.md` (kept by `/imprint`) |
| A whole-repo audit at a point in time | `docs/SYSTEM_TEARDOWN.md` (a dated snapshot, not kept current; it is re-audited only when the owner asks) |
| History and why something changed | `git log` |

## Code map

```
src/engine/   pure selection logic: day rules, serendipity, resurfacing
src/state/    the anansi:v1:* stores over localStorage, day rollover, 30 day prune, tally
src/app/      DOM UI: ritual screen, history drawer, mode switch, tokens in styles.css
src/world/    the 3D stage: graph, camera, object families, Anansi, choreography, the weave
src/content/  topic types, compiled bundle (topics.generated.ts, never hand-edited), loader
content/      topics/ is the reviewed library; review/ holds AI candidates, never shipped
scripts/      content pipeline and docs:check; rules in scripts/lib/, each with a test
```

Boundaries: `src/engine/` imports nothing from app, state or world, and reads no clock, DOM, storage or network (`src/engine/purity.test.ts`). `src/world/` is a leaf: it never imports app, state or content (`src/world/purity.test.ts`). The DOM carries the product; the canvas only enhances it, so the ritual works when the scene fails or never loads.

## Invariants (owner approval needed to change)

Product (full text in the PRD):
- Reveal a topic title only: no definition, no lesson.
- Daily Ruling: at most three stories per local day (the first plus two rerolls); the third is the day's story and stays fixed until local midnight. Every displayed story counts as Explored.
- Serendipity rules and difficulty stay invisible. Difficulty is never shown as a rating.
- Topic exclusions: politics, religion, explicit sexuality, graphic medical, highly technical maths, topics needing specialist handling.
- No personalisation by IP, country or local events.
- Shame-free progress (`37 / 90`). No streaks, XP, leaderboards, or compulsion notifications.
- V1 non-goals: accounts, backend, monetisation, AI tutoring or chat, speech analysis, social features.
- AI-proposed topics ship only after human review.
- The world supports the ritual and evolves with progress; it is not navigation for its own sake. Reduced motion is fully functional.

Technical:
- The two purity boundaries above.
- The mode has one authority: `<html data-mode>`. Tokens are selected by `:root[data-mode='light']`, never by a `prefers-color-scheme` media query (`src/app/tokens.test.ts` fails if one appears).
- Colours come from tokens, never hardcoded hex.
- Stored shapes are versioned (`{version: 1, ...}` under `anansi:v1:*`); unknown or malformed values fall back, refused writes are swallowed.
- The stage draws on demand only; an idle page draws zero frames. Budgets are MCD §8.

## When sources disagree

- Product behaviour: the PRD. Architecture and contracts: the MCD. One feature's details: its spec. What exists: the code and tests. Where we are: `memory.md`, checked against the code.
- Code doesn't prove intent, a doc doesn't prove something was built, and a passing suite doesn't prove the product is right.
- If resolving it would change behaviour, architecture, persistence, security or scope: stop, show the conflict and the options, and ask. If a doc is simply wrong, fix it in the same task and say so.

## Working rules

1. Do the task asked. No unrequested features, dependencies, abstractions, polish or refactors.
2. Before editing: `git status`, and preserve changes you didn't make. Read the relevant spec, code and tests.
3. Unclear and consequential (behaviour, architecture, persistence, scope): ask. Unclear but cheap to redo: take the most reasonable reading and say which.
4. A non-trivial feature with no spec gets one first via `/architect`, ratified by the owner. Phase 8.2 and anything else marked as a product decision: ask, don't code.
5. Narrow tests while working, `npm run verify` before done. Never report a check you didn't run. Never weaken a test or a validator to get a pass.
6. For UI work, check it in a browser at desktop and phone widths, then `/imprint`. Say what you could not observe.
7. Re-read the full diff before finishing.

## Approval gates: ask first

- **Commit:** standing permission (owner, 2026-10-17) to commit at the end of each task once `npm run verify` passes. Committing work that failed or skipped the gate needs approval.
- Push, history rewrite, deploy, release.
- Deleting data or discarding changes you didn't make.
- Adding a dependency, or changing framework, runtime or major tool versions.
- Changing an approved architecture decision, a stored data shape, a security boundary, or product scope.
- Installing or enabling skills for external tools.

Everything else (reading, local edits, tests, local builds, the dev server) needs no approval.

## Knowledge upkeep

- Each fact lives in one file. Elsewhere, link to it.
- Never write a number a command can produce (test counts, bundle sizes, file counts). Write the command.
- Never record git state (committed, pushed, clean tree) in a document. Git knows it.
- At the end of a task, update only what became false:
  - `memory.md`: always. Overwrite it, don't append; 80 lines at most (`docs:check` enforces it).
  - The spec: status, acceptance criteria ticked, deviations noted.
  - `docs/BUILD_ROADMAP.md`: tick the step. `docs/scope/scope.md`: the feature's status.
  - `ui-registry.md`: after UI work, via `/imprint`.
  - PRD or MCD: only when behaviour or a contract changed, with owner approval.
  - `AGENTS.md`: only when a command, invariant, gate, boundary or gotcha changed.
- Commit messages carry the history: say what changed and why.
- Hit a trap the next agent would also hit? Add one line under Gotchas.

## Skills

Workflow skills in `skills/` (read the SKILL.md before using one):
`architect` (spec before a non-trivial feature), `develop` (build from a ratified spec), `test`, `check` (pre-merge review), `review` (post-feature report), `debug` (root cause), `recover` (diagnose before fixing), `imprint` (after UI work), `remember` (writes `memory.md`; keep its current shape and budget), `scope`, `sync` (reconcile this file, scope and specs), `audit` (bootstraps agent context files; adds only what is missing), `document` (PR body, changelog).

Everything else in `skills/` is reference material, not process. The `threejs-*` packs target three.js r186; this project pins 0.169, so check an API against `node_modules/three` before following an example. The relevant two are `threejs-react-three-fiber` and `threejs-performance`.

## Gotchas

- Authoring scripts run on Node's native type stripping: no `enum` or `namespace` in any code they import.
- Windows treats Objects.ts and Objects.tsx as the same file. Give a pure module a different stem (`src/world/families.ts` beside `src/world/Objects.tsx`).
- `@react-spring/three` under the demand frameloop needs `onChange: () => invalidate()`, or nothing draws.
- The pre-paint script in `index.html` must stay before `/src/main.tsx` and assign `data-mode` from the resolved value.
- `@react-three/drei` is installed but unused. Don't reach for it without a reason that fits MCD §4.
- The preview webview may composite no frames: transitions sit at time 0 and screenshots fail. The reduced motion query cannot be emulated there either. Record such checks as unverified rather than guessing.
- `src/content/topics.generated.ts` is generated: edit `content/topics/` and run `npm run content:build`.
- A status is written twice in three places: roadmap phase map and phase heading, scope table row and section heading, spec `Status` and its `Built` line. `docs:check` fails unless both halves move together.

## Finish with

Outcome · files changed · checks run and their results · what isn't verified and why · next step, plus anything needing approval.
