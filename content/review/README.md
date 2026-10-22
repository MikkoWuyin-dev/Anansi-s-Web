# Review queue

AI-proposed topic candidates land here and **never ship directly** (MCD §6).

A candidate becomes a production topic only after a human has read it against
the quality philosophy and the exclusions:

- PRD §10 — the topic should make someone genuinely glad they know it.
- PRD §11 — the quality characteristics a topic is ranked on.
- PRD §13 — the difficulty level it sits at.
- PRD §14 — the exclusions: no politics, religion, explicit sexuality, graphic
  medical topics, highly technical mathematics, or sensitive subject matter
  that needs specialist handling.

## Layout

- `candidates/` holds one JSON file per candidate, in the same shape as
  `content/topics/`. Nothing reads this folder at runtime.
- `BATCH-<date>.md` is the review sheet for one batch: every title grouped by
  domain, with its difficulty and tags, so a batch can be read in one pass.

## Promoting a candidate

1. Read the candidate and decide whether it clears the bar above.
2. Move it into `content/topics/` as `<id>.json`, with `id` matching the file
   name exactly.
3. Set `added` to the date it enters the library.
4. Run `npm run content:validate`, then `npm run content:build`.

The runtime never sees anything that is still in this folder.
