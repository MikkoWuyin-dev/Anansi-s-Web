import { useState } from 'react'

/**
 * The DOM shell of the ritual: the hero line and the primary action, present
 * immediately and independently of the 3D stage (MCD §4 rule 1, §9).
 *
 * The web behind it is decoration, so it is hidden from assistive technology;
 * everything the product requires is in the semantic layer below.
 */
export function App() {
  const [searched, setSearched] = useState(false)

  return (
    <main className="shell">
      <Web />

      <div className="ritual">
        <h1 className="hero">What story do you want to tell today?</h1>

        <button
          className="action"
          type="button"
          onClick={() => setSearched(true)}
        >
          Find me a story
        </button>

        {/* A live region kept in the document so the message is announced. */}
        <p className="status" role="status">
          {searched ? 'No stories are woven into the web yet.' : ''}
        </p>
      </div>
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
