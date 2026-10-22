import { describe, expect, it } from 'vitest'

import { checkBudget, checkReferences, pathIn } from './doc-refs.ts'

const onDisk = new Set(['AGENTS.md', 'docs', 'docs/MCD.md', 'src/engine', 'src/engine/purity.test.ts'])

const repo = {
  exists: (path: string) => onDisk.has(path),
  // Documents name modules by bare name in prose: `ritual.ts`, `state/`.
  existsBare: (name: string) => new Set(['ritual.ts', 'purity.test.ts', 'state', 'AGENTS.md']).has(name),
  npmScripts: new Set(['verify', 'test', 'content:check']),
}

describe('pathIn', () => {
  it('reads repository paths and drops an anchor', () => {
    expect(pathIn('docs/MCD.md')).toBe('docs/MCD.md')
    expect(pathIn('docs/MCD.md#5-the-engine')).toBe('docs/MCD.md')
    expect(pathIn('src/engine/')).toBe('src/engine/')
    expect(pathIn('AGENTS.md')).toBe('AGENTS.md')
    expect(pathIn('.github/workflows/verify.yml')).toBe('.github/workflows/verify.yml')
  })

  it('keeps a bare module or directory name so it can be resolved', () => {
    expect(pathIn('ritual.ts')).toBe('ritual.ts')
    expect(pathIn('state/')).toBe('state/')
  })

  it('ignores spans that are not paths', () => {
    for (const span of [
      'anansi:v1:mode',
      '<html data-mode>',
      '127.0.0.1:5173',
      'npm run verify',
      'https://example.com/a.md',
      'resolveMode(choice, system)',
      '0.169',
      'and/or',
      '--anansi-surface',
      '.gitignore',
      '.tsx',
      '.test.tsx',
      'crypto.randomUUID',
      '~/.config/freebuff-desktop/skills/',
      '/src/main.tsx',
      'src/**/*.test.ts',
      '${seed}:kept',
    ]) {
      expect(pathIn(span), span).toBeNull()
    }
  })
})

describe('checkReferences', () => {
  it('passes a document whose paths and scripts all resolve', () => {
    const text = 'Read `docs/MCD.md`, then run `npm run verify` and `npm run content:check`.\nSee `src/engine/`.'

    expect(checkReferences('AGENTS.md', text, repo)).toEqual([])
  })

  it('names a missing path with its line', () => {
    const text = 'Fine.\nRead `docs/PLAN.md` first.'

    expect(checkReferences('AGENTS.md', text, repo)).toEqual([
      { file: 'AGENTS.md', line: 2, message: '`docs/PLAN.md` does not exist' },
    ])
  })

  it('resolves a bare module name and names one that is gone', () => {
    expect(checkReferences('x.md', 'See `ritual.ts` and `state/`.', repo)).toEqual([])
    expect(checkReferences('x.md', 'See `deleted.ts`.', repo)[0]?.message).toBe(
      '`deleted.ts` does not exist',
    )
  })

  it('names an npm script that package.json does not define', () => {
    const [problem] = checkReferences('AGENTS.md', 'Run `npm run lint`.', repo)

    expect(problem?.message).toBe('`npm run lint` is not a script in package.json')
  })
})

describe('checkBudget', () => {
  it('allows a document at its budget and fails one past it', () => {
    expect(checkBudget('memory.md', 'a\nb\nc\n', 3)).toEqual([])
    expect(checkBudget('memory.md', 'a\nb\nc\nd\n', 3)).toHaveLength(1)
  })
})
