import { describe, expect, it } from 'vitest'

import { createRng, hashSeed } from '@/engine/rng'

const take = (seed: string, count: number): number[] => {
  const rng = createRng(seed)

  return Array.from({ length: count }, () => rng())
}

describe('hashSeed', () => {
  it('returns the FNV-1a offset basis for an empty seed', () => {
    expect(hashSeed('')).toBe(0x811c9dc5)
  })

  it('returns an unsigned 32 bit integer', () => {
    for (const seed of ['a', 'client:2026-10-16', 'the-cobra-effect']) {
      const hash = hashSeed(seed)

      expect(Number.isInteger(hash)).toBe(true)
      expect(hash).toBeGreaterThanOrEqual(0)
      expect(hash).toBeLessThanOrEqual(0xffffffff)
    }
  })

  it('separates seed strings that differ only in order', () => {
    expect(hashSeed('client:day')).not.toBe(hashSeed('day:client'))
  })
})

describe('createRng', () => {
  it('is deterministic for a given seed across separate instances', () => {
    // The same browser and the same day must produce the same sequence (MCD D5).
    expect(take('client:2026-10-16', 12)).toEqual(take('client:2026-10-16', 12))
  })

  it('offers different stories for different day keys', () => {
    expect(take('client:2026-10-16', 12)).not.toEqual(take('client:2026-10-17', 12))
  })

  it('offers different stories for different clients on the same day', () => {
    expect(take('alice:2026-10-16', 12)).not.toEqual(take('bob:2026-10-16', 12))
  })

  it('stays within [0, 1)', () => {
    for (const value of take('client:2026-10-16', 500)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('does not return a constant', () => {
    expect(new Set(take('client:2026-10-16', 50)).size).toBeGreaterThan(1)
  })

  it('is not the identity distribution: mean sits near one half', () => {
    const values = take('client:2026-10-16', 5000)
    const mean = values.reduce((total, value) => total + value, 0) / values.length

    expect(mean).toBeGreaterThan(0.45)
    expect(mean).toBeLessThan(0.55)
  })
})
