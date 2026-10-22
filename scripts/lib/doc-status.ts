/**
 * The status rules behind `npm run docs:check`.
 *
 * Three documents each state a status twice: the roadmap's phase map against
 * its phase headings, the scope's at-a-glance table against its section
 * headings, and a spec's `Status` field against whether it carries a `Built`
 * line. Every one of those pairs drifted in the first month of the build and
 * nothing caught it, because a document nobody checks rots silently.
 *
 * These rules compare the two claims, so a status can only be wrong in both
 * places at once, and they read the words each document already uses rather
 * than adding a second vocabulary. Kept free of the file system so the rules
 * can be tested with plain strings, like `doc-refs.ts`.
 */

import type { DocProblem } from './doc-refs.ts'

/** The only statuses a spec may carry, written exactly as they appear. */
export const SPEC_STATUSES = ['Draft', 'In Progress', 'Built'] as const

/** The only statuses a roadmap phase may carry, in its phase map. */
export const PHASE_STATUSES = ['built', 'in progress', 'planned', 'deferred'] as const

/** The only statuses a scope feature may carry. */
export const SCOPE_STATUSES = ['planned', 'in-progress', 'done', 'existing', 'dropped'] as const

type TableRow = { readonly cells: readonly string[]; readonly line: number }

interface Table {
  readonly header: readonly string[]
  readonly rows: readonly TableRow[]
}

const isOneOf = <T extends string>(value: string, list: readonly T[]): value is T =>
  (list as readonly string[]).includes(value)

