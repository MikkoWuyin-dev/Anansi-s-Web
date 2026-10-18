import { describe, expect, it } from 'vitest'

import {
  CAMERA_FRAMES,
  frameFor,
  MOBILE_PULL_BACK,
  PARALLAX_DISTANCE,
  PARALLAX_RISE,
  parallaxOffset,
  SETTLE_EPSILON,
  settled,
  smoothing,
} from '@/world/camera'
import { BEATS } from '@/world/stage'

describe('the frames', () => {
  it('gives every beat a frame of its own', () => {
    const positions = BEATS.map((beat) => CAMERA_FRAMES[beat].position.join(','))

    expect(new Set(positions).size).toBe(BEATS.length)
    expect(Object.keys(CAMERA_FRAMES).sort()).toEqual([...BEATS].sort())
  })

  it('keeps every frame behind the web and aimed at it', () => {
    for (const beat of BEATS) {
      const frame = CAMERA_FRAMES[beat]

      expect(frame.position[2]).toBeGreaterThan(5)
      expect(Math.abs(frame.position[0])).toBeLessThan(1)
      expect(Math.abs(frame.position[1])).toBeLessThan(1)
      expect(Math.abs(frame.target[0])).toBeLessThan(1)
      expect(Math.abs(frame.target[1])).toBeLessThan(1)
    }
  })

  it('frames the beats as designed: revealing nearer, resting wider', () => {
    const idle = CAMERA_FRAMES.idle.position[2]
    const searching = CAMERA_FRAMES.searching.position[2]
    const revealing = CAMERA_FRAMES.revealing.position[2]
    const celebrating = CAMERA_FRAMES.celebrating.position[2]
    const resting = CAMERA_FRAMES.resting.position[2]

    expect(revealing).toBeLessThan(idle)
    expect(celebrating).toBeLessThan(revealing)
    expect(resting).toBeGreaterThan(idle)
    expect(searching).toBeLessThan(idle)
  })

  it('steps off axis while searching, so the hunt is not a stare', () => {
    expect(Math.abs(CAMERA_FRAMES.searching.position[0])).toBeGreaterThan(0.5)
    expect(CAMERA_FRAMES.searching.position[0]).toBeGreaterThan(0)
  })
})

describe('the phone tier', () => {
  it('pulls every frame back and narrows the sideways move', () => {
    for (const beat of BEATS) {
      const desktop = CAMERA_FRAMES[beat]
      const mobile = frameFor(beat, true)

      expect(mobile.position[2]).toBeCloseTo(desktop.position[2] * MOBILE_PULL_BACK, 5)
      expect(Math.abs(mobile.position[0])).toBeLessThanOrEqual(Math.abs(desktop.position[0]))
      expect(Math.abs(mobile.position[1])).toBeLessThanOrEqual(Math.abs(desktop.position[1]))
    }
  })

  it('leaves the desktop frame untouched', () => {
    for (const beat of BEATS) {
      expect(frameFor(beat, false)).toBe(CAMERA_FRAMES[beat])
    }
  })
})

describe('the parallax', () => {
  it('moves nothing at the centre', () => {
    expect(parallaxOffset({ x: 0, y: 0 }, false)).toEqual([0, 0])
  })

  it('stays inside its bound at the corners', () => {
    const [x, y] = parallaxOffset({ x: 1, y: -1 }, false)

    expect(x).toBe(PARALLAX_DISTANCE)
    expect(y).toBe(-PARALLAX_DISTANCE * PARALLAX_RISE)
  })

  it('clamps a pointer that leaves the window', () => {
    expect(parallaxOffset({ x: 4, y: -8 }, false)).toEqual([
      PARALLAX_DISTANCE,
      -PARALLAX_DISTANCE * PARALLAX_RISE,
    ])
  })

  it('treats a broken reading as the centre', () => {
    expect(parallaxOffset({ x: Number.NaN, y: Number.POSITIVE_INFINITY }, false)).toEqual([0, 0])
  })

  it('moves nothing at all under reduced motion', () => {
    expect(parallaxOffset({ x: 1, y: 1 }, true)).toEqual([0, 0])
  })
})

describe('the easing', () => {
  it('covers none of the distance in no time and all of it eventually', () => {
    expect(smoothing(6, 0)).toBe(0)
    expect(smoothing(6, 10)).toBeCloseTo(1 - Math.exp(-0.6), 5)
  })

  it('covers more of the distance in a longer step', () => {
    expect(smoothing(6, 0.008)).toBeLessThan(smoothing(6, 0.016))
  })

  it('caps a long stall, so a hidden tab does not teleport the camera', () => {
    expect(smoothing(6, 0.1)).toBe(smoothing(6, 5))
  })
})

describe('arrival', () => {
  it('reports a point at the target as settled', () => {
    expect(settled({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(true)
  })

  it('reports a point just outside the epsilon as still moving', () => {
    expect(settled({ x: SETTLE_EPSILON * 2, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(false)
  })

  it('measures in three dimensions, not one axis', () => {
    const step = SETTLE_EPSILON * 0.8

    expect(settled({ x: step, y: step, z: step }, { x: 0, y: 0, z: 0 })).toBe(false)
  })
})
