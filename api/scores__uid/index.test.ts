import type { HttpRequest } from '@azure/functions'
import {
  privateUser,
  publicUser,
  testScores,
} from '@ddradar/core/__tests__/data'
import { fetchScoreList } from '@ddradar/db'

import { getLoginUserInfo } from '../auth'
import getUserScores from '.'

jest.mock('@ddradar/db')
jest.mock('../auth')

describe('GET /api/v1/scores/{uid}', () => {
  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeEach(() => jest.mocked(getLoginUserInfo).mockResolvedValue(publicUser))

  test('/not_found_user returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getUserScores(null, req, [])

    // Assert
    expect(result.status).toBe(404)
  })

  test.each([null, publicUser])(
    `/${privateUser.id} returns "404 Not Found" if login as %p`,
    async user => {
      // Arrange
      jest.mocked(getLoginUserInfo).mockResolvedValue(user)

      // Act
      const result = await getUserScores(null, req, [privateUser])

      // Assert
      expect(result.status).toBe(404)
    }
  )

  test(`/${publicUser.id} returns "404 Not Found" if no score`, async () => {
    // Arrange
    jest.mocked(fetchScoreList).mockResolvedValue([])

    // Act
    const result = await getUserScores(null, req, [publicUser])

    // Assert
    expect(result.status).toBe(404)
  })

  test.each([
    [{}, {}],
    [
      { style: '1', diff: '1', lv: '5', lamp: '5', rank: 'AAA' },
      { playStyle: 1, difficulty: 1, level: 5, clearLamp: 5, rank: 'AAA' },
    ],
    [{ style: '3', diff: '-1', lv: '21', lamp: 'PFC', rank: 'F' }, {}],
  ])(
    `/${publicUser.id} (query: %p) calls fetchScoreList("${publicUser.id}", %p)`,
    async (query, expected) => {
      // Arrange
      jest.mocked(fetchScoreList).mockResolvedValue([...testScores])
      const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query }

      // Act
      const result = await getUserScores(null, req, [publicUser])

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(testScores.length)
      expect(jest.mocked(fetchScoreList)).toBeCalledWith(
        publicUser.id,
        expected
      )
    }
  )

  test(`/${privateUser.id} returns "200 OK" with body if login as privateUser`, async () => {
    // Arrange
    jest.mocked(getLoginUserInfo).mockResolvedValue(privateUser)
    jest.mocked(fetchScoreList).mockResolvedValue([...testScores])

    // Act
    const result = await getUserScores(null, req, [privateUser])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(testScores.length)
    expect(jest.mocked(fetchScoreList)).toBeCalledWith(privateUser.id, {})
  })
})
