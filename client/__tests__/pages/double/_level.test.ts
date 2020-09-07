import type { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'

import type { ChartInfo } from '~/api/song'
import DoubleLevelPage from '~/pages/double/_level.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
const $fetchState = { pending: false }

describe('/double/_level.vue', () => {
  describe('snapshot test', () => {
    test('renders correctly', () => {
      // Arrange
      const $route = { params: { level: '19' } }
      const wrapper = mount(DoubleLevelPage, {
        localVue,
        mocks: { $route, $fetchState },
        stubs: { NuxtLink: RouterLinkStub, ChartList: true },
        data: () => ({ charts: [] }),
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('validate()', () => {
    test.each(['', 'foo', '0', '21', '-1', '1.0'])(
      '/double/%s returns false',
      level => {
        // Arrange
        const wrapper = shallowMount(DoubleLevelPage, {
          localVue,
          mocks: {
            $route: { params: { level } },
            $fetchState,
          },
          stubs: { NuxtLink: RouterLinkStub, ChartList: true },
        })
        const ctx = ({ params: { level } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['1', '9', '19', '20'])('/double/%s returns true', level => {
      // Arrange
      const wrapper = shallowMount(DoubleLevelPage, {
        localVue,
        mocks: {
          $route: { params: { level } },
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub, ChartList: true },
      })
      const ctx = ({ params: { level } } as unknown) as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('fetch()', () => {
    test.skip.each(['1', '9', '19', '20'])(
      'calls /songs/name/%s API',
      async level => {
        // Arrange
        const $http = { $get: jest.fn<ChartInfo[], string[]>(() => []) }
        const wrapper = shallowMount(DoubleLevelPage, {
          localVue,
          mocks: {
            $route: { params: { level } },
            $fetchState,
            $http,
          },
          stubs: { NuxtLink: RouterLinkStub, ChartList: true },
        })

        // Act
        // @ts-ignore
        await wrapper.vm.$options.fetch()

        // Assert
        expect($http.$get.mock.calls.length).toBe(1)
        expect($http.$get.mock.calls[0][0]).toBe(`/songs/name/${level}`)
      }
    )
  })
  describe('get title()', () => {
    test.each([
      ['1', 'DOUBLE 1'],
      ['9', 'DOUBLE 9'],
      ['19', 'DOUBLE 19'],
      ['20', 'DOUBLE 20'],
    ])('double/%s route returns %s', (level, expected) => {
      // Arrange
      const wrapper = shallowMount(DoubleLevelPage, {
        localVue,
        mocks: {
          $route: { params: { level } },
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub },
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.title).toBe(expected)
    })
  })
})
