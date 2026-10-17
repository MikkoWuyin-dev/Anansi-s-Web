/**
 * Fails when a factual claim in the state assessment no longer matches the
 * repository, so drift surfaces here instead of ageing quietly in the document.
 *
 *   npm run docs:check
 *
 * It measures the repository, hands the numbers to the rules in `lib/claims.ts`,
 * reports every claim that no longer holds, and exits non-zero when there are
 * any. Every measurement it cannot take is a loud failure: a checker that cannot
 * see the repository must never report that the document is accurate.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { checkClaims, type AreaFact, type Facts } from './lib/claims.ts'
import { ROOT } from './lib/load.ts'

/** The document under check. */
const TARGET = 'docs/SYSTEM_TEARDOWN.md'

const die = (message: string): never => {
  console.error(`docs:check — ${message}`)
  process.exit(1)
}

const readText = (path: string): string => {
  try {
    return readFileSync(join(ROOT, path), 'utf8')
  } catch (error) {
    return die(`cannot read ${path}: ${(error as Error).message}`)
  }
}

/** Counts newlines, the way `wc -l` counts lines, so the numbers are comparable. */
const lineCount = (text: string): number => (text.match(/\n/g) ?? []).length

/** Asks git for a list of paths, one per line. */
const gitPaths = (args: string[]): string[] => {
  let listing: string

  try {
    listing = execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
  } catch (error) {
    return die(`cannot run \`git ${args.join(' ')}\`: ${(error as Error).message}`)
  }

  return listing
    .split('\n')
    .map((file) => file.trim().replaceAll('\\', '/'))
    .filter((file) => file !== '')
}

/** What git tracks: the basis for every tracked-state claim. */
const trackedFiles = gitPaths(['ls-files'])

/**
 * What the repository holds: the tracked files plus anything untracked that is
 * not ignored, so a count does not go stale just because the commit that adds a
 * file has not been made yet.
 */
const workingFiles = [
  ...new Set([
    ...trackedFiles,
    ...gitPaths(['ls-files', '--others', '--exclude-standard']),
  ]),
].sort()

if (trackedFiles.length === 0) {
  die('git reports no tracked files, so the state assessment cannot be checked')
}

/** The files under a prefix, and how long they are. */
const area = (prefix: string): AreaFact => {
  const files = workingFiles.filter((file) => file.startsWith(prefix))

  return {
    files: files.length,
    lines: files.reduce((sum, file) => sum + lineCount(readText(file)), 0),
  }
}

const documents = workingFiles
  .filter((file) => /^docs\/[^/]+\.md$/.test(file))
  .map((file) => ({ path: file, lines: lineCount(readText(file)) }))

if (documents.length === 0) {
  die('found no markdown documents in docs/')
}

const skillCount = new Set(
  workingFiles
    .filter((file) => file.startsWith('skills/') && file.split('/').length > 2)
    .map((file) => file.split('/')[1]),
).size

const topicFiles = workingFiles
  .filter((file) => /^content\/topics\/.+\.json$/.test(file))
  .sort()

if (topicFiles.length === 0) {
  die('found no topic files under content/topics/')
}

const difficulty: number[] = [0, 0, 0]

/** Reads a topic's difficulty, failing loudly when it is not one of the three. */
const difficultyOf = (file: string, value: unknown): number => {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return die(`${file} has no whole-number difficulty`)
  }

  if (value < 1 || value > difficulty.length) {
    return die(`${file} has a difficulty outside 1 to ${difficulty.length}`)
  }

  return value
}

for (const file of topicFiles) {
  const parsed = JSON.parse(readText(file)) as { difficulty?: unknown }
  difficulty[difficultyOf(file, parsed.difficulty) - 1] += 1
}

// The suite is read through vitest's own collector, so the counts are the ones
// the runner would execute rather than a guess made from the source text.
const vitest = 'node_modules/vitest/vitest.mjs'

if (!existsSync(join(ROOT, vitest))) {
  die(`${vitest} is missing; run npm ci first`)
}

