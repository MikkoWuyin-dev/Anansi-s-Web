import { describe, expect, it } from 'vitest'

import {
  advanceBuffer,
  isTypingTarget,
  NAMING_WORD,
  namesHim,
  namingStep,
} from '@/app/name'

const type = (text: string): string =>
  [...text].reduce((buffer, key) => advanceBuffer(buffer, key), '')

describe('the word', () => {
  it('is matched one keystroke at a time', () => {
    expect(type(NAMING_WORD)).toBe(NAMING_WORD)
    expect(namesHim(type(NAMING_WORD))).toBe(true)
  })

  it('is matched in any case', () => {
    expect(namesHim(type('AnAnSi'))).toBe(true)
  })

  it('keeps the buffer at the word length, so a stray prefix cannot stick', () => {
    expect(type('xxxxxxanansi')).toBe(NAMING_WORD)
    expect(advanceBuffer(NAMING_WORD, 'a')).toBe('nansia')
  })

  it('is ended by a key that is not a character', () => {
    expect(advanceBuffer('anan', 'Enter')).toBe('')
    expect(advanceBuffer('anan', 'Shift')).toBe('')
    expect(advanceBuffer('anan', 'ArrowLeft')).toBe('')
  })

  it('does not match a prefix', () => {
    expect(namesHim(type('anan'))).toBe(false)
  })
})

describe('the suppressions', () => {
  it('recognises a field the person is typing in', () => {
    expect(isTypingTarget({ tagName: 'INPUT' })).toBe(true)
    expect(isTypingTarget({ tagName: 'textarea' })).toBe(true)
    expect(isTypingTarget({ tagName: 'select' })).toBe(true)
    expect(isTypingTarget({ tagName: 'div', isContentEditable: true })).toBe(true)
    expect(isTypingTarget({ tagName: 'BUTTON' })).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
    expect(isTypingTarget(undefined)).toBe(false)
  })

  it('clears the buffer and stays quiet inside a field', () => {
    expect(namingStep({ buffer: 'anan', key: 's', target: { tagName: 'INPUT' } })).toEqual({
      buffer: '',
      named: false,
    })
  })

  it('ignores a keystroke with a modifier held', () => {
    const result = namingStep({ buffer: 'anans', key: 'i', modifier: true })

    expect(result.named).toBe(false)
    expect(result.buffer).toBe(NAMING_WORD)
  })

  it('never fires during a search', () => {
    expect(namingStep({ buffer: 'anans', key: 'i', searching: true }).named).toBe(false)
  })

  it('answers once a session', () => {
    expect(namingStep({ buffer: 'anans', key: 'i', alreadyNamed: true }).named).toBe(false)
  })

  it('fires on the last letter, from the keyboard, with nothing held', () => {
    expect(namingStep({ buffer: 'anans', key: 'i' })).toEqual({
      buffer: NAMING_WORD,
      named: true,
    })
  })
})
