import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import { privateUser, publicUser } from '../core/__tests__/data'
import { danceLevelSet } from '../core/db/scores'
import type { ScoreStatusSchema } from '../core/db/user-details'
import getClearStatus from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}/score', () => {
  const scores: Omit<ScoreStatusSchema, 'userId' | 'type'>[] = [
    ...Array(19 * danceLevelSet.size).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % 19) + 1,
    rank: [...danceLevelSet][n % danceLevelSet.size],
    count: n,
  }))

  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeEach(() => (req.query = {}))

  test('/not_exists_user/score returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getClearStatus(null, req, [], [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id}/score returns "404 Not Found"`, async () => {
    // Arrange - Act
    const result = await getClearStatus(null, req, [privateUser], scores)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${publicUser.id}/score returns "200 OK" with JSON body`, async () => {
    // Arrange

    // Act
    const result = await getClearStatus(null, req, [publicUser], scores)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * danceLevelSet.size)
  })

  test.each([
    ['1', '', 152],
    ['', '19', 16],
    ['1', '10', 8],
    ['2', '11', 8],
  ])(
    `${publicUser.id}/score?playStyle=%s&level=%s returns "200 OK" with %i statuses`,
    async (playStyle, level, length) => {
      // Arrange
      req.query = { playStyle, level }

      // Act
      const result = await getClearStatus(null, req, [publicUser], scores)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
    }
  )

  test(`/${privateUser.id}/score returns "200 OK" with JSON body if logged in`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)

    // Act
    const result = await getClearStatus(null, req, [privateUser], scores)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * danceLevelSet.size)
  })
})
