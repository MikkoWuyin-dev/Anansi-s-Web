import { describe, expect, it } from 'vitest'

import {
  CELEBRATE_MS,
  KEYFRAMES,
  restingPoint,
  searchPath,
  searchPose,
  SEARCH_MS,
  webWake,
} from '@/world/choreography'
import { graphFor } from '@/world/graph'
import { BEATS } from '@/world/stage'

const SEED = 'client-one:2026-10-18'

function graph(days = 45, mobile = false) {
  return graphFor({ seed: SEED, days, mobile })
}

function distance(a: readonly number[], b: readonly number[]): number {
  return Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!)
}

describe('the search path', () => {
  it('starts and ends at the hub, lifted in front of the web', () => {
    const web = graph()
    const path = searchPath(web)
    const home = restingPoint(web)

    expect(path[0]).toEqual(home)
    expect(path[3]).toEqual(home)
    expect(path[0]![2]).toBeGreaterThan(web.nodes[0]!.position[2])
  })

  it('visits two real anchor nodes, far enough to read as a journey', () => {
    const web = graph(90)
    const path = searchPath(web)

    for (const point of [path[1]!, path[2]!]) {
      const matched = web.nodes.some(
        (node) =>
          Math.abs(node.position[0] - point[0]) < 1e-9 &&
          Math.abs(node.position[1] - point[1]) < 1e-9,
      )

      expect(matched).toBe(true)
    }

    expect(distance(path[0]!, path[1]!)).toBeGreaterThan(0.3)
    expect(distance(path[1]!, path[2]!)).toBeGreaterThan(0.1)
  })

  it('holds the same path for the same journey', () => {
    expect(searchPath(graph())).toEqual(searchPath(graph()))
  })
})

describe('the pose', () => {
  it('is home at both ends and away in the middle', () => {
    const web = graph()
    const path = searchPath(web)

    expect(distance(searchPose(0, path, false).position, path[0]!)).toBeLessThan(1e-9)
    expect(distance(searchPose(1, path, false).position, path[0]!)).toBeLessThan(1e-9)
    expect(distance(searchPose(0.5, path, false).position, path[0]!)).toBeGreaterThan(0.2)
  })

  it('stops the legs at every hold and moves them mid stride', () => {
    const path = searchPath(graph())

    for (const keyframe of KEYFRAMES) {
      expect(searchPose(keyframe.at, path, false).stride).toBeLessThanOrEqual(0.0001)
    }

    expect(searchPose(0.22, path, false).stride).toBeGreaterThan(0.5)
    expect(searchPose(0.56, path, false).stride).toBeGreaterThan(0.5)
  })

  it('keeps the gait bounded', () => {
    const path = searchPath(graph())

    for (let progress = 0; progress <= 1; progress += 0.01) {
      const pose = searchPose(progress, path, false)

      expect(pose.stride).toBeGreaterThanOrEqual(0)
      expect(pose.stride).toBeLessThanOrEqual(1)
      expect(Number.isFinite(pose.position[0])).toBe(true)
      expect(Number.isFinite(pose.heading)).toBe(true)
    }
  })

  it('clamps a damaged progress rather than leaving the web', () => {
    const path = searchPath(graph())

    expect(searchPose(-2, path, false)).toEqual(searchPose(0, path, false))
    expect(searchPose(9, path, false)).toEqual(searchPose(1, path, false))
    expect(searchPose(Number.NaN, path, false)).toEqual(searchPose(0, path, false))
  })

  it('resolves in place under reduced motion', () => {
    const web = graph()
    const path = searchPath(web)
    const home = restingPoint(web)

    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const pose = searchPose(progress, path, true)

      expect(pose.position).toEqual(home)
      expect(pose.stride).toBe(0)
      expect(pose.heading).toBe(0)
    }
  })
})

describe('the wake', () => {
  it('is still at idle and resting, and awake during the search', () => {
    expect(webWake('idle')).toBe(0)
    expect(webWake('resting')).toBe(0)
    expect(webWake('searching')).toBe(1)
    expect(webWake('revealing')).toBeGreaterThan(0)
    expect(webWake('celebrating')).toBeGreaterThan(0)
  })

  it('gives every beat a bounded value', () => {
    for (const beat of BEATS) {
      expect(webWake(beat)).toBeGreaterThanOrEqual(0)
      expect(webWake(beat)).toBeLessThanOrEqual(1)
    }
  })
})

describe('the timing', () => {
  it('replaces the old 900 ms pause with a searched beat', () => {
    expect(SEARCH_MS).toBeGreaterThan(900)
    expect(SEARCH_MS).toBeLessThanOrEqual(2_000)
    expect(CELEBRATE_MS).toBeGreaterThan(0)
    expect(CELEBRATE_MS).toBeLessThan(SEARCH_MS)
  })

  it('keeps the keyframes ordered and complete', () => {
    expect(KEYFRAMES[0]!.at).toBe(0)
    expect(KEYFRAMES[KEYFRAMES.length - 1]!.at).toBe(1)

    for (let index = 1; index < KEYFRAMES.length; index += 1) {
      expect(KEYFRAMES[index]!.at).toBeGreaterThan(KEYFRAMES[index - 1]!.at)
    }
  })
})
