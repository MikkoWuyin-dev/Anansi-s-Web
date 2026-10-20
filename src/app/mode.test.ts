import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { applyMode, resolveMode, toggleChoice } from '@/app/mode'

describe('resolving the mode', () => {
  it('lets an explicit choice win over the system', () => {
    expect(resolveMode('light', 'dark')).toBe('light')
    expect(resolveMode('dark', 'light')).toBe('dark')
  })

  it('follows the system when nothing was chosen', () => {
    expect(resolveMode('system', 'light')).toBe('light')
    expect(resolveMode('system', 'dark')).toBe('dark')
  })
})

describe('toggling', () => {
  it('always flips what is showing, whichever way the system points', () => {
    for (const system of ['light', 'dark'] as const) {
      for (const choice of ['system', 'light', 'dark'] as const) {
        const showing = resolveMode(choice, system)
        const next = toggleChoice(choice, system)

        expect({ choice, system, next }).toEqual({
          choice,
          system,
          next: showing === 'light' ? 'dark' : 'light',
        })
      }
    }
  })
})

describe('applying the mode', () => {
  it('does nothing without a document, so the module stays importable', () => {
    expect(() => applyMode('light')).not.toThrow()
  })
})

describe('the pre-paint script', () => {
  const html = readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8')
  const start = html.indexOf('<script>')
  const script = html.slice(start, html.indexOf('</script>', start))

  it('sets the mode attribute before the app module is requested', () => {
    // The assignment is asserted, not merely the property's name: a script that
    // reads the key and then never writes the attribute would pass a looser
    // check and flash the wrong page on every reload.
    expect(script).toMatch(/document\.documentElement\.dataset\.mode\s*=\s*light\s*\?\s*'light'\s*:\s*'dark'/)
    expect(html.indexOf('anansi:v1:mode')).toBeLessThan(html.indexOf('/src/main.tsx'))
  })

  it('accepts only the three known choices', () => {
    expect(script).toContain('stored.version === 1')
    expect(script).toContain("choice !== 'dark'")
  })

  it('asks the same question the app asks', () => {
    expect(script).toContain('(prefers-color-scheme: light)')
    expect(script).toContain("'light'")
    expect(script).toContain("'dark'")
  })

  it('never throws on a blocked storage or an unknown value', () => {
    expect(script).toMatch(/try\s*\{/)
    expect(script).toContain('catch')
  })

  it('leaves the browser chrome to the resolved mode, not the media query', () => {
    expect(html.match(/name="theme-color"/g)).toHaveLength(1)
    expect(html).not.toContain('theme-color" content="#F2EFE4" media')
  })
})
