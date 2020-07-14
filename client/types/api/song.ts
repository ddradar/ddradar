/**
 * Object type returned by `/api/v1/songs/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getSongInfo/README.md
 */
export type SongInfo = {
  /**
   * Song id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  id: string
  name: string
  /**
   * Song furigana for sorting.
   * @example `^([A-Z0-9 .ぁ-んー]*)$`
   */
  nameKana: string
  /**
   * Index for sorting. Associated with the "Choose by Name" folder.
   * @example `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
   */
  nameIndex: number
  artist: string
  /** Series title depend on official site. */
  series: string
  /**
   * Displayed min BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  minBPM: number | null
  /**
   * Displayed max BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  maxBPM: number | null
  charts: StepChart[]
}

export type StepChart = {
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: 1 | 2
  /**
   * `0`: BEGINNER,
   * `1`: BASIC,
   * `2`: DIFFICULT,
   * `3`: EXPERT,
   * `4`: CHALLENGE
   */
  difficulty: 0 | 1 | 2 | 3 | 4
  level: number
  /** Normal arrow count. (Jump = 1 count) */
  notes: number
  /** Freeze Arrow count. */
  freezeArrow: number
  /** Shock Arrow count. */
  shockArrow: number
  /** Groove Radar STREAM */
  stream: number
  /** Groove Radar VOLTAGE */
  voltage: number
  /** Groove Radar AIR */
  air: number
  /** Groove Radar FREEZE */
  freeze: number
  /** Groove Radar CHAOS */
  chaos: number
}

/**
 * Object type returned by `/api/v1/songs/name/{:name}` and `/api/v1/songs/series/{:series}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchSongByName/README.md
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchSongBySeries/README.md
 */
export type SongListData = Omit<SongInfo, 'charts'>

/**
 * Object type returned by `/api/v1/charts/{:playStyle}/{:level}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchCharts/README.md
 */
export type ChartInfo = Pick<SongInfo, 'id' | 'name' | 'series'> &
  Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>

export const SeriesList: string[] = [
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
]

export const NameIndexList: string[] = [
  'あ',
  'か',
  'さ',
  'た',
  'な',
  'は',
  'ま',
  'や',
  'ら',
  'わ',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '数字・記号',
]

export function shortenSeriesName(series: string) {
  return series.replace(/^(DDR |DanceDanceRevolution )\(?([^)]+)\)?$/, '$2')
}

export function getPlayStyleName(
  playStyle: number
): 'SINGLE' | 'DOUBLE' | 'UNKNOWN' {
  return (['SINGLE', 'DOUBLE'] as const)[playStyle - 1] ?? 'UNKNOWN'
}

export function getDifficultyName(
  difficulty: number
): 'BEGINNER' | 'BASIC' | 'DIFFICULT' | 'EXPERT' | 'CHALLENGE' | 'UNKNOWN' {
  return (
    (['BEGINNER', 'BASIC', 'DIFFICULT', 'EXPERT', 'CHALLENGE'] as const)[
      difficulty
    ] ?? 'UNKNOWN'
  )
}
