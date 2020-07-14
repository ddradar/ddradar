import type { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'

import SongBySeriesPage from '~/pages/series/_seriesIndex.vue'
import type { SongListData } from '~/types/api/song'

const localVue = createLocalVue()
localVue.use(Buefy)

const songs: SongListData[] = [
  {
    id: '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
    name: 'MAKE IT BETTER',
    nameKana: 'MAKE IT BETTER',
    nameIndex: 22,
    artist: 'mitsu-O!',
    series: 'DDR 1st',
    minBPM: 119,
    maxBPM: 119,
  },
  {
    id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    name: 'PARANOiA',
    nameKana: 'PARANOIA',
    nameIndex: 25,
    artist: '180',
    series: 'DDR 1st',
    minBPM: 180,
    maxBPM: 180,
  },
  {
    id: 'Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi',
    name: 'TRIP MACHINE',
    nameKana: 'TRIP MACHINE',
    nameIndex: 29,
    artist: 'DE-SIRE',
    series: 'DDR 1st',
    minBPM: 160,
    maxBPM: 160,
  },
]
const $fetchState = { pending: false }

describe('/series/_seriesIndex.vue', () => {
  describe('renders', () => {
    const $route = { params: { seriesIndex: '36' } }
    test('loading', () => {
      // Arrange
      const wrapper = mount(SongBySeriesPage, {
        localVue,
        mocks: {
          $route,
          $fetchState: { pending: true },
        },
        stubs: { NuxtLink: RouterLinkStub },
      })

      // Act - Assert
      expect(wrapper.element).toMatchSnapshot()
    })
    test('loaded', () => {
      // Arrange
      const wrapper = mount(SongBySeriesPage, {
        localVue,
        mocks: {
          $route,
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => {
          return { songs }
        },
      })

      // Act - Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '1.0'])(
      '/name/%s returns false',
      seriesIndex => {
        // Arrange
        const wrapper = shallowMount(SongBySeriesPage, {
          localVue,
          mocks: {
            $route: { params: { seriesIndex } },
            $fetchState,
          },
          stubs: { NuxtLink: RouterLinkStub },
        })
        const ctx = ({ params: { seriesIndex } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '16'])(
      '/name/%s returns true',
      seriesIndex => {
        // Arrange
        const wrapper = shallowMount(SongBySeriesPage, {
          localVue,
          mocks: {
            $route: { params: { seriesIndex } },
            $fetchState,
          },
          stubs: { NuxtLink: RouterLinkStub },
        })
        const ctx = ({ params: { seriesIndex } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(true)
      }
    )
  })
  describe('fetch()', () => {
    test.skip.each(['0', '1', '9', '10', '16'])(
      'calls /songs/series/%s API',
      async seriesIndex => {
        // Arrange
        const $http = { $get: jest.fn<SongListData[], string[]>(() => []) }
        const wrapper = shallowMount(SongBySeriesPage, {
          localVue,
          mocks: {
            $route: { params: { seriesIndex } },
            $fetchState,
            $http,
          },
          stubs: { NuxtLink: RouterLinkStub },
        })

        // Act
        // @ts-ignore
        await wrapper.vm.$options.fetch()

        // Assert
        expect($http.$get.mock.calls.length).toBe(1)
        expect($http.$get.mock.calls[0][0]).toBe(`/songs/series/${seriesIndex}`)
      }
    )
  })
  describe('get title()', () => {
    test.each([
      ['0', 'DDR 1st'],
      ['10', 'DDR X'],
      ['16', 'DanceDanceRevolution A20'],
      ['17', 'DanceDanceRevolution A20 PLUS'],
    ])('name/%s route returns %s', (seriesIndex, expected) => {
      // Arrange
      const wrapper = shallowMount(SongBySeriesPage, {
        localVue,
        mocks: {
          $route: { params: { seriesIndex } },
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub },
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
  describe('displayedBPM', () => {
    test.each([
      [null, null, '???'],
      [100, null, '???'],
      [null, 100, '???'],
      [150, 150, '150'],
      [100, 400, '100-400'],
    ])('(%p, %p) returns %s', (minBPM, maxBPM, expected) => {
      const wrapper = shallowMount(SongBySeriesPage, {
        localVue,
        mocks: {
          $route: { params: { seriesIndex: '0' } },
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub },
      })

      // Act
      // @ts-ignore
      const result = wrapper.vm.displayedBPM(minBPM, maxBPM)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
