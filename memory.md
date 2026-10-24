# memory.md: where we are

Overwrite this file at the end of each task; don't append to it. 80 lines at most (`npm run docs:check`).
Durable knowledge goes to the document that owns it (see `AGENTS.md`), and the history goes in `git log`.

Updated: 2026-10-24, after the second candidate batch was reviewed and promoted.

## Now

- Phases 0 and 2 to 10 are built. Phase 1 is open at 216 of 300 reviewed
  topics, nine per domain and seventy-two at each difficulty level. The site is
  live at `https://anansis-web.pxxl.click/`; unknown paths answer 200 too.
  Phase 11, accounts, is deferred.
- The 2026-10-24 batch was promoted whole, so the review queue is empty again
  and the pool grew by 96 in one step. `content/review/BATCH-2026-10-24.md`
  keeps the record of what was read.
- **Recorded deviation, accepted 2026-10-23:** the host injects Cloudflare's Web
  Analytics beacon (`static.cloudflareinsights.com`, posting to `/cdn-cgi/rum`).
  Nothing in the build contains it, it contradicts the ratified no-analytics
  decision, and the owner left it for now; turning it off is a host setting.

## Last done

- 10.1: proved the failure half of the gate for every step locally without a red
  commit: type error → exit 2, bad topic → `content:check` exit 1, failing test
  → exit 1, flipped spec status → `docs:check` exit 1, clean tree → 0.
- 10.2: Vite 5.4 → 8.3.5, Vitest 2.1 → 5.0.5, plugin-react 4.7 → 6.1.2, Node
  floor 22.6 → 22.12; `npm audit` is zero, `vite.config.ts` imports
  `defineConfig` from `vitest/config`, and the 365-day simulation got a 20 s
  timeout after flaking at 4.93 s against Vitest 5's 5 s default.
- 10.4 live check: page, font (22,288 bytes, `font/woff2`), robots, licence and
  hashed assets 200 with immutable caching for a year; no cookie, no session,
  no account route. The day ran find → take → understood → confirm → learned
  with the tallies right. Spec 0013 carries the full record.

## Current numbers (live origin)

- Lighthouse 13 on the host: desktop **89**, mobile **66 and 70**,
  accessibility and SEO **100**, best practices **100**. Desktop clears its
  floor; mobile repeats the accepted miss and its cause, the scene chunk.
- Desktop: FCP 0.6 s, LCP 0.7 s, TBT 250 ms, TTI 1.3 s. Mobile: FCP 1.7 s,
  LCP 2.0 to 3.1 s, TBT 1.65 to 2.03 s, TTI 4.3 to 5.5 s.
- Build: shell 62.54 kB gzip, scene 232.08 kB, CSS 3.04 kB, topics 5.6 kB.
- Idle page: 0 draw calls over 2 s, measured on the local build.

## What is not true

- The 3D scene has never been seen drawing. In the review browser it never
  mounted and the DOM description carried the page: the designed fallback, not
  proof the canvas works.
- Focus rings have never been seen rendered, and reduced motion has never been
  observed.
- Frame time is a CPU figure inside `gl.render`, not a GPU timer.
- Light mode hasn't been judged on a real phone or in daylight.
- No broken commit has been seen to fail CI on the remote.
- The host's HTML cache is one hour, so a deploy can look stale for that long.

## Open risks

- MEDIUM: the host injects analytics the decision refused, tolerated for now.
- MEDIUM: Vite 8 builds with Rolldown, so chunking is new. The sizes above are
  the baseline; watch the split when a large module is added.
- MEDIUM: topic quality is guarded by human review, and the validator checks
  shape, not substance. The pool is 216 of 300, and this batch was read in one
  sitting rather than topic by topic.
- LOW: the mobile Lighthouse budget is missed by an accepted decision.
- LOW: the History control is 39.9 px tall at 390 px, against the mode switch's 44.
- LOW: after marking a story learned, focus falls to `body` (the confirm block
  unmounts); reproduced on the live site, and the live region still says so.
- LOW: the word is undiscoverable except by knowing his name, which is intended;
  and with no ESLint or Prettier, the no-hex and hooks rules are only partly
  enforced, by tests.
- LOW: TypeScript 7 and `@types/node` 26 exist and were deliberately not taken;
  R3F 9 needs React 19, so upgrade those pairs together or not at all.

## Next justified step

Author the next batch of 84 candidates to reach 300. The tuning was re-read at
216 and no value changed; read it again at 300, and until then the pool is what
decides how fresh the ritual feels.
