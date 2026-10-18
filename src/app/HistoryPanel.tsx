import type { RefObject } from 'react'

import {
  FILTER_LABELS,
  HISTORY_FILTERS,
  type HistoryFilter,
  type HistoryView,
} from '@/app/history'

export interface HistoryPanelProps {
  /** The panel stays in the document so `aria-controls` always resolves. */
  readonly open: boolean
  readonly view: HistoryView
  readonly query: string
  readonly filter: HistoryFilter
  readonly headingRef: RefObject<HTMLHeadingElement>
  readonly onQuery: (value: string) => void
  readonly onFilter: (filter: HistoryFilter) => void
  readonly onClear: () => void
  readonly onClose: () => void
}

/**
 * The history drawer as markup (spec 0004). It renders the view it is handed
 * and owns no rules: search, filters, grouping, and the count are all derived
 * in `history.ts`, so every one of them is testable without a DOM.
 */
export function HistoryPanel({
  open,
  view,
  query,
  filter,
  headingRef,
  onQuery,
  onFilter,
  onClear,
  onClose,
}: HistoryPanelProps) {
  return (
    <section
      id="history-panel"
      className="history"
      hidden={!open}
      aria-labelledby="history-heading"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          // A search input treats Escape as "clear me". Closing is this
          // panel's job, and the query has to survive the close (AC-10).
          event.preventDefault()
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <div className="history__head">
        <h2 className="history__title" id="history-heading" ref={headingRef} tabIndex={-1}>
          Your web
        </h2>

        {view.count === null ? null : (
          <p className="count">
            <span aria-hidden="true">{view.count.label}</span>
            <span className="visually-hidden">{view.count.spoken}</span>
          </p>
        )}

        <button className="ghost history__close" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="history__controls">
        <label className="history__search">
          <span className="history__search-label">Search</span>
          <input
            className="history__input"
            type="search"
            value={query}
            placeholder="A title or a day"
            onChange={(event) => onQuery(event.target.value)}
          />
        </label>

        <div className="filters" role="group" aria-label="Filter stories">
          {HISTORY_FILTERS.map((value) => (
            <button
              key={value}
              className="filters__button"
              type="button"
              aria-pressed={filter === value}
              onClick={() => onFilter(value)}
            >
              {FILTER_LABELS[value]}
              <span className="filters__count">{view.counts[value]}</span>
            </button>
          ))}
        </div>
      </div>

      {view.state === 'empty' ? (
        <p className="status-copy">
          Nothing here yet. The stories you meet will gather here as the days pass.
        </p>
      ) : null}

      {view.state === 'no-matches' ? (
        <div className="history__none">
          <p className="status-copy">No stories match that.</p>
          <button className="ghost" type="button" onClick={onClear}>
            Clear search and filter
          </button>
        </div>
      ) : null}

      {view.days.map((day) => (
        <div className="history__day" key={day.day}>
          <h3 className="history__label">{day.label}</h3>
          <ul className="history__rows">
            {day.rows.map((row) => (
              <li className="history__row" key={`${row.day}-${row.topicId}`}>
                <span className="history__story">{row.title}</span>
                <span className={`history__status history__status--${row.status}`}>
                  {row.status === 'learned' ? 'Learned' : 'Explored'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
