/**
 * The stage's beats (MCD §4 rule 3, spec 0005).
 *
 * The world never owns a transition: the ritual's own view is mapped to one of
 * these values, and the stage reacts to whichever arrives. Keeping the beats
 * here, free of React and of the app, is what lets the camera and the markup be
 * tested without a renderer.
 */

export const BEATS = ['idle', 'searching', 'revealing', 'celebrating', 'resting', 'naming'] as const

export type Beat = (typeof BEATS)[number]

/** How full the web should read, from the journey's own count (PRD §20). */
export type Density = 'sparse' | 'growing' | 'dense'

/**
 * A thing the stage should notice without a beat of its own (spec 0009).
 * `sealed` is the day's third story arriving; it is sent once, at the moment
 * the search resolves, so a reload of an already sealed day sends nothing.
 */
export type Notice = 'sealed' | null

/** How far Anansi lifts himself when his name is typed (spec 0009, AC-4). */
export const NAMING_LIFT = 0.08

/** How far the clock family turns toward the hub on a sealed day (spec 0009). */
export const SEAL_TURN = 0.35

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
      // No "in the dark": the description has to be true in both token sets
      // (spec 0006), and the mode is not something the canvas reports. The
      // weave is named without a number, because the count belongs to the
      // ritual's own text, not the world's (spec 0008, AC-6).
      return days > 0
        ? `A ${densityWord(days)} web, one strand for every story you kept. Anansi waits at its centre.`
        : `A ${densityWord(days)} web. Anansi waits at its centre.`
    case 'searching':
      return 'Anansi is searching the web.'
    case 'revealing':
      return 'Anansi has returned with a story. The web holds it.'
    case 'celebrating':
      return 'The story is kept. The web answers.'
    case 'resting':
      return "The story is kept. Its thread stays in the web until tomorrow."
    case 'naming':
      // The surprise has to be described like anything else: a screen reader
      // user gets the same answer the stage gives, in words (spec 0009, AC-10).
      return 'Anansi has heard his name. The web answers.'
  }
}
