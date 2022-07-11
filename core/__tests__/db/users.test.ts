import { describe, expect, test } from 'vitest'

import type { UserSchema } from '../../src/db/users'
import { areaCodeSet, isAreaUser, isUserSchema } from '../../src/db/users'

describe('./db/users.ts', () => {
  describe('isUserSchema', () => {
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
    ])('(%p) returns false', obj => {
      expect(isUserSchema(obj)).toBe(false)
    })
    test.each([
      validUserInfo,
      { ...validUserInfo, id: 'UPPER-CASED' },
      { ...validUserInfo, area: 0 },
      { ...validUserInfo, code: 10000000 },
      { ...validUserInfo, isPublic: false },
      { ...validUserInfo, loginId: 'foo' },
      { ...validUserInfo, password: 'password' },
    ])('(%p) returns true', obj => {
      expect(isUserSchema(obj)).toBe(true)
    })
  })

  describe('isAreaUser', () => {
    test.each([...areaCodeSet].map(i => ({ id: `${i}` })))(
      '(%p) returns true',
      user => expect(isAreaUser(user)).toBe(true)
    )
    test.each(['000', '-1', '', 'foo'])('({ id: %s }) returns false', id =>
      expect(isAreaUser({ id })).toBe(false)
    )
  })
})
