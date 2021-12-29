import type { Context } from '@nuxt/types'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { searchSong } from '~/api/song'
import SongBySeriesPage from '~/pages/series/_seriesIndex.vue'

jest.mock('~/api/song')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/series/_seriesIndex.vue', () => {
  const $fetchState = { pending: false }

  // Lifecycle
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '1.0'])(
      '/%s returns false',
      seriesIndex => {
        // Arrange
        const mocks = { $route: { params: { seriesIndex } }, $fetchState }
        const wrapper = shallowMount(SongBySeriesPage, { localVue, mocks })
        const ctx = { params: { seriesIndex } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '16'])('/%s returns true', seriesIndex => {
      // Arrange
      const wrapper = shallowMount(SongBySeriesPage, {
        localVue,
        mocks: { $route: { params: { seriesIndex } }, $fetchState },
      })
      const ctx = { params: { seriesIndex } } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('fetch()', () => {
    beforeEach(() => {
      mocked(searchSong).mockClear()
      mocked(searchSong).mockResolvedValue([])
    })

    test.each(['0', '1', '9', '10', '16'])(
      'calls searchSong($http, undefined, %s)',
      async seriesIndex => {
        // Arrange
        const $http = {}
        const $route = { params: { seriesIndex } }
        const mocks = { $route, $http, $fetchState }
        const wrapper = shallowMount(SongBySeriesPage, { localVue, mocks })

        // Act
        // @ts-ignore
        await wrapper.vm.$options.fetch?.call(wrapper.vm)

        // Assert
        expect(mocked(searchSong)).toBeCalledTimes(1)
        expect(mocked(searchSong)).toBeCalledWith(
          $http,
          undefined,
          parseInt(seriesIndex, 10)
        )
      }
    )
  })

  // Computed
  describe('get title()', () => {
    test.each([
      ['0', 'DDR 1st'],
      ['10', 'DDR X'],
      ['16', 'DanceDanceRevolution A20'],
      ['17', 'DanceDanceRevolution A20 PLUS'],
    ])('/%s returns "%s"', (seriesIndex, expected) => {
      // Arrange
      const mocks = { $route: { params: { seriesIndex } }, $fetchState }
      const wrapper = shallowMount(SongBySeriesPage, { localVue, mocks })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
