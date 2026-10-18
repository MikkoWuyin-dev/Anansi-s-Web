/**
 * The ritual controller (spec 0003).
 *
 * One place owns the loop's screen state: which view is showing, how a search
 * runs, and what taking or marking a story does. It calls the engine to choose
 * and the store to record, nothing else. React only renders what this module
 * returns, which is what keeps every rule testable in the node environment.
 *
 * The engine stays the only chooser and the store the only recorder. The app
 * shows a topic's title and never reads its domain, difficulty, or tags (PRD §8).
 */

import { journeyCount, type JourneyCount } from '@/app/history'
import type { Topic } from '@/content/types'
import { offerNextStory } from '@/engine/offer'
import { ENGINE_TUNING } from '@/engine/tuning'
import type { Offer, OfferBecause } from '@/engine/types'
import { dayRng, type JourneySnapshot, type JourneyStore } from '@/state'

/** The pause that marks the search before the world exists (spec 0003). */
export const SEARCH_DELAY_MS = 900

export const SEARCH_FAILED_MESSAGE =
  'Anansi lost the thread before he could bring a story. Nothing was recorded.'

export const MISSING_STORY_MESSAGE =
  'That story is no longer in the web. Nothing was lost, and a new story arrives after midnight.'

/** What the page is doing that the store does not record. */
export interface RitualUi {
  readonly phase: 'ready' | 'searching' | 'failed'
  /** The failed search's message, when the phase is `failed`. */
  readonly failure: string | null
  /** The day has no more offers, even though three were not used. */
  readonly sealed: boolean
}

export const INITIAL_UI: RitualUi = { phase: 'ready', failure: null, sealed: false }

/** Everything the page can show. */
export type RitualView =
  | { readonly kind: 'empty' }
  | { readonly kind: 'hero'; readonly newDay: boolean }
  | { readonly kind: 'searching' }
  | { readonly kind: 'failed'; readonly message: string }
  | { readonly kind: 'missing'; readonly message: string }
  | {
      readonly kind: 'story'
      readonly topic: Topic
      readonly because: OfferBecause
      readonly offerNumber: number
      readonly dayStory: boolean
      readonly taken: boolean
      readonly learned: boolean
      readonly canReroll: boolean
      readonly sealed: boolean
      /** The quiet journey count, absent before the first taken day (spec 0004). */
      readonly count: JourneyCount | null
    }

export interface RitualViewInput {
  readonly state: JourneySnapshot
  readonly library: readonly Topic[]
  readonly ui: RitualUi
  readonly newDay: boolean
}

/**
 * Why the current offer was chosen. The store records the story, not the
 * reason, so on load the reason is reproduced by replaying the engine for the
 * day as it stood just before that offer. The per day stream makes that exact
 * (spec 0002's `dayRng`), so a reload keeps the return line.
 */
function reasonFor(
  state: JourneySnapshot,
  library: readonly Topic[],
  topicId: string,
): OfferBecause {
  const offers = state.day.offeredTopicIds
  const replay = offerNextStory({
    library,
    history: state.history,
    day: {
      ...state.day,
      offeredTopicIds: offers.slice(0, Math.max(offers.indexOf(topicId), 0)),
      acceptedTopicId: null,
    },
    rng: dayRng(state.identity.clientId, state.day.dayKey),
  })

  return replay.kind === 'story' && replay.topic.id === topicId ? replay.because : 'new'
}

/** The status of today's record for a topic, as the store last wrote it. */
function learnedFor(state: JourneySnapshot, topicId: string): boolean {
  const index = state.history.map((record) => record.topicId).lastIndexOf(topicId)

  return index !== -1 && state.history[index]?.status === 'learned'
}

/**
 * Derive the view from the store and the transient phase. Pure: the same
 * inputs always give the same view, which is what the markup tests rely on.
 */
