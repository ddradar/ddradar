import { z } from 'zod'

const nameIndexes = new Map([
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
/** `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号 */
export type NameIndex = Parameters<typeof nameIndexes.get>[0]
/** Map for {@link NameIndex} */
export const nameIndexMap: ReadonlyMap<number, string> = nameIndexes
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

const series = [
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
] as const
/** Series title depend on official site. */
export type Series = (typeof series)[number]
/** Set for {@link Series} */
export const seriesSet: ReadonlySet<string> = new Set(series)

const playStyles = new Map([
  [1, 'SINGLE'],
  [2, 'DOUBLE'],
] as const)
/** `1`: SINGLE, `2`: DOUBLE */
export type PlayStyle = Parameters<typeof playStyles.get>[0]
/** Map for {@link PlayStyle} */
export const playStyleMap: ReadonlyMap<number, string> = playStyles

const difficulties = new Map([
  [0, 'BEGINNER'],
  [1, 'BASIC'],
  [2, 'DIFFICULT'],
  [3, 'EXPERT'],
  [4, 'CHALLENGE'],
] as const)
/**
 * `0`: BEGINNER,
 * `1`: BASIC,
 * `2`: DIFFICULT,
 * `3`: EXPERT,
 * `4`: CHALLENGE
 */
export type Difficulty = Parameters<typeof difficulties.get>[0]
/** Map for {@link Difficulty} */
export const difficultyMap: ReadonlyMap<number, string> = difficulties

/** zod schema object for {@link StepChartSchema}. */
export const stepChartSchema = z.object({
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: z.custom<PlayStyle>(
    v => typeof v === 'number' && playStyleMap.has(v)
  ),
  /**
   * `0`: BEGINNER,
   * `1`: BASIC,
   * `2`: DIFFICULT,
   * `3`: EXPERT,
   * `4`: CHALLENGE
   */
  difficulty: z.custom<Difficulty>(
    v => typeof v === 'number' && difficultyMap.has(v)
  ),
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
export type StepChartSchema = z.infer<typeof stepChartSchema>

/** zod schema object for {@link SongSchema}. */
export const songSchema = z.object({
  /** ID that depend on official site. */
  id: z.string().regex(/^[01689bdiloqDIOPQ]{32}$/),
  name: z.string(),
  /** Furigana for sorting. */
  nameKana: z.string().regex(/^([A-Z0-9 .\u3040-\u309Fー]*)$/),
  /**
   * Index for sorting. Associated with the "Choose by Name" folder.
   * @example 0: あ行, 1: か行, ..., 10: A, 11: B, ..., 35: Z, `36`: 数字・記号
   */
  nameIndex: z.custom<NameIndex>(
    v => typeof v === 'number' && nameIndexMap.has(v)
  ),
  artist: z.string(),
  /** Series title depend on official site. */
  series: z.custom<Series>(v => typeof v === 'string' && seriesSet.has(v)),
  /**
   * Displayed min BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  minBPM: z.number().int().positive().nullable(),
  /**
   * Displayed max BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  maxBPM: z.number().int().positive().nullable(),
  /** Song's step charts */
  charts: z.array(stepChartSchema),
  /** ID used by {@link http://skillattack.com/sa4/ Skill Attack}. */
  skillAttackId: z.number().int().optional(),
  /** Song is deleted or not */
  deleted: z.oboolean(),
})
/**
 * DB Schema of Song data (included on "Songs" container)
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
 *   "charts": [
 *     {
 *       "playStyle": 1,
 *       "difficulty": 0,
 *       "level": 3,
 *       "notes": 70,
 *       "freezeArrow": 11,
 *       "shockArrow": 0,
 *       "stream": 12,
 *       "voltage": 11,
 *       "air": 1,
 *       "freeze": 20,
 *       "chaos": 0
 *     }
 *   ]
 * }
 * ```
 */
export type SongSchema = z.infer<typeof songSchema>

/** Returns `id` is valid {@link Song.id} or not. */
export function isValidSongId(id: string): boolean {
  return songSchema.shape.id.safeParse(id).success
}
