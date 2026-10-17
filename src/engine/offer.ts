/**
 * The selection engine (spec 0001): one pure function that offers the day's next
 * story, and says why it chose it.
 *
 * It reads only what the caller hands it — the library, the history, today's
 * state and a seeded random source — and it never mutates any of them. The
 * reasoning behind a choice is invisible to the person using the ritual (PRD
 * §17); only the reason, `because`, travels with the offer, so the interface can
 * be honest about a return or a repeat (PRD §18).
 *
 * Pure by contract: no clock, no DOM, no React, no storage (MCD §5).
 */

import type { Difficulty, Domain, Tag, Topic } from '@/content/types'
import { ENGINE_TUNING } from '@/engine/tuning'
import type { Offer, SelectionInput, TopicRecord } from '@/engine/types'

const { exclusionWindowDays, resurfaceAbsenceDays, spreadWindow } = ENGINE_TUNING

const MS_PER_DAY = 86_400_000

/**
 * A day key as a day number. UTC midnight is used only to measure a distance
 * between two supplied day keys; the engine never asks what day it is.
 */
function dayNumber(dayKey: string): number {
  const year = Number(dayKey.slice(0, 4))
  const month = Number(dayKey.slice(5, 7))
  const day = Number(dayKey.slice(8, 10))

  return Date.UTC(year, month - 1, day) / MS_PER_DAY
}

/** Whole days from one day key to another. */
function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from)
}

/** One story shown, with enough context to order the sequence. */
interface Presentation {
  readonly topic: Topic
  readonly dayKey: string
  readonly sequence: number
}

/**
 * The presentation sequence: history before today, then today's offers.
 *
 * Today's history records are deliberately dropped in favour of the day state,
 * which is authoritative for the day and cannot double count an offer the state
 * layer has already logged (spec 0001, the day's memory).
 */
function presentationsOf(
  history: readonly TopicRecord[],
  day: SelectionInput['day'],
  byId: ReadonlyMap<string, Topic>,
): Presentation[] {
  const presentations: Presentation[] = []

  for (const record of history) {
    if (record.dayKey >= day.dayKey) {
      continue
    }

    const topic = byId.get(record.topicId)

    if (topic !== undefined) {
      presentations.push({
        topic,
        dayKey: record.dayKey,
        sequence: record.presentedAt,
      })
    }
  }

  day.offeredTopicIds.forEach((id, index) => {
    const topic = byId.get(id)

    if (topic !== undefined) {
      presentations.push({ topic, dayKey: day.dayKey, sequence: index })
    }
  })

  presentations.sort((left, right) =>
    left.dayKey < right.dayKey
      ? -1
      : left.dayKey > right.dayKey
        ? 1
        : left.sequence - right.sequence,
  )

  return presentations
}

/**
 * The last day each topic was shown, including today's offers. String order is
 * enough for a maximum because day keys are ISO dates, and the distance is
 * computed only when a rule needs it.
 */
function lastShown(
  history: readonly TopicRecord[],
  day: SelectionInput['day'],
): Map<string, string> {
  const lastSeen = new Map<string, string>()

  const remember = (topicId: string, dayKey: string): void => {
    const previous = lastSeen.get(topicId)

    if (previous === undefined || dayKey > previous) {
      lastSeen.set(topicId, dayKey)
    }
  }

  for (const record of history) {
    remember(record.topicId, record.dayKey)
  }

  for (const id of day.offeredTopicIds) {
    remember(id, day.dayKey)
  }

  return lastSeen
}

/** What the recent sequence says about domains, tags and difficulty levels. */
interface Seasoning {
  /** The last day each domain appeared. */
  readonly lastDayByDomain: Map<Domain, string>
  /** The quality characteristics offered in the recent window. */
  readonly recentTags: Set<Tag>
  /** How many recent offers each difficulty level holds. */
  readonly spreadCounts: Map<Difficulty, number>
  /** How many recent offers the spread is measured over. */
  readonly spreadTotal: number
}

function seasoningOf(presentations: readonly Presentation[]): Seasoning {
  const lastDayByDomain = new Map<Domain, string>()

  for (const { topic, dayKey } of presentations) {
    const previous = lastDayByDomain.get(topic.domain)

    if (previous === undefined || dayKey > previous) {
      lastDayByDomain.set(topic.domain, dayKey)
    }
  }

  const recent = presentations.slice(-spreadWindow)
  const recentTags = new Set<Tag>()
  const spreadCounts = new Map<Difficulty, number>()

  for (const { topic } of recent) {
    for (const tag of topic.tags) {
      recentTags.add(tag)
    }

    spreadCounts.set(topic.difficulty, (spreadCounts.get(topic.difficulty) ?? 0) + 1)
  }

  return { lastDayByDomain, recentTags, spreadCounts, spreadTotal: recent.length }
}

