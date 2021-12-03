import { testSongData } from '@ddradar/core/__tests__/data'
import { defineComponent, SetupFunction } from '@nuxtjs/composition-api'
import { shallowMount } from '@vue/test-utils'

import {
  useChartList,
  useSongInfo,
  useSongList,
} from '~/composables/useSongApi'

function createMockComponent<T>(setup: SetupFunction<{}, T>) {
  return defineComponent({
    setup,
    template: '<div></div>',
  })
}

describe('/composables/useSongList.ts', () => {
  const song = { ...testSongData }
  const $http = {
    $get: jest.fn<Promise<any>, [string, any]>(),
    $post: jest.fn<Promise<any>, [string]>(),
  }
  const mocks = { $nuxt: { context: { $http } } }
  beforeEach(() => {
    $http.$get.mockReset()
    $http.$post.mockReset()
  })

  describe('useSongList', () => {
    test.each([
      [undefined, undefined, ''],
      [0, undefined, 'name=0'],
      [undefined, 0, 'series=0'],
      [1, 1, 'name=1&series=1'],
    ])('(%p, %p) calls GET "/api/v1/songs?%s"', async (name, series, query) => {
      // Arrange
      $http.$get.mockResolvedValue([song])

      // Act
      const component = createMockComponent(() => useSongList(name, series))
      const wrapper = shallowMount(component, { mocks })
      // @ts-ignore
      await wrapper.vm.fetch()

      // Assert
      expect(wrapper.vm.$data.songs).toStrictEqual([song])
      expect($http.$get.mock.calls[0][0]).toBe('/api/v1/songs')
      expect($http.$get.mock.calls[0][1].searchParams.toString()).toBe(query)
    })
  })

  describe('useChartList', () => {
    test.each([
      [1, 1, '/api/v1/charts/1/1'] as const,
      [1, 10, '/api/v1/charts/1/10'] as const,
      [1, 19, '/api/v1/charts/1/19'] as const,
      [2, 2, '/api/v1/charts/2/2'] as const,
      [2, 15, '/api/v1/charts/2/15'] as const,
      [2, 18, '/api/v1/charts/2/18'] as const,
    ])('(%i, %i) calls GET "%s"', async (playStyle, level, uri) => {
      // Arrange
      const charts = [{ playStyle, difficulty: level }]
      $http.$get.mockResolvedValue(charts)

      // Act
      const component = createMockComponent(() =>
        useChartList(playStyle, level)
      )
      const wrapper = shallowMount(component, { mocks })
      // @ts-ignore
      await wrapper.vm.fetch()

      // Assert
      expect(wrapper.vm.$data.charts).toBe(charts)
      expect($http.$get).toBeCalledWith(uri)
    })
  })

  describe('useSongInfo', () => {
    test(`("${song.id}") calls GET "/api/v1/songs/${song.id}"`, async () => {
      // Arrange
      $http.$get.mockResolvedValue(song)

      // Act
      const component = createMockComponent(() => useSongInfo(song.id))
      const wrapper = shallowMount(component, { mocks })
      // @ts-ignore
      await wrapper.vm.fetch()

      // Assert
      expect(wrapper.vm.$data.song).toBe(song)
      expect($http.$get).toBeCalledWith(`/api/v1/songs/${song.id}`)
    })
  })
})
