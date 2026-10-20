# Anansi's Web — Knowledge Index

- **Document type:** Project knowledge map and navigation index
- **Status:** Verified against the repository on 2026-10-17 — paths, scripts, skill count, and the artifacts listed in §9
- **Purpose:** Enable any engineer or AI agent to understand, verify, and continue the project without access to previous conversations.
- **Location:** `KNOWLEDGE INDEX.md`, repository root
- **Governing instructions:** Root `AGENTS.md`
- **Maintenance:** Update when authoritative documents, important project boundaries, or navigation paths change materially.

---

## 1. Purpose and Operating Principle

Anansi's Web uses repository-contained documentation as its durable institutional memory.

This index is the entry point to that knowledge. It does not replace the documents it links to, establish new product requirements, or authorize changes to the system.

Its job is to answer five questions:

1. What is this project, and what is it trying to achieve?
2. Which documents must I read before working on it?
3. Where is the authoritative answer to a particular question?
4. What is actually implemented, and what remains incomplete?
5. How can I continue work without relying on previous conversations?

**Core principle:** The repository, not conversation history, must contain the knowledge required to continue the project responsibly.

All agents must follow `AGENTS.md` when using this index.

## 2. Start Here: The Onboarding Route

A new agent should follow this sequence before modifying the system.

### Step 1 — Understand the operating rules

Read:

- `AGENTS.md`

Establish the rules for task scope, risk-based autonomy, approval gates, Git safety, verification, documentation maintenance, and session handoffs.

Do not begin implementation merely because the requested feature sounds straightforward.

### Step 2 — Understand the product

Read the relevant sections of:

- `docs/PRD.md`

Establish the intended user experience, core journey, requirements, exclusions, and product invariants.

The PRD governs product intent. Existing implementation does not automatically prove that the intended behavior has been implemented correctly.

### Step 3 — Understand the architecture

Read the relevant sections of:

- `docs/MCD.md`
- Approved architecture decision records, if present.

Establish module boundaries, system responsibilities, contracts, schemas, technical constraints, and approved architectural choices.

Do not infer that a technical choice is approved merely because a dependency is installed or a particular implementation exists.

### Step 4 — Understand the planned sequence

Read:

- `docs/BUILD_ROADMAP.md`

Identify the current phase, dependencies, intended sequence, completed work, and remaining milestones.

Treat roadmap status as a planning record, not proof of implementation.

### Step 5 — Understand the actual system

Read:

- `docs/SYSTEM_TEARDOWN.md`

Use it to identify the implementation areas, known gaps, test and verification status, risks, and outstanding technical concerns.

The teardown is a dated assessment. Re-check the live repository before relying on its claims.

### Step 6 — Inspect the current repository

Inspect the Git branch and working tree, relevant source files, configuration, tests, scripts, and current dependencies.

Identify pre-existing changes before editing anything.

Use repository evidence to distinguish:

- What is required.
- What is approved.
- What is implemented.
- What is verified.
- What remains planned, uncertain, or blocked.

### Step 7 — Retrieve task-specific context

Consult only the additional specifications, decision records, skills, and source files relevant to the task.

Follow the applicable procedures under `skills/`.

Do not load every document indiscriminately. Start broad enough to understand the system, then investigate progressively.

---

## 3. Authoritative Document Map

The following table defines where knowledge belongs and which questions each artifact should answer.

| Artifact | Primary responsibility | Consult when |
|---|---|---|
| `AGENTS.md` | Agent operating rules and mandatory workflow | Beginning a session, planning work, resolving workflow questions, or determining approval requirements |
| `KNOWLEDGE INDEX.md` | Navigation across project knowledge | Beginning onboarding or locating the correct source |
| `docs/PRD.md` | Product requirements, user experience, scope, and non-goals | Changing user-facing behavior, topic discovery, history, progress, or other product features |
| `docs/MCD.md` | Technical architecture, module boundaries, contracts, schemas, and technical decisions | Designing or changing system structure, interfaces, data models, or implementation boundaries |
| Approved architecture decision records | Context, alternatives, rationale, consequences, and status of significant decisions | Making architectural changes or investigating why a technical choice was made |
| `docs/BUILD_ROADMAP.md` | Planned phases, implementation sequence, and progress | Selecting the next justified task or assessing milestone completion |
| `docs/SYSTEM_TEARDOWN.md` | Actual implementation state, verification evidence, gaps, and risks | Starting implementation, debugging, auditing, or completing a meaningful change |
| `docs/specs/` | Detailed requirements and acceptance criteria for a feature | Implementing a specifically defined feature (spec 0001 governs the selection engine, 0002 the local state, 0003 the ritual loop, 0004 the history drawer and the journey count, 0005 the 3D stage) |
| `docs/scope/scope.md` | Boundaries and status of bounded work | Preventing scope creep or understanding approved changes |
| `skills/` | Reusable engineering procedures | Performing a workflow covered by a bundled skill |
| `memory.md` | Temporary working state and session continuity | Resuming unfinished work from a previous session |
| Tests and validation scripts | Executable checks of current behavior and constraints | Verifying changes and investigating regressions |
| Source code and configuration | Actual implementation and runtime/build configuration | Confirming what the system currently does |