export function ritualView({ state, library, ui, newDay }: RitualViewInput): RitualView {
  if (ui.phase === 'failed') {
    return { kind: 'failed', message: ui.failure ?? SEARCH_FAILED_MESSAGE }
  }

  if (ui.phase === 'searching') {
    return { kind: 'searching' }
  }

  if (library.length === 0) {
    return { kind: 'empty' }
  }

  const offeredId = state.day.offeredTopicIds.at(-1)

  if (offeredId === undefined) {
    return { kind: 'hero', newDay }
  }

  const topic = library.find((candidate) => candidate.id === offeredId)

  if (topic === undefined) {
    return { kind: 'missing', message: MISSING_STORY_MESSAGE }
  }

  const offerNumber = state.day.offeredTopicIds.indexOf(offeredId) + 1
  const taken = state.day.acceptedTopicId === offeredId
  const dayStory = state.day.offeredTopicIds.length >= ENGINE_TUNING.storiesPerDay

  return {
    kind: 'story',
    topic,
    because: reasonFor(state, library, offeredId),
    offerNumber,
    dayStory,
    taken,
    learned: learnedFor(state, offeredId),
    canReroll: !taken && !dayStory && !ui.sealed,
    sealed: taken || dayStory || ui.sealed,
    count: journeyCount(state.progress),
  }
}

/** What the live region says for a view. Kept beside the view so they agree. */
export function announcementOf(view: RitualView): string {
  switch (view.kind) {
    case 'empty':
      return 'The web is empty. There are no stories to bring yet.'
    case 'hero':
      return view.newDay ? 'A new day has begun. Anansi is ready.' : ''
    case 'searching':
      return 'Anansi is searching the web.'
    case 'failed':
    case 'missing':
      return view.message
    case 'story': {
      const parts = [`A story: ${view.topic.title}.`]

      if (view.because === 'resurfaced') {
        parts.push('Anansi has brought this one back.')
      }

      if (view.taken) {
        parts.push('It is your story for today.')
      } else if (view.dayStory) {
        parts.push("This is today's story. It stays until midnight.")
      }

      if (view.learned) {
        parts.push('Marked as learned.')
      }

      return parts.join(' ')
    }
  }
}

/** What a search produced, so the caller knows whether to seal the day. */
export type SearchOutcome =
  | { readonly ok: true; readonly kind: 'story' }
  | { readonly ok: true; readonly kind: 'none'; readonly reason: 'day-complete' | 'no-candidate' | 'empty-library' }
  | { readonly ok: false; readonly message: string }

export interface RitualDeps {
  readonly store: JourneyStore
  readonly library: readonly Topic[]
  /** Injected so tests never wait; the default is the real pause. */
  readonly wait?: (ms: number) => Promise<void>
  readonly reducedMotion?: () => boolean
  /** Injected so a failed search can be exercised without breaking the engine. */
  readonly offer?: typeof offerNextStory
}

function defaultWait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Ask for the day's next story. The pause comes first so the search has a
 * beat; with reduced motion there is no artificial wait, and the announced
 * message carries the same meaning.
 */
export async function findStory({
  store,
  library,
  wait = defaultWait,
  reducedMotion = () => false,
  offer = offerNextStory,
}: RitualDeps): Promise<SearchOutcome> {
  if (!reducedMotion()) {
    await wait(SEARCH_DELAY_MS)
  }

  try {
    const snapshot = store.getState()
    const day = snapshot.ensureToday()
    const result: Offer = offer({
      library,
      history: snapshot.history,
      day,
      rng: dayRng(snapshot.identity.clientId, day.dayKey),
    })

    if (result.kind === 'none') {
      return { ok: true, kind: 'none', reason: result.reason }
    }

    store.getState().offer(result.topic.id)

    return { ok: true, kind: 'story' }
  } catch {
    return { ok: false, message: SEARCH_FAILED_MESSAGE }
  }
}

/** Take an offered story. The store refuses anything it did not offer. */
export function takeStory(store: JourneyStore, topicId: string): void {
  store.getState().accept(topicId)
}

/** Mark the taken story learned, after the person has explained it aloud. */
export function learnStory(store: JourneyStore, topicId: string): void {
  store.getState().setStatus(topicId, 'learned')
}

/** Ask the store to recheck the day, as at local midnight. Returns true on a new day. */
export function checkDay(store: JourneyStore): boolean {
  const before = store.getState().day.dayKey
  const after = store.getState().ensureToday().dayKey

  return after !== before
}
