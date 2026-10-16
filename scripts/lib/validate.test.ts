import { describe, expect, it } from 'vitest'

import type { Topic } from '../../src/content/types.ts'
import {
  similarity,
  titleTokens,
  validateLibrary,
  validateTopic,
  type ValidTopic,
} from './validate.ts'

const FILE = 'content/topics/the-cobra-effect.json'

// Deliberately loose: several cases below pass keys the schema must reject.
const entry = (overrides: Record<string, unknown> = {}): unknown => ({
  id: 'the-cobra-effect',
  title: 'The Cobra Effect',
  domain: 'economics',
  difficulty: 3,
  tags: ['counterintuitive'],
  resurfacing: false,
  added: '2026-10-16',
  ...overrides,
})

/** Asserts the entry is rejected, and that the message names the field. */
const rejects = (raw: unknown, field: keyof Topic | undefined): void => {
  const { topic, issues } = validateTopic(raw, FILE)
  const errors = issues.filter((issue) => issue.severity === 'error')

  expect(topic).toBeNull()
  expect(errors.length).toBeGreaterThan(0)

  if (field !== undefined) {
    expect(errors.some((issue) => issue.field === field)).toBe(true)
  }
}

describe('validateTopic', () => {
  it('accepts a well formed entry', () => {
    const { topic, issues } = validateTopic(entry(), FILE)

    expect(issues).toEqual([])
    expect(topic?.id).toBe('the-cobra-effect')
  })

  it('rejects a value that is not an object', () => {
    for (const value of [null, 'topic', 42, [], [entry()]]) {
      rejects(value, undefined)
    }
  })

  it('reports every missing required field', () => {
    const { issues } = validateTopic({}, FILE)
    const missing = issues.filter((issue) => issue.message === 'missing required field')

    expect(missing).toHaveLength(7)
  })

  it('rejects an unknown field', () => {
    rejects(entry({ summary: 'a spoiler the reveal must never carry' }), undefined)
  })

  it('rejects a domain outside the list', () => {
    rejects(entry({ domain: 'politics' }), 'domain')
  })

  it('rejects a difficulty outside 1 to 3', () => {
    rejects(entry({ difficulty: 4 }), 'difficulty')
    rejects(entry({ difficulty: 'easy' }), 'difficulty')
  })

  it('rejects an unknown tag', () => {
    rejects(entry({ tags: ['counterintuitive', 'made-up-tag'] }), 'tags')
  })

  it('rejects an empty or repeated tag list', () => {
    rejects(entry({ tags: [] }), 'tags')
    rejects(entry({ tags: ['obscure', 'obscure'] }), 'tags')
  })

  it('rejects a title stored in capitals', () => {
    rejects(entry({ title: 'THE COBRA EFFECT' }), 'title')
  })

  it('rejects an id that does not match the file name', () => {
    rejects(entry({ id: 'the-roach-motel' }), 'id')
  })

  it('rejects a malformed slug', () => {
    rejects(entry({ id: 'The Cobra Effect' }), 'id')
    rejects(entry({ id: 'the--cobra-effect' }), 'id')
  })

  it('rejects a malformed or impossible date', () => {
    rejects(entry({ added: '16-10-2026' }), 'added')
    rejects(entry({ added: '2026-02-31' }), 'added')
  })

  it('rejects a non boolean resurfacing flag', () => {
    rejects(entry({ resurfacing: 'yes' }), 'resurfacing')
  })
})

const valid = (
  id: string,
  title: string,
  overrides: Record<string, unknown> = {},
): ValidTopic => ({
  file: `content/topics/${id}.json`,
  topic: entry({ id, title, ...overrides }) as Topic,
})

describe('validateLibrary', () => {
  it('flags a duplicate id', () => {
    const issues = validateLibrary([
      valid('the-cobra-effect', 'The Cobra Effect'),
      valid('the-cobra-effect', 'A Different Title'),
    ])

    expect(issues.some((issue) => issue.message.includes('duplicate id'))).toBe(true)
  })

  it('flags a duplicate title that differs only in case and punctuation', () => {
    const issues = validateLibrary([
      valid('why-onions-make-you-cry', 'Why Onions Make You Cry'),
      valid('onions-and-tears', 'why onions make you cry!'),
    ])

    expect(issues.some((issue) => issue.message.includes('duplicate title'))).toBe(true)
  })

  it('warns about a near duplicate title', () => {
    const issues = validateLibrary([
      valid('why-traffic-jams-appear-from-nothing', 'Why Traffic Jams Appear From Nothing'),
      valid('why-traffic-jams-appear-from-nowhere', 'Why Traffic Jams Appear From Nowhere'),
    ])

    expect(issues.some((issue) => issue.message.includes('looks close'))).toBe(true)
  })

  it('warns about uncompiled domains and difficulty levels', () => {
    const issues = validateLibrary([valid('the-cobra-effect', 'The Cobra Effect')])

    expect(issues.some((issue) => issue.message === 'no topics yet for domain "science"')).toBe(true)
    expect(issues.some((issue) => issue.message === 'no topics yet at difficulty 1')).toBe(true)
  })

  it('does not warn when a single topic covers its own domain and level', () => {
    const issues = validateLibrary([valid('the-cobra-effect', 'The Cobra Effect')])

    expect(issues.some((issue) => issue.message.includes('domain "economics"'))).toBe(false)
    expect(issues.some((issue) => issue.message.includes('difficulty 3'))).toBe(false)
  })

  it('does not flag the real library as having duplicates', async () => {
    const { loadLibrary } = await import('./load.ts')
    const { entries, issues } = await loadLibrary()
    const duplicates = issues.filter(
      (issue) => issue.message.includes('duplicate'),
    )

    expect(entries.length).toBeGreaterThan(0)
    expect(duplicates).toEqual([])
  })
})

describe('similarity', () => {
  it('is 1 for the same title and 0 for unrelated titles', () => {
    expect(similarity(titleTokens('Why Rivers Meander'), titleTokens('Why Rivers Meander'))).toBe(1)
    expect(similarity(titleTokens('Why Rivers Meander'), titleTokens('The Cobra Effect'))).toBe(0)
  })

  it('ignores short words when comparing', () => {
    expect([...titleTokens('Why Onions Make You Cry')]).toEqual([
      'why',
      'onions',
      'make',
      'you',
      'cry',
    ])
  })
})
