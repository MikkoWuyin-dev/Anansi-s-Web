# memory.md: where we are

Overwrite this file at the end of each task; don't append to it. 80 lines at most (`npm run docs:check`).
Durable knowledge goes to the document that owns it (see `AGENTS.md`), and the history goes in `git log`.

Updated: 2026-10-23, after Phase 10.1 to 10.3 and the prepared deploy.

## Now

- Phases 0 and 2 to 9 are built. Phase 1 is in progress at 120 of 300 reviewed
  topics. Phase 10 is **in progress**: 10.1 to 10.3 are built, 10.4 is prepared
  and deliberately not published.
- The owner chose Freebuff Sites as the host and ratified **no analytics for
  v1**. Publishing waits for an explicit instruction.
- Deploy kit: `deploy/worker.js` (only `env.ASSETS.fetch`),
  `sites.manifest.json` over the `npm run build` output, and spec
  `docs/specs/0013-static-deploy.md`. Proved on workerd, never hosted.
- Next is publishing that deploy, then Phase 11, accounts, which is deferred.

## Last done

- 10.1: proved the failure half of the gate for every step, locally, without a
  red commit: type error → gate exit 2; bad topic → `content:check` exit 1;
  failing test → `test` exit 1; flipped spec status → `docs:check` exit 1; clean
  tree → 0. The workflow already runs the same command on every push.
- 10.2: upgraded Vite 5.4 → 8.3.5, Vitest 2.1 → 5.0.5, plugin-react 4.7 → 6.1.2,
  Node floor 22.6 → 22.12; `npm audit` is zero. `vite.config.ts` imports
  `defineConfig` from `vitest/config`, and `npm ci` reproduced the suite. The
  365-day simulation got an explicit 20 s timeout after flaking at 4.93 s
  against Vitest 5's 5 s default.
- 10.3: `AGENTS.md` and `memory.md` are current, tracked, and every path and
  script they name resolves.
- 10.4 prepared: spec 0013, the Worker, the manifest, and the analytics decision.
  Wrangler 4.152 served the build on workerd locally: page, robots, font, OFL
  and assets 200, `/index.html` 307 to `/`, unknown paths 404, and the asset
  binding present only when the local config declares it. Nothing is hosted.

## Current numbers (post-upgrade)

- Build: shell 62.54 kB gzip, scene 232.08 kB, CSS 3.04 kB, topic bundle 5.6 kB.
- Lighthouse 13: desktop 90 performance, mobile 68 to 71, accessibility and SEO
  100. Mobile is still the accepted miss; its cause is the scene chunk's parse
  inside the throttled load (TTI 4.2 to 5.6 s; 1.7 s with that chunk blocked).
- Idle page: 0 draw calls over 2 s, re-checked on the upgraded build.
- Tests: 360 in 34 files. `npm run verify` exits 0.

## What is not true

- The deploy kit has never been run against a host. The local workerd probe
  proves routing and 404s, not the host's cache headers or origin behaviour.
- Focus rings have never been seen rendered (the preview page is never focused,
  so `:focus-visible` cannot match), reduced motion has never been observed
  running, and the 3D beats have not been seen as pictures here.
- Frame time is a CPU figure inside `gl.render`, not a GPU timer.
- Light mode hasn't been judged on a real phone or in daylight.
- No broken commit has been seen to fail CI on the remote.

## Open risks

- MEDIUM: Vite 8 builds with Rolldown, so chunking is new. The sizes above are
  the baseline; watch the split when a large module is added.
- MEDIUM: topic quality is guarded by human review, and the validator checks
  shape, not substance. The pool is 120 of 300.
- MEDIUM: several stage paths rest on code and tests, not a live session; the
  first deploy is the first real-browser look.
- LOW: the mobile Lighthouse budget is missed by an accepted decision; desktop
  is now 90, so only mobile carries it.
- LOW: the History control is 39.9 px tall at 390 px, against the mode switch's 44.
- LOW: after marking a story learned, focus falls to `body` (the confirm block
  unmounts); the live region still says so.
- LOW: the word is undiscoverable except by knowing his name, which is intended;
  and with no ESLint or Prettier, the no-hex and hooks rules are only partly
  enforced, by tests.
- LOW: TypeScript 7 and `@types/node` 26 exist and were deliberately not taken;
  R3F 9 needs React 19, so upgrade those pairs together or not at all.

## Next justified step

Publish spec 0013's deploy when the owner asks: verify on a preview first, then
production, then measure the budgets there and reconcile spec 0010.