### Authority reminder

These artifacts are not interchangeable.

- The PRD governs intended product behavior and scope.
- The MCD and approved decision records govern intended architecture and technical contracts.
- The source code shows the current implementation.
- Tests show behavior currently checked or enforced.
- The roadmap describes intended sequence and recorded progress.
- The System Teardown assesses actual state based on evidence available at verification time.
- Session memory helps continue work but cannot override authoritative requirements.

When sources conflict, follow the conflict-resolution procedure in `AGENTS.md`. Do not silently choose one source or resolve consequential disagreements by assumption.

---

## 4. Technical and Implementation Navigation

The following locations were identified in the project's documented structure. Verify each path against the live checkout before relying on it.

### 4.1 Application and system layers

| Location | Documented responsibility | Investigation focus |
|---|---|---|
| `src/app/` | Application layer | UI composition, application behavior, and orchestration. The ritual loop lives here: `ritual.ts` (the controller and the screen view), `RitualScreen.tsx` (the semantic markup), `useJourney.ts` (the store subscription), and `store.ts` (the app's store instance) |
| `src/engine/` | Core engine | Deterministic logic, selection rules, and behavior that should remain independent of UI concerns |
| `src/state/` | Local journey state and persistence | The four `anansi:v1:*` stores, day rollover, 30 day prune, the accepted day tally, and the per day stream |
| `src/content/` | Content types and content-related logic | Topic schema, content validation, and interfaces between content and application logic |
| `content/topics/` | Topic content | Authored topic records and content available to the application |
| `content/review/` | Content review area | Topic review and validation workflow |
| `scripts/` | Authoring and verification scripts | Content validation, generation, synchronization, and build-support tooling |

Do not assume every feature is implemented in the location where it is intended to live. Inspect imports, actual responsibilities, and tests before changing a module.

### 4.2 Engine boundary

The documented architectural intention is for the engine to remain a pure TypeScript module with injected inputs.

The engine should not depend on:

- The DOM.
- React.
- Browser storage.
- Application-layer state.
- World-rendering components.

It should not import from application, state, or world layers.

Consult `docs/MCD.md` and inspect the live implementation before modifying this boundary.

### 4.3 Rendering and state

The historical teardown identified Three.js through React Three Fiber and Drei, `react-spring`, and Zustand among the installed dependencies. It also reported that some of these dependencies were not yet used at that time.

Do not assume a dependency is actively part of the architecture simply because it is present in `package.json`.

Before changing rendering or state management:

1. Inspect current imports and usage.
2. Identify the approved architecture and relevant contracts.
3. Check dependency compatibility.
4. Review performance and accessibility implications.
5. Obtain approval for consequential architectural or dependency changes.

### 4.4 Verification entry points

The historical teardown identified these scripts:

- `npm run verify`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run content:validate`
- `npm run content:build`
- `npm run content:check`
- `npm run content:report`
- `npm run docs:check`

`npm run verify` is the combined gate: typecheck, content-drift check, tests, documentation-drift check, and production build. `npm run docs:check` runs the documentation step alone and fails when `docs/SYSTEM_TEARDOWN.md`'s counts, file lists, tracked-state statements, gate composition, or toolchain claims no longer match the repository.

These scripts were confirmed against `package.json` on 2026-10-17. If a script changes or disappears, follow the live configuration and update the documents that describe it.

---

## 5. Product Knowledge: What Must Be Preserved

Read `docs/PRD.md` for the complete requirements. This section is a navigation aid for high-impact product constraints, not a replacement for the PRD.

### 5.1 Core experience

Anansi's Web is a 90-day daily articulation challenge.

The intended loop is:

1. Enter the experience.
2. Ask Anansi for a story.
3. Observe Anansi visibly searching the web.
4. Receive a topic title without an explanatory lesson.
5. Accept the topic or reroll.
6. Research independently.
7. Explain the subject aloud in the user's own words.
8. Optionally mark the topic as learned.
9. Return another day.

The experience should evoke curiosity and ritual rather than resemble a conventional learning management system.

### 5.2 Daily Ruling

- A maximum of three stories may be shown per local day.
- The three stories consist of the initial story and up to two rerolls.
- The third story becomes the day's story.
- The day's ruling must remain stable until local midnight.
- Every displayed story counts as Explored, including rerolls.
- Explored stories contribute to the diversity system.

Read the relevant PRD section before changing daily selection or persistence behavior.

### 5.3 Controlled serendipity

Topic selection should account for recency, domain and tag diversity, time since exposure, difficulty distribution, and occasional resurfacing.

These rules should operate behind the scenes rather than become a visible scoring system.

Difficulty is internal and should not be surfaced as a user-facing rating.

### 5.4 Explicit product exclusions

The documented exclusions include:

- Politics and religion.
- Explicit sexuality.
- Graphic medical topics.
- Highly technical mathematics.
- Sensitive topics requiring specialist handling.
- Personalization based on IP, country, or local events.
- AI tutoring or conversational teaching.
- Recording studio and speech analysis features.
- Social features and leaderboards.
- Monetization and authentication in V1.
- Streak pressure, XP, and compulsion notifications.

Do not add excluded functionality without an explicit, approved scope change.

### 5.5 Progress and history

The experience uses shame-free progress language such as `37 / 90`, rather than streak-based pressure.

The documented history model retains a rolling 30-day window, with browser-side storage, search/filtering, and automatic cleanup.

Verify the current implementation and relevant PRD sections before changing history or persistence behavior.

### 5.6 The evolving 3D world

The 3D environment should evolve in density, objects, and connections as the user's journey accumulates.

It should support the experience, not become an unrelated interactive world.

Rendering, performance, reduced-motion support, accessibility, and the intended visual language should be considered together when implementing this area.

---

## 6. Bundled Engineering Skills

The repository's `skills/` directory contains reusable workflow procedures. Read the actual skill instructions before using a workflow.

| Skill | Primary use |
|---|---|
| `architect` | Structured discovery and build specifications |
| `audit` | Repository/context audit and agent-instruction bootstrapping |
| `check` | Verification and review checks |
| `debug` | Root-cause investigation |
| `develop` | Implementation from an approved specification |
| `document` | PR bodies, changelogs, release notes, and postmortems |
| `imprint` | Capturing visual patterns in `ui-registry.md` |
| `recover` | Diagnosing failure types and selecting recovery procedures |
| `remember` | Saving and restoring session continuity through the established memory mechanism |
| `review` | Post-feature review and reporting |
| `scope` | Maintaining bounded scope records |
| `sync` | Reconciling instructions, scope, and specifications |
| `test` | Test-suite authoring |

### Skill usage rules

- Apply only the skills relevant to the task.
- Follow each skill's own preconditions and output requirements.
- Do not assume a skill's name fully describes its procedure.
- Do not run every skill for every change.
- Do not claim that an artifact generated by a skill exists until it has been verified.
- Resolve conflicts between skill instructions and approved project decisions using `AGENTS.md`.

`skills/` held 13 skill directories when this index was verified on 2026-10-17: `architect`, `audit`, `check`, `debug`, `develop`, `document`, `imprint`, `recover`, `remember`, `review`, `scope`, `sync`, `test`.

Since then, 21 reference packs have been installed alongside them (2026-10-18): eight design and frontend packs, and thirteen `threejs-*` skills from `CloudAI-X/threejs-skills`. The three.js pack is reference material for the stage's stack rather than a workflow to follow; the 13 workflow skills above are still the project's process.

---

## 7. Session Continuity and Repository Memory

The repository must preserve the knowledge necessary for another agent to continue work without access to the previous conversation.

### 7.1 What belongs in durable project documents

| Knowledge | Correct destination |
|---|---|
| Product requirements and exclusions | `docs/PRD.md` |
| Technical architecture and contracts | `docs/MCD.md` |
| Significant technical decisions and rationale | The established architecture decision-record convention |
| Planned work and phase progress | `docs/BUILD_ROADMAP.md` |
| Verified implementation state and known risks | `docs/SYSTEM_TEARDOWN.md` |
| Detailed feature requirements | The relevant feature specification, when justified |
| Scope boundaries and approved changes | The relevant scope record, when present |
| Temporary working state and continuation details | The established session-handoff mechanism |

Do not duplicate entire specifications in a session handoff.

### 7.2 Minimum useful handoff

When a task leaves meaningful context for the next session, record:

- What was attempted and completed.
- What was verified, including observed command and test results.
- Which files or system boundaries changed.
- Significant discoveries and resolved issues.
- Failed approaches worth remembering.
- Outstanding questions, blockers, and risks.
- The next justified action.
- Any approval required before proceeding.

Record durable knowledge in the correct authoritative document. Use session memory for temporary working state and continuation.

### 7.3 Knowledge must be evidence-based

Clearly distinguish:

- Verified facts.
- Approved requirements and decisions.
- Proposed changes.
- Inferences.
- Historical observations.

Do not promote an assumption to a requirement merely because it appears in a handoff. Do not treat an old teardown observation as current without checking the repository.

---

## 8. System Teardown Maintenance

`docs/SYSTEM_TEARDOWN.md` is the project's living, evidence-based implementation-state assessment.

After every implementation task, the agent must determine whether the teardown remains accurate.

### Required procedure

1. Compare the task's verified outcome with the current teardown.
2. Identify changes to implementation status, architecture, dependencies, contracts, tests, performance, accessibility, risks, or roadmap progress.
3. Update the affected sections if any recorded information became stale.
4. Verify new or changed claims against current files, commands, tests, or configuration.
5. Distinguish implemented behavior from planned behavior.
6. Preserve useful historical rationale and unresolved issues.
7. Reconcile related authoritative documents when warranted.
8. Report whether the teardown was updated, checked and found accurate, or could not be reconciled.

The update must be proportional to the change. A trivial edit may require no content change if the relevant assessment remains accurate. A new engine, persistence layer, architecture change, dependency change, or material reliability discovery will normally require an update.

Never change the teardown merely to make it appear recently updated. The goal is accuracy, not activity.

If verification is blocked, explicitly state which areas remain unverified.

---

## 9. Knowledge Gaps and Missing Artifacts

A missing document does not automatically justify creating another document.

When a gap is discovered:

1. Search the repository and relevant history.
2. Determine whether an existing artifact already serves the purpose.
3. Identify whether the missing information blocks safe implementation.
4. Determine which existing document should own the knowledge.
5. Ask the user when a consequential product or architectural decision is absent.
6. Create the smallest justified artifact only when necessary.
7. Update this index when the new artifact materially changes project navigation.

### Known historical gaps to re-check

The System Teardown dated 2026-10-16 reported that the following were missing at that time. **All six now exist**, and the dated state of each is in `docs/SYSTEM_TEARDOWN.md`:

| Artifact | Status on 2026-10-17 |
|---|---|
| A knowledge index | This file, at the repository root |
| `memory.md` | Present, tracked |
| `ui-registry.md` | Present, tracked |
| `docs/specs/` | Present: 0001 the selection engine, 0002 the local state, 0003 the ritual loop, 0004 the history drawer and the journey count, 0005 the 3D stage |
| `docs/scope/` | Present: `docs/scope/scope.md` |
| CI configuration under `.github/` | Present and green on the remote; its failure path is proven only locally |

These were historical gaps, not a checklist. A future gap still has to earn its own document through the procedure above; do not recreate an artifact merely because an old observation named it.

---

## 10. Fresh-Agent Reconstruction Test

Repository documentation is useful only if an unfamiliar agent can use it to reconstruct the system accurately.

Run this check when the knowledge architecture changes materially, after significant architectural work, or when documentation drift has caused repeated mistakes. It is not necessary after every trivial edit.

Without relying on previous conversations, determine whether a new agent can answer:

1. What is Anansi's Web, and what is its core user journey?
2. What features and behaviors are explicitly out of scope?
3. Which documents govern product requirements and technical architecture?
4. What are the main system boundaries?
5. What is implemented, incomplete, planned, or unverified?
6. What important risks and unresolved questions remain?
7. Which tests and verification commands should be run?
8. Which workflow skills apply to a proposed task?
9. What is the next justified implementation step?
10. Which operations require user approval?

The check fails if the agent must guess about a consequential requirement, cannot identify the governing decision, mistakes planned work for implemented behavior, or cannot establish how to verify a change.

When it fails, repair the relevant authoritative document or navigation path. Do not treat a plausible but unsupported answer as a pass.

---

## 11. Index Maintenance

Update this index when a change materially affects how an unfamiliar agent navigates project knowledge.

Examples include:

- An authoritative document is added, renamed, moved, or retired.
- The architecture gains a new major system boundary.
- A new workflow or skill becomes part of the established engineering process.
- The session-memory mechanism changes.
- A previously missing artifact becomes an established part of the workflow.
- The onboarding route or authority structure changes.

Do not update the index for every source-code edit.

When updating it:

1. Verify the relevant paths.
2. Keep each document's responsibility clear.
3. Remove obsolete references.
4. Avoid duplicating the contents of the documents being indexed.
5. Confirm that the onboarding route still works from repository context alone.

---

## 12. Final Rule

The Knowledge Index is a navigation layer, not a substitute for investigation, authoritative requirements, or verification.

The expected workflow is:

**Discover knowledge → Establish authority → Investigate the live system → Plan within scope → Implement → Verify → Reconcile durable knowledge → Hand off.**

The project's success is not measured solely by whether the current agent completes a task. Another agent or engineer must be able to understand what was done, why it was done, how it was verified, and what should happen next using the repository alone.