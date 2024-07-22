import { notifications } from '@ddradar/core/test/data'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import Page from '~/pages/index.vue'
import { locales } from '~/test/utils'

const { useFetchMock, unixTimeToStringMock } = vi.hoisted(() => ({
  useFetchMock: vi.fn(),
  unixTimeToStringMock: (u: number) => new Date(u * 1000).toUTCString(),
}))
mockNuxtImport('useFetch', () => useFetchMock)
mockNuxtImport('unixTimeToString', () => unixTimeToStringMock)

describe('/', () => {
  test.each(locales)('{ locale: "%s" } snapshot test', async locale => {
    // Arrange
    const res = { data: ref(notifications) } as Awaited<
      ReturnType<typeof useFetch>
    >
    vi.mocked(useFetch).mockResolvedValue(res)
    const global = { plugins: [createI18n({ locale, legacy: false })] }
    // Act
    const wrapper = await mountSuspended(Page, { global })
    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
