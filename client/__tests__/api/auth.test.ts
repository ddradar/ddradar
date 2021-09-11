/**
 * @jest-environment node
 */
import { getClientPrincipal } from '~/api/auth'

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
      expect($http.$get).toBeCalledTimes(1)
      expect($http.$get).toBeCalledWith('/.auth/me')
    })
  })
})
