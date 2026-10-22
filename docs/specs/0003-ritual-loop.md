# 0003. Run the day's ritual in the semantic DOM

**Date**: 2026-10-17
**Status**: Built
**Built**: 2026-10-17 — `src/app/` (four modules), 31 tests, the loop verified by keyboard in a browser

## Summary

This spec builds the whole of Phase 4 in `src/app/`: a person asks for a story, watches a one second search, and receives a title with nothing attached to it. They may send Anansi back twice; the third story is the day's story and the reroll disappears. Taking a story ends the ruling, the title stays, and the person can mark it learned after explaining it aloud. Empty, failed, and blocked storage states each say what happened, and the whole loop works by keyboard and with reduced motion.

## Context

The engine (spec 0001) and the state layer (spec 0002) are built and tested, but nothing calls them. `src/app/App.tsx` still holds a temporary shell that reports how many topics the bundle carries, and its comment says the engine has not landed. The ritual, the product's entire reason to exist, is the one part that cannot be used.

Roadmap Phase 4 fixes the deliverables: the title card (4.1), the daily ruling (4.2), accept (4.3), learned (4.4), resurfacing (4.5), honest states (4.6), and accessibility (4.7). The scope rows 4, 5, and 6 carry the same intent, with feature 5 split across phases because its journey counter belongs to Phase 5.2.

The forces are product and accessibility, not infrastructure. PRD §8 forbids any explanation in the reveal, so the topic's `domain`, `difficulty`, and `tags` must not reach the DOM at all, not merely be hidden. PRD §9 through the daily ruling caps the day at three stories and makes the third stable until local midnight, and every shown story counts as explored. PRD §18 makes a return a playful event with its own line. MCD §9 requires the semantic layer to carry the product, with visible focus, a live region, and a reduced motion path that loses no information.

The 3D search arrives in Phase 6, so this phase must supply a search beat that is honest about what it is: a short deliberate pause with a message, not a simulated spider. The topic bundle is a synchronous bundled import, so the only reachable failures are an empty pool, a thrown search, and blocked storage. Inventing a fetch layer to have a network failure would be building for a problem the static build does not have.

## Requirements

**User stories**:

- As a person using the ritual, I want to ask for a story and receive a title alone, so that the mystery is mine to chase rather than something explained to me.
- As a person in a day, I want at most three stories and a day's story that stays put, so that choosing feels intentional rather than endless.
- As a person who has explained a story aloud, I want to mark it learned and have that survive a reload.
- As a person on a keyboard or with reduced motion, I want the same ritual with the same information, announced and reachable.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Pressing the primary action shows a searching state with a message, and the story arrives after a short pause of about one second; the pause is skipped when reduced motion is set, and the message is still shown.
- **AC-2**: A revealed story shows its title and nothing else. No definition, summary, category, tag, or difficulty appears in the DOM, and a test fails if a topic's `domain`, `difficulty`, or `tags` value appears in the rendered markup.
- **AC-3**: The first search offers one story, and each reroll offers a new one, recorded as explored at the moment it is shown. No story repeats within the day, and the day never exceeds three offers.
- **AC-4**: The third story is the day's story. The reroll control is not present, and a line says that this is today's story and that it stays until midnight.
- **AC-5**: Reloading mid-day shows the identical offer state and the identical story, with the same number of offers used; nothing reshuffles and no search animation replays on load.
- **AC-6**: Taking a story records the day as accepted, marks exactly one record accepted, and advances days completed by exactly one. Taking ends the ruling: the reroll disappears and no further story is offered that day.
- **AC-7**: On the taken story, the learned mark asks whether the person explained it aloud, inline and without a dialog. Confirming persists `learned`; cancelling leaves it `explored`; the state survives a reload.
- **AC-8**: A resurfaced offer shows the line "Anansi has brought this one back." and a lavender accent, and a new offer shows neither. The status line announces the return when it is revealed.
- **AC-9**: An empty pool shows a state that says the web has no stories yet and what to do next, never a blank screen and never an unusable control.
- **AC-10**: A thrown search says that the search failed and offers Try again, which reruns the search for the same day; no exception escapes to the console as an unhandled error.
- **AC-11**: When storage is blocked, the ritual completes for the session and one quiet line says the browser is not keeping the journey.
- **AC-12**: The whole loop (find, reroll, take, learned) completes with the keyboard alone, every control has a visible focus ring, focus moves to the story heading after a reveal, and the live region announces each reveal and each reroll.
- **AC-13**: With `prefers-reduced-motion: reduce`, the information and affordances are identical, no entrance animation or transition runs, and the search resolves in place without the artificial delay.
- **AC-14**: If the page is open across local midnight, the next focus, tab return, or minute check rolls the day: the hero for the new day appears with a line saying a new day has begun, and yesterday's records stay in history.
- **AC-15**: Every search for a day is drawn from `dayRng(clientId, dayKey)`, so two runs of the same search on the same day offer the same story, and a reload never reseeds the day.
- **AC-16**: Every rule above has a test at the level that can prove it: the controller and the store under the node environment, the rendered markup through the server renderer, and the keyboard loop in a real browser.

