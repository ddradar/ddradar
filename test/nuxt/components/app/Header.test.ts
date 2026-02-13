import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import {
  afterAll,
  afterEach,
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
import { withLocales } from '~~/test/nuxt/const'

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

  describe.each(
    withLocales(
      `${sessionUser.displayName} (Unregistered)`,
      `${sessionUser.displayName} (未登録)`,
      `${sessionUser.displayName} (Unregistered)`
    )
  )('(locale: %s)', (locale, name) => {
    afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))

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

    test(`(user: <Unregistered User>) renders "${name}" as user name`, async () => {
      // Arrange - Act
      user.value = { ...sessionUser }
      const wrapper = await mountSuspended(Header)
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      const vm = wrapper.vm as unknown as Record<string, unknown>
      expect(vm.displayName).toBe(name)
    })
  })
})
