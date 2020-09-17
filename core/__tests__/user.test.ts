import { isUserInfo, UserInfo } from '../user'

describe('/user.ts', () => {
  describe('isUserInfo', () => {
    const userInfo: UserInfo = {
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
      { ...userInfo, id: 1 },
      { ...userInfo, id: '#foo' },
      { ...userInfo, area: 'Tokyo' },
      { ...userInfo, area: -1 },
      { ...userInfo, code: '1000-0000' },
      { ...userInfo, code: -1 },
      { ...userInfo, code: 100000000 },
      { ...userInfo, isPublic: undefined },
      { id: 'new_user', name: 'New User', area: 13 },
    ])('(%p) returns false', async (obj: unknown) =>
      expect(isUserInfo(obj)).toBe(false)
    )
    test.each([
      userInfo,
      { ...userInfo, loginId: '1', code: 10000000 },
    ])('(%p) returns true', async (obj: unknown) =>
      expect(isUserInfo(obj)).toBe(true)
    )
  })
})
