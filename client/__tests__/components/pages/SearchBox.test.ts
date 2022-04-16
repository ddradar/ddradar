import type { Api } from '@ddradar/core'
import { testSongData } from '@ddradar/core/__tests__/data'
import { mount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import { searchSong } from '~/api/song'
import SearchBox from '~/components/pages/SearchBox.vue'

jest.mock('~/api/song')

const localVue = createVue()

describe('/components/pages/SearchBox.vue', () => {
  const songList: Pick<Api.SongInfo, 'id' | 'name' | 'nameKana' | 'artist'>[] =
    [
      { id: 'foo', name: 'foo', nameKana: 'FOO', artist: 'Alpha' },
      { id: 'bar', name: 'bar', nameKana: 'BAR', artist: 'Alpha' },
      { id: 'foo-foo', name: 'foo foo', nameKana: 'FOO FOO', artist: 'Beta' },
    ]
  const i18n = createI18n()
  const $fetchState = { pending: true }

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)

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
      const data = () => ({ songList, term: '' })

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
      const mocks = { $fetchState }
      wrapper = mount(SearchBox, { i18n, localVue, mocks })
    })

    test('{ songList: [] } returns []', () => {
      // Arrange - Act
      wrapper.setData({ songList: [] })
      // @ts-ignore
      const filtered = wrapper.vm.filtered

      // Assert
      expect(filtered).toStrictEqual([])
    })

    test.each([
      ['', []],
      ['  ', []],
      ['aaaaa', []],
      ['foo foo', [songList[2]]],
      ['foo', [songList[0], songList[2]]],
      ['Alpha', [songList[0], songList[1]]],
    ])('{ songList, term: %s } returns %p', (term, expected) => {
      // Arrange - Act
      wrapper.setData({ songList, term })
      // @ts-ignore
      const filtered = wrapper.vm.filtered

      // Assert
      expect(filtered).toStrictEqual(expected)
    })
  })

  // LifeCycle
  describe('fetch()', () => {
    jest.mocked(searchSong).mockResolvedValue([{ ...testSongData }])
    beforeEach(() => jest.mocked(searchSong).mockClear())

    test('sets songList', async () => {
      // Arrange
      const mocks = { $fetchState, $http: {} }
      const wrapper = mount(SearchBox, { i18n, localVue, mocks })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(searchSong)).toBeCalledWith(mocks.$http)
      expect(wrapper.vm.$data.songList).toStrictEqual([
        {
          id: testSongData.id,
          name: testSongData.name,
          nameKana: testSongData.nameKana,
          artist: testSongData.artist,
        },
      ])
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
