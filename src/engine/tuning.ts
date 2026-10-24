/**
 * Every number the selection engine uses, in one frozen object (spec 0001).
 *
 * None of these values has been measured. They are judgement calls made against
 * a 24 topic pool, and they were re-read at 120 on 2026-10-22, at 216 on
 * 2026-10-24 and at the full 300 on 2026-10-24: none changed. The exclusion
 * window fits, since no pool repeats a topic inside 30 days, and the spread
 * terms still behave. Resurfacing is now reachable where it was mostly not at
 * 120: a year of three offers a day over the shipped library returns a topic
 * after a median 108 days, against 70 at 216 and 38 at 120. Every day finds a
 * story, and no three offers in a row share a domain. Keeping the values here
 * makes a change one line with a test behind it instead of a hunt through the
 * rules.
 */

import type { Difficulty } from '@/content/types'

export interface EngineTuning {
  /** Stories a day may offer: the initial one and up to two rerolls (MCD D5). */
  readonly storiesPerDay: number
  /**
   * How long a topic rests after being shown. At 30 days and three offers a
   * day, a 24 topic pool empties in about eight days, which is why the thin
   * pool path exists rather than being an edge case.
   */
  readonly exclusionWindowDays: number
  /**
   * The absence a return needs: twice the exclusion window, so a return is
   * always a story the person met long ago, not one they missed last week.
   */
  readonly resurfaceAbsenceDays: number
  /**
   * The chance a call may bring a story back, drawn once per call from the
   * caller's per day stream. With one stream per day this is roughly one day
   * in seven carrying a return, which is the cadence the tuned chance stands
   * in for now that the guaranteed weekly cap is gone (spec 0001, Follow-up).
   */
  readonly resurfaceChance: number
  /** How many recent presentations the spread and tag terms look at. */
  readonly spreadWindow: number
  /** The share of recent offers each difficulty should hold, invisibly (PRD §13). */
  readonly spreadTarget: Readonly<Record<Difficulty, number>>
  /**
   * What each signal is worth in a candidate's score (spec 0001, Decision).
   * The three sum to one so a score stays in `[0, 1]` before the spread factor.
   */
  readonly weights: {
    /** Where the candidate's domain sits in the order domains were last offered. */
    readonly domainRecency: number
    /** How little the candidate's tags repeat the qualities just offered. */
    readonly tagOverlap: number
    /** How long it has been since this topic was last shown. */
    readonly timeSinceExposure: number
  }
  /** How far back a recency or exposure value is measured, in days. */
  readonly recencyCapDays: number
  /**
   * The spread term's smoothing, so a level with no recent offers is favoured
   * strongly but never becomes the only reachable level.
   */
  readonly spreadSmoothing: number
  /** The bounds on the spread multiplier, so it biases a ranking without owning it. */
  readonly spreadFactor: { readonly min: number; readonly max: number }
  /**
   * How sharply the weighted pick prefers higher scores. Above one it keeps a
   * good candidate likely without making the draw an argmax.
   */
  readonly rankingSharpness: number
  /**
   * When the best candidate scores at least this many times the second best,
   * it wins outright and the draw is not consulted. Only a close call is left
   * to chance, which also makes a decisive domain-recency gap deterministic.
   */
  readonly dominanceRatio: number
}

export const ENGINE_TUNING: EngineTuning = Object.freeze({
  storiesPerDay: 3,
  exclusionWindowDays: 30,
  resurfaceAbsenceDays: 60,
  resurfaceChance: 1 / 7,
  spreadWindow: 12,
  spreadTarget: Object.freeze({ 1: 1 / 3, 2: 1 / 3, 3: 1 / 3 }),
  weights: Object.freeze({
    domainRecency: 0.6,
    tagOverlap: 0.25,
    timeSinceExposure: 0.15,
  }),
  recencyCapDays: 120,
  spreadSmoothing: 1,
  spreadFactor: Object.freeze({ min: 0.4, max: 2.5 }),
  rankingSharpness: 3,
  dominanceRatio: 1.5,
})
