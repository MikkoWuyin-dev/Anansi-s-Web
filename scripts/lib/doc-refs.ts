/**
 * The rules behind `npm run docs:check`, kept free of the file system so they
 * can be tested with plain strings.
 *
 * The entry-point documents are read at the start of every session, so a path
 * in them that no longer exists sends every agent to the wrong place, and a
 * file that keeps growing costs every session more to read. These rules catch
 * both. They deliberately check nothing a command can already answer: counts,
 * sizes, and git state are not written into the documents in the first place.
 */

/** One problem found in a document. */
export interface DocProblem {
  file: string
  line: number
  message: string
}

/** What the rules need to know about the repository. */
export interface RepoView {
  /** True when the repository-relative path exists, as a file or a directory. */
  exists: (path: string) => boolean
  /** The names under `scripts` in package.json. */
  npmScripts: ReadonlySet<string>
}

/** File extensions that mark an inline-code span as a path to check. */
const PATH_EXTENSIONS = /\.(md|ts|tsx|mjs|js|json|ya?ml|css|html)$/

/**
 * Decides whether an inline-code span names a repository path, and returns the
 * path without a trailing anchor, or null when the span is not a path.
 */
export const pathIn = (span: string): string | null => {
  const text = span.trim()

  // Commands, URLs, keys, templates, globs, markup, and prose are not paths.
  if (/[\s:*<>{}$|@]/.test(text) || text.startsWith('-')) {
    return null
  }

  const path = text.replace(/#.*$/, '')
  const hasSlash = path.includes('/')

  // A bare extension such as `.tsx` names a kind of file, not a file.
  if (/^\.\w+$/.test(path)) {
    return null
  }

  if (!hasSlash && !PATH_EXTENSIONS.test(path)) {
    return null
  }

  if (hasSlash && !PATH_EXTENSIONS.test(path) && !path.endsWith('/')) {
    return null
  }

  return path
}

/** Finds every broken path and unknown `npm run` script in one document. */
export const checkReferences = (
  file: string,
  text: string,
  repo: RepoView,
): DocProblem[] => {
  const problems: DocProblem[] = []

  text.split('\n').forEach((content, index) => {
    for (const match of content.matchAll(/`([^`]+)`/g)) {
      const span = match[1]
      const script = /^npm run ([\w:-]+)/.exec(span.trim())

      if (script !== null) {
        if (!repo.npmScripts.has(script[1])) {
          problems.push({ file, line: index + 1, message: `\`npm run ${script[1]}\` is not a script in package.json` })
        }
        continue
      }

      const path = pathIn(span)

      if (path !== null && !repo.exists(path.replace(/\/$/, ''))) {
        problems.push({ file, line: index + 1, message: `\`${path}\` does not exist` })
      }
    }
  })

  return problems
}

/** Fails a document that has grown past its budget. */
export const checkBudget = (file: string, text: string, maxLines: number): DocProblem[] => {
  const lines = text.endsWith('\n') ? text.split('\n').length - 1 : text.split('\n').length

  return lines > maxLines
    ? [{ file, line: maxLines + 1, message: `${lines} lines, over the ${maxLines} line budget; move detail to the document that owns it` }]
    : []
}
