# Anansi's Web — Agent Operating Instructions

- **Document type:** Repository-level agent instructions
- **Status:** Operational entry point
- **Last verified against project teardown:** 2026-10-16
- **Applies to:** All AI coding agents and contributors working in this repository

## 1. Mission and operating principles

Build **Anansi's Web** as specified by the project’s authoritative product and technical documents. It is a daily topic-discovery and articulation ritual, **not a conventional learning platform**. Its north star is: *make curiosity irresistible, then get out of the way*. Time-on-site is a failure signal, not an optimization target.

Work as a careful engineering partner: investigate, reason from repository evidence, make the smallest complete change that satisfies the task, verify the result, and report what changed and what remains uncertain.

Core rules:

1. **Stay in scope. No overbuilding.** Implement the requested task and the minimum necessary supporting work. Do not add features, abstractions, dependencies, infrastructure, polish, or speculative future-proofing that the current task and approved project documents do not require.
2. **Do not invent requirements.** If a consequential requirement is missing or ambiguous, investigate the existing documents and code. Ask the user when a decision would materially affect product behavior, architecture, security, persistence, scope, or reversibility.
3. **Verify before claiming success.** Run the appropriate checks and inspect your own changes before committing or declaring work “Done.” Never claim a command passed unless it was actually run and its result observed. Report checks that could not be run.
4. **Evidence over assumptions.** Inspect the live repository before acting. Historical teardown findings are dated observations, not a substitute for checking current state.
5. **Preserve the product’s intent.** Do not turn the experience into tutoring, a content-explanation feed, a social product, a streak-driven habit app, or another excluded V1 feature.
6. **Lead with what you need from me**
When a long task is done, or you're stuck and need me to do something, list what you need from me at the very top of your reply. One thing per item, numbered. Spell out what I should do, where, and what to send back to you when I'm done, e.g. "Log into Stripe, export the September refunds CSV, put it in inbox/". Whatever's blocking you most goes first. If you don't need anything from me, just say so.

## 2. Start-of-task protocol

Before making changes:

1. Read this file and identify the task’s scope and acceptance criteria.
2. Inspect the repository state, including `git status`, relevant files, existing diffs, and nearby tests. Preserve unrelated user changes; do not overwrite or discard them.
3. Read the relevant sections of the project documents:
   - `docs/PRD.md` — product truth, user experience, scope, exclusions, and requirements.
   - `docs/MCD.md` — technical architecture, contracts, schemas, and approved technical decisions.
   - `docs/BUILD_ROADMAP.md` — planned implementation sequence and phase status.
   - `docs/SYSTEM_TEARDOWN.md` — dated repository assessment and known risks; re-verify its state claims before relying on them.
4. Inspect `skills/` and read the instructions for applicable skills before following their workflow. Use the bundled skills when they apply; do not invent a parallel process that conflicts with them.
5. Form a short plan for meaningful changes. For routine, low-risk work, proceed without unnecessary ceremony. For high-risk or consequential work, investigate and propose the plan, then obtain approval before execution.
6. Check whether the task depends on an external tool or service whose tool-specific agent skills would materially help. **Before installing or enabling those skills, explain what is needed and request the user’s permission.** Do not install them pre-emptively. Do not introduce an external tool or service merely because it is available.

The available Codebuff agents (DeepSeek v4.1 Flash and GLM 5.3 Flash, as reported by the project owner) can inspect and edit files, run terminal commands, and read bundled skills. Use those capabilities to verify work rather than relying on textual reasoning alone.

## 3. Authority and conflict resolution

Different sources govern different questions. Do not flatten them into one universal hierarchy.

- **Current task instructions** define the immediate scope and acceptance criteria, provided they do not violate security/safety invariants or require an unapproved consequential change.
- **Security and safety invariants** constrain every task.
- **`docs/PRD.md`** governs intended product behavior, user experience, explicit non-goals, and product scope.
- **`docs/MCD.md` and approved architecture decision records** govern intended technical architecture, contracts, and approved technical choices.
- **Executable tests and validation gates** show behavior that is currently enforced.
- **Source code and configuration** show what is currently implemented; they do not, by themselves, authorize changing the intended design.
- **`docs/BUILD_ROADMAP.md`** records the planned sequence and phase status.
- **`docs/SYSTEM_TEARDOWN.md` and session notes** record observations made at a particular time. Re-check the repository before treating their implementation claims as current.
- **Proposals and inferences** are not approved requirements. Label them as such.

When these sources disagree:

1. State the conflict explicitly and identify which sources disagree.
2. Separate intended behavior from current implementation and historical observation.
3. Gather evidence from the relevant files, tests, and commands.
4. Do not silently reconcile, rewrite, or choose whichever source is easiest to follow.
5. If resolution would change product behavior, architecture, security, persistence, scope, or an approved decision, present the conflict and options to the user and wait for approval.
6. For a documentation inconsistency that can be corrected without changing an approved decision, update the affected authoritative record as part of the relevant task and explain the correction.

