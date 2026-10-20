import { describe, expect, it } from 'vitest'

import { graphFor } from '@/world/graph'
import { filamentRest, keptThreads, MAX_KEPT_DAYS } from '@/world/kept'

const SEED = 'client-one:2026-10-18'

const graph = graphFor({ seed: SEED, days: 30, mobile: false })

const days = ['2026-10-01', '2026-10-02', '2026-10-03']

describe('the standing threads', () => {
  it('gives every kept day exactly one thread', () => {
    const threads = keptThreads(graph, days, false)

    expect(threads.map((thread) => thread.dayKey)).toEqual(days)
  })

  it('draws nothing for a journey that has kept nothing', () => {
    expect(keptThreads(graph, [], false)).toEqual([])
  })

  it('never draws the same day twice', () => {
    const threads = keptThreads(graph, [...days, days[0]!], false)

    expect(threads).toHaveLength(days.length)
  })

  it('is the same weave every time it is asked', () => {
    expect(keptThreads(graph, days, false)).toEqual(keptThreads(graph, days, false))
  })

  it('leaves an existing thread alone when another day arrives', () => {
    const before = keptThreads(graph, days, false)
    const after = keptThreads(graph, [...days, '2026-10-04'], false)

    expect(after.slice(0, before.length)).toEqual(before)
  })

  it('weaves from a node that exists, outward from the hub', () => {
    for (const thread of keptThreads(graph, days, false)) {
      expect(graph.nodes.some((node) => node.position.join() === thread.from.join())).toBe(true)

      const hubDistance = Math.hypot(thread.from[0], thread.from[1])
      const endDistance = Math.hypot(thread.to[0], thread.to[1])

      expect(endDistance).toBeGreaterThan(hubDistance)
    }
  })

  it('keeps the journey ceiling of ninety kept days', () => {
    const many = Array.from({ length: 120 }, (_, index) => `day-${String(index).padStart(3, '0')}`)

    expect(keptThreads(graph, many, false)).toHaveLength(MAX_KEPT_DAYS)
  })

  it('pulls the weave in on a phone', () => {
    const desktop = keptThreads(graph, days, false)
    const phone = keptThreads(graph, days, true)

    for (const [index, thread] of phone.entries()) {
      const length = Math.hypot(
        thread.to[0] - thread.from[0],
        thread.to[1] - thread.from[1],
      )
      const wide = Math.hypot(
        desktop[index]!.to[0] - desktop[index]!.from[0],
        desktop[index]!.to[1] - desktop[index]!.from[1],
      )

      expect(length).toBeLessThan(wide)
    }
  })
})

describe('the filament when a story is kept', () => {
  it('holds a low steady thread, and nothing when the day is not kept', () => {
    expect(filamentRest(true)).toBeGreaterThan(0)
    expect(filamentRest(true)).toBeLessThan(0.9)
    expect(filamentRest(false)).toBe(0)
  })
})
