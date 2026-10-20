/**
 * Which token set the page wears, and the system preference behind it
 * (spec 0007).
 *
 * The mode has one authority: `<html data-mode>`. The stylesheet reads it, the
 * stage receives it as a prop, and the switch writes it. The stored choice is
 * the person's; `system` follows `prefers-color-scheme` live. Everything that
 * can be decided without a browser is a pure function here, so the rules are
 * tested in the node environment.
 */

import { createBrowserStorage, readChoice, writeChoice, type ModeChoice } from '@/state'
import type { Mode } from '@/world/palette'

/** The attribute the token blocks are selected by. */
export const MODE_ATTRIBUTE = 'data-mode'

/** The query that decides the mode when the person has not chosen one. */
export const SYSTEM_MODE_QUERY = '(prefers-color-scheme: light)'

const storage = createBrowserStorage()

/** What the operating system prefers, with dark as the safe default. */
export function systemMode(): Mode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark'
  }

  return window.matchMedia(SYSTEM_MODE_QUERY).matches ? 'light' : 'dark'
}

/** Follow the system preference while the page is open. */
export function subscribeToSystemMode(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => undefined
  }

  const query = window.matchMedia(SYSTEM_MODE_QUERY)
  query.addEventListener('change', onChange)

  return () => query.removeEventListener('change', onChange)
}

/** An explicit choice wins; `system` follows the argument. */
export function resolveMode(choice: ModeChoice, system: Mode): Mode {
  return choice === 'system' ? system : choice
}

/** The choice a click produces: always the opposite of what is showing. */
export function toggleChoice(choice: ModeChoice, system: Mode): Mode {
  return resolveMode(choice, system) === 'light' ? 'dark' : 'light'
}

/**
 * Put the resolved mode where the CSS and the next load can find it, and carry
 * the token set into the browser's own chrome (spec 0006, AC-7). The surface is
 * read from the stylesheet rather than restated here, so there is one value.
 */
export function applyMode(mode: Mode): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.dataset.mode = mode

  const surface =
    typeof getComputedStyle === 'function'
      ? getComputedStyle(root).getPropertyValue('--anansi-surface').trim()
      : ''

  if (surface !== '') {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', surface)
  }
}

export function loadChoice(): ModeChoice {
  return readChoice(storage)
}

export function saveChoice(choice: ModeChoice): void {
  writeChoice(storage, choice)
}
