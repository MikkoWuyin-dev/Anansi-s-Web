/**
 * The seeded PRNG behind the engine's per day determinism (MCD D5, §5).
 *
 * The engine is seeded from a string such as `clientId:dayKey`, so a reload, a
 * re-visit or a device restart offers the same stories in the same order.
 *
 * Pure by contract: no DOM, no React, no storage (MCD §5).
 */

/** A source of floats in `[0, 1)`. */
export type Rng = () => number

/** FNV-1a, 32 bit: turns a seed string into an unsigned 32 bit integer. */
export function hashSeed(seed: string): number {
  let hash = 0x811c9dc5

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return hash >>> 0
}

/** mulberry32: small, fast, and deterministic for a given seed. */
export function createRng(seed: string): Rng {
  let state = hashSeed(seed)

  return () => {
    state = (state + 0x6d2b79f5) | 0

    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
