import {
  existsUser,
  getClearStatus,
  getCurrentUser,
  getGrooveRadar,
  getScoreStatus,
  getUserInfo,
  getUserList,
  postUserInfo,
  User,
} from '~/api/user'

describe('./api/user.ts', () => {
  const user: User = {
    id: 'foo_user',
    name: 'Foo',
    area: 13,
    isPublic: true,
  }
  describe('existsUser', () => {
    test(`($http, ${user.id}) calls GET "/api/v1/user/exists/${user.id}"`, async () => {
      // Arrange
      const $http = { $get: jest.fn<Promise<any>, [string]>() }
      $http.$get.mockResolvedValue({ exists: true })

      // Act
      const result = await existsUser($http, user.id)

      // Assert
      expect(result).toBe(true)
      expect($http.$get.mock.calls).toHaveLength(1)
      expect($http.$get.mock.calls[0][0]).toBe('/api/v1/user/exists/foo_user')
    })
  })
  describe('getCurrentUser', () => {
    test('($http) calls GET "/api/v1/user"', async () => {
      // Arrange
      const $http = { $get: jest.fn<Promise<any>, [string]>() }
      $http.$get.mockResolvedValue(user)

      // Act
      const result = await getCurrentUser($http)

      // Assert
      expect(result).toBe(user)
      expect($http.$get.mock.calls).toHaveLength(1)
      expect($http.$get.mock.calls[0][0]).toBe('/api/v1/user')
    })
  })
  describe('getUserList', () => {
    type Option = { searchParams: URLSearchParams }
    const $http = { $get: jest.fn<Promise<any>, [string, Option]>() }
    $http.$get.mockResolvedValue([])
    beforeEach(() => {
      $http.$get.mockClear()
    })
    test.each([
      [undefined, undefined, undefined, ''] as const,
      ['', 0, 0, ''] as const,
      ['foo', undefined, undefined, 'name=foo'] as const,
      [undefined, 13, undefined, 'area=13'] as const,
      [undefined, undefined, 10000000, 'code=10000000'] as const,
      ['foo', 26, 20000000, 'name=foo&area=26&code=20000000'] as const,
    ])(
      '($http, "%s", %i, %i) calls  GET "/api/v1/users%s"',
      async (name, area, code, query) => {
        // Arrange - Act
        const result = await getUserList($http, name, area, code)

        expect(result).toHaveLength(0)
        expect($http.$get.mock.calls).toHaveLength(1)
        expect($http.$get.mock.calls[0][0]).toBe('/api/v1/users')
        expect($http.$get.mock.calls[0][1].searchParams.toString()).toBe(query)
      }
    )
  })
  describe('getUserInfo', () => {
    test(`($http, "${user.id}") calls GET "/api/v1/users/${user.id}"`, async () => {
      // Arrange
      const $http = { $get: jest.fn<Promise<any>, [string]>() }
      $http.$get.mockResolvedValue(user)

      // Act
      const result = await getUserInfo($http, user.id)

      // Assert
      expect(result).toBe(user)
      expect($http.$get.mock.calls).toHaveLength(1)
      expect($http.$get.mock.calls[0][0]).toBe('/api/v1/users/foo_user')
    })
  })
  describe('getClearStatus', () => {
    test(`($http, "${user.id}") calls GET "/api/v1/users/${user.id}/clear"`, async () => {
      // Arrange
      const $http = { $get: jest.fn<Promise<any>, [string]>() }
      $http.$get.mockResolvedValue([])

      // Act
      const result = await getClearStatus($http, user.id)

      // Assert
      expect(result).toHaveLength(0)
      expect($http.$get).toBeCalledWith('/api/v1/users/foo_user/clear')
    })
  })
  describe('getScoreStatus', () => {
    test(`($http, "${user.id}") calls GET "/api/v1/users/${user.id}/score"`, async () => {
      // Arrange
      const $http = { $get: jest.fn<Promise<any>, [string]>() }
      $http.$get.mockResolvedValue([])

      // Act
      const result = await getScoreStatus($http, user.id)

      // Assert
      expect(result).toHaveLength(0)
      expect($http.$get).toBeCalledWith('/api/v1/users/foo_user/score')
    })
  })
  describe('getGrooveRadar', () => {
    test(`($http, "${user.id}") calls GET "/api/v1/users/${user.id}/radar"`, async () => {
      // Arrange
      const $http = { $get: jest.fn<Promise<any>, [string]>() }
      $http.$get.mockResolvedValue([])

      // Act
      const result = await getGrooveRadar($http, user.id)

      // Assert
      expect(result).toHaveLength(0)
      expect($http.$get).toBeCalledWith('/api/v1/users/foo_user/radar')
    })
  })
  describe('postUserInfo', () => {
    test(`($http, user) calls POST "/api/v1/user"`, async () => {
      // Arrange
      const $http = { $post: jest.fn<Promise<any>, [string, User]>() }

      // Act
      await postUserInfo($http, user)

      // Assert
      expect($http.$post.mock.calls).toHaveLength(1)
      expect($http.$post.mock.calls[0][0]).toBe('/api/v1/user')
      expect($http.$post.mock.calls[0][1]).toBe(user)
    })
  })
})
