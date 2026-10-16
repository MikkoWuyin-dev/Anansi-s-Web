/**
 * Renders the compiled topic bundle. Pure: given topics, it returns source
 * text, so the output can be diffed and tested without touching the disk.
 *
 * The bundle is committed rather than built on demand, so that typecheck,
 * test, and build all work without running the authoring scripts. Drift is
 * caught by `npm run content:check`.
 */

import type { Topic } from '../../src/content/types.ts'

/** Where the compiled bundle lives, relative to the workspace root. */
export const BUNDLE_PATH = 'src/content/topics.generated.ts'

/** Prefers single quotes, the house style, and escapes only when it must. */
const quote = (value: string): string =>
  value.includes("'") ? JSON.stringify(value) : `'${value}'`

const renderTopic = (topic: Topic): string =>
  [
    '  {',
    `    id: ${quote(topic.id)},`,
    `    title: ${quote(topic.title)},`,
    `    domain: ${quote(topic.domain)},`,
    `    difficulty: ${topic.difficulty},`,
    `    tags: [${topic.tags.map(quote).join(', ')}],`,
    `    resurfacing: ${topic.resurfacing},`,
    `    added: ${quote(topic.added)},`,
    '  },',
  ].join('\n')

/** Byte for byte stable ordering, by id, so the bundle diff stays quiet. */
export const sortTopics = (topics: readonly Topic[]): Topic[] =>
  [...topics].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

/** The full source text of the compiled bundle. */
export function renderBundle(topics: readonly Topic[]): string {
  const ordered = sortTopics(topics)
  const body = ordered.map(renderTopic).join('\n')

  return `// GENERATED FILE. Do not edit by hand.
//
// Source of truth: content/topics/<id>.json
// Regenerate:      npm run content:build
// Verify:          npm run content:check
//
// Committed so that typecheck, test, and build work without running the
// authoring scripts. Drift is caught in CI by content:check.
//
// Topics: ${ordered.length}

import type { Topic } from './types'

export const topics: Topic[] = [
${body}
]
`
}
