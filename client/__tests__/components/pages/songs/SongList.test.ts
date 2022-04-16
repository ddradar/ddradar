import { testSongList } from '@ddradar/core/__tests__/data'
import { mount, RouterLinkStub } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import SongList from '~/components/pages/songs/SongList.vue'

const localVue = createVue()

describe('/components/pages/songs/SongList.vue', () => {
  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const stubs = { NuxtLink: RouterLinkStub }
    const i18n = createI18n(locale)
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
