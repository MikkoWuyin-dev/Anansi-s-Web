/**
 * The day key (MCD D5): the user's own local calendar date as `YYYY-MM-DD`.
 *
 * Every daily rule keys off this. It reads the local calendar fields, never UTC,
 * so a day ends at local midnight in the user's own timezone.
 *
 * Pure by contract: no DOM, no React, no storage (MCD §5).
 */
export function getDayKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
