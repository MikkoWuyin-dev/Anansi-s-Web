# 0004. A searchable history drawer and the quiet journey count

**Date**: 2026-10-18
**Status**: Built
**Built**: 2026-10-18 — `src/app/history.ts` and `src/app/HistoryPanel.tsx`, 25 tests, the drawer and the count verified by keyboard in a browser

## Summary

This spec builds the plain practical list the ritual needs beside the metaphor, and the quiet count of days done. A control in the corner opens an inline panel under the ritual that lists the last thirty days of stories grouped by day, searchable by title or date, and filterable by All, Explored, and Learned. The count reads `37 / 90` from taken days only, and arrives once the first day is done. No storage shape changes and no dependency is added.

## Context

Phase 4 left the ritual complete but sealed off from its own history. A person can be given a story, keep it, and mark it learned, and then that story exists only as a row in `anansi:v1:history` that nothing reads. PRD §22 requires that history to be searchable, filterable, and easy to inspect, and §23 requires a conventional drawer or list alongside the visual metaphor. PRD §19 makes the count part of the product's identity while §21 forbids the streak framing that usually comes with it, so the drawer is also where the count has to live without becoming pressure.

The state layer already holds everything needed, in a shape that constrains the interface. History is a flat event log of `TopicRecord` (topic id, day key, timestamp, accepted flag, status), pruned to thirty days, and it stores no title. Titles live in the library, so a row's title has to be resolved at read time, and a record whose topic has left the library cannot be shown as a title at all. The count is `progress.acceptedDayKeys.length`, kept beside the history precisely because history prunes and a ninety day count cannot be derived from thirty days of it. The store also knows the current day key, which is the only honest source of "Today" and "Yesterday".

The constraint that shapes the drawer is the reveal's own rule. PRD §8 keeps domain, difficulty, and tags out of the story's surface, and the optional domain filter in roadmap 5.3 would put domain back on screen for a pool of twenty four topics across few populated domains, where it would mostly return empty results. That filter is therefore deferred rather than built.

## Requirements

**User stories**:

- As a person who has used the ritual for weeks, I want to find a story I met before, so that the web feels accumulated rather than reset each morning.
- As a person reflecting on what I have learned, I want to see the stories I marked understood apart from the rest, so that the list is a record of the ritual and not just a log.
- As a person ninety days in, I want a quiet number that says how far I have come, so that missing a day does not turn into a warning.
- As a person on a keyboard, I want the whole list reachable and operable without a pointer, with focus always visible.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: A history control is present in every ritual state (hero, searching, story, failed, empty), is keyboard reachable, reports whether the panel is open (`aria-expanded` and `aria-controls`), and opens the panel inline below the ritual.
- **AC-2**: The panel lists every stored record whose topic is still in the library, grouped under day headings newest day first, and newest first within a day. Each row shows the topic title in natural case, the day, and its status, Explored or Learned.
- **AC-3**: No domain, difficulty, tag, or definition appears in the drawer's rendered markup. A test fails if a topic's `domain`, `difficulty`, or `tags` value reaches it.
- **AC-4**: All shows every row, Explored shows the rows not marked learned, and Learned shows only the learned rows. The count shown on each filter agrees with the rows that filter displays.
- **AC-5**: Search matches titles ignoring case and accents, and matches a day in both its ISO form (`2026-10-12`) and its written form (`12 October 2026`). A search and a filter combine.
- **AC-6**: A query or filter that matches nothing shows one sentence saying so and a control that clears both; a history with no records shows a different sentence; neither case is a blank panel.
- **AC-7**: A stored record whose topic has left the library never appears as a blank or placeholder row; the row is left out and the panel still reports its other rows.
- **AC-8**: The count reads `N / 90` from the current journey's accepted days, appears on the taken story and in the drawer header, and is absent before the first day is taken.
- **AC-9**: No streak, warning, badge, or language about a missed day appears in the drawer or beside the count.
- **AC-10**: The search and the filter stay as set when the panel closes and reopens, and reset on reload.
- **AC-11**: The open panel reflects the store immediately: a midnight roll or another tab's write changes the list without reopening it, and the panel keeps no copy of the history itself.
- **AC-12**: The whole drawer works by keyboard: the control, the search field, the filters, the clear control, and close are operable in order, focus is always visible, opening moves focus to the panel heading, and Escape closes the panel and returns focus to the control.
- **AC-13**: With `prefers-reduced-motion: reduce`, the panel and its rows carry the same information with no entrance animation.
- **AC-14**: Day headings read Today and Yesterday for the current and previous local day, and a written date from the browser locale otherwise. A row's day comes from its record's `dayKey`, never from the current timezone applied to `presentedAt`.

