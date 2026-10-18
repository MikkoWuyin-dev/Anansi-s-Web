import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

import {
  frameFor,
  parallaxOffset,
  SETTLE_STIFFNESS,
  settled,
  smoothing,
  type PointerTilt,
} from '@/world/camera'
import type { Beat } from '@/world/stage'

export interface CameraRigProps {
  readonly beat: Beat
  readonly mobile: boolean
  readonly reducedMotion: boolean
}

/**
 * The camera, framed by the ritual (MCD §4 rule 3, spec 0005 AC-8, AC-9).
 *
 * It eases toward the beat's frame and stops, then asks for no more frames
 * until something changes. There is no orbit control, no wheel or scroll
 * listener, and no drag: the pointer may tilt the view by a bounded offset and
 * nothing more. Under reduced motion it snaps to the frame and never tilts.
 */
export function CameraRig({ beat, mobile, reducedMotion }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const frame = useMemo(() => frameFor(beat, mobile), [beat, mobile])

  const pointer = useRef<PointerTilt>({ x: 0, y: 0 })
  const look = useRef(new Vector3(frame.target[0], frame.target[1], frame.target[2]))
  const wanted = useRef(new Vector3())
  const wantedLook = useRef(new Vector3())

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') {
      return undefined
    }

    const onPointerMove = (event: PointerEvent): void => {
      // Touch belongs to the mobile tier, which has its own pass in 6.9.
      if (event.pointerType !== 'mouse') {
        return
      }

      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -((event.clientY / window.innerHeight) * 2 - 1),
      }

      invalidate()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [invalidate, reducedMotion])

  useEffect(() => {
    invalidate()
  }, [beat, mobile, invalidate])

  useFrame((_, delta) => {
    const [px, py, pz] = frame.position
    const [tx, ty, tz] = frame.target
    const [ox, oy] = parallaxOffset(pointer.current, reducedMotion)

    wanted.current.set(px + ox, py + oy, pz)
    wantedLook.current.set(tx + ox * 0.5, ty + oy * 0.5, tz)

    if (reducedMotion) {
      camera.position.copy(wanted.current)
      look.current.copy(wantedLook.current)
    } else {
      const step = smoothing(SETTLE_STIFFNESS, delta)

      camera.position.lerp(wanted.current, step)
      look.current.lerp(wantedLook.current, step)
    }

    camera.lookAt(look.current)

    // Keep drawing only while there is somewhere left to go.
    if (!settled(camera.position, wanted.current) || !settled(look.current, wantedLook.current)) {
      invalidate()
    }
  })

  return null
}
