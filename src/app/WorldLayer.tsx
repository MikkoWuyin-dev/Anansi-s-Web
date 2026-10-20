import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import { descriptionFor, type Beat } from '@/world/stage'
import type { Mode } from '@/world/palette'

const Scene = lazy(() => import('@/world/Scene'))

/** The stylesheet's own phone breakpoint, so the scene and the layout agree. */
export const MOBILE_QUERY = '(max-width: 40rem)'

/** The media query the camera rig reads to stay still (spec 0005, AC-14). */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export interface WorldLayerProps {
  /** Which ritual beat the stage should frame (spec 0005, AC-9). */
  readonly beat: Beat
  /** Days completed in the journey, which sets the density (AC-6). */
  readonly days: number
  /** `${clientId}:${journeyStart}`, so the web belongs to this journey (AC-5). */
  readonly seed: string
  /** The resolved token set (spec 0007); the stage re-reads the palette with it. */
  readonly mode: Mode
  /** Every kept day, so the web can show the journey (spec 0008). */
  readonly keptDays: readonly string[]
  /** Whether today's story is kept, which holds its filament (spec 0008). */
  readonly keptToday: boolean
}

function subscribeToWidth(onChange: () => void): () => void {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener('change', onChange)

  return () => query.removeEventListener('change', onChange)
}

function isNarrow(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches
}

function subscribeToMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)

  return () => query.removeEventListener('change', onChange)
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** Whether the browser can give the scene a context at all (AC-17). */
function canRender3D(): boolean {
  try {
    const probe = document.createElement('canvas')

    return probe.getContext('webgl2') !== null || probe.getContext('webgl') !== null
  } catch {
    return false
  }
}

/** A failed scene is not the person's problem: the ritual carries on without it. */
class StageBoundary extends Component<{ readonly children: ReactNode }, { readonly failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The DOM side of the stage. It holds the description, mounts the lazy scene
 * only after the shell has painted, and keeps every failure inside the frame
 * of the canvas (spec 0005, AC-1, AC-17, AC-18). The mode arrives resolved
 * from the app, so the switch and the stage cannot disagree (spec 0007).
 */
export function WorldLayer({ beat, days, seed, mode, keptDays, keptToday }: WorldLayerProps) {
  const mobile = useSyncExternalStore(subscribeToWidth, isNarrow, () => false)
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => false)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!canRender3D()) {
      return undefined
    }

    let cancelled = false
    let idleHandle: number | null = null
    let secondFrame: number | null = null

    const arm = (): void => {
      if (!cancelled) {
        if (import.meta.env.DEV) {
          // Development evidence that the scene came after the first paint.
          performance.mark('anansi:stage-armed')
        }

        setArmed(true)
      }
    }

    const idle =
      typeof window.requestIdleCallback === 'function'
        ? {
            schedule: () => window.requestIdleCallback(arm, { timeout: 2_000 }),
            cancel: (handle: number) => window.cancelIdleCallback(handle),
          }
        : {
            schedule: () => window.setTimeout(arm, 200),
            cancel: (handle: number) => window.clearTimeout(handle),
          }

    // Two frames, so the browser has painted the shell before the scene is
    // asked for: an effect alone can run before the first paint.
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        idleHandle = idle.schedule()
      })
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(firstFrame)

      if (secondFrame !== null) {
        window.cancelAnimationFrame(secondFrame)
      }

      if (idleHandle !== null) {
        idle.cancel(idleHandle)
      }
    }
  }, [])

  return (
    <div className="world" role="img" aria-label={descriptionFor(beat, days)}>
      {armed ? (
        <StageBoundary>
          <Suspense fallback={null}>
            <Scene
              seed={seed}
              days={days}
              mobile={mobile}
              beat={beat}
              reducedMotion={reducedMotion}
              mode={mode}
              keptDays={keptDays}
              keptToday={keptToday}
            />
          </Suspense>
        </StageBoundary>
      ) : null}
    </div>
  )
}
