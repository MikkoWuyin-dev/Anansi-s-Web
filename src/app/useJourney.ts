import { useSyncExternalStore } from 'react'

import type { JourneyStore } from '@/state'

/**
 * Read the journey store from React without adding zustand's React binding
 * (spec 0003, Option 1). The store is the subscription; this hook is the
 * adapter, and it returns the store's whole state so actions travel with it.
 */
export function useJourney(store: JourneyStore) {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState(),
    () => store.getState(),
  )
}
