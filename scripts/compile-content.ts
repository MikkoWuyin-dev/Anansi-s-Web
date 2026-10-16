/**
 * Compiles `content/topics/` into `src/content/topics.generated.ts`.
 *
 *   npm run content:build    writes the bundle
 *   npm run content:check    fails if the committed bundle is out of date
 *
 * It validates first, so a malformed entry can never reach the bundle.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { BUNDLE_PATH, renderBundle } from './lib/compile.ts'
import { ROOT, loadLibrary, partition } from './lib/load.ts'
import { formatIssues } from './lib/validate.ts'

const checkOnly = process.argv.includes('--check')

const { entries, issues } = await loadLibrary()
const { errors, warnings } = partition(issues)

if (errors.length > 0) {
  console.error('Refusing to compile: the library has errors.')
  for (const line of formatIssues(errors)) {
    console.error(line)
  }

  process.exitCode = 1
} else {
  for (const line of formatIssues(warnings)) {
    console.log(line)
  }

  const next = renderBundle(entries.map((entry) => entry.topic))
  const target = join(ROOT, BUNDLE_PATH)

  if (checkOnly) {
    let current = ''

    try {
      current = await readFile(target, 'utf8')
    } catch {
      console.error(`${BUNDLE_PATH} is missing. Run: npm run content:build`)
      process.exitCode = 1
    }

    if (process.exitCode !== 1) {
      if (current === next) {
        console.log(`${BUNDLE_PATH} is up to date (${entries.length} topics)`)
      } else {
        console.error(
          `${BUNDLE_PATH} is out of date. Run: npm run content:build`,
        )
        process.exitCode = 1
      }
    }
  } else {
    await writeFile(target, next)
    console.log(`wrote ${BUNDLE_PATH} with ${entries.length} topics`)
  }
}
