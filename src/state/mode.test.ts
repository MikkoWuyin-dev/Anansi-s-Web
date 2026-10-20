import { describe, expect, it } from 'vitest'

import {
  MODE_STORAGE_KEY,
  readChoice,
  validateMode,
  writeChoice,
} from '@/state/mode'
import { createMemoryStorage } from '@/state/storage'

describe('the stored mode', () => {
  it('accepts each known choice', () => {
    for (const choice of ['system', 'light', 'dark'] as const) {
      expect(validateMode({ version: 1, choice })).toEqual({ version: 1, choice })
    }
  })

  it('rejects an unknown choice, a wrong version, and a non object', () => {
    expect(validateMode({ version: 1, choice: 'sepia' })).toBeNull()
    expect(validateMode({ version: 2, choice: 'light' })).toBeNull()
    expect(validateMode('light')).toBeNull()
    expect(validateMode(null)).toBeNull()
  })
})

describe('reading and writing the preference', () => {
  it('follows the system when nothing is stored', () => {
    expect(readChoice(createMemoryStorage())).toBe('system')
  })

  it('round-trips a choice through the adapter', () => {
    const storage = createMemoryStorage()

    writeChoice(storage, 'light')

    expect(readChoice(storage)).toBe('light')
    expect(storage.read(MODE_STORAGE_KEY)).toBe('{"version":1,"choice":"light"}')
  })

  it('ignores a broken value rather than throwing', () => {
    const storage = createMemoryStorage([[MODE_STORAGE_KEY, '{ not json']])

    expect(readChoice(storage)).toBe('system')
  })

  it('keeps working when storage refuses the write', () => {
    const storage = {
      read: () => null,
      write: () => {
        throw new Error('quota')
      },
    }

    expect(() => writeChoice(storage, 'dark')).not.toThrow()
    expect(readChoice(storage)).toBe('system')
  })
})
