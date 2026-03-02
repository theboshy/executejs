import { describe, it, expect } from 'vitest'
import { cleanError, formatTime } from './utils.js'

// -- cleanError ---------------------------------------------------------------

describe('cleanError', () => {
  it('strips the stack trace from a ReferenceError', () => {
    const raw = 'ReferenceError: x is not defined at <eval>:1:1(0)'
    expect(cleanError(raw)).toBe('ReferenceError: x is not defined')
  })

  it('strips a named function frame before <eval>', () => {
    const raw = 'TypeError: null has no properties at myFn (<eval>:3:5)'
    expect(cleanError(raw)).toBe('TypeError: null has no properties')
  })

  it('leaves a message with no stack trace unchanged', () => {
    const raw = 'execution timeout: infinite loop detected'
    expect(cleanError(raw)).toBe('execution timeout: infinite loop detected')
  })

  it('trims surrounding whitespace', () => {
    const raw = '  SyntaxError: unexpected token  '
    expect(cleanError(raw)).toBe('SyntaxError: unexpected token')
  })
})

// -- formatTime ---------------------------------------------------------------

describe('formatTime', () => {
  it('returns HH:MM:SS format', () => {
    const date = new Date(2024, 0, 1, 14, 5, 9) // 14:05:09
    expect(formatTime(date)).toBe('14:05:09')
  })

  it('pads single-digit hours, minutes, seconds', () => {
    const date = new Date(2024, 0, 1, 1, 2, 3) // 01:02:03
    expect(formatTime(date)).toBe('01:02:03')
  })

  it('uses 24-hour format for PM times', () => {
    const date = new Date(2024, 0, 1, 23, 59, 59) // 23:59:59
    expect(formatTime(date)).toBe('23:59:59')
  })
})
