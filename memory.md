# Memory — The selection engine: decided, then built

Last updated: 2026-10-16 22:12 local

## What was built

- **`docs/specs/0001-selection-engine.md` (252 lines)** — the repository's first spec, from `/architect` in `feature` mode across four rounds of questions, now `In Progress` with an implementation note. It fixes one entry point, `offerNextStory(input)`, returning either a story with `because: 'new' | 'resurfaced' | 'thin-pool'` or a reason there is none, and puts every number in one frozen `ENGINE_TUNING`.
- **Phase 2, the engine itself (2026-10-16):**
  - `src/engine/types.ts` — `TopicRecord`, `DayState`, `SelectionInput`, the `Offer` union. `HistoryEvent` retired; `Progress` deliberately left to the state layer.
  - `src/engine/tuning.ts` — one frozen object with the reasoning beside each number: 3 stories a day, 30 day window, 60 day absence, 1 in 7 return chance, a 12 offer spread window, weights 0.6 / 0.25 / 0.15, sharpness 3, dominance 1.5.
  - `src/engine/offer.ts` — the rules in fixed order: day cap, empty library, the day's own exclusions, the rarity roll, the return, the window, the thin pool; then scoring and a weighted pick.
  - Tests: `offer.test.ts` (20), `offer.statistical.test.ts` (6 simulations over 100 and 365 days), `purity.test.ts` (4). The engine went from 14 tests to 44; the suite from 79 to 109 across 8 files.

## Decisions made

- The owner's answers shaped the spec: relax by age on a thin pool, soft weighting for the spread, a capped chance rather than a schedule for returns, and the engine owning the day's cap and reroll uniqueness through one entry point. One record type, one result union, one exported tuning object, sources only in References, domain recency decisive between close candidates.
- **The trade recorded rather than smoothed over:** the guaranteed weekly cap on returns was dropped for a tuned chance, because the input cannot tell a return from a first showing. MCD §5 and roadmap 2.6 were corrected in the same task; the spec's Follow-up keeps the derivation that would restore the cap.
- **Three rules the build chose**, because the spec fixed behaviour rather than mechanism, and all three are documented in the source and in teardown §7.2: a repeated-domain guard (the only way AC-12 holds at 0.6 weight), a 1.5 dominance ratio (so a decisive domain-recency gap is deterministic and only a close call goes to the draw), and the rarity roll read from the caller's per-day stream (which makes the chance per day, and keeps AC-15's band honest).
- AC-15's "first 61 days" versus AC-14's "at least 60": AC-14 wins, first legal return is day 61, test asserts none in days 1 to 60. Recorded in the spec.

## Problems solved

- The 24 topic pool against a 30 day window made the empty window the second week of use, so the thin pool path is part of the decision, not an edge case.
- The purity risk (R6) is closed by a test that reads the module's own source: imports must resolve to `@/engine/*` or `@/content/*`; no clock, DOM, storage, network; `offer.ts` may not call `getDayKey`. The clock regexes are matched as code (`/\bnew Date\(/`) because a comment legitimately ends a sentence with "window.".
- The mutation check roadmap 2.7 asks for: widening the window to 60 failed the 29/30 boundary test, shortening the absence to 30 failed the one-day-early test, clamping the spread factor to 1 failed the over-represented-level test. All three reverted; `tuning.ts` byte-identical to the backup.
- Statistical results measured, not assumed: with the tuning as designed, 3 seeds × 100 days show no three consecutive same-domain offers, no period 3/4 rotation, each level between 25 and 42 percent; 3 seeds × 365 days show returns on 8 to 20 percent of days and none before day 60.
- The docs gate caught every count it should: 145 tracked files, 109 tests in 8 files, 17 application files and 2,243 lines, and the spec's new line count. `npm run docs:check` reports **154 claims, no drift**.

## Current state

- `npm run verify` exits 0: typecheck, content:check, 109 tests, docs:check (154 claims), build.
- **Working tree: uncommitted.** Modified: `package.json`, `AGENTS.md`, `docs/MCD.md`, `docs/BUILD_ROADMAP.md`, `docs/SYSTEM_TEARDOWN.md`, `docs/scope/scope.md`, `memory.md`; staged: `docs/specs/0001-selection-engine.md`; untracked: `scripts/check-docs.ts`, `scripts/lib/claims.ts`, `scripts/lib/claims.test.ts`, `src/engine/{types,tuning,offer,offer.test,offer.statistical.test,purity.test}.ts`.
- Documents updated: teardown **v2.7** (map, weights, §5.3, §5.10, §7.2 rewritten as implemented, R6 resolved, R9 reworded, phase table, next moves, quick reference); roadmap status line and Phase 2 marked complete, 2.1 no longer claims `Progress` lives in the engine; scope feature 1's four build milestones ticked and the engine primitives row is `existing`; spec `In Progress`.
- CI still runs the four-step gate: the fifth step and all of this are on disk, not in history.

## Next session starts with

Run `/remember restore`. Then commit everything — the checker's numbers describe the tree they land in — so CI picks up the fifth gate step and `docs/specs/` becomes tracked rather than staged. The next unticked scope box is feature 1's `Verify it: /check verify`, then `Test it: /test`; after that the scope's feature 2 (`Local state and persistence`) is still `needs a decision`, so `/architect local state and persistence` is the next design, and it must carry the one determinism guarantee no engine test can reach: a rebuilt per-day stream yields the same day.

## Open questions

- Whether the untracked-directory case should keep needing a `git add` to satisfy the checker's "present and tracked" lists, or whether those lists should learn a "present but untracked" phrasing.
- Whether a deliberately broken commit fails on the remote as it does locally; the green path is observed, the failure path only local.
- Whether the display face should be self hosted, or the external request consciously accepted.
- Whether `docs/scope/scope.md` should later be promoted to an index plus per area files.
- Whether the engine's thin pool should eventually stop repeating topics at all once the library passes 100 topics, where the follow-up's derivable weekly cap becomes worth adopting.
