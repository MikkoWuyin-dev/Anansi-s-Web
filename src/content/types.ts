/**
 * The content schema (MCD §5). This file is the single source of truth for the
 * shape of a topic, shared by the app, the authoring scripts, and the tests.
 *
 * Two deliberate refinements to the MCD's initial shape, which the MCD invites
 * ("initial shape — refine during build"):
 *
 * 1. `title` is stored in natural case ("The Cobra Effect"), not display case.
 *    The reveal is uppercased in CSS, so the design can change casing without
 *    touching content, and screen readers are not handed an all caps string.
 * 2. `tags` is a closed union of the PRD §11 quality characteristics, not
 *    `string[]`, so the validator catches typos and coverage can be measured.
 *
 * IMPORTANT: the authoring scripts run under Node's type stripping, which
 * erases types but cannot transform them. That rules out `enum` and
 * `namespace` here. Use `as const` arrays and derived union types instead.
 */

/** The spheres of life topics span (PRD §12). 24 domains, one slug each. */
export const DOMAINS = [
  'everyday-life',
  'science',
  'psychology',
  'technology',
  'economics',
  'history',
  'geography',
  'language',
  'communication',
  'culture',
  'nature',
  'engineering',
  'business',
  'philosophy',
  'food',
  'architecture',
  'design',
  'human-behaviour',
  'society',
  'inventions',
  'transportation',
  'space',
  'computing',
  'accessible-mathematics',
] as const

export type Domain = (typeof DOMAINS)[number]

/** The internal difficulty levels (PRD §13). Never surfaced to the user. */
export const DIFFICULTIES = [1, 2, 3] as const

export type Difficulty = (typeof DIFFICULTIES)[number]

/** The quality characteristics a topic may carry (PRD §11). */
export const TAGS = [
  'relevant-to-everyday-life',
  'surprisingly-useful',
  'culturally-interesting',
  'easy-to-explain',
  'thought-provoking',
  'counterintuitive',
  'practical',
  'fascinating',
  'funny-or-weird',
  'scientifically-interesting',
  'historically-interesting',
  'obscure',
] as const

export type Tag = (typeof TAGS)[number]

/** One curated topic. The source of truth is `content/topics/<id>.json`. */
export interface Topic {
  /** Stable slug, identical to the source file name: "the-cobra-effect". */
  id: string
  /** Display title in natural case. The UI casing is a presentation concern. */
  title: string
  /** The sphere of life it belongs to. */
  domain: Domain
  /** Internal only. The reveal must never show this. */
  difficulty: Difficulty
  /** Quality characteristics, at least one. */
  tags: Tag[]
  /** Eligible for the rare intentional resurfacing (PRD §18). */
  resurfacing: boolean
  /** ISO date, `YYYY-MM-DD`, the day it entered the library. */
  added: string
}

/** The fields a `Topic` must have, for strict unknown key rejection. */
export const TOPIC_KEYS: readonly (keyof Topic)[] = [
  'id',
  'title',
  'domain',
  'difficulty',
  'tags',
  'resurfacing',
  'added',
]

/** The slug shape every `id` must match. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** The date shape every `added` must match. */
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
