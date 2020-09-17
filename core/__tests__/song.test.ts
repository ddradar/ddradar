import type { Difficulty, SongSchema } from '../db/songs'
import { getDifficultyName, getPlayStyleName, isSongSchema } from '../song'

describe('/song.ts', () => {
  describe('isSongSchema', () => {
    const song: SongSchema = {
      id: '00000000000000000000000000000000',
      name: 'Test Song',
      nameIndex: 29,
      nameKana: 'TEST SONG',
      artist: 'Test Artist',
      series: 'DanceDanceRevolution A20',
      minBPM: 150,
      maxBPM: 150,
      charts: [
        {
          playStyle: 1,
          difficulty: 0,
          level: 1,
          notes: 100,
          freezeArrow: 1,
          shockArrow: 0,
          voltage: 10,
          stream: 9,
          air: 2,
          freeze: 1,
          chaos: 0,
        },
      ],
    }
    test.each([undefined, null, true, 1.5, 'foo', [], {}])(
      '(%p) returns false',
      (obj: unknown) => expect(isSongSchema(obj)).toBe(false)
    )
    test.each([
      { ...song, id: '' },
      { ...song, nameKana: 'abc' },
      { ...song, series: 'DDR FESTIVAL' },
      { ...song, nameIndex: 0.5 },
      { ...song, nameIndex: -1 },
      { ...song, nameIndex: 37 },
      { ...song, minBPM: null },
      { ...song, maxBPM: null },
      { ...song, charts: {} },
    ])('(%p) returns false', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(false)
    )
    test.each([
      { ...song, charts: [...song.charts, {}] },
      { ...song, charts: [{ ...song.charts[0], notes: '' }] },
      { ...song, charts: [{ ...song.charts[0], playStyle: 3 }] },
      { ...song, charts: [{ ...song.charts[0], difficulty: -1 }] },
      { ...song, charts: [{ ...song.charts[0], difficulty: 5 }] },
      { ...song, charts: [{ ...song.charts[0], level: 0 }] },
      { ...song, charts: [{ ...song.charts[0], level: 21 }] },
    ])('(%p) returns false', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(false)
    )
    test.each([
      song,
      { ...song, name: 'テスト', nameKana: 'てすと', nameIndex: 3 },
      { ...song, minBPM: null, maxBPM: null },
      { ...song, charts: [] },
    ])('(%p) returns true', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(true)
    )
  })
  describe('getPlayStyleName', () => {
    test.each([0, 3])('(%i) returns undefined', playStyle =>
      expect(getPlayStyleName(playStyle as 1 | 2)).toBeUndefined()
    )
    test.each([
      [1, 'SINGLE'] as const,
      [2, 'DOUBLE'] as const,
    ])('(%i) returns "%s"', (playStyle, expected) =>
      expect(getPlayStyleName(playStyle)).toBe(expected)
    )
  })
  describe('getDifficultyName', () => {
    test.each([5, 10])('(%i) returns undefined', difficulty =>
      expect(getDifficultyName(difficulty as Difficulty)).toBeUndefined()
    )
    test.each([
      [0, 'BEGINNER'],
      [1, 'BASIC'],
      [2, 'DIFFICULT'],
      [3, 'EXPERT'],
      [4, 'CHALLENGE'],
    ])('(%i) returns "%s"', (difficulty, expected) =>
      expect(getDifficultyName(difficulty as Difficulty)).toBe(expected)
    )
  })
})
