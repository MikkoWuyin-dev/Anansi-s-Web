/**
 * Reports library coverage and the compiled bundle size.
 *
 *   npm run content:report
 *
 * Informational, but it exits non-zero when the library has validation errors,
 * so coverage gaps and malformed entries surface in CI rather than by eye.
 */

import { gzipSync } from 'node:zlib'

import { renderBundle } from './lib/compile.ts'
import { loadLibrary, partition } from './lib/load.ts'
import { DIFFICULTIES, DOMAINS, TAGS } from '../src/content/types.ts'

/** The launch target from MCD §6, used to project the bundle size. */
const LAUNCH_TARGET = 300

/** The content budget from MCD §8, in kilobytes, gzipped. */
const BUNDLE_BUDGET_KB = 150

const { entries, issues } = await loadLibrary()
const { errors, warnings } = partition(issues)
const topics = entries.map((entry) => entry.topic)

const bar = (count: number, max: number, width = 24): string => {
  if (max === 0) return ''

  return '█'.repeat(Math.max(count === 0 ? 0 : 1, Math.round((count / max) * width)))
}

const countBy = <T extends string | number>(
  values: readonly T[],
): Map<T, number> => {
  const counts = new Map<T, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return counts
}

const section = (title: string): void => {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
}

console.log(`Anansi's Web — content report`)
console.log(`Topics: ${topics.length}`)

section('By domain')
const domainCounts = countBy(topics.map((topic) => topic.domain))
const maxDomain = Math.max(0, ...domainCounts.values())

for (const domain of DOMAINS) {
  const count = domainCounts.get(domain) ?? 0
  const marker = count === 0 ? '  <-- gap' : ''

  console.log(
    `  ${domain.padEnd(24)} ${String(count).padStart(3)}  ${bar(count, maxDomain)}${marker}`,
  )
}

section('By difficulty')
const difficultyCounts = countBy(topics.map((topic) => topic.difficulty))
const maxDifficulty = Math.max(0, ...difficultyCounts.values())

for (const level of DIFFICULTIES) {
  const count = difficultyCounts.get(level) ?? 0
  const share = topics.length === 0 ? 0 : (count / topics.length) * 100

  console.log(
    `  level ${level}${' '.repeat(18)} ${String(count).padStart(3)}  ${bar(count, maxDifficulty)} ${share.toFixed(0)}%`,
  )
}

section('By characteristic')
const tagCounts = countBy(topics.flatMap((topic) => topic.tags))
const maxTag = Math.max(0, ...tagCounts.values())

for (const tag of TAGS) {
  const count = tagCounts.get(tag) ?? 0

  console.log(
    `  ${tag.padEnd(28)} ${String(count).padStart(3)}  ${bar(count, maxTag)}`,
  )
}

section('Bundle')
const source = renderBundle(topics)
const rawBytes = Buffer.byteLength(source, 'utf8')
const gzipBytes = gzipSync(source).byteLength
const gzipKb = gzipBytes / 1024
const projectedKb = topics.length === 0 ? 0 : gzipKb * (LAUNCH_TARGET / topics.length)

console.log(`  topics                 ${topics.length}`)
console.log(`  bundle source          ${(rawBytes / 1024).toFixed(1)} kB`)
console.log(`  bundle gzipped         ${gzipKb.toFixed(1)} kB`)
console.log(
  `  projected at ${LAUNCH_TARGET}        ${projectedKb.toFixed(1)} kB (budget ${BUNDLE_BUDGET_KB} kB)`,
)

if (projectedKb > BUNDLE_BUDGET_KB) {
  console.log(
    `  note: the projection is linear and rough, but it is over budget.`,
  )
}

section('Issues')
console.log(`  errors                 ${errors.length}`)
console.log(`  warnings               ${warnings.length}`)

if (errors.length > 0) {
  process.exitCode = 1
}
