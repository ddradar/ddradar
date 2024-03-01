// @vitest-environment node
import { fetchList } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { privateUser } from '~~/../core/test/data'
import type { GrooveRadarInfo } from '~~/server/api/v1/users/[id]/radar.get'
import getGrooveRadars from '~~/server/api/v1/users/[id]/radar.get'
import { tryFetchUser } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')

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
    vi.mocked(fetchList).mockClear()
  })

  test(`returns 404 if canReadUserData() returns null`, async () => {
    // Arrange
    const event = createEvent({ id: privateUser.id })
    vi.mocked(tryFetchUser).mockResolvedValue(null)

    // Act
    const result = await getGrooveRadars(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(fetchList)).not.toBeCalled()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  const defaultConditons = [
    { condition: 'c.userId = @', value: privateUser.id },
    { condition: 'c.type = "radar"' },
  ] as const
  test.each([
    ['', defaultConditons],
    ['1', [...defaultConditons, { condition: 'c.playStyle = @', value: 1 }]],
    ['2', [...defaultConditons, { condition: 'c.playStyle = @', value: 2 }]],
  ])(`?style=%s calls fetchList(..., ..., %o)`, async (style, conditions) => {
    // Arrange
    const event = createEvent({ id: privateUser.id }, { style })
    vi.mocked(tryFetchUser).mockResolvedValue(privateUser)

    // Act
    const result = await getGrooveRadars(event)

    // Assert
    expect(result).toStrictEqual(radars)
    expect(vi.mocked(fetchList).mock.calls[0][2]).toStrictEqual(conditions)
  })
})
