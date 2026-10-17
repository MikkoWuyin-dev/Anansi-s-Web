# 0002. Keep the journey in the browser under a versioned local store

**Date**: 2026-10-17
**Status**: In Progress
**Built**: 2026-10-17 — `src/state/` (seven modules), 50 tests

## Summary

The journey lives in the browser in four small stores under `anansi:v1:*`: identity, today, the 30 day history, and progress. Each one is checked on load, and if it is damaged only that store resets, so a broken day cannot cost the journey. A permanent tally of accepted days sits beside the pruned history, the day rolls at local midnight, and one helper rebuilds the random stream for a day so the engine stays deterministic across reloads.

## Context

The selection engine exists and is tested (spec 0001), but nothing stores a day. `src/state/` does not exist, and nothing in `src/app/` calls the engine, so the ritual cannot survive a reload and the engine's determinism across reloads, the reload half of gate G3, remains unproven.

Roadmap Phase 3 fixes the deliverables: four small zustand stores under the `anansi:v1:*` namespace, a load path that survives corrupt data, a day validated against the current local day, a 30 day history prune, a progress model that counts accepted days and rolls at 90, and a generated client identity used only to seed the engine (basis: `docs/BUILD_ROADMAP.md` 3.1 to 3.6). MCD §5 sketches the shapes and picks zustand with localStorage persistence; D5 fixes the day rules and accepts that a spoofed clock only spoils the person's own ritual; D6 accepts that clearing browser data clears the journey. PRD §22 keeps history to a rolling 30 days, and §19 makes the 90 day count the product's progress language.

The forces are all about failure. A reload in the middle of a day must not reshuffle the story. A hand edited store must not crash the ritual. A browser with storage blocked must not make the product unusable. Two tabs must not disagree about what was offered. Midnight must start a new day without losing yesterday. And the count of days completed has to outlive the history it is computed from, which the MCD's formula cannot do on its own: after day 31 the earliest accepted days have been pruned.

> ⚠️ Premise note: MCD §5 says days completed is the count of distinct day keys with an accepted topic, but the 30 day history cannot carry a 90 day count. The model below adds a small accepted day tally to the progress record. That is a correction to the MCD's state schema, not to its day rules, and MCD §5 must be amended when this spec is built.

## Requirements

**User stories**:

- As a person using the ritual, I want today's story to survive a reload or a browser restart, so that closing the tab never costs me the day.
- As a person whose browser blocks storage, I want the ritual to keep working for the session, so that the product does not simply break.
- As the engineer building the loop, I want one validated store with named actions, so that Phase 4 reads and writes the journey through one seam instead of touching storage itself.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: `src/state/` exports a store factory whose storage, day source, and clock are injected, so the suite runs in the existing `node` environment against a fake storage; no file in the module imports from `app/` or `world/`, and a test fails when one does.
- **AC-2**: Writing a day, a history, and progress, then rebuilding the store from the same storage returns deeply equal values, and the day's offers are identical after the rebuild.
- **AC-3**: A corrupt value in one key resets only that store to its safe default, keeps the other stores, and throws nothing.
- **AC-4**: A stored value whose `version` is not 1 is treated as corrupt for that store alone.
- **AC-5**: A stored day whose key is not the current local day is discarded, a fresh day begins, and the previous day's records remain in history.
- **AC-6**: History older than 30 days by day key is removed on load and after every write; every record inside the window, today included, remains.
- **AC-7**: The accepted day tally is the source of days completed; adding a day is idempotent, so a repeated acceptance never counts twice, and the tally never holds more than one entry per day.
- **AC-8**: When the tally reaches 90 accepted days, the next access rolls the journey: `journeysCompleted` increases by one, `journeyStart` becomes the new day, and the tally starts empty; history is untouched.
- **AC-9**: A `clientId` is generated once, persists across reloads, is never transmitted, and appears in no stored value except the identity store.
- **AC-10**: `dayRng(dayKey)`, exported by the state layer, returns the same sequence for the same client and day on every call, and a different sequence for another day or another client.
- **AC-11**: When storage throws on read or write (unavailable, blocked, or a quota error), the store continues in memory, exposes `persistent: false`, and no exception escapes to the caller.
- **AC-12**: A `storage` event for one of the four keys rehydrates that store in the other tab, and both tabs then report the same day.
- **AC-13**: The recorded day never exceeds the engine's contract: at most three offered ids, no duplicate among them, and at most one accepted topic per day; a fourth offer or a repeat is refused without throwing.
- **AC-14**: A synthetic 45 day log prunes to exactly 30 days on load, and the accepted tally is unaffected by the prune.
- **AC-15**: Every rule above has a test, and deliberately breaking a rule (skipping the version check, skipping the prune, ignoring a stale day key) makes the suite fail.

