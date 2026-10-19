import { describe, expect, it } from 'vitest'

import { BODY_DIP, bodyDip, EYES, LEGS, legGait } from '@/world/spider'

describe('the legs', () => {
  it('gives him eight legs, four a side, mirrored', () => {
    expect(LEGS).toHaveLength(8)
    expect(LEGS.filter((leg) => leg.side === -1)).toHaveLength(4)
    expect(LEGS.filter((leg) => leg.side === 1)).toHaveLength(4)

    for (let index = 0; index < 4; index += 1) {
      expect(LEGS[index]!.yaw).toBe(-LEGS[index + 4]!.yaw)
    }
  })

  it('keeps every hip on the body', () => {
    for (const leg of LEGS) {
      expect(Math.abs(leg.hip[0])).toBeLessThan(0.05)
      expect(Math.abs(leg.hip[1])).toBeLessThan(0.06)
      expect(Math.abs(leg.yaw)).toBeLessThan(1)
    }
  })
})

describe('the gait', () => {
  it('stands still when the stride is zero', () => {
    for (let index = 0; index < LEGS.length; index += 1) {
      expect(legGait(index, 0)).toEqual({ swing: 0, lift: 0 })
    }
  })

  it('alternates the legs rather than moving them together', () => {
    const first = legGait(0, 1)
    const second = legGait(1, 1)

    expect(first.swing).not.toBeCloseTo(second.swing, 3)
  })

  it('keeps every step bounded', () => {
    for (let index = 0; index < LEGS.length; index += 1) {
      for (let stride = 0; stride <= 1; stride += 0.1) {
        const gait = legGait(index, stride)

        expect(gait.swing).toBeGreaterThanOrEqual(-1)
        expect(gait.swing).toBeLessThanOrEqual(1)
        expect(gait.lift).toBeGreaterThanOrEqual(0)
        expect(gait.lift).toBeLessThanOrEqual(0.5)
      }
    }
  })

  it('keeps the body dip shallow and downward', () => {
    expect(bodyDip(0)).toBe(0)
    expect(bodyDip(1)).toBe(-BODY_DIP)
    expect(bodyDip(4)).toBe(-BODY_DIP)
  })
})

describe('the silhouette', () => {
  it('puts his eyes in front of his head, level with each other', () => {
    expect(EYES).toHaveLength(2)
    expect(EYES[0]![1]).toBe(EYES[1]![1])
    expect(EYES[0]![2]).toBe(EYES[1]![2])
    expect(EYES[0]![0]).toBe(-EYES[1]![0])
  })
})
