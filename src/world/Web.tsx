import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { animated, useSpring } from '@react-spring/three'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three'

import { webWake } from '@/world/choreography'
import type { WebGraph as Graph } from '@/world/graph'
import { filamentRest, type KeptThread } from '@/world/kept'
import type { Palette } from '@/world/palette'
import type { Beat } from '@/world/stage'

export interface WebGraphProps {
  readonly graph: Graph
  readonly mobile: boolean
  readonly beat: Beat
  readonly reducedMotion: boolean
  /** Resolved once by the scene, so both the DOM and the web follow the mode. */
  readonly palette: Palette
  /** One thread per kept day, woven into the same web (spec 0008). */
  readonly kept: readonly KeptThread[]
  /** Whether today's story has been kept, which holds its filament. */
  readonly keptToday: boolean
}

/**
 * Every strand as one line segment buffer, sagging at its midpoint: one draw
 * call for the whole web, which is what keeps the idle frame cheap.
 */
function strandGeometry(graph: Graph, palette: Palette): BufferGeometry {
  const positions: number[] = []
  const colours: number[] = []

  const near = new Color(palette.lavender)
  const far = new Color(palette.jet).lerp(new Color(palette.ink), 0.18)
  const colour = new Color()

  const push = (x: number, y: number, z: number): void => {
    positions.push(x, y, z)
    colours.push(colour.r, colour.g, colour.b)
  }

  for (const strand of graph.strands) {
    const from = graph.nodes[strand.from]
    const to = graph.nodes[strand.to]

    if (from === undefined || to === undefined) {
      continue
    }

    const [ax, ay, az] = from.position
    const [bx, by, bz] = to.position
    const sag = strand.sag * 0.32

    colour.copy(far).lerp(near, Math.min(1, Math.max(0, ((from.depth + to.depth) / 2 + 1) / 2)))

    push(ax, ay, az)
    push((ax + bx) / 2, (ay + by) / 2 - sag, (az + bz) / 2)
    push((ax + bx) / 2, (ay + by) / 2 - sag, (az + bz) / 2)
    push(bx, by, bz)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colours, 3))

  return geometry
}

/**
 * The one filament the reveal is allowed (spec 0005): a single yellow thread
 * from the hub to the strand Anansi found the story on. It sags like every
 * other strand, so it belongs to the web rather than sitting over it.
 */
function revealGeometry(graph: Graph): BufferGeometry {
  const hub = graph.nodes[0]?.position ?? [0, 0, 0]
  const node = graph.nodes[graph.anchors[0] ?? 0] ?? graph.nodes[0]
  const [x, y, z] = node?.position ?? hub
  const mid: [number, number, number] = [
    (hub[0] + x) / 2,
    (hub[1] + y) / 2 - 0.18,
    (hub[2] + z) / 2,
  ]

  const geometry = new BufferGeometry()
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute([...hub, ...mid, x, y, z], 3),
  )

  return geometry
}

/**
 * The standing threads (spec 0008): one sagging segment per kept day, in one
 * buffer, so ninety kept stories still cost a single draw call. They are a
 * shade louder than the web's own strands, because they are the record.
 */
function keptGeometry(threads: readonly KeptThread[], palette: Palette): BufferGeometry {
  const positions: number[] = []
  const colours: number[] = []

  const near = new Color(palette.lavender)
  const far = new Color(palette.jet).lerp(new Color(palette.lavender), 0.35)
  const colour = new Color(far).lerp(near, 0.4)

  const push = (x: number, y: number, z: number): void => {
    positions.push(x, y, z)
    colours.push(colour.r, colour.g, colour.b)
  }

  for (const thread of threads) {
    const [ax, ay, az] = thread.from
    const [bx, by, bz] = thread.to
    const midY = (ay + by) / 2 - thread.sag * 0.32

    push(ax, ay, az)
    push((ax + bx) / 2, midY, (az + bz) / 2)
    push((ax + bx) / 2, midY, (az + bz) / 2)
    push(bx, by, bz)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colours, 3))

  return geometry
}

/** A bead's colour: mostly the quiet neutrals, with two sparse accents. */
function beadColour(index: number, depth: number, palette: Palette): string {
  if (index % 9 === 0) {
    return palette.strawberry
  }

  if (index % 4 === 0) {
    return palette.lavender
  }

  return depth > 0.2 ? palette.ink : palette.dim
}

function paintBeads(mesh: InstancedMesh, graph: Graph, palette: Palette): void {
  const matrix = new Matrix4()
  const place = new Vector3()
  const scale = new Vector3()
  const rotation = new Quaternion()
  const colour = new Color()

  graph.nodes.forEach((node, index) => {
    const [x, y, z] = node.position

    place.set(x, y, z)
    scale.setScalar(node.radius)
    matrix.compose(place, rotation, scale)
    mesh.setMatrixAt(index, matrix)
    mesh.setColorAt(index, colour.set(beadColour(index, node.depth, palette)))
  })

  mesh.instanceMatrix.needsUpdate = true

  if (mesh.instanceColor !== null) {
    mesh.instanceColor.needsUpdate = true
  }
}

/**
 * The knot of the story just kept answers once (spec 0009, AC-6).
 *
 * The weave's knots are painted once into one instanced buffer, so this is a
 * single extra mesh that exists for the length of the celebrating beat and is
 * then unmounted. It settles at exactly the resting knot's radius, so the
 * unmount cannot be seen, and the idle stage is unchanged.
 */
