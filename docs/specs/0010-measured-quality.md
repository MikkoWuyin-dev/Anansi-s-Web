# 0010. Measured performance and accessibility

**Date**: 2026-10-23
**Status**: Built
**Built**: 2026-10-23

## Summary

Every budget in MCD §8 is measured against the production build, and every
accessibility commitment in MCD §9 is checked against the running app. The
numbers and the audit live here; the findings and their dispositions live in
`docs/reviews/2026-10-23-phase-9.md`.

Six of the eight performance budgets are met. The other two are one cause:
Lighthouse mobile scores 69 to 73 against a target of 75, and the mobile
interaction figure that follows from the same load is over its target, because
the lazy scene's bootup lands inside the four-times-throttled run. The owner
chose to keep the world immediate and record the miss rather than delay the web
on a phone.

The audit found one real defect, the story's heading level, and it is fixed.
The rest of the commitments hold in code and tests; two of them could not be
observed in this environment and are recorded as unverified rather than
guessed.

## Context

MCD §8 sets budgets that are enforced rather than aspirational, measured at
each review. Until this phase they had only ever been sampled while building:
a chunk size after a change, a frame count while the scene was new. The
roadmap's done-when line also asks for a first usable interaction figure,
which no earlier phase had produced.

MCD §9 and PRD §36 make accessibility a first-class requirement rather than an
enhancement, so the audit has to check the product as a person meets it: the
keyboard path, the heading structure, the canvas description, contrast in both
modes, and what a screen reader is handed. The 3D stage may fail without
taking the ritual with it, which is what makes an honest audit possible.

## Requirements

**Acceptance criteria**:

- **AC-1**: Every MCD §8 budget is measured against `npm run build` output and
  the served build, and each result is recorded with its method.
- **AC-2**: A budget that is missed is recorded as missed, with the cause and
  the owner's decision, never rounded into a pass.
- **AC-3**: The idle page draws zero frames, measured by counting real WebGL
  draw calls over a quiet interval.
- **AC-4**: Every state of the ritual has exactly one top level heading, and
  the heading outline never begins at level two.
- **AC-5**: Every interactive control is reachable and operable by keyboard
  alone, including opening and closing the history panel and switching modes.
- **AC-6**: Every interactive control has a visible focus ring whose contrast
  is computed in both modes.
- **AC-7**: The canvas carries a description of the world's state that changes
  with the ritual and never names a title, domain, tag, or difficulty.
- **AC-8**: Text contrast passes in both modes, computed from the stylesheet's
  own token values rather than judged by eye.
- **AC-9**: The reduced-motion branches are covered by tests; what could not be
  emulated in the reviewing environment is named as unverified.
- **AC-10**: Findings are triaged by severity, and the blocking ones are fixed
  or explicitly accepted by the owner.

## Measurement record

Measured 2026-10-23 from the production build (`npm run build`) served by
`npm run preview`, Lighthouse 13, headless Chromium, at 127.0.0.1. The figures
below are from the build the project ships: Vite 8, after the same-day
toolchain upgrade in spec 0012.

| MCD §8 budget | Target | Measured | Verdict |
|---|---|---|---|
| App shell JS, gzip, before the scene | ≤ 250 kB | 62.54 kB | met |
| Scene chunk, gzip, lazy | ≤ 350 kB | 232.08 kB | met |
| Topic bundle, gzip | ≤ 150 kB | 5.6 kB at 120 topics, projected 14.0 kB at 300 | met |
| First usable interaction, mid-range mobile over 4G | ≤ 3.5 s | 1.7 s without the scene chunk; 4.2 to 5.6 s with it (Lighthouse TTI) | missed with the scene counted |
| Idle steady-state GPU | ≈ 0 | 0 draw calls over 2.0 s, before and after the upgrade | met |
| Search-animation frame time, mid-range desktop | ≤ 16 ms | 1.0 ms median render call | met |
| Lighthouse desktop | ≥ 85 | 90 | met |
| Lighthouse mobile | ≥ 75 | 68 to 71 over three runs | missed |

