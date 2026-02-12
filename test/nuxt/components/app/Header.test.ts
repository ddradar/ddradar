import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import type { User } from '#auth-utils'
import Header from '~/components/app/Header.vue'
import { publicUser, sessionUser } from '~~/test/data/user'
import { locales } from '~~/test/nuxt/const'

mockNuxtImport(navigateTo, original => vi.fn(original))
mockNuxtImport(useUserSession, original => vi.fn(original))

describe('app/components/app/Header.vue', () => {
  const user = ref<User | null>(null)
  const loggedIn = computed(() => !!user.value)
  const clearMock = vi.fn<ReturnType<typeof useUserSession>['clear']>()

  beforeAll(() => {
    vi.mocked(useUserSession).mockReturnValue({
      loggedIn,
      user,
      clear: clearMock,
    } as never)
  })
  beforeEach(() => {
    clearMock.mockClear()
    vi.mocked(navigateTo).mockClear()
  })
  afterAll(() => {
    vi.mocked(useUserSession).mockReset()
  })

  describe.each(locales)('(locale: %s)', locale => {
    test('(user: null) renders Login button', async () => {
      // Arrange - Act
      user.value = null
      const wrapper = await mountSuspended(Header)
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      expect(wrapper.html()).toMatchSnapshot()
    })

    test('(user: <Registered User>) renders user name and Logout button', async () => {
      // Arrange - Act
      user.value = { ...sessionUser, id: publicUser.id }
      const wrapper = await mountSuspended(Header)
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  test.each([
    [locales[0], 'Auth User (Unregistered)'],
    [locales[1], 'Auth User (未登録)'],
  ])(
    '(locale: %s, user: <Unregistered User>) renders "%s" as user name',
    async (locale, name) => {
      // Arrange - Act
      user.value = { ...sessionUser }
      const wrapper = await mountSuspended(Header)
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      const vm = wrapper.vm as unknown as Record<string, unknown>
      expect(vm.displayName).toBe(name)
    }
  )
})
