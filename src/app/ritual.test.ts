import { describe, expect, it } from 'vitest'

import {
  announcementOf,
  beatFor,
  checkDay,
  findStory,
  INITIAL_UI,
  learnStory,
  MISSING_STORY_MESSAGE,
  NAMED_LINE,
  ritualView,
  SEARCH_FAILED_MESSAGE,
  takeStory,
  type RitualUi,
} from '@/app/ritual'
import type { Topic } from '@/content/types'
import { offerNextStory } from '@/engine/offer'
import {
  createJourneyStore,
  createMemoryStorage,
  dayRng,
  daysCompleted,
  STORAGE_KEYS,
  STORE_VERSION,
  type JourneyStore,
} from '@/state'

const DAY = '2026-10-17'

function makeTopic(id: string, overrides: Partial<Topic> = {}): Topic {
  return {
    id,
    title: `The ${id}`,
    domain: 'science',
    difficulty: 2,
    tags: ['fascinating'],
    resurfacing: true,
    added: '2026-01-01',
    ...overrides,
  }
}

const immediateWait = async (): Promise<void> => undefined

function makeStore(options: { readonly clientId?: string } = {}): {
  store: JourneyStore
  storage: ReturnType<typeof createMemoryStorage>
} {
  const storage = createMemoryStorage([
    [
      STORAGE_KEYS.identity,
      JSON.stringify({ version: STORE_VERSION, clientId: options.clientId ?? 'client-one' }),
    ],
  ])

  const store = createJourneyStore({
    storage,
    today: () => DAY,
    now: () => 1_700_000_000_000,
  })

  return { store, storage }
}

const ui: RitualUi = INITIAL_UI

function viewOf(store: JourneyStore, library: readonly Topic[], state: RitualUi = ui) {
  return ritualView({ state: store.getState(), library, ui: state, newDay: false })
}

describe('findStory', () => {
  it('records the story as explored before it is shown', async () => {
    const { store } = makeStore()
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three')]

    const outcome = await findStory({ store, library, wait: immediateWait })

    expect(outcome).toEqual({ ok: true, kind: 'story' })
    expect(store.getState().day.offeredTopicIds).toHaveLength(1)
    expect(store.getState().history).toHaveLength(1)
    expect(store.getState().history[0]?.status).toBe('explored')
  })

  it('draws the same story for the same client and day', async () => {
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three'), makeTopic('four')]
    const first = makeStore({ clientId: 'same-client' }).store
    const second = makeStore({ clientId: 'same-client' }).store

    await findStory({ store: first, library, wait: immediateWait })
    await findStory({ store: second, library, wait: immediateWait })

    expect(first.getState().day.offeredTopicIds).toEqual(
      second.getState().day.offeredTopicIds,
    )
  })

  it('skips the pause under reduced motion', async () => {
    const { store } = makeStore()
    let pauses = 0

    const outcome = await findStory({
      store,
      library: [makeTopic('one')],
      wait: async () => {
        pauses += 1
      },
      reducedMotion: () => true,
    })

    expect(outcome.ok).toBe(true)
    expect(pauses).toBe(0)
  })

  it('decides and records before the search choreography finishes', async () => {
    const { store } = makeStore()
    let offeredDuringWait = false

    await findStory({
      store,
      library: [makeTopic('one')],
      wait: async () => {
        offeredDuringWait = store.getState().day.offeredTopicIds.length === 1
      },
    })

    expect(offeredDuringWait).toBe(true)
  })

  it('reports a thrown search without recording anything', async () => {
    const { store } = makeStore()

    const outcome = await findStory({
      store,
      library: [makeTopic('one')],
      wait: immediateWait,
      offer: () => {
        throw new Error('engine failure')
      },
    })

    expect(outcome).toEqual({ ok: false, message: SEARCH_FAILED_MESSAGE })
    expect(store.getState().day.offeredTopicIds).toHaveLength(0)
    expect(store.getState().history).toHaveLength(0)
  })

  it('stops at three offers and refuses a fourth', async () => {
    const { store } = makeStore()
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three'), makeTopic('four')]

    await findStory({ store, library, wait: immediateWait })
    await findStory({ store, library, wait: immediateWait })
    await findStory({ store, library, wait: immediateWait })
    const fourth = await findStory({ store, library, wait: immediateWait })

    const offers = store.getState().day.offeredTopicIds

    expect(offers).toHaveLength(3)
    expect(new Set(offers).size).toBe(3)
    expect(fourth).toEqual({ ok: true, kind: 'none', reason: 'day-complete' })
  })

  it('seals a one topic pool when a reroll has no candidate', async () => {
    const { store } = makeStore()
    const library = [makeTopic('only')]

    await findStory({ store, library, wait: immediateWait })
    const reroll = await findStory({ store, library, wait: immediateWait })
    const view = viewOf(store, library, { phase: 'ready', failure: null, sealed: true })

    expect(reroll).toEqual({ ok: true, kind: 'none', reason: 'no-candidate' })
    expect(view.kind).toBe('story')

    if (view.kind !== 'story') {
      return
    }

    expect(view.sealed).toBe(true)
    expect(view.canReroll).toBe(false)
  })

  it('returns the empty library reason', async () => {
    const { store } = makeStore()

    expect(await findStory({ store, library: [], wait: immediateWait })).toEqual({
      ok: true,
      kind: 'none',
      reason: 'empty-library',
    })
  })
})

