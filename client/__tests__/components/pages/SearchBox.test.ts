import { testSongList } from '@ddradar/core/__tests__/data'
import { ref } from '@nuxtjs/composition-api'
import { createLocalVue, mount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import SearchBox from '~/components/pages/SearchBox.vue'
import { useSongList } from '~/composables/useSongApi'

jest.mock('~/api/song')
jest.mock('~/composables/useSongApi')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/SearchBox.vue', () => {
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const $fetchState = { pending: true }
  beforeAll(() =>
    mocked(useSongList).mockReturnValue({ songs: ref(testSongList) } as any)
  )

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })

    test('{ loading: true } renders loading spin', async () => {
      // Arrange
      const mocks = { $fetchState: { pending: true } }

      // Act
      const wrapper = mount(SearchBox, { i18n, localVue, mocks })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, term: "" } renders empty box', async () => {
      // Arrange
      const mocks = { $fetchState: { pending: false } }
      const data = () => ({ term: '' })

      // Act
      const wrapper = mount(SearchBox, { data, i18n, localVue, mocks })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Computed
  describe('get filtered()', () => {
    let wrapper: ReturnType<typeof mount>
    beforeEach(() => {
      wrapper = mount(SearchBox, {
        i18n,
        localVue,
        mocks: { $fetchState },
      })
    })

    test.each([
      ['', []],
      ['  ', []],
      ['aaaaa', []],
      ['180', [testSongList[0], testSongList[1]]],
      ['PARANOIA X SPECIAL', [testSongList[1]]],
      ['DE-SIRE', [testSongList[2]]],
    ])('{ term: %s } returns %p', (term, expected) => {
      // Arrange - Act
      wrapper.setData({ term })

      // Assert
      // @ts-ignore
      expect(wrapper.vm.filtered).toStrictEqual(expected)
    })
  })

  // LifeCycle
  describe('setup()', () => {
    beforeEach(() => mocked(useSongList).mockClear())

    test('calls useSongList()', async () => {
      // Arrange
      const mocks = { $fetchState }
      const wrapper = mount(SearchBox, { i18n, localVue, mocks })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(useSongList)).toBeCalledWith()
    })
  })

  // Method
  describe('move({id})', () => {
    test('calls $router.push("/songs/{id}")', () => {
      // Arrange
      const mocks = { $fetchState, $router: { push: jest.fn() } }
      const wrapper = mount(SearchBox, { i18n, localVue, mocks })
      const id = 'foo'

      // Act
      // @ts-ignore
      wrapper.vm.move({ id })

      // Assert
      expect(mocks.$router.push).toBeCalledWith(`/songs/${id}`)
    })
  })
})
