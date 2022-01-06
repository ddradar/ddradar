import type { Database } from '@ddradar/core'
import { testSongData } from '@ddradar/core/__tests__/data'
import type { Context } from '@nuxt/types'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'

import { getSongInfo, postSongInfo } from '~/api/song'
import SongEditorPage from '~/pages/admin/song/_id.vue'
import * as popup from '~/utils/popup'

jest.mock('~/api/song')
jest.mock('~/utils/popup')
const localVue = createLocalVue()
localVue.use(Buefy)
const songInfo = { ...testSongData, nameIndex: undefined }
delete songInfo.nameIndex

describe('pages/admin/song/_id.vue', () => {
  const data = () => ({ ...songInfo })
  const wrapper = shallowMount(SongEditorPage, { localVue, data })

  test('renders correctly', () => {
    const wrapper = mount(SongEditorPage, { localVue, data })
    expect(wrapper).toMatchSnapshot()
  })

  // Lifecycle
  describe('asyncData()', () => {
    beforeAll(() =>
      jest.mocked(getSongInfo).mockResolvedValue({ ...songInfo, nameIndex: 2 })
    )
    const wrapper = shallowMount(SongEditorPage, { localVue })
    beforeEach(() => jest.mocked(getSongInfo).mockClear())

    test('/ returns default charts', async () => {
      // Arrange
      const ctx = { params: {} } as Context

      // Act
      const result: any = await wrapper.vm.$options.asyncData!(ctx)

      // Assert
      expect(mocked(getSongInfo)).not.toBeCalled()
      expect(result.charts).toHaveLength(7)
    })
    test(`/${songInfo.id} returns songInfo`, async () => {
      // Arrange
      const ctx = { params: { id: songInfo.id } } as unknown as Context

      // Act
      const result: any = await wrapper.vm.$options.asyncData!(ctx)

      // Assert
      expect(mocked(getSongInfo)).toBeCalled()
      expect(result).toStrictEqual({
        id: songInfo.id,
        name: songInfo.name,
        nameKana: songInfo.nameKana,
        artist: songInfo.artist,
        series: songInfo.series,
        minBPM: songInfo.minBPM,
        maxBPM: songInfo.maxBPM,
        deleted: undefined,
        charts: songInfo.charts,
      })
    })
  })

  // Computed
  describe('get isValidSongId()', () => {
    const wrapper = shallowMount(SongEditorPage, { localVue })
    test.each([0, '', 'foo'])('returns false if id is %s', id => {
      // Arrange - Act
      wrapper.setData({ id })

      // Assert
      // @ts-ignore
      expect(wrapper.vm.isValidSongId).toBe(false)
    })
    test.each([
      '66666666666666666666666666666666',
      'i0P1O6lbP1oDd6q6b08iPPoq6iPdI818',
    ])('returns true if id is %s', id => {
      // Arrange - Act
      wrapper.setData({ id })

      // Assert
      // @ts-ignore
      expect(wrapper.vm.isValidSongId).toBe(true)
    })
  })
  describe('get hasError()', () => {
    const wrapper = shallowMount(SongEditorPage, { localVue })
    test.each([
      { id: 'foo' },
      { name: '' },
      { nameKana: 'ア' },
      { artist: '' },
      { series: 'DDR A20' },
      { minBPM: null },
      { maxBPM: null },
      { charts: [] },
      { charts: [...songInfo.charts, { playStyle: 1, difficulty: 0 }] },
    ])('returns true if data is %p', data => {
      // Arrange - Act
      wrapper.setData({ ...songInfo, ...data })

      // Assert
      // @ts-ignore
      expect(wrapper.vm.hasError).toBe(true)
    })
    test.each([
      {},
      { id: '00000000000000000000000000000000' },
      { nameKana: '12345' },
      { series: 'DDR EXTREME' },
      { minBPM: null, maxBPM: null },
      { maxBPM: 400 },
    ])('returns false if data is %p', data => {
      // Arrange - Act
      wrapper.setData({ ...songInfo, ...data })

      // Assert
      // @ts-ignore
      expect(wrapper.vm.hasError).toBe(false)
    })
  })

  // Method
  describe('addChart()', () => {
    test('pushes new chart to charts', () => {
      // Arrange
      const charts: Database.StepChartSchema[] = []
      const data = () => ({ charts })
      const wrapper = shallowMount(SongEditorPage, { localVue, data })

      // Act
      // @ts-ignore
      wrapper.vm.addChart()

      expect(charts).toHaveLength(1)
    })
  })
  describe('removeChart()', () => {
    test('splices chart from charts', () => {
      // Arrange
      const charts = [...songInfo.charts]
      const data = () => ({ charts })
      const wrapper = shallowMount(SongEditorPage, { localVue, data })

      // Act
      // @ts-ignore
      wrapper.vm.removeChart(0)

      expect(charts).toHaveLength(songInfo.charts.length - 1)
      expect(charts[0]).toBe(songInfo.charts[1])
    })
  })
  describe('hasDuplicateKey', () => {
    test.each(songInfo.charts)('(%p) returns false', chart => {
      // @ts-ignore
      expect(wrapper.vm.hasDuplicateKey(chart)).toBe(false)
    })
    test.each([
      { playStyle: 0, difficulty: 0 },
      { playStyle: 1, difficulty: 4 },
      { playStyle: 2, difficulty: 0 },
    ])('(%p) returns true', chart => {
      // @ts-ignore
      expect(wrapper.vm.hasDuplicateKey(chart)).toBe(true)
    })
  })
  describe('loadSongInfo()', () => {
    const wrapper = shallowMount(SongEditorPage, { localVue })
    beforeAll(() =>
      jest.mocked(getSongInfo).mockResolvedValue({ ...songInfo, nameIndex: 2 })
    )
    beforeEach(() => jest.mocked(getSongInfo).mockClear())

    test('does not call API if { isValidSongId: false }', async () => {
      // Arrange
      wrapper.setData({ id: 'foo' })

      // Act
      // @ts-ignore
      await wrapper.vm.loadSongInfo()

      // Assert
      expect(mocked(getSongInfo)).not.toBeCalled()
    })
    test('calls getSongInfo()', async () => {
      // Arrange
      wrapper.setData({ id: songInfo.id })

      // Act
      // @ts-ignore
      await wrapper.vm.loadSongInfo()

      // Assert
      expect(mocked(getSongInfo)).toBeCalled()
    })
  })
  describe('saveSongInfo()', () => {
    test('calls $buefy.dialog.confirm', async () => {
      // Arrange
      jest.mocked(postSongInfo).mockResolvedValue({ ...songInfo, nameIndex: 2 })
      const mocks = { $buefy: { dialog: { confirm: jest.fn() } } }
      const wrapper = shallowMount(SongEditorPage, { localVue, data, mocks })

      // Act
      // @ts-ignore
      wrapper.vm.saveSongInfo()
      const onConfirm = mocks.$buefy.dialog.confirm.mock.calls[0][0]
        .onConfirm as Function
      await onConfirm()

      // Assert
      expect(mocked(postSongInfo)).toBeCalled()
      expect(mocked(popup.success)).toBeCalled()
    })
  })
})
