import { describe, expect, it } from 'vitest'

import { richnessFor } from '@/world/density'

describe('richness', () => {
  it('earns one object per family every thirty days, up to four', () => {
    expect(richnessFor(0, false).perFamily).toBe(1)
    expect(richnessFor(29, false).perFamily).toBe(1)
    expect(richnessFor(30, false).perFamily).toBe(2)
    expect(richnessFor(60, false).perFamily).toBe(3)
    expect(richnessFor(90, false).perFamily).toBe(4)
    expect(richnessFor(400, false).perFamily).toBe(4)
  })

  it('stops the phone tier at two per family', () => {
    expect(richnessFor(90, true).perFamily).toBe(2)
    expect(richnessFor(0, true).perFamily).toBe(1)
  })

  it('reads the same arc words as the description', () => {
    expect(richnessFor(0, false).stage).toBe('sparse')
    expect(richnessFor(45, false).stage).toBe('growing')
    expect(richnessFor(90, false).stage).toBe('dense')
  })

  it('treats missing or damaged counts as the beginning', () => {
    expect(richnessFor(-5, false)).toEqual(richnessFor(0, false))
    expect(richnessFor(Number.NaN, false)).toEqual(richnessFor(0, false))
    expect(richnessFor(Number.POSITIVE_INFINITY, false)).toEqual(richnessFor(0, false))
  })
})
