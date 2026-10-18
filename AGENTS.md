# Anansi's Web — Agent Operating Instructions

- **Document type:** Repository-level agent instructions
- **Status:** Operational entry point
- **Applies to:** All AI coding agents and contributors working in this repository
- **Primary objective:** Enable safe, consistent engineering work by agents and engineers with zero prior conversation context.
- **Last verified against project state:** Must be verified by the agent during onboarding; do not assume this document's metadata proves the current implementation state.

## 1. Mission and Operating Principles

Build **Anansi's Web** as specified by the project's authoritative product and technical documents. It is a daily topic-discovery and articulation ritual, **not a conventional learning platform**.

Its north star is: *make curiosity irresistible, then get out of the way.*

Time-on-site is a failure signal, not an optimization target.

Work as a careful engineering partner: investigate, reason from repository evidence, make the smallest complete change that satisfies the task, verify the result, update relevant project knowledge, and report what changed and what remains uncertain.

### Core rules

1. **Stay in scope. No overbuilding.** Implement the requested task and the minimum necessary supporting work. Do not add features, abstractions, dependencies, infrastructure, polish, or speculative future-proofing that the task and approved project documents do not require.
2. **Do not invent requirements.** If a consequential requirement is missing or ambiguous, investigate the existing documents and code. Ask the user when a decision would materially affect product behavior, architecture, security, persistence, scope, or reversibility.
3. **Verify before claiming success.** Run appropriate checks and inspect your own changes before committing or declaring work done. Never claim a command passed unless it was actually run and its result observed.
4. **Evidence over assumptions.** Inspect the live repository before acting. Historical teardown findings are dated observations, not a substitute for checking current state.
5. **Preserve the product's intent.** Do not turn the experience into tutoring, a content-explanation feed, a social product, a streak-driven habit app, or another excluded V1 feature.
6. **Repository-first continuity.** Do not rely on previous chats, hidden model memory, or the original developer's recollection as the only source of project knowledge. Important knowledge must be discoverable in the repository.
7. **Maintain knowledge as part of engineering.** When a change makes authoritative documentation, the System Teardown, or the session handoff inaccurate, reconcile the affected records as part of the task.
8. **Be explicit about uncertainty.** Distinguish verified facts, approved requirements, proposals, inferences, and historical observations.

## 2. Repository-First Onboarding and Context Reconstruction

**Assume every new session begins with zero reliable conversation context.** The repository is the durable institutional memory of the project.

A new agent must be able to determine what the product is, why it is built this way, what exists today, what remains incomplete, which decisions govern the work, and how to continue safely.

### 2.1 Mandatory onboarding sequence

Before making changes:

1. Read this `AGENTS.md` file.
2. Inspect the repository's documentation structure and read `KNOWLEDGE INDEX.md`, the navigation map, if it exists.
3. Inspect the Git branch and working tree, including pre-existing changes.
4. Read the relevant parts of the following project documents:
   - `docs/PRD.md` — product intent, user experience, requirements, exclusions, and scope.
   - `docs/MCD.md` — technical architecture, contracts, schemas, and approved technical decisions.
   - `docs/BUILD_ROADMAP.md` — planned implementation sequence and phase status.
   - `docs/SYSTEM_TEARDOWN.md` — implementation-state assessment, known gaps, verification evidence, and risks.
5. Inspect applicable architecture decision records, feature specifications, scope records, and other authoritative documents.
6. Read the instructions for applicable bundled skills under `skills/` before using their workflows.
7. Inspect relevant source files, configuration, tests, scripts, and Git history as needed to verify the state of the task.
8. Establish the task's scope, acceptance criteria, dependencies, risks, and relevant approval gates before implementation.

Do not treat the onboarding sequence as a requirement to read every file in full for every task. Read enough to reconstruct the context necessary for the work.

### 2.2 Progressive disclosure

Use a progressive-disclosure approach:

