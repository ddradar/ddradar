import type { HttpRequest } from '@azure/functions'
import {
  areaHiddenUser,
  noPasswordUser,
  privateUser,
  publicUser,
} from '@ddradar/core/__tests__/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getClientPrincipal } from '../auth'
import getUserList from '.'

vi.mock('../auth')

describe('GET /api/v1/users', () => {
  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  const users = [areaHiddenUser, noPasswordUser, privateUser, publicUser]
  beforeEach(() => {
    req.query = {}
  })

  test.each([
    [undefined, undefined, undefined, 2],
    ['', '', '', 2],
    ['13', '', '', 1],
    ['', 'User', '', 2],
    ['', '', '10000000', 1],
    ['', '', '0', 2],
    ['', '', '100000000', 2],
  ])(
    '?area=%s&name=%s&code=%s returns %i user(s)',
    async (area, name, code, length) => {
      // Arrange
      req.query = { area, name, code }

      // Act
      const result = await getUserList(null, req, users)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
    }
  )

  test('returns 3 users if logged in privateUser', async () => {
    // Arrange
    vi.mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: 'user',
      userId: privateUser.loginId,
      userRoles: ['anonymous', 'authenticated'],
    })

    // Act
    const result = await getUserList(null, req, users)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(3)
  })
})
