# 0001. Select the day's stories with hidden diversity

**Date**: 2026-10-16
**Status**: In Progress
**Built**: 2026-10-16 — `src/engine/types.ts`, `tuning.ts`, `offer.ts`, 44 engine tests

## Summary

The selection engine is the piece that turns a pool of topics, the day's date and the local history into the stories offered today, and it does not exist yet. This spec decides how it works: a pure TypeScript function, no clock and no storage, that returns one story at a time along with the reason it chose it, so the interface can be honest about a repeat while the reasoning behind the choice stays invisible. The numbers behind the choice live in one frozen object so they can be tuned and tested in one place, and the same input always produces the same story, so a reload never reshuffles the day.

## Context

The engine is the heart of controlled serendipity (PRD §17) and the shortest path to a product that does the one thing it exists to do: choose a topic. Today `src/engine/` holds only the two lowest pieces, the local day key and the seeded random source, with 14 tests (basis: `docs/SYSTEM_TEARDOWN.md` §7.2, `docs/specs` absent). Everything downstream waits on it: state, the ritual loop, history and the world all consume its decisions (basis: `docs/BUILD_ROADMAP.md`, the ordering argument).

The forces are unusually well defined, and they mostly come from the product rather than from scale. There is no server and there never will be in V1, so the engine runs in the browser as a pure module with its dependencies handed in (basis: MCD D4, §5). Time spent on the site is a failure signal, so the engine optimises for a good single story rather than for engagement (basis: PRD §2). A day offers at most three stories, the third is the day's story, and refreshing must never reshuffle them, which makes determinism a product requirement rather than a nicety (basis: MCD D5). Difficulty is internal and must never reach the user (basis: PRD §13), and whole categories of topic are excluded outright (basis: PRD §14). The pool is expected to reach 300 topics or more, and it holds 24 today (basis: MCD §6, `content/topics/`).

Two facts about the present state shape the decision more than the eventual target does. First, a 30 day exclusion window and up to three offers a day consume a 24 topic pool in about eight days, so the empty window is not an edge case, it is what happens in the second week of use. Second, the input the engine may read carries no record of why a story was shown, only that it was, so a guaranteed weekly cadence for the rare return cannot be enforced from the input as it stands.

> ⚠️ Premise note: two parts of the ratified rules are being written against a pool 12 times smaller than the launch target, and the mismatch is not fixable inside the engine. The thin pool behaviour below is therefore part of this decision rather than a later refinement, and it will be the common path until the pool grows. Separately, the guaranteed weekly cap on returns described in MCD §5 and in roadmap 2.6 cannot be met without recording why each story was shown; on your instruction this spec trades that guarantee for a tuned chance, and Follow-up records the derivation that would restore it later without a model change.

## Requirements

**User stories**:

- As a person using the ritual, I want today's story chosen for me without ever seeing how it was chosen, so that the discovery feels like serendipity rather than a feed.
- As a person returning to the site mid day, I want the offers I have already seen to stay identical, so that refreshing never reshuffles my day.
- As the engineer building the loop and the world, I want one pure function with everything injected, so that I can test every rule without a browser and move it to a server unchanged in the accounts era.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: `src/engine/` imports nothing from `app/`, `world/` or `state/`, reads no clock, touches no storage or DOM, and the whole suite passes in the existing `node` environment. A test fails when an import crosses that boundary.
- **AC-2**: Two calls with equal input return deeply equal results, in the same process and across separate runs.
- **AC-3**: The same library and history under a different seed, or the same seed under a different day key, does not reproduce the same sequence of offers.
- **AC-4**: Rebuilding the input from stored day state and asking again returns the identical next offer, and asking after the day state records that offer returns the following one.
- **AC-5**: No topic whose last presentation falls inside the 30 day window is offered, except through the thin pool path (AC-6) or as a return (AC-14).
- **AC-6**: When the window leaves no candidate, the offer is the least recently presented topic not already offered today, and it carries `because: 'thin-pool'`.
- **AC-7**: Once three stories are recorded for the day key, the call returns no story and the reason `day-complete`.
- **AC-8**: No offer repeats a topic already recorded in the day's offered list.
- **AC-9**: An empty library returns no story and the reason `empty-library`, without throwing.
- **AC-10**: A pool whose every topic is already offered today, while the day is short of three, returns no story and the reason `no-candidate`.
- **AC-11**: Of two candidates that are otherwise equal, the one whose domain was least recently offered is returned (a deterministic test with a crafted library and a fixed seed).
- **AC-12**: Over a long sequence from a 300 topic library, no three consecutive offers share a domain, and the domain sequence repeats no rotation of period 3 or 4 inside any 40 offer window.
- **AC-13**: Over 300 consecutive offers from a 300 topic library, across at least 20 seeds, each difficulty level's share stays between 25 percent and 42 percent.
- **AC-14**: `because: 'resurfaced'` is returned only for a topic whose `resurfacing` is true and whose last presentation is at least 60 days before the day key.
- **AC-15**: Over a year of simulated days across at least 20 seeds, the share of days carrying a return stays between 8 percent and 20 percent, and no return occurs inside the first 61 days of a fresh history.
- **AC-16**: The library, history, day state and tuning object are unchanged after any call, and the returned topic is the library's own object by identity.
- **AC-17**: Every rule here has at least one test, and deliberately breaking a rule (widening the window, skipping the day exclusion, ignoring the spread) makes the suite fail.

