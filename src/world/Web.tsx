import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three'

import { graphFor, type WebGraph } from '@/world/graph'
import { documentPalette, type Palette } from '@/world/palette'
import type { Beat } from '@/world/stage'

export interface WebGraphProps {
  /** `${clientId}:${journeyStart}`; the same seed draws the same web. */
  readonly seed: string
  /** Days completed, which sets the density. */
  readonly days: number
  /** The phone tier draws fewer strands and caps the pixel ratio. */
  readonly mobile: boolean
  /** The beat the ritual is in. The stage repaints when it changes. */
  readonly beat: Beat
}

/**
 * Every strand as one line segment buffer, sagging at its midpoint: one draw
 * call for the whole web, which is what keeps the idle frame cheap.
 */
function strandGeometry(graph: WebGraph, palette: Palette): BufferGeometry {
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

function paintBeads(mesh: InstancedMesh, graph: WebGraph, palette: Palette): void {
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
 * The web itself, inside the canvas. It derives its graph from the seed and
 * the journey count, and it repaints only when one of those changes or the
 * beat moves on: no component here runs a frame loop (spec 0005, AC-4).
 */
export function WebGraph({ seed, days, mobile, beat }: WebGraphProps) {
  const invalidate = useThree((state) => state.invalidate)
  const palette = useMemo(() => documentPalette(), [])
  const graph = useMemo(() => graphFor({ seed, days, mobile }), [seed, days, mobile])
  const geometry = useMemo(() => strandGeometry(graph, palette), [graph, palette])
  const beads = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    if (beads.current !== null) {
      paintBeads(beads.current, graph, palette)
    }

    invalidate()
  }, [graph, palette, invalidate])

  useEffect(() => {
    invalidate()
  }, [beat, invalidate])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <>
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent opacity={0.5} depthWrite={false} toneMapped={false} />
      </lineSegments>

      <instancedMesh
        ref={beads}
        args={[undefined, undefined, graph.nodes.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 12, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  )
}
