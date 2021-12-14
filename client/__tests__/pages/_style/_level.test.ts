import type { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import { useChartList } from '~/composables/useSongApi'
import ChartLevelPage from '~/pages/_style/_level.vue'

jest.mock('~/composables/useSongApi')

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/_style/_level.vue', () => {
  const $fetchState = { pending: false }
  const stubs = { NuxtLink: RouterLinkStub, ChartList: true }

  describe.each(['single', 'double'])('snapshot test (/%s/19)', style => {
    beforeAll(() => mocked(useChartList).mockReturnValue({ charts: [] } as any))
    test('renders correctly', () => {
      // Arrange
      const mocks = { $route: { params: { level: '19', style } }, $fetchState }
      const data = () => ({ charts: [] })
      const wrapper = mount(ChartLevelPage, { localVue, mocks, stubs, data })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('validate()', () => {
    test.each([
      ['', '1'],
      ['DOUBLE', '1'],
      ['single', ''],
      ['double', 'foo'],
      ['single', '0'],
      ['double', '21'],
      ['single', '-1'],
      ['single', '1.0'],
    ])('/%s/%s returns false', (style, level) => {
      // Arrange
      const wrapper = shallowMount(ChartLevelPage, {
        localVue,
        mocks: {
          $route: { params: { style, level } },
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub, ChartList: true },
      })
      const ctx = { params: { style, level } } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
    })
    test.each([
      ['single', '1'],
      ['double', '1'],
      ['single', '9'],
      ['double', '9'],
      ['single', '19'],
      ['double', '19'],
      ['single', '20'],
      ['double', '20'],
    ])('/%s/%s returns true', (style, level) => {
      // Arrange
      const params = { style, level }
      const wrapper = shallowMount(ChartLevelPage, {
        localVue,
        mocks: { $route: { params }, $fetchState },
        stubs: { NuxtLink: RouterLinkStub, ChartList: true },
      })
      const ctx = { params } as unknown as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('setup()', () => {
    beforeAll(() => mocked(useChartList).mockReturnValue({ charts: [] } as any))
    beforeEach(() => mocked(useChartList).mockClear())
    test.each([
      ['single', '1', 1, 1],
      ['single', '9', 1, 9],
      ['double', '19', 2, 19],
      ['double', '20', 2, 20],
    ])(
      '/%s/%s calls useChartList(%i, %i)',
      async (style, level, styleExpected, levelExpected) => {
        // Arrange
        const $route = { params: { style, level } }
        const mocks = { $route, $fetchState }

        // Act
        const wrapper = shallowMount(ChartLevelPage, { localVue, mocks, stubs })
        await wrapper.vm.$nextTick()

        // Assert
        expect(mocked(useChartList)).toBeCalledWith(
          styleExpected,
          levelExpected
        )
      }
    )
  })
})
