/**
 * Turns the state assessment's factual claims into assertions.
 *
 * The document text and a bundle of measured facts go in; the claims the
 * repository no longer supports come out. The file system, git, and npm stay
 * out of this module, so the rules are tested against fixtures rather than
 * against whatever the repository happens to look like today.
 *
 * Scope, and the reasoning behind it:
 *
 * - The amendment history is skipped. Those entries record what was true when
 *   they were written, so a number in them is history, not drift.
 * - Counts and sizes are measured over the working set: the files git tracks,
 *   plus any file that is not tracked yet and not ignored. In a clean tree the
 *   two are the same, but in a tree carrying a new file the numbers then match
 *   both before and after the commit that adds it. Tracked state itself is
 *   checked separately, against `git ls-files` alone, so "present but
 *   untracked" is still reported as such.
 * - Claims that need the network or a live install cannot be reproduced in a
 *   gate: the CI run id, `npm ci`'s package count, `npm audit`'s advisories.
 *   They are left unchecked rather than approximated.
 * - One weight-table cell is unchecked on purpose: "Build config" names a set of
 *   files the document never defines and gives an approximate line count, so a
 *   checker that guessed at the membership would produce noise rather than
 *   signal. Every other cell in that table is compared, file counts included.
 * - The repository map's tree is read for its per-area test totals. Whether
 *   every tracked file still appears in the tree is not checked line by line:
 *   the "N tracked files" count on its first line already forces the map to be
 *   revisited whenever the file set changes.
 * - Every rule refuses to pass silently. When a claim it knows how to check
 *   disappears from the document, that is reported too, so a check cannot be
 *   quietly dropped by deleting the sentence it guarded.
 */

/** A markdown document in `docs/` and how long it is. */
export interface DocFact {
  /** Path relative to the repository root, forward slashes. */
  path: string
  /** Lines, counted the way `wc -l` counts them. */
  lines: number
}

/** A group of tracked files, by size. */
export interface AreaFact {
  files: number
  lines: number
}

/** Everything a rule may compare a documented claim against. */
export interface Facts {
  /** Every path git tracks, relative to the repository root, forward slashes. */
  trackedFiles: readonly string[]
  /**
   * Every path the repository holds: the tracked files, plus files that are
   * untracked and not ignored. Counts and sizes are measured over these, so a
   * number does not go stale merely because its file is not committed yet.
   */
  workingFiles: readonly string[]
  /** The markdown documents directly in `docs/`. */
  docs: readonly DocFact[]
  /** The `skills/` workflow toolkit. */
  skills: AreaFact & { count: number }
  /** The authoring scripts. */
  scripts: AreaFact
  /** The application source under `src/`. */
  src: AreaFact
  /** The topic library. */
  content: AreaFact & { topics: number; difficulty: readonly number[] }
  /** The suite as vitest collects it, without running it. */
  tests: {
    byFile: Readonly<Record<string, number>>
    files: number
    total: number
  }
  /** The scripts `package.json` defines. */
  npmScripts: Readonly<Record<string, string>>
  /** The steps `npm run verify` runs, in order, as script names. */
  verifySteps: readonly string[]
  /** `engines.node` from `package.json`. */
  nodeEngine: string
  /** `lockfileVersion` from `package-lock.json`. */
  lockfileVersion: number
  /** Installed versions, by package name, read from the lockfile. */
  lockVersions: Readonly<Record<string, string>>
  /** What `.github/workflows/verify.yml` declares. */
  workflow: {
    uses: readonly string[]
    nodeVersion: string | null
    commands: readonly string[]
  }
  /** How many features `docs/scope/scope.md` enrols and plans. */
  scope: { enrolled: number; planned: number }
  /** Whether a repository-relative path exists on disk. */
  exists: (path: string) => boolean
}

/** A documented claim the repository no longer supports. */
export interface Violation {
  /** What the claim is about, phrased so a reader knows what to fix. */
  claim: string
  /** What the document says. */
  documented: string
  /** What the repository actually shows. */
  actual: string
  /** One-based line number, or 0 when the claim could not be located. */
  line: number
}

export interface ClaimReport {
  violations: Violation[]
  /** How many claims were actually compared. */
  checked: number
}

