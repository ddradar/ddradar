import type { HttpRequest } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import { privateUser, publicUser } from '../core/__tests__/data'
import type { ClearLamp } from '../core/db/scores'
import type { ClearStatusSchema } from '../core/db/userDetails'
import getGrooveRadar from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}/clear', () => {
  const statuses: Omit<ClearStatusSchema, 'userId' | 'type'>[] = [
    ...Array(19 * 8).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % 19) + 1,
    clearLamp: (n % 8) as ClearLamp,
    count: n,
  }))

  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeEach(() => (req.query = {}))

  test('/foo/clear returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getGrooveRadar(null, req, [], [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id}/clear returns "404 Not Found"`, async () => {
    // Arrange - Act
    const result = await getGrooveRadar(null, req, [privateUser], statuses)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${publicUser.id}/clear returns "200 OK" with JSON body`, async () => {
    // Arrange - Act
    const result = await getGrooveRadar(null, req, [publicUser], statuses)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * 8)
  })

  test.each([
    ['1', '', 76],
    ['', '10', 8],
    ['1', '1', 4],
    ['2', '2', 4],
  ])(
    `${publicUser.id}/clear?playStyle=%s&level=%s returns "200 OK" with %i statuses`,
    async (playStyle, level, length) => {
      // Arrange
      req.query.playStyle = playStyle
      req.query.level = level

      // Act
      const result = await getGrooveRadar(null, req, [publicUser], statuses)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
    }
  )

  test(`/${privateUser.id}/radar returns "200 OK" with JSON body`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)

    // Act
    const result = await getGrooveRadar(null, req, [privateUser], statuses)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * 8)
  })
})
