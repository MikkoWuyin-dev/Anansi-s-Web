import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { PALETTE_TOKENS, readPalette } from '@/world/palette'

const stylesheet = readFileSync(fileURLToPath(new URL('../app/styles.css', import.meta.url)), 'utf8')

/**
 * The base token block only. The light set declares the same names further down
 * (spec 0006), and the reader must resolve whichever set the document is wearing
 * rather than whichever appears last in the file.
 */
const baseBlock = (() => {
  const start = stylesheet.indexOf(':root')

  return stylesheet.slice(start, stylesheet.indexOf('}', stylesheet.indexOf('{', start)))
})()

const declarations = new Map(
  [...baseBlock.matchAll(/(--anansi-[a-z-]+)\s*:\s*([^;]+);/g)].map((match) => [
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

  it('declares each of them once, in the base token block', () => {
    // Two roles may share a value — the page and the action's label are both
    // near-black — but no token may be declared twice and quietly win.
    for (const name of Object.values(PALETTE_TOKENS)) {
      const count = [...baseBlock.matchAll(new RegExp(`${name}\\s*:`, 'g'))].length

      expect({ name, count }).toEqual({ name, count: 1 })
    }
  })
})
