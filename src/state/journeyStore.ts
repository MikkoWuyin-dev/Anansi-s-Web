/**
 * The journey store (spec 0002).
 *
 * Four values, one key each, behind one store with named actions. Every read
 * is validated and every write is guarded, so a damaged key costs one slice
 * and a blocked storage costs persistence rather than the ritual.
 *
 * No React, no DOM and no clock of its own: the storage, the day, and the
 * clock are injected, which is what lets the whole layer run under the node
 * test environment.
 */

import { createStore, type StoreApi } from 'zustand/vanilla'

import { getDayKey } from '@/engine/dayKey'
import { ENGINE_TUNING } from '@/engine/tuning'
import type { TopicRecord } from '@/engine/types'
import { recordAcceptedDay, rollJourneyIfComplete } from '@/state/progress'
import { pruneHistory } from '@/state/retention'
import {
  freshDay,
  freshProgress,
  generateClientId,
  parseJson,
  STORAGE_KEYS,
  STORE_VERSION,
  validateDay,
  validateHistory,
  validateIdentity,
  validateProgress,
  type Identity,
  type Progress,
  type StorageKey,
  type StoredDay,
} from '@/state/shapes'
import { createBrowserStorage, type StorageAdapter } from '@/state/storage'

/** Everything the store exposes as state. */
export interface JourneySnapshot {
  identity: Identity
  day: StoredDay
  history: TopicRecord[]
  progress: Progress
  /** False once a read or a write has failed; the ritual then lives in memory. */
  persistent: boolean
}

/** Everything a caller may ask the store to do. */
export interface JourneyActions {
  /** Read today's day, rolling over first if the local day has changed. */
  ensureToday(): StoredDay
  /** Offer a story, recording it as explored; refuses a fourth or a repeat. */
  offer(topicId: string): StoredDay
  /** Accept an offered story, counting the day once in the journey tally. */
  accept(topicId: string): StoredDay
  /** Move the recorded status of a topic, from explored to learned or back. */
  setStatus(topicId: string, status: TopicRecord['status']): void
  /** Re-read one key, as when another tab writes it. */
  rehydrate(key: StorageKey): void
}

export type JourneyStore = StoreApi<JourneySnapshot & JourneyActions>

export interface JourneyStoreOptions {
  readonly storage?: StorageAdapter
  readonly today?: () => string
  readonly now?: () => number
}

const KEYS = Object.values(STORAGE_KEYS)

/**
 * Build the store. Storage, the day source, and the clock are injected so the
 * layer is testable without a browser; the defaults are the real ones.
 */
