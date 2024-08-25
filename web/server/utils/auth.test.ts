import { privateUser, publicUser } from '@ddradar/core/test/data'
import type { H3Event } from 'h3'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { createClientPrincipal, createEvent } from '~~/server/test/utils'
import { getLoginUserInfo, getUser } from '~~/server/utils/auth'

describe('server/utils/auth.ts', () => {
  describe('getLoginUserInfo', () => {
    beforeEach(() => {
      vi.mocked(getClientPrincipal).mockClear()
      vi.mocked(getUserRepository).mockClear()
    })

    test(`(getClientPrincipal: null) throws 401 error`, async () => {
      // Arrange
      vi.mocked(getClientPrincipal).mockReturnValue(null)

      // Act - Assert
      await expect(getLoginUserInfo({} as H3Event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 401 })
      )
      expect(vi.mocked(getUserRepository)).not.toHaveBeenCalled()
    })

    test(`(getClientPrincipal: <Unregistered User Token>) throws 404 error`, async () => {
      // Arrange
      vi.mocked(getClientPrincipal).mockReturnValue(
        createClientPrincipal('id', 'loginId')
      )
      const get = vi.fn().mockResolvedValue(undefined)
      vi.mocked(getUserRepository).mockReturnValue({
        get,
      } as unknown as ReturnType<typeof getUserRepository>)

      // Act - Assert
      await expect(getLoginUserInfo({} as H3Event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 404 })
      )
      expect(vi.mocked(getClientPrincipal)).toHaveBeenCalled()
      expect(get).toHaveBeenCalledWith('', 'loginId')
    })

    test(`(getClientPrincipal: <Registered User Token>) returns User`, async () => {
      // Arrange
      vi.mocked(getClientPrincipal).mockReturnValue(
        createClientPrincipal(publicUser.id, 'loginId')
      )
      const get = vi.fn().mockResolvedValue(publicUser)
      vi.mocked(getUserRepository).mockReturnValue({
        get,
      } as unknown as ReturnType<typeof getUserRepository>)

      // Act
      const user = await getLoginUserInfo({} as H3Event)

      // Assert
      expect(user).toBe(publicUser)
      expect(vi.mocked(getClientPrincipal)).toHaveBeenCalled()
      expect(vi.mocked(get)).toHaveBeenCalledWith('', 'loginId')
    })
  })

  describe('getUser', () => {
    const event: Parameters<typeof getUser>[0] = createEvent({
      id: '',
    })
    beforeEach(() => {
      event.node.req.headers = {}
      event.context.params!.id = ''
      vi.mocked(getClientPrincipal).mockClear()
      vi.mocked(getUserRepository).mockClear()
    })

    test.each(['', '#user', 'ユーザー'])(
      '({ id: "%s" }) throws 404 error',
      async id => {
        // Arrange
        event.context.params!.id = id

        // Act - Assert
        await expect(getUser(event)).rejects.toThrow(
          expect.objectContaining({ statusCode: 404 })
        )
        expect(vi.mocked(getClientPrincipal)).not.toHaveBeenCalled()
        expect(vi.mocked(getUserRepository)).not.toHaveBeenCalled()
      }
    )

    test('({ id: <Not found or Private User ID> }) throws 404 error', async () => {
      // Arrange
      event.context.params!.id = privateUser.id
      vi.mocked(getClientPrincipal).mockReturnValue(
        createClientPrincipal(privateUser.id, 'loginId')
      )
      const get = vi.fn().mockResolvedValue(undefined)
      vi.mocked(getUserRepository).mockReturnValue({
        get,
      } as unknown as ReturnType<typeof getUserRepository>)

      // Act - Assert
      await expect(getUser(event)).rejects.toThrow(
        expect.objectContaining({ statusCode: 404 })
      )
      expect(vi.mocked(getClientPrincipal)).toHaveBeenCalled()
      expect(vi.mocked(getUserRepository)).toHaveBeenCalled()
      expect(get).toHaveBeenCalledWith(privateUser.id, 'loginId')
    })

    test(`({ id: "${publicUser.id}" }) returns User`, async () => {
      // Arrange
      event.context.params!.id = publicUser.id
      vi.mocked(getClientPrincipal).mockReturnValue(
        createClientPrincipal(publicUser.id, 'loginId')
      )
      const get = vi.fn().mockResolvedValue(publicUser)
      vi.mocked(getUserRepository).mockReturnValue({
        get,
      } as unknown as ReturnType<typeof getUserRepository>)

      // Act
      const user = await getUser(event)

      // Assert
      expect(user).toBe(publicUser)
      expect(vi.mocked(getClientPrincipal)).toHaveBeenCalled()
      expect(vi.mocked(getUserRepository)).toHaveBeenCalled()
      expect(get).toHaveBeenCalledWith(publicUser.id, 'loginId')
    })
  })
})