1. Start with `AGENTS.md` and the knowledge index.
2. Identify the authoritative documents relevant to the task.
3. Read the specific sections needed to understand requirements and constraints.
4. Inspect implementation and tests to verify current behavior.
5. Expand the investigation only when evidence reveals a conflict, dependency, risk, or missing context.

Create a task-specific context packet when the task is sufficiently complex to benefit from one. It should contain links or paths to the relevant requirements, decisions, contracts, implementation areas, tests, constraints, and unresolved issues.

Do not duplicate entire source documents into a context packet. Point to authoritative records and summarize only what is necessary for the task.

### 2.3 If repository context is incomplete

If an expected document, decision, knowledge index, or handoff is missing:

1. Determine whether an existing document or workflow already serves that purpose.
2. Search the repository and relevant Git history before concluding that the information does not exist.
3. Distinguish missing documentation from missing implementation.
4. Do not fabricate the missing decision or assume that current code expresses the intended design.
5. If the gap blocks safe work or affects a consequential decision, ask the user.
6. If the gap can be addressed safely within the task, update the appropriate existing artifact or create the smallest justified supporting artifact.

Do not create duplicate documents or bootstrap every possible documentation artifact merely because it is absent.

## 3. Repository Knowledge Map and Artifact Responsibilities

The repository must provide a clear path from general orientation to detailed technical knowledge.

Use existing documentation and conventions wherever possible. Maintain a single, understandable source of truth for each kind of information.

### 3.1 Core knowledge responsibilities

| Artifact | Primary responsibility |
|---|---|
| `AGENTS.md` | Operational rules, onboarding, authority boundaries, approval gates, verification, and knowledge-maintenance obligations. |
| `KNOWLEDGE INDEX.md` | Navigation map showing important documents, their purpose, authority, and when to read them. |
| `docs/PRD.md` | Product intent, user journey, requirements, scope, exclusions, and product invariants. |
| `docs/MCD.md` | Technical architecture, system boundaries, contracts, schemas, and approved technical decisions. |
| Approved architecture decision records | Significant technical decisions, context, alternatives, rationale, consequences, and supersession. |
| `docs/BUILD_ROADMAP.md` | Intended implementation sequence, phases, dependencies, and progress status. |
| `docs/SYSTEM_TEARDOWN.md` | Evidence-based assessment of actual implementation, verified state, incomplete areas, risks, and known limitations. |
| Feature specifications and scope records, when present | Detailed requirements and acceptance criteria for individual features or bounded areas of work. |
| `skills/` | Reusable engineering procedures, preconditions, workflow rules, and output conventions. |
| `memory.md` or the established session-handoff mechanism | Session continuity: work completed, current working state, unresolved issues, and the next justified action. |
| Tests, validation scripts, and configuration | Executable evidence of enforced behavior and the checks used to verify changes. |
| Source code | Current implementation, not automatic proof of intended or approved design. |

These responsibilities are deliberately distinct. Do not turn `AGENTS.md` into a second PRD, MCD, roadmap, teardown, or session log.

### 3.2 Knowledge index requirements

If a project knowledge index already exists, maintain it when relevant documents are added, renamed, moved, or materially change purpose.

If no index exists, determine whether the existing repository structure is sufficiently navigable. Create a minimal index only when the current task or applicable workflow justifies it.

A useful index should answer:

- Where should a new agent begin?
- Which document governs a particular kind of question?
- Which documents are authoritative, and which are historical?
- Where are detailed specifications, architecture decisions, workflow skills, and session handoffs?
- Which records should be consulted for a particular task?

The index is a navigation aid, not a new authority layer. It must point to the documents that actually govern decisions.

### 3.3 Keep links and references trustworthy

When modifying the documentation structure:

- Update affected internal links and references.
- Remove or correct references that point to renamed or deleted artifacts.
- Do not claim an artifact exists without checking it.
- Do not leave a new document undiscoverable when it contains information necessary for future work.
- Avoid maintaining the same decision independently in multiple documents.

