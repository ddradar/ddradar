import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import { privateUser, publicUser } from '../core/__tests__/data'
import type { ScoreStatus } from '../core/api/user'
import { danceLevelSet } from '../core/db/scores'
import getClearStatus from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}/score', () => {
  const scores: ScoreStatus[] = [...Array(19 * danceLevelSet.size).keys()].map(
    n => ({
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      rank: [...danceLevelSet][n % danceLevelSet.size],
      count: n,
    })
  )
  const total: Omit<ScoreStatus, 'rank'>[] = [...Array(19 * 2).keys()].map(
    n => ({
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      count: 2000,
    })
  )
  const sum = (scores: ScoreStatus[]) => scores.reduce((p, c) => p + c.count, 0)

  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeEach(() => (req.query = {}))

  test('/not_exists_user/score returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getClearStatus(null, req, [], [], total)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id}/score returns "404 Not Found"`, async () => {
    // Arrange - Act
    const users = [privateUser]
    const result = await getClearStatus(null, req, users, scores, total)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${publicUser.id}/score returns "200 OK" with JSON body`, async () => {
    // Arrange - Act
    const users = [publicUser]
    const result = await getClearStatus(null, req, users, scores, total)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * (danceLevelSet.size + 2))
    expect(sum(result.body as ScoreStatus[])).toBe(19 * 2 * 2000)
  })

  test.each([
    ['1', '', 171, 19 * 2000],
    ['', '19', 18, 2 * 2000],
    ['1', '10', 9, 2000],
    ['2', '11', 9, 2000],
  ])(
    `${publicUser.id}/score?playStyle=%s&level=%s returns "200 OK" with %i (sum:%i) statuses`,
    async (playStyle, level, length, count) => {
      // Arrange
      req.query = { playStyle, level }
      const users = [publicUser]

      // Act
      const result = await getClearStatus(null, req, users, scores, total)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
      expect(sum(result.body as ScoreStatus[])).toBe(count)
    }
  )

  test(`/${privateUser.id}/score returns "200 OK" with JSON body if logged in`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    const users = [privateUser]

    // Act
    const result = await getClearStatus(null, req, users, scores, total)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * (danceLevelSet.size + 2))
    expect(sum(result.body as ScoreStatus[])).toBe(19 * 2 * 2000)
  })
})
