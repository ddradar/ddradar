import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import { privateUser, publicUser } from '../core/__tests__/data'
import type { ClearStatus } from '../core/api/user'
import { ClearLamp, clearLampMap } from '../core/db/scores'
import getGrooveRadar from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}/clear', () => {
  const statuses: ClearStatus[] = [...Array(19 * clearLampMap.size).keys()].map(
    n => ({
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      clearLamp: (n % clearLampMap.size) as ClearLamp,
      count: n,
    })
  )
  const total: Omit<ClearStatus, 'clearLamp'>[] = [...Array(19 * 2).keys()].map(
    n => ({
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      count: 2000,
    })
  )
  const sum = (scores: ClearStatus[]) => scores.reduce((p, c) => p + c.count, 0)

  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeEach(() => (req.query = {}))

  test('/foo/clear returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getGrooveRadar(null, req, [], [], total)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id}/clear returns "404 Not Found"`, async () => {
    // Arrange - Act
    const users = [privateUser]
    const result = await getGrooveRadar(null, req, users, statuses, total)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${publicUser.id}/clear returns "200 OK" with JSON body`, async () => {
    // Arrange - Act
    const users = [publicUser]
    const result = await getGrooveRadar(null, req, users, statuses, total)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * (clearLampMap.size + 2))
    expect(sum(result.body as ClearStatus[])).toBe(19 * 2 * 2000)
  })

  test.each([
    ['1', '', 95, 19 * 2000],
    ['', '10', 10, 2 * 2000],
    ['1', '1', 5, 2000],
    ['2', '2', 5, 2000],
  ])(
    `${publicUser.id}/clear?playStyle=%s&level=%s returns "200 OK" with %i (sum:%i) statuses`,
    async (playStyle, level, length, count) => {
      // Arrange
      req.query.playStyle = playStyle
      req.query.level = level
      const users = [publicUser]

      // Act
      const result = await getGrooveRadar(null, req, users, statuses, total)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
      expect(sum(result.body as ClearStatus[])).toBe(count)
    }
  )

  test(`/${privateUser.id}/radar returns "200 OK" with JSON body if loggedIn`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    const users = [privateUser]

    // Act
    const result = await getGrooveRadar(null, req, users, statuses, total)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * (clearLampMap.size + 2))
    expect(sum(result.body as ClearStatus[])).toBe(19 * 2 * 2000)
  })
})
