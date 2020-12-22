import type { SongListData } from '@core/api/song'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import SongList from '~/components/pages/songs/SongList.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/songs/SongList.vue', () => {
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
  const stubs = { NuxtLink: RouterLinkStub }
  describe('snapshot test', () => {
    test.each(['ja', 'en'])(
      '{ locale: "%s", loading: true, songs: [] } renders loading state',
      async locale => {
        const wrapper = mount(SongList, {
          localVue,
          propsData: { loading: true, songs: [] },
          mocks: { $accessor: { isAdmin: false } },
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
        })
        await wrapper.vm.$nextTick()

        expect(wrapper).toMatchSnapshot()
      }
    )
    test.each(['ja', 'en'])(
      '{ locale: "%s", loading: false, songs: [songs] } renders song list',
      async locale => {
        const wrapper = mount(SongList, {
          localVue,
          propsData: { loading: false, songs },
          mocks: { $accessor: { isAdmin: false } },
          stubs,
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
        })
        await wrapper.vm.$nextTick()
        expect(wrapper).toMatchSnapshot()
      }
    )
    test('{ loading: false, songs: [songs] } renders "Edit" column if admin', async () => {
      const wrapper = mount(SongList, {
        localVue,
        propsData: { loading: false, songs },
        mocks: { $accessor: { isAdmin: true } },
        stubs,
        i18n: new VueI18n({ locale: 'ja', silentFallbackWarn: true }),
      })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['ja', 'en'])(
      '{ locale: "%s", loading: false, songs: [] } renders empty state',
      async locale => {
        const wrapper = mount(SongList, {
          localVue,
          mocks: { $accessor: { isAdmin: false } },
          propsData: { loading: false, songs: [] },
          i18n: new VueI18n({ locale, silentFallbackWarn: true }),
        })
        await wrapper.vm.$nextTick()

        expect(wrapper).toMatchSnapshot()
      }
    )
  })
})
