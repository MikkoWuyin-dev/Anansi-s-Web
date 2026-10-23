# UI Registry

Visual patterns captured from built components, so every component added after this one matches what came before. Maintained by the `/imprint` ritual (MCD §10).

The baseline was established on 2026-10-16 via `/imprint audit`, because `ui-registry.md` did not exist while the first component was built and the patterns had to be read back out of the code rather than captured as they were written.

**Note on the "Class" column.** This project has no utility class framework. It uses plain CSS with custom properties, and the raw colour values live in exactly one place, the `:root` token block in `src/app/styles.css`, as the master context document requires. So the tables below record token names and real CSS declarations rather than utility class names.

## Baseline — Established 2026-10-16

[Note: This baseline was established via /imprint audit]

| Property | Correct class |
| -------- | ------------- |
| Page background | `var(--anansi-surface)` — near black in dark, paper in light |
| Text — primary | `var(--anansi-ink)` |
| Text — secondary | `var(--anansi-dim)` |
| Structural line | `var(--anansi-jet)` |
| Accent — high attention | `var(--anansi-yellow)`, exactly one element per screen |
| Focus ring | `outline: 3px solid var(--anansi-lavender)`, `outline-offset: 4px` |
| Button primary — background | `var(--anansi-yellow)` |
| Button primary — text | `var(--anansi-black)` |
| Button primary — radius | `0.85rem 2.6rem 0.85rem 2.6rem` |
| Font family | `'Space Grotesk', ui-sans-serif, system-ui, sans-serif` |
| Font delivery | one self-hosted latin variable file, `public/fonts/space-grotesk-latin.woff2`, declared once at the top of the stylesheet and preloaded; no request leaves the origin (2026-10-23) |
| Body size | `16px`, line height `1.5` |
| Body weight | `400`, antialiased |
| Shadow | none on the page; the action carries a yellow glow, never a neutral drop shadow |
| Easing | `var(--anansi-ease)` = `cubic-bezier(0.2, 0.8, 0.2, 1)` for every transition and entrance |
| Duration — interaction | `var(--anansi-duration)` = `220ms` |
| Duration — entrance | `var(--anansi-entrance)` = `620ms`, delayed `160ms` on the action and `300ms` on the status line |
| Micro motion — hover | `translateY(-3px)` |
| Micro motion — active | `translateY(-1px)` |
| Stage padding | `clamp(2rem, 6vw, 6rem) clamp(1.5rem, 7vw, 8rem)` |
| Ritual gap | `2.25rem` desktop, `1.75rem` at `40rem` and below |
| Reduced motion | every entrance animation, the action transition, the switch's glyph turn, and the view-transition crossfade are switched off under `prefers-reduced-motion: reduce` |

## Components

Reviewed end to end on 2026-10-20 against the code (roadmap 7.3). The entries that had drifted were corrected: the page background is `--anansi-surface` rather than `--anansi-black` wherever it was named, the corner control now sits inside the `.controls` cluster, and the reduced-motion row covers the switch and the view transition.

### Shell

File: `src/app/App.tsx`
Last updated: 2026-10-16

| Property | Class |
| -------- | ----- |
| Background | none; `body` supplies `var(--anansi-surface)` |
| Border | none |
| Border radius | none on the shell itself; the action carries the control radius |
| Text — primary | `var(--anansi-ink)`, inherited |
| Text — secondary | `.status` uses `var(--anansi-dim)` |
| Spacing | `.ritual` uses `gap: 2.25rem`; shell padding is the stage padding token above |
| Hover state | none on the shell; `.action:hover` lifts by `translateY(-3px)` |
| Shadow | none; the only shadow in the app is the action's yellow glow |
| Accent usage | `.action` only, the single yellow element on the screen |

**Pattern notes:**

The hero is deliberately off centre, offset by `margin-left: clamp(0rem, 9vw, 7rem)`, and capped at `16ch`. The ritual should never sit in the middle of the page, and the measure should never let the line run long. Any future screen that centres its content is departing from the established direction, so check whether that is intended.

The stage is decorative and is hidden from assistive technology with `aria-hidden="true"`. Everything the product requires lives in the semantic layer beneath it. Keep that split for every new visual element.

The status message is a `role="status"` live region that is always present in the document, so the message is announced rather than inserted. New announcements should reuse it rather than adding another region.

Entrance animation animates `translate` and `opacity` rather than `transform`, so it never fights the action's own transform on hover. Keep that separation.