/** Escapes a literal string for use inside a regular expression. */
const escape = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Reads a documented number, tolerating thousands separators. */
const number = (value: string): number => Number(value.replaceAll(',', ''))

/** One-based line of the first line matching `pattern`, or 0. */
const lineOf = (text: string, pattern: RegExp): number => {
  const index = text.split('\n').findIndex((line) => pattern.test(line))
  return index === -1 ? 0 : index + 1
}

/**
 * Blanks the amendment history, keeping every other line in place so line
 * numbers stay true. Entries there describe an earlier check by contract.
 */
const withoutAmendmentHistory = (
  markdown: string,
): { text: string; found: boolean } => {
  const lines = markdown.split('\n')
  const start = lines.findIndex((line) => /^##\s+Amendment history\s*$/.test(line))

  if (start === -1) {
    return { text: markdown, found: false }
  }

  const closing = lines.findIndex(
    (line, index) => index > start && line.trim() === '---',
  )
  const stop = closing === -1 ? lines.length - 1 : closing

  return {
    text: lines
      .map((line, index) => (index >= start && index <= stop ? '' : line))
      .join('\n'),
    found: true,
  }
}

/**
 * A repository path token, as the file lists spell it: a slash or a dot marks
 * a path, which leaves a bare directory name ambiguous with a description word.
 */
const looksLikePath = (token: string): boolean =>
  /^[\w.@-]+(?:\/[\w.@-]+)*\/?$/.test(token) &&
  (token.includes('/') || token.includes('.'))

/**
 * The repository map's per-area test totals, as in "* 30 tests" listed under
 * `scripts/lib/`. Resolving which directory owns a line needs the tree's
 * indentation, so the walk keeps a stack of directories by indent width.
 */
export const mapAreaTestClaims = (
  text: string,
): { area: string; count: number; line: number }[] => {
  const lines = text.split('\n')
  const stack: { indent: number; path: string }[] = []
  const claims: { area: string; count: number; line: number }[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const node = lines[index].match(/^([\s│]*)(?:├──|└──) (\S+)(\s{2,}.*)?$/)
    if (node === null) {
      continue
    }

    const indent = node[1].length
    const name = node[2]

    if (name.endsWith('/')) {
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }

      const parent = stack.length > 0 ? stack[stack.length - 1].path : ''
      stack.push({ indent, path: `${parent}${name}` })
      continue
    }

    const claim = (node[3] ?? '').match(/(\d+) tests\b/)
    if (claim === null) {
      continue
    }

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    const owner = stack.length > 0 ? stack[stack.length - 1].path : ''
    if (owner !== '') {
      claims.push({ area: owner, count: Number(claim[1]), line: index + 1 })
    }
  }

  return claims
}

/** The steps a verify chain names, whether it is written with `&&` or `+`. */
const splitChain = (chain: string): string[] =>
  chain
    .split(/\s*(?:&&|\+)\s*/)
    .map((step) => step.trim())
    .filter((step) => step !== '')

/**
 * Compares every claim this module knows how to check against the facts.
 *
 * Returns the violations plus how many claims were compared, so a run that
 * quietly stopped checking things can be seen rather than assumed.
 */
