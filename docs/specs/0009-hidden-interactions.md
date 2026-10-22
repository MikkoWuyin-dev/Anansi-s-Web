# 0009. Hidden interactions

**Date**: 2026-10-22
**Status**: Built
**Built**: 2026-10-22

## Summary

Three small surprises, none of them announced. Typing his name answers Anansi
once. The web turns a clock toward him on the day the third story seals. The
knot of the story you kept brightens once, then settles into the weave.

They are chosen to cost nothing the product is not already paying: no stored
value, no new input surface, no pointer on the stage, no idle frames, and no
new draw call. Every one of them can be deleted without touching the ritual,
and the product is unchanged if they are.

## Context

PRD §32 asks for small surprises that reward curiosity and never interfere
with the core task. That is a constraint on the *kind* of surprise, not just
its number. This product treats time on site as a failure signal (PRD §2), so
a hidden interaction must not be a reason to stay, a reward for scrolling, or
a thing to hunt. It is a gift for someone who is already paying attention.

The stage is unusually constrained, by decisions already ratified:

- It takes no pointer events. `Scene.tsx` sets `pointerEvents: 'none'` and
  spec 0005 made that a rule, so hover on the world is out (MCD §4).
- An idle page draws zero frames (MCD §8). A timer that wakes the scene after
  a pause would break that budget, which rules out an idle animation.
- The world may not import app, state, or content, and may not start its own
  loop (`src/world/purity.test.ts`). Anything with a timer lives in the app
  layer and reaches the stage as a prop.
- The reveal shows a title and nothing else. A hidden interaction may use a
  day key or a beat, and must never reach toward a domain, a tag, or a
  difficulty.

That leaves three honest places to put a surprise: the keyboard, the beats
that already happen, and the moment a story is kept. Options 3 and 4 below
were weighed and are recorded rather than chosen.

## Requirements

**User stories**:

- As someone who has used the ritual for a while, I want one thing on the page
  that is not for me to use, so that curiosity is rewarded rather than
  measured.
- As someone who typed his name by accident, I want the page to answer kindly
  and then go quiet, so that the surprise does not start a conversation.
- As someone who cannot use a pointer or who asked for less motion, I want the
  same information from the surprise, carried in the description rather than in
  movement.
- As the person reading the ritual's state, I want the stage's description to
  stay true, so that naming him does not teach a screen reader something
  false.

**Acceptance criteria**:

- **AC-1**: The word answers once per session, from the keyboard only, and only
  when focus is not in a text field. It never fires during a search, and never
  with a modifier held.
- **AC-2**: Naming changes presentation only. Nothing is stored, no history
  record is written, and the day's offers, the accepted story, and the journey
  count are identical whether or not it happens.
- **AC-3**: `naming` is a beat of the stage, with its own camera frame and its
  own sentence. Every beat still has a distinct sentence.
- **AC-4**: Under reduced motion the naming beat moves nothing and still
  changes the description for its duration.
- **AC-5**: The sealed day sends one notice to the stage at the moment the third
  story arrives, and not on a reload of a day that is already sealed.
- **AC-6**: On acceptance the knot of today's thread emphasises once, and the
  emphasised thread is the one whose day key is today.
- **AC-7**: No hidden interaction adds a stored key, a draw call, a focus stop,
  or a frame while the page is idle.
- **AC-8**: Deleting the feature leaves the ritual identical: the same offers in
  the same order, the same DOM, the same counts, and no migration.
- **AC-9**: Nothing about a story beyond its day key reaches the world. No
  title, domain, tag, or difficulty appears in any hidden interaction.
- **AC-10**: The canvas description never gains a count, a title, a domain, a
  tag, or a difficulty, and never claims a story that is not there.
- **AC-11**: The ritual stays fully operable without ever finding any of it. No
  hidden interaction is on the tab path, and none is required to finish a day.

## Options considered

### Option 1: The word

Typing `anansi` anywhere outside a text field makes the web answer once. A new
`naming` beat frames the camera close, the web wakes, and Anansi lifts himself
toward the viewer. The live region says one line.

Cheapest of the four, entirely in the app layer plus one beat, and the only one
that is genuinely *hidden*: nothing on the page hints that it exists, which is
what PRD §32 is asking for. It cannot interfere, because it needs a deliberate
act and changes nothing but the stage.

### Option 2: Beats that already happen

Two reactions that need no new input: the clock family turns toward the hub when
the third story seals the day, and the knot of the kept story brightens once on
acceptance. The web is already told which beat it is on, so these read as the
web noticing what just happened rather than as a feature.

Moderate cost, because the seal is not a beat today: the stage knows a story is
revealed, not that it is the day's story, so it needs one prop carried through
`WorldLayer` and `Scene`.

