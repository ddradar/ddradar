import { Song } from '@ddradar/core/song'
import { StepChart } from '@ddradar/core/step-chart'

/** DB Schema of "Courses" */
export type CourseSchema = Pick<Song, 'id' | 'name'> & {
  orders: Order[]
}

export type Order = Pick<StepChart, 'playStyle' | 'difficulty' | 'level'> & {
  chartOrder: Chart[]
}

type Chart = Pick<
  StepChart,
  'songId' | 'playStyle' | 'difficulty' | 'level'
> & {
  songName: string
}
