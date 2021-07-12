import type { Api, Database } from '@ddradar/core'
import { testScores } from '@ddradar/core/__tests__/data'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import ScoreList from '~/components/pages/users/ScoreList.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

const score: Api.ScoreList & Partial<Database.ScoreSchema> = {
  ...testScores[0],
  isCourse: false,
}
delete score.userId
delete score.userName
delete score.isPublic

describe('/components/pages/users/ScoreList.vue', () => {
  const scores: Api.ScoreList[] = [score]

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const mocks = { $accessor: { isLoggedIn: false } }
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    const stubs = { NuxtLink: RouterLinkStub, ScoreBadge: true }
    const wrapper = mount(ScoreList, { localVue, stubs, i18n, mocks })

    test('{ loading: true } renders loading spin', async () => {
      // Arrange
      wrapper.setProps({ loading: true })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [song score] } renders song score list', async () => {
      // Arrange
      wrapper.setProps({ loading: false, scores })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [course score] } renders course score list', async () => {
      // Arrange
      wrapper.setProps({
        loading: false,
        scores: [{ ...score, isCourse: true }],
      })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [] } renders empty', async () => {
      // Arrange
      wrapper.setProps({ loading: false, charts: [] })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ isLoggedIn : true } renders "Edit" button', async () => {
      // Arrange
      const mocks = { $accessor: { isLoggedIn: true } }
      const wrapper = mount(ScoreList, { localVue, stubs, i18n, mocks })
      wrapper.setProps({ loading: false, scores })
      await wrapper.vm.$nextTick()

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
