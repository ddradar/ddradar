import { testSongList } from '@ddradar/core/__tests__/data'
import { ref } from '@nuxtjs/composition-api'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { useSongList } from '~/composables/useSongApi'
import SongBySeriesPage from '~/pages/series/_seriesIndex.vue'

jest.mock('~/composables/useSongApi')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/series/_seriesIndex.vue', () => {
  const $fetchState = { pending: false }
  beforeAll(() =>
    mocked(useSongList).mockReturnValue({ songs: ref(testSongList) } as any)
  )

  // Lifecycle
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '1.0'])(
      '/%s returns false',
      seriesIndex => {
        // Arrange
        const mocks = { $route: { params: { seriesIndex } }, $fetchState }
        const wrapper = shallowMount(SongBySeriesPage, { localVue, mocks })
        const ctx = { params: { seriesIndex } } as any

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '16'])('/%s returns true', seriesIndex => {
      // Arrange
      const $route = { params: { seriesIndex } }
      const mocks = { $route, $fetchState }
      const wrapper = shallowMount(SongBySeriesPage, { localVue, mocks })

      // Act - Assert
      expect(wrapper.vm.$options.validate!($route as any)).toBe(true)
    })
  })
  describe('setup()', () => {
    beforeEach(() => mocked(useSongList).mockClear())
    test.each(['0', '1', '9', '10', '16'])(
      'calls useSongList(undefined, %s)',
      seriesIndex => {
        // Arrange - Act
        shallowMount(SongBySeriesPage, {
          localVue,
          mocks: { $route: { params: { seriesIndex } }, $fetchState },
        })

        // Assert
        expect(mocked(useSongList)).toBeCalledTimes(1)
        expect(mocked(useSongList)).toBeCalledWith(
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
    ])('/%s returns "%s"', async (seriesIndex, expected) => {
      // Arrange
      const mocks = { $route: { params: { seriesIndex } }, $fetchState }

      // Act
      const wrapper = shallowMount(SongBySeriesPage, { localVue, mocks })
      await wrapper.vm.$nextTick()

      // Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
