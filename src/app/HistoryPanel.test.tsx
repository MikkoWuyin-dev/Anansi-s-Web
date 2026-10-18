import { createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HistoryPanel } from '@/app/HistoryPanel'
import { historyView, type HistoryFilter, type HistoryView } from '@/app/history'
import { getLibrary } from '@/content/loader'
import { createJourneyStore, createMemoryStorage, type JourneyStore } from '@/state'

const DAY_ONE = '2026-10-17'
const DAY_TWO = '2026-10-18'

const noop = (): void => undefined

function render(
  view: HistoryView,
  options: { open?: boolean; query?: string; filter?: HistoryFilter } = {},
): string {
  return renderToStaticMarkup(
    <HistoryPanel
      open={options.open ?? true}
      view={view}
      query={options.query ?? ''}
      filter={options.filter ?? 'all'}
      headingRef={createRef<HTMLHeadingElement>()}
      onQuery={noop}
      onFilter={noop}
      onClear={noop}
      onClose={noop}
    />,
  )
}

const library = getLibrary()
const learnedTopic = library[0]!
const exploredTopic = library[1]!

function seededStore(): JourneyStore {
  let today = DAY_ONE
  let clock = 1_000

  const store = createJourneyStore({
    storage: createMemoryStorage(),
    today: () => today,
    now: () => (clock += 1_000),
  })

  store.getState().offer(learnedTopic.id)
  store.getState().accept(learnedTopic.id)
  store.getState().setStatus(learnedTopic.id, 'learned')

  today = DAY_TWO
  store.getState().offer(exploredTopic.id)

  return store
}

function viewOf(store: JourneyStore, query = '', filter: HistoryFilter = 'all'): HistoryView {
  return historyView({
    state: store.getState(),
    library,
    query,
    filter,
    today: DAY_TWO,
    locale: 'en-GB',
  })
}

describe('the panel', () => {
  it('stays in the document and is hidden when closed', () => {
    const html = render(viewOf(seededStore()), { open: false })

    expect(html).toContain('id="history-panel"')
    expect(html).toContain('hidden=""')
  })

  it('is a labelled region with a heading and a close control', () => {
    const html = render(viewOf(seededStore()))

    expect(html).toContain('aria-labelledby="history-heading"')
    expect(html).toContain('id="history-heading"')
    expect(html).toContain('Your web')
    expect(html).toContain('>Close<')
  })

  it('lists the days newest first with title and status', () => {
    const html = render(viewOf(seededStore()))

    expect(html.indexOf('Today')).toBeLessThan(html.indexOf('Yesterday'))
    expect(html).toContain(learnedTopic.title)
    expect(html).toContain(exploredTopic.title)
    expect(html).toContain('>Learned<')
    expect(html).toContain('>Explored<')
  })

  it('keeps every topic field except the title out of the text', () => {
    const html = render(viewOf(seededStore()))
    const text = html.replace(/<[^>]+>/g, ' ')

    for (const topic of [learnedTopic, exploredTopic]) {
      expect(text).toContain(topic.title)

      for (const tag of topic.tags) {
        expect(text).not.toContain(tag)
      }

      expect(text).not.toContain(topic.domain)
    }

    expect(text).not.toContain('difficulty')
  })
})

describe('the filters', () => {
  it('shows each filter with its count and marks the active one', () => {
    const html = render(viewOf(seededStore()))
    const learned = render(viewOf(seededStore(), '', 'learned'))

    expect(html).toContain('>All<span class="filters__count">2</span>')
    expect(html).toContain('>Explored<span class="filters__count">1</span>')
    expect(html).toContain('>Learned<span class="filters__count">1</span>')
    expect(html).toContain('aria-pressed="true"')
    expect(learned).not.toContain(exploredTopic.title)
    expect(learned).toContain(learnedTopic.title)
  })
})

describe('search', () => {
  it('renders the query it was given', () => {
    const html = render(viewOf(seededStore()), { query: 'cobra' })

    expect(html).toContain('value="cobra"')
    expect(html).toContain('type="search"')
  })

  it('explains a search with no matches and offers a clear control', () => {
    const html = render(viewOf(seededStore(), 'nothing like this'))

    expect(html).toContain('No stories match that.')
    expect(html).toContain('Clear search and filter')
  })
})

describe('the empty web', () => {
  it('says what will gather here and offers no clear control', () => {
    const empty = historyView({
      state: createJourneyStore({ storage: createMemoryStorage() }).getState(),
      library,
      query: '',
      filter: 'all',
      today: DAY_TWO,
      locale: 'en-GB',
    })
    const html = render(empty)

    expect(html).toContain('Nothing here yet.')
    expect(html).not.toContain('Clear search and filter')
  })
})

describe('the count', () => {
  it('reads from taken days and never speaks of a streak', () => {
    const html = render(viewOf(seededStore()))

    expect(html).toContain('1 / 90')
    expect(html).toContain('1 of 90 days')
    expect(html).not.toMatch(/streak|missed|warning|badge/i)
  })

  it('is absent before the first taken day', () => {
    const store = createJourneyStore({ storage: createMemoryStorage() })
    const html = render(
      historyView({
        state: store.getState(),
        library,
        query: '',
        filter: 'all',
        today: DAY_TWO,
        locale: 'en-GB',
      }),
    )

    expect(html).not.toContain('/ 90')
  })
})
