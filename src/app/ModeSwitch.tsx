import type { Mode } from '@/world/palette'

export interface ModeSwitchProps {
  /** The mode currently showing, so the label can name the other one. */
  readonly mode: Mode
  readonly onToggle: () => void
}

/**
 * The sun and moon switch (spec 0007).
 *
 * A native button: Enter and Space work, the focus ring is the page's own, and
 * the accessible name says where the press goes rather than where it is. The
 * glyph is decoration — a sun in dark, a moon in light — and it turns over in
 * CSS, so the button carries no animation state of its own.
 */
export function ModeSwitch({ mode, onToggle }: ModeSwitchProps) {
  const target = mode === 'light' ? 'dark' : 'light'

  return (
    <button
      className="mode-switch"
      type="button"
      aria-label={`Switch to ${target} mode`}
      onClick={onToggle}
    >
      <span className="mode-switch__glyph" aria-hidden="true">
        <span className="mode-switch__sun" />
        <span className="mode-switch__moon" />
      </span>
    </button>
  )
}
