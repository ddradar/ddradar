import { isSong, Song } from './core/song'
import { StepChart } from './core/step-chart'
import { hasIntegerProperty, hasProperty } from './core/type-assert'

export type SongSchema = Song & {
  charts: Chart[]
}

type Chart = Omit<StepChart, 'songId'>

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
