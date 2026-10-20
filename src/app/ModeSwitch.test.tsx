import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ModeSwitch } from '@/app/ModeSwitch'

describe('the mode switch', () => {
  it('is a button that names the mode it moves to', () => {
    expect(renderToStaticMarkup(<ModeSwitch mode="dark" onToggle={() => undefined} />)).toContain(
      'aria-label="Switch to light mode"',
    )
    expect(renderToStaticMarkup(<ModeSwitch mode="light" onToggle={() => undefined} />)).toContain(
      'aria-label="Switch to dark mode"',
    )
  })

  it('carries the glyph as decoration, not as content', () => {
    const html = renderToStaticMarkup(<ModeSwitch mode="dark" onToggle={() => undefined} />)

    expect(html).toContain('type="button"')
    expect(html).toContain('class="mode-switch"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toMatch(/<svg|<img/)
  })

  it('holds no mode state of its own beyond the prop', () => {
    const html = renderToStaticMarkup(<ModeSwitch mode="light" onToggle={() => undefined} />)

    expect(html).not.toContain('Switch to light mode')
  })
})

describe('the switch under reduced motion', () => {
  const stylesheet = readFileSync(
    fileURLToPath(new URL('./styles.css', import.meta.url)),
    'utf8',
  )
  const start = stylesheet.indexOf('@media (prefers-reduced-motion: reduce)')
  const reduced = stylesheet.slice(start, stylesheet.indexOf('\n}\n', start))

  it('removes the glyph turn and the page crossfade, and keeps the change', () => {
    expect(start).toBeGreaterThan(-1)
    expect(reduced).toContain('.mode-switch,')
    expect(reduced).toContain('.mode-switch__sun')
    expect(reduced).toContain('transition: none')
    expect(reduced).toContain('::view-transition-old(root)')
    expect(reduced).toContain('animation: none')
  })
})