### Option 3: The patient spider

After about ninety seconds of stillness Anansi crosses a strand and comes back,
once a session.

The most charming of the four and the only one that fails an existing budget.
An idle page currently draws zero frames (MCD §8, and the demand frameloop is
what keeps the mobile cost honest). Waking the scene on a timer would need a
recorded exception to that budget, and a scene that animates at the viewer
rather than at the ritual is the beginning of a different product.

### Option 4: The living margin

The decorative strands that frame the ritual lean and brighten near the cursor,
in CSS only.

Free, unreachable by tests that matter, and reduced motion safe. Rejected as
too quiet to count as a surprise, and because it rewards moving the pointer
across the page, which is the smallest possible engagement loop and exactly the
kind of thing this product does not want to teach.

## Decision

**Options 1 and 2**, built together as one small feature: the word, and the two
reactions that need no input. Option 3 is rejected on the idle frame budget.
Option 4 is rejected as too quiet to be worth a mechanism.

## Rationale

- The three together cost one new beat, one new prop, and one new pure module.
  None of them touches stored data, so there is nothing to migrate and nothing
  to version.
- Each has a natural trigger that already exists (a keystroke, the third offer,
  the acceptance), so none of them needs a timer, a listener on the canvas, or
  a new event source. That is what keeps AC-7 and AC-8 cheap to hold.
- The word is the only one a person must discover, and discovering it is the
  whole reward. The other two are things they will see and not be able to
  explain, which is the better kind of surprise for a page with a spider on it.
- Reduced motion is handled without a second design: the beat still arrives, and
  the sentence still says what happened. The movement is what goes.

## Feature design

**The word.** A pure module in the app layer, so the matching is testable in
node and the effect site stays thin.

| Export | Meaning |
|---|---|
| `NAMING_WORD` | `anansi`, lowercase |
| `advanceBuffer(buffer, key)` | append one printable character, keep at most the word's length, reset on anything else (Enter, Shift, arrows) |
| `namesHim(buffer)` | whether the buffer ends with the word |
| `isTypingTarget(target)` | true for `input`, `textarea`, `select`, or `contenteditable` |

The effect sits in `App.tsx`: one `keydown` listener on `window`, skipped when a
modifier is held, when focus is in a text field, or when the view is `searching`.
A match sets `named` for `NAMING_MS`, which is `CELEBRATE_MS` (900 ms), and the
session's first match is the only one.

**The naming beat.** `Beat` gains `naming`. Three mappings must answer it, and
the types force all three:

| Where | Answer |
|---|---|
| `CAMERA_FRAMES` | the nearest frame, held slightly above the target, so the frame reads as attention rather than celebration |
| `webWake` | the strongest wake, the same value as `celebrating` |
| `descriptionFor` | "Anansi has heard his name. The web answers." |

`Anansi.tsx` lifts him by `NAMING_LIFT` (0.08 world units) on a spring and turns
him toward the viewer, with no travel. Under reduced motion the lift and turn
are not applied; the beat, the wake, and the sentence still arrive.

**The sealed day.** The stage is told, not asked: `App` already knows when a
search resolves, so it sends `notice: 'sealed'` when that resolution is the
day's third story, and `null` after `CELEBRATE_MS`. `Objects.tsx` turns the
clock family 0.35 radians toward the hub on that notice, one pass, and settles.
Under reduced motion the turn holds statically for the notice window.

A reload of an already sealed day sends no notice, because no search happened,
which is what AC-5 asks for.

