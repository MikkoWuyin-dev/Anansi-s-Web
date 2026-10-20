# 0008. The evolving web

**Date**: 2026-10-20
**Status**: Built
**Built**: 2026-10-20

## Summary

The web already thickens with the journey, because the graph's spoke and ring
counts are a function of days completed. That makes progress *denser*, not
*legible*: at day 60 the page looks busy, and nothing in it says that this
person kept sixty stories rather than thirty. This spec gives every kept day
one standing thread of its own, anchored to the web and never taken away, so
the shape of the page is a record of what was kept. A story kept today leaves
its yellow filament lit rather than fading, and the canvas's description says
the web holds what was kept without naming a number or a topic.

## Context

`acceptedDayKeys` in the progress store already holds every day whose story was
kept, sorted and deduplicated, and it rolls into a new journey at ninety. It
exists for the count, and it is the only durable record of the journey: the
history drawer's records prune after thirty days, so anything the world draws
must come from the tally, not the history.

The stage receives a seed and a day count today. `graphFor` turns those into a
radial web whose density grows in steps, and the objects thicken alongside it.
Nothing in the stage knows *which* days were kept, so there is no way for it to
mark them.

The constraint that shapes the design: the world must never leak the hidden
selection system. A thread may carry a day and a position. It must not carry a
domain, a tag, a difficulty, or a title, and there must be no way to read one
back out of the geometry.

## Requirements

**User stories**:

- As a person on day 40, I want the web to show that I have kept forty
  stories, so that the page feels like something I built.
- As a returning visitor, I want the web I left to still be there, so that my
  history is not reset by a reload or a new browser session.
- As a person who keeps today's story, I want to see that it stayed, so that
  the act of keeping leaves a mark rather than nothing.
- As a screen reader user, I want the world described in words, so that the
  accumulation is not something only sighted people are told about.

**Acceptance criteria**:

- **AC-1**: Every day in `acceptedDayKeys` produces exactly one standing thread. A day with no kept story produces none, and no day produces two.
- **AC-2**: A thread's geometry is a pure function of the seed, the graph, and its own day key. Two calls with the same inputs are identical, and nothing reads the clock.
- **AC-3**: The threads are derived at load from the stored tally, so an existing journey shows its past immediately, with no migration and no new storage key.
- **AC-4**: When today's story is kept, the reveal filament holds at a low steady opacity instead of fading to nothing, and it returns to the day's own thread once the celebration ends.
- **AC-5**: Every kept thread is drawn from the palette tokens; no raw colour appears in `src/world/`, and yellow stays the reveal filament and Anansi's eyes.
- **AC-6**: The canvas's description says the web holds what was kept, with no count and no topic, domain, tag, or difficulty.
- **AC-7**: Under `prefers-reduced-motion` the threads and their knots are static and identical, and no new animation is introduced.
- **AC-8**: The addition costs at most two draw calls, and the scene chunk stays inside its 350 kB gzip budget.
- **AC-9**: A thread carries a day key and a position only. Nothing about the story, its domain, or its difficulty reaches the world or the DOM.

## Options considered

### Option 1: Rely on density

Nothing new; a full web is the record. Cheapest, but it is the state today and
it does not answer "I built this" — two journeys with the same day count look
the same however differently they were lived.

### Option 2: One standing thread per kept day

Each kept day claims a node and runs a short strand outward from it, with a
small knot at its end. Deterministic per day, derived from the tally, drawn in
one extra line buffer and one instanced mesh. The web becomes a woven record:
the count is visible in the weave without a number anywhere.

### Option 3: One object per kept day

The families multiply with accepted days. Stronger as a collection, but the
objects are already the loudest thing in the scene, and their count is already
tied to days; a second rule on the same axis adds noise rather than meaning.

### Option 4: A ring per week

The web widens a ring each week. Legible at a glance, but it changes the
composition rather than annotating it, and a week has no relation to a kept
story: two people with the same streak would look identical again.

## Decision

**Option 2.** `src/world/kept.ts` turns the stored day keys and the graph into
one thread and one knot per kept day, and `Web.tsx` draws them in a second line
buffer and a second instanced mesh. The filament holds while today's story is
kept. The description names the accumulation without numbers.

## Rationale

- The tally already exists, is already validated and sorted, and is the only
  record that survives the history's thirty day prune.
- One thread per day is the smallest mark that is still indelibly about *that
  day*; it needs no asset, no new dependency, and no new storage.
- Deriving at load satisfies the retroactive requirement for free, and keeps
  the world a pure function of its inputs.
- A day key is not a topic, so the mark cannot leak the hidden selection
  system even in principle.

## Feature design

**Stored data.** None new. `acceptedDayKeys` is the source, capped by the
journey's own roll at ninety.

**Geometry.** `keptThreads(graph, dayKeys, mobile)`.

