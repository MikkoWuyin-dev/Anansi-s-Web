import { describe, expect, it } from 'vitest'

import { checkClaims, mapAreaTestClaims, type Facts } from './claims.ts'

/**
 * A faithful miniature of the state assessment, containing one instance of
 * every claim shape the rules know how to check. Each test mutates it in one
 * place, so a failure names the rule that stopped working.
 */
const trackedFiles = [
  'content/topics/azolla.json',
  'content/topics/bioluminescence.json',
  'docs/BUILD_ROADMAP.md',
  'docs/MCD.md',
  'docs/PRD.md',
  'docs/SYSTEM_TEARDOWN.md',
  'scripts/lib/validate.test.ts',
  'scripts/lib/validate.ts',
  'skills/audit/SKILL.md',
  'skills/check/SKILL.md',
  'skills/develop/SKILL.md',
  'src/app/App.tsx',
  'src/content/types.ts',
  'src/main.tsx',
]

const onDisk = new Set([
  ...trackedFiles,
  'content',
  'docs',
  'scripts',
  'skills',
  'src',
])

const pathRows = [
  ...trackedFiles.map((file) => `| \`${file}\` | Present | tracked |`),
  '| `docs` | Present | the documents |',
  '| `scripts` | Present | the authoring tools |',
]

const FIXTURE = [
  "# Anansi's Web — System Teardown",
  '',
  '- **Document type:** Whole-repository audit and state assessment',
  '- **Last updated:** 2026-10-16 (v2.1)',
  '- **Status:** Complete',
  '',
  '---',
  '',
  '## Amendment history',
  '',
  '**v2.0 — 2026-10-16.** The suite held 4 files, 44 tests, and the documentation weighed 2386 lines.',
  '',
  '**v2.1 — 2026-10-16.** Every count below was re-measured.',
  '',
  '---',
  '',
  '## 3. Repository map',
  '',
  '```',
  'fixture/                        14 tracked files',
  '├── docs/',
  '│   ├── PRD.md                  20 lines   product truth',
  '│   ├── MCD.md                  30 lines   technical truth',
  '│   ├── BUILD_ROADMAP.md        40 lines   the build sequence',
  '│   └── SYSTEM_TEARDOWN.md      this file',
  '├── scripts/',
  '│   └── lib/',
  '│       └── *.test.ts           3 tests',
  '└── skills/                     4 files, ~50 lines — the toolkit',
  '```',
  '',
  '| Category | Files | Lines |',
  '|---|---|---|',
  '| Workflow skills | 4 | 50 |',
  '| Project documentation | 3 | 90 |',
  '| Authoring scripts | 2 | 12 |',
  '| Application source | 3 | 30 |',
  '| Content (2 JSON + 1 README) | 3 | 8 |',
  '',
  '## 5. Verified current state',
  '',
  '### 5.1 The gate — PASSES',
  '',
  '```',
  '$ npm run verify      # typecheck && content:check && test && build',
  'exit 0',
  '```',
  '',
  'All four gates (`typecheck`, `content:check`, `test`, `build`) exit 0.',
  '',
  '### 5.3 Tests — PASS, 3 of them',
  '',
  '```',
  '$ npm run test        # vitest run',
  ' ✓ scripts/lib/validate.test.ts   ( 3 tests)',
  ' Test Files  1 passed (1)',
  '      Tests  3 passed (3)',
  'exit 0',
  '```',
  '',
  '### 5.4 Content gate — PASSES',
  '',
  '```',
  '$ npm run content:check',
  'src/content/topics.generated.ts is up to date (2 topics)',
  'exit 0',
  '```',
  '',
  'The library holds 2 reviewed topics: 2 reviewed JSON entries in `content/topics/`,',
  '2 topics, one per domain, balanced 1 / 1 / 0 across difficulty levels,',
  '2 of 300+. The shell reports "The web holds 2 stories".',
  '',
  '### 5.8 Dependencies — HEALTHY',
  '',
  'One package in the lockfile, lockfile v3: vitest 2.1.9, typescript 5.6.3.',
  'Node ≥ 22.6 is required by the authoring scripts.',
  '',
  '### 5.9 Present versus missing',
  '',
  '```',
  'PRESENT  docs         scripts',
  'PRESENT  src          content',
  'PRESENT  skills       docs/PRD.md',
  'PRESENT  docs/MCD.md  docs/BUILD_ROADMAP.md',
  'PRESENT  docs/SYSTEM_TEARDOWN.md',
  'MISSING  README.md    docs/specs',
  'MISSING  src/world',
  '```',
  '',
  '### 5.10 CI workflow — GREEN',
  '',
  '`.github/workflows/verify.yml` runs `actions/checkout@v7` with Node `24.x`,',
  'then `npm ci` and `npm run verify`.',
  '',
  'The gate exits 0 — 3 tests passed, 1 files, dist produced.',
  '',
  '### 7.7 The workflow skills system',
  '',
  '3 workflow skills are vendored into the repository, and the toolkit',
  'holds 3 skills in total.',
  '',
  '### 9.1 Path by path',
  '',
  '| Planned | Status | Notes |',
  '|---|---|---|',
  ...pathRows,
  '| `README.md` | **Missing** | no entry point yet |',
  '',
  'The scope holds 1 enrolled and 2 planned features.',
  '',
  '### 12. Quick reference',
  '',
  '```bash',
  'npm run verify         # THE gate: typecheck + content:check + test + build',
  'npm run typecheck      # tsc --noEmit',
  'npm run test           # vitest run — 3 tests',
  'npm run build          # vite build → dist/',
  'npm run content:check  # fail if the bundle has drifted',
  '```',
  '',
  '---',
  '',
  '*End of System Teardown v2.1. All state claims verified on 2026-10-16.*',
].join('\n')

