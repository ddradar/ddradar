import { testSongData } from '@ddradar/core/__tests__/data'
import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { useFetch, useRoute } from '#app'
import { mountAsync } from '~/__tests__/test-utils'
import Page from '~/pages/songs/[id].vue'

vi.mock('#app')

describe('Page /songs/[id]', () => {
  const params = { id: testSongData.id }

  test('{ isLoading: true } renders loading state', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useFetch).mockResolvedValue({
      pending: ref(true),
      data: ref(testSongData),
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })

  test('{ isLoading: false, song: <Data> } renders song info', async () => {
    // Arrange
    /* eslint-disable @typescript-eslint/no-explicit-any */
    vi.mocked(useRoute).mockReturnValue({ params } as any)
    vi.mocked(useFetch).mockResolvedValue({
      pending: ref(false),
      data: ref(testSongData),
    } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Act
    const wrapper = await mountAsync(Page, {
      global: { plugins: [[Oruga, bulmaConfig]], stubs: { ChartInfo: true } },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
