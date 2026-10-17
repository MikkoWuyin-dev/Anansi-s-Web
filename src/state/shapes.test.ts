import { describe, expect, it } from 'vitest'

import {
  freshDay,
  freshProgress,
  generateClientId,
  parseJson,
  STORE_VERSION,
  validateDay,
  validateHistory,
  validateIdentity,
  validateProgress,
} from '@/state/shapes'

const day = '2026-10-17'

const validRecord = {
  topicId: 'the-cobra-effect',
  dayKey: day,
  presentedAt: 1_760_000_000_000,
  accepted: false,
  status: 'explored',
}

describe('parseJson', () => {
  it('returns null for a missing or broken value', () => {
    expect(parseJson(null)).toBeNull()
    expect(parseJson('{ not json')).toBeNull()
  })

  it('parses a real value', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 })
  })
})

describe('validateIdentity', () => {
  it('accepts a versioned identifier', () => {
    expect(validateIdentity({ version: 1, clientId: 'abc' })).toEqual({
      version: 1,
      clientId: 'abc',
    })
  })

  it('rejects another version, a missing id, and a non object', () => {
    expect(validateIdentity({ version: 2, clientId: 'abc' })).toBeNull()
    expect(validateIdentity({ version: 1, clientId: '' })).toBeNull()
    expect(validateIdentity('abc')).toBeNull()
    expect(validateIdentity(null)).toBeNull()
  })
})

describe('validateDay', () => {
  it('accepts a fresh day', () => {
    expect(validateDay(freshDay(day))).toEqual(freshDay(day))
  })

  it('rejects duplicate offers', () => {
    expect(
      validateDay({
        version: 1,
        dayKey: day,
        offeredTopicIds: ['a', 'a'],
        acceptedTopicId: null,
      }),
    ).toBeNull()
  })

  it('rejects a wrong version and a malformed day key', () => {
    expect(
      validateDay({ version: 2, dayKey: day, offeredTopicIds: [], acceptedTopicId: null }),
    ).toBeNull()
    expect(
      validateDay({ version: 1, dayKey: '17/10/2026', offeredTopicIds: [], acceptedTopicId: null }),
    ).toBeNull()
  })
})

describe('validateHistory', () => {
  it('accepts the engine record shape', () => {
    expect(validateHistory({ version: 1, records: [validRecord] })).toEqual([validRecord])
  })

  it('rejects an unknown status, a broken record, and a wrong version', () => {
    expect(
      validateHistory({ version: 1, records: [{ ...validRecord, status: 'forgotten' }] }),
    ).toBeNull()
    expect(validateHistory({ version: 1, records: [{ topicId: 'x' }] })).toBeNull()
    expect(validateHistory({ version: 2, records: [] })).toBeNull()
  })
})

describe('validateProgress', () => {
  it('accepts a fresh journey', () => {
    expect(validateProgress(freshProgress(day))).toEqual(freshProgress(day))
  })

  it('sorts and dedupes the tally', () => {
    const progress = validateProgress({
      version: 1,
      journeyStart: '2026-10-01',
      journeysCompleted: 0,
      acceptedDayKeys: ['2026-10-03', '2026-10-02', '2026-10-03'],
    })

    expect(progress?.acceptedDayKeys).toEqual(['2026-10-02', '2026-10-03'])
  })

  it('rejects a negative count, a malformed day, and a wrong version', () => {
    expect(
      validateProgress({
        version: 1,
        journeyStart: day,
        journeysCompleted: -1,
        acceptedDayKeys: [],
      }),
    ).toBeNull()
    expect(
      validateProgress({
        version: 1,
        journeyStart: day,
        journeysCompleted: 0,
        acceptedDayKeys: ['yesterday'],
      }),
    ).toBeNull()
    expect(
      validateProgress({
        version: 2,
        journeyStart: day,
        journeysCompleted: 0,
        acceptedDayKeys: [],
      }),
    ).toBeNull()
  })
})

describe('generateClientId', () => {
  it('produces a non empty identifier that differs between browsers', () => {
    const first = generateClientId()
    const second = generateClientId()

    expect(first.length).toBeGreaterThan(0)
    expect(first).not.toBe(second)
  })

  it('writes the version this build accepts', () => {
    expect(STORE_VERSION).toBe(1)
  })
})
