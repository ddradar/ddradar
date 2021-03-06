import {
  privateUser,
  publicUser,
  testScores,
} from '@ddradar/core/__tests__/data'
import { mocked } from 'ts-jest/utils'

import { getLoginUserInfo } from '../auth'
import deleteChartScore from '.'

jest.mock('../auth')

describe('DELETE /api/v1/scores', () => {
  const req = { headers: {} }
  const score = { ...testScores[2] }

  test('returns "404 Not Found" if unregistered user', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValue(null)

    // Act
    const result = await deleteChartScore(null, req, [])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "404 Not Found" if scores does not contain user score', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValue(privateUser)

    // Act
    const result = await deleteChartScore(null, req, [score])

    // Assert
    expect(result.httpResponse.status).toBe(404)
  })

  test('returns "204 No Content" if scores contains user score', async () => {
    // Arrange
    mocked(getLoginUserInfo).mockResolvedValue(publicUser)

    // Act
    const result = await deleteChartScore(null, req, [score])

    // Assert
    expect(result.httpResponse.status).toBe(204)
    expect(result.documents).toStrictEqual([{ ...score, ttl: 3600 }])
  })
})
