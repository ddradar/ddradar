import type { Context } from '@nuxt/types'
import { shallowMount } from '@vue/test-utils'

import { createVue } from '~/__tests__/util'
import { searchSong } from '~/api/song'
import SongByNamePage from '~/pages/name/_nameIndex.vue'

jest.mock('~/api/song')

const localVue = createVue()

describe('pages/name/_nameIndex.vue', () => {
  const $fetchState = { pending: false }

  // Lifecycle
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '1.0'])(
      '/%s returns false',
      nameIndex => {
        // Arrange
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: { $route: { params: { nameIndex } }, $fetchState },
        })
        const ctx = { params: { nameIndex } } as unknown as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '36'])('/%s returns true', nameIndex => {
      // Arrange
      const wrapper = shallowMount(SongByNamePage, {
        localVue,
        mocks: { $route: { params: { nameIndex } }, $fetchState },
      })
      const ctx = { params: { nameIndex } } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('fetch()', () => {
    beforeEach(() => {
      jest.mocked(searchSong).mockClear()
      jest.mocked(searchSong).mockResolvedValue([])
    })

    test.each(['0', '1', '9', '10', '36'])(
      'calls searchSong($http, %s)',
      async nameIndex => {
        // Arrange
        const $http = { $get: jest.fn() }
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: { $route: { params: { nameIndex } }, $fetchState, $http },
        })

        // Act
        // @ts-ignore
        await wrapper.vm.$options.fetch?.call(wrapper.vm)

        // Assert
        expect(jest.mocked(searchSong)).toBeCalledTimes(1)
        expect(jest.mocked(searchSong)).toBeCalledWith(
          $http,
          parseInt(nameIndex, 10)
        )
      }
    )
  })

  // Computed
  describe('get title()', () => {
    test.each([
      ['0', 'あ'],
      ['9', 'わ'],
      ['10', 'A'],
      ['35', 'Z'],
      ['36', '数字・記号'],
    ])('/%s route returns "%s"', (nameIndex, expected) => {
      // Arrange
      const mocks = { $route: { params: { nameIndex } }, $fetchState }
      const wrapper = shallowMount(SongByNamePage, { localVue, mocks })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
