import { describe, expect, it } from 'vitest'

import { DOMAINS, TAGS, type Difficulty, type Topic } from '@/content/types'
import { offerNextStory } from '@/engine/offer'
import { createRng } from '@/engine/rng'
import { ENGINE_TUNING } from '@/engine/tuning'
import type { DayState, TopicRecord } from '@/engine/types'

const MS_PER_DAY = 86_400_000
const BASE = Date.UTC(2026, 0, 1)

const pad = (value: number): string => String(value).padStart(2, '0')

function dayAt(offset: number): string {
  const date = new Date(BASE + offset * MS_PER_DAY)

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** A 300 topic library with an even spread of domains and difficulty levels. */
function makeLibrary(): Topic[] {
  return Array.from({ length: 300 }, (_, index) => {
    const first = TAGS[index % TAGS.length] as string
    const second = TAGS[(index * 7 + 5) % TAGS.length] as string

    return {
      id: `topic-${index}`,
      title: `Topic ${index}`,
      domain: DOMAINS[index % DOMAINS.length] as Topic['domain'],
      difficulty: ((index % 3) + 1) as Difficulty,
      tags: (first === second ? [first] : [first, second]) as Topic['tags'],
      resurfacing: index % 5 === 0,
      added: '2025-01-01',
    }
  })
}

interface Shown {
  readonly topicId: string
  readonly domain: string
  readonly difficulty: Difficulty
  readonly because: string
  readonly day: number
}

interface Run {
  readonly shown: Shown[]
  readonly daysWithReturn: number
  readonly returnDays: number[]
}

const runs = new Map<string, Run>()

/**
 * A year of the ritual: three offers a day, each call given a fresh stream
 * seeded from the client and the day key, exactly as the state layer must
 * (MCD D5, spec 0001). Runs are shared between tests, since each one is a full
 * simulation.
 */
function simulate(seed: string, days: number): Run {
  const cached = runs.get(`${seed}:${days}`)

  if (cached !== undefined) {
    return cached
  }

  const run = runSimulation(seed, days)

  runs.set(`${seed}:${days}`, run)

  return run
}

function runSimulation(seed: string, days: number): Run {
  const library = makeLibrary()
  const history: TopicRecord[] = []
  const shown: Shown[] = []
  const returnDays: number[] = []
  let daysWithReturn = 0

  for (let day = 0; day < days; day += 1) {
    const dayKey = dayAt(day)
    const state: DayState = { dayKey, offeredTopicIds: [], acceptedTopicId: null }
    let returned = false

    for (let offer = 0; offer < ENGINE_TUNING.storiesPerDay; offer += 1) {
      const result = offerNextStory({
        library,
        history,
        day: state,
        rng: createRng(`${seed}:${dayKey}`),
      })

      if (result.kind !== 'story') {
        break
      }

      state.offeredTopicIds.push(result.topic.id)
      shown.push({
        topicId: result.topic.id,
        domain: result.topic.domain,
        difficulty: result.topic.difficulty,
        because: result.because,
        day,
      })

      if (result.because === 'resurfaced') {
        returnDays.push(day)
        returned = true
      }

      history.push({
        topicId: result.topic.id,
        dayKey,
        presentedAt: day * 1000 + offer,
        accepted: offer === 0,
        status: 'explored',
      })
    }

    if (returned) {
      daysWithReturn += 1
    }
  }

  return { shown, daysWithReturn, returnDays }
}

const SEEDS = ['client-a', 'client-b', 'client-c']

describe('the engine over a long sequence', () => {
  it('never offers three stories in a row from one domain', () => {
    for (const seed of SEEDS) {
      const { shown } = simulate(seed, 100)

      for (let index = 2; index < shown.length; index += 1) {
        const window = shown.slice(index - 2, index + 1).map((entry) => entry.domain)

        expect(window[0] === window[1] && window[1] === window[2]).toBe(false)
      }
    }
  })

  it('does not settle into a rotation of period three or four', () => {
    for (const seed of SEEDS) {
      const domains = simulate(seed, 100).shown.map((entry) => entry.domain)

      for (let start = 0; start + 40 <= domains.length; start += 1) {
        for (const period of [3, 4]) {
          let matches = 0

          for (let index = start + period; index < start + 40; index += 1) {
            if (domains[index] === domains[index - period]) {
              matches += 1
            }
          }

          expect(matches / (40 - period)).toBeLessThan(0.5)
        }
      }
    }
  })

  it('keeps each difficulty level between a quarter and 42 percent of offers', () => {
    for (const seed of SEEDS) {
      const { shown } = simulate(seed, 100)
      const counts = new Map<Difficulty, number>()

      for (const entry of shown) {
        counts.set(entry.difficulty, (counts.get(entry.difficulty) ?? 0) + 1)
      }

      for (const level of [1, 2, 3] as const) {
        const share = (counts.get(level) ?? 0) / shown.length

        expect(share).toBeGreaterThanOrEqual(0.25)
        expect(share).toBeLessThanOrEqual(0.42)
      }
    }
  })

  // A year of three offers a day over 300 topics is the heaviest simulation
  // here, and the first test to ask for it pays for it. The timeout is the
  // simulation's, not the assertion's: Vitest 5's five second default is a
  // tool setting, and this run sits close enough to it to flake.
  it(
    'brings a story back on between 8 and 20 percent of days',
    () => {
      for (const seed of SEEDS) {
        const { daysWithReturn } = simulate(seed, 365)
        const share = daysWithReturn / 365

        expect(share).toBeGreaterThanOrEqual(0.08)
        expect(share).toBeLessThanOrEqual(0.2)
      }
    },
    20_000,
  )

  it(
    'allows no return until a topic is 60 days old',
    () => {
      for (const seed of SEEDS) {
        const { returnDays } = simulate(seed, 365)

        for (const day of returnDays) {
          // The first legal return is sixty days after the first presentation.
          expect(day).toBeGreaterThanOrEqual(ENGINE_TUNING.resurfaceAbsenceDays)
        }
      }
    },
    20_000,
  )

  it('returns only flagged topics, long after they were last shown', () => {
    const library = makeLibrary()
    const flagged = new Set(library.filter((entry) => entry.resurfacing).map((entry) => entry.id))
    const { shown } = simulate('client-a', 365)
    const lastShown = new Map<string, number>()

    for (const entry of shown) {
      if (entry.because === 'resurfaced') {
        expect(flagged.has(entry.topicId)).toBe(true)

        const gap = entry.day - (lastShown.get(entry.topicId) ?? entry.day)
        expect(gap).toBeGreaterThanOrEqual(ENGINE_TUNING.resurfaceAbsenceDays)
      }

      lastShown.set(entry.topicId, entry.day)
    }
  })
})