If two documents need to mention the same decision, keep the authoritative rationale in the designated record and use a concise reference elsewhere.

## 4. Authority and Conflict Resolution

Different sources govern different questions. Do not flatten them into one universal hierarchy.

- **Current task instructions** define immediate scope and acceptance criteria, provided they do not violate security or safety invariants or require an unapproved consequential change.
- **Security and safety invariants** constrain every task.
- **`docs/PRD.md`** governs intended product behavior, user experience, explicit non-goals, and product scope.
- **`docs/MCD.md` and approved architecture decision records** govern intended technical architecture, contracts, and approved technical choices.
- **Executable tests and validation gates** show behavior that is currently enforced.
- **Source code and configuration** show what is currently implemented; they do not, by themselves, authorize changing the intended design.
- **`docs/BUILD_ROADMAP.md`** records the planned sequence and phase status.
- **`docs/SYSTEM_TEARDOWN.md` and session notes** record observations made at a particular time. Re-check the repository before treating their implementation claims as current.
- **Proposals and inferences** are not approved requirements. Label them as such.

### Conflict-resolution procedure

When sources disagree:

1. State the conflict explicitly and identify the sources involved.
2. Separate intended behavior from current implementation and historical observation.
3. Gather evidence from the relevant files, tests, commands, and decision records.
4. Determine whether the discrepancy is a documentation error, an implementation defect, an outdated observation, an ambiguous requirement, or a genuine unresolved decision.
5. Do not silently reconcile the conflict or choose whichever source is easiest to follow.
6. If resolution would change product behavior, architecture, security, persistence, scope, or an approved decision, present the conflict and viable options to the user and wait for approval.
7. If a documentation inconsistency can be corrected without changing an approved decision, update the affected authoritative record as part of the relevant task and explain the correction.
8. Update related records when the resolution changes what future agents need to know.

Never treat a planned feature as implemented merely because it appears in a PRD or roadmap. Never treat existing code as proof that it matches the intended design. Never treat a successful test suite as proof that the intended product behavior is correct.

## 5. Autonomy and Approval Gates

Use **risk-based autonomy**.

Proceed independently with investigation, routine maintenance, scoped implementation, tests, and reversible changes that clearly satisfy approved requirements.

For meaningful changes, investigate first, formulate a plan, and confirm that the plan stays within scope.

### Explicit approval is required before executing:

- Deploying, publishing, releasing, or changing production infrastructure.
- Creating a Git commit, pushing to a remote, or rewriting Git history. **Standing exception (owner, 2026-10-17): commit at the end of each implementation task once the gate passes.** Pushing, rewriting history, and committing work that failed or skipped verification still need explicit approval.
- Deleting important data, discarding user work, or performing destructive or difficult-to-reverse operations.
- Introducing or replacing a major dependency, or changing framework, runtime, or major tool versions.
- Making consequential architectural changes or changing approved architecture decisions.
- Changing product scope, security boundaries, or persistence/data contracts in a consequential way.
- Installing or enabling tool-specific skills for external tools.

For external tool-specific skills, explain what is needed and request permission before installing or enabling them. Do not install them pre-emptively.

Investigation, impact analysis, proposed diffs, and options may be prepared before approval. Approval to investigate is not approval to execute a gated operation.

Do not seek approval for every trivial implementation detail. Use judgment within the boundaries above.

If a task cannot be completed safely without a gated operation, stop before that operation, explain why it is needed, and request permission.

## 6. Git and Change Safety

Before editing, inspect the current branch and working tree. Identify pre-existing changes and preserve them.

- Never assume the tree is clean.
- Do not reset, clean, check out over, revert, or otherwise discard existing work unless the user explicitly approves the exact destructive action.
- Before risky work, establish a recoverable checkpoint appropriate to the situation. If a checkpoint requires a commit or push, obtain approval first.
- Keep changes focused and reviewable.
- Avoid unrelated formatting churn and opportunistic refactors.
- Do not commit, push, deploy, or rewrite history without explicit permission.
- Do not conceal, overwrite, or silently absorb unrelated user changes.
- Before handing off, report the changed files and any pre-existing changes that remain untouched.

