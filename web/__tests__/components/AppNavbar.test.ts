import { publicUser } from '@ddradar/core/test/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { mountAsync } from '~~/__tests__/test-utils'
import AppNavbar from '~~/components/AppNavbar.vue'
import useAuth from '~~/composables/useAuth'

vi.mock('~~/composables/useAuth')

describe('components/AppNavbar.vue', () => {
  beforeEach(() => vi.mocked(useAuth).mockClear())

  test('({ isLoggedin: false }) renders login button', async () => {
    // Arrange
    vi.mocked(useAuth).mockResolvedValue({ isLoggedIn: ref(false) } as any)

    // Act
    const wrapper = await mountAsync(AppNavbar, {
      global: {
        plugins: [[Oruga, bulmaConfig]],
        stubs: { NuxtLink: RouterLinkStub },
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })
  test('({ isLoggedin: true }) renders user name & logout button', async () => {
    // Arrange
    vi.mocked(useAuth).mockResolvedValue({
      isLoggedIn: ref(true),
      user: ref(publicUser),
      name: ref(publicUser.name),
    } as any)

    // Act
    const wrapper = await mountAsync(AppNavbar, {
      global: {
        plugins: [[Oruga, bulmaConfig]],
        stubs: { NuxtLink: RouterLinkStub },
      },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
