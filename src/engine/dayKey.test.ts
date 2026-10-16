import { describe, expect, it } from 'vitest'

import { getDayKey } from '@/engine/dayKey'

describe('getDayKey', () => {
  it('formats a local calendar date as YYYY-MM-DD', () => {
    expect(getDayKey(new Date(2026, 9, 16))).toBe('2026-10-16')
  })

  it('zero pads single digit months and days', () => {
    expect(getDayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('reads local calendar fields rather than UTC', () => {
    // Late in the local day, in any timezone: the local day still wins.
    expect(getDayKey(new Date(2026, 9, 16, 23, 30))).toBe('2026-10-16')
    expect(getDayKey(new Date(2026, 9, 16, 0, 30))).toBe('2026-10-16')
  })

  it('gives two moments on the same local day the same key', () => {
    const morning = new Date(2026, 9, 16, 8, 0)
    const night = new Date(2026, 9, 16, 22, 45)

    expect(getDayKey(morning)).toBe(getDayKey(night))
  })

  it('rolls the key at local midnight', () => {
    const beforeMidnight = new Date(2026, 9, 16, 23, 59, 59)
    const afterMidnight = new Date(2026, 9, 17, 0, 0, 1)

    expect(getDayKey(beforeMidnight)).toBe('2026-10-16')
    expect(getDayKey(afterMidnight)).toBe('2026-10-17')
  })
})
