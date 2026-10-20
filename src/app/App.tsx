import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

import { HistoryPanel } from '@/app/HistoryPanel'
import { historyView, type HistoryFilter } from '@/app/history'
import {
  applyMode,
  loadChoice,
  resolveMode,
  saveChoice,
  subscribeToSystemMode,
  systemMode,
  toggleChoice,
} from '@/app/mode'
import { ModeSwitch } from '@/app/ModeSwitch'
import { Ritual } from '@/app/RitualScreen'
import { WorldLayer } from '@/app/WorldLayer'
import {
  announcementOf,
  beatFor,
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
import {
  daysCompleted,
  watchStorageEvents,
  type JourneyStore,
  type ModeChoice,
} from '@/state'
import { CELEBRATE_MS } from '@/world/choreography'

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
  // The web answers once when a story is kept, then settles (spec 0005, AC-9).
  const [celebrating, setCelebrating] = useState(false)
  const celebrateTimer = useRef<number | null>(null)
  // The drawer's narrowing controls are session state: closing keeps them,
  // a reload starts again at All with no query (spec 0004, AC-10).
  const [historyOpen, setHistoryOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const historyHeading = useRef<HTMLHeadingElement>(null)
  const historyControl = useRef<HTMLButtonElement>(null)
  const busy = useRef(false)
  const library = getLibrary()

  // The mode has one authority: the document attribute (spec 0007). The
  // choice is the person's; with none, the system preference decides and is
  // followed while the page stays open.
  const [choice, setChoice] = useState<ModeChoice>(loadChoice)
  const system = useSyncExternalStore(subscribeToSystemMode, systemMode, () => 'dark' as const)
  const mode = resolveMode(choice, system)

  useLayoutEffect(() => {
    applyMode(mode)
  }, [mode])

  const switchMode = useCallback((): void => {
    const next = toggleChoice(choice, system)
    const commit = (): void => {
      applyMode(next)
      setChoice(next)
      saveChoice(next)
    }

    const transition = (
      document as Document & { startViewTransition?: (run: () => void) => void }
    ).startViewTransition

    // The crossfade is the only animation the change gets, and the person who
    // asked for less motion does not get it (AC-6).
    if (prefersReducedMotion() || typeof transition !== 'function') {
      commit()
      return
    }

    transition.call(document, () => {
      flushSync(commit)
    })
  }, [choice, system])

  // Opening the panel places focus on its heading, so the list is the next
  // thing read rather than the top of the page (AC-12).
  useEffect(() => {
    if (historyOpen) {
      historyHeading.current?.focus()
    }
  }, [historyOpen])

  const closeHistory = useCallback((): void => {
    setHistoryOpen(false)
    historyControl.current?.focus()
  }, [])

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

  useEffect(
    () => () => {
      if (celebrateTimer.current !== null) {
        window.clearTimeout(celebrateTimer.current)
      }
    },
    [],
  )

  const view = ritualView({ state, library, ui, newDay })
  const take = useCallback((): void => {
    if (view.kind !== 'story') {
      return
    }

    takeStory(store, view.topic.id)

    if (prefersReducedMotion()) {
      return
    }

    setCelebrating(true)

    if (celebrateTimer.current !== null) {
      window.clearTimeout(celebrateTimer.current)
    }

    celebrateTimer.current = window.setTimeout(() => setCelebrating(false), CELEBRATE_MS)
  }, [store, view])

  const history = historyView({
    state,
    library,
    query,
    filter,
    today: state.day.dayKey,
  })

  return (
    <main className="shell">
      <WorldLayer
        beat={beatFor(view, celebrating)}
        days={daysCompleted(state.progress)}
        seed={`${state.identity.clientId}:${state.progress.journeyStart}`}
        mode={mode}
      />

      <Web />

      <div className="controls">
        <ModeSwitch mode={mode} onToggle={switchMode} />

        <button
          className="history-open"
          type="button"
          ref={historyControl}
          aria-expanded={historyOpen}
          aria-controls="history-panel"
          onClick={() => {
            if (historyOpen) {
              closeHistory()
            } else {
              setHistoryOpen(true)
            }
          }}
        >
          History
        </button>
      </div>

      <Ritual
        view={view}
        persistent={state.persistent}
        announcement={announcementOf(view)}
        onFind={search}
        onReroll={search}
        onRetry={search}
        onTake={take}
        onMarkLearned={() => {
          if (view.kind === 'story') {
            learnStory(store, view.topic.id)
          }
        }}
      />

      <HistoryPanel
        open={historyOpen}
        view={history}
        query={query}
        filter={filter}
        headingRef={historyHeading}
        onQuery={setQuery}
        onFilter={setFilter}
        onClear={() => {
          setQuery('')
          setFilter('all')
        }}
        onClose={closeHistory}
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
