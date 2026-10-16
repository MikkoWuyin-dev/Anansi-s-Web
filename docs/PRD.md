# ANANSI'S WEB
## Product Requirements Document — v1.1

**Product:** Anansi's Web  
**Product Type:** Interactive single-page web application  
**Primary Purpose:** Daily articulation practice through controlled serendipitous topic discovery  
**Primary Experience:** Discover → Research → Understand → Explain  
**Core Challenge:** 90-day articulation journey  
**Topic History:** 30-day rolling history  
**Design Direction:** Immersive, playful, unconventional, Memphis-inspired 3D web experience  
**Architecture:** Fully static, accountless, local-first  
**Status:** Product Definition / Pre-Implementation  
**Version:** 1.1

---

## Amendment History

**v1.1 — 2026-10-11.** Architecture ratified through an architect session. Changes from v1.0:

- **§9** — The Daily Ruling: three topics per day, two rerolls, the day's story, the day key.
- **§16** — Fully static delivery; AI involvement moved strictly to authoring time.
- **§17** — Selection intelligence runs locally in V1.
- **§19** — A day is the user's own local calendar day.
- **§22** — History is local-first, stored in the browser.
- **§24** — Accounts deferred. V1 is accountless.
- **§25** — Zero-friction entry: the visitor lands directly in the world.
- **§29** — The web is a stage the user watches and touches, never free-navigates.
- **§30** — All objects are procedural Memphis; no imported 3D assets.
- **§35** — On-demand rendering required: an idle web costs nothing.
- **§38** — Authentication and any backend added to non-goals.

Engineering decisions, stack, budgets and conventions live in **docs/MCD.md** (Master Context Document), which is the canonical technical companion to this document.

---

# 1. Product Overview

Anansi's Web is a single-page interactive web experience that gives users one intriguing, useful and explainable topic to explore each day.

The user does not receive an explanation of the topic.

They receive only the topic.

Their responsibility is to research it, understand it sufficiently, and explain it in their own words—ideally aloud and in a way that an ordinary person can understand.

The website therefore does not attempt to become a learning platform.

It is a **discovery and articulation ritual**.

The central philosophy is:

> **Anansi gives you something worth knowing. You do the rest.**

The product is named after Anansi, the famous spider figure associated with storytelling, wit, intelligence and the power of speech in Akan/Ashanti traditions.

The website conceptualizes itself as **Anansi's Web**: a strange, beautiful, interconnected world containing countless stories, ideas, objects and pieces of knowledge.

---

# 2. Product Vision

Create a daily ritual that makes becoming a better articulator feel playful rather than academic.

Every visit should generate a small moment of curiosity:

> "What on earth is Anansi going to give me today?"

The product should encourage the user to leave the website and actually learn something.

Success is not measured by time spent on the website.

In fact, excessive time spent inside the application may indicate that the product is failing at its core purpose.

The ideal journey is:

> Enter → Discover → Accept → Leave → Learn → Explain → Return tomorrow.

---

# 3. Core User Problem

People frequently encounter concepts, phenomena, objects, systems and ideas throughout everyday life without understanding them.

They may know that something exists without knowing:

- why it happens,
- how it works,
- where it came from,
- why it matters,
- what it is called,
- or how to explain it clearly.

At the same time, many people want to become better communicators and articulate thinkers but lack a consistent daily practice.

Anansi's Web provides the missing trigger:

> **One interesting thing to learn and explain every day.**

---

# 4. Target User

## Primary User

A curious person who wants to improve their:

- articulation,
- verbal clarity,
- general knowledge,
- ability to explain concepts,
- intellectual curiosity,
- confidence when speaking.

The user does not need to be an academic, researcher or subject-matter expert.

Topics should generally be explainable to an intelligent layperson after reasonable research.

## Secondary Audience

People who simply enjoy discovering unexpected knowledge.

The product should therefore remain useful even when a user is not consciously participating in a 90-day articulation challenge.

---

# 5. Core Product Loop

The fundamental loop is:

1. User enters Anansi's Web.
2. Anansi is already active within the web.
3. User asks Anansi to find a story.
4. Anansi searches through the web.
5. A topic is revealed.
6. User chooses whether to take it.
7. Accepted topic is added to history.
8. User leaves the website.
9. User researches the topic independently.
10. User explains the topic aloud.
11. User optionally marks the topic as learned.
12. User returns on another day.

