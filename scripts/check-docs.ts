/**
 * Keeps the entry-point documents trustworthy and small.
 *
 *   npm run docs:check
 *
 * `AGENTS.md` and `memory.md` are read at the start of every session. This
 * fails the gate when either names a path that does not exist or an npm script
 * that is not defined, or when either outgrows its line budget. The rules live
 * in `lib/doc-refs.ts`.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { checkBudget, checkReferences, type DocProblem } from './lib/doc-refs.ts'
import { ROOT } from './lib/load.ts'

/** Each entry-point document and the most lines it may hold. */
const DOCUMENTS: ReadonlyArray<{ path: string; maxLines: number }> = [
  { path: 'AGENTS.md', maxLines: 200 },
  { path: 'memory.md', maxLines: 80 },
]

const manifest = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>
}

const repo = {
  exists: (path: string) => existsSync(join(ROOT, path)),
  npmScripts: new Set(Object.keys(manifest.scripts ?? {})),
}

const problems: DocProblem[] = []

for (const document of DOCUMENTS) {
  if (!repo.exists(document.path)) {
    problems.push({ file: document.path, line: 0, message: 'the document is missing' })
    continue
  }

  const text = readFileSync(join(ROOT, document.path), 'utf8')
  problems.push(...checkReferences(document.path, text, repo))
  problems.push(...checkBudget(document.path, text, document.maxLines))
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`${problem.file}:${problem.line} — ${problem.message}`)
  }
  process.exit(1)
}

console.log(`docs:check — ${DOCUMENTS.map((d) => d.path).join(', ')}: every path and script resolves, within budget`)