If the repository state differs from what the task or historical notes imply, investigate before acting.

## 7. Verification Is Mandatory

**Never declare work done without verifying your own changes.** Completion claims must be supported by observed evidence.

### For code changes

1. Review the diff for correctness, accidental edits, scope creep, and consistency with project conventions.
2. Run the narrowest relevant tests and checks.
3. Run `npm run verify` for complete project verification when practical. It is the combined typecheck, content-drift check, test, documentation-drift check, and production-build gate; confirm the current script before relying on that description. `npm run docs:check` runs the documentation step alone and fails when a count, a file list, a tracked-state statement, the gate's composition, or a toolchain version in `docs/SYSTEM_TEARDOWN.md` no longer matches the repository.
4. For content changes, run the applicable content validation, check, and build commands, and confirm generated content is synchronized.
5. If a check fails, investigate and fix failures caused by the change.
6. Do not hide failures, weaken tests, or alter validation merely to obtain a passing result.
7. If a check cannot run, state exactly which check was skipped and why.
8. Re-read the final diff after checks. Passing tests do not replace code review.

### For documentation changes

1. Verify statements against the current authoritative sources and implementation where relevant.
2. Check internal paths, document names, and cross-references where possible.
3. Confirm that the change preserves authority boundaries and does not create contradictory sources of truth.
4. Inspect the final diff.
5. Run the full verification suite when documentation changes affect executable instructions, scripts, or verification procedures.

### Required completion report

State:

- What changed and why.
- Which files and records changed.
- Which verification checks were run and their observed results.
- Which checks were not run and why.
- Remaining uncertainty, blockers, or known limitations.
- Whether the System Teardown was updated, checked and found accurate, or could not be reconciled.
- Whether meaningful session continuity was recorded when needed.

Do not append unrelated feature ideas or out-of-scope suggestions.

## 8. Documentation Governance and Provenance

Documentation is part of the engineering system, not an optional activity performed only when someone requests it.

Maintain it selectively and formally. Keep each document responsible for its own subject; do not duplicate entire specifications in `AGENTS.md`.

### 8.1 Documentation maintenance rules

- Update authoritative documents when an approved change makes them inaccurate or stale.
- Create missing supporting artifacts only when required by the applicable workflow or current task.
- Record significant architectural decisions, including context, considered options, the decision, rationale, and consequences, using the project's established decision-record convention.
- Do not create an architecture decision record for every routine implementation detail.
- Use the bundled `remember` workflow and established session-memory convention when they apply or a handoff is needed.
- Use the bundled `sync` workflow when reconciling project instructions, scope, and specifications.
- Do not invent a parallel memory format that conflicts with an established workflow.
- Do not let documentation updates expand the implementation scope without approval.

### 8.2 Provenance labels

When recording important information, distinguish clearly between:

- **Verified:** Directly confirmed against current files, commands, tests, or other identified evidence.
- **Required/approved:** Stated by an authoritative requirement or approved decision.
- **Proposed:** Awaiting approval.
- **Inferred:** Reasoned from available evidence but not directly confirmed.
- **Historical:** Observed at a particular point in time and potentially stale.

Use dates or verification context for state assessments where useful.

Do not label a claim as verified merely because it appears in an existing document. Do not present a historical observation as a current verified fact.

### 8.3 Preserve decision history

When a significant decision is made or superseded, preserve enough context to explain:

- What problem the decision addressed.
- Which alternatives were considered, when relevant.
- Why the selected option was chosen.
- What consequences, trade-offs, and constraints followed.
- Whether the decision is approved, proposed, superseded, or unresolved.

Do not erase useful historical rationale merely because the current implementation changes. Update the decision's status and link to the replacement record where appropriate.

