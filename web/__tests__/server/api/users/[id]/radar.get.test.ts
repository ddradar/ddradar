import { privateUser } from '@ddradar/core/__tests__/data'
import { fetchList, fetchOne } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import type { GrooveRadarInfo } from '~/server/api/v1/users/[id]/radar.get'
import getGrooveRadars from '~/server/api/v1/users/[id]/radar.get'
import { canReadUserData } from '~/server/auth'
import { getQueryInteger, sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~/server/auth')
vi.mock('~/server/utils')

describe('GET /api/v1/users/[id]/radar', () => {
  const radar = { stream: 100, voltage: 100, air: 100, freeze: 100, chaos: 100 }
  const radars: GrooveRadarInfo[] = [
    { ...radar, playStyle: 1 },
    { ...radar, playStyle: 2 },
  ]

  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchList).mockResolvedValue(radars as any)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchOne).mockClear()
    vi.mocked(fetchList).mockClear()
  })

  const invalidId = 'ユーザー'
  test(`(id: "${invalidId}") returns 404`, async () => {
    // Arrange
    const event = createEvent({ id: invalidId })

    // Act
    const result = await getGrooveRadars(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test('(id: "not_exists_user") returns 404', async () => {
    // Arrange
    const event = createEvent({ id: 'not_exists_user' })
    vi.mocked(fetchOne).mockResolvedValue(null)

    // Act
    const result = await getGrooveRadars(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(fetchList)).not.toBeCalled()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test(`returns 404 if canReadUserData() returns false`, async () => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(privateUser as any)
    vi.mocked(canReadUserData).mockReturnValue(false)

    // Act
    const result = await getGrooveRadars(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(fetchList)).not.toBeCalled()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test.each([
    ['', []],
    ['1', [{ condition: 'c.playStyle = @', value: 1 }]],
    ['2', [{ condition: 'c.playStyle = @', value: 2 }]],
  ])(`?style=%s returns "200 OK"`, async (style, conditions) => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    vi.mocked(canReadUserData).mockReturnValue(true)
    vi.mocked(getQueryInteger).mockReturnValue(parseFloat(style))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(privateUser as any)

    // Act
    const result = await getGrooveRadars(event)

    // Assert
    expect(result).toStrictEqual(radars)
    expect(vi.mocked(fetchList).mock.calls[0][2]).toStrictEqual([
      { condition: 'c.userId = @', value: privateUser.id },
      { condition: 'c.type = "radar"' },
      ...conditions,
    ])
  })
})
