# 0011. The display face and its network cost

**Date**: 2026-10-23
**Status**: Built
**Built**: 2026-10-23

## Summary

Space Grotesk is now served from this origin. The page asks no third party for
anything: one latin variable font file, 22 kB, preloaded before the stylesheet
is parsed, with its licence beside it.

The choice is self-host rather than accept the request. The old link cost two
preconnects and a stylesheet from one origin and a font from another, on every
visit, and made the display face of a product about quiet independence
dependent on somebody else's availability and privacy posture.

## Context

The product's own most-repeated principle is that the illusion of complexity
must not cost unnecessary computation or network (PRD §35). The display face
was the only thing on the page fetched from another origin, and it was there
by accident: the first UI build reached for the familiar Google Fonts link.

MCD §7 leaves the exact faces to the first UI build and the registry. The
registry already names Space Grotesk as the family, so the type choice itself
is settled; only its delivery was open.

## Requirements

**Acceptance criteria**:

- **AC-1**: The built page makes no request to any origin but its own.
- **AC-2**: The display face renders before the first heading is painted, or
  swaps in without a layout shift.
- **AC-3**: The font file is licensed, and its licence ships with it.
- **AC-4**: Only the subset the interface needs is shipped; the page's
  language is English and the face carries one weight axis.
- **AC-5**: Removing the font returns the page to the system sans stack with no
  other change, so the face is an enhancement rather than a dependency.
- **AC-6**: The decision and its cost are recorded; a later review can see why
  the request left and what it cost to remove.

## Options considered

### Option 1: Self-host the latin variable subset

One `woff2` in `public/fonts/`, an `@font-face` rule at the top of
`styles.css`, and a `<link rel="preload">` in `index.html`. The subtree the
interface actually uses is the latin one, and the variable file carries 300 to
700 in a single file, so the cost is one 22 kB request that the page would have
made anyway.

### Option 2: Keep the Google Fonts link

Zero maintenance and the same visual result, at the cost of two preconnects, a
third-party stylesheet before the font, and a request to a company the product
has no other relationship with. It also puts the display face's availability
outside this project's control.

### Option 3: Use the system sans stack

Free and instant, but it gives up the geometric character the whole visual
identity is built on, and the registry would have to be rewritten around a
different face on every platform.

## Decision

**Option 1.** Self-host the latin variable subset, preload it, and ship the
licence with it. Option 3 is kept as the fallback in the font stack, which is
what makes **AC-5** true.

## Built

`public/fonts/space-grotesk-latin.woff2` (22,288 bytes) and
`public/fonts/OFL.txt` are copied unchanged by Vite. `src/app/styles.css`
declares the face once, with `font-display: swap` and the latin unicode range
from Google's own subset. `index.html` preloads the file with `as="font"` and
`crossorigin`, which matches the CORS fetch the stylesheet makes, and the two
Google preconnects and the stylesheet link are gone.

Verified against the built page: `document.fonts` reports the face `loaded`
with the `300 700` axis, the computed family on the story title is Space
Grotesk, and the network log for a fresh visit contains only same-origin
requests.

`public/robots.txt` was added in the same pass. It is not part of the font
decision: Lighthouse's `robots-txt` audit fails on a page whose host answers
`/robots.txt` with a 404, and this one now allows the whole site.

## Follow-up

- [ ] Measure the font's own transfer on a cold cache in Phase 10's deploy,
      where the real host's compression and caching headers apply.

## References

**Project sources**:
- `docs/PRD.md` §35 (sustainable web design)
- `docs/MCD.md` §7 (typography), §8 (budgets)
- `docs/BUILD_ROADMAP.md` 9.3; `docs/scope/scope.md` feature 15
- `ui-registry.md` (the typography row)
- `index.html`, `src/app/styles.css`, `public/fonts/space-grotesk-latin.woff2`

**Practices & standards**:
- Ship the subset, not the family
- A preload must match the fetch mode of the resource, including CORS
- A licence travels with the file it covers
