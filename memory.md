# memory.md: where we are

Overwrite this file at the end of each task; don't append to it. 80 lines at most (`npm run docs:check`).
Durable knowledge goes to the document that owns it (see `AGENTS.md`), and the history goes in `git log`.

Updated: 2026-10-23, after Phase 9.

## Now

- Phases 0 and 2 to 9 are built. Phase 1 remains in progress: the pool holds 120
  reviewed topics, five per domain, at a 40/40/40 difficulty split. The target is
  300 (`npm run content:report`).
- Phase 9 closed on 2026-10-23 with specs `docs/specs/0010-measured-quality.md` and
  `docs/specs/0011-the-display-face.md`, and the three-layer report
  `docs/reviews/2026-10-23-phase-9.md`.
- Next is Phase 10: continuous integration's failure half, the dev advisories,
  governance files, then deploy. Phase 11, accounts, is deferred.

## Last done

- 9.1: measured every MCD §8 budget against the production build. Shell 62.68 kB
  gzip, scene 238.81 kB, topic bundle 5.6 kB (14.0 kB projected at 300), idle 0
  draw calls over 2 s, search frame time 1.0 ms median, Lighthouse desktop 85.
  Lighthouse mobile is 69 to 73 against 75: the lazy scene's 238.81 kB parse
  lands inside the throttled load. With that chunk blocked the page scores 99 and
  is interactive at 1.7 s. The owner chose to keep the world immediate and record
  the miss; mobile TTI with the scene is 4.5 to 5.7 s for the same reason.
- 9.2: the story title became the page's `h1` (it was an `h2`, so the story state's
  outline began at level two), with a test that every state keeps exactly one.
  Keyboard walk, drawer, mode switch, canvas description, light-mode contrast
  (15.49:1 and 5.66:1) verified live. Focus rings and reduced motion stay
  unobserved in this environment.
- 9.3: Space Grotesk is self-hosted as one latin variable woff2 in `public/fonts/`
  with its OFL licence, preloaded, declared once. No third-party request remains.
  `public/robots.txt` added because Lighthouse's robots audit fails on a 404.
- `ENGINE_TUNING` was re-read at 120 and none of its values changed; the comment
  now records that, and that resurfacing needs roughly 180 topics to be reachable.

## What is not true

- The mobile Lighthouse budget is missed, by an accepted decision, not by
  oversight. Desktop sits exactly on its floor of 85, so it has no headroom.
- Focus rings have never been seen rendered: the preview webview's page is never
  the focused window, so `:focus-visible` cannot match. CSS and the contrast test
  are the evidence.
- Reduced motion has never been observed running, in any phase.
- The 3D beats and transitions have not been seen as pictures here; their
  descriptions, state, and draw counts are what was checked.
- Frame time is a CPU submission figure inside `gl.render`, not a GPU timer.
- Light mode hasn't been judged on a real phone or in daylight.
- No broken commit has been seen to fail CI on the remote.
- The error boundary has never caught a real scene throw.

## Open risks

- MEDIUM: topic quality is guarded by human review, and the validator checks shape,
  not substance. The 2026-10-22 batch was reviewed as a title sheet, not read one
  by one.
- MEDIUM: several stage paths rest on code and tests; Phase 10's deploy is the
  first chance to see them in a real browser.
- MEDIUM: the pool is 120 of 300, so every content decision still carries launch
  risk. Resurfacing, tested and inert, only becomes reachable near 180.
- LOW: the History control measures 39.9 px tall at 390 px, against the mode
  switch's 44. No documented rule is violated; watch it on a phone.
- LOW: after marking a story learned, focus falls to `body` because the confirm
  block unmounts; the live region still says so.
- LOW: the word is undiscoverable except by knowing his name, which is intended.
- LOW: the stage has six beats, and a seventh must answer three mappings before
  TypeScript compiles it; no ESLint or Prettier, so the no-hex and hooks rules are
  enforced only partly, by tests.
- LOW: the dev-only `npm audit` advisories need breaking Vite and Vitest majors,
  and R3F 9 needs React 19. Upgrade the pairs together or not at all.

## Next justified step

Phase 10: run the gate's failure half without leaving `main` red, decide the six
dev advisories, and deploy the static site with the budgets re-checked on the real
host. Before deploy, ratify the privacy-friendly analytics decision that 10.4 asks
for, or record that it stays absent.
