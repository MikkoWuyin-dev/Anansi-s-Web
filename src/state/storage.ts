/**
 * The storage seam (spec 0002).
 *
 * The store never touches `localStorage` directly. It writes through this
 * interface, so tests run in memory and a blocked or full browser degrades to
 * a session that still works.
 */

export interface StorageAdapter {
  read(key: string): string | null
  write(key: string, value: string): void
}

/** A storage that lives only for the session, used by tests and as a fallback. */
export function createMemoryStorage(
  initial: ReadonlyArray<readonly [string, string]> = [],
): StorageAdapter {
  const values = new Map<string, string>(initial.map(([key, value]) => [key, value]))

  return {
    read: (key) => values.get(key) ?? null,
    write: (key, value) => {
      values.set(key, value)
    },
  }
}

/**
 * The browser's `localStorage`, probed once. When storage is blocked, private,
 * or absent (the module is imported in a test or a worker), the adapter falls
 * back to memory and the store reports that nothing will persist.
 */
export function createBrowserStorage(): StorageAdapter {
  if (typeof window === 'undefined') {
    return createMemoryStorage()
  }

  const probe = 'anansi:probe'

  try {
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
  } catch {
    return createMemoryStorage()
  }

  return {
    read: (key) => window.localStorage.getItem(key),
    write: (key, value) => {
      window.localStorage.setItem(key, value)
    },
  }
}
