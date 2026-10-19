/**
 * The object families (spec 0005, AC-10; roadmap 6.4 and 6.7).
 *
 * Every object is a function of numbers: one seeded generator per family, each
 * instance built from the same primitive but differing in its proportions,
 * turn, tone and phase. There is no imported asset and no hand placed mesh, so
 * a family can be tuned by changing the constants below and the whole web
 * thickens as the journey grows.
 *
 * This module returns plain data: no three.js, no React, so the variety and
 * the anchoring are testable in the node environment.
 */

import { createRng } from '@/engine/rng'
import { richnessFor } from '@/world/density'
import type { WebGraph } from '@/world/graph'
import type { Palette } from '@/world/palette'

export const FAMILIES = ['clock', 'key', 'eye', 'book', 'planet'] as const

export type Family = (typeof FAMILIES)[number]

/** The one primitive each family is built from. */
export type Form = 'torus' | 'cylinder' | 'sphere' | 'box' | 'octahedron'

export const FAMILY_FORM: Record<Family, Form> = {
  clock: 'torus',
  key: 'cylinder',
  eye: 'sphere',
  book: 'box',
  planet: 'octahedron',
}

/**
 * The tones a family may borrow, quietest first: most objects are the grey of
 * the web itself, and the accents are rare. Yellow is kept for the reveal.
 */
export const FAMILY_COLOURS: Record<Family, readonly (keyof Palette)[]> = {
  clock: ['dim', 'lavender', 'ink'],
  key: ['dim', 'ink', 'strawberry'],
  eye: ['ink', 'lavender', 'strawberry'],
  book: ['dim', 'lavender', 'strawberry'],
  planet: ['lavender', 'dim', 'strawberry'],
}

/** How often a family takes its second tone, and then its third. */
const TONE_STEPS = [0.62, 0.86] as const

/** How big one family's primitive sits before its own variation is applied. */
const FAMILY_SCALE: Record<Family, number> = {
  clock: 0.1,
  key: 0.11,
  eye: 0.064,
  book: 0.088,
  planet: 0.082,
}

/** The idle motion a family carries, before reduced motion is applied. */
export interface IdleMotion {
  /** Where in its cycle the object starts, in radians. */
  readonly phase: number
  /** How far it may move, in world units, when a beat moves it. */
  readonly amplitude: number
  /** How quickly it answers, relative to the beat's own impulse. */
  readonly rate: number
  readonly axis: 'x' | 'y' | 'z'
}

export interface WorldObject {
  readonly family: Family
  /** The node the object hangs from (AC-7), so it never floats free. */
  readonly node: number
  readonly position: readonly [number, number, number]
  readonly rotation: readonly [number, number, number]
  readonly scale: readonly [number, number, number]
  readonly colour: keyof Palette
  readonly motion: IdleMotion
}

/** The number of objects the stage draws at this point in the journey. */
export function objectCount(days: number, mobile: boolean): number {
  return FAMILIES.length * richnessFor(days, mobile).perFamily
}

/**
 * One object of a family. Proportions and turn are the family's variation: a
 * key is always a stem, but no two stems are the same length or lean.
 */
function objectFor(
  graph: WebGraph,
  family: Family,
  familyIndex: number,
  instance: number,
  amplitude: number,
  rng: () => number,
): WorldObject {
  const anchor = graph.anchors[(familyIndex * 3 + instance * 5) % graph.anchors.length] ?? 0
  const node = graph.nodes[anchor]
  const [nx, ny, nz] = node?.position ?? [0, 0, 0]

  const size = FAMILY_SCALE[family] * (0.78 + rng() * 0.44)
  const stretch = 0.8 + rng() * 0.45
  const thin = family === 'book' ? 0.26 + rng() * 0.16 : 0.7 + rng() * 0.5

  return {
    family,
    node: anchor,
    position: [
      nx + (rng() - 0.5) * 0.12,
      ny + (rng() - 0.5) * 0.12,
      nz + 0.1 + rng() * 0.08,
    ],
    rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
    scale:
      family === 'book'
        ? [size * 1.4, size * thin, size * stretch]
        : family === 'key'
          ? [size * 0.28, size * (1.3 + rng() * 0.7), size * 0.28]
          : [size * stretch, size, size * thin],
    colour: toneFor(family, rng),
    motion: {
      phase: rng() * Math.PI * 2,
      amplitude,
      rate: 0.7 + rng() * 0.6,
      axis: (['x', 'y', 'z'] as const)[Math.floor(rng() * 3)] ?? 'y',
    },
  }
}

function toneFor(family: Family, rng: () => number): keyof Palette {
  const tones = FAMILY_COLOURS[family]
  const roll = rng()

  if (roll < TONE_STEPS[0]) {
    return tones[0] ?? 'dim'
  }

  if (roll < TONE_STEPS[1]) {
    return tones[1] ?? tones[0] ?? 'dim'
  }

  return tones[2] ?? tones[1] ?? tones[0] ?? 'dim'
}

/**
 * Draw every object the journey has earned. The same graph, count and reduced
 * motion setting produce the same objects, and every object hangs from a real
 * anchor node.
 */
export function objectsFor(
  graph: WebGraph,
  days: number,
  mobile: boolean,
  reducedMotion = false,
): WorldObject[] {
  const rng = createRng(`${graph.seed}:objects`)
  const { perFamily, impulse } = richnessFor(days, mobile)
  const objects: WorldObject[] = []

  FAMILIES.forEach((family, familyIndex) => {
    for (let instance = 0; instance < perFamily; instance += 1) {
      objects.push(
        objectFor(
          graph,
          family,
          familyIndex,
          instance,
          reducedMotion ? 0 : impulse,
          rng,
        ),
      )
    }
  })

  return objects
}

/** The objects of one family, in the order they were generated. */
export function byFamily(objects: readonly WorldObject[], family: Family): WorldObject[] {
  return objects.filter((object) => object.family === family)
}