### Action

File: `src/app/styles.css` (`.action`), used by `src/app/App.tsx`

| Property | Class |
| -------- | ----- |
| Background | `var(--anansi-yellow)` |
| Border | `none` |
| Border radius | `0.85rem 2.6rem 0.85rem 2.6rem` |
| Text — primary | `var(--anansi-black)`, `1.0625rem`, weight `600` |
| Text — secondary | not used |
| Spacing | `padding: 1.05rem 2.1rem` |
| Hover state | `translateY(-3px)` plus a widened glow |
| Focus state | the baseline focus ring |
| Active state | `translateY(-1px)` |
| Shadow | `0 16px 42px -20px var(--anansi-yellow-glow)` on hover, `0 0 0 0` at rest |
| Accent usage | this is the accent. Yellow marks the single thing that matters most in the moment, so a second yellow element on one screen is a defect |

**Pattern notes:**

The asymmetric radius is the control shape. A future primary control should match it rather than introducing a new radius, unless the feature deliberately departs and says so.

### Story

File: `src/app/RitualScreen.tsx` (`.story`, `.story__title`, `.story__note`, `.story__learned`)
Last updated: 2026-10-23

| Property | Class |
| -------- | ----- |
| Background | none |
| Border | none |
| Border radius | none on the card; the controls inside carry the control radius |
| Text — primary | `.story__title` uses the inherited `var(--anansi-ink)`, `clamp(2.25rem, 7.5vw, 4.5rem)`, weight `500`, line height `0.95`, `text-transform: uppercase`, `max-width: 18ch` |
| Text — secondary | `.story__note` uses `var(--anansi-dim)` at `0.9375rem`; `.story__learned` uses `var(--anansi-ink)` |
| Spacing | `.story` uses `gap: 1.35rem`; `.stage` uses `gap: 1.5rem` |
| Hover state | none on the card |
| Focus state | `.story__title:focus` and `:focus-visible` take the baseline focus ring with `outline-offset: 8px`, because a reveal moves focus to the heading |
| Shadow | none |
| Accent usage | none. The title is the one yellow free element on the screen; the action below it stays the single yellow element |

**Pattern notes:**

The card is the reveal, so it shows a title and one note, nothing else. `text-transform: uppercase` is presentation only: the stored title is natural case, so a screen reader is not handed an all caps string. The heading carries `tabIndex={-1}` and receives focus when a search resolves, which is why its focus ring is drawn even for a script moved focus.

The title is the page's `h1`, not an `h2`. The story replaces the hero as the page's content, so the outline never begins at level two; the hero and every honest state carry one `h1` too, and a test fails if any state loses it (2026-10-23).

The return cue (`.story__return`, `.strand--return`, `.story__back`) is the only lavender text in the app, and it marks a resurfaced story. It must never be reused as general decoration, or the cue stops meaning anything.

### Ghost action

File: `src/app/styles.css` (`.ghost`), used by `src/app/RitualScreen.tsx`
Last updated: 2026-10-17

| Property | Class |
| -------- | ----- |
| Background | transparent |
| Border | `1px solid var(--anansi-jet)`, turning `var(--anansi-lavender)` on hover |
| Border radius | the control radius, `0.85rem 2.6rem 0.85rem 2.6rem` |
| Text — primary | inherited `var(--anansi-ink)` at `0.9375rem` |
| Spacing | `padding: 0.9rem 1.5rem` |
| Hover state | `translateY(-3px)` and the lavender border |
| Focus state | the baseline focus ring |
| Active state | `translateY(-1px)` |
| Shadow | none |
| Accent usage | none, by design: the secondary action never competes with the yellow primary |

**Pattern notes:**

The ghost is the secondary action's shape, used for "Send Anansi back" and for cancelling the learned confirm. It shares the control radius with the primary action so the pair reads as one system, and it never takes yellow.

### Learned confirm

File: `src/app/styles.css` (`.confirm`, `.confirm__question`), used by `src/app/RitualScreen.tsx`
Last updated: 2026-10-17

| Property | Class |
| -------- | ----- |
| Background | none |
| Border | none |
| Spacing | `gap: 1rem` in a column |
| Text — question | primary ink at `1.0625rem` |
| Controls | the yellow action and the ghost, in one `.actions` row |
| Focus state | the controls' own focus rings |
| Accent usage | the confirming action is yellow, the only yellow element while the confirm is open |

**Pattern notes:**

