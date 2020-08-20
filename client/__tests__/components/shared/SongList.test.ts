import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import type { SongListData } from '~/api/song'
import SongList from '~/components/shared/SongList.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/shared/SongList.vue', () => {
  const songs: Omit<SongListData, 'nameKana' | 'nameIndex'>[] = [
    {
      id: '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
      name: 'MAKE IT BETTER',
      artist: 'mitsu-O!',
      series: 'DDR 1st',
      minBPM: 119,
      maxBPM: 119,
    },
    {
      id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      name: 'PARANOiA',
      artist: '180',
      series: 'DDR 1st',
      minBPM: 180,
      maxBPM: 180,
    },
    {
      id: 'Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi',
      name: 'TRIP MACHINE',
      artist: 'DE-SIRE',
      series: 'DDR 1st',
      minBPM: 160,
      maxBPM: 160,
    },
  ]
  describe('snapshot test', () => {
    test('{ loading: true, songs: [] } renders loading state', () => {
      const wrapper = mount(SongList, {
        localVue,
        propsData: { loading: true, songs: [] },
      })

      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, songs: [songs] } renders song list', () => {
      const wrapper = mount(SongList, {
        localVue,
        propsData: { loading: false, songs },
        mocks: { $accessor: { isAdmin: false } },
        stubs: { NuxtLink: RouterLinkStub },
      })

      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, songs: [songs] } renders "Edit" column if admin', () => {
      const wrapper = mount(SongList, {
        localVue,
        propsData: { loading: false, songs },
        mocks: { $accessor: { isAdmin: true } },
        stubs: { NuxtLink: RouterLinkStub },
      })

      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, songs: [] } renders empty state', () => {
      const wrapper = mount(SongList, {
        localVue,
        propsData: { loading: false, songs: [] },
      })

      expect(wrapper).toMatchSnapshot()
    })
  })
})
