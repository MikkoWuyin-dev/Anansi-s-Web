import { Canvas } from '@react-three/fiber'

import { WebGraph } from '@/world/Web'
import type { Beat } from '@/world/stage'

export interface SceneProps {
  readonly seed: string
  readonly days: number
  readonly mobile: boolean
  readonly beat: Beat
}

/**
 * The whole stage: one canvas (MCD §4 rule 1), drawing only when something
 * asks for a frame (rule 2). This module is the lazy chunk, so three.js and
 * the renderer never enter the shell's bundle.
 */
export default function Scene({ seed, days, mobile, beat }: SceneProps) {
  return (
    <Canvas
      frameloop="demand"
      flat
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: mobile ? [0, 0.2, 9] : [0, 0.25, 7.4], fov: 45, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.setClearAlpha(0)

        if (import.meta.env.DEV) {
          // A development hook, so the browser pass can prove that an idle
          // page draws nothing and that the web reached the renderer.
          // Production builds drop this branch.
          ;(
            window as unknown as {
              __anansiStage?: {
                frames: () => number
                drawn: () => { lines: number; triangles: number; calls: number }
              }
            }
          ).__anansiStage = {
            frames: () => gl.info.render.frame,
            drawn: () => ({
              lines: gl.info.render.lines,
              triangles: gl.info.render.triangles,
              calls: gl.info.render.calls,
            }),
          }
        }
      }}
    >
      <WebGraph seed={seed} days={days} mobile={mobile} beat={beat} />
    </Canvas>
  )
}
