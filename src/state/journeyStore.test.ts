import { describe, expect, it } from 'vitest'

import { dayRng } from '@/state/dayRng'
import { createJourneyStore, watchStorageEvents, type StorageEventTarget } from '@/state/journeyStore'
import { createMemoryStorage, type StorageAdapter } from '@/state/storage'
import { freshDay, freshProgress, STORAGE_KEYS, type Progress } from '@/state/shapes'

const MS_PER_DAY = 86_400_000
const BASE = Date.UTC(2026, 0, 1)

const pad = (value: number): string => String(value).padStart(2, '0')

function dayAt(offset: number): string {
  const date = new Date(BASE + offset * MS_PER_DAY)

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

const record = (topicId: string, offset: number, accepted = false) => ({
  topicId,
  dayKey: dayAt(offset),
  presentedAt: BASE + offset * MS_PER_DAY,
  accepted,
  status: 'explored' as const,
})

const stored = (value: unknown): string => JSON.stringify(value)

describe('the store round trip', () => {
  it('reports the same day, history and tally after a rebuild', () => {
    const storage = createMemoryStorage()
    const first = createJourneyStore({ storage, today: () => dayAt(0), now: () => 1 })

    first.getState().offer('a')
    first.getState().offer('b')
    first.getState().accept('b')

    const second = createJourneyStore({ storage, today: () => dayAt(0), now: () => 2 })

    expect(second.getState().day).toEqual(first.getState().day)
    expect(second.getState().history).toEqual(first.getState().history)
    expect(second.getState().progress).toEqual(first.getState().progress)
    expect(second.getState().identity.clientId).toBe(first.getState().identity.clientId)
  })

  it('starts a fresh day with nothing offered', () => {
    const store = createJourneyStore({ storage: createMemoryStorage(), today: () => dayAt(0) })

    expect(store.getState().day).toEqual(freshDay(dayAt(0)))
    expect(store.getState().history).toEqual([])
    expect(store.getState().persistent).toBe(true)
  })
})

describe('the day', () => {
  it('refuses a fourth offer and a repeat', () => {
    const store = createJourneyStore({ storage: createMemoryStorage(), today: () => dayAt(0) })

    store.getState().offer('a')
    store.getState().offer('b')
    store.getState().offer('c')
    const full = store.getState().offer('d')

    expect(full.offeredTopicIds).toHaveLength(3)
    expect(full.offeredTopicIds).toEqual(['a', 'b', 'c'])

    const repeat = store.getState().offer('a')

    expect(repeat.offeredTopicIds).toEqual(['a', 'b', 'c'])
    expect(store.getState().history).toHaveLength(3)
  })

  it('rolls over at midnight and keeps yesterday in history', () => {
    let current = dayAt(0)
    const store = createJourneyStore({ storage: createMemoryStorage(), today: () => current })

    store.getState().offer('a')
    store.getState().accept('a')

    current = dayAt(1)

    const day = store.getState().ensureToday()

    expect(day.dayKey).toBe(dayAt(1))
    expect(day.offeredTopicIds).toEqual([])
    expect(store.getState().history.map((entry) => entry.dayKey)).toEqual([dayAt(0)])
    expect(store.getState().progress.acceptedDayKeys).toEqual([dayAt(0)])
  })
})

describe('the accepted story', () => {
  it('accepts only a topic offered today', () => {
    const store = createJourneyStore({ storage: createMemoryStorage(), today: () => dayAt(0) })

    store.getState().offer('a')

    expect(store.getState().accept('missing').acceptedTopicId).toBeNull()
    expect(store.getState().accept('a').acceptedTopicId).toBe('a')
  })

  it('counts a day once however often it is accepted', () => {
    const store = createJourneyStore({ storage: createMemoryStorage(), today: () => dayAt(0) })

    store.getState().offer('a')
    store.getState().accept('a')
    store.getState().accept('a')

    expect(store.getState().progress.acceptedDayKeys).toEqual([dayAt(0)])
  })

  it('leaves one accepted record when a later offer is accepted instead', () => {
    const store = createJourneyStore({ storage: createMemoryStorage(), today: () => dayAt(0) })

    store.getState().offer('a')
    store.getState().accept('a')
    store.getState().offer('b')
    store.getState().accept('b')

    const accepted = store.getState().history.filter((entry) => entry.accepted)

    expect(accepted).toHaveLength(1)
    expect(accepted[0]?.topicId).toBe('b')
    expect(store.getState().progress.acceptedDayKeys).toEqual([dayAt(0)])
  })

  it('moves a topic from explored to learned', () => {
    const store = createJourneyStore({ storage: createMemoryStorage(), today: () => dayAt(0) })

    store.getState().offer('a')
    store.getState().setStatus('a', 'learned')
    expect(store.getState().history[0]?.status).toBe('learned')

    store.getState().setStatus('missing', 'learned')
    expect(store.getState().history).toHaveLength(1)
  })
})

describe('history retention', () => {
  it('loads a 45 day log as 30 days and keeps the tally', () => {
    const progress: Progress = {
      ...freshProgress(dayAt(0)),
      acceptedDayKeys: [dayAt(-40), dayAt(0)],
    }
    const storage = createMemoryStorage([
      [
        STORAGE_KEYS.history,
        stored({
          version: 1,
          records: Array.from({ length: 45 }, (_, index) => record(`t${index}`, -44 + index)),
        }),
      ],
      [STORAGE_KEYS.progress, stored(progress)],
    ])

    const store = createJourneyStore({ storage, today: () => dayAt(0) })

    expect(store.getState().history).toHaveLength(30)
    expect(store.getState().progress.acceptedDayKeys).toEqual([dayAt(-40), dayAt(0)])
  })
})

describe('a damaged store', () => {
  it('resets only the slice that failed', () => {
    const storage = createMemoryStorage([
      [STORAGE_KEYS.day, '{ not json'],
      [STORAGE_KEYS.history, stored({ version: 1, records: [record('a', 0, true)] })],
      [
        STORAGE_KEYS.progress,
        stored({ ...freshProgress(dayAt(-3)), acceptedDayKeys: [dayAt(-3)] }),
      ],
    ])

    const store = createJourneyStore({ storage, today: () => dayAt(0) })

    expect(store.getState().day).toEqual(freshDay(dayAt(0)))
    expect(store.getState().history).toHaveLength(1)
    expect(store.getState().progress.acceptedDayKeys).toEqual([dayAt(-3)])
  })

  it('treats another version as damage for that slice alone', () => {
    const storage = createMemoryStorage([
      [STORAGE_KEYS.day, stored({ ...freshDay(dayAt(0)), version: 2 })],
      [STORAGE_KEYS.history, stored({ version: 1, records: [record('a', 0)] })],
    ])

    const store = createJourneyStore({ storage, today: () => dayAt(0) })

    expect(store.getState().day.offeredTopicIds).toEqual([])
    expect(store.getState().history).toHaveLength(1)
  })

  it('discards a day written yesterday', () => {
    const storage = createMemoryStorage([
      [
        STORAGE_KEYS.day,
        stored({ version: 1, dayKey: dayAt(-1), offeredTopicIds: ['a'], acceptedTopicId: null }),
      ],
    ])

    const store = createJourneyStore({ storage, today: () => dayAt(0) })

    expect(store.getState().day).toEqual(freshDay(dayAt(0)))
  })
})

describe('storage that does not work', () => {
  const broken: StorageAdapter = {
    read() {
      throw new Error('blocked')
    },
    write() {
      throw new Error('blocked')
    },
  }

  it('runs in memory and says so', () => {
    const store = createJourneyStore({ storage: broken, today: () => dayAt(0) })

    expect(store.getState().persistent).toBe(false)

    store.getState().offer('a')
    store.getState().accept('a')

    expect(store.getState().day.offeredTopicIds).toEqual(['a'])
    expect(store.getState().progress.acceptedDayKeys).toEqual([dayAt(0)])
  })
})

describe('the journey', () => {
  it('rolls to the next journey when the tally is full', () => {
    const progress: Progress = {
      ...freshProgress(dayAt(-120)),
      acceptedDayKeys: Array.from({ length: 90 }, (_, index) => dayAt(-120 + index)),
    }
    const storage = createMemoryStorage([[STORAGE_KEYS.progress, stored(progress)]])

    const store = createJourneyStore({ storage, today: () => dayAt(0) })

    expect(store.getState().progress.journeysCompleted).toBe(1)
    expect(store.getState().progress.journeyStart).toBe(dayAt(0))
    expect(store.getState().progress.acceptedDayKeys).toEqual([])
  })

  it('does not roll on the acceptance that fills the tally', () => {
    const progress: Progress = {
      ...freshProgress(dayAt(-90)),
      acceptedDayKeys: Array.from({ length: 89 }, (_, index) => dayAt(-89 + index)),
    }
    const storage = createMemoryStorage([
      [STORAGE_KEYS.progress, stored(progress)],
      [
        STORAGE_KEYS.day,
        stored({ version: 1, dayKey: dayAt(0), offeredTopicIds: ['a'], acceptedTopicId: null }),
      ],
    ])

    const store = createJourneyStore({ storage, today: () => dayAt(0) })

    store.getState().accept('a')

    expect(store.getState().progress.acceptedDayKeys).toHaveLength(90)
    expect(store.getState().progress.journeysCompleted).toBe(0)

    store.getState().ensureToday()

    expect(store.getState().progress.journeysCompleted).toBe(1)
    expect(store.getState().progress.acceptedDayKeys).toEqual([])
  })
})

describe('the client identity', () => {
  it('persists and appears in no other stored value', () => {
    const storage = createMemoryStorage()
    const first = createJourneyStore({ storage, today: () => dayAt(0) })

    first.getState().offer('a')

    const clientId = first.getState().identity.clientId

    expect(createJourneyStore({ storage, today: () => dayAt(0) }).getState().identity.clientId).toBe(
      clientId,
    )

    for (const key of [STORAGE_KEYS.day, STORAGE_KEYS.history, STORAGE_KEYS.progress]) {
      expect(storage.read(key)).not.toContain(clientId)
    }
  })
})

describe('the day stream', () => {
  it('rebuilds the same sequence for a day and differs for another day or browser', () => {
    const take = (seed: string): number[] => {
      const rng = dayRng(seed, dayAt(0))

      return Array.from({ length: 5 }, () => rng())
    }

    expect(take('client-a')).toEqual(take('client-a'))
    expect(take('client-a')).not.toEqual(take('client-b'))

    const otherDay = (): number[] => {
      const rng = dayRng('client-a', dayAt(1))

      return Array.from({ length: 5 }, () => rng())
    }

    expect(take('client-a')).not.toEqual(otherDay())
  })
})

describe('another tab', () => {
  it('rehydrates the store whose key changed', () => {
    const storage = createMemoryStorage()
    const store = createJourneyStore({ storage, today: () => dayAt(0) })

    storage.write(
      STORAGE_KEYS.history,
      stored({ version: 1, records: [record('from-the-other-tab', 0)] }),
    )

    store.getState().rehydrate(STORAGE_KEYS.history)

    expect(store.getState().history.map((entry) => entry.topicId)).toEqual([
      'from-the-other-tab',
    ])
  })

  it('follows storage events and stops when unsubscribed', () => {
    const storage = createMemoryStorage()
    const store = createJourneyStore({ storage, today: () => dayAt(0) })
    const listeners: Array<(event: StorageEvent) => void> = []
    const target: StorageEventTarget = {
      addEventListener: (_type, listener) => {
        listeners.push(listener)
      },
      removeEventListener: (_type, listener) => {
        const index = listeners.indexOf(listener)

        if (index !== -1) {
          listeners.splice(index, 1)
        }
      },
    }

    const stop = watchStorageEvents(store, target)

    storage.write(
      STORAGE_KEYS.progress,
      stored({ ...freshProgress(dayAt(0)), acceptedDayKeys: [dayAt(0)] }),
    )

    for (const listener of listeners) {
      listener({ key: STORAGE_KEYS.progress } as StorageEvent)
    }

    expect(store.getState().progress.acceptedDayKeys).toEqual([dayAt(0)])

    stop()

    expect(listeners).toHaveLength(0)
  })
})
