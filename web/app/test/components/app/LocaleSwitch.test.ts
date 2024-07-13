import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { LocaleObject } from '@nuxtjs/i18n'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test, vi } from 'vitest'

import LocaleSwitch from '~/components/app/LocaleSwitch.vue'
import config from '~~/nuxt.config'

const { useI18nMock } = vi.hoisted(() => ({ useI18nMock: vi.fn() }))
mockNuxtImport('useI18n', () => useI18nMock)

describe('components/app/LocaleSwitch.vue', () => {
  const stubs = { RouterLink: RouterLinkStub }
  const locales = [...(config.i18n!.locales as LocaleObject[])]

  test('snapshot test', async () => {
    // Arrange
    useI18nMock.mockReturnValue({ locale: ref('ja'), locales: ref(locales) })
    const wrapper = await mountSuspended(LocaleSwitch, { global: { stubs } })
    // Act
    await wrapper.find('button').trigger('click') // Expand dropdown
    // Assert
    expect(wrapper.find('div').element).toMatchSnapshot()
  })

  test.each(locales.map((l, i) => [i, l.code]))(
    'click menu:%i changes locale to "%s"',
    async (i, code) => {
      // Arrange
      const locale = ref('bar')
      useI18nMock.mockReturnValue({ locale, locales: ref(locales) })
      const wrapper = await mountSuspended(LocaleSwitch, { global: { stubs } })
      // Act
      await wrapper.find('button').trigger('click') // Expand dropdown
      await wrapper.findAll("button[role='menuitem']")[i]?.trigger('click') // Click menu item
      // Assert
      expect(locale.value).toBe(code)
    }
  )
})
