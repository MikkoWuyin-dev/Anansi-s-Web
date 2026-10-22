import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { animated, useSpring } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { Color, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'

import type { Palette } from '@/world/palette'
import {
  byFamily,
  FAMILIES,
  FAMILY_FORM,
  objectsFor,
  type Family,
  type WorldObject,
} from '@/world/families'
import type { WebGraph } from '@/world/graph'
import { SEAL_TURN, type Beat, type Notice } from '@/world/stage'

export interface ObjectsProps {
  readonly graph: WebGraph
  readonly days: number
  readonly mobile: boolean
  readonly beat: Beat
  readonly reducedMotion: boolean
  /** Resolved once by the scene, so a mode change repaints every family. */
  readonly palette: Palette
  /** The day sealed, so the clocks turn toward him once (spec 0009, AC-5). */
  readonly notice?: Notice
}

/** The one primitive a family is built from; every instance shares it. */
function Form({ form }: { readonly form: Family }) {
  switch (FAMILY_FORM[form]) {
    case 'torus':
      return <torusGeometry args={[1, 0.36, 8, 20]} />
    case 'cylinder':
      return <cylinderGeometry args={[0.42, 0.42, 1, 6]} />
    case 'sphere':
      return <sphereGeometry args={[1, 12, 8]} />
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />
    case 'octahedron':
      return <octahedronGeometry args={[1, 0]} />
  }
}

function paint(
  mesh: InstancedMesh,
  objects: readonly WorldObject[],
  palette: Palette,
): void {
  const matrix = new Matrix4()
  const place = new Vector3()
  const scale = new Vector3()
  const rotation = new Quaternion()
  const euler = new Euler()
  const colour = new Color()

  objects.forEach((object, index) => {
    const [x, y, z] = object.position

    place.set(x, y, z)
    scale.set(object.scale[0], object.scale[1], object.scale[2])
    euler.set(object.rotation[0], object.rotation[1], object.rotation[2], 'XYZ')
    rotation.setFromEuler(euler)

    matrix.compose(place, rotation, scale)
    mesh.setMatrixAt(index, matrix)
    mesh.setColorAt(index, colour.set(palette[object.colour]))
  })

  mesh.instanceMatrix.needsUpdate = true

  if (mesh.instanceColor !== null) {
    mesh.instanceColor.needsUpdate = true
  }
}

/**
 * One family, drawn as one instanced mesh: every object of a family shares its
 * primitive and its draw call, and differs in the matrix and the tone painted
 * into it. A beat sends a bounded impulse through the whole family, which
 * springs back to rest (spec 0005, AC-13).
 */
function FamilyGroup({
  family,
  objects,
  palette,
  beat,
  reducedMotion,
  notice,
}: {
  readonly family: Family
  readonly objects: readonly WorldObject[]
  readonly palette: Palette
  readonly beat: Beat
  readonly reducedMotion: boolean
  readonly notice: Notice
}) {
  const mesh = useRef<InstancedMesh>(null)
  const invalidate = useThree((state) => state.invalidate)
  const firstBeat = useRef(true)
  const lean = family.length % 2 === 0 ? 0.012 : -0.012

  const [spring, api] = useSpring(() => ({
    lift: 0,
    config: { tension: 170, friction: 16 },
    onChange: () => invalidate(),
  }))

  // The clocks turn toward the hub when the day seals (spec 0009, AC-5).
  // Nothing else does: it is the one family that reads as looking.
  const [face, faceApi] = useSpring(() => ({
    turn: 0,
    config: { tension: 90, friction: 20 },
    onChange: () => invalidate(),
  }))

  useLayoutEffect(() => {
    if (mesh.current !== null) {
      paint(mesh.current, objects, palette)
      invalidate()
    }
  }, [objects, palette, invalidate])

  useEffect(() => {
    if (firstBeat.current) {
      firstBeat.current = false
      return
    }

    if (reducedMotion) {
      return
    }

    // A bounded impulse: kick once on the beat that arrived, then settle back.
    api.set({ lift: 1 })
    api.start({ lift: 0 })
  }, [api, beat, reducedMotion])

  useEffect(() => {
    if (family !== 'clock') {
      return
    }

    const turning = notice === 'sealed'

    // Reduced motion keeps the information and drops the movement: the clocks
    // hold the turn for the notice window instead of swinging through it.
    if (reducedMotion) {
      faceApi.set({ turn: turning ? 1 : 0 })
      return
    }

    faceApi.start({ turn: turning ? 1 : 0 })
  }, [faceApi, family, notice, reducedMotion])

  return (
    <animated.group rotation-z={face.turn.to((turn) => -turn * SEAL_TURN)}>
      <animated.group
        scale={spring.lift.to((lift) => 1 + lift * 0.035)}
        rotation-z={spring.lift.to((lift) => lift * lean)}
      >
        <instancedMesh
          ref={mesh}
          args={[undefined, undefined, objects.length]}
          frustumCulled={false}
        >
          <Form form={family} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </animated.group>
    </animated.group>
  )
}

/**
 * The objects hanging from the web (roadmap 6.4, 6.7). They are generated from
 * the graph and the journey count, and they only move when a beat arrives.
 */
export function Objects({
  graph,
  days,
  mobile,
  beat,
  reducedMotion,
  palette,
  notice = null,
}: ObjectsProps) {
  const objects = useMemo(
    () => objectsFor(graph, days, mobile, reducedMotion),
    [graph, days, mobile, reducedMotion],
  )

  return (
    <>
      {FAMILIES.map((family) => {
        const instances = byFamily(objects, family)

        return instances.length === 0 ? null : (
          <FamilyGroup
            key={family}
            family={family}
            objects={instances}
            palette={palette}
            beat={beat}
            reducedMotion={reducedMotion}
            notice={notice}
          />
        )
      })}
    </>
  )
}
