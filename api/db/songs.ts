import type { SqlParameter } from '@azure/cosmos'

import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from '../type-assert'
import { fetchList, fetchOne, getContainer } from '.'

/** DB Schema of "Song" */
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
  charts: StepChartSchema[]
}

export function isSongSchema(obj: unknown): obj is SongSchema {
  return (
    hasStringProperty(obj, 'id', 'name', 'nameKana', 'artist', 'series') &&
    /^[01689bdiloqDIOPQ]{32}$/.test(obj.id) &&
    /^([A-Z0-9 .ぁ-んー]*)$/.test(obj.nameKana) &&
    (SeriesList as readonly string[]).includes(obj.series) &&
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
  )
}

/** DB Schema of "Course" */
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

export type CourseInfoSchema = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'level' | 'notes' | 'freezeArrow' | 'shockArrow'
> & {
  order: ChartOrder[]
}

export type ChartOrder = Pick<
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

export const SeriesList = [
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
] as const

export function fetchSongInfo(id: string | number): Promise<SongSchema | null> {
  return fetchOne<SongSchema>(
    'Songs',
    [
      'id',
      'name',
      'nameKana',
      'nameIndex',
      'artist',
      'series',
      'minBPM',
      'maxBPM',
      'charts',
    ],
    [
      {
        condition: typeof id === 'string' ? 'c.id = @' : 'c.skillAttackId = @',
        value: id,
      },
      { condition: 'c.nameIndex != -1 AND c.nameIndex != -2' },
    ]
  )
}

export function fetchSongList(
  name?: number,
  series?: number
): Promise<Omit<SongSchema, 'charts'>[]> {
  return fetchList<SongSchema>(
    'Songs',
    [
      'id',
      'name',
      'nameKana',
      'nameIndex',
      'artist',
      'series',
      'minBPM',
      'maxBPM',
    ],
    [
      ...(series !== undefined
        ? [{ condition: 'c.series = @', value: SeriesList[series] }]
        : []),
      ...(name !== undefined
        ? [{ condition: 'c.nameIndex = @', value: name }]
        : [{ condition: 'c.nameIndex != -1 AND c.nameIndex != -2' }]),
    ],
    {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      nameIndex: 'ASC',
      nameKana: 'ASC',
    }
  )
}

export function fetchCourseInfo(id: string): Promise<CourseSchema | null> {
  return fetchOne<CourseSchema>(
    'Songs',
    [
      'id',
      'name',
      'nameKana',
      'nameIndex',
      'series',
      'minBPM',
      'maxBPM',
      'charts',
    ],
    [
      { condition: 'c.id = @', value: id },
      { condition: '(c.nameIndex = -1 OR c.nameIndex = -2)' },
    ]
  )
}

type CourseListData = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>[]
}
export async function fetchCourseList(
  name?: number,
  series?: number
): Promise<CourseListData[]> {
  const container = getContainer('Songs')

  const conditions = ['c.nameIndex < 0']
  const parameters: SqlParameter[] = []
  if (name === -1 || name === -2) {
    conditions.push('c.nameIndex = @name')
    parameters.push({ name: '@name', value: name })
  }
  if (series !== undefined) {
    conditions.push('c.series = @series')
    parameters.push({ name: '@series', value: SeriesList[series] })
  }

  const { resources } = await container.items
    .query<CourseListData>({
      query:
        'SELECT c.id, c.name, c.series, ' +
        'ARRAY(SELECT o.playStyle, o.difficulty, o.level FROM o IN c.charts) as charts ' +
        'FROM c ' +
        `WHERE ${conditions.join(' AND ')} ` +
        'ORDER BY c.nameIndex, c.nameKana',
      parameters,
    })
    .fetchAll()
  return resources
}

type ChartInfo = Pick<SongSchema, 'id' | 'name'> &
  Pick<
    StepChartSchema,
    | 'playStyle'
    | 'difficulty'
    | 'level'
    | 'notes'
    | 'freezeArrow'
    | 'shockArrow'
  >
export async function fetchChartInfo(
  songId: string,
  playStyle: 1 | 2,
  difficulty: Difficulty
): Promise<ChartInfo | null> {
  const container = getContainer('Songs')
  const { resources } = await container.items
    .query<ChartInfo>({
      query:
        'SELECT s.id, s.name, c.playStyle, c.difficulty, ' +
        'c.level, c.notes, c.freezeArrow, c.shockArrow ' +
        'FROM s JOIN c IN s.charts ' +
        'WHERE s.id = @id ' +
        'AND c.playStyle = @playStyle ' +
        'AND c.difficulty = @difficulty',
      parameters: [
        { name: '@id', value: songId },
        { name: '@playStyle', value: playStyle },
        { name: '@difficulty', value: difficulty },
      ],
    })
    .fetchNext()
  return resources.length === 0 ? null : resources[0]
}

type ChartListData = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>
export async function fetchChartList(
  playStyle: 1 | 2,
  level: number
): Promise<ChartListData[]> {
  const container = getContainer('Songs')
  const { resources } = await container.items
    .query<ChartListData>({
      query:
        'SELECT s.id, s.name, s.series, ' +
        'c.playStyle, c.difficulty, c.level ' +
        'FROM s JOIN c IN s.charts ' +
        'WHERE s.nameIndex != -1 ' +
        'AND s.nameIndex != -2 ' +
        'AND c.level = @level ' +
        'AND c.playStyle = @playStyle ' +
        'ORDER BY s.nameIndex, s.nameKana',
      parameters: [
        { name: '@level', value: level },
        { name: '@playStyle', value: playStyle },
      ],
    })
    .fetchAll()
  return resources
}
