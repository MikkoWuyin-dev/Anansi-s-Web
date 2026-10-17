/**
 * The four stored values and the validators that guard them (spec 0002).
 *
 * Every value carries `version: 1` and is validated on its own, so one bad
 * key costs one slice rather than the whole journey. Nothing here throws: a
 * value that fails its checks comes back as `null`, and the caller decides
 * whether to start again.
 */

import type { TopicRecord } from '@/engine/types'

/** The schema version this build writes and accepts. */
export const STORE_VERSION = 1

/** One key per store, under the MCD §5 namespace. */
export const STORAGE_KEYS = {
  identity: 'anansi:v1:identity',
  day: 'anansi:v1:today',
  history: 'anansi:v1:history',
  progress: 'anansi:v1:progress',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/** The generated identifier that seeds the engine, and nothing else. */
export interface Identity {
  readonly version: typeof STORE_VERSION
  readonly clientId: string
}

/** Today's state, in the shape the engine takes. */
export interface StoredDay {
  readonly version: typeof STORE_VERSION
  readonly dayKey: string
  readonly offeredTopicIds: string[]
  readonly acceptedTopicId: string | null
}

export interface StoredHistory {
  readonly version: typeof STORE_VERSION
  readonly records: TopicRecord[]
}

/** Journey progress, which outlives the pruned history. */
export interface Progress {
  readonly version: typeof STORE_VERSION
  readonly journeyStart: string
  readonly journeysCompleted: number
  readonly acceptedDayKeys: string[]
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/
const STATUSES: readonly TopicRecord['status'][] = ['explored', 'learned']

/** Every topic record the app may have written, or `null` when unusable. */
export function parseJson(raw: string | null): unknown {
  if (raw === null) {
    return null
  }

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isDayKey = (value: unknown): value is string =>
  typeof value === 'string' && DAY_KEY.test(value)

const isVersioned = (value: unknown): value is Record<string, unknown> =>
  isObject(value) && value.version === STORE_VERSION

export function validateIdentity(value: unknown): Identity | null {
  if (!isVersioned(value)) {
    return null
  }

  const { clientId } = value

  if (typeof clientId !== 'string' || clientId.length === 0) {
    return null
  }

  return { version: STORE_VERSION, clientId }
}

export function validateDay(value: unknown): StoredDay | null {
  if (!isVersioned(value)) {
    return null
  }

  const { dayKey, offeredTopicIds, acceptedTopicId } = value

  if (!isDayKey(dayKey) || !Array.isArray(offeredTopicIds)) {
    return null
  }

  const ids = offeredTopicIds.filter(
    (id): id is string => typeof id === 'string' && id.length > 0,
  )

  if (ids.length !== offeredTopicIds.length || new Set(ids).size !== ids.length) {
    return null
  }

  if (acceptedTopicId !== null && typeof acceptedTopicId !== 'string') {
    return null
  }

  return {
    version: STORE_VERSION,
    dayKey,
    offeredTopicIds: ids,
    acceptedTopicId: acceptedTopicId ?? null,
  }
}

export function validateHistory(value: unknown): TopicRecord[] | null {
  if (!isVersioned(value) || !Array.isArray(value.records)) {
    return null
  }

  const records: TopicRecord[] = []

  for (const entry of value.records) {
    if (!isObject(entry)) {
      return null
    }

    const { topicId, dayKey, presentedAt, accepted, status } = entry

    if (
      typeof topicId !== 'string' ||
      topicId.length === 0 ||
      !isDayKey(dayKey) ||
      typeof presentedAt !== 'number' ||
      !Number.isFinite(presentedAt) ||
      typeof accepted !== 'boolean' ||
      typeof status !== 'string' ||
      !STATUSES.includes(status as TopicRecord['status'])
    ) {
      return null
    }

    records.push({
      topicId,
      dayKey,
      presentedAt,
      accepted,
      status: status as TopicRecord['status'],
    })
  }

  return records
}

export function validateProgress(value: unknown): Progress | null {
  if (!isVersioned(value)) {
    return null
  }

  const { journeyStart, journeysCompleted, acceptedDayKeys } = value

  if (
    !isDayKey(journeyStart) ||
    typeof journeysCompleted !== 'number' ||
    !Number.isInteger(journeysCompleted) ||
    journeysCompleted < 0 ||
    !Array.isArray(acceptedDayKeys)
  ) {
    return null
  }

  const days = acceptedDayKeys.filter(isDayKey)

  if (days.length !== acceptedDayKeys.length) {
    return null
  }

  return {
    version: STORE_VERSION,
    journeyStart,
    journeysCompleted,
    acceptedDayKeys: [...new Set(days)].sort(),
  }
}

/** A fresh day for the given key: nothing offered, nothing accepted. */
export function freshDay(dayKey: string): StoredDay {
  return { version: STORE_VERSION, dayKey, offeredTopicIds: [], acceptedTopicId: null }
}

/** A fresh journey that starts today. */
export function freshProgress(dayKey: string): Progress {
  return {
    version: STORE_VERSION,
    journeyStart: dayKey,
    journeysCompleted: 0,
    acceptedDayKeys: [],
  }
}

/**
 * A client identifier, made once per browser. `crypto.randomUUID` is available
 * in every browser this app supports; the fallback covers old or stubbed
 * environments so a missing API never blocks the ritual.
 */
export function generateClientId(): string {
  const cryptoApi = globalThis.crypto

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