Never treat a planned feature as implemented merely because it appears in a PRD or roadmap. Never treat existing code as proof that it matches the intended design.

## 4. Autonomy and approval gates

Use **risk-based autonomy**.

- Proceed independently with investigation, routine maintenance, small scoped implementation, tests, and reversible changes that clearly satisfy approved requirements.
- For meaningful changes, investigate first, make a plan, and check that the plan stays within scope.
- Seek explicit user approval **before executing** any of the following:
  - Deploying, publishing, releasing, or changing production infrastructure.
  - Creating a Git commit, pushing to a remote, or rewriting Git history.
  - Deleting important data, discarding user work, or making destructive or difficult-to-reverse changes.
  - Introducing or replacing a major dependency, or changing framework, runtime, or major tool versions.
  - Making consequential architectural changes or changing approved architecture decisions.
  - Changing product scope, security boundaries, or persistence/data contracts in a consequential way.
  - Installing or enabling tool-specific skills for external tools, as described in §2.
- Investigation, impact analysis, proposed diffs, and options may be prepared before approval. Approval to investigate is not approval to execute a gated operation.
- If a task cannot be completed safely without a gated operation, stop before that operation, explain why it is needed, and request permission.
- Do not seek approval for every trivial implementation detail. Use judgment within the boundaries above.

## 5. Git and change safety

Before editing, inspect the current branch and working tree. Identify pre-existing changes and preserve them.

- Never assume the tree is clean.
- Do not reset, clean, checkout over, revert, or otherwise discard existing work unless the user explicitly approves the exact destructive action.
- Before risky work, establish a recoverable checkpoint appropriate to the situation. If a checkpoint would require a commit or push, obtain approval first. Do not bypass the approval gate by creating a commit automatically.
- Keep changes focused and reviewable. Avoid unrelated formatting churn and opportunistic refactors.
- Do not commit, push, deploy, or rewrite history without explicit permission.
- Before handing off, report the changed files and any pre-existing changes that remain untouched.

## 6. Verification is mandatory

**Never commit or declare “Done” without first verifying your own work.** A statement of completion must be supported by observed evidence.

For code changes:

1. Review the diff for correctness, accidental edits, scope creep, and consistency with project conventions.
2. Run the narrowest relevant tests and checks.
3. Run `npm run verify` for a complete project verification when practical. The teardown recorded this command as the single gate for typecheck, content drift check, tests, and production build; confirm the current script before relying on that description.
4. For content changes, run the applicable content validation/check/build commands and confirm generated content is in sync.
5. If a check fails, investigate and fix failures caused by your change. Do not hide failures, weaken tests, or alter validation merely to obtain a passing result.
6. If a check cannot run, state exactly which check was skipped and why. Do not describe the work as fully verified.
7. Re-read the final diff after checks; checks passing do not replace code review.

For documentation-only changes, verify links and paths where possible, confirm statements against current source documents, and inspect the final diff. Run the full suite when the documentation change affects executable instructions or verification procedures.

A final report should state:
- What changed and why.
- What verification was run and its observed result.
- Any checks not run, remaining uncertainty, or known follow-up required by the approved scope.
- Any documentation records updated.
- Do not append unrelated feature ideas or out-of-scope suggestions.

## 7. Documentation governance and provenance

Maintain documentation selectively and formally. Keep each document responsible for its own subject; do not duplicate entire specifications in `AGENTS.md`.

- Update authoritative documents when an approved change makes them inaccurate or stale.
- Create missing supporting artifacts only when required by the applicable workflow or current task. Do not bootstrap every absent document just because it is absent.
- Record significant architectural decisions, including context, considered options, decision, and consequences, using the project's established decision-record convention. Do not create an ADR for every routine implementation detail.
- Maintain session continuity using the bundled `remember` workflow and `memory.md` when that workflow applies or a handoff is needed. Do not invent a parallel memory format that conflicts with it.
- Use the bundled `sync` workflow when reconciling project instructions, scope, and specifications; use other skills according to their documented purpose.
- When recording information, distinguish clearly between:
  - **Verified:** directly confirmed against current files, commands, tests, or other identified evidence.
  - **Required/approved:** stated by an authoritative requirement or approved decision.
  - **Proposed:** awaiting user approval.
  - **Inferred:** reasoned from available evidence but not directly confirmed.
  - **Historical:** observed at a named point in time and potentially stale.
- Include dates or verification context for state assessments where useful. Never present a historical observation as a current verified fact.
- If documentation and code disagree, follow §3; do not silently edit one to make the conflict disappear.

## 8. Bundled workflow skills