The application should make this loop exceptionally clear while keeping the presentation mysterious and playful.

---

# 6. Core Hero Experience

The central hero interaction is built around Anansi and the web.

Primary hero line:

> **What story do you want to tell today?**

Anansi should be visually positioned as the central character within the web.

The web should contain numerous colorful, unusual objects and visual fragments that appear to represent fragments of knowledge and stories.

The arrangement should be unconventional.

Symmetry and conventional landing-page composition are not priorities.

Expression takes precedence over conventional layout rules.

---

# 7. Topic Discovery

## Primary Action

The user invokes Anansi to find a story.

Possible interaction language:

> **Find me a story**

The exact copy may evolve during UX refinement, but the action must communicate discovery rather than education.

## Search Animation

When generating a topic, Anansi should visibly search.

The intended sequence:

- Web becomes subtly active.
- Anansi begins moving.
- He scurries between parts of the web.
- He investigates or interacts with objects.
- The movement communicates that he is looking for something.
- He eventually returns with a topic.
- The topic is revealed.

This should replace a conventional loading spinner wherever practical.

The animation should feel like an actual event rather than an abstract progress indicator.

---

# 8. Topic Reveal

The reveal is intentionally restrained.

The topic should initially appear **without explanation**.

Example:

> **THE COBRA EFFECT**

No:

- definition,
- summary,
- category,
- difficulty,
- explanation,
- "did you know?" paragraph,
- AI-generated facts.

The mystery is intentional.

The user should have to ask:

> "What is that?"

That curiosity is the beginning of the learning process.

---

# 9. Topic Actions

After a topic is revealed, the primary action is:

> **I'll take this**

Selecting the topic commits it to the user's history.

A secondary action allows the user to request another topic.

The reroll experience must not feel like a dopamine-driven infinite swipe system.

The system should encourage intentional selection.

The product should not optimize for maximum session length.

## The Daily Ruling (v1.1)

Each day, Anansi offers at most **three stories**:

1. The first story appears after the search. The user may send Anansi back to search up to **two times**.
2. The third story offered is **the day's story**. It persists — unchanged and on offer — until the user's local midnight. Revisiting the site the same day never reshuffles it.
3. Every story shown counts as **Explored**, including rerolled ones. Nothing offered is wasted: each presentation feeds the diversity engine (§17).
4. A day ends at **local midnight in the user's own timezone** — the *day key*. There is no server enforcement and no anti-gaming armor: the ritual is trusted to the user (§19, §24).

---

# 10. Topic Quality Philosophy

Anansi's Web is not a generic random-fact generator.

A topic is considered high quality when it creates the feeling:

> "I'm genuinely glad I know this now."

Strong topics may cause reactions such as:

- "Wait, that's actually a thing?"
- "I've experienced that my whole life."
- "I've wondered about that before."
- "I never knew that."
- "That explains so much."
- "That's surprisingly useful."
- "I could actually explain this to someone."
- "That's a great story."

---

# 11. Topic Ranking Priorities

Topic generation and selection should prioritize the following characteristics in approximately this order:

1. Relevant to everyday life
2. Surprisingly useful
3. Culturally interesting
4. Easy to explain
5. Thought-provoking
6. Counterintuitive
7. Practical
8. Fascinating
9. Funny or weird
10. Scientifically interesting
11. Historically interesting
12. Obscure or unknown

A topic does not need to satisfy every characteristic.

The system should seek variety.

---

# 12. Topic Diversity

Topics should span many spheres of life, including but not limited to:

- Everyday life
- Science
- Psychology
- Technology
- Economics
- History
- Geography
- Language
- Communication
- Culture
- Nature
- Engineering
- Business
- Philosophy
- Food
- Architecture
- Design
- Human behaviour
- Society
- Inventions
- Transportation
- Space
- Computing
- Accessible mathematics
- Other appropriate general-interest domains

The system should avoid feeling like a curriculum.

Topics should appear serendipitous.

---

# 13. Topic Difficulty

Anansi should maintain a controlled balance between three broad levels:

### Level 1 — Familiar subject, unfamiliar explanation