## Options considered

### Option 1: Four small zustand stores, each with its own validating reader

One store per key. Each store reads its key through a validator that checks the version and the shape, then saves the whole value through an injected writer. A store that fails validation gets its safe default while the others load normally. The storage adapter is a small interface, so tests use memory and the browser uses `localStorage`.

**Pros**:
- Damage is contained: a corrupt day costs a day, not the journey.
- Every rule (version, prune, stale day) is a pure function with a test, so no browser is needed.
- The subscription zustand provides is what Phase 4 needs to render the day and the count.

**Cons**:
- Four keys mean four reads on load and four writes spread across actions; more surface than a single blob.
- Validation code has to be maintained beside every shape change.

### Option 2: zustand's `persist` middleware on every store

Let the middleware rehydrate and write each store, with its own `version` and `migrate` options.

**Pros**:
- Little code: the middleware handles reading, writing, and hydration.
- A familiar pattern for zustand projects.

**Cons**:
- Its default storage is `window.localStorage`, which couples the module to the browser and defeats a node test.
- On unreadable JSON it falls back to the initial state and overwrites the key, so a corrupted history is discarded with no way to say so, and no per store reporting.
- Its merge semantics replace state wholesale, which makes "reset only the slice that failed" a fight against the tool.

### Option 3: A hand rolled store with a subscription, no zustand

A small module holding four values, a `subscribe` function, and explicit reads and writes.

**Pros**:
- No dependency and no framework behaviour to fight.
- Full control over validation and persistence.

**Cons**:
- Reimplements what zustand already provides, and MCD D2 picks zustand for state.
- The app would grow its own store convention, a second pattern to learn.

## Decision

**Chosen option**: Option 1: four small zustand stores, each with its own validating reader

The state layer is one module that creates four zustand stores, one per key, each loaded through a validator and saved through an injected storage adapter, with the engine's per day stream rebuilt by one exported helper.

## Rationale

Containment is the deciding force. The product's promise is a ritual that keeps going, and the failure the owner asked about first was a damaged store; a single blob would turn one bad byte into a lost journey, while four validating readers make the blast radius one day. The middleware option is rejected because it binds the module to `window` and treats a corrupt value as an empty store, which is exactly the silent reset this feature must be able to report, and because its wholesale merge cannot honour "reset only the slice that failed". zustand stays because MCD D2 already chose it and because Phase 4 needs a subscription; the persistence half is written here, not inherited, so versioning, pruning, and the persistent flag are ours to test.

The accepted day tally is the second deliberate deviation from a literal reading of MCD §5: a 30 day history cannot count 90 days, so progress keeps its own small list. History stays a 30 day window, as PRD §22 requires, and the tally is the only value that outlives it.

## Feature design

**Data model sketch**:

| Store | Key | Shape | Notes |
|---|---|---|---|
| Identity | `anansi:v1:identity` | `{ version: 1, clientId: string }` | Created once on first load |
| Day | `anansi:v1:today` | `{ version: 1, dayKey: string, offeredTopicIds: string[], acceptedTopicId: string \| null }` | At most three ids, in offer order |
| History | `anansi:v1:history` | `{ version: 1, records: TopicRecord[] }` | Engine shape, pruned to 30 days |
| Progress | `anansi:v1:progress` | `{ version: 1, journeyStart: string, journeysCompleted: number, acceptedDayKeys: string[] }` | Tally holds at most 90 keys |

Relationships: the day's key is the day key of the records it produced (one to many, joined by `dayKey`); a tally entry refers to a day that may no longer exist in history once pruned. `TopicRecord` and `DayState` are the engine's own shapes, imported rather than redeclared (basis: spec 0001, the contract).

**State transitions**:

```
day:     absent ──load──> fresh (dayKey = today)
                  fresh ──offer──> 1 offer ──offer──> 2 ──offer──> 3 (full)
                  any ──midnight──> discarded, a fresh day begins
journey: running (tally 0..89) ──90th acceptance──> complete ──next access──> next journey (tally 0)
```

**API surface**:

