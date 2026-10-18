import { describe, expect, it } from 'vitest'

import {
  dayLabel,
  historyView,
  journeyCount,
  previousDay,
  type HistoryFilter,
} from '@/app/history'
import type { Topic } from '@/content/types'
import { createJourneyStore, createMemoryStorage, type JourneyStore } from '@/state'

const DAY_ONE = '2026-10-17'
const DAY_TWO = '2026-10-18'
const LOCALE = 'en-GB'

function makeTopic(id: string, title: string): Topic {
  return {
    id,
    title,
    domain: 'science',
    difficulty: 2,
    tags: ['fascinating'],
    resurfacing: true,
    added: '2026-01-01',
  }
}

const LIBRARY = [
  makeTopic('cobra', 'The Cobra Effect'),
  makeTopic('quiet', 'The Quiet Hour'),
  makeTopic('forest', 'The Wood Wide Web'),
]

function makeStore(): { store: JourneyStore; setToday: (day: string) => void } {
  let today = DAY_ONE
  let clock = 1_000

  const store = createJourneyStore({
    storage: createMemoryStorage(),
    today: () => today,
    now: () => (clock += 1_000),
  })

  return { store, setToday: (day) => (today = day) }
}

/**
 * Two days of real store history: a learned story and a reroll on day one,
 * and one story on day two.
 */
function seeded() {
  const { store, setToday } = makeStore()

  store.getState().offer('cobra')
  store.getState().accept('cobra')
  store.getState().setStatus('cobra', 'learned')
  store.getState().offer('quiet')

  setToday(DAY_TWO)
  store.getState().offer('forest')

  return store
}

function viewOf(
  store: JourneyStore,
  overrides: {
    library?: readonly Topic[]
    query?: string
    filter?: HistoryFilter
    today?: string
  } = {},
) {
  return historyView({
    state: store.getState(),
    library: overrides.library ?? LIBRARY,
    query: overrides.query ?? '',
    filter: overrides.filter ?? 'all',
    today: overrides.today ?? DAY_TWO,
    locale: LOCALE,
  })
}

describe('dayLabel', () => {
  it('names today, yesterday, and a written date', () => {
    expect(dayLabel(DAY_TWO, DAY_TWO, LOCALE)).toBe('Today')
    expect(dayLabel(DAY_ONE, DAY_TWO, LOCALE)).toBe('Yesterday')
    expect(dayLabel('2026-10-12', DAY_TWO, LOCALE)).toBe('12 October 2026')
  })

  it('walks back across a month and a leap day', () => {
    expect(previousDay('2026-11-01')).toBe('2026-10-31')
    expect(previousDay('2028-03-01')).toBe('2028-02-29')
    expect(previousDay('2026-01-01')).toBe('2025-12-31')
  })

  it('falls back to the key when the locale is unusable', () => {
    expect(dayLabel('2026-10-12', DAY_TWO, 'not a locale!')).toBe('2026-10-12')
  })
})

describe('historyView rows', () => {
  it('groups resolved titles by day, newest day and newest row first', () => {
    const view = viewOf(seeded())

    expect(view.state).toBe('ready')
    expect(view.days.map((day) => day.label)).toEqual(['Today', 'Yesterday'])
    expect(view.days.map((day) => day.day)).toEqual([DAY_TWO, DAY_ONE])
    expect(view.days[0]?.rows.map((row) => row.title)).toEqual(['The Wood Wide Web'])
    expect(view.days[1]?.rows.map((row) => row.title)).toEqual([
      'The Quiet Hour',
      'The Cobra Effect',
    ])
  })

  it('drops a record whose topic has left the library', () => {
    const view = viewOf(seeded(), { library: [LIBRARY[0]!, LIBRARY[2]!] })

    expect(view.counts.all).toBe(2)
    expect(view.days.flatMap((day) => day.rows.map((row) => row.topicId))).toEqual([
      'forest',
      'cobra',
    ])
  })

  it('counts every matching row with learned as a subset of explored', () => {
    const view = viewOf(seeded())

    expect(view.counts).toEqual({ all: 3, explored: 2, learned: 1 })
  })
})

describe('historyView filters', () => {
  it('partitions the log so each filter is distinct', () => {
    const store = seeded()
    const all = viewOf(store)
    const explored = viewOf(store, { filter: 'explored' })
    const learned = viewOf(store, { filter: 'learned' })

    expect(all.days.flatMap((day) => day.rows).map((row) => row.topicId)).toEqual([
      'forest',
      'quiet',
      'cobra',
    ])
    expect(explored.days.flatMap((day) => day.rows).map((row) => row.topicId)).toEqual([
      'forest',
      'quiet',
    ])
    expect(learned.days.flatMap((day) => day.rows).map((row) => row.topicId)).toEqual(['cobra'])
    expect(learned.counts).toEqual(all.counts)
    expect(explored.narrowed).toBe(true)
    expect(all.narrowed).toBe(false)
  })
})

describe('historyView search', () => {
  it('ignores case and accents in a title', () => {
    const store = seeded()

    expect(viewOf(store, { query: 'cobra' }).counts.all).toBe(1)
    expect(viewOf(store, { query: 'CÓBRA' }).counts.all).toBe(1)
    expect(viewOf(store, { query: '  Cobra  ' }).counts.all).toBe(1)
  })

  it('finds a day by its ISO form and its written form', () => {
    const store = seeded()

    expect(viewOf(store, { query: DAY_ONE }).counts.all).toBe(2)
    expect(viewOf(store, { query: '17 October 2026' }).counts.all).toBe(2)
    expect(viewOf(store, { query: 'yesterday' }).counts.all).toBe(2)
  })

  it('combines a query with a filter', () => {
    const store = seeded()
    const view = viewOf(store, { query: 'the', filter: 'learned' })

    expect(view.days.flatMap((day) => day.rows).map((row) => row.topicId)).toEqual(['cobra'])
    expect(view.counts.all).toBe(3)
  })

  it('reports no matches without losing the counts', () => {
    const view = viewOf(seeded(), { query: 'nothing like this' })

    expect(view.state).toBe('no-matches')
    expect(view.days).toEqual([])
    expect(view.counts).toEqual({ all: 0, explored: 0, learned: 0 })
    expect(view.narrowed).toBe(true)
  })

  it('reports the empty history differently from a narrow miss', () => {
    const { store } = makeStore()
    const view = viewOf(store)

    expect(view.state).toBe('empty')
    expect(view.days).toEqual([])
    expect(view.count).toBeNull()
    expect(view.narrowed).toBe(false)
  })
})

describe('journeyCount', () => {
  it('is absent before the first taken day', () => {
    const { store } = makeStore()

    expect(journeyCount(store.getState().progress)).toBeNull()
  })

  it('reads the accepted days as N / 90', () => {
    const store = seeded()
    const view = viewOf(store)

    expect(view.count).toEqual({ days: 1, label: '1 / 90', spoken: '1 of 90 days' })
    expect(journeyCount(store.getState().progress)?.label).toBe('1 / 90')
  })
})
