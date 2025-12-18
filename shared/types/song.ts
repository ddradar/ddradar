import * as z from 'zod/mini'

import type { songs, TimestampColumn } from '~~/server/db/schema'

/** Enum for `nameIndex` */
export const NameIndex = {
  あ行: 0,
  か行: 1,
  さ行: 2,
  た行: 3,
  な行: 4,
  は行: 5,
  ま行: 6,
  や行: 7,
  ら行: 8,
  わ行: 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  I: 18,
  J: 19,
  K: 20,
  L: 21,
  M: 22,
  N: 23,
  O: 24,
  P: 25,
  Q: 26,
  R: 27,
  S: 28,
  T: 29,
  U: 30,
  V: 31,
  W: 32,
  X: 33,
  Y: 34,
  Z: 35,
  '数字、記号': 36,
} as const

/** Series folder names grouped by category */
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

/** Zod schema for `Song`. (mutable properties only) */
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
}) satisfies z.ZodMiniType<Omit<typeof songs.$inferInsert, TimestampColumn>>
export type Song = ZodInfer<typeof songSchema> &
  Readonly<Omit<typeof songs.$inferSelect, keyof typeof songs.$inferInsert>>
/** Writable Song type */
export type MutableSong = ZodInfer<typeof songSchema>

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
