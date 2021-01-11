import { privateUser, publicUser, testCourseData } from '@core/__tests__/data'
import type { ScoreInfo } from '@core/api/score'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'
import VueI18n from 'vue-i18n'

import { getChartScore } from '~/api/score'
import OrderDetail from '~/components/pages/courses/OrderDetail.vue'

jest.mock('~/api/score')
const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/courses/OrderDetail.vue', () => {
  const course = { ...testCourseData }
  const chart = { ...testCourseData.charts[0] }
  const propsData = { course, chart }
  const $accessor = { isLoggedIn: true, user: { ...privateUser } }
  const scores = [
    {
      userId: '0',
      userName: '0',
      clearLamp: 7,
      score: 1000000,
      exScore: chart.notes * 3,
      isArea: true,
    },
    {
      userId: '13',
      userName: '13',
      clearLamp: 6,
      score: 999950,
      exScore: chart.notes * 3 - 5,
      isArea: true,
    },
    {
      userId: publicUser.id,
      userName: publicUser.name,
      clearLamp: 6,
      score: 999950,
      exScore: chart.notes * 3 - 5,
    },
    {
      userId: privateUser.id,
      userName: privateUser.name,
      clearLamp: 6,
      score: 999930,
      exScore: chart.notes * 3 - 5,
    },
  ]
  const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
  const mocks = { $accessor, $http: {} }
  const options = { localVue, propsData, mocks, i18n }
  const wrapper = shallowMount(OrderDetail, options)

  describe.each(['ja', 'en'])('{ locale: %s } snapshot test', locale => {
    const i18n = new VueI18n({ locale, silentFallbackWarn: true })
    const stubs = { NuxtRouterLink: RouterLinkStub, ScoreBadge: true }
    const mocks = { $accessor: { isLoggedIn: false } }
    const options = { localVue, propsData, mocks, stubs, i18n }
    const wrapper = mount(OrderDetail, options)

    test('{ loading: true } renders loading spin', async () => {
      // Arrange - Act
      wrapper.setData({ loading: true, scores: [] })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [...] } renders score list', async () => {
      // Arrange - Act
      wrapper.setData({ loading: false, scores })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [] } renders empty', async () => {
      // Arrange - Act
      wrapper.setData({ loading: false, scores: [] })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders edit button if loggedIn', async () => {
      // Arrange - Act
      const mocks = { $accessor }
      const wrapper = mount(OrderDetail, {
        localVue,
        propsData,
        mocks,
        stubs,
        i18n,
      })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('fetch()', () => {
    beforeEach(() => mocked(getChartScore).mockClear())
    test('calls getChartScore(medium)', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(mocked(getChartScore)).toBeCalled()
    })
  })

  // Method
  describe('launchScoreEditor()', () => {
    const mocks = {
      $accessor,
      $buefy: { modal: { open: jest.fn(_ => ({ $on: jest.fn() })) } },
    }
    const options = { localVue, propsData, mocks, i18n }
    const wrapper = shallowMount(OrderDetail, options)
    beforeEach(() => mocks.$buefy.modal.open.mockClear())

    test('calls $buefy.modal.open', () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.launchScoreEditor()

      // Assert
      expect(mocks.$buefy.modal.open).toBeCalled()
    })
  })
  describe('launchScoreImporter()', () => {
    const mocks = {
      $accessor,
      $buefy: { modal: { open: jest.fn(_ => ({ $on: jest.fn() })) } },
    }
    const options = { localVue, propsData, mocks, i18n }
    const wrapper = shallowMount(OrderDetail, options)
    beforeEach(() => mocks.$buefy.modal.open.mockClear())

    test('calls $buefy.modal.open', () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.launchScoreImporter()

      // Assert
      expect(mocks.$buefy.modal.open).toBeCalled()
    })
  })
  describe('fetchScores', () => {
    mocked(getChartScore).mockResolvedValue(scores as ScoreInfo[])

    beforeEach(() => mocked(getChartScore).mockClear())

    test('(false) calls getChartScore(medium)', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.fetchScores(false)

      // Assert
      expect(mocked(getChartScore)).toBeCalledWith(
        mocks.$http,
        course.id,
        chart.playStyle,
        chart.difficulty,
        'medium'
      )
    })
    test('{ locale: %s } (true) calls getChartScore(full)', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.fetchScores(true)

      // Assert
      expect(mocked(getChartScore)).toBeCalledWith(
        mocks.$http,
        course.id,
        chart.playStyle,
        chart.difficulty,
        'full'
      )
    })
    test.each(['ja', 'en'])('sets { locale: %s } areaName', async locale => {
      // Arrange
      const i18n = new VueI18n({ locale, silentFallbackWarn: true })
      const mocks = { $accessor, $http: {} }
      const options = { localVue, propsData, mocks, i18n }
      const wrapper = shallowMount(OrderDetail, options)

      // Act
      // @ts-ignore
      await wrapper.vm.fetchScores(true)

      // Assert
      expect(wrapper.vm.$data.scores).toMatchSnapshot()
    })
  })
})