| Export | Kind | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `createJourneyStore(options)` | factory | `storage`, `today()`, `now()` (all optional, injected) | a store with state and actions | none | none raised |
| `store.ensureToday()` | action | none | today's `DayState`, rolled if the key changed | none | none |
| `store.offer(topicId)` | action | a topic id | the updated day, plus one `TopicRecord` | none | refuses a fourth offer or a repeat |
| `store.accept(topicId)` | action | a topic id already offered today | the updated day, the accepted record, the tally | none | refuses an id not offered today |
| `store.setStatus(topicId, status)` | action | `'explored' \| 'learned'` | the updated record | none | no-op when the topic is absent |
| `dayRng(dayKey)` | helper | a day key | `Rng`, seeded `clientId:dayKey` | none | none |

**Value sourcing**:

| Action | Value produced or displayed | Source |
|---|---|---|
| Load | today's day key | injected `today()`, defaulting to `getDayKey()` from the engine |
| Load | the client identifier | identity store, generated once with `crypto.randomUUID` and a fallback |
| Load | days completed | `progress.acceptedDayKeys.length`, for the current journey |
| Load, then after each write | the 30 day cutoff | derived from `today()` and the day arithmetic helper in this module |
| Offer | the record's `presentedAt` | injected `now()`, defaulting to `Date.now()` |
| Offer | whether the day is full | `day.offeredTopicIds.length` against the engine's `storiesPerDay` |
| Accept | whether a day counts | `acceptedDayKeys` membership, appended once per day |
| Accept | the journey roll | the tally length reaching 90, applied on the next access |
| Any write | `persistent` | the storage adapter, set false the first time a read or write throws |
| Any read | whether a value is usable | its `version` field and shape, checked by that store's validator |

**Key invariants**:

- At most three offered ids per day, all distinct, in offer order.
- At most one accepted topic per day, and only one already offered that day.
- The tally holds one entry per day, at most 90, and only for the current journey.
- No history record older than 30 days survives a load or a write.
- Every stored value carries `version: 1`; a value without it is corrupt.
- The day key is always the current local day whenever it is read.
- Nothing throws: a missing, corrupt, or unwritable store degrades, it never fails.
- The module has no network code and reads no clock except through the injected `today` and `now`.

**Security model**:

All data stays in the browser. There is no authentication, no account, and no network call anywhere in the module. The client identifier is a random string used only to seed the engine; it identifies a browser, not a person, and is never sent anywhere (basis: MCD D6, spec 0001). `localStorage` is readable by any script on the origin, so nothing sensitive may be stored there; the journey is not sensitive. Clearing browser data clears the journey, an accepted trade (basis: MCD D6). No compliance scope applies.

**Configuration required**: none. The module adds no environment variables, secrets, or third party credentials.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: a fresh store offers three stories, accepts one, and a store rebuilt from the same storage reports the same day and tally, verifies **AC-2**, **AC-7**.
- Failure case: storage that throws on every call still lets the ritual run, exposes `persistent: false`, and throws nothing, verifies **AC-11**.
- Corrupt case: garbage in the day key while history and progress are intact starts a fresh day and keeps the journey, verifies **AC-3**, **AC-4**.
- Rollover case: a day written yesterday, read after midnight, is replaced by a fresh day while yesterday's records stay in history, verifies **AC-5**.
- Boundary case: a fourth offer and a repeated acceptance are refused, verifies **AC-13**.
- Batch case: a 45 day log loads as 30 days, and 90 accepted days roll the journey to the second one, verifies **AC-6**, **AC-8**, **AC-14**.
- Two tab case: a `storage` event rehydrates the changed store, verifies **AC-12**.
- Boundary case: the module boundary is asserted by its own purity test, verifies **AC-1**, **AC-15**.

## Build plan

The project's approach is Tracer Bullet, so the pipe stands up thin and then thickens: a validated round trip through one key first, then the day, the prune, the tally, identity, and cross tab sync, each with its test arriving alongside it.

1. Declare the shape envelope, the four validators, safe defaults, and the memory storage adapter, each pure and tested on its own. satisfies **AC-3**, **AC-4**, **AC-11**
2. Stand up the store factory on zustand with injected storage, day source, and clock, and prove a write then a rebuild returns identical values. satisfies **AC-1**, **AC-2**
3. Add `ensureToday`, so a stale day key is discarded on access and the history keeps the old records. satisfies **AC-5**
4. Add the 30 day prune on load and after each write. satisfies **AC-6**, **AC-14**
5. Add `offer`, `accept`, and `setStatus`, enforcing the day's limits. satisfies **AC-13**
6. Add the accepted day tally and the journey roll at 90. satisfies **AC-7**, **AC-8**
7. Add the generated client identifier and `dayRng`, with the test that a rebuilt stream reproduces a day. satisfies **AC-9**, **AC-10**
8. Add the `storage` event listener that rehydrates a changed store. satisfies **AC-12**
9. Add the module purity test and the mutation checks for the version, prune, and stale day rules. satisfies **AC-15**, **AC-1**

