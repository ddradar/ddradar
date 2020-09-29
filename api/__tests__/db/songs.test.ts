import { isSongSchema } from '../../db/songs'
import { testSongData } from '../data'

describe('./db/songs.ts', () => {
  describe('isSongSchema', () => {
    const validSong = { ...testSongData }
    test.each([undefined, null, true, 1.5, 'foo', [], {}])(
      '(%p) returns false',
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
    ])('(%p) returns false', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(false)
    )

    test.each([
      validSong,
      { ...validSong, name: 'テスト', nameKana: 'てすと', nameIndex: 3 },
      { ...validSong, minBPM: null, maxBPM: null },
      { ...validSong, charts: [] },
    ])('(%p) returns true', (obj: unknown) =>
      expect(isSongSchema(obj)).toBe(true)
    )
  })
})
