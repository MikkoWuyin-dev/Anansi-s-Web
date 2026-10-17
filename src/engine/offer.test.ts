import { describe, expect, it } from 'vitest'

import type { Difficulty, Domain, Tag, Topic } from '@/content/types'
import { offerNextStory } from '@/engine/offer'
import { createRng } from '@/engine/rng'
import type { DayState, Offer, TopicRecord } from '@/engine/types'

const MS_PER_DAY = 86_400_000
const BASE = Date.UTC(2026, 0, 1)

const pad = (value: number): string => String(value).padStart(2, '0')

/** The day key `offset` days after the fixtures' base day, 2026-01-01. */
function dayAt(offset: number): string {
  const date = new Date(BASE + offset * MS_PER_DAY)

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

interface TopicInput {
  readonly id: string
  readonly domain?: Domain
  readonly difficulty?: Difficulty
  readonly tags?: Tag[]
  readonly resurfacing?: boolean
}

function topic({
  id,
  domain = 'science',
  difficulty = 1,
  tags = ['fascinating'],
  resurfacing = false,
}: TopicInput): Topic {
  return {
    id,
    title: id,
    domain,
    difficulty,
    tags,
    resurfacing,
    added: '2025-06-01',
  }
}

function record(topicId: string, offset: number, accepted = false): TopicRecord {
  return {
    topicId,
    dayKey: dayAt(offset),
    presentedAt: BASE + offset * MS_PER_DAY,
    accepted,
    status: 'explored',
  }
}

function dayState(offset: number, offered: string[] = []): DayState {
  return { dayKey: dayAt(offset), offeredTopicIds: offered, acceptedTopicId: null }
}

const story = (offer: Offer): { id: string; because: string } => {
  if (offer.kind !== 'story') {
    throw new Error(`expected a story, got ${offer.reason}`)
  }

  return { id: offer.topic.id, because: offer.because }
}

/** A stream that fails loudly if the engine draws before a rule can use it. */
const noDraw = (): number => {
  throw new Error('the random source should not be read')
}

describe('offerNextStory, the day and the pool', () => {
  it('returns day-complete once three stories are recorded, without drawing', () => {
    const library = [topic({ id: 'a' }), topic({ id: 'b' })]

    expect(
      offerNextStory({
        library,
        history: [],
        day: dayState(0, ['a', 'b', 'a']),
        rng: noDraw,
      }),
    ).toEqual({ kind: 'none', reason: 'day-complete' })
  })

  it('returns empty-library without throwing or drawing', () => {
    expect(
      offerNextStory({ library: [], history: [], day: dayState(0), rng: noDraw }),
    ).toEqual({ kind: 'none', reason: 'empty-library' })
  })

  it('returns no-candidate when every topic is already offered today', () => {
    const library = [topic({ id: 'a' }), topic({ id: 'b' })]

    expect(
      offerNextStory({
        library,
        history: [],
        day: dayState(0, ['a', 'b']),
        rng: noDraw,
      }),
    ).toEqual({ kind: 'none', reason: 'no-candidate' })
  })
})

describe('offerNextStory, determinism and purity', () => {
  const library = [
    topic({ id: 'a', domain: 'science' }),
    topic({ id: 'b', domain: 'history' }),
    topic({ id: 'c', domain: 'food' }),
    topic({ id: 'd', domain: 'space' }),
    topic({ id: 'e', domain: 'design' }),
  ]

  it('returns deeply equal offers for equal input', () => {
    // The stream is rebuilt per call, as the contract requires: reusing one
    // stream would consume different values on the second call.
    const once = (): Offer =>
      offerNextStory({
        library,
        history: [],
        day: dayState(0),
        rng: createRng('client:2026-01-01'),
      })

    expect(once()).toEqual(once())
  })

  it('returns the library object by identity and never mutates its input', () => {
    const history = [record('b', -4)]
    const day = dayState(0)
    const input = {
      library,
      history,
      day,
      rng: createRng('client:2026-01-01'),
    }
    const before = JSON.stringify({ library, history, day })

    const offer = offerNextStory(input)

    expect(JSON.stringify({ library, history, day })).toBe(before)

    if (offer.kind !== 'story') {
      throw new Error(`expected a story, got ${offer.reason}`)
    }

    expect(library.some((entry) => entry === offer.topic)).toBe(true)
  })

  it('offers a different story under a different seed', () => {
    const seeds = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
    const picked = seeds.map(
      (seed) =>
        story(
          offerNextStory({
            library,
            history: [],
            day: dayState(0),
            rng: createRng(`${seed}:2026-01-01`),
          }),
        ).id,
    )

    expect(new Set(picked).size).toBeGreaterThan(1)
  })

  it('offers a different story under a different day key', () => {
    const days = [0, 1, 2, 3, 4]
    const picked = days.map(
      (offset) =>
        story(
          offerNextStory({
            library,
            history: [],
            day: dayState(offset),
            rng: createRng(`client:${dayAt(offset)}`),
          }),
        ).id,
    )

    expect(new Set(picked).size).toBeGreaterThan(1)
  })

  it('rebuilds the identical next offer from stored day state', () => {
    const seed = 'client:2026-01-01'
    const first = offerNextStory({
      library,
      history: [],
      day: dayState(0),
      rng: createRng(seed),
    })
    const recorded = { ...dayState(0), offeredTopicIds: [story(first).id] }

    const rebuilt = offerNextStory({
      library,
      history: [],
      day: recorded,
      rng: createRng(seed),
    })
    const again = offerNextStory({
      library,
      history: [record(story(first).id, 0)],
      day: recorded,
      rng: createRng(seed),
    })

    expect(again).toEqual(rebuilt)
  })

  it('draws at most twice per call', () => {
    for (const offered of [[], ['a'], ['a', 'b']]) {
      let drawn = 0
      const counting = (): number => {
        drawn += 1

        return 0.5
      }

      offerNextStory({
        library,
        history: [],
        day: dayState(0, offered),
        rng: counting,
      })

      expect(drawn).toBeLessThanOrEqual(2)
    }
  })
})

describe('offerNextStory, the exclusion window', () => {
  it('never offers a topic shown inside the 30 day window', () => {
    const library = Array.from({ length: 12 }, (_, index) =>
      topic({ id: `topic-${index}` }),
    )
    const history = library.map((entry, index) => record(entry.id, -1 - index))

    for (let seed = 0; seed < 60; seed += 1) {
      const offer = story(
        offerNextStory({
          library,
          history: history.slice(0, 11),
          day: dayState(0),
          rng: createRng(`seed-${seed}`),
        }),
      )

      // Only the twelfth topic has rested 30 days.
      expect(offer.id).toBe('topic-11')
    }
  })

  it('treats day 29 as inside the window and day 30 as outside', () => {
    const inside = topic({ id: 'inside' })
    const boundary = topic({ id: 'boundary' })
    const library = [inside, boundary]

    for (let seed = 0; seed < 20; seed += 1) {
      const offer = story(
        offerNextStory({
          library,
          history: [record('inside', -29), record('boundary', -30)],
          day: dayState(0),
          rng: createRng(`seed-${seed}`),
        }),
      )

      expect(offer.id).toBe('boundary')
      expect(offer.because).toBe('new')
    }
  })

  it('never repeats a topic already offered today', () => {
    const library = Array.from({ length: 8 }, (_, index) =>
      topic({ id: `topic-${index}` }),
    )
    const offered: string[] = []

    for (let offer = 0; offer < 3; offer += 1) {
      const result = story(
        offerNextStory({
          library,
          history: [],
          day: dayState(0, offered),
          rng: createRng(`client:${offer}`),
        }),
      )

      expect(offered).not.toContain(result.id)
      offered.push(result.id)
    }
  })
})

describe('offerNextStory, the thin pool', () => {
  it('offers the least recently presented topic and says why', () => {
    const library = ['a', 'b', 'c', 'd', 'e'].map((id) => topic({ id }))
    const history = [
      record('a', -2),
      record('b', -12),
      record('c', -5),
      record('d', -20),
      record('e', -9),
    ]

    const offer = story(
      offerNextStory({
        library,
        history,
        day: dayState(0),
        rng: () => 0.99,
      }),
    )

    expect(offer.id).toBe('d')
    expect(offer.because).toBe('thin-pool')
  })

  it('prefers the thin pool over a return when nothing is outside the window', () => {
    // A return is only possible after 60 days, which is outside the window by
    // definition, so the thin pool is the branch that reports a repeat.
    const library = [topic({ id: 'a' }), topic({ id: 'b' })]
    const history = [record('a', -3), record('b', -4)]

    const offer = story(
      offerNextStory({
        library,
        history,
        day: dayState(0),
        rng: () => 0,
      }),
    )

    expect(offer.because).toBe('thin-pool')
    expect(['a', 'b']).toContain(offer.id)
  })
})

describe('offerNextStory, the return rule', () => {
  const base = [
    topic({ id: 'fresh-a', domain: 'food' }),
    topic({ id: 'fresh-b', domain: 'space' }),
  ]

  it('brings back a flagged topic after a 60 day absence when the roll lands', () => {
    const returning = topic({ id: 'returning', domain: 'history', resurfacing: true })
    const offer = story(
      offerNextStory({
        library: [...base, returning],
        history: [record('returning', -60)],
        day: dayState(0),
        rng: () => 0,
      }),
    )

    expect(offer).toEqual({ id: 'returning', because: 'resurfaced' })
  })

  it('does not bring it back one day early', () => {
    const returning = topic({ id: 'returning', domain: 'history', resurfacing: true })

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const offer = story(
        offerNextStory({
          library: [...base, returning],
          history: [record('returning', -59)],
          day: dayState(0),
          rng: () => 0,
        }),
      )

      expect(offer.because).toBe('new')
      expect(offer.id).not.toBe('returning')
    }
  })

  it('never brings back an unflagged topic, however long it has rested', () => {
    const plain = topic({ id: 'plain', domain: 'history', resurfacing: false })
    const offer = story(
      offerNextStory({
        library: [...base, plain],
        history: [record('plain', -200)],
        day: dayState(0),
        rng: () => 0,
      }),
    )

    expect(offer.because).toBe('new')
  })

  it('offers a new story when the roll does not land', () => {
    const returning = topic({ id: 'returning', domain: 'history', resurfacing: true })
    const offer = story(
      offerNextStory({
        library: [...base, returning],
        history: [record('returning', -150)],
        day: dayState(0),
        rng: () => 0.99,
      }),
    )

    expect(offer.because).toBe('new')
  })
})