When a failed approach reveals a durable constraint or prevents a likely repeated mistake, record the finding in the appropriate artifact. Avoid recording every transient debugging step.

## 9. System Teardown Maintenance Protocol

`docs/SYSTEM_TEARDOWN.md` is the project's **living, evidence-based assessment of implementation state**.

Its purpose is to help an unfamiliar agent understand what exists, what is incomplete, what has been verified, and what requires attention—without relying on previous conversations.

### 9.1 Mandatory post-implementation reconciliation

After every implementation task, as part of verification and handoff:

1. Assess whether the task changed implementation status, architecture, dependencies, contracts, tests, verification results, performance, accessibility, risks, known limitations, or roadmap progress.
2. Reconcile `docs/SYSTEM_TEARDOWN.md` with the final verified repository state when relevant information changed or became stale.
3. Update only the affected sections. Do not rewrite unrelated material merely to create activity.
4. Verify every new or changed state claim against files, commands, tests, configuration, or other identifiable evidence.
5. Distinguish implemented behavior from planned behavior, and confirmed findings from inferences or historical observations.
6. Record verification date/context and the checks supporting the assessment. Explicitly mark important areas as unverified when they could not be checked.
7. Preserve useful historical decisions and unresolved issues. Update their status rather than erasing context needed to understand the system.
8. Reconcile related records when warranted, including the roadmap, MCD, feature specifications, scope records, and decision records.
9. Do not let the teardown silently override the authority rules in §4.
10. In the handoff, state whether the teardown was updated, checked and found accurate, or could not be reconciled—and why.

This reconciliation is mandatory; the amount of documentation work is proportional to the change.

A trivial edit may require no teardown content change if the assessment remains accurate. A new engine, persistence layer, architectural change, dependency change, material test change, or newly discovered reliability issue will normally require a corresponding update.

If verification is blocked, do not present the teardown as fully current.

### 9.2 What the teardown must distinguish

Where relevant, the teardown should make it possible to distinguish:

- Implemented and verified.
- Implemented but not yet verified.
- Partially implemented.
- Planned but not implemented.
- Blocked or awaiting a decision.
- Known defect or limitation.
- Historical observation that requires re-verification.

It should also identify important boundaries, relevant verification commands, known risks, and the location of authoritative specifications.

Do not duplicate the entire PRD, MCD, roadmap, or session log. Summarize implementation state and link to the appropriate sources.

### 9.3 When no teardown change is necessary

If the task has no meaningful effect on the recorded implementation state, inspect the relevant teardown claims and confirm they remain accurate.

Do not add empty updates or change dates solely to make the file appear recently maintained. Report that the teardown was checked and required no change.

## 10. Session Memory and Durable Handoffs

The purpose of session memory is to preserve working continuity, not to replace the project's specifications or decision records.

Use the bundled `remember` skill and the project's established `memory.md`/handoff convention where applicable.

### 10.1 What must survive a session boundary

When a task or session leaves meaningful context that the next agent would otherwise have to rediscover, record it in the appropriate repository artifact.

Depending on the task, capture:

- The task's objective and relevant constraints.
- Work completed and its verified state.
- Files or system areas changed.
- Important decisions and their rationale, with links to authoritative decision records.
- Important discoveries, constraints, and dependencies.
- Failed approaches or debugging findings that prevent repeated dead ends.
- Tests and commands run, their observed outcomes, and checks not run.
- Unresolved questions, blockers, and risks.
- The next justified action and any required approval before proceeding.

### 10.2 Separate durable knowledge from temporary working state

Put enduring knowledge in the appropriate authoritative document:

- Product requirements belong in the PRD.
- Technical architecture and contracts belong in the MCD or designated architecture records.
- Implementation-state findings belong in the System Teardown.
- Planned work belongs in the roadmap.
- Detailed feature requirements belong in the applicable specifications or scope records.
- Temporary continuation details belong in the session handoff mechanism.

Do not create parallel memory files or duplicate long-term decisions in session notes.