Example:

> Why airplane windows have rounded corners.

### Level 2 — Familiar concept, deeper understanding

Example:

> Why déjà vu happens.

### Level 3 — Obscure concept

Example:

> The Cobra Effect.

The user should not see these levels.

The algorithm should use them internally to maintain variety.

---

# 14. Topic Exclusions

The production topic pool must exclude or heavily restrict:

- Politics
- Religion
- Explicit sexuality
- Graphic medical topics
- Highly technical mathematics
- Extremely sensitive subject matter
- Highly controversial subject matter where appropriate neutral treatment is difficult
- Extremely technical specialist topics
- Topics requiring professional expertise to explain responsibly
- Topics with little meaningful intellectual, practical, cultural or storytelling value

The goal is broad curiosity without drifting toward sensationalism.

---

# 15. Location Independence

Anansi's Web is completely location-agnostic.

The default topic engine should not personalize topic selection based on the user's:

- country,
- city,
- IP location,
- nationality,
- local culture,
- local events.

Global and culturally diverse topics are welcome.

Geographical diversity should come from the topic pool itself, not from inferred user location.

---

# 16. Topic Generation Architecture

V1 uses a **hybrid topic architecture** delivered through a **fully static application** (v1.1).

### Curated Topic Library

A high-quality base library provides the primary production pool.

Topics should be reviewed against Anansi's quality criteria (§10–14).

The library is versioned seed content in the repository and ships with the application as a static bundle.

### AI-Assisted Expansion

AI may be used — **at authoring time only, never at runtime** — to:

- propose candidate topics,
- identify gaps in topic diversity,
- generate topic variations,
- classify topics,
- assist with quality scoring,
- identify duplicates or near-duplicates.

AI-generated candidates do not automatically become production topics; they land in a review queue and require validation.

The quality of the topic pool is more important than having infinite topics.

### Static Delivery (v1.1)

There is no backend in V1. Topic selection runs client-side against the user's local history (§17, §22). Accounts, server-side selection and cloud sync arrive together in a later era (§24).

---

# 17. Controlled Serendipity

Topic selection should use hidden intelligence.

The system should consider:

- recently shown topics,
- accepted topics,
- learned topics,
- topic domains,
- topic similarity,
- difficulty,
- topic type,
- recurrence,
- diversity,
- time since previous exposure.

The user should experience randomness.

The system should produce **controlled randomness**.

The algorithm should deliberately prevent monotonous sequences.

Example:

> Psychology → Architecture → Biology → History → Everyday Physics → Language → Economics

should feel natural.

The user should never feel that the application is mechanically rotating through categories.

In V1 this intelligence runs locally in the user's browser (§16). The machinery must remain invisible: the user experiences randomness, never the rules.

---

# 18. Intentional Resurfacing

Previously encountered topics may intentionally return after sufficient time.

A resurfaced topic should be treated as a playful event rather than a duplicate.

Possible treatment:

> **BLACK HOLES**
>
> *Anansi has brought this one back.*

or an equivalent visual interaction.

The resurfacing mechanism should remain rare enough to feel meaningful.

---

# 19. 90-Day Challenge

The 90-day articulation journey is a visible part of the product identity.

The system should track:

> **Days completed / 90**

However, it should not emphasize streak anxiety.

Preferred model:

> **37 / 90**

rather than:

> **37-day streak**

Missing days does not punish the user.

There should be no shame-oriented messaging.

A day is the user's own local calendar day — the day key (§9).

---

# 20. Evolving Web

The web itself should gradually evolve as the user's 90-day journey progresses.

The visual system should become richer over time.

### Early stage

- Sparse web
- Fewer objects
- More negative space
- Anansi visually prominent

### Middle stage

- More strands
- More objects
- More connections
- Greater visual complexity

### Late stage

- Dense interconnected web
- Greater visual richness
- Accumulated history represented visually
- Sense of a world that has been built through repeated use

The visual evolution should represent accumulated curiosity rather than conventional gamification.

The user should feel:

> **"I built this."**

---

# 21. Progress Philosophy

Progress is about consistency, not competition.

The application should not heavily employ:

- leaderboards,
- competitive scoring,
- streak pressure,
- XP farming,
- badges designed primarily to maximize engagement,
- notifications designed to manufacture compulsion.

Anansi should encourage intellectual consistency without becoming another attention trap.

---

# 22. Topic History

History retains the most recent 30 days and lives locally in the user's browser (v1.1).

History is stored as a local event log: every presentation, acceptance and learning event feeds both this view and the diversity engine (§17).

It should distinguish between:

### Explored

Topics that Anansi has presented to the user.

### Learned

Topics the user has explicitly marked as learned.

History must be:

- searchable,
- filterable,
- easy to inspect,
- automatically cleaned after the 30-day retention period.

Initial filters:

- All
- Explored
- Learned

Additional filtering by topic domain may be introduced if useful.

---

# 23. History Visualization

The web itself may visually represent accumulated topics.

Older topics can become nodes or fragments within the web.

A conventional history drawer/list should remain available for practical usability.

The visual metaphor should complement—not replace—the conventional history interface.

---

# 24. Accounts — Deferred (v1.1)

V1 is **accountless**.

There is no authentication, no signup, no profile. First-time visitors enter the experience directly — no wall of any kind (§25).

All user state — 30-day history, 90-day progress, explored and learned topics, preferences — lives locally in the user's browser.

This is a deliberate trade:

- **Gained:** zero-friction first use, nothing to fail, nothing to wait for.
- **Accepted:** state is per-browser; clearing browser data clears the journey; no cross-device sync.

Accounts are deferred, not abandoned. When they arrive, server-side persistence (planned: Supabase — Postgres, auth, row-level security) will slot in behind the existing selection engine, and a one-time sync will lift local history into the cloud. Until then, the local-first model is the product.

---

# 25. First-Time User Experience (v1.1)

The first-time experience is the experience: the visitor lands directly inside Anansi's web.

- No signup, no modal gate, no tour, no cookie-wall ritual.
- The hero line awaits; the first **Find me a story** works immediately.
- Returning users resume automatically — their web is as they left it.

Any guidance the user needs must be carried by the world itself.

---

# 26. Anansi Character

Anansi is an active character rather than a static mascot.

His personality:

- Clever
- Mischievous
- Curious
- Warm
- Witty
- Slightly unpredictable
- Intelligent
- Comical

He may occasionally communicate with short remarks.

He should not become a chatbot.

There is no requirement for a conversational AI Anansi in V1.

Anansi's role is to **discover and deliver stories**, not to teach them.

---

# 27. Mythological Representation

The product may draw from Anansi's cultural and mythological associations with storytelling, intelligence, wit and speech.

The representation should be respectful.

Specific historical or cultural claims about Akan/Ashanti traditions should be verified before being used in public-facing copy.

The mythology should inform the product's identity without turning the application into a mythology lesson.

---

# 28. Visual Design Direction

Anansi's Web should feel like entering a strange physical artifact rather than visiting a conventional website.

### Core aesthetic

- Minimalist
- Playful
- Immersive
- Memphis-inspired
- 3D
- Surreal
- Warm
- Curious
- Slightly chaotic
- Unconventional

Expression takes priority over rigid design conventions.

---

# 29. The Web

The web is the central visual metaphor and primary interface environment.

It should be:

- recognizably spider-web inspired,
- visually intricate,
- colorful,
- asymmetrical,
- layered,
- populated with unusual objects,
- responsive to interaction.

It should be a surreal hybrid between:

> literal spider web + knowledge network + Memphis composition + physical diorama.

The web is a **stage the user watches and touches** (v1.1) — never a space the user freely navigates. The camera is authored: it drifts, breathes, tracks Anansi's search and frames the ritual's beats. The user touches the world — objects react, strands tremble, parallax answers the cursor — but the camera is never handed over. A diorama is a world you peer into.

---

# 30. Interactive Objects

The web may contain:

- geometric shapes,
- tiny objects,
- symbols,
- fragments,
- miniature artifacts,
- books,
- planets,
- clocks,
- question marks,
- keys,
- eyes,
- microphones,
- mathematical symbols,
- cultural objects,
- abstract forms.

These objects are not required to be individually functional.

They exist to create a sense of a world filled with stories.

Some may respond to:

- cursor movement,
- hover,
- clicking,
- scrolling,
- proximity,
- topic generation,
- progression.

All objects are **procedural Memphis** (v1.1): generated in code from geometric primitives and flat palette materials, with no imported 3D assets. Each object family (clocks, keys, eyes…) is a parametric generator producing endless variants — this multiplication is what makes the evolving web (§20) affordable without an asset pipeline.

---

# 31. Interaction Design

Interactions should feel physical.

Preferred responses include:

- subtle inertia,
- elastic movement,
- object displacement,
- web tension,
- slight rotation,
- depth shifts,
- parallax,
- hover reactions,
- click reactions,
- spring-like motion.

Interactions should not exist merely because animation is technically possible.

Every significant animation should reinforce the feeling that the user is interacting with a living web.

---

# 32. Hidden Interactions

Anansi's Web should contain small surprises.

Examples may include:

- hidden drawers,
- unexpected web interactions,
- objects that react differently than expected,
- subtle character reactions,
- easter eggs,
- unusual hover states.

These should reward curiosity.

They must never interfere with the core task.

---

# 33. Light and Dark Modes

Both light and dark modes are required.

The mode switch should use a playful animated sun/moon interaction.

The transition between modes should feel integrated into the world.

The color system must preserve accessibility and legibility in both modes.

---

# 34. Color Palette

Primary palette:

| Name | Hex |
|---|---|
| Strawberry Red | `#FF3E41` |
| Vintage Lavender | `#885A89` |
| Jet Black | `#19323C` |
| Yellow | `#FAFF00` |
| Black | `#08090A` |

The palette should not be applied with equal frequency.

Dark tones should provide structural grounding.

Yellow should function as a high-attention accent.

Strawberry Red and Vintage Lavender should provide secondary expressive accents.

---

# 35. Sustainable Web Design

The visual ambition must not result in irresponsible technical overhead.

Implementation should prioritize:

- lightweight assets,
- optimized 3D,
- compressed resources,
- lazy loading,
- efficient rendering,
- GPU-conscious animation,
- CSS transforms where appropriate,
- minimal unnecessary network requests,
- minimal continuous animation,
- reduced-motion support,
- progressive enhancement,
- an on-demand rendering loop — the scene draws frames only when something is moving, so an idle web costs effectively nothing (v1.1).

The design should create the **illusion of complexity without requiring unnecessary computational complexity**.

---

# 36. Accessibility

The application must support:

- keyboard navigation,
- visible focus states,
- readable typography,
- sufficient color contrast,
- semantic controls,
- screen-reader-friendly interactive elements,
- reduced-motion preferences.

Animations must never be required to understand the product.

---

# 37. Responsive Design

The core experience must work across:

- desktop,
- tablet,
- mobile.

Desktop may provide the richest web interaction.

Mobile should preserve the concept rather than simply shrinking the desktop interface.

Touch interactions should have intentional equivalents for cursor-based interactions.

---

# 38. V1 Non-Goals

The following are explicitly outside V1:

- Full learning platform
- Built-in courses
- AI tutoring
- Chat with Anansi
- Built-in research tools
- Built-in recording studio
- Speech analysis
- AI grading of explanations
- Social feed
- Public profiles
- Leaderboards
- Friends/followers
- Complex gamification
- Push-notification engagement system
- Monetization system
- Extensive personalization
- Location-based recommendations
- Authentication and account systems (deferred — see §24)
- Any server-side backend (V1 is fully static)

These may be considered later only if the core product proves valuable.

---

# 39. Success Criteria

Anansi's Web succeeds if users repeatedly return because they genuinely want to discover their next topic.

Primary indicators:

- Users return across multiple days.
- Users accept topics rather than endlessly rerolling.
- Users complete topics.
- Users maintain the 90-day journey.
- Users voluntarily share Anansi's Web with others.
- Users report discovering topics they are genuinely glad to know.
- The experience feels memorable enough to become a ritual.

The strongest qualitative success statement would be:

> **"I actually look forward to seeing what Anansi gives me today."**

---

# 40. Product North Star

Everything in Anansi's Web should serve this principle:

> **Make curiosity irresistible, then get out of the way.**

Anansi provides the spark.

The user does the learning.

The user does the explaining.

The user becomes the storyteller.