The confirm is inline, never a dialog: it replaces the button that opened it, so there is no focus trap and no escape path to invent. Focus is moved deliberately when it opens (to the confirming action) and when it closes (back to the mark), because the pressed button no longer exists in either direction.

### Honest states

File: `src/app/RitualScreen.tsx` (`.status-copy`, `.storage-note`, `.searching`)
Last updated: 2026-10-17

| Property | Class |
| -------- | ----- |
| Text — explanation | `.status-copy` uses `var(--anansi-dim)` at `0.9375rem`, `max-width: 44ch` |
| Text — storage | `.storage-note` uses `var(--anansi-dim)` at `0.875rem` |
| Searching cue | three `.searching__strand` dots, lavender, strawberry, lavender, with a `seek` animation and staggered delays |
| Focus state | the action in each state carries the baseline ring |
| Accent usage | the action only; the empty, failed, and missing states carry no second accent |

**Pattern notes:**

Every state keeps the hero scale for its heading and one action where an action helps, so nothing is a blank screen. The searching dots are decorative and `aria-hidden`; the sentence that carries the meaning is the one live region, which is always in the document. The stranded day (a stored story no longer in the library) reuses the failed layout without a misleading Try again.

### History control

File: `src/app/styles.css` (`.history-open`), used by `src/app/App.tsx`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Background | transparent |
| Border | `1px solid var(--anansi-jet)`, turning `var(--anansi-lavender)` on hover |
| Border radius | `0.85rem 1.6rem 0.85rem 1.6rem`, the control radius at a smaller measure |
| Text | `var(--anansi-dim)`, `0.875rem`, uppercase, tracked `0.06em` |
| Position | inside the `.controls` cluster, which is absolute and pinned to the shell corner with `clamp()` insets, so it is one press away in every state |
| Hover state | the lavender border, ink text, `translateY(-3px)` |
| Focus state | the baseline focus ring |
| Accent usage | none; the corner control never takes yellow |

**Pattern notes:**

The smaller asymmetric radius is the control family at a smaller size, not a new shape. Any future small control (a chip, a filter, a field) uses this measure rather than a plain rectangle.

### History panel

File: `src/app/HistoryPanel.tsx`, styled by `.history` in `src/app/styles.css`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Background | none; the panel sits on the page's surface |
| Border | a single `1px solid var(--anansi-jet)` above the panel, no box |
| Border radius | none on the panel; the controls inside carry the radius |
| Text — heading | `var(--anansi-ink)`, `clamp(1.5rem, 4vw, 2rem)`, weight `500` |
| Text — secondary | day headings and statuses use `var(--anansi-dim)` at `0.75rem`, uppercase, tracked |
| Spacing | `gap: 1.5rem` in a column; rows `0.7rem` vertical with a `1px` jet divider |
| Width | `max-width: 44rem`, aligned to the ritual's left offset; no `width: 100%` |
| Focus state | the baseline focus ring on every control; the heading is focusable only as a target |
| Accent usage | none. The panel carries no yellow, and the lavender ring is its only accent |

**Pattern notes:**

The panel is a disclosure, not a dialog: it stays in the document with the `hidden` attribute so `aria-controls` always resolves, and it needs no focus trap. Focus moves to the heading on open and back to the control on close.

Do not give a grid item `width: 100%` together with a left `margin`: the margin is added outside the track and the content runs past the viewport. The panel is a grid item, so it sizes from the track and the `max-width`.

### Filter row

File: `src/app/HistoryPanel.tsx`, styled by `.filters` in `src/app/styles.css`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Background | transparent |
| Border | `1px solid var(--anansi-jet)`; the pressed filter takes `var(--anansi-ink)` |
| Border radius | the small control radius, `0.85rem 1.6rem 0.85rem 1.6rem` |
| Text | `var(--anansi-dim)` at `0.875rem`, ink when pressed |
| Count | `var(--anansi-dim)` at `0.75rem`, tabular numerals |
| State | `aria-pressed`, never a colour alone |
| Focus state | the baseline focus ring |
| Accent usage | none |

**Pattern notes:**

A filter is a toggle button with `aria-pressed`, not a link and not a radio: it changes the same list in place. The count inside the label is part of the accessible name, so a screen reader hears "Explored 9".

### Count

