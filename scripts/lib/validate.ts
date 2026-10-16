/**
 * Pure validation for the topic library. No file system access here, so the
 * rules can be tested directly; the CLI wrappers do the reading and writing.
 *
 * Node runs these scripts through type stripping, so imports carry the `.ts`
 * extension and nothing here may rely on a transform (no enums, no namespaces).
 */

import {
  DATE_PATTERN,
  DIFFICULTIES,
  DOMAINS,
  SLUG_PATTERN,
  TAGS,
  TOPIC_KEYS,
  type Difficulty,
  type Domain,
  type Tag,
  type Topic,
} from '../../src/content/types.ts'

export type Severity = 'error' | 'warning'

export interface Issue {
  /** Workspace relative path of the offending file. */
  file: string
  /** The field at fault, when the issue is field specific. */
  field?: string
  severity: Severity
  message: string
}

/** A topic that passed validation, with the file it came from. */
export interface ValidTopic {
  topic: Topic
  file: string
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isDomain = (value: unknown): value is Domain =>
  typeof value === 'string' && (DOMAINS as readonly string[]).includes(value)

const isTag = (value: unknown): value is Tag =>
  typeof value === 'string' && (TAGS as readonly string[]).includes(value)

const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === 'number' &&
  (DIFFICULTIES as readonly number[]).includes(value)

const isRealDate = (value: string): boolean => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/** Lowercases and strips punctuation so titles can be compared for sameness. */
export const normalizeTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Significant words in a title, used for near duplicate detection. */
export const titleTokens = (title: string): Set<string> =>
  new Set(normalizeTitle(title).split(' ').filter((token) => token.length > 2))

/** Jaccard similarity, 0 to 1, between two token sets. */
export const similarity = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 || b.size === 0) return 0

  let shared = 0
  for (const token of a) {
    if (b.has(token)) shared += 1
  }

  return shared / (a.size + b.size - shared)
}

/** The threshold at which two titles are reported as near duplicates. */
export const NEAR_DUPLICATE_THRESHOLD = 0.7

export interface TopicResult {
  /** The validated topic, or null when any error was found. */
  topic: Topic | null
  issues: Issue[]
}

/**
 * Validates one parsed topic entry against the schema. `file` is the source
 * path, used both for reporting and to check that `id` matches the file name.
 */
export function validateTopic(raw: unknown, file: string): TopicResult {
  const issues: Issue[] = []
  const error = (message: string, field?: string): void => {
    issues.push({ file, field, severity: 'error', message })
  }

  if (!isPlainObject(raw)) {
    error('entry must be a JSON object')

    return { topic: null, issues }
  }

  const unknownKeys = Object.keys(raw).filter(
    (key) => !TOPIC_KEYS.includes(key as keyof Topic),
  )

  for (const key of unknownKeys) {
    error('unknown field', key)
  }

  for (const key of TOPIC_KEYS) {
    if (!(key in raw)) error('missing required field', key)
  }

  const { id, title, domain, difficulty, tags, resurfacing, added } = raw

  if (typeof id !== 'string' || !SLUG_PATTERN.test(id)) {
    error('id must be a lowercase slug, for example "the-cobra-effect"', 'id')
  } else {
    const expected = file.split('/').pop()?.replace(/\.json$/, '')

    if (expected !== undefined && expected !== id) {
      error(`id "${id}" does not match the file name "${expected}.json"`, 'id')
    }
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    error('title must be a non empty string', 'title')
  } else if (title.length > 80) {
    error(`title is ${title.length} characters, the limit is 80`, 'title')
  } else if (title === title.toUpperCase() && /[A-Z]/.test(title)) {
    error(
      'title is stored in natural case; the reveal applies its own casing in CSS',
      'title',
    )
  }

  if (!isDomain(domain)) {
    error(`domain must be one of: ${DOMAINS.join(', ')}`, 'domain')
  }

  if (!isDifficulty(difficulty)) {
    error('difficulty must be 1, 2, or 3', 'difficulty')
  }

  if (!Array.isArray(tags)) {
    error('tags must be an array', 'tags')
  } else if (tags.length === 0) {
    error('tags must carry at least one quality characteristic', 'tags')
  } else {
    for (const tag of new Set(tags.filter((value) => !isTag(value)))) {
      error(`unknown tag "${String(tag)}"`, 'tags')
    }

    if (new Set(tags).size !== tags.length) {
      error('tags must not repeat', 'tags')
    }
  }

  if (typeof resurfacing !== 'boolean') {
    error('resurfacing must be a boolean', 'resurfacing')
  }

  if (typeof added !== 'string' || !DATE_PATTERN.test(added)) {
    error('added must be an ISO date, for example "2026-10-16"', 'added')
  } else if (!isRealDate(added)) {
    error(`added "${added}" is not a real calendar date`, 'added')
  }

  if (issues.some((issue) => issue.severity === 'error')) {
    return { topic: null, issues }
  }

  return { topic: raw as unknown as Topic, issues }
}

