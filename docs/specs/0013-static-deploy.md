# 0013. Static deploy

**Date**: 2026-10-23
**Status**: Built
**Built**: 2026-10-23 — the site is live at `https://anansis-web.pxxl.click/`, served static, with two deviations recorded below. Re-published 2026-10-24 with the 300-topic build; both deviations stand.

## Summary

The site is live at `https://anansis-web.pxxl.click/`, published by the owner
on 2026-10-23 from the build recorded in spec 0010. The first check of the
live origin found the host injecting its own analytics beacon into the page,
which the code does not contain and which contradicts the analytics decision
below. The owner chose to leave that as it is for now; it is recorded as a
deviation rather than closed, since the page a reader gets is not quite the
page this repository ships.

The kit was prepared before publishing: the build, the Worker entry, the
deploy manifest and the analytics decision, all served by workerd locally
first.

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

**Host: a static host that serves a prebuilt tree.** The kit was prepared for
Freebuff Sites, which serves a prebuilt static tree with isolated preview and
production environments and needs no server of our own; the owner published
instead on their own Cloudflare-served domain, `anansis-web.pxxl.click`. The
Worker and the manifest stayed as prepared, and the host's own routing and
headers are what the live check above found.
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

The built output directory was served by Wrangler 4.152 on workerd at 127.0.0.1:8787,
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
2. `npm run build`, which writes the generated output directory.
3. Create the site, deploy the manifest to **preview** first, and open it.
4. Check the preview: the ritual runs, the font loads from the same origin,
   the network log has no third-party request, an unknown path answers 404,
   and the accessibility pass from spec 0010 still holds.
5. Publish **production** only after that, then run Lighthouse against the
   live URL and record the figures beside spec 0010's.

The manifest's compatibility date is the day the kit was written. Refresh it at
publish, since the runtime's date should not be older than the code it runs.

## Live check, 2026-10-23

Checked against `https://anansis-web.pxxl.click/` with curl and a real browser
session, and measured with Lighthouse 13 (headless Chromium) at desktop and
mobile presets.

**Serving.** The page, `robots.txt`, the font, its licence and the hashed
bundles all answer 200 with the right content types. The font is `font/woff2`,
22,288 bytes, so the display face loads. The hashed assets and the font are
`public, max-age=31536000, immutable`; the HTML is `max-age=3600,
stale-while-revalidate=86400`. HSTS and `x-content-type-options: nosniff` are
present. A missing asset answers 404 with the host's error page.

**Unknown paths answer 200 with the ritual**, not 404: the host applies a
single-page fallback, so `/nope`, `/login`, `/api` and any deep path all serve
`index.html`. That is good for a mistyped bookmark and wrong for AC-5 as
written; no route implies an account, so AC-3 still holds.

**No authentication**: there is no session, no cookie (the page sets none), no
sign-in route, and no account asset anywhere in the bundle.

**Lighthouse 13, live origin.** Desktop: performance **89**, accessibility
**100**, SEO **100**, best practices **100**; FCP 0.6 s, LCP 0.7 s, TBT 250 ms,
TTI 1.3 s. Mobile, two runs: performance **66 and 70**, accessibility and SEO
**100**; FCP 1.7 s both runs, LCP 3.1 s and 2.0 s, TBT 1.65 s and 2.03 s, TTI
4.3 s and 5.5 s. Desktop clears its floor on the host; mobile repeats the
accepted miss and the same cause, the scene chunk's parse inside the throttled
load.

**The ritual itself works live.** A search resolved to a title with no
definition, the status region announced it, and the day ran find → take →
understood → confirm → learned with the tallies at 1 / 1 / 1, the learned
tally at 1, and the story stored under `anansi:v1:*`. Focus falling to `body`
after the confirm is the known LOW finding, reproduced.

### The host injects analytics (open)

A page load in a browser requests
`https://static.cloudflareinsights.com/beacon.min.js/...` and posts to
`/cdn-cgi/rum`. The tag is not in the build: the built index file contains no
reference to it, and the host adds it to the HTML response only for requests
whose `Accept` header asks for HTML, which is why a plain `curl` misses it.

This breaks AC-2 (no third-party request) and contradicts the ratified "no
analytics for v1" without anyone choosing it. Cloudflare Web Analytics is
cookieless and reports to the owner's Cloudflare account through the same
origin, so it is the mildest version of the thing the decision refused; it is
still a third-party script and still telemetry. Turning it off is a host
setting, not a change to this repository: Analytics, then Web Analytics, then
remove or disable the site's entry for the zone.

