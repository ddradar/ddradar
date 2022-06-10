import type { Context } from '@azure/functions'
import type { Api } from '@ddradar/core'
import { beforeEach, describe, expect, jest, test } from '@jest/globals'

import { canReadUserData } from '../auth'
import getGrooveRadar from '.'

jest.mock('../auth')

describe('GET /api/v1/users/{id}/radar', () => {
  const radar = { stream: 100, voltage: 100, air: 100, freeze: 100, chaos: 100 }
  const radars: Api.GrooveRadarInfo[] = [
    { ...radar, playStyle: 2 },
    { ...radar, playStyle: 1 },
  ]

  const req = { headers: {} }
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  beforeEach(() => {
    context.bindingData = {}
  })

  test('returns "404 Not Found" if canReadUserData() returns false', async () => {
    // Arrange
    jest.mocked(canReadUserData).mockReturnValue(false)

    // Act
    const result = await getGrooveRadar(context, req, [], [])

    // Assert
    expect(result.status).toBe(404)
  })

  test(`/ returns "200 OK" with JSON body`, async () => {
    // Arrange
    jest.mocked(canReadUserData).mockReturnValue(true)

    // Act
    const result = await getGrooveRadar(context, req, [], radars)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual([radars[1], radars[0]])
  })

  test.each([
    [1, radars[1]],
    [2, radars[0]],
  ])(`/%i returns "200 OK" with [%p]`, async (style, expected) => {
    // Arrange
    jest.mocked(canReadUserData).mockReturnValue(true)
    context.bindingData.style = style

    // Act
    const result = await getGrooveRadar(context, req, [], radars)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual([expected])
  })
})
