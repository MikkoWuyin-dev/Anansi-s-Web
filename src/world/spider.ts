/**
 * Anansi's character as numbers (spec 0005, AC-11; roadmap 6.5).
 *
 * He is eight legs and three small spheres. Everything that makes him read as
 * alive is the gait and the pause, not the mesh: the legs alternate, the body
 * dips into a stride, and he holds still when he is looking. Keeping that here
 * means his component can be replaced by a modelled asset without any other
 * module changing, because nothing else knows how he is built.
 */

/** One leg's resting place on the body. Four a side, mirrored. */
export interface Leg {
  readonly side: -1 | 1
  readonly hip: readonly [number, number, number]
  readonly yaw: number
}

/** How far each leg fans fore and aft, front leg first. */
const SPREAD = [0.55, 0.2, -0.2, -0.55] as const

function legsFor(side: -1 | 1): Leg[] {
  return SPREAD.map((spread, index) => ({
    side,
    hip: [side * 0.03, -0.045 + index * 0.028, 0],
    yaw: side * spread,
  }))
}

export const LEGS: readonly Leg[] = [...legsFor(-1), ...legsFor(1)]

/** How far out along x each leg reaches, before the gait bends it. */
export const LEG_REACH = 0.16

/** How much the body sinks into a stride, in world units. */
export const BODY_DIP = 0.012

export interface Gait {
  /** How far the leg swings forward, -1 to 1. */
  readonly swing: number
  /** How far the leg lifts, 0 to 1. */
  readonly lift: number
}

/**
 * The alternating gait: legs on one side step while the other side holds, so
 * the movement reads as a spider rather than a symmetric breathing motion.
 */
export function legGait(index: number, stride: number): Gait {
  const amount = Math.min(1, Math.max(0, stride))

  if (amount === 0) {
    return { swing: 0, lift: 0 }
  }

  const phase = Math.PI * index + amount * Math.PI * 1.4

  return {
    swing: Math.sin(phase) * amount,
    lift: Math.max(0, Math.cos(phase)) * amount * 0.5,
  }
}

/** The body's dip for a stride, bounded so he never leaves his strand. */
export function bodyDip(stride: number): number {
  const amount = Math.min(1, Math.max(0, stride))

  return amount === 0 ? 0 : -BODY_DIP * amount
}

/** Where his eyes sit, so a modelled head can keep the same gaze. */
export const EYES: readonly [readonly [number, number, number], readonly [number, number, number]] = [
  [-0.012, 0.062, 0.024],
  [0.012, 0.062, 0.024],
]