No migration is needed: `src/state/` is new, there is no stored data yet, and the keys did not exist before this spec.

## Implementation notes (2026-10-17)

The build followed the plan. Four choices were made where the spec fixed a behaviour rather than a mechanism, and each is recorded so a later reader does not have to infer it from the code:

1. **zustand's vanilla store, not the React binding.** The module exports `createJourneyStore`, built on `zustand/vanilla`, so the layer renders nothing and the suite runs in the node environment. Phase 4 can wrap it with `useStore` without the state module depending on React.
2. **The store takes `today` and `now` as injected functions**, defaulting to the engine's `getDayKey` and `Date.now`. Nothing reads a clock while a store is being imported, which is what keeps the tests deterministic.
3. **Accepting a later story clears the earlier accepted flag.** The day keeps exactly one accepted record, so the tally and the records cannot disagree about which story the day belonged to.
4. **The journey rolls on the next access, not on the acceptance that fills it.** The ninetieth day stays on screen as the day the person finished; the roll happens the next time the store is read.

`watchStorageEvents` is a separate export rather than a listener registered inside the factory, so a test can drive it with a fake target and a caller can dispose of it.

## Consequences

**Positive**:
- Today's story survives a reload, a restart, and a second tab, which is what makes the ritual usable and what clears the reload half of gate G3.
- A damaged store costs one day rather than the journey, and the interface can be told that storage is not working.
- The 90 day count keeps counting after the history behind it has been pruned.
- Every rule is testable in the node environment, with no browser and no mocks of `window`.

**Negative / tradeoffs**:
- The tally and the history are two records of the same acceptances, so a caller that writes history directly could make them disagree; only the store's actions may write.
- Four keys mean four writes rather than one, and a save rewrites the whole history slice each time; at 30 days of records that is still small, but it grows with the window.
- `localStorage` is synchronous and around 5 MB per origin; the model fits easily today, and would not if the window grew to years.
- Two tabs are reconciled after the fact, not locked, so a rapid reroll in both tabs can still lose one tab's write.
- No version 0 exists, so the version check can only be proven by a bad value, not by a real migration.

**Neutral**:
- zustand becomes a live dependency rather than an installed one.
- `src/state/` appears where the teardown and MCD §3 planned it.
- The app still does not call the store until Phase 4, so the state layer is built and tested but not yet visible.

## Follow-up

- [ ] Amend MCD §5's state schema to carry `acceptedDayKeys` and the version envelope, since the tally is a correction to the recorded model rather than a new decision.
- [ ] Phase 4 must route every read and write through the store's actions and never touch `localStorage` directly, or the tally and the history can drift.
- [ ] Phase 4 should surface `persistent: false` honestly when storage is blocked, rather than pretending the day was saved.
- [ ] Consider an export and import of the journey in the accounts era; V1 deliberately has none (MCD D6).
- [ ] Revisit the storage medium if the history window grows past a few thousand records, where synchronous writes would become visible.

## References

**Project sources** (verifiable, in this repo):

- `docs/MCD.md` D5 (local day, three stories, accepted clock spoofing), D6 (accountless, per browser state), §5 (state schema, zustand with localStorage)
- `docs/BUILD_ROADMAP.md` Phase 3, steps 3.1 to 3.6, and gate G3's reload half
- `docs/PRD.md` §19 (90 day progress, no failure state), §22 (30 day rolling history), §38 (no backend)
- `docs/specs/0001-selection-engine.md` (the engine contract, the record and day shapes, the per day stream obligation)
- `src/engine/types.ts` and `src/engine/rng.ts` (the shapes stored and the stream rebuilt)

**Practices & standards**:

- A version envelope per stored value, with validation on read, so a shape change can be detected rather than guessed
- Injected dependencies (storage, clock, day source) so persistence logic is testable without a browser
- Least data retained: a rolling 30 day window, with progress kept as the smallest value that outlives it
- Idempotent recording of a day, so a repeated acceptance cannot inflate the count
- Storage events for cross tab consistency, with validation on the receiving side