export function createJourneyStore(options: JourneyStoreOptions = {}): JourneyStore {
  const storage = options.storage ?? createBrowserStorage()
  const today = options.today ?? getDayKey
  const now = options.now ?? Date.now

  let persistent = true

  const readJson = (key: StorageKey): unknown => {
    try {
      return parseJson(storage.read(key))
    } catch {
      persistent = false
      return null
    }
  }

  const write = (key: StorageKey, value: unknown): void => {
    try {
      storage.write(key, JSON.stringify(value))
    } catch {
      persistent = false
    }
  }

  const readDay = (dayKey: string, key: StorageKey): StoredDay => {
    const stored = validateDay(readJson(key))

    return stored !== null && stored.dayKey === dayKey ? stored : freshDay(dayKey)
  }

  const readHistory = (dayKey: string): TopicRecord[] =>
    pruneHistory(validateHistory(readJson(STORAGE_KEYS.history)) ?? [], dayKey)

  const readProgress = (dayKey: string): Progress =>
    rollJourneyIfComplete(
      validateProgress(readJson(STORAGE_KEYS.progress)) ?? freshProgress(dayKey),
      dayKey,
    )

  const readIdentity = (): Identity =>
    validateIdentity(readJson(STORAGE_KEYS.identity)) ?? {
      version: STORE_VERSION,
      clientId: generateClientId(),
    }

  // Load, then write every key back, so a missing or repaired value is stored
  // and a blocked storage is reported before the first action.
  const dayKey = today()
  const initial: JourneySnapshot = {
    identity: readIdentity(),
    day: readDay(dayKey, STORAGE_KEYS.day),
    history: readHistory(dayKey),
    progress: readProgress(dayKey),
    persistent,
  }

  const save = (snapshot: JourneySnapshot): void => {
    write(STORAGE_KEYS.identity, snapshot.identity)
    write(STORAGE_KEYS.day, snapshot.day)
    write(STORAGE_KEYS.history, { version: STORE_VERSION, records: snapshot.history })
    write(STORAGE_KEYS.progress, snapshot.progress)
  }

  save(initial)

  return createStore<JourneySnapshot & JourneyActions>()((set, get) => ({
    ...initial,
    persistent,

    ensureToday() {
      const key = today()
      const state = get()
      const day = state.day.dayKey === key ? state.day : freshDay(key)
      const history = pruneHistory(state.history, key)
      const progress = rollJourneyIfComplete(state.progress, key)

      if (day !== state.day || history !== state.history || progress !== state.progress) {
        if (day !== state.day) {
          write(STORAGE_KEYS.day, day)
        }

        if (history !== state.history) {
          write(STORAGE_KEYS.history, { version: STORE_VERSION, records: history })
        }

        if (progress !== state.progress) {
          write(STORAGE_KEYS.progress, progress)
        }
      }

      if (
        day !== state.day ||
        history !== state.history ||
        progress !== state.progress ||
        state.persistent !== persistent
      ) {
        set({ day, history, progress, persistent })
      }

      return day
    },

    offer(topicId) {
      const day = get().ensureToday()

      if (
        day.offeredTopicIds.length >= ENGINE_TUNING.storiesPerDay ||
        day.offeredTopicIds.includes(topicId)
      ) {
        return day
      }

      const nextDay: StoredDay = {
        ...day,
        offeredTopicIds: [...day.offeredTopicIds, topicId],
      }
      const record: TopicRecord = {
        topicId,
        dayKey: nextDay.dayKey,
        presentedAt: now(),
        accepted: false,
        status: 'explored',
      }
      const history = pruneHistory([...get().history, record], nextDay.dayKey)

      write(STORAGE_KEYS.day, nextDay)
      write(STORAGE_KEYS.history, { version: STORE_VERSION, records: history })
      set({ day: nextDay, history, persistent })

      return nextDay
    },

    accept(topicId) {
      const day = get().ensureToday()

      if (!day.offeredTopicIds.includes(topicId) || day.acceptedTopicId === topicId) {
        return day
      }

      const state = get()
      const nextDay: StoredDay = { ...day, acceptedTopicId: topicId }
      // Only one story is accepted per day: a later choice clears the earlier
      // flag rather than leaving two accepted records behind (AC-13).
      const history = state.history.map((record) => {
        if (record.dayKey !== nextDay.dayKey) {
          return record
        }

        const accepted = record.topicId === topicId

        return record.accepted === accepted ? record : { ...record, accepted }
      })
      // The tally fills here; the journey rolls on the next access, so the
      // ninetieth day is still the day the person finished (spec 0002, AC-8).
      const progress = recordAcceptedDay(state.progress, nextDay.dayKey)

      write(STORAGE_KEYS.day, nextDay)
      write(STORAGE_KEYS.history, { version: STORE_VERSION, records: history })
      write(STORAGE_KEYS.progress, progress)
      set({ day: nextDay, history, progress, persistent })

      return nextDay
    },

    setStatus(topicId, status) {
      const state = get()
      const index = state.history.map((record) => record.topicId).lastIndexOf(topicId)

      if (index === -1) {
        return
      }

      const current = state.history[index] as TopicRecord

      if (current.status === status) {
        return
      }

      const history = state.history.map((record, position) =>
        position === index ? { ...record, status } : record,
      )

      write(STORAGE_KEYS.history, { version: STORE_VERSION, records: history })
      set({ history, persistent })
    },

    rehydrate(key) {
      const currentDayKey = today()

      if (key === STORAGE_KEYS.identity) {
        set({ identity: readIdentity(), persistent })
        return
      }

      if (key === STORAGE_KEYS.day) {
        set({ day: readDay(currentDayKey, key), persistent })
        return
      }

      if (key === STORAGE_KEYS.history) {
        set({ history: readHistory(currentDayKey), persistent })
        return
      }

      set({ progress: readProgress(currentDayKey), persistent })
    },
  }))
}

/** The shape a window-like object needs for cross tab sync, for testing. */
export interface StorageEventTarget {
  addEventListener(type: 'storage', listener: (event: StorageEvent) => void): void
  removeEventListener(type: 'storage', listener: (event: StorageEvent) => void): void
}

/**
 * Follow writes made by another tab. A `storage` event carries the key that
 * changed, never the value, so the store re-reads that key and validates it
 * as it would on load. Returns the unsubscribe function.
 */
export function watchStorageEvents(
  store: JourneyStore,
  target: StorageEventTarget | undefined = typeof window === 'undefined'
    ? undefined
    : (window as unknown as StorageEventTarget),
): () => void {
  if (target === undefined) {
    return () => undefined
  }

  const listener = (event: StorageEvent): void => {
    if (event.key === null) {
      for (const key of KEYS) {
        store.getState().rehydrate(key)
      }

      return
    }

    const known = KEYS.find((key) => key === event.key)

    if (known !== undefined) {
      store.getState().rehydrate(known)
    }
  }

  target.addEventListener('storage', listener)

  return () => target.removeEventListener('storage', listener)
}