File: `src/app/RitualScreen.tsx` and `src/app/HistoryPanel.tsx`, styled by `.count`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Text | `var(--anansi-dim)`, `0.9375rem`, tracked `0.12em` |
| Numerals | `font-variant-numeric: tabular-nums`, so the number never jitters as it grows |
| Markup | the visible `N / 90` is `aria-hidden`; a `.visually-hidden` span carries `N of 90 days` |
| Placement | beside the taken story and in the drawer header, and nowhere before the first taken day |
| Accent usage | none, by design: the count must never compete with the action |

**Pattern notes:**

`.visually-hidden` is the project's one screen-reader-only utility, added with this component. Use it whenever the visual form of a value is a symbol rather than words, and keep the words in the same element.

### Stage

File: `src/world/Scene.tsx` and `src/world/Web.tsx`, mounted by `src/app/WorldLayer.tsx`, styled by `.world`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Layer | `position: fixed; inset: 0; z-index: -1; pointer-events: none` |
| Canvas | transparent clear, so `body` supplies the page's surface; `frameloop="demand"` |
| Strands | one line segment buffer, `var(--anansi-lavender)` mixed toward `var(--anansi-jet)` by depth, opacity `0.44` at rest and up to `0.72` while the web wakes, no depth write |
| Beads | one instanced mesh; mostly `var(--anansi-ink)` and `var(--anansi-dim)`, `var(--anansi-strawberry)` on every ninth, `var(--anansi-lavender)` on every fourth |
| Density | 11 beads and 20 strands at day 0, 71 and 140 at day 90; the phone tier draws 9 and 16. Objects are five at day 0 and twenty at day 90 on desktop, ten at day 90 on a phone |
| Reveal | one yellow filament from the hub to the first anchor, opacity springing to `0.9` on `revealing` and `celebrating`, mounted at zero opacity so its shader compiles with the stage |
| Colour source | `src/world/palette.ts` reads the `--anansi-*` custom properties at mount; `src/world/purity.test.ts` forbids a colour literal there |
| Accessibility | the container is `role="img"` with `aria-label` from `descriptionFor`; the canvas inside it is presentational |
| Camera | one authored frame per beat from `src/world/camera.ts`; eases at a stiffness of 6 and stops once framed; the phone tier pulls every frame back by 1.45 |
| Pointer tilt | a spring, bounded to 0.14 world units horizontally and 0.084 vertically (0.098 and 0.059 on touch), zero under reduced motion; there is no orbit, drag, wheel, or scroll listener |
| Motion | springs only: tilt, each object family's bounded impulse, Anansi's travel, and the wake and filament. Every frame is drawn on an explicit invalidation, and an idle page draws none |
| Accent usage | yellow appears exactly twice in the world and nowhere else: the reveal filament and Anansi's two small eyes |

**Pattern notes:**

The stage sits below the text and above the body background. The CSS decorative web (`.web`) still paints on top of it as the refused-context fallback; retiring it is a follow-up. A new 3D object takes its colour from `palette.ts` and anchors to a node in the graph; it is never positioned by hand.

An object family is one primitive and one instanced mesh: variation is proportions, rotation, tone and phase, never a new geometry per instance. The quiet tones come first and the accents are rare, so the world never competes with the story.

### Object families

File: `src/world/families.ts`, drawn by `src/world/Objects.tsx`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Families | five: clock (torus), key (cylinder), eye (sphere), book (box), planet (octahedron) |
| Instances | one to four per family, by thirty day steps of the journey; one to two on a phone |
| Scale | `0.064` to `0.11` base per family, then `0.78` to `1.22` per instance, with a family's own proportion axis |
| Tones | quietest first: `var(--anansi-dim)` and `var(--anansi-lavender)` dominate; `var(--anansi-ink)` and `var(--anansi-strawberry)` are the rare accents |
| Placement | the node's position plus `z + 0.1..0.18` and at most `0.06` of drift, so nothing floats free of the web |
| Motion | a bounded spring impulse on every beat: scale `+3.5%` at most and a `0.012` radian lean, back to rest; none under reduced motion |
| Draw calls | five, one per family, regardless of how many instances the journey has earned |

**Pattern notes:**

A new family is a row in `FAMILIES`, a form, a base scale, a tone list, and a generator branch. Do not add a bespoke mesh, and do not let a family's first tone be its loudest.

### Anansi

