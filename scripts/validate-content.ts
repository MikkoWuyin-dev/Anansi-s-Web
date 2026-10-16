/**
 * Validates the topic library. Exits non-zero when anything is wrong, so it
 * can gate a commit or a build.
 *
 *   npm run content:validate
 */

import { loadLibrary, partition } from './lib/load.ts'
import { formatIssues } from './lib/validate.ts'

const { entries, issues } = await loadLibrary()
const { errors, warnings } = partition(issues)

for (const line of formatIssues(issues)) {
  console.log(line)
}

if (errors.length > 0) {
  console.log('')
}

console.log(
  `${entries.length} topics validated, ${errors.length} errors, ${warnings.length} warnings`,
)

if (errors.length > 0) {
  process.exitCode = 1
}
