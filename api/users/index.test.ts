import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getClientPrincipal } from '../auth'
import { fetchUserList } from '../db/users'
import getUserList from '.'

jest.mock('../auth')
jest.mock('../db/users')

describe('GET /api/v1/users', () => {
  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeAll(() => mocked(fetchUserList).mockResolvedValue([]))
  beforeEach(() => {
    req.headers = {}
    req.query = {}
    mocked(fetchUserList).mockClear()
  })

  test.each([
    [undefined, undefined, undefined, undefined, '', undefined],
    ['', '', '', undefined, '', undefined],
    ['1', 'foo', '10000000', 1, 'foo', 10000000],
    ['0', 'foo', '0', undefined, 'foo', undefined],
    ['200', 'foo', '10000000', undefined, 'foo', 10000000],
    ['1', 'foo', '100000000', 1, 'foo', undefined],
  ])(
    '?area=%s&name=%s&code=%s calls fetchUserList("", %i, "%s", %i)',
    async (area, name, code, arg2, arg3, arg4) => {
      // Arrange
      req.query = { area, name, code }

      // Act
      const result = await getUserList(null, req)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(0)
      expect(mocked(fetchUserList)).toBeCalledWith('', arg2, arg3, arg4)
    }
  )

  test('calls fetchUserList(loginId, undefined, "", undefined) if loggedin', async () => {
    // Arrange
    mocked(getClientPrincipal).mockReturnValueOnce({
      identityProvider: 'github',
      userDetails: 'user',
      userId: 'login_id',
      userRoles: ['anonymous', 'authenticated'],
    })

    // Act
    const result = await getUserList(null, req)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(0)
    expect(mocked(fetchUserList)).toBeCalledWith(
      'login_id',
      undefined,
      '',
      undefined
    )
  })
})