The owner decided on 2026-10-23 to leave this as it is for now and move on, so
the beacon stays until someone revisits it. It is the mildest form of the
thing the decision refused and it is not hidden; it is simply tolerated, which
is a different thing from being chosen.

## Live check, 2026-10-24 (the 300-topic build)

After Phase 1 closed at 300 topics, the owner published that build. The site
now serves the freshly hashed shell bundle `/assets/index-*.js` (hash
`Bfvzwxqm`), 241,708 bytes, byte for byte the local build: 300 titles across
24 domains, CSS 12,039 bytes, the font
still 22,288 bytes as `font/woff2`, `robots.txt` and the font licence 200.
The HTML's `last-modified` is 16:54:04Z and the response carries
`x-pxxl-deployment-id: dep_v917nwye9vcwdm81xxb9p`.

**Serving.** Hashed assets and the font are `public, max-age=31536000,
immutable`; the HTML is `max-age=3600, stale-while-revalidate=86400` with HSTS
and `x-content-type-options: nosniff`. One thing moved since 2026-10-23:
`/index.html` now answers 200 rather than 307 to `/`. `/nope` and `/login`
still answer 200 with the ritual (AC-5, accepted), and a missing asset answers
404 with the host's own 7,199-byte error page.

**The ritual works.** From cleared storage: find → reroll → reroll → the third
story sealed with *"This is today's story. It stays until midnight."* → take →
understood → learned, the count at `1 of 90 days`, and the history drawer
showing three stories as All 3, Explored 2, Learned 1. The third story came
from the new batch (*Why a Fireplace Sits in the Middle of an Old House*), so
the live pool is the one this repository ships. At 390 by 844 there is no
horizontal scroll, Space Grotesk loads from the same origin, the mode switch is
44 by 44, and the History control is 40 px tall — the known LOW, reproduced.

**Lighthouse 13.5 on the live origin.** Desktop, three runs: **80, 92, 96**
(median 92); FCP 0.6 s, LCP 0.6 to 1.4 s, TBT 140 to 300 ms, TTI 1.0 to 1.4 s.
The 80 was the first, cold run. Mobile, two runs: **70 and 71**; FCP 1.8 s, LCP
1.8 to 2.0 s, TBT 1.67 to 1.78 s, TTI 4.1 to 4.3 s. Accessibility, best
practices and SEO scored 100 in every run. Desktop clears its floor, mobile
keeps the accepted miss and the same cause.

**The beacon is still there.** A navigation request gets 2,420 bytes of HTML
where the build's own file is 2,053: the host still injects the Cloudflare Web
Analytics tag, which a `curl` without navigation headers does not see. AC-2 is
still not met, and the disposition below is unchanged.

## Deviations

Two acceptance criteria are not met as written. Both are the host's behaviour,
not the code's, and both are accepted by the owner rather than fixed:

| AC | As written | What the host does | Disposition |
|---|---|---|---|
| AC-2 | no request to a third party | injects Cloudflare's Web Analytics beacon and posts to `/cdn-cgi/rum` | accepted for now by the owner, 2026-10-23; open to revisit |
| AC-5 | unknown paths answer 404 | answers 200 with `index.html` (single-page fallback) | accepted: there are no routes to protect, and a mistyped URL lands on the ritual instead of a blank page |

The analytics decision itself is unchanged: the project adds no analytics. What
changed is that the host adds some, and the record says so instead of calling
the criterion met.

## What remains

- Revisit the beacon when the owner wants the page to match the decision
  exactly; removing it is a host setting, not a change to this repository.
- Observe the 3D scene on a machine with a working GPU: in the review browser
  the scene never mounted and the DOM description carried the page, which is
  the designed fallback and not evidence that the canvas draws.
- Count idle frames on the host; only the local build has been counted.

## Follow-up

- [ ] Revisit analytics only if the owner wants usage insight; if it is added,
      it must be cookieless, first-party if possible, and on the MCD §12 list.
      The host's beacon is already that shape, which is why it was tolerated.
- [ ] Decide whether a custom domain is wanted; `localStorage` is per origin, so
      moving later leaves every reader's journey on the old hostname.
- [ ] Re-check that the build output is never committed after the first deploy.

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
