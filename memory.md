# Memory — The engine shipped, then the documentation was walked end to end

Last updated: 2026-10-17 18:05 local

## What was built

- **Phase 2, the selection engine (committed as `9c3cc2d`).** `src/engine/types.ts` (contract), `tuning.ts` (one frozen `ENGINE_TUNING`, each number with its reasoning), `offer.ts` (`offerNextStory`: day cap, day exclusions, rarity roll, 60 day return, 30 day window, thin pool, then scoring and a weighted pick). Forty-four engine tests, 109 in the suite across eight files; the purity test reads the module's own source and fails an import that crosses into app, state or world.
- **Spec 0001** (`docs/specs/0001-selection-engine.md`, 252 lines), `In Progress`, with an implementation note recording the three rules the build chose: a repeated-domain guard, a 1.5 dominance ratio, and the rarity roll read from the caller's per-day stream.
- **The documentation reconciliation (2026-10-17, this session).** The owner rewrote `AGENTS.md` and added `KNOWLEDGE INDEX.md` at the root; both were walked against the repository and corrected, along with every document that still described the project as it was before the engine existed.

## Decisions made

- The owner's standing instruction, recorded in `AGENTS.md` §5: **commit at the end of each implementation task once the gate passes.** Pushing, rewriting history, and committing unverified work still need explicit approval.
- The knowledge index stays at the repository root under its original name, which is where the owner placed it; its own header claimed `docs/KNOWLEDGE_INDEX.md`, so the claim was corrected to the file, not the file to the claim.
- Discrepancies were corrected without changing any approved decision: engine status, test counts, gate composition, and stale "missing artifact" lists are status corrections, and each is logged in the MCD's amendments block or this document's amendment history rather than silently edited.

## Problems solved

- **The index contradicted itself and understated the repository.** It declared an intended location in `docs/` while sitting at the root, listed eight verification scripts and omitted `npm run docs:check`, called the skill count unverified (it is 13), and listed six artifacts as missing that all exist.
- **`AGENTS.md` was a full rewrite that predated the build.** It still described a four-step gate, 44 tests, "no CI", an unenforced engine boundary, and a content-schema divergence that was closed on 2026-10-16. Each was corrected against the live repository, and the owner's commit-per-task rule was added to the approval gates.
- **MCD §13 still said the engine was "not built", "only the day key and the seeded PRNG exist", 79 tests, and "engine purity is a convention that nothing enforces."** Rewritten; an amendment entry records it as a status correction, not a decision change.
- **The teardown claimed to list every tracked file while omitting four of them** — `AGENTS.md`, `memory.md`, `ui-registry.md`, `docs/scope/` — and its deep-dive still said `docs/specs/` was absent and Phases 2 onward unbuilt. The map, the path table, the deep-dive, the capability delta and the quick reference now match; teardown is **v2.8**.
- **The roadmap's Phase 2 was marked complete without saying what that means for gate G3.** A note now records that every engine rule has a test and three deliberate breakages fail the suite, and that G3's reload half belongs to Phase 3, which must rebuild the per-day stream.
- One structural constraint learned and respected: the teardown's "present" list is split on whitespace, so a path containing a space cannot be listed there; `KNOWLEDGE INDEX.md` is named in the map, the path table and the deep-dive instead.

## Current state

- `npm run verify` exits 0: typecheck, content check, **109 tests in 8 files**, `docs:check` (**157 claims, no drift**), build.
- **Working tree before this session's commit:** `AGENTS.md` modified, `KNOWLEDGE INDEX.md` newly staged, the docs edited (`docs/MCD.md`, `docs/BUILD_ROADMAP.md`, `docs/SYSTEM_TEARDOWN.md`, `docs/scope/scope.md`), and `memory.md`.
- Document versions: teardown **v2.8**, MCD amended 2026-10-17, roadmap status "Phases 0 to 2 complete", scope feature 1 in progress with its four build milestones ticked, spec 0001 `In Progress`.
- CI runs the five-step gate in the workflow, but the removal of the space in the index filename was not attempted; the committed gate is what ran locally.

## Next session starts with

Run `/remember restore`. The next justified step is the scope's feature 2, `Local state and persistence`, which is still marked `needs a decision`: `/architect local state and persistence`. It must store the engine's shapes, survive a corrupt store, roll the day at local midnight, prune 30-day history, and rebuild the per-day stream identically — that last one is the only determinism guarantee no engine test can reach, and it is what clears gate G3.

## Open questions

- Whether `KNOWLEDGE INDEX.md`'s name with a space should become `KNOWLEDGE_INDEX.md` so it can appear in the teardown's present list; the owner chose the name, so it stands until they say otherwise.
- Whether the docs checker should learn the index's path and its counts, so the index is policed mechanically the way the teardown is.
- Whether a deliberately broken commit fails on the remote as it does locally; the green path is observed, the failure path only local.
- Whether the display face should be self hosted, or the external request consciously accepted.
- Whether the engine's thin pool should stop repeating topics once the library passes 100, where the spec's derivable weekly cap becomes worth adopting.
