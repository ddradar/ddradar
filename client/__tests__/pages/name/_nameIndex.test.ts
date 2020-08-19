import type { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'

import type { SongListData } from '~/api/song'
import SongByNamePage from '~/pages/name/_nameIndex.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

const songs: SongListData[] = [
  {
    id: 'IQ0dIiDql9Q68d9ddQIiQbq1OPq8Db69',
    name: '.59',
    nameKana: '.59',
    nameIndex: 36,
    artist: 'dj TAKA',
    series: 'DDR 4thMIX',
    minBPM: 135,
    maxBPM: 135,
  },
  {
    id: 'ddOOOibQ6qIi9DI1bl8b108I1Ib6QDl9',
    name: '1998',
    nameKana: '1998',
    nameIndex: 36,
    artist: 'NAOKI',
    series: 'DDR EXTREME',
    minBPM: 150,
    maxBPM: 150,
  },
  {
    id: 'i9Pidb18b9O8bdqQ91QQP0oPdIdIODq1',
    name: '30 Lives (Up-Up-Down-Dance Mix)',
    nameKana: '30 LIVES UP UP DOWN DANCE MIX',
    nameIndex: 36,
    artist: 'The Motion Sick',
    series: 'DDR X',
    minBPM: 144,
    maxBPM: 144,
  },
  {
    id: 'Q96bO9D61lib19IiIi0i69P80bo6q69Q',
    name: '321STARS',
    nameKana: '321STARS',
    nameIndex: 36,
    artist: 'DJ SIMON',
    series: 'DDR EXTREME',
    minBPM: 192,
    maxBPM: 192,
  },
  {
    id: '80Q1idDo6O6Db0106b0q6qbOP1P8QQb0',
    name: '39',
    nameKana: '39',
    nameIndex: 36,
    artist: 'sasakure.UK×DECO*27',
    series: 'DanceDanceRevolution A',
    minBPM: 175,
    maxBPM: 175,
  },
  {
    id: 'bP10qq9dPDDqIl16lPIDDd8b00dIIP08',
    name: '50th Memorial Songs -Beginning Story-',
    nameKana: '50TH MEMORIAL SONGS BEGINNING STORY',
    nameIndex: 36,
    artist: 'BEMANI Sound Team',
    series: 'DanceDanceRevolution A20',
    minBPM: 135,
    maxBPM: 135,
  },
  {
    id: '0IIO08bII0QQDOdobqbl8Ib8Q8O8q1li',
    name: '50th Memorial Songs -Flagship medley-',
    nameKana: '50TH MEMORIAL SONGS FLAGSHIP MEDLEY',
    nameIndex: 36,
    artist: 'BEMANI Sound Team',
    series: 'DanceDanceRevolution A20',
    minBPM: 135,
    maxBPM: 175,
  },
  {
    id: 'D0iDbio81PIbI8dD6QOIP9IidDOP0PDP',
    name: '50th Memorial Songs -The BEMANI History-',
    nameKana: '50TH MEMORIAL SONGS THE BEMANI HISTORY',
    nameIndex: 36,
    artist: 'BEMANI Sound Team',
    series: 'DanceDanceRevolution A20',
    minBPM: 136,
    maxBPM: 136,
  },
  {
    id: 'l1ODQ1bO9POQ6d8O0Iobbio11qb6O6bd',
    name: '50th Memorial Songs -二人の時 ～under the cherry blossoms～-',
    nameKana: '50TH MEMORIAL SONGS ふたりのとき UNDER THE CHERRY BLOSSOMS',
    nameIndex: 36,
    artist: 'BEMANI Sound Team',
    series: 'DanceDanceRevolution A20',
    minBPM: 160,
    maxBPM: 160,
  },
  {
    id: 'Dd98lDdo8Ob698d9qbO9iD0PqO19oQbI',
    name: '8000000',
    nameKana: '8000000',
    nameIndex: 36,
    artist: 'kors k',
    series: 'DanceDanceRevolution (2014)',
    minBPM: 100,
    maxBPM: 200,
  },
  {
    id: 'id9oObq9P6Q6Pq6lQPqI88OP1DD8D0O1',
    name: '888',
    nameKana: '888',
    nameIndex: 36,
    artist: 'DJ TECHNORCH',
    series: 'DDR X2',
    minBPM: 111,
    maxBPM: 888,
  },
  {
    id: '00obPO6oPIPOoD9qb0dIl6q6D8P6o9bI',
    name: 'IX',
    nameKana: '9',
    nameIndex: 36,
    artist: 'dj TAKA VS DJ TOTTO feat.藍',
    series: 'DanceDanceRevolution (2014)',
    minBPM: 99,
    maxBPM: 396,
  },
]
const $fetchState = { pending: false }

describe('/name/_nameIndex.vue', () => {
  describe('renders', () => {
    const $route = { params: { nameIndex: '36' } }
    test('loading', () => {
      // Arrange
      const wrapper = mount(SongByNamePage, {
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
      const wrapper = mount(SongByNamePage, {
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
      nameIndex => {
        // Arrange
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: {
            $route: { params: { nameIndex } },
            $fetchState,
          },
          stubs: { NuxtLink: RouterLinkStub },
        })
        const ctx = ({ params: { nameIndex } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['0', '1', '9', '10', '36'])(
      '/name/%s returns true',
      nameIndex => {
        // Arrange
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: {
            $route: { params: { nameIndex } },
            $fetchState,
          },
          stubs: { NuxtLink: RouterLinkStub },
        })
        const ctx = ({ params: { nameIndex } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
      }
    )
  })
  describe('fetch()', () => {
    test.skip.each(['0', '1', '9', '10', '36'])(
      'calls /songs/name/%s API',
      async nameIndex => {
        // Arrange
        const $http = { $get: jest.fn<SongListData[], string[]>(() => []) }
        const wrapper = shallowMount(SongByNamePage, {
          localVue,
          mocks: {
            $route: { params: { nameIndex } },
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
        expect($http.$get.mock.calls[0][0]).toBe(`/songs/name/${nameIndex}`)
      }
    )
  })
  describe('get title()', () => {
    test.each([
      ['0', 'あ'],
      ['9', 'わ'],
      ['10', 'A'],
      ['35', 'Z'],
      ['36', '数字・記号'],
    ])('name/%s route returns %s', (nameIndex, expected) => {
      // Arrange
      const wrapper = shallowMount(SongByNamePage, {
        localVue,
        mocks: {
          $route: { params: { nameIndex } },
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
      const wrapper = shallowMount(SongByNamePage, {
        localVue,
        mocks: {
          $route: { params: { nameIndex: '0' } },
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
