import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * The stage's module boundary (spec 0005, AC-8, AC-11, AC-19).
 *
 * Reads the world's own source, for the same reason the engine and state do:
 * a colour literal, an orbit control, or an import back into the app is a
 * mistake no behaviour test catches. The stage receives everything it draws as
 * props and reads the palette from the stylesheet's tokens.
 */

const directory = fileURLToPath(new URL('.', import.meta.url))

const sources = readdirSync(directory)
  .filter((name) => /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.test.tsx'))
  .map((name) => ({ name, source: readFileSync(directory + name, 'utf8') }))

const imports = (source: string): string[] =>
  [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1] as string)

const ALLOWED = /^(@\/(world|engine)\/|react$|three$|@react-three\/fiber$|@react-spring\/three$)/

describe('the world module boundary', () => {
  it('finds the world sources', () => {
    expect(sources.map((entry) => entry.name)).toEqual(
      expect.arrayContaining([
        'Anansi.tsx',
        'CameraRig.tsx',
        'Objects.tsx',
        'Scene.tsx',
        'Web.tsx',
        'camera.ts',
        'choreography.ts',
        'density.ts',
        'families.ts',
        'graph.ts',
        'palette.ts',
        'spider.ts',
        'stage.ts',
      ]),
    )
  })

  it('imports only the world, the seeded stream, React and the renderer', () => {
    for (const { name, source } of sources) {
      for (const specifier of imports(source)) {
        expect({ name, specifier }).toEqual({
          name,
          specifier: expect.stringMatching(ALLOWED),
        })
      }
    }
  })

  it('never reaches back into the app, the state layer, or the content', () => {
    for (const { name, source } of sources) {
      expect({ name, app: /from\s+'@\/app\//.test(source) }).toEqual({ name, app: false })
      expect({ name, state: /from\s+'@\/state\//.test(source) }).toEqual({ name, state: false })
      expect({ name, content: /from\s+'@\/content\//.test(source) }).toEqual({ name, content: false })
    }
  })

  it('writes no colour literal, only tokens', () => {
    for (const { name, source } of sources) {
      // Matched as code, not as prose: a comment may name a token.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

      for (const [reason, pattern] of [
        ['hex', /#[0-9a-f]{3,8}\b/i],
        ['rgb', /\brgba?\s*\(/],
        ['hsl', /\bhsla?\s*\(/],
      ] as Array<[string, RegExp]>) {
        expect({ name, reason, found: pattern.test(code) }).toEqual({ name, reason, found: false })
      }
    }
  })

  it('gives the camera to no one', () => {
    for (const { name, source } of sources) {
      expect({ name, orbit: /OrbitControls|PointerLockControls|MapControls/.test(source) }).toEqual({
        name,
        orbit: false,
      })
    }
  })

  it('keeps Anansi in his own component', () => {
    for (const { name, source } of sources) {
      if (name !== 'Anansi.tsx') {
        expect({ name, internals: /from\s+'@\/world\/spider'/.test(source) }).toEqual({
          name,
          internals: false,
        })
      }

      if (name !== 'Scene.tsx') {
        expect({ name, component: /from\s+'@\/world\/Anansi'/.test(source) }).toEqual({
          name,
          component: false,
        })
      }
    }
  })

  it('never starts its own animation loop', () => {
    for (const { name, source } of sources) {
      expect({ name, loop: /requestAnimationFrame|setInterval/.test(source) }).toEqual({
        name,
        loop: false,
      })
    }
  })
})
