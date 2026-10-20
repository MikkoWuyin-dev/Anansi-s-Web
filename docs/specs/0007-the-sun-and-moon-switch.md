# 0007. The sun and moon switch

**Date**: 2026-10-20
**Status**: Built
**Built**: 2026-10-20

## Summary

Light mode follows the operating system and nothing else. This spec adds the
switch: a small sun that becomes a moon in the control cluster the history
button already lives in, keyboard operable, remembered across reloads, and
still and instant under `prefers-reduced-motion`. It also moves the mode onto
an attribute set before the first paint, because a stored choice has to beat
the system preference without flashing the wrong page.

## Context

Spec 0006 made the tokens two sets and put the second one under
`@media (prefers-color-scheme: light)`. That was the right answer while the
system was the only authority: it needs no script and paints correctly on the
first frame. A manual choice breaks both of those properties. A media query
cannot be overridden by a click, and a choice read after React mounts would
paint the system's mode first and flip a moment later.

The rest of the product already has the pieces: the state layer owns storage
through an adapter and validates every stored value; the world takes its mode
as a prop and re-reads the palette when it changes; the control cluster in the
top right holds one button and has room for a second. What is missing is the
preference itself, the switch, and an activation path that can express "this
person chose" as well as "the system prefers".

The constraint that shapes the design: the ritual is a static, accountless,
local-first page. The preference belongs in local storage beside the journey,
must survive a refused or full storage, and must never be the reason the
ritual cannot start.

## Requirements

**User stories**:

- As a person who prefers daylight on a dark laptop, I want to choose light
  once, so that every visit arrives in it.
- As a person who chose light and reloads, I want the page to arrive already
  light, so that I never see the dark page flash first.
- As a keyboard user, I want to reach the switch with Tab and change it with
  Enter or Space, so that the mode is not mouse-only.
- As a person who asked for less motion, I want the change to be instant, so
  that the switch does not animate at me.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: One visible switch, a native button, keyboard operable with the page's existing focus ring, at least 44 × 44 px, whose accessible name says which mode it moves to.
- **AC-2**: Activating it changes the mode at once, in the DOM and in the canvas, without a reload and without remounting the scene.
- **AC-3**: An explicit choice is stored under `anansi:v1:mode` as `{version: 1, choice}` and survives reload; an absent, malformed, or unknown value falls back to the system preference, and a storage that refuses writes never blocks the ritual.
- **AC-4**: With no stored choice, the system preference decides at load, and a change to it while the page is open is followed.
- **AC-5**: The stored choice is applied before the first paint, so a reload never shows the other mode first.
- **AC-6**: Under `prefers-reduced-motion: reduce`, the change is instant, the glyph does not animate, and the outcome is identical.
- **AC-7**: The switch takes its colours only from tokens; the token blocks remain the only place a raw colour appears.
- **AC-8**: The switch never covers the hero, the action, or the history button at the phone and desktop widths the layout supports.
- **AC-9**: The switch writes nothing but the mode key and carries no topic data.

## Options considered

### Option 1: Keep the media query and add override blocks

Add `[data-mode='light']` and `[data-mode='dark']` copies of the token sets
beside the media query. No script is needed for the system path, but the light
set is written out twice and the two copies can drift; the reload of an
explicit choice still flashes unless a script runs first anyway.

### Option 2: A pre-paint attribute, set from storage or the system

`<html data-mode="light|dark">` is the only thing the CSS reads. A small inline
script in the head resolves the stored choice or the system preference and
sets it before the first paint; React reads the same storage and keeps the
attribute in step. One token set per mode, no flash, and the CSS has a single
mechanism to reason about.

### Option 3: Inline custom properties written from JavaScript

Set every token on `documentElement.style` from a JavaScript palette. Full
control and no script ordering problem, but it moves the design system into
JavaScript, duplicates the values spec 0006 just put in the stylesheet, and
makes the tokens untestable as CSS.