/** Whether a topic has rested long enough to be offered again as new. */
function isOutsideWindow(lastSeenDay: string | undefined, dayKey: string): boolean {
  if (lastSeenDay === undefined) {
    return true
  }

  return daysBetween(lastSeenDay, dayKey) >= exclusionWindowDays
}

/**
 * The spread multiplier: a level holding less than its share of the recent
 * window is favoured, one holding more is damped. Smoothed and clamped so the
 * term biases a ranking without ruling it (PRD §13 keeps levels invisible).
 */
function spreadFactor(
  difficulty: Difficulty,
  { spreadCounts, spreadTotal }: Seasoning,
): number {
  if (spreadTotal === 0) {
    return 1
  }

  const target = ENGINE_TUNING.spreadTarget[difficulty]
  const expected = target * spreadTotal
  const count = spreadCounts.get(difficulty) ?? 0
  const raw =
    (expected + ENGINE_TUNING.spreadSmoothing) / (count + ENGINE_TUNING.spreadSmoothing)

  return Math.min(
    Math.max(raw, ENGINE_TUNING.spreadFactor.min),
    ENGINE_TUNING.spreadFactor.max,
  )
}

/** How much of a topic's qualities the recent window has already offered. */
function tagOverlap(topic: Topic, recentTags: ReadonlySet<Tag>): number {
  if (topic.tags.length === 0) {
    return 0
  }

  const shared = topic.tags.filter((tag) => recentTags.has(tag)).length

  return shared / topic.tags.length
}

/**
 * A candidate's score in `[0, 1]` before the spread factor.
 *
 * Domain recency dominates (spec 0001), because a domain that has not appeared
 * for a while is the signal that reads most like serendipity; tag overlap keeps
 * the qualities varied; time since exposure stops the same handful of topics
 * from carrying the pool. Every term is normalised so the weights mean what
 * they say.
 */
function scoreOf(
  topic: Topic,
  lastSeenDay: string | undefined,
  seasoning: Seasoning,
  dayKey: string,
): number {
  const cap = ENGINE_TUNING.recencyCapDays
  // Clamped at both ends: a record dated after the day (a hand-edited store)
  // must not push a score negative.
  const within = (days: number): number => Math.min(Math.max(days, 0), cap)
  const domainDay = seasoning.lastDayByDomain.get(topic.domain)
  const domainDays = domainDay === undefined ? cap : within(daysBetween(domainDay, dayKey))
  const exposureDays =
    lastSeenDay === undefined ? cap : within(daysBetween(lastSeenDay, dayKey))

  const base =
    ENGINE_TUNING.weights.domainRecency * (domainDays / cap) +
    ENGINE_TUNING.weights.tagOverlap * (1 - tagOverlap(topic, seasoning.recentTags)) +
    ENGINE_TUNING.weights.timeSinceExposure * (exposureDays / cap)

  return base * spreadFactor(topic.difficulty, seasoning)
}

/** The two domains of the last two offers, when they agree. */
function repeatedDomain(
  history: readonly TopicRecord[],
  day: SelectionInput['day'],
  byId: ReadonlyMap<string, Topic>,
): Domain | null {
  const earlier = history
    .filter((record) => record.dayKey < day.dayKey)
    .slice()
    .sort((left, right) =>
      left.dayKey < right.dayKey
        ? -1
        : left.dayKey > right.dayKey
          ? 1
          : left.presentedAt - right.presentedAt,
    )

  const sequence = [
    ...earlier.map((record) => record.topicId),
    ...day.offeredTopicIds,
  ]
  const domains = sequence
    .slice(-2)
    .map((id) => byId.get(id)?.domain)
    .filter((domain): domain is Domain => domain !== undefined)

  if (domains.length < 2 || domains[0] !== domains[1]) {
    return null
  }

  return domains[0]
}

/**
 * A third offer in a row from one domain would read as a feed rather than as
 * serendipity, so it is ruled out when anything else is available (AC-12).
 */
function withoutRepeatedDomain(
  candidates: readonly Topic[],
  blockedDomain: Domain | null,
): Topic[] {
  if (blockedDomain === null) {
    return [...candidates]
  }

  const guarded = candidates.filter((topic) => topic.domain !== blockedDomain)

  return guarded.length > 0 ? guarded : [...candidates]
}

/** The flagged topic that has been away longest is the best return on offer. */
function returnCandidate(
  candidates: readonly Topic[],
  lastSeen: ReadonlyMap<string, string>,
  seasoning: Seasoning,
  dayKey: string,
  blockedDomain: Domain | null,
): Topic | null {
  const eligible = candidates.filter((topic) => {
    if (!topic.resurfacing) {
      return false
    }

    const lastSeenDay = lastSeen.get(topic.id)

    return (
      lastSeenDay !== undefined &&
      daysBetween(lastSeenDay, dayKey) >= resurfaceAbsenceDays
    )
  })

  const ranked = withoutRepeatedDomain(eligible, blockedDomain)
    .map((topic) => ({
      topic,
      score: scoreOf(topic, lastSeen.get(topic.id), seasoning, dayKey),
    }))
    .sort((left, right) => right.score - left.score)

  return ranked[0]?.topic ?? null
}

