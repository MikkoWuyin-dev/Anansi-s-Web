import { describe, expect, it } from 'vitest'

import type { Topic } from '../../src/content/types.ts'
import { renderBundle, sortTopics } from './compile.ts'

const topic = (overrides: Partial<Topic> = {}): Topic => ({
  id: 'the-cobra-effect',
  title: 'The Cobra Effect',
  domain: 'economics',
  difficulty: 3,
  tags: ['counterintuitive', 'obscure'],
  resurfacing: true,
  added: '2026-10-16',
  ...overrides,
})

describe('sortTopics', () => {
  it('orders by id so the bundle diff stays quiet', () => {
    const ordered = sortTopics([
      topic({ id: 'why-rivers-meander' }),
      topic({ id: 'abc' }),
      topic({ id: 'the-cobra-effect' }),
    ])

    expect(ordered.map((entry) => entry.id)).toEqual([
      'abc',
      'the-cobra-effect',
      'why-rivers-meander',
    ])
  })

  it('does not mutate the input', () => {
    const input = [topic({ id: 'b' }), topic({ id: 'a' })]
    sortTopics(input)

    expect(input.map((entry) => entry.id)).toEqual(['b', 'a'])
  })
})

describe('renderBundle', () => {
  it('is byte for byte identical regardless of input order', () => {
    const a = topic({ id: 'a' })
    const b = topic({ id: 'b', title: 'B' })

    expect(renderBundle([a, b])).toBe(renderBundle([b, a]))
  })

  it('states the topic count in the header', () => {
    const source = renderBundle([topic({ id: 'a' }), topic({ id: 'b' })])

    expect(source).toContain('// Topics: 2')
  })

  it('marks itself generated and names the regeneration command', () => {
    const source = renderBundle([topic()])

    expect(source).toContain('GENERATED FILE. Do not edit by hand.')
    expect(source).toContain('npm run content:build')
  })

  it('emits a typed array so a bad entry fails the typecheck', () => {
    expect(renderBundle([topic()])).toContain('export const topics: Topic[] = [')
  })

  it('preserves the authored tag order', () => {
    const source = renderBundle([topic({ tags: ['obscure', 'fascinating'] })])

    expect(source).toContain("tags: ['obscure', 'fascinating']")
  })

  it('escapes a title that contains an apostrophe', () => {
    const source = renderBundle([topic({ title: "Why the Sky Isn't Blue" })])

    expect(source).toContain(`title: "Why the Sky Isn't Blue"`)
  })

  it('renders every topic it is given', () => {
    const source = renderBundle([
      topic({ id: 'a' }),
      topic({ id: 'b', title: 'B' }),
      topic({ id: 'c', title: 'C' }),
    ])

    expect(source.match(/^ {2}\{$/gm)).toHaveLength(3)
  })
})