A handoff must be useful to an unfamiliar agent. It should provide enough context to resume safely without relying on the previous conversation, while linking to authoritative sources instead of copying them wholesale.

Never record an unverified inference as an established fact.

### 10.3 Handoff quality

Before ending a meaningful implementation session, ask:

- Could another agent identify what was done without reading this conversation?
- Can that agent verify the claimed result?
- Are unresolved issues and skipped checks explicit?
- Is the next action justified by the requirements and current implementation state?
- Are approval gates and dependencies clear?
- Are durable discoveries recorded in the right place?

If not, improve the handoff before finishing, within the task's scope.

## 11. Fresh-Agent Reconstruction Test

Repository knowledge should be tested, not merely assumed to be sufficient.

Perform a fresh-context reconstruction check when:

- The onboarding or documentation architecture changes materially.
- Major architectural or product decisions are introduced.
- The project has undergone a substantial implementation phase.
- Documentation drift or missing context has repeatedly caused mistakes.
- There is reason to doubt that an unfamiliar agent could safely continue work.

This check is not required after every trivial change.

### 11.1 Reconstruction criteria

Without relying on previous chat context, use repository records to determine whether a new agent can identify:

1. The product's purpose, core user journey, and explicit non-goals.
2. The architecture and important module boundaries.
3. Which requirements and technical decisions are authoritative.
4. What is implemented, what is incomplete, and what is merely planned.
5. How implementation claims and important constraints were verified.
6. Current risks, unresolved questions, and known limitations.
7. The next justified step in the roadmap.
8. How to run the relevant verification checks.
9. Which workflow skills apply to the task.
10. Which operations require user approval.

### 11.2 Failure criteria

The reconstruction check fails when an unfamiliar agent must guess about a consequential requirement, cannot identify the governing decision, confuses planned work with implemented work, or cannot determine how to verify a change.

When the check reveals a material gap:

1. Identify the missing or contradictory knowledge.
2. Determine which existing artifact should own it.
3. Update that artifact, or create the smallest justified supporting artifact.
4. Update the knowledge index if navigation changed.
5. Reassess whether the gap has actually been resolved.

Do not treat a plausible answer unsupported by repository evidence as a pass.

## 12. Bundled Workflow Skills

The `skills/` directory contains the project's agent-agnostic development workflow toolkit. Read the relevant skill's own instructions before using it; the descriptions below do not replace its actual procedure.

- `architect` — structured discovery and build specifications.
- `audit` — repository/context audit and agent instruction bootstrapping.
- `check` — pre-merge/runtime verification and fresh-model review.
- `debug` — root-cause investigation.
- `develop` — implementation from an approved specification.
- `document` — PR body, changelog, release notes, and postmortem.
- `imprint` — visual pattern capture into `ui-registry.md`.
- `recover` — diagnose failure type before choosing a recovery.
- `remember` — session save/restore and `memory.md`.
- `review` — post-feature review/report.
- `scope` — living scope records under `docs/scope/`.
- `sync` — reconcile `AGENTS.md`, scope, and specifications.
- `test` — test suite authoring.

Follow a skill's preconditions and output conventions when it applies. Do not run every skill for every task. Do not claim a skill or supporting artifact exists or is complete without inspecting it.

If a skill's instructions conflict with this document or an approved project decision, investigate the conflict and resolve it using §4. Do not silently follow whichever instruction is more convenient.

## 13. Product Invariants to Protect

The full requirements live in `docs/PRD.md`. This section records high-impact constraints that agents must not accidentally violate.

