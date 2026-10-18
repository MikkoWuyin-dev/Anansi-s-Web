/**
 * The history drawer's controller (spec 0004).
 *
 * One pure function turns the journey store and the library into everything
 * the panel shows: rows with their titles resolved, day groups, filter counts,
 * and the quiet journey count. It keeps no cache and writes nothing, so the
 * panel cannot drift from the store or from another tab.
 *
 * The store records topic ids, not titles, and a story may leave the library,
 * so a record that cannot be titled is dropped here rather than rendered blank.
 */

import type { Topic } from '@/content/types'
import { daysCompleted, JOURNEY_DAYS, type JourneySnapshot, type Progress } from '@/state'

/** The three filters the PRD asks for. Explored means not yet learned. */
export const HISTORY_FILTERS = ['all', 'explored', 'learned'] as const

export type HistoryFilter = (typeof HISTORY_FILTERS)[number]

/** What the filters are called on screen. */
export const FILTER_LABELS: Record<HistoryFilter, string> = {
  all: 'All',
  explored: 'Explored',
  learned: 'Learned',
}

/** One story in the drawer. Only `title`, `day`, and `status` are rendered. */
export interface HistoryRow {
  readonly topicId: string
  readonly title: string
  /** The local day key it was shown on. */
  readonly day: string
  /** When it was shown, epoch milliseconds. Used for order only. */
  readonly shownAt: number
  readonly status: 'explored' | 'learned'
}

/** One day's rows, with the heading the panel shows for it. */
export interface HistoryDay {
  readonly day: string
  readonly label: string
  readonly rows: readonly HistoryRow[]
}

export interface HistoryCounts {
  readonly all: number
  readonly explored: number
  readonly learned: number
}

/**
 * The journey count as the product shows it. `label` is the visible model
 * (`37 / 90`); `spoken` is what a screen reader hears instead of a slash.
 */
export interface JourneyCount {
  readonly days: number
  readonly label: string
  readonly spoken: string
}

export type HistoryState = 'empty' | 'no-matches' | 'ready'

export interface HistoryView {
  /** `empty` for no titleable records, `no-matches` when narrowing hides them all. */
  readonly state: HistoryState
  readonly days: readonly HistoryDay[]
  readonly counts: HistoryCounts
  /** Null until the first day is taken, so the first screen never shows 0 / 90. */
  readonly count: JourneyCount | null
  /** Whether a query or a filter other than All is on. */
  readonly narrowed: boolean
}

export interface HistoryInput {
  readonly state: JourneySnapshot
  readonly library: readonly Topic[]
  readonly query: string
  readonly filter: HistoryFilter
  /** Today's local day key, from the store's validated `day.dayKey`. */
  readonly today: string
  /** A locale tag for the written date; the runtime locale when omitted. */
  readonly locale?: string
}

/** The journey count, or nothing before the first accepted day. */
export function journeyCount(progress: Progress): JourneyCount | null {
  const days = daysCompleted(progress)

  if (days === 0) {
    return null
  }

  return { days, label: `${days} / ${JOURNEY_DAYS}`, spoken: `${days} of ${JOURNEY_DAYS} days` }
}

/**
 * Fold a string for search: lowercase, with accents removed, so `Cobra`,
 * `cobra`, and `Cóbra` all match the same row (AC-5).
 */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

/** A day key as a local date, or null when the key is malformed. */
function parseDay(dayKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey)

  if (match === null) {
    return null
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** The day key before this one, in local calendar time. */
export function previousDay(dayKey: string): string | null {
  const date = parseDay(dayKey)

  if (date === null) {
    return null
  }

  date.setDate(date.getDate() - 1)

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

/** A written date from the browser locale, falling back to the day key. */
function writtenDay(dayKey: string, locale?: string): string {
  const date = parseDay(dayKey)

  if (date === null) {
    return dayKey
  }

  try {
    // `Intl` silently falls back for an unknown but well formed tag, so the
    // support check is what makes an unusable locale predictable.
    if (locale !== undefined && Intl.DateTimeFormat.supportedLocalesOf([locale]).length === 0) {
      return dayKey
    }

    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return dayKey
  }
}

/**
 * The heading for a day: Today for the current local day, Yesterday for the
 * day before, and a written date otherwise (AC-14). The day comes from the
 * record's own key, so no timezone conversion can move it.
 */
export function dayLabel(dayKey: string, todayKey: string, locale?: string): string {
  if (dayKey === todayKey) {
    return 'Today'
  }

  if (dayKey === previousDay(todayKey)) {
    return 'Yesterday'
  }

  return writtenDay(dayKey, locale)
}

/** Every stored record that still has a title, newest first. */
function visibleRows(state: JourneySnapshot, library: readonly Topic[]): HistoryRow[] {
  const byId = new Map(library.map((topic) => [topic.id, topic]))

  return state.history
    .flatMap((record): HistoryRow[] => {
      const topic = byId.get(record.topicId)

      if (topic === undefined) {
        return []
      }

      return [
        {
          topicId: record.topicId,
          title: topic.title,
          day: record.dayKey,
          shownAt: record.presentedAt,
          status: record.status,
        },
      ]
    })
    .sort((a, b) => b.shownAt - a.shownAt)
}

function matches(
  row: HistoryRow,
  needle: string,
  todayKey: string,
  locale?: string,
): boolean {
  if (needle === '') {
    return true
  }

  // The heading says Today or Yesterday for recent days, so the written date
  // is searched separately: a date query has to work for every day (AC-5).
  const haystack = fold(
    `${row.title} ${row.day} ${dayLabel(row.day, todayKey, locale)} ${writtenDay(row.day, locale)}`,
  )

  return haystack.includes(needle)
}

function groupByDay(
  rows: readonly HistoryRow[],
  todayKey: string,
  locale?: string,
): HistoryDay[] {
  const groups = new Map<string, HistoryRow[]>()

  for (const row of rows) {
    const existing = groups.get(row.day)

    if (existing === undefined) {
      groups.set(row.day, [row])
    } else {
      existing.push(row)
    }
  }

  return [...groups.entries()]
    .map(([day, dayRows]) => ({ day, label: dayLabel(day, todayKey, locale), rows: dayRows }))
    .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0))
}

/** Derive the whole drawer from the store and the two narrowing controls. */
export function historyView({ state, library, query, filter, today, locale }: HistoryInput): HistoryView {
  const visible = visibleRows(state, library)
  const needle = fold(query.trim())
  const matched = visible.filter((row) => matches(row, needle, today, locale))
  const learned = matched.filter((row) => row.status === 'learned').length
  const counts: HistoryCounts = {
    all: matched.length,
    explored: matched.length - learned,
    learned,
  }
  const chosen =
    filter === 'learned'
      ? matched.filter((row) => row.status === 'learned')
      : filter === 'explored'
        ? matched.filter((row) => row.status !== 'learned')
        : matched

  return {
    state: visible.length === 0 ? 'empty' : chosen.length === 0 ? 'no-matches' : 'ready',
    days: groupByDay(chosen, today, locale),
    counts,
    count: journeyCount(state.progress),
    narrowed: needle !== '' || filter !== 'all',
  }
}
