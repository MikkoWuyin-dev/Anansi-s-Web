import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * The state module boundary (spec 0002, AC-1).
 *
 * Reads the module's own source, because an import into the UI layer or a
 * direct `localStorage` call is exactly the mistake no behaviour test sees.
 * `storage.ts` is the single place the browser storage is touched, and the
 * store takes its day and clock injected rather than reading them itself.
 */

const directory = fileURLToPath(new URL('.', import.meta.url))

const sources = readdirSync(directory)
  .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
  .map((name) => ({ name, source: readFileSync(directory + name, 'utf8') }))

const imports = (source: string): string[] =>
  [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1] as string)

const ALLOWED = /^(@\/(state|engine|content)\/|zustand\/vanilla$)/

describe('the state module boundary', () => {
  it('finds the state sources', () => {
    expect(sources.map((entry) => entry.name)).toEqual(
      expect.arrayContaining([
        'dayRng.ts',
        'index.ts',
        'journeyStore.ts',
        'progress.ts',
        'retention.ts',
        'shapes.ts',
        'storage.ts',
      ]),
    )
  })

  it('imports only from the state layer, the engine, the content schema and zustand', () => {
    for (const { name, source } of sources) {
      for (const specifier of imports(source)) {
        expect({ name, specifier }).toEqual({
          name,
          specifier: expect.stringMatching(ALLOWED),
        })
      }
    }
  })

  it('touches browser storage in the adapter only', () => {
    for (const { name, source } of sources) {
      if (name === 'storage.ts') {
        continue
      }

      expect({ name, localStorage: /\blocalStorage\b/.test(source) }).toEqual({
        name,
        localStorage: false,
      })
      expect({ name, window: /\bwindow\.[a-zA-Z]/.test(source) }).toEqual({
        name,
        window: false,
      })
    }
  })

  it('reads no DOM and reaches no network anywhere', () => {
    for (const { name, source } of sources) {
      for (const [reason, pattern] of [
        ['touch the DOM', /\bdocument\.[a-zA-Z]/],
        ['reach the network', /\bfetch\(/],
        ['reach the network', /\bnavigator\.[a-zA-Z]/],
      ] as Array<[string, RegExp]>) {
        expect({ name, reason, found: pattern.test(source) }).toEqual({
          name,
          reason,
          found: false,
        })
      }
    }
  })

  it('takes its day and clock injected, with the real ones as defaults', () => {
    const store = sources.find((entry) => entry.name === 'journeyStore.ts')?.source ?? ''

    expect(store).toContain('options.today ?? getDayKey')
    expect(store).toContain('options.now ?? Date.now')
    expect(sources.some((entry) => entry.name === 'retention.ts')).toBe(true)
  })
})
