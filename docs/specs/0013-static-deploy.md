# 0013. Static deploy

**Date**: 2026-10-23
**Status**: In Progress

## Summary

The deploy is prepared and deliberately not published: the build, the Worker
entry, the deploy manifest and the analytics decision are in place, the kit
has been served by workerd locally, and the publishing step waits for the
owner's word.

The site is served as static assets by a Worker that does nothing but hand
every request to them. There is no API, no session, no cookie, no third-party
script and no analytics. A visit fetches the page, its two bundles, the font
and the icon, all from the deployment's own origin.

## Context

The product is a static, accountless, local-first single page (PRD §1, MCD
§2). Everything a person's journey needs lives in their own storage; the site
serves files. That shape is what makes the deploy small: there is nothing to
migrate, nothing to secure beyond transport, and no server-side state to
personalise.

The roadmap's 10.4 also asks for the analytics decision to be ratified before
deploy. Analytics is the one thing that could quietly break the product's
promise: a third-party script would add a network request, a cookie surface,
and a company in the path of a page whose whole idea is local independence.

## Requirements

**Acceptance criteria**:

- **AC-1**: The built site is published at one stable HTTPS URL and serves the
  ritual from the deployment's own origin.
- **AC-2**: A visit makes no request to a third party: no font host, no
  analytics, no tag manager, no CDN the project does not control.
- **AC-3**: There is no authentication of any kind, and no route or asset that
  implies an account.
- **AC-4**: The MCD §8 budgets hold on the live host, measured there rather
  than assumed from the local build.
- **AC-5**: The Workers runtime serves the page, the hashed assets, the
  self-hosted font, and `robots.txt`, and answers an unknown path with a 404.
- **AC-6**: Publishing is a deliberate act: a prepared deploy does not go live
  by itself, and the owner is told what is about to be public before it is.

## Decision

**Host: Freebuff Sites**, because it serves a prebuilt static tree with an
isolated preview and production environment and needs no server of our own.
**Analytics: none for v1.** A later decision may add a privacy-friendly,
cookieless provider; nothing in the architecture has to change for it, which
is why it can wait.

The reason to record "none" rather than leave it blank is that the default
must be a decision. The product's privacy posture is not an accident of having
forgotten a script tag.

## The kit

| File | What it is |
|---|---|
| `deploy/worker.js` | the whole server: `env.ASSETS.fetch(request)` |
| `sites.manifest.json` | entrypoint, module, compatibility date, `./dist` as the asset directory |
| `./dist` | the built site; generated, never committed |

### Exercised locally, not hosted

The built `dist/` was served by Wrangler 4.152 on workerd at 127.0.0.1:8787,
with a temporary config that named `deploy/worker.js`, the same compatibility
date, the same asset directory, and `"binding": "ASSETS"`. The config was
removed after the probe.

| Request | Answer |
|---|---|
| `/` | 200, `text/html`, 2,053 bytes |
| `/robots.txt` | 200, `text/plain` |
| `/fonts/space-grotesk-latin.woff2` | 200, `font/woff2`, 22,288 bytes |
| `/fonts/OFL.txt` | 200, `text/plain` |
| `/assets/index-*.js` | 200, `text/javascript` |
| `/index.html` | 307 to `/` |
| `/nope`, `/assets/nope.js` | 404, empty body |

The binding matters: without it in a local config, `env.ASSETS` is undefined
and every path that is not an existing asset answers 500 with a stack trace.
The hosted environment injects it, which is why the Worker is written as the
one line it is.

Local headers are the development server's, not the host's: both the hashed
asset and the font came back `public, max-age=0, must-revalidate`. What the
host actually sends for the font and for the hashed names is a publish-time
check, not something this probe establishes.

Steps to publish, once approved:

1. `npm ci && npm run verify` on the commit to ship.
2. `npm run build`, which writes `dist/`.
3. Create the site, deploy the manifest to **preview** first, and open it.
4. Check the preview: the ritual runs, the font loads from the same origin,
   the network log has no third-party request, an unknown path answers 404,
   and the accessibility pass from spec 0010 still holds.
5. Publish **production** only after that, then run Lighthouse against the
   live URL and record the figures beside spec 0010's.

The manifest's compatibility date is the day the kit was written. Refresh it at
publish, since the runtime's date should not be older than the code it runs.

## What remains

- Create the site and publish the preview.
- Verify AC-1 to AC-5 on the live URL and record the results.
- Measure the production budgets there, including the font's real transfer and
  the cache headers on the font and the hashed assets, and reconcile spec 0010
  if the host's numbers differ.
- Record AC-5's answers from the live origin rather than from the local probe.
- Decide the production publication itself, which is the owner's act.

## Follow-up

- [ ] Revisit analytics only if the owner wants usage insight; if it is added,
      it must be cookieless, first-party if possible, and on the MCD §12 list.
- [ ] Consider a custom domain once the site has been live for a while; the
      deploy does not need one.
- [ ] Re-check that `dist/` is never committed after the first deploy.

## References

**Project sources**:
- `docs/PRD.md` §1 (what this is), §24 (accounts deferred), §34 to §38
- `docs/MCD.md` §2 (static, local-first), §8 (budgets), §12 (the accounts era)
- `docs/BUILD_ROADMAP.md` 10.4; `docs/scope/scope.md` feature 17
- `deploy/worker.js`, `sites.manifest.json`, `docs/specs/0010-measured-quality.md`

**Practices & standards**:
- Publish only on an explicit instruction
- A static product should be served statically
- An absence that matters is recorded as a decision
