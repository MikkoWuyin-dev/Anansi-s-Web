# 0012. Toolchain currency

**Date**: 2026-10-23
**Status**: Built
**Built**: 2026-10-23

## Summary

The build and test toolchain moved from Vite 5 and Vitest 2 to Vite 8,
Vitest 5, and plugin-react 6. The six development advisories npm reported are
gone, the whole suite is green on the new majors, and the production build got
slightly smaller.

The Node floor rose from 22.6 to 22.12, because Vitest 5 requires it. CI
already runs 24.x.

This is also where Phase 10's failure half was proved: each step of the gate
was broken in turn and each one failed it, without a red commit on `main`.

## Context

`npm audit` reported six advisories, all in development dependencies and all
closed only by major upgrades: two critical in tinypool (reached through
Vitest 2), one high and two more in Vitest's mock and worker paths, and two
moderate in esbuild (reached through Vite 5's development server). The fixes
npm offered were Vitest 5.0.5 and Vite 8.3.5.

None of them touches the shipped static build: the esbuild issue is the *dev
server* accepting cross-origin requests, and the tinypool issues need control
of worker options inside a test run. Their practical reach is a developer
machine, not a reader of the site. That is why the other defensible answer,
deferring with the reasoning written down, was on the table. The owner chose
to upgrade now, before deploying, rather than ship on a toolchain with a known
critical advisory.

## Requirements

**Acceptance criteria**:

- **AC-1**: `npm audit` reports zero vulnerabilities after the change.
- **AC-2**: The suite stays at its full count and every test still asserts what
  it asserted; no test is relaxed to fit a new tool.
- **AC-3**: Typecheck, content check, docs check and the production build all
  pass, and the build stays inside the MCD §8 budgets.
- **AC-4**: The Node floor is declared once in `package.json`, named in
  `AGENTS.md`, and explained where CI sets it.
- **AC-5**: A clean `npm ci` from the committed lockfile reproduces the green
  suite, so CI and a fresh machine resolve the same tree.
- **AC-6**: The failure half of the gate is proved for every step: a type
  error, an invalid topic, a failing test and status drift each make the gate
  exit non-zero.
- **AC-7**: The production build still runs the ritual: a search resolves, the
  reveal and the live region update, the canvas describes the state, and an
  idle page draws zero frames.

## Decision

Upgrade to Vite 8.3.5, Vitest 5.0.5 and `@vitejs/plugin-react` 6.1.2 in one
step, regenerate the lockfile, and raise the Node floor to 22.12. Do it before
the deploy so the site ships on the supported toolchain.

## What changed

| Piece | Before | After |
|---|---|---|
| `vite` | 5.4.21 | 8.3.5 |
| `vitest` | 2.1.9 | 5.0.5 |
| `@vitejs/plugin-react` | 4.7.0 | 6.1.2 |
| `engines.node` | `>=22.6.0` | `>=22.12.0` |
| Advisories | 6 (2 critical, 1 high, 3 moderate) | 0 |

Three source changes were needed:

- `vite.config.ts` imports `defineConfig` from `vitest/config` rather than
  `vite`, because Vitest 5 no longer augments Vite's `UserConfig` with `test`.
- The lockfile was regenerated. npm could not reconcile plugin-react 6 against
  the old tree's plugin-react 4, so the lock was rebuilt from `package.json`
  and the result verified with a clean `npm ci`.
- The 365-day statistical simulation was given an explicit twenty second
  timeout. Its first run under Vitest 5 took 4.93 s against the new five second
  default and failed as flaky; the assertions and the simulated span are
  unchanged. Only the tool's default was too tight.

`.github/workflows/verify.yml` still runs Node 24.x and now says 22.12 as the
floor; `AGENTS.md` names the same floor.

## Results

- `npm audit` → **0 vulnerabilities**.
- `npm run verify` → exit 0: typecheck, content check, the whole suite,
  docs check, build.
- Build: shell **62.54 kB** gzip (was 62.68), scene **232.08 kB** (was
  238.81), CSS 3.04 kB. Both chunk budgets still hold with room.
- Lighthouse 13 against the new build: desktop **90** (was 85), mobile **68**
  (was 69 to 73), accessibility and SEO **100** both. The mobile budget is
  still the accepted miss; the scene chunk remains its cause.
- A clean install (`npm ci`) reproduced the green suite.
- The built page was exercised: a fresh search resolved to a story, the live
  region and the canvas description updated, the self-hosted font loaded, and
  an idle page drew **0** draw calls over 2 s.

## The failure half (10.1)

Each probe was injected into the working tree, the gate was run, and the probe
was removed. No commit was made and `main` stayed green.

| Probe | Step that caught it | Exit |
|---|---|---|
| `export const broken: number = 'not a number'` | the whole gate, at typecheck | 2 |
| a topic with `domain: "not-a-domain"` | `content:check`, naming the file and the allowed domains | 1 |
| a test asserting `1 === 2` | `test`, naming the file and the test | 1 |
| a spec's `**Status**: Built` flipped to `In Progress` | `docs:check`, naming the spec's Built line | 1 |
| none (clean tree) | the whole gate | 0 |

The remote half was already delivered: the workflow runs the same command on
every push and pull request, and its first run was green. What was missing was
evidence that a broken tree is actually stopped, which is now recorded above
rather than asserted.

## Follow-up

- [ ] Vite 8 builds with Rolldown. Watch the chunk split on the next feature
      that adds a large module; the reported sizes above are the new baseline.
- [ ] TypeScript 7 and `@types/node` 26 are available and are *not* part of
      this change. Upgrade them only with a reason and the suite green.
- [ ] Re-check the twenty second timeout if the statistical suite grows; it is
      a ceiling for a slow machine, not a target.

## References

**Project sources**:
- `docs/BUILD_ROADMAP.md` 10.1, 10.2; `docs/scope/scope.md` feature 16
- `docs/specs/0010-measured-quality.md` (the budgets and the mobile miss)
- `package.json`, `vite.config.ts`, `.github/workflows/verify.yml`,
  `src/engine/offer.statistical.test.ts`

**Practices & standards**:
- A tool default is not a product contract; raise it explicitly and say why
- Prove the gate fails, not just that it passes
- Upgrade the pair that depends on each other together