describe('ritualView', () => {
  it('shows the day story with the reroll closed at three offers', async () => {
    const { store } = makeStore()
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three'), makeTopic('four')]

    await findStory({ store, library, wait: immediateWait })
    await findStory({ store, library, wait: immediateWait })
    await findStory({ store, library, wait: immediateWait })

    const view = viewOf(store, library)

    expect(view.kind).toBe('story')

    if (view.kind !== 'story') {
      return
    }

    expect(view.offerNumber).toBe(3)
    expect(view.dayStory).toBe(true)
    expect(view.canReroll).toBe(false)
  })

  it('keeps the reason the engine gave, including after a reload', async () => {
    const { store, storage } = makeStore()
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three')]

    await findStory({ store, library, wait: immediateWait })
    await findStory({ store, library, wait: immediateWait })

    const live = viewOf(store, library)
    const reloaded = createJourneyStore({ storage, today: () => DAY, now: () => 1 })
    const restored = viewOf(reloaded, library)

    expect(live.kind).toBe('story')
    expect(restored.kind).toBe('story')

    if (live.kind !== 'story' || restored.kind !== 'story') {
      return
    }

    expect(restored.topic.id).toBe(live.topic.id)
    expect(restored.because).toBe(live.because)
    expect(restored.offerNumber).toBe(2)

    // The reason equals what the engine says for the day just before the offer.
    const replay = offerNextStory({
      library,
      history: store.getState().history,
      day: { ...store.getState().day, offeredTopicIds: store.getState().day.offeredTopicIds.slice(0, 1) },
      rng: dayRng('client-one', DAY),
    })

    expect(replay.kind).toBe('story')

    if (replay.kind !== 'story') {
      return
    }

    expect(live.because).toBe(replay.because)
  })

  it('reports a stored offer whose topic has left the library', () => {
    const { store } = makeStore()

    store.getState().offer('gone')

    expect(viewOf(store, []).kind).toBe('empty')
    expect(viewOf(store, [makeTopic('one')])).toEqual({
      kind: 'missing',
      message: MISSING_STORY_MESSAGE,
    })
  })

  it('shows the hero when the day holds no offer', () => {
    const { store } = makeStore()

    expect(viewOf(store, [makeTopic('one')])).toEqual({ kind: 'hero', newDay: false })
  })

  it('shows the failure it was handed', () => {
    const { store } = makeStore()

    expect(
      viewOf(store, [makeTopic('one')], {
        phase: 'failed',
        failure: SEARCH_FAILED_MESSAGE,
        sealed: false,
      }),
    ).toEqual({ kind: 'failed', message: SEARCH_FAILED_MESSAGE })
  })
})

