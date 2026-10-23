import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Ritual } from '@/app/RitualScreen'
import { announcementOf, type RitualView } from '@/app/ritual'
import { getLibrary } from '@/content/loader'
import type { Topic } from '@/content/types'

const noop = (): void => undefined

function render(view: RitualView, persistent = true): string {
  return renderToStaticMarkup(
    <Ritual
      view={view}
      persistent={persistent}
      announcement={announcementOf(view)}
      onFind={noop}
      onReroll={noop}
      onTake={noop}
      onMarkLearned={noop}
      onRetry={noop}
    />,
  )
}

const topic: Topic = {
  id: 'the-cobra-effect',
  title: 'The Cobra Effect',
  domain: 'psychology',
  difficulty: 2,
  tags: ['counterintuitive', 'fascinating'],
  resurfacing: false,
  added: '2026-01-01',
}

function storyView(overrides: Partial<Extract<RitualView, { kind: 'story' }>> = {}): RitualView {
  return {
    kind: 'story',
    topic,
    because: 'new',
    offerNumber: 1,
    dayStory: false,
    taken: false,
    learned: false,
    canReroll: true,
    sealed: false,
    count: null,
    ...overrides,
  }
}

describe('the reveal', () => {
  it('shows the title and nothing about the topic', () => {
    const html = render(storyView())

    expect(html).toContain('The Cobra Effect')
    expect(html).not.toContain('psychology')
    expect(html).not.toContain('counterintuitive')
    expect(html).not.toContain('fascinating')
    expect(html).not.toContain('difficulty')
  })

  it('keeps every topic field except the title out of the markup', () => {
    for (const libraryTopic of getLibrary()) {
      const html = render(storyView({ topic: libraryTopic }))

      expect(html).toContain(libraryTopic.title)

      for (const tag of libraryTopic.tags) {
        expect(html).not.toContain(tag)
      }

      expect(html).not.toContain(libraryTopic.domain)
      expect(html).not.toContain(`>${libraryTopic.difficulty}<`)
    }
  })

  it('announces the reveal in the one live region', () => {
    const html = render(storyView())

    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('The Cobra Effect')
  })

  it('offers the take and the reroll on the first story', () => {
    const html = render(storyView())

    expect(html).toContain("I&#x27;ll take this")
    expect(html).toContain('Send Anansi back')
    expect(html).not.toContain("today&#x27;s story")
  })
})

describe('the heading outline', () => {
  it('gives every state exactly one top level heading', () => {
    const views: RitualView[] = [
      { kind: 'hero', newDay: false },
      { kind: 'searching' },
      { kind: 'empty' },
      { kind: 'failed', message: 'The search failed.' },
      { kind: 'missing', message: 'That story is no longer in the web.' },
      storyView(),
    ]

    for (const view of views) {
      const html = render(view)

      expect({ kind: view.kind, h1: html.split('<h1').length - 1 }).toEqual({ kind: view.kind, h1: 1 })
    }
  })

  it('makes the story itself the page heading once it is revealed', () => {
    const html = render(storyView())

    expect(html).toContain('<h1 class="story__title"')
    expect(html).not.toContain('<h2 class="story__title"')
  })
})

describe('the day story', () => {
  it('removes the reroll and says why', () => {
    const html = render(storyView({ offerNumber: 3, dayStory: true, canReroll: false, sealed: true }))

    expect(html).not.toContain('Send Anansi back')
    expect(html).toContain('This is today&#x27;s story. It stays until midnight.')
  })
})

describe('taking and learning', () => {
  it('keeps the title, marks the day, and offers the learned mark', () => {
    const html = render(storyView({ taken: true, canReroll: false, sealed: true }))

    expect(html).toContain('The Cobra Effect')
    expect(html).toContain('I understood it')
    expect(html).toContain('A new one arrives after midnight.')
    expect(html).not.toContain('Send Anansi back')
    expect(html).not.toContain("I&#x27;ll take this")
  })

  it('shows the learned state once marked', () => {
    const html = render(storyView({ taken: true, learned: true, canReroll: false, sealed: true }))

    expect(html).toContain('Learned. You can tell it now.')
    expect(html).not.toContain('I understood it')
  })

  it('shows the quiet count on the taken story and nowhere else', () => {
    const count = { days: 1, label: '1 / 90', spoken: '1 of 90 days' }
    const taken = render(storyView({ taken: true, canReroll: false, sealed: true, count }))
    const offered = render(storyView({ count }))

    expect(taken).toContain('1 / 90')
    expect(taken).toContain('1 of 90 days')
    expect(taken).not.toMatch(/streak/i)
    expect(offered).not.toContain('1 / 90')
  })
})

describe('resurfacing', () => {
  it('gives a returning story its line and its lavender cue', () => {
    const html = render(storyView({ because: 'resurfaced' }))

    expect(html).toContain('Anansi has brought this one back.')
    expect(html).toContain('strand--return')
    expect(announcementOf(storyView({ because: 'resurfaced' }))).toContain(
      'Anansi has brought this one back.',
    )
  })

  it('leaves a new story without either', () => {
    const html = render(storyView())

    expect(html).not.toContain('Anansi has brought this one back.')
    expect(html).not.toContain('strand--return')
  })
})

describe('honest states', () => {
  it('shows the hero with one action', () => {
    const html = render({ kind: 'hero', newDay: false })

    expect(html).toContain('Find me a story')
    expect(html).toContain('What story do you want to tell today?')
  })

  it('shows the searching state without a blank screen', () => {
    const html = render({ kind: 'searching' })

    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('searching__strand')
    expect(announcementOf({ kind: 'searching' })).toBe('Anansi is searching the web.')
  })

  it('explains an empty web', () => {
    const html = render({ kind: 'empty' })

    expect(html).toContain('The web is empty.')
    expect(html).toContain('Check back')
  })

  it('explains a failed search and offers Try again', () => {
    const html = render({ kind: 'failed', message: 'The search failed.' })

    expect(html).toContain('Anansi lost the thread.')
    expect(html).toContain('The search failed.')
    expect(html).toContain('Try again')
  })

  it('explains a story that has left the web', () => {
    const html = render({ kind: 'missing', message: 'That story is no longer in the web.' })

    expect(html).toContain('That story has left the web.')
  })

  it('says when the browser is not keeping the journey', () => {
    expect(render(storyView(), false)).toContain('not keeping your journey')
    expect(render(storyView())).not.toContain('not keeping your journey')
  })
})
