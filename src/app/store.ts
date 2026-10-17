import { createJourneyStore } from '@/state'

/**
 * The one journey store the app reads (spec 0002, spec 0003).
 *
 * Created once at module load so every render, storage event, and midnight
 * check talks to the same state. Tests pass their own store to `App` instead.
 */
export const journeyStore = createJourneyStore()
