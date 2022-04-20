import type { HttpRequest } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { Score } from '@ddradar/core'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { canReadUserData } from '../auth'
import getScoreCount from '.'

vi.mock('../auth')

describe('GET /api/v1/users/{id}/score', () => {
  const scores: Api.ScoreStatus[] = [
    ...Array(19 * Score.danceLevelSet.size).keys(),
  ].map(n => ({
    playStyle: ((n % 2) + 1) as 1 | 2,
    level: (n % 19) + 1,
    rank: [...Score.danceLevelSet][n % Score.danceLevelSet.size],
    count: n,
  }))
  const total: Omit<Api.ScoreStatus, 'rank'>[] = [...Array(19 * 2).keys()].map(
    n => ({
      playStyle: ((n % 2) + 1) as 1 | 2,
      level: (n % 19) + 1,
      count: 2000,
    })
  )
  const sum = (scores: Api.ScoreStatus[]) =>
    scores.reduce((p, c) => p + c.count, 0)

  const req: Pick<HttpRequest, 'headers' | 'query'> = { headers: {}, query: {} }
  beforeEach(() => {
    req.query = {}
  })

  test('returns "404 Not Found" if canReadUserData() returns false', async () => {
    // Arrange
    vi.mocked(canReadUserData).mockReturnValue(false)

    // Act
    const result = await getScoreCount(null, req, [], [], total)

    // Assert
    expect(result.status).toBe(404)
  })

  test.each([
    ['', '', 19 * 2 * 9, 19 * 2 * 2000],
    ['1', '', 19 * 9, 19 * 2000],
    ['', '19', 2 * 9, 2 * 2000],
    ['1', '10', 9, 2000],
    ['2', '11', 9, 2000],
  ])(
    `/score?style=%s&lv=%s returns "200 OK" with %i (sum:%i) statuses`,
    async (style, lv, length, count) => {
      // Arrange
      vi.mocked(canReadUserData).mockReturnValue(true)
      if (style) req.query.style = style
      if (lv) req.query.lv = lv

      // Act
      const result = await getScoreCount(null, req, [], scores, total)

      // Assert
      expect(result.status).toBe(200)
      expect(result.body).toHaveLength(length)
      expect(sum(result.body as Api.ScoreStatus[])).toBe(count)
    }
  )
})
