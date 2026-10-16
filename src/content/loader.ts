import { topics } from './topics.generated'
import type { Topic } from './types'

/**
 * The topic pool the engine receives as `library` (MCD §5).
 *
 * This seam exists so the bundle can later become a fetch or a server
 * response without touching a single caller. It performs no selection logic:
 * data in, data out. Selection belongs to `src/engine/`.
 */
export function getLibrary(): readonly Topic[] {
  return topics
}