const facts = (overrides: Partial<Facts> = {}): Facts => ({
  trackedFiles,
  workingFiles: trackedFiles,
  docs: [
    { path: 'docs/PRD.md', lines: 20 },
    { path: 'docs/MCD.md', lines: 30 },
    { path: 'docs/BUILD_ROADMAP.md', lines: 40 },
  ],
  skills: { files: 4, lines: 50, count: 3 },
  scripts: { files: 2, lines: 12 },
  src: { files: 3, lines: 30 },
  content: { files: 3, lines: 8, topics: 2, difficulty: [1, 1, 0] },
  tests: { byFile: { 'scripts/lib/validate.test.ts': 3 }, files: 1, total: 3 },
  npmScripts: {
    build: 'vite build',
    'content:check': 'node --experimental-strip-types scripts/compile-content.ts --check',
    'content:build': 'node --experimental-strip-types scripts/compile-content.ts',
    'content:validate': 'node --experimental-strip-types scripts/validate-content.ts',
    'docs:check': 'node --experimental-strip-types scripts/check-docs.ts',
    test: 'vitest run',
    typecheck: 'tsc --noEmit',
    verify:
      'npm run typecheck && npm run content:check && npm run test && npm run build',
  },
  verifySteps: ['typecheck', 'content:check', 'test', 'build'],
  nodeEngine: '>=22.6.0',
  lockfileVersion: 3,
  lockVersions: { typescript: '5.6.3', vitest: '2.1.9' },
  workflow: {
    uses: ['actions/checkout@v7'],
    nodeVersion: '24.x',
    commands: ['npm ci', 'npm run verify'],
  },
  scope: { enrolled: 1, planned: 2 },
  exists: (path) => onDisk.has(path),
  ...overrides,
})

/** Rewrites the fixture in one place, so each test states its own drift. */
const drift = (find: string, replace: string): string => {
  const index = FIXTURE.indexOf(find)

  if (index === -1) {
    throw new Error(`the fixture does not contain: ${find}`)
  }

  return FIXTURE.slice(0, index) + replace + FIXTURE.slice(index + find.length)
}

const run = (document: string, overrides: Partial<Facts> = {}) =>
  checkClaims(document, facts(overrides))

const claimsOf = (document: string, overrides: Partial<Facts> = {}): string[] =>
  run(document, overrides).violations.map((violation) => violation.claim)

describe('a document that matches the repository', () => {
  it('reports no drift, so no rule fires on a correct document', () => {
    expect(run(FIXTURE).violations).toEqual([])
  })

  it('actually compares a substantial number of claims', () => {
    expect(run(FIXTURE).checked).toBeGreaterThan(60)
  })
})

