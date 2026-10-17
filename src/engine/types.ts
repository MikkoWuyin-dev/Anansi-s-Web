/**
 * The selection engine's contract (MCD §5, spec 0001).
 *
 * These shapes are the engine's public surface: the state layer records them,
 * the engine reads them, and neither side owns a second copy. `TopicRecord`
 * is deliberately the name the state schema already uses, not the MCD §5
 * snippet's `HistoryEvent`.
 */

import type { Topic } from '@/content/types'
import type { Rng } from '@/engine/rng'

/**
 * One story the app has shown, on the day it was shown. Every story counts as
 * explored, rerolled or not (PRD §12), so this is the engine's memory of what
 * the person has already met.
 */
export interface TopicRecord {
  /** The `Topic.id` shown. */
  topicId: string
  /** The local day key of the showing, `YYYY-MM-DD`. */
  dayKey: string
  /** When it was shown, epoch milliseconds. */
  presentedAt: number
  /** Whether this is the story the person kept for the day. */
  accepted: boolean
  /** How far the ritual got with it. */
  status: 'explored' | 'learned'
}

/**
 * The day's own memory. Only its length matters to the daily cap; the ids are
 * what stops a reroll from repeating an offer (MCD D5).
 */
export interface DayState {
  /** The local day key this state belongs to, `YYYY-MM-DD`. */
  dayKey: string
  /** The topics offered today, in offer order, at most `storiesPerDay`. */
  offeredTopicIds: string[]
  /** The story kept for the day, once one has been kept. */
  acceptedTopicId: string | null
}

/** Why an offer was chosen. The interface decides how to present each. */
export type OfferBecause = 'new' | 'resurfaced' | 'thin-pool'

/** Why there is no story to offer right now. */
export type NoOfferReason = 'day-complete' | 'empty-library' | 'no-candidate'

/** The single entry point's result: a story with its reason, or the reason for none. */
export type Offer =
  | { kind: 'story'; topic: Topic; because: OfferBecause }
  | { kind: 'none'; reason: NoOfferReason }

/**
 * Everything the engine may read, injected by the caller (MCD §5).
 *
 * The engine reads no clock and no storage: the day arrives as `day.dayKey`,
 * and the random source arrives as a function the caller seeds from the client
 * identifier and the day key (MCD D5). A fresh stream must be built for every
 * call, or the day would not survive a reload.
 */
export interface SelectionInput {
  /** The whole library, including topics shown recently. */
  readonly library: readonly Topic[]
  /** Every story shown so far, in any order. May be empty. */
  readonly history: readonly TopicRecord[]
  /** Today's state, which carries the day's cap and its offers. */
  readonly day: DayState
  /** The caller's per day stream; the engine draws at most twice per call. */
  readonly rng: Rng
}
