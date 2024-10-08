import { describe, expect, test } from 'vitest'

import type { Series } from '../src/song'
import {
  detectCategory,
  getNameIndex,
  nameIndexMap,
  songSchema,
} from '../src/song'
import { testSongData } from './data'

describe('song.ts', () => {
  describe('songSchema', () => {
    const validSong = { ...testSongData }
    test.each([
      undefined,
      null,
      true,
      1.5,
      'foo',
      [],
      {},
      { ...validSong, id: '' },
      { ...validSong, nameKana: 'abc' },
      { ...validSong, nameIndex: 0.5 },
      { ...validSong, nameIndex: -1 },
      { ...validSong, nameIndex: 37 },
      { ...validSong, series: 'DDR FESTIVAL' },
      { ...validSong, charts: [] },
      { ...validSong, charts: [...validSong.charts, {}] },
      { ...validSong, charts: [{ ...validSong.charts[0], notes: '' }] },
      { ...validSong, charts: [{ ...validSong.charts[0], playStyle: 3 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], difficulty: -1 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], difficulty: 5 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], level: 0 }] },
      { ...validSong, charts: [{ ...validSong.charts[0], level: 21 }] },
    ])('safeParse(%o) returns { success: false }', o =>
      expect(songSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validSong,
      { ...validSong, name: 'テスト', nameKana: 'てすと', nameIndex: 3 },
      { ...validSong, series: 'DDR WORLD' },
      { ...validSong, folders: [] },
      { ...validSong, skillAttackId: 1 },
      { ...validSong, deleted: true },
    ])('safeParse(%o) returns { success: true }', o =>
      expect(songSchema.safeParse(o).success).toBe(true)
    )
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

  describe('detectCategory', () => {
    test.each([
      ['DDR 1st', 'CLASSIC'],
      ['DDR 2ndMIX', 'CLASSIC'],
      ['DDR 3rdMIX', 'CLASSIC'],
      ['DDR 4thMIX', 'CLASSIC'],
      ['DDR 5thMIX', 'CLASSIC'],
      ['DDRMAX', 'CLASSIC'],
      ['DDRMAX2', 'CLASSIC'],
      ['DDR EXTREME', 'CLASSIC'],
      ['DDR SuperNOVA', 'CLASSIC'],
      ['DDR SuperNOVA2', 'CLASSIC'],
      ['DDR X', 'CLASSIC'],
      ['DDR X2', 'CLASSIC'],
      ['DDR X3 VS 2ndMIX', 'CLASSIC'],
      ['DDR (2013)', 'WHITE'],
      ['DDR (2014)', 'WHITE'],
      ['DDR A', 'WHITE'],
      ['DDR A20', 'GOLD'],
      ['DDR A20 PLUS', 'GOLD'],
      ['DDR A3', 'GOLD'],
      ['DDR WORLD', 'GOLD'],
    ] satisfies [Series, string][])('(%s) returns "%s"', (series, expected) => {
      expect(detectCategory(series)).toBe(expected)
    })
  })
})