| Field | Meaning |
|---|---|
| `dayKey` | the day the thread belongs to |
| `from` | the anchor node's position |
| `to` | the anchor plus a radial extension, 0.35 to 0.65 world units |
| `sag` | 0.04 to 0.12, the same convention as a strand |
| `knot` | the end bead's radius, 0.02 to 0.035 |

The anchor and the extension both come from `createRng(`${seed}:kept:${dayKey}`)`,
so a day's thread is fixed for a given web. The direction is outward from the
hub, so the weave reads as growth rather than a tangle. The phone tier shrinks
the extension to 0.7.

**Rendering.** One `lineSegments` for every kept thread, coloured like a strand
but never quieter than lavender at half strength, and one `instancedMesh` for
the knots in `--anansi-dim`. Both are built once per graph and disposed with it.

**The filament.** `filamentRest(keptToday)` returns `0.45` while today's story
is kept and `0` otherwise; the drawn opacity is the larger of the reveal spring
and that floor, so the celebration still peaks at `0.9` and then settles onto
the day's own thread.

**Description.** `idle` with no kept day keeps its current sentence. `idle` with
at least one says the web is `{density}` and holds `one strand for every story
you kept`. `resting` says the story's thread stays in the web.

**Critical test scenarios** (each maps to an acceptance criterion):

- One thread per day key, deduplicated, verifies **AC-1**.
- Same inputs, identical output; a day's thread unchanged when another day is added, verifies **AC-2**.
- Empty tally draws nothing; the journey's ninety-day ceiling holds, verifies **AC-1**, **AC-3**.
- The filament floor is `0.45` kept and `0` not kept, verifies **AC-4**.
- The description names the weave, never a count or a topic, verifies **AC-6**.
- No colour literal in the new module; the boundary test still passes, verifies **AC-5**, **AC-9**.

## Build plan

1. `src/world/kept.ts`: the pure generator, its types, and the ninety day cap. Tests for count, determinism, stability and the empty case. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-9**.
2. `Web.tsx`: the kept line buffer and the knot mesh, built from the graph, disposed with it. Satisfies **AC-1**, **AC-5**, **AC-8**.
3. `Web.tsx` and `stage.ts`: `filamentRest` and the resting opacity; the description's growth sentence. Tests for both. Satisfies **AC-4**, **AC-6**, **AC-7**.
4. Thread `keptDays` and `keptToday` through `App`, `WorldLayer`, and `Scene`. Markup tests for the description at zero and after days. Satisfies **AC-3**, **AC-6**.
5. Verify: suite, typecheck, build size, and a browser pass over the drawn geometry at zero, one, and many days; then reconcile the records.

## Consequences

**Positive**:
- The page becomes a record rather than a readout: the count is visible as a
  weave, and no number is added to the ritual.
- A kept story keeps something, which is the emotional promise the stage was
  making without a payoff.
- Nothing new is stored, so a returning visitor's past is already there.

**Negative / tradeoffs**:
- The web's node layout still shifts as the graph grows, so a day's thread can
  move when the web gains a spoke. The mark stays the day's, but its place is
  not fixed forever.
- Ninety kept threads plus the strands is more line geometry on the phone
  tier, and the budget test must stay green.
- Reduced motion gets no cue that a thread was just added, because the only
  motion the change has is the filament's own.

**Neutral**:
- The objects, the camera, the choreography, and the ritual are untouched.

## Follow-up

- [ ] Judge the weave on a real phone at ninety days, where the line count is highest.
- [ ] Consider a slow settle on the newest thread for people who accept motion, if the static weave reads as flat.
- [ ] Decide whether a journey's roll should clear the weave or keep it as a past journey.

## Built

All nine criteria are built. `src/world/kept.ts` holds the generator and the
filament floor; `Web.tsx` adds the kept line buffer, the knot mesh, and the
held filament; `Scene`, `WorldLayer`, and `App` carry the tally and today's
kept flag; `stage.ts` names the weave in the description. Ten new tests: nine
for the generator and the floor, one for the markup's description.

Two things the build settled that the spec did not name. The knot mesh only
mounts when there is at least one thread, so an empty journey draws neither
buffer rather than an empty one. And the tally is deduplicated and sorted again
inside `keptThreads`, so a malformed stored value cannot draw a day twice.

## References

**Project sources**:
- `docs/PRD.md` §20 (evolving web), §21 (progress philosophy), §31 (interaction design)
- `docs/MCD.md` §4 (the world), §8 (budgets)
- `docs/BUILD_ROADMAP.md` §8.1, `docs/scope/scope.md` feature 13
- `docs/specs/0005-the-3d-stage.md` (the stage this extends), `docs/specs/0002-local-state-and-persistence.md` (the tally)
- `src/world/graph.ts`, `src/world/Web.tsx`, `src/state/progress.ts`, `src/state/shapes.ts`

**Practices & standards**:
- Derive at read time from the durable record rather than storing a second copy
- One draw call per primitive kind, instanced for repetition
- A decorative canvas still has to be described for a screen reader
