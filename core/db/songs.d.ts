/** DB Schema of song in "Songs" */
export type SongSchema = {
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
  nameIndex: NameIndex
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
  charts: StepChartSchema[]
}

/** DB Schema of course in "Songs" */
export type CourseSchema = {
  /**
   * Course id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  id: string
  name: string
  /**
   * Course furigana for sorting.
   * @example `^([A-Z0-9 .ぁ-んー]*)$`
   */
  nameKana: string
  /** `-1`: NONSTOP, `-2`: Grade */
  nameIndex: -1 | -2
  /** Series title depend on official site. */
  series: string
  /** Displayed min BPM (Beet Per Minutes). */
  minBPM: number
  /** Displayed max BPM (Beet Per Minutes). */
  maxBPM: number
  charts: CourseInfoSchema[]
}

/** Song's step chart */
export type StepChartSchema = {
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: 1 | 2
  difficulty: Difficulty
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

type CourseInfoSchema = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level' | 'notes' | 'freezeArrow' | 'shockArrow'
> & {
  order: ChartOrder[]
}

type ChartOrder = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level'
> & {
  /**
   * Song id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  songId: string
  songName: string
}

/**
 * `0`: BEGINNER,
 * `1`: BASIC,
 * `2`: DIFFICULT,
 * `3`: EXPERT,
 * `4`: CHALLENGE
 */
export type Difficulty = 0 | 1 | 2 | 3 | 4

export type NameIndex =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
