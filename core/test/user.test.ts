import { describe, expect, test } from 'vitest'

import {
  areaCodeSet,
  isAreaUser,
  type UserSchema,
  userSchema,
} from '../src/user'

describe('user.ts', () => {
  describe('userSchema', () => {
    const validUserInfo: UserSchema = {
      id: 'new_user',
      name: 'New User',
      area: 13,
      isPublic: true,
    }
    test.each([
      undefined,
      null,
      true,
      1,
      'foo',
      {},
      { ...validUserInfo, id: 1 },
      { ...validUserInfo, id: '#foo' },
      { ...validUserInfo, area: 'Tokyo' },
      { ...validUserInfo, area: -1 },
      { ...validUserInfo, code: '1000-0000' },
      { ...validUserInfo, code: -1 },
      { ...validUserInfo, code: 100000000 },
      { ...validUserInfo, isPublic: undefined },
      { ...validUserInfo, password: 0 },
      { id: 'new_user', name: 'New User', area: 13 },
    ])('safeParse(%o) returns { result: false }', o =>
      expect(userSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validUserInfo,
      { ...validUserInfo, id: 'UPPER-CASED' },
      { ...validUserInfo, area: 0 },
      { ...validUserInfo, code: 10000000 },
      { ...validUserInfo, isPublic: false },
      { ...validUserInfo, loginId: 'foo' },
      { ...validUserInfo, password: 'password' },
    ])('safeParse(%o) returns { result: true }', o =>
      expect(userSchema.safeParse(o).success).toBe(true)
    )
  })

  describe('isAreaUser', () => {
    test.each([...areaCodeSet].map(i => ({ id: `${i}` })))(
      '(%o) returns true',
      user => expect(isAreaUser(user)).toBe(true)
    )
    test.each(['000', '-1', '', 'foo'])('({ id: %s }) returns false', id =>
      expect(isAreaUser({ id })).toBe(false)
    )
  })
})
