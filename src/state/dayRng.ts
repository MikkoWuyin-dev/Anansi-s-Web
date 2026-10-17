/**
 * The per day stream the engine depends on (spec 0001's Follow-up, spec 0002).
 *
 * The engine is pure and takes its randomness injected. That leaves one
 * guarantee outside it: the caller must rebuild the same stream for the same
 * browser and day, or a reload could reshuffle the day. The rule lives here,
 * once, rather than in whatever calls the engine.
 */

import { createRng, type Rng } from '@/engine/rng'

/** A fresh stream for one local day, seeded from the client and the day key. */
export function dayRng(clientId: string, dayKey: string): Rng {
  return createRng(`${clientId}:${dayKey}`)
}
