# memory.md: where we are

Overwrite this file at the end of each task; don't append to it. 80 lines at most (`npm run docs:check`).
Durable knowledge goes to the document that owns it (see `AGENTS.md`), and the history goes in `git log`.

Updated: 2026-10-24, after the final 84 candidates were read and promoted; the pool is at 300.

## Now

- Phases 0 to 10 are built, and Phase 1 is closed: the pool is at its launch
  size of 300 reviewed topics, 12 or 13 in each of the 24 domains and exactly
  100 at each difficulty level. The site is live at
  `https://anansis-web.pxxl.click/`; unknown paths answer 200 too. Phase 11,
  accounts, is deferred.
- Every topic entered through the review gate; the sheets in `content/review/`
  are the record of what was read.
- The 300-topic build is verified locally but not deployed: the live site still
  serves the 216-topic bundle, and the host's one hour HTML cache will hide the
  change for a while after it ships.
- **Recorded deviation, accepted 2026-10-23:** the host injects Cloudflare's Web
  Analytics beacon, against the ratified no-analytics decision; the owner left
  it for now, and turning it off is a host setting. Spec 0013 has the details.

## Last done

- Promoted the final 84 (28 per level, zero validation errors) and rebuilt:
  300 topics, bundle 13.2 kB gzip against the 150 kB cap, shell 70.14 kB.
- Re-read the engine tuning at 300: nothing changed. A year of three offers a
  day returns a topic after a median 108 days (70 at 216, 38 at 120), no topic
  repeats inside 30 days, every day finds a story, and no three offers in a row
  share a domain.
- 10.4 live check (2026-10-23): page, font (22,288 bytes, `font/woff2`), robots,
  licence and hashed assets 200, cached immutable for a year; no cookie, no
  session, no account route, and the day ran through every beat. Spec 0013 has it.

## Current numbers (live origin)

- Lighthouse 13 on the host: desktop **89**, mobile **66 and 70**,
  accessibility and SEO **100**, best practices **100**. Desktop clears its
  floor; mobile repeats the accepted miss and its cause, the scene chunk.
- Desktop: FCP 0.6 s, LCP 0.7 s, TBT 250 ms, TTI 1.3 s. Mobile: FCP 1.7 s,
  LCP 2.0 to 3.1 s, TBT 1.65 to 2.03 s, TTI 4.3 to 5.5 s.
- Build at 300 topics: shell 70.14 kB gzip, scene 232.08 kB, CSS 3.04 kB,
  topics 13.2 kB.
- Idle page: 0 draw calls over 2 s, measured on the local build.

## What is not true

- The 300-topic build has not been seen on the host; the figures above are the
  216-topic site until the next publish.
- The 3D scene has never been seen drawing. In the review browser it never
  mounted and the DOM description carried the page: the designed fallback, not
  proof the canvas works. Focus rings have never been seen rendered either, and
  reduced motion has never been observed.
- Frame time is a CPU figure inside `gl.render`, not a GPU timer, and light mode
  hasn't been judged on a real phone or in daylight.
- No broken commit has been seen to fail CI on the remote.

## Open risks

- MEDIUM: the host injects analytics the decision refused, tolerated for now.
- MEDIUM: Vite 8 builds with Rolldown, so chunking is new. The sizes above are
  the baseline; watch the split when a large module is added.
- MEDIUM: topic quality is guarded by human review, and the validator checks
  shape, not substance. The 300 were read in three batch passes rather than
  topic by topic, so a thin answer can still be in there; the resurfacing flag
  is the place to catch one.
- LOW: the mobile Lighthouse budget is missed by an accepted decision.
- LOW: the History control is 39.9 px tall at 390 px, against the mode switch's 44.
- LOW: after marking a story learned, focus falls to `body` (the confirm block
  unmounts); reproduced on the live site, and the live region still says so.
- LOW: the word is undiscoverable except by knowing his name, which is intended,
  and with no ESLint or Prettier the no-hex and hooks rules are only partly tested.
- LOW: TypeScript 7 and `@types/node` 26 exist and were deliberately not taken;
  R3F 9 needs React 19, so upgrade those pairs together or not at all.

## Next justified step

Deploy the 300-topic build to preview, check the ritual, the font, third-party
requests and the 404, then publish production and re-run Lighthouse live.
