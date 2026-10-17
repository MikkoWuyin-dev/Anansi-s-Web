# Session memory

Handoff for the next agent. Read `AGENTS.md` and `KNOWLEDGE INDEX.md` first; this file records
working state, not requirements.

## Where the project is

Phase 4 (the ritual loop) was designed and built on 2026-10-17, after Phase 3 (the state layer).
The product is usable end to end without any 3D: ask for a story, watch a short search, receive a
title alone, reroll twice, take the day's story, mark it learned, and find the day unchanged after
a reload.

- Spec: `docs/specs/0003-ritual-loop.md` (`In Progress`; scope features 4, 5 and 6 are
  `in-progress` with it linked).
- Code: `src/app/` — `ritual.ts` (controller and screen view), `RitualScreen.tsx` (semantic
  markup), `useJourney.ts` (`useSyncExternalStore`), `store.ts` (the app's store instance),
  `styles.css` (palette plus the new motion tokens).
- Tests: 31 across `src/app/ritual.test.ts` and `src/app/RitualScreen.test.tsx`; `vite.config.ts`
  now collects `.test.tsx` as well as `.test.ts`.

## Decisions that a reader cannot infer from the code alone

- The search beat is a 900 ms pause, injected and skipped under reduced motion; Phase 6 replaces it
  with the world's search. Do not grow it into a loading screen.
- Taking a story ends the ruling: the app hides the reroll once `day.acceptedTopicId` is set. The
  store still permits an offer, so the interface is the gate.
- The reason an offer was resurfaced is not stored; it is reproduced on load by replaying the
  engine for the day just before that offer. If the engine's rule order changes, this derivation
  must be checked again.
- The learned confirm is inline and moves focus both ways (open and close) because the pressed
  button disappears in each direction.
- A stored story that has left the library is a dead end until midnight and the app says so; the
  repair needs a store action and is a Follow-up in spec 0003.

## Verified on 2026-10-17

- `npm run verify` → exit 0 (190 tests in 15 files; content and documentation checks clean; build).
- Browser pass by keyboard on the running dev server: title alone on the reveal, two rerolls
  without a repeat, the third story sealed with the reroll gone, take closing the ruling, the
  inline confirm holding focus, learned surviving a reload with the same story, and the DOM
  carrying no `domain`, `difficulty`, or `tags`.
- Three mutation probes in `src/app/ritual.ts` (never recording an offer, leaving the reroll open
  at three offers, dropping the learned state) each failed the suite and were reverted byte for
  byte.

## Not verified, and why

The resurfaced treatment (needs a 60 day absence), the empty and failed states, the blocked
storage line, the reduced motion path, and the midnight rollover are covered by controller and
markup tests but were not reproduced in a live browser. The dev-only state switch an agent
suggested is not built.

## Next justified action

Phase 5: the history drawer and the quiet `37 / 90` count (spec 0003's Follow-up also asks for the
count on the taken state). It owes a decision, so start with `/architect history drawer`, then
`/develop`. No approval gate is open; nothing is pushed beyond the commit that records this work.
