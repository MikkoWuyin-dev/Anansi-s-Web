import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { animated, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'

import { bodyDip, EYES, LEG_REACH, LEGS, legGait } from '@/world/spider'
import { restingPoint, searchPath, searchPose } from '@/world/choreography'
import type { WebGraph } from '@/world/graph'
import type { Palette } from '@/world/palette'
import type { Beat } from '@/world/stage'

export interface AnansiProps {
  readonly graph: WebGraph
  readonly beat: Beat
  readonly mobile: boolean
  readonly reducedMotion: boolean
  /** Resolved once by the scene, so a mode change recolours him with the web. */
  readonly palette: Palette
}

/**
 * Anansi, in his own component (spec 0005, AC-11; roadmap 6.5).
 *
 * He is deliberately cheap: two body spheres, two eyes, eight legs of two
 * segments. His character lives in the gait: the legs alternate, the body dips
 * into a stride, and every hold in the search stops the motion. Nothing outside
 * this file imports `anansi.ts`, so a modelled asset can take his place by
 * changing this component and nothing else.
 */
export function Anansi({ graph, beat, mobile, reducedMotion, palette }: AnansiProps) {
  const body = useRef<Group>(null)
  const legs = useRef<Array<Group | null>>([])
  const invalidate = useThree((state) => state.invalidate)
  const path = useMemo(() => searchPath(graph), [graph])
  const home = useMemo(() => restingPoint(graph), [graph])
  const scale = mobile ? 1.1 : 1

  const [spring, api] = useSpring(() => ({
    travel: 0,
    config: { tension: 45, friction: 15 },
    onChange: () => invalidate(),
  }))

  useLayoutEffect(() => {
    invalidate()
  }, [palette, mobile, invalidate])

  useEffect(() => {
    if (beat === 'searching' && !reducedMotion) {
      api.set({ travel: 0 })
      api.start({ travel: 1 })
      return
    }

    // Coming back from the far strand would retrace the whole path, so the
    // return home is a reset: by the time the reveal arrives he is already
    // within a stride of the hub.
    api.set({ travel: 0 })
    invalidate()
  }, [api, beat, invalidate, reducedMotion])

  useFrame(() => {
    const group = body.current

    if (group === null) {
      return
    }

    const pose = searchPose(reducedMotion ? 1 : spring.travel.get(), path, reducedMotion)

    group.position.set(
      pose.position[0],
      pose.position[1] + bodyDip(pose.stride),
      pose.position[2],
    )
    group.rotation.z = pose.heading - Math.PI / 2

    if (import.meta.env.DEV) {
      // Development evidence that he leaves the hub and comes home.
      ;(
        window as unknown as { __anansiSpider?: [number, number, number] }
      ).__anansiSpider = [
        Math.round(group.position.x * 1000) / 1000,
        Math.round(group.position.y * 1000) / 1000,
        Math.round(group.position.z * 1000) / 1000,
      ]
    }

    legs.current.forEach((leg, index) => {
      if (leg === null) {
        return
      }

      const gait = legGait(index, pose.stride)

      leg.rotation.set(gait.lift * -0.5, 0, (LEGS[index]?.yaw ?? 0) + gait.swing * 0.22)
    })
  })

  return (
    <animated.group
      ref={body}
      position={[home[0], home[1], home[2]]}
      scale={scale}
    >
      {/* The abdomen and the head, seen from above: a small resting silhouette. */}
      <mesh position={[0, -0.05, 0]} scale={[1.25, 1, 0.82]}>
        <sphereGeometry args={[0.052, 12, 9]} />
        <meshBasicMaterial color={palette.lavender} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.028, 0]} scale={[1, 1, 0.9]}>
        <sphereGeometry args={[0.036, 12, 9]} />
        <meshBasicMaterial color={palette.ink} toneMapped={false} />
      </mesh>

      {EYES.map((eye, index) => (
        <mesh key={index} position={[eye[0], eye[1], eye[2]]}>
          <sphereGeometry args={[0.0065, 8, 6]} />
          <meshBasicMaterial color={palette.yellow} toneMapped={false} />
        </mesh>
      ))}

      {LEGS.map((leg, index) => (
        <group
          key={index}
          ref={(node) => {
            legs.current[index] = node
          }}
          position={[leg.hip[0], leg.hip[1], leg.hip[2]]}
          rotation={[0, 0, leg.yaw]}
        >
          <mesh
            position={[leg.side * (LEG_REACH / 2), 0, 0]}
            rotation={[0, 0, leg.side * Math.PI * 0.5]}
          >
            <cylinderGeometry args={[0.0075, 0.0055, LEG_REACH, 4]} />
            <meshBasicMaterial color={palette.ink} toneMapped={false} />
          </mesh>
          <mesh
            position={[leg.side * LEG_REACH * 0.92, -0.045, 0]}
            rotation={[0, 0, leg.side * Math.PI * 0.36]}
          >
            <cylinderGeometry args={[0.0055, 0.0025, 0.085, 4]} />
            <meshBasicMaterial color={palette.dim} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </animated.group>
  )
}
