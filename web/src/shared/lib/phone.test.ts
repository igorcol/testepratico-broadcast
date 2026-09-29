import { describe, expect, it } from 'vitest'
import { formatPhone, normalizePhone } from '@/shared/lib/phone'

describe('normalizePhone', () => {
  it.each([
    ['(11) 99999-8888', '+5511999998888'],
    ['11999998888', '+5511999998888'],
    ['(11) 3333-4444', '+551133334444'],
    ['+55 11 99999-8888', '+5511999998888'],
    ['5511999998888', '+5511999998888'],
    ['(55) 99999-8888', '+5555999998888'],
    ['+1 415 555 2671', '+14155552671'],
  ])('normaliza %s para %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it.each(['', 'abc', '9999-8888', '+55 11 9999', '+0 123456789'])('recusa %s', (input) => {
    expect(normalizePhone(input)).toBeNull()
  })
})

describe('formatPhone', () => {
  it('formata celular brasileiro', () => {
    expect(formatPhone('+5511999998888')).toBe('+55 (11) 99999-8888')
  })

  it('formata fixo brasileiro', () => {
    expect(formatPhone('+551133334444')).toBe('+55 (11) 3333-4444')
  })

  it('mantém número internacional como está', () => {
    expect(formatPhone('+14155552671')).toBe('+14155552671')
  })
})