## Options considered

### Option 1: A stateless entry point, weights in one tuning object

One pure function takes the library, the history, the day state and the random source, and returns a result: a story with the reason it was chosen, or a reason there is none. Eligibility rules narrow the pool, a scoring function ranks what remains, and a weighted draw picks from the ranking. All numbers live in a single frozen object.

**Pros**:
- Every rule is testable in isolation, in the `node` environment already configured.
- Reload stability falls out of statelessness: the day state carries the memory, so the same input can only produce the same answer.
- Lifts to a server function unchanged, which is the whole point of the purity contract (MCD §5).

**Cons**:
- The caller must pass state back in correctly, and the random source must be rebuilt the same way on every call, so part of the determinism contract lives outside the engine.
- A weighted draw spends a random value on taste rather than on variety, so the same candidate set can yield different stories under different seeds.

### Option 2: A day ledger, computed once and stored

The first call of a day computes all three stories at once and the caller stores them; rerolls read the ledger.

**Pros**:
- Determinism is trivial to reason about: the day is decided once.
- Fewer scoring passes per day.

**Cons**:
- The engine or the caller must hold mutable state, which either breaks the purity contract or pushes a second state shape into the state layer.
- History changes during the day (each offered story is logged as Explored), so a ledger computed at the start is already stale for the third offer, and the diversity rules lose their input.
- A reload before the ledger is written is a hole the state layer must patch.

### Option 3: Highest score always wins

No draw at all: rank the eligible candidates and take the top one.

**Pros**:
- Simplest to implement and to explain, and fully deterministic without a random source.
- No tuning of draw behaviour.

**Cons**:
- With a small pool the same top candidate wins repeatedly, which reads as mechanical rather than random (basis: PRD §17, the rules stay invisible).
- It removes the seeded random source from the selection step, contradicting the per day seeding the MCD fixes (basis: MCD D5, §5).

## Decision

**Chosen option**: Option 1: a stateless entry point, weights in one tuning object

The engine is one pure function, `offerNextStory(input)`, returning either a story with the reason it was chosen or a reason there is no story; every number it uses lives in a frozen `ENGINE_TUNING` object.

The reason travels with the story because the interface must be able to tell the truth: a normal new story, a story brought back after a long absence, or the oldest story repeated because the pool is thin. The treatment for a return is the interface's business (basis: PRD §18), but its source is this field.

## Rationale

The product forces decide this. A browser only engine with no server means the module must be pure and injectable, which rules out anything holding its own state (Option 2) and rules out reading a clock for the day (the day arrives in the input). A ritual where time on site is a failure signal cannot afford an offer that feels mechanical, and with a 24 topic pool a deterministic argmax (Option 3) would keep returning the same best candidate, so a seeded draw over a ranked set is the shape that keeps the reasoning invisible while staying reproducible.

Keeping every number in one frozen object is the consequence of having no measured data yet: the weights, the 30 day window, the 60 day absence and the return chance are judgement calls today, and they will be tuned once the pool passes the roadmap's practical start of 40 to 60 topics (basis: `docs/BUILD_ROADMAP.md` 1.2). Putting them in one place makes that tuning a one line change with a test behind it, rather than a hunt through the rules.

Two smaller calls made here rather than asked (basis: engineering practice, stated so they can be overridden). Date comparison uses the day key's own string order for the window and parses day keys to UTC midnight only when a distance in days is needed, so no clock is ever read. The rarity roll and the pick together consume at most two values from the random source per call, in a fixed order, so the offer depends only on the input and the seed and never on how many values the caller has already consumed.