## Options considered

### Option 1: A thin React shell over one controller module plus the vanilla store

`src/app/ritual.ts` holds the screen state machine and every action (search, reroll, take, learned), taking the store and the engine as plain inputs with the delay injected. `src/app/App.tsx` renders that state and calls those actions, reading the store through a small `useSyncExternalStore` hook. Components take props, so markup is testable with `react-dom/server` and no DOM environment.

**Pros**:
- Every rule is testable in the existing node test environment, with no new dependency.
- The engine stays the only chooser and the store the only recorder; the app decides nothing about selection.
- Phase 6 can replace the search beat without touching the rules.

**Cons**:
- More modules than a single component, and one more seam to keep honest.
- The controller must be deliberately shaped, or it turns into a second store.

### Option 2: One stateful `App` component that calls the engine and the store directly

Everything lives in `App.tsx`: effects, timers, engine calls, and markup.

**Pros**:
- Fewest files and fastest to write.
- Nothing to design before the first line.

**Cons**:
- Behaviour can only be tested through a DOM environment that the project does not have.
- The day rules and the screen state tangle, so the accessibility and midnight work has to unpick them later.

### Option 3: Add React bindings and a component test environment

Install `zustand`'s React binding, `jsdom` or `happy-dom`, and a component testing library, then test interactions in a simulated DOM.

**Pros**:
- Familiar component testing, with interactions asserted directly.
- The React binding removes the hand written subscription.

**Cons**:
- Three new dependencies for a test surface the controller and server renderer already cover, against a project whose dependencies are deliberately few.
- A simulated DOM still cannot prove the keyboard loop or the real focus behaviour, which needs a browser either way.

## Decision

**Chosen option**: Option 1: a thin React shell over one controller module plus the vanilla store.

The app gets a controller that owns the screen state and calls the engine and the store, and components that only render that state. Tests run in the existing node environment: the controller with fake inputs, the markup with `react-dom/server`, and the keyboard loop in a real browser. No dependency is added.

Fixed choices inside that decision:

- **Search delay** is a named constant of 900 ms, injected into the controller and skipped when reduced motion is set. A shorter pause than a second keeps the beat without becoming a wait.
- **Screen state** is one union: `hero`, `searching`, `story`, `failed`, `empty`. The take and learned states are derived from the store, not stored again.
- **The day's ruling ends on take**: the app hides the reroll once `day.acceptedTopicId` is set, which the store already models. The store's own offer guard remains untouched.
- **The title heading receives focus** after a reveal, with `tabIndex={-1}`, so a keyboard or screen reader user lands on the story rather than at the top of the page.
- **The live region** is the single `role="status"` element already in the shell, reused for every announcement, as `ui-registry.md` requires.
- **A missing topic** (a stored id no longer in the library) is treated as a failed state with the line that the story has left the web, rather than crashing or showing a blank card.
- **The reason survives a reload** by replaying the engine for the day as it stood just before the offer, because the store records the story and not the why. The per day stream makes that exact, so the return line is identical after a reload.
- **The confirm moves focus deliberately**: to the confirming action when it opens, and back to the learned mark when it closes, because the button the person pressed no longer exists in either direction.

**Implementation skills**: `frontend-design` (`freebuff/account-skills`, `~/.config/freebuff-desktop/account-skills/.../frontend-design/`) was consulted for the reveal's visual direction; its guidance is applied through the existing `ui-registry.md` tokens rather than new styling conventions.

## Rationale

The project already keeps selection in `src/engine/` and recording in `src/state/`, both proven without a browser. Phase 4's job is presentation and orchestration, so putting the orchestration in one controller keeps the same property: rules are testable in node, and the browser check is reserved for what only a browser can prove, the keyboard loop and real focus. Option 2 would have forced a DOM test environment for behaviour that is not really about the DOM, and Option 3 buys a dependency and a simulated DOM without covering the accessibility acceptance criteria any better.

The 900 ms beat and the skipped delay under reduced motion come from the same principle: the pause exists to mark the moment, not to carry information. If it carried information, reduced motion could not skip it.

## Feature design

**Data model sketch**:

