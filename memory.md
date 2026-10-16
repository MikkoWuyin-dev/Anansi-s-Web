# Memory — Documentation reconciliation and the workflow artifacts

Last updated: 2026-10-16 18:55 local

## What was built

- `docs/SYSTEM_TEARDOWN.md` rewritten to **v2.0** with an amendment history mapping each v1 claim to its current reality, plus sections rewritten against fresh evidence (repository map with real line counts, verified state, contracts, gap analysis, risk register).
- `docs/MCD.md` reconciled with the code: the §5 `Topic` snippet now matches `src/content/types.ts` exactly, §13 records what is built and what is not, §3 lists the documents added since ratification, and an Amendments block records the change and the consent for it.
- Both documents committed and pushed as `7d134b6` on `main` (2 files, 438 insertions, 638 deletions). Remote `origin/main` matches local `HEAD`.
- `AGENTS.md` written by the project owner (188 lines, 11 sections, measured with `wc -l`). Read and reported on; one stale claim corrected at line 182.
- `docs/scope/scope.md` created: 6 enrolled features and 17 planned features across Foundation, five slices, Quality, and Release, with Tracer Bullet as the build approach and Beta as the workflow default.
- `ui-registry.md` created: the audit baseline plus entries for the shell and the action.
- `memory.md`, this file, created.

## Decisions made

- The MCD was reconciled against the implementation, and the teardown corrected to match, so no document contradicts another as of 2026-10-16. Change order follows the MCD's own rule: the MCD changes first and only with the owner's consent.
- Build approach is **Tracer Bullet**; the project workflow default is **Beta** (after `/develop`, `/check verify` then `/test`); the scope names its project sources but carries no reference links.
- `Content pool to launch size` needs no spec, because the review gate and promotion steps already exist in `content/review/README.md`.
- Commits and pushes stay gated operations. `AGENTS.md` was left untracked and uncommitted after being edited, pending explicit approval.

## Problems solved

- Reconciling the MCD made the teardown that had been written minutes earlier stale in five places. All five were corrected so the two documents agree rather than contradict.
- The claim that the MCD lagged behind the implementation became false once the MCD was reconciled; corrected at `AGENTS.md:182`, with the count of 44 tests re-confirmed by running the suite.
- Counting the topic pool by importing the loader failed under `node --experimental-strip-types` from a one line script; the topic files were counted directly instead (24).
- `imprint` audit mode requires the baseline to be confirmed before anything is written; the owner confirmed it, so the baseline records existing practice rather than an assumption.

## Current state

- **Built:** the scaffold, the DOM shell, the content schema and authoring pipeline (24 of a 300 topic target), and the two engine primitives (the day key and the seeded random source). `npm run verify` exits 0 with 4 test files and 44 tests.
- **Not built:** every selection rule, state and persistence, the ritual loop, history and progress, the whole 3D world, light mode, and CI.
- **Working tree:** `AGENTS.md` is modified and untracked. `docs/scope/scope.md`, `ui-registry.md`, and `memory.md` are new and untracked. Last commit is `7d134b6`, pushed.
- A dev server was serving the app on port 5173 earlier in the session.

## Next session starts with

Run `/remember restore`. Then take the first unticked box in `docs/scope/scope.md`, which is `/architect selection engine`.

## Open questions

- Whether to commit and push the three new artifacts and the `AGENTS.md` correction, which needs owner approval.
- Whether the display face should be self hosted, or the external request consciously accepted.
- Whether `docs/scope/scope.md` should later be promoted to an index plus per area files, if the feature count keeps growing.
