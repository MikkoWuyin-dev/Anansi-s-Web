import { describe, expect, it } from 'vitest'

import { graphFor } from '@/world/graph'
import {
  FAMILIES,
  FAMILY_COLOURS,
  FAMILY_FORM,
  objectCount,
  objectsFor,
  type WorldObject,
} from '@/world/families'
import { densityWord } from '@/world/stage'
import { MAX_PER_FAMILY, MOBILE_PER_FAMILY, richnessFor } from '@/world/density'

const SEED = 'client-one:2026-10-18'

function objects(days = 0, mobile = false, reducedMotion = false): WorldObject[] {
  return objectsFor(graphFor({ seed: SEED, days, mobile }), days, mobile, reducedMotion)
}

function family(familyName: (typeof FAMILIES)[number], days = 90): WorldObject[] {
  return objects(days).filter((object) => object.family === familyName)
}

describe('the families', () => {
  it('draws all five families from five different forms', () => {
    expect(FAMILIES).toHaveLength(5)
    expect(new Set(FAMILIES.map((name) => FAMILY_FORM[name])).size).toBe(FAMILIES.length)
  })

  it('builds every instance of a family from that family form', () => {
    for (const name of FAMILIES) {
      expect(family(name).length).toBeGreaterThan(0)
    }
  })

  it('varies proportions within a family but keeps the tone set', () => {
    for (const name of FAMILIES) {
      const instances = family(name)

      // Same family: every instance borrows a tone the family allows.
      for (const instance of instances) {
        expect(FAMILY_COLOURS[name]).toContain(instance.colour)
      }

      // Visibly varied: no two of four instances share their whole scale.
      const scales = instances.slice(0, 4).map((instance) => instance.scale.join(','))
      expect(new Set(scales).size).toBeGreaterThanOrEqual(3)
    }
  })

  it('turns and places every instance differently', () => {
    for (const name of FAMILIES) {
      const instances = family(name)
      const turns = instances.map((instance) => instance.rotation.join(','))
      const places = instances.map((instance) => instance.position.map((value) => value.toFixed(2)).join(','))

      expect(new Set(turns).size).toBeGreaterThanOrEqual(3)
      expect(new Set(places).size).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('the anchoring', () => {
  it('hangs every object from a real node, at that node', () => {
    const graph = graphFor({ seed: SEED, days: 90, mobile: false })

    for (const object of objects(90)) {
      expect(graph.anchors).toContain(object.node)

      const [nx, ny, nz] = graph.nodes[object.node]!.position
      const [x, y, z] = object.position

      expect(Math.abs(x - nx)).toBeLessThanOrEqual(0.06)
      expect(Math.abs(y - ny)).toBeLessThanOrEqual(0.06)
      expect(z).toBeGreaterThan(nz)
      expect(z - nz).toBeLessThanOrEqual(0.18)
    }
  })

  it('draws the same objects for the same journey and count', () => {
    const first = objects(45)
    const second = objects(45)
    const otherJourney = objectsFor(
      graphFor({ seed: 'client-two:2026-10-18', days: 45, mobile: false }),
      45,
      false,
    )

    expect(first).toEqual(second)
    expect(first).not.toEqual(otherJourney)
  })
})

describe('density across a journey', () => {
  it('thickens from the early stage to the late stage and never thins', () => {
    let total = 0

    for (const days of [0, 10, 30, 45, 60, 75, 90]) {
      const count = objects(days).length

      expect(count).toBeGreaterThanOrEqual(total)
      total = count
    }

    expect(objects(0).length).toBeLessThan(objects(90).length)
    expect(objectCount(0, false)).toBe(FAMILIES.length)
    expect(objectCount(90, false)).toBe(FAMILIES.length * MAX_PER_FAMILY)
  })

  it('keeps the phone tier at or below the desktop tier', () => {
    for (const days of [0, 45, 90]) {
      expect(objects(days, true).length).toBeLessThanOrEqual(objects(days, false).length)
      expect(objectCount(days, true)).toBeLessThanOrEqual(FAMILIES.length * MOBILE_PER_FAMILY)
    }
  })

  it('clamps a damaged count to an early journey', () => {
    expect(objects(-20)).toEqual(objects(0))
    expect(objects(Number.NaN)).toEqual(objects(0))
  })

  it('reads its stage word from the same count the web uses', () => {
    for (const days of [0, 30, 60, 90]) {
      expect(richnessFor(days, false).stage).toBe(densityWord(days))
    }
  })

  it('grows the impulse with the journey but bounds it', () => {
    expect(richnessFor(0, false).impulse).toBeLessThan(richnessFor(90, false).impulse)
    expect(richnessFor(90, false).impulse).toBeLessThanOrEqual(1)
  })
})

describe('reduced motion', () => {
  it('keeps every object where it is', () => {
    for (const object of objects(90, false, true)) {
      expect(object.motion.amplitude).toBe(0)
    }
  })
})