No schema change. The screen reads the shapes from spec 0002 and the engine contract from spec 0001:

| Value read | Shape | Source of truth |
|---|---|---|
| Today's offers and the taken id | `StoredDay` (`dayKey`, `offeredTopicIds`, `acceptedTopicId`) | `anansi:v1:today` |
| Explored and learned records | `TopicRecord[]` | `anansi:v1:history` |
| Client identity for the stream | `Identity.clientId` | `anansi:v1:identity` |
| Storage health | `JourneySnapshot.persistent` | the store, not a key |
| The story and its reason | `Offer` (`story` with `because`, or `none` with `reason`) | `offerNextStory` |

**State transitions**:

```
hero ──find──▶ searching ──story──▶ story ──reroll──▶ searching
  ▲                │                  │
  │                └──throw──▶ failed │ (third offer or taken: reroll gone)
  │                     │             │
  │          try again ─┘             ├──take──▶ story (taken, learned mark shown)
  │                                   └──learned──▶ story (learned)
  └──day rollover / reload with no offers── hero
```

`empty` replaces `hero` when `getLibrary()` is empty. A reload lands directly on `story` when the day already holds offers, or on `story` taken when `acceptedTopicId` is set, with no search.

**API surface**:

| Module | Function | Key inputs | Key outputs | Errors |
|---|---|---|---|---|
| `src/app/ritual.ts` | `ritualView(input)`, `findStory(deps)` | store, library, `dayRng`, `wait(ms)`, `reducedMotion()` | the derived `RitualView`, a `SearchOutcome` | catches engine and store throws into `failed` |
| `src/app/useJourney.ts` | `useJourney(store)` | a `JourneyStore` | the snapshot, subscribed with `useSyncExternalStore` | none |
| `src/app/App.tsx` | `App({ store })` | the store | the ritual markup, wired to the store | none |
| `src/app/RitualScreen.tsx` | `Ritual({ view, ... })`, `Story` | the derived view, the persistent flag, the announcement, the handlers | title only plus its own actions | none |

Every write goes through the store's named actions (`offer`, `accept`, `setStatus`). The app never writes storage, never constructs an offer itself, and never reads a topic field other than `title` for display.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Search | the story | `offerNextStory({ library, history, day, rng })` (spec 0001) |
| Search | the random stream | `dayRng(identity.clientId, day.dayKey)` (spec 0002) |
| Search | the current day key | `day.dayKey`, validated against `getDayKey()` by the store |
| Search | the number of offers used | `day.offeredTopicIds.length` against `ENGINE_TUNING.storiesPerDay` |
| Reroll | the next story | `offerNextStory` with the same `day` and a fresh `dayRng` stream |
| Reveal | whether it is a return | `offer.because === 'resurfaced'` |
| Reveal | the title | `offer.topic.title`, uppercased in CSS only |
| Reveal | the third story line | `day.offeredTopicIds.length === 3` |
| Take | the taken mark and hidden reroll | `day.acceptedTopicId === topic.id` |
| Learned | the current status | today's `TopicRecord.status` in `history` |
| Learned | the confirm question | fixed copy in this spec |
| Honest states | empty web | `getLibrary().length === 0` |
| Honest states | search failed | a caught throw from `offerNextStory` or a store action |
| Honest states | journey not kept | `store.persistent === false` |
| Midnight | a new day has begun | `getDayKey()` differing from the rendered `day.dayKey` after `ensureToday` |
| Search beat | the pause | `SEARCH_DELAY_MS = 900`, injected, skipped when `reducedMotion()` |

**Key invariants**:

- The app never offers a story without the engine, and never displays a topic field other than `title`.
- A story is recorded as explored at the moment it is revealed, via `store.offer`, before it is rendered.
- At most three offers a day, no repeat within a day, at most one accepted record, enforced by the store (spec 0002).
- Once `acceptedTopicId` is set, no reroll can be started from the interface.
- No unhandled promise rejection or thrown render error reaches the page.
- Every announcement goes through the one existing live region.

**Security model**:

Everything is local to the browser. No data is transmitted, no accounts exist, and no personal data is collected (MCD D6). The failure copy names the condition without printing storage contents, keys, or error stacks.

