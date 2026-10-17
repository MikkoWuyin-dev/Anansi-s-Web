# UI Registry

Visual patterns captured from built components, so every component added after this one matches what came before. Maintained by the `/imprint` ritual (MCD §10).

The baseline was established on 2026-10-16 via `/imprint audit`, because `ui-registry.md` did not exist while the first component was built and the patterns had to be read back out of the code rather than captured as they were written.

**Note on the "Class" column.** This project has no utility class framework. It uses plain CSS with custom properties, and the raw colour values live in exactly one place, the `:root` token block in `src/app/styles.css`, as the master context document requires. So the tables below record token names and real CSS declarations rather than utility class names.

## Baseline — Established 2026-10-16

[Note: This baseline was established via /imprint audit]

| Property | Correct class |
| -------- | ------------- |
| Page background | `var(--anansi-black)` |
| Text — primary | `var(--anansi-ink)` |
| Text — secondary | `var(--anansi-dim)` |
| Structural line | `var(--anansi-jet)` |
| Accent — high attention | `var(--anansi-yellow)`, exactly one element per screen |
| Focus ring | `outline: 3px solid var(--anansi-lavender)`, `outline-offset: 4px` |
| Button primary — background | `var(--anansi-yellow)` |
| Button primary — text | `var(--anansi-black)` |
| Button primary — radius | `0.85rem 2.6rem 0.85rem 2.6rem` |
| Font family | `'Space Grotesk', ui-sans-serif, system-ui, sans-serif` |
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
| Reduced motion | every entrance animation and the action transition are switched off under `prefers-reduced-motion: reduce` |

## Components

### Shell

File: `src/app/App.tsx`
Last updated: 2026-10-16

| Property | Class |
| -------- | ----- |
| Background | none; `body` supplies `var(--anansi-black)` |
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
Last updated: 2026-10-17

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

## Components to fix

None. Every component matches the baseline it was read from, and the one duplication the audit flagged (the easing curve written three times) was resolved on 2026-10-17 by the motion tokens `--anansi-ease`, `--anansi-duration`, and `--anansi-entrance`.

## Notes from the audit

**One duplication worth tokenising (resolved 2026-10-17).** The easing curve `cubic-bezier(0.2, 0.8, 0.2, 1)` was written out three separate times in `src/app/styles.css`, and the durations `220ms` and `620ms` were repeated alongside it. The loop's build added the three custom properties (`--anansi-ease`, `--anansi-duration`, `--anansi-entrance`) and pointed every transition and entrance at them, so the motion feel is edited in one place.

**No hardcoded colour outside the tokens.** Every colour in the running app resolves through a custom property, and the raw values appear only in the `:root` block. The one nuance to carry forward: `--anansi-ink` and `--anansi-dim` are derived neutrals, mixed for text on the dark grounding because the product palette carries no light neutral. They are documented as derived in the stylesheet, and they are tokens rather than raw values, so they are legitimate. A future light mode will need its own derivation of both.

**Not a component.** `dist/assets/*.css` is build output and is ignored by this registry.
