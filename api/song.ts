import { isSong, Song } from '@ddradar/core/song'
import { StepChart } from '@ddradar/core/step-chart'
import { hasIntegerProperty, hasProperty } from '@ddradar/core/type-assert'

/** DB Schema of "Songs" */
export type SongSchema = Song & {
  charts: Chart[]
}

export type Chart = Omit<StepChart, 'songId'>

const isChart = (obj: unknown): obj is Chart =>
  hasIntegerProperty(
    obj,
    'playStyle',
    'difficulty',
    'level',
    'notes',
    'freezeArrow',
    'shockArrow',
    'stream',
    'voltage',
    'air',
    'freeze',
    'chaos'
  ) &&
  (obj.playStyle === 1 || obj.playStyle === 2) &&
  obj.difficulty >= 0 &&
  obj.difficulty <= 4 &&
  Number.isInteger(obj.level) &&
  obj.level >= 1 &&
  obj.level <= 20

export const isSongSchema = (obj: unknown): obj is SongSchema =>
  isSong(obj) &&
  hasProperty(obj, 'charts') &&
  Array.isArray(obj.charts) &&
  obj.charts.every(c => isChart(c))