describe('offerNextStory, ranking', () => {
  it('prefers the candidate whose domain was least recently offered', () => {
    // Two candidates alike in everything but their domain: one domain was shown
    // two days ago, the other has never been shown. Domain recency is 0.6 of
    // the score, so the gap is decisive and the draw is not consulted.
    const old = topic({
      id: 'old',
      domain: 'science',
      tags: ['fascinating', 'obscure'],
    })
    const near = topic({
      id: 'near',
      domain: 'history',
      tags: ['fascinating', 'obscure'],
    })
    const recentlyShown = topic({
      id: 'recently-shown',
      domain: 'history',
      tags: ['fascinating', 'obscure'],
    })
    const library = [old, near, recentlyShown]
    const history = [record('recently-shown', -2)]

    for (let seed = 0; seed < 200; seed += 1) {
      const offer = story(
        offerNextStory({
          library,
          history,
          day: dayState(0),
          rng: createRng(`seed-${seed}`),
        }),
      )

      expect(offer.id).toBe('old')
    }
  })

  it('favours the difficulty level holding less of the recent window', () => {
    const library = [
      topic({ id: 'easy', difficulty: 1, tags: ['fascinating'] }),
      topic({ id: 'middle', difficulty: 2, tags: ['fascinating'] }),
      topic({ id: 'hard', difficulty: 3, tags: ['fascinating'] }),
    ]
    const filler = Array.from({ length: 12 }, (_, index) =>
      topic({
        id: `filler-${index}`,
        difficulty: 1,
        domain: 'science',
        tags: ['fascinating'],
      }),
    )
    // The window is full of level 1 stories, so level 1 is over represented.
    const history = filler.map((entry, index) => record(entry.id, -1 - index))

    const picked = new Set<string>()

    for (let seed = 0; seed < 60; seed += 1) {
      picked.add(
        story(
          offerNextStory({
            library: [...library, ...filler],
            history,
            day: dayState(0),
            rng: createRng(`seed-${seed}`),
          }),
        ).id,
      )
    }

    // Level 1 has filled the window, so its multiplier is at the floor.
    expect(picked.has('easy')).toBe(false)
  })
})
