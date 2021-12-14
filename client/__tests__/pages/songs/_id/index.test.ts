import { testSongData } from '@ddradar/core/__tests__/data'
import { ref } from '@nuxtjs/composition-api'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { useSongInfo } from '~/composables/useSongApi'
import SongPage from '~/pages/songs/_id/index.vue'

jest.mock('~/composables/useSongApi')
const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/songs/_id/index.vue', () => {
  const mockTemplate = { $accessor: { isAdmin: false }, $nuxt: { context: {} } }

  describe('snapshot test', () => {
    const $nuxt = { context: { payload: testSongData } }
    const stubs = { NuxtLink: RouterLinkStub }

    test('renders correctly', () => {
      const mocks = { ...mockTemplate, $nuxt }
      const wrapper = shallowMount(SongPage, { localVue, mocks })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders "Edit" button if admin', () => {
      const $accessor = { isAdmin: true }
      const mocks = { ...mockTemplate, $accessor, $nuxt }
      const wrapper = shallowMount(SongPage, { localVue, mocks, stubs })
      expect(wrapper).toMatchSnapshot()
    })
  })

  // LifeCycle
  describe('validate()', () => {
    const $nuxt = { context: { payload: testSongData } }
    const mocks = { ...mockTemplate, $nuxt }
    test.each([undefined, '', 'foo', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'])(
      '/%s returns false',
      id => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue, mocks })
        const ctx = { params: { id } } as any

        // Act
        const result = wrapper.vm.$options.validate!(ctx)

        // Assert
        expect(result).toBe(false)
      }
    )
    test(`/${testSongData.id} returns true`, () => {
      // Arrange
      const wrapper = shallowMount(SongPage, { localVue, mocks })
      const ctx = { params: { id: testSongData.id } } as any

      // Act
      const result = wrapper.vm.$options.validate!(ctx)

      // Assert
      expect(result).toBe(true)
    })
  })
  describe('setup()', () => {
    beforeAll(() =>
      mocked(useSongInfo).mockReturnValue({ song: ref(testSongData) } as any)
    )
    beforeEach(() => mocked(useSongInfo).mockClear())

    test.each([
      ['', 0, -1],
      ['#10', 1, 0],
      ['#14', 1, 4],
      ['#21', 2, 1],
      ['#23', 2, 3],
    ])(
      `/${testSongData.id}%s returns { song, playStyle: %i, difficulty: %i }`,
      async (hash, playStyle, difficulty) => {
        // Arrange
        const $route = { hash, params: { id: testSongData.id } }
        const mocks = { ...mockTemplate, $route }

        // Act
        const wrapper = shallowMount(SongPage, { localVue, mocks })
        await wrapper.vm.$nextTick()

        // Assert
        expect(wrapper.vm.$data.song).toStrictEqual(testSongData)
        expect(wrapper.vm.$data.playStyle).toBe(playStyle)
        expect(wrapper.vm.$data.difficulty).toBe(difficulty)
      }
    )
  })
})