### Option 4: A third-party toggle component

Neither needed nor appropriate: the switch is a button, a glyph, and two
states, and the project has no component library.

## Decision

**Option 2.** The mode lives on `<html data-mode>`; the pre-paint script
resolves it from `anansi:v1:mode` or `matchMedia('(prefers-color-scheme: light)')`;
React owns it after mount. The switch is a native button in the top-right
control cluster, drawn from tokens, labelled with the mode it moves to.

This supersedes **spec 0006, AC-2** (activation by media query). The token sets,
their roles, and the contrast contract are unchanged.

## Rationale

- One authority for the mode — the attribute — means the CSS, the canvas, and
  the switch cannot disagree about which set is running.
- The inline script is the only way to honour a stored choice without a flash,
  and the first paint is the one moment the product cannot redo.
- The state layer already owns validation and the storage seam, so the
  preference is another small validated value rather than a second storage
  mechanism.
- A native button gives keyboard operation, focus, and activation for free;
  the glyph is decoration on top of it.

## Feature design

**Stored value.** `anansi:v1:mode`, shaped `{version: 1, choice}`, where choice
is `'system' | 'light' | 'dark'`. Absent means `'system'`. Validation lives in
`src/state/mode.ts` beside the other validators and returns `null` rather than
throwing; `readChoice` and `writeChoice` take a `StorageAdapter`, so storage is
touched only through the adapter and the module stays free of `window`.

**Resolution.** `resolveMode(choice, system)` is pure: an explicit choice wins,
`'system'` follows the argument. `toggleChoice(choice, system)` returns the
opposite of the mode currently showing, so the first click always changes what
the person sees, whichever way the system points. Both are tested in the node
environment without a DOM.

**The switch.** A 44 × 44 button, circular, one hairline `--anansi-jet` ring,
transparent fill. Inside, a sun and a moon are stacked; the sun is a
`--anansi-yellow` disc with a ray ring drawn by `repeating-conic-gradient`, and
the moon is a `--anansi-lavender` disc with a `--anansi-surface` disc set
across it to cut the crescent. The visible glyph is the mode the button moves
to, and the accessible name says so: "Switch to light mode" in dark, "Switch to
dark mode" in light. The name changes after activation, on the focused control.

**Motion.** The change uses the browser's view transition when it exists and
the person has not asked for less motion: the old page crossfades into the new
one over 220 ms, canvas included, with the glyph's own 240 ms turn underneath.
Without support, or under `prefers-reduced-motion: reduce`, the attribute is
set and the page is simply redrawn — same result, no animation. The reduced
motion branch is CSS plus a guard in the handler, so it cannot be half-applied.

**Placement.** `.controls` becomes the positioned cluster (top right, same
offsets the history button uses), holding the switch and the history button in
that order. The ritual itself keeps its off-centre column; the cluster is
checked at 390 × 844 and 1280 × 800, where it must not reach the hero.

**Pre-paint script.** A few lines in `index.html` read the key, accept only the
three known choices, resolve against `matchMedia`, and set the attribute. It
never throws: storage or media query failures fall back to dark, which is the
base token set.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

- Validation: a good value parses; a wrong version, unknown choice, or bad JSON returns `null`, verifies **AC-3**.
- Read and write: absent storage reads `'system'`, a written choice round-trips, a refusing storage does not throw, verifies **AC-3**.
- Resolution: each choice against each system preference, verifies **AC-2**, **AC-4**.
- Toggle: from system-light and system-dark, the first click always flips the visible mode, verifies **AC-2**.
- Markup: the switch renders a button with the target mode in its name, verifies **AC-1**.
- Tokens: the light block is selected by `[data-mode='light']`, both blocks declare every role, and no raw colour sits outside them, verifies **AC-7**.
- Pre-paint: `index.html` sets the attribute and the mode key appears before the module script, verifies **AC-5**.

## Build plan

