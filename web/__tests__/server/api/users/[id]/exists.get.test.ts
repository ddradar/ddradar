import { publicUser } from '@ddradar/core/__tests__/data'
import { fetchOne } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import existsUser from '~/server/api/v1/users/[id]/exists.get'
import { sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('~/server/utils')

describe('GET /api/v1/users/[id]/exists', () => {
  const dbUser = {
    id: publicUser.id,
  }
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
    vi.mocked(fetchOne).mockClear()
  })

  const invalidId = 'ユーザー'
  test(`(id: "${invalidId}") returns 404`, async () => {
    // Arrange
    const event = createEvent({ id: invalidId })

    // Act
    const result = await existsUser(event)

    // Assert
    expect(result).toBeNull()
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
  })

  test('(id: "not_exists_user") returns 200 with { exists: false }', async () => {
    // Arrange
    const id = 'not_exists_user'
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id })

    // Act
    const result = await existsUser(event)

    // Assert
    expect(result).toStrictEqual({ id, exists: false })
    expect(vi.mocked(fetchOne).mock.lastCall?.[2]).toStrictEqual({
      condition: 'c.id = @',
      value: id,
    })
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })

  test(`(id: "${dbUser.id}") returns 200 with { exists: true }`, async () => {
    // Arrange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(dbUser as any)
    const event = createEvent({ id: dbUser.id })

    // Act
    const result = await existsUser(event)

    // Assert
    expect(result).toStrictEqual({ id: dbUser.id, exists: true })
    expect(vi.mocked(fetchOne).mock.lastCall?.[2]).toStrictEqual({
      condition: 'c.id = @',
      value: dbUser.id,
    })
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
  })
})
