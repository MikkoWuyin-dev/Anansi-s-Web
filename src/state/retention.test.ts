import { describe, expect, it } from 'vitest'

import type { TopicRecord } from '@/engine/types'
import { dayNumber, daysBetween, HISTORY_WINDOW_DAYS, pruneHistory } from '@/state/retention'

const MS_PER_DAY = 86_400_000
const BASE = Date.UTC(2026, 0, 1)

const pad = (value: number): string => String(value).padStart(2, '0')

function dayAt(offset: number): string {
  const date = new Date(BASE + offset * MS_PER_DAY)

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

const record = (offset: number, topicId = `topic-${offset}`): TopicRecord => ({
  topicId,
  dayKey: dayAt(offset),
  presentedAt: BASE + offset * MS_PER_DAY,
  accepted: false,
  status: 'explored',
})

describe('day arithmetic', () => {
  it('counts days between local day keys', () => {
    expect(daysBetween('2026-10-01', '2026-10-17')).toBe(16)
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
    expect(dayNumber('2026-10-17')).toBeGreaterThan(dayNumber('2026-10-16'))
  })
})

describe('pruneHistory', () => {
  it('keeps exactly 30 days from a 45 day log', () => {
    const records = Array.from({ length: 45 }, (_, index) => record(-44 + index))
    const pruned = pruneHistory(records, dayAt(0))

    expect(pruned).toHaveLength(HISTORY_WINDOW_DAYS)
    expect(pruned[0]?.dayKey).toBe(dayAt(-29))
    expect(pruned[pruned.length - 1]?.dayKey).toBe(dayAt(0))
  })

  it('keeps day 29 and drops day 30', () => {
    const pruned = pruneHistory([record(-30), record(-29)], dayAt(0))

    expect(pruned.map((entry) => entry.dayKey)).toEqual([dayAt(-29)])
  })

  it('drops a record dated after today, which is damage', () => {
    expect(pruneHistory([record(1)], dayAt(0))).toEqual([])
  })

  it('returns the same array when nothing is removed, so a write can be skipped', () => {
    const records = [record(-1), record(0)]

    expect(pruneHistory(records, dayAt(0))).toBe(records)
  })

  it('does not mutate its input', () => {
    const records = [record(-40), record(0)]
    const before = JSON.stringify(records)

    pruneHistory(records, dayAt(0))

    expect(JSON.stringify(records)).toBe(before)
  })
})
