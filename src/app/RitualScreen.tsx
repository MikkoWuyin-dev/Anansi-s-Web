import { useEffect, useRef, useState, type RefObject } from 'react'

import type { RitualView } from '@/app/ritual'

const TAKEN_NOTE = 'That is your story for today. A new one arrives after midnight.'
const DAY_STORY_NOTE = "This is today's story. It stays until midnight."
const ONLY_STORY_NOTE = 'That is the only story the web has today. It stays until midnight.'

export interface RitualProps {
  readonly view: RitualView
  readonly persistent: boolean
  readonly announcement: string
  readonly onFind: () => void
  readonly onReroll: () => void
  readonly onTake: () => void
  readonly onMarkLearned: () => void
  readonly onRetry: () => void
}

/**
 * The whole ritual as markup. Presentational by design: every state arrives as
 * a view, so each one can be rendered and checked without a browser, and the
 * semantic layer carries everything the product requires (MCD §9).
 */
export function Ritual({
  view,
  persistent,
  announcement,
  onFind,
  onReroll,
  onTake,
  onMarkLearned,
  onRetry,
}: RitualProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousKind = useRef(view.kind)

  // Move focus to the story only when a search resolves, so a keyboard user
  // lands on the reveal rather than at the top of the page. A reload that
  // restores a story is not a reveal and takes no focus.
  useEffect(() => {
    if (view.kind === 'story' && previousKind.current === 'searching') {
      headingRef.current?.focus()
    }

    previousKind.current = view.kind
  }, [view])

  return (
    <div className="ritual">
      <div className="stage" aria-busy={view.kind === 'searching'}>
        {view.kind === 'empty' ? <Empty /> : null}
        {view.kind === 'hero' ? <Hero newDay={view.newDay} onFind={onFind} /> : null}
        {view.kind === 'searching' ? <Searching /> : null}
        {view.kind === 'failed' ? (
          <Failed message={view.message} onRetry={onRetry} />
        ) : null}
        {view.kind === 'missing' ? <Missing message={view.message} /> : null}
        {view.kind === 'story' ? (
          <Story
            key={view.topic.id}
            view={view}
            headingRef={headingRef}
            onReroll={onReroll}
            onTake={onTake}
            onMarkLearned={onMarkLearned}
          />
        ) : null}
      </div>

      {persistent ? null : (
        <p className="storage-note">
          This browser is not keeping your journey, so today&apos;s story will not survive a
          reload.
        </p>
      )}

      {/* The one live region, always in the document, so messages are
          announced rather than inserted (ui-registry.md). */}
      <p className="status" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  )
}

function Hero({ newDay, onFind }: { readonly newDay: boolean; readonly onFind: () => void }) {
  return (
    <>
      <h1 className="hero">What story do you want to tell today?</h1>
      <div className="actions">
        <button className="action" type="button" onClick={onFind}>
          Find me a story
        </button>
      </div>
      {newDay ? <p className="status-copy">A new day has begun.</p> : null}
    </>
  )
}

function Searching() {
  return (
    <>
      <h1 className="hero">What story do you want to tell today?</h1>
      <p className="searching" aria-hidden="true">
        <span className="searching__strand" />
        <span className="searching__strand" />
        <span className="searching__strand" />
      </p>
    </>
  )
}

function Empty() {
  return (
    <>
      <h1 className="hero">The web is empty.</h1>
      <p className="status-copy">
        No stories have been woven in yet, so Anansi has nothing to bring. Check back once the
        library has grown.
      </p>
    </>
  )
}

function Failed({
  message,
  onRetry,
}: {
  readonly message: string
  readonly onRetry: () => void
}) {
  return (
    <>
      <h1 className="hero">Anansi lost the thread.</h1>
      <p className="status-copy">{message}</p>
      <div className="actions">
        <button className="action" type="button" onClick={onRetry}>
          Try again
        </button>
      </div>
    </>
  )
}

function Missing({ message }: { readonly message: string }) {
  return (
    <>
      <h1 className="hero">That story has left the web.</h1>
      <p className="status-copy">{message}</p>
    </>
  )
}

interface StoryProps {
  readonly view: Extract<RitualView, { kind: 'story' }>
  readonly headingRef: RefObject<HTMLHeadingElement>
  readonly onReroll: () => void
  readonly onTake: () => void
  readonly onMarkLearned: () => void
}

function Story({ view, headingRef, onReroll, onTake, onMarkLearned }: StoryProps) {
  const { topic, because, taken, learned, dayStory, sealed, count } = view
  const note = taken ? TAKEN_NOTE : dayStory ? DAY_STORY_NOTE : sealed ? ONLY_STORY_NOTE : null

  return (
    <article className="story">
      {because === 'resurfaced' ? (
        <div className="story__return">
          <span className="strand strand--return" aria-hidden="true" />
          <p className="story__back">Anansi has brought this one back.</p>
        </div>
      ) : null}

      <h2 className="story__title" ref={headingRef} tabIndex={-1}>
        {topic.title}
      </h2>

      {note === null ? null : <p className="story__note">{note}</p>}

      <StoryActions
        key={topic.id}
        taken={taken}
        learned={learned}
        canReroll={view.canReroll}
        onReroll={onReroll}
        onTake={onTake}
        onMarkLearned={onMarkLearned}
      />

      {taken && count !== null ? (
        <p className="count">
          <span aria-hidden="true">{count.label}</span>
          <span className="visually-hidden">{count.spoken}</span>
        </p>
      ) : null}
    </article>
  )
}

interface StoryActionsProps {
  readonly taken: boolean
  readonly learned: boolean
  readonly canReroll: boolean
  readonly onReroll: () => void
  readonly onTake: () => void
  readonly onMarkLearned: () => void
}

function StoryActions({
  taken,
  learned,
  canReroll,
  onReroll,
  onTake,
  onMarkLearned,
}: StoryActionsProps) {
  const [confirming, setConfirming] = useState(false)
  const askRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const firstRender = useRef(true)

  // Opening or closing the confirm replaces the button the person pressed, so
  // focus has to be placed deliberately or it falls to the document (AC-12).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    if (confirming) {
      confirmRef.current?.focus()
    } else {
      askRef.current?.focus()
    }
  }, [confirming])

  if (!taken) {
    return (
      <div className="actions">
        <button className="action" type="button" onClick={onTake}>
          I&apos;ll take this
        </button>
        {canReroll ? (
          <button className="ghost" type="button" onClick={onReroll}>
            Send Anansi back
          </button>
        ) : null}
      </div>
    )
  }

  if (learned) {
    return <p className="story__learned">Learned. You can tell it now.</p>
  }

  if (confirming) {
    return (
      <div className="confirm">
        <p className="confirm__question">Did you explain it aloud?</p>
        <div className="actions">
          <button className="action" type="button" ref={confirmRef} onClick={onMarkLearned}>
            Yes, mark it learned
          </button>
          <button className="ghost" type="button" onClick={() => setConfirming(false)}>
            Not yet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="actions">
      <button className="action" type="button" ref={askRef} onClick={() => setConfirming(true)}>
        I understood it
      </button>
    </div>
  )
}