/**
 * Validates the library as a whole: uniqueness, near duplicates, and coverage.
 * Takes already validated topics so field errors are reported only once.
 */
export function validateLibrary(entries: readonly ValidTopic[]): Issue[] {
  const issues: Issue[] = []
  const warn = (file: string, message: string, field?: string): void => {
    issues.push({ file, field, severity: 'warning', message })
  }

  const byId = new Map<string, string>()
  const byTitle = new Map<string, string>()

  for (const { topic, file } of entries) {
    const seenId = byId.get(topic.id)

    if (seenId !== undefined) {
      issues.push({
        file,
        field: 'id',
        severity: 'error',
        message: `duplicate id "${topic.id}", already defined in ${seenId}`,
      })
    } else {
      byId.set(topic.id, file)
    }

    const normalized = normalizeTitle(topic.title)
    const seenTitle = byTitle.get(normalized)

    if (seenTitle !== undefined) {
      issues.push({
        file,
        field: 'title',
        severity: 'error',
        message: `duplicate title "${topic.title}", already defined in ${seenTitle}`,
      })
    } else {
      byTitle.set(normalized, file)
    }
  }

  for (let a = 0; a < entries.length; a += 1) {
    for (let b = a + 1; b < entries.length; b += 1) {
      const first = entries[a]
      const second = entries[b]

      if (first === undefined || second === undefined) continue

      const score = similarity(
        titleTokens(first.topic.title),
        titleTokens(second.topic.title),
      )

      if (score >= NEAR_DUPLICATE_THRESHOLD) {
        warn(
          second.file,
          `title looks close to "${first.topic.title}" in ${first.file} (similarity ${score.toFixed(2)})`,
          'title',
        )
      }
    }
  }

  const coveredDomains = new Set(entries.map(({ topic }) => topic.domain))
  const missingDomains = DOMAINS.filter((domain) => !coveredDomains.has(domain))

  for (const domain of missingDomains) {
    warn('content/topics', `no topics yet for domain "${domain}"`, 'domain')
  }

  const coveredDifficulties = new Set(
    entries.map(({ topic }) => topic.difficulty),
  )
  const missingDifficulties = DIFFICULTIES.filter(
    (level) => !coveredDifficulties.has(level),
  )

  for (const level of missingDifficulties) {
    warn('content/topics', `no topics yet at difficulty ${level}`, 'difficulty')
  }

  return issues
}

/** Formats issues as lines for the terminal, errors and warnings separated. */
export function formatIssues(issues: readonly Issue[]): string[] {
  return issues.map((issue) => {
    const label = issue.severity === 'error' ? 'error' : 'warning'
    const field = issue.field === undefined ? '' : ` (${issue.field})`

    return `${label}: ${issue.file}${field}: ${issue.message}`
  })
}
