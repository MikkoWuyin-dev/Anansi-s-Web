import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { WorldLayer } from '@/app/WorldLayer'
import { descriptionFor, type Beat } from '@/world/stage'

const SEED = 'client-one:2026-10-18'

function render(beat: Beat = 'idle', days = 0, mode: 'light' | 'dark' = 'dark'): string {
  return renderToStaticMarkup(<WorldLayer beat={beat} days={days} seed={SEED} mode={mode} />)
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
})
