/**
 * The journey count (PRD §19, roadmap 3.5, spec 0002).
 *
 * Days completed is the number of distinct days with an accepted topic in the
 * current journey. The tally is kept beside the history because history prunes
 * at 30 days and a 90 day count cannot be derived from it once the earliest
 * days are gone.
 */

import type { Progress } from '@/state/shapes'
import { STORE_VERSION } from '@/state/shapes'

/** One journey is 90 accepted days (PRD §19). */
export const JOURNEY_DAYS = 90

/** How many days of the current journey are done. */
export function daysCompleted(progress: Progress): number {
  return progress.acceptedDayKeys.length
}

/** Whether the current journey has reached its length. */
export function isJourneyComplete(progress: Progress): boolean {
  return daysCompleted(progress) >= JOURNEY_DAYS
}

/**
 * Record an accepted day once. A second acceptance on the same day is a no-op,
 * so a double click or a replayed action cannot inflate the count.
 */
export function recordAcceptedDay(progress: Progress, dayKey: string): Progress {
  if (progress.acceptedDayKeys.includes(dayKey)) {
    return progress
  }

  return {
    ...progress,
    acceptedDayKeys: [...progress.acceptedDayKeys, dayKey].sort(),
  }
}

/**
 * Roll into the next journey when the tally is full, gracefully and with no
 * failure state (MCD §5). History is untouched; only the journey's own record
 * moves on. Called on access, so a tab that was closed at day 90 rolls the
 * next time it is opened.
 */
export function rollJourneyIfComplete(progress: Progress, dayKey: string): Progress {
  if (!isJourneyComplete(progress)) {
    return progress
  }

  return {
    version: STORE_VERSION,
    journeyStart: dayKey,
    journeysCompleted: progress.journeysCompleted + 1,
    acceptedDayKeys: [],
  }
}
