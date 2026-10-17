import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * The engine boundary (MCD §3, §5; spec 0001 AC-1).
 *
 * This test reads the engine's own source instead of its behaviour: an import
 * that crosses into the app, the state layer or the world is exactly the kind
 * of mistake a behavioural test cannot see, and risk R6 records that nothing
 * enforced it.
 */

const directory = fileURLToPath(new URL('.', import.meta.url))

const sources = readdirSync(directory)
  .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
  .map((name) => ({ name, source: readFileSync(directory + name, 'utf8') }))

const imports = (source: string): string[] =>
  [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1] as string)

describe('the engine module boundary', () => {
  it('finds the engine sources', () => {
    expect(sources.map((entry) => entry.name)).toEqual(
      expect.arrayContaining(['dayKey.ts', 'offer.ts', 'rng.ts', 'tuning.ts', 'types.ts']),
    )
  })

  it('imports only from the engine and the content schema', () => {
    for (const { name, source } of sources) {
      for (const specifier of imports(source)) {
        expect({ name, specifier }).toEqual({
          name,
          specifier: expect.stringMatching(/^@\/(engine|content)\//),
        })
      }
    }
  })

  it('reads no clock, storage, DOM or network', () => {
    for (const { name, source } of sources) {
      // `dayKey.ts` is the one documented place a clock is read, and only
      // through its default argument; the engine never calls it.
      const body = name === 'dayKey.ts' ? source.replace('date: Date = new Date()', '') : source

      // Matched as code, not as prose: a comment may well say "window." while
      // ending a sentence about the spread window.
      const forbidden: [string, RegExp][] = [
        ['read the clock', /\bnew Date\(/],
        ['read the clock', /\bDate\.now\(/],
        ['read the clock', /\bperformance\.now\(/],
        ['use unseeded randomness', /\bMath\.random\(/],
        ['touch the DOM', /\bdocument\.[a-zA-Z]/],
        ['touch the DOM', /\bwindow\.[a-zA-Z]/],
        ['touch storage', /\blocalStorage\b/],
        ['touch storage', /\bsessionStorage\b/],
        ['reach the network', /\bfetch\(/],
        ['reach the network', /\bnavigator\.[a-zA-Z]/],
      ]

      for (const [reason, pattern] of forbidden) {
        expect({ name, reason, found: pattern.test(body) }).toEqual({
          name,
          reason,
          found: false,
        })
      }
    }
  })

  it('never calls the day key helper from the selection engine', () => {
    const offer = sources.find((entry) => entry.name === 'offer.ts')

    expect(offer).toBeDefined()
    expect(imports(offer?.source ?? '')).not.toContain('@/engine/dayKey')
    expect(offer?.source).not.toContain('getDayKey')
  })
})