function KeptEmphasis({
  thread,
  palette,
  mobile,
  invalidate,
}: {
  readonly thread: KeptThread
  readonly palette: Palette
  readonly mobile: boolean
  readonly invalidate: () => void
}) {
  const spring = useSpring({
    from: { scale: 0.7 },
    to: async (next) => {
      await next({ scale: 2 })
      await next({ scale: 1 })
    },
    config: { tension: 190, friction: 20 },
    onChange: () => invalidate(),
  })

  return (
    <animated.mesh
      position={[thread.to[0], thread.to[1], thread.to[2]]}
      scale={spring.scale}
    >
      <sphereGeometry args={[thread.knot, mobile ? 6 : 10, mobile ? 4 : 6]} />
      <meshBasicMaterial color={palette.yellow} toneMapped={false} depthWrite={false} />
    </animated.mesh>
  )
}

/**
 * The web itself, inside the canvas. It derives nothing: the graph arrives
 * from the scene, so the same graph feeds the objects and Anansi. It wakes
 * when a search begins and springs back when one ends, and it draws no frames
 * of its own (spec 0005, AC-3, AC-4, AC-12).
 */
export function WebGraph({
  graph,
  mobile,
  beat,
  reducedMotion,
  palette,
  kept,
  keptToday,
}: WebGraphProps) {
  const invalidate = useThree((state) => state.invalidate)
  const geometry = useMemo(() => strandGeometry(graph, palette), [graph, palette])
  const weave = useMemo(() => keptGeometry(kept, palette), [kept, palette])
  const knots = useRef<InstancedMesh>(null)
  const filament = useMemo(() => {
    const line = new Line(
      revealGeometry(graph),
      new LineBasicMaterial({
        color: palette.yellow,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    )

    line.frustumCulled = false

    return line
  }, [graph, palette])
  const beads = useRef<InstancedMesh>(null)
  const lines = useRef<LineBasicMaterial>(null)

  const [spring, api] = useSpring(() => ({
    wake: 0,
    reveal: 0,
    config: { tension: 130, friction: 26 },
    onChange: () => invalidate(),
  }))

  useLayoutEffect(() => {
    if (beads.current !== null) {
      paintBeads(beads.current, graph, palette)
    }

    invalidate()
  }, [graph, palette, invalidate])

  // The knots are placed once per weave: a kept thread's end bead is fixed, so
  // nothing here is animated (spec 0008, AC-7).
  useLayoutEffect(() => {
    const mesh = knots.current

    if (mesh === null) {
      return
    }

    const matrix = new Matrix4()
    const place = new Vector3()
    const scale = new Vector3()
    const rotation = new Quaternion()

    kept.forEach((thread, index) => {
      const [x, y, z] = thread.to

      place.set(x, y, z)
      scale.setScalar(thread.knot)
      matrix.compose(place, rotation, scale)
      mesh.setMatrixAt(index, matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    invalidate()
  }, [kept, invalidate])

  useEffect(() => {
    const next = {
      wake: reducedMotion && beat === 'searching' ? 0.5 : webWake(beat),
      reveal: beat === 'revealing' || beat === 'celebrating' ? 1 : 0,
    }

    // Reduced motion still says what the web is doing, but changes at once
    // rather than travelling there (AC-14).
    if (reducedMotion) {
      api.set(next)
      invalidate()
    } else {
      api.start(next)
    }
  }, [api, beat, invalidate, reducedMotion])

  useFrame(() => {
    // The spring writes these on every tick; the frame is what shows them.
    if (lines.current !== null) {
      lines.current.opacity = 0.44 + spring.wake.get() * 0.28
    }

    // A kept story's filament never goes dark: the reveal settles onto the
    // thread the day already wove (spec 0008, AC-4).
    filament.material.opacity = Math.max(
      spring.reveal.get() * 0.9,
      filamentRest(keptToday),
    )
  })

  useEffect(
    () => () => {
      geometry.dispose()
      weave.dispose()
      filament.geometry.dispose()
      filament.material.dispose()
    },
    [geometry, weave, filament],
  )

  return (
    <>
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={lines}
          vertexColors
          transparent
          opacity={0.44}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* The standing threads of every kept day (spec 0008). */}
      {kept.length > 0 ? (
        <>
          <lineSegments geometry={weave} frustumCulled={false}>
            <lineBasicMaterial
              vertexColors
              transparent
              opacity={0.62}
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>

          <instancedMesh
            ref={knots}
            args={[undefined, undefined, kept.length]}
            frustumCulled={false}
          >
            <sphereGeometry args={[1, mobile ? 6 : 10, mobile ? 4 : 6]} />
            <meshBasicMaterial color={palette.dim} toneMapped={false} />
          </instancedMesh>
        </>
      ) : null}

      {/* The kept story's knot answers once, then settles into the weave
          (spec 0009, AC-6). Reduced motion never mounts it, because the
          acceptance beat is not started at all in that mode. */}
      {beat === 'celebrating' && kept.length > 0 ? (
        <KeptEmphasis
          thread={kept[kept.length - 1] as KeptThread}
          palette={palette}
          mobile={mobile}
          invalidate={invalidate}
        />
      ) : null}

      {/* The filament is always mounted at zero opacity, so its shader
          compiles with the stage rather than hitching the reveal. */}
      <primitive object={filament} />

      <instancedMesh
        ref={beads}
        args={[undefined, undefined, graph.nodes.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, mobile ? 8 : 12, mobile ? 6 : 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  )
}
