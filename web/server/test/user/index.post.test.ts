// @vitest-environment node
import type { User } from '@ddradar/core'
import { publicUser } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import handler from '~~/server/api/v2/user/index.post'
import { createClientPrincipal, createEvent } from '~~/server/test/utils'

describe('POST /api/v2/user', () => {
  const user: User = { ...publicUser }
  const principal = createClientPrincipal(user.id, 'loginId')
  beforeEach(() => {
    vi.mocked(getUserRepository).mockClear()
  })

  test('returns 401 error when not logged in', async () => {
    // Arrange
    const event = createEvent()
    vi.mocked(getClientPrincipal).mockReturnValue(null)

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 401 })
    )
    expect(vi.mocked(getUserRepository)).not.toHaveBeenCalled()
  })

  test('returns 400 if body is not UserSchema', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, null)
    vi.mocked(getClientPrincipal).mockReturnValue(principal)

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(vi.mocked(getUserRepository)).not.toHaveBeenCalled()
  })

  test('returns 200 with JSON (Create)', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, user)
    vi.mocked(getClientPrincipal).mockReturnValue(principal)
    const get = vi.fn().mockResolvedValue(undefined)
    const create = vi.fn()
    const update = vi.fn()
    vi.mocked(getUserRepository).mockReturnValueOnce({
      get,
      create,
      update,
    } as unknown as ReturnType<typeof getUserRepository>)

    // Act
    const result = await handler(event)

    // Assert
    expect(result).toStrictEqual(user)
    expect(get).toHaveBeenCalledWith('', 'loginId')
    expect(create).toHaveBeenCalledWith(user, 'loginId')
    expect(update).not.toHaveBeenCalled()
  })

  test.each([{ name: 'AFRO' }, { isPublic: true }, { code: 20000000 }])(
    'returns "200 OK" with JSON body (Update) if changed %o',
    async (diff: Partial<User>) => {
      // Arrange
      const body: User = {
        id: user.id,
        name: user.name,
        area: user.area,
        isPublic: user.isPublic,
        ...diff,
      }
      const event = createEvent(undefined, undefined, body)
      vi.mocked(getClientPrincipal).mockReturnValue(principal)
      const get = vi.fn().mockResolvedValue(publicUser)
      const create = vi.fn()
      const update = vi.fn()
      vi.mocked(getUserRepository).mockReturnValueOnce({
        get,
        create,
        update,
      } as unknown as ReturnType<typeof getUserRepository>)

      // Act
      const result = await handler(event)

      // Assert
      expect(result).toStrictEqual(body)
      expect(get).toHaveBeenCalledWith('', 'loginId')
      expect(create).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith(body)
    }
  )

  test('throws 400 error when changed user.id', async () => {
    // Arrange
    const event = createEvent(undefined, undefined, { ...user, id: 'update' })
    vi.mocked(getClientPrincipal).mockReturnValue(principal)
    const get = vi.fn().mockResolvedValue(publicUser)
    const create = vi.fn()
    const update = vi.fn()
    vi.mocked(getUserRepository).mockReturnValueOnce({
      get,
      create,
      update,
    } as unknown as ReturnType<typeof getUserRepository>)

    // Act - Assert
    await expect(handler(event)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 })
    )
    expect(get).toHaveBeenCalledWith('', 'loginId')
    expect(create).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })
})
