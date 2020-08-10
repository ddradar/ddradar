import { ClientPrincipal, getClientPrincipal } from '~/api/auth'

type AuthResult = {
  clientPrincipal: ClientPrincipal | null
}

describe('./api/auth.ts', () => {
  describe('getClientPrincipal()', () => {
    test('calls GET "/.auth/me"', async () => {
      // Arrange
      const $http = { $get: jest.fn<Promise<any>, [string]>() }
      $http.$get.mockResolvedValue({ clientPrincipal: null })

      // Act
      const result = await getClientPrincipal($http)

      // Assert
      expect(result).toBeNull()
      expect($http.$get.mock.calls).toHaveLength(1)
      expect($http.$get.mock.calls[0][0]).toBe('/.auth/me')
    })
  })
})
