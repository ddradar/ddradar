import { describe, expect, test } from 'vitest'

import {
  getNameIndex,
  isPageDeletedOnGate,
  isSongSchema,
  isValidSongId,
  nameIndexMap,
} from '../src/song'
import { testSongData } from './data'

describe('song.ts', () => {
  describe('isSongSchema', () => {
    const validSong = { ...testSongData }
    test.each([undefined, null, true, 1.5, 'foo', [], {}])(
      '(%o) returns false',
      (obj: unknown) => expect(isSongSchema(obj)).toBe(false)
    )
    test.each([
      { ...validSong, id: '' },
      { ...validSong, nameKana: 'abc' },
      { ...validSong, series: 'DDR FESTIVAL' },
      { ...validSong, nameIndex: 0.5 },
      { ...validSong, nameIndex: -1 },
      { ...validSong, nameIndex: 37 },
      { ...validSong, minBPM: null },
      { ...validSong, maxBPM: null },
      { ...validSong, charts: {} },
      { ...validSong, charts: [...validSong.charts, {}] },
      { ...validSong, charts: [{ ...validSong.charts[0], notes: '' }] },
      { ...validSong, charts: [{ ...validSong.charts[0], playStyle: 3 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], difficulty: -1 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], difficulty: 5 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], level: 0 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], level: 21 }] },
    ])('(%o) returns false', o => expect(isSongSchema(o)).toBe(false))

    test.each([
      validSong,
      { ...validSong, name: 'テスト', nameKana: 'てすと', nameIndex: 3 },
      { ...validSong, minBPM: null, maxBPM: null },
      { ...validSong, charts: [] },
    ])('(%o) returns true', o => expect(isSongSchema(o)).toBe(true))
  })

  describe('isValidSongId', () => {
    test.each([
      '',
      '01689bdiloqDIOPQ',
      '0000000000000000000000000000000000000000',
    ])('("%s") returns false', id => expect(isValidSongId(id)).toBe(false))
    test.each([
      '00000000000000000000000000000000',
      '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
      '01689bdiloqDIOPQ01689bdiloqDIOPQ',
    ])('("%s") returns true', id => expect(isValidSongId(id)).toBe(true))
  })

  describe('getNameIndex', () => {
    test.each([
      ['う', 0],
      ['ぎ', 1],
      ['ぞ', 2],
      ['っ', 3],
      ['ぬ', 4],
      ['ぽ', 5],
      ['み', 6],
      ['ゃ', 7],
      ['れ', 8],
      ['を', 9],
      ['ん', 9],
      ['a', 10],
      ['.', 36],
      ['1', 36],
      ['', 36],
      ['ア', 36],
      ['亜', 36],
      ...[...nameIndexMap.entries()].map<[string, number]>(([k, v]) => [v, k]),
    ])('(%s) returns %i', (nameKana, expected) =>
      expect(getNameIndex(nameKana)).toBe(expected)
    )
  })

  describe('isPageDeletedOnGate', () => {
    /** PARANOiA */
    const existsId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
    /** IF YOU WERE HERE */
    const deletedOnA = '6b8lbl11Ii81bIiq1D9do811D986iDOq'
    /** SP初段(A20) */
    const deletedOnA20 = '19id1DO6q9Pb1681db61D8D8oQi9dlb6'
    /** 輪廻転生 */
    const deletedOnA20Plus = '91qD6DbDqi96qbIO66oboliPD8IPP6io'

    test.each([deletedOnA, deletedOnA20, deletedOnA20Plus])(
      '("%s") returns true',
      songId => expect(isPageDeletedOnGate(songId)).toBe(true)
    )
    test.each([existsId])('("%s") returns false', songId =>
      expect(isPageDeletedOnGate(songId)).toBe(false)
    )
    test.each([
      [deletedOnA, 'DanceDanceRevolution A20'],
      [deletedOnA, 'DanceDanceRevolution A20 PLUS'],
      [deletedOnA, 'DanceDanceRevolution A3'],
      [deletedOnA20, 'DanceDanceRevolution A3'],
      [deletedOnA20Plus, 'DanceDanceRevolution A3'],
    ] as const)('("%s", "%s") returns true', (songId, series) => {
      expect(isPageDeletedOnGate(songId, series)).toBe(true)
    })
    test.each([
      [existsId, 'DanceDanceRevolution A20'],
      [existsId, 'DanceDanceRevolution A20 PLUS'],
      [existsId, 'DanceDanceRevolution A3'],
      [deletedOnA20, 'DanceDanceRevolution A20'],
      [deletedOnA20, 'DanceDanceRevolution A20 PLUS'],
      [deletedOnA20Plus, 'DanceDanceRevolution A20'],
      [deletedOnA20Plus, 'DanceDanceRevolution A20 PLUS'],
    ] as const)('("%s", "%s") returns false', (songId, series) => {
      expect(isPageDeletedOnGate(songId, series)).toBe(false)
    })
  })
})
