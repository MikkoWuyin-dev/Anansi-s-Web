import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { PALETTE_TOKENS, readPalette } from '@/world/palette'

const stylesheet = readFileSync(fileURLToPath(new URL('../app/styles.css', import.meta.url)), 'utf8')

const declarations = new Map(
  [...stylesheet.matchAll(/(--anansi-[a-z-]+)\s*:\s*([^;]+);/g)].map((match) => [
    match[1] as string,
    (match[2] as string).trim(),
  ]),
)

describe('the palette reader', () => {
  it('resolves every token it is given', () => {
    const read = (token: string): string => declarations.get(token) ?? ''
    const palette = readPalette(read)

    expect(palette.jet).toBe('#19323c')
    expect(palette.yellow).toBe('#faff00')
    expect(palette.lavender).toBe('#885a89')
  })

  it('trims the whitespace a computed style hands back', () => {
    const palette = readPalette((token) => `  ${declarations.get(token) ?? ''}\n`)

    expect(palette.ink).toBe(palette.ink.trim())
    expect(palette.black).toBe('#08090a')
  })

  it('names the token it is missing', () => {
    expect(() => readPalette((token) => (token === '--anansi-yellow' ? '' : '#ffffff'))).toThrow(
      '--anansi-yellow',
    )
  })
})

describe('the token source', () => {
  it('defines every colour the stage reads', () => {
    for (const token of Object.values(PALETTE_TOKENS)) {
      expect({ token, declared: declarations.has(token) }).toEqual({ token, declared: true })
    }
  })

  it('declares them once, in the one token block', () => {
    const block = stylesheet.slice(stylesheet.indexOf(':root'), stylesheet.indexOf('}'))
    const hexes = [...block.matchAll(/#[0-9a-f]{6}/gi)].map((match) => match[0].toLowerCase())

    expect(hexes.length).toBeGreaterThanOrEqual(Object.keys(PALETTE_TOKENS).length)
    expect(new Set(hexes).size).toBe(hexes.length)
  })
})
