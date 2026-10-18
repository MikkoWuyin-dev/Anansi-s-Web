# Session memory

Handoff for the next agent. Read `AGENTS.md` and `KNOWLEDGE INDEX.md` first; this file records
working state, not requirements.

## Where the project is

Phase 5 (history and progress) was designed and built on 2026-10-18, after Phase 4 (the ritual
loop). The product is now legible as well as usable: ask for a story, take it, mark it learned,
and open the history drawer to find the last thirty days listed by day with a quiet `N / 90`
beside them.

- Spec: `docs/specs/0004-history-drawer-and-journey-count.md` (`In Progress`; scope feature 7 is
  `in-progress` with it linked, and feature 5's counter milestone is ticked).
- Code: `src/app/history.ts` (the drawer's pure view), `src/app/HistoryPanel.tsx` (its markup),
  `src/app/App.tsx` (the corner control, the open state, the query, and the filter).
- Tests: 25 new, so `src/app/` holds 56 and the suite 215 across 17 files.
- Records: `ui-registry.md` gained the history control, the panel, the filter row, and the count;
  the roadmap's Phase 5 is complete with 5.3 deferred; MCD §13 and the teardown are at v3.1.

## Decisions that a reader cannot infer from the code alone

- The drawer is an inline disclosure, not a dialog. It stays in the document with `hidden` so
  `aria-controls` resolves, and it needs no focus trap. Opening focuses the heading, Escape closes
  and returns focus to the control.
- The filters partition the log: All, Explored meaning not yet learned, Learned. This is a
  deliberate departure from the broad meaning of explored, made because All and Explored would
  otherwise show the same list.
- The `hidden` panel and `preventDefault` on Escape exist for two separate browser behaviours:
  `aria-controls` must resolve, and a `type="search"` input treats Escape as its own clear, which
  was silently emptying the query on close until it was fixed.
- Search folds case and accents (`normalize('NFD')` plus stripping combining marks) and matches
  the ISO day key, the written date from the browser locale, and the Today or Yesterday label.
  The written form is locale dependent, so the browser pass typed the form the browser writes.
- A record whose topic has left the library is dropped rather than titled with its id. The count
  still includes its day, so the list and the count can disagree after thirty days; that is
  recorded in the spec as a Follow-up.
- Do not give a grid item `width: 100%` together with a left margin: the panel ran past the
  viewport and clipped its own Close control until the width was removed.

## Verified on 2026-10-18

- `npm run verify` → exit 0 (215 tests in 17 files; content and documentation checks clean;
  build; shell JS 171.75 kB, 55.19 kB gzip against the 250 kB budget).
- Browser pass by keyboard on the dev server: the panel opened with the heading focused and
  closed on Escape with focus returned, the filter partition, `THÉSEUS` finding "The Ship of
  Theseus", the ISO and locale written dates finding the day, the clear control, the query
  surviving an Escape close, a live history rewrite from another tab updating the open panel, and
  no `domain`, `difficulty`, or `tag` in the DOM.
- Four mutation probes in `src/app/history.ts` (opening Explored to learned rows, titling a
  missing topic with its id, removing accent folding, showing the count at zero) each failed the
  suite and were reverted byte for byte.

## Not verified, and why

The drawer's reduced motion path was not reproduced in a live session, because the panel carries
no entrance animation, so there is nothing for the media query to switch off; the markup test is
what holds that. The midnight rollover while the drawer is open was not reproduced either (it
needs a changed clock), though a store write was. The older R15 paths (resurfaced treatment,
empty and failed states, blocked storage, the loop's reduced motion) are still tests only.

## Next justified action

Phase 6, the 3D world: the canvas, the web graph, the authored camera, the object families,
Anansi, the search choreography, the density mapping, and the reduced motion and mobile tier.
It replaces the 900 ms pause and must keep the controller boundary. The library also needs to
grow from 24 to 300 topics before the optional domain filter (roadmap 5.3) is worth building.
No approval gate is open; nothing is pushed beyond the commit that records this work.
