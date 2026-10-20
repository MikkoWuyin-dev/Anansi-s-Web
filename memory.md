# memory.md: where we are

Overwrite this file at the end of each task; don't append to it. 80 lines at most (`npm run docs:check`).
Durable knowledge goes to the document that owns it (see `AGENTS.md`), and the history goes in `git log`.

Updated: 2026-10-20, after the documentation restructure.

## Now

- Phases 0 to 7 are built. Phase 8 is half done: 8.1, the weave, is built against
  `docs/specs/0008-the-evolving-web.md`. 8.2, the hidden interactions, has not started.
- Phases 9 (measured quality gates) and 10 (hardening, deployment) have not started. Phase 11, accounts, is deferred.
- The content library holds a small seed pool against a target of 300 (`npm run content:report`).
  Roadmap 5.3, the optional domain filter, waits until the pool covers the domains.

## Last done

- 8.1 the weave: one thread and one knot per accepted day, drawn from the tally rather than the
  history (spec 0008; `src/world/kept.ts`, `src/world/Web.tsx`).
- The documentation was restructured: `AGENTS.md` is short and holds the navigation the knowledge
  index used to hold; this file is the only record of where we are; the System Teardown is a dated
  snapshot that is no longer kept current; and `docs:check` now checks paths and line budgets rather
  than counts.

## Not verified, and why

- Stage and switch transitions, the switch's crossfade, the focus ring, and the absence of a
  first-paint flash: the preview webview composited no frames. These rest on the code and the tests.
- Reduced motion: the media query can't be emulated there, so its branches are covered only by unit
  tests and CSS assertions.
- The error boundary has never caught a real scene throw.
- Frame time is measured inside `gl.render`, not by a GPU timer.
- Light mode hasn't been judged on a real phone or in daylight.
- No broken commit has been seen to fail CI on the remote.
- Lighthouse and first usable interaction belong to Phase 9.

## Open risks

- MEDIUM: topic quality is guarded only by human review; the validator checks shape, not substance.
- MEDIUM: the pool runs out of fresh stories in about a week of daily use. Grow it before Phase 9.
- MEDIUM: some stage paths rest on code and tests, not a live session (see above).
- LOW: the stage's art direction is a first pass. Tune `src/world/families.ts` and
  `src/world/graph.ts` against screenshots in both modes.
- LOW: there is no ESLint or Prettier, so the no-hex and hooks rules are enforced only partly, by tests.
- LOW: the dev-only `npm audit` advisories need breaking Vite and Vitest majors.
- LOW: React 18 with R3F 8 is fine, but R3F 9 needs React 19. Upgrade them together or not at all.
- LOW: the history drawer drops learned stories older than 30 days (they still count toward N / 90),
  and its date search follows the browser locale. See the Follow-up section of spec 0004.

## Decisions owed by the owner

- 8.2: which few hidden interactions are worth the ritual's attention. PRD §32 says they must
  never interfere with the core task.

## Next justified step

Ask the owner about 8.2, then write its spec with `/architect`. After that: grow the content pool,
then Phase 9.
