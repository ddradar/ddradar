import { ref } from '@nuxtjs/composition-api'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { useCourseList } from '~/composables/useCourseApi'
import NonstopListPage from '~/pages/nonstop/_series/index.vue'

jest.mock('~/composables/useCourseApi')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('pages/nonstop/_series/index.vue', () => {
  const $fetchState = { pending: false }
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  beforeAll(() =>
    mocked(useCourseList).mockReturnValue({ courses: ref([]) } as any)
  )

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    test('renders correctly', () => {
      // Arrange - Act
      const $route = { params: { series: '16' }, path: '/nonstop/16' }
      const mocks = { $fetchState, $route }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('validate()', () => {
    test.each(['', 'foo', '0', '1', '10'])('/%s returns false', series => {
      // Arrange
      const mocks = { $fetchState, $route: { params: { series } } }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })
      const ctx = { ...mocks.$route } as any

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
    })
    test.each(['16', '17'])('/%s returns true', series => {
      // Arrange
      const mocks = { $fetchState, $route: { params: { series } } }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })
      const ctx = { ...mocks.$route } as any

      // Act - Assert
      expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
    })
  })
  describe('setup()', () => {
    beforeEach(() => mocked(useCourseList).mockClear())
    test.each([
      ['16', 16],
      ['17', 17],
    ])('/%s calls useCourseList(%i, 1)', async (series, expected) => {
      // Arrange
      const $route = { params: { series }, path: `/nonstop/${series}` }
      const mocks = { $fetchState, $http: { $get: jest.fn() }, $route }
      const wrapper = shallowMount(NonstopListPage, { localVue, mocks, i18n })

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(useCourseList)).toBeCalledTimes(1)
      expect(mocked(useCourseList)).toBeCalledWith(expected, 1)
    })
  })
})
