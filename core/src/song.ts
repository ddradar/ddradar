import { z } from 'zod'

/** zod schema object for {@link StepChart}. */
export const stepChartSchema = z.object({
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: z.union([z.literal(1), z.literal(2)]),
  /**
   * `0`: BEGINNER,
   * `1`: BASIC,
   * `2`: DIFFICULT,
   * `3`: EXPERT,
   * `4`: CHALLENGE
   */
  difficulty: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
  /** Min BPM, Core BPM, Max BPM. */
  bpm: z.tuple([
    z.number().int().positive(),
    z.number().int().positive(),
    z.number().int().positive(),
  ]),
  /** Chart level */
  level: z.number().int().min(1).max(20),
  /** Normal arrow count. (Jump = 1 count) */
  notes: z.number().int().positive(),
  /** Freeze Arrow count. */
  freezeArrow: z.number().int().nonnegative(),
  /** Shock Arrow count. */
  shockArrow: z.number().int().nonnegative(),
})
/** Song's step chart */
export type StepChart = z.infer<typeof stepChartSchema>

/** `1`: SINGLE, `2`: DOUBLE */
export type PlayStyle = z.infer<typeof stepChartSchema>['playStyle']
/** Map for {@link PlayStyle} */
export const playStyleMap: ReadonlyMap<number, string> = new Map([
  [1, 'SINGLE'],
  [2, 'DOUBLE'],
] satisfies [PlayStyle, string][])

/**
 * `0`: BEGINNER,
 * `1`: BASIC,
 * `2`: DIFFICULT,
 * `3`: EXPERT,
 * `4`: CHALLENGE
 */
export type Difficulty = z.infer<typeof stepChartSchema>['difficulty']
/** Map for {@link Difficulty} */
export const difficultyMap: ReadonlyMap<number, string> = new Map([
  [0, 'BEGINNER'],
  [1, 'BASIC'],
  [2, 'DIFFICULT'],
  [3, 'EXPERT'],
  [4, 'CHALLENGE'],
] satisfies [Difficulty, string][])

const _filter = z.object({
  /**
   * Filter type
   * - `category`: Flare Skill Category ("CLASSIC", "WHITE", "GOLD")
   * - `folder`: Music Folder (e.g. "FIRST STEP", "POP MUSIC", "東方")
   * - `level`: Chart level (e.g. "1", "13", "19")
   * - `name`: Name index (e.g. "あ行", "A", "XYZ")
   * - `series`: Series  (e.g. "1st-5th", "MAX-MAX2", "A20")
   */
  type: z.union([
    z.literal('category'),
    z.literal('folder'),
    z.literal('level'),
    z.literal('name'),
    z.literal('series'),
  ]),
  /** Filter name */
  name: z.string().min(1),
})

/** zod schema object for {@link Song}. */
export const songSchema = z.object({
  /** ID that depend on official site. */
  id: z.string().regex(/^[01689bdiloqDIOPQ]{32}$/),
  /** Song name */
  name: z.string().min(1),
  /** Furigana for sorting. */
  nameKana: z.string().regex(/^[A-Z0-9 .\u3040-\u309Fー]+$/), // A-Z, 0-9, space, period, ぁ-ん, ー
  /**
   * Calculate from {@link Song.nameKana}.
   * `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
   */
  nameIndex: z.number().int().min(0).max(36).readonly(),
  /** Artist (possibly empty) */
  artist: z.string(),
  /** Series title depend on official site. */
  series: z.union([
    z.literal('DDR 1st'),
    z.literal('DDR 2ndMIX'),
    z.literal('DDR 3rdMIX'),
    z.literal('DDR 4thMIX'),
    z.literal('DDR 5thMIX'),
    z.literal('DDRMAX'),
    z.literal('DDRMAX2'),
    z.literal('DDR EXTREME'),
    z.literal('DDR SuperNOVA'),
    z.literal('DDR SuperNOVA2'),
    z.literal('DDR X'),
    z.literal('DDR X2'),
    z.literal('DDR X3 VS 2ndMIX'),
    z.literal('DanceDanceRevolution (2013)'),
    z.literal('DanceDanceRevolution (2014)'),
    z.literal('DanceDanceRevolution A'),
    z.literal('DanceDanceRevolution A20'),
    z.literal('DanceDanceRevolution A20 PLUS'),
    z.literal('DanceDanceRevolution A3'),
    z.literal('DanceDanceRevolution WORLD'),
  ]),
  /** Displayed min BPM (Beet Per Minutes). */
  minBPM: z.number().int().positive(),
  /** Displayed max BPM (Beet Per Minutes). */
  maxBPM: z.number().int().positive(),
  /** Used for filtering */
  folders: z.array(_filter).catch([]),
  /** Song's step charts */
  charts: z.array(stepChartSchema).min(1),
  /** ID used by {@link http://skillattack.com/sa4/ Skill Attack}. */
  skillAttackId: z.number().int().optional(),
  /** Song is deleted or not */
  deleted: z.oboolean(),
})
/**
 * Song data object
 * @example
 * ```json
 * {
 *   "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *   "name": "イーディーエム・ジャンパーズ",
 *   "nameKana": "いーでぃーえむ じゃんぱーず",
 *   "nameIndex": 0,
 *   "artist": "かめりあ feat. ななひら",
 *   "series": "DanceDanceRevolution A",
 *   "minBPM": 72,
 *   "maxBPM": 145,
 *   "folders": [
 *     { "type": "category", "name": "WHITE" },
 *     { "type": "name", "name": "あ" },
 *     { "type": "series", "name": "A" }
 *   ],
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "bpm": [72, 145, 145],
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0
 *     }
 *   ],
 *   "skillAttackId": 675
 * }
 * ```
 */