## Feature design

**Data model sketch**:

| Entity | Key | Fields | Notes |
|---|---|---|---|
| `Topic` | `id` (slug, equals the file name) | `title`, `domain`, `difficulty` (1, 2 or 3), `tags`, `resurfacing`, `added` | Already shipped; the engine reads it and never changes it |
| `TopicRecord` | `topicId` plus `dayKey` | `presentedAt` (epoch milliseconds), `accepted` (boolean), `status` (`explored` or `learned`) | The engine's history input; one record per story shown, rerolled or not |
| `DayState` | `dayKey` | `offeredTopicIds` (up to three, in offer order), `acceptedTopicId` (or null) | The engine's day input; carries the day's cap and the reroll memory |
| `SelectionInput` | (value) | `library`, `history`, `day`, `rng` | The contract MCD §5 fixes |
| `EngineTuning` | (value, frozen) | `storiesPerDay`, `exclusionWindowDays`, `resurfaceAbsenceDays`, `resurfaceChance`, `spreadWindow`, `spreadTarget`, weights | New; exported and documented so the tests and later tuning read the same numbers |
| `Offer` | (value) | Either `{ kind: 'story', topic, because }` where `because` is `new`, `resurfaced` or `thin-pool`, or `{ kind: 'none', reason }` where `reason` is `day-complete`, `empty-library` or `no-candidate` | New; the single entry point's result |

Relationships: `Topic` one to many `TopicRecord` by `topicId`; `DayState` one to many `TopicRecord` by `dayKey`; `DayState.offeredTopicIds` many to many `Topic.id`, ordered. `Progress` is deliberately outside this spec: it is not an engine input and belongs to the state layer (basis: MCD §5, Phase 3.5).

**State transitions**:

The engine holds no state; the day's offer count is read from `day.offeredTopicIds`, and only its length matters for the rules below.

```
day: no offers ──offer──> one offer ──offer──> two offers ──offer──> three offers (day-complete)
             └─ none: empty-library, no-candidate
acceptance is not modelled here: it is recorded in history and day state by the caller
```

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `offerNextStory(input)` | pure function call | `library: Topic[]` (required), `history: TopicRecord[]` (required, may be empty), `day: DayState` (required), `rng: () => number` (required) | an `Offer`: the topic plus `because`, or a `reason` there is none | none, local only | none raised; no candidate and an empty library are results, not exceptions |

Working name only: `/develop` may rename the module and the fields as long as the input contract and the result union keep their shape. The resume era depends on the contract, not the spelling.

**Value sourcing** (every value each action produces, computes, or displays names where it comes from):

| Action | Value produced or displayed | Source |
|---|---|---|
| Guard the day's cap | whether the day is complete | `day.offeredTopicIds.length` against `ENGINE_TUNING.storiesPerDay` (MCD D5) |
| Guard the empty library | whether there is anything to offer | `library.length` |
| Test the exclusion window | each topic's last presentation day | derived from `history`, the greatest `dayKey` per `topicId` |
| Compare against the window | whether a presentation is inside 30 days | `day.dayKey` minus the record's `dayKey`, computed from the day key, never from a clock |
| Order the thin pool | which topic is least recently presented | derived from `history`, with topics that were never presented treated as fully eligible |
| Rarity roll | whether today may carry a return | `rng`, first value of the call, against `ENGINE_TUNING.resurfaceChance` |
| Test return eligibility | the absence since the last presentation, and `resurfacing` | `history` per topic, plus `Topic.resurfacing` |
| Score a candidate | domain recency, tag overlap, time since exposure | derived from `history` and `library` (domain and tags come from the topic, recency from the recorded days) |
| Score a candidate | the difficulty spread term | derived from the last `spreadWindow` records in `history`, mapped to levels through `library` |
| Pick the offer | which candidate is returned | `rng`, second value of the call, applied to the ranked candidates |
| Say why | `because` | which path produced the offer: the window, the return rule, or the thin pool |
| Seed the random source | the offer sequence for the day | the caller, from the client identifier and the day key (MCD D5); the state layer owns the identifier (Phase 3.6) and this engine never sees it |
| Tell the local day | the day key | `day.dayKey`, supplied by the caller from the day state; `getDayKey()` in this module provides the value, and the engine never calls it |

**Key invariants**:

