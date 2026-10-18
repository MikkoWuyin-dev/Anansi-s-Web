import { describe, expect, it } from 'vitest'

import { BEATS, DENSE_DAYS, densityWord, descriptionFor, GROWING_DAYS } from '@/world/stage'

describe('the density word', () => {
  it('moves from sparse to growing to dense across a journey', () => {
    expect(densityWord(0)).toBe('sparse')
    expect(densityWord(GROWING_DAYS - 1)).toBe('sparse')
    expect(densityWord(GROWING_DAYS)).toBe('growing')
    expect(densityWord(DENSE_DAYS - 1)).toBe('growing')
    expect(densityWord(DENSE_DAYS)).toBe('dense')
    expect(densityWord(90)).toBe('dense')
  })
})

describe('the description', () => {
  it('gives every beat its own sentence', () => {
    const sentences = BEATS.map((beat) => descriptionFor(beat, 0))

    expect(new Set(sentences).size).toBe(BEATS.length)
  })

  it('names the age of the web while Anansi waits', () => {
    expect(descriptionFor('idle', 0)).toContain('sparse web')
    expect(descriptionFor('idle', 45)).toContain('growing web')
    expect(descriptionFor('idle', 90)).toContain('dense web')
  })

  it('describes the world and never a story field', () => {
    for (const beat of BEATS) {
      const sentence = descriptionFor(beat, 90)

      expect(sentence).not.toMatch(/domain|difficulty|tag|resurfac/i)
      expect(sentence.length).toBeGreaterThan(10)
    }
  })
})