## Options considered

### Option 1: A pure history controller plus presentational markup

`src/app/history.ts` derives the whole panel from the store snapshot and the library: visible rows with resolved titles, day groups, heading labels, filter counts, and the count. `HistoryPanel.tsx` renders that view and owns nothing but its own focus management, and `App.tsx` holds the open state, query, and filter.

**Pros**:
- Every rule (search, accent folding, the Explored partition, missing topics, day labels) is testable in the existing node environment, with no dependency.
- The store stays the only copy of history; the panel is a projection, so a midnight roll or another tab's write is reflected for free.
- Matches the boundary Phase 4 established, so a later phase can move the drawer or replace the list without touching the rules.

**Cons**:
- One more module and a view type to keep in step with the markup.
- Filter state lives in two places conceptually (the derived view and the chosen filter) and has to be tested as a combination.

### Option 2: A self contained drawer component

One self contained drawer component that reads the store, filters with `useMemo`, and renders in one file.

**Pros**:
- Fewer files and less indirection for a surface this size.

**Cons**:
- Search, the filters, and the missing topic rule become untestable without a DOM environment, which the project deliberately does not have.
- The store read and the presentation would be inseparable, so the panel could quietly grow its own copy of history.

### Option 3: A dialog or disclosure primitive from an accessibility library

Add a headless primitive (Radix or React Aria) and build the drawer as a real overlay dialog.

**Pros**:
- A proven focus trap and dismissal behaviour, which an overlay needs to be correct.

**Cons**:
- A new dependency for one surface, in a project whose whole test story is built on adding none, and an overlay is not what was chosen: the design is an inline panel under the ritual, which needs no trap.

## Decision

**Chosen option**: Option 1: a pure history controller plus presentational markup.

The panel is derived from the store on every read, rendered by a component that only renders, with the open state, query, and filter held by `App` for the session. Fixed choices inside that decision:

- **Inline, not an overlay**: the panel is a `<section>` under the ritual with its own heading, reached from a pinned corner control. No focus trap, no backdrop, no scroll lock, and no dependency.
- **Explored means not yet learned**: the three filters partition the log, so each view is distinct and the counts on the filters sum to All. This is the only reading under which the PRD's three filters all do something.
- **One search field, two targets**: the query matches the resolved title and the day's text, normalized to lowercase with diacritics folded. A day is searchable as `2026-10-12`, `12 October 2026`, and as its `Today` or `Yesterday` label.
- **Titles resolved at read time**: the view joins `history` to the library by `topicId` and drops records it cannot title. The panel never shows a blank row and never invents a title.
- **Grouped by day, newest first**: a day heading comes from the record's `dayKey`, compared with today's `dayKey` for Today and Yesterday, and written through `Intl.DateTimeFormat` in the browser locale otherwise.
- **The count is derived, never stored twice**: `daysCompleted(progress)` drives both placements. At zero it renders nothing at all, so the first screen cannot open on `0 / 90`.
- **Focus is placed deliberately**: opening moves focus to the panel heading (`tabIndex={-1}`), Escape closes and returns focus to the control, and the control's `aria-expanded` follows the panel.
- **Filter state is session state**: the query and filter live in `App`'s component state, which survives closing the panel and resets on reload exactly as chosen.

**Implementation skills**: `frontend-design` (`freebuff/account-skills`, the account skills directory) was consulted for the panel's visual direction; the patterns it suggests are applied through the existing `ui-registry.md` tokens rather than new conventions.

## Rationale

The project's boundary is already proven: the engine chooses, the store records, the controller decides what the screen means, and the markup renders it. A drawer is a read of existing state, so putting its rules in a controller keeps the same property at no cost: search normalization, the Explored partition, the missing topic rule, and day labelling are all provable in node, and the browser pass is reserved for focus and Escape, which only a browser can prove. Option 2 would force the project's first DOM test environment for logic that is not really about the DOM, and Option 3 buys a dependency to solve a focus trap that an inline panel does not need.

The partition of the filters follows from the PRD's own definitions rather than from convenience. Explored means a story was presented, Learned means the person marked it understood, so every learned row was also explored; a filter that repeated All would be decoration. Treating Explored as "not yet learned" makes the three filters a real instrument for inspecting the journey, and keeps the counts meaningful.

## Feature design

**Data model sketch**:

No schema change. The panel reads what spec 0002 already stores:

