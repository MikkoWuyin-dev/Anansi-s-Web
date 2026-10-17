# Memory — The state layer: decided, built, and gated

Last updated: 2026-10-17 19:05 local

## What was built

- **Spec 0002** (`docs/specs/0002-local-state-and-persistence.md`, 246 lines), from `/architect` in `feature` mode across three rounds of questions: four keys under `anansi:v1:*`, each value carrying `version: 1` and validated on read; a corrupt key resets only its own slice; a permanent accepted day tally beside the pruned history; the day rolls on access rather than on a timer; storage events rehydrate the other tab; storage that throws leaves the ritual running in memory with `persistent: false`.
- **Phase 3, the state layer** (`src/state/`, seven modules, 50 tests):
  - `shapes.ts` — the four shapes, validators, safe defaults, client id generator.
  - `journeyStore.ts` — `createJourneyStore` on `zustand/vanilla`, with `ensureToday`, `offer`, `accept`, `setStatus`, `rehydrate`, plus `watchStorageEvents`.
  - `retention.ts` — day arithmetic and the 30 day prune.
  - `progress.ts` — the tally, idempotent per day, and the 90 day roll.
  - `storage.ts` — the adapter seam (`localStorage` or memory).
  - `dayRng.ts` — `createRng(`${clientId}:${dayKey}`)`, the stream contract the engine leaves to its caller.
  - `purity.test.ts` — the module boundary: only `@/state`, `@/engine`, `@/content`, `zustand/vanilla`; browser storage only in `storage.ts`.
- **Suite:** 159 tests in 13 files (was 109 in 8); engine 44, state 50, scripts 65.

## Decisions made

- The owner's answers: permanent tally beside pruned history; reset only the failed slice; follow storage events; in memory with a flag when storage is blocked; four small stores; discard a mismatched schema version; check the day key on every access; roll the journey on the next access; keep the day stream helper in the state layer.
- Four build choices recorded in the spec's implementation notes: zustand's vanilla store rather than the React binding; `today` and `now` injected with real defaults; accepting a later story clears the earlier accepted flag so a day has one accepted record; the journey rolls on the next access, not on the acceptance that fills it.
- **MCD §5 corrected, not overridden:** its progress shape gained `acceptedDayKeys` and its schema gained `Identity` and the version envelope. A 30 day history cannot carry a 90 day count, which is the same class of correction as the engine's withdrawn weekly cap.

## Problems solved

- The tally versus history duplication: the tally is the only value that outlives the prune, and only the store's actions write either, so they cannot drift through the public API.
- The day key is read on every access, so a tab left open past midnight starts the new day on its next action rather than needing a timer.
- A corrupt slice is proved by hand editing the day key to `{ not json` and to `version: 2` while history and progress stay intact.
- Mutation checks (roadmap 3's equivalent of Phase 2's): accepting any version, never pruning, ignoring a stale day key, and allowing a fourth offer each fail the suite on the test that pins the rule; all reverted, sources byte-identical.
- Documentation kept in step: MCD §5 and §13 with an amendment entry, roadmap Phase 3 marked complete with 3.1 rewritten to match the build (no `persist` middleware), scope feature 2 `in-progress` with its milestones ticked and the planned count at 15, teardown **v2.9** (map, present list, path table, weights, test transcript, §7.3, capability delta, phase table, next moves, quick reference), and the knowledge index's technical table gained `src/state/`.

## Current state

- `npm run verify` exits 0: typecheck, content check, **159 tests in 13 files**, `docs:check` (**168 claims, no drift**), build.
- Working tree: `src/state/` and `docs/specs/0002-local-state-and-persistence.md` are new, plus edits to `docs/MCD.md`, `docs/BUILD_ROADMAP.md`, `docs/SYSTEM_TEARDOWN.md`, `docs/scope/scope.md`, `KNOWLEDGE INDEX.md` and this file.
- Nothing in `src/app/` calls the store yet; `src/world/` still does not exist.

## Next session starts with

Run `/remember restore`. The next justified step is the scope's feature 4, `The daily ruling and the reveal`, but feature 2's `Verify it: /check verify` and `Test it: /test` boxes are still unticked, as are feature 1's; the roadmap's Phase 4 (the ritual loop) is the first build a person can use, and it must call the engine through the store's actions and never touch `localStorage` directly.

## Open questions

- Whether the engine's per day stream should be passed as a function or consumed through `dayRng` at the call site; the helper exists, and Phase 4 must use it rather than rebuild the seed by hand.
- Whether the history drawer (feature 7) needs the status field to distinguish learned and explored beyond what `setStatus` already records.
- Whether a deliberately broken commit fails on the remote as it does locally; the green path is observed, the failure path only local.
- Whether `KNOWLEDGE INDEX.md`'s name with a space should become `KNOWLEDGE_INDEX.md` so it can appear in the teardown's present list.
- Whether the state layer should later grow an export and import, which V1 deliberately excludes (MCD D6).
