import * as z from 'zod/mini'

import type { songs, TimestampColumn } from '~~/server/db/schema'

export function getSeriesCategory(series: string): SeriesCategory {
  for (const [category, seriesArray] of Object.entries(_series)) {
    if ((seriesArray as readonly string[]).includes(series)) {
      return category as SeriesCategory
    }
  }
  return 'GOLD'
}

const _series = {
  CLASSIC: [
    'DDR 1st',
    'DDR 2ndMIX',
    'DDR 3rdMIX',
    'DDR 4thMIX',
    'DDR 5thMIX',
    'DDRMAX',
    'DDRMAX2',
    'DDR EXTREME',
    'DDR SuperNOVA',
    'DDR SuperNOVA2',
    'DDR X',
    'DDR X2',
    'DDR X3 VS 2ndMIX',
  ],
  WHITE: ['DDR (2013)', 'DDR (2014)', 'DDR A'],
  GOLD: ['DDR A20', 'DDR A20 PLUS', 'DDR A3', 'DDR WORLD'],
} as const
export const seriesList = Object.values(_series).flat()
export type SeriesFolder = (typeof seriesList)[number]
export type SeriesCategory = keyof typeof _series
export const songSchema = z.object({
  /**
   * ID that depend on official site.
   * @pattern /^[01689bdiloqDIOPQ]{32}$/
   */
  id: z.string().check(z.regex(/^[01689bdiloqDIOPQ]{32}$/)),
  /** Song name */
  name: z.string().check(z.minLength(1)),
  /** Furigana for sorting. (allows A-Z, 0-9, space, period, _, ぁ-ん, ー) */
  nameKana: z.string().check(z.regex(/^[A-Z0-9 ._\u3040-\u309Fー]+$/)), // A-Z, 0-9, space, period, _, ぁ-ん, ー
  /**
   * Calculate from `nameKana`.
   * `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
   */
  nameIndex: z.readonly(
    z.custom<NameIndex>().check(z.int(), z.minimum(0), z.maximum(36))
  ),
  /** Artist (possibly empty) */
  artist: z.string(),
  /** Displayed BPM (use DDR GRAND PRIX, A3 or earlier) */
  bpm: z.nullish(z.string().check(z.regex(/^[0-9]+(-[0-9]+)?$/))),
  /** Series title depend on official site. */
  series: z.enum(seriesList),
  /**
   * Flare skill category.
   * @description Calculate from {@link Song.series}.
   */
  seriesCategory: z.readonly(
    z.enum(Object.keys(_series) as (keyof typeof _series)[])
  ),
})
export type Song = Omit<typeof songs.$inferSelect, TimestampColumn> &
  z.infer<typeof songSchema>
export type MutableSong = Omit<Song, 'nameIndex' | 'seriesCategory'>

type KeyOfMap<T> = T extends Map<infer K, unknown> ? K : never
const _nameIndexes = new Map([
  [0, 'あ'],
  [1, 'か'],
  [2, 'さ'],
  [3, 'た'],
  [4, 'な'],
  [5, 'は'],
  [6, 'ま'],
  [7, 'や'],
  [8, 'ら'],
  [9, 'わ'],
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
  [36, '数字・記号'],
] as const)
/** Index for sorting by `nameKana` */
export type NameIndex = KeyOfMap<typeof _nameIndexes>
/** Map for `nameIndex` */
export const nameIndexMap: ReadonlyMap<number, string> = _nameIndexes
