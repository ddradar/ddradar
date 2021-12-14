import { testSongList } from '@ddradar/core/__tests__/data'
import { ref } from '@nuxtjs/composition-api'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { useSongList } from '~/composables/useSongApi'
import SongByNamePage from '~/pages/name/_nameIndex.vue'

jest.mock('~/composables/useSongApi')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/name/_nameIndex.vue', () => {
  const $fetchState = { pending: false }
  beforeAll(() =>
    mocked(useSongList).mockReturnValue({ songs: ref(testSongList) } as any)
  )

  // Lifecycle
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '1.0'])(
      '/%s returns false',
      nameIndex => {
        // Arrange
        const $route = { params: { nameIndex } }
        const mocks = { $route, $fetchState }
        const wrapper = shallowMount(SongByNamePage, { localVue, mocks })

        // Act - Assert
        expect(wrapper.vm.$options.validate!($route as any)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '36'])('/%s returns true', nameIndex => {
      // Arrange
      const wrapper = shallowMount(SongByNamePage, {
        localVue,
        mocks: { $route: { params: { nameIndex } }, $fetchState },
      })
      const ctx = { params: { nameIndex } } as any

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('setup()', () => {
    beforeEach(() => mocked(useSongList).mockClear())

    test.each(['0', '1', '9', '10', '36'])(
      'calls useSongList(%s)',
      nameIndex => {
        // Arrange - Act
        const mocks = { $route: { params: { nameIndex } }, $fetchState }
        shallowMount(SongByNamePage, { localVue, mocks })

        // Assert
        expect(mocked(useSongList)).toBeCalledTimes(1)
        expect(mocked(useSongList)).toBeCalledWith(parseInt(nameIndex, 10))
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
    ])('/%s route returns "%s"', async (nameIndex, expected) => {
      // Arrange
      const mocks = { $route: { params: { nameIndex } }, $fetchState }

      // Act
      const wrapper = shallowMount(SongByNamePage, { localVue, mocks })
      await wrapper.vm.$nextTick()

      // Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
