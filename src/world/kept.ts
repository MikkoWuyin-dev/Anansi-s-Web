/**
 * The standing threads (spec 0008).
 *
 * Every day whose story was kept leaves one thread woven into the web, so the
 * shape of the page is a record rather than a readout. The input is the
 * journey's own tally, which is the only durable record of it: the history
 * prunes at thirty days, so a world drawn from history would quietly lose its
 * earliest threads.
 *
 * Pure, like the rest of the world: no clock, no store, no renderer. A thread
 * carries a day key and a position and nothing else, so the hidden selection
 * system cannot leak through the geometry.
 */

import { createRng } from '@/engine/rng'
import type { WebGraph } from '@/world/graph'

export interface KeptThread {
  /** The day this thread belongs to. */
  readonly dayKey: string
  /** The node it is woven from. */
  readonly from: readonly [number, number, number]
  /** Where it ends, outward from the hub. */
  readonly to: readonly [number, number, number]
  /** How far the midpoint droops, in strand terms. */
  readonly sag: number
  /** The end bead's radius. */
  readonly knot: number
}

/** One journey is ninety kept days, so the weave never outgrows its record. */
export const MAX_KEPT_DAYS = 90

/** The direction a node points away from the hub. */
function outward(x: number, y: number): readonly [number, number] {
  const length = Math.hypot(x, y)

  return length < 0.0001 ? [1, 0] : [x / length, y / length]
}

/**
 * One thread and one knot per kept day. The anchor and the extension come from
 * a stream seeded by the day itself, so a day's thread is fixed for a given web
 * and adding another day never rewrites it. When the web grows a spoke its
 * nodes move, and a thread moves with the node it is woven from.
 */
export function keptThreads(
  graph: WebGraph,
  dayKeys: readonly string[],
  mobile: boolean,
): readonly KeptThread[] {
  const nodes = graph.nodes

  if (nodes.length === 0) {
    return []
  }

  // The tally is already sorted and free of duplicates; both are cheap to
  // enforce again, so a malformed input cannot draw the same day twice.
  const days = [...new Set(dayKeys)].sort().slice(-MAX_KEPT_DAYS)
  const scale = mobile ? 0.7 : 1

  return days.map((dayKey) => {
    const rng = createRng(`${graph.seed}:kept:${dayKey}`)
    const index = 1 + Math.floor(rng() * Math.max(1, nodes.length - 1))
    const node = nodes[index] ?? nodes[0]!
    const [x, y, z] = node.position
    const [dx, dy] = outward(x, y)
    const length = (0.35 + rng() * 0.3) * scale
    const sag = 0.04 + rng() * 0.08
    const knot = 0.02 + rng() * 0.015

    return {
      dayKey,
      from: [x, y, z],
      to: [x + dx * length, y + dy * length, z + (rng() - 0.5) * 0.12],
      sag,
      knot,
    }
  })
}

/**
 * The opacity the reveal filament holds once the story is kept (spec 0008,
 * AC-4). The web answers at the moment of keeping and then settles onto the
 * day's own thread instead of going dark.
 */
export function filamentRest(keptToday: boolean): number {
  return keptToday ? 0.45 : 0
}
