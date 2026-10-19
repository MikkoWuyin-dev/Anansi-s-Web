/**
 * How rich the stage should be at this point in the journey (spec 0005,
 * roadmap 6.7).
 *
 * One pure function maps days completed to the things that thicken the world:
 * the web's own counts come from `graphFor`, the objects per family and the
 * size of a beat's impulse come from here. Nothing reads the clock or the
 * store, so the early, middle and late arc can be tested without a renderer.
 */

import { densityWord, type Density } from '@/world/stage'

export interface Richness {
  /** The word the accessible description uses for the same count. */
  readonly stage: Density
  /** How many objects of each family the stage draws. */
  readonly perFamily: number
  /** 0.35 to 1: how far a beat's impulse moves a resting object. */
  readonly impulse: number
}

/** How many days it takes to earn another object of each family. */
export const OBJECT_DAYS = 30

/** The most objects per family the desktop stage draws. */
export const MAX_PER_FAMILY = 4

/** The phone tier draws fewer objects of each family (AC-15). */
export const MOBILE_PER_FAMILY = 2

function finiteDays(days: number): number {
  return Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0
}

/**
 * The stage thickens in four steps across a ninety day journey, while every
 * beat's impulse grows a little more slowly, so a late web is fuller but never
 * wilder. A phone keeps the first two steps only.
 */
export function richnessFor(days: number, mobile: boolean): Richness {
  const safe = finiteDays(days)
  const steps = 1 + Math.floor(safe / OBJECT_DAYS)
  const ceiling = mobile ? MOBILE_PER_FAMILY : MAX_PER_FAMILY

  return {
    stage: densityWord(safe),
    perFamily: Math.min(ceiling, steps),
    impulse: Math.min(1, 0.35 + safe / 120),
  }
}
