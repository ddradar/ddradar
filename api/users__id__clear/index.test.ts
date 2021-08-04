import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { Score } from '@ddradar/core'
import { privateUser, publicUser } from '@ddradar/core/__tests__/data'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import getClearCount from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}/clear', () => {
  const statuses: Api.ClearStatus[] = [
    ...Array(19 * Score.clearLampMap.size).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % 19) + 1,
    clearLamp: (n % Score.clearLampMap.size) as Score.ClearLamp,
    count: n,
  }))
  const total: Omit<Api.ClearStatus, 'clearLamp'>[] = [
    ...Array(19 * 2).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % 19) + 1,
    count: 2000,
  }))
  const sum = (scores: Api.ClearStatus[]) =>
    scores.reduce((p, c) => p + c.count, 0)

  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeEach(() => (req.query = {}))

  test('/not_exist_user/clear returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getClearCount(null, req, [], [], total)

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/${privateUser.id}/clear returns "404 Not Found"`, async () => {
    // Arrange - Act
    const users = [privateUser]
    const result = await getClearCount(null, req, users, statuses, total)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each([
    ['', '', 19 * 2 * 5, 19 * 2 * 2000],
    ['1', '', 19 * 5, 19 * 2000],
    ['', '10', 10, 2 * 2000],
    ['1', '1', 5, 2000],
    ['2', '2', 5, 2000],
  ])(
    `${publicUser.id}/clear?style=%s&lv=%s returns "200 OK" with %i (sum:%i) statuses`,
    async (style, lv, length, count) => {
      // Arrange
      if (style) req.query.style = style
      if (lv) req.query.lv = lv
      const users = [publicUser]

      // Act
      const result = await getClearCount(null, req, users, statuses, total)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
      expect(sum(result.body as Api.ClearStatus[])).toBe(count)
    }
  )

  test(`/${privateUser.id}/clear returns "200 OK" with JSON body if loggedIn`, async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValueOnce(privateUser)
    const users = [privateUser]

    // Act
    const result = await getClearCount(null, req, users, statuses, total)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toHaveLength(19 * (Score.clearLampMap.size + 2))
    expect(sum(result.body as Api.ClearStatus[])).toBe(19 * 2 * 2000)
  })
})
