import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../type-assert'

/** DB Schema of "Songs" collection */
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
  nameIndex: SongIndex
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

export const isSongSchema = (obj: unknown): obj is SongSchema =>
  hasStringProperty(obj, 'id', 'name', 'nameKana', 'artist', 'series') &&
  /^[01689bdiloqDIOPQ]{32}$/.test(obj.id) &&
  /^([A-Z0-9 .ぁ-んー]*)$/.test(obj.nameKana) &&
  (SeriesList as string[]).includes(obj.series) &&
  hasIntegerProperty(obj, 'nameIndex') &&
  obj.nameIndex >= 0 &&
  obj.nameIndex <= 36 &&
  (hasIntegerProperty(obj, 'minBPM', 'maxBPM') ||
    (hasProperty(obj, 'minBPM', 'maxBPM') &&
      obj.minBPM === null &&
      obj.maxBPM === null)) &&
  hasProperty(obj, 'charts') &&
  Array.isArray(obj.charts) &&
  obj.charts.every(c => isStepChartSchema(c))

/** Song's step chart */
export type StepChartSchema = {
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: 1 | 2
  /** `0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE */
  difficulty: 0 | 1 | 2 | 3 | 4
  level: Level
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

const isStepChartSchema = (obj: unknown): obj is StepChartSchema =>
  hasIntegerProperty(
    obj,
    'playStyle',
    'difficulty',
    'level',
    'notes',
    'freezeArrow',
    'shockArrow',
    'stream',
    'voltage',
    'air',
    'freeze',
    'chaos'
  ) &&
  (obj.playStyle === 1 || obj.playStyle === 2) &&
  obj.difficulty >= 0 &&
  obj.difficulty <= 4 &&
  obj.level >= 1 &&
  obj.level <= 20

type Series =
  | 'DDR 1st'
  | 'DDR 2ndMIX'
  | 'DDR 3rdMIX'
  | 'DDR 4thMIX'
  | 'DDR 5thMIX'
  | 'DDRMAX'
  | 'DDRMAX2'
  | 'DDR EXTREME'
  | 'DDR SuperNOVA'
  | 'DDR SuperNOVA2'
  | 'DDR X'
  | 'DDR X2'
  | 'DDR X3 VS 2ndMIX'
  | 'DanceDanceRevolution (2013)'
  | 'DanceDanceRevolution (2014)'
  | 'DanceDanceRevolution A'
  | 'DanceDanceRevolution A20'

export const SeriesList: Series[] = [
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
]

type SongIndex =
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

export const SongNameIndex: string[] = [
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

type Level =
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
