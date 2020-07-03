import type { StepChartSchema } from './songs'

/** DB Schema of "Courses" collection */
export type CourseSchema = {
  /**
   * Course id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  id: string
  name: string
  /** Series title depend on official site. */
  series: CourseSeries
  orders: Order[]
}

type CourseSeries = 'DanceDanceRevolution A20' | 'DanceDanceRevolution A20 PLUS'

type ChartKeys = Pick<StepChartSchema, 'playStyle' | 'difficulty' | 'level'>

export type Order = ChartKeys & {
  chartOrder: Chart[]
}

type Chart = ChartKeys & {
  /**
   * Song id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  songId: string
  songName: string
}
