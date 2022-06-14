import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { Score } from '@ddradar/core'
import { beforeEach, describe, expect, jest, test } from '@jest/globals'

import { canReadUserData } from '../auth'
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
  beforeEach(() => {
    req.query = {}
  })

  test('returns "404 Not Found" if canReadUserData() returns false', async () => {
    // Arrange
    jest.mocked(canReadUserData).mockReturnValue(false)

    // Act
    const result = await getClearCount(null, req, [], [], total)

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
    `?style=%s&lv=%s returns "200 OK" with %i (sum:%i) statuses`,
    async (style, lv, length, count) => {
      // Arrange
      jest.mocked(canReadUserData).mockReturnValue(true)
      if (style) req.query.style = style
      if (lv) req.query.lv = lv

      // Act
      const result = await getClearCount(null, req, [], statuses, total)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
      expect(sum(result.body as Api.ClearStatus[])).toBe(count)
    }
  )
})