describe('counts', () => {
  it('catches a stale file count and names the line', () => {
    const report = run(drift('14 tracked files', '13 tracked files'))

    expect(report.violations).toContainEqual({
      claim: 'the repository map: how many files the repository holds',
      documented: '13',
      actual: '14',
      line: FIXTURE.split('\n').findIndex((line) => line.includes('tracked files')) + 1,
    })
  })

  it('counts a file that is not committed yet, so the number survives the commit', () => {
    const claims = claimsOf(FIXTURE, {
      workingFiles: [...trackedFiles, 'scripts/lib/new.ts'],
    })

    expect(claims).toContain('the repository map: how many files the repository holds')

    // Tracked state is still measured against git alone, so the file list is
    // not quietly satisfied by the same new file.
    expect(claims).not.toContain('the present list: `docs/PRD.md`')
  })

  it('catches a stale document line count', () => {
    expect(claimsOf(drift('PRD.md                  20 lines', 'PRD.md                  21 lines'))).toContain(
      'the line count of `docs/PRD.md`',
    )
  })

  it('catches a stale weight-table total', () => {
    expect(claimsOf(drift('| Authoring scripts | 2 | 12 |', '| Authoring scripts | 2 | 13 |'))).toContain(
      'the weight table: Authoring scripts, lines',
    )
  })

  it('catches an application-source file count that no longer holds', () => {
    expect(claimsOf(FIXTURE, { src: { files: 4, lines: 30 } })).toContain(
      'the weight table: Application source, files',
    )
  })

  it('leaves the build-config row alone, because it names no fixed set of files', () => {
    expect(claimsOf(FIXTURE, { src: { files: 9, lines: 30 } })).not.toContain(
      'the weight table: Build config, files',
    )
  })

  it('catches a stale test total', () => {
    expect(claimsOf(drift('Tests  3 passed (3)', 'Tests  4 passed (4)'))).toContain(
      'how many tests the suite holds',
    )
  })

  it('catches a test file that the suite no longer collects', () => {
    const document = drift(
      ' ✓ scripts/lib/validate.test.ts   ( 3 tests)',
      ' ✓ scripts/lib/gone.test.ts       ( 3 tests)',
    )

    expect(claimsOf(document)).toContain('the suite: scripts/lib/gone.test.ts')
  })

  it('catches a collected test file missing from the transcript', () => {
    const report = run(FIXTURE, {
      tests: {
        byFile: { 'scripts/lib/validate.test.ts': 3, 'scripts/lib/claims.test.ts': 2 },
        files: 2,
        total: 5,
      },
    })

    expect(report.violations.map((violation) => violation.claim)).toContain(
      'the suite: scripts/lib/claims.test.ts is listed in the transcript',
    )
  })

  it('catches a stale per-area test total in the repository map', () => {
    expect(claimsOf(drift('*.test.ts           3 tests', '*.test.ts           4 tests'))).toContain(
      'the repository map: tests under `scripts/lib/`',
    )
  })

  it('catches a stale topic count, in every phrasing', () => {
    const document = drift(
      'The library holds 2 reviewed topics',
      'The library holds 3 reviewed topics',
    )

    expect(claimsOf(document)).toContain('how many reviewed topics the library holds')
  })

  it('catches a difficulty spread that no longer holds', () => {
    expect(claimsOf(drift('balanced 1 / 1 / 0', 'balanced 2 / 0 / 0'))).toContain(
      'the difficulty spread at level 1',
    )
  })

  it('catches a stale scope feature count', () => {
    expect(claimsOf(drift('1 enrolled and 2 planned', '1 enrolled and 3 planned'))).toContain(
      'how many features the scope plans',
    )
  })
})

describe('the gate and the toolchain', () => {
  it('catches a documented verify chain that no longer matches', () => {
    const document = drift(
      '# typecheck && content:check && test && build',
      '# typecheck && test && build',
    )

    expect(claimsOf(document)).toContain('the steps `npm run verify` runs')
  })

  it('catches a gate that grew a step', () => {
    const claims = claimsOf(FIXTURE, {
      verifySteps: ['typecheck', 'content:check', 'test', 'docs:check', 'build'],
    })

    expect(claims).toContain('how many steps the gate runs')
    expect(claims).toContain('the steps the gate summary lists')
    expect(claims).toContain('the steps `npm run verify` runs')
  })

  it('catches a documented script that package.json does not define', () => {
    expect(claimsOf(drift('npm run build          # vite build', 'npm run lint           # lint'))).toContain(
      'the command `npm run lint`',
    )
  })

  it('catches a Node floor that drifted from engines.node', () => {
    expect(claimsOf(FIXTURE, { nodeEngine: '>=24.0.0' })).toContain(
      'the Node floor in `engines.node`',
    )
  })

  it('catches a stale lockfile version', () => {
    expect(claimsOf(FIXTURE, { lockfileVersion: 2 })).toContain(
      'the lockfile version',
    )
  })

  it('catches a stale installed dependency version', () => {
    expect(claimsOf(drift('vitest 2.1.9', 'vitest 2.0.0'))).toContain(
      'the installed version of `vitest`',
    )
  })

  it('catches a workflow action that changed version', () => {
    expect(claimsOf(drift('`actions/checkout@v7`', '`actions/checkout@v5`'))).toContain(
      'the workflow uses `actions/checkout@v5`',
    )
  })

  it('catches a workflow that no longer runs the gate', () => {
    expect(claimsOf(FIXTURE, { workflow: { uses: ['actions/checkout@v7'], nodeVersion: '24.x', commands: ['npm ci'] } })).toContain(
      'the workflow runs `npm run verify`',
    )
  })
})