| Value read | Shape | Source of truth |
|---|---|---|
| Every story shown in the last 30 days | `TopicRecord[]` (`topicId`, `dayKey`, `presentedAt`, `accepted`, `status`) | `anansi:v1:history` |
| A row's title | `Topic.title`, resolved by `topicId` | the compiled library |
| Days done in this journey | `Progress.acceptedDayKeys` | `anansi:v1:progress` |
| Today and Yesterday | `StoredDay.dayKey` | `anansi:v1:today` |
| The journey length | `JOURNEY_DAYS = 90` | `src/state/progress.ts` |

**State transitions**:

```
closed ──open──▶ open (All, empty query) ──filter / search──▶ open (filtered)
  ▲                    │                                           │
  └──Escape / close────┴───────────────────────────────────────────┘

open (any) ──store write (midnight, another tab)──▶ open (rederived)
```

The query and filter survive the closed state for the session; a reload starts at closed, All, and an empty query. A midnight roll while open leaves the panel open and regroups the rows under the new Today.

**API surface**:

| Module | Function | Key inputs | Key outputs | Errors |
|---|---|---|---|---|
| `src/app/history.ts` | `historyView(input)` | `state`, `library`, `query`, `filter`, `today` (day key), `locale` | rows grouped by day, counts, `empty` or `noMatches`, the count label | none; pure |
| `src/app/history.ts` | `dayLabel(dayKey, todayKey, locale)` | a day key, today's key, a locale tag | `Today`, `Yesterday`, or a written date | falls back to the ISO key if `Intl` rejects the locale |
| `src/app/history.ts` | `countLabel(days)` | days completed | `"37 / 90"`, or `null` at zero | none |
| `src/app/HistoryPanel.tsx` | `HistoryPanel(props)` | the view, the query, the filter, handlers, `headingRef` | the panel markup | none |
| `src/app/App.tsx` | `App()` | none new | the corner control and the panel when open | none |

The store is never written from the drawer. Every action is a read or a change of session state.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Open the panel | which records exist | the store's `history`, already pruned to 30 days (spec 0002) |
| Every row | the title | `library.find(topic => topic.id === record.topicId).title`; no match drops the row |
| Every row | the day | `record.dayKey` |
| Every row | Explored or Learned | `record.status`, the only status the store stores |
| Day heading | Today or Yesterday | `record.dayKey === todayKey`, or `record.dayKey === yesterdayOf(todayKey)` |
| Day heading | the written date | `Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })` on the day key parsed as a local date |
| Filter | All count | visible rows |
| Filter | Explored count | visible rows whose status is `explored` |
| Filter | Learned count | visible rows whose status is `learned` |
| Search | what a query is tested against | the title, plus `dayKey` and the written date, all folded with `toLocaleLowerCase` and `normalize('NFD')` with combining marks stripped |
| Search | Today and Yesterday as searchable words | the same `dayLabel` the heading uses |
| Header and taken story | the count | `daysCompleted(state.progress)` from `acceptedDayKeys`, hidden when 0 |
| Empty sentence | whether there are no records at all | `state.history.length === 0` |
| No match sentence | whether rows exist but none survive the filter | rows before filtering, compared with rows after |

**Key invariants**:

- The panel is a pure function of the store snapshot, the library, the query, the filter, and today's key; it keeps no cache and writes nothing.
- No `Topic` field other than `title` is rendered, and no field of a `TopicRecord` other than day and status reaches the markup.
- The three filter counts always sum to All, and each filter's rows equal its count.
- The count only ever grows through `progress.acceptedDayKeys`, and never mentions a missed day, a streak, or a target.
- A record that cannot be titled is dropped, never rendered blank and never titled with its id.

**Security model**:

Nothing leaves the browser; the drawer reads the same local stores as the ritual and adds no network call, no account, and no identifier. The panel prints titles, days, and statuses only, so a damaged or unexpected record cannot surface storage contents or error text.

**Configuration required**: none.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path: after three stories across two days, the panel groups them under Today and Yesterday, shows the learned one as Learned, and filters All, Explored, and Learned to the rows and counts expected, verifies **AC-2**, **AC-4**, **AC-14**.
- Search: `cobra` finds "The Cobra Effect", `october 12` and `2026-10-12` find that day, and an accented or differently cased query finds the same row, verifies **AC-5**.
- Empty and no match: a store with no records and a store with records but a query that matches none produce their own sentences and a clear control, verifies **AC-6**.
- Missing topic: a record whose id is absent from the library is dropped while its neighbours render, verifies **AC-7**.
- Count: the taken story and the drawer header show `1 / 90` after one accepted day, nothing before it, and the markup contains no streak or missed day language, verifies **AC-8**, **AC-9**.
- Purity: the rendered markup excludes every topic's `domain`, `difficulty`, and `tags`, verifies **AC-3**.
- Store reads: a store write after render changes the panel's rows without being re-rendered by a reopen, verifies **AC-11**.
- Keyboard: the browser pass opens the panel with Tab and Enter, moves through search and filters, closes on Escape, and returns focus to the control, verifies **AC-1**, **AC-12**.
- Reduced motion: with the media query emulated, no animation runs on the panel, verifies **AC-13**.
- Session: a filter and query survive close and reopen, and a fresh store read starts at All with no query, verifies **AC-10**.

