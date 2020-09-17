import { Difficulty, SongSchema, StepChartSchema } from './db/songs'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from './type-assert'

export type { StepChartSchema as StepChart }

/**
 * Object type returned by `/api/v1/songs/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getSongInfo/README.md
 */
export type SongInfo = SongSchema

/**
 * Object type returned by `/api/v1/songs/name/{:name}` and `/api/v1/songs/series/{:series}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchSongByName/README.md
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchSongBySeries/README.md
 */
export type SongListData = Omit<SongSchema, 'charts'>

/**
 * Object type returned by `/api/v1/charts/{:playStyle}/{:level}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchCharts/README.md
 */
export type ChartInfo = Pick<SongInfo, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

export const seriesList = [
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

export const nameIndexList = [
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
] as const

export function isSongSchema(obj: unknown): obj is SongSchema {
  return (
    hasStringProperty(obj, 'id', 'name', 'nameKana', 'artist', 'series') &&
    /^[01689bdiloqDIOPQ]{32}$/.test(obj.id) &&
    /^([A-Z0-9 .ぁ-んー]*)$/.test(obj.nameKana) &&
    (seriesList as readonly string[]).includes(obj.series) &&
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

  function isStepChartSchema(obj: unknown): obj is StepChartSchema {
    return (
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
    )
  }
}

export function getPlayStyleName(playStyle: 1 | 2): 'SINGLE' | 'DOUBLE' {
  return (['SINGLE', 'DOUBLE'] as const)[playStyle - 1]
}

export function getDifficultyName(
  difficulty: Difficulty
): 'BEGINNER' | 'BASIC' | 'DIFFICULT' | 'EXPERT' | 'CHALLENGE' {
  return (['BEGINNER', 'BASIC', 'DIFFICULT', 'EXPERT', 'CHALLENGE'] as const)[
    difficulty
  ]
}
