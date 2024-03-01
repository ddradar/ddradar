import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { testSongData } from '~~/../core/test/data'
import Page from '~~/pages/songs/[id].vue'
import { mountAsync } from '~~/test/test-utils'
import { createClientPrincipal } from '~~/test/test-utils-server'

const { useEasyAuthMock, useFetchMock, useRouteMock } = vi.hoisted(() => ({
  useEasyAuthMock: vi.fn(),
  useFetchMock: vi.fn(),
  useRouteMock: vi.fn(),
}))
mockNuxtImport('useEasyAuth', () => useEasyAuthMock)
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('useRoute', () => useRouteMock)

vi.mock('~~/composables/useAuth')

describe('Page /songs/[id]', () => {
  const params = { id: testSongData.id }

  test('{ song: null } renders loading state', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useEasyAuth).mockResolvedValue({
      clientPrincipal: ref(createClientPrincipal('', '', false)),
    } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(null) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })

  test('{ song: <Data> } renders song info', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useEasyAuth).mockResolvedValue({
      clientPrincipal: ref(createClientPrincipal('', '', false)),
    } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(testSongData) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })

  test('{ isAdmin: true } renders edit button', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useEasyAuth).mockResolvedValue({
      clientPrincipal: ref(createClientPrincipal('', '', true)),
    } as any)
    vi.mocked(useFetch).mockResolvedValue({ data: ref(testSongData) } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
