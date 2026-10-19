/**
 * The authored camera (MCD §4 rule 3, spec 0005).
 *
 * Five frames, one per beat, designed rather than emergent. The user's pointer
 * only tilts the view by a bounded amount: it never orbits, drags, or travels.
 * Everything here is plain data and arithmetic, so the framing and the bounds
 * are tested without a renderer.
 */

import type { Beat } from '@/world/stage'

export interface CameraFrame {
  readonly position: readonly [number, number, number]
  readonly target: readonly [number, number, number]
}

/**
 * The web sits around the origin. The camera eases between these:
 *
 * - `idle` is wide, so the hero line has air around it and the sparse early
 *   web reads as deliberate.
 * - `searching` steps in and off axis, as if following something across the
 *   strands rather than staring at the middle.
 * - `revealing` comes back to the centre and closer, so the web holds the
 *   story the title names.
 * - `celebrating` is the nearest frame, saved for the acceptance beat in 6.6.
 * - `resting` pulls back and slightly aside, the day settled.
 */
export const CAMERA_FRAMES: Record<Beat, CameraFrame> = {
  idle: { position: [0, 0.35, 7.6], target: [0, 0.1, 0] },
  searching: { position: [0.85, 0.05, 6.9], target: [0.3, -0.1, 0] },
  revealing: { position: [0, 0.2, 6.5], target: [0, 0.05, 0] },
  celebrating: { position: [0, -0.1, 6], target: [0, 0.1, 0] },
  resting: { position: [-0.7, 0.45, 8.1], target: [0, 0.15, 0] },
}

/** The phone tier pulls back so the narrower frame keeps more of the web. */
export const MOBILE_PULL_BACK = 1.45

/** How far, in world units, the pointer may move the camera. */
export const PARALLAX_DISTANCE = 0.14

/** The vertical tilt is a fraction of the horizontal one, so it stays quiet. */
export const PARALLAX_RISE = 0.6

/** How quickly the camera eases toward its frame. */
export const SETTLE_STIFFNESS = 6

/** A thumb moves the view less than a mouse, so a drag cannot swing it. */
export const TOUCH_TILT = 0.7

/** How close counts as framed, so the stage can stop drawing. */
export const SETTLE_EPSILON = 0.002

/** A pointer position normalised to `-1..1` on each axis. */
export interface PointerTilt {
  readonly x: number
  readonly y: number
}

export function clampPointer(value: number): number {
  return Math.min(1, Math.max(-1, Number.isFinite(value) ? value : 0))
}

/**
 * The tilt a pointer event asks for, normalised to `-1..1`. Mouse, pen and
 * touch all tilt (the phone tier's equivalent), and anything else is ignored.
 * A phone uses a smaller factor so a thumb cannot swing the whole frame.
 */
export function tiltFor(
  pointerType: string,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
): PointerTilt | null {
  if (pointerType !== 'mouse' && pointerType !== 'pen' && pointerType !== 'touch') {
    return null
  }

  if (width <= 0 || height <= 0) {
    return null
  }

  const factor = pointerType === 'touch' ? TOUCH_TILT : 1

  return {
    // `+ 0` keeps a centred axis from surfacing as negative zero.
    x: clampPointer((clientX / width) * 2 - 1) * factor + 0,
    y: clampPointer(-((clientY / height) * 2 - 1)) * factor + 0,
  }
}

/** The frame for a beat, pulled back on the phone tier. */
export function frameFor(beat: Beat, mobile: boolean): CameraFrame {
  const frame = CAMERA_FRAMES[beat]

  if (!mobile) {
    return frame
  }

  const [x, y, z] = frame.position
  const [tx, ty, tz] = frame.target

  return {
    position: [x * 0.6, y * 0.8, z * MOBILE_PULL_BACK],
    target: [tx * 0.6, ty, tz],
  }
}

/** The bounded offset a pointer may add. Reduced motion adds none. */
export function parallaxOffset(
  pointer: PointerTilt,
  reducedMotion: boolean,
): readonly [number, number] {
  if (reducedMotion) {
    return [0, 0]
  }

  return [
    clampPointer(pointer.x) * PARALLAX_DISTANCE,
    clampPointer(pointer.y) * PARALLAX_DISTANCE * PARALLAX_RISE,
  ]
}

/**
 * The share of the remaining distance to cover in one frame, from the elapsed
 * time. Exponential, so it reads as weight rather than a linear tween, and it
 * is frame rate independent.
 */
export function smoothing(stiffness: number, delta: number): number {
  const step = Math.min(Math.max(delta, 0), 0.1)

  return 1 - Math.exp(-stiffness * step)
}

/** Whether a point has arrived, so the stage can stop drawing. */
export function settled(
  current: { readonly x: number; readonly y: number; readonly z: number },
  target: { readonly x: number; readonly y: number; readonly z: number },
  epsilon = SETTLE_EPSILON,
): boolean {
  const dx = current.x - target.x
  const dy = current.y - target.y
  const dz = current.z - target.z

  return Math.sqrt(dx * dx + dy * dy + dz * dz) <= epsilon
}
