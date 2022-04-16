import type { Api } from '@ddradar/core'
import { Database, Song } from '@ddradar/core'
import {
  privateUser,
  publicUser,
  testSongData,
} from '@ddradar/core/__tests__/data'
import { mount, RouterLinkStub, shallowMount } from '@vue/test-utils'

import { createI18n, createVue } from '~/__tests__/util'
import { getChartScore } from '~/api/score'
import ScoreBoard from '~/components/shared/ScoreBoard.vue'

jest.mock('~/api/score')
jest.mock('@ddradar/core')

const localVue = createVue()

describe('/components/shared/ScoreBoard.vue', () => {
  const info = { ...testSongData, charts: undefined }
  const chart = { ...testSongData.charts[0] }
  const propsData = { info, chart }
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
      userId: '1user',
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
  const i18n = createI18n()
  const mocks = {
    $accessor,
    $http: {},
    $fetchState: { pending: false },
    $fetch: jest.fn(),
  }
  const options = { localVue, propsData, mocks, i18n }
  let wrapper: ReturnType<typeof shallowMount>
  beforeAll(() =>
    jest
      .mocked(Database.isAreaUser)
      .mockImplementation(u => ['0', '13'].includes(u.id))
  )
  beforeEach(() => {
    wrapper = shallowMount(ScoreBoard, options)
    jest.mocked(Song.isDeletedOnGate).mockReturnValue(false)
  })

  describe.each(['ja', 'en'])('{ locale: "%s" } snapshot test', locale => {
    const i18n = createI18n(locale)
    const stubs = { NuxtLink: RouterLinkStub, ScoreBadge: true }
    const mocks = {
      $accessor: { isLoggedIn: false },
      $fetchState: { pending: false },
    }

    test('{ loading: true } renders loading spin', async () => {
      // Arrange
      const mocks = {
        $accessor: { isLoggedIn: false },
        $fetchState: { pending: true },
      }
      const data = () => ({ scores: [] })
      const options = { localVue, propsData, mocks, stubs, i18n, data }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [...] } renders score list', async () => {
      // Arrange
      const data = () => ({ scores })
      const options = { localVue, propsData, mocks, stubs, i18n, data }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('{ loading: false, scores: [] } renders empty', async () => {
      // Arrange
      const data = () => ({ scores: [] })
      const options = { localVue, propsData, mocks, stubs, i18n, data }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders edit button if loggedIn', async () => {
      // Arrange
      const mocks = { $accessor, $fetchState: { pending: false } }
      const options = { localVue, propsData, mocks, stubs, i18n }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('not renders import button if deleted song', async () => {
      // Arrange
      jest.mocked(Song.isDeletedOnGate).mockReturnValueOnce(true)
      const mocks = { $accessor, $fetchState: { pending: false } }
      const options = { localVue, propsData, mocks, stubs, i18n }

      // Act
      const wrapper = mount(ScoreBoard, options)
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })

  // Lifecycle
  describe('fetch()', () => {
    jest.mocked(getChartScore).mockResolvedValue(scores as Api.ScoreInfo[])
    beforeEach(() => jest.mocked(getChartScore).mockClear())

    test('{ fetchAllData: false } calls getChartScore(medium)', async () => {
      // Arrange - Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(getChartScore)).toBeCalledWith(
        mocks.$http,
        info.id,
        chart.playStyle,
        chart.difficulty,
        'medium'
      )
    })
    test('{ fetchAllData: true } calls getChartScore(full)', async () => {
      // Arrange - Act
      wrapper.setData({ fetchAllData: true })
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(jest.mocked(getChartScore)).toBeCalledWith(
        mocks.$http,
        info.id,
        chart.playStyle,
        chart.difficulty,
        'full'
      )
    })
    test.each(['ja', 'en'])('sets { locale: "%s" } areaName', async locale => {
      // Arrange
      const i18n = createI18n(locale)
      const mocks = { $accessor, $http: {}, $fetchState: { pending: true } }
      const options = { localVue, propsData, mocks, i18n }
      const wrapper = shallowMount(ScoreBoard, options)

      // Act
      // @ts-ignore
      await wrapper.vm.$options.fetch?.call(wrapper.vm)

      // Assert
      expect(wrapper.vm.$data.scores).toMatchSnapshot()
    })
  })

  // Method
  describe('launchScoreEditor()', () => {
    const mocks = {
      $accessor,
      $buefy: { modal: { open: jest.fn(_ => ({ $on: jest.fn() })) } },
      $fetchState: { pending: false },
    }
    const options = { localVue, propsData, mocks, i18n }
    const wrapper = shallowMount(ScoreBoard, options)
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
      $fetchState: { pending: false },
    }
    const options = { localVue, propsData, mocks, i18n }
    const wrapper = shallowMount(ScoreBoard, options)
    beforeEach(() => mocks.$buefy.modal.open.mockClear())

    test('calls $buefy.modal.open', () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.launchScoreImporter()

      // Assert
      expect(mocks.$buefy.modal.open).toBeCalled()
    })
  })
  describe('fetchAllScores()', () => {
    jest.mocked(getChartScore).mockResolvedValue(scores as Api.ScoreInfo[])
    beforeEach(() => mocks.$fetch.mockClear())

    test('sets { fetchAllData = true } and calls $fetch()', () => {
      // Arrange - Act
      // @ts-ignore
      wrapper.vm.fetchAllScores()

      // Assert
      expect(wrapper.vm.$data.fetchAllData).toBe(true)
      expect(mocks.$fetch).toBeCalled()
    })
  })
})
