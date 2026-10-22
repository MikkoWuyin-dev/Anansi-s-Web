# 0006. The light token set

**Date**: 2026-10-20
**Status**: Built
**Built**: 2026-10-20 — roadmap 7.1: the light token set, the surface and action-edge roles, the contrast contract, and the stage re-reading its palette when the mode changes

## Summary

The app is dark because that is the only token set it has. This spec adds the
second one: the same `--anansi-*` names, re-declared for daylight, swapping
under `prefers-color-scheme` so the page, the control, and the web behind it all
change together. The manual sun/moon switch is roadmap 7.2 and gets its own
decisions; this spec only makes light mode exist and be correct.

## Context

Every colour in the running app already resolves through eight custom properties
in one `:root` block, and `src/world/palette.ts` reads those same properties for
the canvas. That was built for this moment: the PRD requires both modes, the MCD
calls both of them token sets, and the stage was written to follow a second set
without a palette of its own.

Two problems remain. The tokens name colours rather than roles — `--anansi-black`
is both the page and the label on the yellow action — so a naive swap paints the
action's text paper-on-yellow. And the stage reads the tokens once at mount, so a
page that changes mode while open would leave the web in the old colours.

The constraint that shapes the rest: dark is the native feel of the world
(MCD §7). Light mode is the second reading of the same design, not a redesign,
and it must not make the world look like a different product.

## Requirements

**User stories**:

- As a person whose system is set to light, I want the page to arrive in light
  mode, so that the ritual does not glare at me before I have read a word.
- As a person who switches their system theme while the page is open, I want
  the page and the web behind it to change together, so that nothing is half
  converted.
- As a person reading in either mode, I want the text, the control, and the
  focus ring to stay legible, so that the mode is a preference rather than a
  penalty.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Light mode is a token set, not a second stylesheet. Both modes define the same `--anansi-*` names, and no rule outside the two token blocks introduces a colour value.
- **AC-2**: The light set activates from `prefers-color-scheme: light`; dark remains what an unexpressed preference gets, and no script is required for the swap. *(Superseded by spec 0007: the set now activates from `<html data-mode>` so a chosen mode can override the system; the values and roles are unchanged.)*
- **AC-3**: A token missing from either set, or a name present in one and absent from the other, fails a test rather than silently inheriting the other mode's value.
- **AC-4**: Text passes 4.5:1 on the page in both modes: `--anansi-ink`, `--anansi-dim`, and the lavender link label, which gains its own readable value because the hue itself is 3.67:1 on the dark page.
- **AC-5**: Controls pass 3:1 in both modes: the focus ring against the page, and the action's boundary against the page, so the filled button is a shape and not only a label.
- **AC-6**: The stage re-reads the tokens when the mode changes, without a reload and without a palette written in JavaScript: one read per mode, shared by the web, the objects, and Anansi.
- **AC-7**: `color-scheme` and the document's `theme-color` follow the mode, so the browser's own chrome and form controls match the page.
- **AC-8**: Yellow stays the single regulated accent in both modes: exactly one rule uses it as a fill, and no text sits on it below 4.5:1.
- **AC-9**: Raw colour values appear only inside the two token blocks; a hex or `rgb()` literal anywhere else in the stylesheet fails a test.

## Options considered

### Option 1: A second stylesheet for light mode

Duplicate the rules and edit the colours. Simple to read, and the two modes
drift apart the first time a component changes.

### Option 2: A class on the document, set by a script

Write the light values under `.light` and toggle it from JavaScript on mount.
Gives full control and a natural home for 7.2's switch, but it makes the first
paint depend on a script and flashes dark before the class lands.

### Option 3: The same token names under a media query

Re-declare the eight names plus the new roles inside
`@media (prefers-color-scheme: light)`. The browser paints the right mode before
any script runs, nothing in the component tree changes, and 7.2's switch can
still override the same names later.

### Option 4: Only `color-scheme`, no light palette

Let the browser restyle form controls and leave the page dark. Cheapest, and a
lie: the PRD requires both modes.

## Decision

**Option 3.** The four palette hues keep their exact PRD values; the two derived
neutrals are re-derived for paper; the page gains a `--anansi-surface` role so
that `--anansi-black` can stay what it already is, the label on the yellow
action. `--anansi-action-edge` is added for the boundary the yellow fill cannot
provide on paper, and `--anansi-lavender-text` for the one place the lavender
hue carries a label.

## Rationale

- The tokens are already the single source of truth for both the DOM and the
  canvas, so a swap is the only mechanism that cannot leave half the product
  behind.
- A media query is the one activation that works before the first paint, with
  no script, no class, and no flash.
- Naming the roles (`surface`, `action-edge`) keeps the palette's exact hues and
  stops a colour name from standing in for two different jobs.
- Contrast is checked by a test rather than by eye, because the light derivation
  is arithmetic and this project has been burned by claims it did not measure.

## Feature design

**The token sets.** Dark is the base block; light re-declares the same names.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--anansi-surface` | `#08090a` | `#f2efe4` | the page itself |
| `--anansi-black` | `#08090a` | `#0d1011` | label on the yellow action |
| `--anansi-jet` | `#19323c` | `#19323c` | borders, structural grounding, the web's far strands |
| `--anansi-yellow` | `#faff00` | `#faff00` | the one accent |
| `--anansi-strawberry` | `#ff3e41` | `#ff3e41` | expressive secondary |
| `--anansi-lavender` | `#885a89` | `#885a89` | expressive secondary, focus ring, decoration |
| `--anansi-lavender-text` | `#a97aa9` | `#885a89` | the lavender link label, lifted to pass as text in dark |
| `--anansi-ink` | `#edf1f1` | `#10191c` | primary text, beads, Anansi's body |
| `--anansi-dim` | `#7e8a90` | `#55605f` | secondary text, far beads |
| `--anansi-yellow-glow` | `rgba(250, 255, 0, 0.7)` | `rgba(25, 50, 60, 0.28)` | the action's shadow, yellow-lit in dark, jet-tinted on paper |
| `--anansi-action-edge` | `transparent` | `#19323c` | the action's outline; nothing in dark, where the fill speaks for itself |