describe('taking and learning', () => {
  it('accepts once, counts the day once, and closes the ruling', async () => {
    const { store } = makeStore()
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three')]

    await findStory({ store, library, wait: immediateWait })

    const view = viewOf(store, library)

    if (view.kind !== 'story') {
      throw new Error('expected a story')
    }

    takeStory(store, view.topic.id)
    takeStory(store, view.topic.id)

    const taken = viewOf(store, library)

    expect(daysCompleted(store.getState().progress)).toBe(1)
    expect(store.getState().day.acceptedTopicId).toBe(view.topic.id)
    expect(taken.kind).toBe('story')

    if (taken.kind !== 'story') {
      return
    }

    expect(taken.taken).toBe(true)
    expect(taken.canReroll).toBe(false)
    expect(taken.sealed).toBe(true)
    expect(store.getState().history.filter((record) => record.accepted)).toHaveLength(1)
  })

  it('persists learned across a reload', async () => {
    const { store, storage } = makeStore()
    const library = [makeTopic('one'), makeTopic('two')]

    await findStory({ store, library, wait: immediateWait })
    const view = viewOf(store, library)

    if (view.kind !== 'story') {
      throw new Error('expected a story')
    }

    takeStory(store, view.topic.id)
    learnStory(store, view.topic.id)

    const reloaded = createJourneyStore({ storage, today: () => DAY, now: () => 2 })
    const restored = viewOf(reloaded, library)

    expect(restored.kind).toBe('story')

    if (restored.kind !== 'story') {
      return
    }

    expect(restored.learned).toBe(true)
    expect(restored.taken).toBe(true)
  })
})

describe('checkDay', () => {
  it('starts a new day after local midnight and keeps yesterday in history', async () => {
    let day = DAY
    const storage = createMemoryStorage([
      [
        STORAGE_KEYS.identity,
        JSON.stringify({ version: STORE_VERSION, clientId: 'client-one' }),
      ],
    ])
    const store = createJourneyStore({ storage, today: () => day, now: () => 1 })

    await findStory({ store, library: [makeTopic('one'), makeTopic('two')], wait: immediateWait })

    expect(checkDay(store)).toBe(false)

    day = '2026-10-18'

    expect(checkDay(store)).toBe(true)
    expect(store.getState().day.offeredTopicIds).toHaveLength(0)
    expect(store.getState().history).toHaveLength(1)
  })
})

describe('announcementOf', () => {
  it('names the story, the return, and the day story', async () => {
    const { store } = makeStore()
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three'), makeTopic('four')]

    await findStory({ store, library, wait: immediateWait })
    await findStory({ store, library, wait: immediateWait })
    await findStory({ store, library, wait: immediateWait })

    const view = viewOf(store, library)

    if (view.kind !== 'story') {
      throw new Error('expected a story')
    }

    const spoken = announcementOf(view)

    expect(spoken).toContain(view.topic.title)
    expect(spoken).toContain("This is today's story")
  })

  it('says so when the word answers, and nothing about the story', () => {
    const { store } = makeStore()
    const view = viewOf(store, [makeTopic('one')])

    expect(announcementOf(view, true)).toBe(NAMED_LINE)
    expect(announcementOf(view, true)).not.toMatch(/one/)
  })
})

describe('beatFor', () => {
  it('asks the stage for the beat the ritual is already in', async () => {
    const { store } = makeStore()
    const library = [makeTopic('one'), makeTopic('two'), makeTopic('three')]

    expect(beatFor(viewOf(store, library))).toBe('idle')

    await findStory({ store, library, wait: immediateWait })

    const offered = viewOf(store, library)

    if (offered.kind !== 'story') {
      throw new Error('expected a story')
    }

    expect(beatFor(offered)).toBe('revealing')

    takeStory(store, offered.topic.id)

    const taken = viewOf(store, library)

    if (taken.kind !== 'story') {
      throw new Error('expected a story')
    }

    expect(beatFor(taken)).toBe('resting')
    expect(beatFor(taken, true)).toBe('celebrating')
  })

  it('asks for the search while a search runs', () => {
    const { store } = makeStore()
    const searching = ritualView({
      state: store.getState(),
      library: [makeTopic('one')],
      ui: { phase: 'searching', failure: null, sealed: false },
      newDay: false,
    })

    expect(beatFor(searching)).toBe('searching')
  })

  it('answers the word with its own beat, but never during a search', () => {
    const { store } = makeStore()
    const library = [makeTopic('one')]

    expect(beatFor(viewOf(store, library), false, true)).toBe('naming')

    const searching = ritualView({
      state: store.getState(),
      library,
      ui: { phase: 'searching', failure: null, sealed: false },
      newDay: false,
    })

    expect(beatFor(searching, false, true)).toBe('searching')
  })
})
