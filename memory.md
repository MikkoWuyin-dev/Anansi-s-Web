# memory.md: where we are

Overwrite this file at the end of each task; don't append to it. 80 lines at most (`npm run docs:check`).
Durable knowledge goes to the document that owns it (see `AGENTS.md`), and the history goes in `git log`.

Updated: 2026-10-22, after 8.2, the hidden interactions.

## Now

- Phases 0 to 8 are built, all of them. 8.2 shipped on 2026-10-22 as spec 0009: the word that
  names Anansi, a `naming` beat for the stage's answer, the clocks turning when the day seals, and
  the kept knot pulsing once.
- Phases 9 (measured quality gates) and 10 (hardening, deployment) have not started. Phase 11, accounts, is deferred.
- The pool holds 120 reviewed topics, five per domain, at a 40/40/40 difficulty split. The target
  stays 300 (`npm run content:report`).
- Status claims are enforced, not trusted: `docs:check` fails when the roadmap's phase map, a phase
  heading, the scope row, a scope section heading, or a spec's status disagree. A spec that is not
  `Built` may name files it intends to create; a built one may not point at a path that is gone.

## Last done

- 8.2, the hidden interactions (spec 0009). Three surprises and nothing stored: typing `anansi` out
  of a field answers once a session through its own beat; the clocks turn `0.35` radians toward the
  hub when the third story seals the day; the kept story's knot pulses in the celebrating beat.
  Suppressed inside a field, during a search, and under a modifier. Reduced motion keeps the words
  and drops the movement.
- Verified live at 390 by 844: the word moved the canvas description and the live region and settled
  back, a second attempt did nothing, typing it into the history search changed nothing, the day
  sealed at three, and idle frames stayed at zero before and after an acceptance.
- Before that: the documents were reconciled and `docs:check` widened, and the pool grew 24 to 120
  through the review gate (`content/review/BATCH-2026-10-22.md`).

## What the pool size changed

- A 90-day simulation over the real engine and this library returns 270 offers covering all 120
  topics: no thin-pool offer, no repeat inside the 30-day window, no three same-domain offers in a
  row. At 24 topics, every offer from day 9 was thin-pool and 246 of 270 repeated inside the window.
- Intentional resurfacing still cannot fire. At three offers a day a topic comes back about every 40
  days and a return needs 60 days of absence, so it needs roughly 180 topics to be reachable.
- `ENGINE_TUNING` was tuned against 24 topics and has not been re-read since. The weights, the spread
  window and the rarity chance are judgement calls, not measurements (spec 0001).

## Not verified, and why

- Stage and switch transitions, the focus ring, and the absence of a first-paint flash: the preview
  webview composited no frames again on 2026-10-22. They rest on code and tests.
- Reduced motion: the media query can't be emulated there, so the still branches of the naming beat,
  the seal turn, and the kept knot are covered by unit tests only, never observed.
- The seal turn and the kept knot were never seen as pictures: only their descriptions, their state,
  and the absence of console errors were checked.
- The error boundary has never caught a real scene throw.
- Frame time is measured inside `gl.render`, not by a GPU timer.
- Light mode hasn't been judged on a real phone or in daylight.
- No broken commit has been seen to fail CI on the remote.
- Lighthouse and first usable interaction belong to Phase 9.

## Open risks

- MEDIUM: `ENGINE_TUNING` is unmeasured at 120 topics, and the pool's growth changes what the scoring
  terms actually do. Re-read it before Phase 9 and again at 300 (spec 0001's Follow-up).
- MEDIUM: topic quality is guarded by human review, and the validator checks shape, not substance. The
  2026-10-22 batch was reviewed as a title sheet, not read one by one.
- MEDIUM: several stage paths rest on code and tests, not a live session (see above).
- LOW: the word is undiscoverable except by knowing his name, which is intended but means it may
  never be found. Judge it in real use before adding a second one.
- LOW: the stage has six beats, and a seventh must answer three mappings before TypeScript compiles it;
  and there is no ESLint or Prettier, so the no-hex and hooks rules are enforced only partly, by tests.
- LOW: the dev-only `npm audit` advisories need breaking Vite and Vitest majors.
- LOW: React 18 with R3F 8 is fine, but R3F 9 needs React 19. Upgrade them together or not at all.
- LOW: the history drawer drops learned stories older than 30 days (they still count toward N / 90),
  and its date search follows the browser locale. See the Follow-up section of spec 0004.

## Next justified step

Phase 9: measure every MCD §8 budget and audit the accessibility commitments, recording what is
still not true. Before that, re-read `ENGINE_TUNING` at 120 topics so the numbers Phase 9 records are
the ones the product will keep.