/** The least recently presented candidate, which is what a thin pool has left. */
function oldestCandidate(
  candidates: readonly Topic[],
  lastSeen: ReadonlyMap<string, string>,
  order: ReadonlyMap<string, number>,
): Topic {
  const ranked = candidates
    .slice()
    .sort((left, right) => {
      const leftDay = lastSeen.get(left.id) ?? ''
      const rightDay = lastSeen.get(right.id) ?? ''

      if (leftDay !== rightDay) {
        return leftDay < rightDay ? -1 : 1
      }

      return (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0)
    })

  return ranked[0] as Topic
}

/**
 * The weighted draw over the ranking: a clearly better candidate wins outright,
 * a close call is left to the day's stream. Both keep the reasoning invisible
 * while making the sequence reproducible.
 */
function pickRanked(
  candidates: readonly Topic[],
  lastSeen: ReadonlyMap<string, string>,
  seasoning: Seasoning,
  dayKey: string,
  order: ReadonlyMap<string, number>,
  rng: () => number,
): Topic {
  const ranked = candidates
    .map((topic) => ({
      topic,
      score: scoreOf(topic, lastSeen.get(topic.id), seasoning, dayKey),
      index: order.get(topic.id) ?? 0,
    }))
    .sort((left, right) =>
      right.score !== left.score ? right.score - left.score : left.index - right.index,
    )

  const best = ranked[0] as (typeof ranked)[number]
  const second = ranked[1]

  if (
    second === undefined ||
    second.score <= 0 ||
    best.score >= second.score * ENGINE_TUNING.dominanceRatio
  ) {
    return best.topic
  }

  const weights = ranked.map((entry) =>
    Math.pow(Math.max(entry.score, 0), ENGINE_TUNING.rankingSharpness),
  )
  const total = weights.reduce((sum, weight) => sum + weight, 0)

  if (total <= 0) {
    return best.topic
  }

  let target = rng() * total

  for (const [index, weight] of weights.entries()) {
    target -= weight

    if (target < 0) {
      return (ranked[index] as (typeof ranked)[number]).topic
    }
  }

  return (ranked[ranked.length - 1] as (typeof ranked)[number]).topic
}

/**
 * Offer the next story of the day, or say why there is none.
 *
 * The order of the rules is fixed: the day's cap, an empty library, a candidate
 * that is not already offered today, the return roll, the exclusion window, and
 * finally the thin pool. The random source is drawn at most twice per call, the
 * rarity roll first and the pick second, so the offer can only depend on the
 * input and the seed.
 */
export function offerNextStory({
  library,
  history,
  day,
  rng,
}: SelectionInput): Offer {
  if (day.offeredTopicIds.length >= ENGINE_TUNING.storiesPerDay) {
    return { kind: 'none', reason: 'day-complete' }
  }

  if (library.length === 0) {
    return { kind: 'none', reason: 'empty-library' }
  }

  const byId = new Map(library.map((topic) => [topic.id, topic]))
  const order = new Map(library.map((topic, index) => [topic.id, index]))
  const offeredToday = new Set(day.offeredTopicIds)
  const candidates = library.filter((topic) => !offeredToday.has(topic.id))

  if (candidates.length === 0) {
    return { kind: 'none', reason: 'no-candidate' }
  }

  const lastSeen = lastShown(history, day)
  const seasoning = seasoningOf(presentationsOf(history, day, byId))
  const blockedDomain = repeatedDomain(history, day, byId)

  // The rarity roll happens before the rules that follow, so a day's stream is
  // read at the same position whatever the pool happens to look like.
  if (rng() < ENGINE_TUNING.resurfaceChance) {
    const returning = returnCandidate(
      candidates,
      lastSeen,
      seasoning,
      day.dayKey,
      blockedDomain,
    )

    if (returning !== null) {
      return { kind: 'story', topic: returning, because: 'resurfaced' }
    }
  }

  const fresh = candidates.filter((topic) =>
    isOutsideWindow(lastSeen.get(topic.id), day.dayKey),
  )

  if (fresh.length > 0) {
    return {
      kind: 'story',
      topic: pickRanked(
        withoutRepeatedDomain(fresh, blockedDomain),
        lastSeen,
        seasoning,
        day.dayKey,
        order,
        rng,
      ),
      because: 'new',
    }
  }

  return {
    kind: 'story',
    topic: oldestCandidate(candidates, lastSeen, order),
    because: 'thin-pool',
  }
}
