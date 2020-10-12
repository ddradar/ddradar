import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getClearStatus, getGrooveRadar, getScoreStatus } from '~/api/user'
import PlayStatus from '~/components/pages/users/PlayStatus.vue'

jest.mock('~/api/user')

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/users/PlayStatus.vue', () => {
  const userId = 'foo_user'
  const mocks = { $fetchState: { pending: false }, $http: {} }

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })

    test('renders loading state before fetch()', async () => {
      const wrapper = mount(PlayStatus, {
        localVue,
        mocks: { $fetchState: { pending: true } },
        stubs: ['GrooveRadar'],
        propsData: { userId, playStyle: 1 },
        i18n,
      })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('fetch()', () => {
    let wrapper: Wrapper<PlayStatus>
    const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
    const propsData = { userId, playStyle: 1 }
    beforeEach(() => {
      wrapper = shallowMount(PlayStatus, { localVue, i18n, mocks, propsData })
      mocked(getGrooveRadar).mockClear()
      mocked(getClearStatus).mockClear()
      mocked(getScoreStatus).mockClear()
    })

    test('calls getClearStatus(), getGrooveRadar(), and getScoreStatus()', async () => {
      // Arrange
      mocked(getGrooveRadar).mockResolvedValueOnce([])
      mocked(getClearStatus).mockResolvedValueOnce([])
      mocked(getScoreStatus).mockResolvedValueOnce([])

      // Act
      await wrapper.vm.$options.fetch?.call(wrapper.vm, null!)

      // Assert
      expect(mocked(getGrooveRadar)).toBeCalledWith(mocks.$http, userId, 1)
      expect(mocked(getClearStatus)).toBeCalledWith(mocks.$http, userId, 1)
      expect(mocked(getScoreStatus)).toBeCalledWith(mocks.$http, userId, 1)
    })
  })
})
