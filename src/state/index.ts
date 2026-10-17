/**
 * The state layer's public surface (spec 0002).
 *
 * Phase 4 imports from here and nowhere deeper: the store, the stream helper,
 * the storage adapters, and the shapes the store keeps.
 */

export { dayRng } from '@/state/dayRng'
export {
  createJourneyStore,
  watchStorageEvents,
  type JourneyActions,
  type JourneySnapshot,
  type JourneyStore,
  type JourneyStoreOptions,
  type StorageEventTarget,
} from '@/state/journeyStore'
export { HISTORY_WINDOW_DAYS, pruneHistory } from '@/state/retention'
export { daysCompleted, JOURNEY_DAYS, isJourneyComplete } from '@/state/progress'
export {
  STORAGE_KEYS,
  STORE_VERSION,
  type Identity,
  type Progress,
  type StorageKey,
  type StoredDay,
  type StoredHistory,
} from '@/state/shapes'
export { createBrowserStorage, createMemoryStorage, type StorageAdapter } from '@/state/storage'