export function checkClaims(markdown: string, facts: Facts): ClaimReport {
  const violations: Violation[] = []
  let checked = 0

  const fail = (
    claim: string,
    documented: string,
    actual: string,
    line: number,
  ): void => {
    violations.push({ claim, documented, actual, line })
  }

  const compare = (
    claim: string,
    documented: string | number,
    actual: string | number,
    line: number,
  ): void => {
    if (String(documented) !== String(actual)) {
      fail(claim, String(documented), String(actual), line)
    }
  }

  /**
   * Walks the document line by line, so every violation can name its line, and
   * returns how many times the pattern matched.
   */
  const scan = (
    text: string,
    pattern: RegExp,
    visit: (line: number, groups: string[]) => void,
  ): number => {
    const lines = text.split('\n')
    let seen = 0

    for (let index = 0; index < lines.length; index += 1) {
      for (const match of lines[index].matchAll(pattern)) {
        seen += 1
        visit(
          index + 1,
          [...match].slice(1).map((part) => part ?? ''),
        )
      }
    }

    return seen
  }

  /**
   * Records that a claim family must still be stated, and reports it when the
   * document has stopped stating it at least `minimum` times.
   */
  const seen = (claim: string, minimum: number, actual: number): void => {
    if (actual < minimum) {
      fail(
        claim,
        actual === 0 ? 'the claim is gone' : `stated ${actual} time(s)`,
        minimum === 1 ? 'the document states it' : `stated ${minimum} times`,
        0,
      )
    }
  }

  /** Repeats one claim shape over several phrasings of the same fact. */
  const claims = (
    claim: string,
    patterns: RegExp[],
    value: number,
  ): void => {
    for (const pattern of patterns) {
      const found = scan(current, pattern, (line, [documented]) => {
        checked += 1
        compare(claim, documented, value, line)
      })
      seen(claim, 1, found)
    }
  }

  const { text: current, found: hasHistory } = withoutAmendmentHistory(markdown)
  seen('the amendment history exists', 1, hasHistory ? 1 : 0)

  // Where the repository is, before what it contains.

  const headerLine = lineOf(markdown, /^- \*\*Last updated:\*\*/)
  const headerVersion = markdown.match(
    /^- \*\*Last updated:\*\* \S+ \(v(\d+\.\d+)\)/m,
  )?.[1]
  const closingVersion = markdown.match(
    /^\*End of System Teardown v(\d+\.\d+)/m,
  )?.[1]
  const amendmentVersions = [...markdown.matchAll(/^\*\*v(\d+\.\d+) — /gm)].map(
    (match) => match[1],
  )
  const latestVersion = amendmentVersions[amendmentVersions.length - 1]

  checked += 2
  if (headerVersion === undefined || closingVersion === undefined) {
    fail(
      'the document states its own version',
      'a header version and a closing version',
      'one or both are missing',
      headerLine,
    )
  } else {
    compare(
      'the header version against the closing version',
      headerVersion,
      closingVersion,
      headerLine,
    )
  }

  compare(
    'the header version against the newest amendment entry',
    headerVersion ?? 'absent',
    latestVersion ?? 'absent',
    headerLine,
  )

  // Counts and totals.

  const held = scan(current, /(\d+) tracked files/g, (line, [value]) => {
    checked += 1
    compare(
      'the repository map: how many files the repository holds',
      value,
      facts.workingFiles.length,
      line,
    )
  })
  seen('the repository map: how many files the repository holds', 1, held)

  const docByAlias = new Map<string, DocFact>()
  for (const doc of facts.docs) {
    const name = doc.path.split('/').at(-1) ?? doc.path
    docByAlias.set(name, doc)
    docByAlias.set(name.replace(/\.md$/, ''), doc)
  }

  const aliases = [...docByAlias.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escape)

  if (aliases.length > 0) {
    const docLines = scan(
      current,
      new RegExp(`\\b(${aliases.join('|')})\\b[^\\n]*?(\\d+) lines`, 'g'),
      (line, [alias, value]) => {
        const doc = docByAlias.get(alias)
        if (doc === undefined) {
          return
        }

        checked += 1
        compare(`the line count of \`${doc.path}\``, value, doc.lines, line)
      },
    )
    seen('the line counts of the documents in `docs/`', 3, docLines)
  }

  const docLinesTotal = facts.docs.reduce((sum, doc) => sum + doc.lines, 0)

  const weightRows: { label: string; files?: number; lines?: number }[] = [
    {
      label: 'Workflow skills',
      files: facts.skills.files,
      lines: facts.skills.lines,
    },
    {
      label: 'Project documentation',
      files: facts.docs.length,
      lines: docLinesTotal,
    },
    {
      label: 'Authoring scripts',
      files: facts.scripts.files,
      lines: facts.scripts.lines,
    },
    {
      label: 'Application source',
      files: facts.src.files,
      lines: facts.src.lines,
    },
  ]

  for (const row of weightRows) {
    const rows = scan(
      current,
      new RegExp(`\\| ${escape(row.label)} \\| (\\d+) \\| ([\\d,]+) \\|`, 'g'),
      (line, [files, lines]) => {
        if (row.files !== undefined) {
          checked += 1
          compare(
            `the weight table: ${row.label}, files`,
            number(files),
            row.files,
            line,
          )
        }

        if (row.lines !== undefined) {
          checked += 1
          compare(
            `the weight table: ${row.label}, lines`,
            number(lines),
            row.lines,
            line,
          )
        }
      },
    )
    seen(`the weight table row \`${row.label}\``, 1, rows)
  }

  const contentRow = scan(
    current,
    /\| Content \(([\d,]+) JSON \+ 1 README\) \| (\d+) \| ([\d,]+) \|/g,
    (line, [json, files, lines]) => {
      checked += 3
      compare(
        'the weight table: how many topic files `content/topics/` holds',
        number(json),
        facts.content.topics,
        line,
      )
      compare(
        'the weight table: Content, files',
        number(files),
        facts.content.files,
        line,
      )
      compare(
        'the weight table: Content, lines',
        number(lines),
        facts.content.lines,
        line,
      )
    },
  )
  seen('the weight table row `Content`', 1, contentRow)

  claims(
    'the weight of `skills/`, in files',
    [/(\d+) files, ~[\d,]+ lines/g],
    facts.skills.files,
  )
  claims(
    'how many skills `skills/` holds',
    [/([\d,]+) skills\b/g, /(\d+) workflow skills\b/g],
    facts.skills.count,
  )

  // The topic library.

  const topicClaims: { claim: string; patterns: RegExp[] }[] = [
    {
      claim: 'how many reviewed topics the library holds',
      patterns: [/(\d+) reviewed topics/g],
    },
    {
      claim: 'how many reviewed JSON entries `content/topics/` holds',
      patterns: [/(\d+) reviewed JSON entries/g],
    },
    {
      claim: 'how many topics of the 300+ launch target exist',
      patterns: [/(\d+) of 300\+/g],
    },
    {
      claim: 'how many topics the compiled bundle holds',
      patterns: [/is up to date \((\d+) topics\)/g],
    },
    {
      claim: 'how many topics the library holds, one per domain',
      patterns: [/(\d+) topics, one per domain/g],
    },
    {
      claim: 'how many stories the shell reports',
      patterns: [/holds (\d+) stories/g],
    },
  ]

  for (const { claim, patterns } of topicClaims) {
    claims(claim, patterns, facts.content.topics)
  }

  const spread = scan(
    current,
    /balanced (\d+) \/ (\d+) \/ (\d+) across difficulty levels/g,
    (line, groups) => {
      checked += groups.length
      groups.forEach((value, index) => {
        compare(
          `the difficulty spread at level ${index + 1}`,
          value,
          facts.content.difficulty[index] ?? 'no such level',
          line,
        )
      })
    },
  )
  seen('the difficulty spread across the three levels', 1, spread)

  // The test suite.

  const transcriptHeading = lineOf(current, /^### 5\.3 Tests/)

  const perFile = scan(
    current,
    /✓ (\S+\.test\.ts)\s+\(\s*(\d+) tests\)/g,
    (line, [file, count]) => {
      checked += 1
      const actual = facts.tests.byFile[file]

      if (actual === undefined) {
        fail(
          `the suite: ${file}`,
          `${count} tests`,
          'no such test file is collected',
          line,
        )
        return
      }

      compare(`the suite: ${file}`, count, actual, line)
    },
  )
  seen('the per-file test counts', 1, perFile)

  for (const file of Object.keys(facts.tests.byFile).sort()) {
    checked += 1
    if (!current.includes(file)) {
      fail(
        `the suite: ${file} is listed in the transcript`,
        'not listed',
        `${facts.tests.byFile[file]} tests are collected from it`,
        transcriptHeading,
      )
    }
  }

  const fileTotals = scan(
    current,
    /Test Files\s+(\d+) passed \((\d+)\)/g,
    (line, [first, second]) => {
      checked += 2
      compare('how many test files the suite holds', first, facts.tests.files, line)
      compare('how many test files the suite holds', second, facts.tests.files, line)
    },
  )
  seen('the test file count in the transcript', 1, fileTotals)

  const testTotals = scan(
    current,
    /^\s*Tests\s+(\d+) passed \((\d+)\)/gm,
    (line, [first, second]) => {
      checked += 2
      compare('how many tests the suite holds', first, facts.tests.total, line)
      compare('how many tests the suite holds', second, facts.tests.total, line)
    },
  )
  seen('the test total in the transcript', 1, testTotals)

  claims(
    'how many tests the suite holds',
    [/Tests — PASS, (\d+) of them/g, /vitest run — (\d+) tests/g],
    facts.tests.total,
  )

  const ciTotals = scan(
    current,
    /(\d+) tests passed, (\d+) files/g,
    (line, [tests, files]) => {
      checked += 2
      compare('how many tests the suite holds', tests, facts.tests.total, line)
      compare('how many test files the suite holds', files, facts.tests.files, line)
    },
  )
  seen('the CI table test totals', 1, ciTotals)

  const areaClaims = mapAreaTestClaims(current)
  for (const { area, count, line } of areaClaims) {
    const collected = Object.entries(facts.tests.byFile).filter(([file]) =>
      file.startsWith(area),
    )

    // A directory holding no collected tests is not a claim this module can
    // resolve, so it is left alone rather than guessed at.
    if (collected.length === 0) {
      continue
    }

    checked += 1
    compare(
      `the repository map: tests under \`${area}\``,
      count,
      collected.reduce((sum, [, tests]) => sum + tests, 0),
      line,
    )
  }
  seen('the repository map: per-area test totals', 1, areaClaims.length)

  // The gate, and the steps it runs.

  const chains = scan(
    current,
    /npm run verify\s+# (?:THE gate: )?(.+)$/gm,
    (line, [chain]) => {
      checked += 1
      const described = splitChain(chain)

      if (described.join(' && ') !== facts.verifySteps.join(' && ')) {
        fail(
          'the steps `npm run verify` runs',
          described.join(' && '),
          facts.verifySteps.join(' && '),
          line,
        )
      }
    },
  )
  seen('the composition of `npm run verify`', 1, chains)

  const words = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
  ]

  const gateSummary = scan(
    current,
    /All (\w+) gates \(([^)]+)\)/g,
    (line, [word, list]) => {
      checked += 2
      const names = list
        .split(',')
        .map((name) => name.trim().replaceAll('`', ''))
        .filter((name) => name !== '')

      compare(
        'how many steps the gate runs',
        word,
        words[facts.verifySteps.length] ?? String(facts.verifySteps.length),
        line,
      )

      if (names.join(' && ') !== facts.verifySteps.join(' && ')) {
        fail(
          'the steps the gate summary lists',
          names.join(' && '),
          facts.verifySteps.join(' && '),
          line,
        )
      }
    },
  )
  seen('the gate summary sentence', 1, gateSummary)

  const scriptRefs = scan(current, /npm run ([a-z][\w:]*)/g, (line, [name]) => {
    checked += 1
    if (!Object.hasOwn(facts.npmScripts, name)) {
      fail(
        `the command \`npm run ${name}\``,
        'documented as a script',
        'package.json defines no such script',
        line,
      )
    }
  })
  seen('a reference to an npm script', 5, scriptRefs)

  // The toolchain.

  const nodeFloor = scan(current, /Node ≥ (\d+\.\d+)/g, (line, [floor]) => {
    checked += 1
    compare(
      'the Node floor in `engines.node`',
      floor,
      facts.nodeEngine.match(/(\d+\.\d+)/)?.[1] ?? 'none declared',
      line,
    )
  })
  seen('the Node runtime floor', 1, nodeFloor)

  const lockVersion = scan(current, /lockfile v(\d+)/g, (line, [version]) => {
    checked += 1
    compare('the lockfile version', version, facts.lockfileVersion, line)
  })
  seen('the lockfile version', 1, lockVersion)

  /**
   * §5.8 writes the react-spring pair as "@react-spring/web and /three", so the
   * second name reaches the rule as a bare slash. Anything else that is not an
   * installed package name is assumed to be prose and left alone.
   */
  const lockVersionOf = (name: string): string | undefined => {
    const direct = facts.lockVersions[name]
    if (direct !== undefined) {
      return direct
    }

    return name === '/three'
      ? facts.lockVersions['@react-spring/three']
      : undefined
  }

  const installedVersions = scan(
    current,
    /([^\s]+) (\d+\.\d+\.\d+)/g,
    (line, [name, version]) => {
      const actual = lockVersionOf(name)
      if (actual === undefined) {
        return
      }

      checked += 1
      compare(`the installed version of \`${name}\``, version, actual, line)
    },
  )
  seen('the installed versions of the named dependencies', 1, installedVersions)

  const workflowUses = scan(
    current,
    /([\w.-]+\/[\w.-]+@v\d+)/g,
    (line, [reference]) => {
      checked += 1
      if (!facts.workflow.uses.includes(reference)) {
        fail(
          `the workflow uses \`${reference}\``,
          reference,
          facts.workflow.uses.join(', ') || 'no actions are declared',
          line,
        )
      }
    },
  )
  seen('the version of each action the workflow uses', 1, workflowUses)

  const workflowNode = scan(current, /Node `(\d+\.x)`/g, (line, [version]) => {
    checked += 1
    compare(
      'the Node version the workflow runs',
      version,
      facts.workflow.nodeVersion ?? 'none declared',
      line,
    )
  })
  seen('the Node version the workflow runs', 1, workflowNode)

  const workflowCommands = scan(
    current,
    /npm ci`? (?:and|\+) `?npm run verify/g,
    (line) => {
      for (const command of ['npm ci', 'npm run verify']) {
        checked += 1
        if (!facts.workflow.commands.includes(command)) {
          fail(
            `the workflow runs \`${command}\``,
            command,
            facts.workflow.commands.join(', ') || 'no commands are declared',
            line,
          )
        }
      }
    },
  )
  seen('the commands the workflow runs', 1, workflowCommands)

  // The file lists.

  const isTracked = (path: string): boolean => {
    if (facts.trackedFiles.includes(path)) {
      return true
    }

    const prefix = path.endsWith('/') ? path : `${path}/`
    return facts.trackedFiles.some((file) => file.startsWith(prefix))
  }

  const listed = (
    claim: (path: string) => string,
    path: string,
    present: boolean,
    line: number,
  ): void => {
    checked += 1
    const onDisk = facts.exists(path)

    if (present && !onDisk) {
      fail(claim(path), 'present and tracked', 'not on disk', line)
      return
    }

    if (present && !isTracked(path)) {
      fail(claim(path), 'present and tracked', 'present but untracked', line)
      return
    }

    if (!present && onDisk) {
      fail(claim(path), 'missing', 'it exists on disk', line)
    }
  }

  const presence = scan(
    current,
    /^(PRESENT|MISSING)\s{2,}(.+)$/gm,
    (line, [kind, rest]) => {
      const present = kind === 'PRESENT'

      for (const token of rest.split(/\s+/)) {
        // A bare name such as `scripts` is only a path when git actually
        // tracks something under it, which keeps description words like "CI"
        // and "gate" out of the file list.
        if (looksLikePath(token) || isTracked(token)) {
          listed(
            (path) => `the ${kind.toLowerCase()} list: \`${path}\``,
            token,
            present,
            line,
          )
        }
      }
    },
  )
  seen('the present-versus-missing list', 7, presence)

  const pathTable = scan(
    current,
    /\|\s*`([^`]+)`\s*\|\s*\*{0,2}(Present|Missing)\*{0,2}\s*\|/g,
    (line, [path, kind]) =>
      listed(
        (value) => `the path table: \`${value}\``,
        path,
        kind === 'Present',
        line,
      ),
  )
  seen('the path-by-path table', 12, pathTable)

  // The scope.

  const scopeFeatures = scan(
    current,
    /(\d+) enrolled and (\d+) planned/g,
    (line, [enrolled, planned]) => {
      checked += 2
      compare(
        'how many features the scope enrols',
        enrolled,
        facts.scope.enrolled,
        line,
      )
      compare(
        'how many features the scope plans',
        planned,
        facts.scope.planned,
        line,
      )
    },
  )
  seen('the scope feature counts', 1, scopeFeatures)

  return { violations, checked }
}