export type Song = z.infer<typeof songSchema>

/** `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号 */
export type NameIndex = z.infer<typeof songSchema>['nameIndex']
/** Map for {@link NameIndex} */
export const nameIndexMap: ReadonlyMap<number, string> = new Map([
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
] satisfies [NameIndex, string][])
/**
 * Get {@link NameIndex} from Furigana.
 * @param nameKana Furigana
 */
export function getNameIndex(nameKana: string): NameIndex {
  const regExps = new Map([
    [/^[\u3041-\u304A\u3094]/, 0], // ぁ-おゔ
    [/^[\u304B-\u3054\u3095-\u3096]/, 1], // か-ごゕ-ゖ
    [/^[\u3055-\u305E]/, 2], // さ-ぞ
    [/^[\u305F-\u3069]/, 3], // た-ど
    [/^[\u306A-\u306E]/, 4], // な-の
    [/^[\u306F-\u307D]/, 5], // は-ぽ
    [/^[\u307E-\u3082]/, 6], // ま-も
    [/^[\u3083-\u3088]/, 7], // ゃ-よ
    [/^[\u3089-\u308D]/, 8], // ら-ろ
    [/^[\u308E-\u3093]/, 9], // ゎ-ん
    [/^[aA]/, 10],
    [/^[bB]/, 11],
    [/^[cC]/, 12],
    [/^[dD]/, 13],
    [/^[eE]/, 14],
    [/^[fF]/, 15],
    [/^[gG]/, 16],
    [/^[hH]/, 17],
    [/^[iI]/, 18],
    [/^[jJ]/, 19],
    [/^[kK]/, 20],
    [/^[lL]/, 21],
    [/^[mM]/, 22],
    [/^[nN]/, 23],
    [/^[oO]/, 24],
    [/^[pP]/, 25],
    [/^[qQ]/, 26],
    [/^[rR]/, 27],
    [/^[sS]/, 28],
    [/^[tT]/, 29],
    [/^[uU]/, 30],
    [/^[vV]/, 31],
    [/^[wW]/, 32],
    [/^[xX]/, 33],
    [/^[yY]/, 34],
    [/^[zZ]/, 35],
  ] as const)
  for (const map of regExps) {
    if (map[0].test(nameKana)) return map[1]
  }
  return 36
}

/** Series title depend on official site. */
export type Series = z.infer<typeof songSchema>['series']
/** Set for {@link Series} */
export const seriesSet: ReadonlySet<string> = new Set([
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
  'DanceDanceRevolution (2013)',
  'DanceDanceRevolution (2014)',
  'DanceDanceRevolution A',
  'DanceDanceRevolution A20',
  'DanceDanceRevolution A20 PLUS',
  'DanceDanceRevolution A3',
  'DanceDanceRevolution WORLD',
] satisfies Series[])
/** Series belong with "CLASSIC" */
export const classicSeries = new Set<Series>([
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
])
/** Series belong with "WHITE" */
export const whiteSeries = new Set<Series>([
  'DanceDanceRevolution (2013)',
  'DanceDanceRevolution (2014)',
  'DanceDanceRevolution A',
])
/**
 * Detect Flare Skill Category from {@link Series}.
 * @param series Series title
 * @returns CLASSIC, WHITE, or GOLD
 */
export function detectCategory(series: Series): 'CLASSIC' | 'WHITE' | 'GOLD' {
  return classicSeries.has(series)
    ? 'CLASSIC'
    : whiteSeries.has(series)
      ? 'WHITE'
      : 'GOLD'
}