const collected = ((): { file: string }[] => {
  let listing: string

  try {
    listing = execFileSync(process.execPath, [vitest, 'list', '--json'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  } catch (error) {
    return die(`vitest could not list the suite: ${(error as Error).message}`)
  }

  const start = listing.indexOf('[')
  const end = listing.lastIndexOf(']')

  if (start === -1 || end === -1) {
    return die(`vitest did not return a JSON listing:\n${listing.slice(0, 400)}`)
  }

  try {
    return JSON.parse(listing.slice(start, end + 1)) as { file: string }[]
  } catch (error) {
    return die(`cannot parse the vitest listing: ${(error as Error).message}`)
  }
})()

if (collected.length === 0) {
  die('vitest collected no tests')
}

const byFile: Record<string, number> = {}

for (const test of collected) {
  const file = relative(ROOT, test.file).replaceAll('\\', '/')

  if (file.startsWith('..')) {
    die(`vitest collected a test outside the repository: ${test.file}`)
  }

  byFile[file] = (byFile[file] ?? 0) + 1
}

const manifest = JSON.parse(readText('package.json')) as {
  scripts?: Record<string, string>
  engines?: { node?: string }
}

const npmScripts = manifest.scripts ?? {}
const verify = npmScripts.verify

if (verify === undefined) {
  die('package.json defines no `verify` script')
}

/** The gate's steps as script names, however the chain is spaced. */
const verifySteps = verify
  .split('&&')
  .map((step) => step.trim().replace(/^npm run /, ''))
  .filter((step) => step !== '')

const lock = JSON.parse(readText('package-lock.json')) as {
  lockfileVersion?: number
  packages?: Record<string, { version?: string }>
}

const lockVersions: Record<string, string> = {}

for (const [key, entry] of Object.entries(lock.packages ?? {})) {
  const name = key.replace(/^node_modules\//, '')

  if (name === '' || name === key || name.includes('/node_modules/')) {
    continue
  }

  if (entry.version !== undefined && lockVersions[name] === undefined) {
    lockVersions[name] = entry.version
  }
}

const workflowText = readText('.github/workflows/verify.yml')
const workflowUses = [...workflowText.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)].map(
  (match) => match[1],
)
const workflowCommands = [
  ...workflowText.matchAll(/^\s*-?\s*run:\s*(.+)$/gm),
].map((match) => match[1].trim())
const workflowNode =
  workflowText.match(/node-version:\s*['"]?([\w.x]+)/)?.[1] ?? null

if (workflowUses.length === 0 || workflowCommands.length === 0) {
  die('.github/workflows/verify.yml declares no actions or no commands')
}

const scopeLines = readText('docs/scope/scope.md').split('\n')
const scopeStart = scopeLines.findIndex((line) => /^##\s+At a glance/.test(line))
const scopeEnd = scopeLines.findIndex(
  (line, index) => index > scopeStart && /^##\s/.test(line),
)

if (scopeStart === -1) {
  die('docs/scope/scope.md has no "At a glance" section to count')
}

let enrolled = 0
let planned = 0

for (const line of scopeLines.slice(scopeStart, scopeEnd === -1 ? undefined : scopeEnd)) {
  const cells = line.match(/^\|\s*([A-Z0-9]+)\s*\|([^|]*)\|([^|]*)\|([^|]*)\|\s*$/)
  if (cells === null) {
    continue
  }

  if (cells[3].trim() === 'Enrolled') {
    enrolled += 1
  }

  if (cells[4].trim() === 'planned') {
    planned += 1
  }
}

if (enrolled === 0 || planned === 0) {
  die('docs/scope/scope.md lists no enrolled or no planned features')
}

const facts: Facts = {
  trackedFiles,
  workingFiles,
  docs: documents,
  skills: { ...area('skills/'), count: skillCount },
  scripts: area('scripts/'),
  src: area('src/'),
  content: {
    ...area('content/'),
    topics: topicFiles.length,
    difficulty,
  },
  tests: {
    byFile,
    files: Object.keys(byFile).length,
    total: collected.length,
  },
  npmScripts,
  verifySteps,
  nodeEngine: manifest.engines?.node ?? '',
  lockfileVersion: lock.lockfileVersion ?? 0,
  lockVersions,
  workflow: {
    uses: workflowUses,
    nodeVersion: workflowNode,
    commands: workflowCommands,
  },
  scope: { enrolled, planned },
  exists: (path) => existsSync(join(ROOT, path)),
}

const report = checkClaims(readText(TARGET), facts)

if (report.violations.length === 0) {
  console.log(`${TARGET}: ${report.checked} claims compared against the repository, no drift`)
} else {
  const ordered = [...report.violations].sort((a, b) => a.line - b.line)

  for (const violation of ordered) {
    console.log(violation.line > 0 ? `${TARGET}:${violation.line}` : TARGET)
    console.log(`  ${violation.claim}`)
    console.log(`  documented: ${violation.documented}`)
    console.log(`  repository: ${violation.actual}`)
  }

  console.log('')
  console.log(
    `${report.violations.length} of ${report.checked} checked claims no longer hold.`,
  )
  console.log(`Update ${TARGET} (AGENTS.md §11), or fix the repository.`)
  process.exitCode = 1
}
