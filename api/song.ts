import { isSong, Song } from '@ddradar/core/song'
import { StepChart } from '@ddradar/core/step-chart'
import { hasProperty } from '@ddradar/core/type-assert'

export type SongSchema = Song & {
  charts: Chart[]
}

type Chart = Omit<StepChart, 'songId'>

export const isSongSchema = (obj: unknown): obj is SongSchema =>
  isSong(obj) && hasProperty(obj, 'charts') && Array.isArray(obj.charts)