- No topic appears twice in one day's `offeredTopicIds`.
- At most one offer is returned per call, and it is always a topic from the given library, returned by identity.
- The engine never mutates its inputs and never reads the clock, storage, the DOM or the network.
- Eligibility is decided before scoring: a topic inside the window is unreachable except through the thin pool path.
- `because: 'thin-pool'` is returned only when the window produced nothing; `because: 'resurfaced'` only for a flagged topic past the absence gap; otherwise `because: 'new'`.
- The number of values drawn from `rng` depends on the branch taken, never on the data: at most two per call, in a fixed order.

**Security model**:

No authentication, no authorisation, no network and no personal data. The engine reads a topic pool that ships with the application and a history that stays in the browser. The client identifier is never passed in as a field; it reaches the engine only as part of the seed string the caller builds, and never leaves the device (basis: MCD D4, D6, Phase 3.6). No compliance scope applies, and there is nothing to rate limit because nothing is exposed.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: a fresh day against the real 24 topic library returns a story with `because: 'new'`, twice in a row identically, and a third call returns a different topic, verifies **AC-2**, **AC-5**, **AC-8**.
- Failure case: a history that excludes every topic, and a pool of two topics with two offers already recorded, both return a reason instead of a story, verifies **AC-6**, **AC-10**, **AC-9**.
- Reload case: an input rebuilt from stored day state returns the identical next offer, verifies **AC-4**, **AC-16**.
- Long sequence: 300 offers from a synthetic 300 topic library across 20 seeds, asserting no three in a row from one domain, no period 3 or 4 rotation, the spread within bounds and the return rate inside its band, verifies **AC-12**, **AC-13**, **AC-15**.
- Boundary case: permission to note that there is no auth surface here; the boundary that matters is the module boundary, asserted by the purity test, verifies **AC-1**.

## Build plan

The project's approach is Tracer Bullet, so the plan stands the pipe up thin first: a working entry point with one guard and one draw, proven pure and reproducible, then thickens the rules one at a time with its test arriving alongside each.

1. Declare the contract: the input shapes, the result union and the frozen tuning object with the reasoning for each number. satisfies **AC-1**
2. Stand up the thinnest working pipe: `offerNextStory` with the day complete and empty library guards, and a single draw over the eligible candidates with no scoring yet, plus a test proving purity, identical results for equal input, different results for different seeds, and an unmutated input. satisfies **AC-1**, **AC-2**, **AC-3**, **AC-7**, **AC-9**, **AC-16**
3. Add the eligibility rules: the 30 day window and the day's own exclusions, with the no candidate reason when nothing survives. satisfies **AC-5**, **AC-8**, **AC-10**
4. Add the thin pool path, least recently presented first, carrying its own reason. satisfies **AC-6**
5. Add the scoring terms in their stated order of weight: domain recency first, then tag overlap, then time since exposure. satisfies **AC-11**, **AC-12**
6. Add the difficulty spread term over the rolling window. satisfies **AC-13**
7. Replace the single draw with the weighted pick over the ranked candidates. satisfies **AC-12**, **AC-13**
8. Add the return rule: one rarity roll, the 60 day absence, flagged topics only, and the reason it carries. satisfies **AC-14**, **AC-15**
9. Add the statistical suite over many seeds and the mutation check, and the purity test that fails when an import crosses the module boundary (this also closes teardown risk R6). satisfies **AC-17**, **AC-1**

## Implementation notes (2026-10-16)

The build followed the plan above. Three rules were needed that the spec fixed as behaviour rather than mechanism, and each is recorded here rather than left implicit in the code:

1. **A repeated-domain guard.** Domain recency at 0.6 could not, on its own, make "no three consecutive offers from one domain" hold, so a third story in a row from the same domain is refused whenever another candidate exists. The guard is skipped rather than respected when it would strand the day, so a one-domain pool still offers a story.
2. **A dominance ratio.** When the best candidate scores at least 1.5 times the second best, it wins outright and the draw is not consulted. Without it, AC-11 could only be probabilistic; with it, a decisive domain-recency gap is deterministic and a close call still goes to chance.
3. **The rarity roll is read from the caller's per-day stream**, and that stream is rebuilt identically for every call of the day (the determinism contract below). All three offers of a day therefore see the same first value, which makes the chance effectively one draw per day. `resurfaceChance` is 1 in 7, and the measured share of days carrying a return sits inside AC-15's band.

One reading is worth recording: AC-14 allows a return at exactly 60 days, while AC-15 says no return inside the first 61. The build takes AC-14 as authoritative — the first legal return is day 61 of a fresh history — and the test asserts no return in days 1 to 60.

## Consequences

**Positive**:

