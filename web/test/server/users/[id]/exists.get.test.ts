// @vitest-environment node
import { fetchOne } from '@ddradar/db'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { publicUser } from '~/../core/test/data'
import handler from '~/server/api/v1/users/[id]/exists.get'
import { createEvent } from '~/test/test-utils-server'

vi.mock('@ddradar/db')

describe('GET /api/v1/users/[id]/exists', () => {
  const dbUser = { id: publicUser.id }
  beforeEach(() => {
    vi.mocked(fetchOne).mockClear()
  })

  test(`<anonymous user> returns 401`, async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(false)
    const event = createEvent({ id: dbUser.id })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(fetchOne)).not.toBeCalled()
  })

  const invalidId = 'ユーザー'
  test(`(id: "${invalidId}") returns 400`, async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(true)
    const event = createEvent({ id: invalidId })

    // Act - Assert
    await expect(handler(event)).rejects.toThrowError()
    expect(vi.mocked(fetchOne)).not.toBeCalled()
  })

  test('(id: "not_exists_user") returns 200 with { exists: false }', async () => {
    // Arrange
    const id = 'not_exists_user'
    vi.mocked(hasRole).mockReturnValue(true)
    vi.mocked(fetchOne).mockResolvedValue(null)
    const event = createEvent({ id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual({ id, exists: false })
    expect(vi.mocked(fetchOne)).toBeCalledWith('Users', ['id'], {
      condition: 'c.id = @',
      value: id,
    })
  })

  test(`(id: "${dbUser.id}") returns 200 with { exists: true }`, async () => {
    // Arrange
    vi.mocked(hasRole).mockReturnValue(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(fetchOne).mockResolvedValue(dbUser as any)
    const event = createEvent({ id: dbUser.id })

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual({ id: dbUser.id, exists: true })
    expect(vi.mocked(fetchOne)).toBeCalledWith('Users', ['id'], {
      condition: 'c.id = @',
      value: dbUser.id,
    })
  })
})
