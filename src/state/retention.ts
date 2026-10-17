/**
 * Retention for the history (PRD §22, roadmap 3.4).
 *
 * History is a rolling 30 day window. The comparison is made on local day
 * keys, so it depends on the supplied "today" rather than on a clock the
 * module reads itself.
 */

import type { TopicRecord } from '@/engine/types'

/** The window PRD §22 and roadmap 3.4 fix. */
export const HISTORY_WINDOW_DAYS = 30

const MS_PER_DAY = 86_400_000

/**
 * A day key as a day number. UTC midnight is only a measuring device here: the
 * keys already carry the user's local date, so no timezone is inferred.
 */
export function dayNumber(dayKey: string): number {
  const year = Number(dayKey.slice(0, 4))
  const month = Number(dayKey.slice(5, 7))
  const day = Number(dayKey.slice(8, 10))

  return Date.UTC(year, month - 1, day) / MS_PER_DAY
}

export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from)
}

/**
 * Keep the records inside the window: today and the 29 days before it. A
 * record dated in the future is treated as damage and dropped. The input array
 * is returned unchanged when nothing is removed, so callers can compare by
 * identity and skip a write.
 */
export function pruneHistory(
  records: readonly TopicRecord[],
  todayKey: string,
  windowDays: number = HISTORY_WINDOW_DAYS,
): TopicRecord[] {
  const kept = records.filter((record) => {
    const age = daysBetween(record.dayKey, todayKey)

    return age >= 0 && age < windowDays
  })

  return kept.length === records.length ? (records as TopicRecord[]) : kept
}
