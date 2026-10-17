import { useCallback, useEffect, useRef, useState } from 'react'

import { Ritual } from '@/app/RitualScreen'
import {
  announcementOf,
  checkDay,
  findStory,
  INITIAL_UI,
  learnStory,
  ritualView,
  takeStory,
  type RitualUi,
} from '@/app/ritual'
import { journeyStore } from '@/app/store'
import { useJourney } from '@/app/useJourney'
import { getLibrary } from '@/content/loader'
import { watchStorageEvents, type JourneyStore } from '@/state'

/** The search beat is skipped when the person asked for less motion (AC-13). */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * The ritual, wired to the journey store (spec 0003).
 *
 * This component owns only the transient phase (searching, failed) and the
 * new day flag; the view itself is derived from the store, so every rule lives
 * in `ritual.ts` and the markup lives in `Ritual.tsx`.
 */
export function App({ store = journeyStore }: { readonly store?: JourneyStore } = {}) {
  const state = useJourney(store)
  const [ui, setUi] = useState<RitualUi>(INITIAL_UI)
  const [newDay, setNewDay] = useState(false)
  const busy = useRef(false)
  const library = getLibrary()

  // Another tab writing the day rehydrates this one (spec 0002).
  useEffect(() => watchStorageEvents(store), [store])

  // Local midnight arrives while the page is open: focus, tab return, or a
  // minute check rolls the day and returns to the hero (AC-14).
  useEffect(() => {
    const check = (): void => {
      if (checkDay(store)) {
        setUi(INITIAL_UI)
        setNewDay(true)
      }
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        check()
      }
    }

    const interval = window.setInterval(check, 60_000)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [store])

  const search = useCallback(async (): Promise<void> => {
    if (busy.current) {
      return
    }

    busy.current = true
    setUi({ phase: 'searching', failure: null, sealed: false })

    const outcome = await findStory({
      store,
      library,
      reducedMotion: prefersReducedMotion,
    })

    busy.current = false

    if (!outcome.ok) {
      setUi({ phase: 'failed', failure: outcome.message, sealed: false })
      return
    }

    setNewDay(false)
    setUi({
      phase: 'ready',
      failure: null,
      sealed: outcome.kind === 'none' && outcome.reason === 'no-candidate',
    })
  }, [library, store])

  const view = ritualView({ state, library, ui, newDay })

  return (
    <main className="shell">
      <Web />

      <Ritual
        view={view}
        persistent={state.persistent}
        announcement={announcementOf(view)}
        onFind={search}
        onReroll={search}
        onRetry={search}
        onTake={() => {
          if (view.kind === 'story') {
            takeStory(store, view.topic.id)
          }
        }}
        onMarkLearned={() => {
          if (view.kind === 'story') {
            learnStory(store, view.topic.id)
          }
        }}
      />
    </main>
  )
}

/** Strand fragments framing the ritual. Procedural, decorative, non-interactive. */
function Web() {
  return (
    <div className="web" aria-hidden="true">
      <span className="strand strand--orbit" />
      <span className="strand strand--thread" />
      <span className="bead bead--lavender" />
      <span className="bead bead--strawberry" />
    </div>
  )
}