**Measured contrast** (WCAG 2.1 relative luminance, computed by the test):

| Pair | Dark | Light | Needs |
|---|---|---|---|
| ink on surface | 17.51:1 | 15.49:1 | 4.5:1 |
| dim on surface | 5.62:1 | 5.66:1 | 4.5:1 |
| lavender label on surface | 5.74:1 | 4.71:1 | 4.5:1 |
| focus ring on surface | 3.67:1 | 4.71:1 | 3:1 (the ring is not text) |
| action edge on surface | n/a (the fill is 18.38:1 against the page) | 11.67:1 | 3:1 |
| action label on yellow | 18.38:1 | 17.62:1 | 4.5:1 |

The hue itself stays what the palette says; only where lavender carries a label
does a role token take over. That is the one place this task repairs dark mode
as well as adding light, and it is the reason the documented 3.67:1 shortfall in
the teardown closes here rather than being carried forward.

**The stage.** `palette.ts` and its token list are unchanged. `Scene.tsx`
resolves the palette once with the mode as its dependency and passes it to the
web, the objects, and Anansi, so the three components no longer read the
document separately. `WorldLayer.tsx` subscribes to the same media query it
already reads for motion and width, and passes `mode` down. Because `ink` and
`jet` stay dark in both modes and the canvas is transparent over the page, the
web reads correctly on paper with no second palette.

**Activation.** `@media (prefers-color-scheme: light)` holds the light values and
`color-scheme: light`. The base block keeps `color-scheme: dark`. `index.html`
gains a second `theme-color` with `media="(prefers-color-scheme: light)"`.

*Superseded on activation by spec 0007:* the block is selected by
`:root[data-mode='light']`, the pre-paint script sets the attribute, and the one
remaining `theme-color` is written from the resolved surface. The values, the
roles, the contrast contract, and the stage's palette read are as written here.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

- Same names: both blocks declare an identical token set, verifies **AC-1**, **AC-3**.
- Missing token: a block with one name removed throws from the parser, verifies **AC-3**.
- Text contrast: every text pair is at least 4.5:1 in both modes, verifies **AC-4**, **AC-8**.
- Control contrast: the ring and the action's edge are at least 3:1 in both modes, verifies **AC-5**.
- No litter: hex and `rgb()` literals appear only inside the token blocks, verifies **AC-9**.
- Mode reaches the stage: the scene's palette dependency is the mode, and one read serves all three components, verifies **AC-6**.

## Build plan

1. Split the roles: add `--anansi-surface` and `--anansi-action-edge`, point the body and the action at them, and keep dark pixel-identical apart from the transparent edge. Satisfies **AC-1**, **AC-5**.
2. Add the light block and `index.html`'s second `theme-color`. Satisfies **AC-2**, **AC-7**.
3. Add the contrast and token-parity test over the stylesheet's own text. Satisfies **AC-3**, **AC-4**, **AC-5**, **AC-8**, **AC-9**.
4. Resolve the palette in the scene from the mode and thread it to the three components; subscribe to the media query in `WorldLayer`. Satisfies **AC-6**.
5. Check both modes in a browser with the colour scheme emulated, then reconcile the records.

## Consequences

**Positive**:
- The mode is one block of values, and the canvas follows without a second
  palette or a second code path.
- The two new roles remove the ambiguity that made the swap unsafe.
- The contrast contract is executable, so 7.2's switch inherits it.

**Negative / tradeoffs**:
- Three role tokens are added to a palette the MCD lists by hue, so the
  document's token table and the stylesheet must be kept in step.
- The dark link label is now a lifted tint rather than the palette hue, a small
  visual change made for contrast.
- A light mode is a second set of visual judgements to maintain, and the
  objects and strands were tuned against dark.

**Neutral**:
- Dark remains the default and the native feel; nothing about the ritual, the
  engine, or the state layer changes.

## Follow-up

- [ ] Roadmap 7.2 adds the sun and moon switch: a manual choice that persists and
      overrides the media query, keyboard operable, reduced-motion safe.
- [ ] The stage's colours are judged live in light mode against real screenshots,
      and the object tones are tuned if paper changes how they read.
- [ ] Roadmap 7.3 imprints both token sets into `ui-registry.md`.

## References

**Project sources**:
- `docs/PRD.md` §33 (light and dark modes), §34 (the palette), §35 (sustainable design), §36 (accessibility)
- `docs/MCD.md` §7 (design system and tokens), §9 (accessibility commitments)
- `docs/BUILD_ROADMAP.md` §7.1, `docs/scope/scope.md` feature 12
- `docs/specs/0005-the-3d-stage.md` (the palette reader this extends)
- `src/app/styles.css` (the token block), `src/world/palette.ts` (the reader)

**Practices & standards**:
- WCAG 2.1 contrast minimums (1.4.3 for text, 1.4.11 for non-text contrast)
- Token-set theming: one set of role names, swapped by preference
- `prefers-color-scheme` for the first paint, not a script
