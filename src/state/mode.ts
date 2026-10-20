/**
 * The mode preference (spec 0007).
 *
 * A fifth key beside the journey's four, shaped and validated the same way.
 * It is not journey data: losing it costs the person their chosen theme, not a
 * day's story, so an unusable value falls back to `system` rather than being
 * repaired or thrown. Storage is touched only through the adapter, which keeps
 * this module inside the state layer's boundary.
 */

import { parseJson, STORE_VERSION } from '@/state/shapes'
import type { StorageAdapter } from '@/state/storage'

/** The key this build reads and writes. */
export const MODE_STORAGE_KEY = 'anansi:v1:mode'

export const MODE_CHOICES = ['system', 'light', 'dark'] as const

export type ModeChoice = (typeof MODE_CHOICES)[number]

export interface StoredMode {
  readonly version: typeof STORE_VERSION
  readonly choice: ModeChoice
}

export function isModeChoice(value: unknown): value is ModeChoice {
  return typeof value === 'string' && (MODE_CHOICES as readonly string[]).includes(value)
}

/** A stored choice that this build can honour, or `null`. */
export function validateMode(value: unknown): StoredMode | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const { version, choice } = value as Record<string, unknown>

  if (version !== STORE_VERSION || !isModeChoice(choice)) {
    return null
  }

  return { version: STORE_VERSION, choice }
}

/** The person's choice, or `system` when there is none or it is unusable. */
export function readChoice(storage: StorageAdapter): ModeChoice {
  return validateMode(parseJson(storage.read(MODE_STORAGE_KEY)))?.choice ?? 'system'
}

/**
 * Persist an explicit choice. A full or blocked storage is not a reason to
 * fail the ritual, so a refused write is swallowed and the session keeps the
 * mode it already shows.
 */
export function writeChoice(storage: StorageAdapter, choice: ModeChoice): void {
  try {
    storage.write(MODE_STORAGE_KEY, JSON.stringify({ version: STORE_VERSION, choice }))
  } catch {
    // The preference is a convenience, never a requirement.
  }
}
