/**
 * The web's geometry (MCD §4 rules 4 and 6, spec 0005).
 *
 * A pure generator: the same seed always draws the same web, and density is a
 * function of days completed. No DOM, no React, no three.js, so the whole
 * shape can be tested in the node environment without a renderer.
 *
 * The shape is a radial web with irregular spokes and rings, not a literal
 * spider web: the PRD asks for something asymmetrical and surreal, so every
 * angle, radius, sag and depth is nudged by the seeded stream.
 */

import { createRng } from '@/engine/rng'

/** One bead where strands meet. */
export interface WorldNode {
  /** Stable within one graph: `hub` or `node-<spoke>-<ring>`. */
  readonly id: string
  readonly position: readonly [number, number, number]
  /** Bead size in world units. */
  readonly radius: number
  /** -1 is far from the camera, 1 is near. */
  readonly depth: number
}

/** One strand between two nodes. */
export interface WorldStrand {
  readonly from: number
  readonly to: number
  /** How far the midpoint droops, 0 to 1 in strand terms. */
  readonly sag: number
}

export interface WebGraph {
  readonly seed: string
  readonly nodes: readonly WorldNode[]
  readonly strands: readonly WorldStrand[]
  /** Node indices objects may anchor to (spec 0005, AC-7). */
  readonly anchors: readonly number[]
}

export interface GraphInput {
  /** `${clientId}:${journeyStart}`, so a returning visitor's web is theirs. */
  readonly seed: string
  /** Days completed in the current journey. */
  readonly days: number
  /** The phone tier draws a thinner web (AC-15). */
  readonly mobile: boolean
}

/** The ceiling the scene budget assumes (spec 0005). */
export const MAX_NODES = 120
export const MAX_STRANDS = 240

const DESKTOP_SPOKES = { base: 5, per: 18, min: 5, max: 10 }
const DESKTOP_RINGS = { base: 2, per: 12, min: 2, max: 7 }

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function count(base: number, days: number, per: number, max: number): number {
  const safe = Number.isFinite(days) ? Math.max(days, 0) : 0

  return clamp(base + Math.floor(safe / per), 0, max)
}

export function spokeCount(days: number, mobile: boolean): number {
  const desktop = count(DESKTOP_SPOKES.base, days, DESKTOP_SPOKES.per, DESKTOP_SPOKES.max)

  return mobile ? Math.max(4, desktop - 2) : desktop
}

export function ringCount(days: number, mobile: boolean): number {
  const desktop = count(DESKTOP_RINGS.base, days, DESKTOP_RINGS.per, DESKTOP_RINGS.max)

  return mobile ? Math.max(2, desktop - 2) : desktop
}

/**
 * How much the web should hold at this point in the journey. Strands are the
 * hub spokes, the radial runs, and the ring edges, which is twice spokes times
 * rings.
 */
export function densityFor(days: number, mobile: boolean): { nodes: number; strands: number } {
  const spokes = spokeCount(days, mobile)
  const rings = ringCount(days, mobile)

  return { nodes: 1 + spokes * rings, strands: 2 * spokes * rings }
}

/** Node index for one crossing of spoke and ring. Spoke major, ring minor. */
function indexOf(spoke: number, ring: number, rings: number): number {
  return 1 + spoke * rings + (ring - 1)
}

/**
 * Draw the web. Every random draw happens in a fixed order, so calling this
 * twice with one input returns the same graph, strand for strand.
 */
export function graphFor({ seed, days, mobile }: GraphInput): WebGraph {
  const rng = createRng(`${seed}:web`)
  const spokes = spokeCount(days, mobile)
  const rings = ringCount(days, mobile)

  const nodes: WorldNode[] = [{ id: 'hub', position: [0, 0, 0], radius: 0.07, depth: 1 }]
  const strands: WorldStrand[] = []

  const angles: number[] = []

  for (let spoke = 0; spoke < spokes; spoke += 1) {
    angles.push((spoke / spokes) * Math.PI * 2 + (rng() - 0.5) * 0.24)
  }

  for (let spoke = 0; spoke < spokes; spoke += 1) {
    const angle = angles[spoke]!

    // Each spoke grows its own step, so the rings are uneven rather than
    // concentric circles.
    const step = (2.6 / rings) * (0.86 + rng() * 0.3)
    let radius = 0.75 + rng() * 0.2

    for (let ring = 1; ring <= rings; ring += 1) {
      radius += step * (0.86 + rng() * 0.28)

      const drift = (rng() - 0.5) * 0.18
      const z = (rng() - 0.5) * 1.1
      const depth = clamp(z / 0.55, -1, 1)
      const here = angle + drift

      nodes.push({
        id: `node-${spoke}-${ring}`,
        position: [Math.cos(here) * radius * 1.25, Math.sin(here) * radius * 0.72, z * 0.5],
        radius: 0.026 + rng() * 0.03 + (depth + 1) * 0.008,
        depth,
      })
    }
  }

  for (let spoke = 0; spoke < spokes; spoke += 1) {
    strands.push({ from: 0, to: indexOf(spoke, 1, rings), sag: 0.05 + rng() * 0.08 })

    for (let ring = 1; ring < rings; ring += 1) {
      strands.push({
        from: indexOf(spoke, ring, rings),
        to: indexOf(spoke, ring + 1, rings),
        sag: 0.04 + rng() * 0.08,
      })
    }
  }

  for (let ring = 1; ring <= rings; ring += 1) {
    for (let spoke = 0; spoke < spokes; spoke += 1) {
      strands.push({
        from: indexOf(spoke, ring, rings),
        to: indexOf((spoke + 1) % spokes, ring, rings),
        sag: 0.14 + rng() * 0.34,
      })
    }
  }

  const anchors: number[] = []

  for (let spoke = 0; spoke < spokes; spoke += 1) {
    for (let ring = 2; ring <= rings; ring += 1) {
      if ((spoke + ring) % 2 === 0) {
        anchors.push(indexOf(spoke, ring, rings))
      }
    }
  }

  if (anchors.length === 0) {
    for (let spoke = 0; spoke < spokes; spoke += 1) {
      anchors.push(indexOf(spoke, rings, rings))
    }
  }

  return { seed, nodes, strands, anchors }
}