describe('file lists and tracked state', () => {
  it('catches a path claimed present that is missing', () => {
    const report = run(FIXTURE, {
      exists: (path) => onDisk.has(path) && path !== 'skills',
    })

    expect(report.violations).toContainEqual({
      claim: 'the present list: `skills`',
      documented: 'present and tracked',
      actual: 'not on disk',
      line: FIXTURE.split('\n').findIndex((line) => line.startsWith('PRESENT  skills')) + 1,
    })
  })

  it('catches a bare directory name claimed present that is missing', () => {
    const report = run(FIXTURE, {
      exists: (path) => onDisk.has(path) && path !== 'scripts',
    })

    expect(report.violations.map((violation) => violation.claim)).toContain(
      'the present list: `scripts`',
    )
  })

  it('catches a path claimed present that git does not track', () => {
    const untracked = trackedFiles.filter((file) => file !== 'docs/PRD.md')

    expect(claimsOf(FIXTURE, { trackedFiles: untracked })).toContain(
      'the present list: `docs/PRD.md`',
    )
  })

  it('catches a path claimed missing that exists', () => {
    const report = run(FIXTURE, {
      exists: (path) => onDisk.has(path) || path === 'README.md',
    })

    expect(report.violations.map((violation) => violation.claim)).toContain(
      'the missing list: `README.md`',
    )
  })

  it('catches a path table row that no longer holds', () => {
    const report = run(FIXTURE, {
      exists: (path) => onDisk.has(path) && path !== 'src/main.tsx',
    })

    expect(report.violations.map((violation) => violation.claim)).toContain(
      'the path table: `src/main.tsx`',
    )
  })
})

describe('the shape of the document itself', () => {
  it('catches a closing version that no longer matches the header', () => {
    expect(claimsOf(drift('*End of System Teardown v2.1.', '*End of System Teardown v2.2.'))).toContain(
      'the header version against the closing version',
    )
  })

  it('catches a header left behind by the newest amendment entry', () => {
    expect(claimsOf(drift('(v2.1)', '(v2.2)'))).toContain(
      'the header version against the newest amendment entry',
    )
  })

  it('reports a claim that has been deleted rather than silently dropping it', () => {
    const document = drift('14 tracked files', 'no count at all')
    const report = run(document)

    expect(report.violations).toContainEqual({
      claim: 'the repository map: how many files the repository holds',
      documented: 'the claim is gone',
      actual: 'the document states it',
      line: 0,
    })
  })

  it('reports a missing amendment history', () => {
    expect(claimsOf(drift('## Amendment history', '## Recent changes'))).toContain(
      'the amendment history exists',
    )
  })

  it('leaves the amendment history alone, because it records the past', () => {
    const document = drift(
      '**v2.0 — 2026-10-16.** The suite held 4 files, 44 tests, and the documentation weighed 2386 lines.',
      '**v2.0 — 2026-10-16.** The suite held 9 files, 999 tests, and the documentation weighed 99999 lines.',
    )

    expect(run(document).violations).toEqual([])
  })
})

describe('the repository map tree', () => {
  it('resolves a nested directory to its full path', () => {
    expect(
      mapAreaTestClaims('└── scripts/\n│   └── lib/\n│       └── *.test.ts   3 tests'),
    ).toEqual([{ area: 'scripts/lib/', count: 3, line: 3 }])
  })

  it('ignores a tree without per-area test totals', () => {
    expect(mapAreaTestClaims('└── skills/   4 files, ~50 lines')).toEqual([])
  })
})
