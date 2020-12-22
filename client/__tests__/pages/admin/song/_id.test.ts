import type { SongInfo } from '@core/api/song'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'

import SongEditorPage from '~/pages/admin/song/_id.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
const songInfo: Omit<SongInfo, 'nameIndex'> = {
  id: 'i0P1O6lbP1oDd6q6b08iPPoq6iPdI818',
  name: '最終鬼畜妹フランドール・Ｓ',
  nameKana: 'さいしゅうきちくいもうとふらんどーる すかーれっと',
  artist: 'ビートまりお(COOL&CREATE)',
  series: 'DanceDanceRevolution A20',
  minBPM: 200,
  maxBPM: 200,
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      notes: 175,
      freezeArrow: 26,
      shockArrow: 0,
      stream: 26,
      voltage: 25,
      air: 9,
      freeze: 39,
      chaos: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 9,
      notes: 405,
      freezeArrow: 20,
      shockArrow: 0,
      stream: 61,
      voltage: 58,
      air: 27,
      freeze: 28,
      chaos: 8,
    },
    {
      playStyle: 1,
      difficulty: 2,
      level: 13,
      notes: 577,
      freezeArrow: 50,
      shockArrow: 0,
      stream: 88,
      voltage: 66,
      air: 38,
      freeze: 58,
      chaos: 33,
    },
    {
      playStyle: 1,
      difficulty: 3,
      level: 16,
      notes: 737,
      freezeArrow: 36,
      shockArrow: 0,
      stream: 123,
      voltage: 104,
      air: 56,
      freeze: 42,
      chaos: 101,
    },
    {
      playStyle: 2,
      difficulty: 1,
      level: 9,
      notes: 405,
      freezeArrow: 20,
      shockArrow: 0,
      stream: 61,
      voltage: 58,
      air: 27,
      freeze: 28,
      chaos: 8,
    },
    {
      playStyle: 2,
      difficulty: 2,
      level: 13,
      notes: 562,
      freezeArrow: 50,
      shockArrow: 0,
      stream: 85,
      voltage: 66,
      air: 36,
      freeze: 58,
      chaos: 31,
    },
    {
      playStyle: 2,
      difficulty: 3,
      level: 16,
      notes: 722,
      freezeArrow: 30,
      shockArrow: 0,
      stream: 126,
      voltage: 104,
      air: 47,
      freeze: 38,
      chaos: 100,
    },
  ],
}

describe('pages/admin/song/_id.vue', () => {
  test('renders correctly', () => {
    const wrapper = mount(SongEditorPage, {
      localVue,
      data: () => songInfo,
    })
    expect(wrapper).toMatchSnapshot()
  })
  describe('get nameIndex()', () => {
    const wrapper = shallowMount(SongEditorPage, { localVue })
    test.each([
      [0, 'あ'],
      [1, 'ぎ'],
      [2, 'ぞ'],
      [3, 'っ'],
      [4, 'ぬ'],
      [5, 'ぽ'],
      [6, 'み'],
      [7, 'ゃ'],
      [8, 'れ'],
      [9, 'を'],
      [9, 'ん'],
      [10, 'A'],
      [11, 'B'],
      [12, 'C'],
      [13, 'D'],
      [14, 'E'],
      [15, 'F'],
      [16, 'G'],
      [17, 'H'],
      [18, 'I'],
      [19, 'J'],
      [20, 'K'],
      [21, 'L'],
      [22, 'M'],
      [23, 'N'],
      [24, 'O'],
      [25, 'P'],
      [26, 'Q'],
      [27, 'R'],
      [28, 'S'],
      [29, 'T'],
      [30, 'U'],
      [31, 'V'],
      [32, 'W'],
      [33, 'X'],
      [34, 'Y'],
      [35, 'Z'],
      [36, '.'],
      [36, '1'],
      [36, ''],
      [36, 'a'],
      [36, 'ア'],
      [36, '亜'],
    ])('returns %i if nameKana is %s', (expected, nameKana) => {
      // Arrange - Act
      wrapper.setData({ nameKana })

      // Assert
      // @ts-ignore
      expect(wrapper.vm.nameIndex).toBe(expected)
    })
  })
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
})
