import type { SongSchema, StepChartSchema } from '../db/songs'

/**
 * Object type returned by `/api/v1/songs/{:songId}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/songs__id/
 */
export type SongInfo = Omit<SongSchema, 'skillAttackId'>

/**
 * Object type returned by `/api/v1/songs?name={:name}&series={:series}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/songs--get/
 */
export type SongListData = Omit<SongSchema, 'charts' | 'skillAttackId'>

/**
 * Object type returned by `/api/v1/charts/{:playStyle}/{:level}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/charts__style__level/
 */
export type ChartInfo = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>
