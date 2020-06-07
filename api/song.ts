import { isSong, Song } from 'core/song'
import { StepChart } from 'core/step-chart'
import { hasProperty } from 'core/type-assert'

export type SongSchema = Song & {
  charts: Chart[]
}

type Chart = Omit<StepChart, 'songId'>

export const isSongSchema = (obj: unknown): obj is SongSchema =>
  isSong(obj) && hasProperty(obj, 'charts') && Array.isArray(obj.charts)
