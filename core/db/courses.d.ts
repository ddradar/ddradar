import { StepChartSchema } from './songs'

/** DB Schema of "Courses" collection */
export type CourseSchema = {
  /**
   * Course id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  id: string
  name: string
  orders: Order[]
}

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