/** The cells of a markdown table row, or none when the line is not a row. */
const cellsOf = (line: string): string[] => {
  const trimmed = line.trim()

  if (!trimmed.startsWith('|')) {
    return []
  }

  return trimmed
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

/** The first table whose header carries every required column. */
const findTable = (lines: readonly string[], headers: readonly string[]): Table | null => {
  for (let index = 0; index < lines.length; index += 1) {
    const header = cellsOf(lines[index] ?? '')

    if (header.length === 0 || !headers.every((name) => header.includes(name))) {
      continue
    }

    const rows: TableRow[] = []

    // The line after a header is the `|---|` separator, never a row.
    for (let row = index + 2; row < lines.length; row += 1) {
      const cells = cellsOf(lines[row] ?? '')

      if (cells.length === 0) {
        break
      }

      rows.push({ cells, line: row + 1 })
    }

    return { header, rows }
  }

  return null
}

/** The line number a match starts on, so problems point at the right place. */
const lineOf = (text: string, index: number): number =>
  text.slice(0, index).split('\n').length

/**
 * A spec states its status once and its build once. The two have to agree:
 * a spec that says Built with no `Built` line has not recorded what landed, and
 * a spec with a `Built` line that still says In Progress is the drift this
 * guard exists for.
 */
export function checkSpec(file: string, text: string): DocProblem[] {
  const problems: DocProblem[] = []
  const status = /^\*\*Status\*\*:\s*(.*)$/m.exec(text)

  if (status === null) {
    return [{ file, line: 1, message: 'no `**Status**:` line; every spec states its status once' }]
  }

  const line = lineOf(text, status.index)
  const value = (status[1] ?? '').trim()

  if (!isOneOf(value, SPEC_STATUSES)) {
    problems.push({
      file,
      line,
      message: `status "${value}" is not one of: ${SPEC_STATUSES.join(', ')}`,
    })
  }

  const built = /^\*\*Built\*\*:\s*\S/m.test(text)

  if (value === 'Built' && !built) {
    problems.push({
      file,
      line,
      message: 'status is Built but there is no `**Built**:` line saying what landed',
    })
  }

  if (value !== 'Built' && built) {
    problems.push({
      file,
      line,
      message: `a \`**Built**:\` line is present but the status is "${value}"`,
    })
  }

  return problems
}

/** The word a phase heading has to carry for each status in the phase map. */
const PHASE_MARKERS: Record<(typeof PHASE_STATUSES)[number], RegExp> = {
  built: /\b(BUILT|COMPLETE)\b/,
  'in progress': /\bIN PROGRESS\b/,
  planned: /\b(BUILT|COMPLETE|IN PROGRESS|DEFERRED)\b/,
  deferred: /\bDEFERRED\b/,
}

/**
 * The roadmap's phase map is the one place a phase status is written, and each
 * phase heading restates it. A `**Status:**` sentence in the header is refused
 * outright: that sentence is what said "Phases 6 onward are planned, not built"
 * three phases after they shipped.
 */
export function checkRoadmap(file: string, text: string): DocProblem[] {
  const problems: DocProblem[] = []
  const lines = text.split('\n')

  lines.forEach((line, index) => {
    if (/^\*\*Status:/.test(line.trim())) {
      problems.push({
        file,
        line: index + 1,
        message: 'phase status belongs in the phase map Status column, not in a sentence',
      })
    }
  })

  const table = findTable(lines, ['Phase', 'Status'])

  if (table === null) {
    return [
      ...problems,
      { file, line: 1, message: 'no phase map with a Status column' },
    ]
  }

  const phaseColumn = table.header.indexOf('Phase')
  const statusColumn = table.header.indexOf('Status')
  const declared = new Map<string, { status: string; line: number }>()

  for (const row of table.rows) {
    const phase = row.cells[phaseColumn] ?? ''

    if (!/^\d+$/.test(phase)) {
      continue
    }

    const status = row.cells[statusColumn] ?? ''

    if (!isOneOf(status, PHASE_STATUSES)) {
      problems.push({
        file,
        line: row.line,
        message: `phase ${phase} has status "${status}"; use one of: ${PHASE_STATUSES.join(', ')}`,
      })
      continue
    }

    declared.set(phase, { status, line: row.line })
  }

  const seen = new Set<string>()

  lines.forEach((line, index) => {
    const heading = /^##\s+Phase\s+(\d+)\b/.exec(line)

    if (heading === null) {
      return
    }

    const phase = heading[1] ?? ''
    const entry = declared.get(phase)

    if (entry === undefined) {
      problems.push({
        file,
        line: index + 1,
        message: `phase ${phase} has no row in the phase map`,
      })
      return
    }

    seen.add(phase)

    const upper = line.toUpperCase()
    const marker = PHASE_MARKERS[entry.status as (typeof PHASE_STATUSES)[number]]
    const carries = marker.test(upper)

    // `planned` is the absence of every marker, so its pattern must not match.
    const ok = entry.status === 'planned' ? !carries : carries

    if (!ok) {
      problems.push({
        file,
        line: index + 1,
        message:
          entry.status === 'planned'
            ? `phase ${phase} is planned but its heading claims otherwise`
            : `phase ${phase} is "${entry.status}" but its heading does not say so`,
      })
    }
  })

  for (const [phase, entry] of declared) {
    if (!seen.has(phase)) {
      problems.push({
        file,
        line: entry.line,
        message: `the phase map lists phase ${phase}, but no "## Phase ${phase}" heading exists`,
      })
    }
  }

  return problems
}

interface ScopeSection {
  readonly label: string
  readonly status: string
  readonly line: number
  readonly body: readonly string[]
}

/** The `### <label>. <name> · <status>` sections of the scope file. */
const scopeSections = (lines: readonly string[]): ScopeSection[] => {
  const sections: ScopeSection[] = []

  lines.forEach((line, index) => {
    const heading = /^###\s+([A-Z]|\d+)\.\s+(.+?)\s+·\s+(.+)$/.exec(line)

    if (heading === null) {
      return
    }

    const body: string[] = []

    for (let next = index + 1; next < lines.length; next += 1) {
      const content = lines[next] ?? ''

      if (/^##\s|^###\s/.test(content)) {
        break
      }

      body.push(content)
    }

    sections.push({
      label: heading[1] ?? '',
      status: (heading[3] ?? '').trim(),
      line: index + 1,
      body,
    })
  })

  return sections
}

/**
 * The scope states each feature's status twice: on the at-a-glance row and on
 * the section heading. They must agree, and a section with nothing left to do
 * cannot still be `in-progress`. Without those two rules the scope can claim
 * eleven built features are `in-progress`, which is exactly what it did.
 */
export function checkScope(file: string, text: string): DocProblem[] {
  const problems: DocProblem[] = []
  const lines = text.split('\n')
  const table = findTable(lines, ['#', 'Feature', 'Status'])

  if (table === null) {
    return [{ file, line: 1, message: 'no at-a-glance table with a Status column' }]
  }

  const labelColumn = table.header.indexOf('#')
  const statusColumn = table.header.indexOf('Status')
  const declared = new Map<string, { status: string; line: number }>()

  for (const row of table.rows) {
    const label = row.cells[labelColumn] ?? ''

    if (!/^([A-Z]|\d+)$/.test(label)) {
      continue
    }

    const status = row.cells[statusColumn] ?? ''

    if (!isOneOf(status, SCOPE_STATUSES)) {
      problems.push({
        file,
        line: row.line,
        message: `feature ${label} has status "${status}"; use one of: ${SCOPE_STATUSES.join(', ')}`,
      })
      continue
    }

    declared.set(label, { status, line: row.line })
  }

  const sections = scopeSections(lines)

  for (const section of sections) {
    const entry = declared.get(section.label)
    const written = section.status.toLowerCase().replace(/\s+/g, '-')

    if (!isOneOf(written, SCOPE_STATUSES)) {
      problems.push({
        file,
        line: section.line,
        message: `section ${section.label} has status "${section.status}"; use one of: ${SCOPE_STATUSES.join(', ')}`,
      })
      continue
    }

    if (entry === undefined) {
      problems.push({
        file,
        line: section.line,
        message: `section ${section.label} has no row in the at-a-glance table`,
      })
      continue
    }

    if (entry.status !== written) {
      problems.push({
        file,
        line: section.line,
        message: `section ${section.label} says "${written}" but its table row says "${entry.status}"`,
      })
    }

    const boxes = section.body.filter((line) => /^- \[[ x]\] /.test(line)).length

    if (boxes === 0) {
      continue
    }

    const open = section.body.filter((line) => /^- \[ \] /.test(line)).length

    if (open === 0 && written !== 'done') {
      problems.push({
        file,
        line: section.line,
        message: `section ${section.label} has every box ticked but is still "${written}"; mark it done`,
      })
    }

    if (open > 0 && written === 'done') {
      problems.push({
        file,
        line: section.line,
        message: `section ${section.label} is done but still has ${open} unticked box(es)`,
      })
    }
  }

  for (const [label, entry] of declared) {
    if (!sections.some((section) => section.label === label)) {
      problems.push({
        file,
        line: entry.line,
        message: `the at-a-glance table lists ${label}, but there is no "### ${label}." section`,
      })
    }
  }

  return problems
}
