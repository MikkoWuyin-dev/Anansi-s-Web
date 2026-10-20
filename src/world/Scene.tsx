import { useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'

import { Anansi } from '@/world/Anansi'
import { CameraRig } from '@/world/CameraRig'
import { frameFor } from '@/world/camera'
import { graphFor } from '@/world/graph'
import { Objects } from '@/world/Objects'
import { objectCount } from '@/world/families'
import { keptThreads } from '@/world/kept'
import { documentPalette, type Mode } from '@/world/palette'
import { WebGraph } from '@/world/Web'
import type { Beat } from '@/world/stage'

export interface SceneProps {
  readonly seed: string
  readonly days: number
  readonly mobile: boolean
  readonly beat: Beat
  readonly reducedMotion: boolean
  /** The token set to draw with; changing it re-reads the palette (spec 0006). */
  readonly mode: Mode
  /** Every day whose story was kept, from the journey's own tally (spec 0008). */
  readonly keptDays: readonly string[]
  /** Whether today's story is kept, which holds its filament (spec 0008). */
  readonly keptToday: boolean
}

/**
 * The whole stage: one canvas (MCD §4 rule 1), drawing only when something
 * asks for a frame (rule 2). This module is the lazy chunk, so three.js and
 * the renderer never enter the shell's bundle.
 */
export default function Scene({
  seed,
  days,
  mobile,
  beat,
  reducedMotion,
  mode,
  keptDays,
  keptToday,
}: SceneProps) {
  const idle = frameFor('idle', mobile)
  // One read for the whole stage, so a mode change recolours the web, the
  // objects, and Anansi together (spec 0006, AC-6).
  const palette = useMemo(() => documentPalette(), [mode])
  const graph = useMemo(() => graphFor({ seed, days, mobile }), [seed, days, mobile])
  // The weave is derived, never stored: the tally is the record (spec 0008).
  const kept = useMemo(() => keptThreads(graph, keptDays, mobile), [graph, keptDays, mobile])
  const objects = objectCount(days, mobile)
  // The hook is created once, so it reads the count through a ref rather than
  // capturing the first render's count (the phone tier arrives after mount).
  const objectsNow = useRef(objects)
  objectsNow.current = objects

  return (
    <Canvas
      frameloop="demand"
      flat
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [...idle.position], fov: 45, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
      onCreated={(state) => {
        const { gl, camera } = state

        gl.setClearAlpha(0)

        if (import.meta.env.DEV) {
          // A development hook, so the browser pass can prove that an idle
          // page draws nothing, what the web reached the renderer, where the
          // camera is framed, and how many objects the journey earned.
          // Production builds drop this branch.
          ;(
            window as unknown as {
              __anansiStage?: {
                frames: () => number
                drawn: () => { lines: number; triangles: number; calls: number }
                camera: () => [number, number, number]
                objects: () => number
                gl: () => typeof gl
              }
            }
          ).__anansiStage = {
            frames: () => gl.info.render.frame,
            drawn: () => ({
              lines: gl.info.render.lines,
              triangles: gl.info.render.triangles,
              calls: gl.info.render.calls,
            }),
            camera: () => [
              Math.round(camera.position.x * 1000) / 1000,
              Math.round(camera.position.y * 1000) / 1000,
              Math.round(camera.position.z * 1000) / 1000,
            ],
            objects: () => objectsNow.current,
            gl: () => gl,
          }
        }
      }}
    >
      <CameraRig beat={beat} mobile={mobile} reducedMotion={reducedMotion} />
      <WebGraph
        graph={graph}
        mobile={mobile}
        beat={beat}
        reducedMotion={reducedMotion}
        palette={palette}
        kept={kept}
        keptToday={keptToday}
      />
      <Objects
        graph={graph}
        days={days}
        mobile={mobile}
        beat={beat}
        reducedMotion={reducedMotion}
        palette={palette}
      />
      <Anansi
        graph={graph}
        beat={beat}
        mobile={mobile}
        reducedMotion={reducedMotion}
        palette={palette}
      />
    </Canvas>
  )
}
