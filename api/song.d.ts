import { Song } from './core/song'
import { StepChart } from './core/step-chart'

/** DB Schema of "Songs" */
export type SongSchema = Song & {
  charts: Chart[]
}

type Chart = Omit<StepChart, 'songId'>
