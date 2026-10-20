import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { WorldLayer } from '@/app/WorldLayer'
import { descriptionFor, type Beat } from '@/world/stage'

const SEED = 'client-one:2026-10-18'

function render(
  beat: Beat = 'idle',
  days = 0,
  mode: 'light' | 'dark' = 'dark',
  keptToday = false,
): string {
  const keptDays = Array.from({ length: days }, (_, index) => `2026-01-${index + 1}`).slice(0, 30)

  return renderToStaticMarkup(
    <WorldLayer
      beat={beat}
      days={days}
      seed={SEED}
      mode={mode}
      keptDays={keptDays}
      keptToday={keptToday}
    />,
  )
}

describe('the stage layer', () => {
  it('is an image the screen reader can hear, labelled with the world state', () => {
    const html = render('revealing', 45)

    expect(html).toContain('role="img"')
    expect(html).toContain(`aria-label="${descriptionFor('revealing', 45)}"`)
  })

  it('follows the beat', () => {
    expect(render('searching')).toContain(descriptionFor('searching', 0))
    expect(render('idle', 90)).toContain(descriptionFor('idle', 90))
    expect(render('idle', 90)).not.toContain(descriptionFor('idle', 0))
  })

  it('mounts nothing before the idle callback arms it', () => {
    const html = render()

    expect(html).not.toContain('<canvas')
    expect(html).toContain('class="world"')
  })

  it('never puts a topic field in the world label', () => {
    for (const beat of ['idle', 'searching', 'revealing', 'celebrating', 'resting'] as const) {
      expect(render(beat, 90)).not.toMatch(/domain|difficulty|resurfac/i)
    }
  })

  it('names the weave once a story is kept, and never a count', () => {
    expect(render('idle', 0)).not.toContain('story you kept')
    expect(render('idle', 1)).toContain('story you kept')
    expect(render('idle', 45)).not.toMatch(/\b45\b|forty five/i)
  })
})
