import { describe, expect, test } from 'vitest'

import {
  compareSong,
  getSeriesCategory,
  NameIndex,
  songSchema,
} from '~~/shared/schemas/song'
import { notValidObject } from '~~/test/data/schema'
import { testSongData } from '~~/test/data/song'

describe('/shared/schemas/song', () => {
  describe('getSeriesCategory', () => {
    test.each([
      ['DDR 1st', 'CLASSIC'],
      ['DDRMAX2', 'CLASSIC'],
      ['DDR X3 VS 2ndMIX', 'CLASSIC'],
      ['DDR (2013)', 'WHITE'],
      ['DDR A', 'WHITE'],
      ['DDR A20', 'GOLD'],
      ['DDR WORLD', 'GOLD'],
      ['Unknown Series', 'GOLD'],
    ])('(%s) returns %s', (series, expected) =>
      expect(getSeriesCategory(series)).toBe(expected)
    )
  })

  describe('songSchema', () => {
    const validSong = { ...testSongData }
    test.each([
      ...notValidObject,
      { ...validSong, id: '' },
      { ...validSong, name: '' },
      { ...validSong, nameKana: 'abc' },
      { ...validSong, bpm: 'null' },
      { ...validSong, series: 'DDR FESTIVAL' },
    ])('safeParse(%o) returns { success: false }', o =>
      expect(songSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validSong,
      {
        ...validSong,
        name: 'テスト',
        nameKana: 'てすと',
        nameIndex: NameIndex['た行'],
      },
      { ...validSong, artist: '' },
      { ...validSong, series: 'DDR WORLD' },
      { ...validSong, bpm: null },
    ] satisfies Omit<SongInfo, 'charts'>[])(
      'safeParse(%o) returns { success: true }',
      o => expect(songSchema.safeParse(o).success).toBe(true)
    )
  })

  describe('compareSong', () => {
    test.each([
      [
        { nameKana: '.59', nameIndex: NameIndex['数字、記号'] },
        { nameKana: '1116', nameIndex: NameIndex['数字、記号'] },
        -1,
      ],
      [
        { nameKana: '9TH OUTBURST', nameIndex: NameIndex['数字、記号'] },
        { nameKana: 'IDENTITY', nameIndex: NameIndex['数字、記号'] },
        -1,
      ],
      [
        { nameKana: 'ゔぁんぱいあ', nameIndex: NameIndex['あ行'] },
        {
          nameKana: 'おーまいらぶりーすうぃーてぃだーりん',
          nameIndex: NameIndex['あ行'],
        },
        -1,
      ],
      [
        { nameKana: 'TRIPLE COUNTER', nameIndex: NameIndex.T },
        { nameKana: 'わだつみ', nameIndex: NameIndex['わ行'] },
        20,
      ],
      [
        { nameKana: 'CANDY XSPECIAL', nameIndex: NameIndex.C },
        { nameKana: 'CANDY', nameIndex: NameIndex.C },
        1,
      ],
      [
        { nameKana: 'CANDY', nameIndex: NameIndex.C }, // CANDY♡
        { nameKana: 'CANDY', nameIndex: NameIndex.C }, // CANDY☆
        0,
      ],
    ] satisfies [
      Pick<SongInfo, 'nameKana' | 'nameIndex'>,
      Pick<SongInfo, 'nameKana' | 'nameIndex'>,
      number,
    ][])('(%o, %o) returns %d', (a, b, expected) => {
      expect(compareSong(a, b)).toBe(expected)
      expect(compareSong(b, a)).toBe(expected === 0 ? 0 : -expected)
    })
  })
})