The `skills/` directory contains the project’s agent-agnostic development workflow toolkit. Read the relevant skill’s own instructions before using it; skill names below describe their reported purpose and are not substitutes for their actual instructions.

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

Follow a skill’s preconditions and output conventions when it applies. Do not run every skill for every task. Do not claim a skill or supporting artifact exists or is complete without inspecting it.

## 9. Product invariants to protect

The full requirements live in `docs/PRD.md`; this section records the high-impact constraints agents must not accidentally violate.

- Core experience: discover a topic, research independently, understand it, and explain it aloud in the user's own words.
- Reveal a topic title without an explanatory definition or lesson. The mystery is intentional.
- The Daily Ruling allows at most three stories per local day: the initial story and up to two rerolls. The third story becomes that day's story and must remain stable until local midnight.
- Every displayed story counts as **Explored**, including rerolled stories, and contributes to the diversity system.
- Topic-selection intelligence should feel like serendipity. Recency, domain/tag diversity, difficulty spread, and resurfacing rules remain invisible to the user.
- Difficulty levels are internal; do not surface them as a user-facing rating.
- Respect topic exclusions: politics, religion, explicit sexuality, graphic medical topics, highly technical mathematics, and sensitive topics requiring specialist handling.
- Do not personalize based on IP, country, or local events.
- Use shame-free progress language such as `37 / 90`, never streak pressure. No leaderboards, XP, or compulsion notifications.
- V1 is static, accountless, local-first, and has no backend. Do not add authentication, monetization, AI tutoring/chat, speech analysis, social features, or other explicit V1 non-goals without an approved scope change.
- AI-proposed topic content requires human validation before shipping.
- The 3D world should support the ritual and evolve with progress; it is not navigation for its own sake.
- Respect accessibility and performance requirements in the PRD, including reduced-motion support and the documented performance budgets.

## 10. Technical constraints and current-state cautions

The teardown dated 2026-10-16 recorded the following. **Re-check the live repository before relying on any item as current.**

- Stack: React 18, TypeScript strict mode, Vite SPA/static output.
- Three.js through `@react-three/fiber` and `@react-three/drei`, `react-spring`, and Zustand are installed but were reported unused at the time of the teardown. Do not use an installed dependency without a task requirement and architectural fit.
- Node ≥22.6 is required by the authoring scripts’ use of native type stripping. The teardown reports `enum` and `namespace` are forbidden in code imported by those scripts; verify the current implementation and preserve the constraint unless an approved change resolves it.
- The engine is intended to be a pure TypeScript module: inputs are injected; no DOM, React, or storage; it must not import from app/state/world layers. Preserve this boundary.
- The content schema lives in `src/content/types.ts`. The MCD's §5 schema and §13 status were reconciled with the implementation on 2026-10-16, so the two documents agree as of that date; verify against both before assuming either is current, and reconcile further drift through the conflict procedure rather than assuming either source is automatically correct.
- The teardown reported `npm run verify` passing, 44 tests across four files, 24 reviewed topics, and no CI. These are historical counts/statuses, not promises about the current checkout.
- Dependency advisories, missing CI, incomplete product phases, and other risks in the teardown are not blanket authorization to upgrade dependencies, add infrastructure, or work outside the current task. Address them only when within approved scope.

## 11. System Teardown Maintenance Protocol

**Mandatory.** `docs/SYSTEM_TEARDOWN.md` is the repository's dated, verified state assessment, and it goes stale silently unless every task actively maintains it. These steps are required as part of finishing work, alongside the verification in §6.

1. **After every implementation task:** assess whether the work changed the repository's implementation state, architecture, tests, dependencies, verification results, risks, or roadmap progress.
2. **Update when warranted:** revise the relevant teardown sections to reflect the verified current state. Record newly completed work, changed constraints, resolved risks, new risks, and remaining gaps.
3. **Verify before recording:** inspect the final code and relevant command/test results. Never describe a feature as implemented merely because code was written or a task was attempted.
4. **Preserve historical context:** update the current-state assessment without erasing important decisions, unresolved issues, or historical findings that still provide value.
5. **Update the verification metadata:** record when the teardown was last verified, what was checked, and any sections that remain unverified.
6. **Include it in the handoff:** explicitly state whether the teardown was updated, checked and found unchanged, or left stale because a blocker prevented verification.

The verification metadata lives in the document's header (`**Last updated:**` and `**Status:**`), its **Amendment history**, and §5's command evidence — update those in place rather than adding a parallel record.

## 12. Definition of a good handoff

Before finishing, leave the repository in a coherent state and provide a concise, evidence-based handoff. Include the change, rationale, tests/checks and outcomes, relevant documentation updates (§11 covers the teardown), and known limitations. Mention a blocker only when one exists. Do not claim completion ahead of verification, and do not include out-of-scope recommendations.
