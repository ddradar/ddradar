import { publicUser } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import useAuth from '~~/composables/useAuth'
import Page from '~~/pages/users/[id]/index.vue'
import type { ClearStatus } from '~~/server/api/v1/users/[id]/clear.get'
import type { GrooveRadarInfo } from '~~/server/api/v1/users/[id]/radar.get'
import { mountAsync } from '~~/test/test-utils'

vi.mock('~~/composables/useAuth')

describe('Page /users/[id]', () => {
  const clears: ClearStatus[] = [
    { playStyle: 1, level: 1, clearLamp: -1, count: 10 },
    { playStyle: 1, level: 1, clearLamp: 6, count: 10 },
    { playStyle: 1, level: 1, clearLamp: 7, count: 20 },
    { playStyle: 2, level: 1, clearLamp: -1, count: 10 },
    { playStyle: 2, level: 1, clearLamp: 6, count: 10 },
    { playStyle: 2, level: 1, clearLamp: 7, count: 20 },
  ]
  const radars: [GrooveRadarInfo, GrooveRadarInfo] = [
    {
      playStyle: 1,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    },
    {
      playStyle: 2,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    },
  ]

  const params = { id: publicUser.id }
  const stubs = { NuxtLink: RouterLinkStub, GrooveRadar: true }

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = createI18n({ legacy: false, locale })
    test('{ user: null } renders empty', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ params } as any)
      vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
      vi.mocked(useAuth).mockResolvedValue({ id: ref(null) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ user: publicUser } renders user info', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ params } as any)
      vi.mocked(useFetch).mockImplementation(
        uri =>
          ({
            data: ref(
              (uri as string).endsWith('radar')
                ? null
                : (uri as string).endsWith('clear')
                ? null
                : { ...publicUser, code: undefined }
            ),
          } as any)
      )
      vi.mocked(useAuth).mockResolvedValue({ id: ref(null) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('{ user: loginUser } renders import & settings button', async () => {
      // Arrange
      /* eslint-disable @typescript-eslint/no-explicit-any */
      vi.mocked(useRoute).mockReturnValue({ params } as any)
      vi.mocked(useFetch).mockImplementation(
        uri =>
          ({
            data: ref(
              (uri as string).endsWith('radar')
                ? radars
                : (uri as string).endsWith('clear')
                ? clears
                : publicUser
            ),
          } as any)
      )
      vi.mocked(useAuth).mockResolvedValue({ id: ref(publicUser.id) } as any)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Act
      const wrapper = await mountAsync(Page, {
        global: { plugins: [[Oruga, bulmaConfig], i18n], stubs },
      })

      // Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
})
