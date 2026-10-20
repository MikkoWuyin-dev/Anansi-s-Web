import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * The two token sets as the stylesheet declares them (spec 0006).
 *
 * Contrast is arithmetic, and this project has already been burned by claims it
 * did not measure, so the light derivation is checked here rather than by eye.
 * The pairs and thresholds are the WCAG 2.1 minimums: 4.5:1 for text, 3:1 for
 * controls, focus indicators, and the boundary of a filled control.
 */

const stylesheet = readFileSync(fileURLToPath(new URL('./styles.css', import.meta.url)), 'utf8')

/** The selector the light set hangs off (spec 0007 replaced the media query). */
const LIGHT_SELECTOR = ":root[data-mode='light']"

const LIGHT = 'light'
const DARK = 'dark'

/** Every colour role both sets must declare. */
const COLOUR_TOKENS = [
  'surface',
  'black',
  'jet',
  'yellow',
  'strawberry',
  'lavender',
  'lavender-text',
  'ink',
  'dim',
  'yellow-glow',
  'action-edge',
].map((role) => `--anansi-${role}`)

function declarations(source: string): Map<string, string> {
  const found = new Map<string, string>()

  for (const match of source.matchAll(/(--anansi-[a-z-]+)\s*:\s*([^;]+);/g)) {
    found.set(match[1] as string, (match[2] as string).trim())
  }

  return found
}

/** The base block: the first `:root` and the rule that closes it. */
function baseBlock(): string {
  const start = stylesheet.indexOf(':root')
  const end = stylesheet.indexOf('}', stylesheet.indexOf('{', start))

  return stylesheet.slice(start, end)
}

/** The light block: the attribute-selected rule. */
function lightBlock(): string {
  const start = stylesheet.indexOf(LIGHT_SELECTOR)
  const end = stylesheet.indexOf('}', stylesheet.indexOf('{', start))

  return stylesheet.slice(start, end)
}

const sets = new Map([
  [DARK, declarations(baseBlock())],
  [LIGHT, declarations(lightBlock())],
])

/** The stylesheet with both token blocks removed, where no colour may appear. */
function rules(): string {
  const lightStart = stylesheet.indexOf(LIGHT_SELECTOR)
  const light = stylesheet.slice(
    lightStart,
    stylesheet.indexOf('}', stylesheet.indexOf('{', lightStart)) + 1,
  )

  return stylesheet.replace(baseBlock(), '').replace(light, '')
}

type Rgb = readonly [number, number, number]

function rgb(value: string, over: Rgb = [0, 0, 0]): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(value)

  if (hex !== null) {
    const n = Number.parseInt(hex[1] as string, 16)

    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }

  const parts = /^rgba?\(([^)]+)\)$/i.exec(value)

  if (parts !== null) {
    const [r, g, b, a = '1'] = (parts[1] as string).split(',').map((part) => part.trim())
    const alpha = Number(a)

    return [
      Math.round(Number(r) * alpha + over[0] * (1 - alpha)),
      Math.round(Number(g) * alpha + over[1] * (1 - alpha)),
      Math.round(Number(b) * alpha + over[2] * (1 - alpha)),
    ]
  }

  throw new Error(`Not a colour: ${value}`)
}

function luminance([r, g, b]: Rgb): number {
  const channel = (c: number): number => {
    const s = c / 255

    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(foreground: string, background: string): number {
  const back = rgb(background)
  const front = rgb(foreground, back)
  const [light, dark] = [luminance(front), luminance(back)].sort((a, b) => b - a) as [number, number]

  return (light + 0.05) / (dark + 0.05)
}

function token(mode: string, role: string): string {
  const value = sets.get(mode)?.get(`--anansi-${role}`)

  if (value === undefined) {
    throw new Error(`The ${mode} set does not declare --anansi-${role}.`)
  }

  return value
}

describe('the two token sets', () => {
  it('declares the same colour roles in both modes', () => {
    for (const mode of [DARK, LIGHT]) {
      const declared = [...(sets.get(mode)?.keys() ?? [])]
      const missing = COLOUR_TOKENS.filter((name) => !declared.includes(name))

      expect({ mode, missing }).toEqual({ mode, missing: [] })
    }
  })

  it('names the token a set is missing', () => {
    const partial = declarations(
      baseBlock().replace(/--anansi-dim:[^;]+;/, ''),
    )

    expect(COLOUR_TOKENS.filter((name) => !partial.has(name))).toEqual(['--anansi-dim'])
  })

  it('selects the light set by the attribute and nothing else', () => {
    // One authority for the mode (spec 0007): a media query here would be a
    // second one that the switch could not override.
    expect(stylesheet).toContain(LIGHT_SELECTOR)
    expect(stylesheet).not.toContain('prefers-color-scheme')
  })

  it('swaps the page between a dark and a light grounding', () => {
    expect(luminance(rgb(token(DARK, 'surface')))).toBeLessThan(0.02)
    expect(luminance(rgb(token(LIGHT, 'surface')))).toBeGreaterThan(0.75)
  })
})

describe('contrast in both modes', () => {
  it('keeps primary and secondary text readable', () => {
    for (const mode of [DARK, LIGHT]) {
      for (const role of ['ink', 'dim', 'lavender-text']) {
        const ratio = contrast(token(mode, role), token(mode, 'surface'))

        expect({ mode, role, enough: ratio >= 4.5 }).toEqual({ mode, role, enough: true })
      }
    }
  })

  it('keeps the label inside the yellow action readable', () => {
    for (const mode of [DARK, LIGHT]) {
      const ratio = contrast(token(mode, 'black'), token(mode, 'yellow'))

      expect({ mode, enough: ratio >= 4.5 }).toEqual({ mode, enough: true })
    }
  })

  it('keeps the focus ring visible against the page', () => {
    for (const mode of [DARK, LIGHT]) {
      const ratio = contrast(token(mode, 'lavender'), token(mode, 'surface'))

      expect({ mode, enough: ratio >= 3 }).toEqual({ mode, enough: true })
    }
  })

  it('draws a boundary around the action on paper', () => {
    const ratio = contrast(token(LIGHT, 'action-edge'), token(LIGHT, 'surface'))

    expect(ratio >= 3).toBe(true)
  })
})

describe('the colour rule', () => {
  it('keeps every raw colour inside the two token blocks', () => {
    const source = rules()
    const literals = [...source.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi)].map(
      (match) => match[0],
    )

    expect(literals).toEqual([])
  })
})
