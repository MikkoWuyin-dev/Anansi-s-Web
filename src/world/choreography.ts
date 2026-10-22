/**
 * The search as an event (spec 0005, AC-12; roadmap 6.6).
 *
 * The ritual used to hold a 900 ms pause on nothing. Now the same window is a
 * piece of choreography: the web wakes, Anansi crosses to two strands, looks at
 * what he finds, and comes home. This module is the timing and the path as
 * plain data, so the whole search can be tested without a renderer.
 *
 * Nothing here loops. One pass of progress from 0 to 1 is one search.
 */

import type { WebGraph } from '@/world/graph'
import type { Beat } from '@/world/stage'

export type Point = readonly [number, number, number]

/** How long one search takes, from the first move to the return. */
export const SEARCH_MS = 1400

/** How long the web answers once a story is kept, before it settles. */
export const CELEBRATE_MS = 900

/** How high above the web Anansi walks, so he is never inside a strand. */
export const ANANSI_LIFT = 0.14

/** Where one keyframe sits on the timeline and which path point it holds. */
interface Keyframe {
  readonly at: number
  readonly point: number
}

/**
 * The holds are the character: Anansi pauses on a strand to look before he
 * moves on. The same table drives the legs, so the gait stops when he stops.
 */
export const KEYFRAMES: readonly Keyframe[] = [
  { at: 0, point: 0 },
  { at: 0.1, point: 0 },
  { at: 0.34, point: 1 },
  { at: 0.46, point: 1 },
  { at: 0.68, point: 2 },
  { at: 0.8, point: 2 },
  { at: 1, point: 3 },
]

export interface SearchPose {
  readonly position: Point
  /** Which way he faces, in radians around the web's normal. */
  readonly heading: number
  /** 0 at a hold, 1 mid stride; the legs are quiet when it is 0. */
  readonly stride: number
  /** The clamped progress that produced this pose. */
  readonly progress: number
}

/** The hub, lifted just in front of the web: where Anansi waits. */
export function restingPoint(graph: WebGraph): Point {
  const hub = graph.nodes[0]?.position ?? [0, 0, 0]

  return [hub[0], hub[1], hub[2] + ANANSI_LIFT]
}

function lifted(graph: WebGraph, index: number): Point {
  const node = graph.nodes[index]

  if (node === undefined) {
    return restingPoint(graph)
  }

  const [x, y, z] = node.position

  return [x, y, z + ANANSI_LIFT]
}

/**
 * The route: home, the first strand, a second strand further out, home. It is
 * derived from the graph's own anchors, so Anansi investigates the web the
 * visitor actually has rather than a decorative prop.
 */
export function searchPath(graph: WebGraph): readonly [Point, Point, Point, Point] {
  const first = graph.anchors[0] ?? 0
  const second = graph.anchors[Math.floor(graph.anchors.length / 2)] ?? first

  return [restingPoint(graph), lifted(graph, first), lifted(graph, second), restingPoint(graph)]
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

/** A cubic in and out: the search starts and stops with weight, never linearly. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function mix(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/**
 * Where Anansi is and what his legs are doing at one point in the search.
 * Under reduced motion he stays home and the search resolves in place, so the
 * information is identical while nothing travels (AC-14).
 */
export function searchPose(
  progress: number,
  path: readonly Point[],
  reducedMotion: boolean,
): SearchPose {
  const t = clamp01(progress)
  const home = path[0] ?? [0, 0, 0]

  if (reducedMotion || path.length < 2) {
    return { position: home, heading: 0, stride: 0, progress: t }
  }

  let from = KEYFRAMES[0]!
  let to = KEYFRAMES[KEYFRAMES.length - 1]!

  for (let index = 0; index < KEYFRAMES.length - 1; index += 1) {
    const left = KEYFRAMES[index]!
    const right = KEYFRAMES[index + 1]!

    if (t >= left.at && t <= right.at) {
      from = left
      to = right
      break
    }
  }

  const span = to.at - from.at
  const local = span <= 0 ? 1 : (t - from.at) / span
  const a = path[from.point] ?? home
  const b = path[to.point] ?? home
  const moved = from.point !== to.point
  const eased = moved ? easeInOut(local) : 0

  const heading = moved && b[0] - a[0] !== 0 ? Math.atan2(b[1] - a[1], b[0] - a[0]) : 0

  return {
    position: mix(a, b, eased),
    heading,
    // The gait breathes within one leg of the walk: it rises mid stride and
    // falls to a hold at either end, so nothing marches on the spot.
    stride: moved ? Math.sin(local * Math.PI) : 0,
    progress: t,
  }
}

/**
 * How awake the web is on a beat. It answers to the search and the reveal, and
 * is still at idle, so the page pays nothing for a stage nobody is using.
 */
export function webWake(beat: Beat): number {
  switch (beat) {
    case 'searching':
      return 1
    case 'revealing':
      return 0.6
    case 'celebrating':
      return 0.9
    case 'naming':
      // The strongest answer the web gives, and the only one nobody earned
      // (spec 0009, AC-3).
      return 0.95
    case 'idle':
    case 'resting':
      return 0
  }
}
