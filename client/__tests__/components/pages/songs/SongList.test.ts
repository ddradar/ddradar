import { testSongList } from '@core/__tests__/data'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import SongList from '~/components/pages/songs/SongList.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/songs/SongList.vue', () => {
  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const stubs = { NuxtLink: RouterLinkStub }
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    const wrapper = mount(SongList, { localVue, stubs, i18n })

    test('{ loading: true } renders loading state', async () => {
      // Arrange - Act
      wrapper.setProps({ loading: true })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, songs: [songs] } renders song list', async () => {
      // Arrange - Act
      wrapper.setProps({ loading: false, songs: [...testSongList] })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, songs: [] } renders empty state', async () => {
      // Arrange - Act
      wrapper.setProps({ loading: false, songs: [] })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