File: `src/world/Anansi.tsx`, with his numbers in `src/world/spider.ts`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Body | two spheres: abdomen `var(--anansi-lavender)`, head `var(--anansi-ink)` |
| Eyes | two `0.0065` spheres, `var(--anansi-yellow)`, level and mirrored |
| Legs | eight, four a side, two cylinder segments each, ink upper and dim lower |
| Rest | the hub, lifted `0.14` above the web |
| Gait | alternating phases, swing `±1` and lift up to `0.5`, both zero at a hold |
| Travel | a spring from the hub to two anchors and home over the 1400 ms search; none under reduced motion |
| Isolation | only `Scene.tsx` imports him, and only `Anansi.tsx` imports `spider.ts`; `purity.test.ts` fails otherwise |

**Pattern notes:**

His character is motion, not detail: the legs stop when he looks, the body dips `0.012` into a stride, and the travel has weight. A modelled replacement changes `Anansi.tsx` only.

### Search choreography

File: `src/world/choreography.ts`, consumed by `Anansi.tsx`, `Web.tsx`, and `src/app/ritual.ts`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Duration | `1400 ms`, the reveal's wait; `900 ms` of `celebrating` after a story is kept |
| Route | hub, first anchor, middle anchor, hub, with holds at 0.10, 0.46 and 0.80 |
| Easing | cubic in and out inside each keyframe; the position itself is a spring's progress, never a linear tween |
| Wake | `0` at idle and resting, `1` searching, `0.6` revealing, `0.9` celebrating |
| Reduced motion | the pose is the hub at every progress, stride `0`; the ritual skips the wait |

**Pattern notes:**

The choreography decides nothing about the story: the engine's answer is recorded before the route begins, and the reveal is simply held for the movement. Keep that separation; the stage must never become the chooser.

### The sun and moon switch

File: `src/app/ModeSwitch.tsx`, styled in `src/app/styles.css`; state in `src/state/mode.ts`
Last updated: 2026-10-20

| Property | Class |
| -------- | ----- |
| Element | a native `<button type="button">` in the top-right `.controls` cluster, beside History |
| Size | `2.75rem` square, circular, one hairline `--anansi-jet` ring, transparent fill |
| Glyph | the mode the press moves *to*: a yellow disc in eight rays in dark, a lavender crescent cut by `--anansi-surface` in light |
| Name | `Switch to light mode` / `Switch to dark mode`, so the action is in the name, never the state |
| Motion | the two discs crossfade, rotate and scale over `240 ms`; the page itself crossfades through the view transition at `220 ms` |
| Reduced motion | both the glyph's turn and the view transition are removed; the colours change at once |
| Colour | every value a token; the moon's cut is the page's own surface, so it reads in both modes |
| Focus | the page's `3px` lavender ring with `4px` offset, as History has |

**Pattern notes:**

The glyph rotates rather than swapping, because a control that changes its own meaning should look like one thing turning over. The accessible name always states the destination: a button named by its current state tells a screen-reader user nothing about what pressing it does.

### The weave

File: `src/world/kept.ts`, drawn by `src/world/Web.tsx`
Last updated: 2026-10-20

| Property | Class |
| -------- | ----- |
| One mark | one thread and one knot per day in `acceptedDayKeys`, so the count is the weave |
| Anchor | an existing graph node, picked by `createRng(`${seed}:kept:${dayKey}`)` |
| Direction | outward from the hub, `0.35` to `0.65` world units, `0.7` of that on a phone |
| Sag | `0.04` to `0.12`, the strand convention at its midpoint |
| Colour | lavender pulled `0.35` toward jet, never quieter than the web's own strands |
| Knot | `0.02` to `0.035`, `var(--anansi-dim)` |
| Cost | one line buffer and one instanced mesh, two draw calls at any day count |
| Motion | none of its own; the threads are placed once per weave and static under reduced motion |

**Pattern notes:**

The weave is derived, never stored: the journey's tally is the record, and the
history drawer's thirty day window cannot be its source or the earliest marks
would vanish. A mark that carries a day key and a position cannot leak the
hidden selection system, which is why nothing about the story travels with it.

### The hidden interactions

File: `src/app/name.ts`, with `src/app/App.tsx`, `src/world/stage.ts`, `src/world/camera.ts`, `src/world/Anansi.tsx`, `src/world/Objects.tsx`, `src/world/Web.tsx`
Last updated: 2026-10-22