## Build plan

Ordered as a Tracer Bullet, like Phase 4: the panel's data path first, so a real list of real rows renders end to end, then search and filters, then the count, then focus and the browser pass.

1. Create `src/app/history.ts` with `historyView`, joining history to the library and grouping visible rows by day newest first, satisfying **AC-2**, **AC-7**.
2. Add `dayLabel` and `countLabel`, with the Today and Yesterday rule, the locale written date, and the hidden zero case, satisfying **AC-8**, **AC-14**.
3. Add the three filters and their counts to the view, with Explored as "not yet learned", satisfying **AC-4**.
4. Add the query: diacritic folding, title matching, ISO and written date matching, and the combination with the filter, satisfying **AC-5**.
5. Add the two empty cases and the clear control's effect on both query and filter, satisfying **AC-6**.
6. Render `src/app/HistoryPanel.tsx`: the heading, the search field, the filters, the day groups and rows, and the count, with copy that names days done and never mentions a missed one, satisfying **AC-2**, **AC-3**, **AC-8**, **AC-9**.
7. Add the corner control to `App.tsx`, wire the panel in when open, hold the query and filter in component state, and read the live store snapshot, satisfying **AC-1**, **AC-10**, **AC-11**.
8. Do the focus and motion pass: heading focus on open, Escape to close with focus returned, the visible ring on every control, and no entrance animation under reduced motion, satisfying **AC-12**, **AC-13**.
9. Write the tests: the controller under node, the markup through `react-dom/server` including the purity and count assertions, then the keyboard and reduced motion pass in a real browser, satisfying **AC-1** through **AC-14**.

## Consequences

**Positive**:

- The journey becomes legible: every story met in the last thirty days is inspectable, searchable, and separable by how far it got.
- The count arrives with the first taken day and stays quiet, so progress is visible without becoming a target.
- The drawer reads the store rather than copying it, so it cannot drift from the ritual or from another tab.

**Negative / tradeoffs**:

- A row can only show what the store kept, so a learned story older than thirty days disappears from the list even though it still counts toward the journey.
- Titles come from the library, so a retired topic's history is invisible rather than preserved.
- "Explored" excludes learned rows, which is a deliberate departure from the word's broad meaning and needs the count beside the label to stay clear.
- The optional domain filter is deferred, so finding stories by sphere is not possible in this phase.

**Neutral**:

- The panel is another surface that must be kept in step with `ui-registry.md`, and the first use of `Intl` in the app, which makes the locale an explicit input in tests.
- History already prunes on access, so the drawer inherits the thirty day window without its own retention logic.

## Follow-up

- [ ] Roadmap 5.3, the optional domain filter, waits until the pool covers the domains properly. It should reuse this view rather than add a second filter path.
- [ ] A learned story older than thirty days leaves the drawer but stays in the count; if that proves confusing, the count and the list need one sentence that explains the difference.
- [x] `ui-registry.md` updated 2026-10-18 with the drawer, the corner control, and the count, per MCD §10.
- [x] Phase 5.2's milestone on scope feature 5 closed when the count shipped here.

## References

**Project sources**:
- `docs/PRD.md` §8 (the reveal's silence), §19 (the 90 day model), §21 (progress philosophy), §22 (topic history), §23 (history visualization)
- `docs/MCD.md` §5 (stored shapes), §7 (tokens), §9 (accessibility)
- `docs/BUILD_ROADMAP.md` Phase 5, sections 5.1, 5.2, and 5.3
- `docs/specs/0002-local-state-and-persistence.md` (the four stores and the pruning window), `docs/specs/0003-ritual-loop.md` (the controller and markup split)
- `ui-registry.md` (the baseline patterns and the single accent rule)

**Practices & standards**:
- Filters and search as a derived view, never a second copy of state
- `Intl` for locale aware dates rather than a date library
- Reduced motion parity for every new surface
- A disclosure, not a dialog, when the content does not need a focus trap
