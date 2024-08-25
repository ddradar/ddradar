import { describe, expect, test } from 'vitest'

import {
  Area,
  areaCodeSet,
  findLargerArea,
  isAreaUser,
  type User,
  userSchema,
} from '../src/user'

describe('user.ts', () => {
  describe('userSchema', () => {
    const validUserInfo: User = {
      id: 'new_user',
      name: 'New User',
      area: Area.東京都,
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
      {
        ...validUserInfo,
        id: 'Very-Long-Name5678901234567890123',
      },
      { ...validUserInfo, area: 'Tokyo' },
      { ...validUserInfo, area: -1 },
      { ...validUserInfo, code: '1000-0000' },
      { ...validUserInfo, code: -1 },
      { ...validUserInfo, code: 100000000 },
      { ...validUserInfo, isPublic: undefined },
      { id: 'new_user', name: 'New User', area: Area.東京都 },
    ])('safeParse(%o) returns { result: false }', o =>
      expect(userSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validUserInfo,
      { ...validUserInfo, id: 'UPPER-CASED' },
      { ...validUserInfo, area: Area.Undefined },
      { ...validUserInfo, code: 10000000 },
      { ...validUserInfo, isPublic: false },
    ])('safeParse(%o) returns { result: true }', o =>
      expect(userSchema.safeParse(o).success).toBe(true)
    )
  })

  describe('findLargerArea', () => {
    test.each([
      [Area.北海道, Area.Japan],
      [Area.東京都, Area.Japan],
      [Area.沖縄県, Area.Japan],
      [Area.Alaska, Area.USA],
      [Area.Hawaii, Area.USA],
      [Area.WashingtonDC, Area.USA],
      [Area.UK, Area.Europe],
      [Area.France, Area.Europe],
      [Area.Portugal, Area.Europe],
      [Area.HongKong, Area.Overseas],
      [Area.Korea, Area.Overseas],
      [Area.Taiwan, Area.Overseas],
      [Area.USA, Area.Overseas],
      [Area.Europe, Area.Overseas],
      [Area.Canada, Area.Overseas],
      [Area.Singapore, Area.Overseas],
      [Area.Thailand, Area.Overseas],
      [Area.Australia, Area.Overseas],
      [Area.NewZealand, Area.Overseas],
      [Area.Indonesia, Area.Overseas],
      [Area.Philippines, Area.Overseas],
      [Area.Undefined, Area.Undefined],
      [Area.Overseas, Area.Undefined],
      [Area.Japan, Area.Undefined],
    ])('(%d) returns %d', (area, expected) =>
      expect(findLargerArea(area)).toBe(expected)
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