Supporting figures: the built page's largest contentful paint is 1.5 to 2.8 s
(first run of the set was the slow one), first contentful paint 1.4 s, and
total blocking time 2.13 to 2.44 s on mobile; desktop TBT is 260 ms.
Accessibility and SEO scored 100 in every run.

The first pass, before the upgrade, measured shell 62.68 kB, scene 238.81 kB,
desktop 85 and mobile 69 to 73. Chunk sizes moved by under 7 kB and desktop
left its floor; no verdict changed except that one.

Methods, so the numbers can be judged:

- Chunk sizes are Vite's own gzip output. The topic bundle is the compiled
  `src/content/topics.generated.ts`, gzipped, and the 300-topic projection is
  `npm run content:report`'s.
- Idle frames were counted by patching `WebGLRenderingContext.prototype` and
  its WebGL2 equivalent to count `drawElements`, `drawArrays`, and their
  instanced forms, then reading the count after a quiet 2 s.
- Frame time was measured by timing `gl.render` in a development build, not by
  a GPU timer; 1.0 ms is the median over one search beat.
- Lighthouse runs are noisy at this size. Three mobile runs are recorded rather
  than the best one.

### The mobile miss

The gap is the scene's bootup, not the product. With the 232.08 kB scene chunk
blocked, the page scores 99 and is interactive at 1.7 s; with it, the
four-times-throttled CPU spends 2.13 to 2.44 s parsing and compiling a module
that is only needed once the first paint is done.

Three ways to close it were weighed: delay the world behind a second
interaction, omit the world on narrow screens, or ship it as it is and accept
the score. The first changes when the product appears on every phone; the
second removes the product's main idea from the devices where it is most used.
The owner chose the third on 2026-10-23: keep the world immediate, record the
miss. Desktop clears its floor at 90, so the miss is mobile only.

## Decision

Measure, record, fix what blocks, and write down what was not observed. Do not
change the product's behaviour to move a score in this phase; a budget miss
that follows from a deliberate product decision is recorded as the cost of that
decision.

## Built

`npm run verify` → exit 0. Spec 0011 carries the display face's decision, which
removed the last third-party request.

The one fixed defect: the story's title was an `h2`, and the story state has no
other heading, so the outline began at level two. It is now the page's `h1`,
the hero and every honest state keep their single `h1`, and
`src/app/RitualScreen.test.tsx` fails if any state loses it or if the story
title drops back to `h2`.

The audit walked the running build by keyboard at 390 by 844: find, reveal,
take, understood, confirm, learned; the history panel's open and Escape with
focus returned to its control; the mode switch by Enter, with the attribute,
the switch's name, and `theme-color` all following. The canvas description
changed with each state and never carried a title. Light mode measured 15.49:1
for primary text and 5.66:1 for the secondary, with the tokens test computing
the rest in both modes.

Two things could not be observed here: the focus rings, because the preview
webview's page is never the focused window (the styles and their computed
contrast are covered by tests), and every reduced-motion branch, because the
media query cannot be emulated in it. Both are recorded as unverified in the
review.

## Follow-up

- [ ] Re-measure Lighthouse mobile if the scene is ever split or deferred; the
      cause is one chunk and the number should move with it.
- [ ] Observe the focus rings and the reduced-motion branches on a real device,
      which is the only environment that has answered for them so far.
- [ ] Raise the History control's tap target if a phone session shows it is
      missed; it measures 39.9 px against the switch's 44 px.

## References

**Project sources**:
- `docs/MCD.md` §8 (budgets), §9 (accessibility commitments)
- `docs/PRD.md` §35 (sustainable web design), §36 (accessibility), §37
  (responsive design)
- `docs/BUILD_ROADMAP.md` 9.1, 9.2, 9.4; `docs/scope/scope.md` feature 14
- `docs/reviews/2026-10-23-phase-9.md` (the findings this audit produced)
- `src/app/RitualScreen.tsx`, `src/app/RitualScreen.test.tsx`,
  `src/app/tokens.test.ts`, `src/app/WorldLayer.tsx`

**Practices & standards**:
- A budget is a gate; a miss is recorded, never averaged away
- Measure the built product, not the development server
- An audit names what it could not observe instead of inferring it
- One top level heading per page state, at every state
