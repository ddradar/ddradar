import { testSongData } from '@ddradar/core/test/data'
import { describe, expect, test } from 'vitest'

import { dbSongSchema } from '../../src/schemas/songs'

describe('/schemas/songs', () => {
  describe('dbSongSchema', () => {
    test.each([undefined, null, true, 1, 'foo', {}])(
      'safeParse(%o) returns { success: false }',
      o => {
        expect(dbSongSchema.safeParse(o).success).toBe(false)
      }
    )
    test.each([
      { ...testSongData },
      { ...testSongData, nameIndex: undefined, seriesCategory: undefined },
      { ...testSongData, type: 'foo' },
      { ...testSongData, type: 'song' },
    ])('safeParse(%o) returns { success: true }', o => {
      expect(dbSongSchema.safeParse(o).success).toBe(true)
    })
  })
})
