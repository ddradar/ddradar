import {
  mountSuspended,
  registerEndpoint,
  renderSuspended,
} from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import type { User } from '#auth-utils'
import Page from '~/pages/songs/[id].vue'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { sessionUser } from '~~/test/data/user'
import { locales } from '~~/test/nuxt/const'

// Mock API endpoints
registerEndpoint(`/api/songs/${testSongData.id}`, () => ({
  ...testSongData,
  charts: testStepCharts.map(chart => JSON.parse(JSON.stringify(chart))),
}))
const noChartsSongId = '1'.repeat(32)
registerEndpoint(`/api/songs/${noChartsSongId}`, () => ({
  ...testSongData,
  charts: [],
}))
const notFoundSongId = '0'.repeat(32)
registerEndpoint(`/api/songs/${notFoundSongId}`, () => {
  throw createError({ status: 404, statusText: 'Not Found' })
})

describe('/songs/[id]', () => {
  const route = `/songs/${testSongData.id}`

  const user = ref<User | null>(null)
  const loggedIn = computed(() => !!user.value)

  beforeAll(() =>
    vi.mocked(useUserSession).mockReturnValue({ loggedIn, user } as never)
  )
  afterAll(() => vi.mocked(useUserSession).mockReset())

  test('returns 404 error when song is not found', async () => {
    const route = `/songs/${notFoundSongId}`
    await expect(mountSuspended(Page, { route })).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        statusMessage: 'Song not found',
      })
    )
  })

  describe.each(locales)('(locale: %s)', locale => {
    test('renders correctly', async () => {
      // Arrange
      user.value = null
      const wrapper = await mountSuspended(Page, { route })

      // Act
      await wrapper.vm.$i18n.setLocale(locale)
      // Expand all collapsible sections
      await Promise.all(
        wrapper
          .findAllComponents({ name: 'UCollapsible' })
          .map(section => section.find('button')?.trigger('click'))
      )

      // Assert
      expect(wrapper.html()).toMatchSnapshot()
    })

    test('renders noData component when song.charts is empty', async () => {
      // Arrange - Act
      const route = `/songs/${noChartsSongId}`
      user.value = null
      const wrapper = await mountSuspended(Page, { route })
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      const empty = wrapper.findComponent({ name: 'UEmpty' })
      expect(empty.exists()).toBe(true)
      expect(empty.html()).toMatchSnapshot()
    })
  })

  describe('Edit button', () => {
    test.each([null, { ...sessionUser }])(
      '(user: %o) does not show edit button',
      async loginUser => {
        // Arrange
        user.value = loginUser

        // Act
        await renderSuspended(Page, { route })

        // Assert
        const editButton = screen.queryByRole('link', { name: /edit|編集/i })
        expect(editButton).toBeNull()
      }
    )

    test('(user: { roles: ["admin"] }) shows edit button', async () => {
      // Arrange
      user.value = { ...sessionUser, roles: ['admin'] }

      // Act
      await renderSuspended(Page, { route })

      // Assert
      const editButton = screen.getByRole('link', { name: /edit|編集/i })
      expect(editButton).toBeTruthy()
      expect(editButton.getAttribute('href')).toBe(
        `/admin/songs/${testSongData.id}`
      )
    })
  })
})
