import { describe, expect, test } from 'vitest'
import * as z from 'zod/mini'

import { Area, getNarrowedArea, userSchema } from '#shared/schemas/user'
import { notValidObject } from '~~/test/data/schema'

describe('/shared/schemas/user', () => {
  describe('userSchema', () => {
    const validUserInfo: UserInfo = {
      id: 'new_user',
      name: 'New User',
      area: Area.東京都,
      isPublic: true,
    }

    test.each([
      ...notValidObject,
      { ...validUserInfo, id: 1 },
      { ...validUserInfo, id: '#foo' },
      {
        ...validUserInfo,
        id: 'Very-Long-Name5678901234567890123',
      },
      { ...validUserInfo, area: 'Tokyo' },
      { ...validUserInfo, area: -1 },
      { ...validUserInfo, ddrCode: '1000-0000' },
      { ...validUserInfo, ddrCode: -1 },
      { ...validUserInfo, ddrCode: 100000000 },
      { ...validUserInfo, isPublic: undefined },
      { id: 'new_user', name: 'New User', area: Area.東京都 },
    ])('z.validate(userSchema, %o) returns false', o =>
      expect(z.validate(userSchema, o)).toBe(false)
    )

    test.each([
      validUserInfo,
      { ...validUserInfo, id: 'UPPER-CASED' },
      { ...validUserInfo, area: Area.Undefined },
      { ...validUserInfo, code: 10000000 },
      { ...validUserInfo, isPublic: false },
    ])('z.validate(userSchema, %o) returns true', o =>
      expect(z.validate(userSchema, o)).toBe(true)
    )
  })

  describe('getNarrowedArea', () => {
    const overSeas = Object.values(Area).filter(
      i =>
        i !== Area.Japan &&
        i !== Area.Undefined &&
        i !== Area.Overseas &&
        (i < Area.北海道 || i > Area.沖縄県)
    )

    test.each([
      [Area.Undefined, []],
      [Area.北海道, []],
      [Area.Taiwan, []],
      [
        Area.Japan,
        Array.from(
          { length: Area.沖縄県 - Area.北海道 + 1 },
          (_, i) => i + Area.北海道
        ),
      ],
      [
        Area.USA,
        Array.from(
          { length: Area.WashingtonDC - Area.Alaska + 1 },
          (_, i) => i + Area.Alaska
        ),
      ],
      [
        Area.Europe,
        [
          Area.UK,
          Area.Italy,
          Area.Spain,
          Area.Germany,
          Area.France,
          Area.Portugal,
        ],
      ],
      [Area.Overseas, overSeas],
    ])('(%i) returns %o', (area, expected) =>
      expect(getNarrowedArea(area)).toStrictEqual(expected)
    )
  })
})
