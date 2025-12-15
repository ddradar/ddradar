import * as z from 'zod/mini'

import type { songs, TimestampColumn } from '~~/server/db/schema'

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
/** List of all series folder names */
export const seriesList = Object.values(_series).flat()
/** Series folder name (depending on official site) */
export type SeriesFolder = (typeof seriesList)[number]
/** Series category. Use on flare skill. */
export type SeriesCategory = keyof typeof _series
/**
 * Get series category from series folder name.
 * @param series Series folder name
 * @returns Series category (if not found, returns 'GOLD')
 */
export function getSeriesCategory(series: string): SeriesCategory {
  for (const [category, seriesArray] of Object.entries(_series)) {
    if ((seriesArray as readonly string[]).includes(series)) {
      return category as SeriesCategory
    }
  }
  return 'GOLD'
}

/** Schema for Song. */
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
  /** Artist (possibly empty) */
  artist: z.string(),
  /** Displayed BPM (use DDR GRAND PRIX, A3 or earlier) */
  bpm: z.nullish(z.string().check(z.regex(/^[0-9]+(-[0-9]+)?$/))),
  /** Series title depend on official site. */
  series: z.enum(seriesList),
})

export type Song = Omit<typeof songs.$inferSelect, TimestampColumn> &
  ZodInfer<typeof songSchema>
/** Writable Song type */
export type MutableSong = Omit<typeof songs.$inferInsert, TimestampColumn> &
  ZodInfer<typeof songSchema>

/**
 * Compare two songs for sorting by `nameKana`.
 * @param left Song to compare on the left side
 * @param right Song to compare on the right side
 * @returns Comparison result (negative if left < right, positive if left > right, zero if equal)
 */
export function compareSong(
  left: Pick<Song, 'nameIndex' | 'nameKana'>,
  right: Pick<Song, 'nameIndex' | 'nameKana'>
): number {
  return left.nameIndex === right.nameIndex
    ? left.nameKana.localeCompare(right.nameKana)
    : left.nameIndex - right.nameIndex
}