**The kept knot.** `Web.tsx` already draws one knot per kept day from the
tally. During `celebrating`, the last thread (the greatest day key, which is
today's) takes a spring to 1.6 times its radius in `--anansi-yellow`, then
settles back to its token colour. Nothing is stored: the tally already says
which day it is, and a reload on a kept day rests at `resting`, so the
emphasis cannot replay.

**Removability.** Delete `src/app/name.ts`, the listener and the `named` state
in `App.tsx`, the `naming` beat and its three mappings, the `notice` prop and
its two consumers, and the knot emphasis. The ritual behaves exactly as it does
today, with no data migration, because none of it writes anything.

**Critical test scenarios** (each maps to an acceptance criterion):

- The buffer matches across keystrokes and clears on Enter; a modifier or a text
  field suppresses it, verifies **AC-1**.
- A session names him once; the second attempt does nothing, verifies **AC-1**.
- Naming does not change the snapshot the store exposes, verifies **AC-2**.
- Every beat, `naming` included, has a distinct sentence, verifies **AC-3**,
  **AC-10**.
- The notice is set only when the resolved offer is the third, and a reload of a
  sealed day produces no notice, verifies **AC-5**.
- The emphasised thread is the one carrying today's day key, verifies **AC-6**.
- No new storage key, no new draw call, no `requestAnimationFrame` in the world,
  verifies **AC-7**, **AC-8**.
- The announcement never names a title, domain, tag, or difficulty, verifies
  **AC-9**, **AC-10**.

## Build plan

1. `src/app/name.ts` with its tests: the buffer, the word, and the typing
   targets. Satisfies **AC-1**.
2. `Beat` gains `naming`: `stage.ts`, `camera.ts`, `Web.tsx`, `Anansi.tsx`, and
   `ritual.ts`'s `beatFor`. Tests for the frame, the wake, the lift, and the
   sentence. Satisfies **AC-3**, **AC-4**, **AC-10**.
3. `App.tsx`: the listener, the `named` state and its timer, and the
   announcement. A markup test that the live region carries the naming line.
   Satisfies **AC-1**, **AC-2**, **AC-11**.
4. `notice` from `App` through `WorldLayer` and `Scene` into `Objects`: the
   clock family's turn, with the reduced motion branch. Satisfies **AC-5**,
   **AC-7**.
5. `Web.tsx`: the kept knot's emphasis, choosing today's thread from the tally.
   Satisfies **AC-6**, **AC-9**.
6. Verify: the suite, typecheck, the build size against both chunk budgets, and
   a browser pass in both modes and under reduced motion. Then reconcile the
   scope, the roadmap, and `memory.md`.

## Consequences

**Positive**:

- Three surprises for one beat, one prop, and one small module, with no stored
  data and no new dependency.
- The word is genuinely hidden, which is what makes it a gift rather than a
  feature.
- Reduced motion loses the movement and keeps the meaning, which is the rule the
  product already follows everywhere else.

**Negative / tradeoffs**:

- Almost nobody will find the word, and that is intended. It cannot be
  discovered by exploration, only by knowing his name, which makes it closer to
  a signature than to a puzzle.
- A new beat widens the stage's vocabulary. Every future beat must now answer
  three mappings, which the types enforce, so this raises the cost of the next
  one very slightly.
- The seal reaction depends on a prop that the world does not otherwise need,
  so `WorldLayer` and `Scene` gain a parameter for one small effect.

**Neutral**:

- No stored shape changes, no new key, and no engine or content involvement.

## Built

All eleven criteria are built. `src/app/name.ts` holds the word as a pure
module, the `naming` beat has its camera frame, its wake, its lift, and its
sentence, the clock family turns on the notice, and the kept knot pulses in
the celebrating beat. Thirteen new tests: eleven for the word and its
suppressions, two for the beat and the announcement.

Three things the build settled that the spec did not name. The knot's
emphasis is its own short lived mesh rather than a change to the instanced
buffer, because the weave's knots are painted once and this one exists for
the length of the beat; it settles at exactly the resting knot's radius, so
its unmount cannot be seen. The clocks hold the turn under reduced motion
instead of swinging through it. And the word is refused while a search is
running, which the spec asked for, by reading the view's phase inside the
listener rather than by owning a second copy of it.

Verified live at 390 by 844: typing the word moved the canvas description to
its naming sentence and the live region to "You know his name", then both
settled back; the second attempt in the same session did nothing; typing the
word into the history search changed nothing and left the query intact; the
third story sealed the day; and the idle page drew zero frames before and
after an acceptance, with the draw calls at 28 on an empty journey and 30
with one kept thread.

## Follow-up

- [ ] Judge whether the seal reaction is visible at all on a phone, where the
      web is thinner and the clocks are smaller.
- [ ] Decide whether the word deserves a second form, for example his full name
      in another language, once there is a reason.
- [ ] Revisit hover on the strands only if the stage's pointer rule is ever
      reopened, which would be an MCD change rather than a feature.

## References

**Project sources**:
- `docs/PRD.md` §2 (time on site is a failure signal), §31 (interaction design),
  §32 (hidden interactions), §36 (accessibility)
- `docs/MCD.md` §4 (the world's rules), §8 (budgets), §9 (accessibility)
- `docs/BUILD_ROADMAP.md` 8.2, `docs/scope/scope.md` feature 13
- `docs/specs/0005-the-3d-stage.md` (the beats and the pointer rule),
  `docs/specs/0008-the-evolving-web.md` (the weave this adds to)
- `src/app/App.tsx`, `src/world/stage.ts`, `src/world/camera.ts`,
  `src/world/Web.tsx`, `src/world/Objects.tsx`, `src/world/Anansi.tsx`

**Practices & standards**:
- Put a timer in the layer that already owns time, never in the renderer
- A surprise must be deletable without a migration
- Reduced motion removes movement, never information
- Let the type system force every mapping a new state needs
