import { describe, expect, test } from 'vitest'

import { Area, getNarrowedArea, userSchema } from '~~/shared/schemas/user'
import { notValidObject } from '~~/test/data/schema'

describe('/shared/schemas/user', () => {
  describe('userSchema', () => {
    const validUserInfo: User = {
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
    ])('safeParse(%o) returns { success: false }', o =>
      expect(userSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validUserInfo,
      { ...validUserInfo, id: 'UPPER-CASED' },
      { ...validUserInfo, area: Area.Undefined },
      { ...validUserInfo, code: 10000000 },
      { ...validUserInfo, isPublic: false },
    ])('safeParse(%o) returns { success: true }', o =>
      expect(userSchema.safeParse(o).success).toBe(true)
    )
  })

  describe('getNarrowedArea', () => {
    test.each([
      [Area.Undefined, []],
      [Area.北海道, []],
      [Area.Taiwan, []],
      [
        Area.Japan,
        [
          ...Array(Area.沖縄県 - Area.北海道 + 1)
            .keys()
            .map(i => i + Area.北海道),
        ],
      ],
      [
        Area.USA,
        [
          ...Array(Area.WashingtonDC - Area.Alaska + 1)
            .keys()
            .map(i => i + Area.Alaska),
        ],
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
      [
        Area.Overseas,
        Object.values(Area).filter(
          i =>
            i !== Area.Japan &&
            i !== Area.Undefined &&
            i !== Area.Overseas &&
            (i < Area.北海道 || i > Area.沖縄県)
        ),
      ],
    ])('(%i) returns %o', (area, expected) =>
      expect(getNarrowedArea(area)).toStrictEqual(expected)
    )
  })
})
