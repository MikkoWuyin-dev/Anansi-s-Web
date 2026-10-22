# memory.md: where we are

Overwrite this file at the end of each task; don't append to it. 80 lines at most (`npm run docs:check`).
Durable knowledge goes to the document that owns it (see `AGENTS.md`), and the history goes in `git log`.

Updated: 2026-10-22, after reconciling the documents and growing the pool to 120.

## Now

- Phases 0 to 7 are built, and 8.1 (the weave) with them. 8.2, the hidden interactions, is the one
  Phase 8 step left and needs an owner decision before it gets a spec.
- Phases 9 (measured quality gates) and 10 (hardening, deployment) have not started. Phase 11, accounts, is deferred.
- The pool holds 120 reviewed topics: the 24 seed topics plus the batch of 2026-10-22, five per domain,
  at a 40/40/40 difficulty split. The target stays 300 (`npm run content:report`).
- Status claims are now enforced rather than trusted. `docs:check` fails when the roadmap's phase map
  disagrees with a phase heading, when a scope row disagrees with its section or with its own ticked
  boxes, or when a spec's status disagrees with its `Built` line.

## Last done

- Reconciled the documents with the code: the roadmap header no longer claims the built phases are
  unbuilt, 7.1 names the document attribute instead of the retired media query, and every spec reads
  `Built`. The scope table and sections were brought in line the same way.
- Widened `docs:check`: every governance document has its paths and scripts resolved (bare module
  names included), and the three status pairs above are compared. 25 new tests; four deliberate
  breakages — a regressed spec status, a heading that stops matching the phase map, a scope row that
  disagrees with its section, and a deleted source file — each fail it.
- Grew the pool from 24 to 120 through the review gate: 96 candidates staged in
  `content/review/candidates/`, validated, reviewed as `content/review/BATCH-2026-10-22.md`, then promoted.

## What the pool size actually changed

- A 90-day simulation over the real engine and this library now returns 270 offers covering all 120
  topics: no thin-pool offer, no repeat inside the 30-day window, and no three same-domain offers in a
  row. At 24 topics, every offer from day 9 was thin-pool and 246 of 270 repeated inside the window.
- Intentional resurfacing still cannot fire. At three offers a day a topic comes back about every 40
  days, and a return needs 60 days of absence, so it needs roughly 180 topics before it is reachable.
- `ENGINE_TUNING` was tuned against 24 topics and has not been re-read since. The weights, the spread
  window and the rarity chance are judgement calls, not measurements (spec 0001).

## Not verified, and why

- Stage and switch transitions, the switch's crossfade, the focus ring, and the absence of a
  first-paint flash: the preview webview composited no frames on 2026-10-22 either. They rest on code and tests.
- Reduced motion: the media query can't be emulated there, so its branches are covered only by unit tests and CSS assertions.
- The error boundary has never caught a real scene throw.
- Frame time is measured inside `gl.render`, not by a GPU timer.
- Light mode hasn't been judged on a real phone or in daylight.
- No broken commit has been seen to fail CI on the remote.
- Lighthouse and first usable interaction belong to Phase 9.

## Open risks

- MEDIUM: `ENGINE_TUNING` is unmeasured at 120 topics, and the pool's growth changes what the scoring
  terms actually do. Re-read it before Phase 9 and again at 300 (spec 0001's Follow-up).
- MEDIUM: topic quality is guarded by human review, and the validator checks shape, not substance. The
  2026-10-22 batch was reviewed as a title sheet, not read one by one; a weak title would only show up in use.
- MEDIUM: some stage paths rest on code and tests, not a live session (see above).
- LOW: the stage's art direction is a first pass. Tune `src/world/families.ts` and `src/world/graph.ts`
  against screenshots in both modes.
- LOW: there is no ESLint or Prettier, so the no-hex and hooks rules are enforced only partly, by tests.
- LOW: the dev-only `npm audit` advisories need breaking Vite and Vitest majors.
- LOW: React 18 with R3F 8 is fine, but R3F 9 needs React 19. Upgrade them together or not at all.
- LOW: the history drawer drops learned stories older than 30 days (they still count toward N / 90), and
  its date search follows the browser locale. See the Follow-up section of spec 0004.

## Decisions owed by the owner

- 8.2: which few hidden interactions are worth the ritual's attention. PRD §32 says they must never
  interfere with the core task.

## Next justified step

Ask the owner about 8.2, then write its spec with `/architect`. After that: retune and measure the
engine at 120 topics, grow the pool toward 300, then Phase 9.
