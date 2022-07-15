import type { SongSchema, StepChartSchema } from '../db/songs'

/**
 * Object type returned by `/api/v1/charts/{:playStyle}/{:level}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/charts__style__level/
 */
export type ChartInfo = Pick<SongSchema, 'id' | 'name' | 'series'> &
  Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>