- **Core experience:** Discover a topic, research independently, understand it, and explain it aloud in the user's own words.
- **Reveal:** Show a topic title without an explanatory definition or lesson. The mystery is intentional.
- **Daily Ruling:** Allow at most three stories per local day—the initial story and up to two rerolls. The third story becomes that day's story and must remain stable until local midnight.
- **Exploration history:** Every displayed story counts as Explored, including rerolled stories, and contributes to the diversity system.
- **Controlled serendipity:** Recency, domain/tag diversity, difficulty spread, and resurfacing rules should remain invisible to the user.
- **Difficulty:** Difficulty levels are internal; do not surface them as a user-facing rating.
- **Topic exclusions:** Respect exclusions for politics, religion, explicit sexuality, graphic medical topics, highly technical mathematics, and sensitive topics requiring specialist handling.
- **No location personalization:** Do not personalize based on IP, country, or local events.
- **Progress language:** Use shame-free progress language such as `37 / 90`. Do not introduce streak pressure, leaderboards, XP, or compulsion notifications.
- **V1 boundaries:** V1 is static, accountless, local-first, and has no backend. Do not add authentication, monetization, AI tutoring/chat, speech analysis, social features, or other explicit V1 non-goals without an approved scope change.
- **Topic quality:** AI-proposed topic content requires human validation before shipping.
- **3D world:** The world should support the ritual and evolve with progress; it is not navigation for its own sake.
- **Accessibility and performance:** Respect the PRD's requirements, including reduced-motion support and documented performance budgets.

These are high-level reminders, not substitutes for reading the relevant PRD sections before changing affected behavior.

## 14. Technical Constraints and Current-State Cautions

The teardown's latest assessment, 2026-10-18, recorded the following. **Re-check the live repository before relying on any item as current.**

- **Stack:** React 18, strict TypeScript, Vite SPA/static output.
- **3D and state dependencies:** Three.js through `@react-three/fiber` is now used by `src/world/` (spec 0005), and Zustand backs the state layer. `@react-three/drei` and `react-spring` are installed but still unused, waiting on the object families (6.4) and the springs pass (6.8). Do not use an installed dependency without a task requirement and architectural fit.
- **Node:** Node ≥22.6 was required by authoring scripts using native type stripping. The teardown reported `enum` and `namespace` were forbidden in code imported by those scripts. Verify the current implementation and preserve the constraint unless an approved change resolves it.
- **Engine boundary:** The engine is a pure TypeScript module with injected inputs and no DOM, React, or storage dependencies, and it must not import from the app, state, or world layers. `src/engine/purity.test.ts` enforces that by reading the module's own imports, so a violating import fails the suite.
- **Content schema:** The schema in `src/content/types.ts` and `docs/MCD.md` §5 were reconciled on 2026-10-16 (natural-case titles, closed tag union). Reconcile any further discrepancy through §4 rather than assuming either source is automatically correct.
- **Verification status:** `npm run verify` passes with 249 tests across twenty-two files, 24 reviewed topics, and a green CI run (`38947782059`) on the Phase 4 commit. The Phase 6 commits are not yet on the remote. These counts are current as of 2026-10-18 and still only as good as the last gate run; re-run it before relying on them.
- **Known risks:** Dependency advisories, the CI failure path being proven only locally, incomplete product phases, and other risks in the teardown are not blanket authorization to upgrade dependencies, add infrastructure, or work outside the current task.

Inspect current files, scripts, tests, and configuration before making implementation claims or planning changes based on these notes.

## 15. Definition of a Good Handoff

Before finishing, leave the repository in a coherent state and provide a concise, evidence-based handoff.

The handoff should explain:

1. What changed and why.
2. Which files and authoritative records changed.
3. Which verification checks were run and their observed outcomes.
4. Which checks were skipped and why.
5. Any remaining uncertainty, blockers, or known limitations.
6. Whether the System Teardown was updated, checked and found accurate, or could not be reconciled.
7. Whether meaningful session continuity was recorded and where it can be found.
8. The next justified action, if work remains, including any approval gate that must be satisfied.

Do not claim completion ahead of verification. Do not conceal unresolved conflicts. Do not include out-of-scope recommendations.

**The standard is not merely that the current agent can finish the task. The standard is that the next agent can understand the result, verify it, and continue safely from the repository alone.**