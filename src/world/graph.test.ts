import { describe, expect, it } from 'vitest'

import {
  densityFor,
  graphFor,
  MAX_NODES,
  MAX_STRANDS,
  ringCount,
  spokeCount,
  type WebGraph,
  type WorldNode,
} from '@/world/graph'

const SEED = 'client-one:2026-10-18'

function graph(days = 0, mobile = false, seed = SEED): WebGraph {
  return graphFor({ seed, days, mobile })
}

/** Every node reachable from the hub over the strands. */
function reachable(graph: WebGraph): Set<number> {
  const links = new Map<number, number[]>()

  for (const strand of graph.strands) {
    links.set(strand.from, [...(links.get(strand.from) ?? []), strand.to])
    links.set(strand.to, [...(links.get(strand.to) ?? []), strand.from])
  }

  const seen = new Set<number>([0])
  const queue = [0]

  while (queue.length > 0) {
    const index = queue.shift()!

    for (const next of links.get(index) ?? []) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }

  return seen
}

function position(node: WorldNode): readonly [number, number, number] {
  return node.position
}

function geometry(graph: WebGraph): unknown {
  return { nodes: graph.nodes, strands: graph.strands, anchors: graph.anchors }
}

describe('determinism', () => {
  it('draws the same web for the same seed', () => {
    expect(geometry(graph(45))).toEqual(geometry(graph(45)))
  })

  it('draws a different web for a different journey', () => {
    const first = graph(45, false, 'client-one:2026-10-18')
    const second = graph(45, false, 'client-two:2026-10-18')
    const laterStart = graph(45, false, 'client-one:2026-11-01')

    // The returned `seed` label always differs; the drawn web has to as well.
    expect(geometry(first)).not.toEqual(geometry(second))
    expect(geometry(first)).not.toEqual(geometry(laterStart))
  })

  it('changes shape when the journey grows', () => {
    expect(graph(10).nodes).not.toEqual(graph(40).nodes)
  })
})

describe('density', () => {
  it('grows from the early stage to the late stage and never falls', () => {
    let nodes = 0
    let strands = 0

    for (const days of [0, 10, 30, 45, 60, 75, 90]) {
      const current = graph(days)

      expect(current.nodes.length).toBeGreaterThanOrEqual(nodes)
      expect(current.strands.length).toBeGreaterThanOrEqual(strands)

      nodes = current.nodes.length
      strands = current.strands.length
    }

    expect(graph(0).nodes.length).toBeLessThan(graph(90).nodes.length)
    expect(graph(0).strands.length).toBeLessThan(graph(90).strands.length)
  })

  it('stays inside the scene ceiling at ninety days', () => {
    for (const days of [0, 45, 90, 400]) {
      const current = graph(days)

      expect(current.nodes.length).toBeLessThanOrEqual(MAX_NODES)
      expect(current.strands.length).toBeLessThanOrEqual(MAX_STRANDS)
    }
  })

  it('reports the counts it draws', () => {
    for (const days of [0, 45, 90]) {
      const current = graph(days)

      expect(densityFor(days, false)).toEqual({
        nodes: current.nodes.length,
        strands: current.strands.length,
      })
    }
  })

  it('keeps the phone tier thinner than the desktop tier', () => {
    for (const days of [0, 45, 90]) {
      expect(spokeCount(days, true)).toBeLessThanOrEqual(spokeCount(days, false))
      expect(ringCount(days, true)).toBeLessThanOrEqual(ringCount(days, false))
      expect(graph(days, true).nodes.length).toBeLessThanOrEqual(graph(days, false).nodes.length)
      expect(graph(days, true).strands.length).toBeLessThanOrEqual(
        graph(days, false).strands.length,
      )
    }
  })

  it('treats a damaged count as an early journey', () => {
    expect(graph(-20)).toEqual(graph(0))
  })
})

describe('the shape', () => {
  it('connects every bead to the hub', () => {
    for (const days of [0, 30, 90]) {
      const current = graph(days)

      expect(reachable(current).size).toBe(current.nodes.length)
    }
  })

  it('indexes every strand into the node list', () => {
    const current = graph(90)

    for (const strand of current.strands) {
      expect(strand.from).toBeGreaterThanOrEqual(0)
      expect(strand.to).toBeGreaterThanOrEqual(0)
      expect(strand.from).toBeLessThan(current.nodes.length)
      expect(strand.to).toBeLessThan(current.nodes.length)
      expect(strand.from).not.toBe(strand.to)
      expect(strand.sag).toBeGreaterThan(0)
      expect(strand.sag).toBeLessThan(1)
    }
  })

  it('gives every bead a unique id and a finite place behind the text', () => {
    const current = graph(90)
    const ids = new Set(current.nodes.map((node) => node.id))

    expect(ids.size).toBe(current.nodes.length)
    expect(current.nodes[0]?.id).toBe('hub')

    for (const node of current.nodes) {
      const [x, y, z] = position(node)

      expect(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)).toBe(true)
      expect(Math.abs(x)).toBeLessThanOrEqual(5)
      expect(Math.abs(y)).toBeLessThanOrEqual(3)
      expect(Math.abs(z)).toBeLessThanOrEqual(0.6)
      expect(node.depth).toBeGreaterThanOrEqual(-1)
      expect(node.depth).toBeLessThanOrEqual(1)
      expect(node.radius).toBeGreaterThan(0)
    }
  })

  it('anchors to real beads, stably, and never to the hub alone', () => {
    const current = graph(90)

    expect(current.anchors.length).toBeGreaterThan(0)

    for (const anchor of current.anchors) {
      expect(anchor).toBeGreaterThan(0)
      expect(anchor).toBeLessThan(current.nodes.length)
    }

    expect(new Set(current.anchors).size).toBe(current.anchors.length)
    expect(graph(90).anchors).toEqual(current.anchors)
  })

  it('anchors a shallow web whose rings are too few for the even rule', () => {
    const shallow = graphFor({ seed: SEED, days: 0, mobile: true })

    expect(shallow.anchors.length).toBeGreaterThan(0)
  })
})