**Configuration required**: none. No new environment variable, secret, or service.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path: find, reroll twice, take the third, confirm learned, reload and see the same story marked taken and learned, verifies **AC-3**, **AC-5**, **AC-6**, **AC-7**, **AC-15**.
- Failure case: the engine throws on the first search, the failed state shows Try again, and retrying succeeds without a reload, verifies **AC-10**.
- Failure case: a blocked storage adapter still completes the loop and shows the persistence line, verifies **AC-11**.
- Boundary: the third offer has no reroll and its line explains the day, verifies **AC-4**.
- Reveal purity: the rendered markup of every story state contains the title and none of the topic's `domain`, `difficulty`, or `tags`, verifies **AC-2**, **AC-8**.
- Accessibility: the browser pass completes the loop with Tab and Enter only, with a visible focus ring, and with reduced motion set, verifies **AC-1**, **AC-12**, **AC-13**.
- Time: a page left open across a simulated midnight rolls to the hero for the new day, verifies **AC-14**.
- Empty pool: no stories produces the empty state, verifies **AC-9**.

## Build plan

Ordered as a Tracer Bullet: one thin thread through hero, search, reveal, and store first, so the loop is real end to end; then the ruling, the taken and learned states, the treatments, the honest states, and finally the accessibility and time passes.

1. Create `src/app/useJourney.ts` (the store subscription, created once, with cross tab rehydration) and `src/app/ritual.ts` with the screen state union and `find()`, which calls `offerNextStory` with `dayRng`, records the story, and catches throws, satisfies **AC-1**, **AC-10**, **AC-15**.
2. Render the thin thread in `src/app/App.tsx`: hero, action, searching message, and a story card showing the title alone with the heading focused, satisfies **AC-1**, **AC-2**, **AC-5**, **AC-12**.
3. Add the reroll action and the day's ruling: the control, the third story line, and the removal of the reroll at three offers or after a take, satisfies **AC-3**, **AC-4**, **AC-6**.
4. Add the taken state and the inline learned confirm, wired to `accept` and `setStatus`, satisfies **AC-6**, **AC-7**.
5. Add the resurfacing treatment (the PRD line and the lavender accent) driven by `offer.because`, satisfies **AC-8**.
6. Add the honest states: empty pool, search failure with Try again, the missing topic case, and the blocked storage line, satisfies **AC-9**, **AC-10**, **AC-11**.
7. Add the midnight check on focus, visibility, and a minute interval, with the quiet new day line, satisfies **AC-14**.
8. Do the accessibility and reduced motion pass: focus order, focus ring on every new control, the live region announcing reveals and rerolls, reduced motion skipping the delay and all new animation, satisfies **AC-12**, **AC-13**.
9. Write the tests: controller and store under node, markup through `react-dom/server` including the purity assertion, then the keyboard and reduced motion pass in a real browser, satisfies **AC-16**.
10. Extend `ui-registry.md` with the story card, the secondary action, and the learned confirm patterns, and reconcile the roadmap, scope, and teardown, satisfies **AC-16**.

## Consequences

**Positive**:

- The product becomes usable end to end: ask, receive, decide, keep, mark learned, survive a reload.
- Selection and recording stay in one place each; the app only orchestrates.
- The accessibility commitments are built with the loop rather than retrofitted.

**Negative / tradeoffs**:

- The search beat is a placeholder; Phase 6 replaces the pause with the world's search and must preserve the same rules and the reduced motion path.
- The learned mark lives only on the taken story until the history drawer exists, so it is reachable only on the day it was taken.
- Without a DOM test environment, interaction coverage leans on the controller and on a manual browser pass, so a future refactor that moves logic into effects could regress without a failing test.

**Neutral**:

- The journey counter (Phase 5.2) is not shown here, so accepting gives the taken state as its only feedback.
- A topic removed from the library while stored as an offer leaves the day unplayable until midnight; the honest state reports it rather than repairing it.

## Follow-up

- [ ] Decide how a day whose stored offer is no longer in the library should be repaired, rather than waiting for midnight. It needs a store action and belongs to a later spec.
- [ ] Phase 6 must replace the 900 ms pause with the authored search while keeping AC-1, AC-13, and the same controller boundary.
- [ ] Show the journey count on the taken state once Phase 5.2 exists.
- [ ] `ui-registry.md` must be updated after this build, per MCD §10.

## References

**Project sources**:
- `docs/PRD.md` §8 (the reveal), §9 and the daily ruling, §18 (resurfacing), §19 (the 90 day model)
- `docs/MCD.md` §4 rule 9 (reduced motion), §5 (engine contract), §7 (tokens), §9 (accessibility)
- `docs/BUILD_ROADMAP.md` Phase 4
- `docs/specs/0001-selection-engine.md`, `docs/specs/0002-local-state-and-persistence.md`
- `ui-registry.md` (the baseline patterns this build must match)

**Practices & standards**:
- Semantic DOM first, canvas as enhancement (progressive enhancement)
- Live regions for asynchronous status, focus moved to new content
- Server rendering as a dependency free test of markup
