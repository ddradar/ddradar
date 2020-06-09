import { Song } from './core/song'
import { StepChart } from './core/step-chart'

/** DB Schema of "Courses" */
export type CourseSchema = Pick<Song, 'id' | 'name'> & {
  orders: Order[]
}

type Order = Pick<StepChart, 'playStyle' | 'difficulty' | 'level'> & {
  chartOrder: Chart[]
}

type Chart = Pick<
  StepChart,
  'songId' | 'playStyle' | 'difficulty' | 'level'
> & {
  songName: string
}