- The day is reproducible from its inputs alone, so a reload, a second tab and a device restart cannot reshuffle it.
- Every rule is testable without a browser, which is what makes the roadmap's gate G3 reachable.
- The offer explains itself, so the interface can render the return treatment and an honest thin pool note without inventing a reason of its own.
- The module stays portable, so the accounts era remains a move rather than a rewrite.

**Negative / tradeoffs**:

- With the pool at 24 topics the thin pool path starts repeating topics within about eight days of use. The flag makes that honest rather than hidden, but a repeat is still a repeat, and the pool is the real fix (roadmap 1.2 and scope feature 3).
- The guaranteed weekly cap on returns is not delivered. Two returns can land inside one week, which contradicts MCD §5's resurfacing bullet and roadmap 2.6's done when line as written; this is a deliberate trade made by the product owner, and both documents must be corrected rather than left to disagree (see Follow-up).
- The difficulty spread is statistical, not guaranteed: a short run can skew toward one level, and the tolerance in AC-13 is the honest statement of what the rule promises.
- Determinism now depends on a contract outside the engine: the caller must build the random source the same way on every call, from the client identifier and the day key. If the state layer rebuilds it differently, the day can change on reload, and no test in this engine would catch it.
- The engine ranks the whole library per offer. That is trivial at 300 topics and irrelevant below that, but it is O(n) per offer and worth knowing before the pool grows.

**Neutral**:

- This is the first spec in the repository, so `docs/specs/` appears where the teardown recorded it missing.
- `TopicRecord` and `DayState` are declared in the engine for now; the state layer either imports these shapes or maps to them explicitly (Phase 3).
- MCD §5's input snippet names `HistoryEvent`; the engine will receive `TopicRecord`, the shape the state schema already uses, and the snippet should be reconciled (see Follow-up).
- Acceptance stays outside the engine: the state layer records it, and the engine only reads the offered list. That keeps the third story rule and the day's story rule in one place, where Phase 4 needs them.

## Follow-up

- [ ] Consider restoring the guaranteed weekly cap without changing the model: a return is derivable from consecutive history records (a record whose previous presentation of the same topic is 60 days or more earlier), so the cap can be computed from the input alone. Recommend adopting it once the pool passes 100 topics.
- [x] Reconcile the two documents that still promise the cap: MCD §5's resurfacing bullet and roadmap 2.6's done when line. Both were corrected on 2026-10-16 to describe a tuned chance instead.
- [x] Update MCD §5's input snippet from `HistoryEvent` to `TopicRecord` so the contract and the code agree.
- [ ] Phase 3 must store the record and day shapes the engine declares, or map to them explicitly, and must build the random source as a fresh stream per call from the client identifier and the day key. A state layer test must assert that a rebuilt stream yields the same day, since no test inside the engine can catch that mistake.
- [ ] Phase 4 consumes `because` to render the return treatment (PRD §18) and any thin pool note, while the reveal keeps showing a title and nothing else.
- [ ] Re-read the tuning values at the roadmap's practical start of 40 to 60 topics and again at 300, and record what changed.

## References

**Project sources** (verifiable, in this repo):

- `docs/PRD.md` §2 (time on site as a failure signal), §13 (internal difficulty), §14 (exclusions), §17 (controlled serendipity), §18 (intentional resurfacing)
- `docs/MCD.md` D4 (no backend), D5 (day rules), §5 (engine contract, rules and state schema), §3 (the engine boundary)
- `docs/BUILD_ROADMAP.md` Phase 2 steps 2.1 to 2.7, its rule 1 on engine purity, and gate G3
- `docs/scope/scope.md` feature 1, its done when line and its intent
- `src/content/types.ts` (the topic schema), `src/engine/rng.ts` and `src/engine/dayKey.ts` (the existing primitives)
- `docs/SYSTEM_TEARDOWN.md` risk R6 (engine purity unenforced), which task 9 closes

**Practices & standards**:

- Pure functions with injected dependencies, so decisions are reproducible and testable without a browser
- Seeded pseudo random number generation for reproducibility, and a fixed draw order so the result cannot depend on caller consumption
- Weighted sampling over a ranked set instead of a hard argmax, to avoid a mechanical sequence
- Least recently used selection as the fallback when a preference set is empty (the familiar cache eviction policy, applied to a topic pool)
- Statistical assertions over many seeds for behaviour that must feel random, rather than a single example
- A rarity roll as a Bernoulli trial with a deliberately small probability, in place of a scheduled cadence
