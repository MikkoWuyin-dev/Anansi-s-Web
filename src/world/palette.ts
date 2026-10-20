/**
 * The stage's colours, read from the design tokens at mount (MCD §4 rule 7).
 *
 * No colour value lives in `src/world/`: the tokens are the `--anansi-*`
 * custom properties that already sit in one block in `styles.css`. Reading
 * them keeps a single source of truth, and lets the world follow a future
 * light mode without a second palette written in JavaScript.
 */

/**
 * Which token set the document is wearing. The app decides it from the system
 * preference and hands it to the scene, which re-reads the tokens when it
 * changes (spec 0006, AC-6).
 */
export type Mode = 'light' | 'dark'

export interface Palette {
  readonly black: string
  readonly jet: string
  readonly yellow: string
  readonly strawberry: string
  readonly lavender: string
  readonly ink: string
  readonly dim: string
}

/** The custom property each colour comes from. */
export const PALETTE_TOKENS: Record<keyof Palette, string> = {
  black: '--anansi-black',
  jet: '--anansi-jet',
  yellow: '--anansi-yellow',
  strawberry: '--anansi-strawberry',
  lavender: '--anansi-lavender',
  ink: '--anansi-ink',
  dim: '--anansi-dim',
}

/** How a colour token is looked up: `getComputedStyle` in the app, a map in tests. */
export type TokenReader = (token: string) => string

/**
 * Resolve every stage colour, failing loudly when a token is missing: a world
 * drawn in the wrong colours is worse than no world, and the error is caught
 * by the stage's own boundary so the ritual never sees it.
 */
export function readPalette(read: TokenReader): Palette {
  const palette = {} as Record<keyof Palette, string>

  for (const key of Object.keys(PALETTE_TOKENS) as (keyof Palette)[]) {
    const token = PALETTE_TOKENS[key]
    const value = read(token).trim()

    if (value === '') {
      throw new Error(`The stage needs the ${token} token, and the document does not define it.`)
    }

    palette[key] = value
  }

  return palette
}

/** The palette as the running document defines it. */
export function documentPalette(): Palette {
  const styles = getComputedStyle(document.documentElement)

  return readPalette((token) => styles.getPropertyValue(token))
}
