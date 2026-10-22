import { describe, expect, it } from 'vitest'

import { checkRoadmap, checkScope, checkSpec } from './doc-status.ts'

/** The shape of the roadmap's phase map, as a fixture. */
const roadmap = (overrides: { map?: string; heading?: string; header?: string } = {}): string =>
  [
    '# Build Roadmap',
    '',
    overrides.header ?? '**Phase status** lives in the phase map below.',
    '',
    '| Phase | Name | Status | Depends on |',
    '|---|---|---|---|',
    overrides.map ?? '| 6 | The 3D world | built | 4 |',
    '',
    overrides.heading ?? '## Phase 6 — The 3D world (BUILT 2026-10-18)',
    '',
  ].join('\n')

const scope = (overrides: { row?: string; section?: string; box?: string } = {}): string =>
  [
    '# Scope',
    '',
    '| # | Feature | Phase | Status |',
    '|---|---|---|---|',
    overrides.row ?? '| 8 | The canvas and the web graph | Slice 3 | done |',
    '',
    '## Slice 3',
    '',
    overrides.section ?? '### 8. The canvas and the web graph · done',
    'A single lazy loaded canvas.',
    '',
    overrides.box ?? '- [x] Build it: `/develop the stage`',
    '',
  ].join('\n')

const spec = (status: string, built: boolean): string =>
  [
    '# 0005. The stage',
    '',
    `**Status**: ${status}`,
    ...(built ? ['**Built**: 2026-10-18 — the lazy canvas and the graph'] : []),
    '',
  ].join('\n')

const messages = (problems: readonly { message: string }[]): string =>
  problems.map((problem) => problem.message).join('\n')

describe('checkSpec', () => {
  it('accepts a built spec with a Built line', () => {
    expect(checkSpec('docs/specs/0005.md', spec('Built', true))).toEqual([])
  })

  it('accepts a spec still in progress with no Built line', () => {
    expect(checkSpec('docs/specs/0009.md', spec('In Progress', false))).toEqual([])
  })

  it('fails a spec that says Built with no record of what landed', () => {
    expect(messages(checkSpec('a.md', spec('Built', false)))).toContain('no `**Built**:` line')
  })

  it('fails a spec that has a Built line but is not marked Built', () => {
    expect(messages(checkSpec('a.md', spec('In Progress', true)))).toContain('is present but the status is')
  })

  it('fails a status outside the vocabulary, including a third synonym', () => {
    expect(messages(checkSpec('a.md', spec('Complete', true)))).toContain('is not one of')
  })

  it('fails a spec with no Status line at all', () => {
    expect(messages(checkSpec('a.md', '# 0009. Nothing\n'))).toContain('no `**Status**:` line')
  })
})

describe('checkRoadmap', () => {
  it('accepts a phase map that agrees with its headings', () => {
    expect(checkRoadmap('roadmap.md', roadmap())).toEqual([])
  })

  it('accepts an in-progress phase whose heading says so', () => {
    const text = roadmap({
      map: '| 8 | Evolution and surprises | in progress | 5, 6 |',
      heading: '## Phase 8 — Evolution and surprises (IN PROGRESS: 8.1 BUILT 2026-10-20)',
    })

    expect(checkRoadmap('roadmap.md', text)).toEqual([])
  })

  it('accepts a planned phase whose heading claims nothing', () => {
    const text = roadmap({
      map: '| 9 | Quality gates | planned | 7, 8 |',
      heading: '## Phase 9 — Quality gates',
    })

    expect(checkRoadmap('roadmap.md', text)).toEqual([])
  })

  it('fails the sentence that said phases were planned after they shipped', () => {
    const text = roadmap({ header: '**Status:** Phases 6 onward are planned, not built.' })

    expect(messages(checkRoadmap('roadmap.md', text))).toContain('belongs in the phase map')
  })

  it('fails a heading that contradicts the map', () => {
    const text = roadmap({ heading: '## Phase 6 — The 3D world' })

    expect(messages(checkRoadmap('roadmap.md', text))).toContain('does not say so')
  })

  it('fails a planned phase whose heading still claims a build', () => {
    const text = roadmap({
      map: '| 6 | The 3D world | planned | 4 |',
      heading: '## Phase 6 — The 3D world (COMPLETE)',
    })

    expect(messages(checkRoadmap('roadmap.md', text))).toContain('claims otherwise')
  })

  it('fails a deferred phase whose heading does not say so', () => {
    const text = roadmap({ map: '| 6 | The 3D world | deferred | 4 |' })

    expect(messages(checkRoadmap('roadmap.md', text))).toContain('does not say so')
  })

  it('fails a phase heading with no row in the map', () => {
    const text = roadmap({ heading: '## Phase 7 — Modes\n\n## Phase 6 — The 3D world (BUILT)' })

    expect(messages(checkRoadmap('roadmap.md', text))).toContain('no row in the phase map')
  })

  it('fails a map row with no heading', () => {
    const text = roadmap({ map: '| 6 | The 3D world | built | 4 |\n| 7 | Modes | built | 6 |' })

    expect(messages(checkRoadmap('roadmap.md', text))).toContain('no "## Phase 7" heading exists')
  })

  it('fails a status outside the vocabulary', () => {
    const text = roadmap({ map: '| 6 | The 3D world | shipped | 4 |' })

    expect(messages(checkRoadmap('roadmap.md', text))).toContain('use one of')
  })

  it('fails a document with no phase map', () => {
    expect(messages(checkRoadmap('roadmap.md', '# Build Roadmap\n'))).toContain('no phase map')
  })
})

describe('checkScope', () => {
  it('accepts a row and section that agree', () => {
    expect(checkScope('scope.md', scope())).toEqual([])
  })

  it('fails a section that disagrees with its row', () => {
    const text = scope({ row: '| 8 | The canvas and the web graph | Slice 3 | in-progress |' })

    expect(messages(checkScope('scope.md', text))).toContain('but its table row says "in-progress"')
  })

  it('fails a section with every box ticked that is still in progress', () => {
    const text = scope({
      row: '| 8 | The canvas and the web graph | Slice 3 | in-progress |',
      section: '### 8. The canvas and the web graph · in-progress',
    })

    expect(messages(checkScope('scope.md', text))).toContain('has every box ticked')
  })

  it('fails a done section with an unticked box', () => {
    const text = scope({ box: '- [ ] Verify it: `/check verify`' })

    expect(messages(checkScope('scope.md', text))).toContain('still has 1 unticked box')
  })

  it('accepts the spaced spelling of a hyphenated status', () => {
    const text = scope({
      row: '| 8 | The canvas and the web graph | Slice 3 | in-progress |',
      section: '### 8. The canvas and the web graph · in progress',
      box: '- [ ] Verify it: `/check verify`',
    })

    expect(checkScope('scope.md', text)).toEqual([])
  })

  it('fails a status outside the vocabulary, such as needs a decision', () => {
    const text = scope({ section: '### 8. The canvas and the web graph · needs a decision' })

    expect(messages(checkScope('scope.md', text))).toContain('"needs a decision"')
    expect(messages(checkScope('scope.md', text))).toContain('use one of')
  })
})
