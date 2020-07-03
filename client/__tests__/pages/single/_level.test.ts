import { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'

import SingleLevelPage from '~/pages/single/_level.vue'
import { ChartInfo } from '~/types/api/song'

const localVue = createLocalVue()
localVue.use(Buefy)

const charts: ChartInfo[] = [
  {
    id: '9i0q91lPPiO61b9P891O1i86iOP1I08O',
    name: 'EGOISM 440',
    series: 'DanceDanceRevolution (2014)',
    playStyle: 2,
    difficulty: 4,
    level: 19,
  },
  {
    id: 'PO9Pl1q896bDDl89qQb98D80DQoPio1I',
    name: 'ENDYMION',
    series: 'DanceDanceRevolution A',
    playStyle: 2,
    difficulty: 4,
    level: 19,
  },
  {
    id: '1Dl19idl0i0qiqidbDIIbQddiP6o11PP',
    name: 'MAX 360',
    series: 'DanceDanceRevolution A',
    playStyle: 2,
    difficulty: 4,
    level: 19,
  },
  {
    id: '6bid6d9qPQ80DOqiidQQ891o6Od8801l',
    name: 'Over The “Period”',
    series: 'DanceDanceRevolution (2014)',
    playStyle: 2,
    difficulty: 4,
    level: 19,
  },
  {
    id: '606b9d6OiliId69bO9Odi6qq8o8Qd0dq',
    name: 'PARANOiA Revolution',
    series: 'DDR X3 VS 2ndMIX',
    playStyle: 2,
    difficulty: 4,
    level: 19,
  },
  {
    id: 'q6di1DQbi88i9QlPol1iIPbb8lP1qP1b',
    name: 'POSSESSION',
    series: 'DDR X2',
    playStyle: 2,
    difficulty: 4,
    level: 19,
  },
  {
    id: '186dd6DQq891Ib9Ilq8Qbo8lIqb0Qoll',
    name: 'Valkyrie dimension',
    series: 'DDR X2',
    playStyle: 2,
    difficulty: 4,
    level: 19,
  },
]
const $fetchState = { pending: false }

describe('/single/_level.vue', () => {
  describe('renders', () => {
    const $route = { params: { level: '19' } }
    test('loading', () => {
      // Arrange
      const wrapper = mount(SingleLevelPage, {
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
      const wrapper = mount(SingleLevelPage, {
        localVue,
        mocks: {
          $route,
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => {
          return { charts }
        },
      })

      // Act - Assert
      expect(wrapper.element).toMatchSnapshot()
    })
  })
  describe('validate()', () => {
    test.each(['', 'foo', '0', '21', '-1', '1.0'])(
      '/single/%s returns false',
      level => {
        // Arrange
        const wrapper = shallowMount(SingleLevelPage, {
          localVue,
          mocks: {
            $route: { params: { level } },
            $fetchState,
          },
          stubs: { NuxtLink: RouterLinkStub },
        })
        const ctx = ({ params: { level } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(false)
      }
    )
    test.each(['1', '9', '19', '20'])('/single/%s returns true', level => {
      // Arrange
      const wrapper = shallowMount(SingleLevelPage, {
        localVue,
        mocks: {
          $route: { params: { level } },
          $fetchState,
        },
        stubs: { NuxtLink: RouterLinkStub },
      })
      const ctx = ({ params: { level } } as unknown) as Context

      // Act - Assert
      expect(wrapper.vm.$options.validate(ctx)).toBe(true)
    })
  })
  describe('fetch()', () => {
    test.skip.each(['1', '9', '19', '20'])(
      'calls /songs/name/%s API',
      async level => {
        // Arrange
        const $http = { $get: jest.fn<ChartInfo[], string[]>(() => []) }
        const wrapper = shallowMount(SingleLevelPage, {
          localVue,
          mocks: {
            $route: { params: { level } },
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
        expect($http.$get.mock.calls[0][0]).toBe(`/songs/name/${level}`)
      }
    )
  })
  describe('get title()', () => {
    test.each([
      ['1', 'SINGLE 1'],
      ['9', 'SINGLE 9'],
      ['19', 'SINGLE 19'],
      ['20', 'SINGLE 20'],
    ])('single/%s route returns %s', (level, expected) => {
      // Arrange
      const wrapper = shallowMount(SingleLevelPage, {
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
  describe('shortSeriesName', () => {
    const wrapper = shallowMount(SingleLevelPage, {
      localVue,
      mocks: {
        $route: { params: { level: '19' } },
        $fetchState,
      },
      stubs: { NuxtLink: RouterLinkStub },
    })

    test.each([
      ['DDR 1st', '1st'],
      ['DDRMAX', 'DDRMAX'],
      ['DanceDanceRevolution (2014)', '2014'],
      ['DanceDanceRevolution A20', 'A20'],
      ['DanceDanceRevolution A20 PLUS', 'A20 PLUS'],
    ])('(%s) returns %s', (series, expected) => {
      // Arrange - Act
      // @ts-ignore
      const result = wrapper.vm.shortSeriesName(series)

      // Assert
      expect(result).toBe(expected)
    })
  })
  describe('getDifficultyName', () => {
    const wrapper = shallowMount(SingleLevelPage, {
      localVue,
      mocks: {
        $route: { params: { level: '19' } },
        $fetchState,
      },
      stubs: { NuxtLink: RouterLinkStub },
    })

    test.each([NaN, -1, 1.5, 5, Infinity, -Infinity])(
      '(%d) returns "???"',
      difficulty => {
        // Arrange - Act
        // @ts-ignore
        const result = wrapper.vm.getDifficultyName(difficulty)

        // Assert
        expect(result).toBe('???')
      }
    )
    test.each([
      [0, 'BEGINNER'],
      [1, 'BASIC'],
      [2, 'DIFFICULT'],
      [3, 'EXPERT'],
      [4, 'CHALLENGE'],
    ])('(%d) returns %s', (difficulty, expected) => {
      // Arrange - Act
      // @ts-ignore
      const result = wrapper.vm.getDifficultyName(difficulty)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
