/**
 * Reads the topic library from disk and validates it. Kept apart from the
 * pure rules in `validate.ts` so those can be tested without a file system.
 */

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  validateLibrary,
  validateTopic,
  type Issue,
  type ValidTopic,
} from './validate.ts'

/** The workspace root, resolved from this file so scripts run from anywhere. */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** The source of truth for the library, relative to the workspace root. */
export const TOPICS_DIR = 'content/topics'

export interface Library {
  /** Every topic that passed validation. */
  entries: ValidTopic[]
  /** Every problem found, errors and warnings together. */
  issues: Issue[]
}

/** Reads and validates every `content/topics/*.json` entry. */
export async function loadLibrary(): Promise<Library> {
  const directory = join(ROOT, TOPICS_DIR)
  const issues: Issue[] = []
  const entries: ValidTopic[] = []

  let names: string[]
  try {
    names = (await readdir(directory)).filter((name) => name.endsWith('.json'))
  } catch {
    return {
      entries,
      issues: [
        {
          file: TOPICS_DIR,
          severity: 'error',
          message: `cannot read the topics directory at ${directory}`,
        },
      ],
    }
  }

  for (const name of names.sort()) {
    const file = `${TOPICS_DIR}/${name}`
    let parsed: unknown

    try {
      parsed = JSON.parse(await readFile(join(directory, name), 'utf8'))
    } catch (error) {
      issues.push({
        file,
        severity: 'error',
        message: `invalid JSON: ${(error as Error).message}`,
      })
      continue
    }

    const result = validateTopic(parsed, file)
    issues.push(...result.issues)

    if (result.topic !== null) {
      entries.push({ topic: result.topic, file })
    }
  }

  issues.push(...validateLibrary(entries))

  return { entries, issues }
}

/** Splits issues by severity for reporting and exit codes. */
export const partition = (
  issues: readonly Issue[],
): { errors: Issue[]; warnings: Issue[] } => ({
  errors: issues.filter((issue) => issue.severity === 'error'),
  warnings: issues.filter((issue) => issue.severity === 'warning'),
})