| Property | Class |
| -------- | ----- |
| Trigger (the word) | typing `anansi` anywhere outside a field, one keystroke at a time |
| Suppression | a held modifier, any `input`, `textarea`, `select`, or contenteditable target, or a running search |
| Cooldown | once per session; the buffer is cleared whenever the attempt is refused |
| Answer (the word) | the `naming` beat: nearest camera frame, the strongest wake, a `0.08` lift, and its own sentence |
| Answer (the day) | the clock family turns `0.35` radians toward the hub when the third story seals the day |
| Answer (the kept story) | a yellow sphere at the newest knot's end, twice its radius, settling to exactly the resting size |
| Reduced motion | the word and the seal keep their sentence and their state, and drop the lift, the swing, and the pulse |
| Cost | no stored key, no new draw call while idle, one temporary mesh during the celebrating beat |
| Removability | delete the module, the listener, the beat, and the notice, and the ritual is unchanged with no migration |

**Pattern notes:**

The word is refused inside a field so the history search keeps its meaning, and
refused during a search so the surprise never interrupts the one moment the
product is working. Every answer is described in words as well as drawn, because
the canvas already carries a description and a surprise is not an exception to
it. The kept knot settles at the resting radius rather than fading, so its mesh
can be unmounted without a visible pop.

### Reduced motion and the phone

File: `src/app/WorldLayer.tsx`, `src/world/camera.ts`, `src/world/Objects.tsx`, `src/world/Anansi.tsx`
Last updated: 2026-10-18

| Property | Class |
| -------- | ----- |
| Reduced motion source | `WorldLayer` reads the media query once and passes a boolean down; no world module touches `matchMedia` |
| Camera | snaps to the beat frame, never tilts, listener not attached |
| Objects | amplitude `0`, no beat impulse |
| Anansi | stays at the hub, stride `0` |
| Web | state changes with `set` rather than a spring, so nothing travels |
| Description | identical to the animated path: it follows the beat either way |
| Phone breakpoint | `(max-width: 40rem)`, the stylesheet's own |
| Phone density | graph thinned by two spokes and two rings; objects capped at two per family |
| Phone frames | every camera frame pulled back `1.45`; pixel ratio capped at `1.5` |
| Touch tilt | `0.7` of the mouse bound, same spring |

## Components to fix

None. Every component matches the baseline it was read from, and the one duplication the audit flagged (the easing curve written three times) was resolved on 2026-10-17 by the motion tokens `--anansi-ease`, `--anansi-duration`, and `--anansi-entrance`.

## Notes from the audit

**One duplication worth tokenising (resolved 2026-10-17).** The easing curve `cubic-bezier(0.2, 0.8, 0.2, 1)` was written out three separate times in `src/app/styles.css`, and the durations `220ms` and `620ms` were repeated alongside it. The loop's build added the three custom properties (`--anansi-ease`, `--anansi-duration`, `--anansi-entrance`) and pointed every transition and entrance at them, so the motion feel is edited in one place.

**No hardcoded colour outside the tokens.** Every colour in the running app resolves through a custom property, and the raw values appear only in the token blocks. `--anansi-ink` and `--anansi-dim` are derived neutrals; the palette names hues, and a hue cannot do every job.

**The two modes (spec 0006, 2026-10-20).** Light mode is the same token names under `:root[data-mode='light']`, so no component or rule below the tokens knows which mode is running. Dark is the base and the native feel; light is the daylight reading of it. Three roles exist because a hue was standing in for a job:

| Role | Dark | Light | Why it exists |
|---|---|---|---|
| `--anansi-surface` | `#08090a` | `#f2efe4` | the page; `--anansi-black` is the label on the yellow action and cannot be the page as well |
| `--anansi-action-edge` | `transparent` | `#19323c` | the yellow fill is 1.06:1 on paper; the inset ring gives the button a boundary |
| `--anansi-lavender-text` | `#a97aa9` | `#885a89` | the one lavender label; the hue itself is 3.67:1 on the dark page |

Yellow stays the single regulated accent in both modes: one fill, always with `--anansi-black` on it (18.38:1 dark, 17.62:1 light). The mode is arithmetic, not taste: `src/app/tokens.test.ts` derives every text pair and focus ring from the stylesheet and fails below 4.5:1 for text or 3:1 for the ring, the action's boundary, and the label on yellow. The mode has one authority since spec 0007: `<html data-mode>`, set before the first paint and written by the sun and moon switch, so the CSS, the canvas, and the control cannot disagree. The `theme-color` meta is one value, written from the resolved `--anansi-surface`, so the browser's chrome follows the page rather than the system.

**Not a component.** `dist/assets/*.css` is build output and is ignored by this registry.
