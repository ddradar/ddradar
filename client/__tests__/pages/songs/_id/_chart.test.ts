import type { SongInfo } from '@core/api/song'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'

import SongPage from '~/pages/songs/_id/_chart.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

const song: SongInfo = {
  id: '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
  name: 'MAKE IT BETTER',
  nameKana: 'MAKE IT BETTER',
  nameIndex: 22,
  artist: 'mitsu-O!',
  series: 'DDR 1st',
  minBPM: 119,
  maxBPM: 119,
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      level: 3,
      notes: 67,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 14,
      voltage: 14,
      air: 9,
      freeze: 0,
      chaos: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 7,
      notes: 143,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 31,
      voltage: 29,
      air: 47,
      freeze: 0,
      chaos: 3,
    },
    {
      playStyle: 1,
      difficulty: 2,
      level: 9,
      notes: 188,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 41,
      voltage: 39,
      air: 27,
      freeze: 0,
      chaos: 13,
    },
    {
      playStyle: 1,
      difficulty: 3,
      level: 12,
      notes: 212,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 46,
      voltage: 39,
      air: 54,
      freeze: 0,
      chaos: 19,
    },
    {
      playStyle: 2,
      difficulty: 1,
      level: 7,
      notes: 130,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 28,
      voltage: 29,
      air: 61,
      freeze: 0,
      chaos: 1,
    },
    {
      playStyle: 2,
      difficulty: 2,
      level: 9,
      notes: 181,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 40,
      voltage: 39,
      air: 30,
      freeze: 0,
      chaos: 11,
    },
    {
      playStyle: 2,
      difficulty: 3,
      level: 11,
      notes: 220,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 48,
      voltage: 54,
      air: 27,
      freeze: 0,
      chaos: 41,
    },
  ],
}

describe('pages/songs/_id/_chart.vue', () => {
  describe('snapshot test', () => {
    test('renders correctly', () => {
      const $accessor = { isAdmin: false, isLoggedIn: true }
      const wrapper = shallowMount(SongPage, {
        localVue,
        mocks: { $accessor },
        data: () => ({ song, playStyle: 1, difficulty: 0 }),
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders "Edit" button if admin', () => {
      const $accessor = { isAdmin: true, isLoggedIn: true }
      const wrapper = shallowMount(SongPage, {
        localVue,
        mocks: { $accessor },
        stubs: { NuxtLink: RouterLinkStub },
        data: () => ({ song, playStyle: 1, difficulty: 0 }),
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
