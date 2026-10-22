/**
 * The word that names him (spec 0009).
 *
 * Typing `anansi` anywhere outside a text field is the only hidden interaction
 * a person has to discover, so the matching lives here as plain data and
 * arithmetic: the effect in `App.tsx` only forwards a keystroke and acts on the
 * answer. Nothing is stored, and nothing here reads the clock or the DOM.
 *
 * The buffer is kept at the word's length, so a long afternoon of typing can
 * never grow it, and anything that is not a single printable character (Enter,
 * Shift, an arrow) clears it: a keystroke that is not part of a word ends the
 * attempt rather than hiding inside it.
 */

/** His name, lowercase, which is what the buffer is compared against. */
export const NAMING_WORD = 'anansi'

/** Appends one printable character and keeps at most the word's length. */
export function advanceBuffer(buffer: string, key: string): string {
  if (key.length !== 1) {
    return ''
  }

  return (buffer + key.toLowerCase()).slice(-NAMING_WORD.length)
}

/** Whether the buffer is exactly the word. */
export function namesHim(buffer: string): boolean {
  return buffer === NAMING_WORD
}

/**
 * Whether a keystroke is going into a field the person is using. Typed in the
 * history search, his name must stay a search for a title.
 */
export function isTypingTarget(target: unknown): boolean {
  if (typeof target !== 'object' || target === null) {
    return false
  }

  const element = target as { tagName?: unknown; isContentEditable?: unknown }
  const tag = typeof element.tagName === 'string' ? element.tagName.toLowerCase() : ''

  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    element.isContentEditable === true
  )
}

export interface NamingInput {
  /** The buffer the last keystroke left behind. */
  readonly buffer: string
  /** `KeyboardEvent.key`. */
  readonly key: string
  /** `KeyboardEvent.target`. */
  readonly target?: unknown
  /** A modifier was held, so this is a shortcut rather than a word. */
  readonly modifier?: boolean
  /** A search is running, which the surprise must never interrupt (AC-1). */
  readonly searching?: boolean
  /** He answers once a session (AC-1). */
  readonly alreadyNamed?: boolean
}

export interface NamingResult {
  readonly buffer: string
  readonly named: boolean
}

/**
 * One keystroke. The buffer is cleared whenever the keystroke could not be part
 * of the word, so a suppressed attempt cannot be completed later by accident.
 */
export function namingStep(input: NamingInput): NamingResult {
  if (isTypingTarget(input.target)) {
    return { buffer: '', named: false }
  }

  const buffer = advanceBuffer(input.buffer, input.key)
  const blocked =
    input.modifier === true || input.searching === true || input.alreadyNamed === true

  return { buffer, named: !blocked && namesHim(buffer) }
}
