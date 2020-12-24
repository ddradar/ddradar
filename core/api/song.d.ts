import type { SongSchema, StepChartSchema } from '../db/songs'

/**
 * Object type returned by `/api/v1/songs/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getSongInfo/
 */
export type SongInfo = Omit<SongSchema, 'skillAttackId'>

/**
 * Object type returned by `/api/v1/songs/name/{:name}` and `/api/v1/songs/series/{:series}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchSongByName/
 * @see https://github.com/ddradar/ddradar/blob/master/api/songs__series__id/
 */
export type SongListData = Omit<SongSchema, 'charts' | 'skillAttackId'>

/**
 * Object type returned by `/api/v1/charts/{:playStyle}/{:level}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/searchCharts/
 */
export type ChartInfo = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>
