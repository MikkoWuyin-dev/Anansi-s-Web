import { describe, expect, it } from 'vitest'

import {
  daysCompleted,
  isJourneyComplete,
  JOURNEY_DAYS,
  recordAcceptedDay,
  rollJourneyIfComplete,
} from '@/state/progress'
import { freshProgress } from '@/state/shapes'

const start = '2026-01-01'
const MS_PER_DAY = 86_400_000
const BASE = Date.UTC(2026, 0, 1)

const pad = (value: number): string => String(value).padStart(2, '0')

function dayAt(offset: number): string {
  const date = new Date(BASE + offset * MS_PER_DAY)

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** A journey with `count` accepted days already behind it. */
const withDays = (count: number) => ({
  ...freshProgress(start),
  acceptedDayKeys: Array.from({ length: count }, (_, index) => dayAt(index)).sort(),
})

describe('daysCompleted', () => {
  it('is the length of the tally', () => {
    expect(daysCompleted(freshProgress(start))).toBe(0)
    expect(daysCompleted(withDays(37))).toBe(37)
  })
})

describe('recordAcceptedDay', () => {
  it('adds a day once', () => {
    const once = recordAcceptedDay(freshProgress(start), '2026-01-02')
    const twice = recordAcceptedDay(once, '2026-01-02')

    expect(once.acceptedDayKeys).toEqual(['2026-01-02'])
    expect(twice).toBe(once)
  })

  it('keeps the tally in day order', () => {
    const first = recordAcceptedDay(freshProgress(start), '2026-01-03')
    const second = recordAcceptedDay(first, '2026-01-02')

    expect(second.acceptedDayKeys).toEqual(['2026-01-02', '2026-01-03'])
  })
})

describe('rollJourneyIfComplete', () => {
  it('does nothing before 90 days', () => {
    const progress = withDays(89)

    expect(isJourneyComplete(progress)).toBe(false)
    expect(rollJourneyIfComplete(progress, '2026-04-01')).toBe(progress)
  })

  it('rolls into the next journey at 90, keeping the completed count', () => {
    const rolled = rollJourneyIfComplete(withDays(90), '2026-04-01')

    expect(rolled.journeysCompleted).toBe(1)
    expect(rolled.journeyStart).toBe('2026-04-01')
    expect(rolled.acceptedDayKeys).toEqual([])
    expect(JOURNEY_DAYS).toBe(90)
  })

  it('does not roll twice', () => {
    const rolled = rollJourneyIfComplete(withDays(90), '2026-04-01')

    expect(rollJourneyIfComplete(rolled, '2026-04-02')).toBe(rolled)
  })
})
