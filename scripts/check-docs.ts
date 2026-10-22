/**
 * Keeps the documents trustworthy and small.
 *
 *   npm run docs:check
 *
 * Three things rot a document that nothing checks:
 *
 * 1. A path or an `npm run` script that no longer exists, which sends the next
 *    session to the wrong place. `AGENTS.md` and `memory.md` are read first, so
 *    a broken pointer there is the most expensive; every other document is
 *    checked too.
 * 2. A status written in two places that disagree: the roadmap's phase map
 *    against its phase headings, the scope's table against its section
 *    headings, and a spec's `Status` against whether it records a build. That
 *    drift had every one of phases 6 to 8 marked unbuilt after they shipped.
 * 3. Growth: `AGENTS.md` and `memory.md` are read every session, so each has a
 *    line budget. Their rules live in `lib/doc-refs.ts` and `lib/doc-status.ts`.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { checkBudget, checkReferences, type DocProblem } from './lib/doc-refs.ts'
import { checkRoadmap, checkScope, checkSpec, specStatus } from './lib/doc-status.ts'
import { ROOT } from './lib/load.ts'

/** Read at the start of every session, and each has a line budget. */
const ENTRY_DOCUMENTS: ReadonlyArray<{ path: string; maxLines: number }> = [
  { path: 'AGENTS.md', maxLines: 200 },
  { path: 'memory.md', maxLines: 80 },
]

/** Checked for paths and scripts, without a budget: they own the detail. */
const REFERENCE_DOCUMENTS: readonly string[] = [
  'docs/PRD.md',
  'docs/MCD.md',
  'docs/BUILD_ROADMAP.md',
  'docs/scope/scope.md',
  'ui-registry.md',
]

const SPECS_DIR = 'docs/specs'

const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>
}

/** The directories a bare name may live in, so prose can name a module. */
const SOURCE_DIRS = ['src', 'scripts', 'content', 'docs', '.github', '.']

/** Every file and directory name in the source tree, for bare-name lookups. */
const bareNames = new Set<string>()

const index = (path: string): void => {
  for (const entry of readdirSync(join(ROOT, path), { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
      continue
    }

    bareNames.add(entry.name)

    if (entry.isDirectory() && entry.name !== '.freebuff') {
      index(path === '.' ? entry.name : `${path}/${entry.name}`)
    }
  }
}

for (const directory of SOURCE_DIRS) {
  if (existsSync(join(ROOT, directory)) && statSync(join(ROOT, directory)).isDirectory()) {
    index(directory)
  }
}

const repo = {
  exists: (path: string) => existsSync(join(ROOT, path)),
  existsBare: (name: string) => bareNames.has(name),
  npmScripts: new Set(Object.keys(manifest.scripts ?? {})),
}

const problems: DocProblem[] = []

/** Reads a document, or reports it missing and moves on. */
const read = (path: string): string | null => {
  try {
    return readFileSync(join(ROOT, path), 'utf8')
  } catch {
    problems.push({ file: path, line: 0, message: 'the document is missing' })
    return null
  }
}

for (const document of ENTRY_DOCUMENTS) {
  const text = read(document.path)

  if (text === null) {
    continue
  }

  problems.push(...checkReferences(document.path, text, repo))
  problems.push(...checkBudget(document.path, text, document.maxLines))
}

for (const path of REFERENCE_DOCUMENTS) {
  const text = read(path)

  if (text === null) {
    continue
  }

  problems.push(...checkReferences(path, text, repo))

  if (path === 'docs/BUILD_ROADMAP.md') {
    problems.push(...checkRoadmap(path, text))
  }

  if (path === 'docs/scope/scope.md') {
    problems.push(...checkScope(path, text))
  }
}

let specCount = 0

for (const name of readdirSync(join(ROOT, SPECS_DIR)).filter((entry) => entry.endsWith('.md')).sort()) {
  const path = `${SPECS_DIR}/${name}`
  const text = read(path)

  if (text === null) {
    continue
  }

  specCount += 1
  problems.push(...checkSpec(path, text))

  // A spec that is not built yet names files it intends to create, so only a
  // built spec has to point at things that exist. The status pair is checked
  // either way, which is the drift this guard exists for.
  if (specStatus(text) === 'Built') {
    problems.push(...checkReferences(path, text, repo))
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`${problem.file}:${problem.line} — ${problem.message}`)
  }

  process.exit(1)
}

console.log(
  `docs:check — ${ENTRY_DOCUMENTS.length} entry documents, ${REFERENCE_DOCUMENTS.length} reference documents, ${specCount} specs: paths resolve, no script is unknown, statuses agree`,
)
