/**
 * The stage's beats (MCD §4 rule 3, spec 0005).
 *
 * The world never owns a transition: the ritual's own view is mapped to one of
 * these values, and the stage reacts to whichever arrives. Keeping the beats
 * here, free of React and of the app, is what lets the camera and the markup be
 * tested without a renderer.
 */

export const BEATS = ['idle', 'searching', 'revealing', 'celebrating', 'resting'] as const

export type Beat = (typeof BEATS)[number]

/** How full the web should read, from the journey's own count (PRD §20). */
export type Density = 'sparse' | 'growing' | 'dense'

/** The count where the web stops reading as early (PRD §20). */
export const GROWING_DAYS = 30

/** The count where the web reads as late. */
export const DENSE_DAYS = 60

export function densityWord(days: number): Density {
  if (days >= DENSE_DAYS) {
    return 'dense'
  }

  if (days >= GROWING_DAYS) {
    return 'growing'
  }

  return 'sparse'
}

/**
 * The sentence the canvas carries as its accessible description (MCD §9). It
 * names the state of the world and never a topic: the reveal belongs to the
 * DOM, and a screen reader should not hear a story twice.
 */
export function descriptionFor(beat: Beat, days: number): string {
  switch (beat) {
    case 'idle':
      return `A ${densityWord(days)} web in the dark. Anansi waits at its centre.`
    case 'searching':
      return 'Anansi is searching the web.'
    case 'revealing':
      return 'Anansi has returned with a story. The web holds it.'
    case 'celebrating':
      return 'The story is kept. The web answers.'
    case 'resting':
      return 'The story is kept. The web settles until tomorrow.'
  }
}
