import { useEffect, useMemo, useRef } from 'react'
import { useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

import {
  frameFor,
  parallaxOffset,
  SETTLE_STIFFNESS,
  settled,
  smoothing,
  tiltFor,
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
 * nothing more, and the tilt itself is a spring so it has weight. Under reduced
 * motion it snaps to the frame and never tilts.
 */
export function CameraRig({ beat, mobile, reducedMotion }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const frame = useMemo(() => frameFor(beat, mobile), [beat, mobile])

  const look = useRef(new Vector3(frame.target[0], frame.target[1], frame.target[2]))
  const wanted = useRef(new Vector3())
  const wantedLook = useRef(new Vector3())

  // The tilt is a spring, not a value copied from the pointer: releasing it
  // lets the view settle rather than stop dead.
  const [tilt, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 110, friction: 24 },
    onChange: () => invalidate(),
  }))

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') {
      return undefined
    }

    const onPointerMove = (event: PointerEvent): void => {
      const next = tiltFor(
        event.pointerType,
        event.clientX,
        event.clientY,
        window.innerWidth,
        window.innerHeight,
      )

      if (next !== null) {
        api.start(next)
        // The spring writes to the camera inside `useFrame`, so the first
        // frame of the tilt has to be asked for here.
        invalidate()
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [api, invalidate, reducedMotion])

  useEffect(() => {
    invalidate()
  }, [beat, mobile, invalidate])

  useFrame((_, delta) => {
    const [px, py, pz] = frame.position
    const [tx, ty, tz] = frame.target
    const [ox, oy] = parallaxOffset({ x: tilt.x.get(), y: tilt.y.get() }, reducedMotion)

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

    // Keep drawing only while there is somewhere left to go, including the
    // tilt spring's own settling.
    if (
      tilt.x.isAnimating ||
      tilt.y.isAnimating ||
      !settled(camera.position, wanted.current) ||
      !settled(look.current, wantedLook.current)
    ) {
      invalidate()
    }
  })

  return null
}