1. Add the stored preference: `src/state/mode.ts` with the key, the choice type, validation, and adapter-bound read and write; tests for each. Satisfies **AC-3**.
2. Add `src/app/mode.ts`: the system preference subscription, `resolveMode`, `toggleChoice`, `applyMode`, and the storage-bound load and save. Tests for resolution and toggling. Satisfies **AC-2**, **AC-4**.
3. Change the stylesheet from the media query to `:root[data-mode='light']`, keeping the token values and role names identical, and add the switch's CSS. Satisfies **AC-7**, **AC-8**.
4. Add `ModeSwitch` and wire it into `App`: load the choice, follow the system when the choice is system, apply the attribute, and pass the resolved mode to `WorldLayer`. Satisfies **AC-1**, **AC-2**, **AC-4**.
5. Add the pre-paint script to `index.html` and the view-transition path with its reduced-motion guard. Satisfies **AC-5**, **AC-6**.
6. Verify in a browser: keyboard operation, persistence across reload, both systems, reduced motion via CSS, and the phone cluster; then reconcile the records.

## Consequences

**Positive**:
- The mode has exactly one authority, and the canvas, the CSS, and the switch agree by construction.
- A chosen mode arrives on the first frame, which is what makes the preference feel like the page rather than an effect.
- The preference is a validated value under the existing storage seam, not a second persistence mechanism.

**Negative / tradeoffs**:
- The page now depends on a tiny inline script for first-paint theming; a strict CSP added later needs its hash, and Phase 10 owns that.
- Spec 0006's activation criterion is superseded, so its record must point here rather than being quietly edited.
- There is no "follow the system again" control yet: once chosen, the preference is explicit until storage is cleared.
- The view transition snapshots the page, including the canvas; on slow hardware it costs one compositor crossfade that the no-motion path does not pay.

**Neutral**:
- The switch is another small control in the cluster, not a new surface; the ritual, the engine, and the journey storage are untouched.

## Follow-up

- [ ] A "follow the system" third state, if the product wants the switch to be reversible rather than a one-way preference.
- [ ] A storage listener so a change in one tab reaches the other, matching the journey store.
- [ ] The inline script's hash recorded for the CSP when Phase 10 adds one.
- [ ] The switch judged on a real phone, including its focus ring in both modes.

## Built

All nine criteria are built and covered by tests. `src/state/mode.ts` owns the
key, the shape, and the adapter-bound read and write; `src/app/mode.ts` owns
resolution, toggling, and the attribute; `ModeSwitch.tsx` is the button; the
stylesheet selects the light set by `:root[data-mode='light']`; and the
pre-paint script in `index.html` sets the attribute before the module loads.
Twenty new tests: six state, nine app, four switch, and one in the
token test that pins the light set to the attribute.

One thing the build had to settle that the spec did not name: `theme-color`.
The head previously carried two metas selected by `prefers-color-scheme`, which
is exactly the authority this spec replaces — a person who chose light on a
dark laptop would have had a dark browser chrome around a light page. There is
now one meta, and `applyMode` writes the computed `--anansi-surface` into it, so
the chrome follows the attribute and the colour is never restated in script.

## References

**Project sources**:
- `docs/PRD.md` §33 (light and dark modes), §34 (the palette), §36 (accessibility)
- `docs/MCD.md` §7 (design system and tokens), §9 (accessibility commitments)
- `docs/BUILD_ROADMAP.md` §7.2, `docs/scope/scope.md` feature 12
- `docs/specs/0006-the-light-token-set.md` (the token sets this activates)
- `src/state/shapes.ts` and `src/state/storage.ts` (the validation and adapter conventions)
- `src/app/App.tsx` (the control cluster), `src/world/palette.ts` (the mode type)

**Practices & standards**:
- A native button for a toggle that changes its own action, with the action in its name
- `prefers-reduced-motion` honoured by removing the animation, not the function
- First-paint theming from an inline head script (the no-flash pattern for static pages)
